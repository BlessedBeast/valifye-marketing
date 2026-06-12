export interface LocalPlaceSchemaInput {
  cityName: string
  stateOrCountry: string
  description: string
  url: string
}

export interface LocalPlaceSchema {
  '@context': 'https://schema.org'
  '@type': 'City'
  name: string
  description: string
  url: string
  containedInPlace: {
    '@type': 'AdministrativeArea'
    name: string
  }
}

export function generateLocalPlaceSchema(
  input: LocalPlaceSchemaInput
): LocalPlaceSchema {
  const locationLabel = input.stateOrCountry
    ? `${input.cityName}, ${input.stateOrCountry}`
    : input.cityName

  return {
    '@context': 'https://schema.org',
    '@type': 'City',
    name: locationLabel,
    description: input.description,
    url: input.url,
    containedInPlace: {
      '@type': 'AdministrativeArea',
      name: input.stateOrCountry || input.cityName
    }
  }
}
