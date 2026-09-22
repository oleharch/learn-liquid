import type { InterviewQA } from '../types'

/**
 * Банк питань співбесіди про Liquid У SHOPIFY: обʼєкти, архітектура теми, секції,
 * сніпети, продуктивність, безпека, налагодження й практичні задачі.
 * Базову мову (типи, оператори, цикли, фільтри) закриває `core.ts` — тут її не дублюємо.
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
      'Обʼєкти в Shopify діляться на глобальні й сторінкові. Глобальні — `shop`, `cart`, `customer`, `settings`, `routes`, `request`, `linklists`, `collections`, `all_products` — доступні в будь-якому файлі теми. Сторінкові зʼявляються лише у своєму шаблоні: `product` — на сторінці товару, `collection` — на колекції, `article` і `blog` — у блозі, `search` — у пошуку. На головній `product` — це просто `nil`: помилки не буде, вивід буде порожній, і саме тому такі баги тихі. Якщо товар потрібен поза своєю сторінкою, його беруть із налаштування секції, з колекції або через `all_products` за handle.',
    blocks: [
      {
        type: 'example',
        title: 'Головна сторінка: глобальні є, `product` — ні',
        preset: 'shop',
        template:
          'Магазин: {{ shop.name }}\nШаблон: {{ template.name }}\nТовар: [{{ product.title }}]\n{% if product %}є товар{% else %}product — nil, і Liquid мовчить{% endif %}',
        note: 'Порожні квадратні дужки — це і є `nil` у виводі. Жодної помилки, жодного попередження.',
      },
      {
        type: 'table',
        head: ['Обʼєкт', 'Де доступний', 'Примітка'],
        rows: [
          ['`shop`, `settings`, `routes`, `request`, `linklists`', 'всюди', 'безпечні в layout, секціях, сніпетах'],
          ['`cart`', 'всюди', 'це кошик поточної сесії, а не лише сторінка `/cart`'],
          ['`customer`', 'всюди', '`nil`, якщо клієнтка не увійшла'],
          ['`product`', 'шаблон `product`', 'поза ним — `nil`'],
          ['`collection`', 'шаблон `collection`; також товар, відкритий за адресою `/collections/x/products/y`', 'на «голій» адресі товару — `nil`'],
          ['`article`, `blog`, `page`, `search`', 'свої шаблони', 'поза ними — `nil`'],
          ['`section`, `block`', 'лише всередині файла секції / блока', 'сніпет, відрендерений із секції, теж бачить `section`; поза секцією — `nil`'],
        ],
      },
      {
        type: 'note',
        tone: 'warn',
        title: 'Пастка: секція «живе» на багатьох сторінках',
        text: 'В OS 2.0 ту саму секцію мерчант може додати в будь-який JSON-шаблон. Якщо секція мовчки спирається на `product`, на сторінці колекції вона відрендерить порожнечу. Або перевіряй `{% if product %}`, або обмеж секцію через `enabled_on` у схемі.',
      },
      {
        type: 'note',
        tone: 'tip',
        title: 'Що сказати, щоб виглядати сильніше',
        text: 'Згадай, що `template.name` і `request.page_type` дозволяють дізнатись, на якій ти сторінці, а обʼєкти Shopify — це **Drop-и**: властивості рахуються ліниво, тож саме звернення до `collection.products` чи `all_products[…]` коштує запиту, а не просто «читає поле».',
      },
    ],
    followUps: [
      'Як отримати конкретний товар на головній сторінці?',
      'Чим `request.page_type` відрізняється від `template.name`?',
      'Чому `collection` буває доступний на сторінці товару, а буває — ні?',
    ],
  },
  {
    id: 'qa-s-objects-02',
    topic: 'objects',
    level: 'junior',
    q: 'Чому `{{ product.price }}` виводить 64900, а не 649? Як правильно показувати ціни?',
    short:
      'Shopify зберігає і віддає в Liquid усі суми в найменших одиницях валюти — копійках, центах, — цілим числом. Так уникають помилок округлення з дробовими числами. Тому `product.price` дорівнює 64900, і ділити його на сто руками не треба: для виводу є фільтри `money`, `money_with_currency`, `money_without_trailing_zeros`, які беруть формат із налаштувань магазину. Арифметику — знижку, суму, різницю — роблять теж у копійках, а `money` ставлять останнім у ланцюжку.',
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
        text: '`{{ product.price | divided_by: 100 }} ₴` — улюблений антипатерн. Ділення цілого на ціле в Liquid **цілочисельне**, тож 64950 перетвориться на 649 і копійки зникнуть. До того ж ти жорстко зашив символ валюти й формат — у магазині з кількома валютами це зламається першим.',
      },
      {
        type: 'note',
        tone: 'tip',
        title: 'Сильніша відповідь',
        text: 'Додай, що ціни приходять у **валюті показу** (presentment currency) поточної клієнтки, а для валют без дрібних одиниць — єни, вони — Shopify все одно дописує два розряди: 1000 єн у Liquid це `100000`. Тому «поділити на сто» — не універсальне правило, а `money` — універсальне.',
      },
    ],
    followUps: [
      'Як передати ціну в JavaScript, щоб відформатувати її там?',
      'Чим `money` відрізняється від `money_with_currency` і коли потрібен другий?',
      'Де задається формат грошей магазину?',
    ],
  },
  {
    id: 'qa-s-objects-03',
    topic: 'objects',
    level: 'middle',
    q: 'Яка різниця між `product` і `variant`? І навіщо існує `selected_or_first_available_variant`, якщо є `selected_variant`?',
    short:
      'Товар — це картка: назва, опис, фото, теги, опції. Купують не товар, а варіант — конкретну комбінацію опцій зі своєю ціною, артикулом, залишком і доступністю; навіть у товару без опцій є один варіант «Default Title». У кошик завжди йде id варіанта. `selected_variant` повертає варіант лише тоді, коли в адресі є `?variant=…`, інакше це `nil`. `selected_or_first_available_variant` завжди щось повертає: обраний, якщо він є, інакше перший доступний, а якщо недоступні всі — просто перший. Тому стартовий стан сторінки товару будують на ньому.',
    blocks: [
      {
        type: 'example',
        title: 'Три властивості — три різні відповіді',
        preset: 'product',
        template:
          'selected_variant: [{{ product.selected_variant.title }}]\nfirst_available_variant: {{ product.first_available_variant.title }}\nselected_or_first_available_variant: {{ product.selected_or_first_available_variant.title }}\n\nproduct.price (найнижча серед варіантів): {{ product.price | money }}\n{% for v in product.variants %}\n{{ v.title }} — {{ v.price | money }}{% unless v.available %} — немає в наявності{% endunless %}\n{%- endfor %}',
        note: 'У пресеті в адресі немає `?variant=`, тому `selected_variant` порожній. `product.price` — це не «ціна товару», а мінімум серед варіантів.',
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
        text: 'Обраний варіант повертається **незалежно від доступності**. Якщо клієнтка прийшла за посиланням на розпроданий варіант, `selected_or_first_available_variant` віддасть саме його — тож кнопку «Купити» все одно треба вмикати через `variant.available`, а не вважати, що «first available» гарантує наявність.',
      },
      {
        type: 'note',
        tone: 'tip',
        title: 'Сильніша відповідь',
        text: 'Скажи, що «доступний» — це не лише залишок більше нуля: варіант доступний і тоді, коли для нього дозволено продаж у мінус (`inventory_policy: continue`) або облік залишків вимкнено. І що `product.has_only_default_variant` — правильний спосіб сховати перемикач у товару без опцій, замість порівнювати назву з «Default Title».',
      },
    ],
    followUps: [
      'Що саме відправляє форма `{% form \'product\' %}` — id товару чи варіанта?',
      'Як дізнатись, що в товару лише один варіант «за замовчуванням»?',
      'Де зберігається фото варіанта і що буде, якщо його немає?',
    ],
  },
  {
    id: 'qa-s-objects-04',
    topic: 'objects',
    level: 'middle',
    q: 'У колекції 300 товарів. Скільки з них виведе `{% for product in collection.products %}` і що з цим робити?',
    short:
      'Пʼятдесят. Цикл `for` у Shopify обмежений пʼятдесятьма ітераціями, і `collection.products` без пагінації віддає лише перші пʼятдесят товарів. Щоб показати решту, цикл загортають у `{% paginate collection.products by N %}` — тоді всередині тега `collection.products` уже означає поточну сторінку, а обʼєкт `paginate` дає номери сторінок і посилання. Важливо, що `paginate` впливає не лише на вивід, а й на те, скільки даних Shopify взагалі дістає з бази: `limit` у циклі цього не робить.',
    blocks: [
      {
        type: 'example',
        title: 'Сторінка по два товари',
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
        text: '`collection.products.size` усередині чи поза `paginate` — це розмір **того, що завантажено**, а не колекції. Кількість товарів у колекції — `collection.products_count` (з урахуванням фільтрів) і `collection.all_products_count` (без них).',
      },
      {
        type: 'note',
        tone: 'tip',
        title: 'Сильніша відповідь',
        text: 'Назви межі: довідка тега дозволяє розмір сторінки від 1 до 250, а гортати можна не далі 25 000-го елемента — для більших масивів їх треба спершу звузити фільтрами. І поясни, що велика сторінка — це не «зручніше», а важчий HTML і довший рендер: у реальних темах беруть 16–48 карток.',
      },
    ],
    followUps: [
      'Які ще масиви, крім товарів колекції, можна пагінувати?',
      'Як зробити «Показати ще» без перезавантаження сторінки?',
      'Чи можна мати два незалежні `paginate` на одній сторінці?',
    ],
  },
  {
    id: 'qa-s-objects-05',
    topic: 'objects',
    level: 'junior',
    q: 'Розкажи про обʼєкт `cart`: що таке `line_item` і чим `cart.item_count` відрізняється від `cart.items.size`?',
    short:
      'Обʼєкт `cart` — глобальний, це кошик поточної сесії, доступний на будь-якій сторінці. У ньому масив `items`, кожен елемент — `line_item`: рядок кошика, тобто варіант плюс кількість, зі своїми цінами, властивостями й посиланням на товар. `cart.items.size` — кількість рядків, а `cart.item_count` — сума кількостей: три рядки по дві штуки дадуть три й шість. Суми теж різні: `original_price` — до знижок, `final_price` — після, а поля з `line` у назві — те саме, помножене на кількість.',
    blocks: [
      {
        type: 'example',
        title: 'Рядки кошика',
        preset: 'cart',
        template:
          '{% for item in cart.items -%}\n{{ item.product.title }}{% if item.variant_title %} ({{ item.variant_title }}){% endif %} × {{ item.quantity }} = {{ item.final_line_price | money }}\n{%- if item.total_discount > 0 %} (знижка {{ item.total_discount | money }}){% endif %}\n{% endfor %}\nРядків: {{ cart.items.size }}, штук: {{ cart.item_count }}\nРазом: {{ cart.total_price | money }}',
      },
      {
        type: 'table',
        head: ['Поле `line_item`', 'Що це'],
        rows: [
          ['`original_price` / `final_price`', 'ціна за одиницю до / після знижок рядка'],
          ['`original_line_price` / `final_line_price`', 'те саме × `quantity`'],
          ['`total_discount`', 'сума знижок на рядок'],
          ['`key`', 'унікальний ключ рядка — саме ним, а не id варіанта, змінюють кількість через Cart API'],
          ['`properties`', 'довільні пари «назва — значення» (гравіювання, побажання), зібрані формою товару'],
          ['`product`, `variant`', 'повні обʼєкти — звідси беруть фото, метаполя, теги'],
        ],
      },
      {
        type: 'note',
        tone: 'warn',
        title: 'Пастка',
        text: 'Один варіант може лежати в кошику **двома рядками** — якщо в них різні `properties` або різні плани продажу. Тому лічильник «скільки цього варіанта в кошику» рахують фільтром `item_count_for_variant`, а змінюють рядок за `key`.',
      },
      {
        type: 'note',
        tone: 'tip',
        title: 'Сильніша відповідь',
        text: 'Скажи, що Liquid рендерить кошик **на момент запиту сторінки**. Усе, що відбувається після натискання «Додати» без перезавантаження, — це вже Cart AJAX API (`/cart/add.js`, `/cart/change.js`) плюс перемальовування розмітки через Section Rendering API. Властивості, назва яких починається з підкреслення, прийнято не показувати клієнтці — так теми ховають службові дані.',
      },
    ],
    followUps: [
      'Чим `cart.attributes` відрізняється від `line_item.properties`?',
      'Як оновити лічильник у шапці після додавання товару без перезавантаження?',
      'Де в `cart` видно знижки на весь кошик, а не на рядок?',
    ],
  },
  {
    id: 'qa-s-objects-06',
    topic: 'objects',
    level: 'junior',
    q: 'Як у темі зрозуміти, що клієнтка увійшла в акаунт? Що повертає `customer` для гостя?',
    short:
      'Для гостя глобальний обʼєкт `customer` дорівнює `nil`, тож перевірка входу — це просто `{% if customer %}`. Коли клієнтка увійшла, в обʼєкті є імʼя, email, теги, кількість замовлень, адреси й самі замовлення. На цьому будують привітання в шапці, посилання «Увійти» або «Кабінет», ціни чи блоки для певних тегів — наприклад, для оптових клієнтів. Головне памʼятати, що звернення до властивостей `nil` не ламає сторінку, а дає порожній рядок, тому без перевірки вийде «Привіт, !».',
    blocks: [
      {
        type: 'example',
        title: 'Гість',
        preset: 'shop',
        template:
          '{% if customer %}\n  Привіт, {{ customer.first_name }}!\n{% else %}\n  <a href="{{ routes.account_login_url }}">Увійти</a>\n{% endif %}\nБез перевірки: «Привіт, {{ customer.first_name }}!»',
        note: 'У пресеті `shop` клієнтки немає — як у гостя. Другий рядок показує, що буває без `if`.',
      },
      {
        type: 'example',
        title: 'Клієнтка увійшла',
        preset: 'customer',
        template:
          '{% if customer %}\n  Привіт, {{ customer.first_name }}! Замовлень: {{ customer.orders_count }}, витрачено {{ customer.total_spent | money }}.\n  {%- if customer.tags contains \'wholesale\' %}\n  Для вас діють оптові ціни.\n  {%- endif %}\n{% endif %}',
      },
      {
        type: 'note',
        tone: 'warn',
        title: 'Пастка',
        text: 'Сховати блок через `{% if customer.tags contains \'wholesale\' %}` — це **показ**, а не захист. Оптову ціну, приховану лише в темі, можна отримати напряму: товар доступний через `/products/handle.js`. Справжні B2B-ціни — це каталоги Shopify B2B або знижки на рівні платформи, а не Liquid.',
      },
      {
        type: 'note',
        tone: 'tip',
        title: 'Сильніша відповідь',
        text: 'Згадай, що посилання на вхід і кабінет беруть із `routes` (`routes.account_login_url`, `routes.account_url`), а не пишуть руками: з новими клієнтськими акаунтами й мовними префіксами адреса інша. І що персоналізований вивід робить сторінку гіршим кандидатом на кеш — тому важку персоналізацію краще довантажувати окремо.',
      },
    ],
    followUps: [
      'Як показати блок лише клієнткам із певним тегом і чому це не захист?',
      'Чи доступний `customer` на сторінці замовлення й у листах?',
      'Як вивести останні замовлення клієнтки?',
    ],
  },
  {
    id: 'qa-s-objects-07',
    topic: 'objects',
    level: 'middle',
    q: 'Що таке метаполя і як їх вивести в темі? Навіщо там `.value`?',
    short:
      'Метаполя — це додаткові типізовані поля, які можна причепити до товару, варіанта, колекції, клієнтки, сторінки, магазину. Звертаються до них через простір імен і ключ: `product.metafields.custom.care_guide`. Це повертає не значення, а обʼєкт метаполя з властивостями `type` і `value`, і саме `.value` віддає дані в правильному типі: число, булеве, дату, товар, файл чи масив для спискових типів. Створити метаполе з Liquid не можна — лише прочитати. Перед виводом завжди перевіряють на `blank`, бо в більшості товарів поле буде порожнє.',
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
        note: 'У пісочниці метаполе — звичайний JSON тієї самої форми (`type` + `value`). Відсутнє поле — `nil`, вивід порожній.',
      },
      {
        type: 'table',
        head: ['Тип метаполя', 'Що повертає `.value`'],
        rows: [
          ['`single_line_text_field`, `multi_line_text_field`', 'рядок'],
          ['`number_integer`, `number_decimal`', 'число'],
          ['`boolean`', '`true` / `false`'],
          ['`date`, `date_time`', 'рядок дати — форматуй фільтром `date`'],
          ['`product_reference`, `collection_reference`, `page_reference`', 'повноцінний обʼєкт: `….value.title`, `….value.url`'],
          ['`file_reference`', 'файл або медіа — картинку можна віддати в `image_url`'],
          ['`rich_text_field`', 'структура форматованого тексту — виводь через `metafield_tag`'],
          ['`list.*`', 'масив — перебирай циклом'],
          ['`metaobject_reference`', 'запис метаобʼєкта з власними полями'],
        ],
      },
      {
        type: 'code',
        lang: 'liquid',
        title: 'У справжній темі: готові фільтри виводу',
        code: '{{ product.metafields.custom.care_guide | metafield_tag }}\n{{ product.metafields.custom.ph | metafield_text }}\n\n{% for item in product.metafields.custom.pairs_with.value %}\n  {% render \'card-product\', product: item %}\n{% endfor %}',
      },
      {
        type: 'note',
        tone: 'warn',
        title: 'Пастка',
        text: 'Ключі `size`, `first` і `last` збігаються з вбудованими властивостями Liquid. Для них пиши квадратні дужки: `product.metafields.custom["size"]`, інакше на відсутньому полі отримаєш кількість метаполів у просторі імен замість порожнього значення.',
      },
      {
        type: 'note',
        tone: 'tip',
        title: 'Сильніша відповідь',
        text: 'Скажи, що в OS 2.0 метаполя можна **підʼєднувати до налаштувань секцій як динамічні джерела** просто в редакторі теми — без рядка коду. Тому перш ніж писати `product.metafields…` у секції, варто спитати себе, чи не краще дати мерчанту звичайне налаштування, яке він сам привʼяже до метаполя.',
      },
    ],
    followUps: [
      'Чим метаполе-посилання на товар краще за handle, збережений у текстовому полі?',
      'Як перебрати спискове метаполе, якщо в ньому більше 50 елементів?',
      'Що таке динамічні джерела в редакторі теми?',
    ],
  },
  {
    id: 'qa-s-objects-08',
    topic: 'objects',
    level: 'middle',
    q: 'Що таке метаобʼєкти і коли вони кращі за метаполя?',
    short:
      'Метаобʼєкт — це власний тип даних магазину: ти описуєш визначення з набором полів, наприклад «Інгредієнт» із назвою, описом і фото, а мерчант створює записи цього типу в адмінці. Метаполе додає одне поле до наявної сутності, а метаобʼєкт — це окрема сутність, яку можна перевикористати: один запис «Кератин» привʼязати до двадцяти товарів через метаполе-посилання. У Liquid до запису звертаються через `metaobjects.тип.handle`, перебирають через `metaobjects.тип.values`, а поля читають так само — через `.value`. Якщо ввімкнути для визначення веб-сторінки, кожен запис отримує власну адресу й шаблон `metaobject`.',
    blocks: [
      {
        type: 'code',
        lang: 'liquid',
        title: 'Три способи дістатись до записів',
        code: '{% comment %} 1. Конкретний запис за типом і handle {% endcomment %}\n{{ metaobjects.ingredients.keratin.title.value }}\n\n{% comment %} 2. Усі записи типу (цикл — до 50, далі paginate) {% endcomment %}\n{% for ingredient in metaobjects.ingredients.values %}\n  {{ ingredient.title.value }}\n{% endfor %}\n\n{% comment %} 3. Записи, привʼязані до товару списковим метаполем {% endcomment %}\n{% for ingredient in product.metafields.custom.ingredients.value %}\n  <h3>{{ ingredient.title.value }}</h3>\n  {{ ingredient.photo.value | image_url: width: 400 | image_tag }}\n{% endfor %}',
      },
      {
        type: 'table',
        head: ['', 'Метаполе', 'Метаобʼєкт'],
        rows: [
          ['Що це', 'одне додаткове поле сутності', 'окрема сутність із набором полів'],
          ['Де живе', 'на товарі, варіанті, колекції, сторінці…', 'сам по собі, у розділі «Контент»'],
          ['Перевикористання', 'значення дублюється в кожному товарі', 'один запис — багато посилань'],
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
        text: 'Сформулюй критерій вибору: якщо дані **повторюються між товарами** або мають **кілька повʼязаних полів** — це метаобʼєкт; якщо це одна характеристика конкретного товару — метаполе. І додай, що метаобʼєкти доступні як тип налаштування секції (`metaobject`, `metaobject_list`), тож мерчант може вибирати записи прямо в редакторі.',
      },
    ],
    followUps: [
      'Як вивести на сторінці товару блок «Склад», якщо інгредієнти — метаобʼєкти?',
      'Що буде з темою, якщо мерчант видалить запис, на який посилаються товари?',
      'Чим це краще за окрему сторінку чи блог для такого контенту?',
    ],
  },
  {
    id: 'qa-s-objects-09',
    topic: 'objects',
    level: 'middle',
    q: 'Навіщо потрібен `all_products` і які в нього обмеження?',
    short:
      'Обʼєкт `all_products` дозволяє дістати будь-який товар магазину за handle з будь-якого місця теми: `all_products[\'keratin-shampoo\']`. Це зручно, коли handle прийшов із тексту, метаполя старого типу чи налаштування. Але є жорстке обмеження: на одній сторінці можна звернутись не більше ніж до двадцяти унікальних handle, решта поверне порожній результат. До того ж перебрати `all_products` циклом не можна — це не список, а доступ за ключем. У сучасній темі його майже завжди замінюють налаштуваннями типу `product` і `product_list` або метаполями-посиланнями, які одразу повертають обʼєкт товару.',
    blocks: [
      {
        type: 'example',
        title: 'Товар за handle',
        preset: 'all',
        template:
          '{% assign oil = all_products[\'ends-oil\'] %}\n{{ oil.title }} — {{ oil.price | money }}\n\n{% assign ghost = all_products[\'no-such-handle\'] %}\nНеіснуючий handle: [{{ ghost.title }}]',
        note: 'Неіснуючий handle не дає помилки. У Shopify замість `nil` повертається порожня заглушка (`EmptyDrop`), яка в `if` поводиться як truthy, — тому наявність перевіряй порівнянням: `{% if oil != empty %}` або `oil.title != blank`.',
      },
      {
        type: 'table',
        head: ['Задача', 'Замість `all_products`'],
        rows: [
          ['Мерчант обирає товар для банера', 'налаштування секції типу `product` — віддає обʼєкт, у редакторі є пошук'],
          ['Ручна добірка з 8 товарів', 'налаштування `product_list`'],
          ['«З цим купують» для конкретного товару', 'метаполе `list.product_reference`'],
          ['Усі товари магазину', '`collections.all.products` із `paginate`'],
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
        text: 'Поясни, що handle — крихке посилання: мерчант перейменував товар, handle змінився — звʼязок зник. Метаполе-посилання й налаштування `product` тримаються за id, переживають перейменування, а видалений товар дають як `blank`, який легко перевірити.',
      },
    ],
    followUps: [
      'Як так само дістати колекцію чи сторінку за handle?',
      'Що повертає налаштування типу `product`, якщо товар видалили?',
      'Чому звернення за handle в циклі — погана ідея для продуктивності?',
    ],
  },
  {
    id: 'qa-s-objects-10',
    topic: 'objects',
    level: 'junior',
    q: 'Що таке handle у Shopify і де він використовується в Liquid?',
    short:
      'Handle — це людиночитний унікальний ідентифікатор ресурсу: назва, зведена до малих латинських літер і дефісів. Shopify генерує його з назви товару, колекції, сторінки, блогу чи меню, і саме він стоїть в адресі: `/products/keratin-shampoo`. У Liquid за handle звертаються до ресурсів — `collections[\'home-care\']`, `linklists[\'main-menu\']`, `pages[\'about\']`, — а сам він доступний як властивість `product.handle`. Для власних рядків є фільтр `handleize`: ним роблять CSS-класи, id та якорі з довільного тексту.',
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
        text: 'Handle створюється **один раз** — при створенні ресурсу. Якщо мерчант потім змінить назву, handle лишиться старим, а якщо змінить handle вручну — зламаються всі місця теми, де він зашитий рядком. Тому `collections[\'sale\']` у коді — це прихована залежність, про яку мерчант не знає. Краще дати налаштування типу `collection`.',
      },
      {
        type: 'note',
        tone: 'tip',
        title: 'Сильніша відповідь',
        text: 'Додай, що handle унікальний лише **в межах типу ресурсу**, а при збігу назв Shopify дописує суфікс (`-1`, `-2`). І що посилання треба будувати з `product.url` чи `routes`, а не клеїти `/products/` з handle: з мовними префіксами Shopify Markets адреса виглядає як `/en/products/…`.',
      },
    ],
    followUps: [
      'Що станеться з посиланням у коді, якщо мерчант змінить handle колекції?',
      'Чим `handleize` відрізняється від `url_encode`?',
      'Як звернутись до колекції, handle якої лежить у змінній?',
    ],
  },
  {
    id: 'qa-s-objects-11',
    topic: 'objects',
    level: 'senior',
    q: 'Клієнт хоче на картці товару «склад», «інструкцію», «сертифікати» і бейдж «веган». Де ви зберігатимете ці дані: теги, метаполя, метаобʼєкти чи налаштування секції?',
    short:
      'Я спершу розкладаю дані за двома питаннями: чи вони належать товару, чи сторінці, і чи повторюються між товарами. Бейдж «веган» — булеве метаполе: теги теж працюють, але вони нетипізовані й швидко перетворюються на смітник із префіксами. Інструкція — форматоване метаполе, унікальне для товару. Склад — метаобʼєкти «Інгредієнт» зі списковим посиланням із товару, бо той самий кератин описується один раз. Сертифікати — файлові метаполя або метаобʼєкт, якщо в сертифіката є назва й термін дії. Налаштування секції я лишаю для того, що стосується вигляду сторінки, а не даних товару: їх не видно через API, вони не імпортуються й живуть у JSON теми.',
    blocks: [
      {
        type: 'table',
        head: ['Сховище', 'Сильні сторони', 'Ціна'],
        rows: [
          ['Теги', 'миттєво, працюють у фільтрах колекції та автоматичних колекціях', 'рядки без типів; конвенції на кшталт `badge:vegan` ніхто не валідує; у Liquid — розбір рядків'],
          ['Метаполя', 'типи, валідація, масове редагування, API, динамічні джерела, фільтри Search & Discovery', 'значення дублюється між товарами'],
          ['Метаобʼєкти', 'один запис — багато товарів; кілька полів; власні сторінки', 'складніше наповнювати й імпортувати; ще один рівень `.value`'],
          ['Налаштування секції / блоки', 'мерчант бачить результат одразу в редакторі', 'дані привʼязані до теми й шаблону: зміна теми — і контент лишився в старій'],
        ],
      },
      {
        type: 'code',
        lang: 'liquid',
        title: 'Як це виглядає в секції товару',
        code: '{% if product.metafields.custom.is_vegan.value %}\n  <span class="badge">{{ \'products.badges.vegan\' | t }}</span>\n{% endif %}\n\n{% assign ingredients = product.metafields.custom.ingredients.value %}\n{% if ingredients != blank %}\n  <ul>\n    {% for ingredient in ingredients %}\n      <li>{{ ingredient.title.value }} — {{ ingredient.role.value }}</li>\n    {% endfor %}\n  </ul>\n{% endif %}',
      },
      {
        type: 'note',
        tone: 'warn',
        title: 'Пастка',
        text: 'Класична помилка — зробити окремий шаблон товару на кожну «особливу» сторінку і ввести контент у блоки секції. На десяти товарах це зручно, на трьохстах — це триста JSON-шаблонів, які неможливо масово оновити, а ліміт шаблонів у темі скінченний.',
      },
      {
        type: 'note',
        tone: 'tip',
        title: 'Сильніша відповідь',
        text: 'Проговори **хто і як наповнюватиме**: якщо контент-менеджер вантажить товари з таблиці, метаполя імпортуються, а блоки секцій — ні. І назви міграцію: дані в метаполях переживають зміну теми, дані в `settings_data.json` і шаблонах — ні. На senior-рівні це питання не про синтаксис, а про те, де в клієнта лежить правда.',
      },
      {
        type: 'note',
        tone: 'info',
        text: 'Компромісний варіант, який часто перемагає: дані — в метаполях, а в секції — блок із налаштуванням, **підʼєднаним до метаполя як до динамічного джерела**. Мерчант керує розташуванням і виглядом у редакторі, а контент лишається при товарі.',
      },
    ],
    followUps: [
      'Коли теги все ж кращі за метаполя?',
      'Як ви перенесете дані, якщо клієнт уже два роки веде все в тегах?',
      'Що з цього буде доступне застосункам і headless-вітрині?',
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
      'Тема — це фіксований набір папок, і Shopify не дозволяє вигадувати свої. У `layout` лежить каркас сторінки, у `templates` — шаблони типів сторінок, переважно JSON, у `sections` — секції й групи секцій, у `blocks` — блоки теми, у `snippets` — перевикористовувані шматки Liquid. `config` тримає схему й значення глобальних налаштувань, `locales` — переклади, `assets` — стилі, скрипти, шрифти й картинки теми. Вкладених папок немає, окрім `templates/customers` і `templates/metaobject`. Знаючи цю карту, у чужій темі орієнтуєшся за хвилину.',
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
          ['`sections`, `blocks`', 'з шаблонів, груп секцій або статично', 'розробник пише код, мерчант — налаштування'],
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
      'Які файли в темі обовʼязкові, щоб вона взагалі завантажилась?',
      'Де лежать шаблони сторінок акаунта клієнтки?',
      'Чому JSON-шаблони небезпечно перезаписувати при деплої?',
    ],
  },
  {
    id: 'qa-s-architecture-02',
    topic: 'architecture',
    level: 'middle',
    q: 'Клієнтка відкриває `/products/keratin-shampoo`. Розкажи по кроках, що відбувається в темі, поки не зʼявиться HTML.',
    short:
      'Shopify за адресою визначає тип сторінки й ресурс — це товар із таким handle — і шукає шаблон: `product.json` або альтернативний, якщо він призначений товару. JSON-шаблон — це список секцій із налаштуваннями й порядком; Shopify рендерить кожну секцію окремо, обгортаючи її у власний `div`. Отриманий HTML підставляється в layout на місце `content_for_layout`; сам layout, зазвичай `theme.liquid`, додає шапку й підвал через групи секцій, стилі, скрипти й `content_for_header`. Усе це відбувається на сервері, браузер отримує готовий HTML — жодного Liquid на клієнті немає.',
    blocks: [
      {
        type: 'list',
        ordered: true,
        items: [
          '**Маршрут.** `/products/keratin-shampoo` → тип сторінки `product`, у контекст кладеться обʼєкт `product`.',
          '**Шаблон.** `templates/product.json`, або `product.<суфікс>.json`, якщо мерчант призначив товару інший шаблон, або тимчасово через `?view=суфікс`.',
          '**Секції.** Для кожного запису з `order` Shopify бере файл із `sections/`, дає йому `section.settings` і `section.blocks` із JSON і рендерить.',
          '**Layout.** Результат стає значенням `content_for_layout` у `layout/theme.liquid` (або в тому layout, який вказав шаблон).',
          '**Групи секцій і статика.** Layout рендерить `{% sections \'header-group\' %}`, `{% sections \'footer-group\' %}` і сніпети.',
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
        text: 'Секції рендеряться **ізольовано**: змінна, створена через `assign` у layout чи в одній секції, в іншій не існує. Спільні дані передають через глобальні обʼєкти, `settings`, метаполя — або рахують повторно.',
      },
      {
        type: 'note',
        tone: 'tip',
        title: 'Сильніша відповідь',
        text: 'Додай, що той самий конвеєр можна викликати частково: **Section Rendering API** рендерить одну секцію в контексті будь-якої адреси й віддає її HTML — на цьому тримаються кошик-дровер, фільтри колекції й перемикач варіантів у сучасних темах.',
      },
    ],
    followUps: [
      'Як Shopify обирає, який саме шаблон товару взяти?',
      'Чому змінна з `theme.liquid` недоступна в секції?',
      'Що з цього ланцюжка можна закешувати, а що рендериться на кожен запит?',
    ],
  },
  {
    id: 'qa-s-architecture-03',
    topic: 'architecture',
    level: 'junior',
    q: 'Що таке `theme.liquid` і навіщо в ньому `content_for_header` та `content_for_layout`?',
    short:
      'Файл `layout/theme.liquid` — це каркас, спільний для всіх сторінок: `html`, `head`, `body`, шапка, підвал, підключення стилів і скриптів. У ньому обовʼязкові два обʼєкти. `content_for_layout` — місце, куди Shopify вставляє відрендерений шаблон поточної сторінки. `content_for_header` стоїть у `head` і виводить службові скрипти Shopify: аналітику, код застосунків, підтримку редактора теми. Без будь-якого з них тему просто не вдасться зберегти. Чіпати чи розбирати `content_for_header` не можна — його вміст змінюється без попередження.',
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
          ['`content_for_layout`', 'усередині `<body>`', 'HTML шаблону поточної сторінки'],
        ],
      },
      {
        type: 'note',
        tone: 'warn',
        title: 'Пастка',
        text: 'Старі «оптимізації» на кшталт `{{ content_for_header | replace: … }}`, якими намагались відкласти скрипти застосунків, ламаються при кожній зміні платформи й офіційно не підтримуються. Якщо застосунок гальмує — це розмова про застосунок, а не про рядкові заміни.',
      },
      {
        type: 'note',
        tone: 'tip',
        title: 'Сильніша відповідь',
        text: 'Згадай, що layout-ів може бути кілька: `password.liquid` для закритого магазину, власний — для лендингу. Liquid-шаблон обирає layout тегом `{% layout \'landing\' %}` або `{% layout none %}`, JSON-шаблон — ключем `"layout"` (значення `false` вимикає layout, але й редактор теми для такого шаблону).',
      },
    ],
    followUps: [
      'Як відрендерити сторінку зовсім без layout і навіщо це буває потрібно?',
      'Чому шапку й підвал тепер рендерять через `{% sections %}`, а не `{% section %}`?',
      'Що саме потрапляє в `content_for_header`?',
    ],
  },
  {
    id: 'qa-s-architecture-04',
    topic: 'architecture',
    level: 'middle',
    q: 'Чим JSON-шаблон відрізняється від Liquid-шаблону? Коли ще потрібен `.liquid`?',
    short:
      'Liquid-шаблон — це розмітка: що в ньому написано, те й відрендериться, і мерчант нічого не може змінити без розробника. JSON-шаблон розмітки не містить узагалі — це дані: які секції стоять на сторінці, в якому порядку і з якими налаштуваннями. Саме тому мерчант може в редакторі додавати, прибирати й переставляти секції на будь-якій сторінці. Для однієї сторінки існує або JSON, або Liquid-файл з тим самим імʼям, не обидва. Liquid лишився для того, що не є сторінкою з секціями: `gift_card.liquid`, `robots.txt.liquid`, або для віддачі нестандартного формату через альтернативний шаблон без layout.',
    blocks: [
      {
        type: 'table',
        head: ['', 'JSON-шаблон', 'Liquid-шаблон'],
        rows: [
          ['Вміст', 'список секцій, порядок, налаштування', 'HTML + Liquid'],
          ['Редактор теми', 'додавання, видалення, перестановка секцій', 'лише статичні секції, якщо вони є'],
          ['Хто змінює файл', 'розробник **і** редактор теми', 'лише розробник'],
          ['Блоки застосунків', 'так', 'ні'],
          ['Ліміти', 'до 25 секцій у шаблоні, до 50 блоків у секції, до 1000 JSON-шаблонів у темі', '—'],
          ['Де обовʼязковий', '—', '`gift_card.liquid`, `robots.txt.liquid`'],
        ],
      },
      {
        type: 'code',
        lang: 'json',
        title: 'Кореневі ключі JSON-шаблону',
        code: '{\n  "layout": "theme",\n  "wrapper": "div#product-page.page-width",\n  "sections": { "main": { "type": "main-product", "settings": {} } },\n  "order": ["main"]\n}',
      },
      {
        type: 'note',
        tone: 'warn',
        title: 'Пастка',
        text: 'У JSON-шаблоні **немає Liquid**. Умову «показати секцію лише для товарів із тегом» у шаблон не впишеш — вона живе або всередині секції, або в окремому альтернативному шаблоні, призначеному цим товарам.',
      },
      {
        type: 'note',
        tone: 'tip',
        title: 'Сильніша відповідь',
        text: 'Розкажи практичний трюк: Liquid-шаблон із `{% layout none %}` — це спосіб віддати з теми не HTML-сторінку, а, скажімо, JSON для власного скрипта: `collection.ajax.liquid`, який викликають як `?view=ajax`. І одразу додай, що сьогодні для цього краще підходить Section Rendering API — він не вимагає окремого шаблону.',
      },
    ],
    followUps: [
      'Що буде, якщо в темі є і `product.json`, і `product.liquid`?',
      'Як секція потрапляє в JSON-шаблон — руками чи через редактор?',
      'Як тримати JSON-шаблони в Git, якщо їх змінює мерчант?',
    ],
  },
  {
    id: 'qa-s-architecture-05',
    topic: 'architecture',
    level: 'senior',
    q: 'Вам дісталась «вінтажна» тема до Online Store 2.0. Клієнт хоче редагувати всі сторінки секціями. Як ви плануєте міграцію і де ризики?',
    short:
      'Суть OS 2.0 — «секції всюди»: сторінку описує JSON-шаблон, а не Liquid, тож міграція — це перенесення розмітки з шаблонів у секції. Я йду сторінка за сторінкою, починаючи з товару: вміст `product.liquid` стає секцією `main-product`, шаблон — `product.json`, який на неї посилається. Усе, що підключалось через `include`, переводжу на `render` і явні параметри — тут найбільше прихованих залежностей від зовнішніх змінних. Шапку й підвал виношу в групи секцій. Головні ризики — застосунки, які вписали свій код прямо в тему, і втрата налаштувань мерчанта з `settings_data.json`. Тому роблю це на копії теми, а перед запуском порівнюю сторінки старої й нової.',
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
          ['дані товару в тегах і хаках із описом', 'метаполя + динамічні джерела'],
          ['`img_url`, `img_tag`', '`image_url`, `image_tag`'],
        ],
      },
      {
        type: 'list',
        ordered: true,
        items: [
          'Копія теми й інвентаризація: шаблони, альтернативні шаблони, сніпети застосунків, використання `include`.',
          'Спершу `render` замість `include` — окремим кроком, бо він ламає приховані залежності ще до міграції шаблонів.',
          'Шаблон за шаблоном: розмітка → секція `main-*`, файл шаблону → JSON. Старий `.liquid` видаляється — поруч вони жити не можуть.',
          'Схеми: `presets` для секцій, які мерчант додаватиме сам; `enabled_on`, щоб секція товару не опинилась у блозі.',
          'Групи секцій для шапки й підвалу, блок `@app` у головних секціях.',
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
        text: 'Чесно постав під сумнів саму міграцію: якщо тема стара, обросла латками й клієнту однаково потрібен редизайн, **дешевше взяти сучасну базу** (Dawn або тему на блоках теми) і перенести дизайн, ніж рефакторити шаблон за шаблоном. Senior називає обидва шляхи й критерій вибору — обсяг кастомної логіки, яку доведеться зберегти.',
      },
    ],
    followUps: [
      'Як знайти в темі код, який лишили застосунки?',
      'Що робити з альтернативними шаблонами, яких у клієнта сорок?',
      'Як ви перевірите, що після міграції нічого не зникло?',
    ],
  },
  {
    id: 'qa-s-architecture-06',
    topic: 'architecture',
    level: 'middle',
    q: 'Що таке альтернативні шаблони? Як зробити окремий вигляд сторінки для частини товарів?',
    short:
      'Альтернативний шаблон — це ще один файл шаблону того самого типу із суфіксом у назві: `product.preorder.json` поруч із `product.json`. Мерчант призначає його конкретному товару, колекції чи сторінці в адмінці, у полі «Шаблон теми», або створює прямо з редактора теми. У Liquid суфікс видно як `template.suffix`. Будь-який шаблон можна тимчасово примірити до сторінки параметром `?view=preorder` — це зручно для перевірки. Важливо, що шаблон — це властивість ресурсу, а не теми: якщо в новій темі файла з таким суфіксом немає, товар відкриється звичайним шаблоном.',
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
        note: 'У пісочниці `template` — звичайний обʼєкт, тому другий рядок виведе `[object Object]`. У Shopify `{{ template }}` друкує імʼя цілком — `product.preorder`.',
        shopifyOutput: '<body class="template-product template-product--preorder">\nproduct.preorder',
      },
      {
        type: 'note',
        tone: 'warn',
        title: 'Пастка',
        text: 'Альтернативний шаблон — не спосіб зберігати контент. Окремий JSON на кожен товар заради унікального тексту закінчується сотнями файлів, які не оновиш масово, і впирається в ліміт JSON-шаблонів у темі. Унікальний контент — у метаполя, а шаблон — один на **тип** сторінки.',
      },
      {
        type: 'note',
        tone: 'tip',
        title: 'Сильніша відповідь',
        text: 'Скажи, що гілкування `{% if template.suffix == \'preorder\' %}` усередині секції — запах: логіку вигляду краще виразити складом секцій у самому шаблоні. І що при перенесенні теми треба перевіряти список призначених суфіксів, бо магазин памʼятає їх незалежно від теми.',
      },
    ],
    followUps: [
      'Де мерчант призначає шаблон товару?',
      'Що станеться з товаром, якщо в опублікованій темі немає його шаблону?',
      'Як масово призначити шаблон сотні товарів?',
    ],
  },
  {
    id: 'qa-s-architecture-07',
    topic: 'architecture',
    level: 'middle',
    q: 'Що таке групи секцій і яку проблему вони розвʼязали?',
    short:
      'Група секцій — це JSON-файл у папці `sections`, який описує набір секцій для ділянки layout: шапки, підвалу, бічної панелі. У layout його рендерять тегом `{% sections \'header-group\' %}`. До появи груп шапка й підвал були статичними секціями: мерчант міг змінити їхні налаштування, але не міг додати над шапкою рядок оголошень чи ще один блок у підвал. Тепер ці зони поводяться як JSON-шаблон — секції можна додавати, прибирати й переставляти, і туди ж стають блоки застосунків. Формат майже той самий, що в шаблону, плюс обовʼязкові `type` і `name`.',
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
          ['Що рендерить', 'одну секцію статично', 'групу секцій із JSON'],
          ['Мерчант може додати секцію поруч', 'ні', 'так'],
          ['Блоки застосунків як окремі секції', 'ні', 'так'],
          ['Де зберігаються налаштування', '`settings_data.json`', 'у файлі групи'],
          ['`section.location`', '`static`', 'тип групи: `header`, `footer`, `aside`, `custom.<імʼя>`'],
        ],
      },
      {
        type: 'note',
        tone: 'warn',
        title: 'Пастка',
        text: 'Щоб у шапку не потрапила секція «Відгуки» на пів екрана, секції обмежують у схемі: `"enabled_on": { "groups": ["header"] }` для рядка оголошень і `"disabled_on": { "groups": ["header", "footer"] }` для контентних. Без цього редактор запропонує в шапку весь каталог секцій.',
      },
      {
        type: 'note',
        tone: 'tip',
        title: 'Сильніша відповідь',
        text: 'Назви ліміти — група, як і шаблон, вміщує до 25 секцій по 50 блоків — і наслідок для верстки: між секціями групи немає жодної розмітки-обгортки, тож «липка» шапка чи спільний фон мають триматись на самих секціях, а не на контейнері групи.',
      },
    ],
    followUps: [
      'Як заборонити додавати секцію товару в підвал?',
      'Чи можна мати різні шапки на різних сторінках?',
      'Як у секції дізнатись, що вона стоїть у шапці, а не в шаблоні?',
    ],
  },
  {
    id: 'qa-s-architecture-08',
    topic: 'architecture',
    level: 'junior',
    q: 'Як у темі зроблені переклади? Що робить фільтр `t`?',
    short:
      'Усі тексти інтерфейсу теми — «Додати в кошик», «Немає в наявності» — лежать не в розмітці, а в JSON-файлах папки `locales`, по файлу на мову. У шаблоні пишуть ключ і фільтр `t`: `{{ \'products.product.add_to_cart\' | t }}`, і Shopify підставляє рядок мовою поточної клієнтки. Одна мова позначена як типова — її файл має `default` у назві, і з нього беруться рядки, яких бракує в інших. Фільтр уміє підставляти змінні та обирати форму множини за параметром `count`. Якщо ключа немає ніде, на сторінці зʼявиться текст «translation missing» — помилка видима, і це добре.',
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
        text: 'Переклади **екрануються**: HTML у рядку перекладу вийде на сторінку як текст із кутовими дужками. Щоб розмітка спрацювала, ключ має закінчуватись на `_html`. І навпаки: додавати `_html` «про всяк випадок» — означає вимкнути захист там, де він був.',
      },
      {
        type: 'note',
        tone: 'tip',
        title: 'Сильніша відповідь',
        text: 'Розділи два світи: `uk.json` — тексти **вітрини** для фільтра `t`, а `uk.schema.json` — тексти **редактора теми**: назви секцій і налаштувань, на які схема посилається як `"label": "t:sections.header.name"`. А контент мерчанта — назви товарів, тексти секцій — перекладається не файлами теми, а через Shopify Markets і застосунок перекладів.',
      },
    ],
    followUps: [
      'Як перекласти назву налаштування в схемі секції?',
      'Що буде, якщо ключ є в типовій мові, але його немає в поточній?',
      'Як перекладаються назви товарів і тексти, які мерчант увів у секції?',
    ],
  },
  {
    id: 'qa-s-architecture-09',
    topic: 'architecture',
    level: 'senior',
    q: '`settings_schema.json` і `settings_data.json` — у чому різниця? І як ви деплоїте тему, щоб не затерти те, що мерчант налаштував у редакторі?',
    short:
      'Схема описує, які глобальні налаштування існують: тип, id, підпис, типове значення — її пише розробник. Дані зберігають те, що мерчант обрав у редакторі, і цей файл переписує Shopify при кожному збереженні. У Liquid обидва зливаються в обʼєкт `settings`. Проблема деплою в тому, що мерчант змінює не лише `settings_data.json`, а й JSON-шаблони та групи секцій, тож «залити все з Git» означає відкотити його роботу. Я розділяю власність: код деплою завжди, а файли мерчанта або виключаю з push, або спершу стягую з живої теми й комічу. Реліз іде через копію теми, яку перевіряють і публікують, а не поверх живої.',
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
          ['`shopify theme push` з ігноруванням `config/settings_data.json`, `templates/*.json`, `sections/*.json` (через `.shopifyignore` або `--ignore`)', 'робота мерчанта недоторкана', 'нова секція не зʼявиться в шаблоні сама — її додають руками або окремою міграцією'],
          ['Перед релізом `theme pull` цих файлів із живої теми й коміт', 'Git відображає реальність', 'дисципліна; конфлікти, якщо мерчант редагує під час релізу'],
          ['Інтеграція з GitHub: гілка ↔ тема, двобічна синхронізація', 'зміни мерчанта самі стають комітами', 'шумна історія; збірка (Sass, бандлер) потребує окремої гілки з результатом'],
          ['Реліз через копію живої теми + публікація', 'можна перевірити й миттєво відкотитись', 'зміни мерчанта, зроблені в живій темі після копіювання, треба переносити'],
        ],
      },
      {
        type: 'note',
        tone: 'warn',
        title: 'Пастка',
        text: 'Зміна `id` налаштування у схемі — це не рефакторинг, а **видалення даних**: значення в `settings_data.json` привʼязане до старого id і просто перестане читатись. Те саме з `type` секції у JSON-шаблонах після перейменування файла секції.',
      },
      {
        type: 'note',
        tone: 'tip',
        title: 'Сильніша відповідь',
        text: 'Скажи, що типові значення мають жити у **схемі** (`default`), а не в `settings_data.json`: тоді нове налаштування працює одразу після деплою коду, навіть якщо файл даних ти не чіпав. І що `current` у файлі даних може бути як обʼєктом, так і назвою пресета — на цьому ламаються скрипти, які парсять файл навмання.',
      },
    ],
    followUps: [
      'Що станеться з налаштуваннями мерчанта, якщо перейменувати `id` у схемі?',
      'Як додати нову секцію на живу головну сторінку, не перезаписуючи `index.json`?',
      'Де зберігаються налаштування статичних секцій?',
    ],
  },
  {
    id: 'qa-s-architecture-10',
    topic: 'architecture',
    level: 'middle',
    q: 'Як тема підключає стилі й скрипти з `assets`? Що думаєш про файли на кшталт `theme.css.liquid`?',
    short:
      'Усе з папки `assets` віддає CDN Shopify, а адресу будує фільтр `asset_url`: він додає версію файла, тож після зміни кеш скидається сам. Далі адресу загортають у `stylesheet_tag`, у власний тег `script` з `defer` або в `preload_tag`. Файли з розширенням `.css.liquid` чи `.js.liquid` проганяються через Liquid, і колись так передавали в CSS кольори з налаштувань. Сьогодні це вважається застарілим підходом: такий файл бачить лише `settings` і фільтри, погано дружить зі збіркою й лінтерами, а будь-яка зміна налаштувань міняє весь файл. Замість цього кольори виводять CSS-змінними в `theme.liquid` або в тегу `style` секції, а сам CSS лишають статичним.',
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
        text: 'У `.liquid`-асеті **немає обʼєктів сторінки**: ні `product`, ні `section`, ні `request`. Спроба написати там `{% if template.name == \'product\' %}` мовчки нічого не дасть — файл рендериться окремо від сторінки й один на всіх.',
      },
      {
        type: 'note',
        tone: 'tip',
        title: 'Сильніша відповідь',
        text: 'Згадай, що Shopify сам мінімізує CSS і JavaScript з `assets` і стискає їх на CDN, тож окремий крок мініфікації в збірці не обовʼязковий. А якщо збірка є (Vite, esbuild), її результат кладуть у `assets` пласким списком — підпапок там немає.',
      },
    ],
    followUps: [
      'Як скидається кеш CSS після оновлення теми?',
      'Чим `asset_url` відрізняється від `file_url`?',
      'Як передати колір із налаштувань секції в CSS без `.css.liquid`?',
    ],
  },
  {
    id: 'qa-s-architecture-11',
    topic: 'architecture',
    level: 'senior',
    q: 'Клієнт ставить застосунок відгуків. Чим блоки застосунків кращі за старий спосіб, коли застосунок дописував код у тему? Що для цього має підтримувати тема?',
    short:
      'Раніше застосунок через API редагував файли теми: додавав сніпет і рядок `include` у шаблон. Після видалення застосунку код лишався, після оновлення теми зникав, а тема поступово обростала чужими вставками, які ніхто не наважувався прибрати. Theme app extension перевертає модель: код живе в застосунку, а в тему потрапляє лише посилання — блок застосунку в секції або вбудовування в `head` чи `body`, яке мерчант вмикає в редакторі. Видалив застосунок — зникло все. Від теми потрібно небагато: JSON-шаблони, секції, що приймають блоки типу `@app` і рендерять їх, та бажано окрема секція-обгортка для блоків застосунків.',
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
          ['Глобальний код (чат, пікселі)', 'рядок у `theme.liquid`', 'app embed, вмикається перемикачем'],
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
      'Чим app block відрізняється від app embed?',
      'Як зрозуміти, який застосунок гальмує сторінку?',
      'Що робити, якщо застосунок не підтримує блоки й вимагає правити `theme.liquid`?',
    ],
  },
]

/* ═══════════════════════ sections ═══════════════════════ */

