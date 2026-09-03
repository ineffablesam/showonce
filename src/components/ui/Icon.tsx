import type { SVGProps } from 'react'
import {
  Activity,
  Archive,
  ArrowRight,
  Check,
  ChevronLeft,
  Clipboard,
  Disc,
  ExternalLink,
  FileText,
  HelpCircle,
  Home,
  LayoutGrid,
  Lock,
  Menu,
  Plus,
  RefreshCw,
  Settings,
  Share2,
  Trash2,
  Users,
  X,
  Zap,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { StarsMinimalisticIcon } from '@solar-icons/react/linear/stars-minimalistic'

export type IconName =
  | 'activity'
  | 'archive'
  | 'arrow'
  | 'bolt'
  | 'check'
  | 'chevronLeft'
  | 'clipboard'
  | 'external'
  | 'file'
  | 'grid'
  | 'help'
  | 'home'
  | 'lock'
  | 'menu'
  | 'plus'
  | 'record'
  | 'refresh'
  | 'settings'
  | 'share'
  | 'spark'
  | 'trash'
  | 'users'
  | 'x'

// "spark" is ShowOnce's own brand glyph, so it gets a distinct two-tone icon
// from Solar Icons instead of the generic lucide sparkle. Every other name
// maps onto a single, consistent lucide-react outline icon.
const lucideIcons: Record<Exclude<IconName, 'spark'>, LucideIcon> = {
  activity: Activity,
  archive: Archive,
  arrow: ArrowRight,
  bolt: Zap,
  check: Check,
  chevronLeft: ChevronLeft,
  clipboard: Clipboard,
  external: ExternalLink,
  file: FileText,
  grid: LayoutGrid,
  help: HelpCircle,
  home: Home,
  lock: Lock,
  menu: Menu,
  plus: Plus,
  record: Disc,
  refresh: RefreshCw,
  settings: Settings,
  share: Share2,
  trash: Trash2,
  users: Users,
  x: X,
}

export function Icon({
  name,
  ...props
}: { name: IconName } & SVGProps<SVGSVGElement>) {
  if (name === 'spark') {
    return (
      <StarsMinimalisticIcon
        aria-hidden="true"
        color="currentColor"
        size={20}
        strokeWidth={1.8}
        {...props}
      />
    )
  }

  const LucideComponent = lucideIcons[name]
  return (
    <LucideComponent
      aria-hidden="true"
      color="currentColor"
      size={20}
      strokeWidth={1.8}
      {...props}
    />
  )
}
