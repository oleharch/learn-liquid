import type { Lesson } from '../types'

/* ───────── дані для завдань: форма повторює обʼєкти Shopify, гроші — в копійках ───────── */

const v = (id: number, title: string, price: number, available = true, compare: number | null = null) => ({
  id,
  title,
  price,
  compare_at_price: compare,
  available,
  sku: `LL-${id}`,
})

interface LineSeed {
  id: number
  title: string
  variant: string | null
  vendor: string
  price: number
  quantity: number
  /** Знижка на одиницю, в копійках. */
  discount?: number
}

const line = (s: LineSeed) => {
  const discount = s.discount ?? 0
  return {
    id: s.id,
    key: `${s.id}:k${s.id}`,
    title: s.variant ? `${s.title} - ${s.variant}` : s.title,
    product_title: s.title,
    variant_title: s.variant,
    vendor: s.vendor,
    quantity: s.quantity,
    original_price: s.price,
    final_price: s.price - discount,
    original_line_price: s.price * s.quantity,
    final_line_price: (s.price - discount) * s.quantity,
    line_level_total_discount: discount * s.quantity,
    url: `/products/item-${s.id}?variant=${s.id}`,
  }
}

const cartOf = (seeds: LineSeed[]) => {
  const items = seeds.map(line)
  const sum = (key: 'final_line_price' | 'original_line_price' | 'line_level_total_discount' | 'quantity') =>
    items.reduce((n, i) => n + i[key], 0)
  return {
    items,
    item_count: sum('quantity'),
    total_price: sum('final_line_price'),
    items_subtotal_price: sum('final_line_price'),
    original_total_price: sum('original_line_price'),
    total_discount: sum('line_level_total_discount'),
    currency: { iso_code: 'UAH', symbol: '₴' },
    note: '',
  }
}

/* ═════════════════════════════ l14 ═════════════════════════════ */

const l14: Lesson = {
  id: 'l14',
  module: 5,
  title: 'Обʼєкти магазину: product, variant, collection, cart',
  goal: 'Читатимеш дані магазину з обʼєктів `product`, `variant`, `collection` і `cart`: ціну в копійках, наявність, знижку, line items — і пояснюватимеш, який обʼєкт де доступний.',
  minutes: 40,
  blocks: [
    {
      type: 'p',
      text: 'Досі ти працював із даними, які сам поклав у шаблон. У темі Shopify даних ніхто не «завантажує»: платформа сама кладе в шаблон готові **обʼєкти** — product, collection, cart, shop. Твоя робота — знати, як вони влаштовані, і читати з них потрібне. Саме про це питають найчастіше: мова проста, а от модель даних Shopify треба знати напамʼять.',
    },
    { type: 'h', text: 'Глобальні обʼєкти проти сторінкових' },
    {
      type: 'p',
      text: '**Глобальні** обʼєкти доступні в будь-якому файлі теми: `shop`, `cart`, `customer`, `routes`, `settings`, `request`, `template`, `collections`, `all_products`, `linklists`. **Сторінкові** зʼявляються лише у «своєму» шаблоні: `product` — на сторінці товару, `collection` — на сторінці колекції, `article` і `blog` — у блозі. Поза своєю сторінкою такий обʼєкт — `nil`: шаблон не впаде, просто нічого не виведе.',
    },
    {
      type: 'table',
      head: ['Обʼєкт', 'Де доступний', 'Що в ньому'],
      rows: [
        ['`shop`', 'усюди', 'назва, домен, валюта, формат грошей'],
        ['`cart`', 'усюди', 'line items, кількість, суми'],
        ['`customer`', 'усюди, але `nil`, якщо customer не увійшов', 'імʼя, email, замовлення, теги'],
        ['`product`', 'шаблон товару', 'назва, ціни, варіанти, зображення, теги'],
        ['`collection`', 'шаблон колекції', 'назва, products, фільтри, сортування'],
        ['`template`', 'усюди', 'імʼя поточного шаблону — зручно для умов у layout'],
      ],
    },
    {
      type: 'example',
      title: 'Один шаблон — різні обʼєкти',
      preset: 'product',
      template: `Магазин: {{ shop.name }}
Шаблон: {{ template.name }}
Товар: {{ product.title }}
Колекція: [{{ collection.title }}]`,
      note: 'Пресет імітує сторінку товару: `product` є, а `collection` — ні. Порожні квадратні дужки — це `nil`, виведений без жодної помилки. Перемкни пресет на «Колекцію» — і порожнім стане вже `product`.',
    },
    {
      type: 'note',
      tone: 'shopify',
      title: 'Як дістати product НЕ на сторінці товару',
      text: 'Три чесні шляхи: пройтись циклом по `collection.products`, узяти product із налаштування секції типу `product` (продавчиня обирає його в редакторі) або звернутись за handle — `all_products[\'keratin-shampoo\']`. Останній має ліміт: **20 унікальних handle на сторінку**, тож для сіток він не годиться.',
    },
    { type: 'h', text: 'Гроші — завжди в копійках' },
    {
      type: 'example',
      title: 'Сире число проти фільтра money',
      preset: 'product',
      template: `{{ product.price }}
{{ product.price | money }}
{{ product.price | money_with_currency }}`,
      note: 'Усі ціни в Shopify — **integer у найменшій одиниці валюти**: `64900` — це 649 гривень. В integer немає проблем з округленням, тож арифметику роби в копійках, а `money` став **останнім** у ланцюжку. Формат (`{{amount}} ₴`) продавчиня задає в налаштуваннях магазину — шаблон його не знає і знати не повинен. Тому `{{ product.price | divided_by: 100 }} грн` — помилка новачка: копійки губляться, розділювачі тисяч зникають, а зміна формату в адмінці сайт не зачепить.',
    },
    { type: 'h', text: 'product і variant: хто з них має ціну' },
    {
      type: 'p',
      text: 'До cart потрапляє не product, а **варіант**. Навіть у product без опцій є рівно один варіант — `Default Title`. Ціна, артикул, залишок і наявність живуть на варіанті. А `product.price` — це лише **найнижча ціна серед варіантів** (те саме, що `product.price_min`); чи різняться ціни, підкаже `product.price_varies`.',
    },
    {
      type: 'example',
      title: 'Варіанти product і поточний варіант',
      preset: 'product',
      template: `{% for variant in product.variants %}
{{ variant.title }}: {{ variant.price | money }}{% unless variant.available %} — немає в наявності{% endunless %}
{%- endfor %}

Ціна товару: {% if product.price_varies %}від {% endif %}{{ product.price | money }}
Товар доступний: {{ product.available }}

{% assign current = product.selected_or_first_available_variant -%}
Зараз вибрано: {{ current.title }} — {{ current.price | money }} (id {{ current.id }})`,
      note: '`product.available` — `true`, якщо доступний **хоч один** варіант, тож кнопку «Купити» вмикають за `variant.available`. А `selected_or_first_available_variant` повертає варіант з адреси (`?variant=12`); якщо в адресі його немає — перший доступний; якщо недоступні всі — просто перший. Саме з нього беруть ціну й `id` для форми.',
    },
    {
      type: 'note',
      tone: 'interview',
      title: 'Чим product.price відрізняється від variant.price',
      text: 'Хороша відповідь: «`product.price` — мінімальна ціна серед варіантів, вона годиться для картки в сітці, часто з префіксом „від“, якщо `price_varies`. На сторінці товару показую ціну `product.selected_or_first_available_variant`, бо саме цей варіант потрапить у cart. Обидва числа — в копійках, форматую через `money`». Далі зазвичай питають, як ціна оновлюється при перемиканні варіанта: Liquid рендериться на сервері один раз, тож перемикання — це JavaScript або перезавантаження секції через Section Rendering API.',
    },
    { type: 'h', text: 'compare_at_price і бейдж знижки' },
    {
      type: 'example',
      title: 'Стара ціна і відсоток',
      preset: 'product',
      view: 'html',
      template: `{% assign current = product.selected_or_first_available_variant %}
<span class="price">{{ current.price | money }}</span>
{% if current.compare_at_price > current.price %}
  {%- assign saving = current.compare_at_price | minus: current.price %}
  <s>{{ current.compare_at_price | money }}</s>
  <span class="badge">−{{ saving | times: 100 | divided_by: current.compare_at_price }}%</span>
{% endif %}`,
      note: 'Порядок має значення: спершу `times: 100`, потім `divided_by`. Навпаки вийшов би нуль — ціле на більше ціле ділиться націло.',
    },
    {
      type: 'note',
      tone: 'warn',
      title: 'compare_at_price буває nil — і буває меншим за ціну',
      text: 'У product без знижки `compare_at_price` — `nil`. Перевірка `{% if product.compare_at_price %}` пропустить і випадок, коли продавчиня помилково поставила «стару» ціну **нижчою** за чинну, — і бейдж покаже відʼємну знижку. Надійна умова одна: `compare_at_price > price`. Порівняння з `nil` у Liquid просто дає `false`.',
    },
    { type: 'h', text: 'collection.products' },
    {
      type: 'example',
      title: 'Сітка колекції',
      preset: 'collection',
      template: `{{ collection.title }} — товарів: {{ collection.products_count }}
{% for product in collection.products %}
{{ forloop.index }}. {{ product.title }} · {{ product.vendor }} · {{ product.price | money }}
  {%- unless product.available %} · розпродано{% endunless %}
  {%- unless product.featured_image %} · без фото{% endunless %}
{%- endfor %}`,
      note: 'Усередині циклу змінна `product` — звичайна локальна змінна з тим самим набором полів, що й сторінковий обʼєкт. `featured_image` у product без фото — `nil`, і картка мусить це пережити. У справжній темі `for` робить щонайбільше **50 ітерацій**, тож `collection.products` загортають у `{% paginate %}` — це [урок 16](/learn/l16).',
    },
    { type: 'h', text: 'cart: line items і підсумок' },
    {
      type: 'example',
      title: 'Обʼєкт cart',
      preset: 'cart',
      template: `{% for item in cart.items %}
{{ item.product.title }}{% if item.variant.title != 'Default Title' %} ({{ item.variant.title }}){% endif %}: {{ item.quantity }} × {{ item.final_price | money }} = {{ item.final_line_price | money }}
{%- endfor %}

Позицій: {{ cart.items.size }}, одиниць: {{ cart.item_count }}
Знижка: {{ cart.total_discount | money }}
Разом: {{ cart.total_price | money }}`,
      note: 'Line item (`line_item`) — окремий обʼєкт: у ньому є і `item.product`, і `item.variant`, і власні суми. `original_*` — до знижок, `final_*` — після. `cart.total_price` уже враховує знижки.',
    },
    {
      type: 'note',
      tone: 'interview',
      title: 'cart.item_count чи cart.items.size',
      text: 'Питають, щоб перевірити, чи ти розрізняєш **line items** й **одиниці**. `cart.items.size` — кількість line items (різних варіантів), `cart.item_count` — сума `quantity`. На іконці кошика в шапці показують `item_count`. Порожній cart перевіряють як `cart.item_count == 0` або `cart.items == empty`. Бонус до відповіді: `cart` — глобальний обʼєкт, але після додавання до cart через AJAX HTML сам не оновиться — лічильник перемальовує JavaScript.',
    },
  ],
  exercises: [
    {
      id: 'l14-e1',
      title: 'Ціна поточного варіанта',
      task: [
        'На сторінці товару треба показати ціну **того варіанта, який зараз вибрано**, а не мінімальну ціну product.',
        'Виведи `<h1>` із назвою product, `<p class="vendor">` із виробником і `<p class="price">` у форматі `100 мл — 799.00 ₴`: назва поточного варіанта, тире, його ціна через `money`.',
      ],
      preset: 'shop',
      data: {
        product: {
          title: 'Сироватка для кінчиків',
          vendor: 'Inoar',
          price: 45900,
          price_varies: true,
          selected_or_first_available_variant: v(72, '100 мл', 79900),
          variants: [v(71, '50 мл', 45900, false), v(72, '100 мл', 79900)],
        },
      },
      altData: {
        product: {
          title: 'Маска з протеїнами',
          vendor: 'Erayba',
          price: 61000,
          price_varies: true,
          selected_or_first_available_variant: v(81, '250 мл', 61000),
          variants: [v(81, '250 мл', 61000), v(82, '500 мл', 98000)],
        },
      },
      starter: `<h1>{{ product.title }}</h1>
{% comment %} Виробник і ціна ПОТОЧНОГО варіанта {% endcomment %}
<p class="price">{{ product.price }}</p>`,
      solution: `{% assign current = product.selected_or_first_available_variant %}
<h1>{{ product.title }}</h1>
<p class="vendor">{{ product.vendor }}</p>
<p class="price">{{ current.title }} — {{ current.price | money }}</p>`,
      mustUse: [{ pattern: '\\|\\s*money\\b', label: 'Ціну форматує фільтр `money`' }],
      view: 'html',
      hints: [
        'Поточний варіант лежить у `product.selected_or_first_available_variant`. Зручно покласти його в змінну через `assign`.',
        '`product.price` — це мінімальна ціна product (тут — недоступних 50 мл). Тобі потрібна ціна варіанта.',
        '`{{ current.title }} — {{ current.price | money }}`, де `current` — поточний варіант.',
      ],
      explain:
        '`product.price` завжди дорівнює найдешевшому варіанту — навіть якщо він недоступний. На сторінці товару це вводить в оману: людина бачить одну ціну, а до cart потрапляє інша. Тому ціна, `id` для форми й наявність беруться з `selected_or_first_available_variant`.',
    },
    {
      id: 'l14-e2',
      title: 'Список варіантів із наявністю',
      task: [
        'Виведи варіанти product списком `<ul class="variants">`. Кожен варіант — `<li>` із класом `variant`; недоступний отримує ще й клас `variant--sold-out`.',
        'Усередині: назва варіанта, тире, ціна. Для недоступного після ціни додай ` (немає в наявності)`.',
        'Два зразки: `<li class="variant">100 мл — 799.00 ₴</li>` і `<li class="variant variant--sold-out">50 мл — 459.00 ₴ (немає в наявності)</li>`.',
      ],
      preset: 'shop',
      data: {
        product: {
          title: 'Сироватка для кінчиків',
          variants: [v(71, '50 мл', 45900, false), v(72, '100 мл', 79900), v(73, '200 мл', 129900)],
        },
      },
      altData: {
        product: {
          title: 'Маска з протеїнами',
          variants: [v(81, '250 мл', 61000), v(82, '500 мл', 98000, false)],
        },
      },
      starter: `<ul class="variants">
  {% comment %} Цикл по product.variants {% endcomment %}
  <li class="variant">50 мл — 459.00 ₴</li>
</ul>`,
      solution: `<ul class="variants">
{% for variant in product.variants %}
  <li class="variant{% unless variant.available %} variant--sold-out{% endunless %}">{{ variant.title }} — {{ variant.price | money }}{% unless variant.available %} (немає в наявності){% endunless %}</li>
{% endfor %}
</ul>`,
      view: 'html',
      hints: [
        'Цикл — `{% for variant in product.variants %}`. Наявність — булеве поле `variant.available`.',
        'Клас-модифікатор зручно дописувати всередині атрибута: `class="variant{% unless variant.available %} variant--sold-out{% endunless %}"` — пробіл стоїть усередині умови.',
        'Дужки з текстом — така сама умова `unless` одразу після `{{ variant.price | money }}`.',
      ],
      explain:
        'Наявність — властивість **варіанта**. `product.available` тут не допоміг би: він `true`, щойно доступний хоч один варіант. Зверни увагу на прийом із класом: пробіл перед модифікатором живе всередині умови, тож у доступного варіанта не лишається «висячого» пробілу в атрибуті.',
    },
    {
      id: 'l14-e3',
      title: 'Бейдж знижки в сітці колекції',
      task: [
        'Пройдись по `collection.products` і виведи `<ul class="grid">`, де кожен product — `<li>` із трьома елементами, кожен з нового рядка: `<h3>` із назвою, `<p class="price">` із ціною через `money` і — лише для product зі знижкою — `<p class="sale">`.',
        'У `<p class="sale">` — стара ціна в `<s>` і бейдж `<b>` з відсотком знижки — integer, без десяткових: `<p class="sale"><s>799.00 ₴</s> <b>−18%</b></p>` (мінус — символ `−`).',
        'Знижка справжня, лише коли `compare_at_price` **більша** за `price`. Product без знижки — тільки назва й ціна.',
      ],
      preset: 'collection',
      altData: {
        collection: {
          title: 'Розпродаж',
          products: [
            { title: 'Гребінь карбоновий', price: 30000, compare_at_price: 40000, available: true },
            { title: 'Пензель для масок', price: 18000, compare_at_price: 12000, available: true },
            { title: 'Кліпси, 6 шт.', price: 9900, compare_at_price: null, available: false },
          ],
        },
      },
      starter: `<ul class="grid">
{% for product in collection.products %}
  <li>
    <h3>{{ product.title }}</h3>
    <p class="price">{{ product.price | money }}</p>
    {% comment %} <p class="sale">…</p> — лише коли знижка справжня {% endcomment %}
  </li>
{% endfor %}
</ul>`,
      solution: `<ul class="grid">
{% for product in collection.products %}
  <li>
    <h3>{{ product.title }}</h3>
    <p class="price">{{ product.price | money }}</p>
    {% if product.compare_at_price > product.price %}
      {% assign saving = product.compare_at_price | minus: product.price %}
      <p class="sale"><s>{{ product.compare_at_price | money }}</s> <b>−{{ saving | times: 100 | divided_by: product.compare_at_price }}%</b></p>
    {% endif %}
  </li>
{% endfor %}
</ul>`,
      mustUse: [
        { pattern: '\\bfor\\s+\\w+\\s+in\\b', label: 'Список виводить цикл `for`' },
        { pattern: 'divided_by', label: 'Відсоток порахований у шаблоні (`divided_by`)' },
      ],
      view: 'html',
      hints: [
        'Умова знижки — `product.compare_at_price > product.price`. Вона сама відсіє і `nil`, і «стару» ціну, меншу за чинну.',
        'Відсоток: різницю помнож на 100 і лише потім діли на `compare_at_price`. Навпаки вийде 0.',
        '`{% assign saving = product.compare_at_price | minus: product.price %}`, далі `{{ saving | times: 100 | divided_by: product.compare_at_price }}`.',
      ],
      explain:
        'Прихована перевірка підсовує product, у якого `compare_at_price` **менша** за ціну: умова `{% if product.compare_at_price %}` намалювала б йому бейдж із відʼємною знижкою. Порівняння `>` закриває одразу три випадки: знижка є, знижки немає (`nil`), дані помилкові.',
    },
    {
      id: 'l14-e4',
      title: 'Міні-кошик',
      task: [
        'Збери міні-кошик для шапки сайту. Якщо cart не порожній — виведи `<ul class="mini-cart">`, де кожен line item — `<li>Назва × кількість — сума line item</li>` (назва — `item.title`, сума — `item.final_line_price` через `money`).',
        'Під списком — `<p class="total">Разом (6 шт.): 3,759.10 ₴</p>`: у дужках загальна кількість одиниць, далі підсумок cart.',
        'Якщо cart порожній — виведи лише `<p class="empty">Кошик порожній</p>`.',
      ],
      preset: 'cart',
      altData: { cart: cartOf([]) },
      starter: `{% comment %} Порожній кошик → <p class="empty">…</p>, інакше список і підсумок {% endcomment %}
<ul class="mini-cart">
</ul>
<p class="total">Разом: {{ cart.total_price }}</p>`,
      solution: `{% if cart.item_count == 0 %}
  <p class="empty">Кошик порожній</p>
{% else %}
  <ul class="mini-cart">
  {% for item in cart.items %}
    <li>{{ item.title }} × {{ item.quantity }} — {{ item.final_line_price | money }}</li>
  {% endfor %}
  </ul>
  <p class="total">Разом ({{ cart.item_count }} шт.): {{ cart.total_price | money }}</p>
{% endif %}`,
      mustUse: [
        { pattern: '\\bfor\\s+\\w+\\s+in\\b', label: 'Список виводить цикл `for` по `cart.items`' },
        { pattern: '\\|\\s*money\\b', label: 'Суми форматує `money`' },
      ],
      view: 'html',
      hints: [
        'Почни з розгалуження: `{% if cart.item_count == 0 %} … {% else %} … {% endif %}`.',
        'Кількість одиниць — `cart.item_count`, а не `cart.items.size`: другий рахує line items.',
        'Line item: `<li>{{ item.title }} × {{ item.quantity }} — {{ item.final_line_price | money }}</li>`.',
      ],
      explain:
        '`final_line_price` — сума line item **після** знижок, саме її бачить людина; `original_line_price` — до знижок. Порожній стан — не дрібниця: `cart` глобальний, тож цей шматок рендериться на кожній сторінці, і більшість відвідувачів бачать саме порожній варіант.',
    },
  ],
  quiz: [
    {
      id: 'l14-q1',
      q: 'Що виведе цей код на сторінці товару (ціна шампуню — 649 ₴)?',
      template: '{{ product.price }}',
      preset: 'product',
      options: ['649.00 ₴', '64900', '649', '649.00'],
      correct: 1,
      explain: 'Без фільтра виводиться сире значення — integer **в копійках**. Форматування робить лише `money`.',
    },
    {
      id: 'l14-q2',
      q: 'У product три варіанти, останній недоступний. Що виведе код?',
      template: "{{ product.variants | where: 'available', true | map: 'title' | join: ', ' }}",
      preset: 'product',
      options: ['250 мл, 400 мл, 1000 мл', '250 мл, 400 мл', '1000 мл', 'true, true, false'],
      correct: 1,
      explain: '`where` лишає тільки варіанти з `available == true`, `map` дістає з них назви, `join` склеює. Недоступний літр відсіявся ще до `map`.',
    },
    {
      id: 'l14-q3',
      q: 'У cart три line items: 2 шампуні, 1 маска і 3 олійки. Що виведе код?',
      template: '{{ cart.items.size }} / {{ cart.item_count }}',
      preset: 'cart',
      options: ['3 / 3', '6 / 6', '3 / 6', '6 / 3'],
      correct: 2,
      explain: '`cart.items.size` рахує **line items**, `cart.item_count` — суму кількостей: 2 + 1 + 3 = 6. На іконці кошика показують друге.',
    },
    {
      id: 'l14-q4',
      q: 'У шаблоні **колекції** хтось написав `<h2>{{ product.title }}</h2>` поза циклом. Що побачить відвідувач?',
      options: [
        'Помилку `Liquid error: undefined variable product`',
        'Порожній `<h2></h2>` — `product` тут `nil`, а `nil` виводиться як порожній рядок',
        'Назву першого товару колекції',
        'Назву останнього переглянутого товару',
      ],
      correct: 1,
      explain: '`product` — сторінковий обʼєкт: поза шаблоном товару він `nil`. Liquid не падає на невідомих змінних, тож у розмітці лишиться порожній тег. Усередині `{% for product in collection.products %}` імʼя `product` — уже локальна змінна циклу.',
    },
  ],
  docs: ['shopify/objects-overview', 'shopify/product-and-variant', 'shopify/collection-and-pagination', 'shopify/cart', 'shopify/money-filters'],
  topics: ['objects'],
}

