BABY STEPS
1. Copy all files and the api + images folders into the bzau.online repository.
2. Commit and push. Vercel deploys automatically.
3. The browser fallback allows two spins per device immediately.
4. For a true two-spins-per-IP limit, connect a Redis database in Vercel and expose KV_REST_API_URL and KV_REST_API_TOKEN.
5. Firebase can be connected later in firebase-config.js and firebase-messaging-sw.js.
6. Never put Firebase or Redis private tokens into browser files or GitHub.
