export function objToString(obj: Record<string, any>): Record<string, string> {
  return Object.fromEntries(
    Object.entries(obj)
      .filter(([, value]) => value !== undefined)
      .map(([key, value]) => [key, String(value)])
  )
}
