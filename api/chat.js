const fs = require('fs');
const path = require('path');
const Anthropic = require('@anthropic-ai/sdk');

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const faqContent = fs.readFileSync(path.join(__dirname, '..', 'faq.md'), 'utf-8');

const SYSTEM_PROMPT = `You are the Future Proof Bootcamp (FPB) website chatbot — an AI assistant built
by Coach Indy to answer parent and student questions before they apply. You must always be upfront that
you are an AI, never pretend to be Coach Indy.

Answer only from the FAQ knowledge base below. If a question isn't covered, say so honestly and point
the visitor to booking a free 30-minute info call with Coach Indy — never invent facts, especially dates,
class size, or program format, which are still open questions.

Keep answers short (2-4 sentences), warm, and direct — no corporate fluff, matching FPB's own voice
("No pressure. No pitch.").

Reply in plain text only — this renders in a plain chat bubble with no markdown support. Never use
**bold**, bullet dashes, headers, or numbered lists; write in plain sentences instead.

--- FAQ KNOWLEDGE BASE ---
${faqContent}
--- END FAQ KNOWLEDGE BASE ---`;

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { message, history } = req.body || {};
  if (!message || typeof message !== 'string' || message.length > 2000) {
    res.status(400).json({ error: 'Invalid message' });
    return;
  }

  const messages = [
    ...(Array.isArray(history) ? history.slice(-10) : []),
    { role: 'user', content: message },
  ];

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-5',
      max_tokens: 400,
      system: SYSTEM_PROMPT,
      messages,
    });

    const reply = response.content
      .filter((block) => block.type === 'text')
      .map((block) => block.text)
      .join('\n');

    res.status(200).json({ reply });
  } catch (err) {
    console.error('Anthropic API error:', err);
    // TEMP: exposing err.message for live debugging, remove once deploy is confirmed working
    res.status(502).json({
      error: 'Chat service temporarily unavailable',
      debug: {
        name: err.name,
        message: err.message,
        cause: err.cause ? String(err.cause) : undefined,
        status: err.status,
        keyPresent: !!process.env.ANTHROPIC_API_KEY,
        keyLength: process.env.ANTHROPIC_API_KEY ? process.env.ANTHROPIC_API_KEY.length : 0,
      },
    });
  }
};
