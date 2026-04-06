export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { messages, image } = req.body;
  const content = [];

  if (image) {
    content.push({
      type: 'image',
      source: {
        type: 'base64',
        media_type: image.mediaType,
        data: image.data,
      },
    });
  }

  if (messages && messages.length > 0) {
    content.push({
      type: 'text',
      text: messages[messages.length - 1].content,
    });
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 2048,
        system: 'Eres un asistente experto en peritación de siniestros para seguros. Analiza las imágenes y vídeos que te envíen, identifica daños, estima costes de reparación y genera informes periciales profesionales. Responde siempre en español de forma clara y estructurada.',
        messages: [{ role: 'user', content }],
      }),
    });

    const data = await response.json();

    if (data.error) {
      return res.status(500).json({ error: data.error.message });
    }

    res.status(200).json({ reply: data.content[0].text });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
