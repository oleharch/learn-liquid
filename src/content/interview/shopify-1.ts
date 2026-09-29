import type { InterviewQA } from '../types'

/**
 * Питання про Liquid У SHOPIFY, частина 1: обʼєкти магазину й архітектура теми.
 * Інші частини — `shopify-2.ts` (секції, сніпети), `shopify-3.ts` (performance,
 * security, debugging, практика). Базова мова — `core-*.ts`.
 *
 * Ліміти й числа звірені з vendor/theme-liquid-docs і shopify.dev (вересень 2026).
 */

/* ═══════════════════════ objects ═══════════════════════ */

const objects: InterviewQA[] = [
  {
    id: 'qa-s-objects-01',
    topic: 'objects',
    level: 'junior',
    q: 'Які обʼєкти в Liquid доступні всюди, а які — лише на своїх сторінках? Що буде, якщо звернутись до `product` на головній?',
    short:
      'Обʼєкти в Shopify діляться на глобальні й сторінкові. Глобальні — `shop`, `cart`, `customer`, `settings`, `routes`, `request`, `linklists`, `collections`, `all_products` — доступні в будь-якому файлі теми. Сторінкові зʼявляються лише у своєму template: `product` — на сторінці product, `collection` — на колекції, `article` і `blog` — у блозі, `search` — у пошуку. На головній `product` — це просто `nil`: помилки не буде, output буде порожній, і саме тому такі баги тихі. Якщо product потрібен поза своєю сторінкою, його беруть із налаштування секції, з колекції або через `all_products` за handle.',
    blocks: [
      {
        type: 'example',
        title: 'Головна сторінка: глобальні є, `product` — ні',
        preset: 'shop',
        template:
          'Магазин: {{ shop.name }}\nШаблон: {{ template.name }}\nТовар: [{{ product.title }}]\n{% if product %}є товар{% else %}product — nil, і Liquid мовчить{% endif %}',
        note: 'Порожні квадратні дужки — це і є `nil` в output. Жодної помилки, жодного попередження.',
      },
      {
        type: 'table',
        head: ['Обʼєкт', 'Де доступний', 'Примітка'],
        rows: [
          ['`shop`, `settings`, `routes`, `request`, `linklists`', 'всюди', 'безпечні в layout, секціях, сніпетах'],
          ['`cart`', 'всюди', 'це cart поточної сесії, а не лише сторінка `/cart`'],
          ['`customer`', 'всюди', '`nil`, якщо customer не увійшов'],
          ['`product`', 'template `product`', 'поза ним — `nil`'],
          ['`collection`', 'template `collection`; також product, відкритий за адресою `/collections/x/products/y`', 'на «голій» адресі product — `nil`'],
          ['`article`, `blog`, `page`, `search`', 'свої template', 'поза ними — `nil`'],
          ['`section`, `block`', 'лише всередині файла секції / блока', 'сніпет, відрендерений із секції, теж бачить `section`; поза секцією — `nil`'],
        ],
      },
      {
        type: 'note',
        tone: 'warn',
        title: 'Пастка: секція «живе» на багатьох сторінках',
        text: 'В OS 2.0 ту саму секцію мерчант може додати в будь-який JSON template. Якщо секція мовчки спирається на `product`, на сторінці колекції вона відрендерить порожнечу. Або перевіряй `{% if product %}`, або обмеж секцію через `enabled_on` у схемі.',
      },
      {
        type: 'note',
        tone: 'tip',
        title: 'Що сказати, щоб виглядати сильніше',
        text: 'Згадай, що `template.name` і `request.page_type` дозволяють дізнатись, на якій ти сторінці, а обʼєкти Shopify — це **Drop** (ліниві обгортки над даними): властивості рахуються на момент звернення, тож саме звернення до `collection.products` чи `all_products[…]` коштує запиту, а не просто «читає поле».',
      },
    ],
    followUps: [
      {
        q: 'Як отримати конкретний product на головній сторінці?',
        a: 'Найчистіше — налаштування секції типу `product`: мерчант обирає його в редакторі, а Liquid одразу отримує обʼєкт. Якщо handle відомий наперед, є `all_products[\'handle\']`, але це ліміт у 20 унікальних handle на сторінку й крихка залежність від назви. Ще один шлях — узяти product із колекції, наприклад `collections[\'featured\'].products.first`.',
        to: '/interview?q=qa-s-objects-09',
      },
      {
        q: 'Чим `request.page_type` відрізняється від `template.name`?',
        a: '`request.page_type` каже, який тип сторінки обробляє Shopify — `product`, `collection`, `index`, `customers/account` — і не залежить від того, який файл її рендерить. `template.name` — імʼя типу template, а `template.suffix` — суфікс альтернативного, якщо він є. На звичайних сторінках вони збігаються, але для класів `body` і аналітики надійніше `request.page_type`, а на `template` спираються тоді, коли треба розрізнити саме альтернативні template.',
        to: '/docs/shopify/objects-overview',
      },
      {
        q: 'Чому `collection` буває доступний на сторінці product, а буває — ні?',
        a: 'Обʼєкт `collection` на сторінці product зʼявляється лише тоді, коли покупець прийшов за адресою виду `/collections/handle/products/handle` — Shopify памʼятає, з якої колекції відкрито product. За «голою» адресою `/products/handle` `collection` дорівнює `nil`. Тому хлібні крихти й посилання «попередній / наступний» мають перевіряти `{% if collection %}` і мати запасний варіант.',
        to: '/docs/shopify/collection-and-pagination',
      },
    ],
  },
  {
    id: 'qa-s-objects-02',
    topic: 'objects',
    level: 'junior',
    q: 'Чому `{{ product.price }}` виводить 64900, а не 649? Як правильно показувати ціни?',
    short:
      'Shopify зберігає і віддає в Liquid усі суми в найменших одиницях валюти — копійках, центах — як integer. Так уникають помилок округлення, які дає float. Тому `product.price` дорівнює 64900, і ділити його на сто руками не треба: для output є фільтри `money`, `money_with_currency`, `money_without_trailing_zeros`, які беруть формат із налаштувань магазину. Арифметику — знижку, суму, різницю — роблять теж у копійках, а `money` ставлять останнім у ланцюжку.',
    blocks: [
      {
        type: 'example',
        title: 'Одне число — чотири способи показати',
        preset: 'product',
        template:
          '{{ product.price }}\n{{ product.price | money }}\n{{ product.price | money_with_currency }}\n{{ product.price | money_without_trailing_zeros }}\n{{ product.price | money_without_currency }}',
        note: 'Формат (`{{amount}} ₴`) пісочниця бере з `shop.money_format` — у справжньому магазині він задається в адмінці, у налаштуваннях валюти.',
      },
      {
        type: 'example',
        title: 'Арифметика — в копійках, `money` — наприкінці',
        preset: 'product',
        template:
          '{% assign v = product.selected_or_first_available_variant %}\n{% assign saving = v.compare_at_price | minus: v.price %}\nЕкономія: {{ saving | money }}\nЗа три штуки: {{ v.price | times: 3 | money }}',
      },
      {
        type: 'note',
        tone: 'warn',
        title: 'Пастка',
        text: '`{{ product.price | divided_by: 100 }} ₴` — улюблений антипатерн. Ділення integer на integer у Liquid **цілочисельне**, тож 64950 перетвориться на 649 і копійки зникнуть. До того ж ти жорстко зашив символ валюти й формат — у магазині з кількома валютами це зламається першим.',
      },
      {
        type: 'note',
        tone: 'tip',
        title: 'Сильніша відповідь',
        text: 'Додай, що ціни приходять у **валюті показу** (presentment currency) поточного відвідувача, а для валют без дрібних одиниць — єни, вони — Shopify все одно дописує два розряди: 1000 єн у Liquid це `100000`. Тому «поділити на сто» — не універсальне правило, а `money` — універсальне.',
      },
    ],
    followUps: [
      {
        q: 'Як передати ціну в JavaScript, щоб відформатувати її там?',
        a: 'Передавай саме число в копійках — `{{ variant.price | json }}` у скрипті або в `data`-атрибуті, — а не готовий string від `money`. У JavaScript формат беруть із `shop.money_format`, виведеного один раз у layout, і застосовують тією ж логікою, що `money`: тоді ціна після перемикання варіанта виглядає так само, як серверна. Фільтр `json` тут не для краси — він ескейпить значення й не дає зламати синтаксис скрипта.',
        to: '/docs/shopify/liquid-and-js',
      },
      {
        q: 'Чим `money` відрізняється від `money_with_currency` і коли потрібен другий?',
        a: '`money` бере формат «HTML без валюти» з налаштувань магазину — зазвичай символ і сума, — а `money_with_currency` — формат «HTML з валютою», де ще стоїть код валюти на кшталт UAH. Другий потрібен там, де покупець може сплутати валюти: у магазині з кількома ринками, у підсумку cart, у листах. У картках колекції зазвичай досить `money`.',
        to: '/docs/shopify/money-filters',
      },
      {
        q: 'Де задається формат грошей магазину?',
        a: 'В адмінці, у налаштуваннях магазину в розділі валют: там два шаблони — з кодом валюти і без, — і саме їх читають `money_with_currency` і `money`. У Liquid поточний формат видно як `shop.money_format` і `shop.money_with_currency_format`. Тема цей формат не дублює: змінив мерчант шаблон в адмінці — усі ціни змінились самі.',
        to: '/docs/shopify/money-filters',
      },
    ],
  },
  {
    id: 'qa-s-objects-03',
    topic: 'objects',
    level: 'middle',
    q: 'Яка різниця між `product` і `variant`? І навіщо існує `selected_or_first_available_variant`, якщо є `selected_variant`?',
    short:
      'Product — це картка: назва, опис, фото, теги, опції. Купують не product, а variant — конкретну комбінацію опцій зі своєю ціною, артикулом, залишком і доступністю; навіть у product без опцій є один варіант «Default Title». У cart завжди йде id варіанта. `selected_variant` повертає варіант лише тоді, коли в адресі є `?variant=…`, інакше це `nil`. `selected_or_first_available_variant` завжди щось повертає: обраний, якщо він є, інакше перший доступний, а якщо недоступні всі — просто перший. Тому стартовий стан сторінки product будують на ньому.',
    blocks: [
      {
        type: 'example',
        title: 'Три властивості — три різні відповіді',
        preset: 'product',
        template:
          'selected_variant: [{{ product.selected_variant.title }}]\nfirst_available_variant: {{ product.first_available_variant.title }}\nselected_or_first_available_variant: {{ product.selected_or_first_available_variant.title }}\n\nproduct.price (найнижча серед варіантів): {{ product.price | money }}\n{% for v in product.variants %}\n{{ v.title }} — {{ v.price | money }}{% unless v.available %} — немає в наявності{% endunless %}\n{%- endfor %}',
        note: 'У пресеті в адресі немає `?variant=`, тому `selected_variant` порожній. `product.price` — це не «ціна product», а мінімум серед варіантів.',
      },
      {
        type: 'table',
        head: ['Властивість', 'Що повертає', 'Коли `nil`'],
        rows: [
          ['`product.selected_variant`', 'варіант з `?variant=ID` у адресі', 'завжди, коли параметра немає'],
          ['`product.first_available_variant`', 'перший доступний для купівлі', 'коли недоступні всі'],
          ['`product.selected_or_first_available_variant`', 'обраний → перший доступний → перший', 'практично ніколи'],
          ['`product.variants.first`', 'перший за порядком', 'ніколи, але він може бути розпроданий'],
        ],
      },
      {
        type: 'note',
        tone: 'warn',
        title: 'Пастка',
        text: 'Обраний варіант повертається **незалежно від доступності**. Якщо покупець прийшов за посиланням на розпроданий варіант, `selected_or_first_available_variant` віддасть саме його — тож кнопку «Купити» все одно треба вмикати через `variant.available`, а не вважати, що «first available» гарантує наявність.',
      },
      {
        type: 'note',
        tone: 'tip',
        title: 'Сильніша відповідь',
        text: 'Скажи, що «доступний» — це не лише залишок більше нуля: варіант доступний і тоді, коли для нього дозволено продаж у мінус (`inventory_policy: continue`) або облік залишків вимкнено. І що `product.has_only_default_variant` — правильний спосіб сховати перемикач у product без опцій, замість порівнювати назву з «Default Title».',
      },
    ],
    followUps: [
      {
        q: 'Що саме відправляє форма `{% form \'product\' %}` — id product чи варіанта?',
        a: 'Форма product відправляє на `/cart/add` поле `id` зі значенням id варіанта — саме варіант і кладуть у cart, а не product. Тому прихований `input name="id"` у формі треба оновлювати, коли покупець перемикає опції, інакше додасться не той варіант. Кількість іде полем `quantity`, а довільні дані — полями `properties[Назва]`, які стають `line_item.properties`.',
        to: '/docs/shopify/forms',
      },
      {
        q: 'Як дізнатись, що в product лише один варіант «за замовчуванням»?',
        a: 'Є властивість `product.has_only_default_variant`: вона `true`, коли в product немає опцій, тобто Shopify сам створив єдиний варіант «Default Title». Порівнювати назву варіанта з цим текстом не варто — це деталь реалізації, яка до того ж не перекладається. За цією властивістю ховають перемикач опцій і одразу беруть `product.variants.first`.',
        to: '/docs/shopify/product-and-variant',
      },
      {
        q: 'Де зберігається фото варіанта і що буде, якщо його немає?',
        a: 'У варіанта є `variant.image` — те саме, що `variant.featured_image`, — і `variant.featured_media`, перше медіа, привʼязане до варіанта. Якщо мерчант фото варіанту не призначив, ці властивості дають `nil`, і тема має відкотитись до `product.featured_image` або першого елемента `product.media`. Тому в перемикачі варіантів картинку міняють лише тоді, коли в обраного варіанта вона є.',
        to: '/docs/shopify/images',
      },
    ],
  },
  {
    id: 'qa-s-objects-04',
    topic: 'objects',
    level: 'middle',
    q: 'У колекції 300 товарів. Скільки з них виведе `{% for product in collection.products %}` і що з цим робити?',
    short:
      'Пʼятдесят. Цикл `for` у Shopify обмежений пʼятдесятьма ітераціями, і `collection.products` без pagination віддає лише перші пʼятдесят. Щоб показати решту, цикл загортають у `{% paginate collection.products by N %}` — тоді всередині тега `collection.products` уже означає поточну сторінку, а обʼєкт `paginate` дає номери сторінок і посилання. Важливо, що `paginate` впливає не лише на output, а й на те, скільки даних Shopify взагалі дістає з бази: `limit` у циклі цього не робить.',
    blocks: [
      {
        type: 'example',
        title: 'Сторінка по два product',
        preset: 'collection',
        template:
          '{% paginate collection.products by 2 %}\n  {%- for product in collection.products %}\n  {{ product.title }}\n  {%- endfor %}\n\n  Сторінка {{ paginate.current_page }} з {{ paginate.pages }}, усього товарів: {{ paginate.items }}\n  {{ paginate | default_pagination }}\n{% endpaginate %}',
        note: 'Усередині `paginate` той самий вираз `collection.products` повертає вже **сторінку**, а не всю колекцію. Номер сторінки Shopify бере з `?page=` в адресі.',
      },
      {
        type: 'table',
        head: ['Було', 'Стало'],
        rows: [
          ['`{% for p in collection.products limit: 8 %}` — вивели 8, але Shopify однаково дістав до 50', '`{% paginate collection.products by 8 %}` + цикл — дістали рівно 8, навігацію можна не показувати'],
          ['`{% for p in collection.products %}` у колекції на 300 товарів — мовчки 50', '`paginate` + `default_pagination` або власна розмітка з `paginate.parts`'],
        ],
      },
      {
        type: 'note',
        tone: 'warn',
        title: 'Пастка',
        text: '`collection.products.size` усередині чи поза `paginate` — це розмір **того, що завантажено**, а не колекції. Скільки в колекції product насправді — `collection.products_count` (з урахуванням фільтрів) і `collection.all_products_count` (без них).',
      },
      {
        type: 'note',
        tone: 'tip',
        title: 'Сильніша відповідь',
        text: 'Назви межі: довідка тега дозволяє розмір сторінки від 1 до 250, а гортати можна не далі 25 000-го елемента — для більших масивів їх треба спершу звузити фільтрами. І поясни, що велика сторінка — це не «зручніше», а важчий HTML і довший рендер: у реальних темах беруть 16–48 карток.',
      },
    ],
    followUps: [
      {
        q: 'Які ще масиви, крім `collection.products`, можна пагінувати?',
        a: 'Довідка тега перелічує їх явно: `blog.articles`, `article.comments`, `collections`, `pages`, `product.variants`, `search.results`, `customer.orders`, `customer.addresses`, `metaobject_definition.values`, а також налаштування `product_list`, `collection_list` і `article_list`. Масив, зібраний руками через `split` чи `map`, пагінувати не можна — його просто ріже ліміт циклу. Тому великі списки тримають у тих обʼєктах, які Shopify вміє гортати.',
        to: '/docs/shopify/collection-and-pagination',
      },
      {
        q: 'Як зробити «Показати ще» без перезавантаження сторінки?',
        a: 'На сервері лишається звичайна pagination, а на клієнтському боці кнопка запитує наступну сторінку через Section Rendering API: `/collections/handle?page=2&section_id=main-collection`. У відповідь приходить HTML лише цієї секції, з якого JavaScript вирізає картки й дописує в сітку. Так логіка рендеру не дублюється в JS, а адресу з `?page=` оновлюють через History API, щоб «назад» працювало.',
        to: '/interview?q=qa-s-sections-10',
      },
      {
        q: 'Чи можна мати два незалежні `paginate` на одній сторінці?',
        a: 'Тегів на сторінці може бути кілька, але всі вони за замовчуванням читають той самий параметр `?page=`, тож гортання одного списку зрушить і другий — обʼєкт `paginate` навіть віддає імʼя цього параметра як `paginate.page_param`. На практиці другий список або не пагінують узагалі, або довантажують окремо через Section Rendering API зі своїм параметром. Два повноцінні незалежні блоки на одній сторінці — рідкість і зазвичай ознака, що сторінку варто розділити.',
        to: '/docs/shopify/collection-and-pagination',
      },
    ],
  },
  {
    id: 'qa-s-objects-05',
    topic: 'objects',
    level: 'junior',
    q: 'Розкажи про обʼєкт `cart`: що таке `line_item` і чим `cart.item_count` відрізняється від `cart.items.size`?',
    short:
      'Обʼєкт `cart` — глобальний, це cart поточної сесії, доступний на будь-якій сторінці. У ньому масив `items`, кожен елемент — `line_item`: line item (позиція в cart), тобто варіант плюс кількість, зі своїми цінами, властивостями й посиланням на product. `cart.items.size` — скільки в cart line items, а `cart.item_count` — сума кількостей: три line items по дві штуки дадуть три й шість. Суми теж різні: `original_price` — до знижок, `final_price` — після, а поля з `line` у назві — те саме, помножене на кількість.',
    blocks: [
      {
        type: 'example',
        title: 'Line items у cart',
        preset: 'cart',
        template:
          '{% for item in cart.items -%}\n{{ item.product.title }}{% if item.variant_title %} ({{ item.variant_title }}){% endif %} × {{ item.quantity }} = {{ item.final_line_price | money }}\n{%- if item.total_discount > 0 %} (знижка {{ item.total_discount | money }}){% endif %}\n{% endfor %}\nРядків: {{ cart.items.size }}, штук: {{ cart.item_count }}\nРазом: {{ cart.total_price | money }}',
      },
      {
        type: 'table',
        head: ['Поле `line_item`', 'Що це'],
        rows: [
          ['`original_price` / `final_price`', 'ціна за одиницю до / після знижок на line item'],
          ['`original_line_price` / `final_line_price`', 'те саме × `quantity`'],
          ['`total_discount`', 'сума знижок на line item'],
          ['`key`', 'унікальний ключ line item — саме ним, а не id варіанта, змінюють кількість через Cart API'],
          ['`properties`', 'довільні пари «назва — значення» (гравіювання, побажання), зібрані формою product'],
          ['`product`, `variant`', 'повні обʼєкти — звідси беруть фото, metafield, теги'],
        ],
      },
      {
        type: 'note',
        tone: 'warn',
        title: 'Пастка',
        text: 'Один варіант може лежати в cart **двома line items** — якщо в них різні `properties` або різні плани продажу. Тому лічильник «скільки цього варіанта в cart» рахують фільтром `item_count_for_variant`, а змінюють line item за `key`.',
      },
      {
        type: 'note',
        tone: 'tip',
        title: 'Сильніша відповідь',
        text: 'Скажи, що Liquid рендерить cart **на момент запиту сторінки**. Усе, що відбувається після натискання «Додати» без перезавантаження, — це вже Cart AJAX API (`/cart/add.js`, `/cart/change.js`) плюс перемальовування розмітки через Section Rendering API. Властивості, назва яких починається з підкреслення, прийнято не показувати покупцеві — так теми ховають службові дані.',
      },
    ],
    followUps: [
      {
        q: 'Чим `cart.attributes` відрізняється від `line_item.properties`?',
        a: '`cart.attributes` — пари «назва — значення» на рівні всього cart: нотатка про доставку, вибір подарункового пакування, бажана дата. `line_item.properties` привʼязані до конкретного line item — гравіювання саме на цій штуці. Обидва потрапляють у замовлення, але атрибути — один набір на замовлення, а properties — на кожен line item, і саме різні properties роблять з одного варіанта два line items.',
        to: '/docs/shopify/cart',
      },
      {
        q: 'Як оновити лічильник у шапці після додавання product без перезавантаження?',
        a: 'Після `POST /cart/add.js` тема нічого не перераховує в Liquid — сторінка вже відрендерена. Найчистіший шлях — передати в запит поле `sections` з іменами секцій, скажімо `cart-icon-bubble,cart-drawer`: Cart AJAX API поверне разом з cart уже відрендерений HTML цих секцій, і його просто підставляють у DOM. Альтернатива — прочитати `item_count` із JSON-відповіді й оновити число руками, але тоді розмітка лічильника живе у двох місцях.',
        to: '/interview?q=qa-s-sections-10',
      },
      {
        q: 'Де в `cart` видно знижки на весь cart, а не на line item?',
        a: 'У `cart.cart_level_discount_applications` — це масив discount applications, застосованих до cart цілком, наприклад промокод на все замовлення; у кожної є `title` і `total_allocated_amount`. Усі знижки разом, з line items включно, лежать у `cart.discount_applications`, а їхня сума — `cart.total_discount`. На рівні line item те саме дають `line_item.line_level_discount_allocations`.',
        to: '/docs/shopify/cart',
      },
    ],
  },
  {
    id: 'qa-s-objects-06',
    topic: 'objects',
    level: 'junior',
    q: 'Як у темі зрозуміти, що покупець увійшов в акаунт? Що повертає `customer` для гостя?',
    short:
      'Для гостя глобальний обʼєкт `customer` дорівнює `nil`, тож перевірка входу — це просто `{% if customer %}`. Коли customer увійшов, в обʼєкті є імʼя, email, теги, кількість замовлень, адреси й самі замовлення. На цьому будують привітання в шапці, посилання «Увійти» або «Кабінет», ціни чи блоки для певних тегів — наприклад, для оптових покупців. Головне памʼятати, що звернення до властивостей `nil` не ламає сторінку, а дає порожній string, тому без перевірки вийде «Привіт, !».',
    blocks: [
      {
        type: 'example',
        title: 'Гість',
        preset: 'shop',
        template:
          '{% if customer %}\n  Привіт, {{ customer.first_name }}!\n{% else %}\n  <a href="{{ routes.account_login_url }}">Увійти</a>\n{% endif %}\nБез перевірки: «Привіт, {{ customer.first_name }}!»',
        note: 'У пресеті `shop` обʼєкта `customer` немає — як у гостя. Другий рядок output показує, що буває без `if`.',
      },
      {
        type: 'example',
        title: 'Customer увійшов',
        preset: 'customer',
        template:
          '{% if customer %}\n  Привіт, {{ customer.first_name }}! Замовлень: {{ customer.orders_count }}, витрачено {{ customer.total_spent | money }}.\n  {%- if customer.tags contains \'wholesale\' %}\n  Для вас діють оптові ціни.\n  {%- endif %}\n{% endif %}',
      },
      {
        type: 'note',
        tone: 'warn',
        title: 'Пастка',
        text: 'Сховати блок через `{% if customer.tags contains \'wholesale\' %}` — це **показ**, а не захист. Оптову ціну, приховану лише в темі, можна отримати напряму: дані product доступні через `/products/handle.js`. Справжні B2B-ціни — це каталоги Shopify B2B або знижки на рівні платформи, а не Liquid.',
      },
      {
        type: 'note',
        tone: 'tip',
        title: 'Сильніша відповідь',
        text: 'Згадай, що посилання на вхід і кабінет беруть із `routes` (`routes.account_login_url`, `routes.account_url`), а не пишуть руками: з новими акаунтами покупців і мовними префіксами адреса інша. І що персоналізований output робить сторінку гіршим кандидатом на кеш — тому важку персоналізацію краще довантажувати окремо.',
      },
    ],
    followUps: [
      {
        q: 'Як показати блок лише customer із певним тегом і чому це не захист?',
        a: '`{% if customer.tags contains \'wholesale\' %}` — для гостя `customer` це `nil`, тож умова спокійно дасть `false`, і окремої перевірки входу не треба. Але це лише приховування розмітки: ціни й дані product відкриті через `/products/handle.js` і Storefront API незалежно від того, що показала тема. Справжнє обмеження — B2B-каталоги, знижки на рівні платформи або закритий магазин; Liquid лише вирішує, що намалювати.',
        to: '/docs/shopify/customer',
      },
      {
        q: 'Чи доступний `customer` на сторінці замовлення й у листах?',
        a: 'На сторінках акаунта — `customers/account`, `customers/order` — `customer` доступний як і всюди, а саме замовлення приходить окремим обʼєктом `order`. Листи сповіщень — інший контекст: там теж Liquid, але свій набір обʼєктів, і немає ні теми, ні `settings`, ні `routes`. Тому код із теми в шаблон листа не переносять один в один.',
        to: '/docs/shopify/customer',
      },
      {
        q: 'Як вивести останні замовлення customer?',
        a: 'Через `customer.orders` — масив обʼєктів `order` з номером, датою, статусом і сумою; у кожного є `order.customer_url` для посилання на сторінку замовлення. Довідка радить гортати їх тегом `paginate`, і за раз показати можна не більше 20. Останнє замовлення окремо доступне як `customer.last_order`.',
        to: '/docs/shopify/customer',
      },
    ],
  },
  {
    id: 'qa-s-objects-07',
    topic: 'objects',
    level: 'middle',
    q: 'Що таке metafield і як його вивести в темі? Навіщо там `.value`?',
    short:
      'Metafield (метаполе) — це додаткове типізоване поле, яке можна причепити до product, варіанта, колекції, customer, сторінки, магазину. Звертаються до нього через простір імен і ключ: `product.metafields.custom.care_guide`. Це повертає не значення, а обʼєкт metafield з властивостями `type` і `value`, і саме `.value` віддає дані в правильному типі: число, boolean, дату, product, файл чи масив для спискових типів. Створити metafield з Liquid не можна — лише прочитати. Перед виведенням завжди перевіряють на `blank`, бо в більшості product поле буде порожнє.',
    blocks: [
      {
        type: 'example',
        title: 'Список, число і відсутнє поле',
        data: {
          product: {
            title: 'Шампунь із кератином',
            metafields: {
              custom: {
                care_steps: { type: 'list.single_line_text_field', value: ['Шампунь', 'Маска', 'Олійка'] },
                ph: { type: 'number_decimal', value: 5.5 },
              },
            },
          },
        },
        template:
          '{% assign steps = product.metafields.custom.care_steps %}\n{% if steps.value != blank %}\n  Догляд ({{ steps.type }}): {{ steps.value | join: \' → \' }}\n{% endif %}\npH: {{ product.metafields.custom.ph.value }}\nНемає такого поля: [{{ product.metafields.custom.shelf_life.value }}]',
        note: 'У пісочниці metafield — звичайний JSON тієї самої форми (`type` + `value`). Відсутнє поле — `nil`, output порожній.',
      },
      {
        type: 'table',
        head: ['Тип metafield', 'Що повертає `.value`'],
        rows: [
          ['`single_line_text_field`, `multi_line_text_field`', 'string'],
          ['`number_integer`, `number_decimal`', 'число'],
          ['`boolean`', '`true` / `false`'],
          ['`date`, `date_time`', 'дата як string — форматуй фільтром `date`'],
          ['`product_reference`, `collection_reference`, `page_reference`', 'повноцінний обʼєкт: `….value.title`, `….value.url`'],
          ['`file_reference`', 'файл або медіа — картинку можна віддати в `image_url`'],
          ['`rich_text_field`', 'структура форматованого тексту — виводь через `metafield_tag`'],
          ['`list.*`', 'масив — перебирай циклом'],
          ['`metaobject_reference`', 'запис metaobject з власними полями'],
        ],
      },
      {
        type: 'code',
        lang: 'liquid',
        title: 'У справжній темі: готові фільтри для output',
        code: '{{ product.metafields.custom.care_guide | metafield_tag }}\n{{ product.metafields.custom.ph | metafield_text }}\n\n{% for item in product.metafields.custom.pairs_with.value %}\n  {% render \'card-product\', product: item %}\n{% endfor %}',
      },
      {
        type: 'note',
        tone: 'warn',
        title: 'Пастка',
        text: 'Ключі `size`, `first` і `last` збігаються з вбудованими властивостями Liquid. Для них пиши квадратні дужки: `product.metafields.custom["size"]`, інакше на відсутньому полі отримаєш кількість metafield у просторі імен замість порожнього значення.',
      },
      {
        type: 'note',
        tone: 'tip',
        title: 'Сильніша відповідь',
        text: 'Скажи, що в OS 2.0 metafield можна **підʼєднувати до налаштувань секцій як динамічні джерела** просто в редакторі теми — без жодного коду. Тому перш ніж писати `product.metafields…` у секції, варто спитати себе, чи не краще дати мерчанту звичайне налаштування, яке він сам привʼяже до metafield.',
      },
    ],
    followUps: [
      {
        q: 'Чим metafield-посилання на product краще за handle, збережений у текстовому полі?',
        a: 'Тип `product_reference` тримається за id, тому переживає перейменування product і зміну handle, а `.value` одразу дає обʼєкт product — без `all_products` і його ліміту у 20 handle на сторінку. Видалений product такий metafield віддає порожнім, і це легко перевірити на `blank`. Ще й в адмінці мерчант обирає product через пошук, а не вписує handle руками з помилками.',
        to: '/docs/shopify/metafields',
      },
      {
        q: 'Як перебрати спискове metafield, якщо в ньому більше 50 елементів?',
        a: '`.value` спискового metafield — звичайний масив, а цикл `for` у Shopify зупиняється на 50 ітераціях, і в переліку масивів, які вміє гортати `paginate`, списків metafield немає. Тож 50 — практична стеля одного циклу; далі — кілька циклів з `offset` або перегляд самого рішення. Список на сотні елементів у metafield — привід винести дані в колекцію або metaobject, чиї `values` пагінуються.',
        to: '/docs/shopify/metafields',
      },
      {
        q: 'Що таке динамічні джерела в редакторі теми?',
        a: 'Це можливість підʼєднати налаштування секції чи блока до metafield або стандартної властивості ресурсу прямо в Theme Editor: замість статичного тексту в полі «Підзаголовок» мерчант обирає, скажімо, `product.metafields.custom.subtitle`. Значення тоді своє для кожного product, а секція лишається універсальною. У JSON template це записується як Liquid-вираз у значенні налаштування, і саме тому секція про це навіть не знає.',
        to: '/docs/shopify/sections-and-schema',
      },
    ],
  },
  {
    id: 'qa-s-objects-08',
    topic: 'objects',
    level: 'middle',
    q: 'Що таке metaobject і коли він кращий за metafield?',
    short:
      'Metaobject (метаобʼєкт) — це власний тип даних магазину: ти описуєш визначення з набором полів, наприклад «Інгредієнт» із назвою, описом і фото, а мерчант створює записи цього типу в адмінці. Metafield додає одне поле до наявної сутності, а metaobject — це окрема сутність, яку можна перевикористати: один запис «Кератин» привʼязати до двадцяти product через metafield-посилання. У Liquid до запису звертаються через `metaobjects.тип.handle`, перебирають через `metaobjects.тип.values`, а поля читають так само — через `.value`. Якщо ввімкнути для визначення веб-сторінки, кожен запис отримує власну адресу й template `metaobject`.',
    blocks: [
      {
        type: 'code',
        lang: 'liquid',
        title: 'Три способи дістатись до записів',
        code: '{% comment %} 1. Конкретний запис за типом і handle {% endcomment %}\n{{ metaobjects.ingredients.keratin.title.value }}\n\n{% comment %} 2. Усі записи типу (цикл — до 50, далі paginate) {% endcomment %}\n{% for ingredient in metaobjects.ingredients.values %}\n  {{ ingredient.title.value }}\n{% endfor %}\n\n{% comment %} 3. Записи, привʼязані до товару списковим метаполем {% endcomment %}\n{% for ingredient in product.metafields.custom.ingredients.value %}\n  <h3>{{ ingredient.title.value }}</h3>\n  {{ ingredient.photo.value | image_url: width: 400 | image_tag }}\n{% endfor %}',
      },
      {
        type: 'table',
        head: ['', 'Metafield', 'Metaobject'],
        rows: [
          ['Що це', 'одне додаткове поле сутності', 'окрема сутність із набором полів'],
          ['Де живе', 'на product, варіанті, колекції, сторінці…', 'сам по собі, у розділі «Контент»'],
          ['Перевикористання', 'значення дублюється в кожному product', 'один запис — багато посилань'],
          ['Приклад', 'pH шампуню, обʼєм, інструкція', 'інгредієнти, майстри, точки продажу, таблиці розмірів'],
          ['Власна сторінка', 'ні', 'так, якщо ввімкнути веб-сторінки для визначення'],
        ],
      },
      {
        type: 'note',
        tone: 'warn',
        title: 'Пастка',
        text: 'Якщо для визначення ввімкнено публікацію, запис у статусі чернетки для Liquid **не існує**: звернення за handle дасть `nil`, а цикл його пропустить. «Я ж створив запис, а він не виводиться» — найчастіше саме це.',
      },
      {
        type: 'note',
        tone: 'tip',
        title: 'Сильніша відповідь',
        text: 'Сформулюй критерій вибору: якщо дані **повторюються між product** або мають **кілька повʼязаних полів** — це metaobject; якщо це одна характеристика конкретного product — metafield. І додай, що metaobject доступний як тип налаштування секції (`metaobject`, `metaobject_list`), тож мерчант може вибирати записи прямо в редакторі.',
      },
    ],
    followUps: [
      {
        q: 'Як вивести на сторінці product блок «Склад», якщо інгредієнти — metaobject?',
        a: 'На product заводять metafield типу `list.metaobject_reference` на визначення «Інгредієнт», а в секції беруть `product.metafields.custom.ingredients.value` — це вже масив записів metaobject. Далі звичайний цикл, і поля кожного запису читають через `.value`: `ingredient.title.value`, `ingredient.photo.value`. Перед циклом перевіряють на `blank`, бо в частини product список порожній.',
        to: '/docs/shopify/metafields',
      },
      {
        q: 'Що буде з темою, якщо мерчант видалить запис, на який посилаються product?',
        a: 'Помилки не буде — посилання просто перестане резолвитись: у списковому metafield такого запису вже не буде, а одиничне посилання віддасть порожнє значення. Тому код завжди пишуть із перевіркою на `blank` і не покладається на те, що в списку рівно стільки елементів, скільки було. Неприємно інше: попередження ніхто не отримає, і зникнення помітять уже на сторінці.',
        to: '/docs/shopify/metafields',
      },
      {
        q: 'Чим це краще за окрему сторінку чи блог для такого контенту?',
        a: 'Сторінка й стаття — це один текст без структури: у них немає окремих типізованих полів «назва», «роль», «фото», які можна виводити в різних місцях по-різному. Metaobject має схему, валідацію і привʼязується до product через metafield, тож той самий запис зʼявляється на двадцяти картках і редагується в одному місці. А якщо йому потрібна власна адреса — вмикають веб-сторінки для визначення, і він отримує template `metaobject`.',
        to: '/docs/shopify/metafields',
      },
    ],
  },
  {
    id: 'qa-s-objects-09',
    topic: 'objects',
    level: 'middle',
    q: 'Навіщо потрібен `all_products` і які в нього обмеження?',
    short:
      'Обʼєкт `all_products` дозволяє дістати будь-який product магазину за handle з будь-якого місця теми: `all_products[\'keratin-shampoo\']`. Це зручно, коли handle прийшов із тексту, metafield старого типу чи налаштування. Але є жорстке обмеження: на одній сторінці можна звернутись не більше ніж до двадцяти унікальних handle, решта поверне порожній результат. До того ж перебрати `all_products` циклом не можна — це не список, а доступ за ключем. У сучасній темі його майже завжди замінюють налаштуваннями типу `product` і `product_list` або metafield-посиланнями, які одразу повертають обʼєкт product.',
    blocks: [
      {
        type: 'example',
        title: 'Product за handle',
        preset: 'all',
        template:
          '{% assign oil = all_products[\'ends-oil\'] %}\n{{ oil.title }} — {{ oil.price | money }}\n\n{% assign ghost = all_products[\'no-such-handle\'] %}\nНеіснуючий handle: [{{ ghost.title }}]',
        note: 'Неіснуючий handle не дає помилки. У Shopify замість `nil` повертається порожня заглушка (`EmptyDrop`), яка в `if` поводиться як truthy, — тому наявність перевіряй порівнянням: `{% if oil != empty %}` або `oil.title != blank`.',
      },
      {
        type: 'table',
        head: ['Задача', 'Замість `all_products`'],
        rows: [
          ['Мерчант обирає product для банера', 'налаштування секції типу `product` — віддає обʼєкт, у редакторі є пошук'],
          ['Ручна добірка з 8 позицій', 'налаштування `product_list`'],
          ['«З цим купують» для конкретного product', 'metafield `list.product_reference`'],
          ['Усі product магазину', '`collections.all.products` із `paginate`'],
        ],
      },
      {
        type: 'note',
        tone: 'warn',
        title: 'Пастка',
        text: 'Ліміт у двадцять handle — **на сторінку**, а не на секцію. Дві секції по дванадцять звернень — і друга вже виводить дірки. Помилки при цьому немає, тож баг знаходять мерчанти, а не розробник.',
      },
      {
        type: 'note',
        tone: 'tip',
        title: 'Сильніша відповідь',
        text: 'Поясни, що handle — крихке посилання: мерчант перейменував product, handle змінився — звʼязок зник. Metafield-посилання й налаштування `product` тримаються за id, переживають перейменування, а видалений product дають як `blank`, який легко перевірити.',
      },
    ],
    followUps: [
      {
        q: 'Як так само дістати колекцію чи сторінку за handle?',
        a: 'Так само, за ключем: `collections[\'home-care\']`, `pages[\'about\']`, `blogs[\'news\']`, `linklists[\'main-menu\']`. Про ліміт у 20 handle довідка каже лише щодо `all_products`, але мінуси ті самі: handle зашитий у код, і мерчант про цю залежність не знає. Тому для вибору колекції чи сторінки дають налаштування типу `collection` і `page`, а handle у коді лишають хіба для службових речей на кшталт меню.',
        to: '/interview?q=qa-s-objects-10',
      },
      {
        q: 'Що повертає налаштування типу `product`, якщо product видалили?',
        a: 'Порожнє значення, яке в Liquid поводиться як `blank`: `{% if section.settings.product != blank %}` або перевірка `section.settings.product.title` відсікає цей випадок. Так само поводяться `collection`, `page` та інші reference-налаштування, коли ресурс видалено або мерчант ще нічого не обрав. Це головна перевага перед `all_products`, де неіснуючий handle дає EmptyDrop, truthy в `if`.',
        to: '/interview?q=qa-s-sections-03',
      },
      {
        q: 'Чому звернення за handle в циклі — погана ідея для performance?',
        a: 'Кожне `all_products[handle]` — окреме звернення до даних магазину, а не читання поля з памʼяті, бо обʼєкти Shopify — Drop з лінивими властивостями. У циклі на 20 ітерацій це 20 запитів замість одного, і водночас ти впираєшся в ліміт унікальних handle. Правильно взяти вже завантажений масив — `collection.products`, `product_list` чи `.value` спискового metafield — і перебирати його.',
        to: '/docs/shopify/performance',
      },
    ],
  },
  {
    id: 'qa-s-objects-10',
    topic: 'objects',
    level: 'junior',
    q: 'Що таке handle у Shopify і де він використовується в Liquid?',
    short:
      'Handle — це людиночитний унікальний ідентифікатор ресурсу: назва, зведена до малих латинських літер і дефісів. Shopify генерує його з назви product, колекції, сторінки, блогу чи меню, і саме він стоїть в адресі: `/products/keratin-shampoo`. У Liquid за handle звертаються до ресурсів — `collections[\'home-care\']`, `linklists[\'main-menu\']`, `pages[\'about\']`, — а сам він доступний як властивість `product.handle`. Для довільного string є фільтр `handleize`: ним роблять CSS-класи, id та якорі з будь-якого тексту.',
    blocks: [
      {
        type: 'example',
        title: 'Handle як ключ і як властивість',
        preset: 'all',
        template:
          '{{ product.handle }} → {{ product.url }}\n{{ collections[\'home-care\'].title }}\n{{ linklists[\'main-menu\'].links.size }} пункти в меню\n{{ linklists.main-menu.title }}\n\n{{ \'Deep Repair  Mask, 250 ml!\' | handleize }}',
        note: 'Крапкова нотація з дефісом (`linklists.main-menu`) працює для handle, але квадратні дужки безпечніші й дозволяють підставити змінну.',
      },
      {
        type: 'note',
        tone: 'warn',
        title: 'Пастка',
        text: 'Handle створюється **один раз** — при створенні ресурсу. Якщо мерчант потім змінить назву, handle лишиться старим, а якщо змінить handle вручну — зламаються всі місця теми, де він зашитий літералом. Тому `collections[\'sale\']` у коді — це прихована залежність, про яку мерчант не знає. Краще дати налаштування типу `collection`.',
      },
      {
        type: 'note',
        tone: 'tip',
        title: 'Сильніша відповідь',
        text: 'Додай, що handle унікальний лише **в межах типу ресурсу**, а при збігу назв Shopify дописує суфікс (`-1`, `-2`). І що посилання треба будувати з `product.url` чи `routes`, а не клеїти `/products/` з handle: з мовними префіксами Shopify Markets адреса виглядає як `/en/products/…`.',
      },
    ],
    followUps: [
      {
        q: 'Що станеться з посиланням у коді, якщо мерчант змінить handle колекції?',
        a: '`collections[\'sale\']` почне повертати порожній результат — у Shopify це EmptyDrop, який в `if` truthy, тож без перевірки на `empty` секція виведе порожній заголовок і порожню сітку. Помилки в логах не буде. Для старої адреси адмінка запропонує створити редирект, але Liquid-код про редиректи нічого не знає — тому handle у коді замінюють налаштуванням типу `collection`.',
        to: '/interview?q=qa-s-objects-09',
      },
      {
        q: 'Чим `handleize` відрізняється від `url_encode`?',
        a: '`handleize` робить з довільного тексту handle: малі літери, усе, що не літера й не цифра, стає дефісом, зайві дефіси зрізаються — результат зручний для CSS-класів, id та якорів. `url_encode` нічого не спрощує, а лише кодує небезпечні для URL символи у відсоткову форму, і текст можна відновити назад. Тож для значення параметра запиту — `url_encode`, для читабельного ідентифікатора — `handleize`.',
        to: '/docs/shopify/url-and-html-filters',
      },
      {
        q: 'Як звернутись до колекції, handle якої лежить у змінній?',
        a: 'Квадратними дужками: `{% assign h = section.settings.collection_handle %}` і далі `{{ collections[h].title }}` — у дужки можна підставити змінну, а крапкова нотація працює лише з літералом. Те саме для `all_products[h]`, `linklists[h]`, `product.metafields.custom[key]`. Але якщо handle обирає мерчант, чистіше дати налаштування типу `collection` і не тримати string узагалі.',
        to: '/interview?q=qa-types-05',
      },
    ],
  },
  {
    id: 'qa-s-objects-11',
    topic: 'objects',
    level: 'senior',
    q: 'Клієнт хоче на картці product «склад», «інструкцію», «сертифікати» і бейдж «веган». Де ви зберігатимете ці дані: теги, metafield, metaobject чи налаштування секції?',
    short:
      'Я спершу розкладаю дані за двома питаннями: чи вони належать product, чи сторінці, і чи повторюються між product. Бейдж «веган» — metafield типу boolean: теги теж працюють, але вони нетипізовані й швидко перетворюються на смітник із префіксами. Інструкція — metafield із форматованим текстом, унікальний для product. Склад — metaobject «Інгредієнт» зі списковим посиланням із product, бо той самий кератин описується один раз. Сертифікати — файлові metafield або metaobject, якщо в сертифіката є назва й термін дії. Налаштування секції я лишаю для того, що стосується вигляду сторінки, а не даних product: їх не видно через API, вони не імпортуються й живуть у JSON теми.',
    blocks: [
      {
        type: 'table',
        head: ['Сховище', 'Сильні сторони', 'Ціна'],
        rows: [
          ['Теги', 'миттєво, працюють у фільтрах колекції та автоматичних колекціях', 'звичайні string без типів; конвенції на кшталт `badge:vegan` ніхто не валідує; у Liquid — розбір тексту'],
          ['Metafield', 'типи, валідація, масове редагування, API, динамічні джерела, фільтри Search & Discovery', 'значення дублюється між product'],
          ['Metaobject', 'один запис — багато product; кілька полів; власні сторінки', 'складніше наповнювати й імпортувати; ще один рівень `.value`'],
          ['Налаштування секції / блоки', 'мерчант бачить результат одразу в редакторі', 'дані привʼязані до теми й template: зміна теми — і контент лишився в старій'],
        ],
      },
      {
        type: 'code',
        lang: 'liquid',
        title: 'Як це виглядає в секції product',
        code: '{% if product.metafields.custom.is_vegan.value %}\n  <span class="badge">{{ \'products.badges.vegan\' | t }}</span>\n{% endif %}\n\n{% assign ingredients = product.metafields.custom.ingredients.value %}\n{% if ingredients != blank %}\n  <ul>\n    {% for ingredient in ingredients %}\n      <li>{{ ingredient.title.value }} — {{ ingredient.role.value }}</li>\n    {% endfor %}\n  </ul>\n{% endif %}',
      },
      {
        type: 'note',
        tone: 'warn',
        title: 'Пастка',
        text: 'Класична помилка — зробити окремий template product на кожну «особливу» сторінку і ввести контент у блоки секції. На десяти product це зручно, на трьохстах — це триста JSON template, які неможливо масово оновити, а ліміт template у темі скінченний.',
      },
      {
        type: 'note',
        tone: 'tip',
        title: 'Сильніша відповідь',
        text: 'Проговори **хто і як наповнюватиме**: якщо контент-менеджер вантажить каталог із таблиці, metafield імпортуються, а блоки секцій — ні. І назви міграцію: дані в metafield переживають зміну теми, дані в `settings_data.json` і template — ні. На senior-рівні це питання не про синтаксис, а про те, де в клієнта лежить правда.',
      },
      {
        type: 'note',
        tone: 'info',
        text: 'Компромісний варіант, який часто перемагає: дані — у metafield, а в секції — блок із налаштуванням, **підʼєднаним до metafield як до динамічного джерела**. Мерчант керує розташуванням і виглядом у редакторі, а контент лишається при product.',
      },
    ],
    followUps: [
      {
        q: 'Коли теги все ж кращі за metafield?',
        a: 'Коли значення потрібне не для показу, а для відбору: автоматичні колекції, фільтри за тегом у Search & Discovery, умови в застосунках і Shopify Flow працюють з тегами без додаткового налаштування. Ще теги виграють як тимчасові прапорці — «новинка», «розпродаж», — які мерчант ставить масово й швидко знімає. Але щойно у значення зʼявляється тип, структура чи потреба показати його на сторінці — це metafield.',
        to: '/docs/shopify/product-and-variant',
      },
      {
        q: 'Як ви перенесете дані, якщо клієнт уже два роки веде все в тегах?',
        a: 'Не руками: пишу скрипт через Admin API або беру Matrixify чи Flow, який читає теги за домовленою конвенцією — `badge:vegan`, `pH:5.5` — і заповнює відповідні metafield. Іду поетапно: створюю визначення metafield, ганяю міграцію на вибірці, звіряю кілька десятків product, і лише тоді перемикаю тему на `metafields`. Теги на час переходу не видаляю — на них ще можуть спиратись автоматичні колекції й застосунки.',
        to: '/docs/shopify/metafields',
      },
      {
        q: 'Що з цього буде доступне застосункам і headless-вітрині?',
        a: 'Metafield і metaobject — так: вони є в Admin API, а для Storefront API доступ вмикають у визначенні, і тоді застосунок чи Hydrogen-вітрина читають ті самі дані, що й тема. Теги теж доступні через API, але як плаский масив string без типів. А от налаштування секцій і блоків живуть лише у JSON-файлах теми: поза Liquid цього контенту не існує, і це головний аргумент проти зберігання даних у секціях.',
        to: '/docs/shopify/metafields',
      },
    ],
  },
]

