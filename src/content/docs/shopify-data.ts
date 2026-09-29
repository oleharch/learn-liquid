import type { Block, DocPage, Example, Inline, NoteTone } from '../types'

/* Короткі конструктори блоків: сторінок багато, а шум `{ type: … }` заважає читати сам текст. */
const p = (text: Inline): Block => ({ type: 'p', text })
const h = (text: string): Block => ({ type: 'h', text })
const note = (tone: NoteTone, title: string, text: Inline): Block => ({ type: 'note', tone, title, text })
const ex = (e: Example): Block => ({ type: 'example', ...e })
const code = (lang: 'liquid' | 'json' | 'html' | 'text' | 'js' | 'css', source: string, title?: string): Block => ({
  type: 'code',
  lang,
  code: source,
  title,
})
const table = (head: string[], rows: Inline[][]): Block => ({ type: 'table', head, rows })

/* ───────────────────────── 1. Огляд обʼєктів ───────────────────────── */

const objectsOverview: DocPage = {
  slug: 'objects-overview',
  section: 'shopify',
  title: 'Обʼєкти Shopify: що звідки береться',
  summary:
    'Глобальні обʼєкти, обʼєкти сторінки й контекстні; що таке Drop і чому властивості «ліниві»; доступ до ресурсів за handle та його ліміт; `request`, `template`, `routes`, `shop`, `settings`, `localization`.',
  officialUrl: 'https://shopify.dev/docs/api/liquid/objects',
  related: ['shopify/product-and-variant', 'shopify/collection-and-pagination', 'shopify/theme-settings', 'shopify/performance', 'basics/types'],
  blocks: [
    p('Сам Liquid нічого не знає про магазин: це мова з тегами й фільтрами. Усе, що робить її корисною в темі, — **обʼєкти**, які Shopify кладе в шаблон перед рендером: `product`, `cart`, `shop`. Перше, що треба тримати в голові, — обʼєкти не однаково доступні. Частина є скрізь, частина — лише на «своїй» сторінці, частина існує тільки всередині певного тега.'),
    table(
      ['Вид', 'Приклади', 'Де доступні'],
      [
        ['Глобальні', '`shop`, `cart`, `customer`, `settings`, `routes`, `request`, `template`, `localization`, `collections`, `all_products`, `linklists`, `pages`, `blogs`, `metaobjects`, `page_title`, `canonical_url`', 'У будь-якому файлі теми: layout, шаблон, секція, сніпет'],
        ['Обʼєкти сторінки', '`product`, `collection`, `blog`, `article`, `page`, `search`, `current_tags`', 'Лише коли рендериться відповідний шаблон: `product` — у шаблоні product, `search` — у шаблоні search'],
        ['Контекстні', '`section`, `block`, `forloop`, `paginate`, `form`, `predictive_search`, `recommendations`', 'Усередині свого тега чи файлу: `paginate` — між `{% paginate %}` і `{% endpaginate %}`, `section` — у файлі секції'],
      ],
    ),
    ex({
      title: 'Глобальні обʼєкти є завжди',
      preset: 'all',
      template: `Магазин: {{ shop.name }}
Тип сторінки: {{ request.page_type }}
Шаблон: {{ template.name }}
Кошик: {{ routes.cart_url }} ({{ cart.item_count }} шт.)`,
      note: 'Жоден із цих обʼєктів не треба «підключати» — Shopify сам передає їх у кожен рендер.',
    }),
    note('warn', 'Обʼєкт сторінки поза своєю сторінкою — це nil', 'На головній `product` порожній, і `{{ product.title }}` мовчки нічого не виведе — без жодної помилки. Тому секція «Товар тижня» на головній бере product не з обʼєкта `product`, а з налаштування типу `product` (див. [theme settings](/docs/shopify/theme-settings)) або через `all_products[handle]`. Те саме зі сніпетами: `{% render %}` не бачить змінних ззовні, але **глобальні обʼєкти** всередині сніпета доступні.'),
    h('Drop-и й ліниві властивості'),
    p('В оригінальному (Ruby) рушії обʼєкти магазину — це не хеші з даними, а **Drop-и**: спеціальні обʼєкти, які віддають шаблону лише дозволений набір властивостей. Значення властивості обчислюється **в момент звернення**. Поки ти не написав `product.collections`, Shopify не ходить по колекціях product; написав — пішов. Звідси практичний висновок: платиш лише за те, чого торкаєшся, а «дорогі» властивості (`product.collections`, `collection.products`, metafields, `all_products[...]`) у циклі множаться на кількість ітерацій.'),
    ex({
      title: 'Drop не виводиться «цілком»',
      preset: 'product',
      template: '{{ product }}',
      shopifyOutput: 'ProductDrop',
      note: 'У пісочниці обʼєкти — звичайний JSON, тому output інший. У Shopify побачиш імʼя Drop-а. Щоб зазирнути всередину, є фільтр `json` — про нього на сторінці [про debugging](/docs/shopify/debugging).',
    }),
    h('Доступ за handle'),
    p('**Handle** — це слаг ресурсу: `keratin-shampoo`, `home-care`, `main-menu`. Глобальні «довідники» — `collections`, `all_products`, `pages`, `blogs`, `linklists`, `articles` — дозволяють дістати ресурс за handle з будь-якого місця теми. Працюють і квадратні дужки, і крапка; дужки потрібні, коли handle лежить у змінній.'),
    ex({
      title: 'Дістаємо ресурс за handle',
      preset: 'all',
      template: `{{ collections['home-care'].title }}
{{ collections.home-care.products_count }} товарів
{% assign pick = 'ends-oil' %}
{{ all_products[pick].title }} — {{ all_products[pick].price | money }}
{{ linklists.main-menu.links | map: 'title' | join: ' / ' }}`,
      note: 'Дефіс у `collections.home-care` — не мінус: у Liquid дефіс є законною частиною імені.',
    }),
    note('warn', 'Ліміт all_products: 20 handle на сторінку', '`all_products` обмежений **20 унікальними handle на один рендер сторінки** — так само, як звернення до metaobject за handle. Це не місце для каталогу: якщо треба більше двадцяти — збери їх у колекцію і йди по `collection.products`. Неіснуючий handle помилки не дає — просто порожнє значення, тому перед тим, як виводити, перевіряй: `{% if pick_product.title != blank %}`.'),
    h('request і template: де ми зараз'),
    table(
      ['Властивість', 'Що повертає'],
      [
        ['`request.page_type`', 'Тип сторінки: `index`, `product`, `collection`, `cart`, `search`, `page`, `blog`, `article`, `404`…'],
        ['`request.path`', 'Шлях без домену: `/collections/home-care`. Для неіснуючої сторінки — `nil`'],
        ['`request.host`, `request.origin`', 'Домен і домен зі схемою (`https://…`)'],
        ['`request.locale`', 'Мова запиту: `request.locale.iso_code`, `request.locale.name`'],
        ['`request.design_mode`', '`true`, коли сторінку відкрито в редакторі теми'],
        ['`request.visual_preview_mode`', '`true` у мініатюрі-попередньому перегляді секції в редакторі'],
        ['`template.name`', 'Тип шаблону: `product`, `collection`, `page`'],
        ['`template.suffix`', 'Суфікс альтернативного шаблону (`product.gift.json` → `gift`) або `nil`'],
        ['`template.directory`', '`customers` для шаблонів акаунта, інакше `nil`'],
      ],
    ),
    ex({
      title: 'Класичний body class',
      preset: 'product',
      template: `<body class="template-{{ template.name }}{% if template.suffix %} template-{{ template.name }}--{{ template.suffix }}{% endif %} lang-{{ request.locale.iso_code }}">`,
      note: 'Так CSS і JS дізнаються, на якій вони сторінці, без жодної логіки в скриптах.',
    }),
    h('routes: не хардкодь адреси'),
    ex({
      title: 'Адреси з routes',
      preset: 'shop',
      template: `<a href="{{ routes.cart_url }}">Кошик</a>
<a href="{{ routes.account_login_url }}">Увійти</a>
<form action="{{ routes.search_url }}" method="get">…</form>`,
      note: 'У магазині з кількома мовами чи ринками ці адреси отримують префікс (`/en/cart`). Адреса `/cart`, написана руками, викине людину з її мови. За цим стежить правило Theme Check `HardcodedRoutes`.',
    }),
    h('shop, settings, localization'),
    table(
      ['Обʼєкт', 'Що в ньому', 'На що звернути увагу'],
      [
        ['`shop`', 'Назва, домен, валюта, `money_format`, `published_locales`, політики, metafields магазину', '`shop.locale` deprecated — мова залежить від запиту, тому бери `request.locale`. Так само `shop.enabled_locales` → `shop.published_locales`'],
        ['`settings`', 'Глобальні theme settings з `config/settings_schema.json`', 'Значення типізовані: `range` — число, `checkbox` — boolean, `image_picker` — обʼєкт зображення або `nil`'],
        ['`localization`', 'Доступні країни й мови, поточні `country`, `language`, `market`', 'Годує перемикач країни/мови разом із формою `localization`'],
      ],
    ),
    code(
      'liquid',
      `{% form 'localization' %}
  <select name="country_code">
    {% for country in localization.available_countries %}
      <option value="{{ country.iso_code }}"
        {% if country.iso_code == localization.country.iso_code %}selected{% endif %}>
        {{ country.name }} ({{ country.currency.iso_code }} {{ country.currency.symbol }})
      </option>
    {% endfor %}
  </select>
  <button type="submit">Оновити</button>
{% endform %}`,
      'Перемикач країни: localization + форма',
    ),
    note('shopify', 'cart є завжди, customer — ні', '`cart` існує для кожного відвідувача: порожній cart — це обʼєкт з `item_count` 0, а не `nil`. `customer` навпаки: він глобальний, але для гостя дорівнює `nil`, тож будь-яке звернення до нього починається з `{% if customer %}` — див. [customer](/docs/shopify/customer).'),
    note('interview', 'Чим глобальний обʼєкт відрізняється від обʼєкта сторінки?', 'Глобальний (`shop`, `cart`, `settings`, `routes`) доступний у будь-якому файлі на будь-якій сторінці. Обʼєкт сторінки (`product`, `collection`, `article`) Shopify заповнює лише тоді, коли рендерить відповідний шаблон; деінде він `nil`. Сильна відповідь додає третій вид — контекстні (`section`, `block`, `forloop`, `paginate`, `form`) — і згадує, що `{% render %}` ізолює змінні, але не глобальні обʼєкти.'),
    note('interview', 'Що таке Drop?', 'Це обгортка над даними магазину, яка віддає в шаблон лише безпечний набір властивостей і рахує їх ліниво — у момент звернення. Тому `{{ product }}` виводить `ProductDrop`, а не вміст, а `{{ product | json }}` віддає фіксований набір полів (metafields там, наприклад, немає). І тому ж performance теми — це питання «до скількох властивостей і скільки разів ти звернувся», а не «скільки обʼєктів існує».'),
  ],
}

/* ───────────────────────── 2. product і variant ───────────────────────── */

const productAndVariant: DocPage = {
  slug: 'product-and-variant',
  section: 'shopify',
  title: 'product і variant',
  summary:
    'Головний обʼєкт будь-якої теми: ціни в копійках, `price_varies` і «від X ₴», `compare_at_price` і бейдж знижки, варіанти й опції, `selected_or_first_available_variant`, теги й медіа.',
  officialUrl: 'https://shopify.dev/docs/api/liquid/objects/product',
  related: ['shopify/money-filters', 'shopify/images', 'shopify/forms', 'shopify/metafields', 'filters/divided_by', 'filters/where'],
  blocks: [
    p('`product` — це **картка**: назва, опис, фото, теги. Купують не її, а **варіант** (`variant`): конкретну фасовку з власною ціною, артикулом і залишком. Навіть product без жодної опції має один варіант — `Default Title`. Звідси головне правило: ціна, наявність і `id` для cart — це завжди про варіант; властивості `product.price` чи `product.available` — лише зведення по всіх варіантах.'),
    table(
      ['Властивість', 'Що повертає'],
      [
        ['`title`, `handle`, `url`, `vendor`, `type`', 'Назва, handle, адреса, вендор і тип product'],
        ['`description` (`content`)', 'HTML-опис із адмінки — виводиться як є, без екранування'],
        ['`price`, `price_min`, `price_max`', 'Найнижча (`price` = `price_min`) і найвища ціна серед варіантів, **у копійках**'],
        ['`price_varies`', '`true`, якщо у варіантів різні ціни'],
        ['`compare_at_price`, `compare_at_price_min/max`, `compare_at_price_varies`', '«Стара» ціна; `nil`, якщо не задана'],
        ['`available`', '`true`, якщо можна купити хоча б один варіант'],
        ['`tags`', 'Масив тегів (кожен — string)'],
        ['`options`, `options_with_values`, `options_by_name`', 'Назви опцій; опції з їхніми значеннями; доступ до опції за назвою'],
        ['`variants`, `variants_count`', 'Масив варіантів (без pagination — щонайбільше 250) і їх кількість'],
        ['`selected_variant`, `first_available_variant`, `selected_or_first_available_variant`', 'Обраний у URL варіант; перший доступний; «обраний або перший доступний»'],
        ['`has_only_default_variant`', '`true`, якщо у product немає опцій — селектор варіантів малювати не треба'],
        ['`featured_image`, `images`, `featured_media`, `media`', 'Головне фото, усі фото, і те саме з урахуванням відео та 3D'],
        ['`collections`, `metafields`', 'Колекції, де є product; [metafields](/docs/shopify/metafields)'],
      ],
    ),
    ex({
      title: 'Гроші — в копійках',
      preset: 'product',
      template: `{{ product.title }} · {{ product.vendor }}
Сире значення: {{ product.price }}
Через фільтр: {{ product.price | money }}`,
      note: '`64900` — це 649,00 ₴. Усі ціни в Liquid — integer у найменшій одиниці валюти. Форматує їх лише фільтр — див. [грошові фільтри](/docs/shopify/money-filters).',
    }),
    h('«Від X ₴»: price_varies'),
    ex({
      title: 'Ціна в картці каталогу',
      preset: 'collection',
      template: `{% for product in collection.products limit: 3 %}
{{ product.title }}: {% if product.price_varies %}від {{ product.price_min | money }}{% else %}{{ product.price | money }}{% endif %}
{%- endfor %}`,
      note: 'Якщо варіанти коштують по-різному, показати одну ціну — означає збрехати. `price_varies` каже, чи потрібне слово «від».',
    }),
    h('Бейдж знижки'),
    ex({
      title: 'Відсоток знижки',
      preset: 'product',
      template: `{% if product.compare_at_price > product.price %}
  {%- assign saved = product.compare_at_price | minus: product.price -%}
  {%- assign percent = saved | times: 100 | divided_by: product.compare_at_price -%}
  <s>{{ product.compare_at_price | money }}</s> {{ product.price | money }}
  <span class="badge">−{{ percent }}%</span> (економія {{ saved | money }})
{% endif %}`,
      note: 'Порядок дій принциповий: **спершу** `times: 100`, **потім** `divided_by`. Integer на integer ділиться націло, тож `15000 | divided_by: 79900` дало б `0` — і множити було б уже нічого.',
    }),
    note('warn', 'compare_at_price буває nil — і буває меншою за ціну', 'Немає «старої» ціни — властивість дорівнює `nil`, і порівняння `nil > число` просто хибне, бейдж не зʼявиться. Але менеджер може й помилитись: поставити compare-at нижчу за ціну. Тому умова саме `compare_at_price > price`, а не `{% if product.compare_at_price %}` — інакше намалюєш «знижку» мінус 12%.'),
    h('Варіанти'),
    table(
      ['Властивість варіанта', 'Що повертає'],
      [
        ['`id`', 'Саме його чекає cart у полі `name="id"`'],
        ['`title`', 'Значення опцій через ` / `: `400 мл / Лаванда`'],
        ['`price`, `compare_at_price`, `unit_price`', 'Ціни цього варіанта, в копійках'],
        ['`available`', 'Чи можна купити (є залишок або дозволено продаж у мінус)'],
        ['`options`', 'Масив значень опцій. `option1`–`option3` deprecated — користуйся `options`'],
        ['`sku`, `barcode`, `weight`', 'Артикул, штрихкод, вага в грамах'],
        ['`inventory_quantity`, `inventory_policy`, `inventory_management`', 'Залишок і політика. Якщо облік залишків вимкнено, `inventory_quantity` повертає кількість проданих одиниць'],
        ['`featured_image` (`image`), `featured_media`', 'Фото, привʼязане до варіанта'],
        ['`selected`', '`true`, якщо варіант обрано параметром `?variant=` в адресі'],
        ['`url`', 'Адреса product з `?variant=id`'],
      ],
    ),
    ex({
      title: 'Список варіантів із наявністю',
      preset: 'product',
      template: `{% for variant in product.variants %}
{{ variant.title }} — {{ variant.price | money }}
  {%- if variant.available == false %} · немає в наявності
  {%- elsif variant.inventory_quantity <= 3 %} · лишилось {{ variant.inventory_quantity }}
  {%- endif %}
{%- endfor %}`,
    }),
    h('selected_or_first_available_variant'),
    p('Сторінка product рендериться на сервері один раз, і їй треба вирішити, **який варіант показати одразу**: ціну, фото, стан кнопки. `selected_variant` — це варіант із параметра `?variant=123` в адресі; без параметра він `nil`. `first_available_variant` — перший, який можна купити. `selected_or_first_available_variant` обʼєднує обидва: обраний, якщо він є, інакше перший доступний. Саме його беруть усі сучасні теми як «поточний варіант».'),
    ex({
      title: 'Поточний варіант і кнопка',
      preset: 'product',
      template: `{% assign current = product.selected_or_first_available_variant %}
Показуємо: {{ current.title }} за {{ current.price | money }}
selected_variant: {{ product.selected_variant | default: 'nil — у URL немає ?variant=' }}
<button{% unless current.available %} disabled{% endunless %}>
  {% if current.available %}Додати в кошик{% else %}Немає в наявності{% endif %}
</button>`,
    }),
    h('Опції'),
    ex({
      title: 'Селектор із options_with_values',
      preset: 'product',
      template: `{% for option in product.options_with_values %}
<fieldset>
  <legend>{{ option.name }}</legend>
  {%- for value in option.values %}
  <label><input type="radio" name="{{ option.name | handleize }}" value="{{ value | escape }}"> {{ value }}</label>
  {%- endfor %}
</fieldset>
{% endfor %}`,
      note: 'У Shopify `option.values` — це обʼєкти `product_option_value` (виводяться як назва, але мають ще `selected`, `available`, `swatch`, `variant`). Для product без опцій увесь цей блок ховають умовою `{% unless product.has_only_default_variant %}`.',
    }),
    h('Теги й медіа'),
    ex({
      title: 'Бейдж за тегом і галерея',
      preset: 'product',
      template: `{% if product.tags contains 'хіт' %}<span class="badge">Хіт продажів</span>{% endif %}
{% for image in product.images %}
<img src="{{ image | image_url: width: 400 }}" alt="{{ image.alt | escape }}" width="400" loading="lazy">
{%- endfor %}`,
      note: 'Для масиву `contains` шукає **елемент, що точно збігається**: тег `хіт продажів` умову `contains "хіт"` не пройде. Для string той самий оператор шукає підрядок — не переплутай.',
    }),
    note('warn', 'images — це лише картинки', 'Якщо до product додано відео чи 3D-модель, у `product.images` їх немає — вони в `product.media`, де кожен елемент має `media_type` (`image`, `video`, `external_video`, `model`). Галерея сучасної теми йде по `media`, а `images` лишається для простих карток. Фільтри для відео й моделей (`media_tag`, `video_tag`) пісочниця не емулює.'),
    note('shopify', 'Перемикання варіанта — це вже не Liquid', 'Liquid відпрацював на сервері й більше не повернеться. Коли людина клацає «400 мл», ціну й фото міняє JavaScript: або з JSON варіантів, покладеного в сторінку (див. [Liquid і JavaScript](/docs/shopify/liquid-and-js)), або перезапитом секції через Section Rendering API з `?variant=id` — тоді сервер рендерить її вже з новим `selected_variant`.'),
    note('interview', 'Чому не можна просто вивести product.price?', 'Бо це **мінімальна** ціна серед варіантів, у копійках і без формату. Правильна картка перевіряє `price_varies` (щоб написати «від»), форматує через `money`, а на сторінці product показує ціну **поточного варіанта** — `product.selected_or_first_available_variant.price`, — бо саме його людина додасть до cart.'),
    note('interview', 'Як порахувати відсоток знижки?', '`compare_at_price | minus: price | times: 100 | divided_by: compare_at_price`. Дві пастки, які варто назвати вголос: цілочисельне ділення (тому множимо до ділення) і перевірка `compare_at_price > price` замість простої перевірки на існування. Бонус: у product з різними варіантами чесніше рахувати знижку по поточному варіанту, а не по `product`.'),
  ],
}

