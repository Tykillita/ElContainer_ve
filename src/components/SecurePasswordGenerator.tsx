import React from 'react';

type Props = {
  onGenerate: (password: string) => void;
  disabled?: boolean;
  length?: number;
  fullName?: string;
  className?: string;
};

function getCryptoRandomInt(maxExclusive: number): number {
  const cryptoObj = globalThis.crypto;
  if (!cryptoObj?.getRandomValues) {
    return Math.floor(Math.random() * maxExclusive);
  }

  // Rejection sampling to avoid modulo bias
  const maxUint32 = 0xffffffff;
  const limit = maxUint32 - (maxUint32 % maxExclusive);

  const buf = new Uint32Array(1);
  let x = maxUint32;
  while (x >= limit) {
    cryptoObj.getRandomValues(buf);
    x = buf[0];
  }
  return x % maxExclusive;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = getCryptoRandomInt(i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickOne(charset: string): string {
  return charset[getCryptoRandomInt(charset.length)] ?? '';
}

function fallbackHashBytes(input: string): Uint8Array {
  // Simple non-crypto hash -> bytes (fallback when subtle isn't available)
  let h1 = 0x811c9dc5;
  let h2 = 0x01000193;
  for (let i = 0; i < input.length; i++) {
    const c = input.charCodeAt(i);
    h1 ^= c;
    h1 = Math.imul(h1, 0x01000193);
    h2 ^= c;
    h2 = Math.imul(h2, 0x85ebca6b);
  }
  const out = new Uint8Array(32);
  for (let i = 0; i < out.length; i++) {
    const x = (i % 2 === 0 ? h1 : h2) >>> 0;
    out[i] = (x >>> ((i % 4) * 8)) & 0xff;
  }
  return out;
}

async function nameSeedBytes(fullName?: string): Promise<Uint8Array> {
  if (!fullName) return new Uint8Array();

  const normalized = fullName
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();
  if (!normalized) return new Uint8Array();

  try {
    if (globalThis.crypto?.subtle?.digest) {
      const data = new TextEncoder().encode(normalized);
      const digest = await globalThis.crypto.subtle.digest('SHA-256', data);
      return new Uint8Array(digest);
    }
  } catch {
    // fallback below
  }
  return fallbackHashBytes(normalized);
}

async function copyToClipboard(text: string): Promise<void> {
  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return;
    }
  } catch {
    // Fallback below
  }

  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    textarea.style.pointerEvents = 'none';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    document.execCommand('copy');
    textarea.remove();
  } catch {
    // Ignore copy failures (permissions / unsupported env)
  }
}

async function generateSecurePassword(length = 14, fullName?: string): Promise<string> {
  const safeLength = Math.max(12, Math.min(64, Math.floor(length)));

  const lower = 'abcdefghijklmnopqrstuvwxyz';
  const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const digits = '0123456789';
  const symbols = '!@#$%^&*()-_=+[]{};:,.?';
  const all = lower + upper + digits + symbols;

  const seed = await nameSeedBytes(fullName);
  const required = [pickOne(lower), pickOne(upper), pickOne(digits), pickOne(symbols)];
  const remainingCount = Math.max(0, safeLength - required.length);

  const rest = Array.from({ length: remainingCount }, (_, i) => {
    // Mix a random index with a deterministic byte derived from the name (if provided)
    const base = getCryptoRandomInt(all.length);
    const bump = seed.length ? seed[i % seed.length] : 0;
    return all[(base + bump) % all.length] ?? pickOne(all);
  });
  return shuffle([...required, ...rest]).join('');
}

export default function SecurePasswordGenerator({
  onGenerate,
  disabled,
  length = 14,
  fullName,
  className
}: Props) {
  return (
    <button
      type="button"
      disabled={disabled}
      className={
        className ??
        'text-sm text-orange-400 hover:text-orange-300 underline underline-offset-4 disabled:opacity-60 disabled:cursor-not-allowed'
      }
      onClick={async () => {
        const pwd = await generateSecurePassword(length, fullName);
        onGenerate(pwd);
        await copyToClipboard(pwd);
      }}
    >
      Generar contraseña segura
    </button>
  );
}
