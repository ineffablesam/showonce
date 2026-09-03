import type { SVGProps } from 'react'

const CORNER_PATH = 'M 0 0 C 0 37.3 9 50 50 50 H 0 V 0 Z'

type CornerSvgProps = SVGProps<SVGSVGElement> & {
  size?: number
}

export function CornerSvg({ className, size = 50, ...props }: CornerSvgProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      height={size}
      viewBox="0 0 50 50"
      width={size}
      {...props}
    >
      <path d={CORNER_PATH} fill="currentColor" />
    </svg>
  )
}