/* ───────────────────────── 3. collection і пагінація ───────────────────────── */

const collectionAndPagination: DocPage = {
  slug: 'collection-and-pagination',
  section: 'shopify',
  title: 'collection і pagination',
  summary:
    'Обʼєкт колекції, ліміт 50 product без `paginate`, тег `{% paginate %}` і обʼєкт `paginate`, сортування через `sort_by`, storefront-фільтри `collection.filters`, теги `all_tags` і `current_tags`.',
  officialUrl: 'https://shopify.dev/docs/api/liquid/tags/paginate',
  related: ['shopify/product-and-variant', 'shopify/performance', 'shopify/search', 'tags/iteration', 'filters/where', 'filters/sort'],
  blocks: [
    p('`collection` доступний у шаблоні колекції, а будь-яку іншу колекцію можна дістати через `collections[handle]`. Найважливіше в ньому — `collection.products`, і саме з ним повʼязане найвідоміше обмеження Shopify: **цикл `for` робить щонайбільше 50 ітерацій, а `collection.products` без pagination (розбиття на сторінки) віддає щонайбільше 50 product**. Усе, що більше, — через `{% paginate %}`.'),
    table(
      ['Властивість', 'Що повертає'],
      [
        ['`title`, `handle`, `url`, `description`, `image`', 'Базові дані колекції'],
        ['`products`', 'Product **поточної сторінки** з урахуванням фільтрів і сортування'],
        ['`products_count`', 'Кількість product з урахуванням активних фільтрів'],
        ['`all_products_count`', 'Кількість усіх product колекції, фільтри ігноруються'],
        ['`all_tags`', 'Усі теги product колекції, разом із відфільтрованими (щонайбільше 1000)'],
        ['`tags`', 'Теги product поточної вибірки'],
        ['`all_vendors`, `all_types`', 'Вендори й типи product колекції'],
        ['`sort_by`, `default_sort_by`, `sort_options`', 'Поточне сортування (з URL), сортування за замовчуванням, список варіантів для `<select>`'],
        ['`filters`', 'Storefront-фільтри, налаштовані для колекції'],
      ],
    ),
    ex({
      title: 'Сітка колекції',
      preset: 'collection',
      template: `<h1>{{ collection.title }}</h1>
<p>{{ collection.products_count }} {{ collection.products_count | pluralize: 'товар', 'товарів' }}</p>
{% for product in collection.products %}
<a href="{{ product.url | within: collection }}">{{ product.title }}</a> — {{ product.price | money }}
{%- endfor %}`,
      note: '`pluralize` знає лише дві форми — для української з її «товар / товари / товарів» у справжній темі беруть переклади з `count` (див. [locales](/docs/shopify/locales)).',
    }),
    h('Тег paginate'),
    p('`{% paginate collection.products by 24 %}` робить дві речі. По-перше, всередині тега `collection.products` віддає вже **лише поточну сторінку** — номер сторінки Shopify бере з параметра `?page=` в адресі. По-друге, зʼявляється обʼєкт `paginate`, з якого будується навігація. Розмір сторінки — **від 1 до 250**. Пагінувати можна не лише product: `blog.articles`, `search.results`, `customer.orders`, `customer.addresses`, `collections`, `pages`, `product.variants`, `article.comments`, записи metaobject.'),
    ex({
      title: 'Перша сторінка по два product',
      preset: 'collection',
      template: `{% paginate collection.products by 2 %}
  {%- for product in collection.products %}
  • {{ product.title }}
  {%- endfor %}

  Сторінка {{ paginate.current_page }} з {{ paginate.pages }} · усього {{ paginate.items }} · пропущено {{ paginate.current_offset }}
  {% if paginate.next %}Далі: {{ paginate.next.url }}{% endif %}
{% endpaginate %}`,
      note: 'Усередині тега цикл бачить два product, хоча в колекції їх пʼять.',
    }),
    ex({
      title: 'Та сама колекція, сторінка 2',
      preset: 'collection',
      data: { current_page: 2 },
      template: `{% paginate collection.products by 2 %}
  {%- for product in collection.products %}
  • {{ product.title }}
  {%- endfor %}
  {% if paginate.previous %}← {{ paginate.previous.url }}{% endif %} | {% if paginate.next %}{{ paginate.next.url }} →{% endif %}
{% endpaginate %}`,
      note: 'У пісочниці номер сторінки задає змінна `current_page` у даних; у Shopify — параметр `?page=2` в адресі, а `current_page` — глобальний обʼєкт лише для читання.',
    }),
    table(
      ['Властивість paginate', 'Що повертає'],
      [
        ['`current_page`, `pages`', 'Номер поточної сторінки і кількість сторінок'],
        ['`items`', 'Скільки всього елементів пагінується'],
        ['`page_size`', 'Розмір сторінки з `by`'],
        ['`current_offset`', 'Скільки елементів лишилось «позаду»'],
        ['`previous`, `next`', 'Частини-посилання назад і вперед; `nil` на краях'],
        ['`parts`', 'Масив частин навігації; у кожної `title`, `url`, `is_link` (поточна сторінка й «…» — не посилання)'],
        ['`page_param`', 'Імʼя параметра в URL. Зазвичай `page`; для списків із налаштувань (`product_list`…) Shopify додає унікальний суфікс'],
      ],
    ),
    ex({
      title: 'Навігація: готова і власна',
      preset: 'collection',
      view: 'html',
      template: `{% paginate collection.products by 2 %}
<nav>{{ paginate | default_pagination }}</nav>

<ul class="pagination">
{%- for part in paginate.parts %}
  {%- if part.is_link %}
  <li><a href="{{ part.url }}">{{ part.title }}</a></li>
  {%- else %}
  <li aria-current="page">{{ part.title }}</li>
  {%- endif %}
{%- endfor %}
</ul>
{% endpaginate %}`,
      note: '`default_pagination` — швидкий старт; у Shopify він приймає `previous:`, `next:` (тексти стрілок) і `anchor:`. Коли потрібна власна розмітка й доступність — іди по `paginate.parts`.',
    }),
    note('warn', 'limit у циклі не зменшує вибірку', '`{% for product in collection.products limit: 4 %}` виведе чотири product, але Shopify однаково завантажить до 50. `limit` керує ітераціями, а не запитом. Хочеш справді менше даних — загорни цикл у `{% paginate collection.products by 4 %}` і просто не малюй навігацію. І ще одне: pagination дістає не далі **25 000-го** елемента — глибше треба звужувати вибірку фільтрами.'),
    h('Сортування'),
    ex({
      title: 'Посилання сортування',
      preset: 'collection',
      template: `Зараз: {{ collection.sort_by | default: collection.default_sort_by }}
{{ collection.url | sort_by: 'price-ascending' }}
{{ collection.url | sort_by: 'created-descending' }}`,
      note: 'Сортує **сервер**: параметр `?sort_by=` потрапляє в адресу, і `collection.products` приходить уже впорядкованим. Значення: `manual`, `best-selling`, `title-ascending`, `title-descending`, `price-ascending`, `price-descending`, `created-ascending`, `created-descending`.',
    }),
    code(
      'liquid',
      `<select name="sort_by">
  {%- assign current_sort = collection.sort_by | default: collection.default_sort_by -%}
  {% for option in collection.sort_options %}
    <option value="{{ option.value }}" {% if option.value == current_sort %}selected{% endif %}>
      {{ option.name }}
    </option>
  {% endfor %}
</select>`,
      'Список сортування з collection.sort_options',
    ),
    note('warn', 'Фільтр sort сортує лише поточну сторінку', '`{% assign sorted = collection.products | sort: "price" %}` виглядає як сортування колекції, але працює з тими ≤50 product, які вже прийшли на цю сторінку. На другій сторінці буде свій «найдешевший». Сортування всієї колекції — це лише `?sort_by=`. Те саме з `where`: він фільтрує сторінку, а не колекцію.'),
    h('Storefront-фільтри'),
    p('Фільтри за ціною, наявністю, вендором, опціями й metafields налаштовуються в адмінці (застосунок Search & Discovery), а тема лише **малює** їх з `collection.filters`. Кожне значення фільтра вже знає свою адресу: `url_to_add` і `url_to_remove`. Фільтрація, як і сортування, відбувається на сервері через параметри `filter.*` в URL. Для колекцій, де понад 5000 product, `collection.filters` порожній.'),
    code(
      'liquid',
      `{% for filter in collection.filters %}
  <details>
    <summary>{{ filter.label }}{% if filter.active_values.size > 0 %} ({{ filter.active_values.size }}){% endif %}</summary>

    {% case filter.type %}
      {% when 'list', 'boolean' %}
        {% for value in filter.values %}
          <a href="{% if value.active %}{{ value.url_to_remove }}{% else %}{{ value.url_to_add }}{% endif %}"
             {% if value.count == 0 and value.active == false %}aria-disabled="true"{% endif %}>
            {{ value.label }} ({{ value.count }})
          </a>
        {% endfor %}
      {% when 'price_range' %}
        <input name="{{ filter.min_value.param_name }}" value="{{ filter.min_value.value | money_without_currency }}">
        <input name="{{ filter.max_value.param_name }}" value="{{ filter.max_value.value | money_without_currency }}">
    {% endcase %}
  </details>
{% endfor %}`,
      'Скелет панелі фільтрів',
    ),
    h('Теги: all_tags і current_tags'),
    ex({
      title: 'Фільтр за тегом',
      preset: 'collection',
      data: { current_tags: ['хіт'] },
      template: `{% for tag in collection.all_tags %}
  {%- if current_tags contains tag %}
  [×] {{ tag }}
  {%- else %}
  {{ tag | link_to_tag: tag }}
  {%- endif %}
{%- endfor %}`,
      note: 'Старіший механізм: тег дописується в адресу (`/collections/home-care/хіт`, кілька — через `+`), а `current_tags` показує, що зараз застосовано. У Shopify є ще `link_to_add_tag` і `link_to_remove_tag` — вони додають і знімають тег, зберігаючи решту.',
    }),
    note('shopify', 'Фільтри проти тегів', 'Нові теми будують фільтрацію на `collection.filters`: це фасети з лічильниками, діапазон цін, metafields — і жодної самодіяльності з тегами. Фільтрацію тегами зустрінеш у старих темах і там, де менеджери роками вели теги на кшталт `color_red`. На співбесіді варто знати обидва механізми й уміти пояснити, чому перший кращий: він не вимагає дисципліни тегування й дає лічильники.'),
    note('interview', 'У колекції 300 product. Як вивести всі?', 'На одній сторінці — ніяк, і це правильно. `for` обмежений 50 ітераціями, `paginate` — 250 елементами на сторінку. Робоча відповідь: `{% paginate collection.products by 24 %}` + навігація або «Показати ще» на JavaScript, який підвантажує наступну сторінку (звичайним запитом `?page=2` чи через Section Rendering API) і доклеює картки. Варто згадати й ціну: що більша сторінка, то довший серверний рендер.'),
    note('interview', 'Чим products_count відрізняється від all_products_count?', '`all_products_count` — скільки product у колекції взагалі. `products_count` — скільки лишилось після активних фільтрів. Напис «Знайдено 12 із 80» — це саме ці дві властивості. І жодна з них не дорівнює `collection.products.size`: той рахує лише поточну сторінку.'),
  ],
}

/* ───────────────────────── 4. cart ───────────────────────── */

const cartPage: DocPage = {
  slug: 'cart',
  section: 'shopify',
  title: 'cart і line_item',
  summary:
    'Cart і його line items: `final_price` проти deprecated `price`, знижки на рівні line item і всього cart, `properties`, атрибути й примітка, `item_count`, і чому cart оновлюють через Ajax API та Section Rendering API.',
  officialUrl: 'https://shopify.dev/docs/api/liquid/objects/cart',
  related: ['shopify/forms', 'shopify/liquid-and-js', 'shopify/money-filters', 'shopify/security', 'filters/sum'],
  blocks: [
    p('`cart` — глобальний обʼєкт: він є на кожній сторінці й для кожного відвідувача, тому лічильник у шапці працює без жодних хитрощів. Cart складається з **line items** (`cart.items`, обʼєкти `line_item`): line item — це варіант + кількість + властивості, з якими його додали. Один варіант із різними властивостями (різне гравіювання) — це різні line items.'),
    table(
      ['Властивість cart', 'Що повертає'],
      [
        ['`items`', 'Масив line items — обʼєктів `line_item`'],
        ['`item_count`', 'Сума **кількостей** усіх line items (не кількість line items!)'],
        ['`total_price`', 'До сплати після всіх знижок, у копійках'],
        ['`items_subtotal_price`', 'Сума line items після знижок **на line item**, але до знижок на весь cart'],
        ['`original_total_price`', 'Сума до будь-яких знижок'],
        ['`total_discount`', 'Загальна сума знижок'],
        ['`cart_level_discount_applications`, `discount_applications`', 'Знижки на весь cart; усі знижки разом. `cart.discounts` deprecated'],
        ['`note`, `attributes`', 'Примітка до замовлення і довільні поля «ключ → значення»'],
        ['`currency`, `requires_shipping`, `total_weight`, `taxes_included`', 'Валюта (`cart.currency.iso_code`), чи потрібна доставка, вага в грамах, чи входять податки в ціни'],
        ['`empty?`', '`true`, якщо cart порожній'],
      ],
    ),
    ex({
      title: 'Line items у cart',
      preset: 'cart',
      template: `{% for item in cart.items %}
{{ item.product.title }}{% if item.variant.title != 'Default Title' %} ({{ item.variant.title }}){% endif %} × {{ item.quantity }} = {{ item.final_line_price | money }}
{%- endfor %}

Разом: {{ cart.total_price | money }}`,
    }),
    h('line_item: які ціни брати'),
    table(
      ['Властивість', 'Що означає'],
      [
        ['`original_price`, `original_line_price`', 'Ціна одиниці й line item **до** знижок'],
        ['`final_price`, `final_line_price`', 'Ціна одиниці й line item **після** знижок на line item. Це те, що показуєш на сторінці'],
        ['`line_level_total_discount`', 'Сума знижок, застосованих безпосередньо до line item'],
        ['`line_level_discount_allocations`, `discount_allocations`', 'Розклад знижок: у кожного `amount` і `discount_application` (з `title`, `type`, `value`)'],
        ['`price`, `line_price`, `total_discount`, `discounts`', '**Deprecated**: не враховують автоматичні знижки й промокоди. Заміна — `final_price`, `final_line_price`, `line_level_total_discount`, `discount_allocations`'],
        ['`quantity`, `variant`, `product`, `image`, `sku`, `vendor`, `url`', 'Кількість і звʼязки з варіантом та product'],
        ['`key`', 'Ідентифікатор line item: `id варіанта:хеш`. Хеш змінюється разом із властивостями й знижками'],
        ['`properties`', 'Властивості line item: гравіювання, текст листівки, службові дані застосунків'],
        ['`url_to_remove`', 'Адреса, що видаляє line item без JavaScript'],
      ],
    ),
    ex({
      title: 'Показуємо знижку в line item',
      preset: 'cart',
      template: `{% for item in cart.items %}
{{ item.product.title }}:
  {%- if item.original_line_price != item.final_line_price %} <s>{{ item.original_line_price | money }}</s> {{ item.final_line_price | money }} (−{{ item.original_line_price | minus: item.final_line_price | money }})
  {%- else %} {{ item.final_line_price | money }}
  {%- endif %}
{%- endfor %}

Знижки разом: {{ cart.total_discount | money }}`,
      note: 'Порівнюй `original_*` з `final_*` — і закреслена ціна зʼявиться лише там, де знижка справді є.',
    }),
    code(
      'liquid',
      `{% for item in cart.items %}
  {% for allocation in item.line_level_discount_allocations %}
    <li>{{ allocation.discount_application.title }}: −{{ allocation.amount | money }}</li>
  {% endfor %}
{% endfor %}

{% for discount in cart.cart_level_discount_applications %}
  <p>{{ discount.title }}: −{{ discount.total_allocated_amount | money }}</p>
{% endfor %}`,
      'Назви знижок: на line item і на весь cart',
    ),
    note('warn', 'item.price у старій темі бреше', 'У темах до 2019–2020 років у шаблоні cart стоїть `item.price` і `item.line_price`. Вони не знають про автоматичні знижки й промокоди, тож сума в cart не збігається з сумою на checkout — класична скарга «у вас на сайті одна ціна, а при оплаті інша». Лікується заміною на `final_price` / `final_line_price`.'),
    h('properties: властивості line item'),
    p('Будь-яке поле форми product з іменем `properties[Назва]` потрапляє в `line_item.properties`. Так роблять гравіювання, підпис листівки, дату доставки. Застосунки кладуть туди ж службові дані, і є домовленість: властивість, чиє імʼя починається з підкреслення, **не показують** на сторінці. Checkout Shopify ховає такі сам, а в темі це твоя робота.'),
    ex({
      title: 'Виводимо властивості, ховаємо службові',
      data: {
        item: { title: 'Гребінь деревʼяний', properties: { Гравіювання: 'Софії <3', _bundle_id: 'b-42', Листівка: '' } },
      },
      template: `{{ item.title }}
{%- for property in item.properties %}
  {%- assign first_char = property.first | slice: 0 %}
  {%- unless first_char == '_' or property.last == blank %}
  {{ property.first }}: {{ property.last | escape }}
  {%- endunless %}
{%- endfor %}`,
      note: 'Ітерація по `properties` дає пари: `property.first` — імʼя, `property.last` — значення. Значення вводила людина, тому `escape` обовʼязковий — див. [безпеку](/docs/shopify/security).',
    }),
    h('Примітка й атрибути cart'),
    code(
      'liquid',
      `{% form 'cart', cart %}
  <textarea name="note">{{ cart.note }}</textarea>

  <label>
    <input type="checkbox" name="attributes[Подарункове пакування]" value="Так"
      {% if cart.attributes['Подарункове пакування'] == 'Так' %}checked{% endif %}>
    Запакувати як подарунок
  </label>

  <button type="submit" name="checkout">Оформити</button>
{% endform %}`,
      'note і attributes — звичайні поля форми cart',
    ),
    p('І примітка, і атрибути їдуть у замовлення: менеджер бачить їх в адмінці, а застосунки — через API. Різниця з `properties` проста: властивості належать **line item**, атрибути — **всьому cart**.'),
    h('item_count і лічильник у шапці'),
    ex({
      title: 'Кількість одиниць проти кількості line items',
      preset: 'cart',
      template: `Одиниць товару: {{ cart.item_count }}
Рядків: {{ cart.items.size }}
Варіант 12 у кошику: {{ cart | item_count_for_variant: 12 }} шт.
{% if cart.item_count > 0 %}<span class="cart-bubble">{{ cart.item_count }}</span>{% endif %}`,
      note: 'У бульбашці біля іконки кошика показують `item_count`. `cart.items.size` — рідкісний гість: він потрібен хіба для напису «3 позиції».',
    }),
    h('Чому cart оновлюють через Ajax'),
    p('Liquid рендерить сторінку **один раз, на сервері**. Після того як людина натиснула «Додати в кошик» без перезавантаження, HTML у браузері вже неактуальний: лічильник, cart drawer (висувна панель із вмістом cart), сума — усе треба оновити, а Liquid у браузері не виконується. Тому сучасні теми працюють у парі з двома API: **Ajax Cart API** змінює cart (`/cart/add.js`, `/cart/change.js`, `/cart/update.js`, `/cart.js`), а **Section Rendering API** повертає свіжий HTML секцій, відрендерений тим самим Liquid на сервері.'),
    code(
      'js',
      `const response = await fetch(window.routes.cart_add_url + '.js', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
  body: JSON.stringify({
    items: [{ id: variantId, quantity: 1, properties: { 'Гравіювання': 'Софії' } }],
    // «Пакетний» рендер: разом із відповіддю кошика прийде HTML цих секцій (до пʼяти)
    sections: 'cart-drawer,cart-icon-bubble',
  }),
})
const data = await response.json()
document.querySelector('#cart-icon-bubble').innerHTML = data.sections['cart-icon-bubble']`,
      'Додати варіант у cart і одразу отримати оновлені секції',
    ),
    note('shopify', 'Розмітка лишається в Liquid', 'Сенс звʼязки «Ajax Cart + Section Rendering» у тому, що HTML cart описаний **один раз** — у Liquid-секції. JavaScript не збирає line items з JSON, а просто вставляє готовий шматок. Ціни відформатовані тим самим `money`, переклади ті самі, знижки пораховані сервером. Дублювати шаблон line item ще й у JS — типовий антипатерн старих тем.'),
    note('interview', 'Чим cart.total_price відрізняється від items_subtotal_price?', '`items_subtotal_price` — сума line items після знижок на line item, але **до** знижок на весь cart. `total_price` — після всіх знижок. Ні доставки, ні (зазвичай) податків там ще немає — їх рахує checkout. Тому на сторінці cart пишуть «Проміжна сума» і чесний підпис «Доставка й податки — на наступному кроці».'),
    note('interview', 'Навіщо line_item.key, якщо є variant.id?', 'Бо один варіант може лежати в cart кількома line items — з різними `properties` чи планами підписки. `/cart/change.js` за `id` варіанта зачепить не той line item, за `key` — саме потрібний. Нюанс, який відрізняє досвідченого: `key` **нестабільний** — змінились властивості чи знижка, змінився і ключ, тому після кожної відповіді API ключі перечитують, а не кешують.'),
  ],
}


