// Cloudflare Pages Function: POST /api/ai  ->  Google Gemini (key stays on the server)
const json = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { 'Content-Type': 'application/json' } });

export async function onRequestPost({ request, env }) {
  if (!env.GEMINI_API_KEY) return json({ error: 'Server is not configured (missing GEMINI_API_KEY).' }, 500);

  // Only accept calls made from this same site
  const origin = request.headers.get('Origin');
  if (origin && new URL(origin).host !== new URL(request.url).host) return json({ error: 'Forbidden' }, 403);

  let body;
  try { body = await request.json(); } catch { return json({ error: 'Bad request' }, 400); }
  const msgs = Array.isArray(body.messages) ? body.messages.slice(-12) : [];
  if (!msgs.length || JSON.stringify(msgs).length > 40000) return json({ error: 'Request is empty or too large.' }, 400);

  const contents = msgs.map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: String(m.content || '').slice(0, 30000) }],
  }));
  const generationConfig = { maxOutputTokens: 8192, temperature: 0.7 };
  if (body.json) generationConfig.responseMimeType = 'application/json';

  const model = env.GEMINI_MODEL || 'gemini-flash-latest';
  let r;
  try {
    r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': env.GEMINI_API_KEY },
      body: JSON.stringify({ contents, generationConfig }),
    });
  } catch { return json({ error: 'Could not reach the AI service.' }, 502); }

  if (r.status === 429) return json({ error: 'The free AI quota is busy. Please try again in a minute.' }, 429);
  if (!r.ok) return json({ error: `AI service error (${r.status}). Check the model name and API key.` }, 502);

  const d = await r.json();
  const text = (d.candidates?.[0]?.content?.parts || []).map(p => p.text || '').join('');
  if (!text) return json({ error: 'The AI returned no answer. Please try again.' }, 502);
  return json({ text });
}
