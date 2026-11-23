/**
 * YouTube link helper, shared by the admin form (validation) and the public site (safe links).
 * Accepts watch, youtu.be, shorts, live, embed and playlist links and returns a clean
 * https://www.youtube.com/… address, or null for anything that isn't a YouTube video/playlist.
 */
const HOSTS = new Set(["youtube.com", "www.youtube.com", "m.youtube.com", "youtube-nocookie.com", "www.youtube-nocookie.com", "youtu.be"]);
const VIDEO_ID = /^[A-Za-z0-9_-]{11}$/;
const PLAYLIST_ID = /^[A-Za-z0-9_-]{10,60}$/;

export function parseYouTubeUrl(input: string | null | undefined): string | null {
  const raw = input?.trim();
  if (!raw) return null;

  let url: URL;
  try {
    url = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
  } catch {
    return null;
  }
  if (!/^https?:$/.test(url.protocol) || !HOSTS.has(url.hostname.toLowerCase())) return null;

  const parts = url.pathname.split("/").filter(Boolean);
  let id: string | null = null;

  if (url.hostname.toLowerCase() === "youtu.be") {
    id = parts[0] ?? null;
  } else if (parts[0] === "watch") {
    id = url.searchParams.get("v");
  } else if (["shorts", "live", "embed", "v"].includes(parts[0] ?? "")) {
    id = parts[1] ?? null;
  } else if (parts[0] === "playlist") {
    const list = url.searchParams.get("list");
    return list && PLAYLIST_ID.test(list) ? `https://www.youtube.com/playlist?list=${list}` : null;
  }

  return id && VIDEO_ID.test(id) ? `https://www.youtube.com/watch?v=${id}` : null;
}
