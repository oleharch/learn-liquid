import type { PresetId } from '@/content/types'

/**
 * Мок-дані магазину «Liquid Lab». Форма повторює справжні обʼєкти Shopify:
 * гроші — У КОПІЙКАХ (центах), як і в Shopify (`price: 129900` = 1 299,00 ₴),
 * handle — слаг, available — булеве, tags — масив рядків.
 *
 * Це звичайні JSON-обʼєкти, а не Drop-и Shopify: лінивих властивостей і
 * звернення за handle (`collections['sale']`) тут немає, крім того, що
 * явно покладено в дані.
 */

const image = (name: string, w = 1200, h = 1200) => ({
  src: `//liquid-lab.myshopify.com/cdn/shop/files/${name}.jpg`,
  alt: name.replace(/-/g, ' '),
  width: w,
  height: h,
  aspect_ratio: +(w / h).toFixed(2),
})

const variant = (
  id: number,
  title: string,
  price: number,
  o: { available?: boolean; compare?: number | null; sku?: string; qty?: number; options?: string[]; volumeMl?: number } = {},
) => ({
  id,
  title,
  price,
  compare_at_price: o.compare ?? null,
  available: o.available ?? true,
  sku: o.sku ?? `LL-${id}`,
  inventory_quantity: o.qty ?? 12,
  option1: o.options?.[0] ?? title,
  option2: o.options?.[1] ?? null,
  options: o.options ?? [title],
  weight: 250,
  // Метаполя є і на варіанті — власна фасовка й штрихкод живуть саме тут.
  metafields: { custom: { volume_ml: mf(o.volumeMl ?? 400, 'number_integer') } },
})

/**
 * Метаполе Shopify — це ОБʼЄКТ, а не готове значення: `value`, `type` і `list?`.
 * Саме тому в темах пишуть `.value` — і саме тому пресети тримають цю форму,
 * а не пласкі значення: інакше сайт учив би звички, яка на проді не працює.
 * Виняток — застарілі типи `string`, `integer`, `json_string`: вони справді
 * віддають значення напряму (див. `legacy` нижче).
 */
const mf = (value: unknown, type: string) => ({ value, type, 'list?': type.startsWith('list.') })

/** Посилання на товар усередині `list.product_reference` — скорочений товар. */
const ref = (id: number, title: string, handle: string, price: number) => ({
  id,
  title,
  handle,
  price,
  url: `/products/${handle}`,
  featured_image: image(handle),
})

const keratinShampoo = {
  id: 1001,
  title: 'Шампунь із кератином',
  handle: 'keratin-shampoo',
  vendor: 'Cocochoco',
  type: 'Шампунь',
  description: '<p>Мʼякий <strong>безсульфатний</strong> шампунь для волосся після реконструкції.</p>',
  price: 64900,
  price_min: 64900,
  price_max: 119900,
  price_varies: true,
  compare_at_price: 79900,
  compare_at_price_max: 139900,
  available: true,
  tags: ['догляд', 'кератин', 'хіт', 'безсульфатний'],
  options: ['Обʼєм'],
  options_with_values: [{ name: 'Обʼєм', position: 1, values: ['250 мл', '400 мл', '1000 мл'] }],
  featured_image: image('keratin-shampoo'),
  images: [image('keratin-shampoo'), image('keratin-shampoo-back'), image('keratin-shampoo-texture', 1600, 900)],
  variants: [
    variant(11, '250 мл', 64900, { compare: 79900, qty: 8, volumeMl: 250 }),
    variant(12, '400 мл', 89900, { compare: 99900, qty: 3, volumeMl: 400 }),
    variant(13, '1000 мл', 119900, { available: false, qty: 0, volumeMl: 1000 }),
  ],
  url: '/products/keratin-shampoo',
  created_at: '2026-03-14T10:00:00+02:00',
  published_at: '2026-03-20T09:30:00+02:00',
  metafields: {
    custom: {
      volume_note: mf('Вистачає на 2–3 місяці', 'single_line_text_field'),
      ph: mf(5.5, 'number_decimal'),
      is_professional: mf(false, 'boolean'),
      sulfate_free: mf(true, 'boolean'),
      how_to_use: mf('Нанести на вологе волосся.\nСпінити й лишити на 2 хвилини.\nЗмити теплою водою.', 'multi_line_text_field'),
      ingredients: mf(['Кератин', 'Гідролізований шовк', 'Пантенол', 'Олія арганії'], 'list.single_line_text_field'),
      pickup: mf(['Печерськ', 'Лівобережна'], 'list.single_line_text_field'),
      lab: mf({ tested_at: '2026-03-14', ph: 5.5, batch: 'LL-2403' }, 'json'),
      // Ключ, що збігається з іменем фільтра: діставати його треба дужками.
      size: mf('400 мл', 'single_line_text_field'),
      similar: mf([ref(1002, 'Маска глибокого відновлення', 'deep-repair-mask', 84900), ref(1004, 'Олійка для кінчиків', 'ends-oil', 39900)], 'list.product_reference'),
      brand: mf({ title: 'Cocochoco', country: 'Ізраїль' }, 'metaobject_reference'),
    },
    // Застарілі типи (`string`, `integer`, `json_string`) віддають значення напряму — без `.value`.
    legacy: { old_note: 'Заведено ще до типізованих метаполів' },
  },
}
const selectedVariant = keratinShampoo.variants[0]

