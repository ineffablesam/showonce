import type { HTMLAttributes, ReactNode } from 'react'

import { Icon, type IconName } from './Icon'

interface CardProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode
}

export function Card({ children, className = '', ...props }: CardProps) {
  return (
    <section className={`card ${className}`.trim()} {...props}>
      {children}
    </section>
  )
}

export function EmptyState({
  title,
  detail,
  icon = 'clipboard',
  iconTone = 'neutral',
}: {
  title: string
  detail: string
  icon?: IconName
  iconTone?: 'ink' | 'green' | 'amber' | 'blue' | 'neutral'
}) {
  return (
    <div className="card-empty">
      <span
        aria-hidden="true"
        className={`card-empty__icon card-empty__icon--${iconTone}`}
      >
        <Icon name={icon} />
      </span>
      <div className="card-empty__copy">
        <strong>{title}</strong>
        <p>{detail}</p>
      </div>
    </div>
  )
}
