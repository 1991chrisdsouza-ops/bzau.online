async function ipHash(req) {
  const raw = (
    req.headers["x-forwarded-for"] ||
    req.socket?.remoteAddress ||
    "unknown"
  ).split(",")[0].trim();

  const data = new TextEncoder().encode(raw);
  const digest = await crypto.subtle.digest("SHA-256", data);

  return [...new Uint8Array(digest)]
    .map(byte => byte.toString(16).padStart(2, "0"))
    .join("");
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;

  if (!url || !token) {
    return res.status(503).json({ error: "Database not connected" });
  }

  const key = `wheel-claimed:${await ipHash(req)}`;
  const headers = { Authorization: `Bearer ${token}` };
  const old = await fetch(`${url}/get/${key}`, { headers }).then(response =>
    response.json()
  );

  if (old.result) {
    return res.status(200).json({
      allowed: false,
      winner: Number(old.result) === 4 ? 4 : 1
    });
  }

  const winner = Math.random() < 0.5 ? 1 : 4;

  await fetch(`${url}/set/${key}/${winner}`, { headers });

  return res.status(200).json({ allowed: true, winner });
}