/* ═════════════════════════════ l15 ═════════════════════════════ */

const faqSchema = `{% schema %}
{
  "name": "Питання й відповіді",
  "settings": [
    { "type": "text", "id": "heading", "label": "Заголовок", "default": "Часті питання" }
  ],
  "blocks": [
    {
      "type": "faq",
      "name": "Питання",
      "settings": [
        { "type": "text", "id": "question", "label": "Питання", "default": "Нове питання" },
        { "type": "textarea", "id": "answer", "label": "Відповідь", "default": "Відповідь зʼявиться згодом." }
      ]
    }
  ],
  "presets": [
    {
      "name": "Питання й відповіді",
      "blocks": [
        { "type": "faq", "settings": { "question": "Як часто мити волосся після кератину?", "answer": "Коли забруднилось — безсульфатним шампунем." } },
        { "type": "faq", "settings": { "question": "Чи є доставка?", "answer": "Так, Новою поштою за 1–2 дні." } },
        { "type": "faq" }
      ]
    }
  ]
}
{% endschema %}`

const l15: Lesson = {
  id: 'l15',
  module: 5,
  title: 'Секції, схема, блоки й налаштування',
  goal: 'Напишеш секцію зі схемою: налаштування з `default`, блоки кількох типів із `case` по `block.type`, `block.shopify_attributes` і `presets` — і поясниш, хто з них за що відповідає в редакторі теми.',
  minutes: 45,
  blocks: [
    {
      type: 'p',
      text: '**Секція** — це файл у теці `sections/`: шматок сторінки з власною розміткою і власними налаштуваннями. Продавчиня додає секції в редакторі теми, міняє їхній порядок і заповнює поля — без коду. Усе, що вона бачить у бічній панелі редактора, описує тег `{% schema %}` наприкінці файлу. Тема Online Store 2.0 майже цілком складається з секцій, тому це головна тема будь-якої співбесіди на Shopify-розробника.',
    },
    { type: 'h', text: 'Схема: звідки береться section.settings' },
    {
      type: 'example',
      title: 'Найменша секція',
      view: 'html',
      template: `<section class="promo promo--{{ section.settings.align }}">
  <h2>{{ section.settings.heading }}</h2>
  <p>{{ section.settings.text }}</p>
</section>

{% schema %}
{
  "name": "Промо-блок",
  "settings": [
    { "type": "text", "id": "heading", "label": "Заголовок", "default": "Догляд після процедури" },
    { "type": "textarea", "id": "text", "label": "Текст", "default": "Безсульфатні шампуні й маски, які бережуть результат." },
    { "type": "select", "id": "align", "label": "Вирівнювання", "default": "center",
      "options": [
        { "value": "left", "label": "Ліворуч" },
        { "value": "center", "label": "По центру" }
      ] }
  ]
}
{% endschema %}`,
      note: 'Кожне налаштування має `type`, `id` і `label`. За `id` значення потрапляє в `section.settings.<id>`. Пісочниця читає схему й підставляє `default` — зміни його й подивись на output. У справжній темі `default` спрацьовує один раз, коли секцію додають; далі значення зберігаються в JSON-шаблоні сторінки (`templates/*.json`).',
    },
    {
      type: 'note',
      tone: 'shopify',
      title: 'Схема — це JSON, а не Liquid',
      text: 'Усередині `{% schema %}` Liquid **не виконується**: жодних `{{ }}`, умов чи змінних — лише валідний JSON (без коментарів і зайвих ком). На файл — рівно один тег `schema`, він не може стояти всередині іншого тега, і жити він може тільки у файлі секції або блока теми — у сніпеті його не буває. Сам тег нічого не виводить у HTML.',
    },
    { type: 'h', text: 'Типи налаштувань і що вони повертають' },
    {
      type: 'table',
      head: ['`type`', 'Що лежить у `section.settings.id`', 'На що зважати'],
      rows: [
        ['`text`, `textarea`', 'string', 'порожнє поле — порожнє значення, а воно truthy; перевіряй `!= blank`'],
        ['`richtext`', 'string з HTML-абзацами', 'виводь як є, без `escape`; `default` мусить бути в `<p>`'],
        ['`checkbox`', '`true` / `false`', 'одразу годиться в `{% if %}`'],
        ['`number`, `range`', 'число', '`range` вимагає `min`, `max`, `step` і `default`'],
        ['`select`, `radio`', 'string — `value` обраного варіанта', 'зручно клеїти в клас-модифікатор'],
        ['`color`', 'обʼєкт кольору, виводиться як hex', 'іде в CSS-змінну через `{% style %}`'],
        ['`image_picker`', 'обʼєкт зображення або `nil`', 'далі — `image_url` + `image_tag`'],
        ['`url`', 'string або `nil`', 'кнопку без посилання краще не малювати'],
        ['`product`, `collection`, `blog`, `page`', 'відповідний обʼєкт або порожньо', '`default` не підтримують — завжди май порожній стан'],
        ['`header`, `paragraph`', 'нічого — це підписи в панелі редактора', '`id` їм не потрібен'],
      ],
    },
    {
      type: 'example',
      title: 'checkbox, range і style',
      view: 'html',
      template: `{% style %}
  #s-{{ section.id }} { --columns: {{ section.settings.columns }}; --gap: {{ section.settings.gap }}px; }
{% endstyle %}

<div id="s-{{ section.id }}" class="grid{% if section.settings.full_width %} grid--wide{% endif %}">
  Колонок: {{ section.settings.columns }}, наступне значення: {{ section.settings.columns | plus: 1 }}
</div>

{% schema %}
{
  "name": "Сітка",
  "settings": [
    { "type": "range", "id": "columns", "label": "Колонок", "min": 2, "max": 5, "step": 1, "default": 3 },
    { "type": "range", "id": "gap", "label": "Відступ", "min": 0, "max": 40, "step": 4, "unit": "px", "default": 16 },
    { "type": "checkbox", "id": "full_width", "label": "На всю ширину", "default": true }
  ]
}
{% endschema %}`,
      note: '`range` повертає **число**, тож `plus` працює без перетворень. `section.id` унікальний для кожного екземпляра секції — ним скоупиш стилі, щоб дві однакові секції на сторінці не ділили одну CSS-змінну.',
    },
    {
      type: 'example',
      title: 'Порожній текст — truthy',
      data: { section: { settings: { heading: '', subheading: 'Лише перевірені марки' } } },
      view: 'html',
      template: `{% if section.settings.heading %}<h2>{{ section.settings.heading }}</h2>{% endif %}
{% if section.settings.subheading != blank %}<p>{{ section.settings.subheading }}</p>{% endif %}`,
      note: 'Продавчиня стерла заголовок, але порожній `<h2></h2>` усе одно потрапив у розмітку. Тут обʼєкт `section` задано даними прикладу, щоб показати саме цей стан.',
    },
    {
      type: 'note',
      tone: 'warn',
      title: 'Текстові налаштування перевіряй через blank',
      text: 'Порожній string у Liquid — truthy, і порожнє текстове налаштування поводиться так само. `{% if section.settings.heading %}` пропустить порожній заголовок, і на сторінці лишиться пустий тег із відступами. Правило: для `text`, `textarea`, `richtext`, `url` — завжди `!= blank`. Для `checkbox` вистачає голого `{% if %}`.',
    },
    { type: 'h', text: 'Блоки: повторюваний вміст' },
    {
      type: 'p',
      text: 'Налаштування секції — це фіксований набір полів. А коли продавчині треба **скільки завгодно** однотипних елементів (слайди, переваги, питання) і ще й міняти їхній порядок — потрібні **блоки**. Схема описує *типи* блоків із власними налаштуваннями, а редактор складає з них масив `section.blocks`. У кожного блока є `type`, `settings`, `id` і `shopify_attributes`.',
    },
    {
      type: 'example',
      title: 'Два типи блоків і case',
      view: 'html',
      template: `<div class="benefits">
  <h2>{{ section.settings.heading }}</h2>
  {% for block in section.blocks %}
    {% case block.type %}
      {% when 'benefit' %}
        <div class="benefit" {{ block.shopify_attributes }}>
          <h3>{{ block.settings.title }}</h3>
          <p>{{ block.settings.text }}</p>
        </div>
      {% when 'button' %}
        <a class="btn" href="{{ block.settings.link }}" {{ block.shopify_attributes }}>{{ block.settings.label }}</a>
    {% endcase %}
  {% endfor %}
</div>

{% schema %}
{
  "name": "Переваги",
  "max_blocks": 6,
  "settings": [
    { "type": "text", "id": "heading", "label": "Заголовок", "default": "Чому Liquid Lab" }
  ],
  "blocks": [
    { "type": "benefit", "name": "Перевага", "settings": [
      { "type": "text", "id": "title", "label": "Заголовок", "default": "Нова перевага" },
      { "type": "textarea", "id": "text", "label": "Опис", "default": "Коротко, чому це важливо." }
    ] },
    { "type": "button", "name": "Кнопка", "limit": 1, "settings": [
      { "type": "text", "id": "label", "label": "Напис", "default": "До каталогу" },
      { "type": "url", "id": "link", "label": "Посилання" }
    ] }
  ],
  "presets": [
    { "name": "Переваги", "blocks": [
      { "type": "benefit", "settings": { "title": "Доставка за 1 день", "text": "Відправляємо в день замовлення." } },
      { "type": "benefit" },
      { "type": "button", "settings": { "link": "/collections/all" } }
    ] }
  ]
}
{% endschema %}`,
      note: 'Другий блок у пресеті не має власних `settings` — і отримав `default` зі схеми свого типу. `limit` обмежує кількість блоків одного типу, `max_blocks` — усіх разом (стеля платформи — 50 блоків на секцію).',
    },
    {
      type: 'note',
      tone: 'shopify',
      title: 'Навіщо block.shopify_attributes',
      text: 'Це `data`-атрибути, за якими редактор теми знаходить блок у превʼю: клік по елементу відкриває його налаштування, а вибір блока в панелі — підсвічує елемент. Забудеш їх — секція працюватиме, але редагувати її стане незручно, і ревʼю теми це помітить. Став атрибут на **кореневий елемент** блока. Поза редактором Shopify повертає порожній string; пісочниця виводить атрибут завжди, щоб ти його бачив.',
    },
    {
      type: 'note',
      tone: 'interview',
      title: 'Секція, блок, сніпет — у чому різниця',
      text: '«Секція — самостійний модуль сторінки зі своєю схемою; її додає, рухає й налаштовує продавчиня. Блок — повторюваний елемент усередині секції, теж налаштовується в редакторі. Сніпет — просто шматок Liquid для перевикористання в коді: схеми не має, у редакторі його не видно, дані отримує параметрами `render`». Сильне доповнення: секція рендериться ізольовано — змінних, створених через `assign` у layout чи шаблоні, вона не бачить; натомість її можна окремо перезапитати через Section Rendering API.',
    },
    { type: 'h', text: 'presets, default і статичні секції' },
    {
      type: 'p',
      text: '`presets` — це «заготовки» секції для кнопки **Add section**: назва, стартові значення налаштувань і стартовий набір блоків. **Без `presets` секцію не можна додати через редактор** — лише вписати в JSON-шаблон руками або підключити статично тегом `{% section %}`. Для статичних секцій стартовий вміст задає ключ `default` — того самого формату.',
    },
    {
      type: 'example',
      title: 'Статична секція через тег section',
      preset: 'shop',
      view: 'html',
      snippets: {
        'sections/announcement': `<p class="bar">{{ section.settings.text }} · {{ shop.name }}</p>

{% schema %}
{
  "name": "Смуга оголошень",
  "settings": [
    { "type": "text", "id": "text", "label": "Текст", "default": "Безкоштовна доставка від 1500 ₴" }
  ]
}
{% endschema %}`,
      },
      template: `{% section 'announcement' %}
<main>…</main>`,
      note: 'Так секції підключали до появи JSON-шаблонів, а в `layout/theme.liquid` це трапляється й досі. Shopify сам загортає секцію в `<div id="shopify-section-…" class="shopify-section">`. `id` статичної секції — імʼя файлу. У пісочниці файл секції лежить у сніпеті `sections/announcement`.',
    },
    {
      type: 'example',
      title: 'Блоки теми: content_for',
      view: 'html',
      snippets: {
        'blocks/title': '<h2 {{ block.shopify_attributes }}>{{ block.settings.text }}</h2>',
        'blocks/note': '<p {{ block.shopify_attributes }}>{{ block.settings.text }}</p>',
      },
      template: `<div class="stack">
  {% content_for 'blocks' %}
</div>

{% schema %}
{
  "name": "Стек",
  "blocks": [{ "type": "@theme" }],
  "presets": [
    { "name": "Стек", "blocks": [
      { "type": "title", "settings": { "text": "Догляд удома" } },
      { "type": "note", "settings": { "text": "Безсульфатні формули для щоденного миття." } }
    ] }
  ]
}
{% endschema %}`,
      note: 'Новіший підхід: блок — окремий файл у теці `blocks/` із власною схемою, а секція лише каже «сюди можна будь-які блоки теми» (`"type": "@theme"`) і рендерить їх одним тегом — без `for` і `case`. Такі блоки можна вкладати один в одного й використовувати в різних секціях. Класичні блоки зі схеми секції нікуди не зникли — на співбесіді треба знати обидва.',
    },
    {
      type: 'note',
      tone: 'interview',
      title: 'Що буде, якщо перейменувати id налаштування',
      text: 'Улюблене питання «на досвід». Значення зберігаються в JSON-шаблоні **за `id`**. Перейменуєш `heading` на `title` — для Shopify це нове поле: воно отримає `default`, а все, що продавчиня ввела в старе, перестане виводитись. Те саме з `type` блока. Тому `id` — це публічний контракт секції: міняти їх у живій темі можна лише разом із міграцією даних шаблонів. Підпис у панелі (`label`) міняй скільки завгодно.',
    },
    {
      type: 'note',
      tone: 'tip',
      text: 'Пиши секцію від порожнього стану: продавчиня щойно додала її й нічого не заповнила. Заголовок порожній, картинку не вибрано, блоків нуль — секція не має розвалитись. `default` у схемі та `{% for %}…{% else %}` для блоків закривають більшість таких випадків.',
    },
  ],
  exercises: [
    {
      id: 'l15-e1',
      title: 'Виведи налаштування секції',
      task: [
        'Схема вже написана — розмітки ще немає. Виведи `<section>` із класом `hero hero--<значення align>`, усередині — `<h2>` із заголовком і `<p>` з текстом із налаштувань секції.',
        'Очікуваний результат на значеннях за замовчуванням: `<section class="hero hero--center">`, у ньому `<h2>Відновлення без сюрпризів</h2>` і `<p>Підбираємо догляд під твій тип волосся.</p>`.',
      ],
      altData: { section: { id: 'alt', settings: { heading: 'Новинки осені', text: 'Щойно зі складу.', align: 'left' }, blocks: [] } },
      starter: `{% comment %} Розмітка секції: section.settings.heading, .text, .align {% endcomment %}

{% schema %}
{
  "name": "Hero",
  "settings": [
    { "type": "text", "id": "heading", "label": "Заголовок", "default": "Відновлення без сюрпризів" },
    { "type": "textarea", "id": "text", "label": "Текст", "default": "Підбираємо догляд під твій тип волосся." },
    { "type": "select", "id": "align", "label": "Вирівнювання", "default": "center",
      "options": [ { "value": "left", "label": "Ліворуч" }, { "value": "center", "label": "По центру" } ] }
  ]
}
{% endschema %}`,
      solution: `<section class="hero hero--{{ section.settings.align }}">
  <h2>{{ section.settings.heading }}</h2>
  <p>{{ section.settings.text }}</p>
</section>

{% schema %}
{
  "name": "Hero",
  "settings": [
    { "type": "text", "id": "heading", "label": "Заголовок", "default": "Відновлення без сюрпризів" },
    { "type": "textarea", "id": "text", "label": "Текст", "default": "Підбираємо догляд під твій тип волосся." },
    { "type": "select", "id": "align", "label": "Вирівнювання", "default": "center",
      "options": [ { "value": "left", "label": "Ліворуч" }, { "value": "center", "label": "По центру" } ] }
  ]
}
{% endschema %}`,
      mustUse: [{ pattern: 'section\\.settings\\.heading', label: 'Заголовок береться із `section.settings.heading`' }],
      view: 'html',
      hints: [
        'Значення налаштування доступне як `section.settings.<id>` — `id` дивись у схемі.',
        'Клас-модифікатор: `class="hero hero--{{ section.settings.align }}"`.',
      ],
      explain:
        'Схема описує поля, розмітка їх читає — і це єдиний звʼязок між ними: string `id`. Прихована перевірка підставляє інші значення, як це зробила б продавчиня в редакторі: захардкоджений заголовок її не пройде.',
    },
    {
      id: 'l15-e2',
      title: 'Додай налаштування у схему',
      task: [
        'Секція вміє лише заголовок. Продавчиня просить кнопку, яку можна вимкнути.',
        'Додай у схему два налаштування: `checkbox` з `id` `show_button` (за замовчуванням увімкнений) і `text` з `id` `button_label` (за замовчуванням `До каталогу`).',
        'У розмітці після `<h2>` виведи `<a class="btn" href="…">напис</a>`, де адреса — `routes.all_products_collection_url`, а напис — із налаштування. Кнопка зʼявляється, лише коли `show_button` увімкнено.',
      ],
      preset: 'shop',
      altData: { section: { id: 'alt', settings: { heading: 'Зимовий догляд', show_button: false, button_label: 'Дивитись' }, blocks: [] } },
      starter: `<div class="cta">
  <h2>{{ section.settings.heading }}</h2>
</div>

{% schema %}
{
  "name": "Заклик",
  "settings": [
    { "type": "text", "id": "heading", "label": "Заголовок", "default": "Усе для домашнього догляду" }
  ]
}
{% endschema %}`,
      solution: `<div class="cta">
  <h2>{{ section.settings.heading }}</h2>
  {% if section.settings.show_button %}
    <a class="btn" href="{{ routes.all_products_collection_url }}">{{ section.settings.button_label }}</a>
  {% endif %}
</div>

{% schema %}
{
  "name": "Заклик",
  "settings": [
    { "type": "text", "id": "heading", "label": "Заголовок", "default": "Усе для домашнього догляду" },
    { "type": "checkbox", "id": "show_button", "label": "Показувати кнопку", "default": true },
    { "type": "text", "id": "button_label", "label": "Напис на кнопці", "default": "До каталогу" }
  ]
}
{% endschema %}`,
      mustUse: [
        { pattern: '"type"\\s*:\\s*"checkbox"', label: 'У схемі є налаштування типу `checkbox`' },
        { pattern: 'section\\.settings\\.show_button', label: 'Розмітка перевіряє `section.settings.show_button`' },
      ],
      view: 'html',
      hints: [
        'Нове налаштування — ще один обʼєкт у масиві `settings`: `{ "type": "checkbox", "id": "show_button", "label": "…", "default": true }`. Не забудь кому між обʼєктами — і не лишай її після останнього.',
        '`checkbox` повертає булеве, тож умова проста: `{% if section.settings.show_button %}`.',
        '`<a class="btn" href="{{ routes.all_products_collection_url }}">{{ section.settings.button_label }}</a>`',
      ],
      explain:
        'Адреси магазину не хардкодять: `routes.*` враховує мовний префікс (`/en/collections/all`). А `default: true` у `checkbox` означає, що щойно додана секція одразу виглядає завершеною — продавчиня вимкне зайве, а не шукатиме, як увімкнути потрібне.',
    },
    {
      id: 'l15-e3',
      title: 'Блоки: питання й відповіді',
      task: [
        'Схема секції FAQ готова: тип блока `faq` з полями `question` і `answer`, у пресеті — три блоки.',
        'Виведи `<div class="faq">`: спершу `<h2>` із заголовком секції, далі для кожного блока — `<details {{ block.shopify_attributes }}>`, у якому `<summary>` з питанням і `<p>` з відповіддю.',
        'Якщо блоків немає — замість них виведи `<p class="empty">Питань поки немає</p>`. Використай `for … else`.',
      ],
      altData: { section: { id: 'alt', settings: { heading: 'Питання про доставку' }, blocks: [] } },
      starter: `<div class="faq">
  <h2>{{ section.settings.heading }}</h2>
  {% comment %} Цикл по section.blocks із порожнім станом {% endcomment %}
</div>

${faqSchema}`,
      solution: `<div class="faq">
  <h2>{{ section.settings.heading }}</h2>
  {% for block in section.blocks %}
    <details {{ block.shopify_attributes }}>
      <summary>{{ block.settings.question }}</summary>
      <p>{{ block.settings.answer }}</p>
    </details>
  {% else %}
    <p class="empty">Питань поки немає</p>
  {% endfor %}
</div>

${faqSchema}`,
      mustUse: [
        { pattern: 'block\\.shopify_attributes', label: 'Кореневий елемент блока має `{{ block.shopify_attributes }}`' },
        { pattern: '\\{%-?\\s*else\\s*-?%\\}', label: 'Порожній стан зроблено через `{% else %}` у циклі' },
      ],
      view: 'html',
      hints: [
        'Блоки — звичайний масив: `{% for block in section.blocks %}`. Поля блока — `block.settings.question`, `block.settings.answer`.',
        'Атрибут редактора пишеться просто всередині тега: `<details {{ block.shopify_attributes }}>`.',
        'Гілка `{% else %}` усередині `for` виконується, коли масив порожній.',
      ],
      explain:
        'Третій блок у пресеті не має власних значень — він показує `default` зі схеми: саме таким продавчиня бачить щойно доданий блок. А порожній стан — не формальність: вона може видалити всі блоки, і секція не повинна лишити на сторінці самотній заголовок без пояснень.',
    },
    {
      id: 'l15-e4',
      title: 'Секція з двома типами блоків',
      task: [
        'Допиши промо-секцію. Зараз у схемі один тип блока — `text`. Додай другий: `button` з налаштуваннями `label` (`text`, за замовчуванням `Докладніше`) і `link` (`url`, без `default`). Дозволь лише одну кнопку на секцію (`"limit": 1`).',
        'У пресет додай третім блоком кнопку з `"link": "/collections/all"` — напис нехай візьметься з `default`.',
        'У розмітці всередині `<section class="promo">` після `<h2>` пройдись по блоках і через `case` виведи: для `text` — `<p class="promo__text" {{ block.shopify_attributes }}>текст</p>`, для `button` — `<a class="promo__btn" href="посилання" {{ block.shopify_attributes }}>напис</a>`. Атрибут редактора — останнім у тегу.',
      ],
      altData: {
        section: {
          id: 'alt',
          settings: { heading: 'Тиждень масок' },
          blocks: [
            { id: 'b1', type: 'button', settings: { label: 'Обрати маску', link: '/collections/masks' }, shopify_attributes: 'data-shopify-editor-block="b1"' },
            { id: 'b2', type: 'text', settings: { text: 'Мінус 20% на всі маски до неділі.' }, shopify_attributes: 'data-shopify-editor-block="b2"' },
          ],
        },
      },
      starter: `<section class="promo">
  <h2>{{ section.settings.heading }}</h2>
  {% for block in section.blocks %}
    <p class="promo__text" {{ block.shopify_attributes }}>{{ block.settings.text }}</p>
  {% endfor %}
</section>

{% schema %}
{
  "name": "Промо",
  "settings": [
    { "type": "text", "id": "heading", "label": "Заголовок", "default": "Осінній догляд" }
  ],
  "blocks": [
    {
      "type": "text",
      "name": "Текст",
      "settings": [
        { "type": "textarea", "id": "text", "label": "Текст", "default": "Новий абзац" }
      ]
    }
  ],
  "presets": [
    {
      "name": "Промо",
      "blocks": [
        { "type": "text", "settings": { "text": "Знижки до −30% на домашній догляд." } },
        { "type": "text" }
      ]
    }
  ]
}
{% endschema %}`,
      solution: `<section class="promo">
  <h2>{{ section.settings.heading }}</h2>
  {% for block in section.blocks %}
    {% case block.type %}
      {% when 'text' %}
        <p class="promo__text" {{ block.shopify_attributes }}>{{ block.settings.text }}</p>
      {% when 'button' %}
        <a class="promo__btn" href="{{ block.settings.link }}" {{ block.shopify_attributes }}>{{ block.settings.label }}</a>
    {% endcase %}
  {% endfor %}
</section>

{% schema %}
{
  "name": "Промо",
  "settings": [
    { "type": "text", "id": "heading", "label": "Заголовок", "default": "Осінній догляд" }
  ],
  "blocks": [
    {
      "type": "text",
      "name": "Текст",
      "settings": [
        { "type": "textarea", "id": "text", "label": "Текст", "default": "Новий абзац" }
      ]
    },
    {
      "type": "button",
      "name": "Кнопка",
      "limit": 1,
      "settings": [
        { "type": "text", "id": "label", "label": "Напис", "default": "Докладніше" },
        { "type": "url", "id": "link", "label": "Посилання" }
      ]
    }
  ],
  "presets": [
    {
      "name": "Промо",
      "blocks": [
        { "type": "text", "settings": { "text": "Знижки до −30% на домашній догляд." } },
        { "type": "text" },
        { "type": "button", "settings": { "link": "/collections/all" } }
      ]
    }
  ]
}
{% endschema %}`,
      mustUse: [
        { pattern: '\\{%-?\\s*case\\s+block\\.type', label: 'Тип блока розбирає `{% case block.type %}`' },
        { pattern: '"limit"\\s*:\\s*1', label: 'Кнопка обмежена однією на секцію (`"limit": 1`)' },
      ],
      view: 'html',
      hints: [
        'Новий тип — ще один обʼєкт у масиві `blocks` схеми: `"type": "button"`, `"name"`, `"limit": 1` і свій масив `settings`.',
        'У розмітці: `{% case block.type %}{% when \'text\' %}…{% when \'button\' %}…{% endcase %}` усередині циклу.',
        'Блок у пресеті без поля — `{ "type": "button", "settings": { "link": "/collections/all" } }`: `label` підтягнеться з `default` типу.',
      ],
      explain:
        'Поки тип блока один, `case` здається зайвим — і саме тому його забувають, коли зʼявляється другий: стара розмітка намагається вивести кнопку як абзац. Прихована перевірка ще й міняє блоки місцями: порядок визначає продавчиня, а не схема, тож розмітка не може розраховувати, що кнопка остання.',
    },
  ],
  quiz: [
    {
      id: 'l15-q1',
      q: 'У схемі `default` заголовка — «Новинки», але пресет задає своє значення. Що виведе пісочниця (і що побачить продавчиня, додавши секцію з цього пресета)?',
      template: `{{ section.settings.heading }}
{% schema %}
{
  "name": "Сітка",
  "settings": [{ "type": "text", "id": "heading", "label": "Заголовок", "default": "Новинки" }],
  "presets": [{ "name": "Хіти продажу", "settings": { "heading": "Хіти" } }]
}
{% endschema %}`,
      options: ['Новинки', 'Хіти', 'Хіти продажу', 'Сітка'],
      correct: 1,
      explain: 'Значення з пресета перекривають `default` налаштування. `name` пресета — лише підпис у списку «Add section», а `name` схеми — назва секції в панелі редактора; у `section.settings` вони не потрапляють.',
    },
    {
      id: 'l15-q2',
      q: 'Продавчиня стерла заголовок секції. Що виведе код?',
      template: '{% if section.settings.heading %}<h2>{{ section.settings.heading }}</h2>{% else %}без заголовка{% endif %}',
      data: { section: { settings: { heading: '' } } },
      options: ['без заголовка', '<h2></h2>', 'Нічого', 'Помилка: heading is blank'],
      correct: 1,
      explain: 'Порожній string — truthy, тож умова виконується й лишає порожній тег. Правильна перевірка — `{% if section.settings.heading != blank %}`.',
    },
    {
      id: 'l15-q3',
      q: 'У секції три блоки: `slide`, `video`, `slide`. Що виведе код?',
      template: `{% for block in section.blocks %}{% case block.type %}{% when 'slide' %}S{% when 'text' %}T{% endcase %}{% endfor %}`,
      data: { section: { blocks: [{ type: 'slide' }, { type: 'video' }, { type: 'slide' }] } },
      options: ['SS', 'STS', 'S', 'Помилка: невідомий тип блока video'],
      correct: 0,
      explain: '`case` без гілки `else` просто нічого не виводить для типу, якого не знає. Це зручно (новий тип блока не ламає стару розмітку) і небезпечно (блок мовчки зникає зі сторінки — шукай одруківку у `when`).',
    },
    {
      id: 'l15-q4',
      q: 'Де може стояти тег `{% schema %}`?',
      options: [
        'У будь-якому файлі теми, зокрема у сніпеті й layout',
        'Лише у файлі секції або блока теми, один раз на файл і не всередині інших тегів',
        'Лише в `config/settings_schema.json`',
        'У файлі секції скільки завгодно разів — схеми зливаються',
      ],
      correct: 1,
      explain: 'Схема описує налаштування саме секції (або блока теми в `blocks/`). У сніпета схеми немає — він отримує дані параметрами `render`. Глобальні theme settings — окремий файл `config/settings_schema.json`, і це вже чистий JSON без тега.',
    },
  ],
  docs: ['shopify/sections-and-schema', 'shopify/blocks', 'shopify/json-templates', 'shopify/theme-settings', 'shopify/section-groups'],
  topics: ['sections', 'architecture'],
}


