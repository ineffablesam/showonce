import { Link } from '@tanstack/react-router'
import type { ReactNode } from 'react'

type GlassLinkProps = {
  to: string
  children: ReactNode
}

export function GlassLink({ to, children }: GlassLinkProps) {
  return (
    <Link className="landing-glass-button button button--large" to={to}>
      {children}
    </Link>
  )
}
