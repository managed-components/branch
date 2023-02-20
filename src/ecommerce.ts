import { isValue, getValidatedValue } from './utils'

export const EVENTS_MAP: {
  [k: string]: { name: string; category: 'commerce' | 'content' }
} = {
  'Product Added': {
    name: 'ADD_TO_CART',
    category: 'commerce',
  },
  'Product Added to Wishlist': {
    name: 'ADD_TO_WISHLIST',
    category: 'commerce',
  },
  'Cart Viewed': {
    name: 'VIEW_CART',
    category: 'commerce',
  },
  'Checkout Started': {
    name: 'INITIATE_PURCHASE',
    category: 'commerce',
  },
  'Payment Info Entered': {
    name: 'ADD_PAYMENT_INFO',
    category: 'commerce',
  },
  'Clicked Promotion': {
    name: 'CLICK_AD',
    category: 'commerce',
  },
  'Viewed Promotion': {
    name: 'VIEW_AD',
    category: 'commerce',
  },
  'Product List Viewed': {
    name: 'VIEW_ITEMS',
    category: 'commerce',
  },
  'Product Viewed': {
    name: 'VIEW_ITEM',
    category: 'content',
  },
  'Products Searched': {
    name: 'SEARCH',
    category: 'content',
  },
}

export interface IParams {
  [k: string]: {
    name: string
    type: ('string' | 'number' | 'boolean' | 'object')[]
    validation?: string[] | { isPositive?: boolean; isDate?: boolean }
  }
}

const PARAMS_MAP: IParams = {
  order_id: { name: 'transaction_id', type: ['string', 'number'] },
  transaction_id: { name: 'transaction_id', type: ['string', 'number'] },
  affiliation: { name: 'affiliation', type: ['string'] },
  revenue: { name: 'revenue', type: ['number'] },
  shipping: { name: 'shipping', type: ['number'] },
  tax: { name: 'tax', type: ['number'], validation: { isPositive: true } },
  coupon: { name: 'coupon', type: ['string'] },
  currency: { name: 'currency', type: ['string'] },
  description: { name: 'description', type: ['string'] },
  search_query: { name: 'search_query', type: ['string'] },
}

const PRODUCT_CATEGORIES_LIST = [
  'ANIMALS_AND_PET_SUPPLIES',
  'APPAREL_AND_ACCESSORIES',
  'ARTS_AND_ENTERTAINMENT',
  'BABY_AND_TODDLER',
  'BUSINESS_AND_INDUSTRIAL',
  'CAMERAS_AND_OPTICS',
  'ELECTRONICS',
  'FOOD_BEVERAGES_AND_TOBACCO',
  'FURNITURE',
  'HARDWARE',
  'HEALTH_AND_BEAUTY',
  'HOME_AND_GARDEN',
  'LUGGAGE_AND_BAGS',
  'MATURE',
  'MEDIA',
  'OFFICE_SUPPLIES',
  'RELIGIOUS_AND_CEREMONIAL',
  'SOFTWARE',
  'SPORTING_GOODS',
  'TOYS_AND_GAMES',
  'VEHICLES_AND_PARTS',
]

const CONTENT_SCHEMA_LIST = [
  'COMMERCE_AUCTION',
  'COMMERCE_BUSINESS',
  'COMMERCE_OTHER',
  'COMMERCE_PRODUCT',
  'COMMERCE_RESTAURANT',
  'COMMERCE_SERVICE',
  'COMMERCE_TRAVEL_FLIGHT',
  'COMMERCE_TRAVEL_HOTEL',
  'COMMERCE_TRAVEL_OTHER',
  'GAME_STATE',
  'MEDIA_IMAGE',
  'MEDIA_MIXED',
  'MEDIA_MUSIC',
  'MEDIA_OTHER',
  'MEDIA_VIDEO',
  'OTHER',
  'TEXT_ARTICLE',
  'TEXT_BLOG',
  'TEXT_OTHER',
  'TEXT_RECIPE',
  'TEXT_REVIEW',
  'TEXT_SEARCH_RESULTS',
  'TEXT_STORY',
  'TEXT_TECHNICAL_DOC',
]

