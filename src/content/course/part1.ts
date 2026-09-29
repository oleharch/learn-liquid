import type { Lesson } from '../types'

/* ───────── спільні дані прикладів ─────────
 * Маленькі власні обʼєкти замість пресета: у перших уроках читач має бачити
 * ВСІ дані одним поглядом. Ціни тут у копійках, як у Shopify, — крім уроку 4,
 * де рахуємо в гривнях, щоб не тягнути фільтр `money` у тему про змінні.
 */

const shampoo = {
  title: 'Шампунь із кератином',
  vendor: 'Cocochoco',
  price: 64900,
  available: true,
  volume_ml: 250,
  tags: ['догляд', 'кератин', 'хіт'],
  featured_image: { src: '/files/keratin-shampoo.jpg', alt: 'Флакон шампуню з кератином', width: 1200 },
  variants: [
    { title: '250 мл', price: 64900, available: true },
    { title: '400 мл', price: 89900, available: true },
    { title: '1000 мл', price: 119900, available: false },
  ],
}

/* ═══════════════════════ УРОК 1 ═══════════════════════ */

const l01: Lesson = {
  id: 'l01',
  module: 1,
  title: 'Що таке Liquid: output, теги, фільтри',
  goal: 'Дивишся на будь-який шматок Liquid і бачиш у ньому три речі: що йде в output, що керує логікою і що перетворює значення.',
  minutes: 20,
  docs: ['basics/introduction', 'basics/sandbox', 'filters/upcase', 'filters/append', 'filters/size'],
  topics: ['basics', 'filters'],
  blocks: [
    {
      type: 'p',
      text: 'Liquid — це **мова шаблонів**. Shopify створив її у 2006 році, щоб вигляд магазину можна було міняти, не маючи доступу до сервера. Уся ідея вміщується в одну формулу: **шаблон + дані = HTML**. Шаблон — звичайна верстка з «дірками». Дані — product, cart, theme settings. Liquid заповнює дірки й віддає готову сторінку.',
    },
    {
      type: 'p',
      text: 'Якщо ти писав на JS, найближча аналогія — template literal із `${…}` або JSX. Але вона ламається в головному: Liquid виконується **на сервері, ще до того як сторінка поїде в браузер**. Браузер не бачить жодної фігурної дужки — лише результат. Тому Liquid не може зреагувати на клік, не бачить DOM і не знає ширини екрана: усе, що відбувається після завантаження, — територія JavaScript. А сама мова тримається всього на трьох конструкціях.',
    },
    {
      type: 'table',
      head: ['Конструкція', 'Запис', 'Що робить'],
      rows: [
        ['Output (те, що потрапляє в HTML)', '`{{ … }}`', 'Виводить значення в HTML'],
        ['Тег', '`{% … %}`', 'Керує логікою: умови, цикли, змінні. Сам в output не потрапляє'],
        ['Фільтр', '`значення | фільтр`', 'Перетворює значення перед тим, як воно потрапить в output'],
      ],
    },
    { type: 'h', text: 'Output: подвійні фігурні дужки' },
    {
      type: 'example',
      title: 'Шаблон + дані = HTML',
      template: '<h1>{{ product.title }}</h1>\n<p>Бренд: {{ product.vendor }}</p>',
      data: { product: shampoo },
      note: 'Усе поза дужками йде в output **як є**, символ у символ. `product.title` читається як у JS: обʼєкт `product`, властивість `title`. Зміни `title` у даних — шаблон лишиться тим самим, а HTML стане іншим. У цьому й сенс шаблону.',
    },
    { type: 'h', text: 'Теги: дужки з відсотками' },
    {
      type: 'example',
      title: 'Тег вирішує, що потрапить в output',
      template: '{% if product.available %}\n  <p>Є в наявності</p>\n{% else %}\n  <p>Немає в наявності</p>\n{% endif %}',
      data: { product: shampoo },
      note: 'Самих тегів в output немає — лишився тільки той `<p>`, що пройшов умову. Постав у даних `"available": false` і подивись, що зміниться.',
    },
    {
      type: 'p',
      text: 'Тег — це інструкція для рушія, а не текст. `{% if %}` вирішує, чи потрапить шматок верстки в output, `{% for %}` повторює його, `{% assign %}` створює змінну. Більшість тегів парні й закриваються словом `end…`: `if` → `endif`, `for` → `endfor`. Забудеш закрити — отримаєш синтаксичну помилку, а не дивний output.',
    },
    {
      type: 'note',
      tone: 'warn',
      title: 'Дужки в дужках не ставлять',
      text: 'Найчастіша помилка першого тижня — `{% if {{ product.available }} %}`. Усередині `{% %}` ти **вже** в Liquid, тому змінні пишуться без додаткових дужок: `{% if product.available %}`. Подвійні фігурні потрібні лише там, де значення треба **вивести** посеред HTML.',
    },
    { type: 'h', text: 'Фільтри: вертикальна риска' },
    {
      type: 'example',
      title: 'Один output — один фільтр',
      template:
        '{{ product.title | upcase }}\n{{ product.title | size }}\n{{ product.title | truncate: 12 }}\n{{ product.title | replace: "Шампунь", "Кондиціонер" }}',
      data: { product: shampoo },
      note: 'Параметри фільтра йдуть після **двокрапки**, кілька параметрів — через **кому**. Дужок, як у виклику функції, немає: не `truncate(12)`, а `truncate: 12`.',
    },
    {
      type: 'p',
      text: 'Фільтр — це функція, у яку значення «втікає» зліва: `{{ product.title | upcase }}` у JS було б `product.title.toUpperCase()`. Самі дані фільтр **не змінює** — `product.title` лишається яким був, інакше виглядає лише те, що виводиться в цьому місці. І зверни увагу, чого в Liquid немає: довільних виразів. `{{ product.price * 2 }}` не спрацює — в output може стояти лише значення та фільтри. Навіть множення — це фільтр.',
    },
    {
      type: 'example',
      title: 'Арифметика — теж фільтрами',
      template: 'Один флакон: {{ product.volume_ml }} мл\nДва флакони: {{ product.volume_ml | times: 2 }} мл',
      data: { product: shampoo },
    },
    { type: 'h', text: 'Ланцюжок фільтрів' },
    {
      type: 'example',
      title: 'Порядок має значення',
      template: '{{ "кератин" | append: " для волосся" | upcase }}\n{{ "кератин" | upcase | append: " для волосся" }}',
      note: 'Ті самі два фільтри, різний порядок — різний результат. У другому рядку `upcase` відпрацював **раніше**, ніж зʼявився хвіст, тож хвіст лишився малими.',
    },
    {
      type: 'p',
      text: 'Фільтри виконуються **зліва направо**, і кожен отримує результат попереднього. Це той самий принцип, що ланцюжок методів у JS (`str.trim().toUpperCase()`) або конвеєр у терміналі. Звідси практичне правило: коли ланцюжок дає не те, читай його по одному фільтру й питай себе, що саме зараз «тече по трубі» — string, число чи масив.',
    },
    { type: 'h', text: 'Усе разом' },
    {
      type: 'example',
      title: 'Мінікартка product',
      preset: 'product',
      view: 'html',
      template:
        '<article class="card">\n  <h2>{{ product.title }}</h2>\n  <p>{{ product.vendor | upcase }} · {{ product.price | money }}</p>\n  {% if product.available %}\n    <button>Купити</button>\n  {% else %}\n    <button disabled>Немає в наявності</button>\n  {% endif %}\n</article>',
      note: 'Реальний шматок теми — завжди суміш трьох конструкцій. Тут три output `{{ }}`, парний тег `if` із гілкою `else` і два фільтри. Ціна в Shopify зберігається **в копійках** (`64900` — це 649,00 ₴); людський вигляд їй дає фільтр `money`.',
    },
    {
      type: 'note',
      tone: 'shopify',
      text: 'У справжній темі даних ти не створюєш — їх підставляє Shopify залежно від сторінки: на сторінці product доступний однойменний обʼєкт `product`, на сторінці cart — `cart`, а `shop` і `settings` — усюди. Тут, у тренажері, цю роль грає панель із JSON-даними. Файли теми мають розширення `.liquid`, і кожен із них — це HTML упереміш з output, тегами й фільтрами. Чим пісочниця відрізняється від справжнього Shopify — на сторінці [про пісочницю](/docs/basics/sandbox).',
    },
    {
      type: 'note',
      tone: 'interview',
      title: 'На співбесіді',
      text: '«Що таке Liquid і з чого він складається?» Сильна відповідь: це **безпечна мова шаблонів**, яка виконується на сервері й збирає HTML із шаблону та даних. У ній три конструкції: **обʼєкти** (output `{{ }}`), **теги** (`{% %}`, логіка) і **фільтри** (`|`, перетворення). Слово «безпечна» тут ключове: шаблони редагують продавці й сторонні розробники, тому мова навмисно обмежена — з неї не дістатись ні до файлів, ні до бази, ні до довільного коду. Функцій і довільних виразів у Liquid немає не через недогляд — це дизайн.',
    },
  ],
  exercises: [
    {
      id: 'l01-e1',
      title: 'Перший output',
      task: [
        'Виведи назву product всередині заголовка `<h1>`, а під ним — абзац `<p>` із брендом.',
        'На видимих даних має вийти заголовок «Маска глибокого відновлення» й абзац «Inoar». Значення бери з обʼєкта `product`, а не вписуй руками: рішення перевіряється ще й на іншому product.',
      ],
      starter: '<h1>{% comment %} тут — назва товару {% endcomment %}</h1>\n<p>{% comment %} тут — бренд {% endcomment %}</p>',
      solution: '<h1>{{ product.title }}</h1>\n<p>{{ product.vendor }}</p>',
      data: { product: { title: 'Маска глибокого відновлення', vendor: 'Inoar' } },
      altData: { product: { title: 'Олійка для кінчиків', vendor: 'Erayba' } },
      hints: [
        'Значення виводять подвійні фігурні дужки: `{{ … }}`.',
        'До властивості обʼєкта дістаються через крапку: `product.title`, `product.vendor`.',
        'Перший рядок — `<h1>{{ product.title }}</h1>`. Другий зроби за тим самим зразком.',
      ],
      explain:
        'Шаблон не знає, який саме product йому дадуть, — він знає лише **форму** даних. Саме тому той самий файл `product.liquid` рендерить кожен product у магазині. Коментар `{% comment %}` в output не потрапляє, тож у робочій темі його можна лишати як нотатку для колег.',
    },
    {
      id: 'l01-e2',
      title: 'Два фільтри',
      task: [
        'Виведи два рядки. Перший — «Бренд: COCOCHOCO»: бренд product **великими літерами**. Другий — «Символів у назві: 20»: довжина назви product.',
        'У даних бренд записаний як `Cocochoco` — не переписуй дані, а перетвори значення фільтром.',
      ],
      starter: 'Бренд: {{ product.vendor }}\n{% comment %} 1) зроби бренд великими літерами  2) додай рядок із довжиною назви {% endcomment %}',
      solution: 'Бренд: {{ product.vendor | upcase }}\nСимволів у назві: {{ product.title | size }}',
      data: { product: { title: 'Шампунь із кератином', vendor: 'Cocochoco' } },
      altData: { product: { title: 'Термозахисний спрей', vendor: 'Erayba' } },
      mustUse: [{ pattern: '\\|\\s*upcase\\b', label: 'Використай фільтр `upcase`' }],
      hints: [
        'Фільтр ставиться після значення через вертикальну риску: `{{ значення | фільтр }}`.',
        'Великі літери — `upcase`, довжина string — `size`.',
        'Другий рядок: `Символів у назві: {{ product.title | size }}`.',
      ],
      explain:
        'Кожен `{{ }}` — окремий конвеєр: фільтр у першому output ніяк не впливає на другий. Довжину можна взяти й без фільтра — `{{ product.title.size }}`: про такі «властивості» string і масивів поговоримо в наступному уроці.',
    },
    {
      id: 'l01-e3',
      title: 'Ланцюжок у правильному порядку',
      task: [
        'Збери **одним output** `{{ … }}` текст «ШАМПУНЬ ІЗ КЕРАТИНОМ — новинка»: назва product великими літерами, далі ` — ` (пробіл, тире, пробіл) і текст бейджа зі змінної `badge`.',
        'Бейдж має лишитися **малими** літерами — отже, порядок фільтрів у ланцюжку важить.',
      ],
      starter: '{% comment %} один вивід: product.title → великі літери → хвіст « — » → badge {% endcomment %}\n{{ product.title }}',
      solution: '{{ product.title | upcase | append: " — " | append: badge }}',
      data: { product: { title: 'Шампунь із кератином' }, badge: 'новинка' },
      altData: { product: { title: 'Маска глибокого відновлення' }, badge: 'хіт продажів' },
      mustUse: [{ pattern: '\\|\\s*append\\b', label: 'Приклей хвіст фільтром `append`' }],
      mustNotUse: [{ pattern: '\\}\\}.*\\{\\{', label: 'Усе має бути одним output `{{ … }}`' }],
      hints: [
        'Фільтри виконуються зліва направо. Що має статись раніше: великі літери чи приклеювання бейджа?',
        '`append` приймає не лише string у лапках, а й змінну: `append: badge`.',
        'Спершу `upcase`, потім два `append`: один із `" — "`, другий зі змінною `badge`.',
      ],
      explain:
        'Якби `upcase` стояв останнім, він отримав би вже склеєний string і підняв би регістр усьому, разом із бейджем. Ланцюжок — це послідовність кроків, і кожен бачить лише результат попереднього. Параметром фільтра може бути змінна — так у темах клеять класи, адреси й підписи.',
    },
    {
      id: 'l01-e4',
      title: 'Мінікартка product',
      task: [
        'Збери картку product для сітки колекції. Усередині `<article class="card">` мають бути три речі, саме в такому порядку.',
        '**1.** Заголовок `<h2>` із назвою product великими літерами. **2.** Абзац `<p>` виду «Cocochoco · 649.00 ₴»: бренд, роздільник ` · ` і ціна через фільтр `money`. **3.** Якщо product є в наявності — `<span>В наявності</span>`, інакше — `<span>Немає в наявності</span>`.',
        'Дані — пресет сторінки product: `product.title`, `product.vendor`, `product.price` (у копійках), `product.available`. Прихована перевірка підставить інший product, якого немає в наявності.',
      ],
      starter:
        '<article class="card">\n  <h2>{{ product.title }}</h2>\n  {% comment %}\n    1. назву — великими літерами\n    2. абзац: бренд · ціна через money\n    3. if / else: «В наявності» або «Немає в наявності»\n  {% endcomment %}\n</article>',
      solution:
        '<article class="card">\n  <h2>{{ product.title | upcase }}</h2>\n  <p>{{ product.vendor }} · {{ product.price | money }}</p>\n  {% if product.available %}\n    <span>В наявності</span>\n  {% else %}\n    <span>Немає в наявності</span>\n  {% endif %}\n</article>',
      preset: 'product',
      altData: { product: { title: 'Термозахисний спрей', vendor: 'Erayba', price: 52000, available: false } },
      mustUse: [
        { pattern: '\\|\\s*money\\b', label: 'Ціну форматуй фільтром `money`' },
        { pattern: '\\{%-?\\s*if\\b', label: 'Наявність перевіряй тегом `if`' },
      ],
      view: 'html',
      hints: [
        'Тут усі три конструкції з уроку: output, фільтр і тег. Збирай по одній — після кожної дивись на результат.',
        'Роздільник ` · ` — звичайний текст між двома output: `{{ product.vendor }} · {{ … }}`.',
        'Наявність: `{% if product.available %}<span>В наявності</span>{% else %}<span>Немає в наявності</span>{% endif %}`.',
      ],
      explain:
        'Це вже справжній сніпет картки, лише без фото й посилання. Зверни увагу на `money`: він бере формат із налаштувань магазину (`shop.money_format`), тож та сама картка покаже гривні в одному магазині й долари в іншому. Ділити ціну на 100 руками — типова помилка новачка.',
    },
  ],
  quiz: [
    {
      id: 'l01-q1',
      q: 'Що виведе цей код?',
      template: '{{ "liquid" | upcase | append: "!" }}',
      options: ['liquid!', 'LIQUID!', 'LIQUID', 'Помилка: два фільтри в одному виводі не можна'],
      correct: 1,
      explain: 'Ланцюжок іде зліва направо: спершу `upcase` дає `LIQUID`, потім `append` клеїть знак оклику. Кількість фільтрів у ланцюжку не обмежена.',
    },
    {
      id: 'l01-q2',
      q: 'А цей? Зверни увагу, який фільтр останній.',
      template: '{{ "Маска" | append: " для волосся" | size }}',
      options: ['Маска для волосся', '5', '17', 'Маска для волосся17'],
      correct: 2,
      explain:
        'Останній фільтр визначає, що піде в output. `append` зібрав string «Маска для волосся», а `size` перетворив його на число — довжину. Сам string в output уже не потрапляє: по ланцюжку далі йде лише результат останнього кроку.',
    },
    {
      id: 'l01-q3',
      q: 'Де й коли виконується Liquid у магазині на Shopify?',
      options: [
        'У браузері покупця, після завантаження сторінки',
        'На сервері Shopify, до відправки сторінки — браузер отримує готовий HTML',
        'Один раз, коли тему публікують, — далі сторінки статичні',
        'У браузері, але лише в редакторі теми',
      ],
      correct: 1,
      explain:
        'Liquid — серверна мова шаблонів. Кожен запит сторінки рендериться на сервері з актуальними даними (ціна, залишок, cart), і браузер бачить лише HTML. Тому змінити щось «на льоту» після кліку Liquid не може — це робота JavaScript.',
    },
    {
      id: 'l01-q4',
      q: 'Що не так із записом `{% if {{ product.available }} %}`?',
      options: [
        'Нічого, це правильний запис',
        'Усередині тега не можна звертатись до властивостей обʼєкта',
        'Усередині `{% %}` змінні пишуться без `{{ }}` — правильно `{% if product.available %}`',
        'Після `if` потрібні круглі дужки: `{% if (product.available) %}`',
      ],
      correct: 2,
      explain:
        '`{{ }}` означає «виведи». Усередині тега нічого виводити не треба — там ти вже в Liquid, і імʼя змінної пишеться як є. Круглих дужок навколо умови в Liquid теж немає.',
    },
  ],
}

