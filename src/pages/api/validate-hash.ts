import crypto from 'crypto';
import type { NextApiRequest, NextApiResponse } from 'next';

const { webcrypto } = crypto;

type Data = { ok: boolean } | { error: string };

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    if (!req.body.hash) {
      return res.status(400).json({ error: 'Missing required field hash' });
    }

    if (!process.env.BOT_TOKEN) {
      return res.status(500).json({ error: 'Internal server error: Missing BOT_TOKEN' });
    }

    const data = Object.fromEntries(new URLSearchParams(req.body.hash));
    console.log('Data:', data);

    const isValid = await isHashValid(data, process.env.BOT_TOKEN);

    if (isValid) {
      return res.status(200).json({ ok: true });
    }

    return res.status(403).json({ error: 'Invalid hash' });
  } catch (error) {
    console.error('Error validating hash:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function isHashValid(data: Record<string, string>, botToken: string) {
  const encoder = new TextEncoder();

  const checkString = Object.keys(data)
    .filter((key) => key !== 'hash')
    .map((key) => `${key}=${data[key]}`)
    .sort()
    .join('\n');

  console.log('CheckString:', checkString);

  const secretKey = await webcrypto.subtle.importKey(
    'raw',
    encoder.encode('WebAppData'),
    { name: 'HMAC', hash: 'SHA-256' },
    true,
    ['sign']
  );

  const secret = await webcrypto.subtle.sign('HMAC', secretKey, encoder.encode(botToken));

  const signatureKey = await webcrypto.subtle.importKey(
    'raw',
    secret,
    { name: 'HMAC', hash: 'SHA-256' },
    true,
    ['sign']
  );

  const signature = await webcrypto.subtle.sign('HMAC', signatureKey, encoder.encode(checkString));

  const hex = Buffer.from(signature).toString('hex');

  console.log('Generated Hash:', hex);

  return data.hash === hex;
}
