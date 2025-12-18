declare module 'color-thief-react' {
  import * as React from 'react'

  type PaletteRenderProps = { data?: string[] }
  export function Palette(props: {
    src: string
    crossOrigin?: string
    format?: string
    colorCount?: number
    children: (args: PaletteRenderProps) => React.ReactNode
  }): JSX.Element
}

declare module 'remark-external-links' {
  import { Plugin } from 'unified'
  const remarkExternalLinks: Plugin<[options?: { target?: string; rel?: string[] }?]>
  export default remarkExternalLinks
}