/* ═════════════════════════════ l16 ═════════════════════════════ */

/** Зображення у формі обʼєкта Shopify: фільтрам потрібен лише `src`, решта — для розмітки. */
const shot = (name: string, alt: string) => ({
  src: `//liquid-lab.myshopify.com/cdn/shop/files/${name}.jpg`,
  alt,
  width: 1200,
  height: 1200,
  aspect_ratio: 1,
})

/** Словник перекладів у тій формі, у якій його читає фільтр `t` (у темі — `locales/uk.json`). */
const uaLocales = (addToCart: string, soldOut: string) => ({
  products: { product: { add_to_cart: addToCart, sold_out: soldOut } },
})

const l16: Lesson = {
  id: 'l16',
  module: 5,
  title: 'Гроші, зображення, pagination, форми',
  goal: 'Форматуватимеш ціни фільтрами `money`, збиратимеш адреси картинок через `image_url` і `image_tag`, ділитимеш довгі списки тегом `{% paginate %}` і виводитимеш робочу форму `{% form %}` із текстами через `t`.',
  minutes: 40,
  blocks: [
    {
      type: 'p',
      text: 'Чотири речі тема робить на кожній сторінці магазину: показує **ціну**, показує **картинку**, ріже довгий список на **сторінки** і дає відвідувачу **форму**. У кожної з них у Shopify є свій інструмент, і кожен має рівно одну типову помилку, на якій новачка видно одразу. Цей урок — про всі чотири плюс про тексти, які не можна хардкодити.',
    },

    { type: 'h', text: 'Гроші: integer у копійках' },
    {
      type: 'example',
      title: 'Уся родина money',
      preset: 'product',
      template: `{{ product.price }}
{{ product.price | money }}
{{ product.price | money_with_currency }}
{{ product.price | money_without_currency }}
{{ product.price | money_without_trailing_zeros }}
{{ 100000 | money_without_trailing_zeros }}
[{{ product.compare_at_price_min | money }}]`,
      note: 'Будь-яка сума в Shopify — **integer у найменшій одиниці валюти**: `64900` означає 649,00 ₴, а формат output задає магазин, не шаблон. Перший рядок — сире значення, решта — те саме число крізь фільтри. `money_without_trailing_zeros` прибирає `,00` лише в круглих сум: 649,00 ₴ лишаються з копійками, а 1000,00 ₴ стають `1,000 ₴`. Останній рядок — `nil` через `money`: не помилка, а **порожній string**, тож дужки поруч із порожнечею в розмітці — твій клопіт, не платформи.',
    },
    {
      type: 'table',
      head: ['Фільтр', 'Output на 64900', 'Де застосовують'],
      rows: [
        ['`money`', '`649.00 ₴`', 'скрізь, де ціну бачить людина'],
        ['`money_with_currency`', '`649.00 ₴ UAH`', 'кошик і чек у мультивалютному магазині'],
        ['`money_without_currency`', '`649.00`', '`data`-атрибути й JSON для JavaScript'],
        ['`money_without_trailing_zeros`', '`649 ₴`', 'банери й бейджі, де `,00` лише шумить'],
      ],
    },
    {
      type: 'note',
      tone: 'warn',
      title: 'Після money число закінчується',
      text: '`money` повертає **string** з валютним символом і розділювачами тисяч. Отже, уся арифметика — до нього: `price | minus: compare | times: 100 | divided_by: … | money`. Поставиш `money` посеред ланцюжка — наступний математичний фільтр отримає `1,299.00 ₴` і дасть або `0`, або помилку. І ніколи не діли на 100 руками: копійки зникнуть, роздільники теж, а зміна формату в адмінці сайт не зачепить.',
    },
    {
      type: 'note',
      tone: 'interview',
      title: 'Чому ціни в копійках і звідки береться формат',
      text: 'Відповідай так: «Shopify зберігає гроші як integer у сотих частках валюти, щоб не мати справи з дробами. Формат output — налаштування магазину (`shop.money_format`), тому в темі я ніколи не пишу символ валюти руками, а застосовую `money`. Якщо число потрібне коду — беру `money_without_currency`, бо в ньому немає ні символа, ні пробілів». Далі часто питають про мультивалютність: у магазині з кількома валютами в кошику і на чеку безпечніше `money_with_currency`, бо `120.00 ₴` і `120.00 $` інакше не розрізнити.',
    },

    { type: 'h', text: 'Зображення: image_url і image_tag' },
    {
      type: 'example',
      title: 'Від обʼєкта до тега',
      preset: 'product',
      view: 'html',
      template: `{{ product.featured_image | image_url: width: 400 }}

{{ product.featured_image | image_url: width: 400 | image_tag }}

{{ product.featured_image | image_url: width: 400, height: 400, crop: 'center' | image_tag: alt: product.title, class: 'card__img', loading: 'lazy' }}`,
      note: 'Картинки лежать на CDN, і розмір потрібної копії задається **прямо в адресі**, тому шлях завжди один: обʼєкт (`product`, `variant`, `collection` або саме зображення) → `image_url` → `image_tag`. Другий рядок показує головне про `image_tag`: `width` він бере **з адреси**, яку йому передали, а `alt` ставить порожній — і саме тому його завжди задають самому. Третій рядок — робочий варіант із картки товару: квадратний кадр, свій `alt`, свій клас і `loading="lazy"`.',
    },
    {
      type: 'table',
      head: ['Параметр `image_url`', 'Значення', 'Що робить'],
      rows: [
        ['`width`', 'число', 'ширина в пікселях'],
        ['`height`', 'число', 'висота; хоча б один із двох — `width` або `height` — обовʼязковий'],
        ['`crop`', '`center`, `top`, `bottom`, `left`, `right`', 'як обрізати, коли пропорції кадру не збігаються з заданими'],
        ['`format`', '`jpg`, `pjpg`', 'примусовий формат файлу'],
        ['`pad_color`', 'hex без решітки', 'колір полів, якщо оригінал менший за запит'],
        ['`quality`', '10–90', 'якість стиснення (пісочниця цей параметр в адресу не дописує)'],
      ],
    },
    {
      type: 'note',
      tone: 'warn',
      title: 'Без розміру image_url — помилка',
      text: '`{{ product.featured_image | image_url }}` не поверне «оригінал», а зламає рендер: `width` або `height` обовʼязковий. Причина проста — CDN не має віддавати гігантський вихідний файл випадково. Друга пастка — product **без фото**: `featured_image` там `nil`, `image_url` віддасть порожній string, а `image_tag` з порожнього string не зробить нічого. Порожній `<img>` у розмітку не потрапить, але й дірка в сітці лишиться — тому для них малюють `placeholder_svg_tag`.',
    },
    {
      type: 'example',
      title: 'Сітка, де в одного product немає фото',
      preset: 'collection',
      view: 'html',
      template: `<ul class="grid">
{%- for product in collection.products %}
  <li>
    {%- if product.featured_image %}
      {{ product.featured_image | image_url: width: 300 | image_tag: alt: product.title }}
    {%- else %}
      {{ product.title | placeholder_svg_tag: 'grid__placeholder' }}
    {%- endif %}
    <h3>{{ product.title }}</h3>
  </li>
{%- endfor %}
</ul>`,
      note: 'Останній product у колекції — «Кондиціонер щоденний» — лишився без фото і замість дірки отримав сірий SVG-заповнювач. Це стандартний прийом тем Shopify: сітка не має «стрибати» через те, що продавчиня не завантажила знімок.',
    },
    {
      type: 'note',
      tone: 'shopify',
      title: 'Ніколи не виводь image.src напряму',
      text: '`{{ product.featured_image.src }}` дасть адресу **оригіналу** — це може бути 4000 пікселів і кілька мегабайтів на кожну картку в сітці. `image_url: width: 300` просить у CDN рівно ту копію, що потрібна. Для адаптивності передають кілька ширин у `srcset` (`image_tag` має параметри `widths` і `sizes`), а найперше зображення на сторінці — LCP-кадр — ще й прелоадять. Це перше, на що дивиться ревʼю теми в Shopify.',
    },

    { type: 'h', text: 'Pagination: paginate' },
    {
      type: 'example',
      title: 'Сторінка друга з трьох',
      preset: 'collection',
      data: { current_page: 2 },
      view: 'html',
      template: `{% paginate collection.products by 2 %}
<p>Сторінка {{ paginate.current_page }} з {{ paginate.pages }} · усього товарів {{ paginate.items }} · на цій сторінці {{ collection.products.size }}</p>
<ul>
{%- for product in collection.products %}
  <li>{{ product.title }} — {{ product.price | money }}</li>
{%- endfor %}
</ul>
<nav class="pagination">{{ paginate | default_pagination }}</nav>
{% endpaginate %}`,
      note: 'У `collection.products` пʼять елементів, `by 2` — отже 3 сторінки. `collection.products.size` усередині тега дорівнює 2: це вже **сторінка**, а не вся колекція. У справжньому магазині сторінку обирає адреса (`?page=2`) — у пісочниці цю роль грає змінна `current_page` у даних прикладу, спробуй поставити 1 або 3. Фільтр `default_pagination` малює готову навігацію з `paginate.parts`.',
    },
    {
      type: 'note',
      tone: 'shopify',
      title: 'Цифри, які варто памʼятати',
      text: '`{% for %}` у Shopify робить щонайбільше **50 ітерацій на сторінку**, тож `collection.products` на 120 елементів без `{% paginate %}` цикл обірве на 50-му. Розмір сторінки — від 1 до 250. Пагінувати можна не все підряд, а лише те, що платформа вміє ділити на сторінки: `collection.products`, `blog.articles`, `collections`, `product.variants`, `customer.orders`, `customer.addresses`, `article.comments`, `search.results` і списки з налаштувань. Далі 25 000-го елемента pagination не пускає — глибокі сторінки треба відсікати фільтрами, а не гортанням. `default_pagination` приймає параметри `previous`, `next` і `anchor`, але зазвичай навігацію збирають руками з `paginate.parts`, щоб керувати розміткою й `aria`-атрибутами.',
    },
    {
      type: 'note',
      tone: 'interview',
      title: 'Чому не можна просто пройтись циклом',
      text: 'Питання-перевірка на реальний досвід. «`for` у Shopify обмежений 50 ітераціями на сторінку, тому будь-який довгий список — колекцію, статті блога, замовлення customer — я загортаю в `{% paginate %}`. Усередині тега той самий шлях віддає поточну сторінку, а обʼєкт `paginate` дає номер сторінки, кількість сторінок і частини навігації». Сильне доповнення: `paginate` не можна ставити всередину іншого `paginate`, а щоб догортати сітку без перезавантаження сторінки, беруть Section Rendering API і перемальовують секцію цілком.',
    },

    { type: 'h', text: 'Форми і тексти' },
    {
      type: 'example',
      title: 'Кнопка «Додати в кошик» і переклади',
      preset: 'all',
      view: 'html',
      data: {
        locales: {
          products: { product: { add_to_cart: 'Додати в кошик', sold_out: 'Немає в наявності' } },
          cart: { items_count: { one: '{{ count }} товар у кошику', other: '{{ count }} товарів у кошику' } },
        },
      },
      template: `{%- assign variant = product.selected_or_first_available_variant -%}
{% form 'product', product, id: 'add-to-cart', class: 'product-form' %}
  <input type="hidden" name="id" value="{{ variant.id }}">
  <input type="number" name="quantity" value="1" min="1">
  <button type="submit" name="add"{% unless variant.available %} disabled{% endunless %}>
    {%- if variant.available %}{{ 'products.product.add_to_cart' | t }}{% else %}{{ 'products.product.sold_out' | t }}{% endif -%}
  </button>
{% endform %}

<p>{{ 'cart.items_count' | t: count: cart.item_count }}</p>
<p>{{ 'cart.items_count' | t: count: 1 }}</p>
<p>{{ 'products.product.price_label' | t }}</p>`,
      note: 'Подивись на згенерований `<form>`: `action="/cart/add"`, `method="post"` і приховане поле `form_type` зʼявилися самі — це і є весь сенс тега. У `name="id"` кладуть **id варіанта**, бо до cart їде варіант. Фільтр `t` бере ключ зі словника (у темі це `locales/uk.json`), підставляє змінні (`{{ count }}`) і сам обирає форму однини чи множини за параметром `count`. Останній рядок — ключ, якого в словнику немає: сторінка не падає, а виводить маркер `translation missing`, і це саме те, що ти побачиш у браузері, коли забудеш додати ключ у файл перекладів.',
    },
    {
      type: 'note',
      tone: 'shopify',
      title: 'Типи форм і їхні дані',
      text: 'Форми в темі не пишуть руками: адреса, метод і приховані поля в Shopify свої, а помилка тут означає, що додавання до cart не спрацює. Тип — перший аргумент: `product` (додавання до cart, потрібен `product`), `cart` (оновити кількості й піти на чекаут, потрібен `cart`), `contact`, `customer_login`, `create_customer`, `recover_customer_password`, `customer_address`, `new_comment`, `localization`, `storefront_password`. Усередині тега зʼявляється обʼєкт `form`: `form.errors` — список полів із помилками після невдалої відправки, `form.posted_successfully?` — ознака успіху, за якою показують «дякуємо». Іменовані аргументи (`id:`, `class:`, `novalidate:`) їдуть у сам тег, а `return_to:` каже, куди перейти після відправки.',
    },
    {
      type: 'note',
      tone: 'interview',
      title: 'Навіщо t, якщо магазин одномовний',
      text: 'Відповідь, яка виглядає дорослою: «Тексти теми живуть у `locales/*.json` і виводяться через `t` з трьох причин: продавчиня може змінити будь-який напис у редакторі теми без коду, тема готова до другої мови без переписування розмітки, і всі підписи зібрані в одному файлі, а не розсипані по тридцяти сніпетах. Ключі іменую за структурою — `products.product.add_to_cart`». Далі питають про множину: у словнику лишають форми `one`/`other` і передають `count:`, а не клеять string конкатенацією — у різних мовах правил множини різна кількість.',
    },
  ],
  exercises: [
    {
      id: 'l16-e1',
      title: 'Ціна для людини і для коду',
      task: [
        'Виведи ціну product двічі: у `data`-атрибуті — числом без валюти, у тексті — у форматі магазину.',
        'Розмітка: `<p class="price" data-price="799.00">799.00 ₴</p>`.',
        'Якщо `compare_at_price` **більша** за ціну, додай другим рядком `<p class="save"><s>999.00 ₴</s> економія 200.00 ₴</p>`. Немає знижки — немає й цього абзацу.',
      ],
      preset: 'shop',
      data: { product: { title: 'Сироватка для кінчиків', price: 79900, compare_at_price: 99900 } },
      altData: { product: { title: 'Гребінь карбоновий', price: 30000, compare_at_price: null } },
      starter: `<p class="price">{{ product.price }} ₴</p>
{% comment %} data-price — числом без валюти, знижка — окремим абзацом {% endcomment %}`,
      solution: `<p class="price" data-price="{{ product.price | money_without_currency }}">{{ product.price | money }}</p>
{% if product.compare_at_price > product.price %}
  {%- assign saving = product.compare_at_price | minus: product.price %}
  <p class="save"><s>{{ product.compare_at_price | money }}</s> економія {{ saving | money }}</p>
{% endif %}`,
      mustUse: [{ pattern: '\\|\\s*money_without_currency\\b', label: 'Число для `data`-атрибута дає `money_without_currency`' }],
      view: 'html',
      hints: [
        'Для атрибута потрібне число без символа валюти — це `money_without_currency`; для тексту — звичайний `money`.',
        'Економію рахуй **до** форматування: `product.compare_at_price | minus: product.price`, і вже результат — через `money`.',
        'Умова знижки — `{% if product.compare_at_price > product.price %}`: вона сама відсіє `nil`.',
      ],
      explain:
        'Два формати однієї суми — щоденна ситуація: людина читає `799.00 ₴`, а JavaScript перераховує cart і йому потрібне чисте число. Якби ти поклав у `data-price` результат `money`, скрипт отримав би string із пробілами й символом валюти і мовчки порахував би `NaN`. І запамʼятай порядок: `minus` до `money`, ніколи навпаки.',
    },
    {
      id: 'l16-e2',
      title: 'Картинки сітки з заповнювачем',
      task: [
        'Виведи `<ul class="grid">`, а в ньому по одному `<li>` на кожен product із масиву `products`.',
        'Якщо в product є `featured_image` — виведи картинку шириною **400** через `image_url` і `image_tag`, передавши `alt` із назви product і клас `card__img`. Має вийти саме такий тег: `<img src="…&width=400" alt="Шампунь із кератином" width="400" class="card__img">`.',
        'Якщо фото немає — замість картинки виведи `{{ product.title | placeholder_svg_tag: \'card__img\' }}`.',
        'Після картинки в кожному `<li>` — `<h3>` із назвою product.',
      ],
      preset: 'shop',
      data: {
        products: [
          { title: 'Шампунь із кератином', featured_image: shot('keratin-shampoo', 'Флакон шампуню') },
          { title: 'Кондиціонер щоденний', featured_image: null },
        ],
      },
      altData: {
        products: [
          { title: 'Олійка для кінчиків', featured_image: null },
          { title: 'Маска глибокого відновлення', featured_image: shot('deep-repair-mask', 'Банка маски') },
        ],
      },
      starter: `<ul class="grid">
{% for product in products %}
  <li>
    {% comment %} картинка 400px або заповнювач {% endcomment %}
    <h3>{{ product.title }}</h3>
  </li>
{% endfor %}
</ul>`,
      solution: `<ul class="grid">
{% for product in products %}
  <li>
    {% if product.featured_image %}
      {{ product.featured_image | image_url: width: 400 | image_tag: alt: product.title, class: 'card__img' }}
    {% else %}
      {{ product.title | placeholder_svg_tag: 'card__img' }}
    {% endif %}
    <h3>{{ product.title }}</h3>
  </li>
{% endfor %}
</ul>`,
      mustUse: [
        { pattern: '\\|\\s*image_url\\b', label: 'Адресу картинки будує `image_url`' },
        { pattern: '\\|\\s*image_tag\\b', label: 'Тег `<img>` збирає `image_tag`, а не руками' },
      ],
      view: 'html',
      hints: [
        'Ланцюжок читається зліва направо: обʼєкт зображення → `image_url: width: 400` → `image_tag`.',
        '`alt` і клас передаються саме в `image_tag` іменованими аргументами через кому: `image_tag: alt: product.title, class: \'card__img\'`.',
        'Product без фото має `featured_image` = `nil`, тож розвилка — звичайний `{% if product.featured_image %} … {% else %} … {% endif %}`.',
      ],
      explain:
        'Прихована перевірка міняє елементи місцями: без фото там уже **перший**. Розмітка, яка малює заповнювач «останньому», на ній розсиплеться. А `alt` задають завжди: `image_tag` без нього ставить `alt=""`, і зчитувач екрана просто промовчить про картку.',
    },
    {
      id: 'l16-e3',
      title: 'Сторінки колекції',
      task: [
        'У `collection.products` пʼять елементів. Розбий їх на сторінки **по 2** і виведи лише поточну.',
        'Розмітка: `<ul class="grid">` з `<li>Назва — ціна через money</li>`, під ним `<p class="counter">Сторінка 2 з 3</p>`, а якщо сторінок більше однієї — ще й `<nav class="pagination">` із навігацією від `default_pagination`.',
        'Номер поточної сторінки й кількість сторінок бери з обʼєкта `paginate`, а не рахуй самотужки.',
      ],
      preset: 'collection',
      data: { current_page: 2 },
      altData: { current_page: 3 },
      starter: `<ul class="grid">
{% for product in collection.products %}
  <li>{{ product.title }} — {{ product.price | money }}</li>
{% endfor %}
</ul>
{% comment %} Розбий на сторінки по 2 і додай лічильник та навігацію {% endcomment %}`,
      solution: `{% paginate collection.products by 2 %}
<ul class="grid">
{% for product in collection.products %}
  <li>{{ product.title }} — {{ product.price | money }}</li>
{% endfor %}
</ul>
<p class="counter">Сторінка {{ paginate.current_page }} з {{ paginate.pages }}</p>
{% if paginate.pages > 1 %}
  <nav class="pagination">{{ paginate | default_pagination }}</nav>
{% endif %}
{% endpaginate %}`,
      mustUse: [
        { pattern: '\\{%-?\\s*paginate\\s', label: 'Список ріже тег `{% paginate … by 2 %}`' },
        { pattern: '\\|\\s*default_pagination\\b', label: 'Навігацію малює `default_pagination`' },
      ],
      view: 'html',
      hints: [
        'Загорни ВЕСЬ блок — і сітку, і лічильник, і навігацію — у `{% paginate collection.products by 2 %} … {% endpaginate %}`. Поза тегом обʼєкта `paginate` не існує.',
        'Цикл усередині тега лишається тим самим: `collection.products` там уже дорівнює поточній сторінці.',
        '`{{ paginate.current_page }}`, `{{ paginate.pages }}`, а вся навігація — `{{ paginate | default_pagination }}`.',
      ],
      explain:
        'Найнесподіваніше тут те, що цикл **не змінився**. `paginate` підміняє масив за тим самим шляхом, тож сітку не доводиться переписувати — її просто загортають. Прихована перевірка перемикає сторінку на третю: рішення, яке вивело б усі пʼять елементів або написало «Сторінка 2» текстом, на ній одразу видно.',
    },
    {
      id: 'l16-e4',
      title: 'Форма додавання до cart',
      task: [
        'Збери блок покупки для сторінки товару. Форму згенеруй тегом `{% form %}` типу `product` — не пиши `<form>` руками.',
        'Усередині: приховане поле `<input type="hidden" name="id" value="…">` з **id поточного варіанта**, `<p class="price">` із його ціною через `money` і `<button type="submit" name="add">`.',
        'Напис на кнопці бери зі словника перекладів: `products.product.add_to_cart`, коли варіант доступний, і `products.product.sold_out`, коли ні. Недоступному варіанту додай атрибут `disabled` — саме так: `<button type="submit" name="add" disabled>`.',
      ],
      preset: 'shop',
      data: {
        product: {
          title: 'Шампунь із кератином',
          selected_or_first_available_variant: v(11, '250 мл', 64900),
        },
        locales: uaLocales('Додати в кошик', 'Немає в наявності'),
      },
      altData: {
        product: {
          title: 'Термозахисний спрей',
          selected_or_first_available_variant: v(31, 'Default Title', 52000, false),
        },
        locales: uaLocales('У кошик', 'Розпродано'),
      },
      starter: `<form action="/cart/add" method="post">
  <input type="hidden" name="id" value="11">
  <p class="price">649.00 ₴</p>
  <button type="submit" name="add">Додати в кошик</button>
</form>`,
      solution: `{% assign variant = product.selected_or_first_available_variant %}
{% form 'product', product %}
  <input type="hidden" name="id" value="{{ variant.id }}">
  <p class="price">{{ variant.price | money }}</p>
  <button type="submit" name="add"{% unless variant.available %} disabled{% endunless %}>
    {%- if variant.available %}{{ 'products.product.add_to_cart' | t }}{% else %}{{ 'products.product.sold_out' | t }}{% endif -%}
  </button>
{% endform %}`,
      mustUse: [
        { pattern: '\\{%-?\\s*form\\s', label: 'Форму генерує тег `{% form %}`' },
        { pattern: '\\|\\s*t\\b', label: 'Написи беруться зі словника фільтром `t`' },
      ],
      view: 'html',
      hints: [
        'Тег форми: `{% form \'product\', product %} … {% endform %}`. Приховані поля Shopify (`form_type`, `utf8`) він додасть сам.',
        'Поточний варіант — `product.selected_or_first_available_variant`; поклади його в змінну через `assign`, далі бери `variant.id`, `variant.price`, `variant.available`.',
        'Напис: `{{ \'products.product.add_to_cart\' | t }}`, а `disabled` зручно дописати через `{% unless variant.available %} disabled{% endunless %}` прямо в тегу кнопки.',
      ],
      explain:
        'Стартовий варіант виглядає майже правильним — і не працює: без прихованого `form_type` Shopify не знає, що робити з відправкою, а адреса `/cart/add` у магазині з мовними префіксами буде іншою. Прихована перевірка ще й підсовує **недоступний** варіант з іншим словником: тоді кнопка мусить сама стати `disabled` і сама змінити напис. Це і є сенс `t` — текст приходить із даних, а не з розмітки.',
    },
  ],
  quiz: [
    {
      id: 'l16-q1',
      q: 'Формат магазину — `{{amount}} ₴`. Що виведе цей код?',
      template: '{{ 129900 | money }} / {{ 129900 | money_without_trailing_zeros }}',
      preset: 'shop',
      options: ['1,299.00 ₴ / 1,299 ₴', '129900 ₴ / 129900 ₴', '1,299.00 ₴ / 1,299.00 ₴', '1299.00 ₴ / 1299 ₴'],
      correct: 0,
      explain: '`money` розставляє роздільник тисяч і дві десяткові, `money_without_trailing_zeros` прибирає `.00` у круглих сум. Якби в ціні були копійки (`129950`), другий фільтр вивів би те саме, що й перший.',
    },
    {
      id: 'l16-q2',
      q: 'У `collection.products` пʼять елементів. Що виведе цей код?',
      template: '{% paginate collection.products by 2 %}{{ paginate.pages }} / {{ paginate.items }} / {{ collection.products.size }}{% endpaginate %}',
      preset: 'collection',
      options: ['3 / 5 / 5', '3 / 5 / 2', '2 / 5 / 5', '3 / 2 / 5'],
      correct: 1,
      explain: 'Сторінок — 3 (пʼять елементів по 2), `paginate.items` — довжина **всього** масиву, а `collection.products` усередині тега вже підмінений поточною сторінкою, тож її розмір — 2.',
    },
    {
      id: 'l16-q3',
      q: 'Що станеться з `{{ product.featured_image | image_url }}` без параметрів?',
      options: [
        'Поверне адресу оригінального файлу — CDN віддасть картинку в повному розмірі',
        'Помилка: `image_url` вимагає `width` або `height`',
        'Поверне порожній рядок, сторінка відрендериться без картинки',
        'Поверне адресу з розміром `master` — це синонім оригіналу',
      ],
      correct: 1,
      explain: 'Розмір — обовʼязковий: CDN не віддає оригінал випадково. Порожній string `image_url` повертає в іншому випадку — коли на вхід прийшов `nil` (product без фото).',
    },
    {
      id: 'l16-q4',
      q: 'У словнику перекладів немає ключа `products.product.price_label`, локаль магазину — `uk`. Що виведе код?',
      template: "{{ 'products.product.price_label' | t }}",
      preset: 'shop',
      options: [
        'Порожній рядок',
        'products.product.price_label',
        'translation missing: uk.products.product.price_label',
        'Помилка: undefined translation key',
      ],
      correct: 2,
      explain: 'Відсутній ключ не ламає сторінку — Shopify виводить маркер `translation missing: <локаль>.<ключ>`. Побачив таке в браузері — шукай ключ не в Liquid, а у файлі `locales/<мова>.json`.',
    },
  ],
  docs: ['shopify/money-filters', 'shopify/images', 'shopify/collection-and-pagination', 'shopify/forms', 'shopify/locales'],
  topics: ['objects', 'practical'],
}