/* ═══════════════════════ УРОК 2 ═══════════════════════ */

const l02: Lesson = {
  id: 'l02',
  module: 1,
  title: 'Типи даних і доступ до них',
  goal: 'Дістаєш будь-яке значення з вкладених даних — крапкою, дужками чи індексом — і знаєш, що піде в output, коли значення немає.',
  minutes: 25,
  docs: ['basics/types', 'filters/first', 'filters/last', 'filters/size', 'filters/join', 'filters/split'],
  topics: ['types', 'objects'],
  blocks: [
    {
      type: 'p',
      text: 'Шаблон без даних — просто HTML. Тому друге, що треба вміти після трьох конструкцій, — **діставати значення**: з обʼєкта, з обʼєкта в обʼєкті, з масиву обʼєктів. Типів у Liquid небагато, і всі вони тобі знайомі з JSON.',
    },
    {
      type: 'table',
      head: ['Тип', 'Як записати', 'Де зустрінеш у магазині'],
      rows: [
        ['String', '`"Шампунь"` або `\'Шампунь\'`', '`product.title`, `product.handle`'],
        ['Число', '`42`, `5.5`', '`product.price`, `cart.item_count`'],
        ['Булеве', '`true`, `false`', '`product.available`'],
        ['`nil`', '`nil`', '`product.compare_at_price`, коли знижки немає'],
        ['Масив', 'літерала немає', '`product.tags`, `product.variants`'],
        ['Обʼєкт', 'літерала немає', '`product`, `cart`, `shop`'],
      ],
    },
    {
      type: 'example',
      title: 'Літерали',
      template: '{{ "рядок у подвійних" }} і {{ \'в одинарних\' }}\n{{ 42 }} і {{ 5.5 }}\n{{ true }} і {{ false }}\n[{{ nil }}]',
      note: 'Лапки — будь-які, різниці немає. `true` і `false` виводяться словами, а `nil` — порожнечею: між квадратними дужками в останньому рядку нічого немає.',
    },
    { type: 'h', text: 'Обʼєкти: крапка' },
    {
      type: 'example',
      title: 'Обʼєкт в обʼєкті',
      template: '{{ product.title }}\n{{ product.featured_image.alt }}\n{{ product.featured_image.width }}',
      data: { product: shampoo },
      note: 'Крапка працює як у JS і читається зліва направо: product → його головне фото → підпис фото. Глибина не обмежена.',
    },
    { type: 'h', text: 'Квадратні дужки: коли ключ — це значення' },
    {
      type: 'example',
      title: 'Три способи дістати властивість',
      template: '{{ specs["volume"] }}\n{{ specs["країна виробник"] }}\n{{ specs[field] }}',
      data: { specs: { volume: '250 мл', 'країна виробник': 'Бразилія', ph: 5.5 }, field: 'ph' },
      note: 'Третій рядок — головна причина існування дужок: ключ лежить **у змінній** `field`. Зміни її в даних на `"volume"` — і той самий шаблон дістане інше поле. Крапкою так не зробиш: `specs.field` шукало б властивість із буквальною назвою `field`.',
    },
    {
      type: 'p',
      text: 'Правило те саме, що в JS: крапка — коли імʼя властивості відоме наперед, дужки — коли ключ динамічний або містить пробіли чи інші незручні символи. У темах Shopify дужки найчастіше бачиш при зверненні за handle — `collections["home-care"]`, `linklists["main-menu"]` — і коли імʼя налаштування збирають на ходу: `section.settings[key]`.',
    },
    { type: 'h', text: 'Масиви' },
    {
      type: 'example',
      title: 'Індекс, перший, останній, розмір',
      template:
        'Перший: {{ product.tags.first }}\nОстанній: {{ product.tags.last }}\nУсього: {{ product.tags.size }}\nЗа індексом 1: {{ product.tags[1] }}\nЗ кінця: {{ product.tags[-1] }}',
      data: { product: shampoo },
      note: 'Індекси — з нуля, як у JS. А от `.first`, `.last` і `.size` — уже не JS: це вбудовані «властивості», які є в кожного масиву (`.size` — ще й у string). Відʼємний індекс рахує з кінця.',
    },
    {
      type: 'p',
      text: 'Чого немає — так це літерала масиву: `[1, 2, 3]` у Liquid написати не можна. Масиви або приходять із даних (`product.tags`, `collection.products`), або робляться зі string фільтром `split`: `{% assign sizes = "250 мл,400 мл" | split: "," %}`. Обʼєкт створити не можна взагалі — лише отримати від платформи. Тег `assign` розберемо в [уроці 4](/learn/l04).',
    },
    {
      type: 'example',
      title: 'Масив обʼєктів',
      template:
        '{{ product.variants.first.title }}\n{{ product.variants[1].title }} — {{ product.variants[1].price }}\nОстанній у наявності? {{ product.variants.last.available }}\nВаріантів: {{ product.variants.size }}',
      data: { product: shampoo },
      note: 'Елемент масиву — звичайний обʼєкт, тож після `.first` чи `[1]` ланцюжок із крапок просто триває далі.',
    },
    {
      type: 'example',
      title: 'Масив, виведений цілком',
      template: '{{ product.tags }}\n{{ product.tags | join: ", " }}',
      data: { product: shampoo },
      note: 'Масив «як є» склеюється **без роздільників**. Це не баг: Liquid просто не знає, який роздільник тобі потрібен. Скаже йому про це фільтр `join`.',
    },
    { type: 'h', text: 'nil: коли значення немає' },
    {
      type: 'example',
      title: 'Три звернення в нікуди',
      template: 'Підзаголовок: [{{ product.subtitle }}]\nГлибоко: [{{ product.brand.country.name }}]\nШостий тег: [{{ product.tags[5] }}]',
      data: { product: shampoo },
      note: 'Три звернення до того, чого не існує, — і жодної помилки. `nil` виводиться як порожній string, а крапка після `nil` знову дає `nil`.',
    },
    {
      type: 'note',
      tone: 'warn',
      title: 'Одруківка не дає помилки',
      text: 'У JS `product.brand.country` впало б із `TypeError`. Liquid поводиться так, ніби всюди стоїть `?.`. Для вітрини це правильно — краще порожнє місце, ніж зламана сторінка, — але ціна цього така: `{{ product.titel }}` просто **нічого не виведе**. Порожнє місце в output? Спершу перевір написання, потім — чи цей обʼєкт узагалі доступний на цій сторінці.',
    },
    {
      type: 'note',
      tone: 'shopify',
      text: 'У Shopify обʼєкти — не JSON, а так звані **drops**: властивості обчислюються в момент звернення. Назовні різниці майже немає, але виводити обʼєкт цілком марно — `{{ product }}` дасть службову назву на кшталт `ProductDrop`, а не вміст (тут, у пісочниці, — `[object Object]`). Хочеш побачити, що всередині, — `{{ product | json }}`.',
    },
    {
      type: 'note',
      tone: 'interview',
      title: 'На співбесіді',
      text: '«Які типи даних є в Liquid?» String, число, булеве, `nil`, масив — плюс обʼєкти, які дає платформа. Сильніше звучить, якщо додаси три деталі: масив **не можна створити літералом** (лише `split` або дані); звернення до неіснуючої властивості дає `nil` **без помилки**, і `nil` виводиться порожньо; для порожніх string і масивів є окремі перевірки `blank` та `empty` — про них [наступний урок](/learn/l03). Часте уточнення: «чим `product.title` відрізняється від `product["title"]`?» — нічим, але в дужки можна покласти змінну.',
    },
  ],
  exercises: [
    {
      id: 'l02-e1',
      title: 'Вкладена властивість',
      task: [
        'Виведи речення «Софія, доставка в місто Київ (Україна)».',
        'Імʼя лежить у `customer.first_name`, а місто й країна — на рівень глибше, в обʼєкті `customer.default_address` (поля `city` і `country`).',
      ],
      starter: '{{ customer.first_name }}, доставка в місто {% comment %} місто й країна — у customer.default_address {% endcomment %}',
      solution: '{{ customer.first_name }}, доставка в місто {{ customer.default_address.city }} ({{ customer.default_address.country }})',
      data: { customer: { first_name: 'Софія', default_address: { city: 'Київ', country: 'Україна', zip: '01001' } } },
      altData: { customer: { first_name: 'Марта', default_address: { city: 'Краків', country: 'Польща', zip: '30-001' } } },
      hints: [
        'Крапки можна ставити ланцюжком: обʼєкт → вкладений обʼєкт → властивість.',
        'Місто — це `customer.default_address.city`.',
        'Країну виведи так само, у круглих дужках: `({{ customer.default_address.country }})`.',
      ],
      explain:
        'У Shopify `customer.default_address` — окремий обʼєкт адреси з десятком полів, і звертаються до них саме так. Якщо у customer ще немає адреси, `default_address` буде `nil` — шаблон не впаде, а виведе порожні місця. Як таке перехопити умовою, побачиш в уроках 3 і 5.',
    },
    {
      id: 'l02-e2',
      title: 'Перший, останній і скільки всього',
      task: [
        'Виведи речення про теги product: «Тегів: 4. Перший — догляд, останній — безсульфатний.»',
        'Кількість, перший і останній елементи бери з масиву `product.tags`. У прихованій перевірці тегів буде інша кількість.',
      ],
      starter: 'Тегів: {% comment %} кількість {% endcomment %}. Перший — {% comment %} … {% endcomment %}, останній — {% comment %} … {% endcomment %}.',
      solution: 'Тегів: {{ product.tags.size }}. Перший — {{ product.tags.first }}, останній — {{ product.tags.last }}.',
      data: { product: { tags: ['догляд', 'кератин', 'хіт', 'безсульфатний'] } },
      altData: { product: { tags: ['стайлінг', 'термозахист'] } },
      hints: [
        'У кожного масиву є три вбудовані «властивості» — згадай приклад із тегами в теорії.',
        '`.size` — кількість, `.first` — перший елемент, `.last` — останній.',
        'Початок: `Тегів: {{ product.tags.size }}. Перший — {{ product.tags.first }}, …`',
      ],
      explain:
        '`product.tags[0]` і `product.tags[-1]` дали б той самий результат, але `.first` і `.last` читаються краще й не змушують рахувати. А от `product.tags[3]` було б помилкою в логіці: у product з двома тегами четвертого елемента немає, і на сторінці зʼявилось би порожнє місце.',
    },
    {
      id: 'l02-e3',
      title: 'Ключ зі змінної',
      task: [
        'Виведи два рядки з обʼєкта характеристик `specs`.',
        'Перший — «Термін придатності: 24 місяці»: значення лежить під ключем `термін придатності` (із пробілом, тож крапкою до нього не дістатись).',
        'Другий — назва й значення тієї характеристики, імʼя якої записане у змінній `show`. На видимих даних це «country: Бразилія»; у прихованій перевірці `show` буде іншим.',
      ],
      starter: 'Термін придатності: {% comment %} specs, ключ із пробілом {% endcomment %}\n{{ show }}: {% comment %} значення з specs за ключем зі змінної show {% endcomment %}',
      solution: 'Термін придатності: {{ specs["термін придатності"] }}\n{{ show }}: {{ specs[show] }}',
      data: { specs: { 'термін придатності': '24 місяці', volume: '250 мл', country: 'Бразилія' }, show: 'country' },
      altData: { specs: { 'термін придатності': '12 місяців', volume: '400 мл', country: 'Іспанія' }, show: 'volume' },
      mustUse: [{ pattern: '\\[\\s*show\\s*\\]', label: 'Ключ бери зі змінної: `specs[show]`' }],
      hints: [
        'Квадратні дужки приймають або string у лапках, або змінну без лапок.',
        'Ключ із пробілом: `specs["термін придатності"]`.',
        'Динамічний ключ: `{{ specs[show] }}` — без лапок, бо `show` це змінна, а не текст.',
      ],
      explain:
        'Різниця між `specs["show"]` і `specs[show]` — та сама, що в JS між `obj["show"]` і `obj[show]`: у першому випадку шукаємо властивість із назвою «show», у другому — з назвою, яка лежить у змінній. У темах цей прийом живе в settings секцій і в metafield, де імʼя поля збирається на ходу.',
    },
    {
      id: 'l02-e4',
      title: 'Блок інформації про product',
      task: [
        'Збери блок `<div class="product-meta">` для сторінки product. Усередині, по порядку:',
        '**1.** `<img>` з атрибутами `src` і `alt` із головного фото product (`product.featured_image`). **2.** `<h2>` із назвою. **3.** Абзац «Фасування: від 250 мл до 1000 мл (варіантів: 3)» — назви першого й останнього варіантів і їхня кількість. **4.** Абзац «Теги: догляд, кератин, хіт» — теги через кому з пробілом.',
        'Розмітку заготовки не міняй — заповни порожні місця.',
      ],
      starter:
        '<div class="product-meta">\n  <img src="" alt="">\n  <h2>{{ product.title }}</h2>\n  <p>Фасування: від … до … (варіантів: …)</p>\n  <p>Теги: {% comment %} через кому з пробілом {% endcomment %}</p>\n</div>',
      solution:
        '<div class="product-meta">\n  <img src="{{ product.featured_image.src }}" alt="{{ product.featured_image.alt }}">\n  <h2>{{ product.title }}</h2>\n  <p>Фасування: від {{ product.variants.first.title }} до {{ product.variants.last.title }} (варіантів: {{ product.variants.size }})</p>\n  <p>Теги: {{ product.tags | join: ", " }}</p>\n</div>',
      data: { product: shampoo },
      altData: {
        product: {
          title: 'Маска глибокого відновлення',
          tags: ['догляд', 'відновлення'],
          featured_image: { src: '/files/deep-repair-mask.jpg', alt: 'Банка маски', width: 1200 },
          variants: [
            { title: '200 мл', price: 84900, available: true },
            { title: '500 мл', price: 149900, available: true },
          ],
        },
      },
      hints: [
        'Output `{{ }}` можна ставити просто всередині атрибута: `alt="{{ … }}"`.',
        'Перший варіант — `product.variants.first`, і це обʼєкт: його назва — `product.variants.first.title`.',
        'Теги: `{{ product.tags | join: ", " }}`. Без `join` масив склеїться без роздільників.',
      ],
      explain:
        'Тут зійшлось усе з уроку: вкладений обʼєкт (`featured_image.src`), масив обʼєктів (`variants.first.title`), розмір масиву й масив, виведений через `join`. У справжній темі `src` збирають фільтром `image_url`, щоб віддати картинку потрібної ширини, — до нього дійдемо в уроці 16.',
    },
  ],
  quiz: [
    {
      id: 'l02-q1',
      q: 'У product немає властивості `subtitle`. Що виведе шаблон?',
      template: '[{{ product.subtitle }}]',
      data: { product: { title: 'Шампунь із кератином' } },
      options: ['[nil]', '[undefined]', '[]', 'Помилка: властивості не існує'],
      correct: 2,
      explain: 'Неіснуюча властивість — це `nil`, а `nil` виводиться як порожній string. Помилки немає, і в цьому головна пастка: одруківка в імені властивості виглядає так само.',
    },
    {
      id: 'l02-q2',
      q: 'Що виведе цей код?',
      template: '{{ product.tags[1] }}',
      data: { product: { tags: ['догляд', 'кератин', 'хіт'] } },
      options: ['догляд', 'кератин', 'хіт', 'Помилка: до масиву звертаються лише через `.first` і `.last`'],
      correct: 1,
      explain: 'Індекси починаються з нуля, тож `[1]` — другий елемент. `.first` і `.last` — зручні скорочення для `[0]` та `[-1]`, а не єдиний спосіб.',
    },
    {
      id: 'l02-q3',
      q: 'Масив вивели цілком, без фільтрів. Що вийде?',
      template: '{{ product.tags }}',
      data: { product: { tags: ['хіт', 'новинка'] } },
      options: ['хіт, новинка', '["хіт","новинка"]', 'хіт новинка', 'хітновинка'],
      correct: 3,
      explain: 'Liquid склеює елементи масиву без жодного роздільника. Щоб отримати «хіт, новинка», потрібен `join: ", "`; щоб побачити JSON — фільтр `json`.',
    },
    {
      id: 'l02-q4',
      q: 'Як у Liquid створити масив із трьох розмірів, якщо в даних його немає?',
      options: [
        'Літералом: `{% assign sizes = ["S", "M", "L"] %}`',
        'Тегом `{% array sizes %}`',
        'Розбити рядок фільтром `split`: `{% assign sizes = "S,M,L" | split: "," %}`',
        'Ніяк — масиви бувають лише в даних магазину',
      ],
      correct: 2,
      explain: 'Літерала масиву в Liquid немає. Єдиний спосіб зробити масив самому — розбити string фільтром `split`. Це класичне питання співбесіди.',
    },
  ],
}

