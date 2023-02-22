import { MCEvent, ClientSetOptions } from '@managed-components/types'
import {
  sendPageviewEvent,
  sendIdentifyEvent,
  sendLogoutEvent,
  sendLifecycleEvent,
  sendCustomEvent,
  sendEcommerceEvent,
} from '.'

interface IFetchRequest {
  url: string
  opts?: {
    [k: string]: any
  }
}

interface ISetCookies {
  [k: string]: {
    value?: string
    opts?: ClientSetOptions
  }
}

const dummyClient = {
  title: 'Zaraz "Test" /t Page',
  timestamp: 1670502437,
  userAgent:
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
  language: 'en-GB',
  referer: '',
  ip: '127.0.0.1',
  emitter: 'browser',
  url: new URL('http://127.0.0.1:1337'),
  screenHeight: 1080,
  screenWidth: 2560,
  fetch: () => undefined,
  set: () => undefined,
  execute: () => undefined,
  return: () => {},
  get: () => undefined,
  attachEvent: () => {},
  detachEvent: () => {},
}

const settings = {
  branchKey: 'key_12345',
  ecommerce: true,
}

const branchNumberPattern = /[0-9]{14}/

const testFetchOptions = (fetchRequest: IFetchRequest, url: string) => {
  expect(fetchRequest).toBeTruthy()
  expect(fetchRequest.opts?.method).toEqual('POST')
  expect(fetchRequest.opts?.headers?.['Content-Type']).toEqual(
    'application/x-www-form-urlencoded'
  )
  expect(fetchRequest.opts?.headers?.['User-Agent']).toEqual(
    dummyClient.userAgent
  )
  expect(fetchRequest.url).toEqual(url)
}

const testUnchangedCookies = setCookies => {
  const identity_id = setCookies.identity_id
  const browser_fingerprint_id = setCookies.browser_fingerprint_id
  const session_id = setCookies.session_id

  expect(identity_id).toBeTruthy()
  expect(identity_id.value).toEqual('12345678901234')
  expect(browser_fingerprint_id).toBeTruthy()
  expect(browser_fingerprint_id.value).toEqual('12345678901235')
  expect(session_id).toBeTruthy()
  expect(session_id.value).toEqual('12345678901236')
}

const testGenericRequestBodyParams = (
  body: URLSearchParams,
  identity: string | null = null
) => {
  expect(body.get('sdk')).toBeTypeOf('string')
  expect(body.get('branch_key')).toEqual(settings.branchKey)
  expect(body.get('identity_id')).toMatch(branchNumberPattern)
  expect(body.get('browser_fingerprint_id')).toMatch(branchNumberPattern)
  expect(body.get('session_id')).toMatch(branchNumberPattern)
  expect(body.get('identity')).toEqual(identity)
}

const testUserData = (
  user_data: { [k: string]: any },
  browser_fingerprint_id: string,
  identity: string
) => {
  expect(user_data.http_origin).toEqual(dummyClient.url.origin)
  expect(user_data.user_agent).toEqual(dummyClient.userAgent)
  expect(user_data.language).toEqual(dummyClient.language)
  expect(user_data.screen_width).toEqual(dummyClient.screenWidth)
  expect(user_data.screen_height).toEqual(dummyClient.screenHeight)
  expect(user_data.http_referrer).toEqual(dummyClient.referer)
  expect(user_data.browser_fingerprint_id).toEqual(browser_fingerprint_id)
  expect(user_data.identity).toEqual(identity)
  expect(user_data.developer_identity).toEqual(identity)
  expect(user_data.sdk).toEqual('web')
  expect(user_data.sdk_version).toEqual('2.71.0')
}

const makeSetCookies = (withIdentity = true) => ({
  identity_id: { value: '12345678901234' },
  browser_fingerprint_id: { value: '12345678901235' },
  session_id: { value: '12345678901236' },
  ...(withIdentity && { identity: { value: 'identity_12345' } }),
})

describe('Branch MC pageview handler works correctly', () => {
  let fetchRequest: IFetchRequest
  let setCookies: ISetCookies
  let fakeEvent: MCEvent

  beforeAll(() => {
    setCookies = {}
    fakeEvent = new Event('pageview', {}) as MCEvent
    fakeEvent.client = {
      ...dummyClient,
      fetch: (url, opts) => {
        fetchRequest = { url, opts }
        return undefined
      },
      set: (key, value, opts) => {
        setCookies[key] = { value: value || '', opts }
        return undefined
      },
    }
    sendPageviewEvent(settings.branchKey)(fakeEvent)
  })

  it('creates the Branch pageview request correctly', async () => {
    testFetchOptions(fetchRequest, 'https://api2.branch.io/v1/pageview')

    const body = new URLSearchParams(fetchRequest.opts?.body)
    const metadata = JSON.parse(body.get('metadata') || '')

    testGenericRequestBodyParams(body)
    expect(body.get('source')).toEqual('web-sdk')
    expect(body.get('feature')).toEqual('journeys')
    expect(body.get('event')).toEqual('pageview')
    expect(body.get('initial_referrer')).toEqual(fakeEvent.client.referer)
    expect(body.get('user_language')).toEqual('en')
    expect(metadata.url).toEqual(fakeEvent.client.url.href)
    expect(metadata.user_agent).toEqual(fakeEvent.client.userAgent)
    expect(metadata.language).toEqual(fakeEvent.client.language)
    expect(metadata.screen_width).toEqual(fakeEvent.client.screenWidth)
    expect(metadata.screen_height).toEqual(fakeEvent.client.screenHeight)
    expect(metadata.title).toEqual(fakeEvent.client.title)
  })

  it('sets the cookies correctly', () => {
    const identity_id = setCookies.identity_id
    const browser_fingerprint_id = setCookies.browser_fingerprint_id
    const session_id = setCookies.session_id

    expect(identity_id).toBeTruthy()
    expect(identity_id.value).toMatch(branchNumberPattern)
    expect(browser_fingerprint_id).toBeTruthy()
    expect(browser_fingerprint_id.value).toMatch(branchNumberPattern)
    expect(session_id).toBeTruthy()
    expect(session_id.value).toMatch(branchNumberPattern)
    expect(session_id.opts?.scope).toEqual('session')
  })
})