const PRODUCT_PARAMS_MAP: IParams = {
  sku: { name: '$sku', type: ['string', 'number'] },
  category: {
    name: '$product_category',
    type: ['string'],
    validation: PRODUCT_CATEGORIES_LIST,
  },
  brand: { name: '$product_brand', type: ['string'] },
  name: { name: '$product_name', type: ['string'] },
  variant: { name: '$product_variant', type: ['string'] },
  price: { name: '$price', type: ['string', 'number'] },
  quantity: {
    name: '$quantity',
    type: ['string', 'number'],
    validation: { isPositive: true },
  },
  $content_schema: {
    name: '$content_schema',
    type: ['string'],
    validation: CONTENT_SCHEMA_LIST,
  },
  $og_title: { name: '$og_title', type: ['string'] },
  $og_description: { name: '$og_description', type: ['string'] },
  $og_image_url: { name: '$og_image_url', type: ['string'] },
  $canonical_identifier: { name: '$canonical_identifier', type: ['string'] },
  $publicly_indexable: { name: '$publicly_indexable', type: ['boolean'] },
  $locally_indexable: { name: '$locally_indexable', type: ['boolean'] },
  $price: { name: '$price', type: ['string', 'number'] },
  $quantity: {
    name: '$quantity',
    type: ['number'],
    validation: { isPositive: true },
  },
  $sku: { name: '$sku', type: ['string', 'number'] },
  $product_name: { name: '$product_name', type: ['string'] },
  $product_brand: { name: '$product_brand', type: ['string'] },
  $product_category: {
    name: '$product_category',
    type: ['string'],
    validation: PRODUCT_CATEGORIES_LIST,
  },
  $product_variant: { name: '$product_variant', type: ['string'] },
  $rating_average: { name: '$rating_average', type: ['string', 'number'] },
  $rating_count: {
    name: '$rating_count',
    type: ['number'],
    validation: { isPositive: true },
  },
  $rating_max: { name: '$rating_max', type: ['string', 'number'] },
  $creation_timestamp: {
    name: '$creation_timestamp',
    type: ['number'],
    validation: { isDate: true },
  },
  $exp_date: {
    name: '$exp_date',
    type: ['number'],
    validation: { isDate: true },
  },
  $keywords: { name: '$keywords', type: ['string', 'number', 'object'] },
  $address_street: { name: '$address_street', type: ['string'] },
  $address_city: { name: '$address_city', type: ['string'] },
  $address_region: { name: '$address_region', type: ['string'] },
  $address_country: { name: '$address_country', type: ['string'] },
  $address_postal_code: { name: '$address_postal_code', type: ['string'] },
  $latitude: { name: '$latitude', type: ['number'] },
  $longitude: { name: '$longitude', type: ['number'] },
  $image_captions: {
    name: '$image_captions',
    type: ['string', 'number', 'object'],
  },
  $condition: { name: '$condition', type: ['string'] },
  $custom_fields: {
    name: '$custom_fields',
    type: ['string', 'number', 'object'],
  },
}

const getValidatedEcommerceFields = (
  obj: { [k: string]: unknown },
  validationMap: IParams
) => {
  return Object.fromEntries(
    Object.entries(obj)
      .filter(([key, value]) => isValue(value) && validationMap[key])
      .map(([key, value]) => [
        validationMap[key].name,
        getValidatedValue(value, validationMap[key]),
      ])
  )
}

export const getEcommerceRequestData = (ecommerce: {
  [k: string]: unknown
}) => {
  const {
    products,
    timestamp,
    'zaraz-test-mc__last_page_title': title,
    __zarazEcommerce,
    ...ecommerceFields
  } = ecommerce

  const event_data = JSON.stringify(
    getValidatedEcommerceFields(ecommerceFields, PARAMS_MAP)
  )

  const custom_data = JSON.stringify(
    Object.fromEntries(
      Object.entries(ecommerceFields).filter(
        ([key, value]) => isValue(value) && !PARAMS_MAP[key]
      )
    )
  )

  const content_items = JSON.stringify(
    (Array.isArray(products) ? products : [])
      .filter(product => product && typeof product === 'object')
      .map(product =>
        Object.fromEntries(
          Object.entries(product)
            .filter(([key, value]) => isValue(value) && PRODUCT_PARAMS_MAP[key])
            .map(([key, value]) => [
              PRODUCT_PARAMS_MAP[key].name,
              getValidatedValue(value, PRODUCT_PARAMS_MAP[key]),
            ])
        )
      ) || []
  )

  return { event_data, custom_data, content_items }
}