/* ═══════════════════════ УРОК 3 ═══════════════════════ */

const l03Data = {
  product: { title: 'Шампунь із кератином', vendor: 'Cocochoco', price: 64900, available: false, tags: ['догляд', 'кератин', 'хіт'], description: '' },
  customer: { first_name: 'Софія', tags: ['vip'] },
}

const l03: Lesson = {
  id: 'l03',
  module: 1,
  title: 'Оператори, truthy і falsy',
  goal: 'Пишеш умови, які спрацьовують саме тоді, коли треба: знаєш порядок `and`/`or`, що Liquid вважає правдою і як перевірити «порожньо».',
  minutes: 25,
  docs: ['basics/operators', 'basics/truthy-and-falsy', 'tags/control-flow'],
  topics: ['operators', 'types'],
  blocks: [
    {
      type: 'p',
      text: 'Оператори в Liquid живуть лише всередині тегів — `if`, `unless`, `elsif`, `case`. В output їм не місце: `{{ a > b }}` — не спосіб щось порівняти. У цьому уроці всі приклади стоять на найпростішому `{% if %}…{% endif %}`; сам тег з усіма гілками розберемо в [уроці 5](/learn/l05), а зараз важливо одне — **що саме** можна написати в умові.',
    },
    {
      type: 'table',
      head: ['Оператор', 'Значення', 'Приклад'],
      rows: [
        ['`==`', 'дорівнює', '`product.vendor == "Inoar"`'],
        ['`!=`', 'не дорівнює', '`product.type != "Спрей"`'],
        ['`>` `<` `>=` `<=`', 'порівняння', '`cart.item_count >= 3`'],
        ['`contains`', 'містить підрядок або елемент', '`product.tags contains "хіт"`'],
        ['`and`', 'обидві умови', '`product.available and product.price < 50000`'],
        ['`or`', 'хоча б одна', '`customer.tags contains "vip" or cart.item_count > 5`'],
      ],
    },
    {
      type: 'example',
      title: 'Порівняння',
      template:
        '{% if product.price > 50000 %}Дорожче за 500 ₴{% endif %}\n{% if product.vendor == "Cocochoco" %}Це Cocochoco{% endif %}\n{% if product.vendor != "Inoar" %}Точно не Inoar{% endif %}',
      data: l03Data,
      note: 'Ціна в копійках, тому 500 ₴ — це `50000`. Знаків `===`, `!`, `&&`, `||` у Liquid немає: одне `==` і слова `and` / `or`.',
    },
    {
      type: 'example',
      title: '== не приводить типи',
      template: '{% if "5" == 5 %}рівні{% else %}різні{% endif %}\n{% if 5 == 5.0 %}рівні{% else %}різні{% endif %}',
      note: 'String `"5"` і число `5` — різні значення. Тобто `==` у Liquid ближчий до `===` із JS. Реальний випадок: число, що приїхало з текстового поля чи з `capture`, — це string, і порівняння з числом тихо дасть `false`.',
    },
    { type: 'h', text: 'contains' },
    {
      type: 'example',
      title: 'Елемент у масиві, підрядок у string',
      template:
        '{% if product.tags contains "хіт" %}Хіт продажів{% endif %}\n{% if product.title contains "кератин" %}У назві є «кератин»{% endif %}\n{% if product.title contains "Кератин" %}…{% else %}А з великої літери — вже ні{% endif %}',
      data: l03Data,
      note: '`contains` — це `includes` із JS: працює і на string, і на масиві, і так само чутливий до регістру. Обмеження: шукає лише **string**. Знайти обʼєкт у масиві обʼєктів (варіант у `product.variants`) ним не вийде.',
    },
    { type: 'h', text: 'and / or: справа наліво і без дужок' },
    {
      type: 'example',
      title: 'Умова, яку JS-розробник прочитає неправильно',
      template:
        '{% if product.available and product.price > 100000 or customer.tags contains "vip" %}\n  Безкоштовна доставка\n{% else %}\n  Доставка за тарифами перевізника\n{% endif %}',
      data: l03Data,
      note: '`product.available` тут `false`, а customer — VIP. У JS це було б `(available && expensive) || vip` → `true`. Liquid каже «за тарифами»: він прочитав умову як `available and (expensive or vip)`.',
    },
    {
      type: 'p',
      text: 'У JS `&&` сильніший за `||`. У Liquid **пріоритетів немає взагалі**: ланцюжок `and` / `or` обчислюється **справа наліво**. Зручно уявляти невидимі дужки, які відкриваються після кожного оператора й закриваються в кінці: `a and b or c` — це `a and (b or c)`, а `a or b and c` — це `a or (b and c)`. Справжніх дужок при цьому поставити **не можна** — Liquid їх в умовах не розуміє.',
    },
    {
      type: 'example',
      title: 'Дужок немає — але є порядок',
      template:
        '{% if customer.tags contains "vip" or product.available and product.price > 100000 %}\n  Безкоштовна доставка\n{% else %}\n  Доставка за тарифами перевізника\n{% endif %}',
      data: l03Data,
      note: 'Ті самі три умови, але VIP-перевірка переїхала на початок. Невидимі дужки тепер стоять так: `vip or (available and expensive)` — саме те, що задумано. Перестановка — найдешевший спосіб «поставити дужки».',
    },
    {
      type: 'code',
      lang: 'liquid',
      title: 'Коли перестановка не рятує — вкладений if',
      code: '{% comment %} потрібно: (a or b) and (c or d) {% endcomment %}\n{% if a or b %}\n  {% if c or d %}\n    …\n  {% endif %}\n{% endif %}',
    },
    { type: 'h', text: 'Truthy і falsy' },
    {
      type: 'example',
      title: 'Що Liquid вважає правдою',
      template:
        '{% if 0 %}0 — truthy{% endif %}\n{% if "" %}порожній рядок — truthy{% endif %}\n{% if empty_list %}порожній масив — truthy{% endif %}\n{% if "false" %}рядок "false" — truthy{% endif %}\n{% if missing %}…{% else %}nil — falsy{% endif %}\n{% if product.available %}…{% else %}false — falsy{% endif %}',
      data: { ...l03Data, empty_list: [] },
      note: 'Falsy в Liquid — **лише `nil` і `false`**. Усе інше — truthy, включно з нулем і порожнім string.',
    },
    {
      type: 'table',
      head: ['Значення', 'JavaScript', 'Liquid'],
      rows: [
        ['`false`', 'falsy', 'falsy'],
        ['`nil` / `null`, `undefined`', 'falsy', 'falsy'],
        ['`0`', 'falsy', '**truthy**'],
        ['`""`', 'falsy', '**truthy**'],
        ['`[]`', 'truthy', 'truthy'],
        ['`"false"`', 'truthy', 'truthy'],
      ],
    },
    {
      type: 'note',
      tone: 'warn',
      title: 'if не перевіряє «чи не порожньо»',
      text: '`{% if product.description %}` — звичка з JS, яка в Liquid не працює: порожній string — truthy, тож умова пройде й на сторінці зʼявиться порожній блок із відступами. Те саме з `{% if cart.item_count %}` — нуль теж truthy. `if` без оператора відповідає лише на питання «значення **існує** і воно не `false`?».',
    },
    { type: 'h', text: 'blank і empty' },
    {
      type: 'example',
      title: 'Дві перевірки на порожнечу',
      template:
        '{% if product.description == blank %}опис: blank{% endif %}\n{% if product.description == empty %}опис: empty{% endif %}\n{% if spaces == blank %}самі пробіли: blank{% endif %}\n{% if spaces == empty %}…{% else %}самі пробіли: не empty{% endif %}\n{% if missing == blank %}nil: blank{% endif %}\n{% if missing == empty %}…{% else %}nil: не empty{% endif %}',
      data: { ...l03Data, spaces: '   ' },
      note: '`empty` — це буквально «порожній string або порожній масив». `blank` ширший: сюди ж потрапляють `nil` і string із самих пробілів.',
    },
    {
      type: 'p',
      text: 'Практичне правило: у темах майже завжди пишуть `{% if щось != blank %}`. Воно закриває всі три неприємні випадки одразу — значення немає, значення порожнє, у значенні випадковий пробіл. `empty` лишається для вузьких місць, де треба відрізнити «порожньо» від «не існує».',
    },
    {
      type: 'note',
      tone: 'shopify',
      text: 'У темах ці перевірки всюди. `{% if customer %}` — чи customer увійшов (інакше `customer` — `nil`). `{% if section.settings.heading != blank %}` — чи заповнили заголовок у редакторі теми. `{% if product.compare_at_price > product.price %}` — чи є знижка: коли `compare_at_price` порожній, порівняння з `nil` просто дає `false`, без помилки.',
    },
    {
      type: 'note',
      tone: 'interview',
      title: 'На співбесіді',
      text: 'Два улюблені питання. **«Які значення falsy в Liquid?»** — лише `nil` і `false`; нуль, порожній string і порожній масив — truthy, тому «не порожньо» перевіряють через `!= blank`. **«Як обчислиться `a and b or c`?»** — справа наліво, без пріоритетів: як `a and (b or c)`; дужок в умовах немає, тому складну логіку або переставляють, або розкладають на вкладені `if` чи змінну-прапорець. Якщо додаси, що `==` не приводить типи і `"5" == 5` — це `false`, відповідь звучатиме як досвід, а не як переказ документації.',
    },
  ],
  exercises: [
    {
      id: 'l03-e1',
      title: 'Поріг безкоштовної доставки',
      task: [
        'Якщо сума cart (`cart.total_price`) **не менша** за 100000 копійок (1000 ₴), виведи «Безкоштовна доставка». Інакше — «До безкоштовної доставки ще трохи».',
        'На видимих даних сума рівно 100000 — доставка вже безкоштовна.',
      ],
      starter: '{% comment %} порівняй cart.total_price із порогом 100000 {% endcomment %}\n{% if cart.total_price %}\n  Безкоштовна доставка\n{% endif %}',
      solution: '{% if cart.total_price >= 100000 %}\n  Безкоштовна доставка\n{% else %}\n  До безкоштовної доставки ще трохи\n{% endif %}',
      data: { cart: { total_price: 100000, item_count: 2 } },
      altData: { cart: { total_price: 45000, item_count: 1 } },
      hints: [
        '«Не менша» — це «більша або дорівнює».',
        'Оператор `>=`. Із `>` сума рівно 100000 не пройде.',
        '`{% if cart.total_price >= 100000 %}…{% else %}…{% endif %}`',
      ],
      explain:
        'Заготовка з голим `{% if cart.total_price %}` показувала б безкоштовну доставку завжди: будь-яке число — truthy, навіть нуль. А межа `>=` проти `>` — класичне місце для помилки на одиницю: покупець із рівно 1000 ₴ у кошику не має бачити «ще трохи».',
    },
    {
      id: 'l03-e2',
      title: 'contains: масив і string',
      task: [
        'Виведи два рядки. Перший: якщо серед тегів product є `хіт` — «Хіт продажів», інакше — «Звичайний товар». Другий: якщо в назві product є слово `безсульфатний` — «Без сульфатів», інакше — «Склад — на упаковці».',
        'На видимих даних має вийти «Хіт продажів» і «Склад — на упаковці».',
      ],
      starter: '{% comment %} рядок 1: product.tags містить "хіт"? {% endcomment %}\n\n{% comment %} рядок 2: product.title містить "безсульфатний"? {% endcomment %}',
      solution:
        '{% if product.tags contains "хіт" %}Хіт продажів{% else %}Звичайний товар{% endif %}\n{% if product.title contains "безсульфатний" %}Без сульфатів{% else %}Склад — на упаковці{% endif %}',
      data: { product: { title: 'Маска відновлювальна', tags: ['догляд', 'хіт'] } },
      altData: { product: { title: 'Шампунь безсульфатний', tags: ['догляд'] } },
      mustUse: [{ pattern: '\\bcontains\\b', label: 'Використай оператор `contains`' }],
      hints: [
        'Один оператор підходить для обох перевірок — і для масиву, і для string.',
        '`{% if product.tags contains "хіт" %}…{% else %}…{% endif %}`',
        'Другий рядок такий самий, тільки зліва від `contains` стоїть `product.title`.',
      ],
      explain:
        'На масиві `contains` шукає **елемент цілком**: тег `хіти` або `суперхіт` не зарахується. На string — **підрядок**: `безсульфатний` знайдеться і всередині довшої назви. Ця різниця важить, коли теги використовують як прапорці — а в темах Shopify так роблять постійно.',
    },
    {
      id: 'l03-e3',
      title: 'Порожній опис',
      task: [
        'Якщо в product є опис — виведи його в `<div class="desc">…</div>`. Якщо опису немає — виведи `<p class="desc desc--empty">Опис готується</p>`.',
        'Увага на видимі дані: опис там є, але це **порожній string**. Порожнього `<div>` на сторінці бути не повинно.',
      ],
      starter: '{% comment %} зараз порожній опис проходить умову — виправ її {% endcomment %}\n{% if product.description %}\n  <div class="desc">{{ product.description }}</div>\n{% else %}\n  <p class="desc desc--empty">Опис готується</p>\n{% endif %}',
      solution: '{% if product.description != blank %}\n  <div class="desc">{{ product.description }}</div>\n{% else %}\n  <p class="desc desc--empty">Опис готується</p>\n{% endif %}',
      data: { product: { title: 'Кондиціонер щоденний', description: '' } },
      altData: { product: { title: 'Шампунь із кератином', description: 'Мʼякий шампунь для волосся після реконструкції.' } },
      hints: [
        'Порожній string у Liquid — truthy. Голий `if` його не відсіє.',
        'Є спеціальне слово, з яким порівнюють «порожнє»: `blank`.',
        '`{% if product.description != blank %}`',
      ],
      explain:
        'Це найпоширеніший баг у темах від JS-розробників: порожній блок із відступами й рамкою там, де «ж стоїть if». `!= blank` відсіює і `nil`, і порожній string, і string із пробілів. Спрацювало б і `!= ""`, і `!= empty` — але вони пропустять опис із самих пробілів.',
    },
    {
      id: 'l03-e4',
      title: 'Плашка доставки на сторінці product',
      task: [
        'Маркетинг просить плашку на сторінці product. «Безкоштовна доставка» показується, коли product **є в наявності** і при цьому виконується **хоча б одне**: ціна не менша за 100000 копійок **або** серед тегів customer є `vip`. В усіх інших випадках — «Доставка за тарифами перевізника».',
        'Текст загорни в `<p class="shipping-note">…</p>`. Умову запиши **одним** `if` — дужок у Liquid немає, тож подумай про порядок.',
        'На видимих даних product немає в наявності (хоч customer і VIP, а ціна висока), тож має вийти «Доставка за тарифами перевізника».',
      ],
      starter:
        '<p class="shipping-note">\n  {% comment %}\n    available І (ціна >= 100000 АБО клієнтка vip)\n    Памʼятай: and / or обчислюються справа наліво.\n  {% endcomment %}\n</p>',
      solution:
        '<p class="shipping-note">\n  {% if product.available and product.price >= 100000 or customer.tags contains "vip" %}\n    Безкоштовна доставка\n  {% else %}\n    Доставка за тарифами перевізника\n  {% endif %}\n</p>',
      data: { product: { title: 'Набір для реконструкції', price: 120000, available: false }, customer: { first_name: 'Софія', tags: ['vip'] } },
      altData: { product: { title: 'Набір для реконструкції', price: 120000, available: true }, customer: { first_name: 'Марта', tags: ['новачок'] } },
      mustUse: [
        { pattern: '\\bcontains\\b', label: 'Перевір тег customer через `contains`' },
        { pattern: '\\bor\\b', label: 'Обʼєднай дві «або»-умови оператором `or`' },
      ],
      hints: [
        'Розстав невидимі дужки: `a and b or c` Liquid читає як `a and (b or c)`.',
        'Тобі потрібно саме `available and (дорогий or vip)` — отже, `product.available` має стояти **першим**.',
        '`{% if product.available and product.price >= 100000 or customer.tags contains "vip" %}`',
      ],
      explain:
        'Якби ти почав із VIP — `vip or price and available` — Liquid прочитав би це як `vip or (price and available)`, і VIP-customer побачив би безкоштовну доставку для product, якого немає в наявності. Саме це ловлять видимі дані. У JS той самий запис без дужок означав би інше — тому на ревʼю таку умову варто супроводити коментарем про порядок.',
    },
  ],
  quiz: [
    {
      id: 'l03-q1',
      q: 'Що виведе цей код?',
      template: '{% if 0 %}так{% else %}ні{% endif %}',
      options: ['так', 'ні', 'Помилка: в умові має бути порівняння', '0'],
      correct: 0,
      explain: 'Нуль у Liquid — truthy. Falsy лише `nil` і `false`. Тому «чи cart не порожній» перевіряють як `cart.item_count > 0`, а не голим `if cart.item_count`.',
    },
    {
      id: 'l03-q2',
      q: 'А цей? Порахуй спершу «по-джаваскриптовому», потім — як Liquid.',
      template: '{% if false and false or true %}A{% else %}B{% endif %}',
      options: ['A', 'B', 'AB', 'Помилка: `and` і `or` не можна змішувати без дужок'],
      correct: 1,
      explain: 'Liquid обчислює справа наліво: `false and (false or true)` → `false and true` → `false`, тож виводиться `B`. У JS `(false && false) || true` дало б `true`. Змішувати оператори можна, але порядок — не той, до якого ти звик.',
    },
    {
      id: 'l03-q3',
      q: 'У змінній `s` — порожній string. Які цифри виведуться?',
      template: '{% if s %}1{% endif %}{% if s == blank %}2{% endif %}{% if s == empty %}3{% endif %}',
      data: { s: '' },
      options: ['23', '2', '123', '1'],
      correct: 2,
      explain: 'Порожній string — truthy (цифра 1), він `blank` (2) і він `empty` (3). Усі три умови правдиві одночасно — саме тому голий `if` не годиться для перевірки «чи заповнено».',
    },
    {
      id: 'l03-q4',
      q: 'Які значення в Liquid є falsy?',
      options: ['`nil`, `false`, `0` і порожній рядок — як у JavaScript', 'Лише `false`', 'Лише `nil` і `false`', '`nil`, `false` і порожній масив'],
      correct: 2,
      explain: 'Тільки `nil` і `false`. Це наслідок Ruby-походження мови: у Ruby нуль і порожній string теж truthy.',
    },
  ],
}