describe('Branch MC identify handler works correctly', () => {
  let fetchRequest: IFetchRequest
  let setCookies: ISetCookies
  let fakeEvent: MCEvent

  beforeAll(() => {
    setCookies = makeSetCookies(false)
    fakeEvent = new Event('identify', {}) as MCEvent
    fakeEvent.payload = { identity: 'identity_12345' }
    fakeEvent.client = {
      ...dummyClient,
      fetch: (url, opts) => {
        fetchRequest = { url, opts }
        return undefined
      },
      get: key => setCookies[key]?.value,
      set: (key, value, opts) => {
        setCookies[key] = { value: value || '', opts }
        return undefined
      },
    }

    sendIdentifyEvent(settings.branchKey)(fakeEvent)
  })

  it('creates the Branch identify request correctly', async () => {
    testFetchOptions(fetchRequest, 'https://api2.branch.io/v1/profile')

    const body = new URLSearchParams(fetchRequest.opts?.body)
    testGenericRequestBodyParams(body, fakeEvent.payload.identity)
  })

  it('sets the cookies correctly', () => {
    const identity = setCookies.identity
    expect(identity).toBeTruthy()
    expect(identity.value).toEqual(fakeEvent.payload.identity)

    testUnchangedCookies(setCookies)
  })
})

describe('Branch MC logout handler works correctly', () => {
  let fetchRequest: IFetchRequest
  let setCookies: ISetCookies
  let fakeEvent: MCEvent

  beforeAll(() => {
    setCookies = makeSetCookies()
    fakeEvent = new Event('logout', {}) as MCEvent
    fakeEvent.client = {
      ...dummyClient,
      fetch: (url, opts) => {
        fetchRequest = { url, opts }
        return undefined
      },
      get: key => setCookies[key]?.value,
      set: (key, value, opts) => {
        setCookies[key] = { value: value || '', opts }
        return undefined
      },
    }

    sendLogoutEvent(settings.branchKey)(fakeEvent)
  })

  it('creates the Branch identify request correctly', async () => {
    testFetchOptions(fetchRequest, 'https://api2.branch.io/v1/logout')

    const body = new URLSearchParams(fetchRequest.opts?.body)
    testGenericRequestBodyParams(body)
  })

  it('sets the cookies correctly', () => {
    const identity = setCookies.identity
    expect(identity).toBeTruthy()
    expect(identity.value).toEqual('')

    testUnchangedCookies(setCookies)
  })
})

describe('Branch MC lifecycle_event handler works correctly', () => {
  let fetchRequest: IFetchRequest
  let setCookies: ISetCookies
  let fakeEvent: MCEvent

  beforeAll(() => {
    setCookies = makeSetCookies()
    fakeEvent = new Event('lifecycle_event', {}) as MCEvent
    fakeEvent.payload = {
      lifecycle_event_name: 'some_name',
      transaction_id: 'some_transaction_id',
      description: 'some_description',
      someField: 'some_value',
    }
    fakeEvent.client = {
      ...dummyClient,
      fetch: (url, opts) => {
        fetchRequest = { url, opts }
        return undefined
      },
      get: key => setCookies[key]?.value,
      set: (key, value, opts) => {
        setCookies[key] = { value: value || '', opts }
        return undefined
      },
    }

    sendLifecycleEvent(settings.branchKey)(fakeEvent)
  })

  it('creates the Branch lifecycle_event request correctly', async () => {
    testFetchOptions(fetchRequest, 'https://api2.branch.io/v2/event/standard')

    const body = new URLSearchParams(fetchRequest.opts?.body)
    const user_data = JSON.parse(body.get('user_data') || '')
    const custom_data = JSON.parse(body.get('custom_data') || '')
    const event_data = JSON.parse(body.get('event_data') || '')

    testUserData(user_data, '12345678901235', 'identity_12345')
    expect(body.get('name')).toEqual(fakeEvent.payload.lifecycle_event_name)
    expect(custom_data.someField).toEqual(fakeEvent.payload.someField)
    expect(event_data.transaction_id).toEqual(fakeEvent.payload.transaction_id)
    expect(event_data.description).toEqual(fakeEvent.payload.description)
  })

  it('sets the cookies correctly', () => {
    const identity = setCookies.identity
    expect(identity).toBeTruthy()
    expect(identity.value).toEqual('identity_12345')

    testUnchangedCookies(setCookies)
  })
})

