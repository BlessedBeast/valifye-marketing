export interface HowToStepInput {
  name: string
  text: string
  position?: number
}

export interface HowToStepSchema {
  '@type': 'HowToStep'
  name: string
  text: string
  position?: number
}

export interface HowToSchema {
  '@context': 'https://schema.org'
  '@type': 'HowTo'
  name: string
  description?: string
  totalTime?: string
  step: HowToStepSchema[]
}

export interface HowToSchemaOptions {
  description?: string
  totalTime?: string
}

export function formatIsoDuration(timeToValidate: string | number): string {
  if (typeof timeToValidate === 'number' && Number.isFinite(timeToValidate)) {
    return `PT${Math.round(timeToValidate)}D`
  }

  const raw = String(timeToValidate).trim()
  if (!raw) return 'P1D'

  if (/^P/i.test(raw)) return raw

  const digitsOnly = raw.match(/^(\d+)/)
  if (digitsOnly) {
    const unit = raw.toLowerCase()
    if (unit.includes('hour') || unit.includes('hr')) {
      return `PT${digitsOnly[1]}H`
    }
    if (unit.includes('week') || unit.includes('wk')) {
      return `P${digitsOnly[1]}W`
    }
    if (unit.includes('month') || unit.includes('mo')) {
      return `P${digitsOnly[1]}M`
    }
    return `PT${digitsOnly[1]}D`
  }

  return `PT${raw}`
}

export function generateHowToSchema(
  name: string,
  steps: HowToStepInput[],
  options?: HowToSchemaOptions
): HowToSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name,
    ...(options?.description ? { description: options.description } : {}),
    ...(options?.totalTime ? { totalTime: options.totalTime } : {}),
    step: steps.map((step, index) => ({
      '@type': 'HowToStep',
      name: step.name,
      text: step.text,
      ...(step.position != null
        ? { position: step.position }
        : { position: index + 1 })
    }))
  }
}
