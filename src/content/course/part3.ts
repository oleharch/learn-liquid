import type { Lesson } from '../types'

/* ─────────────── l10 · Масиви ─────────────── */

const l10: Lesson = {
  id: 'l10',
  module: 3,
  title: 'Масиви: map, where, sort, uniq та інші',
  goal: 'Навчишся готувати масив фільтрами ДО циклу: відбирати, сортувати, прибирати дублікати й рахувати суми — без `if` усередині `for`.',
  minutes: 35,
  blocks: [
    {
      type: 'p',
      text: 'У JavaScript масив — це те, що ти створюєш сам: `[1, 2, 3]`, `push`, `filter`. У Liquid усе навпаки: масиви тобі **дають** (`collection.products`, `product.tags`, `cart.items`), а твоя робота — привести їх до потрібного вигляду. Літерала масиву в мові немає взагалі: написати `{% assign sizes = ["S", "M"] %}` не вийде.',
    },
    { type: 'h', text: 'split — єдиний спосіб зробити масив самому' },
    {
      type: 'p',
      text: 'Єдина лазівка — взяти string і розрізати його фільтром `split`. Зворотна дія — `join`: склеїти масив у string через роздільник. Ці двоє ходять парою, як `split`/`join` у JS.',
    },
    {
      type: 'example',
      title: 'string → масив → string',
      template:
        '{% assign sizes = "250 мл,400 мл,1000 мл" | split: "," %}\nФасовок: {{ sizes.size }}\nУсі: {{ sizes | join: " · " }}\nПерша: {{ sizes.first }}, остання: {{ sizes | last }}',
      note: '`first`, `last` і `size` працюють і через крапку, і як фільтри. Крапка потрібна в умовах: у `{% if sizes.size > 2 %}` фільтр не поставиш, а властивість — будь ласка.',
    },
    {
      type: 'note',
      tone: 'warn',
      title: 'Масив без join — каша',
      text: 'Якщо вивести масив як є — `{{ collection.all_vendors }}` — Liquid склеїть елементи **без роздільника**: `CocochocoEraybaInoar`. Помилки не буде, просто некрасивий string. Масив завжди виводь через `join` або циклом. І друга пастка: `split` завжди дає масив, у якому **кожен елемент — string**. `"10,9,100" | split: "," | sort` відсортує їх як текст — `10, 100, 9`.',
    },
    { type: 'h', text: 'map — витягнути одне поле' },
    {
      type: 'example',
      title: 'Назва кожного product у колекції',
      preset: 'collection',
      template: '{{ collection.products | map: "title" | join: ", " }}',
      note: 'Схоже на `products.map(p => p.title)` у JS, але тут аналогія й закінчується: у Liquid `map` приймає лише **імʼя властивості**. Жодної функції, жодного «порахуй ціну зі знижкою» — тільки «дістань поле».',
    },
    { type: 'h', text: 'where, reject, find, has — відбір' },
    {
      type: 'example',
      title: 'Відбір за значенням і за truthy',
      preset: 'collection',
      template:
        'Inoar: {{ collection.products | where: "vendor", "Inoar" | map: "title" | join: ", " }}\nУ наявності: {{ collection.products | where: "available" | size }} з {{ collection.products.size }}\nНемає: {{ collection.products | reject: "available" | map: "title" | join: ", " }}',
      note: '`where` із двома аргументами лишає елементи, де поле **дорівнює** значенню. З одним аргументом — ті, де поле truthy. `reject` — дзеркало: викидає те, що `where` залишив би.',
    },
    {
      type: 'example',
      title: 'find і has: один елемент і так/ні',
      preset: 'collection',
      template:
        '{% assign oil = collection.products | find: "handle", "ends-oil" %}\n{{ oil.title }} — {{ oil.price | money }}\nЄ Erayba? {{ collection.products | has: "vendor", "Erayba" }}\nЄ Kerastase? {{ collection.products | has: "vendor", "Kerastase" }}',
      note: '`find` повертає **сам обʼєкт** (або `nil`, якщо нічого не знайшлось) — як `Array.find` у JS. `has` — це `Array.some`: лише `true`/`false`. До їхньої появи доводилось писати `where … | first` і `where … | size > 0`.',
    },
    {
      type: 'note',
      tone: 'warn',
      title: 'where вміє лише «дорівнює»',
      text: 'Умови «дорожче за 500», «назва містить» у `where` не запишеш — це не `filter` із JS, функції сюди не передати. Порівняння суворе й за типом: `where: "price", "39900"` (string) не знайде product із числовою ціною `39900`. Для нерівностей лишається цикл з `if` або трюк «`sort` + `first`/`last`/`slice`».',
    },
    { type: 'h', text: 'Головна ідея: фільтруй ДО циклу' },
    {
      type: 'p',
      text: 'Звичка з JS — зайти в цикл і всередині перевіряти `if`. У Liquid це майже завжди гірше, бо цикл **не знає**, що ти частину елементів пропустив. `forloop.index`, `forloop.last`, `limit` рахують ітерації, а не те, що реально вивелось.',
    },
    {
      type: 'example',
      title: 'Той самий список двома способами',
      data: {
        products: [
          { title: 'Шампунь', available: true },
          { title: 'Спрей', available: false },
          { title: 'Олійка', available: true },
          { title: 'Маска', available: false },
        ],
      },
      template:
        'if у циклі: {% for p in products %}{% if p.available %}{{ forloop.index }}. {{ p.title }}{% unless forloop.last %}, {% endunless %}{% endif %}{% endfor %}\nwhere до циклу: {% assign in_stock = products | where: "available" %}{% for p in in_stock %}{{ forloop.index }}. {{ p.title }}{% unless forloop.last %}, {% endunless %}{% endfor %}',
      note: 'У першому рядку нумерація «1, 3» і кома в кінці: останній елемент масиву недоступний, тож `forloop.last` настав на product, який не вивівся. У другому цикл іде вже по чистому масиву — і `forloop` каже правду.',
    },
    {
      type: 'list',
      items: [
        '`forloop.index`, `first`, `last` — рахують усі ітерації, включно з пропущеними.',
        '`limit: 4` разом з `if` дасть «до чотирьох, а може й нуль»: ліміт спрацює раніше, ніж набереться четвірка потрібних.',
        '`{% else %}` у `for` спрацює лише на порожньому масиві — а не тоді, коли `if` відсіяв усіх.',
        'Після `where` є чесний `size`: можна написати «Знайдено 3 товари» або сховати цілий блок, якщо нуль.',
      ],
    },
    { type: 'h', text: 'sort, uniq, compact, reverse' },
    {
      type: 'example',
      title: 'Список брендів колекції',
      preset: 'collection',
      template:
        '{% assign vendors = collection.products | map: "vendor" | uniq | sort %}\nБренди ({{ vendors.size }}): {{ vendors | join: ", " }}\n{% assign cheapest = collection.products | sort: "price" | first %}\nНайдешевше: {{ cheapest.title }} — {{ cheapest.price | money }}\nНайновіше зверху: {{ collection.products | reverse | map: "title" | first }}',
      note: 'Класичний ланцюжок: `map` дістає вендорів (із повторами), `uniq` прибирає дублікати, `sort` впорядковує. `sort` з аргументом сортує **обʼєкти за властивістю**; `sort … | first` — спосіб знайти мінімум без циклу.',
    },
    {
      type: 'example',
      title: 'sort проти sort_natural, compact',
      preset: 'collection',
      template:
        '{% assign brands = "inoar,Cocochoco,erayba,brae" | split: "," %}\nsort: {{ brands | sort | join: ", " }}\nsort_natural: {{ brands | sort_natural | join: ", " }}\noriginal: {{ brands | join: ", " }}\n\n{% assign old_prices = collection.products | map: "compare_at_price" %}\nУсього значень: {{ old_prices.size }}, після compact: {{ old_prices | compact | size }}',
      note: '`sort` чутливий до регістру — великі літери йдуть раніше за малі. `sort_natural` регістр ігнорує. Рядок `original` показує, що фільтри **не змінюють** вихідний масив. `compact` викидає `nil` — типовий хвіст після `map` по необовʼязковому полю.',
    },
    {
      type: 'note',
      tone: 'tip',
      title: 'Де ламається аналогія з JS',
      text: 'У JS `arr.sort()` і `arr.reverse()` мутують масив. У Liquid фільтр завжди повертає **нове** значення, а старе лишається як було. Тому результат треба або одразу вивести, або зберегти: `{% assign sorted = items | sort: "price" %}`. Рядок `{{ items | sort }}` без `assign` нічого «не запамʼятає».',
    },
    { type: 'h', text: 'concat, slice, sum' },
    {
      type: 'example',
      title: 'Підсумки cart без циклу',
      preset: 'cart',
      template:
        'Одиниць: {{ cart.items | sum: "quantity" }}\nСума позицій: {{ cart.items | map: "final_line_price" | sum | money }}\n\n{% assign extra = "Семпл,Листівка" | split: "," %}\n{% assign all = cart.items | map: "product_title" | concat: extra %}\nУ пакунку: {{ all | join: ", " }}\nПерші два: {{ all | slice: 0, 2 | join: ", " }}\nОстанні два: {{ all | slice: -2, 2 | join: ", " }}',
      note: '`sum` приймає імʼя властивості або працює по масиву чисел після `map`. `concat` склеює два масиви (дублікати не чистить — додай `uniq`). `slice: початок, довжина` — другий аргумент це **кількість**, а не кінцевий індекс, як у JS.',
    },
    {
      type: 'note',
      tone: 'shopify',
      text: 'У справжній темі `collection.products` — це не «усі product колекції», а **поточна сторінка pagination** (без `paginate` — щонайбільше 50). Тож `collection.products | map: "vendor" | uniq` дасть бренди лише тих product, що потрапили на сторінку. Для повного списку Shopify має готове `collection.all_vendors` (і `all_tags`, `all_types`). Фільтри масивів не замінюють pagination і сторфронт-фільтрацію — вони для підготовки вже отриманого шматка даних.',
    },
    {
      type: 'note',
      tone: 'interview',
      title: 'На співбесіді',
      text: '**«Як вивести унікальних вендорів колекції за алфавітом?»** — `collection.products | map: "vendor" | uniq | sort | join: ", "`, і одразу додай застереження про pagination та `collection.all_vendors`. **«Чому `where` перед циклом краще за `if` усередині?»** — бо `forloop.index/first/last`, `limit` і `else` працюють по всьому масиву й нічого не знають про твій `if`; після `where` цикл іде по чистих даних і є чесний `size`. **«Як створити масив у Liquid?»** — літерала немає, лише `split` зі string (плюс `concat`, щоб нарощувати).',
    },
  ],
  exercises: [
    {
      id: 'l10-e1',
      title: 'Теги зі string',
      task: [
        'Менеджер ввів усі теги в одну змінну `tags_line` — string через кому з пробілом: `кератин, догляд, хіт`.',
        'Перетвори string на масив і виведи одним рядком: `Тегів: 3 — кератин | догляд | хіт` (кількість порахуй, теги зʼєднай через ` | `).',
      ],
      starter: '{% comment %} Розріж tags_line на масив, порахуй size, склей через " | " {% endcomment %}\nТегів: ',
      solution: '{% assign tags = tags_line | split: ", " %}\nТегів: {{ tags.size }} — {{ tags | join: " | " }}',
      data: { tags_line: 'кератин, догляд, хіт' },
      altData: { tags_line: 'стайлінг, термозахист, новинка, спрей' },
      mustUse: [{ pattern: '\\|\\s*split\\b', label: 'Використай фільтр `split`' }],
      hints: [
        'Масив у Liquid робиться лише зі string — фільтром `split`. Зверни увагу: роздільник тут не просто кома, а кома **з пробілом**.',
        'Збережи масив у змінну: `{% assign tags = tags_line | split: ", " %}` — тоді `tags.size` дасть кількість.',
        'Другу частину рядка дає `{{ tags | join: " | " }}`.',
      ],
      explain:
        'Роздільник `", "` важливий: якби різати лише по комі, у другого й третього тегів лишився б пробіл на початку — його видно, щойно зміниш роздільник у `join`. Альтернатива без `assign` — `{{ tags_line | split: ", " | size }}`, але масив знадобився двічі, тому змінна чесніша.',
    },
    {
      id: 'l10-e2',
      title: 'Бренди колекції',
      task: [
        'У `products` — усі product колекції, у кожного є `vendor`. Бренди повторюються.',
        'Виведи один рядок: `Бренди (3): Cocochoco, Erayba, Inoar` — у дужках кількість **унікальних** брендів, далі самі бренди за алфавітом через кому з пробілом. Без циклу.',
      ],
      starter: '{% comment %} map → uniq → sort, збережи в змінну; потім size і join {% endcomment %}\nБренди (): ',
      solution: '{% assign vendors = products | map: "vendor" | uniq | sort %}\nБренди ({{ vendors.size }}): {{ vendors | join: ", " }}',
      data: {
        products: [
          { title: 'Шампунь із кератином', vendor: 'Inoar' },
          { title: 'Маска', vendor: 'Cocochoco' },
          { title: 'Спрей', vendor: 'Erayba' },
          { title: 'Олійка', vendor: 'Inoar' },
          { title: 'Кондиціонер', vendor: 'Cocochoco' },
        ],
      },
      altData: {
        products: [
          { title: 'Бальзам', vendor: 'Olaplex' },
          { title: 'Сироватка', vendor: 'Brae' },
          { title: 'Пінка', vendor: 'Olaplex' },
          { title: 'Лак', vendor: 'Olaplex' },
        ],
      },
      mustUse: [
        { pattern: '\\|\\s*map\\b', label: 'Використай фільтр `map`' },
        { pattern: '\\|\\s*uniq\\b', label: 'Прибери дублікати фільтром `uniq`' },
      ],
      mustNotUse: [{ pattern: '\\{%-?\\s*for\\b', label: 'Без циклу `for` — лише ланцюжок фільтрів' }],
      hints: [
        'Спершу дістань із кожного product лише поле `vendor` — вийде масив вендорів із повторами.',
        'Далі в тому самому ланцюжку: `uniq` прибере повтори, `sort` розставить за алфавітом. Результат збережи через `assign` — він потрібен і для `size`, і для `join`.',
        '`{% assign vendors = products | map: "vendor" | uniq | sort %}`, а потім `{{ vendors.size }}` і `{{ vendors | join: ", " }}`.',
      ],
      explain:
        'Це найчастіший ланцюжок у темах: `map` → `uniq` → `sort`. Порядок `uniq` і `sort` результат не міняє, але `uniq` раніше — менше сортувати. У справжній темі памʼятай про pagination: на сторінці колекції є готовий `collection.all_vendors`.',
    },
    {
      id: 'l10-e3',
      title: 'Лише те, що в наявності',
      task: [
        'Виведи список `<ul>` із назвами product, які є в наявності (`available`), — кожен окремим `<li>` з нового рядка, з номером по порядку: `<li>1. Шампунь</li>`.',
        'Під списком — абзац `<p>У наявності 3 з 5</p>`.',
        'Умова: **жодного `if`**. Відфільтруй масив до циклу — тоді й `forloop.index`, і лічильник вийдуть самі.',
      ],
      starter:
        '{% comment %} 1) відбери доступні товари у змінну; 2) пройдись циклом уже по ній {% endcomment %}\n<ul>\n</ul>\n<p>У наявності … з …</p>',
      solution:
        '{% assign in_stock = products | where: "available" %}\n<ul>\n{% for p in in_stock %}\n  <li>{{ forloop.index }}. {{ p.title }}</li>\n{% endfor %}\n</ul>\n<p>У наявності {{ in_stock.size }} з {{ products.size }}</p>',
      data: {
        products: [
          { title: 'Шампунь', available: true },
          { title: 'Спрей', available: false },
          { title: 'Олійка', available: true },
          { title: 'Маска', available: true },
          { title: 'Бальзам', available: false },
        ],
      },
      altData: {
        products: [
          { title: 'Пінка', available: false },
          { title: 'Лак', available: true },
          { title: 'Сироватка', available: false },
          { title: 'Кондиціонер', available: true },
        ],
      },
      mustUse: [{ pattern: '\\|\\s*where\\b', label: 'Відбери доступні product фільтром `where`' }],
      mustNotUse: [{ pattern: '\\{%-?\\s*(if|unless)\\b', label: 'Без `if`/`unless` — масив має бути чистим ще до циклу' }],
      view: 'html',
      hints: [
        '`where` з одним аргументом лишає елементи, у яких ця властивість truthy: `products | where: "available"`.',
        'Збережи результат у змінну й запускай `for` уже по ній — тоді `forloop.index` рахує лише ті product, що вивелись.',
        'Лічильник — це `in_stock.size`, загальна кількість — `products.size`. Кожен `<li>` пиши з нового рядка всередині циклу.',
      ],
      explain:
        'З `if` усередині циклу нумерація була б «1, 3, 4», а щоб порахувати «3 з 5», довелося б заводити лічильник через `assign` + `plus`. Після `where` обидві задачі розвʼязуються самі: цикл іде по чистому масиву, а `size` уже знає відповідь.',
    },
    {
      id: 'l10-e4',
      title: 'Зведення cart',
      task: [
        'Працюєш із cart (`cart.items`; у кожного line item є `title`, `vendor`, `quantity`, `final_line_price` у копійках). Збери блок-зведення — чотири абзаци, без жодного циклу:',
        '`<p>Одиниць товару: 6</p>` — сума `quantity` по кожному line item.',
        '`<p>Бренди: Cocochoco, Inoar</p>` — унікальні вендори за алфавітом.',
        '`<p>Найдорожча позиція: …</p>` — `title` того line item, у якого найбільший `final_line_price`.',
        '`<p>Inoar у кошику: 1,961.10 ₴</p>` — сума `final_line_price` лише тих line item, що від бренду Inoar, через `money`.',
      ],
      starter:
        '{% comment %} sum, map + uniq + sort, sort + last, where + sum {% endcomment %}\n<p>Одиниць товару: </p>\n<p>Бренди: </p>\n<p>Найдорожча позиція: </p>\n<p>Inoar у кошику: </p>',
      solution:
        '{% assign vendors = cart.items | map: "vendor" | uniq | sort %}\n{% assign top = cart.items | sort: "final_line_price" | last %}\n<p>Одиниць товару: {{ cart.items | sum: "quantity" }}</p>\n<p>Бренди: {{ vendors | join: ", " }}</p>\n<p>Найдорожча позиція: {{ top.title }}</p>\n<p>Inoar у кошику: {{ cart.items | where: "vendor", "Inoar" | sum: "final_line_price" | money }}</p>',
      preset: 'cart',
      altData: {
        cart: {
          item_count: 4,
          total_price: 251700,
          items: [
            { title: 'Бальзам Olaplex №5', vendor: 'Olaplex', quantity: 1, final_line_price: 129900 },
            { title: 'Олійка для кінчиків', vendor: 'Inoar', quantity: 2, final_line_price: 79800 },
            { title: 'Гребінець', vendor: 'Brae', quantity: 1, final_line_price: 42000 },
          ],
        },
      },
      mustUse: [
        { pattern: '\\|\\s*sum\\b', label: 'Порахуй суму фільтром `sum`' },
        { pattern: '\\|\\s*where\\b', label: 'Відбери line item бренду Inoar фільтром `where`' },
      ],
      mustNotUse: [{ pattern: '\\{%-?\\s*for\\b', label: 'Без циклу `for`' }],
      view: 'html',
      hints: [
        'Кожен абзац — окремий ланцюжок. Сума поля: `cart.items | sum: "quantity"`. Бренди — той самий `map` → `uniq` → `sort`, що й у другому завданні.',
        'Максимум без циклу: відсортуй за `final_line_price` і візьми `last`. Збережи цей line item у змінну, щоб дістати `title`.',
        'Останній абзац: `cart.items | where: "vendor", "Inoar" | sum: "final_line_price" | money` — спершу відбір, потім сума, у кінці форматування.',
      ],
      explain:
        'Порядок у ланцюжку — це порядок дій: `where` звужує масив, `sum` перетворює масив на число, `money` — число на string. Поміняй `money` і `sum` місцями — і отримаєш помилку або нісенітницю. Для загальної кількості в Shopify є готове `cart.item_count`, але «сума по одному бренду» готовою не приходить — її й збирають фільтрами.',
    },
  ],
  quiz: [
    {
      id: 'l10-q1',
      q: 'Що виведе цей код?',
      template: '{{ "b,a,c,a" | split: "," | uniq | sort | join: "" }}',
      options: ['abc', 'aabc', 'bac', 'b,a,c,a'],
      correct: 0,
      explain: '`split` дає `[b, a, c, a]`, `uniq` прибирає другу `a`, `sort` впорядковує, `join: ""` склеює без роздільника.',
    },
    {
      id: 'l10-q2',
      q: 'Фільтр `sort` застосували, але результат не зберегли. Що виведе код?',
      template: '{% assign xs = "3,1,2" | split: "," %}{{ xs | sort | first }}{{ xs | first }}',
      options: ['13', '11', '31', '33'],
      correct: 0,
      explain: 'Фільтри не мутують масив. `xs | sort | first` дає `1`, але сам `xs` лишився `[3, 1, 2]`, тож друге `{{ }}` виводить `3`. У JS `xs.sort()` змінив би масив на місці — тут аналогія ламається.',
    },
    {
      id: 'l10-q3',
      q: 'Як у Liquid створити власний масив із трьох значень?',
      options: [
        '`{% assign a = ["S", "M", "L"] %}`',
        '`{% assign a = "S,M,L" | split: "," %}`',
        '`{% assign a = array("S", "M", "L") %}`',
        '`{% capture a %}S, M, L{% endcapture %}` — `capture` повертає масив',
      ],
      correct: 1,
      explain: 'Літерала масиву в Liquid немає. Єдиний спосіб — розрізати string фільтром `split`. `capture` завжди дає string.',
    },
    {
      id: 'l10-q4',
      q: 'Хотіли вивести перші два product, що є в наявності. Що виведе код?',
      template: '{% for p in products limit: 2 %}{% if p.available %}{{ p.title }} {% endif %}{% endfor %}',
      data: {
        products: [
          { title: 'Шампунь', available: true },
          { title: 'Спрей', available: false },
          { title: 'Олійка', available: true },
        ],
      },
      options: ['Шампунь Олійка', 'Шампунь', 'Шампунь Спрей', 'Нічого'],
      correct: 1,
      explain: '`limit: 2` обмежує **ітерації**, а не виведені елементи: цикл пройде «Шампунь» і «Спрей», другий відсіє `if` — і все. Правильно: `{% assign ok = products | where: "available" %}` і вже потім `for p in ok limit: 2`.',
    },
  ],
  docs: [
    'filters/split',
    'filters/join',
    'filters/map',
    'filters/where',
    'filters/reject',
    'filters/find',
    'filters/has',
    'filters/sort',
    'filters/sort_natural',
    'filters/uniq',
    'filters/compact',
    'filters/concat',
    'filters/reverse',
    'filters/sum',
    'filters/slice',
  ],
  topics: ['filters', 'iteration', 'practical'],
}

