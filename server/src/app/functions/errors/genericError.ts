export class GenericError extends Error {
  constructor() {
    super('Unexpected error occurred. Please try again later.')
  }
}
