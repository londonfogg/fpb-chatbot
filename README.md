# FPB Chatbot

Claude-API-powered FAQ chatbot for FutureProofBootcamp.com. Backend function + embeddable widget.

## What's here
- `faq.md` — the knowledge base. Edit this to change what the bot knows.
- `api/chat.js` — Vercel serverless function, calls Claude with `faq.md` as context.
- `widget/chatbot-widget.js` — the embeddable chat bubble, drop into Squarespace.
- `package.json` — one dependency, the Anthropic SDK.

## Status: deployed and live (2026-07-13)

- Backend: https://fpb-chatbot.vercel.app/api/chat (Vercel project `future-proof-bootcamp/fpb-chatbot`)
- Widget: https://fpb-chatbot.vercel.app/widget/chatbot-widget.js (served as a static file, publicly reachable)
- GitHub: https://github.com/londonfogg/fpb-chatbot (main branch, Vercel auto-deploys on push)
- `ANTHROPIC_API_KEY` is set in Vercel's Production environment variables.

**Last step — add to Squarespace** (not yet done as of 2026-07-13):
Settings → Advanced → Code Injection → Footer, paste:
```html
<script>window.FPB_CHAT_API_URL = "https://fpb-chatbot.vercel.app/api/chat";</script>
<script src="https://fpb-chatbot.vercel.app/widget/chatbot-widget.js"></script>
```
Then test on the live site — bubble bottom-right, click to open, ask a real question.

## Local dev / making changes later
- Node is installed via `nvm` on this Mac (wasn't there originally — `export NVM_DIR="$HOME/.nvm"; source "$NVM_DIR/nvm.sh"` before any `node`/`npm` command in a fresh terminal).
- `gh` (GitHub CLI) is installed at `~/bin/gh`, logged in as `londonfogg`, and `gh auth setup-git` is configured — `git push` from this folder works without asking for a token again.
- Vercel CLI is installed globally (`vercel`), logged in, and the folder is linked to the `future-proof-bootcamp/fpb-chatbot` project. To ship a change: edit code → `git add`/`commit`/`push` (Vercel auto-deploys on push to `main`), or run `vercel --prod` directly.
- To test locally first: `npm start` (runs `server.js`, a small local harness that mimics Vercel's `res.status()/.json()` helpers) and open `http://localhost:3000`.

## Open items before this is truly done
- `faq.md` has two `[NEEDS ANSWER]` gaps: program format (in-person/remote/hybrid) and start date —
  fill these in once decided, the bot currently deflects to "book a free call" for both.
- No rate-limiting yet on `api/chat.js` — fine for low traffic, worth adding if it gets hammered.
- No conversation logging yet — add if you want to see what people are actually asking.

## Curriculum tie-in
This doubles as content for GC Chapter 7.6 ("The AI Chatbot") and is the lead-by-example build for
Exercise 8.15 ("Build Your Chatbot") — both already noted in the FPB Master Tracker.