const products = [
  keratinShampoo,
  {
    id: 1002,
    title: 'Маска глибокого відновлення',
    handle: 'deep-repair-mask',
    vendor: 'Inoar',
    type: 'Маска',
    description: '<p>Інтенсивна маска для пористого волосся.</p>',
    price: 84900,
    price_min: 84900,
    price_max: 84900,
    price_varies: false,
    compare_at_price: null,
    available: true,
    tags: ['догляд', 'відновлення'],
    options: ['Title'],
    featured_image: image('deep-repair-mask'),
    images: [image('deep-repair-mask')],
    variants: [variant(21, 'Default Title', 84900, { qty: 20 })],
    url: '/products/deep-repair-mask',
    created_at: '2026-01-08T12:00:00+02:00',
    published_at: '2026-01-10T12:00:00+02:00',
    metafields: {
      custom: {
        volume_note: mf('Курс — 6 застосувань', 'single_line_text_field'),
        ph: mf(4.5, 'number_decimal'),
        is_professional: mf(true, 'boolean'),
        ingredients: mf(['Кератин', 'Масло ши'], 'list.single_line_text_field'),
      },
    },
  },
  {
    id: 1003,
    title: 'Термозахисний спрей',
    handle: 'heat-protect-spray',
    vendor: 'Erayba',
    type: 'Спрей',
    description: '<p>Захист до 230 °C.</p>',
    price: 52000,
    price_min: 52000,
    price_max: 52000,
    price_varies: false,
    compare_at_price: 65000,
    available: false,
    tags: ['стайлінг', 'термозахист'],
    options: ['Title'],
    featured_image: image('heat-protect-spray'),
    images: [image('heat-protect-spray')],
    variants: [variant(31, 'Default Title', 52000, { available: false, compare: 65000, qty: 0 })],
    url: '/products/heat-protect-spray',
    created_at: '2025-11-02T12:00:00+02:00',
    published_at: '2025-11-05T12:00:00+02:00',
    metafields: { custom: {} },
  },
  {
    id: 1004,
    title: 'Олійка для кінчиків',
    handle: 'ends-oil',
    vendor: 'Inoar',
    type: 'Олійка',
    description: '<p>Легка олійка без обтяження.</p>',
    price: 39900,
    price_min: 39900,
    price_max: 39900,
    price_varies: false,
    compare_at_price: null,
    available: true,
    tags: ['догляд', 'хіт'],
    options: ['Title'],
    featured_image: image('ends-oil'),
    images: [image('ends-oil')],
    variants: [variant(41, 'Default Title', 39900, { qty: 40 })],
    url: '/products/ends-oil',
    created_at: '2026-05-21T12:00:00+03:00',
    published_at: '2026-05-22T12:00:00+03:00',
    metafields: { custom: {} },
  },
  {
    id: 1005,
    title: 'Кондиціонер щоденний',
    handle: 'daily-conditioner',
    vendor: 'Cocochoco',
    type: 'Кондиціонер',
    description: '<p>Для щоденного використання.</p>',
    price: 58000,
    price_min: 58000,
    price_max: 58000,
    price_varies: false,
    compare_at_price: null,
    available: true,
    tags: ['догляд'],
    options: ['Title'],
    featured_image: null,
    images: [],
    variants: [variant(51, 'Default Title', 58000, { qty: 5 })],
    url: '/products/daily-conditioner',
    created_at: '2026-06-30T12:00:00+03:00',
    published_at: '2026-07-01T12:00:00+03:00',
    metafields: { custom: {} },
  },
]

const collection = {
  id: 501,
  title: 'Домашній догляд',
  handle: 'home-care',
  description: '<p>Усе, щоб результат процедури тримався довше.</p>',
  products,
  products_count: products.length,
  all_products_count: products.length,
  all_tags: ['безсульфатний', 'відновлення', 'догляд', 'кератин', 'стайлінг', 'термозахист', 'хіт'],
  all_vendors: ['Cocochoco', 'Erayba', 'Inoar'],
  all_types: ['Кондиціонер', 'Маска', 'Олійка', 'Спрей', 'Шампунь'],
  sort_by: 'best-selling',
  default_sort_by: 'best-selling',
  url: '/collections/home-care',
  image: image('home-care-cover', 1600, 900),
  metafields: {
    custom: {
      banner_text: mf('Догляд, який тримає результат процедури', 'single_line_text_field'),
      show_filters: mf(true, 'boolean'),
    },
  },
}

