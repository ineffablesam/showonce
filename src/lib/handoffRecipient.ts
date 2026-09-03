export function handoffRecipientName(
  recipient: string | undefined | null,
): string | null {
  const trimmed = recipient?.trim()
  return trimmed ? trimmed : null
}

export function possessive(label: string): string {
  return /s$/iu.test(label) ? `${label}'` : `${label}'s`
}