const sections: InterviewQA[] = [
  {
    id: 'qa-s-sections-01',
    topic: 'sections',
    level: 'middle',
    q: 'Розкажи, з чого складається `{% schema %}` секції. Які ключі там бувають і за що кожен відповідає?',
    short:
      'Схема — це блок JSON у кінці файлу секції, який описує секцію для редактора теми. `name` — як секція називається в списку, `tag` і `class` керують обгорткою, `settings` — налаштування самої секції, `blocks` і `max_blocks` — які блоки всередині й скільки їх дозволено, `presets` — готові конфігурації для кнопки «Додати секцію», `default` — початкова конфігурація статичної секції, `locales` — переклади самої секції, `limit` — скільки разів секцію можна додати, `enabled_on` і `disabled_on` — де її взагалі можна використати. Схема нічого не друкує: це дані для редактора, а не розмітка. Вона мусить бути строгим JSON — Liquid усередині не виконується, коментарі й зайві коми ламають усю секцію.',
    blocks: [
      {
        type: 'code',
        lang: 'json',
        title: 'Схема з усіма ключами (sections/benefits.liquid)',
        code: '{\n  "name": "Переваги",\n  "tag": "section",\n  "class": "benefits",\n  "limit": 1,\n  "settings": [\n    { "type": "text", "id": "heading", "label": "Заголовок", "default": "Чому Liquid Lab" },\n    { "type": "range", "id": "columns", "label": "Колонок", "min": 2, "max": 4, "step": 1, "default": 3 }\n  ],\n  "blocks": [\n    {\n      "type": "feature",\n      "name": "Перевага",\n      "settings": [\n        { "type": "text", "id": "text", "label": "Текст", "default": "Безсульфатний склад" }\n      ]\n    }\n  ],\n  "max_blocks": 6,\n  "presets": [\n    {\n      "name": "Переваги",\n      "category": "Текст",\n      "blocks": [{ "type": "feature" }, { "type": "feature" }, { "type": "feature" }]\n    }\n  ],\n  "locales": {\n    "uk": { "title": "Переваги" },\n    "en": { "title": "Benefits" }\n  },\n  "enabled_on": { "templates": ["index", "product"] }\n}',
      },
      {
        type: 'example',
        title: 'Значення з `default` — це те, що бачить Liquid до першого дотику мерчанта',
        template:
          '<h2>{{ section.settings.heading }}</h2>\n<p>Колонок: {{ section.settings.columns }}</p>\n<p>Блоків у пресеті: {{ section.blocks.size }}</p>\n{% schema %}\n{\n  "name": "Переваги",\n  "tag": "section",\n  "settings": [\n    { "type": "text", "id": "heading", "label": "Заголовок", "default": "Чому Liquid Lab" },\n    { "type": "range", "id": "columns", "label": "Колонок", "min": 2, "max": 4, "step": 1, "default": 3 }\n  ],\n  "blocks": [\n    { "type": "feature", "name": "Перевага", "settings": [{ "type": "text", "id": "text", "label": "Текст", "default": "Безсульфатний склад" }] }\n  ],\n  "presets": [\n    { "name": "Переваги", "blocks": [{ "type": "feature" }, { "type": "feature" }, { "type": "feature" }] }\n  ]\n}\n{% endschema %}',
        note: 'Сам `{% schema %}` у вивід не потрапив. Пісочниця зібрала обʼєкт `section` так само, як це зробив би редактор: налаштування — з `default`, блоки — з першого пресета.',
      },
      {
        type: 'table',
        head: ['Ключ', 'За що відповідає', 'Чого варто памʼятати'],
        rows: [
          ['`name`', 'назва в редакторі', 'локалізується через `locales` або файл перекладів схеми'],
          ['`tag`', 'HTML-тег обгортки', 'типово `div`; дозволені `article`, `aside`, `div`, `footer`, `header`, `section`'],
          ['`class`', 'класи на обгортці', 'дописуються до вбудованого `shopify-section`'],
          ['`limit`', 'скільки разів секцію можна додати', 'допустимі значення — 1 або 2'],
          ['`settings`', 'налаштування секції', '`id` мають бути унікальні в межах секції'],
          ['`blocks`', 'типи блоків усередині', 'назви й типи блоків унікальні'],
          ['`max_blocks`', 'стеля кількості блоків', '50 — граничне значення платформи'],
          ['`presets`', 'варіанти для «Додати секцію»', 'без пресета секцію не додати в JSON-шаблон'],
          ['`default`', 'початковий стан статичної секції', 'тільки для секцій, що вставляються `{% section %}`'],
          ['`locales`', 'переклади самої секції', 'читаються як `{{ \'sections.benefits.title\' | t }}`'],
          ['`enabled_on` / `disabled_on`', 'де секцію дозволено', 'разом не використовуються — тільки щось одне'],
        ],
      },
      {
        type: 'note',
        tone: 'warn',
        title: 'Пастка',
        text: 'Схема — строгий JSON. Кома після останнього елемента, коментар `//`, одинарні лапки чи `{{ settings.x }}` усередині ламають не тег, а **всю секцію**: Shopify відмовиться її зберігати, а на сторінці зʼявиться помилка. І тег має бути один на файл, останнім у файлі, і лише в секції — у сніпеті `{% schema %}` не працює.',
      },
      {
        type: 'note',
        tone: 'tip',
        title: 'Сильніша відповідь',
        text: 'Згадай `tag` і `class`: замість того щоб писати свій `<section class="benefits">` усередині, ти кажеш це схемі — і отримуєш на один вузол менше, а обгортка лишається тією самою, яку редактор уміє підсвічувати. І назви `id` налаштувань як контракт: перейменував `id` — мерчант втратив збережене значення, бо `settings_data.json` тримає саме старий ключ.',
      },
    ],
    followUps: [
      'Що станеться, якщо в схемі буде невалідний JSON?',
      'Чому `{% schema %}` не можна покласти в сніпет?',
      'Як перекласти назву секції для двох мов магазину?',
    ],
  },
  {
    id: 'qa-s-sections-02',
    topic: 'sections',
    level: 'junior',
    q: 'Чим `settings` відрізняються від `blocks` у секції? Коли що обирати?',
    short:
      'Налаштування — це поля самої секції: їх фіксована кількість, вони описані в схемі раз і доступні як `section.settings.<id>`. Блоки — це повторювані елементи, які мерчант сам додає, видаляє й перетягує в редакторі: їх перебирають циклом по `section.blocks`, а в кожного блока є свій `type`, `id` і власні `settings`. Правило просте: якщо елемент один і завжди на місці — це налаштування, якщо їх може бути нуль, три або сім — це блоки. Типова секція має і те, і те: заголовок та відступи в `settings`, а самі картки — блоками.',
    blocks: [
      {
        type: 'example',
        title: 'Одна секція: заголовок — налаштування, картки — блоки',
        view: 'html',
        template:
          '<h2>{{ section.settings.heading }}</h2>\n<ul>\n{% for block in section.blocks %}\n  <li>{{ block.settings.text }} <small>({{ block.type }}, {{ block.id }})</small></li>\n{% else %}\n  <li>Блоків ще немає — додай у редакторі</li>\n{% endfor %}\n</ul>\n{% schema %}\n{\n  "name": "Переваги",\n  "settings": [{ "type": "text", "id": "heading", "label": "Заголовок", "default": "Чому Liquid Lab" }],\n  "blocks": [\n    { "type": "feature", "name": "Перевага", "settings": [{ "type": "text", "id": "text", "label": "Текст" }] },\n    { "type": "quote", "name": "Цитата", "settings": [{ "type": "text", "id": "text", "label": "Текст" }] }\n  ],\n  "presets": [\n    { "name": "Переваги", "blocks": [\n      { "type": "feature", "settings": { "text": "Безсульфатний склад" } },\n      { "type": "feature", "settings": { "text": "Доставка за добу" } },\n      { "type": "quote", "settings": { "text": "«Волосся живе» — Софія К." }}\n    ]}\n  ]\n}\n{% endschema %}',
        note: '`{% else %}` всередині `{% for %}` спрацює, коли мерчант видалить усі блоки. Без нього секція просто зникне зі сторінки, і мерчант подумає, що зламалась тема.',
      },
      {
        type: 'table',
        head: ['', '`settings`', '`blocks`'],
        rows: [
          ['Скільки', 'фіксовано схемою', 'мерчант додає й видаляє сам'],
          ['Доступ', '`section.settings.heading`', '`{% for block in section.blocks %}`'],
          ['Порядок', 'не має значення', 'мерчант перетягує, порядок — частина контенту'],
          ['Типи', 'усі поля однієї секції', 'різні `type` з різним набором полів'],
          ['Приклад', 'заголовок, кількість колонок, колір фону', 'картка переваги, слайд, пункт FAQ'],
        ],
      },
      {
        type: 'note',
        tone: 'warn',
        title: 'Пастка',
        text: 'На кожному кореневому елементі блока мусить бути `{{ block.shopify_attributes }}` — без нього редактор не знає, який DOM-вузол якому блоку відповідає, і перетягування блоків перестає підсвічуватись. Другий класичний недогляд — забути `{% else %}` у циклі по блоках.',
      },
      {
        type: 'note',
        tone: 'tip',
        title: 'Сильніша відповідь',
        text: 'Скажи, що блоки — це ще й спосіб НЕ множити секції: замість «Банер із текстом», «Банер із кнопкою» і «Банер із двома кнопками» робиш одну секцію з блоками `text` і `button`. І що `case block.type` усередині циклу читається краще за ланцюжок `if`, бо одразу видно повний перелік типів.',
      },
    ],
    followUps: [
      'Як вивести різну розмітку для різних типів блоків?',
      'Що буде, якщо мерчант видалить усі блоки?',
      'Чи можна дати блоку блоки всередині?',
    ],
  },
  {
    id: 'qa-s-sections-03',
    topic: 'sections',
    level: 'junior',
    q: 'Які бувають типи налаштувань у схемі і що вони повертають у Liquid?',
    short:
      'Налаштування діляться на базові й спеціалізовані. Базові — це прості поля вводу: `text`, `textarea`, `checkbox`, `number`, `range`, `select`, `radio`, — вони повертають рядок, число або булеве. Спеціалізовані повертають уже готовий обʼєкт Shopify: `product` дає обʼєкт товару, `collection` — колекцію, `image_picker` — зображення, `link_list` — меню, `color` — колір, `metaobject` — запис метаобʼєкта, а `*_list` — масив таких обʼєктів. Окремо стоять `header` і `paragraph` — це не поля, а оформлення самої панелі налаштувань, у них немає `id`, і в Liquid вони не потрапляють. Головне памʼятати: спеціалізоване налаштування може повернути порожнечу, якщо мерчант нічого не вибрав або видалив ресурс, тож перед виводом завжди є перевірка.',
    blocks: [
      {
        type: 'example',
        title: 'Що реально лежить у `section.settings`',
        template:
          'Заголовок: {{ section.settings.heading }}\nПоказувати вендора: {{ section.settings.show_vendor }}\nКолонок: {{ section.settings.columns }}\nВирівнювання: {{ section.settings.align }}\nКолір: {{ section.settings.accent }}\n{% schema %}\n{\n  "name": "Сітка товарів",\n  "settings": [\n    { "type": "header", "content": "Вміст" },\n    { "type": "text", "id": "heading", "label": "Заголовок", "default": "Хіти догляду" },\n    { "type": "checkbox", "id": "show_vendor", "label": "Показувати бренд", "default": true },\n    { "type": "range", "id": "columns", "label": "Колонок", "min": 2, "max": 5, "step": 1, "default": 4 },\n    { "type": "select", "id": "align", "label": "Вирівнювання", "options": [{ "value": "left", "label": "Ліворуч" }, { "value": "center", "label": "По центру" }], "default": "center" },\n    { "type": "color", "id": "accent", "label": "Акцент", "default": "#0e8f8b" },\n    { "type": "paragraph", "content": "Товари беруться з обраної колекції." }\n  ]\n}\n{% endschema %}',
        note: '`header` і `paragraph` у виводі не зʼявились — вони не мають `id` і живуть лише в панелі редактора. `checkbox` дав справжнє булеве, `range` — число.',
        shopifyOutput:
          'У справжній темі `section.settings.accent` — це обʼєкт кольору, а не рядок: у нього є `.red`, `.alpha`, і його можна віддати у фільтри `color_*`. У виводі він друкується як `#0e8f8b`, тож рядок вище збігається.',
      },
      {
        type: 'table',
        head: ['Тип', 'Що віддає в Liquid', 'Для чого'],
        rows: [
          ['`text`, `textarea`', 'рядок', 'заголовки, короткі підписи'],
          ['`richtext`, `inline_richtext`', 'рядок із HTML', 'абзаци з жирним і посиланнями'],
          ['`checkbox`', '`true` / `false`', 'перемикачі — можна одразу в `{% if %}`'],
          ['`number`, `range`', 'число (`number` може бути порожнім)', '`range` кращий: є межі й крок'],
          ['`select`, `radio`, `text_alignment`', 'рядок-значення', 'варіанти розкладки, стилю'],
          ['`color`, `color_background`, `color_scheme`', 'колір / схему кольорів', 'віддавай у `{% style %}`'],
          ['`image_picker`', 'обʼєкт зображення або `nil`', 'банери, фон — далі в `image_url`'],
          ['`url`, `video_url`, `video`', 'рядок або обʼєкт', 'посилання кнопки, відео'],
          ['`product`, `collection`, `page`, `blog`, `article`', 'готовий обʼєкт або порожнечу', 'мерчант шукає ресурс у редакторі'],
          ['`product_list`, `collection_list`, `article_list`', 'масив обʼєктів', 'ручні добірки'],
          ['`link_list`', 'обʼєкт меню', 'навігація, футер'],
          ['`metaobject`, `metaobject_list`', 'запис або масив записів', 'власні типи даних магазину'],
          ['`font_picker`', 'обʼєкт шрифту', 'типографіка в налаштуваннях теми'],
          ['`header`, `paragraph`', 'нічого — це оформлення панелі', 'розділяє довгий список налаштувань'],
        ],
      },
      {
        type: 'note',
        tone: 'warn',
        title: 'Пастка',
        text: 'Налаштування типу `product` чи `collection` повертає **порожнечу**, якщо мерчант ще нічого не вибрав або видалив ресурс. Код `{% for p in section.settings.list.products %}` без перевірки просто мовчки нічого не покаже, а `{{ section.settings.image | image_url: width: 800 }}` на порожньому зображенні віддасть порожній `src`. Перевіряй через `!= blank` і став запасний варіант — `placeholder_svg_tag` або нічого.',
      },
      {
        type: 'note',
        tone: 'tip',
        title: 'Сильніша відповідь',
        text: 'Додай два робочі правила. Перше: `range` замість `number`, бо мерчант не введе «сто колонок». Друге: спеціалізовані типи замість тексту — налаштування `collection` тримається за id і переживає перейменування, а поле «впишіть handle колекції» ламається від першої ж правки назви.',
      },
    ],
    followUps: [
      'Чим `richtext` відрізняється від `inline_richtext` і від `html`?',
      'Як дати мерчанту вибрати колір і використати його в CSS?',
      'Що повертає налаштування `product`, якщо товар видалили?',
    ],
  },
  {
    id: 'qa-s-sections-04',
    topic: 'sections',
    level: 'middle',
    q: 'Чим `presets` відрізняються від `default` у схемі? Що коли писати?',
    short:
      'Обидва ключі описують початковий стан секції й мають однакову форму — `settings` і `blocks`, — але працюють у різних сценаріях. `presets` роблять секцію доступною в кнопці «Додати секцію»: без жодного пресета мерчант просто не зможе поставити її в JSON-шаблон. `default` — навпаки, для секції, яку код вставляє сам через `{% section %}`: там нема чого додавати, але треба, щоб із коробки вона виглядала осмислено. Пресетів може бути кілька — це різні готові варіанти однієї секції, і в редакторі вони показуються окремими пунктами. Правило: динамічна секція — `presets`, статична — `default`, обидва одночасно писати не треба.',
    blocks: [
      {
        type: 'example',
        title: '`default` для статичної секції',
        template:
          '<p>{{ section.settings.text }}</p>\n<p>Блоків: {{ section.blocks.size }}</p>\n{% schema %}\n{\n  "name": "Смужка оголошень",\n  "settings": [{ "type": "text", "id": "text", "label": "Текст", "default": "Безкоштовна доставка від 1500 ₴" }],\n  "blocks": [{ "type": "message", "name": "Повідомлення", "settings": [{ "type": "text", "id": "body", "label": "Текст" }] }],\n  "default": { "blocks": [{ "type": "message", "settings": { "body": "Знижка −15% на перше замовлення" } }] }\n}\n{% endschema %}',
        note: 'Пресетів тут немає взагалі — і секція все одно має вміст. Саме так живе `announcement-bar`, яку `theme.liquid` вставляє сама.',
      },
      {
        type: 'code',
        lang: 'json',
        title: 'Кілька пресетів — один файл, три варіанти в редакторі',
        code: '"presets": [\n  {\n    "name": "Банер із текстом",\n    "category": "Банери",\n    "settings": { "layout": "text-left" }\n  },\n  {\n    "name": "Банер на всю ширину",\n    "category": "Банери",\n    "settings": { "layout": "full", "overlay": 40 }\n  },\n  {\n    "name": "Банер із трьома перевагами",\n    "category": "Банери",\n    "settings": { "layout": "text-left" },\n    "blocks": [{ "type": "feature" }, { "type": "feature" }, { "type": "feature" }]\n  }\n]',
      },
      {
        type: 'table',
        head: ['', '`presets`', '`default`'],
        rows: [
          ['Для якої секції', 'динамічної (JSON-шаблон, група секцій)', 'статичної — вставленої `{% section %}`'],
          ['Скільки', 'скільки завгодно', 'один'],
          ['Що дає мерчанту', 'пункт у «Додати секцію»', 'нічого — він її не додає й не видаляє'],
          ['Якщо не написати', 'секції немає в списку додавання', 'секція зʼявиться порожньою'],
          ['Форма', '`name`, `category`, `settings`, `blocks`', 'ті самі `settings`, `blocks`'],
        ],
      },
      {
        type: 'note',
        tone: 'warn',
        title: 'Пастка',
        text: '`presets` і `default` — це стан на момент **створення**. Мерчант додав секцію, змінив заголовок — і твоя правка пресета його вже не торкнеться: значення живе в `settings_data.json` або в JSON-шаблоні. Тому «я ж змінив default, чому на сайті старий текст» — нормальна поведінка, а не баг.',
      },
      {
        type: 'note',
        tone: 'tip',
        title: 'Сильніша відповідь',
        text: 'Скажи, що секція з пресетами не має рендеритись статично: якщо вона і в `theme.liquid` через `{% section %}`, і в списку додавання, мерчант отримає дві копії й не зрозуміє, чому одна не видаляється. І згадай `category` — на великій темі без категорій список «Додати секцію» перетворюється на суцільну стіну з тридцяти пунктів.',
      },
    ],
    followUps: [
      'Чому секції немає в списку «Додати секцію»?',
      'Як дати мерчанту два різні макети однієї секції?',
      'Де фізично зберігаються значення, які мерчант поставив у редакторі?',
    ],
  },
  {
    id: 'qa-s-sections-05',
    topic: 'sections',
    level: 'middle',
    q: 'Чим статична секція відрізняється від динамічної? Коли яку робити?',
    short:
      'Статична секція вставлена в код: `{% section \'header\' %}` у `theme.liquid` або в шаблоні. Її не можна ні прибрати, ні пересунути, ні додати вдруге — мерчант лише міняє її налаштування, а її `section.id` дорівнює імені файлу. Динамічна секція живе в JSON-шаблоні або в групі секцій: мерчант додає її кнопкою «Додати секцію», перетягує й видаляє, а `id` їй генерує Shopify. Обидві — той самий файл у теці `sections`, різниця лише в тому, хто вирішує, де вона стоїть. Статичними лишають ті секції, що мусять бути на кожній сторінці й у фіксованому місці, а все інше в сучасній темі роблять динамічним — власне, заради цього й придумали OS 2.0.',
    blocks: [
      {
        type: 'example',
        title: 'Статична вставка: `{% section %}` бере файл і обгортає його',
        preset: 'shop',
        view: 'html',
        template: '{% section \'promo\' %}',
        snippets: {
          'sections/promo':
            '<p>{{ section.settings.text }}</p>\n<small>section.id = {{ section.id }}</small>\n{% schema %}\n{\n  "name": "Промо",\n  "settings": [{ "type": "text", "id": "text", "label": "Текст", "default": "Безкоштовна доставка від 1500 ₴" }],\n  "default": { "settings": {} }\n}\n{% endschema %}',
        },
        note: 'Shopify сам обгорнув секцію в `<div id="shopify-section-promo" class="shopify-section">` — цю обгортку ти не пишеш, але саме за нею редактор знаходить секцію на сторінці. `section.id` для статичної секції — це імʼя файлу.',
      },
      {
        type: 'table',
        head: ['', 'Статична', 'Динамічна'],
        rows: [
          ['Як потрапляє на сторінку', '`{% section \'name\' %}` у коді', 'мерчант додає в редакторі'],
          ['Де описана', 'у `theme.liquid` або шаблоні', 'у JSON-шаблоні / групі секцій'],
          ['`section.id`', 'імʼя файлу', 'згенерований Shopify'],
          ['Скільки копій', 'одна, там де вписана', 'скільки дозволить `limit`'],
          ['Початковий стан', '`default`', '`presets`'],
          ['`section.index`', '`nil`', 'номер у своїй групі, з 1'],
          ['Типові приклади', 'шапка, футер, смужка оголошень', 'банер, сітка товарів, FAQ, відгуки'],
        ],
      },
      {
        type: 'note',
        tone: 'warn',
        title: 'Пастка',
        text: 'Статичну секцію не можна вставити двічі на одну сторінку: два `{% section \'promo\' %}` дадуть два DOM-вузли з однаковим `id="shopify-section-promo"`, і редактор плутатиметься, яку з них підсвічувати. Якщо потрібна та сама розмітка двічі — це сніпет або динамічна секція, а не другий виклик.',
      },
      {
        type: 'note',
        tone: 'shopify',
        text: 'У OS 2.0 навіть шапка й футер зазвичай не вписані в `theme.liquid` напряму, а лежать у **групах секцій** — `sections/header-group.json`, — які layout підтягує тегом `{% sections \'header-group\' %}`. Тоді мерчант може, наприклад, додати смужку оголошень над шапкою, не чіпаючи код.',
      },
      {
        type: 'note',
        tone: 'tip',
        title: 'Сильніша відповідь',
        text: 'Поясни критерій через власність: статичне — це те, за що відповідає розробник (позиція шапки), динамічне — те, за що відповідає мерчант (порядок промо-блоків на головній). І додай, що `section.index` у статичній секції `nil`, тож оптимізації на кшталт «нижче третьої секції вантажимо картинки ліниво» на ній не спрацюють.',
      },
    ],
    followUps: [
      'Що таке група секцій і чим вона краща за статичну вставку?',
      'Чому `section.index` буває `nil`?',
      'Як зробити, щоб секція була доступна лише на сторінці товару?',
    ],
  },
  {
    id: 'qa-s-sections-06',
    topic: 'sections',
    level: 'middle',
    q: 'Навіщо потрібен `block.shopify_attributes` і що зламається, якщо його не поставити?',
    short:
      'Це набір `data`-атрибутів, який редактор теми використовує, щоб повʼязати блок у панелі зліва з конкретним вузлом DOM на превʼю. Ставлять його на кореневий елемент кожного блока, просто `{{ block.shopify_attributes }}` серед атрибутів. Без нього блок продовжує працювати на живому сайті, але в редакторі ламається вся інтерактивність: клік по блоку в панелі не прокручує до нього й не підсвічує, перетягування не показує, що саме рухається, а Shopify не може оновити один блок — доводиться перезавантажувати всю секцію. На живій вітрині цей вивід порожній, тож жодної ціни в розмітці він не має.',
    blocks: [
      {
        type: 'example',
        title: 'Що саме друкується',
        template:
          '{% for block in section.blocks %}\n<div class="feature" {{ block.shopify_attributes }}>{{ block.settings.text }}</div>\n{% endfor %}\n{% schema %}\n{\n  "name": "Переваги",\n  "blocks": [{ "type": "feature", "name": "Перевага", "settings": [{ "type": "text", "id": "text", "label": "Текст" }] }],\n  "presets": [{ "name": "Переваги", "blocks": [\n    { "type": "feature", "settings": { "text": "Безсульфатний склад" } },\n    { "type": "feature", "settings": { "text": "Доставка за добу" } }\n  ]}]\n}\n{% endschema %}',
        note: 'Пісочниця показує атрибути завжди, щоб їх було видно. **У справжньому магазині цей вивід порожній** — атрибути зʼявляються лише всередині редактора теми.',
        shopifyOutput:
          'На живій вітрині: <div class="feature" >Безсульфатний склад</div> — `block.shopify_attributes` не повертає нічого поза редактором.',
      },
      {
        type: 'table',
        head: ['Що робить мерчант у редакторі', 'З атрибутами', 'Без атрибутів'],
        rows: [
          ['Клікає блок у панелі', 'превʼю прокручується й підсвічує блок', 'нічого не відбувається'],
          ['Перетягує блок', 'видно, який елемент рухається', 'видно лише перестановку в панелі'],
          ['Міняє текст блока', 'оновлюється точково', 'перемальовується вся секція'],
          ['Додає блок', 'новий блок одразу в фокусі', 'мерчант сам шукає його очима'],
        ],
      },
      {
        type: 'note',
        tone: 'warn',
        title: 'Пастка',
        text: 'Атрибути не можна обгортати в лапки — `{{ block.shopify_attributes }}` уже друкує готову пару `атрибут="значення"`, тож `data-x="{{ block.shopify_attributes }}"` дасть поламану розмітку. І ставити їх треба саме на **кореневий** елемент блока: якщо блок рендериться сніпетом, атрибути передають усередину параметром або лишають обгортку в секції.',
      },
      {
        type: 'note',
        tone: 'tip',
        title: 'Сильніша відповідь',
        text: 'Скажи, що це половина контракту з редактором. Друга половина — події JavaScript: `shopify:block:select`, `shopify:block:deselect`, `shopify:section:load`. Слайдер без підписки на `shopify:block:select` у редакторі поводиться безглуздо — мерчант клікає третій слайд, а на превʼю лишається перший. Саме такі речі відрізняють «секція працює» від «секцію зручно налаштовувати».',
      },
    ],
    followUps: [
      'Які ще події редактора теми ти знаєш і навіщо вони?',
      'Чи є аналог цих атрибутів для самої секції?',
      'Як зробити, щоб слайдер у редакторі показував обраний слайд?',
    ],
  },
  {
    id: 'qa-s-sections-07',
    topic: 'sections',
    level: 'middle',
    q: 'Що обмежують `max_blocks` і `limit`? І що станеться, якщо мерчант упреться в цю межу?',
    short:
      '`max_blocks` — це стеля кількості блоків усередині однієї секції: коли мерчант її досягає, кнопка «Додати блок» у редакторі просто перестає бути доступною. Гранична величина платформи — пʼятдесят блоків на секцію, і `max_blocks` дозволяє поставити своє, менше число. `limit` — про іншу вісь: скільки разів саму секцію можна додати в один шаблон чи групу секцій, і допустимі значення тут лише один або два. Обидва обмеження — не про техніку, а про дизайн: вони не дають зламати макет, у який фізично влазить чотири картки, і не дають поставити дві шапки. Ніякої помилки мерчант не побачить — він просто не зможе додати зайве.',
    blocks: [
      {
        type: 'example',
        title: 'Секція знає, скільки в неї блоків',
        template:
          'Блоків зараз: {{ section.blocks.size }}\n{% if section.blocks.size > 0 %}\n  Класи сітки: grid grid--{{ section.blocks.size }}\n{% endif %}\n{% schema %}\n{\n  "name": "Переваги",\n  "max_blocks": 4,\n  "blocks": [{ "type": "feature", "name": "Перевага", "settings": [{ "type": "text", "id": "text", "label": "Текст" }] }],\n  "presets": [{ "name": "Переваги", "blocks": [{ "type": "feature" }, { "type": "feature" }, { "type": "feature" }] }]\n}\n{% endschema %}',
        note: '`section.blocks.size` — звичайний розмір масиву. На ньому зручно будувати клас сітки, щоб три картки й чотири виглядали по-різному без окремого налаштування.',
      },
      {
        type: 'table',
        head: ['', '`max_blocks`', '`limit`'],
        rows: [
          ['Що рахує', 'блоки всередині секції', 'копії секції в шаблоні / групі'],
          ['Допустимі значення', 'до 50 — це стеля платформи', '1 або 2'],
          ['Якщо не вказати', 'діє платформна стеля 50', 'обмеження немає'],
          ['Як виглядає для мерчанта', '«Додати блок» недоступна', 'секції немає в списку додавання'],
          ['Навіщо', 'макет розрахований на N карток', 'шапка, футер, головний банер — по одному'],
        ],
      },
      {
        type: 'note',
        tone: 'warn',
        title: 'Пастка',
        text: 'Обмеження діє лише в редакторі. Якщо мерчант редагує JSON-шаблон файлом або розробник приносить готовий `templates/index.json` із десятьма блоками там, де `max_blocks` рівний чотирьом, зайві блоки все одно опиняться в даних. Тому верстка мусить виживати на будь-якій кількості: сітка на `auto-fit`, а не три жорстко прибиті колонки.',
      },
      {
        type: 'note',
        tone: 'tip',
        title: 'Сильніша відповідь',
        text: 'Скажи, що `max_blocks` — це документація дизайну всередині коду: воно пояснює наступному розробнику, чому в CSS рівно чотири варіанти сітки. І додай чесний компроміс: занизиш — мерчант проситиме правку кожні два тижні; лишиш стелю — отримаєш секцію з тридцятьма блоками й скаргу, що «сайт повільний», бо кожен блок тягне своє зображення.',
      },
    ],
    followUps: [
      'Скільки блоків витримає секція без шкоди для швидкості?',
      'Що буде, якщо блоків більше, ніж `max_blocks`?',
      'Як зробити секцію, яку можна додати лише один раз?',
    ],
  },
  {
    id: 'qa-s-sections-08',
    topic: 'sections',
    level: 'senior',
    q: 'Навіщо в схемі `enabled_on` і `disabled_on`? Як ти вирішуєш, що з них писати?',
    short:
      'Це фільтр доступності секції: `enabled_on` каже, де її МОЖНА додати, `disabled_on` — де НЕ можна, і в одній схемі має бути щось одне. Обидва приймають `templates` — перелік типів шаблонів, і `groups` — перелік груп секцій на кшталт `header` чи `footer`, а зірочка означає «усі». Це не безпека, а дисципліна редактора: без них список «Додати секцію» на сторінці товару показує сорок пунктів, половина з яких там безглузда. Вибираю за тим, що коротше й стабільніше описати: секція «Форма товару» осмислена лише на одному шаблоні — пишу `enabled_on`, а секція «Відгуки» доречна всюди, крім кошика й чекауту — тоді `disabled_on`.',
    blocks: [
      {
        type: 'code',
        lang: 'json',
        title: 'Дозвіл: секція осмислена лише там, де є обʼєкт `product`',
        code: '{\n  "name": "Форма товару",\n  "enabled_on": { "templates": ["product"] },\n  "settings": [\n    { "type": "checkbox", "id": "show_quantity", "label": "Поле кількості", "default": true }\n  ]\n}',
      },
      {
        type: 'code',
        lang: 'json',
        title: 'Заборона: секція доречна майже всюди, крім кількох місць',
        code: '{\n  "name": "Відгуки",\n  "disabled_on": { "templates": ["cart"], "groups": ["header", "footer"] },\n  "presets": [{ "name": "Відгуки" }]\n}',
      },
      {
        type: 'table',
        head: ['Ситуація', 'Що пишу', 'Чому'],
        rows: [
          ['Секція спирається на `product`', '`enabled_on: templates: ["product"]`', 'поза шаблоном товару обʼєкт `nil`, і секція мовчки порожня'],
          ['Секція спирається на `collection`', '`enabled_on: templates: ["collection"]`', 'те саме — порожня сітка без помилки'],
          ['Шапка, футер, оголошення', '`enabled_on: groups: [...]`', 'у тіло сторінки такій секції нема чого потрапляти'],
          ['Універсальний банер', 'нічого або `disabled_on`', 'заборон менше, ніж дозволів'],
          ['Секція для кастомної сторінки', '`enabled_on: templates: ["page"]`', 'разом із суфіксом шаблону — `page.contact`'],
        ],
      },
      {
        type: 'note',
        tone: 'warn',
        title: 'Пастка',
        text: 'Обмеження діє лише на **додавання** в редакторі. Секцію, яку вже додали, вимикання не прибирає: вона лишається в JSON-шаблоні й далі рендериться. Тому звужувати `enabled_on` на живій темі — окрема операція: спершу перевіряєш, де секція вже стоїть, і лише потім міняєш схему. І `enabled_on` разом із `disabled_on` в одній схемі — помилка, а не «подвійний фільтр».',
      },
      {
        type: 'note',
        tone: 'tip',
        title: 'Сильніша відповідь',
        text: 'Зведи це до ширшої думки: секція, доступна там, де її обʼєкти — `nil`, це прихована пастка для мерчанта. Він додає «Форму товару» на головну, бачить порожнечу й пише, що тема зламана. Або обмежуй схемою, або став усередині чесний запобіжник: `{% if product == blank %}` і повідомлення, видиме лише в редакторі за `request.design_mode`.',
      },
    ],
    followUps: [
      'Що буде з уже доданими секціями, якщо звузити `enabled_on`?',
      'Як обмежити секцію конкретним суфіксом шаблону?',
      'Чому `enabled_on` не можна вважати захистом?',
    ],
  },
  {
    id: 'qa-s-sections-09',
    topic: 'sections',
    level: 'senior',
    q: 'Що таке theme blocks і `{% content_for \'blocks\' %}`? Чим вони кращі за звичайні блоки секції?',
    short:
      'Theme blocks — це блоки, винесені в окремі файли теки `blocks`, кожен зі своєю схемою. Секція більше не описує блоки всередині себе: вона пише в схемі `{"type": "@theme"}` і ставить у розмітці `{% content_for \'blocks\' %}` — цей тег рендерить усі блоки, які мерчант додав, у їхньому порядку. Головна вигода — перевикористання: один файл `blocks/text.liquid` працює в десятьох секціях, а не копіюється десять разів. Друга — вкладеність: theme block може сам приймати блоки, тож із них збирають довільні композиції прямо в редакторі. Поруч із `@theme` у списку блоків пишуть `@app`, і тоді в ту саму область мерчант може вставити блок застосунку.',
    blocks: [
      {
        type: 'example',
        title: 'Секція нічого не знає про свої блоки',
        view: 'html',
        template:
          '<div class="hero">\n{% content_for \'blocks\' %}\n</div>\n{% schema %}\n{\n  "name": "Головний банер",\n  "blocks": [{ "type": "@theme" }, { "type": "@app" }],\n  "presets": [{\n    "name": "Головний банер",\n    "blocks": [\n      { "type": "title", "settings": { "text": "Догляд після кератину" } },\n      { "type": "button", "settings": { "label": "До каталогу", "url": "/collections/home-care" } }\n    ]\n  }]\n}\n{% endschema %}',
        snippets: {
          'blocks/title':
            '<h2 {{ block.shopify_attributes }}>{{ block.settings.text }}</h2>\n{% schema %}\n{ "name": "Заголовок", "settings": [{ "type": "text", "id": "text", "label": "Текст" }] }\n{% endschema %}',
          'blocks/button':
            '<a class="btn" href="{{ block.settings.url }}" {{ block.shopify_attributes }}>{{ block.settings.label }}</a>\n{% schema %}\n{ "name": "Кнопка", "settings": [{ "type": "text", "id": "label", "label": "Напис" }, { "type": "url", "id": "url", "label": "Адреса" }] }\n{% endschema %}',
        },
        note: 'У секції немає ні `{% for %}`, ні `case block.type` — розмітку кожного блока тримає його власний файл. У пісочниці значення підставлені з пресета; у справжній темі вони беруться з `default` у схемі самого блока.',
      },
      {
        type: 'table',
        head: ['', 'Блоки секції', 'Theme blocks'],
        rows: [
          ['Де описані', 'у схемі секції', 'окремі файли в теці `blocks`'],
          ['Перевикористання', 'копіюєш у кожну секцію', 'один файл — багато секцій'],
          ['Рендер', '`{% for block in section.blocks %}`', '`{% content_for \'blocks\' %}`'],
          ['Вкладеність', 'немає', 'блок може приймати блоки'],
          ['Розмітка блока', 'усередині секції, часто через `case`', 'у файлі блока, поряд зі схемою'],
          ['Блок застосунку', 'через `{"type": "@app"}`', 'так само, поряд із `@theme`'],
        ],
      },
      {
        type: 'code',
        lang: 'liquid',
        title: 'Статичний блок у фіксованому місці',
        code: '{% comment %} Блок, який мерчант не додає й не пересуває, але налаштовує {% endcomment %}\n{% content_for \'block\', type: \'price\', id: \'main-price\' %}\n\n{% comment %} А решта — вільна зона {% endcomment %}\n{% content_for \'blocks\' %}',
      },
      {
        type: 'note',
        tone: 'warn',
        title: 'Пастка',
        text: 'Theme blocks — це вже не «трохи нового синтаксису», а інша модель теми: у секції зникає `case block.type`, а разом із ним — контроль над тим, що всередині. Композиція, яку мерчант збере вкладеними блоками, може бути будь-якою, тож CSS не має права спиратись ні на порядок, ні на глибину. І перевір версію: старі теми з блоками в схемі працюють далі, але змішувати в одній секції `@theme` і власний список типів не вийде.',
      },
      {
        type: 'note',
        tone: 'tip',
        title: 'Сильніша відповідь',
        text: 'Назви ціну переходу. Виграш — менше дублювання й мерчант збирає сторінку сам; втрата — дизайн-система перестає бути гарантією: будь-який блок може опинитись у будь-якому контейнері. Тому theme blocks вимагають дисциплінованого CSS на токенах і відступах контейнера, а не на `.hero h2`. І згадай статичні блоки через `{% content_for \'block\' %}` — ними лишають на місці те, що рухати не можна: ціну, кнопку купівлі.',
      },
    ],
    followUps: [
      'Як обмежити, які саме theme blocks можна покласти в секцію?',
      'Що таке статичний блок і коли він потрібен?',
      'Як живе CSS блока — `{% stylesheet %}` у файлі блока чи спільний файл?',
    ],
  },
  {
    id: 'qa-s-sections-10',
    topic: 'sections',
    level: 'senior',
    q: 'Що таке Section Rendering API і де ти його реально використовував?',
    short:
      'Це можливість попросити в Shopify відрендерений HTML однієї секції замість цілої сторінки: до будь-якої адреси додаєш `?sections=імʼя-секції` і отримуєш JSON, де ключ — id секції, а значення — готова розмітка; або `?section_id=` — і тоді приходить сам HTML. Секція рендериться в контексті тієї сторінки, до адреси якої ти звернувся, і поважає її параметри — `q`, `page`, фільтри. За один запит можна попросити до пʼяти секцій. Це основний спосіб зробити живий кошик, фасетну фільтрацію без перезавантаження й рекомендації товарів: логіка лишається в Liquid, а JavaScript просто підміняє шматок DOM. Настройки секції через API не передаються — беруться ті, що збережені в темі.',
    blocks: [
      {
        type: 'code',
        lang: 'js',
        title: 'Фасетна фільтрація: підміняємо сітку й панель фільтрів',
        code: 'async function applyFilters(url) {\n  const target = new URL(url, window.location.origin)\n  target.searchParams.set(\'sections\', \'main-collection-product-grid,collection-filters\')\n\n  const res = await fetch(target)\n  const sections = await res.json()\n\n  for (const [id, html] of Object.entries(sections)) {\n    // Секція, що не відрендерилась, приходить як null при статусі 200.\n    if (!html) continue\n    const fresh = new DOMParser().parseFromString(html, \'text/html\')\n    document.getElementById(`shopify-section-${id}`)\n      .replaceWith(fresh.getElementById(`shopify-section-${id}`))\n  }\n\n  // Адресу міняємо самі — API цього не робить.\n  history.pushState({}, \'\', url)\n}',
      },
      {
        type: 'code',
        lang: 'js',
        title: 'Кошик: додали товар — оновили дровер однією відповіддю',
        code: 'await fetch(`${window.Shopify.routes.root}cart/add.js`, {\n  method: \'POST\',\n  headers: { \'Content-Type\': \'application/json\' },\n  body: JSON.stringify({\n    items: [{ id: variantId, quantity: 1 }],\n    // Ajax Cart API вміє повернути секції разом із відповіддю — без другого запиту.\n    sections: \'cart-drawer,cart-icon-bubble\',\n    sections_url: window.location.pathname,\n  }),\n})',
      },
      {
        type: 'table',
        head: ['Параметр', 'Що повертає', 'Коли зручніший'],
        rows: [
          ['`?sections=a,b`', 'JSON: `{ "a": "<html>", "b": "<html>" }`', 'коли оновлюєш кілька місць одразу'],
          ['`?section_id=a`', 'сам HTML секції', 'одна секція, простий `innerHTML`'],
          ['`sections` у тілі Cart Ajax API', 'секції поряд із новим станом кошика', 'додавання в кошик — один запит замість двох'],
        ],
      },
      {
        type: 'note',
        tone: 'warn',
        title: 'Пастка',
        text: 'Секція, яка не відрендерилась, приходить як `null`, а статус відповіді лишається 200 — перевіряти треба значення, а не `res.ok`. Далі: відповідь містить обгортку `shopify-section-…`, тож наївний `innerHTML = html` дає вкладену обгортку в обгортці, і другий клік уже не знаходить потрібний вузол. І на міжнародних магазинах адресу будуй від `window.Shopify.routes.root`, інакше мовний префікс загубиться.',
      },
      {
        type: 'note',
        tone: 'tip',
        title: 'Сильніша відповідь',
        text: 'Сформулюй, ЧОМУ це правильний підхід: розмітка лишається в Liquid в одному екземплярі. Альтернатива — тягнути JSON і збирати картку товару в JavaScript — означає другу копію шаблону картки, яка неминуче розʼїдеться з першою, і втрату всього, що дає Liquid: цін у валюті покупця, перекладів, метаполів. І згадай, що після підміни DOM треба заново привʼязати обробники — тому сучасні теми будують такі шматки на веб-компонентах, які оживають самі.',
      },
    ],
    followUps: [
      'Скільки секцій можна попросити за один запит?',
      'Як зробити, щоб після підміни DOM знову працювали обробники подій?',
      'Чому фільтрацію колекції краще робити цим API, ніж через Storefront API?',
    ],
  },
  {
    id: 'qa-s-sections-11',
    topic: 'sections',
    level: 'middle',
    q: 'Чим `{% style %}` відрізняється від `{% stylesheet %}`? Коли який?',
    short:
      '`{% style %}` друкує на місці справжній тег `<style>` з атрибутом `data-shopify`, і всередині нього працює Liquid — тому це єдиний спосіб віддати в CSS значення налаштувань секції. `{% stylesheet %}` навпаки: його вміст на місці не друкується взагалі, Shopify збирає його зі всіх секцій і блоків у спільний файл стилів теми, і Liquid усередині НЕ виконується. Розподіл простий: усе статичне — в `{% stylesheet %}` або у звичайний файл у `assets`, а в `{% style %}` лишається тільки те, що залежить від налаштувань, і то у вигляді CSS-змінних на обгортці секції. Так динамічної частини мало, і вона не дублюється на кожній копії секції.',
    blocks: [
      {
        type: 'example',
        title: 'Один друкується на місці, другий — ні',
        preset: 'shop',
        view: 'html',
        template:
          '{% style %}\n  #shopify-section-{{ section.id }} {\n    --promo-accent: {{ settings.colors_accent }};\n    --promo-pad: {{ section.settings.padding }}px;\n  }\n{% endstyle %}\n{% stylesheet %}\n  .promo { padding: var(--promo-pad); color: var(--promo-accent); }\n{% endstylesheet %}\n<div class="promo">Знижка вже в кошику</div>\n{% schema %}\n{\n  "name": "Промо",\n  "settings": [{ "type": "range", "id": "padding", "label": "Відступ", "min": 0, "max": 64, "step": 4, "default": 24 }]\n}\n{% endschema %}',
        note: 'У виводі є `<style data-shopify>` зі значеннями з налаштувань — і немає жодного рядка з `{% stylesheet %}`. Саме тому в `{% stylesheet %}` немає сенсу писати Liquid: його там просто нікому виконувати.',
      },
      {
        type: 'table',
        head: ['', '`{% style %}`', '`{% stylesheet %}`'],
        rows: [
          ['Куди потрапляє', 'у HTML на місці виклику', 'у спільний файл стилів теми'],
          ['Liquid усередині', 'виконується', 'НЕ виконується'],
          ['Кешування браузером', 'ні — це частина HTML', 'так, окремий файл із кешем'],
          ['Скільки на файл', 'скільки завгодно', 'один тег на файл'],
          ['Для чого', 'значення налаштувань, кольори, відступи', 'уся статична верстка секції'],
        ],
      },
      {
        type: 'note',
        tone: 'warn',
        title: 'Пастка',
        text: 'Динамічна секція буває на сторінці в кількох копіях, тож селектори в `{% style %}` мусять бути привʼязані до конкретної секції — `#shopify-section-{{ section.id }}` або `.promo-{{ section.id }}`. Голий `.promo { … }` у двох копіях секції означає, що друга перекриє першу, і мерчант побачить, як налаштування одного банера міняють інший.',
      },
      {
        type: 'note',
        tone: 'shopify',
        text: 'Кольорові налаштування всередині `{% style %}` мають приємний бонус: у редакторі теми вони оновлюються **без перезавантаження сторінки**, поки мерчант тягне повзунок. Це ще один аргумент тримати динаміку саме в CSS-змінних, а не в інлайн-стилях на елементах.',
      },
      {
        type: 'note',
        tone: 'tip',
        title: 'Сильніша відповідь',
        text: 'Скажи, що вибір між ними — це вибір, що кешується. HTML секції кешується гірше за файл стилів, тож чим більше CSS ти висипаєш у `{% style %}`, тим більший вміст їде з кожною сторінкою. Практичний компроміс: у `{% style %}` — самі CSS-змінні на обгортці секції, решта — у файлі; тоді динаміка коштує кілька рядків, а не кілька кілобайтів.',
      },
    ],
    followUps: [
      'Чому Liquid не працює всередині `{% stylesheet %}`?',
      'Як зробити, щоб дві копії секції не перебивали стилі одна одній?',
      'Коли CSS секції краще класти у власний файл в `assets`?',
    ],
  },
]