/* ───────────────────────── 5. customer ───────────────────────── */

const customerPage: DocPage = {
  slug: 'customer',
  section: 'shopify',
  title: 'customer і замовлення',
  summary:
    '`customer` — глобальний обʼєкт, якого для гостя просто немає; `{% if customer %}`, замовлення й адреси, теги як основа VIP- і B2B-логіки, посилання входу-виходу і те, що не можна виводити в публічний HTML.',
  officialUrl: 'https://shopify.dev/docs/api/liquid/objects/customer',
  related: ['shopify/objects-overview', 'shopify/forms', 'shopify/security', 'shopify/money-filters', 'filters/date'],
  blocks: [
    p('`customer` — це **залогінена людина**. Обʼєкт глобальний: він доступний у будь-якому файлі теми, а не лише на сторінках акаунта. Але глобальний не означає «завжди заповнений»: для гостя `customer` дорівнює `nil`, і саме з цього починається будь-яка робота з ним.'),
    ex({
      title: 'Гість: обʼєкта просто немає',
      preset: 'shop',
      template: `{% if customer %}Вітаємо, {{ customer.first_name }}!{% else %}Ви не увійшли.{% endif %}
Імʼя: «{{ customer.first_name }}»
Замовлень: {{ customer.orders_count | default: 0 }}`,
      note: 'Звернення до властивості `nil`-обʼєкта помилки не дає — просто порожній string. Це зручно й підступно водночас: зламану логіку ти побачиш не як помилку, а як порожнє місце на сторінці.',
    }),
    ex({
      title: 'Та сама розмітка для customer',
      preset: 'customer',
      template: `{% if customer %}Вітаємо, {{ customer.first_name }}!{% else %}Ви не увійшли.{% endif %}
Замовлень: {{ customer.orders_count }} на суму {{ customer.total_spent | money }}
Акаунт створено: {{ customer.has_account }}`,
      note: '`total_spent` — теж у копійках і теж у валюті покупця, тож без `money` це просто велике число.',
    }),
    h('Властивості'),
    table(
      ['Властивість', 'Що повертає'],
      [
        ['`first_name`, `last_name`, `name`', 'Імʼя, прізвище і повне імʼя'],
        ['`email`, `phone`', 'Пошта; телефон заповнений лише тоді, коли людина лишила його на checkout або підписалась на SMS'],
        ['`id`', 'Числовий ідентифікатор customer'],
        ['`orders`, `orders_count`, `last_order`', 'Замовлення, їх кількість і останнє'],
        ['`total_spent`', 'Скільки витрачено — у копійках, у валюті покупця'],
        ['`tags`', 'Масив тегів customer з адмінки'],
        ['`default_address`, `addresses`, `addresses_count`', 'Основна адреса, усі адреси і їх кількість'],
        ['`accepts_marketing`, `tax_exempt`', 'Згода на розсилку; звільнення від податку'],
        ['`has_account`, `has_avatar?`', 'Чи є акаунт; чи є аватар (виводиться фільтром `avatar`)'],
        ['`metafields`', '[Metafields](/docs/shopify/metafields) customer'],
        ['`b2b?`, `current_company`, `current_location`, `company_available_locations`', 'B2B: чи належить customer компанії, яка це компанія і яка її локація зараз обрана'],
        ['`payment_methods`, `store_credit_account`', 'Збережені способи оплати і баланс магазинного кредиту'],
      ],
    ),
    h('Замовлення'),
    ex({
      title: 'Історія замовлень',
      preset: 'customer',
      template: `{% for order in customer.orders %}
{{ order.name }} від {{ order.created_at | date: '%d.%m.%Y' }} — {{ order.total_price | money }}
  оплата: {{ order.financial_status }} · доставка: {{ order.fulfillment_status | default: 'ще не відправлено' }}
{%- endfor %}`,
      note: '`financial_status` і `fulfillment_status` — це **машинні** коди (`paid`, `fulfilled`). Для людини є готові переклади: `financial_status_label` і `fulfillment_status_label`, і саме їх виводять у розмітці.',
    }),
    table(
      ['Властивість order', 'Що повертає'],
      [
        ['`name`, `order_number`, `confirmation_number`', '`#1042`, `1042` і буквено-цифровий номер підтвердження'],
        ['`created_at`, `cancelled`, `cancelled_at`, `cancel_reason_label`', 'Дата, факт і причина скасування'],
        ['`financial_status(_label)`, `fulfillment_status(_label)`', 'Стан оплати й відправлення: код і людський підпис'],
        ['`line_items`, `item_count`', 'Line items замовлення (ті самі `line_item`, що в cart) і кількість одиниць'],
        ['`subtotal_price`, `shipping_price`, `tax_price`, `total_price`, `total_discounts`', 'Гроші, у копійках'],
        ['`total_net_amount`, `total_refunded_amount`', '`total_price` рахується **до** повернень; чиста сума — це `total_net_amount`'],
        ['`shipping_address`, `billing_address`, `shipping_methods`', 'Адреси й обраний спосіб доставки'],
        ['`customer_url`, `order_status_url`', 'Сторінка замовлення в кабінеті і сторінка статусу'],
        ['`discount_applications`, `cart_level_discount_applications`', 'Знижки. Старий обʼєкт `order.discounts` — deprecated'],
        ['`attributes`, `note`, `tags`, `metafields`', 'Атрибути cart, примітка, теги й metafields замовлення'],
      ],
    ),
    code(
      'liquid',
      `{% paginate customer.orders by 10 %}
  {% for order in customer.orders %}
    <tr>
      <td><a href="{{ order.customer_url }}">{{ order.name }}</a></td>
      <td>{{ order.created_at | time_tag: format: 'date' }}</td>
      <td>{{ order.financial_status_label }}</td>
      <td>{{ order.fulfillment_status_label }}</td>
      <td>{{ order.total_price | money_with_currency }}</td>
    </tr>
  {% endfor %}
  {{ paginate | default_pagination }}
{% endpaginate %}`,
      'Таблиця замовлень у кабінеті',
    ),
    note('shopify', 'Скільки замовлень віддає customer.orders', '`customer.orders` без pagination обмежений так само, як будь-який цикл, тому таблицю замовлень завжди загортають у `{% paginate … by 10 %}` (до 50 на сторінку). Те саме стосується `customer.addresses`. І памʼятай: шаблони акаунта живуть у теці `templates/customers/`, а `template.directory` там дорівнює `customers`.'),
    h('Теги: VIP, гурт і сегменти'),
    ex({
      title: 'Розгалуження за тегом',
      preset: 'customer',
      template: `{% if customer.tags contains 'vip' %}
Ви в клубі VIP: безплатна доставка на всі замовлення.
{% endif %}
{% if customer.tags contains 'wholesale' %}
Гуртовий кабінет: {{ customer.name }}, ціни з вашого прайсу.
{% endif %}
Теги: {{ customer.tags | join: ', ' }}`,
      note: '`contains` на масиві шукає **точний елемент**, тому тег `vip-2026` умову `contains "vip"` не пройде. Хочеш «починається з» — йди циклом і бери `slice`.',
    }),
    note('warn', 'Тег — це оформлення, а не право', 'Перевірка `customer.tags contains "wholesale"` вирішує лише, **що намалювати**. Вона не робить ціну гуртовою і не закриває доступ: сховати блок у Liquid — не те саме, що заборонити. Справжні гуртові ціни в Shopify дає B2B (каталоги компаній) або застосунок, який рахує їх на сервері. Якщо «знижка для гурту» існує лише як `{% if %}` у темі, її отримає кожен, хто підбере URL.'),
    code(
      'liquid',
      `{% if customer.b2b? %}
  <p>Компанія: {{ customer.current_company.name }}</p>
  <p>Локація: {{ customer.current_location.name }}</p>

  {% if customer.company_available_locations_count > 1 %}
    {% form 'customer_login', id: 'location_form' %}
      <select name="customer[location_id]">
        {% for location in customer.company_available_locations %}
          <option value="{{ location.id }}"
            {% if location.id == customer.current_location.id %}selected{% endif %}>
            {{ location.name }}
          </option>
        {% endfor %}
      </select>
    {% endform %}
  {% endif %}
{% endif %}`,
      'B2B: компанія й перемикач локації',
    ),
    h('Адреси'),
    ex({
      title: 'Основна адреса',
      preset: 'customer',
      template: `{% assign address = customer.default_address %}
{% if address %}
{{ address.address1 }}, {{ address.city }}, {{ address.zip }}, {{ address.country }}
{% else %}
Адреси ще немає.
{% endif %}`,
      note: 'У справжньому Shopify `address.country` — це обʼєкт `country` (виводиться як назва), а не string, і є ще `country_code`, `province_code`, `street`, `summary`. Готове форматування за правилами країни дає фільтр `format_address`.',
    }),
    h('Вхід, вихід, реєстрація'),
    code(
      'liquid',
      `{% if customer %}
  {{ 'Вийти' | customer_logout_link }}
  <a href="{{ routes.account_url }}">Мій кабінет</a>
{% else %}
  {{ 'Увійти' | customer_login_link }}
  {{ 'Створити акаунт' | customer_register_link }}
{% endif %}`,
      'Фільтри-посилання акаунта',
    ),
    p('`customer_login_link`, `customer_logout_link` і `customer_register_link` беруть string і повертають готовий `<a>` на потрібну адресу. Зручно, але негнучко: класу чи атрибута туди не додаси. Тому сучасні теми частіше пишуть звичайне посилання на `routes.account_login_url` і `routes.account_logout_url` — вигляд той самий, а розмітка своя. Пісочниця ці три фільтри не емулює.'),
    note('warn', 'Чого не можна виводити в публічний HTML', 'Сторінка з даними customer — це звичайний HTML, який їде в браузер і лишається в історії, у розширеннях і в сторонніх скриптах на сторінці. Тому: не клади `customer.email`, `customer.phone` чи `customer.id` у `data-`атрибути «про всяк випадок» — усе, що там лежить, читає будь-який застосунок аналітики. Не виводь `customer.tags` як є: теги пише менеджер, і серед них трапляються внутрішні («боржник», «скаржниця»). І не прив’язуй жодних привілеїв до параметра в URL на кшталт `?customer_id=` — підставити туди чуже число вміє кожен.'),
    note('interview', 'Як тема дізнається, що людина увійшла?', 'По обʼєкту `customer`: він глобальний, але для гостя `nil`, тому вся персоналізація починається з `{% if customer %}`. Усередині доступні імʼя, пошта, теги, замовлення й адреси. Важливе уточнення, яке варто сказати вголос: `customer.has_account` — це не «увійшла», а «має зареєстрований акаунт», бо на Shopify замовлення можна оформити й гостем.'),
    note('interview', 'Клієнт просить: гуртовим — свої ціни. Зробиш на тегах?', 'На тегах можна зробити лише **вигляд**: показати гуртовий блок, підписати «ваша ціна», сховати роздрібну. Саму ціну Liquid не рахує — її віддає сервер, тому реальні гуртові ціни це або B2B-каталоги компаній, або застосунок, або окремий магазин. Якщо відповісти «зроблю на тегах і порахую знижку в Liquid», далі неодмінно спитають, що заважає покупцеві просто оформити замовлення з роздрібної сторінки, — і відповіді не буде.'),
  ],
}

/* ───────────────────────── 6. Метаполя й метаобʼєкти ───────────────────────── */

const metafieldsPage: DocPage = {
  slug: 'metafields',
  section: 'shopify',
  title: 'Metafields і metaobjects',
  summary:
    'Власні дані на product, collection і customer: шлях `namespace.key`, обовʼязкове `.value`, типи полів і що кожен повертає, списки й посилання, фільтри `metafield_tag` і `metafield_text`, metaobjects і чесна перевірка на порожнечу.',
  officialUrl: 'https://shopify.dev/docs/api/liquid/objects/metafield',
  related: ['shopify/product-and-variant', 'shopify/objects-overview', 'shopify/security', 'shopify/performance', 'filters/date'],
  blocks: [
    p('Metafield — це **своє поле** на стандартному обʼєкті Shopify: «Склад» на product, «Виробник» на колекції, «Дата народження» на customer. У Liquid їх не створюють — лише читають; заводять metafields в адмінці (Налаштування → Власні дані) або через застосунок. Metafields є майже в усього: `product`, `variant`, `collection`, `customer`, `order`, `page`, `blog`, `article`, `shop`, `market`.'),
    p('Шлях складається з двох частин: **namespace** (група, щоб поля різних застосунків не побились) і **key** (імʼя поля). Разом — `product.metafields.custom.ph`.'),
    ex({
      title: 'Metafield — це обʼєкт, а не значення',
      preset: 'product',
      template: `Напряму:   {{ product.metafields.custom.ph }}
Через value: {{ product.metafields.custom.ph.value }}
Тип:         {{ product.metafields.custom.ph.type }}
Це список?   {{ product.metafields.custom.ingredients.list? }}`,
      note: 'Перший рядок — уся суть теми. `product.metafields.custom.ph` віддає **обʼєкт**, і вивести його означає отримати сміття замість числа. Три властивості обʼєкта — `value`, `type` і `list?` — це все, що в metafield є. Точний текст першого рядка в Shopify інший, ніж тут, але однаково не значення.',
    }),
    h('`.value` — не косметика'),
    p('У Shopify `product.metafields.custom.ph` повертає **не значення, а обʼєкт `metafield`** із трьома властивостями: `value` (саме значення), `type` (тип поля) і `list?`. Вивести обʼєкт означає покластись на його стандартне перетворення в string — для простого тексту ще пощастить, а для посилання, списку чи `json` на екран поїде щось службове або порожнеча. Правило просте: **завжди `.value`**.'),
    h('Типи і що повертає value'),
    table(
      ['Тип metafield', 'Що в `.value`', 'Як виводити'],
      [
        ['`single_line_text_field`, `multi_line_text_field`', 'String', '`{{ mf.value }}`; багаторядковий — через `newline_to_br`'],
        ['`rich_text_field`', 'Форматований текст (заголовки, списки, посилання, жирний, курсив)', 'Лише `metafield_tag` — він збирає HTML. Саме `.value` дасть не HTML'],
        ['`number_integer`, `number_decimal`', 'Число', 'Просто `{{ mf.value }}`; `number_decimal` можна причесати через `round`'],
        ['`boolean`', '`true` / `false`', '`{% if mf.value %}` — але дивись пастку нижче'],
        ['`date`, `date_time`', 'String із датою', '`{{ mf.value | date: "%d.%m.%Y" }}`'],
        ['`json`', 'Обʼєкт JSON', 'Звернення за ключем (`mf.value.temperature`) або цикл по парах'],
        ['`url_reference`', 'String з адресою', '`<a href="{{ mf.value }}">`'],
        ['`color`', 'Обʼєкт `color`', 'Виводиться як HEX; далі — кольорові фільтри (`color_modify`, `color_to_rgb`)'],
        ['`weight`, `volume`, `dimension`', 'Обʼєкт `measurement` (`value` + `unit`)', '`{{ mf.value.value }} {{ mf.value.unit }}` або `metafield_tag`'],
        ['`rating`', 'Обʼєкт `rating` (`rating`, `scale_min`, `scale_max`)', 'Зірки малюєш сам із трьох чисел'],
        ['`money`', 'Обʼєкт `money`', '`{{ mf.value | money }}`'],
        ['`*_reference`', 'Сам обʼєкт: `product`, `collection`, `variant`, `page`, `file`', 'Працюєш як зі звичайним обʼєктом: `{{ mf.value.title }}`'],
        ['`list.*`', 'Масив значень або обʼєктів', 'Цикл `{% for item in mf.value %}`'],
      ],
    ),
    note('warn', 'boolean і чекбокс «вимкнено»', 'Metafield типу `boolean` зі значенням `false` — це **обʼєкт, який існує**, тому `{% if product.metafields.custom.is_professional %}` завжди істинна: ти перевіряєш наявність обʼєкта, а не його вміст. Правильно — `{% if product.metafields.custom.is_professional.value %}`. Та сама пастка з нулем і порожнім string: `.value` дорівнює `0` або `""`, а обʼєкт довкола них — truthy.'),
    ex({
      title: 'Та сама пастка наживо',
      preset: 'product',
      template: `{% if product.metafields.custom.is_professional %}Без value: профлінія{% else %}Без value: звичайний{% endif %}
{% if product.metafields.custom.is_professional.value %}Із value: профлінія{% else %}Із value: звичайний{% endif %}

Насправді: {{ product.metafields.custom.is_professional.value }}`,
      note: 'Metafield заповнений значенням `false`, і перший рядок усе одно каже «профлінія» — бо перевіряє, що обʼєкт існує. Помилка тиха: сторінка не падає, просто показує неправду. Один `.value` усе виправляє.',
    }),
    h('json і ключі-пастки'),
    ex({
      title: 'json: звернення за ключем і цикл парами',
      preset: 'product',
      template: `Партія: {{ product.metafields.custom.lab.value.batch }}
pH з лабораторії: {{ product.metafields.custom.lab.value["ph"] }}

{% for pair in product.metafields.custom.lab.value -%}
  {{ pair.first }} = {{ pair.last }}
{% endfor %}`,
      note: '`.value` у metafield типу `json` — звичайний обʼєкт: до нього звертаються крапкою або дужками, а цикл по ньому віддає **пари**, де `first` — ключ, а `last` — значення.',
    }),
    ex({
      title: 'Ключ називається size — і крапка вже не працює',
      preset: 'product',
      template: `Дужками:  {{ product.metafields.custom["size"].value }}
Крапкою у namespace без такого ключа: {{ product.metafields.legacy.size }}`,
      note: 'Якщо metafield зветься `size`, `first` або `last`, діставай його **дужками**. Крапка небезпечна: коли такого ключа немає, Liquid застосує до namespace однойменний фільтр — другий рядок виводить кількість полів у групі замість порожнечі. Помилки не буде, буде неправильне число.',
    }),
    h('Списки й посилання'),
    ex({
      title: 'Список простих значень',
      preset: 'product',
      template: `{% assign notes = product.metafields.custom.pickup.value -%}
Перший: {{ notes[0] }} · останній: {{ notes.last }} · скільки: {{ notes.size }}

{% for city in product.metafields.custom.ingredients.value -%}
  — {{ city }}
{% endfor %}`,
      note: 'У списку простих типів (`list.single_line_text_field` і родичі) `.value` — звичайний масив: індекси, `first`, `last`, `size` і цикл працюють як завжди.',
    }),
    code(
      'liquid',
      `{% comment %} list.product_reference — масив товарів {% endcomment %}
{% assign similar = product.metafields.custom.similar.value %}
{% for item in similar %}
  <a href="{{ item.url }}">{{ item.title }} — {{ item.price | money }}</a>
{% endfor %}
Скільки їх: {{ similar.count }}

{% comment %} list.single_line_text_field — масив рядків {% endcomment %}
{% assign notes = product.metafields.custom.pickup.value %}
{{ notes[0] }} … {{ notes.last }}
Скільки їх: {{ notes.size }}`,
      'Два види списків рахуються по-різному',
    ),
    note('warn', 'count проти size', 'У списків-**посилань** (`list.product_reference`, `list.metaobject_reference`…) довжина лежить у властивості `count`. У списків простих типів це звичайний масив, і довжину дає фільтр `size`. Переплутаєш — отримаєш порожнечу замість числа, і жодної помилки.'),
    h('metafield_tag і metafield_text'),
    p('Два фільтри працюють **з обʼєктом metafield, а не з `.value`** — і вони єдині, хто вміє малювати `rich_text_field`. `metafield_tag` віддає готовий HTML, підібраний під тип: текст обгорне абзацами, файл — тегом `<img>`, колір — квадратиком зразка, посилання на product — `<a>`. `metafield_text` віддає той самий вміст **чистим текстом**, без розмітки, — для `<title>`, мета-опису, `alt`.'),
    code(
      'liquid',
      `{{ product.metafields.custom.care | metafield_tag }}
{{ product.metafields.custom.care | metafield_text }}

{% comment %} Для посилання можна вибрати поле, яке показати {% endcomment %}
{{ product.metafields.custom.brand | metafield_text: field: 'name' }}

{% comment %} Список — через роздільник {% endcomment %}
{{ product.metafields.custom.tags_list | metafield_tag: list_format: 'comma_separated' }}`,
      'Фільтри для metafield (пісочниця їх не емулює)',
    ),
    h('Metaobjects'),
    ex({
      title: 'Metaobject наживо',
      preset: 'all',
      template: `{% assign brand = metaobjects.brand['cocochoco'] -%}
{{ brand.title.value }} · {{ brand.country.value }}
handle: {{ brand.system.handle }} · тип: {{ brand.system.type }}

Через метаполе-посилання:
{% assign linked = product.metafields.custom.brand.value -%}
{{ linked.title }} з країни {{ linked.country }}`,
      note: 'Поля metaobject — такі самі metafields, тому знову `.value`. Службове живе окремо, під `system`: інакше власне поле з імʼям `type` чи `url` перекрило б службове.',
    }),
    p('Metafield — це поле на чужому обʼєкті. **Metaobject** — власний обʼєкт: «Бренд» із назвою, логотипом і країною, «FAQ» із питанням і відповіддю. Структуру описує визначення (`metaobject_definition`), записи створюють у розділі «Вміст» адмінки. До запису потрапляють трьома шляхами: за типом і handle, через metafield типу `metaobject_reference` і циклом по всіх записах визначення.'),
    code(
      'liquid',
      `{% comment %} 1. За типом і handle {% endcomment %}
{% assign brand = metaobjects.brand['cocochoco'] %}
{{ brand.title.value }} · {{ brand.country.value }}
{{ brand.logo.value | image_url: width: 200 | image_tag }}

{% comment %} 2. Через метаполе-посилання {% endcomment %}
{% assign brand = product.metafields.custom.brand.value %}
{{ brand.system.handle }} · {{ brand.system.type }}
{% if brand.system.url %}<a href="{{ brand.system.url }}">Сторінка бренду</a>{% endif %}

{% comment %} 3. Усі записи визначення {% endcomment %}
{% for faq in metaobjects.faq.values %}
  <details><summary>{{ faq.question.value }}</summary>{{ faq.answer | metafield_tag }}</details>
{% endfor %}`,
      'Три способи дістати metaobject',
    ),
    note('shopify', 'system: щоб імена не побились', 'Службові властивості metaobject живуть під `system`: `system.handle`, `system.type`, `system.id`, `system.url`. Це зроблено навмисно — твоє поле цілком може називатись `type` чи `url`, і без окремого простору вони б перекрили службові. `system.url` заповнений лише в metaobject із увімкненою можливістю «онлайн-магазин».'),
    h('Перевірка на порожнечу'),
    ex({
      title: 'Чесна перевірка',
      data: {
        filled: { value: 'Кератин, пантенол', type: 'single_line_text_field' },
        emptyish: { value: '', type: 'single_line_text_field' },
      },
      template: `{% if filled.value != blank %}Склад: {{ filled.value }}{% endif %}
{% if emptyish.value != blank %}Склад: {{ emptyish.value }}{% else %}(порожнє поле — блок не малюємо){% endif %}
{% if missing.value != blank %}Склад: {{ missing.value }}{% else %}(поля немає — і теж не малюємо){% endif %}`,
      note: '`!= blank` ловить одразу три випадки: `nil`, порожній string і порожній масив. Тому це надійніший вартовий, ніж `{% if mf %}`.',
    }),
    note('interview', 'Чому `{{ product.metafields.custom.color }}` виводить не те, що очікуєш?', 'Бо це обʼєкт `metafield`, а не значення: у нього є `value`, `type` і `list?`. Вивести сам обʼєкт означає покластись на його перетворення в string, і для посилань, списків чи `json` там не буде нічого корисного. Правильно — `.value`, а для `rich_text_field` взагалі `metafield_tag`, бо зібрати з нього HTML інакше не вийде.'),
    note('interview', 'Чим metafield відрізняється від metaobject?', 'Metafield — додаткове поле на вже існуючому обʼєкті: склад на product, виробник на колекції. Metaobject — власна сутність зі своїм набором полів, яка живе окремо й може бути привʼязана до кількох product одразу: бренд, FAQ, таблиця розмірів. Практичне правило: якщо дані повторюються в десятків product і мають власні поля — це metaobject, а на product лишається посилання `metaobject_reference`.'),
    ],
}

