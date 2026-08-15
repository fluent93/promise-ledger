export default async function handler(request, response) {
  if (!["GET", "HEAD"].includes(request.method)) {
    response.setHeader("allow", "GET, HEAD");
    return response.status(405).json({ error: "Method not allowed" });
  }

  const text = String(request.query?.text || "").trim();
  const voice = String(request.query?.voice || "alloy").trim().toLowerCase();
  const allowedVoices = ["alloy", "echo", "fable", "onyx", "nova", "shimmer"];

  if (!text || text.length > 500) {
    return response.status(400).json({ error: "Text required (1-500 chars)" });
  }

  const selectedVoice = allowedVoices.includes(voice) ? voice : "alloy";
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return response.status(503).json({ error: "TTS service unavailable (API key missing)" });
  }

  try {
    const apiResponse = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "tts-1",
        input: text,
        voice: selectedVoice,
        response_format: "mp3",
      }),
    });

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      console.error(JSON.stringify({ event: "tts-openai-error", status: apiResponse.status, errorText }));
      return response.status(502).json({ error: "TTS generation failed" });
    }

    const arrayBuffer = await apiResponse.arrayBuffer();
    const audio = Buffer.from(arrayBuffer);

    response.setHeader("accept-ranges", "bytes");
    response.setHeader("cache-control", "public, max-age=86400, s-maxage=86400");
    response.setHeader("content-type", "audio/mpeg");
    response.setHeader("content-length", String(audio.length));

    return response.status(200).end(request.method === "HEAD" ? undefined : audio);
  } catch (error) {
    console.error(JSON.stringify({ event: "tts-handler-error", message: error.message }));
    return response.status(500).json({ error: "TTS processing error" });
  }
}
