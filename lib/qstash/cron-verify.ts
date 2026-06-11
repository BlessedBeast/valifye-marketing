import { verifySignatureAppRouter } from '@upstash/qstash/nextjs'

/** Placeholders allow `next build` when QStash env vars are not set locally. */
const BUILD_PLACEHOLDER_KEY = 'qstash-build-placeholder'

function getQStashSigningKeys() {
  return {
    currentSigningKey:
      process.env.QSTASH_CURRENT_SIGNING_KEY ?? BUILD_PLACEHOLDER_KEY,
    nextSigningKey:
      process.env.QSTASH_NEXT_SIGNING_KEY ?? BUILD_PLACEHOLDER_KEY,
  }
}

export function wrapQStashCronHandler(
  handler: () => Promise<Response>
): (request: Request) => Promise<Response> {
  return verifySignatureAppRouter(handler, getQStashSigningKeys())
}