/* ───────────────────────── 7. Грошові фільтри ───────────────────────── */

const moneyFiltersPage: DocPage = {
  slug: 'money-filters',
  section: 'shopify',
  title: 'Гроші: money та його родина',
  summary:
    'Чому всі ціни в Liquid — integer у копійках, чотири грошові фільтри й різниця між ними, формат із налаштувань магазину та його плейсхолдери, мультивалютність і головне правило: ніколи не ділити на 100 руками.',
  officialUrl: 'https://shopify.dev/docs/api/liquid/filters/money-filters',
  related: ['shopify/product-and-variant', 'shopify/cart', 'shopify/objects-overview', 'filters/divided_by', 'filters/round'],
  blocks: [
    p('Будь-яка сума в Liquid — це **integer (ціле число) в найменшій одиниці валюти**: `64900` означає 649,00 ₴. Так зроблено, щоб гроші ніколи не падали у float, де `0.1 + 0.2` перестає дорівнювати `0.3`. Ціна, знижка, доставка, `total_spent` customer — усе integer, і все чекає на грошовий фільтр.'),
    ex({
      title: 'Без фільтра — просто число',
      preset: 'product',
      template: `Сире: {{ product.price }}
money: {{ product.price | money }}
money_with_currency: {{ product.price | money_with_currency }}
money_without_currency: {{ product.price | money_without_currency }}
money_without_trailing_zeros: {{ product.price | money_without_trailing_zeros }}`,
      note: 'Усі чотири фільтри беруть одне й те саме число й тільки по-різному його оформлюють. Жоден із них нічого не перераховує.',
    }),
    table(
      ['Фільтр', 'Що робить', 'Коли брати'],
      [
        ['`money`', 'Формат магазину «HTML без валюти»', 'Усюди за замовчуванням: картка, cart, сторінка product'],
        ['`money_with_currency`', 'Формат «HTML із валютою» — із кодом валюти', 'Підсумки, cart, кабінет — усюди, де валюту треба назвати вголос'],
        ['`money_without_currency`', 'Саме число, без символу валюти', 'Поля вводу, `<meta>` для розмітки даних, значення для JS'],
        ['`money_without_trailing_zeros`', 'Як `money`, але прибирає «.00» у круглих сумах', 'Рекламні написи, бейджі, великі цифри в промо'],
      ],
    ),
    ex({
      title: 'Коли нулі зникають, а коли ні',
      preset: 'shop',
      template: `Кругла сума: {{ 64900 | money_without_trailing_zeros }}
Некругла сума: {{ 64950 | money_without_trailing_zeros }}
Для порівняння money: {{ 64900 | money }}`,
      note: 'Копійки фільтр прибирає **лише тоді, коли вони нульові**. Некругла ціна лишається повною — інакше «649,50» перетворилось би на «649» і магазин обманював би покупця на 50 копійок.',
    }),
    h('Найпоширеніша помилка в житті'),
    ex({
      title: 'Гривні замість копійок',
      preset: 'shop',
      template: `Хотіли 649 ₴, написали 649: {{ 649 | money }}
Хотіли 649 ₴, написали 64900: {{ 64900 | money }}`,
      note: 'Число в грошовий фільтр іде **в копійках**. Коли ціну задають через theme settings чи metafield, її майже завжди вводять у гривнях — і множити на 100 доводиться руками: `{{ settings.free_shipping_from | times: 100 | money }}`.',
    }),
    note('warn', 'Не ділити на 100 руками', 'Спокуса написати `{{ product.price | divided_by: 100 }} ₴` зʼявляється в кожного, і вона хибна одразу з трьох причин. По-перше, `divided_by` для двох integer ділить **націло**: `64950 | divided_by: 100` дасть `649`, а 50 копійок зникнуть без сліду. По-друге, символ валюти ти зашиєш у розмітку — і магазин, який завтра ввімкне другу валюту, почне показувати долари зі значком гривні. По-третє, формат (кома чи крапка, пробіл чи апостроф у тисячах) налаштовується власником магазину в адмінці, і руками ти його не відтвориш.'),
    h('Формат живе в налаштуваннях магазину'),
    p('`money` нічого не вигадує: він бере шаблон із налаштувань магазину — `shop.money_format` для «HTML без валюти» і `shop.money_with_currency_format` для «HTML із валютою». Усередині шаблону — плейсхолдер, що каже, як саме зібрати число.'),
    table(
      ['Плейсхолдер', 'Що дає з `12345678`'],
      [
        ['`{{ amount }}`', '`123,456.78` — крапка як десятковий роздільник, кома в тисячах'],
        ['`{{ amount_no_decimals }}`', '`123,457` — без копійок, із округленням'],
        ['`{{ amount_with_comma_separator }}`', '`123.456,78` — європейський запис'],
        ['`{{ amount_no_decimals_with_comma_separator }}`', '`123.457`'],
        ['`{{ amount_with_space_separator }}`', '`123 456,78` — звичний для України'],
        ['`{{ amount_no_decimals_with_space_separator }}`', '`123 457`'],
        ['`{{ amount_with_apostrophe_separator }}`', "`123'456.78` — швейцарський запис"],
      ],
    ),
    ex({
      title: 'Той самий фільтр, інші налаштування магазину',
      data: {
        shop: {
          money_format: '{{ amount_with_space_separator }} грн',
          money_with_currency_format: '{{ amount_no_decimals }} UAH',
        },
      },
      template: `money: {{ 12345678 | money }}
money_with_currency: {{ 12345678 | money_with_currency }}`,
      note: 'Тут підмінено сам магазин: формати задані в даних прикладу. Розмітка теми не змінилась — змінився лише string у налаштуваннях магазину, і цього вистачило.',
    }),
    ex({
      title: 'Формат — це HTML, а не просто текст',
      preset: 'shop',
      template: `{{ shop.money_format }}
{{ shop.money_with_currency_format }}
{{ shop.currency }}`,
      note: 'У багатьох магазинах у `money_format` лежить не голий текст, а розмітка: `<span class=amount>…</span>`. Тому результат `money` не можна пропускати через `escape` — екранований HTML вивалиться на сторінку тегами.',
    }),
    h('Мультивалютність'),
    p('З Shopify Markets один магазин показує ціни в валюті країни покупця. Головне, що тут треба знати: **Liquid вже віддає ціни в потрібній валюті** — це так звана presentment currency. Нічого перераховувати не треба, курси теми не стосуються. Саме тому весь грошовий контур і тримається на фільтрах: вони беруть валюту з поточного контексту.'),
    table(
      ['Де подивитись валюту', 'Що це'],
      [
        ['`cart.currency.iso_code`, `cart.currency.symbol`', 'Валюта, у якій зараз працює cart — тобто валюта покупця'],
        ['`localization.country.currency`', 'Валюта обраної країни: `iso_code`, `symbol`, `name`'],
        ['`shop.currency`', 'Валюта **магазину**, а не покупця. Для написів на сторінці майже ніколи не те, що треба'],
        ['`shop.enabled_currencies`', 'Список валют, увімкнених у магазині, — для перемикача'],
      ],
    ),
    ex({
      title: 'Валюта cart',
      preset: 'cart',
      template: `Разом: {{ cart.total_price | money_with_currency }}
Код валюти: {{ cart.currency.iso_code }} · символ: {{ cart.currency.symbol }}
Валюта магазину: {{ shop.currency }}`,
      note: 'У мультивалютному магазині `money` може дати «10.00 $» і для долара США, і для канадського. Саме тому на підсумках і в кабінеті беруть `money_with_currency`: код валюти знімає двозначність.',
    }),
    note('warn', 'Не складай суми з різних місць', 'Ціни, які Liquid віддає на одній сторінці, завжди в одній валюті — але лише поки вони з одного джерела. Число, збережене твоїм застосунком «у гривнях» і покладене в metafield, у валюті покупця раптом стає неправильним. Тому власні суми або зберігай разом із кодом валюти, або не показуй у грошовому форматі взагалі.'),
    note('shopify', 'Валюти без копійок теж множаться на 100', 'Навіть у єни, де немає дрібної одиниці, Liquid віддає суму помножену на сто: 1000 ¥ — це `100000`. Фільтри знають про це й малюють правильно, а ручна арифметика — ні. Ще один аргумент проти `divided_by: 100`.'),
    h('Гроші в дані для JavaScript'),
    code(
      'liquid',
      `<script type="application/json" data-product-prices>
  {
    "price": {{ product.price | json }},
    "compare_at": {{ product.compare_at_price | json }},
    "price_formatted": {{ product.price | money | json }},
    "currency": {{ cart.currency.iso_code | json }},
    "money_format": {{ shop.money_format | json }}
  }
</script>`,
      'Сире число — для обчислень, відформатоване — для показу',
    ),
    note('interview', 'Чому ціни зберігаються в копійках?', 'Щоб не мати справи з float: у них накопичується похибка, і сума cart перестає збігатися з сумою line items. Тому `product.price` — integer у найменшій одиниці валюти, а форматують його фільтри `money` та їхні родичі, беручи шаблон із налаштувань магазину. Практичний наслідок: жодного `divided_by: 100` у темі — воно і копійки зʼїсть (integer на integer ділиться націло), і формат зламає.'),
    note('interview', 'Чим money відрізняється від money_with_currency?', '`money` бере формат «HTML без валюти», `money_with_currency` — «HTML із валютою», тобто ще й код валюти. Обидва формати задає власник магазину в адмінці, тому вигляд ціни налаштовується без правок теми. Практично: у картках і cart зазвичай `money`, а на підсумках і в мультивалютному магазині — `money_with_currency`, бо «10.00 $» саме по собі не каже, чиї це долари.'),
    ],
}

/* ───────────────────────── 8. Зображення ───────────────────────── */

const imagesPage: DocPage = {
  slug: 'images',
  section: 'shopify',
  title: 'Зображення: image_url та image_tag',
  summary:
    '`image_url` із обовʼязковим розміром, `image_tag` зі `srcset`, `sizes`, `loading` і `widths`; deprecated `img_url`/`img_tag`; заглушка `placeholder_svg_tag`; фокусна точка; адаптивний патерн, як у Dawn.',
  officialUrl: 'https://shopify.dev/docs/api/liquid/filters/image_url',
  related: ['shopify/product-and-variant', 'shopify/performance', 'shopify/deprecated', 'shopify/url-and-html-filters', 'shopify/assets'],
  blocks: [
    p('Зображення в темі ніколи не вставляють «як є». Shopify зберігає оригінал на CDN і вміє віддати його в будь-якому розмірі та форматі — треба лише попросити. Просять двома фільтрами: `image_url` будує **адресу**, `image_tag` перетворює цю адресу на готовий `<img>`. Вони завжди йдуть у парі й саме в такому порядку.'),
    ex({
      title: 'Адреса потрібного розміру',
      preset: 'product',
      template: `{{ product.featured_image | image_url: width: 400 }}
{{ product | image_url: width: 400, height: 400, crop: 'center' }}`,
      note: '`image_url` працює і на обʼєкті `image`, і прямо на `product`, `variant`, `collection`, `article`, `line_item` — тоді береться їхнє головне фото.',
    }),
    ex({
      title: 'Без розміру — помилка, а не оригінал',
      preset: 'product',
      template: '{{ product.featured_image | image_url }}',
      expectError: true,
      note: 'Це навмисне рішення Shopify: адреса без розміру віддавала б оригінал на кілька мегабайтів. Тому `width` або `height` обовʼязкові — хоч один із двох.',
    }),
    h('Параметри image_url'),
    table(
      ['Параметр', 'Значення', 'Що робить'],
      [
        ['`width`', 'число, px', 'Ширина. Обовʼязкова, якщо немає `height`'],
        ['`height`', 'число, px', 'Висота. Обовʼязкова, якщо немає `width`'],
        ['`crop`', '`top`, `center`, `bottom`, `left`, `right`, `region`', 'Як обрізати, коли співвідношення сторін не збігається із замовленим'],
        ['`format`', '`jpg`, `pjpg`, `png`', 'Примусовий формат файлу'],
        ['`quality`', '10–90', 'Якість стиснення для jpg'],
        ['`pad_color`', 'HEX без решітки: `fff`', 'Колір полів, якщо зображення менше за замовлений розмір'],
      ],
    ),
    note('shopify', 'Більше за оригінал не буде', 'Скільки б ти не просив, CDN не розтягне картинку понад її справжній розмір: `width: 3000` для файла 800 px віддасть 800 px. Тому `srcset` із завеликими значеннями — це не помилка, а просто марні варіанти: браузер обере той, що існує. І ще: формат зазвичай не задають руками — CDN Shopify сам віддає сучасніший формат браузерам, які його підтримують.'),
    h('image_tag: готовий <img>'),
    ex({
      title: 'Мінімальний варіант',
      preset: 'product',
      template: '{{ product.featured_image | image_url: width: 600 | image_tag }}',
      view: 'html',
      note: '`width` і `height` фільтр підставляє сам — він читає їх із адреси й зі співвідношення сторін. Ці атрибути не косметика: без них браузер не знає місця під картинку, і сторінка стрибає під час завантаження (той самий CLS у Lighthouse).',
    }),
    ex({
      title: 'З адаптивністю й атрибутами',
      preset: 'product',
      template: `{{ product.featured_image | image_url: width: 600 | image_tag:
    widths: '300, 600, 900, 1200',
    sizes: '(min-width: 750px) 50vw, 100vw',
    loading: 'lazy',
    class: 'card__image',
    alt: product.title }}`,
      shopifyOutput: 'У справжньому Shopify `widths` перетворюється на повноцінний `srcset` (кілька адрес із суфіксами `300w`, `600w`…), а окремого атрибута `widths` у розмітці немає. Пісочниця `srcset` не збирає й виводить параметри як атрибути.',
      note: 'Будь-який параметр, якого фільтр не знає (`class`, `loading`, `id`, `data-*`), просто стає атрибутом тега. Тому свій `<img>` руками писати не треба.',
    }),
    table(
      ['Параметр image_tag', 'Що робить'],
      [
        ['`widths`', 'String із ширинами через кому — з нього збирається `srcset`'],
        ['`sizes`', 'Правило, яку ширину займе картинка в layout сторінки. Без нього браузер вважає, що 100vw, і тягне завелике'],
        ['`srcset`', 'Свій `srcset` цілком; `srcset: nil` вимикає автоматичний'],
        ['`width`, `height`', 'Перебити розміри, які фільтр порахував сам; `nil` — прибрати атрибут'],
        ['`alt`', 'Альтернативний текст'],
        ['`preload`', '`true` — додати посилання попереднього завантаження для цієї картинки'],
        ['будь-що інше', 'Стає HTML-атрибутом: `class`, `loading`, `fetchpriority`, `data-*`'],
      ],
    ),
    note('warn', 'sizes без widths не працює', '`sizes` лише пояснює браузерові, **скільки місця** займе картинка. Обирати він буде з `srcset`, а його немає, поки ти не дав `widths`. Один `sizes` — це підказка в порожнечу: браузер однаково завантажить єдину адресу з `src`.'),
    h('Адаптивний патерн, як у Dawn'),
    code(
      'liquid',
      `{%- liquid
  assign sizes = '(min-width: 1200px) 400px, (min-width: 750px) calc((100vw - 10rem) / 3), calc(100vw - 3rem)'
  assign widths = '200, 300, 400, 600, 800, 1000, 1200'
-%}

{% if product.featured_image %}
  {{ product.featured_image
     | image_url: width: 1200
     | image_tag:
       widths: widths,
       sizes: sizes,
       loading: 'lazy',
       class: 'card__image',
       alt: product.featured_image.alt | default: product.title | escape }}
{% else %}
  {{ 'product-1' | placeholder_svg_tag: 'card__image placeholder' }}
{% endif %}`,
      'Картка product: один блок, який закриває все',
    ),
    note('warn', 'Перша картинка екрана не повинна бути lazy', '`loading="lazy"` на банері героя чи на головному фото product — типова помилка «поставили всюди». Браузер відкладає завантаження, LCP росте, Lighthouse жовтіє. Правило просте: усе, що видно без прокручування, — `loading="eager"` (або взагалі без атрибута) плюс `fetchpriority="high"`, а часом ще й `preload`. Усе нижче — `lazy`.'),
    h('Заглушка: placeholder_svg_tag'),
    ex({
      title: 'Product без фото',
      preset: 'collection',
      template: `{% for product in collection.products %}
{%- if product.featured_image %}
{{ product.title }}: є фото
{%- else %}
{{ product.title }}: {{ 'product-1' | placeholder_svg_tag: 'placeholder placeholder--card' }}
{%- endif %}
{%- endfor %}`,
      note: 'Фільтр малює векторну заглушку прямо в розмітці — жодного запиту в мережу. Назви: `product-1`…`product-6`, `collection-1`…`collection-6`, `lifestyle-1`, `lifestyle-2`, `image` і кольорові варіанти на кшталт `hero-apparel-1`.',
    }),
    h('Фокусна точка'),
    p('У редакторі теми власник магазину може вказати **фокусну точку** зображення — те місце, яке не повинно зникнути при обрізанні. Обʼєкт `image.presentation.focal_point` віддає її як `x` і `y` — числа у відсотках, по `50`, якщо точку не ставили. Найприємніше, що робити з нею нічого не треба: `image_tag` сам додає `object-position` із цими координатами. Але лише за умови, що в твоєму CSS картинка має `object-fit: cover` — інакше позиціювати нічого.'),
    h('Deprecated img_url та img_tag'),
    note('warn', 'img_url, img_tag і вся їхня рідня — deprecated', 'Офіційно позначені як deprecated `img_url`, `img_tag`, `product_img_url`, `collection_img_url` і `article_img_url` — усі вони замінені на `image_url` та `image_tag`. Вони ще працюють — і саме тому трапляються в темах, які ти будеш підтримувати. Якщо бачиш `img_url: "grande"`, знай: це тема віком щонайменше кілька років, і оновлення галереї почнеться саме з цього рядка. Повний список — на сторінці [deprecated](/docs/shopify/deprecated).'),
    note('interview', 'Як зробити адаптивне зображення в темі Shopify?', '`{{ image | image_url: width: 1200 | image_tag: widths: "…", sizes: "…", loading: "lazy" }}`. `image_url` будує адресу найбільшого варіанта, `image_tag` з `widths` збирає `srcset`, а `sizes` пояснює браузерові, скільки місця картинка займе в layout, — без цього він завантажить завеликий файл. Окремо варто сказати, що `width` і `height` фільтр підставляє сам і це рятує від зсувів layout, а `lazy` ставлять лише на те, чого не видно з першого екрана.'),
    note('interview', 'Чому image_url без width падає?', 'Бо Shopify свідомо не дає віддати оригінал: без розміру CDN не знає, що генерувати, і фільтр повертає помилку. Це не примха — саме через «оригінал за замовчуванням» старі теми тягнули мегабайтні фото в картки каталогу. Мінімум один із двох параметрів, `width` або `height`, обовʼязковий, і другий рахується зі співвідношення сторін.'),
  ],
}

