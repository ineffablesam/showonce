import { Link } from '@tanstack/react-router'

import { Icon } from '../components/ui/Icon'

export function LandingPage() {
  return (
    <div className="landing">
      <header className="landing-nav">
        <Link className="brand" to="/">
          <span className="brand__mark">
            <Icon name="spark" />
          </span>
          <span>ShowOnce</span>
        </Link>
        <nav aria-label="Public">
          <a href="#how-it-works">How it works</a>
          <Link to="/shared">Shared library</Link>
          <Link className="button button--secondary" to="/app">
            Demo workspace
          </Link>
        </nav>
      </header>

      <main>
        <section className="hero">
          <div className="hero__copy">
            <span className="announcement">
              <span>New</span> Outcome-aware handoffs with WebMCP
            </span>
            <h1>Show it once. Hand off the outcome.</h1>
            <p>
              Capture the intent behind a real task, then let the next person
              complete it safely—even when their situation is different.
            </p>
            <div className="hero__actions">
              <Link className="button button--primary button--large" to="/app">
                Open workspace <Icon name="arrow" />
              </Link>
              <Link className="button button--ghost button--large" to="/shared">
                View shared library
              </Link>
            </div>
            <div className="hero__proof">
              <span>
                <Icon name="check" /> No brittle click scripts
              </span>
              <span>
                <Icon name="check" /> Explicit confirmation
              </span>
              <span>
                <Icon name="check" /> Auditable outcomes
              </span>
            </div>
          </div>

          <div aria-label="ShowOnce product preview" className="hero-product">
            <div className="hero-product__bar">
              <span />
              <span />
              <span />
              <small>Benefits renewal · Recipient view</small>
            </div>
            <div className="hero-product__body">
              <aside>
                <span className="brand__mark">
                  <Icon name="spark" />
                </span>
                <span className="preview-line preview-line--active" />
                <span className="preview-line" />
                <span className="preview-line" />
              </aside>
              <div className="preview-main">
                <span className="preview-kicker">ADAPTED SAFELY</span>
                <h3>Your renewal is ready to review.</h3>
                <p>
                  Preferences carried over. One plan difference needs your
                  decision before submission.
                </p>
                <div className="preview-card">
                  <span className="preview-card__icon">
                    <Icon name="help" />
                  </span>
                  <div>
                    <strong>Plan availability changed</strong>
                    <small>Review two available alternatives</small>
                  </div>
                  <Icon name="arrow" />
                </div>
                <div className="preview-progress">
                  <span>
                    <Icon name="check" /> Paperless preference
                  </span>
                  <span>
                    <Icon name="check" /> Communication method
                  </span>
                  <span>3 of 5 steps ready</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="principles" id="how-it-works">
          <div>
            <span className="principles__number">01</span>
            <Icon name="record" />
            <h2>Capture intent, not coordinates.</h2>
            <p>ShowOnce records meaningful actions and leaves sensitive data behind.</p>
          </div>
          <div>
            <span className="principles__number">02</span>
            <Icon name="spark" />
            <h2>Adapt to what is actually true.</h2>
            <p>Safe preferences transfer; meaningful differences pause for judgment.</p>
          </div>
          <div>
            <span className="principles__number">03</span>
            <Icon name="check" />
            <h2>Confirm before consequence.</h2>
            <p>Submission is always explicit, time-bound, and visible in the audit trail.</p>
          </div>
        </section>
      </main>
    </div>
  )
}
