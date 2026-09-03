import { Link } from '@tanstack/react-router'

import { Icon } from '../components/ui/Icon'

export function LandingPage() {
  return (
    <div className="landing-hero">
      <div className="landing-hero__overlay" />
      <div className="landing-hero__content">
        <img alt="ShowOnce" className="landing-hero__logo" src="/logo.svg" />
        <span className="landing-hero__badge">
          <Icon name="bolt" /> Built for the WebMCP Challenge
        </span>
        <h1>Show it once. Hand off the outcome.</h1>
        <p className="landing-hero__lede">
          A person demonstrates a real task once. A recipient&rsquo;s agent
          finishes it live, through real <code>document.modelContext</code>{' '}
          WebMCP tools &mdash; the same commands the human UI uses, with a
          human always required for the final, consequential step.
        </p>
      </div>
      <div className="landing-hero__footer">
        <div className="landing-hero__actions">
          <Link className="button button--primary button--large" to="/app">
            Open workspace <Icon name="arrow" />
          </Link>
          <Link className="button button--ghost button--large" to="/shared">
            View shared library
          </Link>
        </div>
      </div>
    </div>
  )
}
