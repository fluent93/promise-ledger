const AUDIO_KEY_PREFIX = "seinfeld-english:audio:v1";

export default async function handler(request, response) {
  if (!["GET", "HEAD"].includes(request.method)) {
    response.setHeader("allow", "GET, HEAD");
    return response.status(405).json({ error: "Method not allowed" });
  }

  const id = String(request.query?.id || "");
  if (!/^[a-z0-9-]{1,80}$/.test(id)) {
    return response.status(400).json({ error: "Invalid clip id" });
  }

  try {
    const record = await loadAudioClip(id);
    if (!record?.data) return response.status(404).json({ error: "Clip not found" });

    const audio = Buffer.from(record.data, "base64");
    const range = parseByteRange(request.headers.range, audio.length);
    if (range === null) {
      response.setHeader("content-range", `bytes */${audio.length}`);
      return response.status(416).end();
    }

    const start = range?.start ?? 0;
    const end = range?.end ?? audio.length - 1;
    const body = audio.subarray(start, end + 1);

    response.setHeader("accept-ranges", "bytes");
    response.setHeader("cache-control", "private, max-age=0, must-revalidate");
    response.setHeader("content-disposition", `inline; filename="${record.fileName || `${id}.mp3`}"`);
    response.setHeader("content-type", record.contentType || "audio/mpeg");
    response.setHeader("content-length", String(body.length));
    response.setHeader("x-content-type-options", "nosniff");
    if (range) {
      response.setHeader("content-range", `bytes ${start}-${end}/${audio.length}`);
      response.status(206);
    } else {
      response.status(200);
    }

    return response.end(request.method === "HEAD" ? undefined : body);
  } catch (error) {
    console.error(JSON.stringify({ event: "audio-clip-error", id, message: error.message }));
    return response.status(503).json({ error: "Audio storage unavailable" });
  }
}

export function parseByteRange(header, length) {
  if (!header) return undefined;
  const match = /^bytes=(\d*)-(\d*)$/.exec(header.trim());
  if (!match || (!match[1] && !match[2])) return null;

  let start;
  let end;
  if (!match[1]) {
    const suffixLength = Number(match[2]);
    if (!Number.isInteger(suffixLength) || suffixLength <= 0) return null;
    start = Math.max(0, length - suffixLength);
    end = length - 1;
  } else {
    start = Number(match[1]);
    end = match[2] ? Number(match[2]) : length - 1;
  }

  if (!Number.isInteger(start) || !Number.isInteger(end) || start < 0 || start >= length || end < start) {
    return null;
  }
  return { start, end: Math.min(end, length - 1) };
}

async function loadAudioClip(id) {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) throw new Error("Upstash Redis is not configured");

  const redisResponse = await fetch(url, {
    method: "POST",
    headers: {
      authorization: `Bearer ${token}`,
      "content-type": "application/json",
    },
    body: JSON.stringify(["GET", `${AUDIO_KEY_PREFIX}:${id}`]),
  });
  const payload = await redisResponse.json();
  if (!redisResponse.ok || payload.error) {
    throw new Error(payload.error || `Upstash request failed: ${redisResponse.status}`);
  }
  return payload.result ? JSON.parse(payload.result) : null;
}
