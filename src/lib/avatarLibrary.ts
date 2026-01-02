const DEFAULT_AVATAR_URL = 'https://api.iconify.design/lucide:user-round.svg?color=%23f97316&width=128&height=128';

export function resolveAvatarUrl(meta?: { avatar_url?: string | null; picture?: string | null }) {
  if (meta?.avatar_url) return meta.avatar_url;
  if (meta?.picture) return meta.picture;
  return DEFAULT_AVATAR_URL;
}

export { DEFAULT_AVATAR_URL };