/* ═══════════════════════ snippets ═══════════════════════ */

const snippets: InterviewQA[] = [
  {
    id: 'qa-s-snippets-01',
    topic: 'snippets',
    level: 'junior',
    q: 'Що таке сніпет і як ти його використовуєш у реальній темі? Чому саме `render`, а не `include`?',
    short:
      'Сніпет — це файл із теки `snippets`, шматок розмітки, який викликають з інших файлів тегом `{% render \'імʼя\' %}` без розширення. У темі ними роблять усе, що повторюється: картку товару, іконку, бейдж знижки, блок ціни, поля форми. `include` — старий тег, який робить те саме, але відкриває сніпету повний доступ до всіх змінних навколо й дозволяє їх міняти; через це код стає непередбачуваним, а Shopify не може кешувати результат. `render` натомість створює ізольовану область видимості: усередину потрапляє лише те, що ти передав параметрами, плюс глобальні обʼєкти. `include` офіційно застарілий, у новому коді його не пишуть, а Theme Check на нього лається.',
    blocks: [
      {
        type: 'example',
        title: 'Той самий сніпет двома тегами — і різний результат',
        preset: 'product',
        template:
          '{% assign badge = \'ХІТ\' %}\nrender: {% render \'label\' %}\ninclude: {% include \'label\' %}\nrender із параметром: {% render \'label\', badge: badge %}',
        snippets: { label: '[{{ badge }}]' },
        note: 'Перший рядок порожній — `render` не бачить `badge`, створений у шаблоні. `include` бачить. Третій рядок показує правильний шлях: передати явно.',
      },
      {
        type: 'table',
        head: ['', '`render`', '`include`'],
        rows: [
          ['Область видимості', 'ізольована', 'спільна з батьківським файлом'],
          ['Зовнішні змінні', 'лише передані параметрами', 'усі, автоматично'],
          ['Зміна змінних назовні', 'неможлива', 'можлива — і це головна біда'],
          ['Імʼя файлу зі змінної', 'ні, лише літерал', 'так'],
          ['Статус', 'актуальний', 'застарілий'],
          ['Кешування Shopify', 'можливе', 'ні'],
        ],
      },
      {
        type: 'code',
        lang: 'liquid',
        title: 'Як це виглядає в темі',
        code: '{% comment %} sections/featured-collection.liquid {% endcomment %}\n<ul class="grid">\n  {% for product in section.settings.collection.products %}\n    <li>{% render \'card-product\', product: product, show_vendor: section.settings.show_vendor %}</li>\n  {% endfor %}\n</ul>\n\n{% comment %} snippets/card-product.liquid {% endcomment %}\n<a href="{{ product.url }}">\n  {{ product.featured_image | image_url: width: 400 | image_tag: loading: \'lazy\' }}\n  <h3>{{ product.title }}</h3>\n  {% if show_vendor %}<p>{{ product.vendor }}</p>{% endif %}\n  {% render \'price\', product: product %}\n</a>',
      },
      {
        type: 'note',
        tone: 'warn',
        title: 'Пастка',
        text: 'Імʼя сніпета в `render` має бути рядковим літералом — `{% render block.settings.type %}` не працює. Якщо потрібно вибрати сніпет за даними, пиши явний `{% case %}` з переліком. Це не примха: саме завдяки літералу Shopify знає всі залежності шаблону наперед.',
      },
      {
        type: 'note',
        tone: 'tip',
        title: 'Сильніша відповідь',
        text: 'Скажи, що ізоляція `render` — це не обмеження, а документація: дивлячись на виклик, одразу видно повний список того, від чого сніпет залежить. І назви межу: сніпет — це розмітка без власних налаштувань; щойно шматку потрібні поля в редакторі, це вже секція або theme block, бо `{% schema %}` у сніпеті не працює.',
      },
    ],
    followUps: [
      'Чому в `render` не можна підставити імʼя файлу зі змінної?',
      'Що робити, якщо сніпету треба значення, створене в батьківському файлі?',
      'Коли шматок теми має стати сніпетом, а коли — секцією?',
    ],
  },
  {
    id: 'qa-s-snippets-02',
    topic: 'snippets',
    level: 'middle',
    q: 'Як передати обʼєкт у сніпет? Що всередині доступно, а що ні?',
    short:
      'Параметри пишуться через кому після імені: `{% render \'card\', product: product, heading: \'Хіти\' %}` — усередині вони стають звичайними змінними. Передавати можна будь-що: обʼєкт товару, масив, рядок, число, результат фільтра. Усередині сніпета доступні три речі: передані параметри, глобальні обʼєкти на кшталт `shop`, `settings`, `routes`, `cart`, і обʼєкти самої сторінки — тобто в сніпеті на шаблоні товару `product` буде доступний і без передачі. Недоступне рівно одне: змінні, створені через `assign` чи `capture` поза сніпетом. І в зворотний бік так само — усе, що сніпет створив усередині, назовні не витікає.',
    blocks: [
      {
        type: 'example',
        title: 'Три джерела даних усередині сніпета',
        preset: 'product',
        template:
          '{% assign my_note = \'створено в шаблоні\' %}\n{% render \'probe\', title: product.title, price_text: product.price | money %}',
        snippets: {
          probe:
            'параметр title: [{{ title }}]\nпараметр price_text: [{{ price_text }}]\nглобальний shop: [{{ shop.name }}]\nобʼєкт сторінки product: [{{ product.title }}]\nзмінна з шаблону my_note: [{{ my_note }}]',
        },
        note: '`my_note` порожній — і це правильна поведінка `render`. Параметри дійшли.',
        shopifyOutput:
          'У справжньому Shopify рядки 3 і 4 НЕ порожні: `shop.name` і `product.title` доступні в сніпеті без передачі, бо глобальні обʼєкти й обʼєкти сторінки ізоляція не ріже. Пісочниця відрізає їх теж — памʼятай про цю розбіжність.',
      },
      {
        type: 'code',
        lang: 'liquid',
        title: 'Сніпет на весь масив: `for … as`',
        code: '{% comment %} Те саме, що цикл із render усередині, але коротше {% endcomment %}\n{% render \'card-product\' for collection.products as product %}\n\n{% comment %} Усередині сніпета доступний forloop саме цього перебору {% endcomment %}\n{% if forloop.first %}<span class="badge">Новинка тижня</span>{% endif %}',
      },
      {
        type: 'table',
        head: ['Що', 'Видно в сніпеті через `render`?'],
        rows: [
          ['Передані параметри', 'так'],
          ['`shop`, `settings`, `routes`, `cart`, `linklists`', 'так — це глобальні обʼєкти'],
          ['`product` на шаблоні товару, `collection` на колекції', 'так — це обʼєкти сторінки'],
          ['`section` і `block`, якщо сніпет викликано із секції', 'так'],
          ['Змінна з `{% assign %}` у батьківському файлі', 'НІ — лише передана параметром'],
          ['Змінна, створена всередині сніпета', 'назовні не витікає'],
        ],
      },
      {
        type: 'note',
        tone: 'warn',
        title: 'Пастка',
        text: 'Той самий сніпет часто викликають і зі сторінки товару, і з картки в колекції. У першому випадку `product` «сам» є, у другому його треба передати — і сніпет, написаний з розрахунку на глобальний `product`, у сітці мовчки виведе не ту картку або порожнечу. Правило: сніпет НІКОЛИ не спирається на обʼєкт сторінки, він приймає все параметрами. Тоді він працює звідусіль.',
      },
      {
        type: 'note',
        tone: 'tip',
        title: 'Сильніша відповідь',
        text: 'Додай про значення за замовчуванням: сніпет має переживати відсутній параметр. `{% assign heading = heading | default: \'Рекомендуємо\' %}` у першому рядку робить сніпет самодостатнім. І про `for … as`: він не лише коротший, а й дає всередині свій `forloop`, тож `forloop.first` і `forloop.index` працюють без передачі індексу руками.',
      },
    ],
    followUps: [
      'Що буде, якщо сніпет змінить передану змінну?',
      'Як передати в сніпет результат фільтра?',
      'Чому сніпет, що покладається на глобальний `product`, небезпечний?',
    ],
  },
  {
    id: 'qa-s-snippets-03',
    topic: 'snippets',
    level: 'senior',
    q: 'Сніпет усередині циклу — скільки це коштує? Як ти оптимізував би картку товару в сітці на пʼятдесят позицій?',
    short:
      'Сам виклик сніпета дешевий — дорого те, що всередині нього виконується пʼятдесят разів. Тому перше, що я роблю: виношу з картки все, що не залежить від конкретного товару, і рахую це один раз до циклу — налаштування секції, переклади, вибрану колекцію, будь-який `capture` зі сталим результатом. Друге: прибираю з картки звернення, які на кожній ітерації тягнуть нові дані — `all_products` за handle, метаполя-посилання, перебір усіх варіантів заради однієї ціни. Третє: перевіряю, скільки разів картка гортає масиви — вкладений цикл по варіантах усередині циклу по товарах перетворює пʼятдесят ітерацій на кількасот. А далі вже дивлюсь Theme Inspector: він показує, які саме рядки коштують мілісекунди, і зазвичай це один-два рядки, а не «сніпети взагалі».',
    blocks: [
      {
        type: 'example',
        title: 'Спільне — один раз до циклу, у сніпет — готовим',
        preset: 'collection',
        template:
          '{% comment %} рахуємо ОДИН раз {% endcomment %}\n{% assign hit_tag = \'хіт\' %}\n{% assign show_vendor = settings.show_vendor %}\n\n{% for product in collection.products limit: 3 %}\n  {% render \'card\', product: product, hit_tag: hit_tag, show_vendor: show_vendor, index: forloop.index %}\n{% endfor %}',
        snippets: {
          card:
            '{{ index }}. {{ product.title }}{% if show_vendor %} · {{ product.vendor }}{% endif %}{% if product.tags contains hit_tag %} · ХІТ{% endif %}\n',
        },
        note: 'Картка не звертається ні до `settings`, ні до констант — усе прийшло параметрами. Такий сніпет однаково працює в сітці, у слайдері й у блоці «з цим купують».',
      },
      {
        type: 'table',
        head: ['Що в картці', 'Чому дорого', 'Як роблю'],
        rows: [
          ['`all_products[handle]`', 'звернення за handle + ліміт 20 на сторінку', 'передаю готовий обʼєкт товару'],
          ['`{% for v in product.variants %}` заради мінімальної ціни', 'цикл у циклі', '`product.price_min` / `price_varies`'],
          ['Метаполе-посилання на інший товар', 'дані підтягуються на кожній картці', 'лише там, де картка одна'],
          ['`{{ \'label\' | t }}` у кожній картці', 'переклад щоразу', '`assign` до циклу'],
          ['`image_url` без розміру під макет', 'величезний файл на кожну картку', 'ширина під сітку + `srcset`'],
          ['`{% capture %}` зі сталим вмістом', 'рядок будується пʼятдесят разів', 'один `capture` до циклу'],
        ],
      },
      {
        type: 'note',
        tone: 'warn',
        title: 'Пастка',
        text: 'Цикл по `collection.products` віддає щонайбільше 50 позицій — більше без `{% paginate %}` просто не буде, і мовчки. Тому «у нас 200 товарів, а виводиться 50» — це не баг сітки, а межа циклу. І `{% paginate %}` не прискорює сторінку сам собою: він ділить її на порції, і саме тому розмір порції — рішення про швидкість, а не про дизайн.',
      },
      {
        type: 'note',
        tone: 'tip',
        title: 'Сильніша відповідь',
        text: 'Назви правильний порядок дій. Спочатку виміряти: Theme Inspector дає розклад часу по рядках Liquid, і часто виявляється, що сітка ні до чого, а гальмує зовсім інша секція. Потім — рахувати кількість роботи, а не «оптимізувати стиль». І тільки потім — компроміси на кшталт «менше товарів на сторінці». Кандидат, який починає з «замість сніпета вставлю код напряму», показує, що не вимірював нічого.',
      },
    ],
    followUps: [
      'Скільки товарів віддасть цикл по колекції без `paginate`?',
      'Як зрозуміти, що саме гальмує сторінку колекції?',
      'Чи є сенс кешувати щось у Liquid?',
    ],
  },
  {
    id: 'qa-s-snippets-04',
    topic: 'snippets',
    level: 'middle',
    q: 'Що таке LiquidDoc і навіщо тег `{% doc %}`?',
    short:
      'LiquidDoc — це формат коментарів-документації для сніпетів: на початку файлу пишеш `{% doc %}`, коротко описуєш, що сніпет робить, і перелічуєш параметри анотаціями `@param` із типом, імʼям і поясненням, а через `@example` показуєш приклад виклику. У вивід нічого з цього не потрапляє. Сенс не в красі, а в інструментах: редактор із розширенням Shopify підказує параметри просто в місці виклику `{% render %}`, а Theme Check ловить, коли параметр не передали або передали зайвий. Це найдешевший спосіб зробити сніпет зрозумілим наступному розробнику — раніше ту саму роль грав `{% comment %}`, який ніхто не читав і ніщо не перевіряло.',
    blocks: [
      {
        type: 'example',
        title: '`{% doc %}` нічого не друкує',
        template:
          '{% render \'price-badge\', price: 64900, compare_at: 79900 %}',
        snippets: {
          'price-badge':
            '{% doc %}\n  Бейдж знижки для картки товару.\n\n  @param {number} price - Поточна ціна в копійках.\n  @param {number} [compare_at] - Стара ціна; без неї бейдж не малюється.\n  @param {string} [label] - Свій текст замість відсотка.\n\n  @example\n  {% render \'price-badge\', price: product.price, compare_at: product.compare_at_price %}\n{% enddoc %}\n{% if compare_at > price %}\n  {% assign off = compare_at | minus: price | times: 100 | divided_by: compare_at %}\n  <span class="badge">{{ label | default: off | append: \'%\' }}</span>\n{% endif %}',
        },
        note: 'Уся документація лишилась у файлі й не коштувала жодного байта у виводі. Квадратні дужки навколо імені означають, що параметр необовʼязковий.',
      },
      {
        type: 'table',
        head: ['Анотація', 'Форма', 'Для чого'],
        rows: [
          ['опис', 'просто текст перед анотаціями', 'що робить сніпет, одним-двома реченнями'],
          ['`@description`', '`@description Текст`', 'те саме явно, коли так читабельніше'],
          ['`@param`', '`@param {тип} імʼя - пояснення`', 'типи: `string`, `number`, `boolean`, `object`'],
          ['необовʼязковий параметр', '`@param {string} [label] - …`', 'квадратні дужки навколо імені'],
          ['`@example`', '`@example` і далі код виклику', 'показати правильне застосування'],
        ],
      },
      {
        type: 'note',
        tone: 'warn',
        title: 'Пастка',
        text: '`{% doc %}` — не універсальний коментар: він призначений для файлів сніпетів і статичних блоків, а не для секцій чи довільних шматків розмітки. І це саме документація, а не перевірка типів під час рендеру: якщо передати рядок туди, де `@param {number}`, Liquid спокійно відрендерить — лаятимуться редактор і Theme Check, а не сторінка.',
      },
      {
        type: 'note',
        tone: 'tip',
        title: 'Сильніша відповідь',
        text: 'Звʼяжи це з процесом: LiquidDoc окупається там, де темою займається більше однієї людини або де сніпет переживе свого автора. Документований сніпет із `@param` перестає бути «чорною скринькою, у яку про всяк випадок передають усе» — а саме з таких передач і виростають картки, що тягнуть половину контексту сторінки. І згадай, що `{% doc %}` — сучасна заміна коментарю-шапки, яку розуміє тулінг, тож Theme Check може зробити з неї реальне правило в CI.',
      },
    ],
    followUps: [
      'Чим `{% doc %}` кращий за `{% comment %}` на початку файлу?',
      'Чи перевіряє Shopify типи параметрів під час рендеру?',
      'Як Theme Check використовує ці анотації?',
    ],
  },
]

