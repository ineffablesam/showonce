import { motion } from 'framer-motion'
import { useState } from 'react'

import { LandingFrame } from '../components/layout/LandingFrame'
import { LandingHeader } from '../components/layout/LandingHeader'
import {
  OpenWorkspaceDialog,
  OpenWorkspaceTrigger,
} from '../components/workspace/OpenWorkspaceDialog'

const landingEase = [0.22, 1, 0.36, 1] as const

const heroContainerMotion = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      delayChildren: 0.2,
      staggerChildren: 0.1,
    },
  },
}

const heroItemMotion = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.55,
      ease: landingEase,
    },
  },
}

const heroFooterMotion = {
  hidden: { opacity: 0, y: 10 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.55,
      duration: 0.5,
      ease: landingEase,
    },
  },
}

export function LandingPage() {
  const [workspaceOpen, setWorkspaceOpen] = useState(false)

  return (
    <div className="landing-page">
      <LandingFrame />
      <LandingHeader onOpenWorkspace={() => setWorkspaceOpen(true)} />
      <OpenWorkspaceDialog
        onClose={() => setWorkspaceOpen(false)}
        open={workspaceOpen}
      />
      <div aria-hidden="true" className="landing-page__header-spacer" />
      <main className="landing-page__main">
        <motion.div
          animate={{ opacity: 1 }}
          className="landing-hero"
          initial={{ opacity: 0 }}
          transition={{ duration: 0.65, ease: landingEase }}
        >
          <div className="landing-hero__overlay" />
          <motion.div
            animate="show"
            className="landing-hero__content"
            initial="hidden"
            variants={heroContainerMotion}
          >
            <motion.img
              alt="ShowOnce"
              className="landing-hero__logo"
              src="/logo.svg"
              variants={heroItemMotion}
            />
            <motion.span className="landing-hero__badge" variants={heroItemMotion}>
              <img
                alt="OpenAI"
                className="landing-hero__badge-logo"
                src="/openai-white-lockup.svg"
              />
              <span aria-hidden="true" className="landing-hero__badge-divider" />
              Built for the WebMCP Challenge
            </motion.span>
            <motion.h1 className="landing-hero__title" variants={heroItemMotion}>
              <span className="landing-hero__title-sans">Walk through it once.</span>{' '}
              <span className="landing-hero__title-serif">
                Agents complete it live.
              </span>
            </motion.h1>
            <motion.p className="landing-hero__lede" variants={heroItemMotion}>
              ShowOnce records a real browser task as you do it — then packages
              it into a shareable handoff link. The recipient opens it on their
              own account, and their AI agent continues through live{' '}
              <code>document.modelContext</code> WebMCP tools. Same commands as
              the human UI. A person still approves every final step.
            </motion.p>
          </motion.div>
          <motion.div
            animate="show"
            className="landing-hero__footer"
            initial="hidden"
            variants={heroFooterMotion}
          >
            <div className="landing-hero__actions">
              <OpenWorkspaceTrigger
                large
                onOpen={() => setWorkspaceOpen(true)}
              />
            </div>
          </motion.div>
        </motion.div>
      </main>
    </div>
  )
}
