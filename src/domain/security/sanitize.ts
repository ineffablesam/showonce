type SensitiveKey =
  | 'password'
  | 'credentials'
  | 'session'
  | 'sessionToken'
  | 'apiKey'
  | 'token'
  | 'confirmationToken'
  | 'selector'
  | 'coordinates'
  | 'screenshot'
  | 'address'
  | 'recipientAddress'
  | 'dependent'
  | 'dependents'

export type Sanitized<T> = T extends readonly (infer Item)[]
  ? Sanitized<Item>[]
  : T extends object
    ? {
        [Key in keyof T as Key extends SensitiveKey ? never : Key]: Sanitized<T[Key]>
      }
    : T

const SENSITIVE_KEY =
  /(password|credential|session|api.?key|token|selector|coordinate|screenshot|address|dependent)/i

function sanitize(value: unknown, seen: WeakSet<object>): unknown {
  if (value === null || typeof value !== 'object') {
    return value
  }

  if (seen.has(value)) {
    return undefined
  }
  seen.add(value)

  if (Array.isArray(value)) {
    return value.map((item) => sanitize(item, seen))
  }

  const result: Record<string, unknown> = {}
  for (const [key, nestedValue] of Object.entries(value)) {
    if (SENSITIVE_KEY.test(key)) {
      continue
    }
    const sanitizedValue = sanitize(nestedValue, seen)
    if (sanitizedValue !== undefined) {
      result[key] = sanitizedValue
    }
  }
  return result
}

export function sanitizeSensitive<T>(value: T): Sanitized<T> {
  return sanitize(value, new WeakSet()) as Sanitized<T>
}
