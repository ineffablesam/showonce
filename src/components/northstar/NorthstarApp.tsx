import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'

import { Icon } from '../ui/Icon'
import type { AccountState, Command, CommandResult, Plan } from '../../domain/model'

export type NorthstarScreen =
  | 'overview'
  | 'coverage'
  | 'dental'
  | 'renewal-1'
  | 'renewal-2'
  | 'renewal-3'
  | 'renewal-4'
  | 'renewal-done'
  | 'dependents'
  | 'claims'
  | 'documents'
  | 'profile'

export type NorthstarMode = 'demonstrator' | 'recipient'

const PORTAL_NAME = 'WaitingRoom.gov'
const PORTAL_TITLE = 'WaitingRoom.gov Benefits Enrollment Portal'
const PORTAL_DEPT = 'Department of Forms, Queues & Dental Coverage'
const GOV_MARQUEE = (
  <>
    Important Notice for members regarding collection of outstanding Form 17-B fees.{' '}
    <em>Click here</em> for details.&nbsp;&nbsp;&nbsp; Dental renewal online payments now
    accepted through member portal. <em>Click here</em> to proceed.&nbsp;&nbsp;&nbsp; Avail
    NACH facility for automatic premium deduction on the 7th, 12th, or 17th.{' '}
    <em>Click here</em> for details.&nbsp;&nbsp;&nbsp;
  </>
)

const NAV_ITEMS: Array<{ screen: NorthstarScreen; label: string; icon: Parameters<typeof Icon>[0]['name'] }> = [
  { screen: 'overview', label: 'Overview', icon: 'grid' },
  { screen: 'coverage', label: 'Coverage', icon: 'clipboard' },
  { screen: 'dependents', label: 'Dependents', icon: 'users' },
  { screen: 'claims', label: 'Claims', icon: 'activity' },
  { screen: 'documents', label: 'Documents', icon: 'file' },
  { screen: 'profile', label: 'Profile', icon: 'settings' },
]

function resolvePlan(account: AccountState): Plan | undefined {
  const id =
    account.selectedPlanId ??
    account.availablePlans.find((plan) => plan.id === 'gold')?.id ??
    account.availablePlans[0]?.id
  return account.availablePlans.find((plan) => plan.id === id)
}

function screenLabel(screen: NorthstarScreen): string {
  if (screen.startsWith('renewal')) return 'Dental Renewal'
  const labels: Record<NorthstarScreen, string> = {
    overview: 'Member Dashboard',
    coverage: 'Coverage Details',
    dental: 'Dental Scheme',
    'renewal-1': 'Dental Renewal',
    'renewal-2': 'Dental Renewal',
    'renewal-3': 'Dental Renewal',
    'renewal-4': 'Dental Renewal',
    'renewal-done': 'Renewal Confirmation',
    dependents: 'Dependents',
    claims: 'Claims Status',
    documents: 'Documents',
    profile: 'Profile',
  }
  return labels[screen]
}

function GovAdStrip() {
  return (
    <aside aria-label="Government announcements" className="northstar-app__ads">
      <div className="northstar-app__marquee" aria-label="Latest notices">
        <div className="northstar-app__marquee-track">
          <span className="northstar-app__marquee-chunk">
            <img
              alt="New"
              className="northstar-app__marquee-new"
              src="/banners/new.gif"
            />
            <span className="northstar-app__marquee-text">{GOV_MARQUEE}</span>
          </span>
          <span className="northstar-app__marquee-chunk">
            <img
              alt=""
              aria-hidden="true"
              className="northstar-app__marquee-new"
              src="/banners/new.gif"
            />
            <span className="northstar-app__marquee-text">{GOV_MARQUEE}</span>
          </span>
        </div>
      </div>
      <div className="northstar-app__ad-banners">
        <div className="northstar-app__ad-banner-cell">
          <img
            alt="Digital Waiting Room Initiative 2026 — Queue Less, Form More"
            className="northstar-app__ad-banner"
            src="/banners/gov-banner-waiting-room-v2.png"
          />
        </div>
        <div className="northstar-app__ad-banner-cell northstar-app__ad-banner-cell--tablet">
          <img
            alt="File Form 17-B before 31 December 2026 or lose dental coverage"
            className="northstar-app__ad-banner"
            src="/banners/gov-banner-form-17b-v3.png"
          />
        </div>
        <div className="northstar-app__ad-banner-cell northstar-app__ad-banner-cell--desktop">
          <img
            alt="Hotline 1-800-WAIT-4-IT — NACH auto-debit on the 7th, 12th, or 17th"
            className="northstar-app__ad-banner"
            src="/banners/gov-banner-hotline-v3.png"
          />
        </div>
      </div>
    </aside>
  )
}

