import { Resend } from 'resend'

const apiKey = process.env.RESEND_API_KEY

if (!apiKey) {
  throw new Error(
    'Missing RESEND_API_KEY environment variable. Configure it before sending emails.'
  )
}

export const resend = new Resend(apiKey)
