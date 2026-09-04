import { describe, expect, it } from 'vitest'

import { compareProcedureToRecipient } from '../domain/adaptation/compareProcedureToRecipient'
import { createRecipientAccount } from '../domain/integration/productFlow'
import type { Procedure } from '../domain/model'
import {
  buildCompareAgentGuidance,
  buildJudgmentRequiredGuidance,
} from './compareAgentGuidance'

const procedure = {
  steps: [
    {
      commandType: 'select_plan' as const,
      input: {
        type: 'select_plan' as const,
        planId: 'gold',
        observedMonthlyPrice: 88,
      },
    },
  ],
} satisfies Pick<Procedure, 'steps'>

describe('compareAgentGuidance', () => {
  it('returns guidance when judgment is required for a price change', () => {
    const initial = {
      ...createRecipientAccount('normal'),
      availablePlans: [
        { id: 'silver', name: 'Silver', monthlyPrice: 62 },
        { id: 'gold', name: 'Gold', monthlyPrice: 88 },
      ],
    }
    const recipient = createRecipientAccount('normal')
    const comparison = compareProcedureToRecipient(procedure, initial, recipient)

    expect(comparison.needsJudgment).toBe(true)
    expect(buildCompareAgentGuidance(comparison, procedure, recipient)).toMatchObject({
      stopBeforePlanSelection: true,
      summary: expect.stringContaining('$88/month'),
      suggestedQuestion: expect.stringContaining('Should I ask [name]?'),
      doNot: expect.arrayContaining([
        expect.stringContaining('benefits_select_plan'),
      ]),
    })
  })

  it('returns nothing when judgment is not required', () => {
    const account = createRecipientAccount('normal')
    const comparison = compareProcedureToRecipient(procedure, account, {
      ...account,
      availablePlans: [{ id: 'gold', name: 'Gold', monthlyPrice: 88 }],
    })

    expect(buildCompareAgentGuidance(comparison, procedure, account)).toBeUndefined()
  })

  it('guides blocked plan selection toward asking the sender', () => {
    expect(buildJudgmentRequiredGuidance(null)).toMatchObject({
      suggestedQuestion: expect.stringContaining('Should I ask [name]?'),
      afterRecipientAgrees: expect.stringContaining('showonce_request_helper'),
    })
  })
})
