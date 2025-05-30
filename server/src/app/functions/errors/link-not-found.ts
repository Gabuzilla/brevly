export class LinkNotFoundError extends Error {
  constructor(shortUrl: string) {
    super(`O link com a URL encurtada '${shortUrl}' não foi encontrado.`)
    this.name = 'LinkNotFoundError'
  }
}