/* ═══════════════════════ УРОК 4 ═══════════════════════ */

/** У цьому уроці ціни в ГРИВНЯХ — щоб арифметику було видно без `money`. */
const l04Data = {
  product: {
    title: 'Шампунь із кератином',
    vendor: 'Cocochoco',
    price: 649,
    compare_at_price: 799,
    variants: [
      { title: '250 мл', price: 649 },
      { title: '400 мл', price: 899 },
    ],
  },
}

const l04: Lesson = {
  id: 'l04',
  module: 2,
  title: 'Змінні: assign, capture, increment, decrement',
  goal: 'Створюєш змінні чотирма тегами й не плутаєш їх: який дає string, який число, який сам виводить значення в output — і чому `increment` живе окремо від `assign`.',
  minutes: 25,
  docs: ['tags/variable', 'filters/plus', 'filters/minus', 'filters/times', 'filters/append'],
  topics: ['variables'],
  blocks: [
    {
      type: 'p',
      text: 'Змінні в шаблоні потрібні для трьох речей: дати коротке імʼя довгому шляху (`product.selected_or_first_available_variant` щоразу писати ніхто не хоче), **порахувати один раз — використати тричі**, і зібрати шматок тексту чи HTML про запас. Тегів для цього чотири, і поводяться вони по-різному. У прикладах цього уроку ціни в гривнях, а не в копійках, — щоб арифметику було видно без фільтра `money`.',
    },
    { type: 'h', text: 'assign' },
    {
      type: 'example',
      title: 'Значення, шлях або результат ланцюжка',
      template:
        '{% assign title = product.title | upcase %}\n{% assign first_variant = product.variants.first %}\n<h2>{{ title }}</h2>\n<p>{{ first_variant.title }} — {{ first_variant.price }} грн</p>',
      data: l04Data,
      note: 'Праворуч від `=` може стояти літерал, шлях до значення або цілий ланцюжок фільтрів. Сам тег **нічого не виводить**. Тип зберігається: у `first_variant` лежить обʼєкт, і крапка на ньому працює далі.',
    },
    {
      type: 'p',
      text: 'Найближче з JS — `let`: змінну можна перезаписати наступним `assign`, а `const` у Liquid немає. Оголошувати наперед теж не треба — `assign` і створює, і змінює. Імена пиши в `snake_case`, як заведено в темах.',
    },
    {
      type: 'example',
      title: 'Арифметика і «n = n + 1»',
      template:
        '{% assign qty = 3 %}\n{% assign total = product.price | times: qty %}\nРазом: {{ total }} грн\n{% assign qty = qty | plus: 1 %}\nСтало штук: {{ qty }}',
      data: l04Data,
      note: 'Операторів `+`, `*`, `++` немає — лише фільтри `plus`, `minus`, `times`, `divided_by`. Тому звичне `n = n + 1` виглядає як `{% assign n = n | plus: 1 %}`.',
    },
    {
      type: 'note',
      tone: 'warn',
      title: 'assign не вміє ні виразів, ні порівнянь',
      text: '`{% assign total = price * 2 %}` — не працює: справа дозволені лише значення й фільтри. Підступніше з порівняннями: `{% assign on_sale = product.compare_at_price > product.price %}` у Shopify **не обчислить** умову й не покладе в змінну `true` чи `false`. Пісочниця тут поблажливіша за справжній Liquid, тож не звикай. Булевий прапорець збирають через `if` — як у наступному прикладі. І ще одне: `assign` мовчки **перекриває обʼєкти Shopify** — після `{% assign product = "…" %}` справжнього `product` у цьому файлі вже не дістати.',
    },
    {
      type: 'example',
      title: 'Прапорець через if',
      template:
        '{% assign on_sale = false %}\n{% if product.compare_at_price > product.price %}\n  {% assign on_sale = true %}\n{% endif %}\n{% if on_sale %}Знижка діє{% else %}Звичайна ціна{% endif %}',
      data: l04Data,
      note: 'Спершу значення за замовчуванням, потім `if`, який його перевизначає. Це ж і заміна тернарного оператора, якого в Liquid немає.',
    },
    { type: 'h', text: 'capture' },
    {
      type: 'example',
      title: 'Зібрати string один раз — вставити двічі',
      template:
        '{% capture full_title %}{{ product.title }} — {{ product.vendor }}{% endcapture %}\n<img src="photo.jpg" alt="{{ full_title }}">\n<h2>{{ full_title }}</h2>',
      data: l04Data,
      note: '`capture` — парний тег: усе, що **вивелось би** між `capture` і `endcapture`, потрапляє не в output, а в змінну. Усередині працює будь-який Liquid — `{{ }}`, умови, цикли. Аналогія — template literal у JS.',
    },
    {
      type: 'example',
      title: 'capture — це завжди string',
      template:
        '{% capture n %}5{% endcapture %}\n{% if n == 5 %}число{% else %}рядок{% endif %}\n{% assign real = n | plus: 0 %}\n{% if real == 5 %}після plus: 0 — число{% endif %}',
      note: 'Навіть якщо всередині самі цифри, результат — string `"5"`, а `"5" == 5` у Liquid — `false` (згадай [урок 3](/learn/l03)). Математичний фільтр перетворює string на число: `plus: 0` — звичний прийом.',
    },
    {
      type: 'note',
      tone: 'tip',
      title: 'assign чи capture?',
      text: 'Короткий string із двох-трьох частин простіше склеїти через `assign` з `append`. `capture` виграє, коли всередині є розмітка, умова чи цикл. Але памʼятай: `capture` забирає **все**, разом із переносами рядків і відступами між тегами. Якщо значення піде в атрибут чи URL, пиши вміст в один рядок або пропусти результат через `strip`.',
    },
    { type: 'h', text: 'increment і decrement' },
    {
      type: 'example',
      title: 'Лічильники, які самі себе виводять',
      template:
        '<li id="step-{% increment step %}">Шампунь</li>\n<li id="step-{% increment step %}">Маска</li>\n<li id="step-{% increment step %}">Олійка</li>\nЗворотний відлік: {% decrement left %} {% decrement left %}',
      note: 'На відміну від `assign`, ці теги **виводять** значення просто там, де стоять. `increment` починає з `0` — спершу виводить, потім збільшує. `decrement` спершу зменшує, тож перше значення — `-1`.',
    },
    {
      type: 'example',
      title: 'Окремий простір імен',
      template: '{% assign counter = 10 %}\n{% increment counter %} {% increment counter %}\nassign-змінна: {{ counter }}',
      note: 'Дві змінні з однаковим іменем `counter` живуть паралельно й не знають одна про одну. `increment` рахує своє (0, 1…), а `{{ counter }}` показує те, що поклав `assign`.',
    },
    {
      type: 'p',
      text: 'Уяви дві полиці. На одній — усе, що створили `assign` і `capture`. На другій — лічильники `increment` / `decrement` (ці двоє якраз ділять одну полицю: `increment x` і `decrement x` крутять той самий лічильник). Output `{{ x }}` спершу дивиться на першу полицю. Звідси практичний висновок: `increment` — не заміна `n = n + 1`. Він виводить число в HTML, хочеш ти того чи ні, і його не можна ні обнулити, ні задати початкове значення. Для обчислень бери `assign` із `plus`; `increment` лишай для унікальних `id` та номерів у розмітці.',
    },
    {
      type: 'table',
      head: ['Тег', 'Що кладе у змінну', 'Виводить щось?', 'Тип'],
      rows: [
        ['`assign`', 'значення або результат фільтрів', 'ні', 'будь-який — як у значення'],
        ['`capture`', 'усе, що відрендерилось усередині', 'ні', 'завжди string'],
        ['`increment`', 'лічильник від 0, крок +1', '**так**', 'число, окремий простір імен'],
        ['`decrement`', 'лічильник від −1, крок −1', '**так**', 'число, той самий простір, що в `increment`'],
      ],
    },
    {
      type: 'note',
      tone: 'shopify',
      text: 'Змінна живе в межах файлу, де її створено: `assign` у секції не видно ні в іншій секції, ні в layout — кожна секція рендериться окремо. Сніпет, підключений через `render`, теж має власний scope (простір, у якому змінну видно): зовнішніх змінних не бачить, доки не передаси їх параметрами (докладно — в уроці 13). Тому «порахую раз у `theme.liquid` і використаю всюди» не спрацює.',
    },
    {
      type: 'note',
      tone: 'interview',
      title: 'На співбесіді',
      text: '**«Чим `assign` відрізняється від `capture`?»** — `assign` кладе значення будь-якого типу (число лишається числом, обʼєкт — обʼєктом), `capture` рендерить свій вміст і завжди дає string. **«Що виведе `{% assign x = 10 %}{% increment x %}{{ x }}`?»** — `0`, потім `10`: `increment` має окремий простір імен, незалежний від `assign` і `capture`, і ділить його лише з `decrement`. Бонус: скажи, що `increment` виводить значення сам, тому для підрахунків у циклі беруть `assign` із `plus`.',
    },
  ],
  exercises: [
    {
      id: 'l04-e1',
      title: 'Повне імʼя в змінну',
      task: [
        'Створи змінну `full_name` — імʼя та прізвище customer через пробіл — і виведи вітання «Вітаємо, Софія Коваленко!».',
        'Імʼя — `customer.first_name`, прізвище — `customer.last_name`.',
      ],
      starter: '{% comment %} assign full_name = імʼя + пробіл + прізвище {% endcomment %}\nВітаємо, {{ full_name }}!',
      solution: '{% assign full_name = customer.first_name | append: " " | append: customer.last_name %}\nВітаємо, {{ full_name }}!',
      data: { customer: { first_name: 'Софія', last_name: 'Коваленко' } },
      altData: { customer: { first_name: 'Марта', last_name: 'Гнатюк' } },
      mustUse: [{ pattern: '\\{%-?\\s*(assign|capture)\\s+full_name\\b', label: 'Створи змінну `full_name`' }],
      hints: [
        'Праворуч від `=` в `assign` може стояти ланцюжок фільтрів.',
        'Два string склеює `append`. Пробіл — теж string: `append: " "`.',
        '`{% assign full_name = customer.first_name | append: " " | append: customer.last_name %}`',
      ],
      explain:
        'Оператора `+` для string немає — лише `append`. Альтернатива — `{% capture full_name %}{{ customer.first_name }} {{ customer.last_name }}{% endcapture %}`: довше, зате читається як готовий текст. До речі, у Shopify у customer вже є готове `customer.name` — але прийом лишається тим самим для будь-яких двох string.',
    },
    {
      id: 'l04-e2',
      title: 'Порахувати раз — використати двічі',
      task: [
        'Порахуй у змінну `line_total` вартість line item у cart: ціна × кількість. Потім виведи: «Разом: 1197 грн. До безкоштовної доставки: 303 грн.»',
        'Друге число — це поріг `free_from` мінус `line_total`. Ціни тут у гривнях.',
      ],
      starter: '{% comment %} line_total = item.price × item.quantity {% endcomment %}\nРазом: … грн. До безкоштовної доставки: … грн.',
      solution:
        '{% assign line_total = item.price | times: item.quantity %}\nРазом: {{ line_total }} грн. До безкоштовної доставки: {{ free_from | minus: line_total }} грн.',
      data: { item: { title: 'Олійка для кінчиків', price: 399, quantity: 3 }, free_from: 1500 },
      altData: { item: { title: 'Термозахисний спрей', price: 520, quantity: 2 }, free_from: 2000 },
      mustUse: [{ pattern: '\\{%-?\\s*assign\\s+line_total\\b', label: 'Поклади суму в змінну `line_total`' }],
      hints: [
        'Множення — фільтр `times`, віднімання — `minus`.',
        '`{% assign line_total = item.price | times: item.quantity %}`',
        'Залишок до порога: `{{ free_from | minus: line_total }}` — параметром фільтра може бути твоя змінна.',
      ],
      explain:
        'Число, пройшовши через `assign` і математичні фільтри, лишається числом — тому `minus` працює з ним без перетворень. Якби ти зібрав суму через `capture`, у змінній був би string; математичні фільтри його переварять, а от порівняння `line_total > 1000` уже поведеться інакше.',
    },
    {
      id: 'l04-e3',
      title: 'Адреса сортування через capture',
      task: [
        'Збери в змінну `sort_url` адресу колекції з параметром сортування: `/collections/home-care?sort_by=price-ascending`. Частини — `collection.url` і змінна `sort`.',
        'Встав цю адресу у два місця: в `href` посилання і в `data-url` кнопки (розмітка вже є в заготовці).',
      ],
      starter:
        '{% comment %} capture sort_url: collection.url + "?sort_by=" + sort {% endcomment %}\n<a href="">{{ collection.title }}: спершу дешевші</a>\n<button data-url="">Застосувати</button>',
      solution:
        '{% capture sort_url %}{{ collection.url }}?sort_by={{ sort }}{% endcapture %}\n<a href="{{ sort_url }}">{{ collection.title }}: спершу дешевші</a>\n<button data-url="{{ sort_url }}">Застосувати</button>',
      data: { collection: { title: 'Домашній догляд', url: '/collections/home-care' }, sort: 'price-ascending' },
      altData: { collection: { title: 'Стайлінг', url: '/collections/styling' }, sort: 'created-descending' },
      mustUse: [{ pattern: '\\{%-?\\s*capture\\s+sort_url\\b', label: 'Збери адресу тегом `capture` у змінну `sort_url`' }],
      hints: [
        'Усередині `capture` пишеш так, ніби виводиш адресу просто на сторінку: `{{ }}` упереміш зі звичайним текстом.',
        'Увесь вміст `capture` тримай в одному рядку: переноси й відступи теж потраплять у змінну, а отже — в атрибут.',
        '`{% capture sort_url %}{{ collection.url }}?sort_by={{ sort }}{% endcapture %}`',
      ],
      explain:
        'Те саме можна зробити через `assign` і два `append`, але `capture` тут читається як готова адреса — видно, що вийде. Головна пастка — пробіли: якби вміст `capture` стояв на окремих рядках, в `href` приїхали б переноси. Ліки — один рядок, фільтр `strip` або whitespace control `{%-` (урок 12).',
    },
    {
      id: 'l04-e4',
      title: 'Блок ціни зі знижкою',
      task: [
        'Збери блок ціни для картки product зі знижкою. Порахуй: `saving` — скільки гривень економії (`compare_at_price` мінус `price`) і `percent` — відсоток знижки: `saving × 100`, поділене на `compare_at_price` (ділення integer на integer у Liquid — націло, це саме те, що треба).',
        'Бейдж виду `-18%` збери через `capture` у змінну `badge` — він потрібен у двох місцях.',
        'На видимих даних (649 грн замість 799) має вийти: нова ціна «649 грн», стара «799 грн», бейдж «-18%» з підказкою «Економія 150 грн» і абзац «Ти заощаджуєш 150 грн (-18%)». У бейджі — звичайний дефіс.',
      ],
      starter:
        '{% comment %}\n  1. assign saving  = compare_at_price − price\n  2. assign percent = saving × 100 / compare_at_price\n  3. capture badge  = -18%\n{% endcomment %}\n<div class="price">\n  <span class="price__now">{{ product.price }} грн</span>\n  <s class="price__was">{{ product.compare_at_price }} грн</s>\n  <span class="badge" title="Економія … грн">…</span>\n</div>\n<p class="price__note">Ти заощаджуєш … грн (…)</p>',
      solution:
        '{% assign saving = product.compare_at_price | minus: product.price %}\n{% assign percent = saving | times: 100 | divided_by: product.compare_at_price %}\n{% capture badge %}-{{ percent }}%{% endcapture %}\n<div class="price">\n  <span class="price__now">{{ product.price }} грн</span>\n  <s class="price__was">{{ product.compare_at_price }} грн</s>\n  <span class="badge" title="Економія {{ saving }} грн">{{ badge }}</span>\n</div>\n<p class="price__note">Ти заощаджуєш {{ saving }} грн ({{ badge }})</p>',
      data: { product: { title: 'Шампунь із кератином', price: 649, compare_at_price: 799 } },
      altData: { product: { title: 'Термозахисний спрей', price: 520, compare_at_price: 650 } },
      mustUse: [
        { pattern: '\\{%-?\\s*assign\\s+saving\\b', label: 'Економію порахуй у змінну `saving`' },
        { pattern: '\\{%-?\\s*capture\\s+badge\\b', label: 'Бейдж збери через `capture` у змінну `badge`' },
      ],
      view: 'html',
      hints: [
        'Іди по кроках із коментаря: після кожного `assign` тимчасово виведи змінну й подивись, що в ній.',
        'Відсоток: `{% assign percent = saving | times: 100 | divided_by: product.compare_at_price %}` — спершу множимо, потім ділимо, інакше ділення націло дасть нуль.',
        'Бейдж: `{% capture badge %}-{{ percent }}%{% endcapture %}` — в один рядок, щоб у нього не потрапили пробіли.',
      ],
      explain:
        'Це майже дослівно блок ціни зі справжньої теми, лише без `money`. Порядок «спершу `times: 100`, потім `divided_by`» — не примха: `150 / 799` націло дає `0`, і відсоток зник би. Змінні тут окупаються одразу: `saving` використано тричі, `badge` — двічі, а якщо маркетинг попросить інший формат бейджа, правка буде в одному місці.',
    },
  ],
  quiz: [
    {
      id: 'l04-q1',
      q: 'Що виведе цей код?',
      template: '{% assign x = 10 %}{% increment x %} {% increment x %} {{ x }}',
      options: ['10 11 12', '0 1 10', '11 12 12', '0 1 2'],
      correct: 1,
      explain: '`increment` має власний простір імен: його `x` стартує з нуля й не чіпає `x`, створений через `assign`. А `{{ x }}` показує саме assign-змінну — `10`.',
    },
    {
      id: 'l04-q2',
      q: 'У `capture` поклали цифру. Яка гілка спрацює?',
      template: '{% capture n %}5{% endcapture %}{% if n == 5 %}число{% else %}рядок{% endif %}',
      options: ['число', 'рядок', 'Помилка: рядок не можна порівнювати з числом', '5'],
      correct: 1,
      explain: '`capture` завжди дає string, а `"5" == 5` у Liquid — `false`: типи не приводяться. Щоб отримати число, пропусти значення через математичний фільтр — наприклад, `plus: 0`.',
    },
    {
      id: 'l04-q3',
      q: 'Змінної `stock` раніше не було. Що виведе цей код?',
      template: '{% decrement stock %} {% decrement stock %}',
      options: ['0 -1', '-1 -2', '1 0', 'Помилка: змінну не оголошено'],
      correct: 1,
      explain: '`decrement` спершу зменшує, потім виводить, тому перше значення — `-1`. `increment` навпаки: спершу виводить `0`, потім збільшує.',
    },
    {
      id: 'l04-q4',
      q: 'Як правильно збільшити числову змінну `n` на одиницю, нічого не виводячи в output?',
      options: ['`{% assign n = n + 1 %}`', '`{% increment n %}`', '`{% assign n = n | plus: 1 %}`', '`{{ n++ }}`'],
      correct: 2,
      explain: 'Арифметичних операторів у Liquid немає — лише фільтри, тож `n + 1` і `n++` відпадають. `{% increment n %}` працює з **іншою** змінною `n` (окремий простір імен) і до того ж виводить значення на сторінку.',
    },
  ],
}

