import {
  ComponentSettings,
  Manager,
  MCEvent,
  ClientSetOptions,
} from '@managed-components/types'
import { EVENTS_MAP, getEcommerceRequestData } from './ecommerce'
import { getRandomBranchNumber } from './utils'

const getOrCreateCookie = (
  client: MCEvent['client'],
  key: string,
  scope?: ClientSetOptions['scope']
): string => {
  const cookieValue = client.get(key)
  const newValue = getRandomBranchNumber()
  if (!cookieValue) client.set(key, newValue, { scope })
  return cookieValue || newValue
}

const SDK = 'web'
const SDK_VERSION = '2.71.0'
const FULL_SDK_VERSION = SDK + SDK_VERSION

const getGenericRequestBodyParams = (
  client: MCEvent['client'],
  branch_key: string
) => {
  const identity = client.get('identity')

  return {
    sdk: FULL_SDK_VERSION,
    branch_key,
    identity_id: getOrCreateCookie(client, 'identity_id'),
    browser_fingerprint_id: getOrCreateCookie(client, 'browser_fingerprint_id'),
    session_id: getOrCreateCookie(client, 'session_id', 'session'),
    ...(identity && { identity }),
  }
}

const getUserDataParams = (client: MCEvent['client'], branch_key: string) => {
  const { browser_fingerprint_id, identity } = getGenericRequestBodyParams(
    client,
    branch_key
  )

  return JSON.stringify({
    http_origin: client.url.origin,
    user_agent: client.userAgent,
    language: client.language,
    screen_width: client.screenWidth,
    screen_height: client.screenHeight,
    http_referrer: client.referer,
    browser_fingerprint_id,
    identity,
    developer_identity: identity,
    sdk: SDK,
    sdk_version: SDK_VERSION,
  })
}

export const sendPageviewEvent = (branch_key: string) => (event: MCEvent) => {
  const { client } = event

  const body = new URLSearchParams({
    ...getGenericRequestBodyParams(client, branch_key),
    source: 'web-sdk',
    feature: 'journeys',
    event: 'pageview',
    metadata: JSON.stringify({
      url: client.url.href,
      user_agent: client.userAgent,
      language: client.language,
      screen_width: client.screenWidth,
      screen_height: client.screenHeight,
      title: client.title,
    }),
    initial_referrer: client.referer,
    user_language: client.language.split('-')[0],
  }).toString()

  client.fetch('https://api2.branch.io/v1/pageview', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': client.userAgent,
    },
    body,
  })
}

export const sendIdentifyEvent = (branch_key: string) => (event: MCEvent) => {
  const { client, payload } = event
  const { identity } = payload
  client.set('identity', identity)

  const body = new URLSearchParams({
    ...getGenericRequestBodyParams(client, branch_key),
    identity,
  }).toString()

  client.fetch('https://api2.branch.io/v1/profile', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': client.userAgent,
    },
    body,
  })
}

export const sendLogoutEvent =
  (branch_key: string) =>
  ({ client }: MCEvent) => {
    client.set('identity', null)

    const body = new URLSearchParams({
      ...getGenericRequestBodyParams(client, branch_key),
    }).toString()

    client.fetch('https://api2.branch.io/v1/logout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': client.userAgent,
      },
      body,
    })
  }

export const sendLifecycleEvent = (branch_key: string) => (event: MCEvent) => {
  const { client, payload } = event
  const {
    timestamp,
    lifecycle_event_name,
    transaction_id,
    description,
    ...custom_fields
  } = payload

  const body = new URLSearchParams({
    name: lifecycle_event_name,
    user_data: getUserDataParams(client, branch_key),
    custom_data: JSON.stringify(custom_fields),
    event_data: JSON.stringify({ transaction_id, description }),
    branch_key,
  }).toString()

  client.fetch('https://api2.branch.io/v2/event/standard', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': client.userAgent,
    },
    body,
  })
}

export const sendCustomEvent = (branch_key: string) => (event: MCEvent) => {
  const { client, payload } = event
  const { timestamp, custom_event_name, ...custom_fields } = payload

  const body = new URLSearchParams({
    name: custom_event_name,
    user_data: getUserDataParams(client, branch_key),
    custom_data: JSON.stringify(custom_fields),
    branch_key,
  }).toString()

  client.fetch('https://api2.branch.io/v2/event/custom', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': client.userAgent,
    },
    body,
  })
}

export const sendEcommerceEvent = (branch_key: string) => (event: MCEvent) => {
  const { client, payload } = event
  const { ecommerce, name: zEventName } = payload

  const name = EVENTS_MAP[zEventName]?.name

  if (name) {
    const body = new URLSearchParams({
      name,
      user_data: getUserDataParams(client, branch_key),
      ...getEcommerceRequestData(ecommerce),
      branch_key,
    }).toString()

    client.fetch('https://api2.branch.io/v2/event/standard', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': client.userAgent,
      },
      body,
    })
  }
}

export default async function (manager: Manager, settings: ComponentSettings) {
  manager.addEventListener('pageview', sendPageviewEvent(settings.branchKey))
  manager.addEventListener('identify', sendIdentifyEvent(settings.branchKey))
  manager.addEventListener('logout', sendLogoutEvent(settings.branchKey))
  manager.addEventListener(
    'lifecycle_event',
    sendLifecycleEvent(settings.branchKey)
  )
  manager.addEventListener('custom_event', sendCustomEvent(settings.branchKey))
  manager.addEventListener('ecommerce', sendEcommerceEvent(settings.branchKey))
}