/* ───────────────────────── 9. Адреси й HTML-фільтри ───────────────────────── */

const urlAndHtmlFiltersPage: DocPage = {
  slug: 'url-and-html-filters',
  section: 'shopify',
  title: 'Адреси й HTML-фільтри',
  summary:
    '`asset_url` і `file_url`, теги для assets `stylesheet_tag`/`script_tag`/`preload_tag`, посилання `link_to` і `url_for_*`, `within`, `handleize`, три різні «екранування для URL», `time_tag`, `highlight` — і чому адреси беруть із `routes`, а не пишуть руками.',
  officialUrl: 'https://shopify.dev/docs/api/liquid/filters/html-filters',
  related: ['shopify/assets', 'shopify/objects-overview', 'shopify/performance', 'shopify/search', 'filters/url_encode'],
  blocks: [
    p('Ця сторінка — про фільтри, що перетворюють string на **адресу** або на **шматок HTML**. Вони дрібні, їх багато, і саме з них складається половина рядків у `theme.liquid` та в картках product.'),
    h('Файли теми: asset_url і file_url'),
    ex({
      title: 'Дві різні теки',
      preset: 'shop',
      template: `{{ 'base.css' | asset_url }}
{{ 'care-guide.pdf' | file_url }}`,
      note: '`asset_url` — для файлів **теми** (тека `assets/`): стилі, скрипти, іконки, які їдуть разом із кодом. `file_url` — для файлів, завантажених власником магазину в розділ «Файли» адмінки: прайс у PDF, інструкція, картинка для банера.',
    }),
    ex({
      title: 'Готові теги для assets',
      preset: 'shop',
      template: `{{ 'base.css' | asset_url | stylesheet_tag }}
{{ 'cart.js' | asset_url | script_tag }}
{{ 'hero.webp' | asset_url | preload_tag: as: 'image' }}`,
      note: 'Це ланцюжок із двох ланок: спершу адреса, потім тег. Писати `<link href="{{ ... }}">` руками не заборонено, але тоді ти сам відповідаєш за `rel`, `type` і за те, щоб нічого не загубити при копіюванні.',
    }),
    table(
      ['Фільтр', 'Що віддає'],
      [
        ['`asset_url`', 'Адреса файла з теки `assets/` теми'],
        ['`file_url`', 'Адреса файла з розділу «Файли» адмінки'],
        ['`global_asset_url`, `shopify_asset_url`', 'Адреси бібліотек, які роздає сама Shopify (`option_selection.js` тощо)'],
        ['`stylesheet_tag`', '`<link rel="stylesheet">`; приймає `media` і `preload`'],
        ['`script_tag`', '`<script src="…" type="text/javascript">`'],
        ['`preload_tag`', '`<link rel="preload">`; параметр `as` обовʼязковий (`style`, `script`, `font`, `image`)'],
        ['`inline_asset_content`', 'Вставляє вміст файла теми прямо в розмітку — для критичних стилів та SVG-іконок'],
      ],
    ),
    h('Посилання'),
    ex({
      title: 'link_to і його родичі',
      preset: 'all',
      template: `{{ 'Кошик' | link_to: routes.cart_url, class: 'header__link' }}
{{ 'Cocochoco' | link_to_vendor }}
{{ 'Шампунь' | link_to_type }}
{{ 'хіт' | link_to_tag: 'хіт' }}`,
      note: '`link_to` бере текст, адресу і скільки завгодно атрибутів. `link_to_vendor`, `link_to_type`, `link_to_tag` — скорочення: вони самі знають, куди вести.',
    }),
    ex({
      title: 'Хлібні крихти, що не ламаються',
      preset: 'all',
      template: `Звичайна адреса: {{ product.url }}
У межах колекції: {{ product.url | within: collection }}`,
      note: 'Фільтр робить адресу виду `/collections/home-care/products/keratin-shampoo`. На такій сторінці product стає доступним обʼєкт `collection` — можна намалювати «← назад до Домашнього догляду» і навігацію «попередній / наступний».',
    }),
    h('handleize: string → handle'),
    ex({
      title: 'Handle із назви',
      preset: 'shop',
      template: `{{ 'Keratin Shampoo 400 ml!' | handleize }}
{{ 'Деякий заголовок' | handleize }}`,
      shopifyOutput: 'Точний результат для кирилиці в Shopify інший: пісочниця лишає літери як є. На латиниці поведінка збігається.',
      note: '`handle` — те саме, просто коротша назва. Типове застосування — зробити з довільного string `id`, значення `name` або клас: `{{ block.settings.title | handleize }}`.',
    }),
    note('warn', 'handleize — не спосіб дізнатись handle product', 'Handle у Shopify створюється **в адмінці** і живе далі своїм життям: назву перейменували — handle лишився старий. Тому `collections[collection.title | handleize]` рано чи пізно промахнеться. Handle беруть з обʼєкта: `product.handle`, `collection.handle`.'),
    h('Три екранування для адрес'),
    ex({
      title: 'Що вони насправді роблять',
      preset: 'shop',
      template: `url_encode:       {{ 'шампунь для волосся' | url_encode }}
url_escape:       {{ '<p>Догляд & стайлінг</p>' | url_escape }}
url_param_escape: {{ '<p>Догляд & стайлінг</p>' | url_param_escape }}`,
      note: 'Дивись на пробіл і на амперсанд — саме в них уся різниця.',
    }),
    table(
      ['Фільтр', 'Пробіл', 'Амперсанд', 'Для чого'],
      [
        ['`url_encode`', '`+`', 'екранує', 'Значення у формі `application/x-www-form-urlencoded`'],
        ['`url_escape`', '`%20`', '**не** екранує', 'Шматок адреси, де `&` — законний роздільник'],
        ['`url_param_escape`', '`%20`', 'екранує', 'Значення одного параметра всередині адреси'],
      ],
    ),
    h('time_tag і highlight'),
    ex({
      title: 'Дата, зрозуміла і людині, і роботу',
      preset: 'blog',
      template: `{{ article.published_at | time_tag: '%d.%m.%Y' }}
{{ article.published_at | time_tag: format: 'date' }}`,
      shopifyOutput: 'У Shopify атрибут `datetime` містить час зі зміщенням магазину, а `format: "date"` бере готовий формат із файлів перекладу теми. Пісочниця віддає UTC і власний фолбек.',
      note: 'Фільтр робить `<time datetime="…">`: усередині — дата, як її читає людина, в атрибуті — машинний ISO-формат для пошукових систем і скрипта. Іменовані формати (`date`, `month_day_year`…) живуть у `locales/*.json` теми.',
    }),
    ex({
      title: 'Підсвічування знайденого',
      preset: 'shop',
      template: `{{ 'Шампунь із кератином' | highlight: 'кератин' }}`,
      view: 'html',
      note: 'Обгортає збіг у `<strong class="highlight">`. Головне застосування — сторінка [пошуку](/docs/shopify/search): `{{ item.title | highlight: search.terms }}`.',
    }),
    h('routes: жодної зашитої адреси'),
    ex({
      title: 'Що є в routes',
      preset: 'shop',
      template: `{{ routes.root_url }} · {{ routes.cart_url }} · {{ routes.cart_add_url }}
{{ routes.search_url }} · {{ routes.account_url }} · {{ routes.account_login_url }}
{{ routes.collections_url }} · {{ routes.all_products_collection_url }}`,
      note: 'Крім цих, є `cart_change_url`, `cart_update_url`, `cart_clear_url`, `account_register_url`, `account_logout_url`, `account_addresses_url`, `account_recover_url`, `predictive_search_url`, `product_recommendations_url`.',
    }),
    note('shopify', 'Theme Check це ловить', 'Правило `HardcodedRoutes` у Shopify Theme Check підсвічує будь-який string на кшталт `"/cart"` чи `"/search"` у темі й пропонує заміну з `routes`. Якщо тема здається на перевірку в Theme Store, зашиті адреси — це відмова, а не зауваження.'),
    note('interview', 'Навіщо asset_url, якщо шлях до файла відомий?', 'Бо `asset_url` віддає адресу на CDN Shopify разом із параметром версії. Це дає довгий кеш і при цьому автоматичне оновлення після деплою: змінився файл — змінилась адреса. Зашитий шлях `/assets/base.css` позбавляє і того, і того, а ще ламається на магазинах із власним доменом і на превʼю теми.'),
    note('interview', 'Яка різниця між url_encode, url_escape і url_param_escape?', '`url_encode` кодує string для поля форми: пробіл стає плюсом. `url_escape` екранує небезпечні символи адреси, але лишає `&` як роздільник — це для шматка URL. `url_param_escape` робить те саме плюс екранує `&` — це для **значення** параметра. Практичне правило: вставляєш чужий текст у `?q=` — бери `url_param_escape`, інакше один амперсанд у запиті розріже твою адресу навпіл.'),
  ],
}

/* ───────────────────────── 10. Форми ───────────────────────── */

const formsPage: DocPage = {
  slug: 'forms',
  section: 'shopify',
  title: 'Форми: тег {% form %}',
  summary:
    'Чому форму в темі не пишуть руками: типи форм і їхні адреси, обовʼязковий параметр-обʼєкт, `form.errors` і `default_errors`, `form.posted_successfully?`, форма додавання в cart із варіантами і властивостями line item.',
  officialUrl: 'https://shopify.dev/docs/api/liquid/tags/form',
  related: ['shopify/cart', 'shopify/customer', 'shopify/liquid-and-js', 'shopify/security', 'shopify/search'],
  blocks: [
    p('Будь-яка дія людини на сайті, що змінює дані, — додати product у cart, увійти, написати в підтримку, зберегти адресу — це POST на адресу Shopify. Тег `{% form %}` пише цю форму за тебе: підставляє `action`, `method`, `accept-charset`, приховане поле `form_type`, а де треба — ще й `enctype`. Тобі лишаються тільки поля.'),
    ex({
      title: 'Що насправді генерує тег',
      preset: 'product',
      template: `{% form 'product', product, id: 'add-to-cart', class: 'product-form' %}
  <input type="hidden" name="id" value="{{ product.selected_or_first_available_variant.id }}">
  <button type="submit" name="add">Додати в кошик</button>
{% endform %}`,
      note: 'Подивись на output: адреса, кодування і два приховані поля зʼявились самі. `form_type` — це те, за чим Shopify розуміє, що з цим POST робити.',
    }),
    note('warn', 'Руками цю розмітку не відтворити', 'Спокуса написати `<form action="/cart/add" method="post">` виглядає розумною рівно до першого магазину з іншою мовою: адреса має префікс, а `form_type` мусить точно збігтись із тим, що чекає сервер. Плюс форми акаунта підписуються — без тега вони просто не пройдуть. Правило без винятків: у темі Shopify форма починається з `{% form %}`.'),
    h('Типи форм'),
    table(
      ['Тип', 'Другий параметр', 'Куди й навіщо'],
      [
        ['`product`', '`product`', '`/cart/add` — додати варіант у cart'],
        ['`cart`', '`cart`', '`/cart` — оновити кількості, примітку, атрибути, перейти на checkout'],
        ['`contact`', '—', 'Форма зворотного звʼязку; поля мають імена `contact[...]`'],
        ['`customer`', '—', 'Підписка на розсилку (той самий `contact`, але з `customer[tags]`)'],
        ['`customer_login`', '—', 'Вхід в акаунт'],
        ['`create_customer`', '—', 'Реєстрація'],
        ['`recover_customer_password`', '—', 'Лист для відновлення пароля'],
        ['`reset_customer_password`', '—', 'Новий пароль за посиланням із листа'],
        ['`activate_customer_password`', '—', 'Активація акаунта, створеного менеджером'],
        ['`customer_address`', '`address` або `customer.new_address`', 'Створити чи змінити адресу в кабінеті'],
        ['`guest_login`', '—', 'Перегляд замовлення без акаунта'],
        ['`localization`', '—', 'Перемикач країни й мови'],
        ['`new_comment`', '`article`', 'Коментар до статті блогу'],
        ['`storefront_password`', '—', 'Пароль вітрини закритого магазину'],
      ],
    ),
    note('warn', 'Забув обʼєкт — форма мовчки не працює', 'Чотири типи вимагають другий параметр: `product`, `cart`, `customer_address`, `new_comment`. `{% form "product" %}` без самого `product` відрендериться без жодної помилки — і кнопка просто нічого не робитиме. Це улюблений «загадковий баг» у кастомних секціях: форма є, поля є, cart порожній.'),
    h('Форма product'),
    ex({
      title: 'Селектор варіанта, кількість і властивість line item',
      preset: 'product',
      template: `{% form 'product', product, id: 'product-form' %}
  <select name="id">
    {%- for variant in product.variants %}
    <option value="{{ variant.id }}"{% unless variant.available %} disabled{% endunless %}>
      {{ variant.title }} — {{ variant.price | money }}{% unless variant.available %} (немає){% endunless %}
    </option>
    {%- endfor %}
  </select>

  <input type="number" name="quantity" value="1" min="1">
  <input type="text" name="properties[Підпис на листівці]" maxlength="60">

  <button type="submit" name="add"{% unless product.available %} disabled{% endunless %}>
    {% if product.available %}Додати в кошик{% else %}Немає в наявності{% endif %}
  </button>
{% endform %}`,
      view: 'html',
      note: 'Три імені полів, які треба памʼятати напамʼять: `id` — це **варіант**, а не product; `quantity` — кількість; `properties[…]` — усе, що має потрапити в [line item](/docs/shopify/cart) і далі в замовлення.',
    }),
    h('Помилки'),
    p('Після невдалого POST Shopify перезавантажує сторінку і кладе в обʼєкт `form` властивість `errors`. Це не масив повідомлень, а обʼєкт `form_errors`: ітерація по ньому дає **коди** полів, а тексти лежать у `errors.messages[код]` і `errors.translated_fields[код]`. Якщо помилок немає, `form.errors` дорівнює `nil`.'),
    code(
      'liquid',
      `{% form 'create_customer' %}
  {% if form.errors %}
    <ul class="form-errors" role="alert">
      {% for field in form.errors %}
        <li>
          {% if field == 'form' %}
            {{ form.errors.messages[field] }}
          {% else %}
            <a href="#field-{{ field }}">{{ form.errors.translated_fields[field] }}</a>:
            {{ form.errors.messages[field] }}
          {% endif %}
        </li>
      {% endfor %}
    </ul>
  {% endif %}

  <input id="field-email" type="email" name="customer[email]" value="{{ form.email }}"
         {% if form.errors contains 'email' %}aria-invalid="true"{% endif %}>
  <input type="password" name="customer[password]">
  <button type="submit">Зареєструватись</button>
{% endform %}`,
      'Ручний рендер помилок — так це зроблено в Dawn',
    ),
    table(
      ['Код у `form.errors`', 'Що пішло не так'],
      [
        ['`author`', 'Проблема з обовʼязковим полем імені'],
        ['`body`', 'Проблема з обовʼязковим текстовим полем'],
        ['`email`', 'Проблема з полем пошти'],
        ['`password`', 'Проблема з паролем'],
        ['`form`', 'Загальна помилка форми — привʼязати її до конкретного поля не можна'],
      ],
    ),
    code(
      'liquid',
      `{% form 'contact' %}
  {{ form.errors | default_errors }}
  <input type="email" name="contact[email]" value="{{ form.email }}">
  <textarea name="contact[body]">{{ form.body }}</textarea>
  <button type="submit">Надіслати</button>
{% endform %}`,
      'default_errors — готовий блок помилок одним рядком',
    ),
    note('warn', 'default_errors швидкий, але чужий', 'Фільтр малює свою розмітку і свої тексти: доступності, класів теми й українських формулювань ти туди не додаси. Для прототипу — ідеально, для живої теми майже завжди пишуть свій блок, як у прикладі вище. Пісочниця `default_errors` не емулює.'),
    note('shopify', 'Значення полів повертаються самі', 'Після помилки `form.email`, `form.body`, `form.author`, `form.first_name` і решта однойменних властивостей містять те, що людина ввела. Підставляй їх у `value` — інакше після невдалої відправки форма очиститься, і людина закриє сторінку. Тільки не забувай про `escape`: це введений текст.'),
    h('posted_successfully?'),
    ex({
      title: 'Повідомлення після успішної відправки',
      preset: 'shop',
      template: `{% form 'contact' %}
  {% if form.posted_successfully? %}
    <p class="success">Дякуємо! Ми відповімо протягом дня.</p>
  {% endif %}
  <input type="email" name="contact[email]" required>
  <textarea name="contact[body]" required></textarea>
  <button type="submit">Надіслати</button>
{% endform %}`,
      note: 'У пісочниці ця властивість завжди `false` — успішного POST тут не буває. У Shopify після вдалої відправки сторінка перезавантажується з параметром на кшталт `?contact_posted=true`, і `form.posted_successfully?` стає `true` саме на тому рендері.',
    }),
    h('Акаунт і локалізація'),
    code(
      'liquid',
      `{% form 'customer_login' %}
  {{ form.errors | default_errors }}
  <input type="email" name="customer[email]" autocomplete="email">
  {% if form.password_needed %}
    <input type="password" name="customer[password]" autocomplete="current-password">
    <a href="{{ routes.account_recover_url }}">Забули пароль?</a>
  {% endif %}
  <button type="submit">Увійти</button>
{% endform %}

{% form 'recover_customer_password' %}
  {% if form.posted_successfully? %}
    <p>Лист із посиланням уже у вас на пошті.</p>
  {% endif %}
  <input type="email" name="email">
  <button type="submit">Надіслати</button>
{% endform %}`,
      'Вхід і відновлення пароля',
    ),
    ex({
      title: 'Перемикач країни й мови',
      preset: 'shop',
      template: `{% form 'localization', id: 'locale-form' %}
  <select name="locale_code">
    {%- for locale in shop.published_locales %}
    <option value="{{ locale.iso_code }}"{% if locale.primary %} selected{% endif %}>{{ locale.name }}</option>
    {%- endfor %}
  </select>
  <button type="submit">Застосувати</button>
{% endform %}`,
      note: 'Форма `localization` приймає `locale_code`, `country_code` і `return_to`. Саме вона замінила форму `currency` і фільтр `currency_selector` — обидва тепер deprecated.',
    }),
    note('interview', 'Чому не можна просто написати <form action="/cart/add">?', 'Тому що `{% form %}` додає не лише адресу: `form_type`, кодування, `enctype`, а для форм акаунта ще й службові поля, без яких POST не пройде. Плюс адреса залежить від мови й ринку — зашитий `/cart/add` ламається на будь-якому магазині з локалізацією. І останнє: чотири типи форм вимагають другий параметр (`product`, `cart`, `customer_address`, `new_comment`), і без нього форма мовчки перестає працювати — жодної помилки не буде.'),
    note('interview', 'Як показати помилки форми?', '`form.errors` — обʼєкт, який при ітерації віддає коди полів (`email`, `password`, `body`, `author`, `form`), а тексти лежать у `form.errors.messages[код]` і назви полів — у `translated_fields[код]`. Найшвидший шлях — `{{ form.errors | default_errors }}`, але він малює чужу розмітку, тому в живій темі помилки збирають циклом: так можна дати `role="alert"`, посилання на поле й `aria-invalid`. І не забути повернути введені значення з `form.email`, `form.body` — інакше форма після помилки очиститься.'),
  ],
}

