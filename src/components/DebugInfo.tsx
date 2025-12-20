import { useEffect } from 'react'

interface DebugInfoProps {
  componentName: string
}

export default function DebugInfo({ componentName }: DebugInfoProps) {
  useEffect(() => {
    console.log(`✅ ${componentName} component mounted successfully`)
  }, [componentName])

  if (import.meta.env.PROD) {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-2 rounded text-xs z-50">
      ✅ {componentName}
    </div>
  )
}