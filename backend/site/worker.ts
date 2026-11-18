/**
 * Static site worker — serves the landing pages (pricing/activate) for the
 * QR Code Generator Pro purchase flow.
 */
export default {
  async fetch(request: Request, env: { ASSETS: { fetch: (r: Request) => Promise<Response> } }) {
    return env.ASSETS.fetch(request)
  }
}