/* ═══════════════════════ performance ═══════════════════════ */

const performance: InterviewQA[] = [
  {
    id: 'qa-s-performance-01',
    topic: 'performance',
    level: 'senior',
    q: 'Що найбільше гальмує рендер теми? З чого ти починаєш, коли магазин «повільний»?',
    short:
      'Спершу я зʼясовую, що саме повільне: час відповіді сервера чи те, що робить браузер. За рендер на сервері відповідає Liquid, і там дорого коштує кількість роботи — вкладені цикли, звернення до даних усередині циклу, довгі перебори без `paginate`, десятки сніпетів у сітці. Але в девʼяти випадках із десяти магазин повільний не через Liquid, а через фронтенд: гігантські зображення, скрипти застосунків, шрифти, каруселі на сторонніх бібліотеках. Тому порядок такий: Theme Inspector показує, скільки часу зʼїдає Liquid і які саме рядки, Lighthouse і звіт швидкості в адмінці — що відбувається в браузері, а вкладка «Мережа» — хто тягне найбільше байтів. І лише потім я щось правлю, бо оптимізація без вимірювання — це лотерея.',
    blocks: [
      {
        type: 'table',
        head: ['Симптом', 'Найімовірніша причина', 'Чим міряю'],
        rows: [
          ['Довго чекаємо перший байт', 'Liquid: цикли, `all_products`, важкі секції', 'Theme Inspector'],
          ['Сторінка приходить швидко, але «стрибає»', 'зображення без розмірів, шрифти', 'Lighthouse: CLS'],
          ['Довго до першого малюнка', 'блокуючі CSS/JS у `head`', 'Lighthouse, вкладка «Мережа»'],
          ['Кнопки не реагують одразу', 'скрипти застосунків', 'Lighthouse: TBT, профайлер'],
          ['Повільно лише на колекції', 'сітка: цикл у циклі, фільтрація в шаблоні', 'Theme Inspector'],
          ['Повільно лише на товарі', 'десятки варіантів, метаполя, рекомендації', 'Theme Inspector'],
        ],
      },
      {
        type: 'example',
        title: 'Три типові джерела зайвої роботи в одному шаблоні',
        preset: 'collection',
        template:
          '{% comment %} 1. Цикл у циклі: товарів × варіантів {% endcomment %}\n{% assign steps = 0 %}\n{% for p in collection.products %}{% for v in p.variants %}{% assign steps = steps | plus: 1 %}{% endfor %}{% endfor %}\nІтерацій у вкладеному циклі: {{ steps }} (товарів лише {{ collection.products.size }})\n\n{% comment %} 2. Те саме значення, пораховане в циклі, а не до нього {% endcomment %}\n{% assign in_stock = collection.products | where: \'available\', true %}\nДоступних: {{ in_stock.size }} — один фільтр замість перевірки на кожній ітерації\n\n{% comment %} 3. Перебір заради одного числа {% endcomment %}\nМінімальна ціна без циклу: {{ collection.products.first.price_min | money }}',
        note: 'Сім ітерацій замість пʼяти виглядають невинно. На колекції з пʼятдесяти товарів по пʼять варіантів це вже 250 проходів — і кожен із них ще й рендерить розмітку.',
      },
      {
        type: 'note',
        tone: 'warn',
        title: 'Пастка',
        text: 'Головна помилка — оптимізувати Liquid тоді, коли проблема не в ньому. Типова картина: розробник переписує сітку товарів, виграє 40 мс на сервері, а сторінку далі тримають 3 МБ зображень і чотири скрипти застосунків. Спочатку вимірюй, потім став гіпотезу, і лише потім чіпай код.',
      },
      {
        type: 'note',
        tone: 'shopify',
        text: 'Частину роботи Shopify бере на себе: сторінки кешуються на CDN, зображення роздаються з їхнього CDN із потрібним розміром і форматом, а CSS і JS із `{% stylesheet %}` та `{% javascript %}` збираються в спільні файли теми. Тому «власна збірка з вебпаком» у темі зазвичай не прискорює нічого — вона лише додає крок, якого платформа не просила.',
      },
      {
        type: 'note',
        tone: 'tip',
        title: 'Сильніша відповідь',
        text: 'Назви бюджет, а не абстрактне «швидше»: скільки байтів JS до взаємодії, який розмір найбільшого зображення в першому екрані, скільки сторонніх доменів. І додай організаційну частину — кожен встановлений застосунок додає свій скрипт, тому розмова про швидкість часто закінчується не в коді, а списком «що з цього магазин реально використовує».',
      },
    ],
    followUps: [
      'Як ти доведеш клієнту, що гальмує застосунок, а не тема?',
      'Що показує Theme Inspector, чого не показує Lighthouse?',
      'Які метрики ти дивишся в першу чергу?',
    ],
  },
  {
    id: 'qa-s-performance-02',
    topic: 'performance',
    level: 'middle',
    q: 'Чим небезпечні вкладені цикли в Liquid? Наведи приклад із реальної теми.',
    short:
      'Вкладений цикл множить роботу: зовнішній на пʼятдесят товарів і внутрішній на пʼять варіантів — це вже двісті пʼятдесят проходів, і кожен ще щось рендерить або фільтрує. У темах це зустрічається постійно: перебираємо товари колекції, а всередині — варіанти, щоб знайти мінімальну ціну або перевірити наявність. Майже завжди внутрішній цикл не потрібен, бо в обʼєкта товару вже є готові поля — `price_min`, `price_varies`, `available`, — або потрібне значення дістається одним фільтром на масив. Правило, яким я користуюсь: якщо всередині циклу зʼявився ще один цикл, спершу шукаю готову властивість, потім фільтр, і лише потім залишаю перебір.',
    blocks: [
      {
        type: 'example',
        title: 'Те саме число двома способами',
        preset: 'collection',
        template:
          '{% comment %} ДОРОГО: перебираємо варіанти кожного товару {% endcomment %}\n{% assign cheapest = 99999999 %}\n{% for p in collection.products %}\n  {% for v in p.variants %}\n    {% if v.price < cheapest %}{% assign cheapest = v.price %}{% endif %}\n  {% endfor %}\n{% endfor %}\nЧерез вкладений цикл: {{ cheapest | money }}\n\n{% comment %} ДЕШЕВО: готове поле + один фільтр на масив {% endcomment %}\n{% assign prices = collection.products | map: \'price_min\' | sort %}\nЧерез map і sort: {{ prices.first | money }}',
        note: 'Результат однаковий, роботи — на порядок менше. `map` проходить масив один раз, `sort` теж, а вкладений цикл робить прохід на кожен товар.',
      },
      {
        type: 'table',
        head: ['Навіщо зазвичай пишуть внутрішній цикл', 'Чим замінити'],
        rows: [
          ['Знайти найдешевший варіант', '`product.price_min`'],
          ['Перевірити, чи ціни різні', '`product.price_varies`'],
          ['Перевірити, чи є хоч щось у наявності', '`product.available`'],
          ['Дістати перший доступний варіант', '`product.first_available_variant`'],
          ['Зібрати всі значення поля', '`map`'],
          ['Відібрати за умовою', '`where`, `reject`'],
          ['Порахувати збіги', '`where` і `.size`'],
          ['Знайти один елемент', '`find`'],
        ],
      },
      {
        type: 'note',
        tone: 'warn',
        title: 'Пастка',
        text: 'Вкладеність буває невидимою: у сітці стоїть `{% render \'card-product\' %}`, а всередині картки — цикл по варіантах або по метаполях. У шаблоні колекції ти бачиш один цикл, а насправді їх два. Тому рахувати складність треба по сніпетах теж — і саме тому картка товару має бути найдисциплінованішим файлом теми.',
      },
      {
        type: 'note',
        tone: 'tip',
        title: 'Сильніша відповідь',
        text: 'Скажи, що межу теж треба знати: цикл по `collection.products` віддає не більше пʼятдесяти позицій, і мовчки. Тобто вкладений цикл не «зʼїсть увесь магазин», але легко перетворить сторінку на двісті–триста рендерів розмітки. І згадай `{% break %}` — коли потрібен перший збіг, продовжувати перебір нема сенсу.',
      },
    ],
    followUps: [
      'Скільки ітерацій дозволяє цикл по колекції без `paginate`?',
      'Чим `find` кращий за цикл із `break`?',
      'Як помітити вкладений цикл, схований у сніпеті?',
    ],
  },
  {
    id: 'qa-s-performance-03',
    topic: 'performance',
    level: 'middle',
    q: 'Чому фільтрувати краще ДО циклу, а не всередині нього?',
    short:
      'Коли умова стоїть усередині циклу, Liquid все одно проходить усі елементи й на кожному обчислює перевірку — просто частину не друкує. Якщо зробити відбір фільтром до циклу — `where`, `reject`, `map`, `sort`, — масив звужується один раз, і цикл іде вже по потрібному. Виграш не лише в швидкості: одразу видно, скільки елементів буде, тож можна коректно вивести «нічого не знайдено» і порахувати класи сітки. У циклі з `{% if %}` цього не знаєш: `forloop.length` покаже довжину повного масиву, а не відфільтрованого, і «показано 12 товарів» перетвориться на брехню.',
    blocks: [
      {
        type: 'example',
        title: 'Умова в циклі проти `where` до нього',
        preset: 'collection',
        template:
          '{% comment %} Фільтр усередині: forloop нічого не знає про відбір {% endcomment %}\n{% for p in collection.products %}{% if p.available %}{{ p.title }} ({{ forloop.index }} з {{ forloop.length }})\n{% endif %}{% endfor %}\n\n{% comment %} Відбір ДО циклу: лічильник чесний {% endcomment %}\n{% assign in_stock = collection.products | where: \'available\', true %}\n{% for p in in_stock %}{{ p.title }} ({{ forloop.index }} з {{ forloop.length }})\n{% endfor %}\n{% if in_stock.size == 0 %}Немає нічого в наявності{% endif %}',
        note: 'Зверни увагу на «з 5» у першому блоці — це розмір повного масиву. У другому лічильник показує реальну кількість відібраного, і зʼявляється місце для чесного «нічого не знайдено».',
      },
      {
        type: 'example',
        title: 'Ланцюжок фільтрів замість трьох умов',
        preset: 'collection',
        template:
          '{% assign picks = collection.products | where: \'vendor\', \'Inoar\' | sort: \'price\' | map: \'title\' %}\nInoar за зростанням ціни: {{ picks | join: \' · \' }}\n\n{% assign not_hits = collection.products | reject: \'available\', true | map: \'title\' %}\nНемає в наявності: {{ not_hits | join: \', \' | default: \'—\' }}',
        note: '`where`, `reject`, `sort`, `map` читаються як одне речення і проходять масив по разу. Те саме трьома вкладеними `if` займає вдесятеро більше рядків і дає гіршу продуктивність.',
      },
      {
        type: 'table',
        head: ['Задача', 'Замість `if` у циклі'],
        rows: [
          ['Лише доступні', '`where: \'available\', true`'],
          ['Усе, крім доступних', '`reject: \'available\', true`'],
          ['За тегом', '`where: \'tags\', \'хіт\'` не працює — для тегів потрібен `contains` у циклі'],
          ['Перші N', '`limit: N` у самому `{% for %}`'],
          ['Відсортувати', '`sort` / `sort_natural` до циклу'],
          ['Витягти поле', '`map` — одразу масив значень'],
          ['Знайти один', '`find` замість циклу з `break`'],
        ],
      },
      {
        type: 'note',
        tone: 'warn',
        title: 'Пастка',
        text: '`where` порівнює значення властивості, тож для масивів на кшталт `tags` він не годиться — тег перевіряють `contains` усередині циклу або відбирають через `reject`/`find` за іншою ознакою. А ще важливіше: фільтрувати колекцію в шаблоні взагалі напівміра, бо цикл однаково бачить максимум пʼятдесят товарів. Якщо треба справжній відбір по всій колекції — це фасетна фільтрація Shopify або окрема колекція, а не `where` у темі.',
      },
      {
        type: 'note',
        tone: 'tip',
        title: 'Сильніша відповідь',
        text: 'Додай аргумент, який не про швидкість: відбір до циклу робить намір видимим. Рядок `{% assign in_stock = collection.products | where: \'available\', true %}` читається як назва змінної й одразу пояснює, що далі в циклі. Три вкладені `if` усередині вимагають прочитати весь блок, щоб зрозуміти, що ж насправді показують.',
      },
    ],
    followUps: [
      'Чому `forloop.length` показує не те, що очікуєш, коли фільтруєш у циклі?',
      'Як відібрати товари за тегом?',
      'Коли фільтрацію треба віддати платформі, а не Liquid?',
    ],
  },
  {
    id: 'qa-s-performance-04',
    topic: 'performance',
    level: 'junior',
    q: 'Як правильно виводити зображення в темі? Що таке `image_url`, `srcset`, ліниве завантаження?',
    short:
      'Зображення в темі виводять через `image_url`, який будує адресу на CDN Shopify із потрібним розміром, і `image_tag`, який із цієї адреси робить готовий `<img>`. Ключове — просити саме ту ширину, яка потрібна макету: картка в сітці не має тягнути файл на дві тисячі пікселів. Для різних екранів передають `widths` і `sizes` — тоді Shopify збирає `srcset`, і браузер сам обирає файл під свою ширину. Зображення нижче першого екрана вантажаться ліниво — `image_tag` ставить `loading="lazy"` для секцій далі по сторінці сам, — а головне зображення першого екрана, навпаки, ліниво вантажити не можна: його краще ще й попередньо завантажити параметром `preload`.',
    blocks: [
      {
        type: 'example',
        title: 'Адреса з розміром і готовий тег',
        preset: 'product',
        view: 'html',
        template:
          'Адреса: {{ product.featured_image | image_url: width: 600 }}\n\n{{ product.featured_image | image_url: width: 600 | image_tag: alt: product.title, loading: \'lazy\', sizes: \'(min-width: 768px) 25vw, 50vw\', widths: \'300, 600, 900\' }}\n\n{% comment %} Товару без фото потрібна заглушка, а не порожній квадрат {% endcomment %}\n{{ \'product-1\' | placeholder_svg_tag: \'placeholder placeholder--product\' }}',
        note: '`width` у `image_url` — це розмір файлу, який попросять у CDN. `image_tag` дописав `width`/`height` в атрибути: саме вони не дають сторінці стрибати, поки картинка вантажиться.',
        shopifyOutput:
          'У справжній темі параметр `widths` перетворюється на повноцінний `srcset="…300w, …600w, …900w"`. Пісочниця друкує його як звичайний атрибут — структуру виклику це показує, а сам `srcset` треба дивитись на живій темі.',
      },
      {
        type: 'code',
        lang: 'liquid',
        title: 'Банер першого екрана: без lazy, з preload',
        code: '{% comment %} Найбільше зображення першого екрана — це майже завжди LCP {% endcomment %}\n{{\n  section.settings.image\n  | image_url: width: 1600\n  | image_tag:\n      alt: section.settings.image.alt,\n      widths: \'600, 900, 1200, 1600\',\n      sizes: \'100vw\',\n      preload: true,\n      fetchpriority: \'high\'\n}}\n\n{% comment %} А картки в сітці — навпаки {% endcomment %}\n{{ product.featured_image | image_url: width: 400 | image_tag: loading: \'lazy\', sizes: \'(min-width: 990px) 25vw, 50vw\', widths: \'200, 400, 600\' }}',
      },
      {
        type: 'table',
        head: ['Що', 'Навіщо'],
        rows: [
          ['`image_url: width: N`', 'просимо в CDN саме потрібний розмір'],
          ['`widths` + `sizes`', '`srcset`: браузер бере файл під свій екран'],
          ['`width`/`height` в атрибутах', 'резервують місце — сторінка не стрибає (CLS)'],
          ['`loading: \'lazy\'`', 'не вантажити те, чого не видно'],
          ['`preload: true`', 'навпаки — просимо браузер узяти це першим'],
          ['`placeholder_svg_tag`', 'заглушка для товару без фото'],
          ['`alt`', 'доступність і SEO; порожній `alt` — лише для декору'],
        ],
      },
      {
        type: 'note',
        tone: 'warn',
        title: 'Пастка',
        text: '`image_url` без `width` і без `height` — це помилка рендеру, а не «віддай оригінал». І зворотний бік ліні: `loading="lazy"` на головному банері відкладає саме той файл, за яким міряється LCP, тож сторінка в Lighthouse просідає рівно через оптимізацію. Ліниво — все, що нижче першого екрана; зверху — жодного lazy.',
      },
      {
        type: 'note',
        tone: 'tip',
        title: 'Сильніша відповідь',
        text: 'Скажи, що Shopify сам віддає сучасний формат (WebP) там, де браузер його підтримує, тож конвертувати картинки вручну не треба — треба просити правильний розмір. І згадай `sizes` як найчастіше пропущену деталь: без нього браузер вважає, що зображення на всю ширину вікна, і чесно тягне найбільший файл зі `srcset` — тобто `srcset` є, а користі нуль.',
      },
    ],
    followUps: [
      'Що буде, якщо викликати `image_url` без розміру?',
      'Як зрозуміти, яке зображення вважається LCP?',
      'Навіщо `sizes`, якщо вже є `srcset`?',
    ],
  },
  {
    id: 'qa-s-performance-05',
    topic: 'performance',
    level: 'middle',
    q: 'Як правильно підключати скрипти в темі? Чому не в `head` і чим `defer` відрізняється від `async`?',
    short:
      'Звичайний `<script src>` без атрибутів блокує розбір HTML: браузер зупиняється, тягне файл, виконує його і лише потім читає сторінку далі — тому в `head` такий скрипт відкладає появу контенту. `defer` каже завантажувати паралельно, а виконати після того, як документ розібрано, зберігаючи порядок файлів; `async` теж вантажить паралельно, але виконує щойно файл прийшов, у довільному порядку. Для коду теми майже завжди потрібен `defer`, бо він залежить від DOM і від інших файлів; `async` доречний лише для повністю незалежних речей на кшталт аналітики. Самі файли беруться через `asset_url`, щоб їхати з CDN Shopify з версією в адресі, а не з чужого домену.',
    blocks: [
      {
        type: 'example',
        title: 'Адреси файлів теми',
        preset: 'shop',
        template:
          '{{ \'theme.css\' | asset_url | stylesheet_tag }}\n{{ \'theme.js\' | asset_url | script_tag }}\n{{ \'hero.jpg\' | asset_url | preload_tag: as: \'image\' }}\n\nПроста адреса: {{ \'cart.js\' | asset_url }}',
        note: '`asset_url` додає в адресу версію — тому при новому деплої браузер бере свіжий файл, а між деплоями тримає його в кеші. Зверни увагу: `script_tag` дає тег БЕЗ `defer`, тож для теми його зазвичай пишуть руками.',
      },
      {
        type: 'code',
        lang: 'liquid',
        title: 'Як це виглядає в `theme.liquid`',
        code: '<head>\n  {% comment %} Стилі — так, у head: інакше сторінка блимне неоформленою {% endcomment %}\n  {{ \'theme.css\' | asset_url | stylesheet_tag }}\n\n  {% comment %} Код теми: паралельне завантаження, виконання по порядку після розбору DOM {% endcomment %}\n  <script src="{{ \'theme.js\' | asset_url }}" defer></script>\n\n  {% comment %} Незалежний від DOM і від інших файлів — можна async {% endcomment %}\n  <script src="{{ \'analytics.js\' | asset_url }}" async></script>\n\n  {{ content_for_header }}\n</head>',
      },
      {
        type: 'table',
        head: ['', 'без атрибута', '`defer`', '`async`'],
        rows: [
          ['Завантаження', 'блокує розбір HTML', 'паралельно', 'паралельно'],
          ['Виконання', 'одразу, на місці', 'після розбору документа', 'щойно завантажився'],
          ['Порядок файлів', 'зберігається', 'зберігається', 'НЕ гарантується'],
          ['DOM готовий?', 'ні', 'так', 'як пощастить'],
          ['Для чого', 'майже ніколи', 'код теми', 'аналітика, незалежні пікселі'],
        ],
      },
      {
        type: 'note',
        tone: 'warn',
        title: 'Пастка',
        text: '`async` на скриптах теми — класичне джерело плаваючих багів: два файли, один залежить від іншого, і на швидкому зʼєднанні все працює, а на повільному порядок змінився й консоль повна «is not defined». І окремо: `{{ content_for_header }}` не можна ні прибирати, ні переносити — це вставка Shopify з аналітикою й службовими скриптами, без неї ламаються речі, яких у коді теми не видно.',
      },
      {
        type: 'note',
        tone: 'tip',
        title: 'Сильніша відповідь',
        text: 'Скажи, що найкраща оптимізація скрипта — не вантажити його: слайдер потрібен лише там, де є слайдер, тож підвантажуй модуль динамічним `import()` при першій взаємодії або через `IntersectionObserver`. І згадай, що тег `{% javascript %}` у секції складається в спільний бандл теми — зручно, але саме тому туди не можна писати Liquid: файл збирається один на тему, а не рендериться під сторінку.',
      },
    ],
    followUps: [
      'Що таке `content_for_header` і чому його не можна прибирати?',
      'Куди подіти JS секції — у `{% javascript %}` чи в окремий файл?',
      'Як завантажити скрипт лише тоді, коли він реально потрібен?',
    ],
  },
  {
    id: 'qa-s-performance-06',
    topic: 'performance',
    level: 'senior',
    q: 'Що таке Shopify Theme Inspector і що він показує такого, чого не бачить Lighthouse?',
    short:
      'Theme Inspector — це розширення для Chrome, яке показує профіль рендеру Liquid на сервері: скільки загалом зайняв рендер сторінки й скільки — кожен файл і кожен окремий рядок, аж до конкретного `{% for %}` чи звернення до метаполя. Lighthouse такого не бачить взагалі: для нього сервер — чорна скринька, він міряє лише час відповіді цілком і все, що далі робить браузер. Тому інструменти доповнюють один одного: Inspector відповідає на питання «чому сервер думає пів секунди», Lighthouse — «чому сторінка виглядає повільною для людини». Практично я вмикаю Inspector тоді, коли час до першого байта великий, а зображення й скрипти вже впорядковані.',
    blocks: [
      {
        type: 'table',
        head: ['Питання', 'Theme Inspector', 'Lighthouse'],
        rows: [
          ['Скільки часу рендериться Liquid', 'так, із розкладом по рядках', 'ні'],
          ['Який сніпет найдорожчий', 'так', 'ні'],
          ['Скільки важать зображення', 'ні', 'так'],
          ['Що блокує перший малюнок', 'ні', 'так'],
          ['Скільки JS виконується в браузері', 'ні', 'так'],
          ['Чи винен застосунок', 'частково — видно його блоки', 'так, за мережею і скриптами'],
        ],
      },
      {
        type: 'code',
        lang: 'text',
        title: 'Як зазвичай виглядає знахідка',
        code: 'main-collection-product-grid.liquid        412 ms\n  └ snippets/card-product.liquid           388 ms   (50 викликів)\n      └ рядок 24: product.metafields.custom.pairs_with.value   271 ms\n\nВисновок: дорогий не сніпет, а ОДИН рядок у ньому — метаполе-посилання,\nяке тягне повʼязані товари на кожній із пʼятдесяти карток.',
      },
      {
        type: 'note',
        tone: 'warn',
        title: 'Пастка',
        text: 'Inspector міряє те, що бачить сам, — і на сторінці з кешем CDN ти легко отримаєш красиві цифри, які не мають стосунку до реального першого візиту. Тому міряють на некешованій відповіді й кілька разів: одне вимірювання на Liquid нічого не доводить, бо розкид між запитами буває більший за саму «оптимізацію».',
      },
      {
        type: 'note',
        tone: 'tip',
        title: 'Сильніша відповідь',
        text: 'Покажи, що вмієш читати профіль, а не лише його відкривати: дорогим майже завжди виявляється не «сніпет», а один рядок усередині нього, помножений на кількість викликів. Тому перше питання до профілю — «скільки разів це виконується», і лише друге — «скільки коштує один раз». І згадай, що Inspector працює на темі, доступ до якої в тебе є, тож на чужому проді він не панацея — там лишаються час відповіді й звіт швидкості в адмінці.',
      },
    ],
    followUps: [
      'Як переконатись, що міряєш некешовану відповідь?',
      'Що робити, якщо дорогим виявився рядок із метаполем?',
      'Чим звіт швидкості в адмінці відрізняється від Lighthouse?',
    ],
  },
  {
    id: 'qa-s-performance-07',
    topic: 'performance',
    level: 'middle',
    q: 'Що таке Theme Check і що він ловить?',
    short:
      'Theme Check — це лінтер для тем: він читає файли теми й перевіряє їх за набором правил, не запускаючи. Ловить він три групи речей: помилки, які просто зламають сторінку, — неіснуючий сніпет, незакритий тег, невалідний JSON у схемі; застарілі практики — `include` замість `render`, старі фільтри зображень; і речі, що бʼють по швидкості чи доступності — `image_url` без розміру, зображення без `width`/`height`, скрипт без `defer`, надто велика вкладеність. Запускається командою `shopify theme check`, живе прямо в редакторі через мовний сервер і чудово стає кроком у CI. Налаштовується файлом `.theme-check.yml`, де правила вмикають, вимикають або піднімають до рівня помилки.',
    blocks: [
      {
        type: 'code',
        lang: 'text',
        title: 'Типовий вивід',
        code: '$ shopify theme check\n\nsnippets/card-product.liquid\n  24:5  error    Сніпет \'price-old\' не існує          MissingTemplate\n  31:9  warning  Використано include — заміни render   DeprecatedTag\n\nsections/hero.liquid\n  12:3  error    image_url без width або height       ImgWidthAndHeight\n  40:1  warning  Невикористане налаштування схеми     UnusedAssign\n\n2 помилки, 2 попередження у 2 файлах',
      },
      {
        type: 'code',
        lang: 'text',
        title: '.theme-check.yml — правила під проєкт',
        code: 'extends: theme-check:recommended\n\n# Пропускаємо теки, які не є кодом теми\nignore:\n  - node_modules/\n  - vendor/\n\n# Піднімаємо до помилки те, що для нас неприпустиме\nTemplateLength:\n  enabled: true\n  max_length: 200\n\nDeprecatedTag:\n  severity: error',
      },
      {
        type: 'table',
        head: ['Що ловить', 'Приклад'],
        rows: [
          ['Те, що зламає сторінку', 'виклик неіснуючого сніпета, невалідний JSON у `{% schema %}`'],
          ['Застаріле', '`{% include %}`, старі фільтри зображень'],
          ['Швидкість', '`image_url` без розміру, скрипт без `defer`, надто довгий шаблон'],
          ['Доступність', 'зображення без `alt`, кнопка без назви'],
          ['Чистоту', 'невикористані `assign`, недосяжний код, неіснуючі налаштування'],
          ['Контракт сніпетів', 'невідповідність переданих параметрів анотаціям LiquidDoc'],
        ],
      },
      {
        type: 'note',
        tone: 'warn',
        title: 'Пастка',
        text: 'Theme Check — статичний аналіз, і він не знає ваших даних. Він не скаже, що на порожній колекції сітка виглядає зламаною, що метаполе порожнє в девʼяноста відсотках товарів або що мерчант видалив картинку. Зелений лінтер означає «файли охайні», а не «тема працює», — перевірку на реальних даних він не замінює.',
      },
      {
        type: 'note',
        tone: 'tip',
        title: 'Сильніша відповідь',
        text: 'Скажи, що цінність лінтера зʼявляється тоді, коли він стоїть у CI й не пускає гілку в `main` — інакше попередження накопичуються, і за пів року їх шістсот, тобто фактично нуль. І додай практичну деталь із командної роботи: `.theme-check.yml` із домовленими правилами знімає половину суперечок на ревʼю, бо стиль стає машинною перевіркою, а не питанням смаку.',
      },
    ],
    followUps: [
      'Як вбудувати Theme Check у CI?',
      'Чому зелений Theme Check не означає, що тема працює?',
      'Як вимкнути одне правило для одного файлу?',
    ],
  },
  {
    id: 'qa-s-performance-08',
    topic: 'performance',
    level: 'senior',
    q: 'Що ти дивишся в Lighthouse? Розкажи про Core Web Vitals стосовно теми Shopify.',
    short:
      'Три метрики, і кожна ламається по-своєму. LCP — коли зʼявляється найбільший елемент першого екрана: у темі це майже завжди банер, тож лікується правильним розміром зображення, `preload` і відсутністю `lazy` зверху. CLS — стрибки макета: лікуються атрибутами `width` і `height` на зображеннях, зарезервованим місцем під банери й шрифтами з `font-display: swap`. INP — затримка відповіді на дію: це вже JavaScript, і в магазині це зазвичай не тема, а скрипти застосунків. Важливо розрізняти лабораторні цифри Lighthouse і польові дані реальних користувачів: у рейтингу враховуються саме польові, а Lighthouse — інструмент, щоб знайти причину.',
    blocks: [
      {
        type: 'table',
        head: ['Метрика', 'Що міряє', 'Типова причина в темі', 'Що робити'],
        rows: [
          ['LCP', 'поява найбільшого елемента', 'банер першого екрана: завеликий файл або `lazy`', '`preload`, правильна ширина, `fetchpriority`'],
          ['CLS', 'стрибки макета', 'зображення без розмірів, пізні шрифти, банер оголошень', '`width`/`height`, резерв місця, `font-display: swap`'],
          ['INP', 'затримка відповіді на дію', 'важкий JS застосунків і каруселей', 'менше JS, `defer`, ліниві модулі'],
        ],
      },
      {
        type: 'code',
        lang: 'liquid',
        title: 'Три рядки, які найчастіше рятують LCP і CLS',
        code: '{% comment %} 1. Банер: просимо браузер узяти його першим {% endcomment %}\n{{ section.settings.image | image_url: width: 1600 | image_tag: preload: true, fetchpriority: \'high\', sizes: \'100vw\', widths: \'600, 900, 1200, 1600\' }}\n\n{% comment %} 2. Резервуємо місце під картинку картки — жодного стрибка {% endcomment %}\n<div style="aspect-ratio: {{ product.featured_image.aspect_ratio | default: 1 }}">\n  {{ product.featured_image | image_url: width: 400 | image_tag: loading: \'lazy\' }}\n</div>\n\n{% comment %} 3. Шрифт теми — з підключенням наперед {% endcomment %}\n{{ settings.type_body_font | font_face: font_display: \'swap\' }}',
      },
      {
        type: 'note',
        tone: 'warn',
        title: 'Пастка',
        text: 'Бал Lighthouse на ноутбуці розробника — це не те, що бачить Google і не те, що бачить покупець із телефона в метро. Лабораторний прогін корисний як діагностика, але рішення «стало краще» ухвалюють за польовими даними, де є реальні пристрої й мережі. І окремо: зробити бал вищим, вимкнувши застосунки на час тесту, — це не оптимізація, а самообман.',
      },
      {
        type: 'note',
        tone: 'shopify',
        text: 'У магазині є власний звіт швидкості (Online Store → Themes), який показує оцінку за головною, типовою сторінкою товару й колекції та її динаміку. Він зручний, щоб говорити з мерчантом на одній мові, але це теж лабораторні дані — і він не розділяє внесок теми й застосунків.',
      },
      {
        type: 'note',
        tone: 'tip',
        title: 'Сильніша відповідь',
        text: 'Покажи, що розумієш межі впливу теми. Розробник відповідає за розмітку, зображення, шрифти й власний JS; за скрипти застосунків і сторонні піксели — ні, і чесна відповідь звучить як «ось внесок теми, а ось внесок застосунків, рішення за магазином». І додай дешевий інженерний хід: зробити один прогін ДО правок і зберегти його — без базової точки будь-яка розмова про «стало швидше» безпредметна.',
      },
    ],
    followUps: [
      'Чим польові дані відрізняються від лабораторних?',
      'Як довести, що CLS спричиняє саме смужка оголошень?',
      'Що з Core Web Vitals тема взагалі не контролює?',
    ],
  },
  {
    id: 'qa-s-performance-09',
    topic: 'performance',
    level: 'senior',
    q: 'Як Shopify кешує сторінки і чому `{{ \'now\' | date: … }}` показує не поточний час?',
    short:
      'Сторінки вітрини віддаються через CDN, і відрендерений Liquid може перевикористовуватись для багатьох відвідувачів. Через це `now` — це не «зараз», а момент, коли Liquid востаннє рендерився: таймер зворотного відліку, зверстаний на Liquid, зупиниться на часі кешу й показуватиме одне й те саме годинами. Висновок простий: усе, що залежить від поточного часу або від конкретного відвідувача, рахується в браузері або запитується окремо, а Liquid віддає лише сталу дату-орієнтир. Те саме стосується персоналізації: ніколи не виводь у HTML щось на кшталт «вітаємо, Софіє», якщо сторінка може лежати в кеші — імʼя підставляє JavaScript після завантаження.',
    blocks: [
      {
        type: 'example',
        title: 'Liquid дає орієнтир, а рахує браузер',
        template:
          '{% assign ends_at = \'2026-12-31T23:59:59+02:00\' %}\n<div class="countdown" data-ends-at="{{ ends_at }}">\n  Акція діє до {{ ends_at | date: \'%d.%m.%Y\' }}\n</div>\n\n{% comment %} А ось так робити НЕ можна — це час рендеру, а не «зараз» {% endcomment %}\nВідрендерено: {{ \'now\' | date: \'%H:%M\' }}',
        note: 'У дату в атрибуті вбудована стала мітка часу — її браузер перетворить на живий відлік. Рядок з `now` показує момент рендеру: на закешованій сторінці він може бути й учорашнім.',
      },
      {
        type: 'code',
        lang: 'js',
        title: 'Відлік рахує клієнт',
        code: 'for (const el of document.querySelectorAll(\'.countdown\')) {\n  const ends = new Date(el.dataset.endsAt).getTime()\n  const tick = () => {\n    const left = ends - Date.now()\n    el.textContent = left > 0 ? formatLeft(left) : \'Акція завершилась\'\n    if (left > 0) requestAnimationFrame(tick)\n  }\n  tick()\n}',
      },
      {
        type: 'table',
        head: ['Що', 'Liquid', 'Браузер / окремий запит'],
        rows: [
          ['Дата завершення акції', 'так — стала', '—'],
          ['Скільки лишилось часу', 'ні — застигне', 'так'],
          ['Ціна, назва, опис товару', 'так', '—'],
          ['Вміст кошика на сторінці товару', 'ризиковано', 'краще `/cart.js` або секція через API'],
          ['Імʼя клієнтки в шапці', 'ні на кешованій сторінці', 'так, після завантаження'],
          ['Залишок «лишилось 2 шт»', 'так, але може застаріти', 'уточнювати запитом, якщо критично'],
        ],
      },
      {
        type: 'note',
        tone: 'warn',
        title: 'Пастка',
        text: 'Найнеприємніший варіант цієї помилки — не таймер, а персоналізація: розробник виводить у HTML щось, що залежить від конкретного відвідувача, і на кешованій сторінці це бачить не та людина. Правило просте: усе, що стосується конкретного покупця, підвантажується після завантаження сторінки, а не рендериться в Liquid.',
      },
      {
        type: 'note',
        tone: 'tip',
        title: 'Сильніша відповідь',
        text: 'Сформулюй це як правило поділу: Liquid — для того, що однакове для всіх і рідко міняється; JavaScript і Ajax-ендпоінти — для того, що залежить від часу, кошика чи конкретної людини. І згадай Section Rendering API як місток між ними: він дозволяє лишити розмітку в Liquid, але отримати її свіжою саме тоді, коли треба, — так і роблять живий кошик і блок наявності.',
      },
    ],
    followUps: [
      'Як тоді зробити банер «акція закінчується через 2 години»?',
      'Чому не можна вітати клієнтку по імені прямо в Liquid?',
      'Що не кешується взагалі?',
    ],
  },
]