const lineItem = (p: (typeof products)[number], v: ReturnType<typeof variant>, quantity: number, discount = 0) => ({
  id: v.id,
  key: `${v.id}:abc${v.id}`,
  title: v.title === 'Default Title' ? p.title : `${p.title} - ${v.title}`,
  product_title: p.title,
  variant_title: v.title === 'Default Title' ? null : v.title,
  quantity,
  price: v.price,
  original_price: v.price,
  final_price: v.price - discount,
  line_price: v.price * quantity,
  original_line_price: v.price * quantity,
  final_line_price: (v.price - discount) * quantity,
  total_discount: discount * quantity,
  sku: v.sku,
  vendor: p.vendor,
  url: `${p.url}?variant=${v.id}`,
  image: p.featured_image,
  product: p,
  variant: v,
  properties: {},
  requires_shipping: true,
})

const cartItems = [
  lineItem(products[0], products[0].variants[1], 2),
  lineItem(products[1], products[1].variants[0], 1, 8490),
  lineItem(products[3], products[3].variants[0], 3),
]

const cart = {
  items: cartItems,
  item_count: cartItems.reduce((n, i) => n + i.quantity, 0),
  total_price: cartItems.reduce((n, i) => n + i.final_line_price, 0),
  original_total_price: cartItems.reduce((n, i) => n + i.original_line_price, 0),
  total_discount: cartItems.reduce((n, i) => n + i.total_discount, 0),
  items_subtotal_price: cartItems.reduce((n, i) => n + i.final_line_price, 0),
  note: '',
  attributes: {},
  currency: { iso_code: 'UAH', symbol: '₴', name: 'Ukrainian Hryvnia' },
  requires_shipping: true,
  total_weight: 1500,
}

const shop = {
  name: 'Liquid Lab',
  url: 'https://liquid-lab.myshopify.com',
  domain: 'liquid-lab.myshopify.com',
  permanent_domain: 'liquid-lab.myshopify.com',
  email: 'hello@liquid-lab.example',
  description: 'Навчальний магазин засобів для волосся',
  currency: 'UAH',
  money_format: '{{amount}} ₴',
  money_with_currency_format: '{{amount}} ₴ UAH',
  enabled_currencies: [{ iso_code: 'UAH', symbol: '₴' }],
  products_count: products.length,
  collections_count: 3,
  locale: 'uk',
  published_locales: [{ iso_code: 'uk', name: 'Українська', primary: true }, { iso_code: 'en', name: 'English', primary: false }],
  metafields: { custom: { delivery_note: mf('Відправляємо щодня до 14:00', 'single_line_text_field') } },
}

const customer = {
  id: 9001,
  first_name: 'Софія',
  last_name: 'Коваленко',
  name: 'Софія Коваленко',
  email: 'sofia@example.com',
  phone: '+380671112233',
  accepts_marketing: true,
  orders_count: 4,
  total_spent: 428600,
  tags: ['vip', 'wholesale'],
  has_account: true,
  default_address: { city: 'Київ', country: 'Україна', zip: '01001', address1: 'вул. Хрещатик, 1' },
  metafields: {
    custom: {
      hair_type: mf('Пористе, після освітлення', 'single_line_text_field'),
      birthday: mf('1998-07-12', 'date'),
      loyalty_points: mf(340, 'number_integer'),
    },
  },
  orders: [
    { name: '#1042', order_number: 1042, total_price: 214800, created_at: '2026-08-02T14:20:00+03:00', financial_status: 'paid', fulfillment_status: 'fulfilled' },
    { name: '#1017', order_number: 1017, total_price: 84900, created_at: '2026-05-19T11:05:00+03:00', financial_status: 'paid', fulfillment_status: null },
  ],
}

const article = (id: number, title: string, handle: string, date: string, tags: string[], excerpt: string) => ({
  id,
  title,
  handle,
  author: 'Ірина',
  tags,
  excerpt,
  content: `<p>${excerpt}</p><p>Далі — повний текст статті про догляд.</p>`,
  published_at: date,
  created_at: date,
  url: `/blogs/journal/${handle}`,
  comments_count: id % 4,
  image: image(handle, 1600, 900),
  metafields: { custom: { reading_time: mf(3 + id, 'number_integer') } },
})