/* ═════════════════════════════ l17 ═════════════════════════════ */

/** Товар у тій мінімальній формі, якої вистачає картці сітки. */
const card = (title: string, price: number, available: boolean, tags: string[], compare: number | null = null) => ({
  title,
  price,
  compare_at_price: compare,
  available,
  tags,
})

const l17: Lesson = {
  id: 'l17',
  module: 6,
  title: 'Performance, debugging, типові помилки',
  goal: 'Писатимеш шаблони, які не роблять зайвої роботи, читатимеш `Liquid error` і впізнаватимеш пʼять багів, на яких горить кожен другий: truthy порожнього string, ізольований `render`, цілочисельне ділення, вкладений `forloop` і фільтрація всередині циклу.',
  minutes: 35,
  blocks: [
    {
      type: 'p',
      text: 'Liquid виконується **на сервері Shopify при кожному запиті** — результат віддається браузеру вже готовим HTML. Отже, усе, що ти написав у шаблоні, додається до часу першого байта: не до «лагів анімації», а до тієї паузи, коли на екрані ще нічого немає. Дебагера тут теж немає: ні брейкпойнтів, ні `console.log`. Цей урок — про те, як не створювати роботи на рівному місці і як шукати причину, коли сторінка вже зламалась.',
    },

    { type: 'h', text: 'Рахуй один раз: фільтруй ДО циклу' },
    {
      type: 'example',
      title: 'Те саме двома способами',
      preset: 'collection',
      template: `Повільно: {% for product in collection.products %}{% if product.available %}{{ product.title }}; {% endif %}{% endfor %}

Швидко: {% assign in_stock = collection.products | where: 'available', true %}{% for product in in_stock %}{{ product.title }}; {% endfor %}
Доступних: {{ in_stock.size }}`,
      note: 'Головне правило performance звучить нудно: **не роби всередині циклу того, що можна зробити до нього**. Фільтри масивів (`where`, `map`, `sort`, `reject`) проходять масив **один раз**, а `{% if %}` у тілі циклу виконується стільки разів, скільки в масиві елементів. Output однаковий, робота — ні. У другому варіанті масив відфільтрувався один раз, а цикл крутиться лише по потрібних елементах. Бонусом зʼявилось те, чого перший варіант не має взагалі: `in_stock.size` — кількість доступних **до** початку циклу. У першому її довелося б накопичувати лічильником.',
    },
    {
      type: 'example',
      title: 'Незмінне — поза цикл',
      preset: 'collection',
      template: `{%- assign hot_title = 'Хіт' | upcase -%}
{%- assign urls = collection.products | map: 'url' -%}
{% for product in collection.products %}
{{ hot_title }}: {{ product.title }} → {{ urls[forloop.index0] }}
{%- endfor %}`,
      note: 'Значення `hot_title` не залежить від ітерації — отже, рахується один раз до циклу, а не пʼять разів усередині. Те саме з будь-яким `capture`, зверненням до налаштувань або важким ланцюжком фільтрів: підняв його над `{% for %}` — і зекономив рівно стільки, скільки в колекції елементів.',
    },
    {
      type: 'note',
      tone: 'warn',
      title: 'Усе в тілі циклу множиться на N',
      text: 'Найдорожче, що можна покласти в цикл, — це ще один цикл або `{% render %}` зі своїм циклом усередині. Сітка на 50 карток, де кожна перебирає теги (їх буває 10–15), — це вже 750 порівнянь замість 50. А `{% render %}` усередині циклу — 50 окремих рендерів сніпета. Іноді інакше не можна, але тоді хоча б перевіряй умову **зовні**: `{% if product.available %}{% render \'card\' %}{% endif %}` дешевше, ніж рендерити сніпет, який сам вирішить нічого не малювати.',
    },

    { type: 'h', text: 'Сніпети: рендер теж коштує' },
    {
      type: 'example',
      title: 'render із for замість for із render',
      preset: 'collection',
      view: 'html',
      snippets: { card: '<li>{{ forloop.index }}. {{ product.title }}</li>' },
      template: `<ul>
{% render 'card' for collection.products as product %}
</ul>`,
      note: 'Форма `{% render \'сніпет\' for масив as змінна %}` робить те саме, що цикл із `{% render %}` усередині, але коротше — і сніпет усередині отримує звичайний `forloop`. Зверни увагу: передавати `product` окремо не треба, імʼя задає `as`.',
    },
    {
      type: 'note',
      tone: 'shopify',
      title: 'Цифри платформи, які варто памʼятати',
      text: 'У `{% for %}` — **50 ітерацій** на сторінку, далі лише `{% paginate %}` (1–250 на сторінку). Звернень за handle (`all_products[\'…\']`) — **20 унікальних** на сторінку. Час рендера теми бачать двома інструментами: Shopify **Theme Inspector** для Chrome розписує, скільки мілісекунд зайняв кожен рядок Liquid, а в адмінці теми є звіт Lighthouse. Правило приймання просте: побачив у профілі «гарячий» рядок усередині циклу — виноси його назовні.',
    },

    { type: 'h', text: 'Вкладені цикли: майже завжди зайві' },
    {
      type: 'example',
      title: 'Пошук тега: цикл проти contains',
      preset: 'shop',
      data: {
        products: [
          { title: 'Шампунь із кератином', tags: ['догляд', 'кератин', 'хіт'] },
          { title: 'Пензель для масок', tags: ['інструмент'] },
        ],
      },
      template: `Цикл у циклі:
{%- for product in products %}
{{ product.title }}:{% for tag in product.tags %}{% if tag == 'хіт' %} хіт{% endif %}{% endfor %}
{%- endfor %}

Одне порівняння:
{%- for product in products %}
{{ product.title }}:{% if product.tags contains 'хіт' %} хіт{% endif %}
{%- endfor %}`,
      note: 'Оператор `contains` перевіряє наявність елемента в масиві сам — і робить це без вкладеного циклу. Той самий прийом закриває більшість вкладених циклів: шукаєш один елемент — бери `contains`, `where`, `find` або `map`, а не перебір руками.',
    },
    {
      type: 'note',
      tone: 'interview',
      title: 'Сторінка колекції гальмує — твої дії?',
      text: 'Відповідай по порядку, від дешевого до дорогого: «Спершу дивлюсь у Theme Inspector, який саме рядок Liquid їсть час. Далі перевіряю класику: фільтрація масивів усередині циклу замість `where` до нього, вкладені цикли по тегах, `{% render %}` на кожну картку з важкою логікою, звернення до `all_products` за handle у циклі. Виношу незмінні обчислення над цикл, зменшую розмір сторінки в `paginate`, прошу в `image_url` рівно ту ширину, яка потрібна». Наприкінці згадай межу відповідальності: «Якщо після цього час рендера все одно великий, значить, роботу треба перенести з сервера в браузер — Section Rendering API або окремий запит із JavaScript».',
    },

    { type: 'h', text: 'Debugging: json — твій console.log' },
    {
      type: 'example',
      title: 'Подивитись, що насправді в обʼєкті',
      preset: 'product',
      template: `{{ product.variants | map: 'title' | json }}
{{ product.metafields.custom | json }}
{{ product.featured_image | json }}`,
      note: 'Фільтр `json` виводить значення як є — і одразу відповідає на два питання: «чи є взагалі це поле» і «якого воно типу». `"64900"` у лапках замість `64900` пояснює, чому математика не працює; `null` пояснює, чому умова не спрацювала. У живій темі такий виклик ховають у HTML-коментар (`<!-- {{ product | json }} -->`) і прибирають перед релізом — інакше внутрішні дані поїдуть у розмітку до відвідувачів.',
    },
    {
      type: 'example',
      title: 'forloop у вкладеному циклі — завжди внутрішній',
      data: {
        groups: [
          { title: 'Догляд', items: ['Шампунь', 'Маска'] },
          { title: 'Стайлінг', items: ['Спрей'] },
        ],
      },
      template: `{%- for group in groups %}
Група {{ forloop.index }}: {{ group.title }}
{%- assign group_no = forloop.index -%}
{% for item in group.items %}
  {{ forloop.index }} (у групі {{ group_no }}) — {{ item }}
{%- endfor %}
{%- endfor %}`,
      note: 'Усередині внутрішнього циклу `forloop` — це **внутрішній** цикл: `forloop.index` перезапускається з одиниці в кожній групі. Щоб не втратити номер зовнішнього, його запамʼятовують у змінній **перед** вкладеним циклом. Це не косметика: на цьому багу нумерація в таблицях і `aria`-атрибути регулярно виходять неправильними. Те саме вміє `forloop.parentloop` (приклад нижче), але проміжна змінна читається зрозуміліше й не ламається, коли циклів стає три.',
    },
    {
      type: 'code',
      lang: 'liquid',
      title: 'У справжньому Shopify є ще forloop.parentloop',
      code: `{% for group in groups %}
  {% for item in group.items %}
    {{ forloop.parentloop.index }}.{{ forloop.index }} — {{ item }}
  {% endfor %}
{% endfor %}`,
    },
    {
      type: 'note',
      tone: 'warn',
      title: 'Як читати Liquid error',
      text: 'Shopify не «кладе» сторінку через помилку в шаблоні: він виводить на її місці `Liquid error: …` і рендерить далі. Тому білий екран — це майже ніколи не Liquid, а от дивний текст посеред картки — майже завжди він. Читай так: `Liquid error (sections/main-product line 42): divided by 0` — у дужках **файл і рядок**, де саме впало, далі причина. Якщо у дужках імʼя сніпета, а не секції, — шукай у сніпеті, але памʼятай, що зіпсовані дані туди міг передати той, хто його викликав. У пісочниці таких «мʼяких» помилок немає: вона зупиняє рендер і показує повідомлення повністю — так помилку важче проґавити.',
    },

    { type: 'h', text: 'Три баги, які ловлять усіх' },
    {
      type: 'example',
      title: 'Порожній string і цілочисельне ділення',
      data: { heading: '', discount: 7, total: 2 },
      template: `[{% if heading %}truthy{% else %}falsy{% endif %}]
[{% if heading != blank %}є текст{% else %}порожньо{% endif %}]
[{% if heading == empty %}empty{% endif %}]

{{ discount | divided_by: total }}
{{ discount | divided_by: 2.0 }}
{{ discount | times: 1.0 | divided_by: total }}`,
      shopifyOutput: 'Останній рядок у справжньому Shopify дасть 3.5: там `7 | times: 1.0` — це вже float 7.0. Пісочниця вважає 7.0 за integer і ділить націло.',
      note: 'Перший блок: **порожній string у Liquid truthy**, тож `{% if heading %}` пропускає порожнє налаштування далі й лишає в розмітці пустий тег. Falsy у Liquid лише двоє — `false` і `nil`; усе інше, включно з `0`, `\'\'` і порожнім масивом, — truthy. Другий блок: ціле на ціле ділиться **націло**, 7 / 2 = 3. Щоб отримати 3.5, дільник має бути float — `2.0`.',
    },
    {
      type: 'example',
      title: 'render не бачить твоїх змінних',
      view: 'html',
      snippets: { badge: '<span class="badge badge--{{ tone }}">{{ label }}</span>' },
      template: `{%- assign label = 'Хіт продажу' -%}
{%- assign tone = 'hot' -%}
Без параметрів: {% render 'badge' %}
З параметрами: {% render 'badge', label: label, tone: tone %}`,
      note: 'Перший виклик дав порожній бейдж із обірваним класом — і це не помилка, а правило: `{% render %}` створює **чистий scope** (власний простір змінних), і змінні, створені через `assign` зовні, туди не потрапляють. Ізольовані саме **твої** змінні: глобальні обʼєкти (`shop`, `cart`, `settings`) і сторінковий обʼєкт на кшталт `product` сніпет бачить без передавання. Зворотний бік правила: змінна, створена всередині сніпета, назовні не витікає.',
    },
    {
      type: 'note',
      tone: 'interview',
      title: 'Як ти дебажиш Liquid, якщо дебагера немає',
      text: 'Готова відповідь: «Виводжу підозріле значення фільтром `json` — одразу видно і наявність поля, і тип. Звужую: виводжу обʼєкт цілком, потім конкретну гілку. Перевіряю scope — чи справді змінна дійшла до сніпета, бо `render` ізольований. Читаю `Liquid error` уважно: у дужках файл і рядок. Для performance беру Theme Inspector». Додай чесну межу: «Liquid рендериться один раз на сервері, тому все, що змінюється після завантаження — вибір варіанта, лічильник кошика, — дебажиться вже в браузері, а не в шаблоні».',
    },
  ],
  exercises: [
    {
      id: 'l17-e1',
      title: 'Порожні налаштування лишають порожні теги',
      task: [
        'Секцію відрендерили — і в HTML зʼявились `<h2></h2>` та кнопка без посилання. Причина класична: перевірки зроблені «на truthy», а порожній string у Liquid truthy.',
        'Полагодь розмітку. Заголовок `<h2>` виводиться, лише коли `heading` **не порожній**; `<p class="sub">` — лише коли не порожній `subheading`.',
        'Кнопка `<a class="btn" href="…">напис</a>` зʼявляється, лише коли **обидва** поля — `button_label` і `link` — не порожні.',
      ],
      data: { section: { id: 'main', settings: { heading: 'Догляд удома', subheading: '', button_label: 'До каталогу', link: '' } } },
      altData: { section: { id: 'main', settings: { heading: '', subheading: 'Безсульфатні формули', button_label: 'Дивитись', link: '/collections/all' } } },
      starter: `<h2>{{ section.settings.heading }}</h2>
{% if section.settings.subheading %}<p class="sub">{{ section.settings.subheading }}</p>{% endif %}
{% if section.settings.button_label %}<a class="btn" href="{{ section.settings.link }}">{{ section.settings.button_label }}</a>{% endif %}`,
      solution: `{% if section.settings.heading != blank %}<h2>{{ section.settings.heading }}</h2>{% endif %}
{% if section.settings.subheading != blank %}<p class="sub">{{ section.settings.subheading }}</p>{% endif %}
{% if section.settings.button_label != blank and section.settings.link != blank %}<a class="btn" href="{{ section.settings.link }}">{{ section.settings.button_label }}</a>{% endif %}`,
      mustUse: [{ pattern: '!=\\s*blank', label: 'Порожні значення відсіює порівняння з `blank`' }],
      view: 'html',
      hints: [
        'Falsy у Liquid лише `false` і `nil`. Порожній string truthy, тому `{% if section.settings.heading %}` його пропускає.',
        'Правильна перевірка текстового поля — `{% if section.settings.heading != blank %}`.',
        'Дві умови обʼєднує `and`: `{% if section.settings.button_label != blank and section.settings.link != blank %}`.',
      ],
      explain:
        'Прихована перевірка міняє картину місцями: там порожній уже заголовок, зате кнопка повноцінна. Рішення, яке «полагодило» лише видимий випадок, на ній падає. Запамʼятай пару: `blank` — порожній або складений з пробілів string, `empty` — порожній масив, string або обʼєкт. Для текстових налаштувань потрібен саме `blank`.',
    },
    {
      id: 'l17-e2',
      title: 'Перепиши без циклу з умовою',
      task: [
        'Цей код працює, але робить зайву роботу: фільтрує масив **усередині** циклу й накопичує лічильник вручну.',
        'Перепиши так, щоб фільтрація сталася **один раз до циклу** фільтром `where`, а кількість бралася з `size`. Жодного `{% if %}` у рішенні бути не повинно.',
        'Порядок розмітки: спершу `<p class="count">Доступно: 3 з 5</p>`, потім `<ul>` зі `<li>` на кожен доступний product.',
      ],
      data: {
        products: [
          card('Шампунь із кератином', 64900, true, ['догляд']),
          card('Термозахисний спрей', 52000, false, ['стайлінг']),
          card('Олійка для кінчиків', 39900, true, ['догляд']),
          card('Кондиціонер щоденний', 58000, true, ['догляд']),
          card('Пензель для масок', 18000, false, ['інструмент']),
        ],
      },
      altData: {
        products: [
          card('Маска глибокого відновлення', 84900, false, ['догляд']),
          card('Гребінь карбоновий', 30000, true, ['інструмент']),
          card('Сироватка для кінчиків', 79900, false, ['догляд']),
        ],
      },
      starter: `{% assign count = 0 %}
<ul>
{% for product in products %}
  {% if product.available %}{% assign count = count | plus: 1 %}<li>{{ product.title }}</li>{% endif %}
{% endfor %}
</ul>
<p class="count">Доступно: {{ count }} з {{ products.size }}</p>`,
      solution: `{% assign in_stock = products | where: 'available', true %}
<p class="count">Доступно: {{ in_stock.size }} з {{ products.size }}</p>
<ul>
{% for product in in_stock %}
  <li>{{ product.title }}</li>
{% endfor %}
</ul>`,
      mustUse: [{ pattern: '\\|\\s*where\\b', label: 'Масив фільтрується `where` до циклу' }],
      mustNotUse: [{ pattern: '\\{%-?\\s*if\\b', label: 'У рішенні немає жодного `{% if %}`' }],
      view: 'html',
      hints: [
        '`{% assign in_stock = products | where: \'available\', true %}` — і масив уже відфільтрований.',
        'Кількість доступних — `in_stock.size`, рахувати лічильником не треба.',
        'Цикл після цього крутиться по `in_stock`, а всередині лишається сам `<li>`.',
      ],
      explain:
        'Виграш тут не лише в швидкості. Лічильник у старому варіанті доводилось виводити **після** списку — бо до кінця циклу його значення ще невідоме. Щойно фільтрація переїхала нагору, розмітку можна складати в будь-якому порядку: `size` відомий одразу. Так майже завжди й буває: код, який менше працює, ще й простіше читається.',
    },
    {
      id: 'l17-e3',
      title: 'Сніпет малює порожній бейдж',
      task: [
        'Сніпет `price-badge` виводить `<span class="badge badge--{{ tone }}">{{ label }}</span>`. Зараз у розмітку потрапляє `<span class="badge badge--"></span>` — порожньо.',
        'Причина — scope: `{% render %}` не бачить змінних, створених зовні. Полагодь **виклик**, не чіпаючи самого сніпета.',
        'Результат: для доступного product — `<span class="badge badge--ok">В наявності</span>`, для недоступного — `<span class="badge badge--off">Немає</span>`.',
      ],
      snippets: { 'price-badge': '<span class="badge badge--{{ tone }}">{{ label }}</span>' },
      data: { product: { title: 'Шампунь із кератином', available: true } },
      altData: { product: { title: 'Термозахисний спрей', available: false } },
      starter: `{% if product.available %}
  {% assign label = 'В наявності' %}{% assign tone = 'ok' %}
{% else %}
  {% assign label = 'Немає' %}{% assign tone = 'off' %}
{% endif %}
{% render 'price-badge' %}`,
      solution: `{% if product.available %}
  {% assign label = 'В наявності' %}{% assign tone = 'ok' %}
{% else %}
  {% assign label = 'Немає' %}{% assign tone = 'off' %}
{% endif %}
{% render 'price-badge', label: label, tone: tone %}`,
      mustUse: [{ pattern: "render\\s+['\"]price-badge['\"]\\s*,", label: 'Дані передані в сніпет параметрами `render`' }],
      view: 'html',
      hints: [
        '`{% render %}` створює чистий scope: усе, що сніпету потрібно, передають параметрами.',
        'Параметри пишуться через кому одразу після імені: `{% render \'сніпет\', ключ: значення %}`.',
        'Імена параметрів мають збігатися з тим, що сніпет виводить, — тут це `label` і `tone`.',
      ],
      explain:
        'Ізоляція `render` — не примха, а гарантія: сніпет не може ні прочитати випадкову змінну ззовні, ні зіпсувати її своїм `assign`. Тому його можна вставити в будь-яку секцію й не боятись, що десь є свій `label`. Старий `{% include %}` цієї гарантії не дає — він ділить scope з батьком, і саме тому Shopify радить його не використовувати.',
    },
    {
      id: 'l17-e4',
      title: 'Картка: і виправити, і прискорити',
      task: [
        'У цій сітці три проблеми. **Перша**: бейдж «Хіт» шукається вкладеним циклом по тегах — замінити на `contains`. **Друга**: ціна ділиться на 100 руками — замінити на `money`. **Третя**: стара ціна показується, щойно `compare_at_price` не порожня, тож product із «старою» ціною **нижчою** за чинну отримує безглуздий `<s>`.',
        'Виправ усі три, не змінюючи структури: `<li>` з `<h3>`, потім бейдж (лише для product з тегом `хіт`), потім `<p class="price">` із ціною через `money`, потім `<s>` зі старою ціною — лише коли вона справді більша за чинну.',
        'Зразок: `<h3>Шампунь із кератином</h3><span class="badge">Хіт</span><p class="price">649.00 ₴</p><s>799.00 ₴</s>`.',
      ],
      preset: 'shop',
      data: {
        collection: {
          title: 'Домашній догляд',
          products: [
            card('Шампунь із кератином', 64900, true, ['догляд', 'хіт'], 79900),
            card('Олійка для кінчиків', 39900, true, ['хіт'], null),
            card('Пензель для масок', 18000, true, ['інструмент'], 12000),
          ],
        },
      },
      altData: {
        collection: {
          title: 'Розпродаж',
          products: [
            card('Гребінь карбоновий', 30000, true, ['хіт', 'інструмент'], 40000),
            card('Маска глибокого відновлення', 84900, true, ['догляд'], 60000),
          ],
        },
      },
      starter: `<ul class="grid">
{% for product in collection.products %}
  <li>
    <h3>{{ product.title }}</h3>
    {% for tag in product.tags %}{% if tag == 'хіт' %}<span class="badge">Хіт</span>{% endif %}{% endfor %}
    <p class="price">{{ product.price | divided_by: 100 }} ₴</p>
    {% if product.compare_at_price %}<s>{{ product.compare_at_price | divided_by: 100 }} ₴</s>{% endif %}
  </li>
{% endfor %}
</ul>`,
      solution: `<ul class="grid">
{% for product in collection.products %}
  <li>
    <h3>{{ product.title }}</h3>
    {% if product.tags contains 'хіт' %}<span class="badge">Хіт</span>{% endif %}
    <p class="price">{{ product.price | money }}</p>
    {% if product.compare_at_price > product.price %}<s>{{ product.compare_at_price | money }}</s>{% endif %}
  </li>
{% endfor %}
</ul>`,
      mustUse: [{ pattern: '\\bcontains\\b', label: 'Тег шукає оператор `contains`, а не вкладений цикл' }],
      mustNotUse: [{ pattern: '\\bfor\\s+\\w+\\s+in\\s+product\\.tags\\b', label: 'Вкладеного циклу по `product.tags` не лишилось' }],
      view: 'html',
      hints: [
        '`{% if product.tags contains \'хіт\' %}` замінює весь внутрішній цикл разом з умовою.',
        'Ціна в копійках форматується фільтром `money` — ділити на 100 не треба ніколи.',
        'Стару ціну показують лише за умови `product.compare_at_price > product.price`: це відсікає і `nil`, і помилково занижену «стару» ціну.',
      ],
      explain:
        'Три різні баги — одна причина: код писали «щоб запрацювало на цих даних». Вкладений цикл працює, поки тегів мало; `divided_by: 100` виглядає правильно, поки ціна рівна; `{% if compare_at_price %}` не заважає, поки продавчиня не помилилась. Прихована перевірка підсовує саме ці випадки — product із занадто низькою «старою» ціною і тег `хіт` на першому місці в масиві. Так і виглядає реальна робота: баг живе рівно до того дня, коли в магазин заводять нові дані.',
    },
  ],
  quiz: [
    {
      id: 'l17-q1',
      q: 'Що виведе цей код?',
      template: '{{ 7 | divided_by: 2 }} / {{ 7 | divided_by: 2.0 }}',
      options: ['3.5 / 3.5', '3 / 3.5', '3 / 3', '4 / 3.5'],
      correct: 1,
      explain: 'Ціле на ціле Liquid ділить **націло**: 7 / 2 = 3. Float у результаті зʼявляється, лише коли дільник записаний як float (`2.0`). Це улюблене питання співбесід і найчастіша причина нульових відсотків у бейджах знижки.',
    },
    {
      id: 'l17-q2',
      q: 'У зовнішньому масиві дві групи: у першій два елементи, у другій один. Що виведе код?',
      template: '{% for g in groups %}{% for i in g.items %}{{ forloop.index }}{% endfor %}{% endfor %}',
      data: { groups: [{ items: ['a', 'b'] }, { items: ['c'] }] },
      options: ['121', '123', '112', '111'],
      correct: 0,
      explain: 'Усередині вкладеного циклу `forloop` завжди описує **внутрішній** цикл, і його лічильник перезапускається в кожній групі: 1, 2 — потім знову 1. Номер зовнішнього циклу треба зберегти у змінну перед вкладеним (або взяти `forloop.parentloop` у справжньому Shopify).',
    },
    {
      id: 'l17-q3',
      q: 'Змінна `s` — порожній string. Які з трьох умов спрацюють?',
      template: "{% assign s = '' %}{% if s %}A{% endif %}{% if s == blank %}B{% endif %}{% if s == empty %}C{% endif %}",
      options: ['ABC', 'BC', 'AB', 'C'],
      correct: 0,
      explain: 'Спрацюють **усі три**. Порожній string truthy (falsy у Liquid лише `false` і `nil`), при цьому він дорівнює і `blank`, і `empty`. Саме через перше й зʼявляються порожні теги в розмітці: `{% if setting %}` пропускає стерте налаштування далі.',
    },
    {
      id: 'l17-q4',
      q: 'Сторінка колекції з 50 товарами рендериться довго. Що з переліченого НЕ зменшить час рендера Liquid?',
      options: [
        'Винести `{% assign %}` з незмінним обчисленням за межі циклу',
        'Замінити цикл по `product.tags` на оператор `contains`',
        'Замінити `{% for %}` з `{% if product.available %}` усередині на `where` до циклу',
        'Додати `loading="lazy"` до картинок у сітці',
      ],
      correct: 3,
      explain: '`loading="lazy"` — чудова оптимізація, але **браузерна**: вона відкладає завантаження зображень уже після того, як сервер віддав HTML. Час рендера Liquid вона не змінює взагалі. Решта три прибирають роботу саме з серверного етапу.',
    },
  ],
  docs: ['shopify/performance', 'shopify/debugging', 'basics/truthy-and-falsy', 'shopify/snippets-render', 'tags/iteration'],
  topics: ['performance', 'debugging'],
}