/* ───────────────────────── 11. Пошук ───────────────────────── */

const searchResultsData = {
  search: {
    performed: true,
    terms: 'кератин',
    results_count: 3,
    types: ['product', 'article', 'page'],
    results: [
      {
        object_type: 'product',
        title: 'Шампунь із кератином',
        url: '/products/keratin-shampoo',
        price: 64900,
        available: true,
        description: '<p>Мʼякий безсульфатний шампунь для волосся після реконструкції кератином.</p>',
      },
      {
        object_type: 'article',
        title: 'Скільки тримається кератин',
        url: '/blogs/journal/how-long-keratin-lasts',
        content: '<p>Кератин тримається від 3 до 6 місяців — і ось від чого це залежить.</p>',
      },
      {
        object_type: 'page',
        title: 'Догляд після кератину',
        url: '/pages/aftercare',
        content: '<p>Перші 72 години після кератину вирішують усе.</p>',
      },
    ],
  },
}

const searchPage: DocPage = {
  slug: 'search',
  section: 'shopify',
  title: 'Пошук по магазину',
  summary:
    'Обʼєкт `search`, форма пошуку на `routes.search_url`, різнотипні результати й `item.object_type`, підсвітка збігів фільтром `highlight`, pagination до 50 на сторінку, чесна порожня видача і швидкий `predictive_search`.',
  officialUrl: 'https://shopify.dev/docs/api/liquid/objects/search',
  related: ['shopify/collection-and-pagination', 'shopify/url-and-html-filters', 'shopify/liquid-and-js', 'shopify/security', 'filters/strip_html'],
  blocks: [
    p('Пошук у Shopify — звичайна сторінка з шаблоном `search`. Форма надсилає **GET** на `routes.search_url` із параметром `q`, сервер шукає й кладе в шаблон обʼєкт `search`. Ніякої магії: те саме, що колекція, тільки вибірку формує пошуковий запит, а не адмінка.'),
    ex({
      title: 'Форма пошуку',
      preset: 'shop',
      template: `<form action="{{ routes.search_url }}" method="get" role="search">
  <input type="search" name="q" value="{{ search.terms | escape }}" placeholder="Що шукаємо?">
  <input type="hidden" name="options[prefix]" value="last">
  <button type="submit">Знайти</button>
</form>`,
      view: 'html',
      note: 'Метод саме `get` — результат пошуку має бути адресою, яку можна надіслати, зберегти в закладках і побачити в аналітиці. `options[prefix]=last` вмикає пошук за початком останнього слова: «керат» знайде «кератин».',
    }),
    note('warn', 'search.terms — це текст від чужої людини', 'Значення `q` приходить із адресного рядка, і вписати туди можна що завгодно. Підставляєш його назад у розмітку — обовʼязково через `escape` (в атрибут) або через `escape`/`strip_html` (у текст). Це не теорія: `?q=<script>` — перше, що пробує будь-який автоматичний сканер. Детально — у [безпеці](/docs/shopify/security).'),
    h('Обʼєкт search'),
    table(
      ['Властивість', 'Що повертає'],
      [
        ['`performed`', '`true`, якщо пошук на цій сторінці справді виконувався'],
        ['`terms`', 'Те, що шукали, — string із параметра `q`'],
        ['`results`', 'Масив результатів: product, статті та сторінки **вперемішку**'],
        ['`results_count`', 'Скільки всього знайдено'],
        ['`types`', 'Типи ресурсів, серед яких шукали — з параметра `type`'],
        ['`filters`', 'Фасети для видачі. Порожній масив, якщо product у результаті більше тисячі'],
        ['`sort_by`, `default_sort_by`, `sort_options`', 'Сортування видачі — так само, як у колекції'],
      ],
    ),
    h('Результати різнотипні'),
    p('Це головна відмінність пошуку від колекції. `collection.products` — завжди product. `search.results` — суміш: product, стаття, сторінка. У кожного результату є службова властивість `object_type`, і саме по ній розгалужують розмітку. Далі елемент поводиться як повноцінний обʼєкт свого типу: у product є `price` і `available`, у статті — `content` і `author`.'),
    ex({
      title: 'Видача трьох типів',
      data: searchResultsData,
      preset: 'shop',
      template: `Шукали: «{{ search.terms }}» · знайдено {{ search.results_count }}

{% for item in search.results %}
{%- case item.object_type %}
{%- when 'product' %}
Товар: {{ item.title }} — {{ item.price | money }} · {{ item.url }}
{%- when 'article' %}
Стаття: {{ item.title }} · {{ item.url }}
{%- when 'page' %}
Сторінка: {{ item.title }} · {{ item.url }}
{%- endcase %}
{%- endfor %}`,
      note: 'У пісочниці обʼєкт `search` зібраний руками в даних прикладу — справжнього пошуку тут немає. Форма даних та сама, що й у Shopify.',
    }),
    note('warn', 'Не звертайся до price без перевірки типу', 'У статті немає ціни, у сторінки немає фото. `{{ item.price | money }}` для статті мовчки дасть порожній string, а `{{ item.featured_image | image_url: width: 300 }}` — порожній `src`, тобто зламану картинку. Тому цикл по `search.results` завжди починається з `case item.object_type`, навіть якщо зараз у магазині немає ні блогу, ні сторінок.'),
    ex({
      title: 'highlight по назві й опису',
      data: searchResultsData,
      preset: 'shop',
      template: `{% for item in search.results limit: 2 %}
<h3>{{ item.title | highlight: search.terms }}</h3>
<p>{% if item.object_type == 'product' %}{{ item.description | strip_html | truncatewords: 15 | highlight: search.terms }}{% else %}{{ item.content | strip_html | truncatewords: 15 | highlight: search.terms }}{% endif %}</p>
{%- endfor %}`,
      view: 'html',
      note: 'Порядок фільтрів принциповий: спершу `strip_html` (прибрати розмітку автора), потім `truncatewords`, і **останнім** `highlight` — він додає свій `<strong>`, і обрізати чи чистити його вже не можна.',
    }),
    h('Типи ресурсів і параметри адреси'),
    table(
      ['Параметр', 'Значення', 'Що робить'],
      [
        ['`q`', 'текст', 'Сам запит'],
        ['`type`', '`product`, `article`, `page` через кому', 'Де шукати. За замовчуванням — скрізь'],
        ['`options[prefix]`', '`last`', 'Дошукувати останнє слово за початком: «шамп» → «шампунь»'],
        ['`sort_by`', 'як у колекції', 'Сортування видачі'],
        ['`filter.*`', 'фасети', 'Ті самі storefront-фільтри, що й у колекції'],
      ],
    ),
    note('shopify', 'Ліміт видачі — 50 на сторінку', '`search.results` усередині `{% paginate %}` приймає щонайбільше **50** елементів на сторінку — не 250, як у `collection.products`. Спроба поставити більше просто впреться в стелю. Практично це означає: нескінченна стрічка результатів робиться підвантаженням наступних сторінок, а не одним великим `by`.'),
    h('Коли не знайшлося нічого'),
    ex({
      title: 'Три різні стани',
      data: {
        search: { performed: true, terms: 'гребінь із золота', results_count: 0, results: [] },
      },
      preset: 'shop',
      template: `{% if search.performed %}
  {%- if search.results_count > 0 %}
Знайдено {{ search.results_count }}
  {%- else %}
За запитом «{{ search.terms | escape }}» нічого не знайшлось.
Спробуйте коротший запит або подивіться <a href="{{ routes.all_products_collection_url }}">весь каталог</a>.
  {%- endif %}
{% else %}
Введіть запит у полі вище.
{% endif %}`,
      note: '`performed` і `results_count` — різні питання. Перше: «людина вже щось шукала?». Друге: «а чи знайшлось?». Сторінку пошуку відкривають і без запиту — прямим посиланням із меню, — і тоді напис «нічого не знайдено» просто бреше.',
    }),
    h('predictive_search: підказки на льоту'),
    p('Це та сама поведінка, коли підказки зʼявляються прямо під полем, поки ти ще набираєш запит. Працює воно не так, як звичайний пошук: JavaScript звертається до Predictive Search API, той повертає **готовий HTML секції**, відрендерений на сервері тим самим Liquid, і тема вставляє його під поле. Тому обʼєкт `predictive_search` заповнений лише всередині секції, яку рендерить це API, — на звичайній сторінці він порожній.'),
    code(
      'liquid',
      `{% if predictive_search.performed %}
  {% if predictive_search.resources.products.size > 0 %}
    <h3>Товари</h3>
    {% for product in predictive_search.resources.products %}
      <a href="{{ product.url }}">
        {{ product.featured_image | image_url: width: 100 | image_tag: loading: 'lazy' }}
        {{ product.title | highlight: predictive_search.terms }}
        {{ product.price | money }}
      </a>
    {% endfor %}
  {% endif %}

  {% if predictive_search.resources.articles.size > 0 %}
    <h3>Статті</h3>
    {% for article in predictive_search.resources.articles %}
      <a href="{{ article.url }}">{{ article.title | highlight: predictive_search.terms }}</a>
    {% endfor %}
  {% endif %}

  {% if predictive_search.resources.products.size == 0 and predictive_search.resources.articles.size == 0 %}
    <p>Нічого не знайшлось</p>
  {% endif %}
{% endif %}`,
      'Секція підказок (sections/predictive-search.liquid)',
    ),
    table(
      ['Властивість predictive_search', 'Що повертає'],
      [
        ['`performed`', '`true`, якщо секцію рендерить саме Predictive Search API'],
        ['`terms`', 'Що людина встигла ввести'],
        ['`resources.products`, `.collections`, `.pages`, `.articles`', 'Результати, **вже розкладені по типах** — на відміну від `search.results`'],
        ['`types`', 'Типи, серед яких шукали: тут доступні ще й колекції'],
      ],
    ),
    note('shopify', 'Дві різні механіки — не плутай', 'У `search` результати лежать одним перемішаним масивом і розбираються через `object_type`. У `predictive_search` вони вже розкладені по теках: `resources.products`, `resources.articles`. Ще одна відмінність: підказки вміють шукати колекції, а звичайний пошук — ні.'),
    note('interview', 'Чим сторінка пошуку відрізняється від колекції?', 'Вибіркою і типом елементів. Колекція — завжди product, склад задано в адмінці. Пошук — результат запиту `q`, і в ньому вперемішку product, статті та сторінки, тому цикл починається з `case item.object_type`. Технічно решта та сама: pagination тим самим `{% paginate %}` (тільки стеля 50, а не 250), фасети в `search.filters`, сортування в `search.sort_options`. І `search.terms` — це введення користувача, тож `escape` обовʼязковий.'),
    note('interview', 'Як зробити миттєві підказки в пошуку?', 'Через Predictive Search API: JS шле запит із `q` і просить відрендерити секцію, сервер повертає готовий HTML, тема вставляє його під поле. Усередині цієї секції доступний обʼєкт `predictive_search` із `resources.products`, `.articles`, `.pages`, `.collections`. Ключова думка, яку варто озвучити: розмітка лишається в Liquid — JavaScript не збирає картки з JSON, а вставляє готовий шматок, тому ціни, переклади й знижки рахує сервер.'),
  ],
}

/* ───────────────────────── 12. Продуктивність ───────────────────────── */

const performancePage: DocPage = {
  slug: 'performance',
  section: 'shopify',
  title: 'Performance теми',
  summary:
    'Що насправді гальмує тему: вкладені цикли по колекціях, `all_products` і сніпети всередині циклу, metafields на кожній ітерації, важкі зображення. Як фільтрувати ДО циклу, кешувати обчислення в `assign`, і чим вимірювати — Theme Inspector, Theme Check, Lighthouse.',
  officialUrl: 'https://shopify.dev/docs/storefronts/themes/best-practices/performance',
  related: ['shopify/collection-and-pagination', 'shopify/images', 'shopify/objects-overview', 'shopify/liquid-and-js', 'shopify/debugging'],
  blocks: [
    p('Performance (швидкодія) теми Shopify складається з двох різних величин, і плутати їх — перша помилка. **Серверний рендер**: скільки мілісекунд Shopify збирає HTML із твого Liquid. **Браузерна частина**: скільки потім вантажиться й виконується те, що ти віддав. Liquid впливає на першу прямо, а на другу — через те, скільки зображень, скриптів і розмітки він нагенерував.'),
    h('Що реально гальмує'),
    table(
      ['Проблема', 'Чому дорого', 'Що робити'],
      [
        ['Вкладені цикли по product', 'Вартість множиться: 20 колекцій × 20 product — це 400 звернень до даних', 'Фільтрувати до циклу; виносити в окремі секції; підвантажувати по вимозі'],
        ['`all_products[handle]` у циклі', 'Ліміт **20 унікальних handle на сторінку**, і кожне звернення — окремий запит', 'Зібрати ці product у колекцію і йти по `collection.products`'],
        ['`{% render %}` усередині великого циклу', 'Сніпет парситься й рендериться на кожній ітерації', 'Не хвилюватись при 20 картках; при 200 — шукати інший підхід'],
        ['`product.collections` і `product.metafields` у циклі', 'Ліниві властивості: кожне звернення — робота на сервері', '`assign` один раз до циклу, далі працювати зі змінною'],
        ['`collection.all_products_count` у циклі по колекціях', 'Кожен виклик рахує', 'Порахувати заздалегідь або не показувати лічильники в меню'],
        ['Великі зображення', 'Мегабайти трафіку і зсув layout (CLS)', '`image_url: width:` + `widths` + `sizes` + `loading: lazy`'],
        ['Сторонні скрипти й застосунки', 'Часто дорожчі за всю тему разом узяту', 'Перевіряти в Lighthouse, прибирати непотріб'],
      ],
    ),
    h('Фільтруй ДО циклу, а не всередині'),
    ex({
      title: 'Погано: рішення всередині циклу',
      preset: 'collection',
      template: `{% assign shown = 0 %}
{% for product in collection.products %}
  {%- if product.available %}
    {%- assign shown = shown | plus: 1 %}
{{ product.title }}
  {%- endif %}
{%- endfor %}
Показано: {{ shown }}`,
      note: 'Цикл проходить усі пʼять product, щоб вивести чотири, а кількість доводиться рахувати власним лічильником: `collection.products.size` тут уже не про те, що на екрані.',
    }),
    ex({
      title: 'Добре: вибірка до циклу',
      preset: 'collection',
      template: `{% assign in_stock = collection.products | where: 'available', true %}
{% for product in in_stock %}
{{ product.title }}
{%- endfor %}
Показано: {{ in_stock.size }}`,
      note: '`where` віддає новий масив, і далі все просто: `size` каже правду, `first` бере перший, а цикл нічого не пропускає даремно. Виграш не стільки в мілісекундах, скільки в тому, що код перестає брехати про кількість.',
    }),
    note('warn', 'where не вміє шукати в масиві', '`where` порівнює властивість **на рівність**, тому `products | where: "tags", "догляд"` поверне порожньо: `tags` — це масив, а не string. Теги досі доводиться перевіряти в циклі через `contains` або складати вибірку заздалегідь. Це якраз той випадок, коли `if` усередині циклу — не антипатерн, а єдиний спосіб.'),
    note('shopify', 'Але фільтри не роблять запит дешевшим', 'Чесне уточнення: `where` працює вже з тим масивом, який Shopify зібрав. Якщо в колекції 250 product, сервер підняв усі 250, і `where` лише відкинув зайве в памʼяті. Справжня економія — не тягнути зайве взагалі: `{% paginate … by 12 %}`, `limit:` у циклі, окрема колекція замість фільтрації великої.'),
    h('assign і capture: порахувати один раз'),
    ex({
      title: 'Одне обчислення замість трьох',
      preset: 'product',
      template: `{% comment %}Погано: ланцюжок повторюється тричі{% endcomment %}
{{ product.compare_at_price | minus: product.price | times: 100 | divided_by: product.compare_at_price }}%

{% comment %}Добре: порахували й перевикористали{% endcomment %}
{%- assign saved = product.compare_at_price | minus: product.price -%}
{%- assign percent = saved | times: 100 | divided_by: product.compare_at_price -%}
<span class="badge">−{{ percent }}%</span>
<span class="saving">Економія {{ saved | money }}</span>
<meta itemprop="discount" content="{{ percent }}">`,
      note: 'Ланцюжок фільтрів сам по собі дешевий. Дорого стає, коли всередині нього `product.metafields`, `product.collections` або звернення за handle — і ти повторюєш це тричі на кожній із 24 карток.',
    }),
    h('Цикли: limit, offset і здоровий глузд'),
    ex({
      title: 'Беремо рівно стільки, скільки покажемо',
      preset: 'collection',
      template: `{% for product in collection.products limit: 3 %}
{{ forloop.index }}. {{ product.title }}
{%- endfor %}
—
{% for product in collection.products limit: 2 offset: 3 %}
{{ product.title }}
{%- endfor %}`,
      note: '`limit` і `offset` — найдешевший спосіб не робити зайвого. Секція «Рекомендуємо» на головній не має права проходити всю колекцію заради чотирьох карток.',
    }),
    note('shopify', 'Ліміти, які треба знати напамʼять', 'Цикл `for` — **50 ітерацій** за замовчуванням (більше — лише через `{% paginate %}`). `{% paginate %}` — до **250** елементів на сторінку, а для `search.results` — до **50**. `all_products` — **20 унікальних handle** на рендер сторінки. `product.variants` — до 250 варіантів. Ці числа питають на співбесідах частіше, ніж будь-що інше про performance.'),
    h('Зображення — найбільший важіль'),
    p('У більшості тем найважчий кілобайт — не Liquid і не JavaScript, а картинки. Три речі закривають 90% проблеми: просити в CDN потрібний розмір (`image_url: width:`), віддавати `srcset` через `widths` + `sizes`, і відкладати те, чого не видно (`loading: "lazy"`). Четверта — не ставити `lazy` на перший екран: те, що формує LCP, має вантажитись одразу й із `fetchpriority="high"`.'),
    h('Чим вимірювати'),
    table(
      ['Інструмент', 'Що показує', 'Коли брати'],
      [
        ['**Shopify Theme Inspector** (розширення Chrome)', 'Полумʼяний графік серверного рендера: який рядок Liquid скільки мілісекунд коштував', 'Коли сторінка довго «думає» до першого байта'],
        ['**Shopify Theme Check**', 'Статичний аналіз коду теми: важкі цикли, зашиті адреси, deprecated фільтри, невикористані змінні', 'Постійно — у редакторі й у CI'],
        ['**Lighthouse** / PageSpeed Insights', 'LCP, CLS, INP, вага завантажених файлів — усе, що бачить браузер', 'Після кожної помітної правки шаблонів і зображень'],
        ['**Shopify Web Performance** (аналітика магазину)', 'Реальні Core Web Vitals живих відвідувачів', 'Щоб зрозуміти, чи є проблема насправді, а не в лабораторії'],
      ],
    ),
    note('warn', 'Ледачий рендер не робить сторінку легшою', 'Сховати десять секцій під `display: none` і показувати по кліку — це не оптимізація: сервер усе одно їх відрендерив, а браузер завантажив. Те саме з «карусель на 40 карток, але видно 4»: усі 40 карток уже в HTML. Якщо контент важкий, його треба або не рендерити (`{% if %}`), або підвантажувати на вимогу.'),
    note('interview', 'Тема повільна. З чого почнеш?', 'Спершу розділю серверне й браузерне: Theme Inspector покаже, скільки коштує рендер Liquid, Lighthouse — що відбувається після. У Liquid шукаю три речі: цикли в циклах по product, звернення до лінивих властивостей (`metafields`, `collections`, `all_products`) усередині циклу і відсутність `paginate`/`limit` там, де їх мало б бути. У браузерній частині — зображення без `srcset` і `lazy`, а далі сторонні скрипти, які часто важать більше за всю тему. І головне: спочатку міряю, потім правлю — «оптимізація» без Theme Inspector зазвичай переписує те, що й так коштувало три мілісекунди.'),
    note('interview', 'Чому вкладений цикл по колекціях — це погано?', 'Бо вартість множиться, а не додається: 20 колекцій по 20 product — це 400 звернень до даних на кожен рендер, і кожне з них ліниве, тобто реальна робота на боці Shopify. До того ж `for` обмежений 50 ітераціями, тож частину даних ти однаково не побачиш. Правильно — або виносити кожен блок в окрему секцію з власним `paginate`, або показувати лише зведення, а product підвантажувати через Section Rendering API.'),
    note('interview', 'Чи пришвидшує `{% liquid %}` рендер?', 'Ні. Це суто синтаксичний цукор: кілька команд без обгорток `{% %}` навколо кожної. Рендер той самий. Пришвидшує зовсім інше — менше ітерацій, менше звернень до лінивих властивостей, менше й легші зображення. Це хороше питання-пастка: воно перевіряє, чи ти розумієш, за що саме платить сервер, чи просто вивчив «правила гарного тону».'),
  ],
}