/* ═══════════════════════ architecture ═══════════════════════ */

const architecture: InterviewQA[] = [
  {
    id: 'qa-s-architecture-01',
    topic: 'architecture',
    level: 'junior',
    q: 'З яких папок складається тема Shopify і що лежить у кожній?',
    short:
      'Тема — це фіксований набір папок, і Shopify не дозволяє вигадувати свої. У `layout` лежить каркас сторінки, у `templates` — template для типів сторінок, переважно JSON, у `sections` — секції й section group, у `blocks` — блоки теми, у `snippets` — перевикористовувані шматки Liquid. `config` тримає схему й значення theme settings, `locales` — переклади, `assets` — стилі, скрипти, шрифти й картинки теми. Вкладених папок немає, окрім `templates/customers` і `templates/metaobject`. Знаючи цю карту, у чужій темі орієнтуєшся за хвилину.',
    blocks: [
      {
        type: 'code',
        lang: 'text',
        title: 'Каркас теми OS 2.0',
        code: 'assets/        theme.css, global.js, іконки — усе, що віддає CDN\nblocks/        блоки теми (text.liquid, group.liquid)\nconfig/        settings_schema.json — ЩО можна налаштувати\n               settings_data.json   — що мерчант НАЛАШТУВАВ\nlayout/        theme.liquid, password.liquid\nlocales/       uk.default.json, en.json, uk.default.schema.json\nsections/      main-product.liquid, header.liquid, header-group.json\nsnippets/      card-product.liquid, price.liquid, icon-cart.liquid\ntemplates/     index.json, product.json, product.preorder.json, 404.json\n  customers/   login.json, account.json, order.json\n  metaobject/  ingredient.json',
      },
      {
        type: 'table',
        head: ['Папка', 'Хто рендерить', 'Хто редагує'],
        rows: [
          ['`layout`', 'кожен запит сторінки', 'розробник'],
          ['`templates`', 'залежно від типу сторінки', 'JSON — і розробник, і редактор теми'],
          ['`sections`, `blocks`', 'з template, section group або статично', 'розробник пише код, мерчант — налаштування'],
          ['`snippets`', 'лише через `{% render %}`', 'розробник'],
          ['`config`', 'обʼєкт `settings`', '`settings_data.json` переписує редактор теми'],
          ['`locales`', 'фільтр `t`', 'розробник і редактор мов'],
          ['`assets`', 'CDN, через `asset_url`', 'розробник'],
        ],
      },
      {
        type: 'note',
        tone: 'warn',
        title: 'Пастка',
        text: 'Підпапок у `snippets` чи `sections` немає. Структуру імітують префіксами імен: `card-product`, `card-collection`, `icon-cart`, `main-product`, `facets`. На співбесіді питання «як ви організовуєте сто сніпетів» — саме про це.',
      },
      {
        type: 'note',
        tone: 'tip',
        title: 'Сильніша відповідь',
        text: 'Скажи, які файли пише не лише розробник: `templates/*.json`, `sections/*-group.json` і `config/settings_data.json` змінює **редактор теми**. Звідси головний конфлікт у роботі з Git і CLI: код — твій, а ці файли — мерчанта.',
      },
    ],
    followUps: [
      {
        q: 'Які файли в темі обовʼязкові, щоб вона взагалі завантажилась?',
        a: 'Мінімум — `layout/theme.liquid` з обома `content_for_header` і `content_for_layout` та `config/settings_schema.json`: без них тему не збережеш. Далі Shopify очікує по template на кожен тип сторінки, який магазин віддає — `index`, `product`, `collection`, `cart`, `page`, `blog`, `article`, `search`, `404`, `password`, `gift_card.liquid` і набір `customers/*`; без потрібного template відповідна сторінка не відрендериться. Точний перелік краще звіряти з Theme Check — він і покаже, чого бракує.',
        to: '/docs/shopify/architecture',
      },
      {
        q: 'Де лежать template для сторінок акаунта customer?',
        a: 'У підпапці `templates/customers/`: `login`, `register`, `account`, `order`, `addresses`, `activate_account`, `reset_password`. Це один із двох дозволених винятків із плоскої структури `templates`, другий — `templates/metaobject/`. Рендеряться вони як і решта: JSON template із секцією `main-*`, а дані приходять через `customer` і `order`.',
        to: '/docs/shopify/layouts-and-templates',
      },
      {
        q: 'Чому JSON template небезпечно перезаписувати при деплої?',
        a: 'Бо JSON template — це не лише код, а й контент мерчанта: які секції він додав, у якому порядку, з якими текстами й картинками. Редактор теми записує все це у файл, і `theme push` з Git поверне його до стану твого коміту — робота мерчанта зникне без попередження. Тому такі файли або виключають із push, або спершу підтягують з живої теми.',
        to: '/interview?q=qa-s-architecture-09',
      },
    ],
  },
  {
    id: 'qa-s-architecture-02',
    topic: 'architecture',
    level: 'middle',
    q: 'Покупець відкриває `/products/keratin-shampoo`. Розкажи по кроках, що відбувається в темі, поки не зʼявиться HTML.',
    short:
      'Shopify за адресою визначає тип сторінки й ресурс — це product із таким handle — і шукає template: `product.json` або альтернативний, якщо він призначений цьому product. JSON template — це список секцій із налаштуваннями й порядком; Shopify рендерить кожну секцію окремо, обгортаючи її у власний `div`. Отриманий HTML підставляється в layout на місце `content_for_layout`; сам layout, зазвичай `theme.liquid`, додає шапку й підвал через section group, стилі, скрипти й `content_for_header`. Усе це відбувається на сервері, браузер отримує готовий HTML — у браузері Liquid не виконується.',
    blocks: [
      {
        type: 'list',
        ordered: true,
        items: [
          '**Маршрут.** `/products/keratin-shampoo` → тип сторінки `product`, у контекст кладеться обʼєкт `product`.',
          '**Template.** `templates/product.json`, або `product.<суфікс>.json`, якщо мерчант призначив product інший template, або тимчасово через `?view=суфікс`.',
          '**Секції.** Для кожного запису з `order` Shopify бере файл із `sections/`, дає йому `section.settings` і `section.blocks` із JSON і рендерить.',
          '**Layout.** Результат стає значенням `content_for_layout` у `layout/theme.liquid` (або в тому layout, який вказав template).',
          '**Section group і статика.** Layout рендерить `{% sections \'header-group\' %}`, `{% sections \'footer-group\' %}` і сніпети.',
          '**`content_for_header`.** Shopify вставляє свої скрипти: аналітику, застосунки, редактор теми.',
          '**Відповідь.** Готовий HTML іде браузеру; далі працює лише JavaScript теми.',
        ],
      },
      {
        type: 'code',
        lang: 'json',
        title: 'templates/product.json — «зміст» сторінки',
        code: '{\n  "sections": {\n    "main": {\n      "type": "main-product",\n      "blocks": {\n        "title": { "type": "title" },\n        "price": { "type": "price" },\n        "buy":   { "type": "buy_buttons" }\n      },\n      "block_order": ["title", "price", "buy"],\n      "settings": { "enable_sticky_info": true }\n    },\n    "related": { "type": "related-products", "settings": { "heading": "З цим купують" } }\n  },\n  "order": ["main", "related"]\n}',
      },
      {
        type: 'note',
        tone: 'warn',
        title: 'Пастка',
        text: 'Секції рендеряться **ізольовано**: змінна, створена через `assign` у layout чи в одній секції, в іншій не існує. Спільні дані передають через глобальні обʼєкти, `settings`, metafield — або рахують повторно.',
      },
      {
        type: 'note',
        tone: 'tip',
        title: 'Сильніша відповідь',
        text: 'Додай, що той самий конвеєр можна викликати частково: **Section Rendering API** рендерить одну секцію в контексті будь-якої адреси й віддає її HTML — на цьому тримаються cart-дровер, фільтри колекції й перемикач варіантів у сучасних темах.',
      },
    ],
    followUps: [
      {
        q: 'Як Shopify обирає, який саме template product взяти?',
        a: 'Спочатку дивиться, чи призначив мерчант цьому product альтернативний template у полі «Шаблон теми» — тоді береться `product.<суфікс>.json`. Якщо в адресі є `?view=суфікс`, він переважає й дозволяє приміряти будь-який template без призначення. Інакше — типовий `product.json`; а якщо файла з призначеним суфіксом у поточній темі немає, Shopify тихо відкочується до типового.',
        to: '/interview?q=qa-s-architecture-06',
      },
      {
        q: 'Чому змінна з `theme.liquid` недоступна в секції?',
        a: 'Кожна секція рендериться у власному ізольованому scope (область видимості) — по суті, як окремий файл, якому видно лише глобальні обʼєкти. Так її можна відрендерити окремо через Section Rendering API чи в редакторі, не маючи layout узагалі. Тому спільні дані передають через `settings`, metafield чи глобальні обʼєкти, а не через `assign` у layout.',
        to: '/docs/shopify/sections-and-schema',
      },
      {
        q: 'Що з цього ланцюжка можна закешувати, а що рендериться на кожен запит?',
        a: 'Shopify кешує готовий HTML сторінки на своєму боці, тому одна й та сама сторінка не рендериться на кожен хіт — звідси й «застиглий» `now`. Персоналізовані частини — cart, `customer`, усе, що залежить від сесії, — виводити в Liquid ризиковано: їх довантажують через Ajax API або Section Rendering API. Розробник цим кешем не керує, але має писати template так, ніби HTML побачать багато різних людей.',
        to: '/interview?q=qa-s-performance-09',
      },
    ],
  },
  {
    id: 'qa-s-architecture-03',
    topic: 'architecture',
    level: 'junior',
    q: 'Що таке `theme.liquid` і навіщо в ньому `content_for_header` та `content_for_layout`?',
    short:
      'Файл `layout/theme.liquid` — це каркас, спільний для всіх сторінок: `html`, `head`, `body`, шапка, підвал, підключення стилів і скриптів. У ньому обовʼязкові два обʼєкти. `content_for_layout` — місце, куди Shopify вставляє відрендерений template поточної сторінки. `content_for_header` стоїть у `head` і виводить службові скрипти Shopify: аналітику, код застосунків, підтримку редактора теми. Без будь-якого з них тему просто не вдасться зберегти. Чіпати чи розбирати `content_for_header` не можна — його вміст змінюється без попередження.',
    blocks: [
      {
        type: 'code',
        lang: 'liquid',
        title: 'Мінімальний layout/theme.liquid',
        code: '<!doctype html>\n<html lang="{{ request.locale.iso_code }}">\n  <head>\n    <meta charset="utf-8">\n    <meta name="viewport" content="width=device-width,initial-scale=1">\n    <title>{{ page_title }}</title>\n    <link rel="canonical" href="{{ canonical_url }}">\n    {{ \'theme.css\' | asset_url | stylesheet_tag }}\n    {{ content_for_header }}\n  </head>\n  <body class="template-{{ template.name }}">\n    {% sections \'header-group\' %}\n    <main id="MainContent">\n      {{ content_for_layout }}\n    </main>\n    {% sections \'footer-group\' %}\n  </body>\n</html>',
      },
      {
        type: 'table',
        head: ['Обʼєкт', 'Де стоїть', 'Що містить'],
        rows: [
          ['`content_for_header`', 'усередині `<head>`', 'скрипти Shopify і застосунків; не змінювати й не парсити'],
          ['`content_for_layout`', 'усередині `<body>`', 'HTML template поточної сторінки'],
        ],
      },
      {
        type: 'note',
        tone: 'warn',
        title: 'Пастка',
        text: 'Старі «оптимізації» на кшталт `{{ content_for_header | replace: … }}`, якими намагались відкласти скрипти застосунків, ламаються при кожній зміні платформи й офіційно не підтримуються. Якщо застосунок гальмує — це розмова про застосунок, а не про заміни в тексті.',
      },
      {
        type: 'note',
        tone: 'tip',
        title: 'Сильніша відповідь',
        text: 'Згадай, що layout може бути кілька: `password.liquid` для закритого магазину, власний — для лендингу. Liquid template обирає layout тегом `{% layout \'landing\' %}` або `{% layout none %}`, JSON template — ключем `"layout"` (значення `false` вимикає layout, але й редактор теми для такого template).',
      },
    ],
    followUps: [
      {
        q: 'Як відрендерити сторінку зовсім без layout і навіщо це буває потрібно?',
        a: 'У Liquid template пишуть `{% layout none %}` на початку файла, а в JSON template — `"layout": false`. Так із теми віддають не сторінку, а «сирий» результат: JSON для власного скрипта через альтернативний template `collection.ajax.liquid` і `?view=ajax`, або чисту верстку для друку чи вбудовування. Сьогодні для даних це краще робити через Section Rendering API, а `layout none` лишається для справді нестандартного output.',
        to: '/docs/shopify/layouts-and-templates',
      },
      {
        q: 'Чому шапку й підвал тепер рендерять через `{% sections %}`, а не `{% section %}`?',
        a: '`{% section \'header\' %}` рендерить одну секцію статично: мерчант може змінити її налаштування, але не додати поруч смужку оголошень чи блок застосунку. `{% sections \'header-group\' %}` рендерить section group — JSON-файл зі списком секцій, у який мерчант додає, прибирає й переставляє секції прямо в редакторі. По суті, це JSON template для окремої ділянки layout.',
        to: '/interview?q=qa-s-architecture-07',
      },
      {
        q: 'Що саме потрапляє в `content_for_header`?',
        a: 'Те, що Shopify додає сам: аналітику й пікселі, скрипти застосунків з app embeds, підтримку Theme Editor у режимі редагування, службові `meta` і, коли треба, preload для своїх ресурсів. Точний вміст не документований і змінюється без попередження, тому його не парсять і не фільтрують. Стилі й скрипти самої теми туди не входять — їх підключаєш ти через `asset_url`.',
        to: '/docs/shopify/layouts-and-templates',
      },
    ],
  },
  {
    id: 'qa-s-architecture-04',
    topic: 'architecture',
    level: 'middle',
    q: 'Чим JSON template відрізняється від Liquid template? Коли ще потрібен `.liquid`?',
    short:
      'Liquid template — це розмітка: що в ньому написано, те й відрендериться, і мерчант нічого не може змінити без розробника. JSON template розмітки не містить узагалі — це дані: які секції стоять на сторінці, в якому порядку і з якими налаштуваннями. Саме тому мерчант може в редакторі додавати, прибирати й переставляти секції на будь-якій сторінці. Для однієї сторінки існує або JSON, або Liquid-файл з тим самим імʼям, не обидва. Liquid лишився для того, що не є сторінкою з секціями: `gift_card.liquid`, `robots.txt.liquid`, або для віддачі нестандартного формату через альтернативний template без layout.',
    blocks: [
      {
        type: 'table',
        head: ['', 'JSON template', 'Liquid template'],
        rows: [
          ['Вміст', 'список секцій, порядок, налаштування', 'HTML + Liquid'],
          ['Редактор теми', 'додавання, видалення, перестановка секцій', 'лише статичні секції, якщо вони є'],
          ['Хто змінює файл', 'розробник **і** редактор теми', 'лише розробник'],
          ['Блоки застосунків', 'так', 'ні'],
          ['Ліміти', 'до 25 секцій у template, до 50 блоків у секції, до 1000 JSON template у темі', '—'],
          ['Де обовʼязковий', '—', '`gift_card.liquid`, `robots.txt.liquid`'],
        ],
      },
      {
        type: 'code',
        lang: 'json',
        title: 'Кореневі ключі JSON template',
        code: '{\n  "layout": "theme",\n  "wrapper": "div#product-page.page-width",\n  "sections": { "main": { "type": "main-product", "settings": {} } },\n  "order": ["main"]\n}',
      },
      {
        type: 'note',
        tone: 'warn',
        title: 'Пастка',
        text: 'У JSON template **немає Liquid**. Умову «показати секцію лише для product із тегом» у template не впишеш — вона живе або всередині секції, або в окремому альтернативному template, призначеному цим product.',
      },
      {
        type: 'note',
        tone: 'tip',
        title: 'Сильніша відповідь',
        text: 'Розкажи практичний трюк: Liquid template із `{% layout none %}` — це спосіб віддати з теми не HTML-сторінку, а, скажімо, JSON для власного скрипта: `collection.ajax.liquid`, який викликають як `?view=ajax`. І одразу додай, що сьогодні для цього краще підходить Section Rendering API — він не вимагає окремого template.',
      },
    ],
    followUps: [
      {
        q: 'Що буде, якщо в темі є і `product.json`, і `product.liquid`?',
        a: 'Shopify такого не дозволяє: для одного типу й суфікса має бути рівно один файл, і при завантаженні теми з обома отримаєш помилку про конфлікт, а Theme Check попередить ще локально. Тому при міграції на JSON старий `.liquid` видаляють тим самим кроком, а не «на потім». Якщо ж потрібні обидва варіанти сторінки — це різні суфікси, а не різні розширення.',
        to: '/docs/shopify/json-templates',
      },
      {
        q: 'Як секція потрапляє в JSON template — руками чи через редактор?',
        a: 'Обома шляхами, і файл виходить однаковий. Розробник вписує запис у `sections` та `order` руками — так у теми зʼявляється стартовий склад сторінки. Мерчант додає секцію в Theme Editor — і Shopify дописує той самий JSON, беручи значення налаштувань із `default` схеми або з обраного `preset`. Щоб секція взагалі зʼявилась у списку «Додати секцію», у її схемі має бути `presets`.',
        to: '/interview?q=qa-s-sections-04',
      },
      {
        q: 'Як тримати JSON template у Git, якщо їх змінює мерчант?',
        a: 'Розділити власність: код секцій — у Git, а `templates/*.json`, `sections/*.json` і `settings_data.json` — за мерчантом. Практично це або `.shopifyignore` для цих файлів при `theme push`, або регулярний `theme pull` їх із живої теми з комітом, або GitHub-інтеграція, де зміни з редактора самі стають комітами. Нову секцію в живу сторінку тоді додають окремою міграцією, а не перезаписом файла.',
        to: '/interview?q=qa-s-architecture-09',
      },
    ],
  },
  {
    id: 'qa-s-architecture-05',
    topic: 'architecture',
    level: 'senior',
    q: 'Вам дісталась «вінтажна» тема до Online Store 2.0. Клієнт хоче редагувати всі сторінки секціями. Як ви плануєте міграцію і де ризики?',
    short:
      'Суть OS 2.0 — «секції всюди»: сторінку описує JSON template, а не Liquid, тож міграція — це перенесення розмітки з template у секції. Я йду сторінка за сторінкою, починаючи з product: вміст `product.liquid` стає секцією `main-product`, а template — `product.json`, який на неї посилається. Усе, що підключалось через `include`, переводжу на `render` і явні параметри — тут найбільше прихованих залежностей від зовнішніх змінних. Шапку й підвал виношу в section group. Головні ризики — застосунки, які вписали свій код прямо в тему, і втрата налаштувань мерчанта з `settings_data.json`. Тому роблю це на копії теми, а перед запуском порівнюю сторінки старої й нової.',
    blocks: [
      {
        type: 'table',
        head: ['Було (вінтаж)', 'Стало (OS 2.0)'],
        rows: [
          ['`templates/product.liquid` із розміткою', '`templates/product.json` + `sections/main-product.liquid`'],
          ['секції лише на головній (`content_for_index`)', 'секції на будь-якій сторінці'],
          ['`{% section \'header\' %}` у layout', '`{% sections \'header-group\' %}` — мерчант додає секції в шапку'],
          ['`{% include %}` зі спільними змінними', '`{% render %}` з явними параметрами'],
          ['код застосунку вписаний у `theme.liquid` і сніпети', 'блоки застосунків (`@app`) і app embeds — зникають разом із застосунком'],
          ['дані product у тегах і хаках із описом', 'metafield + динамічні джерела'],
          ['`img_url`, `img_tag`', '`image_url`, `image_tag`'],
        ],
      },
      {
        type: 'list',
        ordered: true,
        items: [
          'Копія теми й інвентаризація: template, альтернативні template, сніпети застосунків, використання `include`.',
          'Спершу `render` замість `include` — окремим кроком, бо він ламає приховані залежності ще до міграції template.',
          'Template за template: розмітка → секція `main-*`, файл template → JSON. Старий `.liquid` видаляється — поруч вони жити не можуть.',
          'Схеми: `presets` для секцій, які мерчант додаватиме сам; `enabled_on`, щоб секція product не опинилась у блозі.',
          'Section group для шапки й підвалу, блок `@app` у головних секціях.',
          'Перенесення контенту мерчанта й візуальне порівняння ключових сторінок; Theme Check на весь проєкт.',
        ],
      },
      {
        type: 'note',
        tone: 'warn',
        title: 'Пастка',
        text: 'Перейменування чи видалення налаштування у схемі мовчки губить значення, яке мерчант увів у старій темі: `settings_data.json` зберігає їх за `id`. Міграція схем без мапи «старий id → новий id» — це втрачений контент, який помітять уже після запуску.',
      },
      {
        type: 'note',
        tone: 'tip',
        title: 'Сильніша відповідь',
        text: 'Чесно постав під сумнів саму міграцію: якщо тема стара, обросла латками й клієнту однаково потрібен редизайн, **дешевше взяти сучасну базу** (Dawn або тему на блоках теми) і перенести дизайн, ніж рефакторити template за template. Senior називає обидва шляхи й критерій вибору — обсяг кастомної логіки, яку доведеться зберегти.',
      },
    ],
    followUps: [
      {
        q: 'Як знайти в темі код, який лишили застосунки?',
        a: 'Шукаю в `snippets` і `assets` файли з назвами сервісів, у `theme.liquid` — `include`, `render` і `script`, які не належать темі, і умови навколо чужих сніпетів. Знайдене порівнюю зі списком встановлених застосунків в адмінці: усе, чого серед них немає, — сирота. Theme Check і пошук `include` по проєкту прискорюють інвентаризацію, а прибираю таке лише в копії теми й з перевіркою сторінок.',
        to: '/interview?q=qa-s-architecture-11',
      },
      {
        q: 'Що робити з альтернативними template, яких у клієнта сорок?',
        a: 'Спершу зрозуміти, навіщо вони: зазвичай більшість відрізняється не структурою, а контентом — і тоді вони згортаються в один JSON template плюс metafield із динамічними джерелами. Лишаються ті, що справді мають інший склад секцій, скажімо «передзамовлення» чи «набір». Ще звіряю, які суфікси реально призначені product в адмінці — часто половина файлів уже нікому не потрібна.',
        to: '/interview?q=qa-s-architecture-06',
      },
      {
        q: 'Як ви перевірите, що після міграції нічого не зникло?',
        a: 'Складаю список ключових адрес — головна, кілька product з різними template, колекція з фільтрами, cart, пошук, акаунт — і порівнюю стару й нову теми у preview: скриншотами або хоча б очима поруч. Окремо звіряю `settings_data.json` і тексти секцій, бо саме контент губиться найтихіше. Theme Check ганяю на весь проєкт, а на прод виходжу публікацією копії, щоб мати миттєвий відкат.',
        to: '/interview?q=qa-s-debugging-03',
      },
    ],
  },
  {
    id: 'qa-s-architecture-06',
    topic: 'architecture',
    level: 'middle',
    q: 'Що таке альтернативні template? Як зробити окремий вигляд сторінки для частини product?',
    short:
      'Альтернативний template — це ще один файл template того самого типу із суфіксом у назві: `product.preorder.json` поруч із `product.json`. Мерчант призначає його конкретному product, колекції чи сторінці в адмінці, у полі «Шаблон теми», або створює прямо з редактора теми. У Liquid суфікс видно як `template.suffix`. Будь-який template можна тимчасово примірити до сторінки параметром `?view=preorder` — це зручно для перевірки. Важливо, що template — це властивість ресурсу, а не теми: якщо в новій темі файла з таким суфіксом немає, product відкриється звичайним template.',
    blocks: [
      {
        type: 'code',
        lang: 'text',
        title: 'Назва файла = тип.суфікс.розширення',
        code: 'templates/product.json             ← типовий\ntemplates/product.preorder.json    ← «Передзамовлення»\ntemplates/product.bundle.json      ← «Набір»\ntemplates/page.contact.json\ntemplates/collection.lookbook.json\n\n/products/keratin-shampoo?view=preorder   ← приміряти шаблон без призначення',
      },
      {
        type: 'example',
        title: 'Суфікс доступний у Liquid',
        data: { template: { name: 'product', suffix: 'preorder' } },
        template:
          '<body class="template-{{ template.name }}{% if template.suffix %} template-{{ template.name }}--{{ template.suffix }}{% endif %}">\n{{ template }}',
        note: 'У пісочниці `template` — звичайний обʼєкт, тому другий вираз виведе `[object Object]`. У Shopify `{{ template }}` виводить імʼя цілком — `product.preorder`.',
        shopifyOutput: '<body class="template-product template-product--preorder">\nproduct.preorder',
      },
      {
        type: 'note',
        tone: 'warn',
        title: 'Пастка',
        text: 'Альтернативний template — не спосіб зберігати контент. Окремий JSON на кожен product заради унікального тексту закінчується сотнями файлів, які не оновиш масово, і впирається в ліміт JSON template у темі. Унікальний контент — у metafield, а template — один на **тип** сторінки.',
      },
      {
        type: 'note',
        tone: 'tip',
        title: 'Сильніша відповідь',
        text: 'Скажи, що гілкування `{% if template.suffix == \'preorder\' %}` усередині секції — запах: логіку вигляду краще виразити складом секцій у самому template. І що при перенесенні теми треба перевіряти список призначених суфіксів, бо магазин памʼятає їх незалежно від теми.',
      },
    ],
    followUps: [
      {
        q: 'Де мерчант призначає template product?',
        a: 'В адмінці, на сторінці product, у бічній панелі є поле «Шаблон теми» зі списком усіх альтернативних template поточної теми — те саме є в колекції, сторінці й блозі. Ще template можна створити й призначити прямо з Theme Editor через перемикач сторінок. Призначення зберігається в самому ресурсі — у Liquid це `product.template_suffix`, — а не в темі.',
        to: '/docs/shopify/json-templates',
      },
      {
        q: 'Що станеться з product, якщо в опублікованій темі немає його template?',
        a: 'Нічого страшного: Shopify не знайде `product.preorder.json` і відрендерить product типовим `product.json`. Помилки не буде, але й особливого вигляду теж — про це легко забути при переході на нову тему. Тому перелік призначених суфіксів звіряють ще до публікації.',
        to: '/docs/shopify/json-templates',
      },
      {
        q: 'Як масово призначити template сотні product?',
        a: 'Не руками: в адмінці є масове редагування product з колонкою шаблону, є імпорт CSV зі стовпчиком «Template Suffix», а через Admin API — поле `templateSuffix` в оновленні product. Якщо призначення залежить від тегу чи колекції, це автоматизує Shopify Flow. Головне — не плодити template під контент: якщо сотням product потрібен «особливий вигляд», це зазвичай metafield, а не суфікс.',
        to: '/interview?q=qa-s-objects-11',
      },
    ],
  },
  {
    id: 'qa-s-architecture-07',
    topic: 'architecture',
    level: 'middle',
    q: 'Що таке section group і яку проблему він розвʼязав?',
    short:
      'Section group (група секцій) — це JSON-файл у папці `sections`, який описує набір секцій для ділянки layout: шапки, підвалу, бічної панелі. У layout його рендерять тегом `{% sections \'header-group\' %}`. До появи section group шапка й підвал були статичними секціями: мерчант міг змінити їхні налаштування, але не міг додати над шапкою смужку оголошень чи ще один блок у підвал. Тепер ці зони поводяться як JSON template — секції можна додавати, прибирати й переставляти, і туди ж стають блоки застосунків. Формат майже той самий, що в template, плюс обовʼязкові `type` і `name`.',
    blocks: [
      {
        type: 'code',
        lang: 'json',
        title: 'sections/header-group.json',
        code: '{\n  "type": "header",\n  "name": "Група шапки",\n  "sections": {\n    "announcement": { "type": "announcement-bar", "settings": { "text": "Доставка від 1500 ₴ — безкоштовно" } },\n    "header": { "type": "header", "settings": { "menu": "main-menu" } }\n  },\n  "order": ["announcement", "header"]\n}',
      },
      {
        type: 'code',
        lang: 'liquid',
        title: 'layout/theme.liquid',
        code: '{% sections \'header-group\' %}\n<main>{{ content_for_layout }}</main>\n{% sections \'footer-group\' %}',
      },
      {
        type: 'table',
        head: ['', '`{% section \'header\' %}`', '`{% sections \'header-group\' %}`'],
        rows: [
          ['Що рендерить', 'одну секцію статично', 'section group із JSON'],
          ['Мерчант може додати секцію поруч', 'ні', 'так'],
          ['Блоки застосунків як окремі секції', 'ні', 'так'],
          ['Де зберігаються налаштування', '`settings_data.json`', 'у файлі section group'],
          ['`section.location`', '`static`', 'тип групи: `header`, `footer`, `aside`, `custom.<імʼя>`'],
        ],
      },
      {
        type: 'note',
        tone: 'warn',
        title: 'Пастка',
        text: 'Щоб у шапку не потрапила секція «Відгуки» на пів екрана, секції обмежують у схемі: `"enabled_on": { "groups": ["header"] }` для смужки оголошень і `"disabled_on": { "groups": ["header", "footer"] }` для контентних. Без цього редактор запропонує в шапку весь каталог секцій.',
      },
      {
        type: 'note',
        tone: 'tip',
        title: 'Сильніша відповідь',
        text: 'Назви ліміти — section group, як і template, вміщує до 25 секцій по 50 блоків — і наслідок для верстки: між секціями групи немає жодної розмітки-обгортки, тож «липка» шапка чи спільний фон мають триматись на самих секціях, а не на контейнері групи.',
      },
    ],
    followUps: [
      {
        q: 'Як заборонити додавати секцію product у підвал?',
        a: 'У схемі секції: `"disabled_on": { "groups": ["footer"] }` — або навпаки, `"enabled_on": { "templates": ["product"] }`, щоб секція зʼявлялась лише в template product. Обидва ключі приймають `templates` і `groups`, а `"*"` означає «усі». Правило просте: пиши той, що коротший — заборону для двох-трьох винятків, дозвіл для секції, яка має сенс лише в одному місці.',
        to: '/interview?q=qa-s-sections-08',
      },
      {
        q: 'Чи можна мати різні шапки на різних сторінках?',
        a: 'Так: section group рендерять із layout, а layout у template можна змінити — `"layout": "landing"` у JSON template, і в `layout/landing.liquid` стоятиме `{% sections \'landing-header-group\' %}` з іншою групою. Другий шлях — одна група, але в самих секціях умови на `request.page_type` чи `template.name`. Перший чистіший, другий простіший для мерчанта, бо редагується в одному місці.',
        to: '/docs/shopify/section-groups',
      },
      {
        q: 'Як у секції дізнатись, що вона стоїть у шапці, а не в template?',
        a: 'Через `section.location`: для секцій у template це `template`, для section group — тип групи, тобто `header`, `footer`, `aside` чи `custom.<імʼя>`, для статичних — `static`. На цьому будують різну поведінку однієї секції, скажімо компактний вигляд у шапці. Але зазвичай простіше зробити дві секції, ніж одну з гілкуванням.',
        to: '/docs/shopify/section-groups',
      },
    ],
  },
  {
    id: 'qa-s-architecture-08',
    topic: 'architecture',
    level: 'junior',
    q: 'Як у темі зроблені переклади? Що робить фільтр `t`?',
    short:
      'Усі тексти інтерфейсу теми — «Додати в кошик», «Немає в наявності» — лежать не в розмітці, а в JSON-файлах папки `locales`, по файлу на кожен locale. У шаблоні пишуть ключ і фільтр `t`: `{{ \'products.product.add_to_cart\' | t }}`, і Shopify підставляє переклад мовою поточного покупця. Один locale позначений як типовий — його файл має `default` у назві, і з нього беруться тексти, яких бракує в інших. Фільтр уміє підставляти змінні та обирати форму множини за параметром `count`. Якщо ключа немає ніде, на сторінці зʼявиться текст «translation missing» — помилка видима, і це добре.',
    blocks: [
      {
        type: 'example',
        title: 'Ключ, підстановка, множина і відсутній ключ',
        preset: 'cart',
        data: {
          locales: {
            products: { product: { add_to_cart: 'Додати в кошик' } },
            general: { welcome: 'Привіт, {{ name }}!' },
            cart: { items: { one: '{{ count }} товар', other: '{{ count }} товарів' } },
          },
        },
        template:
          '{{ \'products.product.add_to_cart\' | t }}\n{{ \'general.welcome\' | t: name: \'Софія\' }}\n{{ \'cart.items\' | t: count: cart.item_count }}\n{{ \'cart.empty_state\' | t }}',
        note: 'У пісочниці словник — це змінна `locales`. Емуляція множини спрощена до `one`/`other`; справжній Shopify знає всі форми CLDR — для української це `one`, `few`, `many`, `other`.',
      },
      {
        type: 'code',
        lang: 'json',
        title: 'locales/uk.default.json',
        code: '{\n  "products": {\n    "product": {\n      "add_to_cart": "Додати в кошик",\n      "sold_out": "Немає в наявності"\n    }\n  },\n  "cart": {\n    "items": {\n      "one": "{{ count }} товар",\n      "few": "{{ count }} товари",\n      "many": "{{ count }} товарів",\n      "other": "{{ count }} товару"\n    }\n  },\n  "general": { "welcome_html": "Привіт, <strong>{{ name }}</strong>!" }\n}',
      },
      {
        type: 'note',
        tone: 'warn',
        title: 'Пастка',
        text: 'Переклади **ескейпляться**: HTML у тексті перекладу вийде на сторінку як текст із кутовими дужками. Щоб розмітка спрацювала, ключ має закінчуватись на `_html`. І навпаки: додавати `_html` «про всяк випадок» — означає вимкнути захист там, де він був.',
      },
      {
        type: 'note',
        tone: 'tip',
        title: 'Сильніша відповідь',
        text: 'Розділи два світи: `uk.json` — тексти **вітрини** для фільтра `t`, а `uk.schema.json` — тексти **редактора теми**: назви секцій і налаштувань, на які схема посилається як `"label": "t:sections.header.name"`. А контент мерчанта — назви product, тексти секцій — перекладається не файлами теми, а через Shopify Markets і застосунок перекладів.',
      },
    ],
    followUps: [
      {
        q: 'Як перекласти назву налаштування в схемі секції?',
        a: 'У схемі замість тексту пишуть ключ із префіксом `t:` — `"label": "t:sections.header.settings.menu.label"`, а самі тексти кладуть у `locales/uk.default.schema.json` і `en.schema.json`. Це окремий набір файлів від `uk.json`, бо їх бачить не покупець, а мерчант у Theme Editor. І мова тут визначається мовою адмінки мерчанта, а не магазину.',
        to: '/docs/shopify/locales',
      },
      {
        q: 'Що буде, якщо ключ є в типовому locale, але його немає в поточному?',
        a: 'Shopify візьме переклад із файла з `default` у назві — саме для цього він і існує. Тому нові ключі спочатку додають у типовий locale, і тема не ламається, поки перекладачі не наздогнали. Лише коли ключа немає ніде, на сторінці зʼявиться `translation missing` з імʼям ключа.',
        to: '/docs/shopify/locales',
      },
      {
        q: 'Як перекладаються назви product і тексти, які мерчант увів у секції?',
        a: 'Не файлами теми: `locales` містять лише тексти інтерфейсу самої теми. Контент — назви product, описи, тексти з налаштувань секцій — перекладається через Shopify Markets і застосунок перекладів на кшталт Translate & Adapt, який зберігає переклади поряд із ресурсом. Liquid тоді сам віддає `product.title` і `section.settings.heading` потрібною мовою за `request.locale`, і темі нічого робити не треба.',
        to: '/interview?q=qa-s-practical-05',
      },
    ],
  },
  {
    id: 'qa-s-architecture-09',
    topic: 'architecture',
    level: 'senior',
    q: '`settings_schema.json` і `settings_data.json` — у чому різниця? І як ви деплоїте тему, щоб не затерти те, що мерчант налаштував у редакторі?',
    short:
      'Схема описує, які theme settings існують: тип, id, підпис, типове значення — її пише розробник. Дані зберігають те, що мерчант обрав у редакторі, і цей файл переписує Shopify при кожному збереженні. У Liquid обидва зливаються в обʼєкт `settings`. Проблема деплою в тому, що мерчант змінює не лише `settings_data.json`, а й JSON template та section group, тож «залити все з Git» означає відкотити його роботу. Я розділяю власність: код деплою завжди, а файли мерчанта або виключаю з push, або спершу стягую з живої теми й комічу. Реліз іде через копію теми, яку перевіряють і публікують, а не поверх живої.',
    blocks: [
      {
        type: 'code',
        lang: 'json',
        title: 'config/settings_schema.json — що МОЖНА налаштувати',
        code: '[\n  { "name": "theme_info", "theme_name": "Liquid Lab", "theme_version": "2.1.0" },\n  {\n    "name": "Кольори",\n    "settings": [\n      { "type": "color", "id": "colors_accent", "label": "Акцент", "default": "#0e8f8b" },\n      { "type": "checkbox", "id": "show_vendor", "label": "Показувати бренд", "default": true }\n    ]\n  }\n]',
      },
      {
        type: 'code',
        lang: 'json',
        title: 'config/settings_data.json — що мерчант НАЛАШТУВАВ',
        code: '{\n  "current": {\n    "colors_accent": "#c2185b",\n    "show_vendor": false,\n    "sections": { "cart-drawer": { "type": "cart-drawer", "settings": {} } }\n  },\n  "presets": { "Default": { "colors_accent": "#0e8f8b" } }\n}',
      },
      {
        type: 'example',
        title: 'У Liquid це просто `settings`',
        preset: 'shop',
        template:
          ':root { --accent: {{ settings.colors_accent }}; --logo: {{ settings.logo_width }}px; }\n{% if settings.show_vendor %}бренд показуємо{% endif %}',
      },
      {
        type: 'table',
        head: ['Стратегія деплою', 'Плюс', 'Ціна'],
        rows: [
          ['`shopify theme push` з ігноруванням `config/settings_data.json`, `templates/*.json`, `sections/*.json` (через `.shopifyignore` або `--ignore`)', 'робота мерчанта недоторкана', 'нова секція не зʼявиться в template сама — її додають руками або окремою міграцією'],
          ['Перед релізом `theme pull` цих файлів із живої теми й коміт', 'Git відображає реальність', 'дисципліна; конфлікти, якщо мерчант редагує під час релізу'],
          ['Інтеграція з GitHub: гілка ↔ тема, двобічна синхронізація', 'зміни мерчанта самі стають комітами', 'шумна історія; збірка (Sass, бандлер) потребує окремої гілки з результатом'],
          ['Реліз через копію живої теми + публікація', 'можна перевірити й миттєво відкотитись', 'зміни мерчанта, зроблені в живій темі після копіювання, треба переносити'],
        ],
      },
      {
        type: 'note',
        tone: 'warn',
        title: 'Пастка',
        text: 'Зміна `id` налаштування у схемі — це не рефакторинг, а **видалення даних**: значення в `settings_data.json` привʼязане до старого id і просто перестане читатись. Те саме з `type` секції у JSON template після перейменування файла секції.',
      },
      {
        type: 'note',
        tone: 'tip',
        title: 'Сильніша відповідь',
        text: 'Скажи, що типові значення мають жити у **схемі** (`default`), а не в `settings_data.json`: тоді нове налаштування працює одразу після деплою коду, навіть якщо файл даних ти не чіпав. І що `current` у файлі даних може бути як обʼєктом, так і назвою пресета — на цьому ламаються скрипти, які парсять файл навмання.',
      },
    ],
    followUps: [
      {
        q: 'Що станеться з налаштуваннями мерчанта, якщо перейменувати `id` у схемі?',
        a: 'Значення в `settings_data.json` лежить під старим id, тож Shopify його більше не прочитає: `settings.new_id` дасть `default` зі схеми або `nil`, а мерчант побачить, що його колір чи текст «скинувся». Старе значення при цьому нікуди не зникає, поки редактор не перепише файл. Тому перейменування — це міграція даних: або скрипт переносить значення на новий id, або старий id не чіпають.',
        to: '/docs/shopify/theme-settings',
      },
      {
        q: 'Як додати нову секцію на живу головну сторінку, не перезаписуючи `index.json`?',
        a: 'Не перезаписувати файл цілком, а дописати: стягнути актуальний `index.json` з живої теми через `theme pull`, додати запис у `sections` і `order` і запушити вже його. Або взагалі не чіпати файл — задеплоїти лише секцію з `presets` і попросити мерчанта додати її в редакторі. Другий шлях безпечніший: код і контент лишаються у своїх власників.',
        to: '/interview?q=qa-s-architecture-04',
      },
      {
        q: 'Де зберігаються налаштування статичних секцій?',
        a: 'У `config/settings_data.json`, у ключі `current.sections`, за id секції — саме там живуть налаштування шапки чи cart-дровера, відрендерених через `{% section %}`. Секції з JSON template зберігаються у файлі template, а з section group — у файлі групи. Тому статичну секцію можна налаштувати в редакторі, але не можна прибрати чи додати ще одну поруч.',
        to: '/interview?q=qa-s-sections-05',
      },
    ],
  },
  {
    id: 'qa-s-architecture-10',
    topic: 'architecture',
    level: 'middle',
    q: 'Як тема підключає стилі й скрипти з `assets`? Що думаєш про файли на кшталт `theme.css.liquid`?',
    short:
      'Усе з папки `assets` віддає CDN Shopify, а адресу будує фільтр `asset_url`: він додає версію файла, тож після зміни кеш скидається сам. Далі адресу загортають у `stylesheet_tag`, у власний тег `script` з `defer` або в `preload_tag`. Файли з розширенням `.css.liquid` чи `.js.liquid` проганяються через Liquid, і колись так передавали в CSS кольори з theme settings. Сьогодні цей підхід вважається deprecated: такий файл бачить лише `settings` і фільтри, погано дружить зі збіркою й лінтерами, а будь-яка зміна налаштувань міняє весь файл. Замість цього кольори виводять CSS-змінними в `theme.liquid` або в тегу `style` секції, а сам CSS лишають статичним.',
    blocks: [
      {
        type: 'example',
        title: 'Що генерують фільтри',
        template:
          '{{ \'theme.css\' | asset_url }}\n{{ \'theme.css\' | asset_url | stylesheet_tag }}\n{{ \'global.js\' | asset_url | script_tag }}\n{{ \'hero.woff2\' | asset_url | preload_tag: as: \'font\', type: \'font/woff2\', crossorigin: \'anonymous\' }}',
        note: 'Адреси в пісочниці вигадані, але форма та сама: шлях на CDN і параметр версії `?v=`. `script_tag` дає **блокувальний** скрипт без `defer` — у темах його зазвичай замінюють власним тегом.',
      },
      {
        type: 'table',
        head: ['Було', 'Стало'],
        rows: [
          ['`theme.css.liquid` з `{{ settings.colors_accent }}` усередині', 'статичний `theme.css` з `var(--color-accent)` + блок `:root { --color-accent: {{ settings.colors_accent }}; }` у layout'],
          ['`{{ \'app.js\' | asset_url | script_tag }}`', '`<script src="{{ \'app.js\' | asset_url }}" defer></script>`'],
          ['`<img src="{{ \'banner.jpg\' | asset_url }}">` для контентних картинок', 'картинки — через налаштування `image_picker` і `image_url`: мерчант змінює їх сам, Shopify ріже розміри'],
          ['іконки окремими файлами', 'інлайн-SVG сніпетами або `inline_asset_content` для малих файлів'],
        ],
      },
      {
        type: 'note',
        tone: 'warn',
        title: 'Пастка',
        text: 'У `.liquid`-файлі з `assets` **немає обʼєктів сторінки**: ні `product`, ні `section`, ні `request`. Спроба написати там `{% if template.name == \'product\' %}` мовчки нічого не дасть — файл рендериться окремо від сторінки й один на всіх.',
      },
      {
        type: 'note',
        tone: 'tip',
        title: 'Сильніша відповідь',
        text: 'Згадай, що Shopify сам мінімізує CSS і JavaScript з `assets` і стискає їх на CDN, тож окремий крок мініфікації в збірці не обовʼязковий. А якщо збірка є (Vite, esbuild), її результат кладуть у `assets` пласким списком — підпапок там немає.',
      },
    ],
    followUps: [
      {
        q: 'Як скидається кеш CSS після оновлення теми?',
        a: '`asset_url` додає до адреси параметр версії `?v=…`, який Shopify рахує з вмісту файла: змінив `theme.css` — змінилась адреса, і браузер із CDN беруть новий файл. Робити нічого не треба, головне — не писати шлях до файла з `assets` руками без фільтра. На чужі CDN і файли з розділу «Файли» це не поширюється: там версія — твоя турбота.',
        to: '/docs/shopify/assets',
      },
      {
        q: 'Чим `asset_url` відрізняється від `file_url`?',
        a: '`asset_url` віддає адресу файла з папки `assets/` теми — те, що деплоїть розробник разом із кодом. `file_url` — адресу файла зі сторінки «Файли» в адмінці: їх завантажує мерчант, і вони живуть незалежно від теми. Логотип чи інструкцію в PDF мерчант міняє сам — це `file_url`; стилі й скрипти — `asset_url`.',
        to: '/docs/shopify/assets',
      },
      {
        q: 'Як передати колір із налаштувань секції в CSS без `.css.liquid`?',
        a: 'Через CSS-змінні: у секції пишуть `{% style %}` з правилом `#shopify-section-{{ section.id }} { --accent: {{ section.settings.accent }}; }`, а статичний CSS використовує `var(--accent)`. Так стилі лишаються в кешованому файлі, а з Liquid виходить лише кілька байтів із конкретними значеннями. Для theme settings те саме роблять у `theme.liquid` через `:root`.',
        to: '/interview?q=qa-s-sections-11',
      },
    ],
  },
  {
    id: 'qa-s-architecture-11',
    topic: 'architecture',
    level: 'senior',
    q: 'Клієнт ставить застосунок відгуків. Чим блоки застосунків кращі за старий спосіб, коли застосунок дописував код у тему? Що для цього має підтримувати тема?',
    short:
      'Раніше застосунок через API редагував файли теми: додавав сніпет і виклик `include` у template. Після видалення застосунку код лишався, після оновлення теми зникав, а тема поступово обростала чужими вставками, які ніхто не наважувався прибрати. Theme app extension перевертає модель: код живе в застосунку, а в тему потрапляє лише посилання — блок застосунку в секції або вбудовування в `head` чи `body`, яке мерчант вмикає в редакторі. Видалив застосунок — зникло все. Від теми потрібно небагато: JSON template, секції, що приймають блоки типу `@app` і рендерять їх, та бажано окрема секція-обгортка для блоків застосунків.',
    blocks: [
      {
        type: 'code',
        lang: 'liquid',
        title: 'Секція, яка приймає блоки застосунків',
        code: '{% for block in section.blocks %}\n  {% case block.type %}\n    {% when \'@app\' %}\n      {% render block %}\n    {% when \'title\' %}\n      <h1 {{ block.shopify_attributes }}>{{ product.title | escape }}</h1>\n  {% endcase %}\n{% endfor %}\n\n{% schema %}\n{\n  "name": "Товар",\n  "blocks": [\n    { "type": "@app" },\n    { "type": "title", "name": "Назва", "limit": 1 }\n  ]\n}\n{% endschema %}',
      },
      {
        type: 'table',
        head: ['', 'Код, вписаний у тему', 'Theme app extension'],
        rows: [
          ['Де живе код', 'у файлах теми', 'у застосунку, версіонується з ним'],
          ['Видалення застосунку', '«привиди» в темі назавжди', 'зникає автоматично'],
          ['Зміна теми', 'встановлювати заново', 'блок додають у редакторі нової теми'],
          ['Розташування', 'де вписав скрипт', 'мерчант ставить блок де хоче'],
          ['Глобальний код (чат, пікселі)', 'вставка в `theme.liquid`', 'app embed, вмикається перемикачем'],
        ],
      },
      {
        type: 'note',
        tone: 'warn',
        title: 'Пастка',
        text: 'Блок застосунку — чужа розмітка у твоїй сітці. Секція не знає його розмірів і стилів, тож жорсткі припущення («у колонці рівно три блоки», `:nth-child`) ламаються в день встановлення застосунку. І швидкість: кожен застосунок приносить власний JavaScript — тема на це не впливає, але скаргу «сайт повільний» отримаєш саме ти.',
      },
      {
        type: 'note',
        tone: 'tip',
        title: 'Сильніша відповідь',
        text: 'Розкажи, як дієш із реальним магазином: перед роботами шукаєш у темі сліди старих застосунків (сніпети з назвами сервісів, `include` у `theme.liquid`), звіряєш зі списком встановлених і прибираєш «сиріт». І що в секції на блоках теми те саме досягається записом `{ "type": "@app" }` поруч із `{ "type": "@theme" }`, а рендерить усе один `{% content_for \'blocks\' %}`.',
      },
    ],
    followUps: [
      {
        q: 'Чим app block відрізняється від app embed?',
        a: 'App block — це блок, який мерчант ставить у конкретну секцію через `@app`, і він рендериться там, де стоїть: відгуки під описом product. App embed — глобальний код, який вмикається перемикачем у theme settings і потрапляє в `head` або кінець `body` через `content_for_header`: чат, пікселі, попапи. Обидва — частина theme app extension і зникають разом із застосунком.',
        to: '/docs/shopify/blocks',
      },
      {
        q: 'Як зрозуміти, який застосунок гальмує сторінку?',
        a: 'Дивлюсь мережеву панель браузера: скрипти з чужих доменів, їхній розмір, час і чи блокують вони рендер. Потім вимикаю app embeds по одному в редакторі теми й порівнюю Lighthouse у preview — це найшвидший спосіб знайти винного, не чіпаючи код. Theme Inspector тут не допоможе: він міряє лише час Liquid на сервері, а застосунки гальмують у браузері.',
        to: '/interview?q=qa-s-performance-05',
      },
      {
        q: 'Що робити, якщо застосунок не підтримує блоки й вимагає правити `theme.liquid`?',
        a: 'Спершу перевірити, чи це справді так: більшість сучасних застосунків має theme app extension, а «вставте код у theme.liquid» часто лишилось у старій інструкції. Якщо вибору немає, вставку ізолюю: окремий сніпет із назвою застосунку, один `render` у layout, коментар із датою і посиланням, щоб наступний розробник знав, що це чуже. І чесно кажу клієнту, що це технічний борг, який зникне при зміні застосунку.',
        to: '/docs/shopify/blocks',
      },
    ],
  },
]

export const qaShopify1: InterviewQA[] = [...objects, ...architecture]
