type MediaBucket = {
  get(
    key: string,
    options?: { range?: { offset: number; length: number } | { suffix: number } },
  ): Promise<{
    body: ReadableStream;
    size: number;
    range?: { offset?: number; length?: number };
    httpEtag: string;
    writeHttpMetadata: (headers: Headers) => void;
  } | null>;
};

type Env = { MEDIA?: MediaBucket };

function parseRange(header: string, size: number) {
  const match = /^bytes=(\d*)-(\d*)$/.exec(header.trim());
  if (!match) return null;
  const startText = match[1] ?? "";
  const endText = match[2] ?? "";
  if (!startText && !endText) return null;
  if (!startText) {
    const suffix = Number(endText);
    if (!Number.isFinite(suffix) || suffix <= 0) return null;
    const length = Math.min(size, suffix);
    return { offset: size - length, length };
  }
  const offset = Number(startText);
  const end = endText ? Number(endText) : size - 1;
  if (!Number.isFinite(offset) || !Number.isFinite(end) || offset < 0 || offset > end || offset >= size) return null;
  return { offset, length: Math.min(end, size - 1) - offset + 1 };
}

export const onRequest = async (context: {
  request: Request;
  env: Env;
  next: () => Promise<Response>;
}): Promise<Response> => {
  const url = new URL(context.request.url);
  if (!url.pathname.startsWith("/assets/real/") || !url.pathname.endsWith(".mp4") || !context.env.MEDIA) {
    return context.next();
  }

  const key = url.pathname.slice(1);
  const head = await context.env.MEDIA.get(key, { range: { offset: 0, length: 1 } });
  if (!head) return context.next();

  const size = head.size;
  const rangeHeader = context.request.headers.get("range");
  const range = rangeHeader ? parseRange(rangeHeader, size) : null;
  if (rangeHeader && !range) {
    return new Response(null, { status: 416, headers: { "content-range": `bytes */${size}` } });
  }

  const object = range ? await context.env.MEDIA.get(key, { range }) : await context.env.MEDIA.get(key);
  if (!object) return context.next();

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  if (!headers.has("content-type")) headers.set("content-type", "video/mp4");
  headers.set("accept-ranges", "bytes");
  headers.set("etag", object.httpEtag);
  headers.set("cache-control", "public, max-age=31536000");

  if (range) {
    const end = range.offset + range.length - 1;
    headers.set("content-range", `bytes ${range.offset}-${end}/${size}`);
    headers.set("content-length", String(range.length));
    return new Response(object.body, { status: 206, headers });
  }

  headers.set("content-length", String(size));
  return new Response(object.body, { status: 200, headers });
};
