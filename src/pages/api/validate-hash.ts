import crypto from 'crypto';
import type { NextApiRequest, NextApiResponse } from 'next';

type Data = { ok: boolean } | { error: string };

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { hash, ...data } = req.body;
    if (!hash) {
      return res.status(400).json({ error: 'Missing required field hash' });
    }

    if (!process.env.BOT_TOKEN) {
      return res.status(500).json({ error: 'Internal server error: Missing BOT_TOKEN' });
    }

    console.log('Received data for validation:', data);
    console.log('Client-side hash:', hash);

    const isValid = isHashValid(data, hash, process.env.BOT_TOKEN);

    if (isValid) {
      return res.status(200).json({ ok: true });
    }

    return res.status(403).json({ error: 'Invalid hash' });
  } catch (error) {
    console.error('Error validating hash:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

function isHashValid(data: Record<string, string>, receivedHash: string, botToken: string) {
  const secret = crypto.createHash('sha256').update(botToken).digest();

  const checkString = Object.keys(data)
    .map((key) => `${key}=${data[key]}`)
    .sort()
    .join('\n');

  console.log('CheckString for hash generation:', checkString);

  const hash = crypto
    .createHmac('sha256', secret)
    .update(checkString)
    .digest('hex');

  console.log('Generated Hash:', hash);
  console.log('Received Hash:', receivedHash);

  return receivedHash === hash;
}
