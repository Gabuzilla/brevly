export class ZodGenericError extends Error {
  constructor(error: string) {
    super(`Validation Error: ${error}`)
  }
}
