import { createFileRoute } from '@tanstack/react-router'
import { AppShell } from '../app/AppShell'
import { Card } from '../components/ui/Card'

export const Route = createFileRoute('/guide')({ component: Guide })

function Guide() {
  return (
    <AppShell>
      <div className="library-page">
        <div className="page-heading">
          <div>
            <span className="eyebrow">Product guide</span>
            <h1>How ShowOnce works</h1>
            <p>
              ShowOnce lets one person demonstrate a real task once, then share that
              demonstrated intent safely so another person—or their agent—can follow it
              on their own account. Built for the WebMCP Challenge.
            </p>
          </div>
        </div>

        <section>
          <div className="section-heading">
            <h2>The six steps</h2>
            <span>From demonstration to handoff</span>
          </div>
          <div className="handoff-audit-grid">
            <Card>
              <span className="eyebrow">Step 1</span>
              <h2>Demonstrate once</h2>
              <p>
                A sender performs a real task inside the fully interactive demo app
                (Northstar Benefits, an employee benefits portal)—clicking through
                screens, changing plans, updating preferences—exactly as they normally
                would. There is no manual checklist. ShowOnce automatically observes and
                captures semantic domain actions (for example, &ldquo;selected Gold Dental
                plan&rdquo; or &ldquo;enabled paperless&rdquo;) because both the human UI
                and any agent tools call the same underlying domain command layer.
              </p>
            </Card>

            <Card>
              <span className="eyebrow">Step 2</span>
              <h2>A safe, portable procedure</h2>
              <p>
                When the sender clicks &ldquo;Finish showing&rdquo;, ShowOnce compiles
                the captured actions into a sanitized Procedure—portable intent only. No
                passwords, sessions, screenshots, selectors, or personal data ever leave
                the sender&apos;s demonstration.
              </p>
            </Card>

            <Card>
              <span className="eyebrow">Step 3</span>
              <h2>Share a handoff link</h2>
              <p>
                The sender creates a Handoff—a shareable link, optionally with an
                expiration and permission settings such as &ldquo;allow safe
                preferences&rdquo; or &ldquo;require confirmation&rdquo;—and sends it to
                a recipient.
              </p>
            </Card>

            <Card>
              <span className="eyebrow">Step 4</span>
              <h2>The recipient&apos;s own live experience</h2>
              <p>
                The recipient opens the link and sees the same real Northstar Benefits
                app, rendered against their own account state. ShowOnce compares the
                sender&apos;s demonstrated actions against the recipient&apos;s actual
                state and shows what is the same, what can be safely applied, what is
                different, or what must be left alone.
              </p>
            </Card>

            <Card>
              <span className="eyebrow">Step 5</span>
              <h2>Agents can do it too, live, via WebMCP</h2>
              <p>
                If the recipient opens the link in a WebMCP-capable browser (ChatGPT&apos;s
                in-app browser, or Google Chrome 149+ with{' '}
                <code>chrome://flags/#enable-webmcp-testing</code> enabled) and asks their
                agent to &ldquo;do what [the sender] showed me&rdquo;, the agent invokes
                real <code>document.modelContext</code> tools registered by ShowOnce—the
                exact same domain commands the human UI uses—so the visible app updates
                live in front of the recipient as the agent works. Nothing is faked or
                simulated.
              </p>
            </Card>

            <Card>
              <span className="eyebrow">Step 6</span>
              <h2>Humans keep the final say</h2>
              <p>
                For consequential, identity-bearing actions (like actually submitting a
                renewal), the agent can read state, compare it, apply safe preferences,
                and prepare everything up to a final reviewable summary—but it cannot
                click &ldquo;confirm&rdquo; for the recipient. A personal attestation
                checkbox (&ldquo;I am the recipient and I approve this&rdquo;) must be
                checked by a real human before the action executes. Routine, reversible
                work goes to the agent; identity and consequential commitment stay with
                the human.
              </p>
            </Card>
          </div>
        </section>

        <section>
          <div className="section-heading">
            <h2>WebMCP building block</h2>
            <span>Real tools, not simulation</span>
          </div>
          <Card>
            <p>
              Each domain command in ShowOnce is exposed to agents through{' '}
              <code>document.modelContext.registerTool(...)</code>. That registration is
              the core building block: it makes every captured action a real, invocable
              tool that updates the live app—the same path the human UI already uses.
            </p>
          </Card>
        </section>
      </div>
    </AppShell>
  )
}
