# AI-Assisted Career Kit (hosted version)

A free web app (PWA). The page is static; one small server function (`functions/api/ai.js`)
calls Google Gemini so your API key never reaches the students' browsers.

```
public/index.html            the app
public/manifest.webmanifest  lets students "Add to Home Screen"
functions/api/ai.js          secure AI endpoint (Cloudflare Pages Function)
```

## Deploy (about 15 minutes, free)

1. **Get a Gemini key:** open Google AI Studio (aistudio.google.com) and create an API key.
2. **Put this folder on GitHub:** create a repository and upload everything in this folder.
3. **Create the site:** in Cloudflare, go to Workers & Pages, create a Pages project, connect your GitHub repository.
   - Build command: leave empty
   - Build output directory: `public`
4. **Add the key:** in the project's settings, add an encrypted variable/secret named `GEMINI_API_KEY`.
   Optional: `GEMINI_MODEL` (default `gemini-flash-latest`). Redeploy.
5. **Test:** open your `https://<project>.pages.dev` address, create a profile, run one AI step.
6. **QR code:** make a QR code for that address (or send it to Claude to generate one).

Command-line alternative: `npx wrangler pages deploy public --project-name career-kit`, then
`npx wrangler pages secret put GEMINI_API_KEY --project-name career-kit`.
Cloudflare's menus change; if Pages is not offered, deploy the same files as a Worker with static assets.

## Things to know

- **Quota:** the Gemini free tier is rate-limited. Many students at once will see "quota is busy"; enabling billing on the Google project raises the limits.
- **Privacy:** on Google's free tier, prompts may be used to improve Google's products and reviewed by people. Students' resumes are personal data, so tell them, and consider a paid Gemini plan for a real rollout.
- **Model names change:** Google is retiring the Gemini 2.5 models on 16 October 2026. The default `gemini-flash-latest` alias avoids that; if AI calls fail with a model error, set `GEMINI_MODEL` to a current free Flash model from AI Studio.
- **Abuse:** the endpoint only accepts calls from your own site and caps request size, but anyone can still use your quota. Add Cloudflare rate limiting if usage grows.
- **Data:** profiles, resumes and scores are saved only in each student's browser (no login, no cross-device sync). Next step for accounts and placement-cell dashboards: Supabase Auth + tables with row-level security.