/* ─────────────── l11 · Дати, default, escape ─────────────── */

const l11: Lesson = {
  id: 'l11',
  module: 3,
  title: 'Дати, default, escape і безпека output',
  goal: 'Зможеш відформатувати будь-яку дату, підставити запасне значення без зайвих `if` і пояснити, який фільтр захищає output у HTML, а який — у JavaScript.',
  minutes: 30,
  blocks: [
    {
      type: 'p',
      text: 'Ці фільтри стоять на самій межі «дані → сторінка». `date` робить із технічного `2026-09-01T09:00:00+03:00` людське «01.09.2026». `default` рятує від порожніх місць у верстці. А `escape` і `json` вирішують, чи зможе чужий текст зламати тобі HTML або скрипт.',
    },
    { type: 'h', text: 'date: той самий strftime' },
    {
      type: 'example',
      title: 'Одна дата — різні формати',
      preset: 'blog',
      template:
        'Як у даних: {{ article.published_at }}\n{{ article.published_at | date: "%d.%m.%Y" }}\n{{ article.published_at | date: "%-d %B %Y, %H:%M" }}\n{{ article.published_at | date: "%A, %b %-d" }}\n<time datetime="{{ article.published_at | date: "%Y-%m-%d" }}">…</time>',
      note: 'Формат — string із кодів `%…`, успадкований від `strftime` у Ruby (і C). Усе, що не код, виводиться як є: крапки, коми, слова. Назви місяців і днів — **англійською**.',
    },
    {
      type: 'table',
      head: ['Код', 'Що дає', 'Приклад'],
      rows: [
        ['`%d` / `%-d`', 'день із нулем / без нуля', '`01` / `1`'],
        ['`%m`', 'місяць числом', '`09`'],
        ['`%B` / `%b`', 'назва місяця повна / скорочена', '`September` / `Sep`'],
        ['`%Y` / `%y`', 'рік повний / дві цифри', '`2026` / `26`'],
        ['`%H:%M`', 'години (24) і хвилини', '`09:00`'],
        ['`%I:%M %p`', 'години (12) з AM/PM', '`09:00 AM`'],
        ['`%A` / `%a`', 'день тижня', '`Tuesday` / `Tue`'],
        ['`%s`', 'Unix-час у секундах — для арифметики', '`1788242400`'],
      ],
    },
    {
      type: 'example',
      title: 'Арифметика дат через %s',
      data: { sale_start: '2026-09-01T09:00:00+03:00', sale_end: '2026-09-15T09:00:00+03:00' },
      template:
        '{% assign from = sale_start | date: "%s" %}\n{% assign to = sale_end | date: "%s" %}\nАкція триває {{ to | minus: from | divided_by: 86400 }} днів',
      note: 'Типу «дата» в Liquid немає — є string, який `date` уміє розібрати. Щоб рахувати, переводимо обидві дати в секунди (`%s`), віднімаємо й ділимо на 86 400 секунд у добі.',
    },
    {
      type: 'note',
      tone: 'warn',
      title: '`now` і кеш',
      text: '`{{ "now" | date: "%H:%M" }}` покаже час **останнього рендера**, а не час, коли покупець відкрив сторінку: Shopify кешує готовий HTML. Тому таймер «до кінця акції лишилось…» на Liquid не роблять — Liquid віддає дату в `data-`атрибут, а рахує вже JavaScript. Ще дрібниця: string, який не схожий на дату, `date` мовчки поверне **як був**, а `nil` — порожнім string. Помилки не буде, тож перевіряй очима.',
    },
    {
      type: 'note',
      tone: 'shopify',
      text: 'Англійські назви місяців — проблема для українського магазину. У Shopify для цього є іменовані формати, що беруться з файлів локалізації теми: `{{ article.published_at | date: format: "abbreviated_date" }}` (пісочниця цей параметр не емулює). Свої формати описують у локалі в розділі `date_formats`. Другий шлях — `%d.%m.%Y`: цифри перекладу не потребують.',
    },
    { type: 'h', text: 'default: запасне значення' },
    {
      type: 'example',
      title: 'Коли default спрацьовує',
      data: { nothing: null, empty_list: [] },
      template:
        'nil: {{ nothing | default: "запасне" }}\nfalse: {{ false | default: "запасне" }}\nпорожній рядок: {{ "" | default: "запасне" }}\nпорожній масив: {{ empty_list | default: "запасне" }}\n0: {{ 0 | default: "запасне" }}\nпробіли: [{{ "  " | default: "запасне" }}]\nпробіли + strip: [{{ "  " | strip | default: "запасне" }}]',
      note: 'Спрацьовує на `nil`, `false` і на **порожньому** (string `""`, масив без елементів). `0` — звичайне truthy-число, його `default` не чіпає. String із самих пробілів теж «не порожній» — спершу `strip`.',
    },
    {
      type: 'p',
      text: 'У JS ти написав би `title || "Без назви"`. Схоже, але не те саме: `||` замінить і `0`, а `default` — ні. Зате `default` замінює порожній string, хоча в самому Liquid порожній string — truthy. Тобто `default` — це не «якщо falsy», а окреме правило: `nil`, `false` або `empty`.',
    },
    {
      type: 'example',
      title: 'allow_false: коли false — це відповідь',
      preset: 'product',
      template:
        'Без параметра: {{ product.metafields.custom.is_professional.value | default: true }}\nallow_false: {{ product.metafields.custom.is_professional.value | default: true, allow_false: true }}',
      note: 'Metafield `is_professional` заповнено, і його `.value` дорівнює `false`. Звичайний `default` вважає це «порожнім» і підставляє `true` — тобто бреше про product. З `allow_false: true` запасне значення береться лише тоді, коли даних справді немає (`nil`). Зверни увагу й на `.value`: сам metafield — це обʼєкт, і без `.value` `default` узагалі не спрацював би, бо обʼєкт не порожній.',
    },
    {
      type: 'note',
      tone: 'tip',
      title: 'Де це в темі',
      text: 'Найчастіше — налаштування-чекбокси сніпета: `{% assign show_vendor = show_vendor | default: true, allow_false: true %}`. Без `allow_false` параметр `show_vendor: false` було б неможливо передати: `default` щоразу перевертав би його на `true`.',
    },
    { type: 'h', text: 'escape: Liquid нічого не екранує сам' },
    {
      type: 'p',
      text: 'Після React легко забути: JSX екранує текст автоматично, а Liquid — **ні**. `{{ value }}` вставляє string у HTML як є. Якщо в ньому зʼявиться `<script>`, браузер його виконає. Це і є XSS: чужий код на твоїй сторінці. Звідки береться чужий текст? Імʼя customer, примітка до замовлення (`cart.note`), властивості line item (`line_item.properties`), пошуковий запит (`search.terms`), відгуки з застосунків.',
    },
    {
      type: 'example',
      title: 'Той самий відгук — сирий і екранований',
      data: { review: '<script>alert("XSS")</script> Чудовий шампунь & маска' },
      template: 'Сирий: {{ review }}\nescape: {{ review | escape }}\nstrip_html: {{ review | strip_html }}\nobидва: {{ review | strip_html | escape }}',
      note: '`escape` замінює `<`, `>`, `&`, лапки на HTML-сутності: браузер **покаже** теги текстом, а не виконає. `strip_html` теги просто вирізає — але `&` лишає, тож перед output у HTML його все одно доповнюють `escape`.',
    },
    {
      type: 'example',
      title: 'escape_once: не екрануй двічі',
      data: { title: 'Догляд &amp; стайлінг <нове>' },
      template: 'escape: {{ title | escape }}\nescape_once: {{ title | escape_once }}',
      note: 'У string уже є готова сутність `&amp;`. `escape` екранує її ще раз — вийде `&amp;amp;`, і покупець побачить на сторінці буквальне `&amp;`. `escape_once` уже екрановане не чіпає, а решту (`<`, `>`) обробляє.',
    },
    {
      type: 'example',
      title: 'strip_html + truncate: опис для картки',
      preset: 'product',
      template: 'HTML: {{ product.description }}\nДля картки: {{ product.description | strip_html | truncate: 40 }}\nДля meta: <meta name="description" content="{{ product.description | strip_html | truncate: 150 | escape }}">',
      note: 'Порядок важливий: спершу вирізати теги, потім різати довжину. Навпаки — `truncate` може розрубати тег навпіл (`<stro…`), і верстка попливе. В атрибуті наприкінці ще й `escape`: лапка в описі закрила б `content="…"` передчасно.',
    },
    { type: 'h', text: 'json: місток у JavaScript' },
    {
      type: 'example',
      title: 'Дані product для скрипта',
      preset: 'product',
      template:
        '<script>\n  const title = {{ product.title | json }};\n  const tags = {{ product.tags | json }};\n  const prices = {{ product.variants | map: "price" | json }};\n  const available = {{ product.available | json }};\n</script>',
      note: 'Лапки навколо `{{ … | json }}` **не потрібні** — фільтр ставить їх сам і екранує лапки всередині string. Масив стає JS-масивом, булеве — `true`/`false`.',
    },
    {
      type: 'note',
      tone: 'warn',
      title: 'Лапки руками — шлях до зламаного скрипта',
      text: '`const title = "{{ product.title }}";` працює рівно до першого product з лапками в назві: `Шампунь "Кератин"` закриє string достроково — і впаде весь скрипт. `escape` тут не рятує: він для HTML, а не для JS. Правило просте — **контекст визначає фільтр**.',
    },
    {
      type: 'table',
      head: ['Куди вставляєш', 'Фільтр', 'Приклад'],
      rows: [
        ['Текст у HTML', '`escape`', '`<p>{{ cart.note | escape }}</p>`'],
        ['Атрибут HTML', '`escape`', '`<input value="{{ search.terms | escape }}">`'],
        ['JavaScript / JSON', '`json`', '`const note = {{ cart.note | json }};`'],
        ['Параметр URL', '`url_encode`', '`?q={{ search.terms | url_encode }}`'],
        ['HTML з адмінки (`product.description`)', 'нічого', 'це розмітка, яку навмисно написав власник магазину'],
      ],
    },
    {
      type: 'note',
      tone: 'interview',
      title: 'На співбесіді',
      text: '**«Чи екранує Liquid output автоматично?»** — ні, на відміну від JSX. Усе, що ввів покупець (`search.terms`, `cart.note`, властивості line item, імена), виводимо через `escape`, а в JavaScript передаємо через `json` — він і лапки ставить, і вміст екранує. **«Чим `escape_once` відрізняється від `escape`?»** — не чіпає вже готові сутності, тож не дає `&amp;amp;`. **«Коли потрібен `allow_false`?»** — коли `false` є валідним значенням (чекбокс, boolean metafield), а запасне має підставлятись лише на `nil`. Детальніше — на сторінці [про безпеку](/docs/shopify/security).',
    },
  ],
  exercises: [
    {
      id: 'l11-e1',
      title: 'Дата замовлення',
      task: [
        'В обʼєкті `order` є `name` і `created_at` (string у форматі ISO).',
        'Виведи рядок: `Замовлення #1042 від 02.08.2026 о 14:20` — день, місяць і рік через крапку, потім час у 24-годинному форматі.',
      ],
      starter: '{% comment %} Два виклики date: один для дати, другий для часу {% endcomment %}\nЗамовлення {{ order.name }} від {{ order.created_at }}',
      solution: 'Замовлення {{ order.name }} від {{ order.created_at | date: "%d.%m.%Y" }} о {{ order.created_at | date: "%H:%M" }}',
      data: { order: { name: '#1042', created_at: '2026-08-02T14:20:00+03:00' } },
      altData: { order: { name: '#1017', created_at: '2026-05-19T09:05:00+03:00' } },
      mustUse: [{ pattern: '\\|\\s*date\\s*:', label: 'Використай фільтр `date`' }],
      hints: [
        'Формат — це string із кодів: `%d` день, `%m` місяць, `%Y` рік, `%H` години, `%M` хвилини. Крапки й двокрапку пиши просто між кодами.',
        'Слово «о» можна залишити звичайним текстом між двома `{{ }}` — так простіше, ніж вписувати його у формат.',
        '`{{ order.created_at | date: "%d.%m.%Y" }} о {{ order.created_at | date: "%H:%M" }}`',
      ],
      explain:
        'Можна й одним викликом: `date: "%d.%m.%Y о %H:%M"` — усе, що не є кодом `%…`, виводиться як є. Зверни увагу на `%m` (місяць) і `%M` (хвилини): регістр має значення, і це найчастіша одруківка у форматах.',
    },
    {
      id: 'l11-e2',
      title: 'Запасні значення',
      task: [
        'Є `customer.first_name` (може бути порожнім string) і налаштування `show_badge` (може бути `true`, `false` або взагалі не заданим).',
        'Виведи два рядки. Перший: `Вітаємо, Софія!`, а якщо імені немає — `Вітаємо, гостю!`.',
        'Другий: `Бейдж: true` або `Бейдж: false`. Якщо налаштування не задане — вважай, що `true`. Але якщо власник явно вимкнув бейдж (`false`), має лишитись `false`.',
      ],
      starter: '{% comment %} default — для імені; default з allow_false — для бейджа {% endcomment %}\nВітаємо, {{ customer.first_name }}!\nБейдж: {{ show_badge }}',
      solution: 'Вітаємо, {{ customer.first_name | default: "гостю" }}!\nБейдж: {{ show_badge | default: true, allow_false: true }}',
      data: { customer: { first_name: '' }, show_badge: false },
      altData: { customer: { first_name: 'Софія' }, show_badge: null },
      mustUse: [{ pattern: '\\|\\s*default\\s*:', label: 'Використай фільтр `default`' }],
      mustNotUse: [{ pattern: '\\{%-?\\s*(if|unless|case)\\b', label: 'Без умов — лише `default`' }],
      hints: [
        '`default` підставляє запасне значення замість `nil`, `false` і порожнього string — тож для імені його досить як є.',
        'З бейджем проблема: `false | default: true` дасть `true`. Подивись на параметр `allow_false`.',
        '`{{ show_badge | default: true, allow_false: true }}` — запасне візьметься лише тоді, коли значення не задане зовсім.',
      ],
      explain:
        'Без `allow_false` власник магазину не зміг би вимкнути бейдж: його `false` щоразу перетворювалось би на `true`. Це реальний баг у сніпетах із булевими параметрами. А `if` тут зайвий — `default` якраз і придуманий, щоб не городити умову заради одного запасного значення.',
    },
    {
      id: 'l11-e3',
      title: 'Безпечний відгук',
      task: [
        'У `review` лежить відгук покупця: `author`, `text` і `city`. Усе це людина ввела сама — тобто там може бути будь-що, включно з тегами.',
        'Збери розмітку: `<blockquote title="МІСТО">ТЕКСТ</blockquote>` і з нового рядка `<cite>АВТОР</cite>`. Усі три значення мають бути екрановані, щоб теги з відгуку показались текстом, а не виконались.',
      ],
      starter:
        '{% comment %} Кожне значення від покупця — через escape {% endcomment %}\n<blockquote title="{{ review.city }}">{{ review.text }}</blockquote>\n<cite>{{ review.author }}</cite>',
      solution:
        '<blockquote title="{{ review.city | escape }}">{{ review.text | escape }}</blockquote>\n<cite>{{ review.author | escape }}</cite>',
      data: {
        review: {
          author: 'Оля <3',
          city: 'Київ "Поділ"',
          text: '<script>alert("XSS")</script> Шампунь & маска — супер!',
        },
      },
      altData: {
        review: {
          author: '<b>Ірина</b>',
          city: 'Львів',
          text: 'Ціна > якість? Ні, ціна < якість & я задоволена',
        },
      },
      mustUse: [{ pattern: '\\|\\s*escape\\b', label: 'Екрануй output фільтром `escape`' }],
      hints: [
        'Стартовий код уже робочий — але небезпечний. Нічого перебудовувати не треба: лише додай фільтр до кожного `{{ }}`.',
        'Атрибут `title` теж у зоні ризику: лапка в назві міста закриє атрибут достроково. `escape` перетворює лапки на `&#34;`.',
        '`{{ review.text | escape }}`, `{{ review.author | escape }}`, `{{ review.city | escape }}`.',
      ],
      explain:
        '`escape` потрібен і в тексті, і в атрибуті: у першому випадку небезпечні `<` та `>`, у другому — лапки. `strip_html` тут гірший вибір: він мовчки зʼїв би «<3» з імені авторки та шматок тексту між `>` і `<`. Екранування нічого не губить — воно просто робить текст текстом.',
    },
    {
      id: 'l11-e4',
      title: 'Картка статті блогу',
      task: [
        'Збери картку статті з обʼєкта `article` (`title`, `published_at`, `content` із HTML, `author` — може бути порожнім, `tags`). У стартері вже є каркас — заповни його:',
        '`<h2>` — заголовок, екранований. `<time>` — в атрибуті `datetime` дата у форматі `2026-09-01`, у тексті — `01.09.2026`.',
        '`<p>` — `content` без HTML-тегів, обрізаний до 60 символів. `<span>` — автор, а якщо його немає — `Редакція`.',
        '`<script type="application/json">` — масив тегів статті у форматі JSON.',
      ],
      starter:
        '{% comment %} escape · date (двічі) · strip_html + truncate · default · json {% endcomment %}\n<article>\n  <h2></h2>\n  <time datetime=""></time>\n  <p></p>\n  <span></span>\n</article>\n<script type="application/json"></script>',
      solution:
        '<article>\n  <h2>{{ article.title | escape }}</h2>\n  <time datetime="{{ article.published_at | date: "%Y-%m-%d" }}">{{ article.published_at | date: "%d.%m.%Y" }}</time>\n  <p>{{ article.content | strip_html | truncate: 60 }}</p>\n  <span>{{ article.author | default: "Редакція" }}</span>\n</article>\n<script type="application/json">{{ article.tags | json }}</script>',
      data: {
        article: {
          title: 'Кератин & ботокс: у чому різниця',
          published_at: '2026-09-01T09:00:00+03:00',
          content: '<p>Обидві процедури <strong>відновлюють</strong> волосся, але працюють по-різному. Розбираємось без реклами.</p>',
          author: '',
          tags: ['кератин', 'ботокс', 'поради'],
        },
      },
      altData: {
        article: {
          title: 'Догляд після <процедури>',
          published_at: '2026-08-12T18:30:00+03:00',
          content: '<h3>Перші 72 години</h3><p>Не мочити, не заколювати, не заправляти за вуха — і результат протримається довше.</p>',
          author: 'Ірина',
          tags: ['догляд'],
        },
      },
      mustUse: [
        { pattern: '\\|\\s*strip_html\\b', label: 'Прибери теги з тексту фільтром `strip_html`' },
        { pattern: '\\|\\s*json\\b', label: 'Віддай теги у скрипт фільтром `json`' },
      ],
      hints: [
        'Іди по каркасу згори вниз, у кожному місці — один ланцюжок. Для `<time>` фільтр `date` знадобиться двічі з різними форматами: `%Y-%m-%d` і `%d.%m.%Y`.',
        'Для анонсу порядок такий: `strip_html`, потім `truncate: 60`. Для автора — `default: "Редакція"` (порожній string `default` теж замінює).',
        'Останній рядок: `<script type="application/json">{{ article.tags | json }}</script>` — без лапок навколо `{{ }}`.',
      ],
      explain:
        'У цій картці зібрано весь урок: кожне значення проходить через фільтр свого контексту. Заголовок — `escape`, бо це текст у HTML. `datetime` — машинний формат дати, текст — людський. Анонс — спершу `strip_html`, потім `truncate`, інакше можна розрізати тег. Теги для JS — `json`, без ручних лапок.',
    },
  ],
  quiz: [
    {
      id: 'l11-q1',
      q: 'Що виведе цей код?',
      template: '{{ 0 | default: "немає" }}',
      options: ['0', 'немає', 'Порожній рядок', 'Помилка'],
      correct: 0,
      explain: '`default` спрацьовує лише на `nil`, `false` та порожньому string чи масиві. Нуль — звичайне число, у Liquid він truthy. Це відмінність від JS, де `0 || "немає"` дало б «немає».',
    },
    {
      id: 'l11-q2',
      q: 'Що виведе цей код?',
      template: '{{ "<b>Хіт</b> & новинка" | strip_html | escape }}',
      options: ['Хіт &amp; новинка', 'Хіт & новинка', '&lt;b&gt;Хіт&lt;/b&gt; &amp; новинка', '<b>Хіт</b> &amp; новинка'],
      correct: 0,
      explain: 'Спершу `strip_html` вирізає теги — лишається `Хіт & новинка`. Потім `escape` перетворює `&` на `&amp;`. Якби фільтри стояли навпаки, `escape` спершу зробив би з тегів текст, і `strip_html` уже не мав би що вирізати.',
    },
    {
      id: 'l11-q3',
      q: 'У футері теми написали `{{ "now" | date: "%H:%M" }}`, щоб показувати поточний час. Покупці скаржаться, що час «стоїть». Чому?',
      options: [
        'Фільтр `date` не підтримує слово `now` — треба `today`',
        'Shopify кешує відрендерений HTML, тож `now` — це момент останнього рендера, а не відкриття сторінки',
        'Формат `%H:%M` працює лише з датами з обʼєктів магазину',
        'Час береться з годинника покупця, а він налаштований неправильно',
      ],
      correct: 1,
      explain: 'Liquid виконується на сервері, і результат кешується. `now` фіксує час рендера. Усе, що має бути «живим» (годинник, зворотний відлік), рахує JavaScript у браузері — Liquid лише передає йому дату.',
    },
    {
      id: 'l11-q4',
      q: 'Що виведе цей код?',
      template: '{{ "2026-03-14T10:00:00+02:00" | date: "%d.%m.%y" }}',
      options: ['14.03.26', '14.03.2026', '03.14.26', '14.3.26'],
      correct: 0,
      explain: '`%d` — день із нулем, `%m` — місяць із нулем, а мала `%y` — рік **двома** цифрами. Повний рік — велика `%Y`.',
    },
  ],
  docs: ['filters/date', 'filters/default', 'filters/escape', 'filters/escape_once', 'filters/strip_html', 'shopify/security', 'shopify/liquid-and-js'],
  topics: ['filters', 'security'],
}