export function NorthstarApp({
  memberName,
  account,
  mode,
  runCommand,
  initialScreen = 'overview',
  addressConfirmed,
  onAddressConfirm,
  submissionHint,
}: {
  memberName: string
  account: AccountState
  mode: NorthstarMode
  runCommand: (command: Command) => Promise<CommandResult>
  initialScreen?: NorthstarScreen
  addressConfirmed: boolean
  onAddressConfirm: () => void
  /** Recipient mode: what to tell the recipient about submission, since the
   * actual confirm/submit gate lives in the ShowOnce side panel, not this
   * site. */
  submissionHint?: string
}) {
  const [screen, setScreen] = useState<NorthstarScreen>(initialScreen)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string>()
  const previousSubmittedAt = useRef(account.submittedAt)

  useEffect(() => {
    if (previousSubmittedAt.current === null && account.submittedAt !== null) {
      setScreen('renewal-done')
    }
    previousSubmittedAt.current = account.submittedAt
  }, [account.submittedAt])

  const plan = resolvePlan(account)

  const act = async (command: Command): Promise<CommandResult> => {
    setBusy(true)
    setError(undefined)
    try {
      const result = await runCommand(command)
      if (!result.ok) {
        setError(describeRefusal(result.reason))
      }
      return result
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="northstar-app">
      <div className="northstar-app__topbar">
        <button className="northstar-app__topbar-link" type="button">
          Login
        </button>
        <span className="northstar-app__topbar-sep" aria-hidden="true">
          |
        </span>
        <button className="northstar-app__topbar-link" type="button">
          Help
        </button>
        <span className="northstar-app__topbar-end">
          Signed in as <strong>{memberName}</strong>
        </span>
      </div>

      <header className="northstar-app__banner">
        <div className="northstar-app__titles">
          <span className="northstar-app__brand">{PORTAL_TITLE}</span>
          <span className="northstar-app__dept">{PORTAL_DEPT}</span>
        </div>
      </header>

      <GovAdStrip />

      <nav aria-label="Portal navigation" className="northstar-app__nav">
        {NAV_ITEMS.map((item) => (
          <button
            className={
              screen === item.screen ||
              (item.screen === 'coverage' && screen === 'dental') ||
              (item.screen === 'overview' && screen.startsWith('renewal'))
                ? 'northstar-app__nav-active'
                : ''
            }
            key={item.screen}
            onClick={() => setScreen(item.screen)}
            type="button"
          >
            {item.label}
          </button>
        ))}
      </nav>

      <p className="northstar-app__last-updated">
        Website Last Updated on: 03-Sep-2026
      </p>

      <div aria-label="Breadcrumb" className="northstar-app__breadcrumb">
        <span>Home</span>
        <span aria-hidden="true">&gt;&gt;</span>
        <span>Member Services</span>
        <span aria-hidden="true">&gt;&gt;</span>
        <strong>{screenLabel(screen)}</strong>
      </div>

      <main className="northstar-app__main" id="northstar-main">
          {error ? (
            <p className="northstar-app__error" role="alert">
              {error}
            </p>
          ) : null}
          {screen === 'overview' ? (
            <OverviewScreen account={account} memberName={memberName} onNavigate={setScreen} plan={plan} />
          ) : screen === 'coverage' ? (
            <CoverageScreen onNavigate={setScreen} plan={plan} />
          ) : screen === 'dental' ? (
            <DentalDetailScreen
              account={account}
              busy={busy}
              onManage={async () => {
                if (account.selectedPlanId === null && plan) {
                  await act({ type: 'select_plan', planId: plan.id })
                }
                setScreen(
                  account.submittedAt !== null
                    ? 'renewal-done'
                    : account.selectedPlanId !== null
                      ? 'renewal-4'
                      : 'renewal-1',
                )
              }}
              plan={plan}
            />
          ) : screen === 'renewal-1' ? (
            <RenewalStep1
              account={account}
              busy={busy}
              onChangeFrequency={(value) =>
                void act({ type: 'set_preference', key: 'renewalFrequency', value })
              }
              onContinue={() => setScreen('renewal-2')}
              plan={plan}
            />
          ) : screen === 'renewal-2' ? (
            <RenewalStep2
              account={account}
              addressConfirmed={addressConfirmed}
              busy={busy}
              onConfirmAddress={async (address) => {
                if (address.trim() !== account.address.trim()) {
                  await act({ type: 'set_address', address: address.trim() })
                }
                await act({ type: 'review_recipient_details' })
                onAddressConfirm()
              }}
              onContinue={() => setScreen('renewal-3')}
            />
          ) : screen === 'renewal-3' ? (
            <RenewalStep3
              account={account}
              busy={busy}
              onContinue={async () => {
                await act({ type: 'preview_renewal' })
                setScreen('renewal-4')
              }}
              onTogglePaperless={(enabled) =>
                void act({ type: 'set_preference', key: 'paperless', value: enabled })
              }
            />
          ) : screen === 'renewal-4' ? (
            <RenewalReview
              account={account}
              busy={busy}
              mode={mode}
              onSubmit={
                mode === 'demonstrator'
                  ? async () => {
                      const confirmed = await act({ type: 'create_confirmation' })
                      if (!confirmed.confirmation) return
                      await act({
                        type: 'submit_renewal',
                        confirmationToken: confirmed.confirmation.token,
                      })
                    }
                  : undefined
              }
              plan={plan}
              submissionHint={submissionHint}
            />
          ) : screen === 'renewal-done' ? (
            <RenewalDoneScreen onBack={() => setScreen('overview')} plan={plan} />
          ) : screen === 'dependents' ? (
            <DependentsScreen account={account} />
          ) : screen === 'claims' ? (
            <ClaimsScreen />
          ) : screen === 'documents' ? (
            <DocumentsScreen account={account} />
          ) : (
            <ProfileScreen account={account} memberName={memberName} />
          )}
      </main>

      <footer className="northstar-app__footer">
        <div className="northstar-app__footer-links">
          <span>CONTACT US</span>
          <span className="northstar-app__footer-sep">|</span>
          <span>FAQ</span>
          <span className="northstar-app__footer-sep">|</span>
          <span>RTI</span>
          <span className="northstar-app__footer-sep">|</span>
          <span>ABOUT US</span>
          <span className="northstar-app__footer-sep">|</span>
          <span>SITEMAP</span>
          <span className="northstar-app__footer-sep">|</span>
          <span>GRIEVANCE REDRESSAL</span>
        </div>
        <div className="northstar-app__footer-table">
          <span>Powered by ShowOnce Demo Engine</span>
          <span className="northstar-app__footer-sep">|</span>
          <span>
            Copyright © 2026 {PORTAL_NAME}. All Rights Reserved.
          </span>
          <span className="northstar-app__footer-sep">|</span>
          <span>Site Best Viewed in 1024 x 768 resolution</span>
        </div>
        <p className="northstar-app__footer-disclaimer">
          The Site is best viewed in 1024 X 768 resolution and compatible browsers
          IE11+, Mozilla Firefox, Google Chrome, Opera, Safari. Some features may
          not work correctly in older versions of browsers.
        </p>
      </footer>
    </div>
  )
}

function describeRefusal(reason: CommandResult['reason']): string {
  switch (reason) {
    case 'plan_unavailable':
      return 'That plan is not available on this account.'
    case 'confirmation_required':
    case 'requires_user_confirmation':
      return 'This needs confirmation before it can be applied.'
    case 'confirmation_invalid':
    case 'confirmation_expired':
      return 'That confirmation is no longer valid.'
    case 'already_submitted':
      return 'This renewal was already submitted.'
    case 'plan_required':
      return 'Choose a plan before continuing.'
    case 'judgment_required':
      return 'This choice needs a person to decide.'
    default:
      return 'That action could not be completed.'
  }
}

function StatusChip({ tone, children }: { tone: 'active' | 'muted' | 'warn'; children: ReactNode }) {
  return <span className={`status-chip status-chip--${tone}`}>{children}</span>
}

function OverviewScreen({
  memberName,
  account,
  plan,
  onNavigate,
}: {
  memberName: string
  account: AccountState
  plan: Plan | undefined
  onNavigate: (screen: NorthstarScreen) => void
}) {
  return (
    <div className="northstar-screen">
      <div className="northstar-screen__heading">
        <span className="northstar-section-label">2027 enrollment period</span>
        <h1>Welcome, {memberName}</h1>
        <p>Member dashboard — active coverage and pending actions.</p>
      </div>
      <div className="coverage-cards">
        <div className="coverage-card">
          <span className="coverage-card__label">Dental</span>
          <strong>{plan?.name ?? 'No plan selected'} Dental</strong>
          <span className="coverage-card__price">
            {plan ? `$${plan.monthlyPrice}/month` : '—'}
          </span>
          <StatusChip tone="active">Active</StatusChip>
        </div>
        <div className="coverage-card coverage-card--static">
          <span className="coverage-card__label">Medical</span>
          <strong>Standard PPO</strong>
          <span className="coverage-card__price">Managed separately</span>
          <StatusChip tone="active">Active</StatusChip>
        </div>
      </div>
      <div className="overview-stats" aria-label="Live account details">
        <div>
          <small>Renewal frequency</small>
          <strong>{account.preferences.renewalFrequency === 'annual' ? 'Annual' : 'Monthly'}</strong>
        </div>
        <div>
          <small>Paperless</small>
          <strong>{account.preferences.paperless ? 'On' : 'Off'}</strong>
        </div>
        <div>
          <small>Address</small>
          <strong>{account.address}</strong>
        </div>
        <div>
          <small>Dependents</small>
          <strong>{account.dependents.length}</strong>
        </div>
      </div>
      <div className="upcoming-card">
        <div>
          <span className="northstar-section-label">Action required</span>
          <strong>Dental renewal due — open enrollment 2027</strong>
        </div>
        <button
          className="button button--primary"
          onClick={() => onNavigate('dental')}
          type="button"
        >
          Review renewal <Icon name="arrow" />
        </button>
      </div>
    </div>
  )
}

function CoverageScreen({
  plan,
  onNavigate,
}: {
  plan: Plan | undefined
  onNavigate: (screen: NorthstarScreen) => void
}) {
  return (
    <div className="northstar-screen">
      <div className="northstar-screen__heading">
        <h1>Coverage</h1>
        <p>Your active lines of coverage for this enrollment year.</p>
      </div>
      <button className="coverage-row" onClick={() => onNavigate('dental')} type="button">
        <span>
          <strong>{plan?.name ?? 'Dental'} Dental</strong>
          <small>{plan ? `$${plan.monthlyPrice}/month` : 'Not yet selected'}</small>
        </span>
        <StatusChip tone="active">Active</StatusChip>
        <Icon name="arrow" />
      </button>
      <div className="coverage-row coverage-row--static">
        <span>
          <strong>Standard PPO</strong>
          <small>Medical · managed separately</small>
        </span>
        <StatusChip tone="active">Active</StatusChip>
      </div>
    </div>
  )
}

function DentalDetailScreen({
  plan,
  account,
  onManage,
  busy,
}: {
  plan: Plan | undefined
  account: AccountState
  onManage: () => void
  busy: boolean
}) {
  const renewed = account.submittedAt !== null
  const inProgress = account.selectedPlanId !== null && !renewed
  return (
    <div className="northstar-screen">
      <div className="northstar-screen__heading">
        <span className="northstar-section-label">Dental coverage</span>
        <h1>{plan?.name ?? 'Dental'} Dental</h1>
      </div>
      <div className="detail-facts">
        <div>
          <small>Current price</small>
          <strong>{plan ? `$${plan.monthlyPrice}/month` : '—'}</strong>
        </div>
        <div>
          <small>Dependents</small>
          <strong>{account.dependents.length}</strong>
        </div>
        <div>
          <small>Renewal</small>
          <strong>{renewed ? 'Renewed' : 'Available'}</strong>
        </div>
      </div>
      <button
        className="button button--primary button--large"
        disabled={busy}
        onClick={onManage}
        type="button"
      >
        {renewed ? 'View renewal' : inProgress ? 'Continue renewal' : 'Manage coverage'}
        <Icon name="arrow" />
      </button>
    </div>
  )
}

function RenewalStep1({
  plan,
  account,
  onChangeFrequency,
  onContinue,
  busy,
}: {
  plan: Plan | undefined
  account: AccountState
  onChangeFrequency: (value: 'monthly' | 'annual') => void
  onContinue: () => void
  busy: boolean
}) {
  return (
    <div className="northstar-screen renewal-wizard">
      <ol className="renewal-wizard__steps">
        <li className="renewal-wizard__step--active">Frequency</li>
        <li>Address</li>
        <li>Communication</li>
        <li>Review</li>
      </ol>
      <div className="northstar-screen__heading">
        <span className="northstar-section-label">
          Renew {plan?.name ?? 'coverage'}
        </span>
        <h1>Renewal frequency</h1>
        <p>Current plan: {plan?.name ?? '—'} Dental</p>
      </div>
      <div className="radio-row" role="radiogroup">
        {(['monthly', 'annual'] as const).map((value) => (
          <label className="radio-option" key={value}>
            <input
              checked={(account.preferences.renewalFrequency ?? 'monthly') === value}
              disabled={busy}
              name="renewal-frequency"
              onChange={() => onChangeFrequency(value)}
              type="radio"
            />
            {value === 'monthly' ? 'Monthly' : 'Annual'}
          </label>
        ))}
      </div>
      <button className="button button--primary" onClick={onContinue} type="button">
        Continue <Icon name="arrow" />
      </button>
    </div>
  )
}

function RenewalStep2({
  account,
  addressConfirmed,
  onConfirmAddress,
  onContinue,
  busy,
}: {
  account: AccountState
  addressConfirmed: boolean
  onConfirmAddress: (address: string) => Promise<void>
  onContinue: () => void
  busy: boolean
}) {
  const [address, setAddress] = useState(account.address)

  return (
    <div className="northstar-screen renewal-wizard">
      <ol className="renewal-wizard__steps">
        <li>Frequency</li>
        <li className="renewal-wizard__step--active">Address</li>
        <li>Communication</li>
        <li>Review</li>
      </ol>
      <div className="northstar-screen__heading">
        <h1>Address</h1>
        <p>Update this if the member has moved, then confirm.</p>
      </div>
      <label className="northstar-field" htmlFor="renewal-address">
        <span className="northstar-field__label">Mailing address</span>
        <input
          className="northstar-field__input"
          disabled={addressConfirmed || busy}
          id="renewal-address"
          onChange={(event) => setAddress(event.target.value)}
          type="text"
          value={address}
        />
      </label>
      {addressConfirmed ? (
        <StatusChip tone="active">Confirmed</StatusChip>
      ) : (
        <>
          <StatusChip tone="warn">Needs confirmation</StatusChip>
          <button
            className="button button--ghost"
            disabled={busy || address.trim() === ''}
            onClick={() => void onConfirmAddress(address)}
            type="button"
          >
            Save &amp; confirm address
          </button>
        </>
      )}
      <button
        className="button button--primary"
        disabled={!addressConfirmed}
        onClick={onContinue}
        type="button"
      >
        Continue <Icon name="arrow" />
      </button>
    </div>
  )
}

function RenewalStep3({
  account,
  onTogglePaperless,
  onContinue,
  busy,
}: {
  account: AccountState
  onTogglePaperless: (enabled: boolean) => void
  onContinue: () => Promise<void>
  busy: boolean
}) {
  return (
    <div className="northstar-screen renewal-wizard">
      <ol className="renewal-wizard__steps">
        <li>Frequency</li>
        <li>Address</li>
        <li className="renewal-wizard__step--active">Communication</li>
        <li>Review</li>
      </ol>
      <div className="northstar-screen__heading">
        <h1>Communication</h1>
      </div>
      <div className="toggle-row">
        <span>Paper notices</span>
        <strong>{account.preferences.paperless ? 'Disabled' : 'Enabled'}</strong>
      </div>
      <div className="toggle-row">
        <span>Paperless</span>
        <label className="switch">
          <input
            aria-label="Paperless"
            checked={account.preferences.paperless}
            disabled={busy}
            onChange={(event) => onTogglePaperless(event.target.checked)}
            type="checkbox"
          />
          <span className="switch__track" />
        </label>
      </div>
      <button
        className="button button--primary"
        disabled={busy}
        onClick={() => void onContinue()}
        type="button"
      >
        Continue <Icon name="arrow" />
      </button>
    </div>
  )
}

function RenewalReview({
  plan,
  account,
  mode,
  onSubmit,
  busy,
  submissionHint,
}: {
  plan: Plan | undefined
  account: AccountState
  mode: NorthstarMode
  onSubmit?: () => Promise<void>
  busy: boolean
  submissionHint?: string
}) {
  return (
    <div className="northstar-screen renewal-wizard">
      <ol className="renewal-wizard__steps">
        <li>Frequency</li>
        <li>Address</li>
        <li>Communication</li>
        <li className="renewal-wizard__step--active">Review</li>
      </ol>
      <div className="northstar-screen__heading">
        <h1>Review</h1>
      </div>
      <div className="review-summary">
        <div>
          <small>Plan</small>
          <strong>{plan?.name ?? '—'} Dental</strong>
        </div>
        <div>
          <small>Frequency</small>
          <strong>{account.preferences.renewalFrequency === 'annual' ? 'Annual' : 'Monthly'}</strong>
        </div>
        <div>
          <small>Price</small>
          <strong>{plan ? `$${plan.monthlyPrice}/month` : '—'}</strong>
        </div>
        <div>
          <small>Dependents</small>
          <strong>{account.dependents.length}</strong>
        </div>
        <div>
          <small>Paperless</small>
          <strong>{account.preferences.paperless ? 'Enabled' : 'Disabled'}</strong>
        </div>
        <div>
          <small>Address</small>
          <strong>{account.address}</strong>
        </div>
      </div>
      {mode === 'demonstrator' && onSubmit ? (
        <button
          className="button button--primary button--large"
          disabled={busy || account.submittedAt !== null}
          onClick={() => void onSubmit()}
          type="button"
        >
          Submit Renewal
        </button>
      ) : (
        <p className="northstar-app__hint">
          {submissionHint ?? 'Your assistant will open an approval popup when ready.'}
        </p>
      )}
    </div>
  )
}

function RenewalDoneScreen({ plan, onBack }: { plan: Plan | undefined; onBack: () => void }) {
  return (
    <div className="northstar-screen renewal-done">
      <span className="renewal-done__mark" data-state="in">
        <Icon name="check" />
      </span>
      <h1>Application submitted successfully</h1>
      <p>
        Reference generated. {plan?.name ?? 'Your plan'} Dental renewal for the
        2027 plan year has been recorded.
      </p>
      <button className="button button--ghost" onClick={onBack} type="button">
        Return to dashboard
      </button>
    </div>
  )
}

function DependentsScreen({ account }: { account: AccountState }) {
  return (
    <div className="northstar-screen">
      <div className="northstar-screen__heading">
        <h1>Dependents</h1>
        <p>{account.dependents.length} covered on this account.</p>
      </div>
      <div className="dependents-list">
        {account.dependents.map((name) => (
          <div className="dependents-list__row" key={name}>
            <span className="dependents-list__avatar">{name.charAt(0)}</span>
            <strong>{name}</strong>
            <StatusChip tone="active">Covered</StatusChip>
          </div>
        ))}
      </div>
      <button className="button button--ghost" disabled title="Not available in this demo" type="button">
        <Icon name="plus" /> Add dependent
      </button>
    </div>
  )
}

function ClaimsScreen() {
  return (
    <div className="northstar-screen">
      <div className="northstar-screen__heading">
        <h1>Claims</h1>
      </div>
      <div className="empty-panel">
        <Icon name="activity" />
        <strong>No claims filed</strong>
        <span>Claims submitted for covered services will appear here.</span>
      </div>
    </div>
  )
}

function DocumentsScreen({ account }: { account: AccountState }) {
  return (
    <div className="northstar-screen">
      <div className="northstar-screen__heading">
        <h1>Documents</h1>
      </div>
      <div className="document-row">
        <Icon name="file" />
        <span>
          <strong>2027 enrollment summary</strong>
          <small>{account.preferences.paperless ? 'Delivered electronically' : 'Mailed'}</small>
        </span>
      </div>
      <div className="empty-panel">
        <Icon name="file" />
        <strong>No other documents yet</strong>
        <span>Renewal confirmations will be added here once submitted.</span>
      </div>
    </div>
  )
}

function ProfileScreen({ account, memberName }: { account: AccountState; memberName: string }) {
  return (
    <div className="northstar-screen">
      <div className="northstar-screen__heading">
        <h1>Profile</h1>
      </div>
      <div className="profile-facts">
        <div>
          <small>Member</small>
          <strong>{memberName}</strong>
        </div>
        <div>
          <small>Account</small>
          <strong>{account.id}</strong>
        </div>
        <div>
          <small>Address</small>
          <strong>{account.address}</strong>
        </div>
        <div>
          <small>Communication</small>
          <strong>{account.preferences.communication === 'email' ? 'Email' : 'Mail'}</strong>
        </div>
      </div>
    </div>
  )
}