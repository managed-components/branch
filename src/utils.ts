import { IParams } from './ecommerce'

export const getRandomBranchNumber = () => {
  return Math.ceil(Math.random() * 10000000000000 + 10000000000000).toString()
}

export const isValue = (value: unknown): boolean => {
  return (
    value !== null &&
    value !== undefined &&
    (typeof value !== 'number' || !isNaN(value)) &&
    (!Array.isArray(value) || !!value.length) &&
    (typeof value !== 'object' || !!Object.keys(value).length)
  )
}

const isValidTimestamp = (value: unknown): boolean => {
  const ts = new Date(parseInt(value as string)).valueOf()
  return !isNaN(ts) && ts >= 0
}

export const getValidatedValue = (
  value: unknown,
  { type, validation }: IParams['k']
) => {
  if (type.some(t => t === typeof value)) {
    if (validation) {
      if (Array.isArray(validation)) {
        if (typeof value === 'string' && validation.includes(value))
          return value
      } else if (validation.isDate && isValidTimestamp(value)) {
        return value
      } else if (
        validation.isPositive &&
        typeof value === 'number' &&
        value >= 0
      ) {
        return value
      }
    } else return value
  } else {
    if (type.includes('string')) return String(value)
    if (type.includes('number') && !isNaN(parseInt(value as string)))
      return parseInt(value as string)
  }
}
