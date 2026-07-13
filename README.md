# FPB Chatbot

Claude-API-powered FAQ chatbot for FutureProofBootcamp.com. Backend function + embeddable widget.

## What's here
- `faq.md` — the knowledge base. Edit this to change what the bot knows.
- `api/chat.js` — Vercel serverless function, calls Claude with `faq.md` as context.
- `widget/chatbot-widget.js` — the embeddable chat bubble, drop into Squarespace.
- `package.json` — one dependency, the Anthropic SDK.

## Next steps to get it live (in order)

1. **Get an Anthropic API key** — console.anthropic.com → API Keys.
2. **Deploy the backend** — easiest is Vercel (free tier). This Mac doesn't have Node.js installed, so
   skip the CLI and use the no-install path:
   - Push this `fpb_chatbot` folder to a GitHub repo.
   - vercel.com → New Project → import that repo → deploy (defaults are fine, it auto-detects the
     `api/` function).
   - In the Vercel project's Settings → Environment Variables, add `ANTHROPIC_API_KEY` with your key,
     then redeploy.
   - Note the deployed URL, e.g. `https://fpb-chatbot.vercel.app` — the function will be at
     `https://fpb-chatbot.vercel.app/api/chat`.
   - (Alternative: install Node.js + `npm install -g vercel`, then run `vercel` from this folder — but
     the GitHub route needs no local setup.)
3. **Point the widget at it** — before the widget script tag in Squarespace, add:
   ```html
   <script>window.FPB_CHAT_API_URL = "https://fpb-chatbot.vercel.app/api/chat";</script>
   <script src="[hosted copy of chatbot-widget.js]"></script>
   ```
   The widget file itself also needs to be hosted somewhere public (Vercel can serve it as a static
   file too, or drop it in the same deployment).
4. **Add to Squarespace** — Settings → Advanced → Code Injection → Footer, paste the two script tags above.
5. **Test on the live site** — bubble bottom-right, click to open, ask a real question.

## Open items before this is truly done
- `faq.md` has two `[NEEDS ANSWER]` gaps: program format (in-person/remote/hybrid) and start date —
  fill these in once decided, the bot currently deflects to "book a free call" for both.
- No rate-limiting yet on `api/chat.js` — fine for low traffic, worth adding if it gets hammered.
- No conversation logging yet — add if you want to see what people are actually asking.

## Curriculum tie-in
This doubles as content for GC Chapter 7.6 ("The AI Chatbot") and is the lead-by-example build for
Exercise 8.15 ("Build Your Chatbot") — both already noted in the FPB Master Tracker.