/* ─────────────── l12 · Пробіли, коментарі, raw, liquid ─────────────── */

const l12: Lesson = {
  id: 'l12',
  module: 4,
  title: 'Whitespace control, коментарі, raw, liquid та echo',
  goal: 'Опануєш whitespace control (як прибирати пробіли й переноси навколо тегів), знатимеш, коли whitespace справді ламає результат, і писатимеш блоки логіки через `{% liquid %}`.',
  minutes: 25,
  blocks: [
    {
      type: 'p',
      text: 'Тег `{% if %}` сам нічого не виводить в output. Але перенос рядка **після** нього і відступ **перед** ним — звичайний текст шаблону, і він нікуди не зникає. Тому гарно відформатований Liquid дає HTML із дірками.',
    },
    {
      type: 'example',
      title: 'Акуратний шаблон — дірявий output',
      data: { tags: ['догляд', 'хіт', 'кератин'] },
      template: '<ul>\n{% for tag in tags %}\n  {% if tag != "хіт" %}\n    <li>{{ tag }}</li>\n  {% endif %}\n{% endfor %}\n</ul>',
      note: 'Порожні рядки — це переноси, що стояли після `{% for %}`, `{% if %}`, `{% endif %}`. Для тегу «хіт» умова не спрацювала, але переноси навколо `if` усе одно потрапили в output.',
    },
    { type: 'h', text: 'Дефіс: {%- і -%}' },
    {
      type: 'example',
      title: 'Той самий шаблон із дефісами',
      data: { tags: ['догляд', 'хіт', 'кератин'] },
      template: '<ul>\n{%- for tag in tags -%}\n  {%- if tag != "хіт" %}\n    <li>{{ tag }}</li>\n  {%- endif -%}\n{%- endfor %}\n</ul>',
      note: 'Дефіс **зліва** (`{%-`) зʼїдає весь whitespace перед тегом — пробіли, таби, переноси — аж до найближчого тексту. Дефіс **справа** (`-%}`) — те саме після тегу. Кожен бік керується окремо.',
    },
    {
      type: 'example',
      title: 'Дефіси працюють і в `{{ }}`',
      data: { price: 649 },
      template: 'A {{- " x " -}} B\nЦіна: {{- price }} ₴\nЦіна: {{ price -}} ₴',
      note: 'Дефіс чистить лише пробіли **навколо** `{{ }}` у шаблоні. Пробіли всередині значення (`" x "`) — це вже дані, їх він не чіпає; для них є `strip`.',
    },
    {
      type: 'note',
      tone: 'warn',
      title: 'Переборщити теж легко',
      text: 'Дефіс не розрізняє «зайвий» пробіл і потрібний. `Ціна: {{- price }}` склеїть слова в `Ціна:649`. Те саме з інлайновими елементами: між двома `<a>` пробіл — це видимий проміжок між посиланнями, і `{%- -%}` у циклі його прибере. Став дефіси там, де знаєш навіщо, а не «про всяк випадок скрізь».',
    },
    { type: 'h', text: 'Коли пробіли — це баг, а не косметика' },
    {
      type: 'p',
      text: 'У звичайному HTML браузер згортає пробіли, тож зайві переноси — лише питання краси коду. Але є місця, де пробіл стає частиною **значення**.',
    },
    {
      type: 'example',
      title: 'capture ловить і переноси',
      preset: 'product',
      template:
        '{% capture kind %}\n  {{ product.type }}\n{% endcapture %}\n{% if kind == "Шампунь" %}збіглось{% else %}не збіглось: [{{ kind }}]{% endif %}\n\n{% capture kind_clean -%}\n  {{ product.type }}\n{%- endcapture %}\n{% if kind_clean == "Шампунь" %}збіглось{% endif %}',
      note: 'У першій змінній лежить не `Шампунь`, а `⏎␣␣Шампунь⏎` — і порівняння зі string мовчки провалюється. Дефіси всередині `capture` (або `| strip` після) це лікують. Класичний баг, який шукають годинами.',
    },
    {
      type: 'example',
      title: 'Класи в атрибуті',
      data: { on_sale: true, available: false },
      template: '<div class="card{% if on_sale %} card--sale{% endif %}{% unless available %} card--sold-out{% endunless %}">',
      note: 'Прийом без дефісів: потрібний пробіл живе **всередині** умови, перед назвою класу. Умова не спрацювала — не буде ні класу, ні зайвого пробілу.',
    },
    {
      type: 'list',
      items: [
        '**`capture` + порівняння** — змінна з переносами не дорівнює «чистому» string.',
        '**JSON і JSON-LD**, зібрані циклом: переноси ще стерпні, а от кома після останнього елемента — ні; цикл із комами майже завжди пишуть із дефісами.',
        '**Атрибути** `value`, `href`, `content`: перенос усередині лапок стає частиною значення.',
        '**`<pre>` і `<textarea>`** — тут браузер пробіли не згортає.',
        '**Інлайнові елементи** — пробіл між ними видно на сторінці.',
        '**Не-HTML шаблони**: текстові листи, `robots.txt.liquid` — кожен перенос іде у файл як є.',
      ],
    },
    { type: 'h', text: 'Коментарі' },
    {
      type: 'example',
      title: 'Три способи щось «закоментувати»',
      data: { margin: 'маржа 40%' },
      template: '<!-- HTML-коментар: {{ margin }} -->\n{% comment %} Блоковий коментар: {{ margin }} {% endcomment %}\n{% # Інлайн-коментар: margin сюди не потрапить %}\n{%\n  # багаторядковий:\n  # кожен рядок починається з решітки\n%}\nкінець',
      note: 'HTML-коментар — це звичайний текст для Liquid: вираз усередині **виконався**, і «маржа 40%» поїхала в код сторінки, який бачить кожен. `{% comment %}` і `{% # %}` в output не потрапляють узагалі.',
    },
    {
      type: 'note',
      tone: 'warn',
      title: '<!-- --> не ховає Liquid',
      text: 'Закоментувати шматок шаблону через `<!-- … -->` — поширена помилка. Liquid усередині відпрацює: цикл пройде, дані підставляться, і все це піде в браузер. У кращому разі — зайві кілобайти, у гіршому — внутрішня інформація у вихідному коді. Щоб вимкнути Liquid-код, потрібен саме Liquid-коментар.',
    },
    { type: 'h', text: 'raw: показати Liquid, а не виконати' },
    {
      type: 'example',
      title: 'Фігурні дужки як текст',
      preset: 'product',
      template: 'Щоб вивести назву, пиши {% raw %}{{ product.title }}{% endraw %} — вийде «{{ product.title }}».\n\n<script type="text/template">{% raw %}<li>{{ item.name }} — {{ item.qty }} шт.</li>{% endraw %}</script>',
      note: 'Усе між `raw` і `endraw` іде в output буквально. Другий рядок — життєвий випадок: шаблон для JS-бібліотеки (Handlebars, Vue, Mustache), яка теж використовує `{{ }}`. Без `raw` Liquid зʼїв би ці дужки сам і підставив порожнечу.',
    },
    { type: 'h', text: 'liquid і echo: логіка без частоколу' },
    {
      type: 'example',
      title: 'Блок логіки одним тегом',
      preset: 'product',
      template:
        '{% liquid\n  # рахуємо доступні варіанти\n  assign in_stock = product.variants | where: "available"\n  if in_stock.size == product.variants.size\n    assign label = "Усі фасовки в наявності"\n  elsif in_stock.size > 0\n    assign label = "Доступно фасовок: " | append: in_stock.size\n  else\n    assign label = "Немає в наявності"\n  endif\n  echo label | upcase\n%}',
      note: 'Усередині `{% liquid %}` кожен **рядок** — окремий тег без `{%` і `%}`. Вивести значення звичним `{{ }}` тут не можна — для цього є `echo`, і фільтри в ньому працюють так само. Коментар — рядок, що починається з `#`.',
    },
    {
      type: 'note',
      tone: 'shopify',
      text: 'У Dawn та інших сучасних темах майже кожна секція починається з `{%- liquid … -%}`: там готують змінні, рахують класи, вирішують, що показувати. Нижче йде вже чистий HTML з мінімумом тегів. Бонус — один тег із дефісами замість десяти: проблема порожніх рядків зникає сама. Порожні рядки **всередині** `liquid` дозволені й в output не потрапляють.',
    },
    {
      type: 'note',
      tone: 'interview',
      title: 'На співбесіді',
      text: '**«Що робить дефіс у `{%-`?»** — прибирає весь whitespace з відповідного боку тегу, включно з переносами; працює і для `{{- -}}`. Одразу назви, де це не косметика: `capture` з подальшим порівнянням, JSON, значення атрибутів, текстові шаблони. **«Чим `{% comment %}` кращий за `<!-- -->`?»** — HTML-коментар потрапляє в браузер, а Liquid усередині нього виконується. **«Навіщо `echo`, якщо є `{{ }}`?»** — бо всередині `{% liquid %}` фігурних дужок немає. Докладніше — [whitespace control](/docs/basics/whitespace).',
    },
  ],
  exercises: [
    {
      id: 'l12-e1',
      title: 'Розміри в один рядок',
      task: [
        'У стартері — цикл, що виводить розміри з масиву `sizes`. Він відформатований зручно для читання, тому в output повно переносів і відступів.',
        'Не міняючи структуру (цикл лишається багаторядковим), додай дефіси так, щоб output був **рівно одним рядком**: значення через кому, без жодного пробілу чи переносу — ні всередині, ні на початку, ні в кінці. Наприклад: `250 мл,400 мл,1000 мл`.',
        'Перевірка сувора: порівнюється кожен символ.',
      ],
      starter: '{% for size in sizes %}\n  {{ size }}{% unless forloop.last %},{% endunless %}\n{% endfor %}',
      solution: '{%- for size in sizes -%}\n  {{ size }}{% unless forloop.last %},{% endunless %}\n{%- endfor -%}',
      data: { sizes: ['250 мл', '400 мл', '1000 мл'] },
      altData: { sizes: ['S', 'M', 'L', 'XL'] },
      strictWhitespace: true,
      mustUse: [
        { pattern: '\\{%-|-%\\}', label: 'Використай дефіси `{%-` / `-%}`' },
        { pattern: '\\{%-?\\s*for\\b', label: 'Лиши цикл `for`' },
      ],
      hints: [
        'Знайди, звідки беруться зайві символи: перенос і відступ після `{% for %}`, перенос після `{% endunless %}`, перенос після `{% endfor %}`, якщо він є.',
        'Дефіс справа у `for` зʼїсть відступ перед значенням. Дефіс зліва в `endfor` — перенос після коми.',
        'Не забудь краї: `{%-` на початку `for` і `-%}` наприкінці `endfor` прибирають усе до й після циклу. Пробіл у «250 мл» — це дані, його дефіси не чіпають.',
      ],
      explain:
        'Чотири дефіси на зовнішніх тегах закривають усі шви: початок, відступ перед значенням, перенос після коми, кінець. Теги `unless` дефісів не потребують — навколо них і так немає пробілів. У житті такий список простіше зробити через `join: ","`, але щойно всередині зʼявляється розмітка чи умова — лишається цикл із дефісами.',
    },
    {
      id: 'l12-e2',
      title: 'Шпаргалка для контент-менеджера',
      task: [
        'Ти пишеш підказку для колеги: який код що виводить. Потрібні два рядки, у кожному — спершу **сам код текстом**, потім стрілка й реальне значення:',
        '`{{ product.title }} → Шампунь із кератином`',
        '`{{ product.vendor | upcase }} → COCOCHOCO`',
        'Ліва частина має вивестись буквально, з фігурними дужками; права — порахуватись.',
      ],
      starter: '{% comment %} Ліворуч від стрілки код має лишитись текстом {% endcomment %}\n{{ product.title }} → {{ product.title }}\n{{ product.vendor | upcase }} → {{ product.vendor | upcase }}',
      solution:
        '{% raw %}{{ product.title }}{% endraw %} → {{ product.title }}\n{% raw %}{{ product.vendor | upcase }}{% endraw %} → {{ product.vendor | upcase }}',
      data: { product: { title: 'Шампунь із кератином', vendor: 'Cocochoco' } },
      altData: { product: { title: 'Олійка для кінчиків', vendor: 'Inoar' } },
      mustUse: [{ pattern: '\\{%-?\\s*raw\\b', label: 'Використай тег `raw`' }],
      hints: [
        'Зараз обидві половини рядка виконуються. Потрібен тег, який каже Liquid: «це не чіпай, виведи як є».',
        'Загорни ліву частину в `{% raw %}…{% endraw %}`. Права лишається звичайним `{{ }}`.',
        '`{% raw %}{{ product.title }}{% endraw %} → {{ product.title }}`',
      ],
      explain:
        '`raw` вимикає розбір Liquid до найближчого `endraw`. `{% comment %}` тут не допоміг би: він ховає вміст повністю, а нам треба його **показати**. У темах `raw` найчастіше захищає шаблони JS-бібліотек з `{{ }}` (Vue, Handlebars) від серверного Liquid.',
    },
    {
      id: 'l12-e3',
      title: 'Залишки одним тегом liquid',
      task: [
        'У `variants` — фасовки з полями `title` і `qty`. Для кожної виведи `<li>НАЗВА — СТАТУС</li>`, де статус: `немає`, якщо `qty` дорівнює 0; `закінчується`, якщо менше 5; інакше `є`.',
        'Уся логіка — в **одному** тегу `{% liquid %}`: цикл, умови та output через `echo`. Фігурних дужок `{{ }}` у рішенні бути не повинно.',
      ],
      starter: '{% liquid\n  # for … in variants\n  #   if / elsif / else → assign status\n  #   echo "<li>" … "</li>"\n%}',
      solution:
        '{% liquid\n  for v in variants\n    if v.qty == 0\n      assign status = "немає"\n    elsif v.qty < 5\n      assign status = "закінчується"\n    else\n      assign status = "є"\n    endif\n    echo "<li>" | append: v.title | append: " — " | append: status | append: "</li>"\n  endfor\n%}',
      data: {
        variants: [
          { title: '250 мл', qty: 8 },
          { title: '400 мл', qty: 3 },
          { title: '1000 мл', qty: 0 },
        ],
      },
      altData: {
        variants: [
          { title: 'S', qty: 0 },
          { title: 'M', qty: 12 },
          { title: 'L', qty: 4 },
          { title: 'XL', qty: 5 },
        ],
      },
      mustUse: [
        { pattern: '\\{%-?\\s*liquid\\b', label: 'Використай тег `{% liquid %}`' },
        { pattern: '\\becho\\b', label: 'Виводь через `echo`' },
      ],
      mustNotUse: [{ pattern: '\\{\\{', label: 'Без `{{ }}` — усе всередині `liquid`' }],
      view: 'html',
      hints: [
        'Усередині `{% liquid %}` пиши теги без `{%` і `%}`, кожен з нового рядка: `for v in variants`, `if v.qty == 0`, `endif`, `endfor`.',
        'Спершу визнач статус через `assign` у гілках `if / elsif / else`, а виводь один раз наприкінці ітерації.',
        '`echo` приймає ланцюжок фільтрів: `echo "<li>" | append: v.title | append: " — " | append: status | append: "</li>"`.',
      ],
      explain:
        'Порядок умов важливий: спершу `== 0`, потім `< 5` — інакше нуль потрапив би в «закінчується». String для `echo` збирається через `append`, бо всередині `liquid` немає «просто тексту» — лише теги. Можна й кількома `echo` поспіль: кожен виводить свій шматок без пробілів між ними.',
    },
    {
      id: 'l12-e4',
      title: 'JSON варіантів для скрипта',
      task: [
        'JavaScript на сторінці product чекає компактний JSON-масив варіантів — лише три поля з кожного: `id`, `title`, `available`. У даних полів більше (`price`, `sku`), тому `{{ variants | json }}` не підходить: він віддасть усе.',
        'Збери JSON циклом. Output — **рівно один рядок без пробілів і переносів** між елементами: `[{"id":11,"title":"250 мл","available":true},{"id":12,…}]`. Кома — лише між обʼєктами, після останнього її немає.',
        'Назву виводь через `json` — він сам поставить лапки й екранує лапки всередині. Перевірка сувора: порівнюється кожен символ. У стартері — читабельний цикл; розстав у ньому дефіси.',
      ],
      starter:
        '[\n{% for v in variants %}\n  {"id":{{ v.id }},"title":{{ v.title | json }},"available":{{ v.available }}}\n  {% unless forloop.last %},{% endunless %}\n{% endfor %}\n]',
      solution:
        '[\n{%- for v in variants -%}\n  {"id":{{ v.id }},"title":{{ v.title | json }},"available":{{ v.available }}}\n  {%- unless forloop.last %},{% endunless -%}\n{%- endfor -%}\n]',
      data: {
        variants: [
          { id: 11, title: '250 мл', available: true, price: 64900, sku: 'LL-11' },
          { id: 12, title: '400 мл', available: true, price: 89900, sku: 'LL-12' },
          { id: 13, title: '1000 мл "Салон"', available: false, price: 119900, sku: 'LL-13' },
        ],
      },
      altData: {
        variants: [
          { id: 41, title: '50 мл', available: false, price: 39900, sku: 'LL-41' },
          { id: 42, title: '100 мл', available: true, price: 69900, sku: 'LL-42' },
        ],
      },
      strictWhitespace: true,
      mustUse: [
        { pattern: '\\{%-|-%\\}', label: 'Використай дефіси `{%-` / `-%}`' },
        { pattern: '\\|\\s*json\\b', label: 'Назву варіанта виводь через `json`' },
      ],
      hints: [
        'Пройдись по стартеру й познач кожен шов, де є перенос або відступ: після `[`, після `for`, перед `unless`, після `endunless`, перед `]`.',
        'Дефіс із потрібного боку тегу зʼїдає **все** до найближчого тексту. `{%- for` прибере перенос після `[`, а `-%}` у `for` — відступ перед `{`.',
        'Перед комою: `{%- unless forloop.last %},{% endunless -%}`. В кінці: `{%- endfor -%}` — і дужка `]` стане впритул.',
      ],
      explain:
        'Шість дефісів — і багаторядковий читабельний шаблон дає компактний валідний JSON. Дефіси стоять лише на «швах» між рядками; всередині обʼєкта їх немає, бо там і так нема пробілів. У справжній темі для цілого обʼєкта зручніше `{{ product | json }}` або `{{ product.variants | json }}`, а ручний цикл потрібен саме тоді, коли треба віддати **частину** полів.',
    },
  ],
  quiz: [
    {
      id: 'l12-q1',
      q: 'Що виведе цей код?',
      template: 'a {{- "b" -}} c',
      options: ['abc', 'a b c', 'a bc', 'ab c'],
      correct: 0,
      explain: 'Дефіс зліва зʼїдає пробіл після `a`, дефіс справа — пробіл перед `c`. Лишається `abc`.',
    },
    {
      id: 'l12-q2',
      q: 'Що виведе цей код?',
      template: '{% raw %}{{ 1 | plus: 1 }}{% endraw %}',
      options: ['2', '{{ 1 | plus: 1 }}', 'Нічого', 'Помилка'],
      correct: 1,
      explain: 'Усередині `raw` Liquid нічого не виконує — вміст іде в output буквально, разом із фігурними дужками.',
    },
    {
      id: 'l12-q3',
      q: 'Розробник «вимкнув» блок так: `<!-- {% for p in collection.products %}{{ p.title }}{% endfor %} -->`. Що станеться?',
      options: [
        'Нічого не виконається: HTML-коментар вимикає Liquid усередині',
        'Буде помилка Liquid: теги всередині HTML-коментаря заборонені',
        'Цикл виконається, і назви всіх товарів потраплять у вихідний код сторінки всередині коментаря',
        'Цикл виконається, але Shopify автоматично вирізає HTML-коментарі з відповіді',
      ],
      correct: 2,
      explain: 'Для Liquid `<!--` — звичайний текст. Цикл відпрацює на сервері, результат піде в браузер, просто той його не покаже. Щоб вимкнути Liquid-код, потрібен `{% comment %}` або `{% # %}`.',
    },
    {
      id: 'l12-q4',
      q: 'Що виведе цей код?',
      template: '{% liquid\n  assign x = 5\n  echo x | times: 2\n%}',
      options: ['10', '5', 'x | times: 2', 'Помилка'],
      correct: 0,
      explain: '`echo` — це `{{ }}` для тегу `liquid`: обчислює вираз разом із фільтрами й виводить результат.',
    },
  ],
  docs: ['basics/whitespace', 'tags/template', 'tags/variable'],
  topics: ['whitespace', 'basics'],
}

