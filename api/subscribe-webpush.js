async function ipHash(req) {
  const raw = (
    req.headers["x-forwarded-for"] ||
    req.socket?.remoteAddress ||
    "unknown"
  )
    .split(",")[0]
    .trim();

  const data = new TextEncoder().encode(raw);
  const digest = await crypto.subtle.digest("SHA-256", data);

  return [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const subscription = req.body?.subscription;

  if (
    !subscription ||
    !subscription.endpoint ||
    !subscription.keys?.p256dh ||
    !subscription.keys?.auth
  ) {
    return res.status(400).json({ error: "Invalid subscription" });
  }

  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;

  if (!url || !token) {
    return res.status(503).json({ error: "Database not connected" });
  }

  const hash = await ipHash(req);
  const key = `webpush-sub:${hash}`;
  const value = encodeURIComponent(JSON.stringify(subscription));

  const saved = await fetch(`${url}/set/${key}/${value}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!saved.ok) {
    return res.status(500).json({ error: "Subscription was not saved" });
  }

  return res.status(200).json({ saved: true });
}