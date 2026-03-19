export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const filename = req.headers['x-filename'];
  if (!filename) {
    return res.status(400).json({ error: 'No filename provided in headers' });
  }

  // A região do seu storage é Brasil (br), como mostrado no print.
  const bunnyEndpoint = 'br.storage.bunnycdn.com';

  const BUNNY_STORAGE_ZONE = process.env.BUNNY_STORAGE_ZONE || 'storage-zone-helphof';
  const BUNNY_API_KEY = process.env.BUNNY_STORAGE_PASSWORD;

  if (!BUNNY_API_KEY) {
    return res.status(500).json({ error: 'Falta a variável de ambiente BUNNY_STORAGE_PASSWORD no Vercel' });
  }

  try {
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);

    const bunnyUrl = `https://${bunnyEndpoint}/${BUNNY_STORAGE_ZONE}/${encodeURIComponent(filename)}`;
    
    // Faz o envio direto para a Bunny
    const response = await fetch(bunnyUrl, {
      method: 'PUT',
      headers: {
        'AccessKey': BUNNY_API_KEY,
        'Content-Type': 'application/octet-stream',
      },
      body: buffer
    });

    if (response.ok) {
      // Retorna a URL publica final
      const publicUrl = `https://Help-HOF.b-cdn.net/${encodeURIComponent(filename)}`;
      return res.status(200).json({ url: publicUrl });
    } else {
      const errorText = await response.text();
      return res.status(response.status).json({ error: errorText });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
