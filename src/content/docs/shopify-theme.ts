import type { DocPage } from '../types'

/**
 * Розділ «Тема Shopify»: архітектура Online Store 2.0.
 * Ліміти й атрибути звірені з shopify.dev/docs/storefronts/themes (вересень 2026).
 * Живі приклади тримаються на емуляції з src/engine/shopify.ts: schema → section,
 * {% section %}, {% content_for 'blocks' %}, {% style %}, фільтр t.
 */

export const shopifyThemePages: DocPage[] = [
  /* ───────────────────────── 1. architecture ───────────────────────── */
  {
    slug: 'architecture',
    section: 'shopify',
    title: 'Архітектура теми: теки, ролі, шлях запиту',
    summary:
      'Тема Shopify — це тека з фіксованою структурою: `layout`, `templates`, `sections`, `blocks`, `snippets`, `assets`, `config`, `locales`. Роль файла визначає тека, у якій він лежить.',
    officialUrl: 'https://shopify.dev/docs/storefronts/themes/architecture',
    related: [
      'shopify/layouts-and-templates',
      'shopify/json-templates',
      'shopify/sections-and-schema',
      'shopify/snippets-render',
      'shopify/objects-overview',
    ],
    blocks: [
      {
        type: 'p',
        text: 'У темі Shopify немає роутера, контролерів чи конфіга збірки. Є **вісім тек із наперед відомими іменами**, і платформа сама знає, що робити з файлом, дивлячись на те, де він лежить. Поклав `product.json` у `templates/` — це шаблон сторінки товару. Поклав `price.liquid` у `snippets/` — це фрагмент, який можна викликати через `render`. Жодної реєстрації.',
      },
      {
        type: 'code',
        lang: 'text',
        title: 'Тека теми (на прикладі Dawn, скорочено)',
        code: `liquid-lab-theme/
├── assets/          CSS, JS, шрифти, картинки теми
│   ├── base.css
│   └── product-form.js
├── blocks/          theme blocks — блоки, спільні для всіх секцій
│   └── text.liquid
├── config/
│   ├── settings_schema.json   ЯКІ глобальні налаштування існують
│   └── settings_data.json     ЯКІ значення вибрав мерчант
├── layout/
│   ├── theme.liquid           рамка кожної сторінки (обовʼязковий)
│   └── password.liquid
├── locales/
│   ├── en.default.json        тексти вітрини
│   ├── en.default.schema.json тексти редактора теми
│   └── uk.json
├── sections/
│   ├── header.liquid
│   ├── header-group.json      група секцій
│   ├── main-product.liquid
│   └── featured-collection.liquid
├── snippets/
│   ├── card-product.liquid
│   └── price.liquid
└── templates/
    ├── index.json
    ├── product.json
    ├── product.alternate.json альтернативний шаблон
    ├── gift_card.liquid
    ├── customers/
    └── metaobject/`,
      },
      { type: 'h', text: 'Що за що відповідає' },
      {
        type: 'table',
        head: ['Тека', 'Що лежить', 'Хто це використовує'],
        rows: [
          ['`layout/`', 'Рамка сторінки: `<html>`, `<head>`, хедер, футер. Мінімум — `theme.liquid`.', 'Shopify загортає в неї вивід кожного шаблона. Деталі — [лейаути й шаблони](/docs/shopify/layouts-and-templates).'],
          ['`templates/`', 'По файлу на тип сторінки: `product`, `collection`, `cart`, `page`, `index`… JSON або Liquid.', 'Shopify обирає шаблон за типом ресурсу з URL. Див. [JSON-шаблони](/docs/shopify/json-templates).'],
          ['`sections/`', 'Секції (`.liquid` зі схемою) і групи секцій (`.json`).', 'JSON-шаблони, групи секцій, тег `section`. Див. [секції та схема](/docs/shopify/sections-and-schema).'],
          ['`blocks/`', 'Theme blocks — блоки як окремі файли зі своєю схемою.', 'Секції через `content_for`. Див. [блоки](/docs/shopify/blocks).'],
          ['`snippets/`', 'Фрагменти розмітки без схеми й без налаштувань.', 'Будь-який Liquid-файл через `render`. Див. [сніпети](/docs/shopify/snippets-render).'],
          ['`assets/`', 'Статика: CSS, JS, SVG, шрифти, зображення теми.', 'Фільтр `asset_url` віддає адресу на CDN. Див. [асети](/docs/shopify/assets).'],
          ['`config/`', '`settings_schema.json` (опис налаштувань теми) і `settings_data.json` (їхні значення).', 'Обʼєкт `settings`. Див. [налаштування теми](/docs/shopify/theme-settings).'],
          ['`locales/`', 'Переклади: тексти вітрини й тексти редактора.', 'Фільтр `t` і префікс `t:` у схемах. Див. [локалі](/docs/shopify/locales).'],
        ],
      },
      {
        type: 'note',
        tone: 'warn',
        title: 'Своїх підтек не буває',
        text: 'Вкладені теки Shopify не підтримує: `snippets/cards/product.liquid` чи `assets/js/cart.js` просто не завантажаться. Винятки — лише `templates/customers/` і `templates/metaobject/`. Тому в темах так багато префіксів в іменах: `card-product`, `icon-cart`, `main-product`, `component-price.css` — це заміна текам. Формально обовʼязковий тільки `layout/theme.liquid`: без нього тему не вдасться завантажити.',
      },
      { type: 'h', text: 'Шлях запиту: від URL до HTML' },
      {
        type: 'list',
        ordered: true,
        items: [
          '**URL → тип сторінки.** `/products/keratin-shampoo` — це товар, отже потрібен шаблон `product`. Shopify заодно кладе в контекст обʼєкт `product` (на сторінці колекції — `collection`, і так далі).',
          '**Тип → файл шаблона.** Якщо товару в адмінці призначено альтернативний шаблон `alternate`, береться `templates/product.alternate.json`, інакше — `templates/product.json` (або `.liquid`).',
          '**Шаблон → секції.** JSON-шаблон — це список секцій у порядку `order`. Кожна секція рендериться окремо, зі своїми `section.settings` і `section.blocks`.',
          '**Секції → блоки й сніпети.** Секція обходить `section.blocks` (або викликає `content_for`) і підтягує сніпети через `render`.',
          '**Усе це → у лейаут.** Готовий HTML шаблона підставляється в `layout/theme.liquid` на місце `content_for_layout`. Сам лейаут додає `<head>`, групи секцій хедера та футера і службові скрипти з `content_for_header`.',
        ],
      },
      {
        type: 'code',
        lang: 'text',
        title: 'Те саме схемою',
        code: `GET /products/keratin-shampoo
  │
  ├─ templates/product.json ─────────── який набір секцій і в якому порядку
  │    ├─ sections/main-product.liquid
  │    │    ├─ блоки: title, price, buy_buttons…
  │    │    └─ snippets/price.liquid, snippets/product-media.liquid
  │    └─ sections/related-products.liquid
  │         └─ snippets/card-product.liquid
  │
  └─ layout/theme.liquid ────────────── рамка навколо
       ├─ {{ content_for_header }}      скрипти Shopify
       ├─ {% sections 'header-group' %}
       ├─ {{ content_for_layout }}      ← сюди лягає все, що вище
       └─ {% sections 'footer-group' %}`,
      },
      {
        type: 'example',
        title: 'Ланцюжок у мініатюрі: шаблон → секція → сніпет',
        preset: 'product',
        view: 'html',
        template: `{% comment %} Це роль templates/product.liquid {% endcomment %}
{% section 'main-product' %}`,
        snippets: {
          'sections/main-product': `<h1>{{ product.title }}</h1>
{% render 'vendor-badge', vendor: product.vendor %}

{% schema %}
{ "name": "Товар" }
{% endschema %}`,
          'vendor-badge': `<span class="badge">{{ vendor | upcase }}</span>`,
        },
        note: 'Подивись на обгортку у виводі: `<div id="shopify-section-…" class="shopify-section">`. Її додає **платформа**, а не твій код — кожна секція на сторінці живе у власному контейнері з унікальним `id`. Саме за нього чіпляється редактор теми й Section Rendering API.',
      },
      { type: 'h', text: 'Хто кого може викликати' },
      {
        type: 'table',
        head: ['Файл', 'Що може підключити', 'Чого не бачить'],
        rows: [
          ['Лейаут', 'секції (`section`), групи секцій (`sections`), сніпети (`render`)', '—'],
          ['Liquid-шаблон', 'секції (`section`), сніпети', 'змінних, створених у лейауті'],
          ['JSON-шаблон', 'тільки секції — переліком у JSON, без жодного Liquid', '—'],
          ['Секція', 'сніпети, свої блоки, theme blocks (`content_for`). **Іншу секцію — ні.**', 'змінних, створених поза секцією'],
          ['Theme block', 'сніпети, вкладені блоки', 'змінних секції (лише обʼєкти `section` і `block`)'],
          ['Сніпет', 'інші сніпети', 'змінних того, хто його викликав, — крім переданих параметрами'],
        ],
      },
      {
        type: 'p',
        text: 'Спільне правило: **глобальні обʼєкти** (`shop`, `cart`, `settings`, `request`, `routes`, а на сторінці товару ще й `product`) видно всюди. А от змінні, створені через `assign` чи `capture`, **межу файла не перетинають**: ні в секцію ззовні, ні в сніпет без явного параметра. Це не примха — саме ізольованість дозволяє Shopify рендерити секцію окремо від сторінки, коли мерчант щось змінює в редакторі.',
      },
      {
        type: 'example',
        title: 'Як код дізнається, на якій він сторінці',
        preset: 'product',
        data: { request: { page_type: 'product', path: '/products/keratin-shampoo', locale: { iso_code: 'uk', name: 'Українська' }, design_mode: false } },
        template: `Шаблон: {{ template.name }}
Тип сторінки: {{ request.page_type }}
Локаль: {{ request.locale.iso_code }}

{% if template.name == 'product' %}
  Тут доступний обʼєкт product: {{ product.title }}
{% endif %}`,
        note: '`template` і `request` — глобальні обʼєкти. Через них сніпет чи секція вирішує, як поводитись на різних сторінках (наприклад, хедер робить логотип `<h1>` лише на головній).',
      },
      { type: 'h', text: 'Online Store 2.0 проти «вінтажних» тем' },
      {
        type: 'table',
        head: ['', 'Вінтажна тема', 'Online Store 2.0'],
        rows: [
          ['Шаблони', '`.liquid` із розміткою всередині', '`.json` — лише перелік секцій'],
          ['Секції, які мерчант додає сам', 'тільки на головній (через `content_for_index`)', 'на будь-якій сторінці'],
          ['Хедер і футер', 'статичні секції в лейауті', 'групи секцій — туди теж можна додавати секції'],
          ['Блоки застосунків', 'застосунок правив код теми', 'app blocks: застосунок додається в секцію без правок коду'],
          ['Динамічні дані в налаштуваннях', 'немає', 'метаполя як dynamic sources'],
        ],
      },
      {
        type: 'note',
        tone: 'shopify',
        title: 'Як це виглядає в Dawn',
        text: 'У Dawn майже всі файли в `templates/` — JSON. Розмітка сторінки товару живе в `sections/main-product.liquid`, картка товару — у `snippets/card-product.liquid`, хедер і футер зібрані в `sections/header-group.json` та `sections/footer-group.json`. CSS і JS порізані на дрібні файли в `assets/`, і кожна секція підключає лише свої. Відкрий Dawn на GitHub і пройди цим маршрутом для сторінки товару — це найшвидший спосіб «побачити» архітектуру.',
      },
      {
        type: 'note',
        tone: 'interview',
        title: 'На співбесіді: «Розкажи структуру теми»',
        text: 'Не перелічуй теки за алфавітом — розкажи **шлях запиту**. «Shopify за URL визначає тип сторінки й бере відповідний файл із `templates`. У темах 2.0 це JSON зі списком секцій. Секції лежать у `sections`, мають схему з налаштуваннями й блоками, а повторювану розмітку виносять у `snippets`. Результат шаблона вставляється в `layout/theme.liquid` через `content_for_layout`. Поруч — `assets` зі статикою, `config` із глобальними налаштуваннями і `locales` з перекладами». Тридцять секунд — і видно, що ти розумієш, як частини повʼязані.',
      },
      {
        type: 'note',
        tone: 'interview',
        title: 'Уточнення, які прилітають далі',
        text: '**«Чим секція відрізняється від сніпета?»** — секція має схему, налаштування, блоки, власну обгортку й рендериться незалежно; сніпет — просто фрагмент із параметрами. **«Чи може секція підключити іншу секцію?»** — ні, лише сніпети та блоки. **«Де зберігається те, що мерчант наклацав у редакторі?»** — у JSON-файлах теми: `templates/*.json`, `sections/*-group.json` і `config/settings_data.json`. Тобто редактор теми — це, по суті, візуальний редактор JSON.',
      },
      {
        type: 'note',
        tone: 'tip',
        text: 'Локально з темою працюють через Shopify CLI: `shopify theme dev` піднімає превʼю з гарячим оновленням, `shopify theme check` ганяє лінтер Theme Check, який ловить і помилки Liquid, і порушення структури (невідомий сніпет, невалідна схема, застарілий фільтр).',
      },
    ],
  },

  /* ───────────────────── 2. layouts-and-templates ───────────────────── */
  {
    slug: 'layouts-and-templates',
    section: 'shopify',
    title: 'Лейаути й шаблони: theme.liquid, суфікси, обʼєкт template',
    summary:
      'Лейаут — рамка сторінки з двома обовʼязковими обʼєктами: `content_for_header` і `content_for_layout`. Шаблон — вміст конкретного типу сторінки; у нього можуть бути альтернативні версії із суфіксом.',
    officialUrl: 'https://shopify.dev/docs/storefronts/themes/architecture/layouts',
    related: ['shopify/architecture', 'shopify/json-templates', 'shopify/section-groups', 'shopify/assets'],
    blocks: [
      {
        type: 'p',
        text: 'Лейаут відповідає на питання «що є **на кожній** сторінці»: `<head>`, метатеги, підключення CSS, хедер, футер. Шаблон — «що є **саме на цій**»: товар, колекція, кошик. Shopify рендерить шаблон, а результат вставляє в лейаут.',
      },
      {
        type: 'code',
        lang: 'liquid',
        title: 'layout/theme.liquid — мінімальний робочий каркас',
        code: `<!doctype html>
<html lang="{{ request.locale.iso_code }}">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{{ page_title }}</title>
    <link rel="canonical" href="{{ canonical_url }}">

    {{ 'base.css' | asset_url | stylesheet_tag }}

    {{ content_for_header }}
  </head>
  <body class="template-{{ template.name }}">
    {% sections 'header-group' %}

    <main id="MainContent" role="main">
      {{ content_for_layout }}
    </main>

    {% sections 'footer-group' %}
  </body>
</html>`,
      },
      { type: 'h', text: 'Два обовʼязкові обʼєкти' },
      {
        type: 'table',
        head: ['Обʼєкт', 'Де має стояти', 'Що виводить'],
        rows: [
          ['`content_for_header`', 'усередині `<head>`', 'Усе, що потрібно самій платформі: скрипти аналітики, застосунків, динамічного чекауту, зібрані бандли з тегів `javascript`/`stylesheet`, службові метадані редактора теми.'],
          ['`content_for_layout`', 'усередині `<body>`', 'Відрендерений вміст поточного шаблона — тобто всі його секції.'],
        ],
      },
      {
        type: 'note',
        tone: 'warn',
        title: 'content_for_header — чорна скринька',
        text: 'Його не можна парсити, різати фільтрами чи «оптимізувати» через `replace`. Офіційне формулювання: вміст може змінитися будь-коли, і твій код зламається разом із ним. Старі «хаки швидкості» на кшталт `{{ content_for_header | replace: … }}` — саме той код, за який на ревʼю дають по руках. Обидва обʼєкти в `theme.liquid` обовʼязкові: без них застосунки, редактор теми й сам вміст сторінки просто не зʼявляться.',
      },
      {
        type: 'example',
        title: 'Лейаут у мініатюрі',
        view: 'html',
        data: {
          page_title: 'Шампунь із кератином – Liquid Lab',
          content_for_header: '<!-- тут Shopify вставляє свої скрипти -->',
          content_for_layout: '<section class="shopify-section"><h1>Шампунь із кератином</h1></section>',
          template: { name: 'product', suffix: null },
        },
        template: `<head>
  <title>{{ page_title }}</title>
  {{ content_for_header }}
</head>
<body class="template-{{ template.name }}">
  <header>Liquid Lab</header>
  <main>{{ content_for_layout }}</main>
  <footer>© Liquid Lab</footer>
</body>`,
        note: 'Для лейаута обидва обʼєкти — просто готові рядки HTML. У пісочниці ми підклали їх руками через дані; у Shopify їх формує платформа. Зміни `content_for_layout` у даних — і «сторінка» стане іншою, а рамка лишиться.',
      },
      { type: 'h', text: 'Альтернативні лейаути' },
      {
        type: 'p',
        text: 'Лейаутів може бути кілька. Типовий другий — `layout/password.liquid` для сторінки-заглушки закритого магазину: там не потрібні ні меню, ні кошик. Інші приклади — лендинг без хедера чи сторінка для вбудовування. Як шаблон обирає лейаут, залежить від його формату:',
      },
      {
        type: 'code',
        lang: 'liquid',
        title: 'У Liquid-шаблоні — тег layout (зазвичай першим рядком)',
        code: `{% layout 'full-width' %}   {% comment %} візьме layout/full-width.liquid {% endcomment %}

{% layout none %}            {% comment %} без лейаута взагалі: голий вивід шаблона {% endcomment %}`,
      },
      {
        type: 'code',
        lang: 'json',
        title: 'У JSON-шаблоні — атрибут layout',
        code: `{
  "layout": "password",
  "sections": { "main": { "type": "main-password" } },
  "order": ["main"]
}`,
      },
      {
        type: 'p',
        text: 'Якщо нічого не вказати, береться `theme.liquid`. У JSON-шаблоні можна написати й `"layout": false` — це аналог `layout none`.',
      },
      {
        type: 'example',
        title: 'Навіщо layout none: шаблон, що віддає дані',
        preset: 'collection',
        template: `{% layout none %}
{
  "collection": {{ collection.handle | json }},
  "products": {{ collection.products | map: 'handle' | json }}
}`,
        note: 'Класичний прийом: альтернативний Liquid-шаблон `collection.feed.liquid` без лейаута, який JS забирає запитом на `/collections/home-care?view=feed`. У сучасних темах для підвантаження HTML частіше беруть Section Rendering API, але цей патерн досі живе в багатьох магазинах — і про нього питають. У пісочниці тег `layout` нічого не робить: лейаута тут і так немає.',
      },
      {
        type: 'note',
        tone: 'warn',
        text: 'JSON-шаблон із `"layout": false` **не можна налаштовувати в редакторі теми**: редактору потрібні скрипти з `content_for_header`, а вони живуть у лейауті.',
      },
      { type: 'h', text: 'Типи шаблонів' },
      {
        type: 'table',
        head: ['Шаблон', 'Сторінка', 'Головний обʼєкт'],
        rows: [
          ['`index`', 'головна', '—'],
          ['`product`', '`/products/<handle>`', '`product`'],
          ['`collection`', '`/collections/<handle>`', '`collection`'],
          ['`list-collections`', '`/collections`', '`collections`'],
          ['`cart`', '`/cart`', '`cart` (він і так глобальний)'],
          ['`page`', '`/pages/<handle>`', '`page`'],
          ['`blog`', '`/blogs/<handle>`', '`blog`'],
          ['`article`', '`/blogs/<blog>/<handle>`', '`article`, `blog`'],
          ['`search`', '`/search`', '`search`'],
          ['`404`', 'неіснуюча адреса', '—'],
          ['`password`', 'заглушка закритого магазину', '—'],
          ['`metaobject/<тип>`', 'сторінка запису метаобʼєкта', '`metaobject`'],
          ['`gift_card.liquid`', 'сторінка подарункової картки', '`gift_card`'],
          ['`robots.txt.liquid`', '`/robots.txt`', '`robots`'],
        ],
      },
      {
        type: 'p',
        text: 'Майже всі шаблони можуть бути і JSON, і Liquid. Винятки — `gift_card`, `robots.txt` і ще кілька службових текстових шаблонів: вони **тільки Liquid**, бо секцій там не буває. Шаблони `customers/*` (класичні акаунти покупців) Shopify позначає як застарілі.',
      },
      { type: 'h', text: 'Альтернативні шаблони (суфікси)' },
      {
        type: 'p',
        text: 'Один тип сторінки може мати кілька шаблонів. Імʼя будується як `тип.суфікс.розширення`: `product.alternate.json`, `page.contact.json`, `collection.lookbook.json`. Мерчант призначає такий шаблон конкретному товару чи сторінці в адмінці (поле «Шаблон теми»), а розробник може перевірити його без призначення — параметром `?view=alternate` в адресі.',
      },
      {
        type: 'example',
        title: 'Обʼєкт template',
        data: { template: { name: 'product', suffix: 'alternate', directory: null } },
        template: `name: {{ template.name }}
suffix: {{ template.suffix }}
directory: {{ template.directory | default: '(корінь templates)' }}

<body class="template-{{ template.name }}{% if template.suffix %} template-{{ template.name }}--{{ template.suffix }}{% endif %}">`,
        note: '`suffix` — `nil` для основного шаблона, `directory` — `customers` або `metaobject` для шаблонів із підтек, інакше `nil`. У Shopify сам обʼєкт ще й друкується рядком: `{{ template }}` дасть `product.alternate`. Пісочниця цього не вміє, тому звертайся до полів.',
      },
      {
        type: 'note',
        tone: 'warn',
        title: 'Основний шаблон суфіксом не замінити',
        text: 'Альтернативний шаблон не може «перекрити» дефолтний: `product.json` завжди лишається шаблоном для всіх товарів, яким нічого не призначено. Хочеш змінити сторінку всіх товарів — редагуй основний шаблон.',
      },
      {
        type: 'note',
        tone: 'interview',
        title: 'На співбесіді: content_for_header і content_for_layout',
        text: 'Питають майже завжди. Відповідь: «Це два обовʼязкові обʼєкти лейаута. `content_for_header` стоїть у `<head>` і виводить скрипти, потрібні Shopify та застосункам; його не можна модифікувати. `content_for_layout` стоїть у `<body>` і виводить відрендерений шаблон поточної сторінки. Лейаут — рамка, шаблон — вміст». Бонус — згадати, що критичні для першого екрана ресурси варто ставити **перед** `content_for_header`, бо він тягне чимало сторонніх скриптів.',
      },
      {
        type: 'note',
        tone: 'interview',
        title: 'На співбесіді: «Частині товарів потрібна інша сторінка. Як?»',
        text: 'Створюю альтернативний шаблон `product.<суфікс>.json` з іншим набором секцій; мерчант призначає його потрібним товарам в адмінці (можна масово). Код секцій при цьому спільний — відрізняється лише JSON. Якщо різниця дрібна (один блок), краще не плодити шаблони, а розгалузитися всередині секції за тегом, метаполем чи `template.suffix`.',
      },
    ],
  },

  /* ───────────────────────── 3. json-templates ───────────────────────── */
  {
    slug: 'json-templates',
    section: 'shopify',
    title: 'JSON-шаблони: «секції всюди»',
    summary:
      'JSON-шаблон не містить розмітки — лише перелік секцій, їхні налаштування й порядок. Саме він дає мерчанту змогу збирати будь-яку сторінку в редакторі теми.',
    officialUrl: 'https://shopify.dev/docs/storefronts/themes/architecture/templates/json-templates',
    related: ['shopify/layouts-and-templates', 'shopify/sections-and-schema', 'shopify/blocks', 'shopify/section-groups'],
    blocks: [
      {
        type: 'p',
        text: 'Liquid-шаблон — це код: що написав розробник, те й буде на сторінці. JSON-шаблон — це **дані**: список секцій, які треба відрендерити, і значення їхніх налаштувань. Код живе в секціях, а шаблон лише каже, які з них узяти і в якому порядку. Дані, на відміну від коду, може безпечно редагувати людина без навичок програмування — через редактор теми.',
      },
      {
        type: 'code',
        lang: 'json',
        title: 'templates/product.json',
        code: `{
  "sections": {
    "main": {
      "type": "main-product",
      "blocks": {
        "title": { "type": "title" },
        "price": { "type": "price" },
        "buy": { "type": "buy_buttons", "settings": { "show_dynamic_checkout": true } }
      },
      "block_order": ["title", "price", "buy"],
      "settings": { "enable_sticky_info": true }
    },
    "recommendations": {
      "type": "related-products",
      "settings": { "heading": "Разом із цим беруть", "products_to_show": 4 }
    }
  },
  "order": ["main", "recommendations"]
}`,
      },
      { type: 'h', text: 'Структура файла' },
      {
        type: 'table',
        head: ['Атрибут', 'Обовʼязковий', 'Що означає'],
        rows: [
          ['`sections`', 'так', 'Обʼєкт: ключ — довільний унікальний ID секції в межах шаблона, значення — її дані.'],
          ['`order`', 'так', 'Масив ID: у якому порядку рендерити. Секція, якої немає в `order`, не виведеться.'],
          ['`layout`', 'ні', 'Імʼя лейаута без `.liquid` або `false`. За замовчуванням — `theme`.'],
          ['`wrapper`', 'ні', 'Обгортка навколо всіх секцій шаблона: `div`, `main` або `section` із класами й атрибутами, напр. `"main#product.page-width[data-page=product]"`.'],
        ],
      },
      {
        type: 'table',
        head: ['Поле секції', 'Що означає'],
        rows: [
          ['`type`', 'Імʼя файла секції без розширення: `"main-product"` → `sections/main-product.liquid`. Єдине обовʼязкове поле.'],
          ['`settings`', 'Значення налаштувань. Чого тут немає — візьметься з `default` у схемі секції.'],
          ['`blocks`', 'Обʼєкт блоків: ID → `type` і `settings`.'],
          ['`block_order`', 'Порядок блоків.'],
          ['`disabled`', '`true` — секцію приховано («око» в редакторі): не рендериться, але налаштування зберігаються.'],
          ['`custom_css`', 'CSS, який мерчант дописав до секції в редакторі. Поле веде платформа.'],
        ],
      },
      {
        type: 'example',
        title: 'Що робить Shopify з цим файлом (модель на Liquid)',
        view: 'html',
        data: {
          tpl: {
            sections: {
              main: { type: 'main-product', settings: { enable_sticky_info: true } },
              recommendations: { type: 'related-products', settings: { heading: 'Разом із цим беруть' } },
              hidden_banner: { type: 'promo-banner', disabled: true, settings: {} },
            },
            order: ['main', 'hidden_banner', 'recommendations'],
          },
        },
        template: `{% for id in tpl.order %}
  {%- assign s = tpl.sections[id] -%}
  {%- if s.disabled %}{% continue %}{% endif %}
  <div id="shopify-section-template--1__{{ id }}" class="shopify-section">
    тут відрендериться sections/{{ s.type }}.liquid
  </div>
{% endfor %}`,
        note: 'Це **модель**, а не справжній механізм: у темі такого коду немає, обхід робить платформа. Але логіка саме така — пройти `order`, пропустити `disabled`, для кожної секції знайти файл за `type` і загорнути вивід у `div` з унікальним `id`. Зверни увагу на формат ID: `template--<число>__<ключ>` — так виглядає `section.id` у секцій із JSON-шаблонів.',
      },
      { type: 'h', text: 'Чому OS 2.0 = «секції всюди»' },
      {
        type: 'p',
        text: 'Секції зʼявилися ще до Online Store 2.0, але мерчант міг додавати й переставляти їх **лише на головній** — через обʼєкт `content_for_index`. Усі інші сторінки були Liquid-шаблонами з жорсткою розміткою: захотів банер над товаром — клич розробника. JSON-шаблони прибрали це обмеження: будь-який тип сторінки тепер — список секцій, який можна редагувати мишкою. Звідси й гасло «sections everywhere».',
      },
      {
        type: 'example',
        title: 'Значення з JSON перекриває default зі схеми',
        data: { section: { id: 'template--1__recommendations', settings: { heading: 'Разом із цим беруть', products_to_show: 4 }, blocks: [] } },
        template: `<h2>{{ section.settings.heading }}</h2>
<p>Показати товарів: {{ section.settings.products_to_show }}</p>

{% schema %}
{
  "name": "Рекомендації",
  "settings": [
    { "type": "text", "id": "heading", "label": "Заголовок", "default": "Вам може сподобатись" },
    { "type": "range", "id": "products_to_show", "label": "Скільки товарів", "min": 2, "max": 8, "step": 1, "default": 6 }
  ]
}
{% endschema %}`,
        note: 'Тут обʼєкт `section` підкладено даними — так, ніби його значення прийшли з `product.json`. Схема каже «за замовчуванням 6», шаблон каже «4» — виграє шаблон. Без підкладених даних пісочниця зібрала б `section` із самих `default` — і ти побачив би «Вам може сподобатись» і 6.',
      },
      { type: 'h', text: 'Ліміти' },
      {
        type: 'table',
        head: ['Що', 'Скільки'],
        rows: [
          ['Секцій в одному JSON-шаблоні', 'до 25'],
          ['Блоків в одній секції', 'до 50 (у схемі можна звузити через `max_blocks`)'],
          ['JSON-шаблонів у темі, усіх типів разом', 'до 1000'],
        ],
      },
      {
        type: 'note',
        tone: 'info',
        text: 'Числа — із shopify.dev станом на вересень 2026. Shopify їх уже піднімав, тож перед співбесідою глянь на сторінку JSON templates: назвати актуальну цифру приємніше, ніж торішню.',
      },
      { type: 'h', text: 'Як мерчант збирає сторінку' },
      {
        type: 'list',
        ordered: true,
        items: [
          'Відкриває редактор теми й обирає шаблон зі списку (наприклад, «Товар → alternate»).',
          'Тисне «Додати секцію». У списку — секції, що мають `presets` у схемі й дозволені для цього шаблона через `enabled_on` / `disabled_on`.',
          'Shopify створює в JSON новий запис: генерує ID, ставить `type`, копіює `settings` і `blocks` із вибраного пресета.',
          'Мерчант змінює налаштування, додає й тягає блоки, ховає секції — кожна дія змінює `settings`, `blocks`, `block_order`, `order` або `disabled`.',
          '«Зберегти» записує JSON-файл назад у тему.',
        ],
      },
      {
        type: 'note',
        tone: 'warn',
        title: 'Файл належить не лише тобі',
        text: 'JSON-шаблони (а ще групи секцій і `settings_data.json`) редактор теми **перезаписує**. Якщо ти задеплоїш свою локальну копію `templates/index.json` поверх живої теми, то зітреш усе, що мерчант зібрав на головній. Тому перед роботою роблять `shopify theme pull`, а в деплої з CI ці файли зазвичай виключають або зливають окремо.',
      },
      {
        type: 'note',
        tone: 'warn',
        title: 'У JSON немає Liquid',
        text: 'Жодних `{% if %}` чи `{{ product.title }}` у шаблоні. Уся логіка — в секціях. Якщо тобі кортить «трохи умови в шаблоні» — це сигнал зробити налаштування секції або окремий альтернативний шаблон.',
      },
      {
        type: 'code',
        lang: 'json',
        title: 'wrapper: спільна обгортка для секцій шаблона',
        code: `{
  "wrapper": "div#product-page.page-width[data-template=product]",
  "sections": { "main": { "type": "main-product" } },
  "order": ["main"]
}`,
      },
      {
        type: 'note',
        tone: 'shopify',
        text: 'У Dawn «головні» секції сторінок мають префікс `main-`: `main-product`, `main-collection-product-grid`, `main-cart-items`. У них зазвичай **немає `presets`** — тому їх не запропонують у списку «Додати секцію» на сторінці, де вони не мають сенсу. Секція з пресетом (банер, слайдшоу, рекомендації) доступна всюди, де її не обмежили.',
      },
      {
        type: 'note',
        tone: 'interview',
        title: 'На співбесіді: «Чим JSON-шаблон відрізняється від Liquid-шаблона?»',
        text: 'Liquid-шаблон містить розмітку й логіку, і змінити склад сторінки може лише розробник. JSON-шаблон містить тільки дані: які секції, в якому порядку, з якими налаштуваннями. Розмітка переїжджає в секції, а мерчант отримує змогу додавати, переставляти й ховати їх на будь-якій сторінці. Ціна — у шаблоні не можна писати Liquid, а файл перезаписується редактором.',
      },
      {
        type: 'note',
        tone: 'interview',
        title: 'На співбесіді: «Як перевести стару тему на OS 2.0?»',
        text: 'Коротко, по кроках: розмітку кожного `templates/*.liquid` переношу в секцію `main-<тип>`; замість шаблона створюю JSON, який цю секцію підключає; статичні `{% section %}` усередині шаблонів стають записами в JSON; жорстко зашиті параметри — налаштуваннями схеми; хедер і футер — групами секцій; вставки коду застосунків замінюю на app blocks (додаю `@app` у схеми). Змінні, які раніше «протікали» з шаблона в `include`, доведеться передавати явно — секції ізольовані.',
      },
    ],
  },

  /* ─────────────────────── 4. sections-and-schema ─────────────────────── */
  {
    slug: 'sections-and-schema',
    section: 'shopify',
    title: 'Секції та {% schema %}',
    summary:
      'Секція — самодостатній модуль сторінки: розмітка плюс `{% schema %}`, який описує її налаштування, блоки й пресети для редактора теми. Значення приходять в обʼєкті `section`.',
    officialUrl: 'https://shopify.dev/docs/storefronts/themes/architecture/sections/section-schema',
    related: ['shopify/blocks', 'shopify/json-templates', 'shopify/section-groups', 'shopify/theme-settings', 'shopify/liquid-and-js'],
    blocks: [
      {
        type: 'p',
        text: 'Секція — це файл у `sections/`, який складається з двох частин. Перша — звичайний Liquid із розміткою. Друга — тег `schema` з JSON, де ти **описуєш редактору теми**, що в цій секції можна налаштувати. Редактор малює за схемою форму, мерчант її заповнює, а ти читаєш результат із `section.settings`. Уся робота з темами 2.0 крутиться навколо цієї пари.',
      },
      {
        type: 'example',
        title: 'Секція цілком: розмітка + схема',
        view: 'html',
        template: `<div class="hero hero--{{ section.settings.align }}">
  <h2>{{ section.settings.heading }}</h2>
  {% if section.settings.show_button %}
    <a class="button" href="{{ section.settings.button_link }}">
      {{ section.settings.button_label }}
    </a>
  {% endif %}
</div>

{% schema %}
{
  "name": "Банер",
  "tag": "section",
  "class": "hero-section",
  "settings": [
    { "type": "text", "id": "heading", "label": "Заголовок", "default": "Відновлення, яке тримається" },
    {
      "type": "select", "id": "align", "label": "Вирівнювання",
      "options": [
        { "value": "left", "label": "Ліворуч" },
        { "value": "center", "label": "По центру" }
      ],
      "default": "center"
    },
    { "type": "checkbox", "id": "show_button", "label": "Показати кнопку", "default": true },
    { "type": "text", "id": "button_label", "label": "Текст кнопки", "default": "До каталогу" },
    { "type": "url", "id": "button_link", "label": "Посилання", "default": "/collections/all" }
  ],
  "presets": [{ "name": "Банер" }]
}
{% endschema %}`,
        note: 'Пісочниця читає схему й збирає `section.settings` із полів `default` — так само, як редактор теми в момент, коли мерчант щойно додав секцію. Зміни `"default": true` на `false` у чекбокса — кнопка зникне. Сам тег `schema` у HTML нічого не друкує.',
      },
      { type: 'h', text: 'Атрибути схеми' },
      {
        type: 'table',
        head: ['Атрибут', 'Що робить'],
        rows: [
          ['`name`', 'Назва секції в редакторі теми. Єдине, без чого схема не має сенсу.'],
          ['`tag`', 'HTML-елемент обгортки замість `div`: `article`, `aside`, `div`, `footer`, `header` або `section`.'],
          ['`class`', 'Додатковий клас на обгортці (поруч зі службовим `shopify-section`).'],
          ['`limit`', 'Скільки разів секцію можна додати в один шаблон чи групу: `1` або `2`.'],
          ['`settings`', 'Масив налаштувань секції. `id` унікальні в межах секції.'],
          ['`blocks`', 'Типи блоків, які приймає секція. Див. [блоки](/docs/shopify/blocks).'],
          ['`max_blocks`', 'Стеля кількості блоків. Без нього діє загальний ліміт — 50.'],
          ['`presets`', 'Готові конфігурації для списку «Додати секцію». **Немає пресета — секцію не додати через редактор.**'],
          ['`default`', 'Стартова конфігурація для секції, підключеної **статично** (тегом `section`).'],
          ['`enabled_on` / `disabled_on`', 'Де секцію дозволено або заборонено: за типами шаблонів (`templates`) і групами секцій (`groups`). Використовується щось одне.'],
          ['`locales`', 'Переклади, що їдуть разом із секцією. Див. [локалі](/docs/shopify/locales).'],
        ],
      },
      {
        type: 'note',
        tone: 'warn',
        title: 'schema — це JSON, а не Liquid',
        text: 'Усередині `schema` Liquid **не виконується**: ніяких `{{ }}`, `{% if %}` чи змінних — лише чистий JSON. Тег один на файл і не може стояти всередині іншого тега (наприклад, в `if`). Зайва кома, одинарні лапки чи коментар — і секція не збережеться.',
      },
      {
        type: 'example',
        title: 'Найчастіша помилка: кома після останнього елемента',
        expectError: true,
        template: `<h2>{{ section.settings.heading }}</h2>

{% schema %}
{
  "name": "Банер",
  "settings": [
    { "type": "text", "id": "heading", "label": "Заголовок", "default": "Привіт" },
  ]
}
{% endschema %}`,
        note: 'JavaScript таку кому пробачає, JSON — ні. Shopify у цьому місці не дасть зберегти файл; пісочниця показує помилку парсингу.',
      },
      { type: 'h', text: 'Типи налаштувань' },
      {
        type: 'p',
        text: 'Кожне налаштування — обʼєкт із `type`, `id`, `label` і, зазвичай, `default`; ще бувають `info` (підказка під полем) і `placeholder`. Типи діляться на **базові** (повертають примітив) і **спеціалізовані** (повертають обʼєкт Shopify або мають власний пікер).',
      },
      {
        type: 'table',
        head: ['Базовий тип', 'Що повертає', 'Особливості'],
        rows: [
          ['`text`', 'рядок', 'однорядкове поле'],
          ['`textarea`', 'рядок', 'багаторядкове поле'],
          ['`number`', 'число або `nil`', 'порожнє поле — `nil`, а не `0`'],
          ['`checkbox`', '`true` / `false`', 'без `default` — `false`'],
          ['`range`', 'число', 'повзунок; обовʼязкові `min`, `max`, `step` і `default`; є `unit` для підпису'],
          ['`select`', 'рядок (`value` опції)', '`options` — масив `{ value, label }`; опції можна групувати через `group`'],
          ['`radio`', 'рядок', 'те саме, що `select`, але радіокнопками'],
        ],
      },
      {
        type: 'table',
        head: ['Спеціалізований тип', 'Що повертає в Liquid'],
        rows: [
          ['`richtext`', 'рядок HTML (абзаци, списки, посилання). `default` мусить бути загорнутий у `<p>` або `<ul>`'],
          ['`inline_richtext`', 'рядок HTML без блочних тегів: жирний, курсив, посилання — для заголовків'],
          ['`html`', 'рядок довільного HTML'],
          ['`liquid`', 'рядок: мерчант (чи застосунок) вставляє шматок Liquid, і він виконується'],
          ['`color`', 'обʼєкт `color` (або порожньо). Друкується як hex, має `.red`, `.alpha` тощо'],
          ['`color_background`', 'рядок для CSS `background` — підтримує градієнти'],
          ['`color_scheme` / `color_scheme_group`', 'колірна схема теми; сам набір схем оголошується в `settings_schema.json`'],
          ['`font_picker`', 'обʼєкт `font`; `default` обовʼязковий'],
          ['`image_picker`', 'обʼєкт `image` або `nil`; `default` не підтримує'],
          ['`video`', 'обʼєкт `video` (файл із розділу Files) або `nil`'],
          ['`video_url`', 'адреса YouTube/Vimeo; має `.id` і `.type`'],
          ['`url`', 'рядок-адреса або `nil`; мерчант обирає ресурс чи вставляє посилання'],
          ['`link_list`', 'обʼєкт `linklist` (меню)'],
          ['`product`, `collection`, `blog`, `article`, `page`', 'відповідний обʼєкт або порожньо; `default` не підтримують'],
          ['`product_list`, `collection_list`, `article_list`', 'масив обʼєктів; можна обмежити через `limit`'],
          ['`metaobject`, `metaobject_list`', 'запис(и) метаобʼєкта заданого типу'],
          ['`text_alignment`', 'рядок: `left`, `center` або `right`'],
        ],
      },
      {
        type: 'p',
        text: 'Окремо стоять **sidebar-налаштування** — `header` і `paragraph`. Вони нічого не повертають, а лише впорядковують форму в редакторі: заголовок групи й пояснювальний текст. `id` їм не потрібен.',
      },
      {
        type: 'example',
        title: 'Числові й вибіркові налаштування → CSS секції',
        template: `{% style %}
  #shopify-section-{{ section.id }} .grid {
    --columns: {{ section.settings.columns }};
    gap: {{ section.settings.gap }}px;
    {% if section.settings.full_width %}max-width: none;{% endif %}
  }
{% endstyle %}

{% schema %}
{
  "name": "Сітка товарів",
  "settings": [
    { "type": "header", "content": "Розкладка" },
    { "type": "range", "id": "columns", "label": "Колонок", "min": 2, "max": 5, "step": 1, "default": 4 },
    { "type": "range", "id": "gap", "label": "Відступ", "min": 0, "max": 40, "step": 4, "unit": "px", "default": 16 },
    { "type": "checkbox", "id": "full_width", "label": "На всю ширину", "default": false }
  ]
}
{% endschema %}`,
        note: 'Стилі привʼязані до `#shopify-section-{{ section.id }}` — інакше дві однакові секції на одній сторінці перезаписали б налаштування одна одної. `section.id` у пісочниці фіксований; у Shopify він генерується для кожної доданої секції.',
      },
      {
        type: 'example',
        title: 'Ресурсні налаштування завжди можуть бути порожні',
        view: 'html',
        template: `{% assign featured = section.settings.featured_product %}

{% if featured != blank %}
  <h3>{{ featured.title }}</h3>
  <p>{{ featured.price | money }}</p>
{% else %}
  {{ 'product-1' | placeholder_svg_tag: 'placeholder' }}
  <p>Обери товар у налаштуваннях секції</p>
{% endif %}

{% schema %}
{
  "name": "Товар тижня",
  "settings": [
    { "type": "product", "id": "featured_product", "label": "Товар" }
  ],
  "presets": [{ "name": "Товар тижня" }]
}
{% endschema %}`,
        note: '`product`, `collection`, `image_picker` та інші пікери **не мають `default`**: щойно додана секція завжди порожня. Те саме станеться, коли мерчант видалить вибраний товар. Тому гілка `else` із заглушкою (`placeholder_svg_tag`) — не ввічливість, а вимога: у Theme Store без неї тему не приймуть.',
      },
      { type: 'h', text: 'Обʼєкт section' },
      {
        type: 'table',
        head: ['Властивість', 'Що там'],
        rows: [
          ['`section.id`', 'Для секції з JSON-шаблона чи групи — згенерований ID; для статичної — імʼя файла без `.liquid`.'],
          ['`section.settings`', 'Значення налаштувань: `section.settings.<id>`.'],
          ['`section.blocks`', 'Масив блоків у порядку, який виставив мерчант.'],
          ['`section.index` / `section.index0`', 'Порядковий номер секції у своєму розташуванні (з 1 або з 0).'],
          ['`section.location`', 'Де секцію відрендерено: `template`, тип групи (`header`, `footer`, `custom.<імʼя>`) або `static`.'],
        ],
      },
      {
        type: 'example',
        title: 'section.index: ліниве завантаження нижче першого екрана',
        template: `id: {{ section.id }}
позиція: {{ section.index }} ({{ section.location }})

{% if section.index > 2 %}
  <img loading="lazy" …>
{% else %}
  <img loading="eager" fetchpriority="high" …>
{% endif %}

{% schema %}
{ "name": "Банер із фото" }
{% endschema %}`,
        note: 'Секція не знає наперед, куди її поставить мерчант. `section.index` дає змогу першим секціям вантажити зображення одразу, а решті — ліниво. У пісочниці індекс завжди `1`.',
      },
      { type: 'h', text: 'Статичні й динамічні секції' },
      {
        type: 'table',
        head: ['', 'Динамічна', 'Статична'],
        rows: [
          ['Як потрапляє на сторінку', 'запис у JSON-шаблоні або групі секцій', 'тег `section` у лейауті чи Liquid-шаблоні'],
          ['Хто вирішує, де вона стоїть', 'мерчант у редакторі', 'розробник у коді'],
          ['Додати / видалити / переставити', 'можна', 'ні, лише змінити налаштування'],
          ['Стартові значення', '`presets`', '`default`'],
          ['Де зберігаються налаштування', 'у JSON шаблона чи групи — свої в кожному місці', 'у `settings_data.json` — **одні на всю тему**'],
          ['`section.id`', 'згенерований', 'імʼя файла'],
        ],
      },
      {
        type: 'example',
        title: 'Статична секція через тег section',
        view: 'html',
        template: `{% section 'announcement' %}
<main>…вміст сторінки…</main>`,
        snippets: {
          'sections/announcement': `<p class="announcement">{{ section.settings.text }}</p>

{% schema %}
{
  "name": "Оголошення",
  "settings": [
    { "type": "text", "id": "text", "label": "Текст", "default": "Безкоштовна доставка від 1500 ₴" }
  ]
}
{% endschema %}`,
        },
        note: 'У пісочниці файл секції лежить у сніпетах під імʼям `sections/announcement`. `id` обгортки — `shopify-section-announcement`: у статичної секції він дорівнює імені файла.',
      },
      {
        type: 'note',
        tone: 'warn',
        title: 'Статична секція має один стан на всю тему',
        text: 'Якщо підключити ту саму секцію тегом `section` у двох шаблонах, мерчант змінить текст в одному місці — і він зміниться всюди. Налаштування статичної секції не привʼязані до сторінки. Потрібні різні значення в різних місцях — роби секцію динамічною (JSON-шаблон або група).',
      },
      {
        type: 'code',
        lang: 'json',
        title: 'enabled_on / disabled_on: де секція доречна',
        code: `{
  "name": "Рекомендації до товару",
  "enabled_on": {
    "templates": ["product"]
  },
  "presets": [{ "name": "Рекомендації до товару" }]
}

{
  "name": "Смуга оголошень",
  "enabled_on": {
    "groups": ["header", "custom.overlay"]
  },
  "presets": [{ "name": "Смуга оголошень" }]
}

{
  "name": "Банер",
  "disabled_on": {
    "templates": ["password"],
    "groups": ["footer"]
  },
  "presets": [{ "name": "Банер" }]
}`,
      },
      {
        type: 'p',
        text: '`"templates": ["*"]` і `"groups": ["*"]` означають «усі». Старий атрибут `templates` у корені схеми ці два замінили — у легасі-темах він ще трапляється.',
      },
      {
        type: 'note',
        tone: 'shopify',
        title: 'Ізоляція секції',
        text: 'Секція бачить глобальні обʼєкти, свій `section` і (в циклі) `block` — і **жодних змінних ззовні**. `assign` у лейауті чи в сусідній секції до неї не дійде, параметрів тег `section` не приймає. Завдяки цьому Shopify може перерендерити одну секцію окремо: у редакторі, коли мерчант рухає повзунок, і на вітрині — через Section Rendering API (`?sections=…`), на якому тримаються кошики-дровери й фільтри колекцій. Докладніше — в [Liquid і JavaScript](/docs/shopify/liquid-and-js).',
      },
      {
        type: 'note',
        tone: 'interview',
        title: 'На співбесіді: «Що таке schema і що в ній можна описати?»',
        text: '«Це JSON у файлі секції, який описує її для редактора теми: назву, налаштування, блоки, пресети, обмеження на шаблони. Liquid у ньому не виконується. За схемою редактор будує форму, значення зберігає в JSON-шаблоні, а я читаю їх із `section.settings` і `block.settings`». Сильний штрих — назвати різницю `presets` / `default` і згадати, що без пресета секцію неможливо додати з редактора.',
      },
      {
        type: 'note',
        tone: 'interview',
        title: 'На співбесіді: «Статична чи динамічна секція — в чому різниця?»',
        text: 'Статична підключена тегом `section` у коді: її не можна переставити чи видалити, стартові значення беруться з `default`, а налаштування одні на всю тему. Динамічна записана в JSON-шаблоні або групі: мерчант керує нею сам, стартові значення — з `presets`, налаштування свої в кожному шаблоні. У нових темах статичних секцій майже не лишилось — навіть хедер живе в групі секцій.',
      },
      {
        type: 'note',
        tone: 'interview',
        title: 'На співбесіді: «Чому секція не бачить мою змінну?»',
        text: 'Бо секції ізольовані: змінні, створені поза секцією, всередині недоступні, і передати параметр у секцію не можна. Варіанти: взяти дані з глобального обʼєкта (`product`, `cart`, `settings`), зробити налаштування секції, винести спільне в метаполе або обчислити значення прямо в секції. А якщо потрібно саме «передати параметр» — це робота для сніпета, не для секції.',
      },
      {
        type: 'note',
        tone: 'tip',
        text: 'Підписи в схемі (`name`, `label`, `info`, назви опцій) у темах для продажу не пишуть текстом, а посилаються на переклади редактора: `"label": "t:sections.hero.settings.heading.label"`. Ключі лежать у `locales/*.schema.json`.',
      },
    ],
  },

  /* ───────────────────────────── 5. blocks ───────────────────────────── */
  {
    slug: 'blocks',
    section: 'shopify',
    title: 'Блоки: section.blocks, @app і theme blocks',
    summary:
      'Блок — повторюваний елемент усередині секції, який мерчант додає, видаляє й переставляє сам. Бувають блоки секції (описані в її схемі), блоки застосунків (`@app`) і theme blocks — окремі файли в `blocks/`.',
    officialUrl: 'https://shopify.dev/docs/storefronts/themes/architecture/blocks',
    related: ['shopify/sections-and-schema', 'shopify/json-templates', 'shopify/snippets-render', 'tags/control-flow', 'tags/iteration'],
    blocks: [
      {
        type: 'p',
        text: 'Налаштування секції — це фіксована форма: скільки полів описав, стільки й буде. Блоки знімають це обмеження. Слайди, пункти FAQ, переваги, колонки футера, елементи сторінки товару (назва, ціна, кнопка, опис) — усе, чого може бути «скільки завгодно і в довільному порядку», роблять блоками.',
      },
      {
        type: 'example',
        title: 'Секція з двома типами блоків',
        view: 'html',
        template: `<div class="faq">
  {% for block in section.blocks %}
    {% case block.type %}
      {% when 'heading' %}
        <h2 {{ block.shopify_attributes }}>{{ block.settings.title }}</h2>
      {% when 'question' %}
        <details {{ block.shopify_attributes }}>
          <summary>{{ block.settings.question }}</summary>
          {{ block.settings.answer }}
        </details>
    {% endcase %}
  {% endfor %}
</div>

{% schema %}
{
  "name": "Питання й відповіді",
  "max_blocks": 12,
  "blocks": [
    {
      "type": "heading", "name": "Заголовок", "limit": 1,
      "settings": [{ "type": "text", "id": "title", "label": "Текст", "default": "Часті питання" }]
    },
    {
      "type": "question", "name": "Питання",
      "settings": [
        { "type": "text", "id": "question", "label": "Питання", "default": "Нове питання" },
        { "type": "richtext", "id": "answer", "label": "Відповідь", "default": "<p>Відповідь</p>" }
      ]
    }
  ],
  "presets": [
    {
      "name": "Питання й відповіді",
      "blocks": [
        { "type": "heading" },
        { "type": "question", "settings": { "question": "Скільки тримається кератин?", "answer": "<p>Від трьох до шести місяців.</p>" } },
        { "type": "question" }
      ]
    }
  ]
}
{% endschema %}`,
        note: 'Блоки прийшли з першого пресета: у другого питання налаштувань у пресеті немає, тож узято `default` зі схеми блока. Порядок у `section.blocks` — той, що виставив мерчант (тут — порядок у пресеті).',
      },
      { type: 'h', text: 'Обʼєкт block' },
      {
        type: 'table',
        head: ['Властивість', 'Що там'],
        rows: [
          ['`block.type`', 'Тип зі схеми — довільний рядок, який ти сам вигадав. За ним розгалужують розмітку.'],
          ['`block.settings`', 'Значення налаштувань блока: `block.settings.<id>`.'],
          ['`block.id`', 'Згенерований ID. Годиться для `id`/`for` в HTML, але не для логіки: він може змінитися.'],
          ['`block.shopify_attributes`', 'Рядок `data-`атрибутів для редактора теми. Поза редактором — порожній.'],
        ],
      },
      {
        type: 'note',
        tone: 'shopify',
        title: 'Навіщо block.shopify_attributes',
        text: 'Редактор теми показує сторінку в iframe і мусить знати, **який шматок HTML відповідає якому блоку** в боковій панелі. `shopify_attributes` дає цю привʼязку: клік по елементу у превʼю відкриває налаштування його блока, а вибір блока в панелі прокручує до нього превʼю й шле подію `shopify:block:select` (на ній слайдер, наприклад, перемикається на потрібний слайд). Атрибут ставлять на **кореневий елемент блока**. На вітрині він нічого не виводить — пісочниця ж друкує його завжди, щоб ти бачив формат.',
      },
      {
        type: 'note',
        tone: 'warn',
        title: 'Забув shopify_attributes — зламав редактор',
        text: 'Сторінка виглядатиме нормально, тож помилку легко пропустити. Але мерчант клацає по слайду — і нічого не відбувається, блок у превʼю не підсвічується. Перевіряй кожен `when` у `case`: атрибут потрібен у кожній гілці.',
      },
      {
        type: 'example',
        title: 'Блоки — звичайний масив',
        template: `Усього блоків: {{ section.blocks.size }}
Типи: {{ section.blocks | map: 'type' | join: ', ' }}

{% assign slides = section.blocks | where: 'type', 'slide' %}
Слайдів: {{ slides.size }}

{% if slides.size > 1 %}
  Показуємо стрілки й автопрокрутку.
{% endif %}

{% schema %}
{
  "name": "Слайдшоу",
  "blocks": [
    { "type": "slide", "name": "Слайд" },
    { "type": "caption", "name": "Підпис" }
  ],
  "presets": [
    { "name": "Слайдшоу", "blocks": [{ "type": "slide" }, { "type": "caption" }, { "type": "slide" }] }
  ]
}
{% endschema %}`,
        note: '`size`, `first`, `where`, `map` працюють із `section.blocks` так само, як із будь-яким масивом. Типовий прийом — порахувати блоки потрібного типу, перш ніж малювати навігацію слайдера.',
      },
      { type: 'h', text: 'Обмеження: max_blocks і limit' },
      {
        type: 'p',
        text: '`max_blocks` у корені схеми обмежує загальну кількість блоків у секції (стеля платформи — 50). `limit` на окремому типі блока обмежує саме його: заголовок — один, кнопка купівлі — одна. Коли ліміт вичерпано, редактор просто не запропонує цей тип.',
      },
      { type: 'h', text: 'Блоки застосунків: @app' },
      {
        type: 'code',
        lang: 'liquid',
        title: 'Секція, що приймає app blocks',
        code: `{% for block in section.blocks %}
  {% case block.type %}
    {% when '@app' %}
      {% render block %}
    {% when 'title' %}
      <h1 {{ block.shopify_attributes }}>{{ product.title }}</h1>
  {% endcase %}
{% endfor %}

{% schema %}
{
  "name": "Товар",
  "blocks": [
    { "type": "@app" },
    { "type": "title", "name": "Назва", "limit": 1 }
  ]
}
{% endschema %}`,
      },
      {
        type: 'p',
        text: '`@app` — зарезервований тип без `name` і `settings`: він каже редактору «сюди можна вставляти блоки встановлених застосунків» (відгуки, підписка, розмірна сітка). Розмітку такого блока віддає сам застосунок, тому в гілці `when` стоїть особлива форма `render` — `{% render block %}`, з обʼєктом замість імені сніпета. Це головна ідея OS 2.0 для застосунків: **застосунок більше не править код теми**, а після видалення не лишає сміття.',
      },
      { type: 'h', text: 'Theme blocks: блоки як окремі файли' },
      {
        type: 'p',
        text: 'Класичний блок живе в схемі однієї секції: потрібна «кнопка» у пʼяти секціях — опиши її пʼять разів і пʼять разів напиши розмітку в `case`. Theme blocks це виправляють. Блок стає **файлом у теці `blocks/`** — зі своєю розміткою і своєю схемою, — а секція лише каже, що приймає такі блоки, і показує, де їх вивести.',
      },
      {
        type: 'code',
        lang: 'liquid',
        title: 'blocks/text.liquid',
        code: `<div class="text text--{{ block.settings.size }}" {{ block.shopify_attributes }}>
  {{ block.settings.text }}
</div>

{% schema %}
{
  "name": "Текст",
  "settings": [
    { "type": "richtext", "id": "text", "label": "Текст", "default": "<p>Розкажи про свій бренд</p>" },
    { "type": "select", "id": "size", "label": "Розмір",
      "options": [{ "value": "m", "label": "Звичайний" }, { "value": "l", "label": "Великий" }],
      "default": "m" }
  ],
  "presets": [{ "name": "Текст" }]
}
{% endschema %}`,
      },
      {
        type: 'example',
        title: 'Секція з theme blocks: content_for',
        view: 'html',
        template: `<div class="rich-section">
  {% content_for 'blocks' %}
</div>

{% schema %}
{
  "name": "Довільний вміст",
  "blocks": [{ "type": "@theme" }, { "type": "@app" }],
  "presets": [
    {
      "name": "Довільний вміст",
      "blocks": [
        { "type": "heading", "settings": { "title": "Догляд після процедури" } },
        { "type": "text", "settings": { "text": "<p>Перші 72 години вирішують усе.</p>", "size": "l" } }
      ]
    }
  ]
}
{% endschema %}`,
        snippets: {
          'blocks/heading': `<h2 {{ block.shopify_attributes }}>{{ block.settings.title }}</h2>`,
          'blocks/text': `<div class="text text--{{ block.settings.size }}" {{ block.shopify_attributes }}>{{ block.settings.text }}</div>`,
        },
        note: 'У секції більше немає ні `for`, ні `case`: один тег `content_for` виводить усі блоки в порядку мерчанта, а розмітка кожного лежить у його файлі (у пісочниці — сніпети `blocks/heading` і `blocks/text`). Пісочниця не читає схеми файлів блоків, тому налаштування тут задано в пресеті секції.',
      },
      {
        type: 'table',
        head: ['', 'Блоки секції', 'Theme blocks'],
        rows: [
          ['Де описані', 'у `schema` секції', 'окремий файл у `blocks/` зі своєю `schema`'],
          ['Де розмітка', 'у секції, зазвичай `for` + `case`', 'у файлі блока'],
          ['Повторне використання', 'лише в цій секції', 'у будь-якій секції, що їх приймає'],
          ['Як секція їх приймає', 'перелік типів із `name` і `settings`', '`{ "type": "@theme" }` або конкретні імена файлів'],
          ['Як виводяться', '`{% for block in section.blocks %}`', '`{% content_for \'blocks\' %}`'],
          ['Вкладеність', 'немає', 'блок може містити блоки — до 8 рівнів'],
        ],
      },
      {
        type: 'note',
        tone: 'warn',
        title: 'Або — або',
        text: 'Секція не може одночасно описувати власні блоки в схемі й приймати theme blocks: обирай одну модель на секцію. `@app` сумісний з обома. І ще одне: theme block не бачить змінних секції — лише обʼєкти `block` та `section` і глобальні.',
      },
      {
        type: 'list',
        items: [
          '**Прицільний перелік.** Замість `@theme` можна назвати конкретні файли: `{ "type": "text" }`, `{ "type": "button" }` — тоді в секції будуть доступні лише вони.',
          '**Приватні блоки.** Файл з іменем на підкреслення (`blocks/_slide.liquid`) не потрапляє у вибірку `@theme`. Він доступний тільки там, де його назвали явно: `{ "type": "_slide" }`. Так роблять блоки, які мають сенс лише всередині «своєї» секції.',
          '**Статичні блоки.** `{% content_for \'block\', type: \'price\', id: \'main-price\' %}` виводить один блок у фіксованому місці: мерчант може його налаштувати, але не може пересунути чи видалити. Таким блокам можна передавати довільні параметри, і до `max_blocks` вони не зараховуються.',
        ],
      },
      {
        type: 'note',
        tone: 'interview',
        title: 'На співбесіді: «Навіщо block.shopify_attributes?»',
        text: 'Питання-фільтр: хто робив секції руками, відповідає одразу. «Це data-атрибути, за якими редактор теми повʼязує елемент у превʼю з блоком у боковій панелі: клік по елементу відкриває його налаштування, вибір блока шле подію `shopify:block:select`. Ставиться на кореневий елемент кожного блока. На вітрині порожній». Додай приклад зі слайдером, який на цю подію перемикає слайд, — і питання закрите.',
      },
      {
        type: 'note',
        tone: 'interview',
        title: 'На співбесіді: «Блоки секції чи theme blocks?»',
        text: 'Блоки секції прості й досі всюди в Dawn, але привʼязані до однієї секції й не вкладаються. Theme blocks — окремі файли: перевикористовуються між секціями, вкладаються один в одного (до 8 рівнів), виводяться через `content_for`. Змішувати в одній секції не можна. Для нової теми з конструктором вмісту я б брав theme blocks; для точкової правки в існуючій темі на класичних блоках — лишався б у її моделі.',
      },
      {
        type: 'note',
        tone: 'tip',
        text: 'Порожня секція — теж стан. Коли `section.blocks.size == 0`, покажи заглушку або не виводь обгортку взагалі: мерчант може видалити всі блоки, і порожній `<div class="faq">` з відступами виглядатиме як баг.',
      },
    ],
  },

  /* ───────────────────────── 6. section-groups ───────────────────────── */
  {
    slug: 'section-groups',
    section: 'shopify',
    title: 'Групи секцій: хедер і футер, які збирає мерчант',
    summary:
      'Група секцій — JSON-файл у `sections/`, який працює як JSON-шаблон, але для області лейаута: хедера, футера, бічної панелі. Виводиться тегом `sections`.',
    officialUrl: 'https://shopify.dev/docs/storefronts/themes/architecture/section-groups',
    related: ['shopify/layouts-and-templates', 'shopify/json-templates', 'shopify/sections-and-schema'],
    blocks: [
      {
        type: 'p',
        text: 'JSON-шаблони зробили гнучким **вміст** сторінки, але хедер і футер живуть у лейауті — а лейаут це Liquid. Довгий час там стояли статичні `{% section \'header\' %}` і `{% section \'footer\' %}`: налаштувати можна, а додати поруч смугу оголошень чи блок підписки — ні. Групи секцій закрили цю діру: тепер і в лейауті є області, куди мерчант додає секції сам.',
      },
      {
        type: 'code',
        lang: 'liquid',
        title: 'layout/theme.liquid',
        code: `<body>
  {% sections 'header-group' %}

  <main id="MainContent">
    {{ content_for_layout }}
  </main>

  {% sections 'footer-group' %}
</body>`,
      },
      {
        type: 'note',
        tone: 'warn',
        title: 'section і sections — різні теги',
        text: '`{% section \'header\' %}` (одна) статично рендерить файл `sections/header.liquid`. `{% sections \'header-group\' %}` (множина) рендерить **групу** — файл `sections/header-group.json`. Одна літера, а поведінка зовсім інша; на співбесіді цю пару люблять давати «на уважність».',
      },
      {
        type: 'code',
        lang: 'json',
        title: 'sections/header-group.json',
        code: `{
  "type": "header",
  "name": "Хедер",
  "sections": {
    "announcement": {
      "type": "announcement-bar",
      "settings": { "text": "Безкоштовна доставка від 1500 ₴" }
    },
    "header": {
      "type": "header",
      "settings": { "menu": "main-menu", "sticky": true }
    }
  },
  "order": ["announcement", "header"]
}`,
      },
      {
        type: 'table',
        head: ['Атрибут', 'Що означає'],
        rows: [
          ['`type`', 'Тип групи: `header`, `footer`, `aside` або власний `custom.<імʼя>`. З ним звіряються `enabled_on.groups` у схемах секцій.'],
          ['`name`', 'Назва групи в редакторі теми (до 50 символів).'],
          ['`sections`', 'Секції групи: ID → `type`, `settings`, `blocks` — так само, як у JSON-шаблоні.'],
          ['`order`', 'Порядок виводу.'],
        ],
      },
      {
        type: 'p',
        text: 'Ліміти ті самі, що й у шаблонів: **до 25 секцій у групі, до 50 блоків у секції**. Файл лежить у `sections/` поруч зі звичайними секціями, а тег `sections` отримує його імʼя без `.json`.',
      },
      {
        type: 'example',
        title: 'Що виводить тег sections (модель)',
        view: 'html',
        data: {
          group: {
            file: 'header-group',
            sections: {
              announcement: { type: 'announcement-bar' },
              header: { type: 'header' },
            },
            order: ['announcement', 'header'],
          },
        },
        template: `{% for id in group.order %}
  {%- assign s = group.sections[id] %}
  <div id="shopify-section-sections--1__{{ id }}"
       class="shopify-section shopify-section-group-{{ group.file }}">
    тут відрендериться sections/{{ s.type }}.liquid
  </div>
{% endfor %}`,
        note: 'Це модель на даних: справжній тег `sections` пісочниця не рендерить. Корисного тут два спостереження. ID секцій у групі мають вигляд `sections--<число>__<ключ>` (у шаблоні було `template--…`). І кожна обгортка отримує клас `shopify-section-group-<імʼя файла групи>` — за нього зручно чіплятись у CSS, наприклад щоб зробити весь хедер липким.',
      },
      { type: 'h', text: 'Які секції можна додати в групу' },
      {
        type: 'code',
        lang: 'json',
        title: 'Схема секції: дозволити лише в хедері',
        code: `{
  "name": "Смуга оголошень",
  "enabled_on": {
    "groups": ["header"]
  },
  "presets": [{ "name": "Смуга оголошень" }]
}`,
      },
      {
        type: 'p',
        text: 'Правило те саме, що й для шаблонів: секція зʼявиться у списку «Додати секцію» групи, якщо має `presets` і не відсічена через `enabled_on` / `disabled_on`. Без обмежень мерчант зможе поставити у футер слайдшоу з головної — іноді це те, що треба, іноді ні. Секції, що потребують контексту сторінки (`main-product`), у групах не мають сенсу взагалі: група виводиться на **кожній** сторінці, а обʼєкт `product` існує лише на сторінці товару.',
      },
      {
        type: 'example',
        title: 'Секція знає, де вона стоїть: section.location',
        data: {
          section: {
            id: 'sections--1__announcement',
            location: 'header',
            index: 1,
            settings: { text: 'Безкоштовна доставка від 1500 ₴' },
            blocks: [],
          },
        },
        template: `{% if section.location == 'header' %}
  <div class="announcement announcement--compact">{{ section.settings.text }}</div>
{% else %}
  <div class="announcement announcement--wide page-width">
    <h2>{{ section.settings.text }}</h2>
  </div>
{% endif %}`,
        note: '`section.location` повертає `template`, тип групи (`header`, `footer`, `aside`, `custom.<імʼя>`) або `static`. Одна й та сама секція може виглядати компактно в хедері й розлого в тілі сторінки. Тут `section` підкладено даними.',
      },
      { type: 'h', text: 'Група секцій проти JSON-шаблона' },
      {
        type: 'table',
        head: ['', 'JSON-шаблон', 'Група секцій'],
        rows: [
          ['Де лежить', '`templates/*.json`', '`sections/*.json`'],
          ['Що описує', 'вміст одного типу сторінки', 'область лейаута, спільну для всіх сторінок'],
          ['Хто підключає', 'Shopify — за типом сторінки з URL', 'ти — тегом `sections` у лейауті'],
          ['Обовʼязкові поля', '`sections`, `order`', '`type`, `name`, `sections`, `order`'],
          ['`section.id`', '`template--…__ключ`', '`sections--…__ключ`'],
          ['`section.location`', '`template`', 'тип групи'],
        ],
      },
      {
        type: 'note',
        tone: 'info',
        title: 'Контекстні варіанти',
        text: 'Група може мати версію під конкретний ринок або B2B: файл на кшталт `header-group.context.<контекст>.json` із полем `context` усередині (`{ "market": "<handle>" }` або `{ "b2b": true }`). Shopify сам підставить її відповідним відвідувачам. Створює такі файли зазвичай редактор теми, а не розробник, — але побачивши їх у репозиторії, не дивуйся й не видаляй.',
      },
      {
        type: 'note',
        tone: 'warn',
        title: 'Не змішуй зі статичними секціями',
        text: 'Shopify радить не ставити в одній області лейаута і групу, і статичні `{% section %}`: у редакторі мерчант бачитиме секції, які не може пересунути, упереміш із тими, які може, — і порядок у панелі перестане відповідати логіці сторінки. І тримай групи для хедера, футера та подібних «рамкових» зон: вміст сторінки — справа шаблона.',
      },
      {
        type: 'note',
        tone: 'shopify',
        text: 'У Dawn дві групи: `header-group.json` (смуга оголошень + хедер) і `footer-group.json`. Секція `header` у схемі обмежена хедерною групою, тому у футер її не вставиш. Липкий хедер реалізовано CSS-ом саме по класу `shopify-section-group-header-group`.',
      },
      {
        type: 'note',
        tone: 'interview',
        title: 'На співбесіді: «Мерчант хоче сам додавати банери над хедером. Як зробити?»',
        text: '«Через групу секцій. Створюю `sections/header-group.json` з типом `header`, переношу туди секцію хедера, у лейауті замінюю статичний `{% section \'header\' %}` на `{% sections \'header-group\' %}`. Секціям, яким місце в хедері, додаю `enabled_on.groups` і пресет». Якщо тема стара — це ще й гарна нагода сказати, що статична секція мала один стан на всю тему, а тепер налаштування живуть у JSON групи.',
      },
      {
        type: 'note',
        tone: 'interview',
        title: 'На співбесіді: «Чим група відрізняється від JSON-шаблона?»',
        text: 'Формат майже однаковий — `sections` плюс `order`, ті самі ліміти. Різниця в ролі: шаблон Shopify обирає сам за типом сторінки, і він описує її вміст; групу я підключаю тегом `sections` у лейауті, і вона виводиться на всіх сторінках. У групи є `type`, за яким секції дозволяють або забороняють себе через `enabled_on.groups`, а секція всередині дізнається про своє місце з `section.location`.',
      },
    ],
  },

  /* ───────────────────────── 7. snippets-render ───────────────────────── */
  {
    slug: 'snippets-render',
    section: 'shopify',
    title: 'Сніпети і {% render %}',
    summary:
      'Сніпет — файл у `snippets/` без схеми й без налаштувань. Тег `render` підключає його в **ізольованій області видимості**: усередину доходять лише глобальні обʼєкти й те, що передали параметрами.',
    officialUrl: 'https://shopify.dev/docs/storefronts/themes/architecture/snippets',
    related: ['shopify/architecture', 'shopify/sections-and-schema', 'shopify/blocks', 'shopify/performance', 'tags/template'],
    blocks: [
      {
        type: 'p',
        text: 'Секція — це модуль сторінки з власною формою в редакторі теми. Сніпет — просто **шматок розмітки, який викликають із параметрами**: картка товару, бейдж знижки, іконка, блок ціни, рейтинг. Ні схеми, ні налаштувань, ні обгортки — лише те, що ти написав, і те, що йому передали. Функція, а не компонент із станом.',
      },
      {
        type: 'code',
        lang: 'text',
        title: 'Файл і виклик',
        code: `snippets/card-product.liquid      → {% render 'card-product' %}
snippets/icon-cart.liquid        → {% render 'icon-cart' %}
snippets/price.liquid            → {% render 'price' %}

Розширення .liquid у виклику НЕ пишуть.
Підтек у snippets/ не буває: snippets/cards/product.liquid не завантажиться.`,
      },
      {
        type: 'example',
        title: 'Сніпет із параметрами',
        view: 'html',
        data: { items: [{ label: 'Хіт', tone: 'accent' }, { label: '−20%', tone: 'sale' }, { label: 'Немає', tone: 'muted' }] },
        template: `{% for item in items %}
  {% render 'badge', label: item.label, tone: item.tone %}
{% endfor %}`,
        snippets: {
          badge: `<span class="badge badge--{{ tone | default: 'accent' }}">{{ label }}</span>`,
        },
        note: 'Усередині сніпета `label` і `tone` — звичайні змінні верхнього рівня, ніякого `props.` чи `block.`. Параметрів може бути скільки завгодно, розділяються комами; кома після імені сніпета обовʼязкова.',
      },
      { type: 'h', text: 'Ізольована область видимості — головне про render' },
      {
        type: 'p',
        text: 'Сніпет **не бачить змінних того, хто його викликав**. Ні `assign`, ні `capture`, ні змінну циклу — нічого, крім переданих параметрів і глобальних обʼєктів. І навпаки: те, що сніпет створив усередині, назовні не витікає. Це не обмеження рушія, а свідомий контракт: сніпет можна прочитати й зрозуміти, не читаючи місця виклику.',
      },
      {
        type: 'example',
        title: 'Змінна ззовні в сніпет не потрапляє',
        data: {},
        template: `{% assign note = 'Тримається 4–6 місяців' %}
У шаблоні: {{ note }}
У сніпеті без параметра: [{% render 'show' %}]
У сніпеті з параметром: [{% render 'show', note: note %}]`,
        snippets: {
          show: `{{ note }}`,
        },
        note: 'Другий рядок порожній — і це НЕ помилка рендера, а тиша. Найчастіша причина «сніпет нічого не виводить»: забули передати параметр. Shopify тут не скаже ні слова, бо звернення до неіснуючої змінної в Liquid легальне.',
      },
      {
        type: 'p',
        text: 'Що лишається доступним усередині сніпета — **глобальні обʼєкти**: `shop`, `settings`, `cart`, `request`, `routes`, `linklists`, `localization`, `template`, `customer`. Плюс обʼєкти, які й так доступні в місці виклику «самі по собі»: на сторінці товару — `product`, на сторінці колекції — `collection`, усередині секції — `section`, усередині блока — `block`.',
      },
      {
        type: 'example',
        title: 'Глобальні обʼєкти доходять і без параметрів',
        preset: 'product',
        template: `Ззовні: {{ shop.name }} / {{ product.title }}
Зсередини: [{% render 'ctx' %}]`,
        snippets: {
          ctx: `{{ shop.name }} / {{ product.title }}`,
        },
        note: 'Зсередини сніпета видно і `shop`, і `product` — хоча їх ніхто не передавав. Саме тому «ізольований» не означає «порожній»: ізоляція стосується **створених тобою** змінних, а не обʼєктів сторінки. Порівняй із наступним прикладом, де `assign` усередину вже не доходить.',
      },
      {
        type: 'note',
        tone: 'warn',
        title: 'Секції ізольовані так само, але параметрів не приймають',
        text: 'Тег `section` не має параметрів взагалі: `{% section \'header\', menu: x %}` — синтаксична помилка. Тому «передати дані вниз» можна лише сніпету. Якщо кортить передати щось у секцію — це сигнал, що дані мають прийти з глобального обʼєкта, з налаштування секції або з метаполя. Див. [секції та схема](/docs/shopify/sections-and-schema).',
      },
      { type: 'h', text: 'Три форми виклику' },
      {
        type: 'table',
        head: ['Форма', 'Що робить'],
        rows: [
          ['`{% render \'card\' %}`', 'Підключає сніпет без даних. Усередині — лише глобальні обʼєкти.'],
          ['`{% render \'card\', product: p, big: true %}`', 'Іменовані параметри. Значення — змінна, літерал або вираз із фільтрами.'],
          ['`{% render \'card\' with p as product %}`', 'Передає ОДНЕ значення під заданим імʼям. Без `as` імʼям стає імʼя сніпета.'],
          ['`{% render \'card\' for items as item %}`', 'Проганяє сніпет по масиву; усередині доступний ще й `forloop`.'],
          ['`{% render block %}`', 'Особлива форма для блоків застосунків (`@app`): замість імені — обʼєкт. Див. [блоки](/docs/shopify/blocks).'],
        ],
      },
      {
        type: 'example',
        title: 'with … as і for … as',
        preset: 'collection',
        template: `{% render 'row' with collection.products.first as item %}

{% render 'row' for collection.products as item %}`,
        snippets: {
          row: `{% if forloop %}{{ forloop.index }}. {% else %}одиничний: {% endif %}{{ item.title }}
`,
        },
        note: '`with` — це «передати один обʼєкт», `for` — «повторити сніпет для кожного елемента». У формі `for` усередині зʼявляється власний `forloop` з `index`, `first`, `last`, `length`: саме тому перший виклик пішов гілкою `else`, а другий пронумерувався. Форма `for` розбирає сніпет один раз і проганяє ним масив — тому вона дешевша за `{% for %}` з `render` усередині.',
      },
      {
        type: 'note',
        tone: 'warn',
        title: 'Зміни всередині сніпета назовні не повертаються',
        text: 'Передав `count`, сніпет зробив `{% assign count = count | plus: 1 %}` — після виклику `count` лишиться старим. Офіційне формулювання: зміни в переданій змінній діють **тільки всередині**. Сніпет не може «повернути значення» — він може лише щось надрукувати. Потрібен результат-рядок — обгорни виклик у `{% capture %}`.',
      },
      { type: 'h', text: 'include: чому застарів і чим шкідливий' },
      {
        type: 'p',
        text: 'До `render` був `{% include %}`. Він підключав той самий файл, але **без ізоляції**: сніпет бачив усі змінні місця виклику й міг їх змінювати. Shopify позначив його застарілим із формулюванням: такий спосіб роботи зі змінними **знижує продуктивність** і робить код важчим для читання й супроводу.',
      },
      {
        type: 'example',
        title: 'Те, через що include прибрали',
        data: {},
        template: `{% assign total = 1 %}
{% include 'bump' %}
Після include: {{ total }}

{% assign total = 1 %}
{% render 'bump' %}
Після render: {{ total }}`,
        snippets: {
          bump: `{% assign total = total | plus: 41 %}`,
        },
        note: 'Один і той самий файл. `include` дотягнувся до `total` викликача й переписав його — сніпет тихо змінив стан сторінки. `render` не зміг ні прочитати, ні змінити. Тепер уяви `include \'price\'` у трьох місцях великої секції, де сніпет мимохідь перевизначає `current_variant`: саме так у старих темах народжувались баги, які неможливо знайти читанням одного файла.',
      },
      {
        type: 'table',
        head: ['', '`render`', '`include` (застарілий)'],
        rows: [
          ['Змінні викликача', 'не видно', 'видно всі'],
            ['Запис у змінні викликача', 'неможливий', 'можливий — і це головна пастка'],
          ['Передача даних', 'параметри, `with … as`, `for … as`', 'параметри теж є, але вони не потрібні — і так усе видно'],
          ['Вкладеність', 'сніпет може викликати `render`', 'усередині сніпета, підключеного через `render`, `include` **заборонений**'],
          ['Продуктивність', 'сніпет розбирається незалежно й кешується', 'кожен виклик тягне за собою область видимості викликача'],
          ['Статичний аналіз', 'Theme Check бачить граф залежностей', 'ні'],
        ],
      },
      {
        type: 'note',
        tone: 'warn',
        title: 'Жодного нового include',
        text: 'У чинній темі `include` ще може траплятись — і він працює, Shopify його не вимкнув. Але Theme Check позначає його як `DeprecatedTag`, у Theme Store з ним не пройти, а всередині сніпета, підключеного через `render`, він просто заборонений. Правило просте: **новий код — тільки `render`**; старий переписують разом із передачею параметрів, бо саме вони й були неявними.',
      },
      { type: 'h', text: 'LiquidDoc: {% doc %}' },
      {
        type: 'p',
        text: 'Сніпет — це функція, і в неї є сигнатура: які параметри вона чекає. До появи `doc` цю сигнатуру доводилось вичитувати з коду. Тег `{% doc %}` дає їй формальний опис: вміст не рендериться, Liquid усередині розбирається, але не виконується, — зате Shopify CLI і редактор коду показують підказки й автодоповнення, а Theme Check ловить виклик із неправильним параметром.',
      },
      {
        type: 'code',
        lang: 'liquid',
        title: 'snippets/price.liquid',
        code: `{% doc %}
  Виводить ціну товару, а за наявності старої ціни — ще й бейдж знижки.

  @param {number} price - Поточна ціна в копійках.
  @param {number} [compare_at] - Стара ціна в копійках. Якщо більша за поточну — буде бейдж.
  @param {string} [size] - Розмір: 'm' (типово) або 'l'.

  @example
  {% render 'price', price: product.price, compare_at: product.compare_at_price %}
{% enddoc %}

<div class="price price--{{ size | default: 'm' }}">
  <span class="price__current">{{ price | money }}</span>
  {% if compare_at and compare_at > price %}
    <s class="price__was">{{ compare_at | money }}</s>
    <span class="price__badge">−{{ compare_at | minus: price | times: 100 | divided_by: compare_at }}%</span>
  {% endif %}
</div>`,
      },
      {
        type: 'p',
        text: 'Формат анотацій: `@param {тип} імʼя - опис`, квадратні дужки навколо імені означають **необовʼязковий** параметр; `@description` — загальний опис; `@example` — приклад виклику. Тег ставлять **першим** у файлі, і він один на файл.',
      },
      {
        type: 'example',
        title: 'doc нічого не друкує',
        data: { label: 'Хіт продажів' },
        template: `{% doc %}
  @param {string} label - Текст бейджа.
{% enddoc %}
<span class="badge">{{ label }}</span>`,
        view: 'html',
        note: 'У виводі — лише `<span>`. Документація лишається в коді, а не в HTML. Тим і відрізняється від `{% comment %}`: коментар — текст для людини, `doc` — машиночитний контракт сніпета.',
      },
      { type: 'h', text: 'Патерни з реальних тем' },
      {
        type: 'code',
        lang: 'liquid',
        title: 'Картка товару: один сніпет, різні контексти',
        code: `{% comment %} Сітка колекції {% endcomment %}
{% for product in collection.products %}
  {% render 'card-product', card_product: product, show_vendor: settings.show_vendor %}
{% endfor %}

{% comment %} Рекомендації в секції — той самий сніпет, інші прапорці {% endcomment %}
{% render 'card-product'
   for recommendations.products as card_product
   show_vendor: false, lazy_load: true %}

{% comment %} Заглушка, коли товарів ще немає {% endcomment %}
{% render 'card-product', card_product: null, placeholder: 'product-1' %}`,
      },
      {
        type: 'note',
        tone: 'shopify',
        title: 'Як це названо в Dawn',
        text: 'Параметр картки в Dawn зветься `card_product`, а не `product` — і це не примха. Сніпет працює і на сторінці товару, де вже існує глобальний `product`; параметр з таким самим імʼям перекрив би його всередині сніпета і зробив би код двозначним. Те саме з `card_collection`. Загальне правило: **не називай параметр іменем глобального обʼєкта**.',
      },
      {
        type: 'note',
        tone: 'warn',
        title: 'Ціна виклику в циклі',
        text: 'Сніпет у Shopify — це не безкоштовна вставка тексту: кожен `render` має власну область видимості й власний рендер. Сотня товарів × картка × вкладений сніпет ціни × сніпет іконки — і час рендера сторінки зростає помітно. Тому: форма `render … for` замість `for` із `render` усередині; важке обчислення (`where`, `map`, `sort`) виносять ДО циклу й передають готовий результат; іконки, що повторюються, віддають `<svg><use href="#icon-…">` замість сніпета на кожен виклик. Деталі — у [продуктивності](/docs/shopify/performance).',
      },
      {
        type: 'note',
        tone: 'interview',
        title: 'На співбесіді: «У чому різниця між render та include?»',
        text: 'Питання-класика, його ставлять майже завжди. «`render` рендерить сніпет в ізольованій області видимості: усередину доходять лише глобальні обʼєкти й передані параметри, а зміни всередині назовні не виходять. `include` підключав сніпет у спільну область: він бачив усі змінні викликача й міг їх перезаписати. Shopify позначив `include` застарілим, бо це шкодить продуктивності й робить код непередбачуваним; усередині сніпета, підключеного через `render`, `include` навіть заборонений». Сильний фінал — сказати, що саме ізоляція дозволяє Shopify розбирати й кешувати сніпети незалежно.',
      },
      {
        type: 'note',
        tone: 'interview',
        title: 'На співбесіді: «Сніпет виводить порожньо. Що перевіриш?»',
        text: 'Перше — чи передані параметри: сніпет не бачить змінних викликача, тож `{% render \'price\' %}` без `price:` тихо виведе порожньо, без жодної помилки. Друге — імʼя: файл має лежати просто в `snippets/`, без підтек, а в тезі — без розширення. Третє — чи не перекрив параметр глобальний обʼєкт із тим самим імʼям. І окремо: `{% include %}` у цьому місці «працював би» випадково — саме тому, що бачить чужі змінні; якщо код зламався після заміни `include` на `render`, бракує саме явних параметрів.',
      },
      {
        type: 'note',
        tone: 'tip',
        text: 'Сніпет може мати власні `{% stylesheet %}` і `{% javascript %}` — по одному на файл. Їхній вміст Shopify збирає в спільні бандли теми й віддає через `content_for_header`, а на місці вони не друкують нічого. Liquid усередині цих тегів **не виконується**: потрібні значення з налаштувань — виводь їх окремим `{% style %}` як CSS-змінні. Див. [асети](/docs/shopify/assets).',
      },
    ],
  },

  /* ───────────────────────── 8. theme-settings ───────────────────────── */
  {
    slug: 'theme-settings',
    section: 'shopify',
    title: 'Налаштування теми: settings_schema.json і обʼєкт settings',
    summary:
      'Два файли в `config/`: `settings_schema.json` описує, ЯКІ глобальні налаштування має тема, `settings_data.json` зберігає вибір мерчанта. У Liquid вони приходять глобальним обʼєктом `settings`.',
    officialUrl: 'https://shopify.dev/docs/storefronts/themes/architecture/config/settings-schema-json',
    related: ['shopify/sections-and-schema', 'shopify/assets', 'shopify/locales', 'shopify/architecture', 'shopify/json-templates'],
    blocks: [
      {
        type: 'p',
        text: 'Секція описує себе в `{% schema %}`, а тема цілком — у теці `config/`. Модель та сама: **схема каже, що можна налаштувати, дані зберігають те, що налаштували**. Схему пише розробник, дані веде редактор теми. Сюди кладуть те, що спільне для всього магазину: кольори, шрифти, ширину контейнера, радіуси, логотип, посилання на соцмережі, тексти кнопок, прапорці «показувати вендора», «показувати другу картинку на ховер».',
      },
      {
        type: 'code',
        lang: 'json',
        title: 'config/settings_schema.json',
        code: `[
  {
    "name": "theme_info",
    "theme_name": "Liquid Lab",
    "theme_version": "1.3.0",
    "theme_author": "Liquid Lab Studio",
    "theme_documentation_url": "https://example.com/docs",
    "theme_support_url": "https://example.com/support"
  },
  {
    "name": "Кольори",
    "settings": [
      { "type": "color", "id": "colors_accent", "label": "Акцент", "default": "#0e8f8b" },
      { "type": "color", "id": "colors_text", "label": "Текст", "default": "#121212" }
    ]
  },
  {
    "name": "Розкладка",
    "settings": [
      { "type": "paragraph", "content": "Стосується всіх сторінок магазину." },
      { "type": "range", "id": "page_width", "label": "Ширина контейнера",
        "min": 1000, "max": 1600, "step": 100, "unit": "px", "default": 1200 },
      { "type": "range", "id": "card_radius", "label": "Заокруглення карток",
        "min": 0, "max": 24, "step": 2, "unit": "px", "default": 12 }
    ]
  },
  {
    "name": "Картка товару",
    "settings": [
      { "type": "checkbox", "id": "show_vendor", "label": "Показувати бренд", "default": true },
      { "type": "range", "id": "products_per_row", "label": "Товарів у ряд",
        "min": 2, "max": 5, "step": 1, "default": 4 }
    ]
  }
]`,
      },
      {
        type: 'p',
        text: 'Файл — **масив груп**. Кожна група — це вкладка (чи розділ) у боковій панелі редактора: `name` — її заголовок, `settings` — масив самих налаштувань. Перший запис масиву службовий: це не група, а картка теми `theme_info`.',
      },
      {
        type: 'code',
        lang: 'json',
        title: 'config/settings_data.json',
        code: `{
  "current": {
    "colors_accent": "#b5477a",
    "page_width": 1400,
    "card_radius": 4,
    "show_vendor": false,
    "products_per_row": 3,

    "sections": {
      "announcement": {
        "type": "announcement-bar",
        "settings": { "text": "Безкоштовна доставка від 1500 ₴" }
      }
    }
  },
  "presets": {
    "Мінімалізм": { "colors_accent": "#121212", "card_radius": 0 },
    "Ніжний": { "colors_accent": "#e8a0bf", "card_radius": 24 }
  }
}`,
      },
      {
        type: 'table',
        head: ['', '`settings_schema.json`', '`settings_data.json`'],
        rows: [
          ['Що це', 'опис полів: типи, підписи, дефолти', 'значення, які вибрав мерчант'],
          ['Хто редагує', 'розробник, руками', 'редактор теми — **перезаписує файл**'],
          ['Ключ `current`', '—', 'поточні значення; може бути й просто імʼям пресета рядком'],
          ['Ключ `presets`', '—', 'стилі теми: готові набори значень, між якими мерчант перемикається'],
          ['Ключ `sections`', '—', 'налаштування **статичних** секцій — тих, що підключені тегом `section`'],
        ],
      },
      {
        type: 'note',
        tone: 'warn',
        title: 'settings_data.json належить мерчанту',
        text: 'Це той самий клас файлів, що й JSON-шаблони: задеплоїш свою локальну копію — зітреш усе, що мерчант наклацав, включно з логотипом і кольорами. Перед роботою `shopify theme pull`, у деплої з CI цей файл виключають. І ще: значення там лежать **за `id`**, а не за підписом.',
      },
      {
        type: 'note',
        tone: 'warn',
        title: 'Перейменував id — стер значення мерчанта',
        text: 'Було `colors_accent`, ти зробив `color_accent` — Shopify не знайде старий ключ і візьме `default` зі схеми. Магазин поїде на дефолтні кольори просто від деплою, і мерчант про це дізнається сам. `id` — це контракт із даними, а не назва змінної: підпис міняти можна будь-коли, `id` — ніколи (точніше — з міграцією значень).',
      },
      { type: 'h', text: 'Обʼєкт settings' },
      {
        type: 'example',
        title: 'settings доступний скрізь',
        preset: 'shop',
        template: `Акцент: {{ settings.colors_accent }}
Товарів у ряд: {{ settings.products_per_row }}
Ширина лого: {{ settings.logo_width }}px

{% if settings.show_vendor %}
  Показуємо бренд у картці.
{% else %}
  Бренд у картці ховаємо.
{% endif %}

Неоголошене налаштування: [{{ settings.nope }}]`,
        note: '`settings` — **глобальний** обʼєкт: він доступний у лейауті, шаблоні, секції, блоці й сніпеті, без жодної передачі. Звернення до неоголошеного ключа не падає, а віддає порожньо — тому одруківка в імені не викличе помилки, лише тихо зламає верстку.',
      },
      {
        type: 'note',
        tone: 'warn',
        title: 'settings ≠ section.settings',
        text: 'Це два різні джерела, і їх постійно плутають. `settings.<id>` — глобальне налаштування теми з `config/settings_schema.json`, одне на весь магазин. `section.settings.<id>` — налаштування конкретної секції з її `{% schema %}`, своє в кожному екземплярі секції. `block.settings.<id>` — те саме для блока. Якщо в секції «нічого не застосовується», перше, що варто перевірити, — чи не написано там `settings.heading` замість `section.settings.heading`.',
      },
      { type: 'h', text: 'Глобальне чи секційне: як вибрати' },
      {
        type: 'table',
        head: ['', 'Глобальне (`settings`)', 'Секційне (`section.settings`)'],
        rows: [
          ['Де описано', '`config/settings_schema.json`', '`{% schema %}` секції'],
          ['Скільки значень', 'одне на магазин', 'своє в кожній секції на кожній сторінці'],
          ['Де в редакторі', 'вкладка «Налаштування теми»', 'панель самої секції'],
          ['Типові мешканці', 'кольори, шрифти, ширина, радіуси, соцмережі, валюта, favicon', 'заголовок, картинка, товар, кількість колонок цієї сітки'],
          ['Читається як', '«так виглядає вся тема»', '«так виглядає цей блок тут»'],
        ],
      },
      {
        type: 'p',
        text: 'Критерій простий: **чи захоче мерчант різних значень у різних місцях?** Колір кнопки — навряд, це глобальне. Заголовок банера — звісно, це секційне. Помилка в обидва боки болить однаково: глобальне налаштування «Заголовок головної» зробить неможливим другий банер, а секційне налаштування шрифту змусить мерчанта міняти його в двадцяти секціях. Компроміс, який часто беруть: глобально задати шкалу (`card_radius`), а в секції лишити перемикач «застосувати / без заокруглень».',
      },
      { type: 'h', text: 'Типи input-ів' },
      {
        type: 'p',
        text: 'Набір типів той самий, що й у схемі секції, — їх повністю розібрано на сторінці [секції та схема](/docs/shopify/sections-and-schema). Тут важать ті, що мають сенс саме глобально:',
      },
      {
        type: 'table',
        head: ['Тип', 'Навіщо в налаштуваннях теми'],
        rows: [
          ['`color`', 'Повертає обʼєкт `color`: друкується як hex, але має `.red`, `.alpha`, `.hue` — з нього будують похідні кольори.'],
          ['`color_scheme_group`', 'Колірні схеми теми (світла, темна, акцентна). Оголошуються ТУТ, а секції потім лише обирають схему типом `color_scheme`.'],
          ['`font_picker`', 'Повертає обʼєкт `font` із `.family`, `.fallback_families`, `.weight`, `.style`. `default` обовʼязковий.'],
          ['`image_picker`', 'Логотип, favicon, картинка за замовчуванням. `default` не підтримує — завжди може бути порожнім.'],
          ['`link_list`', 'Меню для хедера чи футера, якщо тема не тримає його в секції.'],
          ['`url`, `text`', 'Соцмережі, телефон, адреса, текст у футері.'],
          ['`checkbox`', 'Прапорці поведінки: показувати вендора, друге фото на ховер, швидкий перегляд.'],
          ['`range`', 'Числова шкала з кроком: ширина, радіус, товщина рамки. Обовʼязкові `min`, `max`, `step`, `default`.'],
          ['`header`, `paragraph`', 'Нічого не повертають — лише впорядковують довгу форму. `id` їм не потрібен.'],
        ],
      },
      {
        type: 'example',
        title: 'Порожні значення: де default рятує, а де ні',
        data: { settings: { zero: 0, flag: false, blank_text: '' } },
        template: `number без значення → [{{ settings.gap | default: 16 }}]
number = 0          → [{{ settings.zero | default: 16 }}]
checkbox = false    → [{{ settings.flag | default: true }}]
checkbox + allow_false → [{{ settings.flag | default: true, allow_false: true }}]
порожній текст      → [{{ settings.blank_text | default: 'Liquid Lab' }}]`,
        note: 'Три пастки в пʼяти рядках. Порожнє поле `number` — це `nil`, і `default` спрацює. А от `0` у Liquid **truthy**, тож `default` його не підмінить — і це правильно, бо нуль часто й означає «без відступу». Найгірше з `checkbox`: мерчант свідомо зняв галочку, а `default: true` мовчки повертає її назад — рятує лише `allow_false: true`.',
      },
      { type: 'h', text: 'Налаштування → CSS-змінні' },
      {
        type: 'p',
        text: 'Головний патерн сучасної теми: **Liquid не розмазує налаштування по стилях, а віддає їх CSS одним місцем**. У `layout/theme.liquid` тег `{% style %}` друкує `:root` із CSS-змінними, а весь CSS теми в `assets/` — статичний і кешований, бо оперує змінними, а не значеннями.',
      },
      {
        type: 'example',
        title: ':root із налаштувань теми',
        data: { settings: { colors_accent: '#0e8f8b', colors_text: '#121212', page_width: 1400, card_radius: 12, show_vendor: true } },
        template: `{% style %}
  :root {
    --color-accent: {{ settings.colors_accent }};
    --color-text: {{ settings.colors_text }};
    --page-width: {{ settings.page_width }}px;
    --card-radius: {{ settings.card_radius }}px;
  }
{% endstyle %}`,
        note: 'Тег `style` віддає `<style data-shopify>` — атрибут ставить сам Shopify. Далі `assets/base.css` пише `max-width: var(--page-width)` і більше нічого про налаштування не знає. Зміна ширини в редакторі не інвалідовує кеш CSS-файла: міняється лише інлайновий `:root`.',
      },
      {
        type: 'note',
        tone: 'shopify',
        title: 'Чому саме {% style %}, а не .css.liquid',
        text: 'Колірні налаштування всередині `{% style %}` редактор теми оновлює **наживо**, без перезавантаження сторінки: мерчант тягне піпетку — колір міняється одразу. Альтернатива з `.liquid`-асетом такого не вміє і до того ж робить CSS-файл не кешованим. Тому правило: змінні — через `{% style %}` у лейауті, решта стилів — звичайним `.css` через `asset_url`. Див. [асети](/docs/shopify/assets).',
      },
      {
        type: 'code',
        lang: 'liquid',
        title: 'Шрифти: font_picker → @font-face → змінні',
        code: `{% comment %} font_picker повертає обʼєкт font, а не рядок {% endcomment %}
{% assign body = settings.type_body_font %}
{% assign body_bold = body | font_modify: 'weight', 'bold' %}

{{ body | font_face: font_display: 'swap' }}
{{ body_bold | font_face: font_display: 'swap' }}

{% style %}
  :root {
    --font-body-family: {{ body.family }}, {{ body.fallback_families }};
    --font-body-weight: {{ body.weight }};
    --font-body-style: {{ body.style }};
  }
{% endstyle %}`,
      },
      {
        type: 'p',
        text: 'Фільтри `font_face`, `font_modify` і `font_url` пісочниця не емулює — тому блок вище статичний. Логіка така: `font_picker` дає обʼєкт шрифту, `font_modify` робить із нього іншу нарізку (жирну, курсивну), `font_face` друкує правило `@font-face` із CDN Shopify.',
      },
      { type: 'h', text: 'theme_info' },
      {
        type: 'p',
        text: 'Перший запис у `settings_schema.json` — картка самої теми: `theme_name`, `theme_version`, `theme_author`, `theme_documentation_url`, `theme_support_url`. Це не налаштування: у Liquid вони не приходять, мерчант їх не редагує. Shopify показує їх в адмінці й у списку тем, а для теми з Theme Store вони обовʼязкові. Версію тут піднімають разом із релізом — саме її потім бачить служба підтримки, коли мерчант пише «щось зламалось».',
      },
      {
        type: 'note',
        tone: 'tip',
        text: 'У темах для продажу підписи не пишуть текстом, а посилаються на переклади редактора: `"name": "t:settings_schema.colors.name"`, `"label": "t:settings_schema.colors.settings.accent.label"`. Ключі лежать у `locales/*.schema.json`. Деталі — на сторінці [локалі](/docs/shopify/locales).',
      },
      {
        type: 'note',
        tone: 'interview',
        title: 'На співбесіді: «Чим settings відрізняється від section.settings?»',
        text: '«`settings` — глобальні налаштування теми: описані в `config/settings_schema.json`, значення лежать у `settings_data.json`, одне на весь магазин, доступні з будь-якого файла без передачі. `section.settings` — налаштування конкретної секції з її `{% schema %}`: своє значення в кожному екземплярі секції на кожній сторінці, зберігається в JSON-шаблоні або групі секцій». Сильний штрих — додати критерій вибору: якщо мерчант захоче різних значень у різних місцях, налаштування має бути секційним.',
      },
      {
        type: 'note',
        tone: 'interview',
        title: 'На співбесіді: «Як налаштування теми доїжджають до CSS?»',
        text: 'Через CSS-змінні. У `layout/theme.liquid` стоїть `{% style %}`, який друкує `:root` зі значеннями з `settings`; статичні файли в `assets/` користуються лише `var(--…)`. Так CSS лишається кешованим, а редактор теми оновлює кольори наживо, без перезавантаження. Альтернативу з `.css.liquid` я не беру: вона ламає кеш і не дає live-превʼю. Якщо спитають про шрифти — `font_picker` віддає обʼєкт, `font_face` друкує `@font-face`, а в змінні йдуть `family`, `weight`, `style`.',
      },
      {
        type: 'note',
        tone: 'warn',
        title: 'Схема без даних — і тема виглядає порожньою',
        text: 'Кожне глобальне налаштування (крім пікерів, які `default` не підтримують) має отримати притомний `default`. Свіжовстановлена тема рендериться саме на дефолтах: без них мерчант побачить чорний текст на чорному фоні, нульову ширину контейнера й порожні посилання — ще до того, як щось налаштує. Перевіряти це треба на **чистому** магазині, а не на своєму, де все давно виставлено руками.',
      },
    ],
  },

  /* ───────────────────────────── 9. locales ───────────────────────────── */
  {
    slug: 'locales',
    section: 'shopify',
    title: 'Локалі: locales/*.json і фільтр t',
    summary:
      'Тексти теми не пишуть у розмітці — їх кладуть у `locales/*.json` і дістають фільтром `t` за ключем. Окремо живуть переклади вітрини й переклади редактора теми (`*.schema.json`).',
    officialUrl: 'https://shopify.dev/docs/storefronts/themes/architecture/locales',
    related: ['shopify/theme-settings', 'shopify/sections-and-schema', 'shopify/forms', 'shopify/architecture'],
    blocks: [
      {
        type: 'p',
        text: 'Жоден текст у темі не має бути зашитий у розмітку — ні «Додати в кошик», ні «Немає в наявності», ні alt картинки. Усе це ключі, а значення лежать у теці `locales/`. Причина не лише в перекладі на інші мови: мерчант може змінити будь-який рядок теми прямо в адмінці, не чіпаючи код, — і саме локалі роблять це можливим.',
      },
      {
        type: 'code',
        lang: 'text',
        title: 'Тека locales/',
        code: `locales/
├── en.default.json          ← тексти вітрини, ДЕФОЛТНА локаль
├── en.default.schema.json   ← тексти редактора теми, ДЕФОЛТНА локаль
├── uk.json                  ← тексти вітрини українською
├── uk.schema.json           ← тексти редактора українською
├── de.json
└── de.schema.json

Імʼя файла — код локалі. Суфікс .default позначає дефолтну локаль,
і такий файл має бути рівно один на кожен із двох типів.`,
      },
      {
        type: 'table',
        head: ['', 'Вітрина (`uk.json`)', 'Редактор теми (`uk.schema.json`)'],
        rows: [
          ['Що перекладає', 'усе, що бачить покупець: кнопки, підписи, повідомлення', 'усе, що бачить мерчант: назви секцій, підписи налаштувань, опції'],
          ['Як дістати', 'фільтр `t` у Liquid: `{{ \'cart.title\' | t }}`', 'префікс `t:` прямо в JSON схеми: `"label": "t:sections.hero.heading"`'],
          ['Де працює', 'у будь-якому Liquid-файлі теми', '**лише всередині схем** — секцій, блоків, `settings_schema.json`'],
          ['Хто редагує', 'мерчант в адмінці, розділ «Мова магазину»', 'лише розробник — у файлі'],
        ],
      },
      { type: 'h', text: 'Фільтр t' },
      {
        type: 'example',
        title: 'Ключ замість тексту',
        data: {
          request: { locale: { iso_code: 'uk', name: 'Українська' } },
          locales: {
            products: { product: { add_to_cart: 'Додати в кошик', sold_out: 'Немає в наявності' } },
            general: { search: { placeholder: 'Шукати засіб…' } },
          },
        },
        template: `{{ 'products.product.add_to_cart' | t }}
{{ 'products.product.sold_out' | t }}
{{ 'general.search.placeholder' | t }}`,
        note: 'Ключ — це шлях по вкладеному JSON через крапку. У пісочниці словник кладеться в змінну `locales`, а поточна локаль береться з `request.locale.iso_code`; у Shopify те саме робить платформа, читаючи файл із `locales/`. Фільтр має довге імʼя-синонім `translate` — у темах пишуть `t`.',
      },
      {
        type: 'code',
        lang: 'json',
        title: 'locales/uk.json — той самий словник у файлі',
        code: `{
  "general": {
    "search": { "placeholder": "Шукати засіб…" }
  },
  "products": {
    "product": {
      "add_to_cart": "Додати в кошик",
      "sold_out": "Немає в наявності",
      "from_price": "від {{ price }}"
    }
  },
  "cart": {
    "item_count": {
      "one": "{{ count }} товар",
      "few": "{{ count }} товари",
      "many": "{{ count }} товарів",
      "other": "{{ count }} товару"
    }
  }
}`,
      },
      {
        type: 'p',
        text: 'Структуру вкладеності вигадує розробник, але вона не довільна: Shopify очікує впізнавані верхні групи (`general`, `products`, `collections`, `cart`, `customer`, `blogs`, `sections`, `accessibility`, `onboarding`), і саме за ними адмінка групує рядки в редакторі мови. Візьми структуру Dawn за зразок — мерчанту буде звично.',
      },
      {
        type: 'example',
        title: 'Немає ключа — сторінка не падає',
        data: {
          request: { locale: { iso_code: 'uk', name: 'Українська' } },
          locales: { general: { search: 'Пошук' } },
        },
        template: `{{ 'general.search' | t }}
{{ 'general.searhc' | t }}`,
        note: 'Одруківка в ключі не ламає рендер: на місце тексту друкується маркер `translation missing` із локаллю й ключем. Поведінка милосердна до магазину — і підступна до розробника: помилку побачить покупець, а не твоя консоль.',
      },
      {
        type: 'note',
        tone: 'warn',
        title: 'translation missing ловлять до релізу, а не після',
        text: 'Маркер проліземо в прод легко: ключ є в `en.default.json`, а в `uk.json` його забули додати — і англомовна вітрина ціла, а українська рясніє `translation missing`. Ловиться двома способами: `shopify theme check` має правило на відсутні ключі перекладу, і ще — перегляд магазину в кожній опублікованій мові перед релізом. Не покладайся на те, що «в дефолтній локалі ж є»: фолбека на дефолтну локаль для відсутнього ключа очікувати не варто.',
      },
      { type: 'h', text: 'Змінні в перекладі' },
      {
        type: 'example',
        title: 'Інтерполяція параметрами',
        data: {
          request: { locale: { iso_code: 'uk', name: 'Українська' } },
          customer: { first_name: 'Софія' },
          locales: {
            general: { greeting: 'Вітаємо, {{ name }}!' },
            products: { from_price: 'від {{ price }} за {{ volume }}' },
          },
        },
        template: `{{ 'general.greeting' | t: name: customer.first_name }}
{{ 'products.from_price' | t: price: '649,00 ₴', volume: '250 мл' }}`,
        note: 'Плейсхолдери в значенні виглядають як Liquid-вивід, але це **не Liquid**: підставляються виключно параметри, передані фільтру `t`. Напишеш у перекладі `{{ product.title }}` — отримаєш порожньо, бо жодного `product` у фільтра немає.',
      },
      {
        type: 'note',
        tone: 'warn',
        title: 'Не склеюй речення з кількох ключів',
        text: 'Спокуса зробити `{{ \'cart.you_have\' | t }} {{ cart.item_count }} {{ \'cart.items\' | t }}` закінчується поганим перекладом: у кожної мови свій порядок слів, свої відмінки й свої форми множини. Правильно — **один ключ на речення** зі змінними всередині: `"У кошику {{ count }} товарів на {{ total }}"`. Це те саме правило, що й у будь-якій i18n-системі, і на співбесіді його люблять питати як «чому не можна конкатенувати переклади».',
      },
      { type: 'h', text: 'Множина' },
      {
        type: 'p',
        text: 'Якщо значення ключа — не рядок, а обʼєкт із формами, `t` обере потрібну за параметром `count`. Форми називаються за категоріями CLDR: `zero`, `one`, `two`, `few`, `many`, `other`. Скільки з них реально працює — залежить від мови: англійській вистачає `one` і `other`, українській потрібні щонайменше `one`, `few`, `many`.',
      },
      {
        type: 'table',
        head: ['Число', 'Українська форма', 'Категорія CLDR'],
        rows: [
          ['1, 21, 31…', '1 товар', '`one`'],
          ['2–4, 22–24…', '3 товари', '`few`'],
          ['0, 5–20, 25–30…', '7 товарів', '`many`'],
          ['дробові (1,5)', '1,5 товару', '`other`'],
        ],
      },
      {
        type: 'example',
        title: 'Форми множини за count',
        data: {
          request: { locale: { iso_code: 'uk', name: 'Українська' } },
          locales: {
            cart: {
              item_count: {
                one: '{{ count }} товар',
                few: '{{ count }} товари',
                many: '{{ count }} товарів',
                other: '{{ count }} товару',
              },
            },
          },
        },
        template: `1 → {{ 'cart.item_count' | t: count: 1 }}
3 → {{ 'cart.item_count' | t: count: 3 }}
7 → {{ 'cart.item_count' | t: count: 7 }}`,
        shopifyOutput: '1 → 1 товар\n3 → 3 товари\n7 → 7 товарів',
        note: '**Тут пісочниця спрощує.** Вона знає лише `one` і `other`, тому для 3 і 7 бере `other`. Справжній Shopify застосовує правила CLDR обраної локалі й дає `few` та `many` — це й показано в рядку «У Shopify». Висновок для роботи: форми пиши всі, які має мова, і не тестуй множину на англійській — там різниця між правильним і неправильним словником невидима.',
      },
      {
        type: 'note',
        tone: 'warn',
        title: 'pluralize — не для української',
        text: 'Фільтр `pluralize` бере рівно два варіанти й застосовує **англійські** правила: `{{ n | pluralize: \'item\', \'items\' }}`. Для української, польської чи російської він структурно неспроможний — трьох форм у нього просто немає. Офіційна довідка прямо попереджає не використовувати його на неанглійських рядках. Множина в темі — це `t` із `count`, і крапка.',
      },
      { type: 'h', text: 'Переклади редактора теми: *.schema.json' },
      {
        type: 'code',
        lang: 'json',
        title: 'locales/uk.schema.json і посилання з схеми',
        code: `// locales/uk.schema.json
{
  "sections": {
    "hero": {
      "name": "Банер",
      "settings": {
        "heading": { "label": "Заголовок", "info": "Показується великим шрифтом" },
        "align": {
          "label": "Вирівнювання",
          "options__1": { "label": "Ліворуч" },
          "options__2": { "label": "По центру" }
        }
      }
    }
  },
  "settings_schema": {
    "colors": { "name": "Кольори" }
  }
}

// sections/hero.liquid → {% schema %}
{
  "name": "t:sections.hero.name",
  "settings": [
    { "type": "text", "id": "heading",
      "label": "t:sections.hero.settings.heading.label",
      "info": "t:sections.hero.settings.heading.info",
      "default": "Відновлення, яке тримається" },
    { "type": "select", "id": "align",
      "label": "t:sections.hero.settings.align.label",
      "options": [
        { "value": "left",   "label": "t:sections.hero.settings.align.options__1.label" },
        { "value": "center", "label": "t:sections.hero.settings.align.options__2.label" }
      ],
      "default": "center" }
  ]
}`,
      },
      {
        type: 'note',
        tone: 'warn',
        title: 'Два світи не перетинаються',
        text: 'Префікс `t:` працює **тільки в JSON схем** — у розмітці він нічого не значить. І навпаки: фільтр `t` не бачить ключів зі `*.schema.json`. Плутанина дає два симптоми, які легко впізнати: у редакторі теми підпис поля виглядає як голий ключ `t:sections.hero.name`, або на вітрині зʼявляється `translation missing` для ключа, який ти щойно «точно додав» — але не в той файл. Ще одне: значення `default` у схемі НЕ перекладають через `t:` — це стартовий контент, а не інтерфейс.',
      },
      { type: 'h', text: 'localization: мова, країна, ринок' },
      {
        type: 'p',
        text: 'Обʼєкт `localization` описує, що магазин пропонує відвідувачу: `available_languages` (масив обʼєктів `shop_locale`), поточна `language`, `available_countries`, поточна `country`, `market`. Кожна мова має `iso_code`, `name` (назва мовою магазину), `endonym_name` (назва самою мовою — «Українська», «Deutsch»), `primary` і `root_url` — префікс адреси для цієї мови.',
      },
      {
        type: 'example',
        title: 'Перемикач мов',
        view: 'html',
        data: {
          request: { path: '/collections/home-care', locale: { iso_code: 'uk', name: 'Українська' } },
          localization: {
            language: { iso_code: 'uk', endonym_name: 'Українська', root_url: '/' },
            available_languages: [
              { iso_code: 'uk', endonym_name: 'Українська', root_url: '/', primary: true },
              { iso_code: 'en', endonym_name: 'English', root_url: '/en', primary: false },
              { iso_code: 'de', endonym_name: 'Deutsch', root_url: '/de', primary: false },
            ],
          },
        },
        template: `{% form 'localization' %}
  <input type="hidden" name="return_to" value="{{ request.path }}">
  <select name="locale_code">
    {%- for lang in localization.available_languages -%}
      <option value="{{ lang.iso_code }}"{% if lang.iso_code == localization.language.iso_code %} selected{% endif %}>
        {{ lang.endonym_name }}
      </option>
    {%- endfor -%}
  </select>
  <button type="submit">Застосувати</button>
{% endform %}`,
        note: 'Мову перемикає **форма**, а не посилання: `{% form \'localization\' %}` віддає `POST` на `/localization`, поле зветься `locale_code`, а `return_to` повертає покупця на ту саму сторінку. Тією самою формою перемикають країну (`country_code`). У списку показують `endonym_name`: німець шукає «Deutsch», а не «Німецька».',
      },
      {
        type: 'note',
        tone: 'shopify',
        title: 'Мова живе в адресі',
        text: 'Додаткові мови Shopify віддає з префіксом: `/en/products/keratin-shampoo`. Звідси два наслідки для коду. Перший: **ніколи не склеюй адреси руками** — бери `product.url`, `routes.*`, `link.url`, вони вже враховують поточну локаль. Другий: `lang.root_url` — це корінь мови, і перемикач мов, зроблений посиланнями замість форми, має вести саме на нього. Дефолтна локаль префікса не має.',
      },
      {
        type: 'note',
        tone: 'tip',
        text: 'У locale-файлі вітрини можна оголосити ще й **власні формати дат**, а потім кликати їх за імʼям: `{{ article.published_at | date: format: \'month_day_year\' }}`. Це зручніше, ніж тягати рядок `%d.%m.%Y` по всіх шаблонах, і дає різний формат дати в різних мовах — те, заради чого локалі взагалі існують.',
      },
      {
        type: 'note',
        tone: 'interview',
        title: 'На співбесіді: «Як зробити тему багатомовною?»',
        text: '«Жодного тексту в розмітці: усі рядки — ключі в `locales/<код>.json`, у шаблоні — фільтр `t`. Один ключ на цілу фразу, змінні всередині передаю параметрами `t`, множину — обʼєктом форм із `count`, бо в кожної мови свій набір. Підписи редактора теми перекладаю окремо — у `*.schema.json` через префікс `t:` у схемі. Адреси беру з `routes` і властивостей обʼєктів, бо Shopify додає мовний префікс. Перемикач мов — форма `localization`».',
      },
      {
        type: 'note',
        tone: 'interview',
        title: 'На співбесіді: «Чим *.json відрізняється від *.schema.json?»',
        text: 'Перший — тексти вітрини, які бачить покупець; дістаю фільтром `t`, мерчант може правити їх в адмінці. Другий — тексти редактора теми: назви секцій, підписи налаштувань, опції; вони живуть у схемах і підключаються префіксом `t:` прямо в JSON. Два світи не перетинаються: `t:` у розмітці не працює, а фільтр `t` не бачить ключів схеми. Дефолтну локаль у кожному з двох типів позначає суфікс `.default` в імені файла, і така вона одна.',
      },
    ],
  },

  /* ───────────────────────────── 10. assets ───────────────────────────── */
  {
    slug: 'assets',
    section: 'shopify',
    title: 'Асети: assets/, asset_url і підключення CSS та JS',
    summary:
      'Тека `assets/` — уся статика теми. Адресу на CDN дає фільтр `asset_url`, теги підключення — `stylesheet_tag`, `script_tag`, `preload_tag`. Окремо живуть `{% stylesheet %}`, `{% javascript %}` і `{% style %}`.',
    officialUrl: 'https://shopify.dev/docs/storefronts/themes/architecture/assets',
    related: ['shopify/theme-settings', 'shopify/performance', 'shopify/architecture', 'shopify/images', 'shopify/liquid-and-js'],
    blocks: [
      {
        type: 'p',
        text: 'Усе, що браузер вантажить окремим запитом і що належить **темі**, лежить у `assets/`: CSS, JS, шрифти, іконки, картинки інтерфейсу. Тека плоска — підтек не буває, тому структуру імітують префіксами в іменах. Кожен файл Shopify роздає з власного CDN, і звертатись до нього треба тільки через фільтр, ніколи — зашитим шляхом.',
      },
      {
        type: 'code',
        lang: 'text',
        title: 'assets/ — плоска тека з префіксами замість підтек',
        code: `assets/
├── base.css                   глобальні стилі
├── component-card.css         стилі картки товару
├── component-price.css
├── section-featured.css       стилі однієї секції
├── product-form.js
├── cart-drawer.js
├── inter-400.woff2
└── logo-fallback.svg

Файли з тек Files в адмінці (логотип, PDF, банер мерчанта) — це НЕ асети теми:
для них інший фільтр, file_url.`,
      },
      { type: 'h', text: 'Адреса файла: asset_url і сусіди' },
      {
        type: 'example',
        title: 'Чотири джерела, чотири фільтри',
        template: `{{ 'base.css' | asset_url }}
{{ 'brand.svg' | asset_url }}
{{ 'logo.png' | file_url }}
{{ 'option_selection.js' | shopify_asset_url }}`,
        note: 'Адреси **протокол-відносні** (починаються з `//`) і несуть `?v=` — про версію нижче. Зверни увагу на різні шляхи: асет теми лежить у `…/t/<номер теми>/assets/`, а файл із адмінки — у `…/files/`. Переплутаєш фільтр — отримаєш адресу, яка нічого не віддасть.',
      },
      {
        type: 'table',
        head: ['Фільтр', 'Що на вході', 'Коли брати'],
        rows: [
          ['`asset_url`', 'імʼя файла з `assets/`', 'CSS, JS, шрифти, іконки теми — базовий випадок'],
          ['`file_url`', 'імʼя файла з адмінки (Content → Files)', 'те, що завантажив мерчант: PDF інструкції, банер, своє фото'],
          ['`global_asset_url`', 'імʼя файла з бібліотеки Shopify', 'службові бібліотеки Shopify'],
          ['`shopify_asset_url`', 'імʼя файла з бібліотеки Shopify', 'скрипти вітрини Shopify, напр. `option_selection.js`'],
          ['`image_url`', 'обʼєкт зображення (товару, колекції, `image_picker`)', 'фото товарів і контенту — із розмірами й кропом. Див. [зображення](/docs/shopify/images)'],
          ['`asset_img_url`', 'імʼя картинки з `assets/`', 'старіший спосіб для картинок теми — у новому коді беруть `image_url`'],
        ],
      },
      { type: 'h', text: 'Теги підключення' },
      {
        type: 'example',
        title: 'stylesheet_tag, script_tag, preload_tag',
        template: `{{ 'base.css' | asset_url | stylesheet_tag }}
{{ 'print.css' | asset_url | stylesheet_tag: 'print' }}
{{ 'cart.js' | asset_url | script_tag }}
{{ 'inter-400.woff2' | asset_url | preload_tag: as: 'font', type: 'font/woff2', crossorigin: 'anonymous' }}`,
        note: 'Кожен із цих фільтрів бере **адресу**, а не імʼя файла, — тому вони завжди йдуть у ланцюжку після `asset_url`. `stylesheet_tag` другим аргументом приймає `media` (тут `print`) і має ще параметр `preload`. `preload_tag` без параметра `as` не має сенсу — браузер не знатиме пріоритет ресурсу.',
      },
      {
        type: 'note',
        tone: 'warn',
        title: 'script_tag не вміє defer',
        text: 'Він віддає простий `<script src … type="text/javascript">` — блокуючий. Для теми, де важить швидкість, це неприйнятно: такий скрипт зупиняє парсинг HTML. Тому сучасні теми `script_tag` майже не використовують, а пишуть тег руками, лишаючи фільтру тільки адресу. `preload_tag` теж не панацея: він піднімає пріоритет одного ресурсу **за рахунок усіх інших**, тож прелоадять хіба що шрифт і hero-зображення першого екрана.',
      },
      {
        type: 'example',
        title: 'Як підключають скрипти насправді',
        template: `<script src="{{ 'product-form.js' | asset_url }}" defer="defer"></script>
<script src="{{ 'cart-drawer.js' | asset_url }}" type="module"></script>`,
        view: 'html',
        note: '`defer` — скрипт качається паралельно з парсингом і виконується перед `DOMContentLoaded`, зберігаючи порядок. `type="module"` уже має відкладену семантику, тому `defer` йому не потрібен. `async` у темах беруть рідко: він виконується щойно завантажився, тобто порядок непередбачуваний — годиться лише для повністю незалежного скрипта на кшталт аналітики.',
      },
      { type: 'h', text: 'Чотири способи додати CSS і JS' },
      {
        type: 'table',
        head: ['Спосіб', 'Куди потрапляє', 'Liquid усередині', 'Для чого'],
        rows: [
          ['Файл у `assets/` + `stylesheet_tag`', 'окремий запит, кешується CDN', '—', 'основний обсяг стилів і скриптів'],
          ['`{% stylesheet %}` / `{% javascript %}`', 'спільний бандл теми, віддається через `content_for_header`', '**не виконується**', 'невеликий шматок, що логічно належить саме цій секції або блоку'],
          ['`{% style %}`', 'інлайновий `<style data-shopify>` на місці', 'виконується', 'значення з налаштувань: CSS-змінні, `#shopify-section-{{ section.id }}`'],
          ['`<style>` руками', 'інлайновий тег', 'виконується', 'майже ніколи — `{% style %}` робить те саме й позначає тег як свій'],
        ],
      },
      {
        type: 'example',
        title: 'stylesheet і javascript на місці не друкують нічого',
        template: `[{% stylesheet %}
  .card { border-radius: var(--card-radius); }
{% endstylesheet %}][{% javascript %}
  console.log('привіт з секції')
{% endjavascript %}]`,
        note: 'Дві порожні дужки — і це правильно. Вміст цих тегів Shopify збирає з усіх секцій, блоків і сніпетів у спільні бандли теми й віддає їх через `content_for_header` у `<head>`. Тег такий **один на файл**: два `{% stylesheet %}` в одній секції — помилка.',
      },
      {
        type: 'note',
        tone: 'warn',
        title: 'Усередині stylesheet і javascript Liquid не працює',
        text: 'Це не «спрацює, але погано» — вміст просто не рендериться як Liquid, і `{{ section.settings.color }}` поїде в CSS текстом, ламаючи правило. Офіційна довідка окремо попереджає, що Liquid усередині цих тегів дає синтаксичні помилки. Потрібне значення з налаштувань — віддай його окремим `{% style %}` як CSS-змінну, а в бандлі користуйся `var(--…)`. Той самий прийом, що й для [налаштувань теми](/docs/shopify/theme-settings).',
      },
      {
        type: 'example',
        title: 'Правильний місток: {% style %} дає змінні, статичний CSS їх споживає',
        data: { section: { id: 'template--1__featured', settings: { columns: 4, accent: '#0e8f8b' } } },
        template: `{% style %}
  #shopify-section-{{ section.id }} {
    --grid-columns: {{ section.settings.columns }};
    --grid-accent: {{ section.settings.accent }};
  }
{% endstyle %}

{% comment %} а це вже їде у спільний бандл — без жодного Liquid {% endcomment %}
{% stylesheet %}
  .featured__grid {
    display: grid;
    grid-template-columns: repeat(var(--grid-columns), 1fr);
    border-color: var(--grid-accent);
  }
{% endstylesheet %}`,
        note: 'Динаміка — мінімальний інлайновий шматок, привʼязаний до `section.id`. Статика — кешований бандл, однаковий для всіх сторінок і всіх мерчантів. Це і є канонічний поділ: **Liquid керує змінними, CSS керує виглядом**.',
      },
      { type: 'h', text: '.liquid-асети: чому їх уникають' },
      {
        type: 'code',
        lang: 'liquid',
        title: 'assets/theme.css.liquid — і посилання на нього',
        code: `/* assets/theme.css.liquid */
.button {
  background: {{ settings.colors_accent }};
  border-radius: {{ settings.card_radius }}px;
}

{% comment %} у лейауті розширення .liquid НЕ пишуть {% endcomment %}
{{ 'theme.css' | asset_url | stylesheet_tag }}`,
      },
      {
        type: 'p',
        text: 'Будь-який файл у `assets/` можна назвати з додатковим розширенням `.liquid` — і Shopify пропустить його через рушій перед віддачею. Працює, і в старих темах так робили з CSS постійно. Але ціна велика:',
      },
      {
        type: 'list',
        items: [
          '**Кешування страждає.** Файл перестає бути простою статикою: його вміст залежить від налаштувань магазину, тож звичайного «раз завантажив і забув» уже не виходить.',
          '**Збірка й лінтери сліпнуть.** Це більше не валідний CSS або JS: ні мініфікатор, ні автопрефіксер, ні редактор із підсвіткою не розуміють `{{ }}` посеред правила.',
          '**Помилку видно пізно.** Одруківка в Liquid усередині CSS не впаде на збірці — вона тихо зламає одне правило на проді.',
          '**Є краща заміна.** Усе, заради чого брали `.css.liquid`, покриває `{% style %}` з CSS-змінними: динаміка лишається інлайновою і мінімальною, а сам CSS — статичним.',
        ],
      },
      {
        type: 'note',
        tone: 'warn',
        title: 'Sass у темах — спадок',
        text: 'Асети `.scss.liquid` трапляються в старих темах, бо колись Shopify компілював Sass на своєму боці. У новій темі на це не розраховують: препроцесор ганяють локально й кладуть у `assets/` уже готовий `.css`. Побачив `.scss.liquid` у проєкті — це маркер віку теми, а не стилю роботи.',
      },
      { type: 'h', text: 'CDN і версіонування' },
      {
        type: 'p',
        text: 'Асети віддає CDN Shopify — розподілений, із довгим кешем. Щоб довгий кеш не став пасткою, `asset_url` дописує до адреси параметр `?v=…`: змінився файл — змінилось значення, змінилась адреса, браузер качає заново. Тому cache-busting у темі робити **не треба** і не можна ламати: дописувати свій `?v=` чи чистити чужий — значить або назавжди зафіксувати стару версію, або щоразу скидати кеш.',
      },
      {
        type: 'p',
        text: 'Адреси протокол-відносні (`//cdn.shopify.com/…`) — браузер підставить той самий протокол, що й у сторінки. І ще одне правило того ж роду: **не зашивай домен CDN руками**. Він може змінитись, у нього своя структура шляхів із номером теми, а превʼю й публікована тема — це різні номери. Єдиний правильний спосіб дістати адресу асета — фільтр.',
      },
      {
        type: 'note',
        tone: 'shopify',
        title: 'Як це виглядає в Dawn',
        text: 'Dawn ріже CSS на дрібні файли з говорильними префіксами: `base.css` у лейауті, `component-*.css` — під компоненти, `section-*.css` — під секції. Кожна секція підключає лише свої файли, тож сторінка не тягне стилі того, чого на ній немає. Скрипти підключені вручну з `defer="defer"`, а не через `script_tag`. Шрифти йдуть через `font_face` із CDN Shopify, і прелоадиться з них дуже небагато.',
      },
      {
        type: 'note',
        tone: 'tip',
        text: 'Фото товарів і контенту в `assets/` не кладуть — вони живуть у Shopify як обʼєкти зображень, і для них є `image_url` із `width`, `height`, `crop`, `format` та `quality`. Асет — це графіка **інтерфейсу**: іконка, лого-заглушка, патерн фону. Деталі — на сторінці [зображення](/docs/shopify/images).',
      },
      {
        type: 'note',
        tone: 'interview',
        title: 'На співбесіді: «Як підключити CSS і JS у темі?»',
        text: '«Файл кладу в `assets/`, адресу беру фільтром `asset_url` — ніколи не зашиваю шлях до CDN, бо в адресі є номер теми й параметр версії для cache-busting. Для стилів `{{ \'base.css\' | asset_url | stylesheet_tag }}`. Для скриптів `script_tag` не беру: він віддає блокуючий тег без `defer`, тому пишу `<script src="{{ \'cart.js\' | asset_url }}" defer="defer">` руками. Динамічні значення з налаштувань віддаю окремим `{% style %}` як CSS-змінні, щоб сам CSS лишався статичним і кешованим».',
      },
      {
        type: 'note',
        tone: 'interview',
        title: 'На співбесіді: «У чому різниця між {% stylesheet %} і {% style %}?»',
        text: 'Класична пара «на уважність». `{% stylesheet %}` — це CSS секції, блока чи сніпета, який Shopify збирає у спільний бандл теми й віддає через `content_for_header`; на місці він не друкує нічого, і Liquid усередині **не виконується**, тег один на файл. `{% style %}` — навпаки: друкує інлайновий `<style data-shopify>` прямо тут, і Liquid у ньому працює. Тому все динамічне — у `{% style %}`, зазвичай як CSS-змінні під `#shopify-section-{{ section.id }}`, а статика — у бандлі або окремим файлом з `assets/`.',
      },
    ],
  },
]
