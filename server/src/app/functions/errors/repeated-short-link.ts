export class RepeatedShortLinkError extends Error {
  constructor(link: string) {
    super(`Short URL "${link}" is already in use.`)
  }
}