/* ───────────────────────── 13. Liquid і JavaScript ───────────────────────── */

const liquidAndJsPage: DocPage = {
  slug: 'liquid-and-js',
  section: 'shopify',
  title: 'Liquid і JavaScript',
  summary:
    'Як передати дані з сервера в браузер: фільтр `json`, окремий `<script type="application/json">`, data-атрибути. Чому не можна вставляти string прямо в код скрипта. Section Rendering API та Ajax Cart API — оглядово.',
  officialUrl: 'https://shopify.dev/docs/api/section-rendering',
  related: ['shopify/cart', 'shopify/security', 'shopify/performance', 'shopify/objects-overview', 'filters/escape'],
  blocks: [
    p('Liquid виконується **один раз, на сервері**, і після цього його більше немає: у браузер приїжджає звичайний HTML. Тому будь-яка динаміка — перемикання варіанта, cart drawer, фільтри без перезавантаження — це JavaScript. А між ними потрібен місток: спосіб передати дані з рендера в скрипт.'),
    note('warn', 'У `.js`-файлі теми Liquid не працює', 'Файл `assets/theme.js` — статика на CDN: жодного `{{ }}` він не обробляє. Щоб Liquid туди потрапив, файл мусив би називатись `theme.js.liquid`, а такі файли тепер не рекомендовані й у нових темах не використовуються. Правильний шлях один: дані з Liquid потрапляють у **розмітку**, а скрипт читає їх звідти.'),
    h('Три робочі способи'),
    table(
      ['Спосіб', 'Для чого', 'Обмеження'],
      [
        ['`<script type="application/json">` + `| json`', 'Структури: варіанти, налаштування секції, переклади', 'Найбезпечніший і найзручніший — з нього й починай'],
        ['`data-`атрибути на елементі', 'Одне-два скалярні значення поруч із вузлом: `data-variant-id`, `data-url`', 'Тільки string і числа; обовʼязковий `escape`'],
        ['`| json` прямо в коді скрипта', 'Коли дані потрібні в інлайновому `<script>`', 'Працює, але вимагає дисципліни — див. пастку нижче'],
      ],
    ),
    h('Спосіб перший: окремий JSON'),
    ex({
      title: 'Дані секції для скрипта',
      preset: 'product',
      template: `<product-card data-product-id="{{ product.id }}">
  <script type="application/json" data-product-json>
    {
      "id": {{ product.id | json }},
      "title": {{ product.title | json }},
      "url": {{ product.url | json }},
      "price": {{ product.price | json }},
      "price_formatted": {{ product.price | money | json }},
      "variants": {{ product.variants | json }}
    }
  </script>
</product-card>`,
      note: 'Кожне значення йде через `| json` — фільтр сам ставить лапки навколо текстових значень і екранує все, що всередині. Тому ставити свої лапки не треба: `"title": "{{ product.title | json }}"` дало б подвійні.',
    }),
    h('Спосіб другий: data-атрибути'),
    ex({
      title: 'Дрібні значення поруч із елементом',
      preset: 'product',
      template: `{% assign variant = product.selected_or_first_available_variant %}
<button class="add-to-cart"
        data-variant-id="{{ variant.id }}"
        data-product-url="{{ product.url }}"
        data-title="{{ product.title | escape }}"
        data-available="{{ variant.available }}">
  Додати в кошик
</button>`,
      view: 'html',
      note: 'В атрибут іде **`escape`**, а не `json`: результат `json` уже в лапках, і всередині `data-title="…"` вони зіткнуться. Правило: `json` — для JSON, `escape` — для атрибута.',
    }),
    note('warn', 'Data-атрибути не для структур', 'Скласти весь масив варіантів у `data-variants="{{ product.variants | json | escape }}"` технічно можна — і саме так роблять у поганих темах. Виходить нечитабельний string на кілька кілобайтів у кожній картці, який ще й доводиться двічі розекрановувати. Масиви й обʼєкти — в `<script type="application/json">`.'),
    h('Чому не можна вставляти string прямо в код'),
    ex({
      title: 'Класична поламка',
      data: { title: "Олійка Kerastase — 'легка'", note: 'Рядок\nіз переносом' },
      template: `<script>
  var bad = '{{ title }}';
  var alsoBad = "{{ note }}";
</script>`,
      view: 'html',
      note: 'Апостроф у назві закриває string, перенос рядка робить незакритий літерал — і скрипт помирає з `SyntaxError`. Найгірше, що ламається він не в тебе, а на product, який менеджер заведе через півроку.',
    }),
    ex({
      title: 'Те саме через json',
      data: { title: "Олійка Kerastase — 'легка'", note: 'Рядок\nіз переносом' },
      template: `<script>
  var good = {{ title | json }};
  var alsoGood = {{ note | json }};
</script>`,
      view: 'html',
      note: 'Лапки ставить фільтр, апостроф і перенос він екранує. Це той самий випадок, коли «зроби простіше» означає «зроби надійніше».',
    }),
    note('warn', '`json` — не захист від XSS у HTML', 'Фільтр робить валідний JSON, але не знає, що навколо нього HTML. String із `</script>` усередині даних закриє твій тег — і далі браузер читатиме вміст як розмітку. Тому дані з полів, які заповнює людина (назви, `properties` line item, пошукові запити), ніколи не кладуть у **інлайновий** скрипт: для них є `<script type="application/json">` або `data-`атрибут з `escape`. Докладно — у [безпеці](/docs/shopify/security).'),
    note('shopify', 'Що входить у `product | json`', 'Фільтр серіалізує фіксований набір властивостей Drop-а. Там будуть `id`, `title`, `handle`, `price`, `variants`, `options`, `images` — і **не буде** metafields. Тому «покладу весь product у JSON і дістану metafield у JS» не працює: потрібні значення виводять поштучно, `{{ product.metafields.custom.ph.value | json }}`. І ще: повний `product | json` для product з 50 варіантами — це десятки кілобайтів у HTML кожної картки. У каталозі так не роблять.'),
    h('Section Rendering API'),
    p('Головна ідея сучасної теми: **HTML описаний один раз — у Liquid**, і JavaScript його не збирає, а лише замінює. Section Rendering API дозволяє попросити в сервера свіжий HTML будь-якої секції: додаєш до адреси `?section_id=<id секції>` і отримуєш саму секцію, без layout.'),
    code(
      'js',
      `// Наступна сторінка каталогу без перезавантаження
const url = \`\${window.location.pathname}?section_id=main-collection&page=2\`
const html = await fetch(url).then((r) => r.text())
const doc = new DOMParser().parseFromString(html, 'text/html')
document.querySelector('#grid').append(...doc.querySelectorAll('.card'))

// Перемикання варіанта: нехай сервер сам порахує ціну, знижку й наявність
const fresh = await fetch(\`\${productUrl}?variant=\${id}&section_id=main-product\`).then((r) => r.text())`,
      'Свіжа секція замість збирання розмітки в браузері',
    ),
    h('Ajax Cart API'),
    table(
      ['Адреса', 'Що робить'],
      [
        ['`POST /cart/add.js`', 'Додати варіант (або кілька) у cart'],
        ['`POST /cart/change.js`', 'Змінити кількість чи `properties` **одного line item** — за `line` (порядковий номер) або `id` (його `key`)'],
        ['`POST /cart/update.js`', 'Оновити кілька line items, примітку або атрибути cart'],
        ['`GET /cart.js`', 'Поточний стан cart у форматі JSON'],
        ['`POST /cart/clear.js`', 'Очистити cart'],
      ],
    ),
    ex({
      title: 'Адреси віддає Liquid, а не хардкод у JS',
      preset: 'shop',
      template: `<script type="application/json" data-routes>
  {
    "cart_add_url": {{ routes.cart_add_url | json }},
    "cart_change_url": {{ routes.cart_change_url | json }},
    "cart_url": {{ routes.cart_url | json }},
    "search_url": {{ routes.search_url | json }}
  }
</script>`,
      note: 'Той самий інваріант, що й у розмітці: адреси залежать від мови й ринку, тому їх ніколи не зашивають у JavaScript. Liquid віддає їх у розмітку, скрипт бере звідти.',
    }),
    note('interview', 'Як передати дані з Liquid у JavaScript?', 'Не інтерполяцією в код, а через розмітку. Найнадійніше — окремий блок `<script type="application/json">`, де кожне значення пройшло через `| json`: фільтр сам ставить лапки й екранує вміст, а браузер такий блок не виконує. Для одного-двох скалярів поруч із елементом годяться `data-`атрибути, але там уже `escape`, а не `json`. І окремо варто сказати, чому не можна `var x = "{{ product.title }}"`: апостроф у назві закриє string, перенос зламає літерал, а `</script>` у даних узагалі закриє тег.'),
    note('interview', 'Навіщо Section Rendering API, якщо є `/cart.js`?', '`/cart.js` віддає **дані**, а Section Rendering — **готовий HTML**, зібраний тим самим Liquid на сервері. Різниця принципова: з даними тобі доведеться переписати в JavaScript усю розмітку line item, форматування цін через `money`, переклади й логіку знижок — і рано чи пізно розійтися з сервером. З секцією ти просто підміняєш вузол. На практиці використовують обидва: `/cart/add.js` міняє cart, а параметр `sections` у тому самому запиті одразу повертає оновлені секції.'),
  ],
}

/* ───────────────────────── 14. Безпека ───────────────────────── */

const securityPage: DocPage = {
  slug: 'security',
  section: 'shopify',
  title: 'Безпека теми: XSS і чуже введення',
  summary:
    'Liquid нічого не екранує сам. Що в темі є «чужим введенням» — пошуковий запит, `properties` line item, примітка, поля форм; `escape`, `escape_once`, `strip_html`, `json` і чому контекст вирішує; `| json` в атрибуті; що таке «сховати ≠ захистити».',
  officialUrl: 'https://shopify.dev/docs/storefronts/themes/best-practices/security',
  related: ['shopify/liquid-and-js', 'shopify/search', 'shopify/cart', 'shopify/customer', 'filters/escape'],
  blocks: [
    p('Головне речення цієї сторінки: **Liquid не екранує output** (те, що потрапляє на сторінку). `{{ щось }}` виводить string як є, разом із тегами. Це не недогляд, а вимога — інакше не можна було б вивести `product.description`, який в адмінці навмисно пишуть як HTML. Наслідок простий: рішення «екранувати чи ні» щоразу ухвалює автор теми, і за кожне з них відповідає теж він.'),
    ex({
      title: 'Що буває без escape',
      data: { comment: '<img src=x onerror="alert(1)"> Дуже дякую!' },
      template: `Без фільтра: {{ comment }}
З escape:   {{ comment | escape }}
strip_html: {{ comment | strip_html }}`,
      shopifyOutput: 'Справжній Shopify екранує лапки як `&quot;` і `&#39;`; пісочниця використовує числові послідовності. Суть та сама.',
      note: 'Перший рядок — це не «зламана верстка», це виконаний чужий код на сторінці твого магазину. Другий — текст. Третій — текст без тегів взагалі.',
    }),
    h('Що в темі є чужим введенням'),
    table(
      ['Джерело', 'Звідки береться', 'Як виводити'],
      [
        ['`search.terms`', 'Параметр `q` в адресі — вписати можна що завгодно', '`escape` у текст, `escape` в атрибут, `url_param_escape` в адресу'],
        ['`line_item.properties`', 'Поля форми product: гравіювання, підпис, дата', '`escape` завжди'],
        ['`cart.note`, `cart.attributes`', 'Поле примітки на сторінці cart', '`escape`'],
        ['`form.email`, `form.body`, `form.author`…', 'Те, що людина ввела в форму, повертається після помилки', '`escape` в `value`'],
        ['`comment.content`, `comment.author`', 'Коментарі до статей блогу', '`escape` або `strip_html`, навіть із модерацією'],
        ['`customer.*`, `address.*`', 'Дані, які людина вписала сама', '`escape`'],
        ['Параметри адреси взагалі', '`request.path`, `?…` — усе, що в URL', 'Ніколи не як HTML і ніколи як підстава для дозволу'],
      ],
    ),
    note('warn', 'Ні, модерація не рятує', '«Коментарі перевіряє менеджер» — не аргумент: у багатьох магазинах автопублікація увімкнена, а менеджер бачить текст в адмінці вже безпечним. Те саме з `properties`: людина вписує їх сама, і ніхто не перевіряє їх до того, як cart відрендериться в неї ж на екрані. Екрануй за замовчуванням, а виняток роби свідомо.'),
    h('Що Shopify виводить як HTML навмисно'),
    table(
      ['Значення', 'Чому raw', 'Що з цим робити'],
      [
        ['`product.description`, `collection.description`, `article.content`, `page.content`', 'Це редактор адмінки: там жирний шрифт, списки, посилання', 'Виводити як є. Потрібен чистий текст — `strip_html`'],
        ['Theme settings типу `richtext` / `html`', 'Власник магазину свідомо вписує розмітку', 'Виводити як є; `text`-налаштування — через `escape`'],
        ['`metafield_tag` і `rich_text_field`', 'Фільтр сам збирає безпечний HTML', 'Виводити як є'],
        ['Результат `highlight`, `link_to`, `image_tag`, `money`', 'Це згенерована тобою ж розмітка', 'Ніколи не проганяти через `escape` — вивалиться тегами'],
        ['`content_for_header`', 'Скрипти самої Shopify: аналітика, згоди, захист', 'Не чіпати й не переносити — без нього ламається половина платформи'],
      ],
    ),
    note('warn', 'Подвійне екранування видно одразу', 'Прогнати `{{ product.description | escape }}` — типова помилка «поставив про всяк випадок». На сторінці зʼявляться живі `&lt;p&gt;`. Те саме з результатом фільтрів, що самі роблять HTML: `{{ title | highlight: search.terms | escape }}` покаже теги `<strong>` текстом.'),
    h('escape проти escape_once'),
    ex({
      title: 'Коли string уже частково екранований',
      data: { mixed: '&lt;b&gt; уже екрановано, а <i> ще ні' },
      template: `escape:      {{ mixed | escape }}
escape_once: {{ mixed | escape_once }}`,
      note: '`escape` екранує все підряд, включно з амперсандами вже наявних послідовностей — виходить `&amp;lt;b&amp;gt;`. `escape_once` бачить готові послідовності й не чіпає їх. Бери його там, де string міг пройти через екранування раніше: значення з форм, дані застосунків.',
    }),
    h('Контекст вирішує'),
    p('Liquid не знає, куди саме ти вставляєш значення, тож одного «безпечного фільтра» не існує. Для кожного місця — свій.'),
    table(
      ['Куди вставляєш', 'Чим', 'Чому'],
      [
        ['Текст у HTML', '`escape`', 'Перетворює `<` і `>` на послідовності'],
        ['Значення атрибута', '`escape`', 'Додатково знімає лапки, які розірвали б атрибут'],
        ['Значення параметра в URL', '`url_param_escape`', 'Екранує `&`, який інакше розріже адресу'],
        ['JSON-блок для скрипта', '`json`', 'Сам ставить лапки й екранує вміст'],
        ['Клас, `id`, ключ', '`handleize`', 'Лишає тільки літери, цифри й дефіси'],
        ['Інлайновий `<script>`', '— (краще не вставляти взагалі)', 'Навіть `json` не рятує від `</script>` усередині даних'],
      ],
    ),
    ex({
      title: 'Атрибут: `escape`, а не `json`',
      data: { title: 'Шампунь "Pro" & кондиціонер' },
      template: `Погано: <div data-title={{ title | json }}>
Теж погано: <div data-title="{{ title | json }}">
Добре: <div data-title="{{ title | escape }}">
Якщо потрібна саме структура: <div data-cfg="{{ title | json | escape }}">`,
      note: 'Результат `json` **уже містить лапки**, тому всередині `data-x="…"` вони стикаються і атрибут закривається достроково. Хочеш покласти в атрибут JSON — додай `escape` після `json`. Але краще винеси структуру в `<script type="application/json">`.',
    }),
    note('warn', '`| json` не робить string безпечним для HTML', 'Фільтр гарантує валідний **JSON**, і тільки це. Послідовність `</script>` усередині значення лишається сама собою, тож в інлайновому скрипті вона закриє тег і все, що далі, браузер читатиме як розмітку. Саме тому дані кладуть у `<script type="application/json">`: браузер такий блок не виконує.'),
    h('Сховати — не означає захистити'),
    p('Уся тема — це HTML, який їде в браузер відвідувача. Будь-який `{% if %}`, що «закриває» щось від сторонніх очей, насправді лише вирішує, **малювати чи ні** — і працює рівно доти, доки людина не відкриє код сторінки або не підбере адресу.'),
    code(
      'liquid',
      `{% comment %} Так НЕ захищають {% endcomment %}
{% if customer.tags contains 'wholesale' %}
  <p>Гуртова ціна: {{ wholesale_price | money }}</p>
{% endif %}

{% comment %} …бо ось це працює для всіх {% endcomment %}
{% if request.path contains 'secret' %}
  <a href="/collections/wholesale-only">Закритий розділ</a>
{% endif %}`,
      'Гейт на стороні теми — це косметика',
    ),
    note('warn', 'Три речі, яких у темі бути не може', 'Перше — **секрети**: файли теми публічно доступні за адресою на CDN, тож ключ API в `assets/theme.js` або в `settings_data.json` можна просто скачати. Друге — **ціни, пораховані в Liquid**: гроші визначає сервер, а не розмітка, тому «знижка для своїх» у шаблоні перетвориться на звичайну ціну на checkout. Третє — **логіка доступу за параметром адреси**: `?admin=1` підставить кожен.'),
    note('shopify', 'Чого Liquid не вміє — і це на краще', 'У Liquid немає `eval`, немає доступу до файлової системи, немає мережевих запитів, і він не може виконати чужий код. Тому реальний перелік загроз у темі короткий: **XSS** через неекранований output і **витік даних** через те, що ти сам вивів у HTML. Обидва пункти закриваються дисципліною екранування, а не інструментами.'),
    note('interview', 'Liquid екранує output автоматично?', 'Ні. `{{ }}` виводить значення як є, разом із HTML — інакше не можна було б вивести опис product з адмінки. Тому екранування — відповідальність автора теми, і робити його треба скрізь, де дані ввела людина: пошуковий запит, `properties` line item, примітка, поля форм, коментарі. Фільтр залежить від місця: `escape` у текст і в атрибут, `url_param_escape` в адресу, `json` у JSON-блок. І обовʼязково згадати зворотну помилку: `escape` на `product.description` покаже теги текстом.'),
    note('interview', 'Де в темі Shopify найімовірніший XSS?', 'На сторінці пошуку: `search.terms` приходить прямо з адреси, і його майже завжди підставляють назад — у заголовок «Результати за запитом…» і в `value` поля. Далі за списком — cart із `line_item.properties` (їх вписує людина у формі product) і коментарі до статей. Сильна відповідь додає, що небезпека не лише в `<script>`: `<img src=x onerror=…>` і `javascript:` у `href` працюють так само, тому екранують **усе** чуже, а не лише те, що схоже на скрипт.'),
  ],
}

