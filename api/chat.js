// api/chat.js — Vercel Serverless Function
// Proxies requests from the browser to Anthropic's API.
// The ANTHROPIC_API_KEY is stored as an environment variable in Vercel,
// so it is never exposed to the client.

export default async function handler(req, res) {
  // ── CORS headers ──────────────────────────────────────────────────────────
  // In production, replace '*' with your GitHub Pages domain:
  //   'https://kbenfield-716ths.github.io'
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // ── Validate request body ─────────────────────────────────────────────────
  const { messages, system } = req.body ?? {};
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'messages array is required' });
  }

  // ── Call Anthropic API ────────────────────────────────────────────────────
  try {
    const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001', // fast + cost-efficient for chat
        max_tokens: 1024,
        system: system ?? '',
        messages,
      }),
    });

    const data = await anthropicRes.json();
    return res.status(anthropicRes.status).json(data);
  } catch (err) {
    console.error('Anthropic API error:', err);
    return res.status(500).json({ error: 'Upstream API error', detail: err.message });
  }
}