/* ═════════════════════════════ l18 ═════════════════════════════ */

/** Товар для фінальних завдань: рівно ті поля, які читає картка чи сітка. */
const item = (title: string, price: number, available: boolean, image: ReturnType<typeof shot> | null = null) => ({
  title,
  price,
  available,
  featured_image: image,
  url: `/products/${title.length}-${price}`,
})

const l18: Lesson = {
  id: 'l18',
  module: 6,
  title: 'Фінальний проєкт: картка товару, сітка колекції, кошик',
  goal: 'Зібереш чотири шматки справжньої теми — картку товару, сітку колекції, кошик і секцію зі схемою — і перевіриш їх за чеклістом, за яким тему приймають.',
  minutes: 45,
  blocks: [
    {
      type: 'p',
      text: 'Останній урок не приносить нового синтаксису — усе потрібне ти вже знаєш. Приносить він інше: **звичку складати шматки разом**. Реальне завдання ніколи не звучить як «зроби цикл»; воно звучить як «зроби картку товару», а всередині виявляються гроші, картинка, наявність, знижка, порожні стани й доступність. Нижче — спосіб підходити до такої задачі й чекліст, за яким роботу потім приймають.',
    },

    { type: 'h', text: 'Як підходити до задачі' },
    {
      type: 'list',
      ordered: true,
      items: [
        '**Подивись на дані, а не на дизайн.** `{{ обʼєкт | json }}` за пʼять секунд скаже, які поля є насправді і якого вони типу. Половина помилок у темах — від упевненості, що поле називається інакше.',
        '**Напиши щасливий шлях.** Product із фото, ціною і наявністю. Без умов, без `else` — просто розмітка з `{{ }}`. Так швидше видно структуру.',
        '**Перелічи порожні стани.** Немає фото. Немає знижки. Розпродано. Порожня колекція. Порожній cart. Продавчиня стерла заголовок. Кожен із них — окрема гілка, і кожен реально трапляється.',
        '**Винеси повторюване.** Однакова картка в сітці й у «схожих товарах» — це сніпет із параметрами. Обчислення, що не залежить від ітерації, — `assign` над циклом.',
        '**Перевір вартість.** Фільтрація масивів — до циклу, вкладені цикли — на `contains`/`where`, `image_url` просить рівно ту ширину, яка потрібна.',
        '**Вичитай доступність і розмітку.** `alt` у картинок, `<button>` замість `<div>` для кнопок, текст стану замість самого лише кольору.',
      ],
    },
    {
      type: 'example',
      title: 'Крок перший: що взагалі є в даних',
      preset: 'product',
      template: `Назва: {{ product.title }}
Поля варіанта: {{ product.variants.first | json }}
Фото: {{ product.featured_image.width }}×{{ product.featured_image.height }}
Теги: {{ product.tags | json }}`,
      note: 'Другий рядок відповідає на головне питання картки: що саме можна взяти з варіанта. Видно і `compare_at_price: 79900`, і `available: true`, і `sku` — і одразу зрозуміло, що бейдж знижки будувати є з чого. Такий «розвідувальний» рядок пишуть першим і прибирають останнім.',
    },
    {
      type: 'example',
      title: 'Крок третій: аудит порожніх станів',
      preset: 'collection',
      template: `{% for product in collection.products -%}
{{ product.title }} →{% unless product.featured_image %} без фото{% endunless %}{% unless product.available %} розпродано{% endunless %}{% if product.compare_at_price > product.price %} зі знижкою{% endif %}{% if product.featured_image and product.available and product.compare_at_price == nil %} звичайний{% endif %}
{% endfor %}`,
      note: 'Пʼять елементів — і вже чотири різні комбінації стану. Такий прохід по даних займає хвилину, а економить годину: одразу видно, що картка мусить пережити і відсутнє фото, і розпроданий product. У справжній колекції станів більше, але принцип той самий — спершу перелічи, потім кодуй.',
    },
    {
      type: 'note',
      tone: 'warn',
      title: 'Порожній стан — це половина роботи, а не край задачі',
      text: 'Найчастіша причина повернути роботу на доопрацювання — не бага в логіці, а `<h2></h2>` у розмітці, дірка на місці фото, «Разом: ₴» у порожньому cart чи бейдж «−0%». Перевіряй текстові налаштування через `!= blank`, знижку — через `compare_at_price > price`, а не через truthy, порожній масив — через `{% else %}` у циклі. І памʼятай, що порожній cart бачать частіше, ніж повний.',
    },

    { type: 'h', text: 'Чекліст якості шаблону' },
    {
      type: 'table',
      head: ['Що перевіряєш', 'Як має бути', 'Типова помилка'],
      rows: [
        ['Гроші', 'усі суми через `money*`, арифметика — до фільтра', '`divided_by: 100` і символ валюти руками'],
        ['Зображення', '`image_url` із потрібною шириною + `image_tag` з `alt`', '`image.src` напряму або `alt` за замовчуванням'],
        ['Порожні стани', 'немає фото, немає знижки, розпродано, порожній список', 'верстка «щасливого шляху» без жодного `else`'],
        ['Налаштування', 'текстові — через `!= blank`, у схемі є `default`', '`{% if settings.heading %}` і порожній тег у HTML'],
        ['Блоки', '`{% case block.type %}`, `block.shopify_attributes`, порожній стан', 'розмітка розрахована на один тип блока'],
        ['Performance', '`where`/`contains` до циклу, `paginate` для довгих списків', 'фільтр усередині циклу й `for` на 200 елементів'],
        ['Тексти', 'підписи через `t`, а не текстом у розмітці', '«Додати в кошик» прямо в `<button>`'],
        ['Доступність', '`alt`, семантичні теги, стан словами', 'бейдж, який «видно» лише за кольором'],
      ],
    },
    {
      type: 'note',
      tone: 'interview',
      title: 'Розкажи, як ти зробив би сторінку товару з нуля',
      text: 'Це питання не про синтаксис, а про порядок думок. Відповідай структурою: «Сторінка товару — це шаблон `templates/product.json`, у ньому секція `main-product` зі схемою. Дані беру з `product` і з `product.selected_or_first_available_variant` — ціна, `id` і наявність завжди з варіанта, бо до cart їде він. Ціни форматую `money`, картинки — `image_url` плюс `image_tag` із `srcset`. Кнопку загортаю в `{% form \'product\', product %}`, приховане поле `id` — варіант. Повторювані шматки — картка, бейдж, ціна — виношу у сніпети з параметрами. Перемикання варіанта — вже JavaScript, бо Liquid рендериться один раз». Наприкінці додай про порожні стани: «Окремо перевіряю product без фото, без знижки й розпроданий».',
    },
    {
      type: 'note',
      tone: 'interview',
      title: 'Що ти перевіряєш, перш ніж віддати тему',
      text: 'Сильна відповідь звучить як чекліст, а не як «ну, дивлюсь, щоб працювало»: «Проходжу порожні стани — порожня колекція, порожній cart, секція без блоків, product без фото. Дивлюсь, чи всі суми пройшли через `money` і чи ніде немає ділення на 100. Перевіряю, що тексти в `locales`, а не в розмітці, і що в кожної картинки є `alt`. Далі Theme Inspector на найважчій сторінці — зазвичай це колекція — і Lighthouse. І обовʼязково відкриваю редактор теми: додаю секцію з нуля, видаляю всі блоки, стираю заголовок — секція має пережити все троє».',
    },
  ],
  exercises: [
    {
      id: 'l18-e1',
      title: 'Картка товару',
      task: [
        'Збери картку товару для сторінки товару. Ціну, наявність і знижку бери з **поточного варіанта** (`product.selected_or_first_available_variant`).',
        'Структура: `<article class="card">`, у ньому — картинка, `<h1>` з назвою, `<p class="price">` з ціною через `money`, `<p class="sale">` (лише зі знижкою) і `<p class="stock">` зі станом наявності.',
        'Картинка: шириною **600** через `image_url` і `image_tag` з `alt` із назви product і класом `card__img`. Немає фото — виведи `{{ product.title | placeholder_svg_tag: \'card__img\' }}`.',
        'Знижка справжня, лише коли `compare_at_price` більша за ціну. Тоді: `<p class="sale"><s>799.00 ₴</s> <span class="badge">−18%</span></p>` — відсоток як integer, мінус символом `−`.',
        'Наявність: доступний варіант — `<p class="stock">В наявності</p>`, недоступний — `<p class="stock stock--out">Немає в наявності</p>`.',
      ],
      preset: 'shop',
      data: {
        product: {
          title: 'Шампунь із кератином',
          featured_image: shot('keratin-shampoo', 'Флакон шампуню'),
          selected_or_first_available_variant: v(11, '250 мл', 64900, true, 79900),
        },
      },
      altData: {
        product: {
          title: 'Термозахисний спрей',
          featured_image: null,
          selected_or_first_available_variant: v(31, 'Default Title', 52000, false),
        },
      },
      starter: `<article class="card">
  {% comment %} картинка 600px або заповнювач {% endcomment %}
  <h1>{{ product.title }}</h1>
  <p class="price">{{ product.price }}</p>
  {% comment %} знижка і стан наявності {% endcomment %}
</article>`,
      solution: `{% assign variant = product.selected_or_first_available_variant %}
<article class="card">
  {% if product.featured_image %}
    {{ product.featured_image | image_url: width: 600 | image_tag: alt: product.title, class: 'card__img' }}
  {% else %}
    {{ product.title | placeholder_svg_tag: 'card__img' }}
  {% endif %}
  <h1>{{ product.title }}</h1>
  <p class="price">{{ variant.price | money }}</p>
  {% if variant.compare_at_price > variant.price %}
    {%- assign saving = variant.compare_at_price | minus: variant.price %}
    <p class="sale"><s>{{ variant.compare_at_price | money }}</s> <span class="badge">−{{ saving | times: 100 | divided_by: variant.compare_at_price }}%</span></p>
  {% endif %}
  {% if variant.available %}
    <p class="stock">В наявності</p>
  {% else %}
    <p class="stock stock--out">Немає в наявності</p>
  {% endif %}
</article>`,
      mustUse: [
        { pattern: '\\|\\s*money\\b', label: 'Суми форматує `money`' },
        { pattern: '\\|\\s*image_url\\b', label: 'Адресу картинки будує `image_url`' },
      ],
      view: 'html',
      hints: [
        'Почни з `{% assign variant = product.selected_or_first_available_variant %}` — далі вся картка читає `variant.price`, `variant.compare_at_price` і `variant.available`.',
        'Відсоток знижки: спершу `minus`, потім `times: 100`, і лише тоді `divided_by: variant.compare_at_price`. Інший порядок дасть нуль.',
        'Картинка — ланцюжок `product.featured_image | image_url: width: 600 | image_tag: alt: product.title, class: \'card__img\'`, а гілка `{% else %}` малює `placeholder_svg_tag`.',
      ],
      explain:
        'Прихована перевірка підсовує найгірший реальний випадок — product без фото, без знижки й розпроданий. Картка, зібрана лише на «щасливому шляху», на ньому розсипається одразу в трьох місцях — і саме такі три місця найчастіше знаходить приймальник. Зверни увагу, що всі три числа — ціна, стара ціна, наявність — взяті з варіанта, а не з product: `product.price` показав би мінімальну ціну, а `product.available` — наявність хоч одного варіанта.',
    },
    {
      id: 'l18-e2',
      title: 'Сітка колекції',
      task: [
        'Виведи сітку колекції: **лише доступні** product, відсортовані за ціною від дешевших до дорожчих.',
        'Якщо доступних product немає — виведи тільки `<p class="empty">У цій колекції поки немає товарів у наявності</p>`.',
        'Інакше: `<p class="count">Товарів: 3</p>`, далі `<ul class="grid">`, а в ньому на кожен product — `<li><h3>Назва</h3><p class="price">399.00 ₴</p></li>`.',
        'Фільтруй і сортуй **до** циклу — усередині циклу не має лишитись жодної умови.',
      ],
      preset: 'shop',
      data: {
        collection: {
          title: 'Домашній догляд',
          products: [
            item('Шампунь із кератином', 64900, true),
            item('Термозахисний спрей', 52000, false),
            item('Олійка для кінчиків', 39900, true),
            item('Кондиціонер щоденний', 58000, true),
          ],
        },
      },
      altData: {
        collection: {
          title: 'Інструменти',
          products: [item('Пензель для масок', 18000, false), item('Гребінь карбоновий', 30000, false)],
        },
      },
      starter: `<ul class="grid">
{% for product in collection.products %}
  <li><h3>{{ product.title }}</h3><p class="price">{{ product.price | money }}</p></li>
{% endfor %}
</ul>`,
      solution: `{% assign items = collection.products | where: 'available', true | sort: 'price' %}
{% if items.size > 0 %}
  <p class="count">Товарів: {{ items.size }}</p>
  <ul class="grid">
  {% for product in items %}
    <li><h3>{{ product.title }}</h3><p class="price">{{ product.price | money }}</p></li>
  {% endfor %}
  </ul>
{% else %}
  <p class="empty">У цій колекції поки немає товарів у наявності</p>
{% endif %}`,
      mustUse: [
        { pattern: '\\|\\s*where\\b', label: 'Доступні product відбирає `where` до циклу' },
        { pattern: '\\|\\s*sort\\b', label: 'Сортування робить фільтр `sort`' },
      ],
      view: 'html',
      hints: [
        'Фільтри масивів складаються в ланцюжок: `collection.products | where: \'available\', true | sort: \'price\'`.',
        'Кількість бери з `.size` відфільтрованого масиву — лічильник усередині циклу не потрібен.',
        'Порожній стан — це `{% if items.size > 0 %} … {% else %} … {% endif %}` навколо всієї сітки (або `{% for %}…{% else %}`, якщо лічильник тобі не заважає).',
      ],
      explain:
        'Прихована перевірка віддає колекцію, у якій доступних product немає взагалі, — і рішення без порожнього стану мовчки виводить порожній `<ul>` із заголовком «Товарів: 0». Це типова дірка в сітках: фільтр написали, а про те, що після фільтра може не лишитись нічого, забули. І зверни увагу на порядок фільтрів: `sort` після `where` сортує лише те, що лишилось, — тобто робить менше роботи.',
    },
    {
      id: 'l18-e3',
      title: 'Сторінка cart',
      task: [
        'Збери сторінку cart. Порожній cart — це лише `<p class="empty">Кошик порожній</p>` і більше нічого.',
        'Непорожній: `<table class="cart">`, у ньому на кожен line item — `<tr class="line">` із трьома комірками: `<td class="title">` з `item.title`, `<td class="qty">× 2</td>` і `<td class="sum">` із сумою line item через `money`.',
        'Якщо на line item є знижка (`item.line_level_total_discount` більший за нуль), у комірці суми після ціни додай ` <s>849.00 ₴</s>` — початкову суму line item (`item.original_line_price`).',
        'Під таблицею: `<p class="totals">Позицій: 3 · одиниць: 6</p>`, потім — лише якщо `cart.total_discount` більший за нуль — `<p class="discount">Знижка: 84.90 ₴</p>`, і наприкінці `<p class="total">Разом: 3,759.10 ₴</p>`.',
      ],
      preset: 'shop',
      data: {
        cart: cartOf([
          { id: 11, title: 'Шампунь із кератином', variant: '400 мл', vendor: 'Cocochoco', price: 89900, quantity: 2 },
          { id: 21, title: 'Маска глибокого відновлення', variant: null, vendor: 'Inoar', price: 84900, quantity: 1, discount: 8490 },
          { id: 41, title: 'Олійка для кінчиків', variant: null, vendor: 'Inoar', price: 39900, quantity: 3 },
        ]),
      },
      altData: { cart: cartOf([]) },
      starter: `<table class="cart">
{% for item in cart.items %}
  <tr class="line">
    <td class="title">{{ item.title }}</td>
    <td class="qty">× {{ item.quantity }}</td>
    <td class="sum">{{ item.final_line_price }}</td>
  </tr>
{% endfor %}
</table>
{% comment %} підсумки і порожній кошик {% endcomment %}`,
      solution: `{% if cart.item_count == 0 %}
  <p class="empty">Кошик порожній</p>
{% else %}
  <table class="cart">
  {% for item in cart.items %}
    <tr class="line">
      <td class="title">{{ item.title }}</td>
      <td class="qty">× {{ item.quantity }}</td>
      <td class="sum">{{ item.final_line_price | money }}{% if item.line_level_total_discount > 0 %} <s>{{ item.original_line_price | money }}</s>{% endif %}</td>
    </tr>
  {% endfor %}
  </table>
  <p class="totals">Позицій: {{ cart.items.size }} · одиниць: {{ cart.item_count }}</p>
  {% if cart.total_discount > 0 %}<p class="discount">Знижка: {{ cart.total_discount | money }}</p>{% endif %}
  <p class="total">Разом: {{ cart.total_price | money }}</p>
{% endif %}`,
      mustUse: [
        { pattern: '\\bfor\\s+\\w+\\s+in\\s+cart\\.items\\b', label: 'Line items виводить цикл по `cart.items`' },
        { pattern: '\\|\\s*money\\b', label: 'Усі суми проходять через `money`' },
      ],
      view: 'html',
      hints: [
        'Почни з розгалуження `{% if cart.item_count == 0 %}` — у порожній гілці не має бути ні таблиці, ні підсумків.',
        '«Позицій» — це `cart.items.size` (кількість line items), «одиниць» — `cart.item_count` (сума кількостей). Їх легко переплутати.',
        'Знижка на line item перевіряється як `{% if item.line_level_total_discount > 0 %}`, а загальна — як `{% if cart.total_discount > 0 %}`.',
      ],
      explain:
        'Cart — найкращий тест на акуратність, бо в ньому сходяться всі три види сум: сума line item (`final_line_price`), початкова (`original_line_price`) і підсумкова (`cart.total_price`). Плутанина між `original` і `final` дає найнеприємнішу помилку: людина бачить одну суму, а на чекауті — іншу. Прихована перевірка віддає порожній cart — стан, який на живому сайті бачать частіше за будь-який інший.',
    },
    {
      id: 'l18-e4',
      title: 'Секція «Хіти продажу»',
      task: [
        'Допиши секцію. У схемі вже є налаштування `heading` і блок типу `pick`. Додай: налаштування типу `range` з `id` `columns` (`min` 2, `max` 5, `step` 1, `default` 3) і другий тип блока — `link` із налаштуваннями `label` (`text`, за замовчуванням `Дивитись усі`) і `url` (`url`). У пресет додай третім блоком `link` з `"url": "/collections/all"`.',
        'Розмітка: `<section class="picks picks--cols-3">` — число в класі береться з `columns`. Усередині — `<h2>` із заголовком, далі цикл по блоках.',
        'Блок `pick` — `<article class="pick" {{ block.shopify_attributes }}><h3>{{ block.settings.title }}</h3></article>`. Блок `link` — `<a class="picks__link" href="{{ block.settings.url }}" {{ block.shopify_attributes }}>{{ block.settings.label }}</a>`. Тип розбирай через `case`, атрибут редактора став останнім у тегу.',
        'Якщо блоків немає — замість них `<p class="empty">Додайте блоки в редакторі теми</p>` (гілка `{% else %}` циклу).',
      ],
      altData: {
        section: {
          id: 'alt',
          settings: { heading: 'Новинки осені', columns: 5 },
          blocks: [
            { id: 'b1', type: 'link', settings: { label: 'Уся колекція', url: '/collections/new' }, shopify_attributes: 'data-shopify-editor-block="b1"' },
            { id: 'b2', type: 'pick', settings: { title: 'Маска глибокого відновлення' }, shopify_attributes: 'data-shopify-editor-block="b2"' },
          ],
        },
      },
      starter: `<section class="picks">
  <h2>{{ section.settings.heading }}</h2>
  {% for block in section.blocks %}
    <article class="pick" {{ block.shopify_attributes }}><h3>{{ block.settings.title }}</h3></article>
  {% endfor %}
</section>

{% schema %}
{
  "name": "Хіти продажу",
  "settings": [
    { "type": "text", "id": "heading", "label": "Заголовок", "default": "Хіти продажу" }
  ],
  "blocks": [
    {
      "type": "pick",
      "name": "Товар",
      "settings": [
        { "type": "text", "id": "title", "label": "Назва", "default": "Новий товар" }
      ]
    }
  ],
  "presets": [
    {
      "name": "Хіти продажу",
      "blocks": [
        { "type": "pick", "settings": { "title": "Шампунь із кератином" } },
        { "type": "pick", "settings": { "title": "Олійка для кінчиків" } }
      ]
    }
  ]
}
{% endschema %}`,
      solution: `<section class="picks picks--cols-{{ section.settings.columns }}">
  <h2>{{ section.settings.heading }}</h2>
  {% for block in section.blocks %}
    {% case block.type %}
      {% when 'pick' %}
        <article class="pick" {{ block.shopify_attributes }}><h3>{{ block.settings.title }}</h3></article>
      {% when 'link' %}
        <a class="picks__link" href="{{ block.settings.url }}" {{ block.shopify_attributes }}>{{ block.settings.label }}</a>
    {% endcase %}
  {% else %}
    <p class="empty">Додайте блоки в редакторі теми</p>
  {% endfor %}
</section>

{% schema %}
{
  "name": "Хіти продажу",
  "settings": [
    { "type": "text", "id": "heading", "label": "Заголовок", "default": "Хіти продажу" },
    { "type": "range", "id": "columns", "label": "Колонок", "min": 2, "max": 5, "step": 1, "default": 3 }
  ],
  "blocks": [
    {
      "type": "pick",
      "name": "Товар",
      "settings": [
        { "type": "text", "id": "title", "label": "Назва", "default": "Новий товар" }
      ]
    },
    {
      "type": "link",
      "name": "Посилання",
      "settings": [
        { "type": "text", "id": "label", "label": "Напис", "default": "Дивитись усі" },
        { "type": "url", "id": "url", "label": "Адреса" }
      ]
    }
  ],
  "presets": [
    {
      "name": "Хіти продажу",
      "blocks": [
        { "type": "pick", "settings": { "title": "Шампунь із кератином" } },
        { "type": "pick", "settings": { "title": "Олійка для кінчиків" } },
        { "type": "link", "settings": { "url": "/collections/all" } }
      ]
    }
  ]
}
{% endschema %}`,
      mustUse: [
        { pattern: '"type"\\s*:\\s*"range"', label: 'У схемі зʼявилось налаштування типу `range`' },
        { pattern: '\\{%-?\\s*case\\s+block\\.type', label: 'Типи блоків розбирає `{% case block.type %}`' },
      ],
      view: 'html',
      hints: [
        '`range` вимагає всіх чотирьох ключів: `min`, `max`, `step` і `default` — без будь-якого з них схема не пройде валідацію.',
        'Новий тип блока — ще один обʼєкт у масиві `blocks`, а в пресеті на нього посилаються записом `{ "type": "link", "settings": { "url": "/collections/all" } }`: напис підтягнеться з `default`.',
        'Порожній стан — це `{% else %}` **усередині `{% for %}`**, а не окремий `{% if %}`; `case` стоїть у тілі циклу.',
      ],
      explain:
        'Тут зійшлось усе, що робить секцію придатною до редактора: `default` у схемі (щойно доданий блок уже щось показує), `presets` (без них секцію не можна додати кнопкою «Add section»), `case` (порядок і склад блоків визначає продавчиня, а не ти), `shopify_attributes` (клік по елементу в превʼю відкриває його налаштування) і порожній стан (вона може видалити всі блоки). Прихована перевірка ставить `link` **першим** і міняє кількість колонок — саме так виглядає секція після того, як її посували в редакторі.',
    },
  ],
  quiz: [
    {
      id: 'l18-q1',
      q: 'Ціна — 64900, стара ціна — 79900. Що виведе код бейджа знижки?',
      template: '{% assign price = 64900 %}{% assign compare = 79900 %}−{{ compare | minus: price | times: 100 | divided_by: compare }}%',
      options: ['−18%', '−19%', '−0%', '−18.77%'],
      correct: 0,
      explain: 'Різниця 15000, помножена на 100 — 1500000, поділена на 79900 — 18 (integer на integer ділиться націло, залишок відкидається). Якби `times: 100` стояв після ділення, вийшло б `−0%`: саме так і виглядає найчастіша помилка в бейджах.',
    },
    {
      id: 'l18-q2',
      q: 'У колекції немає жодного доступного product. Що виведе цей код?',
      template: "{% assign items = collection.products | where: 'available', true %}{% for product in items %}{{ product.title }}{% else %}Порожньо{% endfor %}",
      data: { collection: { products: [{ title: 'Пензель', available: false }, { title: 'Гребінь', available: false }] } },
      options: ['Порожньо', 'ПензельГребінь', 'Нічого — гілка else у циклі не існує', 'Помилка: items is nil'],
      correct: 0,
      explain: 'Гілка `{% else %}` у циклі виконується саме тоді, коли масив порожній, — а після `where` він таким і став. Це найкоротший спосіб закрити порожній стан сітки: без додаткового `{% if %}` і без перевірки `size`.',
    },
    {
      id: 'l18-q3',
      q: 'Секція написана бездоганно, але продавчиня не може додати її в редакторі теми — кнопка «Add section» її не показує. Чого бракує?',
      options: [
        'Ключа `presets` у схемі',
        'Тега `{% section %}` у `layout/theme.liquid`',
        'Атрибута `block.shopify_attributes` у розмітці',
        'Ключа `max_blocks` у схемі',
      ],
      correct: 0,
      explain: 'Без `presets` секція існує, але додати її через редактор не можна — лише вписати в JSON-шаблон руками або підключити статично тегом `{% section %}`. `shopify_attributes` впливає на зручність редагування, `max_blocks` — лише на ліміт блоків.',
    },
    {
      id: 'l18-q4',
      q: 'Який з цих недоліків картки товару приймальник теми назве **блокувальним**, а не зауваженням?',
      options: [
        'У бейджі знижки відсоток не округлено до десятих',
        'Ціна виведена як `{{ variant.price | divided_by: 100 }} ₴`',
        'Класи названі не за БЕМ',
        'Сніпет картки не має коментаря з описом параметрів',
      ],
      correct: 1,
      explain: 'Ділення на 100 руками ламає саме те, заради чого існує магазин: копійки зникають, роздільники тисяч теж, а формат із налаштувань магазину (і мультивалютність) ігнорується. Решта — питання смаку й супроводу, з ними тему приймуть.',
    },
  ],
  docs: ['shopify/product-and-variant', 'shopify/collection-and-pagination', 'shopify/cart', 'shopify/sections-and-schema', 'shopify/performance'],
  topics: ['practical', 'architecture', 'sections'],
}

export const lessonsPart4: Lesson[] = [l14, l15, l16, l17, l18]