/* ═══════════════════════ УРОК 5 ═══════════════════════ */

const l05Data = {
  product: { title: 'Шампунь із кератином', type: 'Шампунь', price: 64900, compare_at_price: 79900, available: true },
  variant: { title: '400 мл', inventory_quantity: 3 },
}

const l05: Lesson = {
  id: 'l05',
  module: 2,
  title: 'Умови: if, unless, elsif, case',
  goal: 'Обираєш правильний тег під розгалуження: `if` — для умови, `unless` — для простого заперечення, `elsif` — для драбини, `case` — для вибору за значенням.',
  minutes: 30,
  docs: ['tags/control-flow', 'basics/operators', 'basics/truthy-and-falsy'],
  topics: ['control-flow', 'operators'],
  blocks: [
    {
      type: 'p',
      text: 'Умова в Liquid вирішує, **що взагалі потрапить у HTML**. Це не `display: none`: гілка, яка не пройшла умову, до браузера не доїжджає зовсім — її немає ні в DOM, ні в коді сторінки. Тому умови — це й про швидкість (менше розмітки), і про те, чого відвідувачу бачити не слід. Оператори й truthy/falsy ти вже знаєш з [уроку 3](/learn/l03); тепер — самі теги.',
    },
    { type: 'h', text: 'if та else' },
    {
      type: 'example',
      title: 'Бейдж, який зʼявляється лише за умови',
      template: '<h2>{{ product.title }}</h2>\n{% if product.available == false %}\n  <span class="badge">Немає в наявності</span>\n{% endif %}',
      data: { product: { ...l05Data.product, available: false } },
      view: 'html',
      note: 'Постав у даних `"available": true` — бейдж зникне з output повністю, разом зі своїм `<span>`.',
    },
    {
      type: 'example',
      title: 'Дві гілки: else',
      template:
        '{% if product.available %}\n  <button>Додати в кошик</button>\n{% else %}\n  <button disabled>Немає в наявності</button>\n{% endif %}',
      data: l05Data,
      view: 'html',
      note: 'Класика сторінки product. `else` не має власної умови й закривається тим самим `endif`.',
    },
    { type: 'h', text: 'unless — if навиворіт' },
    {
      type: 'example',
      title: 'Той самий бейдж, але читається як речення',
      template: '{% unless product.available %}\n  <span class="badge">Немає в наявності</span>\n{% endunless %}',
      data: { product: { ...l05Data.product, available: false } },
      note: '«Якщо НЕ в наявності — покажи бейдж». Оператора `not` чи `!` у Liquid **немає**, тому заперечення роблять або через `unless`, або порівнянням: `== false`, `!= "Спрей"`, `== blank`.',
    },
    {
      type: 'note',
      tone: 'warn',
      title: 'unless — лише для простих умов',
      text: '`unless` з `else` або з `and` / `or` — надійний спосіб заплутати себе й ревʼюера: `{% unless a or b %}` означає «ні `a`, ні `b`», і це вже треба розшифровувати. Правило з практики: `unless` — тільки для **однієї** простої умови **без** `else`. Усе складніше пиши через `if`. І ще різниця: `unless product.available` спрацює і для `false`, і для `nil`, а `if product.available == false` — лише для справжнього `false`.',
    },
    { type: 'h', text: 'elsif: драбина умов' },
    {
      type: 'example',
      title: 'Залишок на складі',
      template:
        '{% if variant.inventory_quantity == 0 %}\n  Немає в наявності\n{% elsif variant.inventory_quantity <= 5 %}\n  Залишилось лише {{ variant.inventory_quantity }} шт.\n{% else %}\n  В наявності\n{% endif %}',
      data: l05Data,
      note: 'Спробуй у даних `0`, `3` і `40`. Умови перевіряються **зверху вниз, і спрацьовує лише перша** правдива — решту Liquid навіть не дивиться.',
    },
    {
      type: 'p',
      text: 'З цього випливає правило драбини: **від вужчої умови до ширшої**. Якби першою стояла `<= 5`, нуль теж потрапив би в неї, і відвідувач побачив би «Залишилось лише 0 шт.». І про написання: саме `elsif` — не `elseif`, не `else if` і не `elif`. Це спадок Ruby, і це найчастіша синтаксична помилка в умовах.',
    },
    { type: 'h', text: 'case / when: вибір за значенням' },
    {
      type: 'example',
      title: 'Інструкція за типом product',
      template:
        '{% case product.type %}\n  {% when "Шампунь", "Кондиціонер" %}\n    Нанеси на вологе волосся, помасажуй і змий.\n  {% when "Маска" %}\n    Тримай 10 хвилин, потім змий.\n  {% when "Спрей" or "Олійка" %}\n    Розподіли по довжині й не змивай.\n  {% else %}\n    Інструкція — на упаковці.\n{% endcase %}',
      data: l05Data,
      note: 'Кілька значень в одному `when` — через кому або через `or`. `else` ловить усе, що не збіглося. Зміни `type` у даних на `"Олійка"` чи `"Сироватка"`.',
    },
    {
      type: 'p',
      text: '`case` — це `switch` із JS, але без двох його пасток: `break` не потрібен, і «провалювання» в наступну гілку немає. Є й обмеження: `when` уміє лише **порівнювати на рівність**. Діапазон чи умову (`when > 5`) туди не покладеш — для цього драбина `elsif`. Вибір простий: одне значення проти списку варіантів → `case`; різні умови → `if` / `elsif`.',
    },
    { type: 'h', text: 'Вкладені умови' },
    {
      type: 'example',
      title: 'Бейджі картки product',
      template:
        '{% if product.available %}\n  {% if product.compare_at_price > product.price %}\n    <span class="badge badge--sale">Знижка</span>\n  {% endif %}\n{% else %}\n  <span class="badge badge--soldout">Немає в наявності</span>\n{% endif %}',
      data: l05Data,
      view: 'html',
      note: 'Бейдж знижки має сенс лише для product, який є в наявності, — тому він усередині гілки `available`. Прибери `compare_at_price` з даних (або постав `null`): порівняння з `nil` дасть `false` без жодної помилки, і бейдж просто не зʼявиться.',
    },
    {
      type: 'note',
      tone: 'tip',
      title: 'Тернарного оператора немає',
      text: 'Запису `умова ? a : b` в Liquid не існує. Заміна — значення за замовчуванням плюс `if`: `{% assign label = "Купити" %}{% unless product.available %}{% assign label = "Немає в наявності" %}{% endunless %}`. Для випадку «якщо порожньо — підстав запасне» є коротший шлях — фільтр `default`.',
    },
    {
      type: 'note',
      tone: 'shopify',
      text: 'Умови, які побачиш у кожній темі: `{% if customer %}` — customer увійшов; `{% if cart.item_count > 0 %}` — cart не порожній; `{% if section.settings.show_vendor %}` — галочка в редакторі теми (чекбокс дає справжнє булеве); `{% if template.name == "product" %}` — ми на сторінці product; `{% case block.type %}` — який блок секції зараз рендериться. Останній приклад — головне застосування `case` у Shopify.',
    },
    {
      type: 'note',
      tone: 'interview',
      title: 'На співбесіді',
      text: '**«Коли `case`, а коли `if`/`elsif`?»** — `case` порівнює одне значення зі списком варіантів на рівність (тип блока, тип product, назва шаблону); для діапазонів і складених умов потрібна драбина `elsif`, де спрацьовує перша правдива гілка, тож порядок — від вужчої умови до ширшої. **«Чи є в Liquid `not` і тернарний оператор?»** — ні: заперечення — це `unless` або порівняння з `false` / `blank`, тернарний замінюють `assign` за замовчуванням плюс `if` або фільтр `default`. Корисно додати, що гілка, яка не пройшла умову, взагалі не потрапляє в HTML — на відміну від приховування через CSS.',
    },
  ],
  exercises: [
    {
      id: 'l05-e1',
      title: 'Бейдж «Немає в наявності»',
      task: [
        'Під назвою product виведи `<span class="badge">Немає в наявності</span>` — але лише тоді, коли `product.available` хибне. Якщо product є в наявності, після заголовка не має бути нічого.',
        'На видимих даних product немає в наявності, тож бейдж має зʼявитись.',
      ],
      starter: '<h2>{{ product.title }}</h2>\n{% comment %} бейдж — лише коли товару немає в наявності {% endcomment %}',
      solution: '<h2>{{ product.title }}</h2>\n{% unless product.available %}\n  <span class="badge">Немає в наявності</span>\n{% endunless %}',
      data: { product: { title: 'Термозахисний спрей', available: false } },
      altData: { product: { title: 'Олійка для кінчиків', available: true } },
      view: 'html',
      hints: [
        'Потрібна умова «якщо НЕ…». У Liquid для цього є окремий тег.',
        '`{% unless product.available %}…{% endunless %}` — або `{% if product.available == false %}…{% endif %}`.',
        'Усередину тега постав `<span class="badge">Немає в наявності</span>`.',
      ],
      explain:
        'Підійдуть обидва записи. `unless` коротший і читається як речення; `== false` явніший. Різниця проявиться, коли `available` раптом виявиться `nil` (наприклад, одруківка в імені властивості): `unless` бейдж покаже, а `== false` — ні.',
    },
    {
      id: 'l05-e2',
      title: 'Вітання в шапці',
      task: [
        'У шапці сайту: якщо customer увійшов в акаунт, виведи `<p>Привіт, Софія!</p>` (імʼя — з `customer.first_name`). Якщо ні — посилання `<a href="/account/login">Увійти</a>`.',
        'Коли ніхто не увійшов, обʼєкт `customer` дорівнює `nil` — саме так буде в прихованій перевірці.',
      ],
      starter: '{% comment %} customer є → привітання, customer немає → посилання «Увійти» {% endcomment %}\n<p>Привіт, {{ customer.first_name }}!</p>',
      solution: '{% if customer %}\n  <p>Привіт, {{ customer.first_name }}!</p>\n{% else %}\n  <a href="/account/login">Увійти</a>\n{% endif %}',
      data: { customer: { first_name: 'Софія', orders_count: 4 } },
      altData: { customer: null },
      view: 'html',
      hints: [
        '`nil` — falsy, а будь-який обʼєкт — truthy. Тож сам `customer` уже годиться як умова.',
        '`{% if customer %}…{% else %}…{% endif %}`',
        'У гілці `else` — `<a href="/account/login">Увійти</a>`.',
      ],
      explain:
        'Це та рідкісна ситуація, де голий `if` без оператора — саме те, що треба: тебе цікавить, чи обʼєкт **існує**. У справжній темі адресу входу беруть не літералом, а з `routes.account_login_url` — щоб вона правильно працювала в магазинах із кількома мовами.',
    },
    {
      id: 'l05-e3',
      title: 'Драбина залишку',
      task: [
        'Виведи статус залишку за `variant.inventory_quantity`: якщо `0` — «Немає в наявності»; якщо від 1 до 5 — «Залишилось лише 3 шт.» (із реальним числом); якщо більше — «В наявності».',
        'Текст загорни в `<p class="stock">…</p>`. На видимих даних залишок — 3.',
      ],
      starter: '<p class="stock">\n  {% comment %} if … elsif … else — від вужчої умови до ширшої {% endcomment %}\n  В наявності\n</p>',
      solution:
        '<p class="stock">\n  {% if variant.inventory_quantity == 0 %}\n    Немає в наявності\n  {% elsif variant.inventory_quantity <= 5 %}\n    Залишилось лише {{ variant.inventory_quantity }} шт.\n  {% else %}\n    В наявності\n  {% endif %}\n</p>',
      data: { variant: { title: '400 мл', inventory_quantity: 3 } },
      altData: { variant: { title: '1000 мл', inventory_quantity: 0 } },
      mustUse: [{ pattern: '\\{%-?\\s*elsif\\b', label: 'Побудуй драбину з `elsif`' }],
      hints: [
        'Три гілки: `if` — для нуля, `elsif` — для «мало», `else` — для решти.',
        'Порядок важить: якщо першою перевірити `<= 5`, нуль теж туди потрапить.',
        '`{% if variant.inventory_quantity == 0 %}…{% elsif variant.inventory_quantity <= 5 %}…{% else %}…{% endif %}`',
      ],
      explain:
        'Спрацьовує перша правдива гілка, тому вужча умова (`== 0`) стоїть вище за ширшу (`<= 5`). Довге `variant.inventory_quantity` можна було б покласти в змінну через `assign` — три звернення до одного шляху вже натякають на це.',
    },
    {
      id: 'l05-e4',
      title: 'Блок «Як користуватись»',
      task: [
        'Збери блок інструкції для сторінки product. Усередині `<div class="usage">`: заголовок `<h3>Як користуватись</h3>` і абзац `<p>` з текстом, який залежить від `product.type`.',
        'Для «Шампунь» і «Кондиціонер» — «Нанеси на вологе волосся і змий.» Для «Маска» — «Тримай 10 хвилин, потім змий.» Для «Спрей» і «Олійка» — «Розподіли по довжині й не змивай.» Для будь-якого іншого типу — «Інструкція — на упаковці.»',
        'Наостанок: якщо product немає в наявності, додай після абзацу `<p class="usage__note">Зараз немає в наявності</p>`. На видимих даних це кондиціонер, який є в наявності.',
      ],
      starter:
        '<div class="usage">\n  <h3>Як користуватись</h3>\n  {% comment %}\n    case product.type → потрібний <p>\n    потім — примітка, якщо товару немає\n  {% endcomment %}\n</div>',
      solution:
        '<div class="usage">\n  <h3>Як користуватись</h3>\n  {% case product.type %}\n    {% when "Шампунь", "Кондиціонер" %}\n      <p>Нанеси на вологе волосся і змий.</p>\n    {% when "Маска" %}\n      <p>Тримай 10 хвилин, потім змий.</p>\n    {% when "Спрей", "Олійка" %}\n      <p>Розподіли по довжині й не змивай.</p>\n    {% else %}\n      <p>Інструкція — на упаковці.</p>\n  {% endcase %}\n  {% unless product.available %}\n    <p class="usage__note">Зараз немає в наявності</p>\n  {% endunless %}\n</div>',
      data: { product: { title: 'Кондиціонер щоденний', type: 'Кондиціонер', available: true } },
      altData: { product: { title: 'Сироватка для шкіри голови', type: 'Сироватка', available: false } },
      mustUse: [{ pattern: '\\{%-?\\s*case\\b', label: 'Вибір за типом product зроби через `case`' }],
      view: 'html',
      hints: [
        'Одне значення (`product.type`) проти списку варіантів — це робота для `case`.',
        'Кілька типів в одній гілці: `{% when "Шампунь", "Кондиціонер" %}`. Не забудь `{% else %}` для невідомих типів.',
        'Примітка про наявність — окрема умова **після** `{% endcase %}`: `{% unless product.available %}…{% endunless %}`.',
      ],
      explain:
        'Через `if` / `elsif` це були б пʼять порівнянь `product.type == …` з `or` — працює, але читається гірше, і додати новий тип складніше. Гілка `else` тут не формальність: мерчант завтра заведе новий тип product, і без неї блок лишився б із заголовком, але без тексту. Так само в секціях Shopify перебирають `block.type`.',
    },
  ],
  quiz: [
    {
      id: 'l05-q1',
      q: 'Правдиві обидві умови — і перша, і друга. Що виведе код?',
      template: '{% assign qty = 3 %}{% if qty > 0 %}Є{% elsif qty > 2 %}Багато{% else %}Немає{% endif %}',
      options: ['Багато', 'ЄБагато', 'Є', 'Немає'],
      correct: 2,
      explain: 'У драбині спрацьовує лише **перша** правдива гілка — до `elsif` справа вже не доходить. Щоб «Багато» мало шанс, вужча умова `qty > 2` має стояти вище за ширшу `qty > 0`.',
    },
    {
      id: 'l05-q2',
      q: 'Що виведе `case`?',
      template: '{% assign type = "Маска" %}{% case type %}{% when "Шампунь", "Маска" %}догляд{% when "Спрей" %}стайлінг{% else %}інше{% endcase %}',
      options: ['інше', 'догляд', 'Помилка: у `when` може бути лише одне значення', 'доглядінше'],
      correct: 1,
      explain: '`when` приймає кілька значень через кому (або `or`) і спрацьовує, якщо збіглося будь-яке. `else` виконується, лише коли не збіглася жодна гілка.',
    },
    {
      id: 'l05-q3',
      q: 'У product немає знижки: `compare_at_price` дорівнює `nil`. Що виведе код?',
      template: '{% if product.compare_at_price > product.price %}Знижка{% else %}Звичайна ціна{% endif %}',
      data: { product: { price: 64900, compare_at_price: null } },
      options: ['Знижка', 'Помилка: `nil` не можна порівнювати з числом', 'Звичайна ціна', 'Нічого не виведе'],
      correct: 2,
      explain: 'Порівняння з `nil` у Liquid не падає, а просто дає `false` — тож виконується гілка `else`. Саме тому цю перевірку знижки пишуть у темах без додаткового `!= blank`.',
    },
    {
      id: 'l05-q4',
      q: 'Оператора `not` у Liquid немає. Яким записом показати блок, коли product **немає** в наявності?',
      options: [
        '`{% if !product.available %}`',
        '`{% unless product.available %}`',
        '`{% if product.available is false %}`',
        '`{% ifnot product.available %}`',
      ],
      correct: 1,
      explain: '`unless` — це «if навиворіт»: тіло виконується, коли умова хибна. Працює й `{% if product.available == false %}`. Знака `!`, слова `is` і тега `ifnot` у Liquid не існує.',
    },
  ],
}

export const lessonsPart1: Lesson[] = [l01, l02, l03, l04, l05]
