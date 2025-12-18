"use client"

import { useEffect, useState } from 'react'
import { Card } from './card'

const FALLBACK_DISCORD_ID = '827767290903789590'
const discordId = (import.meta.env.VITE_DISCORD_ID as string | undefined) ?? FALLBACK_DISCORD_ID

export function DiscordPresenceCard() {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setReady(true)
  }, [])

  if (!discordId) {
    return (
      <div className="card w-full max-w-md border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80">
        Configura VITE_DISCORD_ID en tu entorno para mostrar el perfil de Discord.
      </div>
    )
  }

  if (!ready) return null

  return (
    <div className="card w-full max-w-md border border-white/10 bg-white/5 px-2 py-2 text-white">
      <Card id={discordId} />
    </div>
  )
}
