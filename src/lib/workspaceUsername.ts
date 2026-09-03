const USERNAME_PATTERN = /^[a-z0-9_-]{2,32}$/

export function normalizeUsername(input: string): string {
  return input.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '')
}

export function isValidUsername(input: string): boolean {
  return USERNAME_PATTERN.test(normalizeUsername(input))
}

export function usernameValidationMessage(input: string): string | undefined {
  const normalized = normalizeUsername(input)
  if (!normalized) return 'Enter a username to open your workspace.'
  if (normalized.length < 2) {
    return 'Usernames need at least 2 letters, numbers, underscores, or hyphens.'
  }
  if (normalized.length > 32) {
    return 'Usernames can be at most 32 characters.'
  }
  if (!USERNAME_PATTERN.test(normalized)) {
    return 'Use only letters, numbers, underscores, and hyphens.'
  }
  return undefined
}

export function formatUsernameLabel(username: string): string {
  return username
    .split(/[-_]/u)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

export function usernameInitials(username: string): string {
  const parts = username.split(/[-_]/u).filter(Boolean)
  if (parts.length >= 2) {
    return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase()
  }
  return username.slice(0, 2).toUpperCase()
}
