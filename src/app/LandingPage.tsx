import { Link } from '@tanstack/react-router'

import { Icon } from '../components/ui/Icon'

export function LandingPage() {
  return (
    <div className="landing-hero">
      <div className="landing-hero__overlay" />
      <div className="landing-hero__content">
        <img alt="ShowOnce" className="landing-hero__logo" src="/logo.svg" />
        <h1>Show it once. Hand off the outcome.</h1>
      </div>
      <div className="landing-hero__footer">
        <p className="landing-hero__tagline">Teach it once. Trust it everywhere.</p>
        <div className="landing-hero__actions">
          <Link className="button button--primary button--large" to="/app">
            Open workspace <Icon name="arrow" />
          </Link>
          <Link className="button button--secondary button--large" to="/demo">
            Try live demo
          </Link>
          <Link className="button button--ghost button--large" to="/shared">
            View shared library
          </Link>
        </div>
      </div>
    </div>
  )
}