/* ═══════════════════════ security ═══════════════════════ */

const security: InterviewQA[] = [
  {
    id: 'qa-s-security-01',
    topic: 'security',
    level: 'middle',
    q: 'Чи можна отримати XSS у темі Shopify? Звідки він береться і як ти його не допускаєш?',
    short:
      'Так, можна — Liquid нічого не екранує автоматично: що поклав у `{{ }}`, те й потрапить у HTML як є. Небезпечне все, на що може вплинути відвідувач: пошуковий запит, властивості позиції кошика, нотатка до замовлення, параметри адреси, поля, які клієнтка заповнює сама. Класичний сценарій — вивести `search.terms` у заголовку «Результати для …» без екранування або підставити параметр адреси в атрибут. Правило в мене просте: усе, що прийшло не з адмінки магазину, іде через `escape`, у JavaScript передається тільки через `json`, а в атрибути — у подвійних лапках і теж екранованим. Опис товару й текст статті — окремий випадок: це навмисний HTML мерчанта, і його не екранують.',
    blocks: [
      {
        type: 'example',
        title: 'Той самий рядок сирий і екранований',
        data: { search: { terms: 'шампунь <img src=x onerror="alert(1)"> "кератин"', results_count: 3 } },
        template:
          'Сирий вивід: {{ search.terms }}\nЕкранований: {{ search.terms | escape }}\nБез тегів взагалі: {{ search.terms | strip_html }}\n\nУ атрибуті: <input value="{{ search.terms | escape }}">',
        note: 'У першому рядку в HTML поїхав справжній тег `<img>` з обробником. У другому — лише текст. Різниця — один фільтр.',
      },
      {
        type: 'table',
        head: ['Джерело даних', 'Небезпечне?', 'Як виводити'],
        rows: [
          ['`search.terms`', 'так — це рядок із адреси', '`| escape`'],
          ['Параметри адреси, `request.path`', 'так', '`| escape`, в атрибутах — обовʼязково'],
          ['`line_item.properties` — те, що ввів покупець', 'так', '`| escape`'],
          ['`cart.note`, коментарі до статей', 'так', '`| escape`'],
          ['Імʼя й адреса клієнтки', 'так — вона сама їх увела', '`| escape`'],
          ['`product.description`, `article.content`', 'ні — це навмисний HTML мерчанта', 'виводити як є'],
          ['`settings.*` з редактора теми', 'ні — мерчант редагує свій магазин', 'як є; `richtext` і так HTML'],
          ['Будь-що, що йде в `<script>`', 'так', '`| json`, а не лапки руками'],
        ],
      },
      {
        type: 'code',
        lang: 'liquid',
        title: 'Три місця, де екранування обовʼязкове',
        code: '{% comment %} 1. Текст на сторінці {% endcomment %}\n<h1>Результати для «{{ search.terms | escape }}»</h1>\n\n{% comment %} 2. Значення атрибута — ЗАВЖДИ в подвійних лапках {% endcomment %}\n<input type="search" name="q" value="{{ search.terms | escape }}">\n\n{% comment %} 3. Дані для JavaScript {% endcomment %}\n<script type="application/json" id="search-meta">\n  {{ search.terms | json }}\n</script>',
      },
      {
        type: 'note',
        tone: 'warn',
        title: 'Пастка',
        text: 'Найнебезпечніше місце — не текст, а атрибут: `href="{{ url }}"` з адресою на `javascript:` або `onclick="doThing(\'{{ name }}\')"` із лапкою всередині імені. `escape` рятує від лапок, але не перевіряє схему посилання, тож адреси з налаштувань і з даних варто звіряти зі списком дозволеного або будувати з `routes`. І ніколи не клей JavaScript із Liquid-рядків: параметри передавай через `data`-атрибути або окремий `<script type="application/json">`.',
      },
      {
        type: 'note',
        tone: 'tip',
        title: 'Сильніша відповідь',
        text: 'Покажи, що розумієш модель довіри: у темі немає «користувацького вводу» в класичному сенсі — є дані мерчанта, яким довіряють за визначенням, і дані відвідувача, яким не довіряють ніколи. Тому питання завжди формулюється як «хто міг це написати», а не «чи схоже це на HTML». І додай межу відповідальності: чекаут і платіжні сторінки — не тема, туди довільного коду не вставити, і це свідоме обмеження платформи.',
      },
    ],
    followUps: [
      'Чому опис товару не екранують?',
      'Чим небезпечний `href` із даних?',
      'Як передати рядок із Liquid у функцію JavaScript?',
    ],
  },
  {
    id: 'qa-s-security-02',
    topic: 'security',
    level: 'junior',
    q: 'Що Liquid екранує сам, а що ні? Чим `escape` відрізняється від `escape_once` і `strip_html`?',
    short:
      'Liquid не екранує нічого сам — вивід іде в HTML як є, і це свідоме рішення: тема постійно друкує підготовлений мерчантом HTML на кшталт опису товару. Тому екранування — завжди ручне. `escape` перетворює спецсимволи на сутності: `<` стає `&lt;`, лапки — на `&#34;`. `escape_once` робить те саме, але не чіпає вже екранованого — рятує від подвійного екранування, коли рядок міг пройти фільтр раніше. `strip_html` не екранує, а вирізає теги взагалі, тож він для іншого — коротких описів, мета-тегів, тексту в атрибуті `alt`. Плутати їх дорого: `strip_html` там, де треба `escape`, лишає діру, бо він прибирає теги, а не лапки.',
    blocks: [
      {
        type: 'example',
        title: 'Три фільтри на одному рядку',
        data: { raw: '<b>Кератин</b> &amp; догляд "преміум" <script>alert(1)</script>' },
        template:
          'як є:        {{ raw }}\nescape:      {{ raw | escape }}\nescape_once: {{ raw | escape_once }}\nstrip_html:  {{ raw | strip_html }}',
        note: 'Дивись на `&amp;`: `escape` перетворив його на `&amp;amp;` — подвійне екранування, яке видно користувачу. `escape_once` лишив його як є.',
      },
      {
        type: 'table',
        head: ['Фільтр', 'Що робить', 'Коли потрібен'],
        rows: [
          ['`escape`', 'спецсимволи → сутності', 'текст і атрибути з недовірених даних'],
          ['`escape_once`', 'те саме, але не чіпає вже екранованого', 'рядок міг проходити екранування раніше'],
          ['`strip_html`', 'вирізає теги, лапок не чіпає', 'мета-опис, `alt`, коротка анотація'],
          ['`json`', 'коректний JSON із екранованими лапками', 'дані для JavaScript'],
          ['`url_encode`, `url_param_escape`', 'кодує для адреси', 'значення в query-параметрі'],
        ],
      },
      {
        type: 'example',
        title: 'Де що доречно на практиці',
        preset: 'product',
        template:
          '<meta name="description" content="{{ product.description | strip_html | truncate: 155 | escape }}">\n\n<img src="…" alt="{{ product.title | escape }}">\n\n<a href="/search?q={{ product.vendor | url_param_escape }}">Усе від {{ product.vendor | escape }}</a>',
        note: 'У мета-описі потрібні обидва: `strip_html` прибирає розмітку, `escape` — лапки, які інакше закрили б атрибут. В адресі працює вже не `escape`, а кодування параметра.',
      },
      {
        type: 'note',
        tone: 'warn',
        title: 'Пастка',
        text: '`strip_html` — не захист. Рядок `Шампунь" onmouseover="alert(1)` не містить жодного тега, тож фільтр поверне його недоторканим, а в атрибуті він розірве лапки. Для атрибута завжди `escape`, а `strip_html` — лише щоб прибрати розмітку з тексту.',
      },
      {
        type: 'note',
        tone: 'tip',
        title: 'Сильніша відповідь',
        text: 'Скажи, що вибір фільтра визначається не даними, а **місцем**, куди вони потраплять: у тексті сторінки — `escape`, в атрибуті — `escape` і подвійні лапки, у параметрі адреси — `url_param_escape`, у JavaScript — `json`. Один і той самий рядок у трьох місцях потребує трьох різних фільтрів — і саме це найчастіше пропускають.',
      },
    ],
    followUps: [
      'Чому Liquid не екранує автоматично?',
      'Що станеться, якщо застосувати `escape` двічі?',
      'Який фільтр потрібен для значення в query-параметрі?',
    ],
  },
  {
    id: 'qa-s-security-03',
    topic: 'security',
    level: 'senior',
    q: 'Як правильно передати дані з Liquid у JavaScript? Навіщо там `json`?',
    short:
      'Фільтр `json` перетворює будь-яке значення Liquid на коректний JSON — із лапками, екранованими лапками всередині, і правильними типами. Головне — він робить вивід самодостатнім: його не треба обгортати в лапки руками, і саме ручне обгортання є джерелом половини помилок, бо перша ж лапка в назві товару ламає скрипт. Але сам по собі `json` не робить вставку в HTML безпечною, тож я не клею JSON у тіло `<script>` разом із кодом, а кладу його окремим блоком `<script type="application/json">` і читаю через `JSON.parse` — так дані й код не змішуються. Друге правило: передавати рівно ті поля, які потрібні; вивалювати в HTML увесь обʼєкт товару — це і зайві кілобайти на кожній картці, і дані, яких там бути не мало.',
    blocks: [
      {
        type: 'example',
        title: '`json` проти ручних лапок',
        data: { title: 'Шампунь "Кератин" 250 мл', tags: ['догляд', 'хіт'], price: 64900 },
        template:
          'Ручні лапки (зламається): var t = "{{ title }}";\nЧерез json (коректно): var t = {{ title | json }};\n\nМасив:  {{ tags | json }}\nЧисло:  {{ price | json }}\nnil:    {{ missing | json }}',
        note: 'У першому рядку лапки всередині назви закрили рядок — у браузері це синтаксична помилка й мертвий скрипт. `json` подбав і про лапки, і про типи: масив лишився масивом, число — числом.',
      },
      {
        type: 'code',
        lang: 'liquid',
        title: 'Як це роблять у сучасних темах',
        code: '{% comment %} Дані — окремим блоком, не всередині коду {% endcomment %}\n<script type="application/json" id="product-data-{{ section.id }}">\n  {\n    "id": {{ product.id | json }},\n    "title": {{ product.title | json }},\n    "url": {{ product.url | json }},\n    "variants": {{ product.variants | json }}\n  }\n</script>\n\n{% comment %} Дрібниця — краще data-атрибутом {% endcomment %}\n<product-form data-product-id="{{ product.id }}" data-cart-url="{{ routes.cart_url }}"></product-form>',
      },
      {
        type: 'code',
        lang: 'js',
        title: 'І читання на боці браузера',
        code: 'const node = document.getElementById(`product-data-${sectionId}`)\nconst product = JSON.parse(node.textContent)\n\n// Дані й код не змішані: скрипт теми той самий для всіх сторінок,\n// а це означає, що він кешується, а не приїжджає з кожним HTML.',
      },
      {
        type: 'example',
        title: 'Скільки насправді важить «просто передати товар»',
        preset: 'product',
        template:
          'Повний варіант: {{ product.selected_or_first_available_variant | json }}\n\nЛише потрібне:\n{\n  "id": {{ product.selected_or_first_available_variant.id | json }},\n  "price": {{ product.selected_or_first_available_variant.price | json }},\n  "available": {{ product.selected_or_first_available_variant.available | json }}\n}',
        note: 'Повний обʼєкт варіанта — це десяток полів, які скрипту не потрібні. Помнож на пʼятдесят карток у сітці.',
        shopifyOutput:
          'У справжньому Shopify `json` на обʼєкті товару НЕ друкує `inventory_quantity` і `inventory_policy` — їх навмисно прибрали, щоб залишки не збирали ботами. Пісочниця їх показує, бо це звичайний JSON без цього правила.',
      },
      {
        type: 'note',
        tone: 'warn',
        title: 'Пастка',
        text: '`json` дбає про валідність JSON, а не про HTML навколо нього: рядок із послідовністю `</script>` усередині даних закриє тег скрипта раніше, ніж ти очікуєш. Тому дані тримають у `<script type="application/json">`, а не всередині виконуваного коду, і ніколи не вставляють у `onclick` чи в інший інлайн-обробник. Друга пастка — вивести в JSON те, що не мало бути публічним: усе, що в HTML, бачить будь-хто, включно з ботами.',
      },
      {
        type: 'note',
        tone: 'tip',
        title: 'Сильніша відповідь',
        text: 'Наведи архітектурний аргумент: дані в HTML — це дані, які не кешуються окремо й їдуть із кожною сторінкою. Тому невеликий стан передають `data`-атрибутами, середній — блоком `application/json`, а все велике чи змінне беруть запитом: `/products/<handle>.js`, `/cart.js` або Section Rendering API. Кандидат, який на це питання одразу згадує альтернативу «взяти запитом», показує, що думає про сторінку цілком, а не про один рядок.',
      },
    ],
    followUps: [
      'Чому дані краще класти в окремий `<script type="application/json">`?',
      'Коли краще не передавати дані в HTML, а зробити запит?',
      'Які поля Shopify не віддає через `json` і чому?',
    ],
  },
]