const blog = {
  id: 301,
  title: 'Журнал',
  handle: 'journal',
  url: '/blogs/journal',
  articles_count: 3,
  all_tags: ['догляд', 'кератин', 'поради'],
  articles: [
    article(1, 'Скільки тримається кератин', 'how-long-keratin-lasts', '2026-09-01T09:00:00+03:00', ['кератин'], 'Від 3 до 6 місяців — і ось від чого це залежить.'),
    article(2, 'Догляд після процедури', 'aftercare', '2026-08-12T09:00:00+03:00', ['догляд', 'поради'], 'Перші 72 години вирішують усе.'),
    article(3, 'Як обрати шампунь', 'choosing-shampoo', '2026-07-03T09:00:00+03:00', ['догляд'], 'Читаємо склад разом.'),
  ],
}

/**
 * Метаобʼєкт — ВЛАСНИЙ обʼєкт магазину (бренд, FAQ, склад), а не поле на чужому.
 * Службові дані лежать окремо в `system`, щоб не побитись з полями автора,
 * а самі поля — такі самі метаполя, тож їх теж читають через `.value`.
 */
const metaobject = (type: string, handle: string, fields: Record<string, unknown>) => ({
  system: { type, handle, id: `gid://shopify/Metaobject/${handle}`, url: `/pages/${handle}` },
  ...fields,
})

const metaobjects = {
  brand: {
    cocochoco: metaobject('brand', 'cocochoco', {
      title: mf('Cocochoco', 'single_line_text_field'),
      country: mf('Ізраїль', 'single_line_text_field'),
      logo: mf(image('brand-cocochoco', 400, 200), 'file_reference'),
    }),
    inoar: metaobject('brand', 'inoar', {
      title: mf('Inoar', 'single_line_text_field'),
      country: mf('Бразилія', 'single_line_text_field'),
      logo: mf(image('brand-inoar', 400, 200), 'file_reference'),
    }),
  },
  faq: {
    'how-long': metaobject('faq', 'how-long', {
      question: mf('Скільки тримається кератин?', 'single_line_text_field'),
      answer: mf('Від 3 до 6 місяців — залежить від догляду.', 'multi_line_text_field'),
    }),
  },
}

const globals = {
  shop,
  metaobjects,
  routes: {
    root_url: '/',
    cart_url: '/cart',
    cart_add_url: '/cart/add',
    cart_change_url: '/cart/change',
    account_url: '/account',
    account_login_url: '/account/login',
    search_url: '/search',
    all_products_collection_url: '/collections/all',
    collections_url: '/collections',
  },
  request: { locale: { iso_code: 'uk', name: 'Українська' }, path: '/', host: 'liquid-lab.myshopify.com', page_type: 'index', design_mode: false },
  template: { name: 'index', suffix: null, directory: null },
  page_title: 'Liquid Lab',
  canonical_url: 'https://liquid-lab.myshopify.com/',
  settings: { colors_accent: '#0e8f8b', show_vendor: true, products_per_row: 3, logo_width: 120 },
  linklists: {
    'main-menu': {
      title: 'Головне меню',
      handle: 'main-menu',
      links: [
        { title: 'Головна', url: '/', active: true, links: [] },
        { title: 'Каталог', url: '/collections/all', active: false, links: [{ title: 'Догляд', url: '/collections/home-care', active: false, links: [] }] },
        { title: 'Журнал', url: '/blogs/journal', active: false, links: [] },
      ],
    },
  },
}

export const PRESETS: Record<PresetId, Record<string, unknown>> = {
  shop: globals,
  product: { ...globals, product: { ...keratinShampoo, selected_or_first_available_variant: selectedVariant, selected_variant: null, first_available_variant: selectedVariant }, template: { name: 'product', suffix: null } },
  collection: { ...globals, collection, template: { name: 'collection', suffix: null } },
  cart: { ...globals, cart, template: { name: 'cart', suffix: null } },
  customer: { ...globals, customer },
  blog: { ...globals, blog, article: blog.articles[0], template: { name: 'blog', suffix: null } },
  all: {
    ...globals,
    product: { ...keratinShampoo, selected_or_first_available_variant: selectedVariant, selected_variant: null, first_available_variant: selectedVariant },
    collection,
    collections: { 'home-care': collection, all: { ...collection, title: 'Усі товари', handle: 'all' } },
    all_products: Object.fromEntries(products.map((p) => [p.handle, p])),
    cart,
    customer,
    blog,
    blogs: { journal: blog },
    article: blog.articles[0],
  },
}

export const PRESET_LABELS: Record<PresetId, string> = {
  shop: 'Магазин (shop, routes, settings)',
  product: 'Сторінка товару',
  collection: 'Колекція з 5 товарів',
  cart: 'Кошик із 3 позицій',
  customer: 'Клієнтка із замовленнями',
  blog: 'Блог і стаття',
  all: 'Усе разом',
}

export function presetData(id?: PresetId): Record<string, unknown> {
  return id ? structuredClone(PRESETS[id]) : {}
}