/* ─────────────── l13 · Сніпети ─────────────── */

const productCardSnippet = `<article class="card">
  <span class="card__pos">#{{ position }}</span>
  {% if product.compare_at_price and product.compare_at_price > product.price %}<span class="card__badge">Знижка</span>{% endif %}
  <h3>{{ product.title }}</h3>
  {% if show_vendor %}<p class="card__vendor">{{ product.vendor }}</p>{% endif %}
  <p class="card__price">{{ product.price }} {{ currency }}</p>
</article>
`

const l13: Lesson = {
  id: 'l13',
  module: 4,
  title: 'Сніпети: render проти include, scope',
  goal: 'Зможеш винести розмітку в сніпет, передати в нього дані трьома способами й пояснити, чому `render` ізольований, а `include` deprecated.',
  minutes: 30,
  blocks: [
    {
      type: 'p',
      text: 'Сніпет — це файл у папці `snippets/`, шматок шаблону для повторного використання: картка product, іконка, бейдж, ціна. Підключається тегом `render` за іменем файлу без розширення. Найближча аналогія з JS — **функція** або компонент: є вхідні параметри, є результат (HTML). І ключове слово тут — «параметри».',
    },
    {
      type: 'example',
      title: 'Сніпет із параметрами',
      snippets: { badge: '<span class="badge badge--{{ type }}">{{ text }}</span>' },
      template: "{% render 'badge', type: 'sale', text: '−20%' %}\n{% render 'badge', type: 'new', text: 'Новинка' %}",
      note: 'Сніпети цього прикладу лежать у вкладці «Сніпети». Параметри йдуть після імені через кому, у форматі `імʼя: значення`. Усередині сніпета вони стають звичайними змінними.',
    },
    { type: 'h', text: 'Ізольований scope' },
    {
      type: 'example',
      title: 'Зовнішні змінні всередину не потрапляють',
      snippets: { swatch: '[колір: {{ color }}]' },
      template: "{% assign color = 'бірюзовий' %}\nБез параметра: {% render 'swatch' %}\nЗ параметром: {% render 'swatch', color: color %}",
      note: 'Змінну `color` створено через `assign` **зовні** — і сніпет її не бачить, доки не передаси явно: у нього власний scope (межі видимості змінних). У JS функція бачить змінні зовнішнього scope (замикання); `render` — ні. Це радше чиста функція у окремому модулі: лише аргументи.',
    },
    {
      type: 'example',
      title: 'І назовні нічого не витікає',
      snippets: { counter: '{% assign total = total | plus: 10 %}{% assign secret = "лише тут" %}усередині: {{ total }}' },
      template: "{% assign total = 1 %}\n{% render 'counter', total: total %}\nзовні: {{ total }}\nsecret: [{{ secret }}]",
      note: 'Сніпет змінив `total` і створив `secret` — але це його **локальні копії**. Після `render` зовнішній `total` лишився `1`, а `secret` зовні не існує. Ізоляція працює в обидва боки.',
    },
    {
      type: 'example',
      title: 'А глобальні обʼєкти?',
      preset: 'shop',
      snippets: { 'footer-note': '© {{ shop.name }}' },
      template: "{% render 'footer-note' %}",
      note: 'Працює — хоча `shop` ніхто не передавав. Ізоляція стосується лише змінних, які ти **створив** через `assign` / `capture`. Глобальні обʼєкти (`shop`, `settings`, `routes`, `request`, `cart`, `customer`) і обʼєкт сторінки (`product` у template `product`, `section` всередині секції) сніпет бачить сам.',
    },
    { type: 'h', text: 'Три способи передати дані' },
    {
      type: 'example',
      title: 'with … as: один обʼєкт під своїм імʼям',
      preset: 'product',
      snippets: { 'price-line': '<p>{{ item.title }}: {{ item.price | divided_by: 100 }} ₴</p>' },
      template: "{% render 'price-line' with product.variants.first as item %}\n{% render 'price-line', item: product.variants.last %}",
      note: 'Обидва рядки роблять те саме: кладуть обʼєкт у змінну `item` всередині сніпета. `with … as` — синтаксичний цукор для випадку «один головний обʼєкт». Якщо `as` пропустити, змінна назветься так само, як файл сніпета.',
    },
    {
      type: 'example',
      title: 'for … as: сніпет на кожен елемент',
      preset: 'collection',
      snippets: { 'product-row': '<li class="row{% if forloop.first %} row--first{% endif %}">{{ forloop.index }}/{{ forloop.length }} · {{ card.title }}</li>\n' },
      template: "<ul>\n{% render 'product-row' for collection.products as card %}</ul>",
      note: 'Цикл без `{% for %}`: сніпет рендериться по разу на кожен елемент масиву. Бонус — усередині сніпета доступний власний `forloop` (`index`, `first`, `last`, `length`).',
    },
    {
      type: 'table',
      head: ['Запис', 'Що бачить сніпет'],
      rows: [
        ["`{% render 'card', product: p, size: 'lg' %}`", 'змінні `product` і `size`'],
        ["`{% render 'card' with p as product %}`", 'змінну `product`'],
        ["`{% render 'card' with p %}`", 'змінну `card` — за іменем файлу'],
        ["`{% render 'card' for list as product %}`", '`product` для кожного елемента + власний `forloop`'],
        ["`{% render 'card' for list as product, size: 'lg' %}`", 'те саме плюс спільний для всіх параметр `size`'],
      ],
    },
    { type: 'h', text: 'render усередині звичайного циклу' },
    {
      type: 'example',
      title: 'forloop теж треба передавати',
      preset: 'collection',
      snippets: { tile: '[{{ position }}] {{ product.title }} (forloop усередині: «{{ forloop.index }}»)\n' },
      template: "{% assign in_stock = collection.products | where: 'available' %}\n{% for p in in_stock limit: 3 %}\n  {%- render 'tile', product: p, position: forloop.index %}\n{% endfor %}",
      note: '`forloop` зовнішнього циклу — така сама «зовнішня змінна», як і будь-яка інша: у сніпеті її немає. Потрібен номер — передай його параметром (`position: forloop.index`). Такий запис гнучкіший за `for … as`: масив можна попередньо відфільтрувати, обмежити `limit` і передати кожному елементу свої параметри.',
    },
    {
      type: 'note',
      tone: 'warn',
      title: 'Дві речі, які не працюють у параметрах',
      text: "**Фільтри.** `{% render 'card', title: product.title | upcase %}` — фільтр у параметрі не застосується (пісочниця його мовчки ігнорує). Спершу `assign`, потім передавай готову змінну. **Динамічне імʼя.** У Shopify імʼя сніпета — лише string-літерал у лапках: `{% render block.type %}` — синтаксична помилка. Хочеш обирати сніпет за умовою — пиши `case` з кількома `render`. Пісочниця тут поблажливіша за Shopify і змінну в імені приймає, тож на неї не покладайся.",
    },
    { type: 'h', text: 'Як «повернути значення» зі сніпета' },
    {
      type: 'example',
      title: 'capture навколо render',
      snippets: { 'discount-percent': '{{ compare | minus: price | times: 100 | divided_by: compare }}' },
      template: "{% capture percent %}{% render 'discount-percent', price: 64900, compare: 79900 %}{% endcapture %}\n{% assign percent = percent | strip | plus: 0 %}\n{% if percent >= 15 %}Велика знижка: −{{ percent }}%{% else %}−{{ percent }}%{% endif %}",
      note: 'Змінні зі сніпета назовні не виходять, але **output** — виходить. Загорни `render` у `capture` — і отримаєш результат як string. `strip` прибирає випадкові пробіли, `plus: 0` перетворює string на число для порівняння. `return` у Liquid немає, це єдиний спосіб.',
    },
    { type: 'h', text: 'include: чому deprecated' },
    {
      type: 'example',
      title: 'include ділить змінні з батьківським шаблоном',
      snippets: { legacy: '(бачу color: {{ color }}){% assign color = "червоний" %}{% assign leaked = "витекло" %}' },
      template: "{% assign color = 'бірюзовий' %}\n{% include 'legacy' %}\nколір після include: {{ color }}\nleaked: {{ leaked }}",
      note: '`include` працює так, ніби код сніпета вставили просто на це місце: він бачить **усі** зовнішні змінні, може їх перезаписати, а його власні змінні лишаються жити після нього. Порівняй із прикладом про `counter` вище.',
    },
    {
      type: 'list',
      items: [
        '**Неявні залежності.** З коду не видно, які змінні потрібні сніпету: він мовчки бере їх з оточення. Перейменував змінну в секції — зламав сніпет за три файли звідси.',
        '**Побічні ефекти.** Сніпет може перезаписати твою змінну (`color` у прикладі) — і баг вилізе далеко від причини.',
        '**Performance.** За офіційним поясненням Shopify, саме такий спосіб роботи зі змінними знижує швидкодію: ізольований `render` рушій може обробляти ефективніше.',
        '**Офіційний статус.** `include` позначений як deprecated, Theme Check на нього свариться, а всередині сніпета, підключеного через `render`, використовувати `include` взагалі не можна.',
      ],
    },
    {
      type: 'note',
      tone: 'tip',
      title: 'Міграція з include на render',
      text: 'Заміна слова `include` на `render` майже ніколи не працює з першого разу — сніпет перестає бачити змінні, якими користувався неявно. Алгоритм: відкрий сніпет, випиши всі змінні, яких він не створює сам, і передай кожну параметром. Якщо сніпет «повертав» щось через `assign` — перероби на `capture` навколо `render`. Перелік параметрів варто задокументувати на початку файла — у Shopify для цього є тег `{% doc %}`.',
    },
    {
      type: 'note',
      tone: 'interview',
      title: 'На співбесіді',
      text: '**«Чим `render` відрізняється від `include`?»** — `render` має ізольований scope: змінні батьківського шаблону в сніпеті недоступні, доки не передаси параметром, а змінні сніпета не виходять назовні. Глобальні обʼєкти Shopify при цьому доступні. `include` ділив усі змінні з батьком — це давало неявні залежності, побічні ефекти й гіршу швидкодію, тому він deprecated. **Сильний хід** — додати: параметри передаю через кому, `with … as` або `for … as`; `forloop` зовнішнього циклу теж треба передавати; результат зі сніпета забираю через `capture`. Більше — у довіднику [про сніпети](/docs/shopify/snippets-render).',
    },
  ],
  exercises: [
    {
      id: 'l13-e1',
      title: 'Передай параметри бейджу',
      task: [
        'Є готовий сніпет `badge` (змінювати його не можна): `<span class="badge badge--{{ type }}">{{ text }}</span>`. Він чекає два параметри — `type` і `text`.',
        'У твоєму шаблоні дані лежать у змінних з **іншими** іменами: `kind` і `label`. Підключи сніпет так, щоб вийшло `<span class="badge badge--sale">−20%</span>`.',
      ],
      starter: "{% comment %} Сніпет не бачить kind і label — передай їх під іменами type і text {% endcomment %}\n{% render 'badge' %}",
      solution: "{% render 'badge', type: kind, text: label %}",
      snippets: { badge: '<span class="badge badge--{{ type }}">{{ text }}</span>' },
      data: { kind: 'sale', label: '−20%' },
      altData: { kind: 'new', label: 'Новинка' },
      mustUse: [{ pattern: "\\{%-?\\s*render\\s+['\"]badge['\"]", label: 'Підключи сніпет `badge` тегом `render`' }],
      view: 'html',
      hints: [
        'Стартовий код рендерить порожній бейдж: сніпет ізольований і зовнішніх змінних не бачить.',
        'Параметри пишуться після імені сніпета через кому: `імʼя_в_сніпеті: значення_зовні`.',
        "`{% render 'badge', type: kind, text: label %}`",
      ],
      explain:
        'Ліворуч від двокрапки — імʼя, під яким значення житиме **в сніпеті**; праворуч — звідки його взяти зовні. Імена не мусять збігатися, і це зручно: сніпет має власний «інтерфейс», незалежний від того, як названі змінні в кожному місці виклику.',
    },
    {
      id: 'l13-e2',
      title: 'Один обʼєкт — через with',
      task: [
        'Сніпет `price-line` (фіксований) малює рядок ціни з обʼєкта `item`: назву, ціну і — якщо є — стару ціну: `<p class="price-line">{{ item.title }}: {{ item.price }} ₴…</p>`.',
        'У шаблоні є обʼєкт `featured`. Підключи сніпет, передавши `featured` під іменем `item` — синтаксисом `with … as`.',
      ],
      starter: "{% comment %} render 'price-line' with … as … {% endcomment %}\n{% render 'price-line' %}",
      solution: "{% render 'price-line' with featured as item %}",
      snippets: {
        'price-line':
          '<p class="price-line">{{ item.title }}: {{ item.price }} ₴{% if item.compare_at_price %} <s>{{ item.compare_at_price }} ₴</s>{% endif %}</p>',
      },
      data: { featured: { title: 'Шампунь із кератином', price: 649, compare_at_price: 799 } },
      altData: { featured: { title: 'Олійка для кінчиків', price: 399, compare_at_price: null } },
      mustUse: [{ pattern: '\\bwith\\s+[\\w.]+\\s+as\\s+item\\b', label: 'Використай `with … as item`' }],
      view: 'html',
      hints: [
        'Сніпет звертається до `item.title`, `item.price` — отже, всередині має існувати змінна `item`.',
        'Форма запису: `render` + імʼя сніпета + `with` + обʼєкт + `as` + імʼя всередині.',
        "`{% render 'price-line' with featured as item %}`",
      ],
      explain:
        "Те саме можна записати як `{% render 'price-line', item: featured %}` — результат ідентичний. `with … as` просто підкреслює, що у сніпета один «головний» обʼєкт. Без `as` змінна назвалась би за іменем файлу — а `price-line` з дефісом навіть не є коректним іменем змінної, тож тут `as` обовʼязковий.",
    },
    {
      id: 'l13-e3',
      title: 'Меню через render … for',
      task: [
        'Сніпет `menu-item` (фіксований) малює один пункт меню з обʼєкта `link` і сам користується `forloop`: додає клас першому пункту й ставить номер.',
        'У шаблоні є масив `links`. Виведи `<ul class="menu">`, усередині — сніпет для **кожного** посилання. Без тегу `{% for %}`: скористайся параметром `for … as` самого `render`.',
      ],
      starter: "{% comment %} render 'menu-item' for … as … {% endcomment %}\n<ul class=\"menu\">\n</ul>",
      solution: "<ul class=\"menu\">\n{% render 'menu-item' for links as link %}\n</ul>",
      snippets: {
        'menu-item':
          '<li class="menu__item{% if forloop.first %} menu__item--first{% endif %}{% if link.active %} is-active{% endif %}">{{ forloop.index }}. <a href="{{ link.url }}">{{ link.title }}</a></li>\n',
      },
      data: {
        links: [
          { title: 'Головна', url: '/', active: true },
          { title: 'Каталог', url: '/collections/all', active: false },
          { title: 'Журнал', url: '/blogs/journal', active: false },
        ],
      },
      altData: {
        links: [
          { title: 'Догляд', url: '/collections/home-care', active: false },
          { title: 'Акції', url: '/collections/sale', active: true },
        ],
      },
      mustUse: [{ pattern: "render\\s+['\"]menu-item['\"]\\s+for\\b", label: 'Використай `render … for … as`' }],
      mustNotUse: [{ pattern: '\\{%-?\\s*for\\b', label: 'Без окремого тегу `{% for %}`' }],
      view: 'html',
      hints: [
        '`render` уміє сам пройтись по масиву: після імені сніпета пишеться `for масив as імʼя`.',
        'Сніпет читає `link.url` і `link.title` — отже, після `as` має стояти `link`.',
        "`{% render 'menu-item' for links as link %}` — усередині `<ul class=\"menu\">`.",
      ],
      explain:
        'У варіанті `for … as` сніпет отримує власний `forloop` — тому `forloop.first` та `forloop.index` у ньому працюють. Якби ти викликав `render` усередині звичайного `{% for %}`, сніпет `forloop` не побачив би: це зовнішня змінна, її довелося б передавати параметром.',
    },
    {
      id: 'l13-e4',
      title: 'Сітка product із карткою-сніпетом',
      task: [
        'Сніпет `product-card` фіксований. Він читає **лише параметри**: `product` (обʼєкт product), `position` (номер картки), `show_vendor` (boolean) і `currency` (string). Сам вирішує, чи показати бейдж «Знижка».',
        'У шаблоні є масив `products` і налаштування `theme.show_vendor` та `theme.currency`. Збери блок «Вигідний старт»: лише product **в наявності**, відсортовані за ціною **від найдешевшого**, перші **три**.',
        'Кожну картку рендери всередині `<div class="grid">`, передаючи всі чотири параметри; `position` — порядковий номер картки в сітці (1, 2, 3).',
      ],
      starter:
        "{% comment %}\n  1) where + sort → змінна\n  2) for … limit: 3\n  3) render 'product-card' з чотирма параметрами\n{% endcomment %}\n<div class=\"grid\">\n</div>",
      solution:
        "{% assign picks = products | where: 'available' | sort: 'price' %}\n<div class=\"grid\">\n{% for p in picks limit: 3 %}\n  {% render 'product-card', product: p, position: forloop.index, show_vendor: theme.show_vendor, currency: theme.currency %}\n{% endfor %}\n</div>",
      snippets: { 'product-card': productCardSnippet },
      data: {
        theme: { show_vendor: true, currency: '₴' },
        products: [
          { title: 'Шампунь із кератином', vendor: 'Cocochoco', price: 649, compare_at_price: 799, available: true },
          { title: 'Маска глибокого відновлення', vendor: 'Inoar', price: 849, compare_at_price: null, available: true },
          { title: 'Термозахисний спрей', vendor: 'Erayba', price: 520, compare_at_price: 650, available: false },
          { title: 'Олійка для кінчиків', vendor: 'Inoar', price: 399, compare_at_price: null, available: true },
          { title: 'Кондиціонер щоденний', vendor: 'Cocochoco', price: 580, compare_at_price: 640, available: true },
        ],
      },
      altData: {
        theme: { show_vendor: false, currency: 'грн' },
        products: [
          { title: 'Бальзам №5', vendor: 'Olaplex', price: 1299, compare_at_price: null, available: true },
          { title: 'Пінка для обʼєму', vendor: 'Brae', price: 450, compare_at_price: 520, available: false },
          { title: 'Сироватка', vendor: 'Brae', price: 730, compare_at_price: 910, available: true },
          { title: 'Гребінець', vendor: 'Olaplex', price: 420, compare_at_price: null, available: true },
          { title: 'Лак сильної фіксації', vendor: 'Erayba', price: 380, compare_at_price: 380, available: true },
        ],
      },
      mustUse: [
        { pattern: "\\{%-?\\s*render\\s+['\"]product-card['\"]", label: 'Рендери картку сніпетом `product-card`' },
        { pattern: '\\|\\s*where\\b', label: 'Відбери доступні product фільтром `where` — до циклу' },
      ],
      view: 'html',
      hints: [
        'Спершу підготуй масив, як у десятому уроці: `products | where: "available" | sort: "price"` — і збережи в змінну. Цикл — уже по ній, з `limit: 3`.',
        'Сніпет не бачить ні `theme`, ні `forloop`. Усе, що йому потрібно, передай явно: `show_vendor: theme.show_vendor`, `currency: theme.currency`, `position: forloop.index`.',
        "`{% render 'product-card', product: p, position: forloop.index, show_vendor: theme.show_vendor, currency: theme.currency %}`",
      ],
      explain:
        'Тут зійшлися два уроки. Масив готується **до** циклу — тому `limit: 3` дає рівно три картки, а `forloop.index` — чесні 1, 2, 3. А сніпет отримує все через параметри: з виклику видно повний перелік його залежностей, і картку можна перевикористати в будь-якій секції. З `include` цей код теж «працював» би — рівно до того дня, коли хтось перейменує `theme` або змінну циклу.',
    },
  ],
  quiz: [
    {
      id: 'l13-q1',
      q: "У секції написано `{% assign color = 'red' %}{% render 'swatch' %}`, а в сніпеті `swatch` — лише `{{ color }}`. Що виведеться?",
      options: ['red', 'Нічого: сніпет не бачить змінних, створених зовні', 'color', 'Помилка: змінну `color` не визначено'],
      correct: 1,
      explain: '`render` ізольований: змінні з `assign` батьківського шаблону в сніпет не потрапляють. Невизначена змінна в Liquid — це `nil`, який виводиться як порожній string, а не помилка. Виправлення: `{% render \'swatch\', color: color %}`.',
    },
    {
      id: 'l13-q2',
      q: 'А як зі scope в межах **одного файла**? Що виведе цей код?',
      template: '{% for i in (1..3) %}{% assign last = i %}{% endfor %}{{ last }}',
      options: ['3', 'Нічого: `last` існує лише всередині циклу', '1', 'Помилка'],
      correct: 0,
      explain: 'Усередині одного шаблону блочного scope немає: `assign` у циклі чи в `if` створює змінну, яка живе до кінця файла (у JS `let` у циклі так не вміє). Справжню межу проводить лише `render` — тому ізоляція сніпетів така помітна.',
    },
    {
      id: 'l13-q3',
      q: 'У темі немає файла `snippets/ghost.liquid`. Що дасть цей код?',
      template: "{% render 'ghost' %}",
      options: ['Порожній рядок — відсутній сніпет ігнорується', 'Помилка: сніпет не знайдено', "Текст `ghost`", 'Вміст останнього підключеного сніпета'],
      correct: 1,
      explain: 'Відсутній сніпет — це помилка, а не тихий пропуск. Пісочниця зупиняє рендер; справжній Shopify виведе на сторінці `Liquid error` з повідомленням, що файл сніпета не знайдено, і продовжить рендерити решту.',
    },
    {
      id: 'l13-q4',
      q: 'Чому `include` оголошено deprecated?',
      options: [
        'Він не вміє приймати параметри',
        'Він ділить усі змінні з батьківським шаблоном: це неявні залежності, побічні ефекти й гірша продуктивність',
        'Він працює лише в темах без JSON-шаблонів',
        'Він рендерить сніпет на клієнті, а не на сервері',
      ],
      correct: 1,
      explain: 'Параметри `include` приймати вміє. Проблема — у спільному scope: сніпет читає й перезаписує зовнішні змінні, а його власні витікають назовні. Shopify прямо називає причину: такий підхід погіршує performance й ускладнює підтримку коду. Заміна — `render`.',
    },
  ],
  docs: ['tags/template', 'shopify/snippets-render', 'shopify/deprecated', 'shopify/performance'],
  topics: ['snippets', 'performance'],
}

export const lessonsPart3: Lesson[] = [l10, l11, l12, l13]