/* ═══════════════════════ debugging ═══════════════════════ */

const debugging: InterviewQA[] = [
  {
    id: 'qa-s-debugging-01',
    topic: 'debugging',
    level: 'junior',
    q: 'Як ти дивишся, що насправді лежить в обʼєкті Liquid? Навіщо `| json`?',
    short:
      'У Liquid немає ні консолі, ні точки зупинки, тож найшвидший спосіб зазирнути всередину — вивести обʼєкт фільтром `json`: він друкує повну структуру з усіма полями й типами. Так одразу видно, чи є потрібна властивість, чи вона порожня, і що це — рядок, число чи масив. Поруч корисні дрібніші перевірки: `size` показує довжину масиву, а обгортка виводу в квадратні дужки робить видимою різницю між порожнім рядком і `nil`. Після налагодження такі рядки прибирають: `json` на великому обʼєкті — це кілобайти в HTML, які бачить будь-хто.',
    blocks: [
      {
        type: 'example',
        title: 'Три способи подивитись на дані',
        preset: 'product',
        template:
          '{% comment %} 1. Уся структура {% endcomment %}\n{{ product.selected_or_first_available_variant | json }}\n\n{% comment %} 2. Що це взагалі — порожній рядок чи nil? {% endcomment %}\nописова назва: [{{ product.subtitle }}]\ntags: {{ product.tags | json }} — {{ product.tags.size }} шт.\n\n{% comment %} 3. Перевірка «чи є що виводити» {% endcomment %}\nblank? {{ product.subtitle == blank }} · nil? {{ product.subtitle == nil }}',
        note: 'Квадратні дужки навколо виводу — найдешевший «дебагер»: без них порожній рядок і `nil` виглядають однаково, тобто ніяк.',
      },
      {
        type: 'code',
        lang: 'liquid',
        title: 'Тимчасовий блок налагодження, який не поїде в прод',
        code: '{% comment %} Видно лише в редакторі теми, покупці цього не побачать {% endcomment %}\n{% if request.design_mode %}\n  <pre style="direction:ltr;text-align:left;white-space:pre-wrap">\n    template: {{ template.name }} / {{ template.suffix }}\n    section:  {{ section.id }} · блоків {{ section.blocks.size }}\n    settings: {{ section.settings | json }}\n  </pre>\n{% endif %}',
      },
      {
        type: 'table',
        head: ['Що треба зрозуміти', 'Чим дивитись'],
        rows: [
          ['Які взагалі є поля', '`{{ obj | json }}`'],
          ['Скільки елементів у масиві', '`{{ arr.size }}`'],
          ['Порожньо чи немає зовсім', '`== blank`, `== nil`, дужки навколо виводу'],
          ['Який це тип', '`json`: лапки — рядок, без лапок — число'],
          ['Що саме робить ланцюжок фільтрів', 'розбити на кроки через `assign` і вивести кожен'],
          ['На якому шаблоні ми зараз', '`{{ template.name }}`, `{{ request.page_type }}`'],
        ],
      },
      {
        type: 'note',
        tone: 'warn',
        title: 'Пастка',
        text: '`{{ product | json }}` на сторінці товару — це кілька десятків кілобайтів у HTML, і воно буває забутим у бойовій темі. Такий вивід, по-перше, роздуває сторінку, по-друге, віддає ботам структуровані дані на блюдечку. Правило: будь-який `json` для налагодження загортай у `{% if request.design_mode %}` одразу, а не «потім приберу».',
      },
      {
        type: 'note',
        tone: 'tip',
        title: 'Сильніша відповідь',
        text: 'Згадай `shopify theme console` — Liquid-REPL із CLI: він виконує вирази в контексті реальної сторінки магазину, тож перевірити, чи є метаполе, можна без правки файлів і без деплою. Це той інструмент, про який більшість не знає, і він одразу відрізняє «я правлю шаблон і оновлюю сторінку» від «я перевіряю гіпотезу».',
      },
    ],
    followUps: [
      'Чим `blank` відрізняється від `nil` і від `empty`?',
      'Як подивитись проміжний результат ланцюжка фільтрів?',
      'Що таке `shopify theme console`?',
    ],
  },
  {
    id: 'qa-s-debugging-02',
    topic: 'debugging',
    level: 'middle',
    q: 'На живій сторінці зʼявився `Liquid error`. Як ти це читаєш і що робиш далі?',
    short:
      'Shopify не валить сторінку через помилку в Liquid: він друкує повідомлення просто в тому місці, де мав бути вивід, а решта сторінки рендериться далі. У повідомленні зазвичай є файл і рядок — на кшталт «Liquid error (sections/main-product line 42)» — тож перший крок це прочитати саме їх, а не гадати. Далі я дивлюсь тип помилки: невідомий фільтр і незакритий тег — це одруківка, «divided by 0» чи помилка порівняння — це дані, яких я не очікував, найчастіше `nil` замість числа. І головне, що я памʼятаю: набагато небезпечніші випадки, коли помилки НЕМАЄ, а вивід порожній — Liquid мовчки друкує порожнечу на відсутньому обʼєкті, і саме такі баги знаходять мерчанти, а не розробники.',
    blocks: [
      {
        type: 'example',
        title: 'Помилка, яку видно',
        preset: 'product',
        expectError: true,
        template: '{{ product.featured_image | image_url }}',
        note: '`image_url` без `width` і без `height` — помилка і в пісочниці, і в Shopify. Різниця в тому, що тут рендер зупиняється, а на справжній сторінці на цьому місці зʼявиться рядок `Liquid error: …`, і решта сторінки намалюється.',
      },
      {
        type: 'example',
        title: 'Помилки немає — і це гірше',
        preset: 'shop',
        template:
          'Ціна: [{{ product.price | money }}]\nВаріантів: [{{ product.variants.size }}]\nСкладання з nil: [{{ product.price | plus: 100 }}]',
        note: 'Це головна сторінка, `product` тут не існує. Жодної помилки: `money` на `nil` дав порожній рядок, `size` неіснуючого масиву — теж порожньо, а `plus` спокійно порахував від нуля й видав 100. Саме так виглядає мовчазний баг: число на сторінці є, і воно неправильне.',
      },
      {
        type: 'table',
        head: ['Повідомлення', 'Що сталося', 'Куди дивитись'],
        rows: [
          ['`Unknown filter`', 'одруківка в імені фільтра або фільтр не існує', 'написання, довідник фільтрів'],
          ['`Liquid syntax error … tag never closed`', 'бракує `{% end… %}`', 'вкладеність тегів у файлі'],
          ['`divided by 0`', 'дільник виявився `nil` або нулем', 'дані, а не формула'],
          ['`Could not find asset snippets/…`', 'сніпета немає або одруківка в імені', 'тека `snippets`'],
          ['`image_url` без розміру', 'забутий `width`/`height`', 'виклик фільтра'],
          ['Порожньо, помилки немає', 'обʼєкта не існує в цьому контексті', 'шаблон і область видимості'],
        ],
      },
      {
        type: 'note',
        tone: 'warn',
        title: 'Пастка',
        text: 'Помилка в схемі поводиться зовсім інакше за помилку в розмітці: невалідний JSON у `{% schema %}` — це не рядок на сторінці, а відмова зберегти файл і зламана секція в редакторі. Тому коли «секція зникла з редактора», а на сторінці все чисто, дивись не в розмітку, а в JSON схеми.',
      },
      {
        type: 'note',
        tone: 'tip',
        title: 'Сильніша відповідь',
        text: 'Скажи, що відсутність помилок — це властивість Liquid, а не ознака справності, тому в темі ти сам ставиш запобіжники: `{% if product == blank %}` із чесним повідомленням у редакторі, `default` на числах, `{% else %}` у циклах. Тема, яка мовчки малює порожнечу, коштує мерчанту тижнів — він просто не знає, що там мало щось бути.',
      },
    ],
    followUps: [
      'Чому Liquid не падає на `nil`?',
      'Як помилка в `{% schema %}` відрізняється від помилки в розмітці?',
      'Як зробити, щоб порожній стан секції був помітним?',
    ],
  },
  {
    id: 'qa-s-debugging-03',
    topic: 'debugging',
    level: 'junior',
    q: 'Як виглядає твій робочий процес із Shopify CLI? Які команди ти використовуєш щодня?',
    short:
      'Основна команда — `shopify theme dev`: вона піднімає локальний перегляд теми, підключений до справжнього магазину, і оновлює сторінку щойно я зберіг файл. Тобто я редагую локально, а бачу свої зміни на реальних товарах і налаштуваннях. Поруч із нею постійно крутиться `shopify theme check` — лінтер, який ловить помилки до того, як їх побачить хтось інший. Викладаю змінами `shopify theme push`, причому на чужому проді — обовʼязково в неопубліковану тему через `--unpublished`, а чужу тему спершу забираю собі через `shopify theme pull`. Із дрібного, але дуже корисного — `shopify theme list`, щоб не переплутати теми, і `shopify theme console` для швидкої перевірки виразу Liquid.',
    blocks: [
      {
        type: 'code',
        lang: 'text',
        title: 'Щоденний набір',
        code: '# Локальний перегляд із живими даними магазину\nshopify theme dev --store liquid-lab.myshopify.com\n\n# Лінтер — перед кожним комітом і в CI\nshopify theme check\n\n# Забрати поточний стан теми з магазину (перед правками чужої теми)\nshopify theme pull --theme 123456789\n\n# Викласти як НОВУ неопубліковану тему — нічого не перетираємо\nshopify theme push --unpublished\n\n# Які взагалі теми є в магазині і яка з них жива\nshopify theme list\n\n# Перевірити вираз Liquid у контексті реальної сторінки\nshopify theme console',
      },
      {
        type: 'table',
        head: ['Команда', 'Навіщо'],
        rows: [
          ['`theme dev`', 'локальний перегляд із даними магазину й автооновленням'],
          ['`theme check`', 'лінтер теми'],
          ['`theme pull`', 'забрати файли теми з магазину'],
          ['`theme push`', 'викласти локальні файли; `--unpublished` створює нову тему'],
          ['`theme list`', 'перелік тем із id і статусом'],
          ['`theme share`', 'віддати тему на перегляд посиланням, не публікуючи'],
          ['`theme publish`', 'зробити тему живою'],
          ['`theme console`', 'REPL для Liquid у контексті сторінки'],
          ['`theme profile`', 'профіль рендеру Liquid для сторінки'],
        ],
      },
      {
        type: 'note',
        tone: 'warn',
        title: 'Пастка',
        text: 'Найдорожча помилка новачка — `shopify theme push` у живу тему без `--unpublished`: локальні файли перетирають те, що на проді, включно з правками, які мерчант робив у редакторі коду. Перед будь-якою роботою з чужою темою: `theme list`, щоб зрозуміти, де що, потім `theme pull` або дублікат теми, і лише тоді правки. І памʼятай, що налаштування з редактора живуть у `settings_data.json` — саме його найлегше затерти пушем.',
      },
      {
        type: 'note',
        tone: 'tip',
        title: 'Сильніша відповідь',
        text: 'Опиши процес, а не список команд: тема в Git, робота в гілці, `theme dev` для розробки, `theme check` у CI, викладка в неопубліковану тему, перегляд посиланням через `theme share`, і лише після підтвердження — публікація. І назви головне обмеження цього процесу: контент і налаштування магазину в Git не лежать, тож «відкотити реліз» відкочує КОД, а не те, що мерчант налаштував у редакторі.',
      },
    ],
    followUps: [
      'Чим `theme push --unpublished` відрізняється від звичайного `push`?',
      'Як ви тримаєте тему в Git і що робити з `settings_data.json`?',
      'Що таке тема розробки (development theme) і скільки вона живе?',
    ],
  },
  {
    id: 'qa-s-debugging-04',
    topic: 'debugging',
    level: 'middle',
    q: 'Що таке `request.design_mode` і як тема має поводитись у редакторі інакше?',
    short:
      'Це булеве значення, яке дорівнює `true`, коли сторінку рендерять усередині редактора теми. Його використовують для двох речей: щоб не робити в редакторі того, що спотворює дані чи заважає, — не відправляти події аналітики, не запускати автопрогортання слайдера, не показувати спливні вікна; і щоб, навпаки, показати мерчанту службову підказку — «секція порожня, додайте блоки», «оберіть колекцію в налаштуваннях». Важливе обмеження: міняти цим саму вітрину не можна. Редактор має показувати те саме, що побачить покупець, інакше мерчант налаштовує одне, а на сайті виходить інше — і довіра до превʼю зникає.',
    blocks: [
      {
        type: 'example',
        title: 'Підказка для мерчанта, невидима покупцю',
        preset: 'shop',
        template:
          '{% if section.settings.collection == blank %}\n  {% if request.design_mode %}\n    <p class="editor-hint">Оберіть колекцію в налаштуваннях секції — поки що показувати нічого.</p>\n  {% endif %}\n{% else %}\n  тут була б сітка товарів\n{% endif %}\n{% schema %}\n{\n  "name": "Сітка товарів",\n  "settings": [{ "type": "collection", "id": "collection", "label": "Колекція" }]\n}\n{% endschema %}',
        note: 'У пісочниці `request.design_mode` дорівнює `false` — як на живій вітрині, тож підказка не зʼявилась і секція просто мовчить. Саме це й побачив би покупець.',
      },
      {
        type: 'code',
        lang: 'liquid',
        title: 'Що зазвичай вимикають у редакторі',
        code: '{% comment %} Аналітика: кліки мерчанта не мають потрапляти у звіти {% endcomment %}\n{% unless request.design_mode %}\n  <script src="{{ \'analytics.js\' | asset_url }}" defer></script>\n{% endunless %}\n\n{% comment %} Спливне вікно: інакше воно перекриває налаштування {% endcomment %}\n{% unless request.design_mode %}\n  {% render \'popup-newsletter\' %}\n{% endunless %}\n\n{% comment %} Автопрогортання: у редакторі мерчант не встигає налаштувати слайд {% endcomment %}\n<slideshow-component data-autoplay="{% if request.design_mode %}false{% else %}{{ section.settings.autoplay }}{% endif %}">',
      },
      {
        type: 'table',
        head: ['Що', 'У редакторі', 'На вітрині'],
        rows: [
          ['Події аналітики', 'не відправляти', 'відправляти'],
          ['Спливні вікна, банери згоди', 'ховати', 'показувати'],
          ['Автопрогортання слайдера', 'вимкнути', 'за налаштуванням'],
          ['Підказка «секція порожня»', 'показати', 'нічого не малювати'],
          ['Відкладене завантаження нижніх секцій', 'можна вимкнути', 'працює'],
          ['Ціни, тексти, товари', 'ТЕ САМЕ', 'ТЕ САМЕ'],
        ],
      },
      {
        type: 'note',
        tone: 'warn',
        title: 'Пастка',
        text: 'Спокуса «у редакторі покажемо заглушку, бо так гарніше» закінчується скаргою «у редакторі все добре, а на сайті порожньо». `request.design_mode` — для службової поведінки, а не для контенту. Поруч є вужчий `request.visual_preview_mode` — він `true` лише в візуальному превʼю секції в списку додавання, і саме ним прибирають те, що заважає маленькому знімку.',
      },
      {
        type: 'note',
        tone: 'tip',
        title: 'Сильніша відповідь',
        text: 'Згадай події редактора як другу половину теми: `shopify:section:load` після перезавантаження секції, `shopify:section:select`, `shopify:block:select`. Без них секція зі скриптом після правки налаштування перетворюється на мертву розмітку — слайдер більше не ініціалізований, — і мерчант бачить, що «тема ламається від кожного кліку». Кандидат, який згадує ці події поруч із `design_mode`, показує, що реально налаштовував теми, а не лише верстав.',
      },
    ],
    followUps: [
      'Чим `request.visual_preview_mode` відрізняється від `design_mode`?',
      'Чому не можна міняти контент залежно від `design_mode`?',
      'Що треба зробити, щоб скрипт секції ожив після перезавантаження в редакторі?',
    ],
  },
]