describe('Branch MC custom_event handler works correctly', () => {
  let fetchRequest: IFetchRequest
  let setCookies: ISetCookies
  let fakeEvent: MCEvent

  beforeAll(() => {
    setCookies = makeSetCookies()
    fakeEvent = new Event('custom_event', {}) as MCEvent
    fakeEvent.payload = {
      custom_event_name: 'some_name',
      someField: 'some_value',
    }
    fakeEvent.client = {
      ...dummyClient,
      fetch: (url, opts) => {
        fetchRequest = { url, opts }
        return undefined
      },
      get: key => setCookies[key]?.value,
      set: (key, value, opts) => {
        setCookies[key] = { value: value || '', opts }
        return undefined
      },
    }

    sendCustomEvent(settings.branchKey)(fakeEvent)
  })

  it('creates the Branch custom_event request correctly', async () => {
    testFetchOptions(fetchRequest, 'https://api2.branch.io/v2/event/custom')

    const body = new URLSearchParams(fetchRequest.opts?.body)
    const user_data = JSON.parse(body.get('user_data') || '')
    const custom_data = JSON.parse(body.get('custom_data') || '')

    testUserData(user_data, '12345678901235', 'identity_12345')
    expect(body.get('name')).toEqual(fakeEvent.payload.custom_event_name)
    expect(custom_data.someField).toEqual(fakeEvent.payload.someField)
  })

  it('sets the cookies correctly', () => {
    const identity = setCookies.identity
    expect(identity).toBeTruthy()
    expect(identity.value).toEqual('identity_12345')

    testUnchangedCookies(setCookies)
  })
})

describe('Branch MC ecommerce handler works correctly', () => {
  let fetchRequest: IFetchRequest
  let setCookies: ISetCookies
  let fakeEvent: MCEvent

  beforeAll(() => {
    setCookies = makeSetCookies()
    fakeEvent = new Event('ecommerce', {}) as MCEvent
    fakeEvent.payload = {
      ecommerce: {
        order_id: '817286897056801',
        affiliation: 'affiliate.com',
        total: 30.0,
        revenue: 25.0,
        products: [
          {
            product_id: '999666321',
            sku: '8251511',
            name: 'Boy’s shorts',
            price: 10,
            quantity: 2,
            category: 'shorts',
          },
        ],
      },
      name: 'Product Added',
    }
    fakeEvent.client = {
      ...dummyClient,
      fetch: (url, opts) => {
        fetchRequest = { url, opts }
        return undefined
      },
      get: key => setCookies[key]?.value,
      set: (key, value, opts) => {
        setCookies[key] = { value: value || '', opts }
        return undefined
      },
    }

    sendEcommerceEvent(settings.branchKey)(fakeEvent)
  })

  it('creates the Branch ecommerce request correctly', async () => {
    testFetchOptions(fetchRequest, 'https://api2.branch.io/v2/event/standard')

    const body = new URLSearchParams(fetchRequest.opts?.body)
    const user_data = JSON.parse(body.get('user_data') || '')
    const event_data = JSON.parse(body.get('event_data') || '')
    const custom_data = JSON.parse(body.get('custom_data') || '')
    const content_items = JSON.parse(body.get('content_items') || '')

    expect(body.get('name')).toEqual('ADD_TO_CART')
    testUserData(user_data, '12345678901235', 'identity_12345')
    expect(event_data.transaction_id).toEqual(
      fakeEvent.payload.ecommerce.order_id
    )
    expect(event_data.affiliation).toEqual(
      fakeEvent.payload.ecommerce.affiliation
    )
    expect(event_data.revenue).toEqual(fakeEvent.payload.ecommerce.revenue)
    expect(custom_data.total).toEqual(fakeEvent.payload.ecommerce.total)
    expect(content_items).toHaveLength(1)
    expect(content_items[0]?.$sku).toEqual(
      fakeEvent.payload.ecommerce.products[0].sku
    )
    expect(content_items[0]?.$product_name).toEqual(
      fakeEvent.payload.ecommerce.products[0].name
    )
    expect(content_items[0]?.$price).toEqual(
      fakeEvent.payload.ecommerce.products[0].price
    )
    expect(content_items[0]?.$quantity).toEqual(
      fakeEvent.payload.ecommerce.products[0].quantity
    )
    expect(content_items[0]?.$product_category).toBeUndefined()
    expect(content_items[0]?.product_id).toBeUndefined()
  })

  it('sets the cookies correctly', () => {
    const identity = setCookies.identity
    expect(identity).toBeTruthy()
    expect(identity.value).toEqual('identity_12345')

    testUnchangedCookies(setCookies)
  })
})
