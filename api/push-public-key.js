export default function handler(request, response) {
  response.setHeader("content-type", "application/json; charset=utf-8");

  if (request.method !== "GET") {
    response.status(405).json({ error: "Method not allowed" });
    return;
  }

  const publicKey = process.env.VAPID_PUBLIC_KEY || "";
  response.status(200).json({
    configured: Boolean(publicKey),
    publicKey,
  });
}