/* ═══════════════════════ practical ═══════════════════════ */

const practical: InterviewQA[] = [
  {
    id: 'qa-s-practical-01',
    topic: 'practical',
    level: 'junior',
    q: 'Як би ви зробили бейдж знижки з відсотком на картці товару?',
    short:
      'Спершу перевіряю, чи знижка взагалі є: `compare_at_price` більший за `price`. Далі рахую відсоток — різниця, помножена на сто й поділена на стару ціну, — і виводжу. Важливих деталей дві. Перша: ціни в Shopify зберігаються в копійках, тож ділити на сто перед `money` не треба, `money` робить це сам. Друга: `divided_by` на цілих числах ділить націло, тобто 18,7% стане 18% — для бейджа це навіть краще, бо ми не завищуємо знижку. Поруч із відсотком часто показують абсолютну економію, і саме її мерчанти люблять більше.',
    blocks: [
      {
        type: 'example',
        title: 'Бейдж цілком',
        preset: 'product',
        view: 'html',
        template:
          '{% assign v = product.selected_or_first_available_variant %}\n{% if v.compare_at_price > v.price %}\n  {% assign saved = v.compare_at_price | minus: v.price %}\n  {% assign off = saved | times: 100 | divided_by: v.compare_at_price %}\n  <span class="badge badge--sale">−{{ off }}%</span>\n  <s>{{ v.compare_at_price | money }}</s>\n  <strong>{{ v.price | money }}</strong>\n  <small>економія {{ saved | money }}</small>\n{% else %}\n  <strong>{{ v.price | money }}</strong>\n{% endif %}',
        note: 'Порядок фільтрів важливий: спершу `times: 100`, потім `divided_by`. Навпаки — і цілочисельне ділення дасть нуль ще до множення.',
      },
      {
        type: 'code',
        lang: 'liquid',
        title: 'Те саме в сітці: перевіряти треба товар, а не варіант',
        code: '{% comment %} У картці колекції ще немає обраного варіанта {% endcomment %}\n{% if product.compare_at_price_max > product.price_min %}\n  {% assign saved = product.compare_at_price_max | minus: product.price_min %}\n  {% assign off = saved | times: 100 | divided_by: product.compare_at_price_max %}\n  <span class="badge badge--sale">до −{{ off }}%</span>\n{% endif %}',
      },
      {
        type: 'note',
        tone: 'warn',
        title: 'Пастка',
        text: 'Товар без старої ціни має `compare_at_price` рівний `nil`, і порівняння `nil > price` дає `false` — тобто бейдж просто не зʼявиться, помилки не буде. А ось якщо мерчант випадково поставить стару ціну НИЖЧЕ за поточну, наївний код покаже «−0%» або відʼємний відсоток. Тому умова саме `compare_at_price > price`, а не «є `compare_at_price`».',
      },
      {
        type: 'note',
        tone: 'tip',
        title: 'Сильніша відповідь',
        text: 'Згадай точність: у справжньому Liquid поділ цілого на ціле теж відрізає дріб, тож щоб отримати округлення до найближчого, множать на `100.0` і додають `round`. І скажи про доступність: бейдж «−18%» без тексту нічого не каже скрінрідеру, тож поряд ставлять приховану підказку на кшталт «знижка 18 відсотків», а стару ціну обгортають у `<s>`, щоб вона читалась як закреслена.',
      },
    ],
    followUps: [
      'Чому ділити на 100 перед `money` не можна?',
      'Що покаже бейдж, якщо `compare_at_price` порожній?',
      'Як показати знижку для товару з різними цінами варіантів?',
    ],
  },
  {
    id: 'qa-s-practical-02',
    topic: 'practical',
    level: 'middle',
    q: 'Як вивести «від 649 ₴» для товару з варіантами й не збрехати?',
    short:
      'У обʼєкта товару вже є все потрібне: `price_min`, `price_max` і булеве `price_varies`. Тому логіка така: якщо ціни варіантів різні — пишемо «від» і мінімальну, якщо однакові — просто ціну без префікса. Перебирати варіанти циклом заради мінімуму не треба, це готові поля. Окремо памʼятаю про наявність: мінімальна ціна може належати варіанту, якого немає в наявності, і тоді «від 649» виглядає як обман — у такому разі або показую діапазон, або рахую мінімум лише серед доступних. І на сторінці товару ціна вже конкретна, там показують ціну обраного варіанта, а не «від».',
    blocks: [
      {
        type: 'example',
        title: 'Три варіанти виводу ціни',
        preset: 'product',
        template:
          '{% if product.price_varies %}\n  Картка в сітці: від {{ product.price_min | money }}\n  Діапазон:       {{ product.price_min | money }} – {{ product.price_max | money }}\n{% else %}\n  Одна ціна:      {{ product.price | money }}\n{% endif %}\n\nСторінка товару: {{ product.selected_or_first_available_variant.price | money }}\n\n{% assign live = product.variants | where: \'available\', true | sort: \'price\' %}\nМінімум серед доступних: {{ live.first.price | money }} ({{ live.size }} з {{ product.variants.size }} варіантів у наявності)',
        note: 'Останній рядок — та сама чесність: у прикладі найдорожчий варіант недоступний, і якби недоступним був найдешевший, «від» показувало б ціну, яку купити не можна.',
      },
      {
        type: 'table',
        head: ['Поле', 'Що дає'],
        rows: [
          ['`product.price`', 'те саме, що `price_min` — мінімальна ціна товару'],
          ['`product.price_min` / `price_max`', 'межі діапазону цін варіантів'],
          ['`product.price_varies`', '`true`, якщо ціни варіантів різні'],
          ['`product.selected_or_first_available_variant`', 'варіант для сторінки товару'],
          ['`product.compare_at_price_min` / `_max`', 'те саме для старих цін'],
        ],
      },
      {
        type: 'note',
        tone: 'warn',
        title: 'Пастка',
        text: 'Не пиши «від» беззастережно: якщо `price_varies` дорівнює `false`, префікс «від» перед єдиною ціною виглядає як спроба приховати доплату — і мерчанти це помічають першими. І не рахуй мінімум циклом по варіантах: це зайва робота на кожній картці сітки, а результат той самий, що в готового поля.',
      },
      {
        type: 'note',
        tone: 'tip',
        title: 'Сильніша відповідь',
        text: 'Додай, що підпис «від» — це рішення не розробника, а магазину, тож правильно винести його в переклад (`{{ \'products.price.from\' | t }}`) і в налаштування секції, а не зашивати рядок у сніпет. І згадай Shopify Markets: у мультивалютному магазині ціна приходить уже в валюті покупця, тому будь-яка власна арифметика з курсами в темі — помилка за визначенням.',
      },
    ],
    followUps: [
      'Що робити, якщо найдешевший варіант недоступний?',
      'Як показати діапазон, а не «від»?',
      'Звідки береться ціна на сторінці товару?',
    ],
  },
  {
    id: 'qa-s-practical-03',
    topic: 'practical',
    level: 'senior',
    q: 'Клієнт хоче блок «схожі товари» на сторінці товару, але без застосунку. Які в тебе варіанти й що обереш?',
    short:
      'Варіантів три, і вони різні за тим, хто відповідає за підбірку. Перший — Product Recommendations API від Shopify: він рахує рекомендації за реальними продажами й описами, підключається секцією через Section Rendering API і не потребує ручної роботи мерчанта. Другий — ручні звʼязки метаполем типу `list.product_reference`: мерчант сам каже, що з чим показувати, — найточніше, але масштабується рівно настільки, наскільки мерчант готовий це заповнювати. Третій — автоматика в Liquid по тегу, типу чи колекції: дешево, але це не рекомендації, а «щось схоже». Я зазвичай беру рекомендації Shopify як основу й даю метаполе як перевизначення для ключових товарів — автоматика працює скрізь, а ручна добірка там, де вона реально важлива.',
    blocks: [
      {
        type: 'example',
        title: 'Найдешевший варіант: підбірка з тієї самої колекції',
        preset: 'all',
        template:
          '{% assign pool = collections[\'home-care\'].products %}\n{% assign same_type = pool | where: \'type\', product.type | reject: \'handle\', product.handle %}\n{% assign same_vendor = pool | where: \'vendor\', product.vendor | reject: \'handle\', product.handle %}\n\nТого ж типу: {{ same_type | map: \'title\' | join: \', \' | default: \'—\' }}\nТого ж бренду: {{ same_vendor | map: \'title\' | join: \', \' | default: \'—\' }}',
        note: '`reject` прибирає сам товар із підбірки — без нього «схожі товари» починаються з того, який людина вже дивиться. Це найчастіший баг у таких блоках. А прочерк у першому рядку — і є той порожній стан, заради якого потрібен `default`: у цій колекції шампунь один.',
      },
      {
        type: 'code',
        lang: 'liquid',
        title: 'Рекомендації Shopify: секція + запит із браузера',
        code: '{% comment %} sections/product-recommendations.liquid {% endcomment %}\n<div\n  class="recommendations"\n  data-url="{{ routes.product_recommendations_url }}?section_id={{ section.id }}&product_id={{ product.id }}&limit=4"\n>\n  {% if recommendations.performed? and recommendations.products_count > 0 %}\n    <h2>{{ section.settings.heading }}</h2>\n    <ul class="grid">\n      {% for item in recommendations.products %}\n        <li>{% render \'card-product\', product: item %}</li>\n      {% endfor %}\n    </ul>\n  {% endif %}\n</div>',
      },
      {
        type: 'code',
        lang: 'js',
        title: 'Підвантажуємо секцію вже готовою розміткою',
        code: 'const box = document.querySelector(\'.recommendations\')\nconst res = await fetch(box.dataset.url)\nconst html = await res.text()\nconst fresh = new DOMParser().parseFromString(html, \'text/html\')\nbox.innerHTML = fresh.querySelector(\'.recommendations\').innerHTML',
      },
      {
        type: 'table',
        head: ['Підхід', 'Плюс', 'Мінус'],
        rows: [
          ['Recommendations API', 'рахує сам, за даними продажів', 'потрібен окремий запит; порожньо на новому товарі'],
          ['Метаполе `list.product_reference`', 'точно те, що хоче мерчант', 'ручна робота на кожен товар'],
          ['Колекція в метаполі товару', 'мерчант керує групою, а не парами', 'треба підтримувати колекції'],
          ['`where` по типу чи вендору', 'нуль налаштувань', 'це не рекомендації, а збіг властивості'],
          ['Теги-маркери («комплект-1»)', 'просто пояснити мерчанту', 'теги швидко перетворюються на смітник'],
        ],
      },
      {
        type: 'note',
        tone: 'warn',
        title: 'Пастка',
        text: 'Обʼєкт `recommendations` наповнюється лише тоді, коли секцію запитали через Product Recommendations API разом із Section Rendering API — у звичайному рендері сторінки `performed?` буде `false`, а список порожній. Тому «я вставив цикл по `recommendations.products` у шаблон товару, і нічого не виводиться» — не баг, а неправильний спосіб виклику.',
      },
      {
        type: 'note',
        tone: 'tip',
        title: 'Сильніша відповідь',
        text: 'Покажи, що думаєш про порожній стан і про ціну: рекомендації бувають порожні, тому блок мусить або зникати цілком, або мати запасну підбірку — і це рішення краще узгодити з мерчантом наперед. І додай, що підвантаження секції окремим запитом має приємний побічний ефект: важкий блок не затримує рендер самої сторінки товару, тобто не псує LCP.',
      },
    ],
    followUps: [
      'Чому `recommendations.products` порожній у звичайному рендері?',
      'Як дати мерчанту перевизначити автоматичну підбірку?',
      'Що показувати, якщо рекомендацій немає?',
    ],
  },
  {
    id: 'qa-s-practical-04',
    topic: 'practical',
    level: 'middle',
    q: 'Як ти зробиш мегаменю на `linklists`? Наскільки глибоко воно може бути вкладене?',
    short:
      'Меню в темі — це обʼєкт `linklists`, у якому лежать меню за handle, а в кожного меню є масив `links`. Кожне посилання має `title`, `url`, `active` і власний масив `links` — це і є вкладеність. У Shopify меню підтримує два рівні вкладеності під кореневим пунктом, тож у Liquid це два вкладені цикли, а не рекурсія: рекурсії в Liquid і немає. Мегаменю я роблю так: перший рівень — пункти шапки, другий — колонки, третій — посилання в колонці, і все це з одного меню, яке мерчант збирає в адмінці. Часто поруч із посиланням хочуть картинку чи опис — тоді структуру беруть з `linklists`, а оформлення колонки — з блоків секції або з метаполів колекції.',
    blocks: [
      {
        type: 'example',
        title: 'Два рівні меню',
        preset: 'shop',
        view: 'html',
        template:
          '{% assign menu = linklists[\'main-menu\'] %}\n<nav>\n  <ul>\n  {% for link in menu.links %}\n    <li>\n      <a href="{{ link.url }}"{% if link.active %} aria-current="page"{% endif %}>{{ link.title }}</a>\n      {% if link.links.size > 0 %}\n        <ul class="submenu">\n          {% for child in link.links %}\n            <li><a href="{{ child.url }}">{{ child.title }}</a></li>\n          {% endfor %}\n        </ul>\n      {% endif %}\n    </li>\n  {% endfor %}\n  </ul>\n</nav>',
        note: '`link.active` дає `true` для поточної сторінки — на ньому будують і підсвічування, і `aria-current`. Перевірка `link.links.size > 0` вирішує, малювати підменю чи ні.',
      },
      {
        type: 'code',
        lang: 'liquid',
        title: 'Мегаменю: структура з меню, оформлення з налаштувань',
        code: '{% for link in linklists[section.settings.menu].links %}\n  <li class="nav__item{% if link.links.size > 0 %} nav__item--mega{% endif %}">\n    <a href="{{ link.url }}">{{ link.title }}</a>\n\n    {% if link.links.size > 0 %}\n      <div class="mega">\n        {% for column in link.links %}\n          <div class="mega__col">\n            <a class="mega__title" href="{{ column.url }}">{{ column.title }}</a>\n            {% for item in column.links %}\n              <a href="{{ item.url }}">{{ item.title }}</a>\n            {% endfor %}\n          </div>\n        {% endfor %}\n\n        {% comment %} Картинка-промо — це вже блок секції, а не меню {% endcomment %}\n        {% for block in section.blocks %}\n          {% if block.settings.parent_handle == link.title | handleize %}\n            {{ block.settings.image | image_url: width: 400 | image_tag: loading: \'lazy\' }}\n          {% endif %}\n        {% endfor %}\n      </div>\n    {% endif %}\n  </li>\n{% endfor %}',
      },
      {
        type: 'table',
        head: ['Властивість посилання', 'Що дає'],
        rows: [
          ['`title`', 'текст пункту, як його ввів мерчант'],
          ['`url`', 'адреса; для меню з мовами вже з потрібним префіксом'],
          ['`active`', '`true` на поточній сторінці'],
          ['`links`', 'вкладені посилання — наступний рівень'],
          ['`type`, `object`', 'на що вказує пункт: колекція, товар, сторінка — і сам обʼєкт'],
        ],
      },
      {
        type: 'note',
        tone: 'warn',
        title: 'Пастка',
        text: 'Handle меню зашитий у коді — `linklists[\'main-menu\']` — це прихована залежність: мерчант створить нове меню, а тема далі малюватиме старе, бо про handle ніхто не знає. Дай налаштування типу `link_list`, і меню обиратимуть у редакторі. І не роби меню з блоків секції «щоб було красивіше»: тоді структура сайту живе у двох місцях і неминуче розʼїжджається.',
      },
      {
        type: 'note',
        tone: 'tip',
        title: 'Сильніша відповідь',
        text: 'Скажи, що рекурсії в Liquid немає, тож глибина меню в коді завжди явна — і це добре: три вкладені цикли чесно показують, що більшого меню тема не підтримує. І згадай доступність: мегаменю на `:hover` без клавіатури непридатне, тому сучасні теми роблять його на `<details>` або на кнопці з `aria-expanded`, а не на чистому CSS-ховері.',
      },
    ],
    followUps: [
      'Як дати мерчанту вибрати меню замість зашитого handle?',
      'Як додати до пункту меню картинку?',
      'Як зробити мегаменю доступним із клавіатури?',
    ],
  },
  {
    id: 'qa-s-practical-05',
    topic: 'practical',
    level: 'middle',
    q: 'Магазин запускає другу мову. Що треба зробити в темі?',
    short:
      'Головне правило — у коді теми не має бути жодного зашитого рядка: усі підписи йдуть через фільтр `t` і ключі з файлів локалізації в теці `locales`. Контент магазину — назви товарів, описи, сторінки — перекладається не темою, а на боці Shopify, і в Liquid він приходить уже потрібною мовою. Від теми додатково потрібні три речі: перемикач мов, правильні посилання й правильні мета-теги. Посилання будують від `routes` і від `.url` обʼєктів, бо в багатомовному магазині адреса отримує мовний префікс, а `canonical` і `hreflang` беруть з `shop.published_locales` і `request.locale`. І перевірити верстку: німецька або українська назва кнопки довша за англійську, і фіксовані ширини ламаються саме на запуску другої мови.',
    blocks: [
      {
        type: 'example',
        title: 'Переклади, множина й відсутній ключ',
        preset: 'shop',
        data: {
          locales: {
            cart: {
              empty: 'Кошик порожній',
              items: { one: '{{ count }} товар', other: '{{ count }} товарів' },
              free_shipping: 'До безкоштовної доставки ще {{ amount }}',
            },
          },
        },
        template:
          '{{ \'cart.empty\' | t }}\n{{ \'cart.items\' | t: count: 1 }}\n{{ \'cart.items\' | t: count: 5 }}\n{{ \'cart.free_shipping\' | t: amount: \'351,00 ₴\' }}\n\nЗабутий ключ: {{ \'cart.nope\' | t }}\nМова зараз: {{ request.locale.iso_code }} · опубліковані: {{ shop.published_locales | map: \'iso_code\' | join: \', \' }}',
        note: 'Відсутній ключ не валить сторінку — друкується маркер `translation missing`. Це і плюс, і пастка: такий текст спокійно доїде до продакшену, якщо ніхто не подивиться.',
      },
      {
        type: 'code',
        lang: 'json',
        title: 'locales/uk.json — плюрал і підстановка',
        code: '{\n  "cart": {\n    "empty": "Кошик порожній",\n    "items": {\n      "one": "{{ count }} товар",\n      "few": "{{ count }} товари",\n      "many": "{{ count }} товарів",\n      "other": "{{ count }} товарів"\n    },\n    "free_shipping": "До безкоштовної доставки ще {{ amount }}"\n  },\n  "products": {\n    "price": { "from": "від" }\n  }\n}',
      },
      {
        type: 'code',
        lang: 'liquid',
        title: 'Перемикач мов — це форма локалізації',
        code: '{% form \'localization\' %}\n  <input type="hidden" name="return_to" value="{{ request.path }}">\n  <select name="locale_code" onchange="this.form.submit()">\n    {% for locale in shop.published_locales %}\n      <option value="{{ locale.iso_code }}"{% if locale.iso_code == request.locale.iso_code %} selected{% endif %}>\n        {{ locale.endonym_name }}\n      </option>\n    {% endfor %}\n  </select>\n{% endform %}',
      },
      {
        type: 'note',
        tone: 'warn',
        title: 'Пастка',
        text: 'Не клей адреси руками: `/collections/{{ collection.handle }}` у багатомовному магазині загубить мовний префікс і викине людину на іншу мову. Бери `collection.url`, `product.url` і `routes.*` — вони вже враховують поточну локалізацію. Друга пастка — переклад чисел і дат: формат дати має йти через локалізовані формати фільтра `date`, а не через зашитий `%d.%m.%Y`.',
      },
      {
        type: 'note',
        tone: 'tip',
        title: 'Сильніша відповідь',
        text: 'Розділи три різні речі, які плутають в одну: **переклади теми** (файли `locales`, відповідальність розробника), **переклад контенту** (Shopify Translate & Adapt або застосунок, відповідальність магазину) і **валюта та ринки** (Shopify Markets, ціна приходить готовою). Кандидат, який одразу проводить цю межу, економить замовнику тиждень зʼясувань, «чому назви товарів не перекладаються, хоча тема багатомовна».',
      },
    ],
    followUps: [
      'Хто перекладає назви товарів — тема чи Shopify?',
      'Чому не можна будувати адреси конкатенацією?',
      'Як тема дізнається поточну мову?',
    ],
  },
  {
    id: 'qa-s-practical-06',
    topic: 'practical',
    level: 'senior',
    q: 'Як зробити перемикач варіантів на сторінці товару без перезавантаження? Розкажи про звʼязку Liquid і JS.',
    short:
      'Liquid відповідає за розмітку й дані, JavaScript — за реакцію на клік. Тобто в Liquid я виводжу перемикачі з `product.options_with_values`, готую дані варіантів окремим блоком JSON і ставлю приховане поле `id` у формі товару. Далі скрипт слухає зміну, знаходить варіант за комбінацією опцій, підставляє його `id` у поле форми, оновлює ціну, доступність і адресу через `history.replaceState`, щоб посилання можна було скопіювати. Ключовий момент — джерело істини лишається на сервері: ціни й наявність беруться з Liquid або окремим запитом, а не рахуються в браузері. Якщо перемикач має міняти більше, ніж ціну — наприклад, галерею й блок доставки, — я не збираю це в JS, а перезапитую секцію через Section Rendering API.',
    blocks: [
      {
        type: 'code',
        lang: 'liquid',
        title: 'Liquid: перемикачі, дані й форма',
        code: '<variant-picker data-section="{{ section.id }}" data-url="{{ product.url }}">\n  {% for option in product.options_with_values %}\n    <fieldset>\n      <legend>{{ option.name }}</legend>\n      {% for value in option.values %}\n        <input\n          type="radio"\n          id="opt-{{ section.id }}-{{ forloop.parentloop.index }}-{{ forloop.index }}"\n          name="option-{{ option.position }}"\n          value="{{ value | escape }}"\n          {% if option.selected_value == value %}checked{% endif %}\n        >\n        <label for="opt-{{ section.id }}-{{ forloop.parentloop.index }}-{{ forloop.index }}">{{ value }}</label>\n      {% endfor %}\n    </fieldset>\n  {% endfor %}\n\n  <script type="application/json" data-variants>\n    {{ product.variants | json }}\n  </script>\n</variant-picker>\n\n{% form \'product\', product %}\n  <input type="hidden" name="id" value="{{ product.selected_or_first_available_variant.id }}">\n  <button {% unless product.selected_or_first_available_variant.available %}disabled{% endunless %}>\n    {% if product.selected_or_first_available_variant.available %}Додати в кошик{% else %}Немає в наявності{% endif %}\n  </button>\n{% endform %}',
      },
      {
        type: 'code',
        lang: 'js',
        title: 'JS: знайти варіант і оновити форму',
        code: 'class VariantPicker extends HTMLElement {\n  connectedCallback() {\n    this.variants = JSON.parse(this.querySelector(\'[data-variants]\').textContent)\n    this.addEventListener(\'change\', () => this.onChange())\n  }\n\n  onChange() {\n    const chosen = [...this.querySelectorAll(\'input:checked\')].map((i) => i.value)\n    const variant = this.variants.find((v) => v.options.every((o, i) => o === chosen[i]))\n    if (!variant) return this.markUnavailable()\n\n    // Форма купівлі — єдине джерело того, що реально піде в кошик.\n    document.querySelector(\'form[action*="/cart/add"] [name="id"]\').value = variant.id\n\n    // Адресу оновлюємо, щоб посилання можна було переслати.\n    history.replaceState({}, \'\', `${this.dataset.url}?variant=${variant.id}`)\n\n    // Ціну й наявність малюємо з даних варіанта — або тягнемо секцію.\n    this.render(variant)\n  }\n}\ncustomElements.define(\'variant-picker\', VariantPicker)',
      },
      {
        type: 'code',
        lang: 'js',
        title: 'Коли міняється не лише ціна — перезапит секції',
        code: 'const res = await fetch(`${productUrl}?variant=${variant.id}&section_id=${sectionId}`)\nconst html = await res.text()\nconst fresh = new DOMParser().parseFromString(html, \'text/html\')\n\n// Розмітка лишається в Liquid: ціна, знижка, доставка, галерея — усе зі шаблону.\nfor (const part of [\'.price\', \'.availability\', \'.gallery\']) {\n  document.querySelector(part).replaceWith(fresh.querySelector(part))\n}',
      },
      {
        type: 'table',
        head: ['Що оновлюємо', 'Чим'],
        rows: [
          ['Прихований `id` у формі', 'обовʼязково JS — це те, що піде в кошик'],
          ['Ціна й стара ціна', 'дані варіанта або перезапит секції'],
          ['Доступність і напис кнопки', 'з `variant.available`'],
          ['Адреса сторінки', '`history.replaceState` із `?variant=`'],
          ['Галерея, знижки, блок доставки', 'перезапит секції — інакше дублюєш шаблон у JS'],
          ['Залишки', 'краще запитом: у HTML вони застарівають'],
        ],
      },
      {
        type: 'note',
        tone: 'warn',
        title: 'Пастка',
        text: 'Найдорожча помилка — забути оновити приховане поле `id`: візуально сторінка показує «400 мл», а в кошик іде варіант за замовчуванням. Це баг, який не видно на превʼю й видно в замовленнях. Друга — комбінація опцій, якої не існує: перемикач мусить показувати такі значення недоступними, а не мовчки нічого не робити при кліку.',
      },
      {
        type: 'note',
        tone: 'tip',
        title: 'Сильніша відповідь',
        text: 'Скажи, що вибір між «перерахувати в JS» і «перезапитати секцію» — це вибір, де живе шаблон. Щойно від варіанта залежить більше за ціну, копія розмітки в JavaScript починає розʼїжджатись із Liquid, і Section Rendering API дешевший, ніж підтримка двох шаблонів. І згадай прогресивне покращення: форма має працювати без JS — перемикач як посилання з `?variant=`, бо сторінка товару однаково рендериться під обраний варіант.',
      },
    ],
    followUps: [
      'Що станеться, якщо не оновити приховане поле `id`?',
      'Як показати недоступні комбінації опцій?',
      'Коли краще перезапитати секцію, а не оновлювати DOM руками?',
    ],
  },
  {
    id: 'qa-s-practical-07',
    topic: 'practical',
    level: 'middle',
    q: 'Як зробити плашку «до безкоштовної доставки ще 351 ₴»?',
    short:
      'Механіка проста: беру поріг, віднімаю від нього суму кошика й показую різницю через `money`. Поріг не зашиваю в код — це налаштування секції або теми, бо мерчант міняє його частіше, ніж код. Важливо правильно вибрати, від чого рахувати: логічно від `cart.items_subtotal_price`, тобто від суми товарів після знижок, а не від `total_price`. І потрібні три стани: кошик порожній — нічого не показуємо, поріг не досягнуто — «ще стільки-то», поріг перейдено — «доставка безкоштовна». Головне застереження: Liquid не знає реальних правил доставки, тож плашка — це лише текст, і він мусить збігатися з налаштуваннями доставки в магазині, інакше на чекауті людина побачить іншу цифру.',
    blocks: [
      {
        type: 'example',
        title: 'Три стани й прогрес',
        preset: 'cart',
        template:
          '{% assign threshold = 500000 %}\n{% assign left = threshold | minus: cart.items_subtotal_price %}\n\n{% if cart.item_count == 0 %}\n  Кошик порожній\n{% elsif left > 0 %}\n  До безкоштовної доставки ще {{ left | money }}\n  {% assign pct = cart.items_subtotal_price | times: 100 | divided_by: threshold %}\n  Прогрес: {{ pct | at_most: 100 }}%\n{% else %}\n  Доставка безкоштовна\n{% endif %}\n\nУ кошику: {{ cart.item_count }} поз. на {{ cart.items_subtotal_price | money }}',
        note: '`at_most: 100` страхує смужку прогресу: без нього кошик, що вдвічі перевищив поріг, дасть `width: 187%`.',
      },
      {
        type: 'code',
        lang: 'liquid',
        title: 'Поріг — із налаштувань, а не з коду',
        code: '{% comment %} У схемі: number у гривнях, зрозумілих мерчанту {% endcomment %}\n{% assign threshold = section.settings.free_shipping_threshold | times: 100 %}\n\n{% comment %} Плашка мусить оновлюватись разом із кошиком {% endcomment %}\n<div id="shopify-section-{{ section.id }}" data-cart-threshold>\n  ...\n</div>\n\n{% comment %} Після зміни кошика — перезапит секції, а не арифметика в JS {% endcomment %}\n{% comment %} fetch(`/cart?sections=${sectionId}`) {% endcomment %}',
      },
      {
        type: 'table',
        head: ['Від чого рахувати', 'Чому'],
        rows: [
          ['`cart.items_subtotal_price`', 'сума товарів після знижок — зазвичай саме це'],
          ['`cart.total_price`', 'загальна сума кошика; збігається не завжди'],
          ['`cart.original_total_price`', 'до знижок — завищить прогрес'],
          ['Лише товари, що потребують доставки', 'цифрові товари не мають впливати — `requires_shipping`'],
        ],
      },
      {
        type: 'note',
        tone: 'warn',
        title: 'Пастка',
        text: 'Плашка живе в кошику й у дровері, тобто її треба оновлювати після КОЖНОЇ зміни кількості — інакше людина додала товар, а «ще 351 ₴» лишилось те саме. Робити це арифметикою в JavaScript спокусливо й неправильно: гроші, знижки й валюта вже пораховані сервером, тож простіше перезапитати секцію. І не забувай про валюту: `money` поважає формат магазину, а `{{ left }}` без фільтра надрукує копійки цілим числом.',
      },
      {
        type: 'note',
        tone: 'tip',
        title: 'Сильніша відповідь',
        text: 'Назви межу цієї фічі чесно: Liquid не бачить правил доставки, які залежать від країни, ваги чи зони, тому плашка — маркетинговий текст, а не розрахунок. Правильна відповідь замовнику — «поріг задається в налаштуваннях секції й має збігатися з правилом доставки, і за це відповідає магазин». Кандидат, який це проговорює, економить усім скаргу «плашка обіцяла безкоштовно, а на чекауті 90 ₴».',
      },
    ],
    followUps: [
      'Чому краще `items_subtotal_price`, а не `total_price`?',
      'Як оновити плашку після зміни кількості?',
      'Що робити з товарами, які не потребують доставки?',
    ],
  },
  {
    id: 'qa-s-practical-08',
    topic: 'practical',
    level: 'middle',
    q: 'У колекції 300 товарів, а цикл виводить лише 50. Що робитимеш?',
    short:
      'Це не баг, а обмеження платформи: цикл по `collection.products` віддає максимум пʼятдесят елементів за раз, і мовчки. Штатне рішення одне — `{% paginate collection.products by N %}`, і всередині цього тега цикл уже йде по поточній сторінці, а обʼєкт `paginate` дає номери сторінок і посилання. Розмір сторінки має бути налаштуванням, а не константою, бо це компроміс між кількістю запитів і вагою сторінки. Якщо потрібен не посторінковий перегляд, а нескінченне прокручування або фільтри — це все одно `paginate` під капотом, просто наступну сторінку забирає JavaScript через Section Rendering API. А якщо треба порахувати щось по всій колекції — наприклад, діапазон цін, — то в Liquid це робити не варто взагалі: такі речі беруть із готових полів або з метаполів.',
    blocks: [
      {
        type: 'example',
        title: '`paginate` і навігація',
        preset: 'collection',
        view: 'html',
        template:
          '{% paginate collection.products by 2 %}\n  <p>Сторінка {{ paginate.current_page }} з {{ paginate.pages }} · усього {{ paginate.items }}</p>\n  <ul>\n    {% for product in collection.products %}\n      <li>{{ product.title }} — {{ product.price | money }}</li>\n    {% endfor %}\n  </ul>\n  <nav class="pagination">{{ paginate | default_pagination }}</nav>\n{% endpaginate %}',
        note: 'Усередині тега той самий `collection.products` віддає вже СТОРІНКУ, а не весь масив — саме тому цикл усередині не треба нічого різати. Поточну сторінку в пісочниці задає змінна `current_page`.',
      },
      {
        type: 'table',
        head: ['Задача', 'Рішення'],
        rows: [
          ['Показати всі товари колекції', '`{% paginate … by N %}` і навігація'],
          ['Нескінченне прокручування', 'той самий `paginate` + `?page=N&sections=…` з JS'],
          ['Фільтри за розміром, кольором, ціною', 'фасетна фільтрація Shopify, не `where` у Liquid'],
          ['Показати «перші 8 хітів»', '`{% for … limit: 8 %}` — межа тут доречна'],
          ['Порахувати щось по всій колекції', 'готові поля (`products_count`, `all_tags`) або метаполе'],
          ['Дуже глибокі сторінки', 'звузити колекцію — `paginate` має власну стелю глибини'],
        ],
      },
      {
        type: 'note',
        tone: 'warn',
        title: 'Пастка',
        text: 'Фільтрувати `where`-ом усередині `paginate` — типова помилка: фільтр застосується лише до поточної сторінки, і людина побачить «на сторінці 1 — три товари, на сторінці 2 — жодного». Відбір по всій колекції робить платформа: фасетна фільтрація або окрема колекція, а не Liquid. І памʼятай, що `paginate` дозволяє дійти лише до певної глибини масиву — на дуже великих каталогах правильна відповідь не «збільшити ліміт», а «звузити вибірку».',
      },
      {
        type: 'note',
        tone: 'tip',
        title: 'Сильніша відповідь',
        text: 'Поясни, чому ліміт узагалі існує: кожен товар у циклі — це запит даних і рендер розмітки, і сторінка на триста карток була б повільною незалежно від коду теми. Тому розмір сторінки — це рішення про продуктивність, і його обговорюють із замовником: 12 карток і швидка сторінка проти 48 і довгого очікування. І додай, що `{% paginate %}` працює не лише з товарами — так само гортають статті блогу, замовлення клієнтки й результати пошуку.',
      },
    ],
    followUps: [
      'Чому не можна просто зняти ліміт у 50?',
      'Як зробити нескінченне прокручування?',
      'Чому фільтрувати всередині `paginate` — погана ідея?',
    ],
  },
]

export const qaShopify: InterviewQA[] = [
  ...objects,
  ...architecture,
  ...sections,
  ...snippets,
  ...performance,
  ...security,
  ...debugging,
  ...practical,
]
