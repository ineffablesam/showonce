import { Link } from '@tanstack/react-router'
import { motion } from 'framer-motion'

import { OpenWorkspaceTrigger } from '../workspace/OpenWorkspaceDialog'
import { BrandMark } from '../ui/BrandMark'
import { CornerSvg } from './CornerSvg'

const headerMotion = {
  duration: 0.45,
  ease: [0.22, 1, 0.36, 1] as const,
}

export function LandingHeader({
  onOpenWorkspace,
}: {
  onOpenWorkspace: () => void
}) {
  return (
    <motion.header
      animate={{ opacity: 1, y: 0 }}
      className="landing-header"
      initial={{ opacity: 0, y: -10 }}
      transition={headerMotion}
    >
      <nav
        aria-label="Landing"
        className="landing-header__nav"
      >
        <Link className="landing-header__brand" to="/">
          <BrandMark
            aria-hidden="true"
            className="landing-header__logo"
            height={26}
            width={34}
          />
          <span className="landing-header__name">ShowOnce</span>
        </Link>

        <div className="landing-header__links">
          <Link className="landing-header__link" to="/guide">
            Guide
          </Link>
          <Link className="landing-header__link" to="/demo">
            Demo
          </Link>
        </div>

        <div className="landing-header__actions">
          <OpenWorkspaceTrigger
            className="button button--primary"
            onOpen={onOpenWorkspace}
          />
        </div>
      </nav>

      <CornerSvg
        className="landing-header__notch landing-header__notch--left"
        size={36}
      />
      <CornerSvg
        className="landing-header__notch landing-header__notch--right"
        size={36}
      />
    </motion.header>
  )
}
