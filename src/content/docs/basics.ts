import type { DocPage } from '../types'

export const basicsPages: DocPage[] = [
  /* ───────────────────────── 1. Вступ ───────────────────────── */
  {
    slug: 'introduction',
    section: 'basics',
    title: 'Вступ: із чого складається Liquid',
    summary:
      'Liquid — мова шаблонів: статичний текст плюс три види вставок. Вивід `{{ }}` друкує дані, теги `{% %}` керують логікою, фільтри `|` перетворюють значення. Рендериться на сервері, браузер Liquid не бачить.',
    officialUrl: 'https://shopify.github.io/liquid/basics/introduction/',
    related: ['basics/operators', 'basics/types', 'basics/variations', 'tags/control-flow', 'shopify/architecture'],
    blocks: [
      {
        type: 'p',
        text: 'Liquid — це **мова шаблонів**. Її написав у 2006 році Тобіас Лютке для Shopify, вона з відкритим кодом, оригінальна реалізація — на Ruby. Мова шаблонів — не мова програмування загального призначення: вона вміє одне — взяти заготовку з «дірками», підставити в дірки дані й віддати готовий текст. Найчастіше цей текст — HTML, але так само це може бути JSON, CSS, лист клієнтці чи XML-фід.',
      },
      {
        type: 'p',
        text: 'Усе, що в шаблоні **не** взято в `{{ }}` або `{% %}`, Liquid не чіпає взагалі: він не знає, що таке HTML, не перевіряє теги й не закриває їх за тебе. Для нього це просто текст, який треба передати далі як є.',
      },
      { type: 'h', text: 'Три складові' },
      {
        type: 'list',
        items: [
          '**Обʼєкти й вивід** — `{{ product.title }}`. Подвійні фігурні дужки означають «обчисли і **надрукуй**».',
          '**Теги** — `{% if … %}`, `{% for … %}`, `{% assign … %}`. Дужка з відсотком означає «**зроби**»: умова, цикл, змінна. Самі теги нічого не друкують.',
          '**Фільтри** — `{{ product.title | upcase }}`. Вертикальна риска передає значення у функцію-перетворювач; фільтри живуть усередині виводу або тегу.',
        ],
      },
      {
        type: 'example',
        title: 'Усі три в одному шаблоні',
        preset: 'product',
        view: 'html',
        template: `<h1>{{ product.title }}</h1>
{% if product.available %}
  <p>Ціна: {{ product.price | money }}</p>
{% else %}
  <p>Немає в наявності</p>
{% endif %}`,
        note: '`{{ product.title }}` — вивід обʼєкта, `{% if %}` — тег, `| money` — фільтр. Зверни увагу на порожні рядки у виводі: тег нічого не друкує, але перенос рядка навколо нього лишається. Про це — сторінка [Керування пробілами](/docs/basics/whitespace).',
      },
      { type: 'h', text: 'Обʼєкти й вивід' },
      {
        type: 'p',
        text: 'Обʼєкт — це дані, які шаблону **дали ззовні**: у Shopify це `product`, `cart`, `shop`, `customer` тощо. До властивостей дістаються через крапку. Сам шаблон даних не створює і ні в яку базу не ходить — він працює лише з тим, що йому передала платформа.',
      },
      {
        type: 'example',
        title: 'Крапка — шлях углиб обʼєкта',
        preset: 'product',
        template: `{{ shop.name }}: {{ product.title }} від {{ product.vendor }}
Перший варіант: {{ product.variants.first.title }}
Неіснуюча властивість: [{{ product.subtitle }}]`,
        note: 'Останній рядок — ключова риса мови: звернення до того, чого немає, — **не помилка**. Liquid отримує `nil` і друкує порожнечу. Зручно (сторінка не падає), але й підступно: одруківка в імені властивості мовчки дасть порожнє місце.',
      },
      { type: 'h', text: 'Теги' },
      {
        type: 'p',
        text: 'Теги — це логіка шаблону. Вони діляться на чотири групи: [умови](/docs/tags/control-flow) (`if`, `unless`, `case`), [цикли](/docs/tags/iteration) (`for`, `tablerow`), [змінні](/docs/tags/variable) (`assign`, `capture`) і [службові](/docs/tags/template) (`comment`, `raw`, `render`, `liquid`). Більшість тегів парні: відкрив `{% if %}` — закрий `{% endif %}`.',
      },
      {
        type: 'example',
        title: 'Тег керує тим, що потрапить у вивід',
        preset: 'product',
        template: `{%- assign in_stock = 0 -%}
{%- for variant in product.variants -%}
  {%- if variant.available -%}
    {%- assign in_stock = in_stock | plus: 1 -%}
  {%- endif -%}
{%- endfor -%}
У наявності {{ in_stock }} з {{ product.variants.size }} варіантів`,
        note: 'Три теги (`assign`, `for`, `if`) порахували число, але надрукував його лише вивід `{{ in_stock }}` в останньому рядку. Арифметика — теж фільтром: оператора `+` в Liquid немає. Дефіси в дужках (`{%-`, `-%}`) прибирають порожні рядки, які інакше лишилися б на місці кожного тегу, — спробуй їх стерти.',
      },
      { type: 'h', text: 'Фільтри і ланцюжок' },
      {
        type: 'p',
        text: 'Фільтр бере значення **ліворуч від риски**, перетворює його й віддає далі. Параметри пишуться після двокрапки, через кому. Фільтри можна зчіплювати, і ланцюжок виконується **строго зліва направо**: результат першого стає входом другого. Пріоритетів і дужок тут немає — лише порядок запису.',
      },
      {
        type: 'example',
        title: 'Порядок фільтрів змінює результат',
        preset: 'product',
        template: `{{ "кератин" | append: " для волосся" | upcase }}
{{ "кератин" | upcase | append: " для волосся" }}
{{ product.title | truncate: 12 | upcase }}
{{ product.tags | join: ", " }}`,
        note: 'У першому рядку `upcase` отримав уже склеєний рядок, у другому — лише слово «кератин», а хвіст приклеївся після. Фільтр не змінює саму змінну: `product.title` лишається таким, як був, перетворюється тільки те, що друкується.',
      },
      { type: 'h', text: 'Як шаблон стає HTML' },
      {
        type: 'list',
        ordered: true,
        items: [
          'Браузер просить сторінку — наприклад, `/products/keratin-shampoo`.',
          'Сервер Shopify знаходить потрібний шаблон теми й збирає для нього обʼєкти: `product`, `cart`, `shop`…',
          'Liquid-рушій проходить шаблон зверху вниз: текст копіює, вивід обчислює і друкує, теги виконує.',
          'Результат — **звичайний HTML** — іде в браузер. Жодної фігурної дужки в ньому вже немає.',
        ],
      },
      {
        type: 'code',
        lang: 'html',
        title: 'Що бачить браузер (View Source)',
        code: '<h1>Шампунь із кератином</h1>\n<p>Ціна: 649.00 ₴</p>',
      },
      {
        type: 'note',
        tone: 'warn',
        title: 'Liquid і JavaScript живуть у різний час',
        text: 'Liquid відпрацьовує **на сервері, до** того, як сторінка потрапить у браузер; JavaScript — **після**, у браузері. Тому JS-змінну передати в Liquid неможливо: коли скрипт запускається, Liquid уже давно закінчив. Навпаки — можна: Liquid друкує значення прямо в текст скрипта (`const price = {{ product.price }};`) або в `data-`атрибут. Детально — [Liquid і JavaScript](/docs/shopify/liquid-and-js).',
      },
      { type: 'h', text: 'Чому Liquid називають безпечною мовою' },
      {
        type: 'p',
        text: 'Liquid створили для ситуації, коли шаблони пише **не власник сервера**, а сторонні люди: мерчанти, фрилансери, розробники тем. На одних серверах Shopify крутяться шаблони мільйонів магазинів, і жоден із них не повинен мати змоги нашкодити іншим. Тому мова обмежена навмисно:',
      },
      {
        type: 'list',
        items: [
          'Не можна виконати довільний код: немає `eval`, немає виклику методів мови, на якій написано рушій, немає власних функцій.',
          'Немає доступу до файлової системи, бази даних, мережі чи змінних оточення. Шаблон бачить **лише ті обʼєкти, які йому явно передали**, і лише дозволені властивості цих обʼєктів.',
          'Шаблон нічого не може змінити: він читає дані й друкує текст. Додати товар у кошик чи змінити ціну з Liquid неможливо — для цього є форми й API.',
          'Помилка в шаблоні не кладе сервер: у гіршому разі на сторінці зʼявиться текст помилки на місці зламаного фрагмента.',
        ],
      },
      {
        type: 'note',
        tone: 'shopify',
        text: 'Саме через це Shopify дозволяє редагувати код теми просто з адмінки будь-кому, хто має доступ до магазину. Та сама мова працює не лише в темах: на Liquid написані шаблони листів-сповіщень, пакувальні листи, частина Shopify Flow. Скрізь одна ідея — дати людині гнучкість без доступу до системи.',
      },
      {
        type: 'note',
        tone: 'warn',
        title: '«Безпечна» — це про сервер, а не про XSS',
        text: 'Liquid **не екранує вивід автоматично**. `{{ customer.first_name }}` надрукує рівно те, що лежить у даних, разом із тегами. Усе, що вводить користувач, пропускай через [escape](/docs/filters/escape), а дані для скриптів — через `json`. Докладніше — [Безпека](/docs/shopify/security).',
      },
      {
        type: 'example',
        title: 'Як показати Liquid-код, не виконавши його',
        preset: 'product',
        template: '{% raw %}{{ product.title }}{% endraw %} → {{ product.title }}',
        note: 'Усе між `{% raw %}` і `{% endraw %}` рушій копіює як текст. Потрібно рідко — здебільшого коли в темі живе клієнтський шаблонізатор із такими самими фігурними дужками.',
      },
      {
        type: 'note',
        tone: 'interview',
        title: 'На співбесіді: «Що таке Liquid?»',
        text: 'Сильна відповідь на 30 секунд: «Liquid — відкрита мова шаблонів від Shopify, рендериться на сервері. Складається з трьох частин: вивід `{{ }}` друкує дані, теги `{% %}` дають логіку — умови, цикли, змінні, — а фільтри через `|` перетворюють значення і виконуються зліва направо. Мова навмисно обмежена: шаблон бачить лише передані йому обʼєкти, не може виконати довільний код чи дістатися до бази — тому її безпечно давати редагувати мерчантам. Браузер отримує вже готовий HTML, тож Liquid і клієнтський JavaScript працюють у різний час». Останнє речення часто тягне наступне питання — як передати дані з Liquid у JS.',
      },
    ],
  },

  /* ───────────────────────── 2. Оператори ───────────────────────── */
  {
    slug: 'operators',
    section: 'basics',
    title: 'Оператори',
    summary:
      'Порівняння `==`, `!=`, `>`, `<`, `>=`, `<=`, логічні `and` / `or` і `contains`. Працюють лише в тегах, дужок немає, а `and` / `or` обчислюються справа наліво.',
    officialUrl: 'https://shopify.github.io/liquid/basics/operators/',
    related: ['basics/truthy-and-falsy', 'basics/types', 'tags/control-flow', 'filters/plus', 'filters/default'],
    blocks: [
      {
        type: 'p',
        text: 'Операторів у Liquid мало, і всі вони — для **умов**. Живуть вони всередині тегів `if`, `elsif`, `unless` (і частково `case`). Арифметичних операторів немає зовсім, тернарного — теж. Натомість є дві речі, яких не чекаєш після JavaScript: незвичний порядок обчислення `and` / `or` і заборона дужок.',
      },
      {
        type: 'table',
        head: ['Оператор', 'Значення', 'Примітка'],
        rows: [
          ['`==`', 'дорівнює', 'без приведення типів: `"5" == 5` — хибно'],
          ['`!=`', 'не дорівнює', ''],
          ['`>` `<` `>=` `<=`', 'більше / менше', 'мають сенс для чисел (і рядків між собою)'],
          ['`and`', 'логічне «і»', 'словом, не `&&`'],
          ['`or`', 'логічне «або»', 'словом, не `||`'],
          ['`contains`', 'містить', 'підрядок у рядку або рядок у масиві рядків'],
        ],
      },
      {
        type: 'example',
        title: 'Порівняння в умовах',
        data: { price: 649, vendor: 'Cocochoco', qty: 3, available: false },
        template: `{% if price >= 500 and price < 1000 %}середній сегмент{% endif %}
{% if vendor != "Inoar" %}не Inoar{% endif %}
{% if qty <= 3 %}лишилось мало{% endif %}
{% unless available %}розпродано{% endunless %}`,
        note: 'Оператора заперечення (`not`, `!`) у Liquid немає. Заперечують або через `!=`, або тегом `unless` — це «`if` навпаки».',
      },
      { type: 'h', text: 'and / or: справа наліво і без дужок' },
      {
        type: 'p',
        text: 'У більшості мов `and` має вищий пріоритет за `or`, а порядок можна змінити дужками. У Liquid **пріоритетів немає**, а дужки в умовах заборонені. Коли в умові кілька `and` / `or`, рушій групує їх **справа наліво**: спершу обчислюється найправіша пара, потім її результат поєднується з тим, що лівіше.',
      },
      {
        type: 'example',
        title: 'Два рядки, які це доводять',
        template: `{% if true or false and false %}так{% else %}ні{% endif %}
{% if false and false or true %}так{% else %}ні{% endif %}`,
        note: 'Перший рядок: якби Liquid рахував просто зліва направо, вийшло б `(true or false) and false` → «ні». Другий рядок: якби `and` мав пріоритет, як у JavaScript, вийшло б `(false and false) or true` → «так». Реальний вивід пояснює лише одне правило — групування справа: `true or (false and false)` і `false and (false or true)`.',
      },
      {
        type: 'table',
        head: ['Написано', 'Як це читає Liquid', 'Як прочитав би JavaScript'],
        rows: [
          ['`a or b and c`', '`a or (b and c)`', '`a or (b and c)` — збіг'],
          ['`a and b or c`', '`a and (b or c)`', '`(a and b) or c` — **різниця**'],
          ['`a and b or c and d`', '`a and (b or (c and d))`', '`(a and b) or (c and d)` — **різниця**'],
        ],
      },
      {
        type: 'example',
        title: 'Як це ламає реальну умову',
        data: { is_vip: false, big_cart: false, promo_day: true },
        template: `{% if is_vip and big_cart or promo_day %}Безкоштовна доставка{% else %}Доставка платна{% endif %}
{% if promo_day or is_vip and big_cart %}Безкоштовна доставка{% else %}Доставка платна{% endif %}`,
        note: 'Задум: «VIP із великим кошиком — або день акції». Сьогодні акція, тож доставка має бути безкоштовною. Перший рядок Liquid читає як `is_vip and (big_cart or promo_day)` — і відмовляє. Другий — та сама умова з переставленими частинами: тепер групування справа збігається із задумом.',
      },
      {
        type: 'p',
        text: 'Переставляння працює, але тримається на тому, що читач коду памʼятає правило. Надійніший шлях для складних умов — не змішувати `and` з `or` в одному тезі: розкласти на `if` / `elsif` або порахувати проміжний прапорець через `assign`.',
      },
      {
        type: 'example',
        title: 'Те саме без двозначності',
        data: { is_vip: false, big_cart: false, promo_day: true },
        template: `{%- assign free_shipping = false -%}
{%- if promo_day -%}
  {%- assign free_shipping = true -%}
{%- elsif is_vip and big_cart -%}
  {%- assign free_shipping = true -%}
{%- endif -%}
Безкоштовна доставка: {{ free_shipping }}`,
      },
      {
        type: 'example',
        title: 'Дужки — не вихід',
        expectError: true,
        data: { is_vip: false, big_cart: false, promo_day: true },
        template: '{% if (is_vip and big_cart) or promo_day %}Безкоштовна доставка{% endif %}',
        note: 'Круглі дужки в Liquid зайняті під діапазони — `(1..5)` у циклі `for`, — тому пісочниця намагається прочитати тут діапазон і падає. У Shopify результат не кращий: дужки в умовах — недопустимі символи, тег із ними не працює так, як ти задумав, а строгий парсер повідомляє про синтаксичну помилку.',
      },
      { type: 'h', text: 'contains' },
      {
        type: 'p',
        text: '`contains` уміє дві речі: шукати **підрядок у рядку** і шукати **рядок у масиві рядків**. У другому випадку збіг має бути повним — елемент цілком, а не його частина. Пошук чутливий до регістру в обох випадках.',
      },
      {
        type: 'example',
        title: 'Рядок проти масиву',
        data: { tagline: 'кератин і хіт сезону', tags: ['кератин', 'хіт'] },
        template: `Рядок містить "кера": {% if tagline contains "кера" %}так{% else %}ні{% endif %}
Масив містить "кера": {% if tags contains "кера" %}так{% else %}ні{% endif %}
Масив містить "хіт": {% if tags contains "хіт" %}так{% else %}ні{% endif %}
Масив містить "Хіт": {% if tags contains "Хіт" %}так{% else %}ні{% endif %}`,
        note: 'У рядку «кера» знайшлося як частина слова. У масиві елемента `"кера"` немає — є лише `"кератин"`. Через це `product.tags contains "sale"` не спрацює на тег `"summer-sale"`.',
      },
      {
        type: 'note',
        tone: 'warn',
        title: 'contains не шукає обʼєкти',
        text: 'Масив варіантів, товарів чи позицій кошика — це масив **обʼєктів**, і `contains` у ньому нічого не знайде. Спершу витягни з обʼєктів потрібне поле фільтром [map](/docs/filters/map) — вийде масив рядків, — і вже в ньому шукай. Інший шлях — фільтри [where](/docs/filters/where), [find](/docs/filters/find) або [has](/docs/filters/has).',
      },
      {
        type: 'example',
        title: 'Пошук серед обʼєктів — через map',
        preset: 'product',
        template: `{% assign variant_titles = product.variants | map: "title" -%}
{% if variant_titles contains "400 мл" %}Є фасовка 400 мл{% else %}Фасовки 400 мл немає{% endif %}
{% if product.variants contains "400 мл" %}знайшов{% else %}Напряму в масиві обʼєктів — не знайшов{% endif %}`,
      },
      { type: 'h', text: 'Порівняння різних типів' },
      {
        type: 'p',
        text: 'Liquid не приводить типи при порівнянні. Рядок `"5"` і число `5` — різні значення, і `==` між ними дасть хибу. На це наступають постійно, бо все, що прийшло з **налаштувань-текстів, метаполів-рядків, параметрів URL і фільтра `split`**, — рядки, навіть якщо виглядає як число.',
      },
      {
        type: 'example',
        title: 'Рядок проти числа',
        data: { limit_setting: '5', items_in_cart: 5 },
        template: `{% if limit_setting == items_in_cart %}рівні{% else %}не рівні{% endif %}
{%- assign limit = limit_setting | plus: 0 %}
{% if limit == items_in_cart %}рівні{% else %}не рівні{% endif %}
{% if 5 == 5.0 %}ціле і дробове — рівні{% endif %}`,
        note: '`| plus: 0` — стандартний прийом перетворити рядок на число. У зворотний бік — `| append: ""`.',
      },
      {
        type: 'note',
        tone: 'warn',
        title: 'Більше/менше між рядком і числом',
        text: 'З `>` і `<` гірше, ніж з `==`. У Shopify порівняння рядка з числом (`"5" > 3`) — це помилка рендера: на сторінці зʼявиться `Liquid error` про неможливість порівняти String із числом. Пісочниця тут поблажливіша (JavaScript мовчки приводить типи), тому не покладайся на те, що «в пісочниці працює»: перед `>` / `<` завжди перетворюй рядок на число. Порівняння з `nil` помилки не дає — воно просто хибне.',
      },
      { type: 'h', text: 'Чого в Liquid немає' },
      {
        type: 'list',
        items: [
          '**Операторів у виводі.** `{{ }}` призначений для значення і фільтрів, а не для виразів. Оператори — лише в тегах умов.',
          '**Арифметики знаками.** Немає `+`, `-`, `*`, `/`, `%`. Є фільтри: [plus](/docs/filters/plus), [minus](/docs/filters/minus), [times](/docs/filters/times), [divided_by](/docs/filters/divided_by), [modulo](/docs/filters/modulo).',
          '**Тернарного оператора.** Немає `умова ? а : б`. Є `if` / `else`, `assign` усередині умови та фільтр [default](/docs/filters/default) для запасного значення.',
          '**Заперечення.** Немає `not` і `!` — є `!=` і `unless`.',
        ],
      },
      {
        type: 'example',
        title: 'Арифметика знаком — помилка',
        expectError: true,
        data: { price: 649 },
        template: '{{ price + 100 }}',
        note: 'Правильно — `{{ price | plus: 100 }}`. Поблажливий парсер Shopify в такому місці помилки не покаже, а мовчки надрукує саме `price`, відкинувши хвіст, — і це гірше за помилку, бо число на сторінці є, просто неправильне.',
      },
      {
        type: 'example',
        title: 'Порівняння у виводі: пісочниця і Shopify розходяться',
        data: { price: 649 },
        template: '{{ price > 500 }}',
        shopifyOutput: '649 — поблажливий парсер бере лише перше значення; строгий парсер повідомляє про синтаксичну помилку',
        note: 'LiquidJS, на якому працює пісочниця, уміє обчислювати оператори у виводі — це **його розширення**, а не частина мови. У темі так не пиши. Те саме з `{% assign is_expensive = price > 500 %}`: у Shopify змінна не стане булевою.',
      },
      {
        type: 'example',
        title: 'Чим замінити тернарник',
        data: { price: 649, badge: '' },
        template: `{% if price > 500 %}{% assign tier = "преміум" %}{% else %}{% assign tier = "базовий" %}{% endif -%}
Сегмент: {{ tier }}
Бейдж: {{ badge | default: "без бейджа" }}`,
      },
      {
        type: 'note',
        tone: 'shopify',
        text: 'У темах оператори найчастіше стоять у перевірках наявності й стану: `{% if product.available and product.compare_at_price > product.price %}`, `{% if template.name == "product" %}`, `{% if customer.tags contains "wholesale" %}`. У тезі `case` оператор один — `or` у `when` (або кома): `{% when "Inoar" or "Erayba" %}`.',
      },
      {
        type: 'note',
        tone: 'interview',
        title: 'На співбесіді: «У якому порядку обчислюються and і or?»',
        text: 'Це питання ставлять, щоб відрізнити тих, хто читав документацію. Відповідь: «У Liquid немає пріоритету `and` над `or` і немає дужок. Кілька логічних операторів групуються **справа наліво**: `a and b or c` — це `a and (b or c)`, а не `(a and b) or c`, як у JavaScript. Тому складні умови я не пишу в один рядок: розкладаю на вкладені `if` / `elsif` або рахую проміжний прапорець через `assign`». Якщо попросять приклад — `false and false or true`: JavaScript дасть `true`, Liquid — `false`. Другий типовий гачок — `contains`: шукає підрядок або рядок у масиві рядків, з обʼєктами не працює, потрібен `map`.',
      },
    ],
  },

  /* ───────────────────────── 3. Truthy і falsy ───────────────────────── */
  {
    slug: 'truthy-and-falsy',
    section: 'basics',
    title: 'Truthy і falsy',
    summary:
      'У Liquid falsy лише два значення — `nil` і `false`. Порожній рядок, `0`, порожній масив — truthy. Порожнечу перевіряють через `blank`, `empty` або `.size`.',
    officialUrl: 'https://shopify.github.io/liquid/basics/truthy-and-falsy/',
    related: ['basics/operators', 'basics/types', 'tags/control-flow', 'filters/default', 'filters/size'],
    blocks: [
      {
        type: 'p',
        text: 'Коли в умові стоїть не порівняння, а просто значення — `{% if product.description %}`, — Liquid мусить вирішити, це «так» чи «ні». Значення, які працюють як «так», називають **truthy**, як «ні» — **falsy**. Правило в Liquid коротке: **falsy — лише `nil` і `false`. Усе інше — truthy.**',
      },
      {
        type: 'p',
        text: 'Після JavaScript це правило треба вивчити наново: там falsy ще й `""`, `0`, `NaN`. Liquid успадкував поведінку Ruby, де порожній рядок і нуль — повноцінні значення, а не «нічого».',
      },
      {
        type: 'example',
        title: 'Хто пройде умову',
        data: { empty_string: '', zero: 0, empty_array: [], empty_object: {}, no: false },
        template: `{% if empty_string %}порожній рядок — truthy{% endif %}
{% if zero %}нуль — truthy{% endif %}
{% if empty_array %}порожній масив — truthy{% endif %}
{% if empty_object %}порожній обʼєкт — truthy{% endif %}
{% if no %}false — truthy{% else %}false — falsy{% endif %}
{% if missing %}nil — truthy{% else %}nil — falsy{% endif %}`,
        note: '`missing` у даних немає взагалі — звернення до неіснуючої змінної дає `nil`. Спробуй змінити `zero` на будь-що інше: рядок нікуди не зникне.',
      },
      {
        type: 'table',
        head: ['Значення', 'Приклад', 'В умові'],
        rows: [
          ['`true`', '`product.available`', 'truthy'],
          ['`false`', '`product.available` у розпроданого', '**falsy**'],
          ['`nil`', 'неіснуюча змінна чи властивість', '**falsy**'],
          ['рядок', '`"Шампунь"`', 'truthy'],
          ['порожній рядок', '`""`', 'truthy'],
          ['рядок `"false"`', 'значення з текстового поля', 'truthy — це рядок, не булеве'],
          ['число', '`649`, `-1`, `2.5`', 'truthy'],
          ['нуль', '`0`', 'truthy'],
          ['масив', '`product.tags`', 'truthy'],
          ['порожній масив', 'товар без тегів', 'truthy'],
          ['обʼєкт', '`product`', 'truthy'],
          ['EmptyDrop', 'у Shopify: `pages["nema-takoi"]`', 'truthy'],
        ],
      },
      { type: 'h', text: 'Де це кусається' },
      {
        type: 'p',
        text: 'Найтиповіша помилка в темах — перевірити текстове поле голим `if`. Якщо мерчант лишив поле порожнім, там лежить `""`, а не `nil`, — і обгортка малюється навколо порожнечі.',
      },
      {
        type: 'example',
        title: 'Порожня обгортка',
        view: 'html',
        data: { product: { title: 'Олійка для кінчиків', description: '' } },
        template: `{% if product.description %}
  <div class="description">{{ product.description }}</div>
{% endif %}

{% if product.description != blank %}
  <div class="description">{{ product.description }}</div>
{% else %}
  <p>Опис готується</p>
{% endif %}`,
        note: 'Перша умова пройшла, і у вивід потрапив порожній `div` — у верстці це зайвий відступ або рамка навколо нічого. Друга перевірка чесна.',
      },
      { type: 'h', text: 'Як правильно перевіряти порожнечу' },
      {
        type: 'table',
        head: ['Перевірка', 'Коли істинна', 'Для чого'],
        rows: [
          ['`!= blank`', 'значення не `nil`, не `false`, не порожній рядок, не рядок із самих пробілів, не порожній масив', 'універсальна — став її за замовчуванням'],
          ['`!= empty`', 'рядок / масив / обʼєкт має хоч щось усередині', 'масиви, рядки, EmptyDrop. На `nil` **не реагує**'],
          ['`.size > 0`', 'довжина рядка чи масиву більша за нуль', 'коли кількість ще знадобиться далі'],
          ['`!= nil` або голий `if`', 'значення існує', 'лише щоб відрізнити «є» від «немає», а не «заповнене» від «порожнього»'],
        ],
      },
      {
        type: 'example',
        title: 'blank, empty і size на тих самих даних',
        data: { empty_string: '', spaces: '   ', empty_array: [], no: false },
        template: `           blank | empty | size > 0
""       : {% if empty_string == blank %}так{% else %}ні {% endif %}   | {% if empty_string == empty %}так{% else %}ні {% endif %}   | {% if empty_string.size > 0 %}так{% else %}ні{% endif %}
"   "    : {% if spaces == blank %}так{% else %}ні {% endif %}   | {% if spaces == empty %}так{% else %}ні {% endif %}   | {% if spaces.size > 0 %}так{% else %}ні{% endif %}
[]       : {% if empty_array == blank %}так{% else %}ні {% endif %}   | {% if empty_array == empty %}так{% else %}ні {% endif %}   | {% if empty_array.size > 0 %}так{% else %}ні{% endif %}
nil      : {% if missing == blank %}так{% else %}ні {% endif %}   | {% if missing == empty %}так{% else %}ні {% endif %}   | {% if missing.size > 0 %}так{% else %}ні{% endif %}
false    : {% if no == blank %}так{% else %}ні {% endif %}   | {% if no == empty %}так{% else %}ні {% endif %}   | {% if no.size > 0 %}так{% else %}ні{% endif %}`,
        note: 'Дві різниці, які варто памʼятати. Рядок із самих пробілів: `blank` — так, `empty` — ні, а `.size` чесно рахує три символи. І `nil`: він `blank`, але **не** `empty` — «порожній» може бути лише той, хто існує.',
      },
      {
        type: 'note',
        tone: 'info',
        title: 'blank, empty, nil — що є що',
        text: '`nil` — **значення** «нічого немає» (можна писати й `null`). `empty` і `blank` — не значення, а спеціальні слова для порівняння: їх не надрукуєш і не присвоїш, вони мають сенс лише праворуч від `==` / `!=`. `empty` питає «чи є в тебе вміст?», `blank` — ширше: «чи є тут хоч щось змістовне?». Назви прийшли з Ruby on Rails — методи `empty?` і `blank?`.',
      },
      { type: 'h', text: 'Масиви' },
      {
        type: 'example',
        title: 'Товар без тегів',
        data: { product: { title: 'Кондиціонер щоденний', tags: [] } },
        template: `{% if product.tags %}Голий if: пройшов{% endif %}
{% if product.tags.size > 0 %}size: є теги{% else %}size: тегів немає{% endif %}
{% if product.tags != empty %}empty: є теги{% else %}empty: тегів немає{% endif %}`,
        note: 'Для циклів є ще зручніший шлях — `{% for %}…{% else %}…{% endfor %}`: гілка `else` виконується, коли масив порожній.',
      },
      { type: 'h', text: 'false проти nil' },
      {
        type: 'p',
        text: 'Обидва falsy, але це **різні значення**, і `==` їх розрізняє. Змінна, якої немає, — `nil`, а не `false`. Тому перевірка `== false` мовчки не спрацьовує на відсутньому значенні.',
      },
      {
        type: 'example',
        title: 'Прапорця немає в даних',
        data: { section: { settings: {} } },
        template: `{% if section.settings.show_vendor == false %}вимкнено{% else %}«== false» не спрацювало{% endif %}
{% unless section.settings.show_vendor %}unless спрацював{% endunless %}`,
        note: 'Хочеш зловити і `false`, і `nil` — пиши `unless` або `{% if x != true %}`, а не `== false`.',
      },
      {
        type: 'note',
        tone: 'warn',
        title: 'Рядок "false" — це truthy',
        text: '`{% assign flag = "false" %}` створює **рядок**, і `{% if flag %}` його пропустить. Булеве пишеться без лапок: `{% assign flag = false %}`. Та сама пастка з усім, що прийшло текстом: метаполе типу «текст» зі значенням `false`, параметр із URL, шматок після `split`. Порівнюй такі значення явно: `{% if flag == "true" %}`.',
      },
      {
        type: 'example',
        title: 'Фільтр default дивиться інакше, ніж if',
        data: { empty_string: '', zero: 0, no: false },
        template: `[{{ empty_string | default: "запасне" }}]
[{{ missing | default: "запасне" }}]
[{{ no | default: "запасне" }}]
[{{ no | default: "запасне", allow_false: true }}]
[{{ zero | default: "запасне" }}]`,
        note: 'Для `if` порожній рядок — truthy, а [default](/docs/filters/default) його **підміняє**: фільтр спрацьовує на `nil`, `false` і порожні рядок/масив. Нуль лишається нулем. `allow_false: true` потрібен, коли `false` — законне значення, а не відсутність.',
      },
      {
        type: 'note',
        tone: 'shopify',
        title: 'EmptyDrop',
        text: 'У Shopify звернення до ресурсу, якого не існує, — `pages["nema-takoi"]`, `collections["stara-aktsiia"]`, `all_products["vydalenyi"]` — повертає не `nil`, а **EmptyDrop**: порожній обʼєкт-заглушку. Він truthy, тож `{% if pages["about"] %}` пройде завжди, навіть коли сторінку видалили. Правильно — `{% if pages["about"] != empty %}` або `!= blank`. У пісочниці обʼєкти — звичайний JSON, і відсутній ключ тут дає `nil`, тож наживо цю пастку видно лише в справжній темі.',
      },
      {
        type: 'note',
        tone: 'interview',
        title: 'На співбесіді: «Що в Liquid falsy?»',
        text: 'Відповідь із одного речення плюс наслідок: «Лише `nil` і `false`. Порожній рядок, нуль і порожній масив — truthy, на відміну від JavaScript. Тому `{% if product.description %}` не перевіряє, чи опис заповнений, — для цього я пишу `!= blank`; для масивів — `.size > 0` або `!= empty`». Сильніше звучить, якщо додати різницю: `blank` ловить `nil` і рядки з пробілів, `empty` — ні; і згадати EmptyDrop — неіснуюча сторінка чи колекція в Shopify теж truthy.',
      },
    ],
  },

  /* ───────────────────────── 4. Типи ───────────────────────── */
  {
    slug: 'types',
    section: 'basics',
    title: 'Типи даних',
    summary:
      'String, Number, Boolean, Nil, Array, EmptyDrop — плюс обʼєкти платформи. Масив не можна записати літералом (лише `split`), `nil` нічого не друкує, а до властивостей дістаються крапкою або `["ключем"]`.',
    officialUrl: 'https://shopify.github.io/liquid/basics/types/',
    related: ['basics/truthy-and-falsy', 'basics/operators', 'tags/variable', 'filters/split', 'filters/size', 'filters/map'],
    blocks: [
      {
        type: 'p',
        text: 'Liquid — мова з динамічними типами: змінну не оголошують із типом, тип має **значення**. Базових типів шість, і ще є обʼєкти, які дає платформа. Створити власноруч можна лише рядок, число, булеве й `nil` (літералом) та масив (обхідним шляхом). Обʼєкт у шаблоні створити неможливо — їх лише отримують.',
      },
      {
        type: 'table',
        head: ['Тип', 'Як виглядає', 'Як зʼявляється в шаблоні'],
        rows: [
          ['String', '`"текст"` або `\'текст\'`', 'літерал, `capture`, більшість фільтрів'],
          ['Number', '`25`, `-3`, `39.95`', 'літерал, математичні фільтри'],
          ['Boolean', '`true`, `false`', 'літерал без лапок, властивості на кшталт `product.available`'],
          ['Nil', '`nil` (або `null`)', 'усе, чого не існує'],
          ['Array', '—', '`split`, властивості обʼєктів (`product.tags`), фільтри масивів'],
          ['EmptyDrop', '—', 'у Shopify: звернення до неіснуючого ресурсу'],
          ['Обʼєкт', '—', 'лише від платформи: `product`, `cart`, `section`…'],
        ],
      },
      { type: 'h', text: 'String' },
      {
        type: 'example',
        title: 'Рядки: лапки на вибір',
        template: `{% assign single = 'Олійка "Шовк"' -%}
{% assign double = "Об'єм 50 мл" -%}
{{ single }} — {{ double }}
Довжина: {{ single.size }}`,
        note: 'Одинарні й подвійні лапки рівноправні, екранування (`\\"`) у Liquid немає — тож лапку всередині рядка дозволяє лише інший вид лапок зовні. Якщо потрібні обидва види — збирай рядок через `capture`.',
      },
      { type: 'h', text: 'Number' },
      {
        type: 'p',
        text: 'Числа бувають цілі й дробові (з крапкою). Різниця не косметична: від неї залежить результат ділення. Ціле на ціле ділиться **націло** — так поводиться Ruby, на якому написано оригінальний рушій.',
      },
      {
        type: 'example',
        title: 'Ціле і дробове',
        template: `{{ 10 | divided_by: 4 }}
{{ 10 | divided_by: 4.0 }}
{{ 64900 | divided_by: 100 }}
{{ 7 | plus: 0.5 }}`,
        note: 'Хочеш дробовий результат — зроби дробовим **дільник**. Третій рядок — знайома ситуація: ціни в Shopify зберігаються в копійках цілим числом.',
      },
      {
        type: 'note',
        tone: 'warn',
        title: 'Число, яке насправді рядок',
        text: 'Усе, що повернув `split`, прийшло з текстового налаштування чи з `capture`, — рядок, навіть якщо складається з цифр. `"5" == 5` — хибно. Перетворити рядок на число: `| plus: 0`; число на рядок: `| append: ""`. Дізнатися справжній тип допомагає фільтр `json` — рядок він надрукує в лапках.',
      },
      {
        type: 'example',
        title: 'json як рентген типу',
        data: { from_setting: '5' },
        template: `{{ from_setting | json }}
{{ 5 | json }}
{%- assign as_number = from_setting | plus: 0 %}
{{ as_number | json }}
{{ true | json }} {{ "true" | json }}`,
      },
      { type: 'h', text: 'Boolean і Nil' },
      {
        type: 'example',
        title: 'nil нічого не друкує',
        data: { product: { title: 'Маска', available: false } },
        template: `available: [{{ product.available }}]
subtitle: [{{ product.subtitle }}]
глибше: [{{ product.subtitle.text.more }}]
nil: [{{ nil }}]`,
        note: '`false` друкується словом, а `nil` — порожнечею. І ланцюжок крапок через неіснуючу властивість не падає: `nil.щось` — це знову `nil`. Жодних «Cannot read properties of undefined».',
      },
      {
        type: 'p',
        text: 'Зворотний бік цієї поблажливості — одруківки не видно. `{{ product.titel }}` не дасть помилки, просто порожнє місце. Якщо щось «не виводиться», перше, що варто зробити, — надрукувати обʼєкт рівнем вище через `| json` і перевірити імʼя поля.',
      },
      { type: 'h', text: 'Array' },
      {
        type: 'p',
        text: 'Літерала масиву в Liquid **немає**: `{% assign sizes = ["S", "M"] %}` не спрацює. Масив можна лише отримати — з обʼєкта (`product.tags`, `collection.products`) або зробити з рядка фільтром [split](/docs/filters/split). Додати елемент теж нічим, окрім [concat](/docs/filters/concat) з іншим масивом.',
      },
      {
        type: 'example',
        title: 'Створити масив і дістатися до елементів',
        template: `{% assign volumes = "250 мл,400 мл,1000 мл" | split: "," -%}
Перший: {{ volumes[0] }} / {{ volumes.first }}
Останній: {{ volumes.last }}
Кількість: {{ volumes.size }}
Поза межами: [{{ volumes[9] }}]
Як є: {{ volumes }}
Через join: {{ volumes | join: ", " }}`,
        note: 'Індекси — з нуля. Вихід за межі — `nil`, без помилки. Масив, надрукований «як є», склеюється без роздільників — для людського вигляду потрібен [join](/docs/filters/join).',
      },
      {
        type: 'example',
        title: 'Порожній масив з нічого',
        template: `{% assign cart_tags = "" | split: "," -%}
Розмір: {{ cart_tags.size }}
{% assign more = "подарунок,знижка" | split: "," -%}
{% assign cart_tags = cart_tags | concat: more -%}
Після concat: {{ cart_tags | join: " + " }}`,
        note: 'Так у темах «накопичують» список у циклі: стартують із порожнього масиву й доклеюють через `concat`.',
      },
      { type: 'h', text: 'Обʼєкти і доступ до властивостей' },
      {
        type: 'p',
        text: 'Обʼєкт — набір іменованих властивостей. Є два способи дістатися до властивості: **крапка** і **квадратні дужки**. Крапка коротша й годиться для звичайних імен. Дужки потрібні, коли ключ містить дефіс чи пробіл, коли це handle ресурсу — або коли ключ лежить у змінній.',
      },
      {
        type: 'example',
        title: 'Крапка, дужки і змінна як ключ',
        preset: 'product',
        template: `{{ product.vendor }}
{{ product["vendor"] }}
{%- assign field = "vendor" %}
{{ product[field] }}
{{ linklists["main-menu"].title }}
{{ product.variants[1].title }} / {{ product.variants.last.available }}`,
        note: '`product[field]` — без лапок: це **змінна**, і Liquid підставляє її значення як ключ. З лапками — `product["field"]` — шукалася б властивість із буквальним імʼям `field`. `linklists.main-menu` через крапку не напишеш: дефіс у ключі вимагає дужок.',
      },
      {
        type: 'note',
        tone: 'shopify',
        text: 'У Shopify обʼєкти — це **Drop-и**: обгортки, які показують шаблону лише дозволені властивості й рахують їх ліниво, у момент звернення. Звідси `collections["home-care"]`, `all_products["keratin-shampoo"]`, `pages["about"]` — доступ до ресурсу за handle через дужки. Динамічний ключ — основа багатьох прийомів теми: `settings[setting_id]`, `section.settings[key]`, `product.metafields.custom[field_name]`. Надрукований цілком, Drop дає службову назву на кшталт `ProductDrop`; у пісочниці обʼєкти — звичайний JSON, тож тут буде `[object Object]`.',
      },
      { type: 'h', text: 'EmptyDrop' },
      {
        type: 'p',
        text: 'Коли в Shopify просиш ресурс, якого немає, отримуєш не `nil`, а **EmptyDrop** — порожню заглушку. Будь-яка її властивість — `nil`, сама вона truthy, а з `empty` порівнюється як рівна. Перевіряють саме так:',
      },
      {
        type: 'code',
        lang: 'liquid',
        title: 'Неіснуюча сторінка в темі Shopify',
        code: `{% assign about = pages["about-us"] %}

{% if about %}
  {% # пройде ЗАВЖДИ — EmptyDrop теж truthy %}
{% endif %}

{% if about != empty %}
  <h2>{{ about.title }}</h2>
  {{ about.content }}
{% endif %}`,
      },
      {
        type: 'note',
        tone: 'info',
        title: 'Діапазон',
        text: 'Окремо від шести типів стоїть діапазон `(1..5)` — його приймає цикл `for`: `{% for i in (1..product.variants.size) %}`. Межами можуть бути числа або змінні. Деталі — на сторінці [Цикли](/docs/tags/iteration).',
      },
      {
        type: 'note',
        tone: 'interview',
        title: 'На співбесіді: «Як створити масив у Liquid?»',
        text: 'Відповідь: «Літерала масиву немає. Масив або приходить з обʼєкта — `product.tags`, `collection.products`, — або робиться з рядка фільтром `split`. Порожній масив — `"" | split: ","`, додати елементи — `concat`. До елементів — `[0]`, `.first`, `.last`, кількість — `.size`». Далі зазвичай питають про типи загалом: назви шість базових (String, Number, Boolean, Nil, Array, EmptyDrop), скажи, що `nil` друкується порожнечею й не ламає ланцюжок крапок, що цілочисельне ділення — спадок Ruby, і що рядок `"5"` не дорівнює числу `5`.',
      },
    ],
  },

  /* ───────────────────────── 5. Різновиди ───────────────────────── */
  {
    slug: 'variations',
    section: 'basics',
    title: 'Різновиди Liquid',
    summary:
      'Liquid — відкрита мова з багатьма реалізаціями: Ruby-оригінал, діалект Shopify, Jekyll, LiquidJS. Синтаксис і базові теги/фільтри спільні; обʼєкти й більшість «магазинних» тегів і фільтрів — розширення платформи.',
    officialUrl: 'https://shopify.github.io/liquid/basics/variations/',
    related: ['basics/sandbox', 'basics/introduction', 'shopify/architecture', 'shopify/objects-overview', 'shopify/deprecated'],
    blocks: [
      {
        type: 'p',
        text: 'Liquid — не «мова Shopify» у тому сенсі, в якому Liquid-шаблони з теми можна запустити лише там. Це **відкрита мова**: є специфікація поведінки (фактично — Ruby-реалізація та її тести), і є багато незалежних рушіїв та платформ, які її використовують. Кожна платформа бере спільне ядро й додає **своє**: обʼєкти, теги, фільтри.',
      },
      { type: 'h', text: 'Ядро і діалекти' },
      {
        type: 'table',
        head: ['Різновид', 'Що це', 'Що додає поверх ядра'],
        rows: [
          ['**Liquid (Ruby)**', 'оригінал, gem `liquid`, репозиторій Shopify/liquid. Його описує shopify.github.io/liquid', 'нічого — це і є ядро: синтаксис, `if` / `for` / `assign` / `capture` / `render`…, базові фільтри рядків, чисел, масивів, дат'],
          ['**Shopify Liquid**', 'те саме ядро всередині платформи Shopify. Його описує shopify.dev/docs/api/liquid', 'обʼєкти магазину (`product`, `cart`, `customer`…), теги теми (`section`, `schema`, `form`, `paginate`, `style`, `content_for`, `layout`), сотні фільтрів (`money`, `image_url`, `asset_url`, `t`, `handleize`…)'],
          ['**Jekyll Liquid**', 'генератор статичних сайтів (на ньому працює GitHub Pages); використовує той самий Ruby-gem', 'обʼєкти `site`, `page`, `post`; теги `highlight`, `link`, `post_url`, власний `include`; фільтри `slugify`, `jsonify`, `markdownify`, `relative_url`, `where_exp`'],
          ['**LiquidJS**', 'незалежна реалізація на JavaScript; на ній працює ця пісочниця, її ж використовує генератор Eleventy', 'ядро плюс частина фільтрів Jekyll; власні розширення на кшталт операторів у `{{ }}`'],
          ['Інші', 'реалізації на Python, Go, .NET, PHP; Liquid у Microsoft Power Pages, Braze та інших продуктах', 'у кожного — свій набір обʼєктів і фільтрів'],
        ],
      },
      { type: 'h', text: 'Що спільне' },
      {
        type: 'p',
        text: 'Усе, що описано в розділах «Основи», «Теги» і «Фільтри» цього довідника, — ядро. Воно працює однаково (з точністю до дрібниць) у будь-якому діалекті: вивчивши його на Shopify, ти вже вмієш писати шаблони для Jekyll.',
      },
      {
        type: 'example',
        title: 'Чисте ядро: працює всюди',
        template: `{% assign brands = "inoar,cocochoco,erayba" | split: "," | sort -%}
{% for brand in brands -%}
  {{ forloop.index }}. {{ brand | capitalize }}
{% endfor %}`,
        note: 'Тут немає нічого платформного: `assign`, `for`, `forloop`, `split`, `sort`, `capitalize` є в кожній реалізації.',
      },
      { type: 'h', text: 'Що платформне' },
      {
        type: 'example',
        title: 'Діалект Shopify',
        preset: 'product',
        template: `{{ product.price | money }}
{{ product.featured_image | image_url: width: 400 }}
{{ "Keratin Shampoo 400ml" | handleize }}`,
        note: 'Обʼєкт `product`, фільтри `money`, `image_url`, `handleize` існують лише в Shopify. У пісочниці вони **емулюються** — відтворено форму результату, а адреса CDN вигадана. Що саме емулюється — на сторінці [Про пісочницю](/docs/basics/sandbox).',
      },
      {
        type: 'example',
        title: 'Тег із Jekyll тут не існує',
        expectError: true,
        template: '{% highlight ruby %}\nputs "Привіт"\n{% endhighlight %}',
        note: '`highlight` — підсвічування коду в Jekyll. Ні в ядрі, ні в Shopify такого тегу немає. Так само у зворотний бік: `{% section %}` чи `{% schema %}` у Jekyll — невідомі теги.',
      },
      {
        type: 'example',
        title: 'Фільтр із Jekyll, який тут раптом працює',
        template: '{{ "Liquid Lab" | slugify }}',
        note: '`slugify` — фільтр Jekyll; LiquidJS підтримує його з коробки, тому пісочниця його виконує. У Shopify фільтра `slugify` **не існує** — ту саму роботу там робить `handleize`. Хороша ілюстрація, чому код зі Stack Overflow «про Liquid» треба перевіряти: він може бути про інший діалект.',
      },
      {
        type: 'note',
        tone: 'warn',
        title: 'Однакова назва — різна поведінка',
        text: 'Найпідступніший випадок — `include`. У Jekyll це основний спосіб підключити файл (`{% include header.html %}`, імʼя без лапок, параметри доступні як `include.param`). У Shopify `include` **застарів** і замінений на [render](/docs/shopify/snippets-render) з ізольованою областю видимості. Приклад із Jekyll-блогу в темі Shopify не запрацює, навіть якщо тег називається так само.',
      },
      { type: 'h', text: 'Де розходяться самі рушії' },
      {
        type: 'p',
        text: 'Навіть ядро в різних реалізаціях збігається не на сто відсотків: рушії написані різними мовами, і типи чисел, сортування чи обробка помилок у них трохи різні. Два приклади, які видно просто тут:',
      },
      {
        type: 'example',
        title: 'Ціле дробове',
        template: '{{ 4.0 | times: 2 }}',
        shopifyOutput: '8.0',
        note: 'Ruby памʼятає, що `4.0` — дробове, і результат теж друкує дробовим. У JavaScript `4.0` і `4` — одне число.',
      },
      {
        type: 'example',
        title: 'Оператор у виводі',
        data: { stock: 3 },
        template: '{{ stock > 0 }}',
        shopifyOutput: '3 — поблажливий парсер бере лише перше значення; строгий парсер повідомляє про синтаксичну помилку',
        note: 'LiquidJS обчислює порівняння у `{{ }}` — це його розширення. У мові, як її розуміє Shopify, оператори існують лише в тегах умов.',
      },
      {
        type: 'note',
        tone: 'shopify',
        text: 'Усередині самого Shopify Liquid теж не однаковий скрізь. Набір обʼєктів залежить від контексту: у темі є `product` і `cart`, у шаблонах листів — `order` і свої змінні, у Shopify Flow — власний набір. Теги `section` і `schema` мають сенс лише в темах. Коли читаєш документацію, дивись, про який контекст вона.',
      },
      {
        type: 'note',
        tone: 'tip',
        title: 'Як читати документацію',
        text: 'Два офіційні джерела — про різне. **shopify.github.io/liquid** описує ядро: якщо щось є там, воно працює всюди. **shopify.dev/docs/api/liquid** описує діалект Shopify: ядро плюс усе платформне, з позначками deprecated. Для роботи з темами головне — друге; перше корисне, щоб розуміти, що з твоїх знань переноситься на інші платформи.',
      },
      {
        type: 'note',
        tone: 'interview',
        title: 'На співбесіді: «Liquid — це лише Shopify?»',
        text: 'Відповідь: «Ні. Liquid — відкрита мова шаблонів, яку створили в Shopify, але використовують і поза ним: Jekyll та GitHub Pages, Eleventy через LiquidJS, низка SaaS-продуктів. Спільне в усіх — синтаксис і ядро: `if`, `for`, `assign`, базові фільтри. Платформне — обʼєкти і розширення: `product`, `{% section %}`, `{% schema %}`, `money`, `image_url` існують лише в Shopify, так само як `site` і `highlight` — лише в Jekyll». Якщо питають про практичний наслідок — скажи, що приклади з інтернету треба звіряти з діалектом, і згадай `include`: у Jekyll це норма, у Shopify — deprecated на користь `render`.',
      },
    ],
  },

  /* ───────────────────────── 6. Пробіли ───────────────────────── */
  {
    slug: 'whitespace',
    section: 'basics',
    title: 'Керування пробілами',
    summary:
      'Дефіс у дужках — `{%-`, `-%}`, `{{-`, `-}}` — зрізає всі пробіли й переноси рядків з відповідного боку. Потрібно там, де зайвий пробіл видно: inline-елементи, атрибути, JSON, текстові листи.',
    officialUrl: 'https://shopify.github.io/liquid/basics/whitespace/',
    related: ['basics/introduction', 'tags/template', 'tags/control-flow', 'filters/strip', 'filters/strip_newlines', 'shopify/performance'],
    blocks: [
      {
        type: 'p',
        text: 'Liquid копіює у вивід **усе**, що стоїть поза його дужками, — включно з переносами рядків і відступами, якими ти форматуєш код шаблону. Тег нічого не друкує, але рядок, на якому він стояв, нікуди не зникає: від нього лишається порожній рядок із відступом.',
      },
      {
        type: 'example',
        title: 'Звідки беруться порожні рядки',
        data: { sizes: ['250 мл', '400 мл', '1000 мл'] },
        template: `<ul>
{% for size in sizes %}
  <li>{{ size }}</li>
{% endfor %}
</ul>`,
        note: 'Кожен прохід циклу друкує перенос після `{% for %}`, сам `<li>` і перенос після нього. Плюс рядок від `{% endfor %}`. У HTML-списку це нешкідливо — браузер такі пробіли ігнорує. Але не всюди.',
      },
      { type: 'h', text: 'Дефіс: що саме він зрізає' },
      {
        type: 'p',
        text: 'Дефіс, дописаний до дужки зсередини, зрізає **всі пробільні символи** — пробіли, табуляції й переноси рядків — з того боку, куди «дивиться» дужка, аж до першого непробільного символу. Кількість не має значення: один пробіл чи пʼять порожніх рядків — зникне все.',
      },
      {
        type: 'table',
        head: ['Запис', 'Що зрізає'],
        rows: [
          ['`{%- тег %}`', 'усе пробільне **перед** тегом'],
          ['`{% тег -%}`', 'усе пробільне **після** тегу'],
          ['`{%- тег -%}`', 'з обох боків'],
          ['`{{- вивід }}`', 'усе пробільне **перед** виводом'],
          ['`{{ вивід -}}`', 'усе пробільне **після** виводу'],
          ['`{{- вивід -}}`', 'з обох боків'],
        ],
      },
      {
        type: 'example',
        title: 'Дефіс зліва: акуратний список',
        data: { sizes: ['250 мл', '400 мл', '1000 мл'] },
        template: `<ul>
{%- for size in sizes %}
  <li>{{ size }}</li>
{%- endfor %}
</ul>`,
        note: '`{%-` зʼїдає перенос рядка **перед** тегом, тож сам тег ніби «приклеюється» до попереднього рядка. Перенос після тегу лишається — саме він ставить кожен `<li>` на новий рядок.',
      },
      {
        type: 'example',
        title: 'Дефіси з обох боків: усе в один рядок',
        data: { sizes: ['250 мл', '400 мл', '1000 мл'] },
        template: `<ul>
{%- for size in sizes -%}
  <li>{{ size }}</li>
{%- endfor -%}
</ul>`,
        note: 'Зрізано і до, і після кожного тегу — між елементами не лишилось жодного символу. Так пишуть, коли пробіл між елементами шкодить верстці.',
      },
      { type: 'h', text: 'Коли це справді важливо' },
      {
        type: 'list',
        items: [
          '**Inline-елементи й текст.** Пробіл між `inline-block`-елементами — це видима щілина; перенос перед комою чи дужкою — це пробіл перед розділовим знаком.',
          '**Атрибути.** `class="card  card--sale "` працює, але засмічує розмітку й ламає порівняння рядків у JS і тестах.',
          '**JSON і `<script>`.** JSON-LD, дані для JS, відповіді секцій через Section Rendering API — порожні рядки там лише шум, а пробіл усередині значення — вже помилка в даних.',
          '**Текстові формати.** Лист у plain text, CSV, robots.txt, XML-фід: тут кожен перенос рядка видно читачеві або парсеру.',
          '**Службові теги на початку файлу.** Десять `assign` угорі сніпета — це десять порожніх рядків у HTML перед першим тегом.',
        ],
      },
      {
        type: 'example',
        title: 'Текст: пробіл перед дужкою',
        view: 'html',
        data: { count: 3 },
        template: `<a href="/cart">
  Кошик
  {% if count > 0 %}
    ({{ count }})
  {% endif %}
</a>

<a href="/cart">Кошик
  {%- if count > 0 %} ({{ count }}){% endif -%}
</a>`,
        note: 'Перше посилання містить переноси й відступи навколо тексту: браузер згорне їх у пробіли, і підкреслення посилання захопить зайвий пробіл на початку і в кінці. У другому тексті рівно один пробіл — той, який ти поставив сам.',
      },
      {
        type: 'example',
        title: 'Атрибут class',
        data: { on_sale: true },
        template: `<div class="card {% if on_sale %} card--sale {% endif %}">
<div class="card{% if on_sale %} card--sale{% endif %}">`,
        note: 'Тут дефіси не потрібні взагалі — достатньо не ставити пробілів усередині умови. Керування пробілами починається з того, **де** ти їх пишеш; дефіс — інструмент для випадків, коли код хочеться форматувати в кілька рядків.',
      },
      {
        type: 'example',
        title: 'JSON із циклу',
        data: { sizes: ['250 мл', '400 мл', '1000 мл'] },
        template: `{
  "sizes": [
    {%- for size in sizes %}
    "{{ size }}"{% unless forloop.last %},{% endunless %}
    {%- endfor %}
  ]
}`,
        note: 'Без дефісів між елементами були б порожні рядки. У справжній темі окремі значення краще друкувати через `| json` — він сам поставить лапки й екранує вміст.',
      },
      {
        type: 'example',
        title: 'Службові теги на початку',
        data: { name: 'Софія' },
        template: `{%- assign greeting = "Привіт" -%}
{%- assign mark = "!" -%}
{{ greeting }}, {{ name }}{{ mark }}`,
        note: 'Прибери дефіси — і перед «Привіт» зʼявляться два порожні рядки: по одному від кожного `assign`. У текстовому листі клієнтка побачила б їх буквально.',
      },
      {
        type: 'note',
        tone: 'warn',
        title: 'Дефіс зʼїдає і потрібні пробіли',
        text: 'Дефіс не розрізняє «сміттєві» переноси й пробіл між словами. `Бренд: {{- vendor -}} , у наявності` дасть `Бренд:Inoar, у наявності` — пробіл після двокрапки зник разом з усім іншим. Типовий симптом надмірного завзяття — слова, що злиплися (`Кошик(3)`, `від649 ₴`). Правило: дефіс ставлять із того боку, де стоїть **перенос рядка для форматування коду**, а не там, де пробіл є частиною тексту.',
      },
      {
        type: 'example',
        title: 'Злиплі слова',
        data: { vendor: 'Inoar' },
        template: `Бренд: {{- vendor -}} , у наявності
Бренд: {{ vendor }}, у наявності`,
      },
      { type: 'h', text: 'Тег liquid: менше дужок — менше проблеми' },
      {
        type: 'p',
        text: 'Коли логіки багато, а виводу мало, замість десятка `{%- … -%}` зручніше написати один блок `{% liquid %}`: усередині нього теги йдуть по одному на рядок без дужок, і переноси між ними у вивід не потрапляють. Друкує всередині блока тег `echo`.',
      },
      {
        type: 'example',
        title: 'Один блок замість пʼяти тегів',
        preset: 'cart',
        template: `{%- liquid
  assign units = 0
  for item in cart.items
    assign units = units | plus: item.quantity
  endfor
-%}
Одиниць у кошику: {{ units }}`,
      },
      {
        type: 'note',
        tone: 'shopify',
        text: 'У темах дефіси — звична справа: службові `assign` і `capture` майже завжди пишуть як `{%- … -%}`, а логіку на початку секцій і сніпетів — блоком `{% liquid %}`. На швидкість рендера це не впливає; трохи меншає HTML, але після gzip різниця мізерна. Справжня причина — коректність там, де пробіл видно: меню з `inline-block`, ціни, хлібні крихти, JSON-LD, шаблони листів.',
      },
      {
        type: 'note',
        tone: 'tip',
        text: 'Дефіс чистить пробіли **навколо** тегу, а не всередині значення. Якщо зайві пробіли сидять у самих даних (назва з пробілом у кінці, результат `capture` з відступами), потрібні фільтри: [strip](/docs/filters/strip), [lstrip](/docs/filters/lstrip), [rstrip](/docs/filters/rstrip), [strip_newlines](/docs/filters/strip_newlines).',
      },
      {
        type: 'note',
        tone: 'interview',
        title: 'На співбесіді: «Навіщо дефіс у {%- -%}?»',
        text: 'Відповідь: «Це керування пробілами. Liquid копіює у вивід усе поза своїми дужками, тож від кожного тегу лишається порожній рядок. Дефіс зрізає всі пробільні символи, включно з переносами, з відповідного боку: `{%-` — ліворуч від тегу, `-%}` — праворуч; для виводу так само `{{-` і `-}}`. У звичайному HTML це косметика, але є місця, де це питання коректності: пробіли між inline-елементами, значення атрибутів, JSON у `<script>`, текстові листи». Сильніше — додати застереження: дефіс не розрізняє форматування і змістовний пробіл, тому бездумне `{{- … -}}` склеює слова; і згадати `{% liquid %}` як спосіб узагалі не плодити дужки.',
      },
    ],
  },
]