/* ───────────────────────── 15. Налагодження ───────────────────────── */

const debuggingPage: DocPage = {
  slug: 'debugging',
  section: 'shopify',
  title: 'Debugging теми',
  summary:
    '`| json` замість `console.log`, напис `Liquid error` на сторінці й чому решта все одно рендериться, Theme Check і Shopify CLI (`theme dev`, `theme check`, `theme push`), `request.design_mode` — і колекція типових помилок, які мовчать.',
  officialUrl: 'https://shopify.dev/docs/storefronts/themes/tools/cli',
  related: ['shopify/objects-overview', 'shopify/metafields', 'shopify/performance', 'shopify/liquid-and-js', 'basics/sandbox'],
  blocks: [
    p('Найнеприємніше в Liquid — те, що він **мовчить**. Помилився в імені властивості — отримаєш порожній string. Звернувся до `nil` — порожній string. Переплутав тип — порожній string. Тому debugging (налагодження) теми зводиться до одного питання: «а що там насправді лежить?» — і до інструментів, які вміють на нього відповісти.'),
    h('json замість console.log'),
    ex({
      title: 'Зазирнути в обʼєкт',
      preset: 'product',
      template: `{{ product.variants.first | json }}`,
      note: 'Фільтр `json` серіалізує обʼєкт у текст — це єдиний спосіб побачити структуру, не вгадуючи імена властивостей. У реальній темі його загортають у `<pre>`, щоб читалось.',
    }),
    code(
      'liquid',
      `{% comment %} Тимчасовий «інспектор» — прибрати перед деплоєм {% endcomment %}
<pre style="max-height:300px;overflow:auto;font-size:11px">
  product:    {{ product | json }}
  variant:    {{ product.selected_or_first_available_variant | json }}
  section:    {{ section.settings | json }}
  block:      {{ block.settings | json }}
  template:   {{ template | json }}
  request:    {{ request | json }}
  cart:       {{ cart | json }}
</pre>`,
      'Швидкий дамп контексту',
    ),
    note('warn', 'json показує не все', '`product | json` віддає **фіксований** набір властивостей Drop-а: metafields, `collections` і `selected_variant` там немає. Тому «його немає в json» не означає «його немає». Значення поза цим набором перевіряй поштучно: `{{ product.metafields.custom.ph.value | json }}`.'),
    ex({
      title: 'Коли не знаєш імені ключа',
      preset: 'product',
      template: `{% for pair in product.metafields.custom %}
{{ pair.first }} = {{ pair.last }}
{%- endfor %}`,
      note: 'Ітерація по обʼєкту дає пари: `pair.first` — ключ, `pair.last` — значення. Так знаходять справжні імена metafields, атрибутів cart і налаштувань, коли документації під рукою немає.',
    }),
    h('Liquid error на сторінці'),
    ex({
      title: 'Помилка, яку побачить покупець',
      template: `Рядок до помилки — рендериться.
{{ 10 | divided_by: 0 }}
Рядок після — у Shopify теж відрендериться.`,
      expectError: true,
      shopifyOutput: 'У Shopify сторінка не падає: на місці виразу зʼявиться `Liquid error (файл line 2): divided by 0`, а решта рядків відрендериться нормально. Пісочниця суворіша — вона зупиняє рендер, щоб помилку було видно одразу.',
      note: 'Це ключова відмінність від звичайних мов: Shopify ловить помилку на рівні окремого `{{ }}` чи тега й виводить її **прямо в текст сторінки**. Тема лишається живою, а баг тихо їде в продакшн.',
    }),
    note('warn', 'Шукай "Liquid error" у коді сторінки', 'Оскільки помилка потрапляє в output як звичайний текст, вона може ховатись усередині атрибута, коментаря чи `<script>` — і на екрані її не видно взагалі. Перше, що варто зробити на «дивній» сторінці: відкрити код сторінки й пошукати `Liquid error`. У режимі попереднього перегляду теми Shopify показує ці помилки детальніше, ніж у живому магазині.'),
    table(
      ['Типовий текст помилки', 'Що це означає'],
      [
        ['`divided by 0`', 'Ділення на нуль або на `nil` (властивість, якої немає)'],
        ['`Liquid syntax error: Unknown tag`', 'Тег написано з помилкою або він не існує в Shopify'],
        ['`Liquid syntax error: … tag was never closed`', 'Забутий `{% endif %}`, `{% endfor %}`, `{% endform %}`'],
        ['`Could not find asset snippets/….liquid`', '`{% render %}` на сніпет, якого немає, або одрук в імені'],
        ['`Memory limits exceeded` / обрив рендера', 'Занадто важкий рендер — зазвичай цикл у циклі'],
      ],
    ),
    h('Shopify CLI'),
    table(
      ['Команда', 'Що робить'],
      [
        ['`shopify theme dev --store myshop.myshopify.com`', 'Локальний сервер із гарячим перезавантаженням: правиш файл — сторінка оновлюється'],
        ['`shopify theme check`', 'Статичний аналіз теми: помилки, deprecated, performance, доступність'],
        ['`shopify theme push` / `--unpublished`', 'Залити тему в магазин (або окремою неопублікованою копією)'],
        ['`shopify theme pull`', 'Забрати тему з магазину — зокрема правки, зроблені в редакторі'],
        ['`shopify theme list`', 'Перелік тем магазину з їхніми id'],
        ['`shopify theme share`', 'Створити посилання на превʼю для замовника'],
      ],
    ),
    h('Theme Check'),
    p('Theme Check — лінтер теми. Він запускається і з CLI, і як розширення редактора, і в CI. Знаходить те, що Liquid проковтне мовчки: неіснуючий фільтр, deprecated тег, зашиту адресу, цикл без ліміту, картинку без розмірів.'),
    table(
      ['Правило', 'Що ловить'],
      [
        ['`HardcodedRoutes`', 'Зашиті `"/cart"`, `"/search"` замість `routes.*`'],
        ['`DeprecatedFilter`, `DeprecatedTag`', '`img_url`, `include` і решта deprecated'],
        ['`UnknownFilter`', 'Фільтр, якого не існує, — найчастіше одрук'],
        ['`MissingTemplate`', '`{% render %}` на сніпет, якого немає'],
        ['`ImgLazyLoading`, `ImgWidthAndHeight`', 'Зображення без `loading` і без розмірів'],
        ['`UnusedAssign`, `UnusedSnippet`', 'Мертвий код'],
        ['`RemoteAsset`', 'Файли з чужих CDN замість `asset_url`'],
        ['`ParserBlockingScript`', 'Скрипт без `defer`/`async`, що гальмує рендер'],
      ],
    ),
    h('request.design_mode'),
    ex({
      title: 'Debug-панель лише в редакторі',
      preset: 'shop',
      template: `{% if request.design_mode %}
<div class="debug-panel">Секцій на сторінці: {{ template.name }} · локаль {{ request.locale.iso_code }}</div>
{% else %}
(у звичайному перегляді панелі немає)
{% endif %}`,
      note: '`request.design_mode` дорівнює `true` лише тоді, коли сторінку відкрито в редакторі теми. Це найчистіший спосіб лишити собі підказки, не показуючи їх покупцям. Там же зазвичай вмикають попередження на кшталт «секція порожня — додайте блоки».',
    }),
    note('shopify', 'Редактор теми ≠ магазин', 'У редакторі поведінка відрізняється: секції перерендеровуються поодинці, скрипти при цьому не перезапускаються самі, а події `shopify:section:load` і `shopify:section:select` існують тільки там. Тому «у редакторі не працює, на сайті працює» — це не глюк, а окремий сценарій, який теж треба підтримати.'),
    h('Помилки, які мовчать'),
    table(
      ['Симптом', 'Найімовірніша причина'],
      [
        ['Порожньо там, де має бути значення', 'Опечатка в імені властивості або обʼєкт `nil` на цій сторінці'],
        ['Metafield «не виводиться»', 'Забутий `.value`'],
        ['Умова на boolean metafield завжди істинна', 'Перевіряється обʼєкт, а не `.value`'],
        ['`{% if count == "3" %}` не спрацьовує', 'Порівняння числа зі string — різні типи'],
        ['`tags contains "хіт"` не знаходить тег `хіт продажів`', 'На масиві `contains` шукає точний елемент, не підрядок'],
        ['Змінна з циклу порожня після `{% endfor %}`', 'Scope (область видимості): `assign` усередині циклу назовні не виходить'],
        ['Сніпет не бачить змінної', '`{% render %}` ізолює контекст — передавай параметром'],
        ['У колекції видно лише 50 product', 'Ліміт циклу; потрібен `{% paginate %}`'],
        ['Ціна виглядає як `64900`', 'Забутий `money`'],
        ['Ціна виглядає як `649`, а має бути `649.50`', '`divided_by: 100` замість `money`'],
      ],
    ),
    note('interview', 'Як ти дебажиш Liquid? `console.log` же немає.', 'Основний інструмент — `| json`: він серіалізує обʼєкт у текст, і видно, що насправді лежить у `product`, `section.settings` чи `request`. Якщо не знаєш імені ключа — ітерація по обʼєкту через `pair.first` / `pair.last`. Помилки Shopify виводить прямо в HTML текстом `Liquid error`, причому решта сторінки рендериться, тому їх шукають у коді сторінки, а не на екрані. Плюс Theme Check для того, що мовчить за визначенням, і `shopify theme dev` для швидкого циклу правка → перегляд.'),
    note('interview', 'Сторінка рендериться, але блок порожній. Твої дії?', 'Спершу перевіряю, чи існує сам обʼєкт: `{{ product | json }}` або просто `{% if product %}`. Найчастіші причини — обʼєкт сторінки поза своєю сторінкою (`product` на головній — `nil`), забутий `.value` у metafield, ізоляція контексту в `{% render %}` і порівняння різних типів. Окремо дивлюсь у код сторінки на `Liquid error`: Shopify не падає, а виводить помилку текстом, і всередині атрибута її взагалі не видно.'),
  ],
}

/* ───────────────────────── 16. Застаріле ───────────────────────── */

const deprecatedPage: DocPage = {
  slug: 'deprecated',
  section: 'shopify',
  title: 'Deprecated: що досі трапляється в старих темах',
  summary:
    'Таблиця «було → стало»: `include` проти `render`, `img_url`/`img_tag` проти `image_url`/`image_tag`, deprecated властивості знижок і cart, обʼєкт `theme`, `currency_selector`, Liquid template проти JSON template і доля `checkout.liquid`.',
  officialUrl: 'https://shopify.dev/docs/api/liquid',
  related: ['shopify/images', 'shopify/snippets-render', 'shopify/json-templates', 'shopify/cart', 'shopify/debugging'],
  blocks: [
    p('Тем, написаних 2016 року, у світі більше, ніж нових. Тому deprecated (позначене як застаріле, але ще робоче) у Shopify — не історія, а робоча реальність: ти будеш це читати, підтримувати й переписувати. І це улюблена тема співбесід, бо відповідь одразу показує, скільки живих тем людина бачила.'),
    p('Важливо розуміти, що означає «deprecated» у Shopify. Майже нічого не вимикають різко: старі фільтри працюють роками. Але вони не отримують нових можливостей, не проходять Theme Check і не приймаються в Theme Store. Виняток один — `checkout.liquid`, і про нього нижче.'),
    h('Головна таблиця'),
    table(
      ['Було', 'Стало', 'Чому замінили'],
      [
        ['`{% include %}`', '`{% render %}`', 'Сніпет бачив і міняв змінні того, хто його викликав. Це ламало ізоляцію, заважало оптимізації й робило код нечитабельним'],
        ['`img_url`', '`image_url`', 'Старий приймав лише іменовані розміри (`large`, `grande`), новий — точні піксели, `crop`, `format`, `quality`'],
        ['`img_tag`', '`image_tag`', 'Новий сам ставить `width`/`height`, збирає `srcset` із `widths` і застосовує фокусну точку'],
        ['`product_img_url`, `collection_img_url`, `article_img_url`', '`image_url`', 'Три окремі фільтри на те саме — тепер один, який працює з будь-яким обʼєктом'],
        ['`hex_to_rgba`', '`color_to_rgb`, `color_modify`', 'Нові фільтри вміють усю роботу з кольором, а не лише прозорість'],
        ['`currency_selector`', 'форма `{% form "localization" %}`', 'Валюта більше не окремий вибір — вона наслідок країни й ринку'],
        ['форма `{% form "currency" %}`', 'форма `{% form "localization" %}`', 'Те саме: країна + мова одним механізмом'],
        ['обʼєкт `theme`', '`/admin/themes/current/editor`', 'Значення властивостей могли змінитись без попередження, тому покладатись на них не можна'],
        ['`shop.locale`', '`request.locale`', 'Мова залежить від **запиту**, а не від магазину'],
        ['`shop.enabled_locales`', '`shop.published_locales`', 'Стара назва не казала, що йдеться саме про опубліковані мови'],
        ['`shop.taxes_included`', '`cart.taxes_included`', 'Чи входить податок у ціну — залежить від країни покупця'],
        ['`shop.metaobjects`', '`metaobjects`', 'Metaobjects стали глобальним обʼєктом'],
        ['Liquid template (`product.liquid`)', 'JSON template (`product.json`)', 'Без JSON сторінку не можна зібрати з секцій у редакторі теми'],
        ['`checkout.liquid`', 'Checkout Extensibility', 'Єдиний випадок жорсткого відключення — див. нижче'],
      ],
    ),
    h('include проти render'),
    ex({
      title: 'Що робить include',
      snippets: { legacy: 'усередині сніпета: «{{ title }}»{% assign title = "переписано сніпетом" %}' },
      template: `{%- assign title = 'значення батька' -%}
{% include 'legacy' %}
після include: {{ title }}`,
      note: 'Сніпет прочитав чужу змінну — і перезаписав її. У великій темі це перетворюється на годинний пошук причини, чому заголовок секції раптом став чужим.',
    }),
    ex({
      title: 'Те саме через render',
      snippets: { modern: 'усередині сніпета: «{{ title }}»{% assign title = "спроба переписати" %}' },
      template: `{%- assign title = 'значення батька' -%}
{% render 'modern' %}
після render: {{ title }}
{% render 'modern', title: 'передали явно' %}`,
      note: 'Без параметра сніпет не бачить змінної батька — усередині порожньо. Присвоєння в сніпеті назовні не вийшло. А те, що потрібно, передають явно — і це видно прямо в місці виклику. Глобальні обʼєкти (`shop`, `cart`, `settings`) всередині `render` доступні завжди.',
    }),
    h('Гроші й знижки: найнебезпечніші deprecated властивості'),
    table(
      ['Було', 'Стало', 'Що ламається, якщо лишити'],
      [
        ['`line_item.price`', '`line_item.final_price`', 'Не враховує автоматичні знижки й промокоди'],
        ['`line_item.line_price`', '`line_item.final_line_price`', 'Те саме на рівні line item'],
        ['`line_item.total_discount`', '`line_item.line_level_total_discount`', 'Не бачить частини знижок'],
        ['`line_item.discounts`', '`line_item.discount_allocations`', 'Не показує всі типи знижок'],
        ['`cart.discounts`', '`cart.discount_applications`', 'Те саме для cart'],
        ['`order.discounts`', '`order.discount_applications`', 'Те саме для замовлення'],
        ['`variant.option1/2/3`', '`variant.options`', 'Працює, але не масштабується на product з іншою кількістю опцій'],
      ],
    ),
    note('warn', 'Класична скарга «на сайті одна ціна, на оплаті інша»', 'Її джерело майже завжди тут. Стара тема рахує суму cart через `item.line_price`, автоматична знижка магазину в цю властивість не входить — і покупець бачить на сторінці cart одне число, а на checkout інше. Це не баг Shopify і не «кеш»: це `line_price` замість `final_line_price`. Перше, що перевіряють у шаблоні cart успадкованої теми.'),
    h('Liquid template проти JSON template'),
    p('Liquid template (`.liquid`) — це сторінка, написана кодом: що автор поставив, те й буде. JSON template описує лише **список секцій та їхні налаштування**, а розмітку дає кожна секція окремо. Різниця не косметична: тільки з JSON власник магазину може міняти порядок блоків, додавати секції й налаштовувати сторінку в редакторі теми, не торкаючись коду. Стара тема з `product.liquid` у редакторі виглядає як суцільний непорушний шматок.'),
    code(
      'json',
      `{
  "sections": {
    "main": { "type": "main-product", "settings": { "show_vendor": true } },
    "related": { "type": "related-products", "settings": {} }
  },
  "order": ["main", "related"]
}`,
      'templates/product.json — сторінка як список секцій',
    ),
    h('checkout.liquid'),
    p('Єдиний пункт у цій таблиці, де «deprecated» означає «вимкнено». `checkout.liquid` — шаблон оформлення замовлення, доступний лише магазинам Shopify Plus. Для сторінок Information, Shipping і Payment Shopify оголосила дату відключення **13 серпня 2024 року**, а магазинам, що їх кастомізували, треба було перейти на Checkout Extensibility.'),
    note('shopify', 'Що прийшло замість', 'Checkout Extensibility — це не «новий Liquid», а інший підхід: оформлення замовлення налаштовують не темою, а **розширеннями** (UI extensions, Functions, брендинг через API). Код теми до checkout більше не має стосунку взагалі. Практичний висновок для співбесіди: на питання «як кастомізувати checkout» правильна відповідь тепер не про Liquid.'),
    h('Як переписувати успадковану тему'),
    table(
      ['Крок', 'Чим робити'],
      [
        ['1. Побачити масштаб', '`shopify theme check` — правила `DeprecatedFilter`, `DeprecatedTag`, `HardcodedRoutes`'],
        ['2. Виправити гроші першими', '`price` → `final_price` у шаблонах cart і замовлень: це помилка, яку бачить покупець'],
        ['3. Зображення', '`img_url: "grande"` → `image_url: width:` + `image_tag` з `widths`/`sizes`/`loading`'],
        ['4. `include` → `render`', 'Обережно: кожен сніпет треба перевірити на залежність від зовнішніх змінних'],
        ['5. JSON templates', 'Найбільша робота: розбити Liquid template на секції з власними схемами'],
        ['6. Адреси', 'Зашиті `/cart`, `/search` → `routes.*`'],
      ],
    ),
    note('tip', 'Не переписуй усе одразу', 'Deprecated у Shopify працює. Тому переписування успадкованої теми має йти від того, що **видно покупцеві або магазину**: спершу гроші й зображення, потім адреси, і лише потім структурні речі на кшталт JSON templates. Велике «перепишемо все й одразу» на живому магазині — найкоротший шлях зламати те, що працювало пʼять років.'),
    note('interview', 'Чим `render` відрізняється від `include` і чому останній deprecated?', '`include` виконував сніпет у контексті того, хто його викликав: сніпет бачив усі змінні навколо й міг їх змінити. Через це код ставав непередбачуваним, а рушій не міг нічого оптимізувати. `render` створює ізольований scope (область видимості): усередині лише передані параметри і глобальні обʼєкти, батьківські змінні не видно й не змінити. Побічний наслідок — сніпет тепер можна читати окремо від місця виклику, що для великої теми важливіше за будь-яку економію мілісекунд.'),
    note('interview', 'Бачиш у темі `img_url: "grande"`. Про що це каже і що робитимеш?', 'Це тема віком щонайменше кілька років: `img_url` приймав лише іменовані розміри й не вмів довільної ширини, тому нормального `srcset` у ній бути не може. Замінюю на `image_url: width:` плюс `image_tag` із `widths`, `sizes` і `loading`. І одразу перевіряю решту таких маркерів — `include`, `line_item.price`, зашиті адреси: вони майже завжди йдуть у комплекті, бо тему писали в одну епоху.'),
    note('interview', 'Чому JSON templates замінили .liquid?', 'Бо Liquid template — це фіксована сторінка, а JSON — список секцій із налаштуваннями. Тільки в другому випадку власник магазину може сам міняти порядок блоків, додавати й вимикати секції в редакторі теми. Для розробника це означає інший стиль роботи: не «сторінка з кодом», а набір самодостатніх секцій зі своїми `{% schema %}`, які редактор складає в будь-якому порядку.'),
  ],
}

export const shopifyDataPages: DocPage[] = [objectsOverview, productAndVariant, collectionAndPagination, cartPage, customerPage, metafieldsPage, moneyFiltersPage, imagesPage, urlAndHtmlFiltersPage, formsPage, searchPage, performancePage, liquidAndJsPage, securityPage, debuggingPage, deprecatedPage]
