import type { DocPage } from '../types'

export const filtersC: DocPage[] = [
  /* ───────────────────────── round ───────────────────────── */
  {
    slug: 'round',
    section: 'filters',
    title: 'round',
    category: 'math',
    syntax: 'number | round: number',
    summary:
      'Округлює число до найближчого цілого або до заданої кількості знаків після коми. Головний напарник `times` і `divided_by` у розрахунках цін і відсотків.',
    officialUrl: 'https://shopify.github.io/liquid/filters/round/',
    related: ['filters/ceil', 'filters/floor', 'filters/divided_by', 'filters/times', 'shopify/money-filters'],
    blocks: [
      {
        type: 'p',
        text: '`round` округлює за шкільним правилом: від половини й вище — вгору, менше половини — вниз. Без параметра виходить ціле число, з параметром — дріб із заданою кількістю знаків. У темах він майже завжди стоїть **останнім** у ланцюжку арифметики: порахували відсоток знижки чи ціну за 100 мл — і привели до вигляду, який не соромно показати покупцеві.',
      },
      {
        type: 'example',
        title: 'Базовий випадок',
        template: '{{ 4.4 | round }}\n{{ 4.6 | round }}\n{{ 2.5 | round }}',
        note: 'Рівно половина округлюється вгору. На відміну від [floor](/docs/filters/floor) і [ceil](/docs/filters/ceil), напрямок залежить від дробової частини.',
      },
      { type: 'h', text: 'Параметри' },
      {
        type: 'table',
        head: ['Параметр', 'Тип', 'Що робить'],
        rows: [['знаків (необовʼязковий)', 'number', 'Скільки знаків лишити після коми. Без нього — округлення до цілого.']],
      },
      {
        type: 'example',
        title: 'До заданої кількості знаків',
        template: '{{ 3.14159 | round: 2 }}\n{{ 259.637 | round: 1 }}',
      },
      {
        type: 'example',
        title: 'Ціна за 1 мл',
        preset: 'product',
        template: `{% assign per_ml = product.price | divided_by: 250.0 %}
Сирий результат: {{ per_ml }}
Після round: {{ per_ml | round }}
Для покупця: {{ per_ml | round | money }} за 1 мл`,
        note: 'Ціна лежить у копійках. Після ділення виходить дробова кількість копійок — такого в грошах не буває, тож перед `money` число повертаємо до цілого.',
      },
      {
        type: 'example',
        title: 'Відсоток знижки: націло чи до найближчого',
        preset: 'product',
        template: `{%- assign saved = product.compare_at_price | minus: product.price -%}
{{ saved | times: 100 | divided_by: product.compare_at_price }}%
{{ saved | times: 100.0 | divided_by: product.compare_at_price | round }}%`,
        shopifyOutput: '18%\n19%',
        note: 'Справжня знижка — 18,77%. Перший рядок ділить ціле на ціле, тобто **відкидає** дробову частину. Другий множить на `100.0`, у Shopify ділення стає дробовим, і `round` чесно дає 19. Пісочниця «дробовість» бачить лише в літералі дільника, тому тут обидва рядки однакові — орієнтуйся на рядок «У Shopify».',
      },
      {
        type: 'example',
        title: 'Межові випадки: рядок, nil, не число',
        template: '{{ "7.8" | round }}\n{{ nil | round }}\n{{ "кератин" | round }}',
        note: 'Рядок із числом перетворюється на число. Усе, що числом не є, стає нулем — без помилки. Тому опечатка в імені змінної дасть тихий `0`, а не попередження.',
      },
      {
        type: 'note',
        tone: 'warn',
        title: 'Пастка: округляти вже нічого',
        text: '`{{ 10 | divided_by: 4 | round }}` дасть `2`, а не `3`. Ціле на ціле ділиться **націло**, і до `round` доходить уже `2`. Щоб округлення мало сенс, зроби ділення дробовим: `divided_by: 4.0` або `times: 1.0` перед діленням. Деталі — на сторінці [divided_by](/docs/filters/divided_by).',
      },
      {
        type: 'note',
        tone: 'shopify',
        text: 'Усі ціни в Shopify — цілі числа в найменших одиницях валюти (копійки, центи). Будь-яка власна арифметика з ціною (знижка у відсотках, ціна за одиницю обʼєму, розбивка на платежі) закінчується звʼязкою `| round | money`. Сам відсоток знижки теж зазвичай показують цілим: «−19%», а не «−18,77%».',
      },
      {
        type: 'note',
        tone: 'interview',
        title: 'На співбесіді',
        text: 'Типове завдання: «виведи відсоток знижки з `price` і `compare_at_price`». Від тебе чекають трьох речей: що ціни в копійках; що `divided_by` з цілими ділить націло, тому потрібен дробовий множник (`times: 100.0`); і що результат треба пропустити через `round`. Бонус — згадати, що `round` іде до найближчого, `floor` завжди вниз, `ceil` завжди вгору, і пояснити, який із них чесніший для бейджа знижки.',
      },
    ],
  },

  /* ───────────────────────── rstrip ───────────────────────── */
  {
    slug: 'rstrip',
    section: 'filters',
    title: 'rstrip',
    category: 'string',
    syntax: 'string | rstrip',
    summary: 'Прибирає пробіли, табуляції й переноси рядка **праворуч** від тексту. Лівий край і середину не чіпає.',
    officialUrl: 'https://shopify.github.io/liquid/filters/rstrip/',
    related: ['filters/strip', 'filters/lstrip', 'filters/strip_newlines', 'basics/whitespace'],
    blocks: [
      {
        type: 'p',
        text: '`rstrip` — «права» половина фільтра [strip](/docs/filters/strip). Він зрізає все пробільне в кінці рядка: пробіли, табуляції, переноси. Параметрів не має. Потрібен рідше за `strip`, але має свою нішу: коли відступ **зліва** значущий (вирівнювання, вкладеність у текстовому виводі), а хвіст — сміття.',
      },
      {
        type: 'example',
        title: 'Базовий випадок',
        template: '[{{ "   кератин   " | rstrip }}]\n[{{ "   кератин   " | lstrip }}]\n[{{ "   кератин   " | strip }}]',
        note: 'Квадратні дужки тут лише для того, щоб побачити пробіли. `rstrip` лишив три пробіли зліва.',
      },
      {
        type: 'example',
        title: 'Хвіст після capture',
        preset: 'product',
        template: `{% capture label %}
  {{ product.vendor }}
{% endcapture %}
[{{ label | rstrip }}]
Довжина: {{ label | size }} → {{ label | rstrip | size }}`,
        note: 'Усе, що стоїть між `capture` і `endcapture`, потрапляє в змінну — разом із переносами й відступами з редактора. `rstrip` прибрав перенос у кінці, але перенос і два пробіли на початку лишилися.',
      },
      {
        type: 'example',
        title: 'Чого rstrip НЕ вміє',
        preset: 'product',
        template: `{% capture list %}{% for tag in product.tags %}{{ tag }}, {% endfor %}{% endcapture %}
[{{ list | rstrip }}]
[{{ list | rstrip | remove_last: "," }}]
[{{ product.tags | join: ", " }}]`,
        note: 'Фільтр прибирає **лише пробільні символи**. Кома в кінці лишилась — її знімає [remove_last](/docs/filters/remove_last). А взагалі такий рядок правильно збирати через [join](/docs/filters/join): роздільник ставиться лише **між** елементами.',
      },
      {
        type: 'example',
        title: 'Межові випадки',
        template: '[{{ nil | rstrip }}]\n[{{ 42 | rstrip }}]\n[{{ "   " | rstrip }}]',
        note: '`nil` стає порожнім рядком, число — рядком. Рядок із самих пробілів перетворюється на порожній.',
      },
      {
        type: 'note',
        tone: 'warn',
        title: 'Пастка',
        text: 'У Python `rstrip(",")` приймає символи, які треба зрізати. У Liquid від Shopify параметрів у цього фільтра **немає** — лише пробільні символи. Пісочниця тут поблажливіша: LiquidJS як власне розширення приймає `rstrip: ","` і справді зріже кому, але в темі так не спрацює. Для символів бери [remove_last](/docs/filters/remove_last) або [replace_last](/docs/filters/replace_last).',
      },
      {
        type: 'note',
        tone: 'shopify',
        text: 'У темах зайві пробіли частіше прибирають не фільтром, а дефісами в тегах: `{%- … -%}` і `{{- … -}}` (див. [керування пробілами](/docs/basics/whitespace)). Різниця принципова: дефіс чистить **розмітку довкола тегу**, а `rstrip` чистить **значення змінної** — наприклад, текст із метаполя чи налаштування, куди мерчант випадково вставив перенос у кінці.',
      },
      {
        type: 'note',
        tone: 'interview',
        title: 'На співбесіді',
        text: 'Окремо про `rstrip` питають рідко, зате люблять питання «чим `strip` відрізняється від `{%- -%}`». Відповідь: фільтри `strip` / `lstrip` / `rstrip` працюють із **даними** — рядком, який уже лежить у змінній. Дефіси працюють із **шаблоном** — вони прибирають пробіли між тегами під час рендеру й на вміст змінних не впливають.',
      },
    ],
  },

  /* ───────────────────────── size ───────────────────────── */
  {
    slug: 'size',
    section: 'filters',
    title: 'size',
    category: 'array',
    syntax: 'variable | size',
    summary:
      'Повертає кількість символів у рядку або кількість елементів у масиві. Має форму з крапкою — `.size`, і лише вона працює всередині умов.',
    officialUrl: 'https://shopify.github.io/liquid/filters/size/',
    related: ['filters/first', 'filters/last', 'filters/where', 'tags/control-flow', 'shopify/collection-and-pagination'],
    blocks: [
      {
        type: 'p',
        text: '`size` відповідає на питання «скільки?». Для рядка — скільки символів, для масиву — скільки елементів. Це єдиний фільтр, який має ще й запис через крапку: `product.tags.size`. І саме цей другий запис потрібен найчастіше, бо довжину зазвичай не друкують, а **перевіряють в умові**.',
      },
      {
        type: 'example',
        title: 'Рядок і масив',
        preset: 'product',
        template: `{{ product.title }} — символів: {{ product.title | size }}
Тегів: {{ product.tags | size }}
Варіантів: {{ product.variants.size }}`,
        note: 'Рахуються **символи**, а не байти: кирилична літера — це один символ, хоча в UTF-8 вона займає два байти.',
      },
      { type: 'h', text: 'Фільтр чи крапка' },
      {
        type: 'p',
        text: 'У виводі `{{ … }}` обидва записи рівноцінні. Різниця зʼявляється в тегах: `if`, `unless`, `case`, `when` **не застосовують фільтри**. Вираз умови — це «значення, оператор, значення», і вертикальної риски там граматика не передбачає.',
      },
      {
        type: 'example',
        title: 'Фільтр в умові не працює',
        preset: 'product',
        expectError: true,
        template: '{% if product.tags | size > 3 %}Багато тегів{% endif %}',
        note: 'Пісочниця зупиняється з помилкою розбору. У Shopify такий запис теж марний: залежно від режиму парсера це або синтаксична помилка, або фільтр мовчки відкидається й умова перевіряє саму змінну `product.tags` — а вона завжди truthy.',
      },
      {
        type: 'example',
        title: 'Правильно: .size або assign',
        preset: 'product',
        template: `{% if product.tags.size > 3 %}Багато тегів{% endif %}

{% assign available = product.variants | where: "available" %}
{% assign count = available | size %}
{% if count > 1 %}Доступно варіантів: {{ count }}{% endif %}`,
        note: 'Якщо значення вже лежить у змінній — бери `.size`. Якщо його ще треба порахувати ланцюжком фільтрів — спершу `assign`, потім умова. До змінної `available` теж можна звернутись як `available.size`.',
      },
      {
        type: 'example',
        title: 'Межові випадки',
        template: '{{ "" | size }}\n{{ nil | size }}\n{{ 12345 | size }}\n{{ empty_list | size }}',
        data: { empty_list: [] },
        note: '`nil` і порожні значення дають `0` — помилки не буде. Число теж дає `0`: у нього немає «довжини», це не рядок із пʼяти цифр.',
      },
      {
        type: 'note',
        tone: 'warn',
        title: 'Пастка: порожній масив — truthy',
        text: '`{% if product.images %}` спрацює навіть для товару без фото: порожній масив у Liquid — truthy, falsy лише `nil` і `false`. Перевіряй так: `{% if product.images.size > 0 %}` або `{% if product.images != empty %}`. Докладніше — [truthy і falsy](/docs/basics/truthy-and-falsy).',
      },
      {
        type: 'example',
        title: 'Позиції проти одиниць товару',
        preset: 'cart',
        template: 'Рядків у кошику: {{ cart.items.size }}\nОдиниць товару: {{ cart.item_count }}',
        note: '`.size` рахує **елементи масиву** — рядки кошика. Скільки штук у кожному рядку, він не знає; для цього є готове поле `cart.item_count`. На бейджі кошика в шапці потрібне саме воно.',
      },
      {
        type: 'note',
        tone: 'shopify',
        text: '`collection.products.size` — це кількість товарів, **завантажених на поточну сторінку**, а не в колекції. Без `paginate` масив обмежений 50 елементами, з `paginate` — розміром сторінки (теж не більше 50). Скільки товарів у колекції насправді, показують `collection.products_count` (з урахуванням активних фільтрів) і `collection.all_products_count`. Те саме з `blog.articles.size` проти `blog.articles_count`.',
      },
      {
        type: 'note',
        tone: 'interview',
        title: 'На співбесіді',
        text: 'Два улюблені питання. Перше: «чому `{% if items | size > 0 %}` не працює?» — бо теги умов не приймають фільтрів; рішення — `.size` або попередній `assign`. Друге: «як перевірити, що масив порожній?» — `.size == 0` або порівняння з `empty`, і обовʼязково додай, що сам порожній масив — truthy. Якщо ще згадаєш різницю між `products.size` і `products_count`, це вже відповідь рівня middle.',
      },
    ],
  },

  /* ───────────────────────── slice ───────────────────────── */
  {
    slug: 'slice',
    section: 'filters',
    title: 'slice',
    category: 'string',
    syntax: 'string | slice: number, number',
    summary:
      'Вирізає шматок рядка або масиву: з якого індексу почати і скільки елементів узяти. Індекс рахується з нуля, відʼємний — з кінця.',
    officialUrl: 'https://shopify.github.io/liquid/filters/slice/',
    related: ['filters/truncate', 'filters/first', 'filters/last', 'filters/split', 'tags/iteration'],
    blocks: [
      {
        type: 'p',
        text: '`slice` бере частину з середини: перший параметр — **звідки** (індекс із нуля), другий — **скільки**. Працює однаково з рядками (вирізає символи) і масивами (вирізає елементи). Якщо другий параметр не вказати, візьме рівно один елемент.',
      },
      {
        type: 'example',
        title: 'Базовий випадок: рядок',
        template: '{{ "Liquid" | slice: 0 }}\n{{ "Liquid" | slice: 2 }}\n{{ "Liquid" | slice: 2, 3 }}',
        note: 'Без другого параметра — один символ. `slice: 2, 3` — «з індексу 2 взяти 3 символи»: `q`, `u`, `i`.',
      },
      { type: 'h', text: 'Параметри' },
      {
        type: 'table',
        head: ['Параметр', 'Тип', 'Що робить'],
        rows: [
          ['початок', 'number', 'Індекс першого елемента, рахунок із `0`. Відʼємний — відлік із кінця: `-1` — останній.'],
          ['довжина (необовʼязковий)', 'number', 'Скільки елементів узяти. За замовчуванням `1`.'],
        ],
      },
      {
        type: 'example',
        title: 'Відʼємний індекс і реальні дані',
        preset: 'customer',
        template: `Ініціали: {{ customer.first_name | slice: 0 }}{{ customer.last_name | slice: 0 }}
Телефон: ••• {{ customer.phone | slice: -4, 4 }}`,
        note: '`slice: -4, 4` — «стань за чотири символи до кінця і візьми чотири». Так роблять ініціали для аватара й маскують номери.',
      },
      {
        type: 'example',
        title: 'Масив',
        preset: 'collection',
        template: `Перші три: {{ collection.products | slice: 0, 3 | map: "title" | join: " · " }}
Останні два: {{ collection.products | slice: -2, 2 | map: "title" | join: " · " }}`,
        note: 'Результат — знову масив, тому далі можна ставити `map`, `join` або віддати його в `for`.',
      },
      {
        type: 'example',
        title: 'Межові випадки',
        template: '[{{ "Liquid" | slice: 10 }}]\n[{{ "Liquid" | slice: 4, 10 }}]\n[{{ nil | slice: 0 }}]',
        note: 'Індекс за межами рядка — порожній результат, а не помилка. Довжина «з запасом» просто віддає все, що лишилось до кінця.',
      },
      {
        type: 'note',
        tone: 'warn',
        title: 'Пастка для тих, хто прийшов із JavaScript',
        text: 'У JS `"Liquid".slice(2, 3)` — це «від індексу 2 **до** індексу 3», результат `q`. У Liquid другий параметр — **довжина**, а не кінцевий індекс, і той самий запис дає `qui`. Це найчастіша помилка з цим фільтром.',
      },
      {
        type: 'note',
        tone: 'tip',
        title: 'slice чи limit / offset',
        text: 'Якщо масив потрібен лише для циклу, простіше написати `{% for product in collection.products limit: 3 offset: 1 %}` — див. [ітерації](/docs/tags/iteration). `slice` виграє, коли шматок треба **зберегти в змінну**, передати в сніпет або пропустити далі ланцюжком фільтрів.',
      },
      {
        type: 'note',
        tone: 'interview',
        title: 'На співбесіді',
        text: 'Питають: «як узяти перші N символів без трьох крапок?» — `slice: 0, N` (або `truncate: N, ""`). І «як дістати останній символ рядка?» — `slice: -1`. Сильна відповідь додає, що `slice` працює і з масивами, а другий параметр — довжина, а не кінцевий індекс, як у JavaScript.',
      },
    ],
  },

  /* ───────────────────────── sort ───────────────────────── */
  {
    slug: 'sort',
    section: 'filters',
    title: 'sort',
    category: 'array',
    syntax: 'array | sort: string',
    summary:
      'Сортує масив за зростанням: рядки — за кодами символів із урахуванням регістру, числа — за значенням. З параметром сортує обʼєкти за вказаною властивістю.',
    officialUrl: 'https://shopify.github.io/liquid/filters/sort/',
    related: ['filters/sort_natural', 'filters/reverse', 'filters/map', 'filters/where', 'shopify/collection-and-pagination'],
    blocks: [
      {
        type: 'p',
        text: '`sort` упорядковує масив від меншого до більшого. Для масиву обʼєктів передай імʼя властивості — і він відсортує товари за ціною, статті за датою, варіанти за назвою. Напрямку «за спаданням» немає: для цього після `sort` ставлять [reverse](/docs/filters/reverse).',
      },
      {
        type: 'example',
        title: 'Базовий випадок: регістр має значення',
        template: '{{ "zebra,apple,Mango,Banana" | split: "," | sort | join: ", " }}',
        note: 'Спершу **всі** слова з великої літери, потім усі з малої. `sort` порівнює коди символів, а в таблиці Unicode великі літери стоять раніше за малі. Потрібен «людський» алфавітний порядок — бери [sort_natural](/docs/filters/sort_natural).',
      },
      { type: 'h', text: 'Параметри' },
      {
        type: 'table',
        head: ['Параметр', 'Тип', 'Що робить'],
        rows: [['властивість (необовʼязковий)', 'string', 'Імʼя властивості обʼєктів масиву, за якою сортувати: `"price"`, `"title"`, `"published_at"`.']],
      },
      {
        type: 'example',
        title: 'За властивістю: від дешевого до дорогого й навпаки',
        preset: 'collection',
        template: `{% assign by_price = collection.products | sort: "price" %}
{% for product in by_price %}
{{- product.price | money }} — {{ product.title }}
{% endfor %}
Найдорожчий: {{ by_price | reverse | map: "title" | first }}`,
        note: 'Ціни — числа, тож порівнюються як числа. Вихідний масив `collection.products` не змінюється: фільтр повертає **новий** масив, тому результат зберігаємо через `assign`.',
      },
      {
        type: 'example',
        title: 'Числа-рядки сортуються як рядки',
        template: `{{ "10,9,100,1" | split: "," | sort | join: ", " }}
{{ numbers | sort | join: ", " }}`,
        data: { numbers: [10, 9, 100, 1] },
        note: 'Перший масив зроблено через `split`, тож у ньому **рядки**: `"100"` менше за `"9"`, бо порівняння йде посимвольно й `1` < `9`. Другий масив — справжні числа, і з ним усе гаразд.',
      },
      {
        type: 'example',
        title: 'Межові випадки',
        template: '[{{ nil | sort | join: ", " }}]\n[{{ "кератин" | sort | join: ", " }}]',
        note: '`nil` перетворюється на порожній масив. Одиночне значення — на масив з одного елемента. Помилки не буде ні там, ні там.',
      },
      {
        type: 'note',
        tone: 'warn',
        title: 'Пастка: українські літери',
        text: 'Порівняння за кодами символів дає сюрприз і без регістру: `і`, `ї`, `є`, `ґ` у таблиці Unicode стоять **після** `я`. Тому `{{ "яблуко,інжир,абрикос" | split: "," | sort | join: ", " }}` виведе `абрикос, яблуко, інжир`. Правильного українського алфавітного порядку засобами Liquid не отримати — такі списки сортують заздалегідь або на клієнті через `Intl.Collator`.',
      },
      {
        type: 'note',
        tone: 'warn',
        title: 'Пастка: значення, яких немає',
        text: 'Якщо в частини елементів властивості немає (`nil`), їхнє місце в результаті не гарантоване й залежить від реалізації. Не будуй логіку на тому, що «порожні будуть у кінці»: спершу відфільтруй їх через [where](/docs/filters/where), потім сортуй.',
      },
      {
        type: 'note',
        tone: 'shopify',
        text: '`sort` бачить лише те, що вже завантажено: `collection.products | sort: "price"` упорядкує максимум 50 товарів **поточної сторінки**, а не всю колекцію. На другій сторінці пагінації будуть свої «найдешевші». Справжнє сортування колекції робить сервер — за параметром `?sort_by=` в адресі (значення лежать у `collection.sort_options`). Фільтр `sort` доречний для коротких списків: варіанти, блоки секції, метаобʼєкти, статті на сторінці.',
      },
      {
        type: 'note',
        tone: 'interview',
        title: 'На співбесіді',
        text: '«Чим `sort` відрізняється від `sort_natural`?» — `sort` чутливий до регістру: великі літери йдуть перед малими; `sort_natural` регістр ігнорує. «Як відсортувати за спаданням?» — `sort` і одразу `reverse`. «Чому `"10"` опинилося перед `"9"`?» — бо після `split` це рядки, а рядки порівнюються посимвольно. І головне для Shopify: `sort` у шаблоні не замінює сортування колекції, бо працює лише з однією сторінкою даних.',
      },
    ],
  },

  /* ───────────────────────── sort_natural ───────────────────────── */
  {
    slug: 'sort_natural',
    section: 'filters',
    title: 'sort_natural',
    category: 'array',
    syntax: 'array | sort_natural: string',
    summary: 'Сортує масив за алфавітом **без урахування регістру**. Як і `sort`, уміє сортувати обʼєкти за властивістю. Для чисел не призначений.',
    officialUrl: 'https://shopify.github.io/liquid/filters/sort_natural/',
    related: ['filters/sort', 'filters/reverse', 'filters/downcase', 'filters/uniq'],
    blocks: [
      {
        type: 'p',
        text: '`sort_natural` — це [sort](/docs/filters/sort), який перед порівнянням «не дивиться» на регістр. Потрібен скрізь, де дані вводили люди: назви брендів, теги, імена авторів. Там `Brae`, `inoar` і `ERAYBA` мирно співіснують, і покупець чекає звичайного алфавітного списку.',
      },
      {
        type: 'example',
        title: 'Порівняння із sort',
        template: `sort:         {{ "zebra,apple,Mango,Banana" | split: "," | sort | join: ", " }}
sort_natural: {{ "zebra,apple,Mango,Banana" | split: "," | sort_natural | join: ", " }}`,
        note: '`sort` зібрав великі літери на початку. `sort_natural` виставив слова так, як їх розклала б людина. Самі елементи не змінюються — регістр ігнорується лише під час порівняння.',
      },
      { type: 'h', text: 'Параметри' },
      {
        type: 'table',
        head: ['Параметр', 'Тип', 'Що робить'],
        rows: [['властивість (необовʼязковий)', 'string', 'Імʼя властивості обʼєктів масиву, за якою сортувати.']],
      },
      {
        type: 'example',
        title: 'За властивістю',
        template: `{% assign sorted = brands | sort_natural: "name" %}
{% for brand in sorted %}
{{- brand.name }} ({{ brand.country }})
{% endfor %}`,
        data: {
          brands: [
            { name: 'inoar', country: 'Бразилія' },
            { name: 'Wella', country: 'Німеччина' },
            { name: 'erayba', country: 'Іспанія' },
            { name: 'Cocochoco', country: 'Ізраїль' },
          ],
        },
        note: 'Зі звичайним `sort: "name"` бренди з малої літери опинились би після `Wella`. Спробуй замінити фільтр і подивись.',
      },
      {
        type: 'example',
        title: 'Числа — не сюди',
        template: '{{ numbers | sort_natural | join: ", " }}\n{{ numbers | sort | join: ", " }}',
        data: { numbers: [10, 9, 100, 1] },
        note: '`sort_natural` перетворює кожен елемент на **рядок** і порівнює посимвольно, тому `100` стає перед `9`. Слово «natural» у назві — про регістр, а не про «природний порядок чисел», як у файлових менеджерах.',
      },
      {
        type: 'example',
        title: 'Межові випадки',
        template: '[{{ nil | sort_natural | join: ", " }}]\n[{{ "кератин" | sort_natural | join: ", " }}]',
        note: 'Поводиться так само, як `sort`: `nil` — порожній масив, одиночне значення — масив з одного елемента.',
      },
      {
        type: 'note',
        tone: 'warn',
        title: 'Пастка: кирилиця',
        text: 'У Shopify фільтр стоїть на Ruby-методі `casecmp`, який зводить регістр **лише для латинських** літер. Для кириличних рядків `sort_natural` поводиться як звичайний `sort`: `Яблуко` стане перед `банан`. Пісочниця (JavaScript) кирилицю якраз зводить, тому на українських словах вивід тут і в Shopify розійдеться. Якщо список кириличний і регістр різний — надійніше привести все до одного регістру ще на етапі введення даних. Проблема літер `і`, `ї`, `є`, `ґ` після `я` зі сторінки [sort](/docs/filters/sort) теж нікуди не зникає.',
      },
      {
        type: 'note',
        tone: 'shopify',
        text: 'Типові місця: список брендів із `collection.all_vendors` або `shop.vendors`, хмара тегів із `collection.all_tags`, алфавітний покажчик сторінок. Як і `sort`, працює лише з уже завантаженими даними — сортування всієї колекції лишається за сервером.',
      },
      {
        type: 'note',
        tone: 'interview',
        title: 'На співбесіді',
        text: '«Навіщо два фільтри сортування?» — `sort` чутливий до регістру й коректно порівнює числа; `sort_natural` ігнорує регістр, але все порівнює як рядки, тож для чисел не годиться. Коротка формула: **текст від людей — `sort_natural`, числа й дати — `sort`**.',
      },
    ],
  },

  /* ───────────────────────── split ───────────────────────── */
  {
    slug: 'split',
    section: 'filters',
    title: 'split',
    category: 'string',
    syntax: 'string | split: string',
    summary:
      'Розрізає рядок на масив за роздільником. Це єдиний спосіб **створити масив** у Liquid — літерала масиву в мові немає.',
    officialUrl: 'https://shopify.github.io/liquid/filters/split/',
    related: ['filters/join', 'filters/strip', 'filters/concat', 'filters/first', 'tags/iteration', 'basics/types'],
    blocks: [
      {
        type: 'p',
        text: '`split` ріже рядок у місцях, де трапляється роздільник, і повертає масив шматків. Сам роздільник у результат не потрапляє. Обернена операція — [join](/docs/filters/join).',
      },
      {
        type: 'p',
        text: 'Головне, за що цей фільтр треба знати: у Liquid **не можна написати масив руками**. Запису на кшталт `["a", "b"]` не існує. Усі масиви або приходять готовими з обʼєктів (`product.tags`, `collection.products`), або народжуються з рядка через `split`.',
      },
      {
        type: 'example',
        title: 'Базовий випадок',
        template: `{% assign sizes = "250 мл,400 мл,1000 мл" | split: "," %}
Елементів: {{ sizes.size }}
Другий: {{ sizes[1] }}
{% for size in sizes %}
- {{ size }}
{%- endfor %}`,
        note: 'Після `split` зі змінною можна робити все, що й зі звичайним масивом: `.size`, індекс, `first` / `last`, цикл.',
      },
      { type: 'h', text: 'Параметри' },
      {
        type: 'table',
        head: ['Параметр', 'Тип', 'Що робить'],
        rows: [['роздільник', 'string', 'Підрядок, за яким різати. Може бути довшим за один символ (`", "`). Порожній рядок `""` ріже на окремі символи.']],
      },
      {
        type: 'example',
        title: 'Порожній роздільник — на символи',
        template: `{% assign letters = "кіт" | split: "" %}
{{ letters.size }}: {{ letters | join: "-" }}

{% assign list = "" | split: "" %}
Порожній масив, елементів: {{ list.size }}`,
        note: 'Другий прийом — стандартний спосіб отримати **порожній масив**, щоб потім наповнювати його через [concat](/docs/filters/concat) у циклі.',
      },
      {
        type: 'example',
        title: 'Порожні елементи',
        template: `{% assign a = "хіт,,новинка," | split: "," %}
{{ a.size }}: [{{ a | join: "] [" }}]

{% assign b = ",хіт,новинка" | split: "," %}
{{ b.size }}: [{{ b | join: "] [" }}]`,
        note: 'Два роздільники поспіль дають порожній елемент усередині масиву. Порожні елементи **в кінці** відкидаються, а **на початку** — лишаються. Фільтр [compact](/docs/filters/compact) тут не допоможе: він прибирає `nil`, а не порожні рядки. Їх відсіюють у циклі: `{% if item != blank %}`.',
      },
      {
        type: 'example',
        title: 'Трюк: список у налаштуванні секції',
        view: 'html',
        template: `{% assign cities = section.settings.cities | split: "," %}
<ul>
{%- for city in cities %}
  <li>{{ city | strip }}</li>
{%- endfor %}
</ul>

{% schema %}
{
  "name": "Міста доставки",
  "settings": [
    { "type": "text", "id": "cities", "label": "Міста через кому", "default": "Київ, Львів ,Одеса" }
  ]
}
{% endschema %}`,
        note: 'Налаштування типу «масив» у схемі немає, тому мерчантові дають текстове поле «через кому», а тема ріже його сама. Зверни увагу на [strip](/docs/filters/strip): люди ставлять пробіли як заманеться, і без нього елементи були б ` Львів ` і `Одеса` впереміш.',
      },
      {
        type: 'example',
        title: 'Межові випадки',
        template: `{% assign a = "кератин" | split: "," %}{{ a.size }} → {{ a.first }}
{% assign b = "" | split: "," %}{{ b.size }}
{% assign c = nil | split: "," %}{{ c.size }}`,
        note: 'Роздільника в рядку немає — вийде масив з **одного** елемента (весь рядок), а не порожній. Порожній рядок і `nil` дають порожній масив.',
      },
      {
        type: 'note',
        tone: 'warn',
        title: 'Пастка: усе стає рядками',
        text: 'Елементи після `split` — завжди **рядки**, навіть якщо виглядають як числа. `"10,9,100" | split: ","` відсортується як текст (`10, 100, 9`), а `where: "id", item` не знайде товар, бо `"1004"` ≠ `1004`. Рядок у число перетворює арифметика: `{% assign n = item | plus: 0 %}`. Ще одна дрібниця: роздільник-пробіл у Ruby особливий — `split: " "` ковтає кілька пробілів поспіль і не дає порожніх елементів, а пісочниця їх дасть.',
      },
      {
        type: 'note',
        tone: 'shopify',
        text: 'Трюк «через кому» хороший для коротких технічних списків: теги, які треба сховати, handle-и колекцій, слова для бейджів. Якщо мерчант має керувати списком усерйоз (порядок, картинки, посилання) — це робота для **блоків секції** або метаобʼєктів, а не для рядка з комами. Ще одне типове застосування — розбір тегів-конвенцій: `{% assign parts = tag | split: ":" %}` для тегів виду `color:red`.',
      },
      {
        type: 'note',
        tone: 'interview',
        title: 'На співбесіді',
        text: '«Як створити масив у Liquid?» — напряму ніяк, літерала масиву немає; беруть рядок і ріжуть: `{% assign list = "a,b,c" | split: "," %}`. Порожній масив — `"" | split: ""`, наповнюють його через `concat`. Далі зазвичай питають, як додати елемент (`concat` з іншим масивом, теж зробленим через `split`) і якого типу елементи (завжди рядки). Якщо назвеш ще й трюк із текстовим налаштуванням секції — покажеш, що робив це в реальних темах.',
      },
    ],
  },

  /* ───────────────────────── strip ───────────────────────── */
  {
    slug: 'strip',
    section: 'filters',
    title: 'strip',
    category: 'string',
    syntax: 'string | strip',
    summary:
      'Прибирає пробіли, табуляції й переноси рядка з обох країв тексту. Середину не чіпає, параметрів не має.',
    officialUrl: 'https://shopify.github.io/liquid/filters/strip/',
    related: ['filters/lstrip', 'filters/rstrip', 'filters/strip_newlines', 'filters/split', 'basics/whitespace'],
    blocks: [
      {
        type: 'p',
        text: '`strip` — найчастіший із трійці «обрізачів». Він знімає **усе пробільне** з початку і з кінця рядка: звичайні пробіли, нерозривні табуляції, переноси. Те, що всередині, лишається недоторканим — два пробіли між словами так і будуть двома.',
      },
      {
        type: 'p',
        text: 'Потрібен він там, де текст приходить **від людини або з `capture`**: налаштування секції, метаполе, значення з форми. Мерчант тисне Enter у полі, копіює назву з таблиці разом із хвостовим пробілом — і твоє порівняння `== "хіт"` мовчки провалюється.',
      },
      {
        type: 'example',
        title: 'Базовий випадок',
        template: '[{{ "   кератин   " | strip }}]\n[{{ "  а  б  " | strip }}]',
        note: 'Квадратні дужки тут лише щоб побачити межі. Два пробіли **між** `а` і `б` фільтр не чіпає: він працює тільки з краями.',
      },
      {
        type: 'example',
        title: 'Не лише пробіли',
        template: '[{{ messy | strip }}]\nБуло символів: {{ messy | size }} → стало: {{ messy | strip | size }}',
        data: { messy: '\t\n  Cocochoco \n ' },
        note: 'Табуляції й переноси теж пробільні символи, тож зникають разом із пробілами.',
      },
      { type: 'h', text: 'Родина фільтрів' },
      {
        type: 'table',
        head: ['Фільтр', 'Що зрізає', 'Коли брати'],
        rows: [
          ['`strip`', 'Пробільне з обох країв', 'Майже завжди: значення з поля, метаполя, `capture`'],
          ['[lstrip](/docs/filters/lstrip)', 'Лише зліва', 'Коли хвіст значущий (рідко)'],
          ['[rstrip](/docs/filters/rstrip)', 'Лише справа', 'Коли значущий відступ зліва'],
          ['[strip_newlines](/docs/filters/strip_newlines)', 'Усі переноси, зокрема з середини', 'Текст у JSON-LD, `alt`, `content` мета-тегу'],
        ],
      },
      {
        type: 'example',
        title: 'Навіщо це насправді: список через кому',
        template: `{% assign raw = "  Київ , Львів ,Одеса  " %}
{% assign cities = raw | split: "," %}
{% for city in cities %}[{{ city }}] → [{{ city | strip }}]
{% endfor %}`,
        note: '`split` ріже рядок рівно по комі й пробіли довкола лишає на місці. Без `strip` у тебе елементи ` Львів ` і `Одеса` впереміш, а порівняння `city == "Львів"` не спрацює.',
      },
      {
        type: 'example',
        title: 'Межові випадки',
        template: '[{{ nil | strip }}]\n[{{ 42 | strip }}]\n[{{ "   " | strip }}]\n{% assign blank_check = "   " | strip %}{% if blank_check == blank %}Після strip — порожньо{% endif %}',
        note: '`nil` стає порожнім рядком, число мовчки перетворюється на рядок, а рядок із самих пробілів — на порожній. Останній рядок показує головний практичний висновок: `"   "` — це **не** `blank`, а от після `strip` — уже так.',
      },
      {
        type: 'note',
        tone: 'warn',
        title: 'Пастка: пробіли — це не blank',
        text: 'Перевірка `{% if section.settings.subtitle != blank %}` пропустить значення з одного пробілу — і на сторінці зʼявиться порожній заголовок із відступами. Правильно: `{% assign subtitle = section.settings.subtitle | strip %}` і вже потім порівнювати. Те саме з метаполями: `{% if product.metafields.custom.note | strip != blank %}` НЕ спрацює — фільтри в умовах заборонені, потрібен окремий `assign`.',
      },
      {
        type: 'note',
        tone: 'warn',
        title: 'Пастка: параметрів немає',
        text: 'У Python і JS звикли до `strip(",")` чи `trim()` із власним набором символів. У Liquid від Shopify параметра **немає** — зрізається лише пробільне. Для символів бери [remove](/docs/filters/remove), [remove_first](/docs/filters/remove_first) або [remove_last](/docs/filters/remove_last).',
      },
      {
        type: 'note',
        tone: 'shopify',
        text: 'Три місця, де без `strip` теми ламаються регулярно: значення текстових налаштувань секції (мерчант вставляє з буфера разом із переносом), розбір тегів-конвенцій на кшталт `badge: хіт` після `split: ":"`, і текст із `{% capture %}` — туди потрапляє **вся** розмітка між тегами, включно з відступами твого редактора.',
      },
      {
        type: 'note',
        tone: 'interview',
        title: 'На співбесіді',
        text: 'Питання-класика: «чим `strip` відрізняється від `{%- -%}`?». Відповідь: `strip` працює зі **значенням** — рядком, що вже лежить у змінній; дефіси працюють із **шаблоном** — вони прибирають пробіли, які породжує сама розмітка під час рендеру, і до вмісту змінних не мають стосунку. Друге питання, яке любить йти слідом: «як перевірити, що налаштування справді заповнене?» — `strip`, потім порівняння з `blank`, бо рядок із пробілів truthy й не blank.',
      },
    ],
  },

  /* ───────────────────────── strip_html ───────────────────────── */
  {
    slug: 'strip_html',
    section: 'filters',
    title: 'strip_html',
    category: 'string',
    syntax: 'string | strip_html',
    summary:
      'Вирізає з рядка всі HTML-теги, а разом із ними — вміст `<script>`, `<style>` і коментарів. Головний інструмент для мета-описів і превʼю.',
    officialUrl: 'https://shopify.github.io/liquid/filters/strip_html/',
    related: ['filters/truncate', 'filters/truncatewords', 'filters/strip_newlines', 'filters/escape', 'shopify/url-and-html-filters'],
    blocks: [
      {
        type: 'p',
        text: '`strip_html` перетворює розмітку на чистий текст. Він викидає все, що стоїть у кутових дужках, а вміст тегів між ними лишає. Окремо він знімає **разом із вмістом** три штуки: `<script>`, `<style>` і HTML-коментарі — усередині них тексту для читача немає.',
      },
      {
        type: 'p',
        text: 'Потреба в ньому виникає скрізь, де багатий текст (`product.description`, `article.content`, метаполе типу rich text) треба покласти туди, де розмітка заборонена: в `<title>`, у `content` мета-тегу, в `alt`, у JSON-LD, у превʼю картки чи листа.',
      },
      {
        type: 'example',
        title: 'Базовий випадок',
        preset: 'product',
        template: 'Сирий опис:\n{{ product.description }}\n\nЧистий текст:\n{{ product.description | strip_html }}',
        note: 'Теги `<p>` і `<strong>` зникли, слова лишились.',
      },
      {
        type: 'example',
        title: 'Скрипти, стилі й коментарі — разом із вмістом',
        template: `[{{ a | strip_html }}]
[{{ b | strip_html }}]
[{{ c | strip_html }}]`,
        data: {
          a: '<p>Текст <script>alert("зло")</script> далі</p>',
          b: '<style>.x{color:red}</style>Ціна',
          c: 'До<!-- службова нотатка мерчанта -->після',
        },
        note: 'Якби фільтр просто викидав кутові дужки, у сторінку поїхав би текст `alert("зло")`. Він знає про ці три випадки й вирізає їх цілком.',
      },
      {
        type: 'note',
        tone: 'warn',
        title: 'Пастка: слова злипаються',
        text: 'Фільтр не ставить пробіл на місці тега. `<li>Один</li><li>Два</li>` перетвориться на `ОдинДва`, а `<p>Абзац</p><p>Другий</p>` — на `АбзацДругий`. У суцільному тексті з `<strong>` усередині це непомітно, а от у списках і таблицях — дуже. Лікується заздалегідь: `| replace: "</li>", "</li> "` перед `strip_html`, або (краще) не тягни списки в мета-опис узагалі.',
      },
      {
        type: 'example',
        title: 'Злипання і як його бачити',
        template: `Як є:     [{{ s | strip_html }}]
З пробілом: [{{ s | replace: "</li>", "</li> " | strip_html | strip }}]`,
        data: { s: '<ul><li>Безсульфатний</li><li>pH 5.5</li><li>500 мл</li></ul>' },
        note: 'Другий рядок підкладає пробіл у саму розмітку перед тим, як її зрізати. `strip` у кінці прибирає хвіст, що лишився від останнього елемента.',
      },
      {
        type: 'example',
        title: 'Робоча звʼязка: мета-опис сторінки',
        preset: 'product',
        view: 'html',
        template: `{%- assign meta = product.description | strip_html | strip_newlines | truncate: 155 -%}
<meta name="description" content="{{ meta | escape }}">`,
        note: 'Порядок не випадковий: спершу прибрати розмітку, потім переноси, потім обрізати до довжини, і лише в кінці — [escape](/docs/filters/escape) перед підстановкою в атрибут. Якби `truncate` стояв першим, він міг би розрізати тег навпіл.',
      },
      {
        type: 'example',
        title: 'Межові випадки',
        template: '[{{ nil | strip_html }}]\n[{{ "Ціна&nbsp;649&nbsp;₴" | strip_html }}]\n[{{ "1 < 2 і 3 > 2" | strip_html }}]',
        note: 'Дві важливі речі. **Сутності не розкодовуються**: `&nbsp;` так і лишиться текстом `&nbsp;` — фільтр працює з тегами, а не з сутностями. І **«<» усередині тексту небезпечний**: розбір іде регулярним виразом, тому все від `<` до найближчого `>` вважається тегом і зникає разом із текстом між ними.',
      },
      {
        type: 'note',
        tone: 'warn',
        title: 'Пастка: це НЕ захист від XSS',
        text: '`strip_html` — інструмент **форматування**, а не безпеки. Він проходить рядок регулярними виразами й на хитро зламаній розмітці може лишити те, чого ти не чекав. Для безпечного виводу чужого тексту в HTML є [escape](/docs/filters/escape): він не викидає символи, а перетворює `<` на `&lt;`, тож у браузер не потрапить жодного тега. Просте правило: текст у **розмітку** — `escape`; текст у **мета-опис, alt чи JSON** — `strip_html` і далі `escape` або `json`.',
      },
      {
        type: 'note',
        tone: 'shopify',
        text: 'Три місця в темі, де фільтр стоїть майже завжди: `<meta name="description">` у `theme.liquid`, превʼю статті в списку блогу (`article.excerpt_or_content | strip_html | truncatewords: 25`) і поле `description` у JSON-LD розмітці товару. Ще одне — обчислення довжини: `product.description | strip_html | size` показує, скільки там **тексту**, а не символів розмітки.',
      },
      {
        type: 'note',
        tone: 'interview',
        title: 'На співбесіді',
        text: 'Питання звучить як практичне: «зроби мета-опис із опису товару». Правильна відповідь — ланцюжок `strip_html | strip_newlines | truncate: 155 | escape` і пояснення, чому саме в такому порядку. Далі майже напевно спитають різницю між `strip_html` і `escape`: перший **видаляє** теги й підходить для тексту без розмітки, другий **знешкоджує** їх і підходить для безпечного виводу. І додай застереження, що `strip_html` не є захистом від XSS.',
      },
    ],
  },

  /* ───────────────────────── strip_newlines ───────────────────────── */
  {
    slug: 'strip_newlines',
    section: 'filters',
    title: 'strip_newlines',
    category: 'string',
    syntax: 'string | strip_newlines',
    summary:
      'Прибирає з рядка **всі** символи переносу — і з країв, і зсередини. Нічого замість них не підставляє, тому сусідні рядки злипаються.',
    officialUrl: 'https://shopify.github.io/liquid/filters/strip_newlines/',
    related: ['filters/strip', 'filters/newline_to_br', 'filters/strip_html', 'filters/truncate', 'basics/whitespace'],
    blocks: [
      {
        type: 'p',
        text: '`strip_newlines` робить із багаторядкового тексту один рядок. На відміну від [strip](/docs/filters/strip), який чистить лише краї, цей фільтр викидає переноси **звідусіль**, зокрема з середини абзацу. Пробіли й табуляції він не чіпає — тільки символи переносу.',
      },
      {
        type: 'p',
        text: 'Навіщо це треба: є місця, де перенос рядка — не просто невидимий символ, а **поламаний документ**. Значення HTML-атрибута, рядок у JSON-LD, тіло мета-тегу, параметр адреси. Туди текст їде тільки в один рядок.',
      },
      {
        type: 'example',
        title: 'Базовий випадок',
        template: '[{{ s }}]\n\n[{{ s | strip_newlines }}]',
        data: { s: 'Мʼякий шампунь\nдля волосся\nпісля реконструкції' },
        note: 'Слова **злиплися**: вийшло `шампуньдля`. Фільтр не ставить пробіл замість переносу — він просто видаляє символ.',
      },
      {
        type: 'note',
        tone: 'warn',
        title: 'Пастка: злипання слів',
        text: 'Це найчастіша помилка з цим фільтром, і помічають її вже в пошуковій видачі. Там, де переноси стоять **між словами**, голий `strip_newlines` склеює текст у кашу. Треба підставити пробіл — і ось тут чекає друга пастка.',
      },
      {
        type: 'note',
        tone: 'warn',
        title: 'Пастка: escape-послідовностей у Liquid немає',
        text: 'Перше, що приходить у голову, — `| replace: "\\n", " "`. У справжньому Shopify це **не працює**: рядкові літерали Liquid не розбирають escape-послідовності, тож фільтр шукатиме два звичайні символи — зворотний слеш і літеру `n`. Пісочниця (LiquidJS) тут поблажливіша й `\\n` таки зрозуміє, тому приклад у ній збіжиться, а в темі — ні. Переносний спосіб один: прогнати текст через [newline_to_br](/docs/filters/newline_to_br), а потім замінити вже `<br />`.',
      },
      {
        type: 'example',
        title: 'Правильно: перенос → пробіл',
        template: `Як є:       [{{ s | strip_newlines }}]
З пробілом: [{{ s | newline_to_br | strip_newlines | replace: "<br />", " " | strip }}]`,
        data: { s: 'Мʼякий шампунь\nдля волосся\nпісля реконструкції\n' },
        note: 'Ланцюжок читається зліва направо: перетворили переноси на теги `<br />`, викинули самі переноси, замінили теги на пробіли, прибрали хвіст. Виглядає кружним шляхом — але це єдиний запис, який однаково поводиться і тут, і в реальній темі.',
      },
      { type: 'h', text: 'Сусідні фільтри' },
      {
        type: 'table',
        head: ['Фільтр', 'Що робить із переносами'],
        rows: [
          ['`strip_newlines`', 'Видаляє всі, нічого не підставляє'],
          ['[newline_to_br](/docs/filters/newline_to_br)', 'Замінює кожен на `<br />` — зворотна задача'],
          ['[strip](/docs/filters/strip)', 'Прибирає лише ті, що на краях, разом із пробілами'],
          ['[escape](/docs/filters/escape)', 'Переноси лишає, знешкоджує `<`, `>`, `&` і лапки'],
        ],
      },
      {
        type: 'example',
        title: 'Робочий випадок: опис у JSON-LD',
        preset: 'product',
        view: 'html',
        template: `{%- assign desc = product.description | strip_html | strip_newlines | truncate: 200 -%}
<script type="application/ld+json">
{
  "@type": "Product",
  "name": {{ product.title | json }},
  "description": {{ desc | json }}
}
</script>`,
        note: 'Тут два різні захисти, і обидва потрібні. `strip_newlines` прибирає переноси з **тексту мерчанта**, а `json` екранує лапки й спецсимволи і сам ставить зовнішні лапки. Писати `"description": "{{ desc }}"` не можна — одна лапка в описі зламає всю розмітку. Пробіл тут підставляти не довелося: після `strip_html` абзаци вже й так злиті.',
      },
      {
        type: 'example',
        title: 'Межові випадки',
        template: '[{{ nil | strip_newlines }}]\n[{{ empty_lines | strip_newlines }}]\n[{{ "рядок  із   пробілами" | strip_newlines }}]',
        data: { empty_lines: '\n\n\n' },
        note: '`nil` стає порожнім рядком. Текст із самих переносів — теж порожнім. А от кілька пробілів поспіль лишаються як були: фільтр про них не знає, це робота для [strip](/docs/filters/strip) або `replace`.',
      },
      {
        type: 'note',
        tone: 'shopify',
        text: 'Класичне місце — `{% capture %}` у темі: усе між тегами потрапляє в змінну разом із відступами й переносами твого редактора, і якщо цю змінну підставити в `alt="…"` чи `data-…`, у HTML поїде багаторядкове сміття. Друге місце — поля схеми типу `textarea`: мерчант тисне Enter, а ти кладеш значення в атрибут. Третє — опис товару в мета-тегах і структурованих даних.',
      },
      {
        type: 'note',
        tone: 'interview',
        title: 'На співбесіді',
        text: 'Питання йде в парі: «`strip`, `strip_newlines` і `{%- -%}` — у чому різниця?». Відповідай так: `strip` чистить **краї** значення від будь-якого пробільного; `strip_newlines` чистить **усе значення** саме від переносів; дефіси в тегах узагалі не про значення, а про пробіли, які породжує шаблон під час рендеру. Сильний хвіст до відповіді: `strip_newlines` не підставляє пробіл замість переносу, а написати `replace: "\\n"` не вийде, бо escape-послідовностей у рядках Liquid немає — тому в темах ходить звʼязка через `newline_to_br`.',
      },
    ],
  },

  /* ───────────────────────── sum ───────────────────────── */
  {
    slug: 'sum',
    section: 'filters',
    title: 'sum',
    category: 'array',
    syntax: 'array | sum: string',
    summary:
      'Додає всі числа масиву й повертає підсумок. З параметром додає значення однієї властивості в масиві обʼєктів — кількості в кошику, ваги, суми рядків.',
    officialUrl: 'https://shopify.github.io/liquid/filters/sum/',
    related: ['filters/map', 'filters/where', 'filters/plus', 'filters/times', 'filters/size', 'shopify/cart'],
    blocks: [
      {
        type: 'p',
        text: '`sum` замінює цілий цикл із лічильником. Було: `{% assign total = 0 %}{% for item in items %}{% assign total = total | plus: item.price %}{% endfor %}` — чотири рядки й змінна, яку легко забути обнулити. Стало: `{{ items | sum: "price" }}`.',
      },
      {
        type: 'example',
        title: 'Базовий випадок: масив чисел',
        template: `{% assign fib = "0, 1, 1, 2, 3, 5, 8" | split: ", " %}
{{ fib | sum }}`,
        note: 'Після `split` елементи — рядки, але `sum` приводить їх до чисел сам. Це рідкісний фільтр, якому «рядкові числа» не заважають.',
      },
      { type: 'h', text: 'Параметри' },
      {
        type: 'table',
        head: ['Параметр', 'Тип', 'Що робить'],
        rows: [
          [
            'властивість (необовʼязковий)',
            'string',
            'Імʼя властивості обʼєктів масиву, значення якої додавати: `"quantity"`, `"final_line_price"`, `"weight"`. Без нього додаються самі елементи.',
          ],
        ],
      },
      {
        type: 'example',
        title: 'За властивістю: підсумки кошика',
        preset: 'cart',
        template: `Одиниць товару: {{ cart.items | sum: "quantity" }}
Сума рядків: {{ cart.items | sum: "final_line_price" | money }}
Знижок: {{ cart.items | sum: "total_discount" | money }}
Вага, г: {{ cart.items | sum: "grams" }}`,
        note: 'Порівняй з готовими полями `cart.item_count` і `cart.total_price` — вони мають збігатися. Останній рядок навмисно помилковий: властивості `grams` у рядках кошика тут немає, і `sum` тихо дає `0`.',
      },
      {
        type: 'note',
        tone: 'warn',
        title: 'Пастка: помилка в імені властивості = нуль',
        text: '`sum` не скаржиться на невідому властивість — він рахує її як `0` у кожному елементі й повертає `0` для всього масиву. Порожній кошик і опечатка в `"quantitiy"` виглядають однаково. Якщо підсумок несподівано нульовий, першим ділом виведи `{{ items | map: "твоя_властивість" | json }}` і подивись, що там насправді.',
      },
      {
        type: 'example',
        title: 'Сильна звʼязка: where → sum',
        preset: 'cart',
        template: `{%- assign coco = cart.items | where: "vendor", "Cocochoco" -%}
Cocochoco в кошику: {{ coco | sum: "quantity" }} шт на {{ coco | sum: "final_line_price" | money }}

{%- assign discounted = cart.items | where: "total_discount" -%}
Позицій зі знижкою: {{ discounted | size }}, зекономлено {{ discounted | sum: "total_discount" | money }}`,
        note: 'Спершу [where](/docs/filters/where) відбирає потрібні рядки, потім `sum` їх додає. Так рахують суму за брендом, вагу товарів, що потребують доставки, або кількість подарункових позицій — без жодного `if` усередині циклу.',
      },
      {
        type: 'example',
        title: 'Не-числа й порожнеча',
        template: '{{ mixed | sum }}\n[{{ empty_list | sum }}]\n[{{ nil | sum }}]',
        data: { mixed: [1, 'два', 3, null, '4'] },
        note: 'Усе, що числом не є, рахується як `0` — помилки не буде. Порожній масив і `nil` дають `0`, а не порожній рядок, тож результат завжди можна вести далі в арифметику.',
      },
      {
        type: 'note',
        tone: 'warn',
        title: 'Пастка: дроби',
        text: '`sum` додає значення як є, тож із дробами виходить звичайна плаваюча арифметика: `[0.1, 0.2] | sum` дасть `0.30000000000000004`, а не `0.3`. Це поведінка не Liquid, а двійкових дробів, і вона однакова скрізь. Висновок практичний: **гроші додавай у копійках** — цілими числами, — і переводь у гривні лише на виході через [money](/docs/shopify/money-filters). Саме тому всі ціни в Shopify і є цілими.',
      },
      {
        type: 'example',
        title: 'Чому копійки рятують',
        template: `Дробами: {{ floats | sum }}
Копійками: {{ kop | sum }} → {{ kop | sum | divided_by: 100.0 }} ₴`,
        data: { floats: [649.0, 849.0, 0.1, 0.2], kop: [64900, 84900, 10, 20] },
        note: 'Другий рядок — те саме число, але порахували його цілими. Ніяких хвостів із нулів і четвірок у кінці.',
      },
      {
        type: 'note',
        tone: 'shopify',
        text: 'Найчастіше `sum` стоїть у кошику: свої підсумки для групи позицій, вага для калькулятора доставки (`cart.items | sum: "grams"`), кількість одиниць бренду для порогу безплатної доставки. Памʼятай про межу даних: `collection.products | sum: "price"` додасть лише товари **поточної сторінки** — максимум 50. Загальних підсумків по колекції Liquid не бачить, їх рахує сервер або Storefront API.',
      },
      {
        type: 'note',
        tone: 'interview',
        title: 'На співбесіді',
        text: 'Просять порахувати підсумок без готового поля — наприклад, суму позицій одного вендора в кошику. Сильна відповідь — `where` і одразу `sum: "final_line_price"`, без циклу й змінної-акумулятора. Додай два уточнення, які показують досвід: невідома властивість дає тихий нуль, тому підсумок треба перевіряти; і гроші рахуються **в копійках**, бо дробова арифметика дає хвости. Якщо спитають про альтернативу — `map` і `sum` без параметра дають те саме, але зайвий прохід масивом.',
      },
    ],
  },

  /* ───────────────────────── times ───────────────────────── */
  {
    slug: 'times',
    section: 'filters',
    title: 'times',
    category: 'math',
    syntax: 'number | times: number',
    summary:
      'Множить число на задане. Разом із `divided_by` — основа всіх розрахунків у темі: відсотки, ціна за обʼєм, підсумок рядка кошика.',
    officialUrl: 'https://shopify.github.io/liquid/filters/times/',
    related: ['filters/divided_by', 'filters/plus', 'filters/minus', 'filters/round', 'filters/sum', 'shopify/money-filters'],
    blocks: [
      {
        type: 'p',
        text: '`times` множить значення зліва на параметр. Усе просто рівно доти, доки не зустрінеш головне правило арифметики Liquid: **тип результату визначають типи операндів**. Два цілих дають ціле, а щойно зʼявляється дріб — результат теж стає дробовим. Саме тому `times` так часто пишуть із `100.0`, а не зі `100`.',
      },
      {
        type: 'example',
        title: 'Базовий випадок',
        template: '{{ 3 | times: 4 }}\n{{ 12 | times: 0.5 }}\n{{ 2.5 | times: 100 | round }}',
        note: 'Третій рядок — типовий фінал розрахунку: помножили, і одразу [round](/docs/filters/round), бо показувати покупцеві `250.00000000000003` не можна.',
      },
      { type: 'h', text: 'Параметри' },
      {
        type: 'table',
        head: ['Параметр', 'Тип', 'Що робить'],
        rows: [['множник', 'number', 'На що множити. Ціле — результат лишається цілим; дробове — результат стає дробовим.']],
      },
      {
        type: 'example',
        title: 'Цілі й дробові',
        template: '{{ 4.0 | times: 2 }}\n{{ 4 | times: 2 }}\n{{ 7 | times: 0.5 }}',
        shopifyOutput: '8.0\n8\n3.5',
        note: 'Перший рядок — та сама розбіжність, про яку варто знати заздалегідь: у Shopify `4.0` лишається дробовим і друкується як `8.0`, а пісочниця (JavaScript) хвостового нуля не має й покаже `8`. На розрахунки це не впливає, на **вивід** — впливає, тому до `money` чи `round` доводити результат треба завжди.',
      },
      {
        type: 'note',
        tone: 'warn',
        title: 'Пастка: 100 проти 100.0',
        text: 'Класика бейджа знижки. `saved | times: 100 | divided_by: compare_at_price` дасть **відкинутий** дріб, бо всі три числа цілі й ділення йде націло: справжні 18,77% перетворяться на 18. Множник `100.0` робить ланцюжок дробовим, і `round` уже чесно віддає 19. Детальний розбір — на сторінці [divided_by](/docs/filters/divided_by); пісочниця тут поводиться інакше за Shopify, орієнтуйся на рядок «У Shopify».',
      },
      {
        type: 'example',
        title: 'Бейдж знижки: один символ вирішує',
        preset: 'product',
        template: `{%- assign saved = product.compare_at_price | minus: product.price -%}
Зекономлено: {{ saved | money }}
Ціле на ціле:  −{{ saved | times: 100 | divided_by: product.compare_at_price }}%
Через 100.0:   −{{ saved | times: 100.0 | divided_by: product.compare_at_price | round }}%`,
        shopifyOutput: 'Зекономлено: 150.00 ₴\nЦіле на ціле:  −18%\nЧерез 100.0:   −19%',
        note: 'Порядок дій теж важливий: множимо **перед** діленням. Якби спершу поділили (`saved | divided_by: compare_at_price`), від цілочисельного ділення лишився б нуль, і множити було б уже нічого.',
      },
      {
        type: 'example',
        title: 'Гроші в копійках',
        preset: 'product',
        template: `Ціна: {{ product.price | money }}
Три штуки: {{ product.price | times: 3 | money }}
Передоплата 30%: {{ product.price | times: 30 | divided_by: 100 | money }}`,
        note: 'Ціна — ціле число копійок, тож множення на кількість дає точний результат без жодних дробів. Відсоток теж рахується цілими: спершу `times: 30`, потім `divided_by: 100` — так похибка не встигає зʼявитись.',
      },
      {
        type: 'example',
        title: 'Межові випадки',
        template: '{{ "5" | times: 2 }}\n{{ nil | times: 5 }}\n{{ "кератин" | times: 3 }}\n{{ 10 | times: 0 }}',
        note: 'Рядок із числом перетворюється на число. Усе інше — `nil`, текст, відсутня змінна — дає `0` без жодної помилки. Тому опечатка в імені змінної не падає, а тихо друкує нуль: у грошах це найгірший вид бага.',
      },
      {
        type: 'note',
        tone: 'warn',
        title: 'Пастка: times — не повторювач рядка',
        text: 'У Ruby `"ха" * 3` дає `хахаха`, у Python так само. У Liquid `times` — **тільки арифметика**: `{{ "кератин" | times: 3 }}` це `0`, а не три кератини. Повторити рядок засобами Liquid можна хіба циклом `{% for i in (1..3) %}`.',
      },
      {
        type: 'note',
        tone: 'shopify',
        text: 'Усі гроші в Shopify — цілі числа в найменшій одиниці валюти. Тому `times` у темах майже завжди працює з копійками, і будь-який розрахунок закінчується `| money` (або `| round | money`, якщо десь загубилась дробовість). Типові місця: бейдж знижки у відсотках, ціна за 100 мл у картці товару, сума за рядок кошика (`item.price | times: item.quantity` — хоч для цього є готове `item.line_price`), передоплата й розбивка на платежі.',
      },
      {
        type: 'note',
        tone: 'interview',
        title: 'На співбесіді',
        text: 'Питання майже завжди одне й те саме: «порахуй відсоток знижки». Слабка відповідь — назвати ланцюжок фільтрів. Сильна — сказати, **чому** множник має бути `100.0`: цілочисельне ділення в Liquid відкидає дріб, тож дробовість треба внести раніше, ніж дійде до `divided_by`. Додай, що множення йде перед діленням, і що результат пропускають через `round`. Бонусом — що ціни в копійках, а `times` у Liquid не вміє повторювати рядки.',
      },
    ],
  },

  /* ───────────────────────── truncate ───────────────────────── */
  {
    slug: 'truncate',
    section: 'filters',
    title: 'truncate',
    category: 'string',
    syntax: 'string | truncate: number, string',
    summary:
      'Обрізає рядок до заданої кількості **символів** і дописує три крапки. Хвіст входить у ліміт і замінюється другим параметром.',
    officialUrl: 'https://shopify.github.io/liquid/filters/truncate/',
    related: ['filters/truncatewords', 'filters/slice', 'filters/strip_html', 'filters/size', 'filters/escape'],
    blocks: [
      {
        type: 'p',
        text: '`truncate` рахує **символи**. Якщо рядок коротший за ліміт — фільтр не чіпає його взагалі. Якщо довший — обрізає й дописує в кінець `...`, щоб читач бачив, що текст обірвали.',
      },
      {
        type: 'p',
        text: 'Головне, що треба запамʼятати раз і назавжди: **три крапки входять у ліміт**. `truncate: 12` дає рядок завдовжки рівно 12 символів, із яких 9 — текст, а 3 — крапки. Це поведінка не очевидна, і саме на ній сходяться всі помилки з цим фільтром.',
      },
      {
        type: 'example',
        title: 'Базовий випадок',
        template: `[{{ "Шампунь із кератином" | truncate: 12 }}]
Довжина результату: {{ "Шампунь із кератином" | truncate: 12 | size }}
[{{ "Олійка" | truncate: 12 }}]`,
        note: 'Девʼять символів тексту плюс три крапки — рівно 12. Короткий рядок фільтр пропускає як є: хвіст додається **тільки** при реальному обрізанні.',
      },
      { type: 'h', text: 'Параметри' },
      {
        type: 'table',
        head: ['Параметр', 'Тип', 'Що робить'],
        rows: [
          ['довжина', 'number', 'Максимальна довжина результату в символах, **разом із хвостом**.'],
          ['хвіст (необовʼязковий)', 'string', 'Чим позначити обрив. Типово `"..."` — три окремі крапки. Порожній рядок `""` прибирає хвіст зовсім.'],
        ],
      },
      {
        type: 'example',
        title: 'Свій хвіст і зовсім без хвоста',
        template: `[{{ "Шампунь із кератином" | truncate: 12 }}]
[{{ "Шампунь із кератином" | truncate: 12, "…" }}]
[{{ "Шампунь із кератином" | truncate: 12, " →" }}]
[{{ "Шампунь із кератином" | truncate: 12, "" }}]`,
        note: 'Типовий хвіст — **три окремі крапки**, а не символ багатокрапки `…`. Різниця не косметична: `...` займає три позиції ліміту, `…` — одну, тому в другому рядку тексту вміщується на два символи більше. Останній рядок — чистий обріз рівно по 12 символах, як `slice: 0, 12`.',
      },
      {
        type: 'note',
        tone: 'warn',
        title: 'Пастка: ліміт менший за хвіст',
        text: '`{{ "Шампунь" | truncate: 2 }}` поверне `...` — самі крапки, без жодної літери. Довжина тексту рахується як «ліміт мінус довжина хвоста», і коли це число вийшло відʼємним, його вважають нулем. Результат виходить **довший** за заданий ліміт. Для дуже малих значень бери [slice](/docs/filters/slice) — він ріже рівно стільки, скільки просили.',
      },
      {
        type: 'example',
        title: 'Межові випадки',
        template: '[{{ "Шампунь" | truncate: 2 }}]\n[{{ "Шампунь" | truncate: 0 }}]\n[{{ nil | truncate: 5 }}]\n[{{ 1234567 | truncate: 4 }}]',
        note: '`nil` дає порожній рядок — без хвоста, бо обрізати нічого. Число мовчки перетворюється на рядок і ріжеться як текст.',
      },
      {
        type: 'note',
        tone: 'warn',
        title: 'Пастка: спершу strip_html, потім truncate',
        text: '`truncate` рахує **всі** символи, включно з кутовими дужками: у `<p>Мʼякий <strong>…` перші 20 позицій — це майже сама розмітка. Гірше інше — обріз може лишити незакритий тег або розрізати його навпіл, і верстка сторінки поїде. Правило: [strip_html](/docs/filters/strip_html) завжди **перед** `truncate`.',
      },
      {
        type: 'example',
        title: 'Розмітка проти тексту',
        preset: 'product',
        template: `Як є:        [{{ product.description | truncate: 30 }}]
Через strip: [{{ product.description | strip_html | truncate: 30 }}]`,
        note: 'У першому рядку зі «змістовного» тексту вціліло кілька слів, решту зʼїли теги. У другому всі 27 символів дісталися читачеві.',
      },
      {
        type: 'example',
        title: 'Робоча звʼязка: мета-опис',
        preset: 'product',
        view: 'html',
        template: `{%- assign meta = product.description | strip_html | strip_newlines | truncate: 155, "…" -%}
<meta name="description" content="{{ meta | escape }}">
<p>Символів: {{ meta | size }}</p>`,
        note: 'Порядок фільтрів — це сам алгоритм: зняти розмітку, звести в один рядок, обрізати під довжину сніпета в видачі, і лише в кінці [escape](/docs/filters/escape) перед підстановкою в атрибут.',
      },
      {
        type: 'note',
        tone: 'shopify',
        text: 'Де це живе в темі: назва товару в картці (щоб сітка не розʼїжджалась на довгих назвах), превʼю статті в списку блогу, `<meta name="description">` у `theme.liquid`, текст відгуку зі згорткою «читати далі». Для назв товарів `truncate` зручніший за CSS `text-overflow: ellipsis`, коли рядків має бути два й обрив треба показати в розмітці, а не малювати браузером.',
      },
      {
        type: 'note',
        tone: 'interview',
        title: 'На співбесіді',
        text: 'Питання-лакмус: «`{{ title | truncate: 10 }}` — скільки символів тексту побачить користувач?». Правильна відповідь — **сім**, бо три крапки входять у ліміт. Друге питання: «чим `truncate` відрізняється від `truncatewords`?» — перший рахує символи, другий слова; для назв і мета-описів беруть `truncate`, для превʼю статті — `truncatewords`, щоб не розрізати слово посередині. І обовʼязково згадай, що перед обома треба ставити `strip_html`.',
      },
    ],
  },

  /* ───────────────────────── truncatewords ───────────────────────── */
  {
    slug: 'truncatewords',
    section: 'filters',
    title: 'truncatewords',
    category: 'string',
    syntax: 'string | truncatewords: number, string',
    summary:
      'Лишає задану кількість **слів** і дописує три крапки. На відміну від `truncate`, ніколи не ріже слово посередині.',
    officialUrl: 'https://shopify.github.io/liquid/filters/truncatewords/',
    related: ['filters/truncate', 'filters/strip_html', 'filters/split', 'filters/size', 'filters/slice'],
    blocks: [
      {
        type: 'p',
        text: '`truncatewords` ріже по межах слів. Текст розбивається на слова по пробільних символах, беруться перші N, склеюються назад через один пробіл — і в кінець додаються три крапки, якщо щось відкинули.',
      },
      {
        type: 'p',
        text: 'Це головна різниця з [truncate](/docs/filters/truncate): там ти контролюєш **довжину** й ризикуєш розрізати слово, тут контролюєш **кількість слів**, зате довжина результату наперед невідома. Для превʼю статті майже завжди правильніший цей фільтр.',
      },
      {
        type: 'example',
        title: 'Базовий випадок',
        template: `[{{ "Мʼякий безсульфатний шампунь для волосся після реконструкції" | truncatewords: 3 }}]
[{{ "Мʼякий безсульфатний шампунь для волосся після реконструкції" | truncate: 25 }}]`,
        note: 'Порівняй два рядки. `truncatewords` обірвав по слову, `truncate` розрізав слово посередині — і обидва праві, бо рахують різне.',
      },
      { type: 'h', text: 'Параметри' },
      {
        type: 'table',
        head: ['Параметр', 'Тип', 'Що робить'],
        rows: [
          ['слів', 'number', 'Скільки слів лишити. Хвіст у це число **не** входить — на відміну від `truncate`.'],
          ['хвіст (необовʼязковий)', 'string', 'Чим позначити обрив. Типово `"..."`, порожній рядок `""` прибирає хвіст.'],
        ],
      },
      {
        type: 'example',
        title: 'Свій хвіст',
        template: `[{{ s | truncatewords: 4 }}]
[{{ s | truncatewords: 4, "…" }}]
[{{ s | truncatewords: 4, " (далі)" }}]
[{{ s | truncatewords: 4, "" }}]`,
        data: { s: 'Мʼякий безсульфатний шампунь для волосся після реконструкції' },
        note: 'Слів завжди рівно чотири — хвіст ліміту не зʼїдає. Це ще одна відмінність від `truncate`, де три крапки віднімаються від заданої довжини.',
      },
      {
        type: 'note',
        tone: 'warn',
        title: 'Пастка: теги теж рахуються за слова',
        text: 'Це застереження є навіть в офіційній документації. `<p>Мʼякий <strong>безсульфатний</strong> шампунь` — тут перші «слова» це `<p>Мʼякий` і `<strong>безсульфатний</strong>`. Гірше: обрив може лишити відкритий `<strong>` без пари, і решта сторінки поїде жирним. Завжди став [strip_html](/docs/filters/strip_html) **перед** `truncatewords`.',
      },
      {
        type: 'example',
        title: 'Розмітка ламає рахунок',
        template: `Як є:        [{{ s | truncatewords: 4 }}]
Через strip: [{{ s | strip_html | truncatewords: 4 }}]`,
        data: { s: '<p>Мʼякий <strong>безсульфатний</strong> шампунь для волосся після реконструкції</p>' },
        note: 'У першому рядку в анонс поїхали кутові дужки, а `</p>` лишилось за обривом — тег `<p>` відкритий і ніхто його не закриє. Саме так і "пливе" верстка списку статей. Коли теги стоять окремими словами (`<ul>`, `<li>`), рахунок ще й зсувається: замість чотирьох слів читач бачить одне-два.',
      },
      {
        type: 'example',
        title: 'Превʼю статті — робочий шаблон',
        preset: 'blog',
        view: 'html',
        template: `{%- for post in blog.articles limit: 3 -%}
<article>
  <h3>{{ post.title }}</h3>
  <p>{{ post.content | strip_html | truncatewords: 12 }}</p>
</article>
{%- endfor -%}`,
        note: 'Саме цю звʼязку пишуть у кожній темі на сторінці блогу. У реальній темі замість `post.content` беруть `post.excerpt_or_content` — тоді мерчант може задати власний анонс, а `truncatewords` спрацює лише як запасний варіант.',
      },
      {
        type: 'example',
        title: 'Межові випадки',
        template: '[{{ "один два" | truncatewords: 5 }}]\n[{{ "один два три" | truncatewords: 0 }}]\n[{{ nil | truncatewords: 3 }}]\n[{{ messy | truncatewords: 4 }}]',
        data: { messy: 'один\nдва   три\tчотири пʼять' },
        note: 'Слів менше за ліміт — рядок лишається як є, без крапок. **`truncatewords: 0` дає одне слово, а не жодного**: нуль і відʼємні значення мовчки підтягуються до одиниці. Останній рядок показує ще один корисний побічний ефект: будь-які пробільні послідовності — переноси, табуляції, подвійні пробіли — у результаті стають одним пробілом.',
      },
      {
        type: 'note',
        tone: 'tip',
        title: 'Коли який фільтр',
        text: 'Потрібна **гарантована довжина** (мета-опис на 155 символів, назва в сітці карток) — [truncate](/docs/filters/truncate). Потрібен **читабельний уривок** (анонс статті, відгук, опис у списку) — `truncatewords`. Потрібен рівний обріз без крапок узагалі — [slice](/docs/filters/slice).',
      },
      {
        type: 'note',
        tone: 'shopify',
        text: 'Головне місце — картка статті в блозі й пошукова видача (`search.results`, де в кожного результату є `content`). Друге — відгуки й довгі описи зі згорткою. Для мета-тегів `truncatewords` беруть рідше: там важить саме довжина, бо Google ріже сніпет по символах.',
      },
      {
        type: 'note',
        tone: 'interview',
        title: 'На співбесіді',
        text: '«Чим `truncate` відрізняється від `truncatewords`?» — перший рахує символи й **включає** три крапки в ліміт, другий рахує слова й хвіст до ліміту **не** додає. Далі йде практичне: «зроби анонс статті» — відповідь `article.excerpt_or_content | strip_html | truncatewords: 25`, і обовʼязково поясни, навіщо `strip_html`: теги рахуються за слова й обрив лишає незакриту розмітку. Дрібниця, що добре звучить: `truncatewords: 0` віддає одне слово, а не порожній рядок.',
      },
    ],
  },

  /* ───────────────────────── uniq ───────────────────────── */
  {
    slug: 'uniq',
    section: 'filters',
    title: 'uniq',
    category: 'array',
    syntax: 'array | uniq',
    summary:
      'Прибирає з масиву повтори, лишаючи перше входження кожного значення. Порядок решти елементів зберігається.',
    officialUrl: 'https://shopify.github.io/liquid/filters/uniq/',
    related: ['filters/map', 'filters/sort', 'filters/sort_natural', 'filters/compact', 'filters/where', 'filters/downcase'],
    blocks: [
      {
        type: 'p',
        text: '`uniq` проходить масив зліва направо й викидає кожне значення, яке вже траплялось. Перше входження лишається на своєму місці, тому вихідний порядок не ламається — фільтр нічого не сортує.',
      },
      {
        type: 'p',
        text: 'Сам по собі він майже не потрібен: у чистих даних повторів не буває. Його справжнє місце — **одразу після [map](/docs/filters/map)**. Саме там повтори зʼявляються масово: у списку товарів пʼять карток, а вендорів серед них три.',
      },
      {
        type: 'example',
        title: 'Базовий випадок',
        template: '{{ "догляд,кератин,догляд,хіт,кератин,догляд" | split: "," | uniq | join: " · " }}',
        note: 'Лишилось перше входження кожного тега, у тому порядку, в якому вони вперше трапились.',
      },
      {
        type: 'example',
        title: 'Головна звʼязка: map → uniq',
        preset: 'collection',
        template: `Усі вендори підряд: {{ collection.products | map: "vendor" | join: ", " }}
Без повторів:       {{ collection.products | map: "vendor" | uniq | join: ", " }}
Готовий фільтр:     {{ collection.products | map: "vendor" | uniq | sort | join: " · " }}`,
        note: 'Третій рядок — готовий список для бічної панелі фільтрів: дістали властивість, прибрали повтори, впорядкували. Три фільтри замість циклу з масивом-накопичувачем.',
      },
      {
        type: 'example',
        title: 'Хмара тегів із кількох товарів',
        preset: 'collection',
        template: `{% assign tags = collection.products | map: "tags" | join: "," | split: "," | uniq | sort %}
{% for tag in tags %}#{{ tag }} {% endfor %}
Усього унікальних: {{ tags.size }}`,
        note: 'Тут прийом, який варто запамʼятати: `map: "tags"` дає **масив масивів**, і `uniq` на ньому нічого путнього не зробить. Тому масиви спершу зливають у рядок через `join`, а потім знову ріжуть через `split` — виходить плаский список, на якому `uniq` уже працює.',
      },
      {
        type: 'note',
        tone: 'warn',
        title: 'Пастка: порівняння суворе',
        text: 'Однаковими вважаються лише **повністю ідентичні** значення. `Inoar`, `inoar` і `INOAR` — це три різні елементи, бо регістр входить у порівняння. Так само `1` (число) і `"1"` (рядок) — два різні значення, і після [split](/docs/filters/split), який усе перетворює на рядки, це легко проґавити. Лікується приведенням до спільного вигляду ще до `uniq`: пройтись циклом із [downcase](/docs/filters/downcase) і зібрати новий масив.',
      },
      {
        type: 'example',
        title: 'Регістр і типи',
        template: `Регістр:  {{ "Inoar,inoar,INOAR" | split: "," | uniq | join: ", " }}
Кількість: {{ "Inoar,inoar,INOAR" | split: "," | uniq | size }}

Типи:     {{ mixed | uniq | join: ", " }} (елементів: {{ mixed | uniq | size }})`,
        data: { mixed: [1, '1', 1, 2] },
        note: 'У другому прикладі на вигляд лишилось `1, 1, 2` — і це не помилка: перша одиниця число, друга рядок. Око їх не розрізняє, а `uniq` розрізняє.',
      },
      {
        type: 'example',
        title: 'Межові випадки',
        template: '[{{ nil | uniq | join: "," }}]\n[{{ "кератин" | uniq | join: "," }}]\n[{{ empty_list | uniq | size }}]',
        data: { empty_list: [] },
        note: '`nil` перетворюється на порожній масив, одиночне значення — на масив з одного елемента. Помилки не буде ніде.',
      },
      {
        type: 'note',
        tone: 'warn',
        title: 'Пастка: обʼєкти не дедуплікуються',
        text: '`collection.products | uniq` не прибере той самий товар, якщо він трапився двічі: порівнюються **посилання**, а не вміст, і два окремі обʼєкти з однаковими полями лишаться обидва. Дедуплікувати список товарів треба за ключем: `map: "handle" | uniq`, а вже потім, якщо потрібні самі товари, діставати їх із `all_products[handle]`.',
      },
      {
        type: 'note',
        tone: 'shopify',
        text: 'Класичні застосування: список брендів чи типів для бічного фільтра з поточної сторінки колекції, хмара тегів статей, перелік валют. Важливе застереження — межа даних: `collection.products | map: "vendor" | uniq` бачить максимум 50 завантажених товарів, тож частина брендів у список просто не потрапить. Повні списки вже готові в самому обʼєкті колекції: `collection.all_vendors`, `collection.all_types`, `collection.all_tags` — і `uniq` їм не потрібен.',
      },
      {
        type: 'note',
        tone: 'interview',
        title: 'На співбесіді',
        text: '«Як зібрати список брендів колекції?» — правильна відповідь у дві частини. Технічно: `collection.products | map: "vendor" | uniq | sort`. По суті: у справжній темі так робити **не треба**, бо є готове `collection.all_vendors`, а `map` бачить лише поточну сторінку пагінації. Якщо додаси, що `uniq` порівнює суворо (регістр і тип мають значення) і що обʼєкти він не дедуплікує — це вже рівень, на якому видно людину, яка налагоджувала такий фільтр у бою.',
      },
    ],
  },

  /* ───────────────────────── upcase ───────────────────────── */
  {
    slug: 'upcase',
    section: 'filters',
    title: 'upcase',
    category: 'string',
    syntax: 'string | upcase',
    summary: 'Переводить усі літери рядка у верхній регістр. Кирилицю розуміє, цифри й розділові знаки не чіпає.',
    officialUrl: 'https://shopify.github.io/liquid/filters/upcase/',
    related: ['filters/downcase', 'filters/capitalize', 'shopify/url-and-html-filters', 'filters/sort_natural', 'filters/strip'],
    blocks: [
      {
        type: 'p',
        text: '`upcase` робить із `кератин` — `КЕРАТИН`. Параметрів не має, і це один із найпростіших фільтрів у мові. Складне в ньому одне: **коли його доречно застосовувати**, бо в девʼяти випадках із десяти замість нього треба писати CSS.',
      },
      {
        type: 'example',
        title: 'Базовий випадок',
        preset: 'product',
        template: `{{ "кератин" | upcase }}
{{ "Sulfate-free 250 мл" | upcase }}
{{ product.vendor | upcase }} — {{ product.vendor | downcase }}`,
        note: 'Цифри, пробіли й дефіси лишаються як були. Зворотний фільтр — [downcase](/docs/filters/downcase); зробити велику лише першу літеру вміє [capitalize](/docs/filters/capitalize).',
      },
      {
        type: 'note',
        tone: 'warn',
        title: 'Головна пастка: це робота CSS, а не Liquid',
        text: 'Якщо тобі потрібні великі літери **на вигляд** — пиши `text-transform: uppercase`. Різниця не стилістична, а практична: CSS міняє лише картинку, а `upcase` міняє **самі дані**. Тому текст, пропущений через `upcase`, скопіюється з екрана капсом, прочитається екранним диктором як абревіатура по літерах, поїде капсом у пошукову видачу — і зламається в ту мить, коли дизайн передумає. Liquid тут доречний рівно тоді, коли великі літери потрібні в **значенні**, а не у вигляді.',
      },
      {
        type: 'example',
        title: 'Так робити не треба',
        view: 'html',
        preset: 'product',
        template: `<!-- Дані зіпсовані: капс поїде і в копіювання, і в диктор -->
<span class="badge">{{ product.tags.first | upcase }}</span>

<!-- Дані цілі, вигляд задає стиль -->
<style>.badge--css { text-transform: uppercase; }</style>
<span class="badge badge--css">{{ product.tags.first }}</span>`,
        note: 'Виглядає однаково, а поводиться по-різному. Виділи обидва бейджі мишкою й порівняй, що потрапить у буфер.',
      },
      { type: 'h', text: 'Коли upcase справді потрібен' },
      {
        type: 'list',
        items: [
          'Порівняння без урахування регістру: привести обидва боки до одного вигляду перед `==` або `contains`.',
          'Значення, яке далі їде не в браузер: код промокоду в `data-`-атрибут, параметр адреси, поле форми, ключ у JSON для скрипта.',
          'Ініціали й однолітерні значки, де капс — це і є сенс, а не оформлення.',
          'Код валюти чи країни, який у даних лежить у різному регістрі, а в API має піти у верхньому.',
        ],
      },
      {
        type: 'example',
        title: 'Порівняння без урахування регістру',
        template: `{%- assign raw = "  Кератин " -%}
{%- assign key = raw | strip | upcase -%}
Ключ: [{{ key }}]
{% if key == "КЕРАТИН" %}Збіг є{% else %}Збігу немає{% endif %}

Без нормалізації: {% if raw == "КЕРАТИН" %}Збіг є{% else %}Збігу немає{% endif %}`,
        note: 'Реальні дані приходять із пробілами й у випадковому регістрі. Тут порядок фільтрів такий: спершу [strip](/docs/filters/strip), потім `upcase`, і лише тоді порівняння. Для порівняння підійшов би й `downcase` — важливо, щоб **обидва** боки пройшли через той самий фільтр.',
      },
      {
        type: 'example',
        title: 'Ініціали',
        preset: 'customer',
        template: `{{ customer.first_name | slice: 0 | upcase }}{{ customer.last_name | slice: 0 | upcase }}
{{ customer.name | upcase }}`,
        note: '[slice](/docs/filters/slice) бере першу літеру, `upcase` гарантує, що вона буде великою, навіть якщо клієнтка записала імʼя з малої. Ось тут капс — це саме **значення**, тому фільтр доречний.',
      },
      {
        type: 'example',
        title: 'Межові випадки',
        template: '[{{ nil | upcase }}]\n[{{ 42 | upcase }}]\n[{{ "ß" | upcase }}]\n[{{ "" | upcase }}]',
        note: '`nil` стає порожнім рядком, число мовчки перетворюється на рядок і не змінюється. Останній рядок — про те, що регістр у Unicode не завжди взаємно однозначний: німецька `ß` у верхньому регістрі має ставати `SS`, і різні реалізації роблять це по-різному. Для української такої проблеми немає.',
      },
      {
        type: 'note',
        tone: 'shopify',
        text: 'У темах `upcase` найчастіше зустрічається саме там, де йому не місце — у бейджах «SALE» і «НОВИНКА» замість `text-transform`. Правильні місця: нормалізація тегів-конвенцій перед порівнянням (`tag | upcase == "ХІТ"`), коди валют у `{{ cart.currency.iso_code | upcase }}`, значення для скриптів. І ще одне: для **адрес** він не годиться — там потрібен `handleize` (див. [фільтри адрес і HTML](/docs/shopify/url-and-html-filters)), який робить слаг у нижньому регістрі з дефісами.',
      },
      {
        type: 'note',
        tone: 'interview',
        title: 'На співбесіді',
        text: 'Питання звучить безневинно: «як вивести назву товару великими літерами?». Правильна відповідь починається зі зустрічного уточнення: **для вигляду чи для даних?** Якщо треба, щоб виглядало капсом, — це `text-transform: uppercase` у CSS, бо `upcase` псує копіювання, доступність і SEO. Якщо великі літери потрібні в самому значенні — тоді вже `upcase`. Така відповідь відрізняє людину, яка розуміє межу між шаблоном і стилем, від людини, яка знає список фільтрів напамʼять.',
      },
    ],
  },

  /* ───────────────────────── url_decode ───────────────────────── */
  {
    slug: 'url_decode',
    section: 'filters',
    title: 'url_decode',
    category: 'string',
    syntax: 'string | url_decode',
    summary:
      'Розкодовує percent-encoding: перетворює `%D0%BA` назад на літери, а `+` — на пробіл. Зворотний до `url_encode`.',
    officialUrl: 'https://shopify.github.io/liquid/filters/url_decode/',
    related: ['filters/url_encode', 'filters/escape', 'filters/strip', 'shopify/url-and-html-filters', 'shopify/search'],
    blocks: [
      {
        type: 'p',
        text: '`url_decode` читає адресний запис навпаки: кожну трійку `%XX` перетворює назад на символ, а `+` — на пробіл. Отримуєш те, що людина насправді набрала, перш ніж це поїхало в адресний рядок.',
      },
      {
        type: 'p',
        text: 'Потрібен він рівно там, де значення прийшло **з адреси**: пошуковий запит, вибраний фільтр, `utm`-мітка, повернення з платіжної форми. У таких значеннях пробіли вже стали плюсами, а кирилиця — частоколом відсотків, і показувати це покупцеві не можна.',
      },
      {
        type: 'example',
        title: 'Базовий випадок',
        template: `{{ "%D0%BE%D0%BB%D1%96%D0%B9%D0%BA%D0%B0" | url_decode }}
{{ "%D0%BA%D0%B5%D1%80%D0%B0%D1%82%D0%B8%D0%BD+250+%D0%BC%D0%BB" | url_decode }}
{{ "hello%40liquid-lab.example" | url_decode }}`,
        note: 'Кириличний символ займає в UTF-8 два байти, тому кожна літера в адресі — це дві трійки `%XX`. Плюси в другому рядку стали пробілами.',
      },
      {
        type: 'example',
        title: 'Кругова подорож',
        template: `{%- assign q = "кератин 250 мл" -%}
Було:       {{ q }}
В адресі:   {{ q | url_encode }}
Розкодовано: {{ q | url_encode | url_decode }}`,
        note: '[url_encode](/docs/filters/url_encode) і `url_decode` — дзеркальна пара. Третій рядок має точно збігтися з першим, і це найпростіший спосіб перевірити, що з кодуванням усе гаразд.',
      },
      {
        type: 'note',
        tone: 'warn',
        title: 'Пастка: розкодований текст — чужий текст',
        text: 'Значення з адреси набирає **будь-хто**, і після `url_decode` у ньому можуть виявитись кутові дужки й лапки. Виводити такий рядок у розмітку напряму — це відкрита XSS. Завжди став після нього [escape](/docs/filters/escape): `{{ q | url_decode | escape }}`. Якщо значення йде в атрибут — `escape` обовʼязковий тим паче.',
      },
      {
        type: 'example',
        title: 'Заголовок сторінки пошуку',
        view: 'html',
        template: `{%- assign raw = "%D1%88%D0%B0%D0%BC%D0%BF%D1%83%D0%BD%D1%8C+%3Cb%3E" -%}
<!-- так робити НЕ можна: чужий тег поїде в сторінку -->
<h1>Результати: {{ raw | url_decode }}</h1>

<!-- так правильно -->
<h1>Результати: «{{ raw | url_decode | escape }}»</h1>`,
        note: 'Це той самий рядок двічі. У першому заголовку `<b>` із запиту став справжнім тегом, у другому — видимим текстом. Різниця в одному фільтрі.',
      },
      {
        type: 'note',
        tone: 'warn',
        title: 'Пастка: зламане кодування',
        text: 'Одинокий знак `%`, за яким не йдуть дві шістнадцяткові цифри, — це недійсна послідовність. Пісочниця на такому рядку **падає з помилкою** (див. приклад нижче) і зупиняє рендер. Ruby-реалізація в Shopify поблажливіша й радше лишить такий фрагмент як є, ніж зупинить сторінку. Висновок для обох: не пропускай через `url_decode` значення, яке не є адресним записом — наприклад, звичайний текст зі знаком відсотка на кшталт «знижка 100%».',
      },
      {
        type: 'example',
        title: 'Недійсна послідовність',
        template: '{{ "знижка 100%" | url_decode }}',
        expectError: true,
        note: 'Саме тому `url_decode` застосовують **тільки** до значень, що прийшли з адреси, і ніколи — до довільного тексту з поля чи метаполя.',
      },
      {
        type: 'example',
        title: 'Межові випадки',
        template: '[{{ nil | url_decode }}]\n[{{ "" | url_decode }}]\n[{{ "простий текст" | url_decode }}]\n[{{ "a+b" | url_decode }}]',
        note: '`nil` і порожній рядок дають порожньо. Текст без відсотків і плюсів проходить наскрізь без змін. Останній рядок — головна дрібниця цього фільтра: **плюс завжди стає пробілом**, навіть якщо в оригіналі це був справжній плюс. Щоб плюс вижив, його треба було кодувати як `%2B`.',
      },
      {
        type: 'note',
        tone: 'shopify',
        text: 'У темах фільтр потрібен нечасто, бо Shopify більшість адресних значень віддає вже розкодованими: `search.terms` містить нормальний текст запиту, а не `%D0%BA…`. Реальні випадки — розбір власних параметрів адреси, які тема передає сама собі (наприклад, стан фільтра чи `return_to`), і значення з інтеграцій. Якщо бачиш у темі `search.terms | url_decode` — це найімовірніше зайвий фільтр, який колись дописали «про всяк випадок».',
      },
      {
        type: 'note',
        tone: 'interview',
        title: 'На співбесіді',
        text: 'Питають у парі з `url_encode`: «коли який?». Формула проста: **у адресу — `url_encode`, з адреси — `url_decode`**. Сильна відповідь одразу додає дві речі. Перша: після `url_decode` значення обовʼязково йде через `escape`, бо це чужий текст, який набрав користувач. Друга: `url_decode` перетворює `+` на пробіл, тому застосовувати його до довільного тексту не можна — і на недійсному `%` він може й зовсім впасти.',
      },
    ],
  },

  /* ───────────────────────── url_encode ───────────────────────── */
  {
    slug: 'url_encode',
    section: 'filters',
    title: 'url_encode',
    category: 'string',
    syntax: 'string | url_encode',
    summary:
      'Кодує рядок для передавання в адресі: небезпечні символи стають `%XX`, а пробіл — знаком `+`. Саме той фільтр, який треба ставити на значення параметра.',
    officialUrl: 'https://shopify.github.io/liquid/filters/url_encode/',
    related: ['filters/url_decode', 'filters/escape', 'filters/strip', 'shopify/url-and-html-filters', 'shopify/search'],
    blocks: [
      {
        type: 'p',
        text: 'В адресі можна вживати лише вузький набір символів. Усе інше — кирилиця, пробіли, `&`, `=`, `?`, `#` — треба закодувати, інакше адреса або поламається, або поведе себе не так, як ти чекав. `url_encode` це й робить: замінює кожен небезпечний байт на `%XX`.',
      },
      {
        type: 'p',
        text: 'Ключове слово — **значення**. Фільтр ставлять на те, що йде після знака рівності в параметрі, а не на адресу цілком: інакше `/`, `?` і `=` теж закодуються, і адреса перестане бути адресою.',
      },
      {
        type: 'example',
        title: 'Базовий випадок',
        template: `{{ "олійка для кінчиків" | url_encode }}
{{ "hello@liquid-lab.example" | url_encode }}
{{ "знижка 50% & подарунок" | url_encode }}`,
        note: 'Пробіли стали плюсами, кирилиця — трійками `%XX` (по дві на літеру, бо в UTF-8 вона займає два байти), `@`, `%` і `&` теж закодувались.',
      },
      {
        type: 'note',
        tone: 'warn',
        title: 'Пастка: пробіл стає «+», а не «%20»',
        text: 'Це прямо задокументована особливість фільтра й найчастіше джерело плутанини. Такий запис (`application/x-www-form-urlencoded`) правильний для **рядка запиту** — того, що після `?`. А от у **шляху** адреси плюс означає буквально плюс, а не пробіл, тому для частин шляху `url_encode` не годиться — там потрібен `url_escape`, який кодує пробіл як `%20`.',
      },
      { type: 'h', text: 'Три схожі фільтри — і вони різні' },
      {
        type: 'table',
        head: ['Фільтр', 'Пробіл', 'Символи `&`, `=`, `?`', 'Для чого'],
        rows: [
          ['`url_encode`', '`+`', 'Кодує', '**Значення параметра** після `?` — пошуковий запит, `utm`, `return_to`'],
          ['`url_escape`', '`%20`', 'Лишає як є', 'Частина **шляху** адреси, де роздільники мають вижити'],
          ['`url_param_escape`', '`%20`', 'Кодує', 'Значення параметра, коли пробіл має бути саме `%20`'],
          ['[escape](/docs/filters/escape)', 'Лишає', 'Кодує `&` в `&amp;`', 'Не адреса взагалі — **HTML**: текст у розмітці чи атрибуті'],
        ],
      },
      {
        type: 'example',
        title: 'Побачити різницю',
        template: `url_encode:       {{ s | url_encode }}
url_escape:       {{ s | url_escape }}
url_param_escape: {{ s | url_param_escape }}
escape:           {{ s | escape }}`,
        data: { s: 'кератин & ботокс' },
        note: 'Один рядок, чотири фільтри, чотири різні результати. `url_escape` лишив амперсанд цілим — тому в значенні параметра він небезпечний: браузер вирішить, що тут починається новий параметр.',
      },
      {
        type: 'example',
        title: 'Робочий випадок: посилання на пошук',
        preset: 'shop',
        view: 'html',
        template: `{%- assign q = "  Кератин & догляд  " -%}
{%- assign term = q | strip -%}
<a href="{{ routes.search_url }}?q={{ term | url_encode }}&type=product">
  Шукати «{{ term | escape }}»
</a>`,
        note: 'Тут обидва фільтри працюють разом і кожен на своєму місці. В **адресі** — `url_encode`, бо це значення параметра. У **тексті посилання** — [escape](/docs/filters/escape), бо це HTML. Переплутати їх місцями — класична помилка: адреса поламається, а сторінка стане вразливою.',
      },
      {
        type: 'note',
        tone: 'warn',
        title: 'Пастка: не кодуй адресу цілком',
        text: '`{{ "/search?q=шампунь" | url_encode }}` зіпсує все: слеші, знак питання й знак рівності теж закодуються, і вийде рядок, який нікуди не веде. Кодують **окремо кожне значення**, а роздільники (`?`, `&`, `=`) пишуть у шаблоні руками.',
      },
      {
        type: 'note',
        tone: 'warn',
        title: 'Пастка: подвійне кодування',
        text: 'Якщо значення вже прийшло з адреси закодованим, другий `url_encode` перетворить `%` на `%25` — і адреса стане безглуздою. Ознака в браузері характерна: `%2520` замість пробілу. Правило: кодуй рівно один раз, у момент складання адреси, і ніколи не кодуй те, що щойно взяв із адреси.',
      },
      {
        type: 'example',
        title: 'Межові випадки й подвійне кодування',
        template: `[{{ nil | url_encode }}]
[{{ 42 | url_encode }}]
[{{ "simple-text_123" | url_encode }}]
Один раз: {{ "a b" | url_encode }}
Двічі:    {{ "a b" | url_encode | url_encode }}`,
        note: '`nil` дає порожньо, число — само себе. Латинські літери, цифри, дефіс і підкреслення безпечні й лишаються без змін — а от кирилиця кодується завжди, по дві трійки `%XX` на літеру. Останній рядок — та сама подвійна біда: плюс із першого проходу закодувався в `%2B`, і при розкодуванні пробіл уже не повернеться.',
      },
      {
        type: 'note',
        tone: 'shopify',
        text: 'Типові місця в темі: форма пошуку й посилання на попередні запити, параметр `return_to` у посиланні на вхід (`/account/login?return_to={{ request.path | url_encode }}`), кнопки «поділитись» (адреса товару й текст ідуть параметрами), `utm`-мітки в банерах. Для внутрішніх адрес майже завжди краще взяти готові поля — `product.url`, `collection.url`, `routes.*`: вони вже коректні, і кодувати їх не треба.',
      },
      {
        type: 'note',
        tone: 'interview',
        title: 'На співбесіді',
        text: 'Питання-розрізнювач: «чим `url_encode` відрізняється від `escape`?». Відповідь у одну фразу: **`url_encode` — для адрес, `escape` — для HTML**, вони вирішують різні задачі й не замінюють один одного. Далі сильна відповідь додає, що пробіл `url_encode` кодує як `+`, а не `%20` — тому для частин шляху беруть `url_escape`; що кодувати треба окреме значення, а не адресу цілком; і що подвійне кодування впізнається за `%2520`. Якщо назвеш ще й `url_param_escape` як третій варіант — питання закрите.',
      },
    ],
  },

  /* ───────────────────────── where ───────────────────────── */
  {
    slug: 'where',
    section: 'filters',
    title: 'where',
    category: 'array',
    syntax: 'array | where: string, string',
    summary:
      'Лишає в масиві лише ті елементи, у яких задана властивість має задане значення. Без другого параметра — лишає ті, у яких властивість truthy.',
    officialUrl: 'https://shopify.github.io/liquid/filters/where/',
    related: ['filters/find', 'filters/reject', 'filters/has', 'filters/map', 'filters/sort', 'filters/size', 'filters/sum', 'tags/iteration', 'shopify/collection-and-pagination'],
    blocks: [
      {
        type: 'p',
        text: '`where` — найважливіший фільтр масивів у темах Shopify. Він відбирає елементи за властивістю: доступні варіанти, товари одного бренду, позиції кошика зі знижкою, блоки секції одного типу. На виході — **новий масив**, вихідний не змінюється.',
      },
      {
        type: 'p',
        text: 'У нього дві форми, і їх треба розрізняти чітко. З двома параметрами — «властивість дорівнює значенню». З одним — «властивість truthy», тобто просто **є** і не порожня.',
      },
      {
        type: 'example',
        title: 'Форма 1: властивість і значення',
        preset: 'collection',
        template: `{% assign inoar = collection.products | where: "vendor", "Inoar" %}
Товарів Inoar: {{ inoar.size }}
{% for product in inoar %}
- {{ product.title }} — {{ product.price | money }}
{%- endfor %}`,
        note: 'Порівняння точне: `"Inoar"` і `"inoar"` — різні значення. Якщо дані вводили руками, регістр доведеться нормалізувати заздалегідь.',
      },
      {
        type: 'example',
        title: 'Форма 2: булева властивість без значення',
        preset: 'collection',
        template: `{%- assign live = collection.products | where: "available" -%}
У продажу: {{ live.size }} із {{ collection.products.size }}
{{ live | map: "title" | join: ", " }}

{%- assign sale = collection.products | where: "compare_at_price" %}
Зі старою ціною: {{ sale | map: "title" | join: ", " }}`,
        note: 'Другий блок — важливий нюанс: одна форма перевіряє **не лише булеві** властивості, а взагалі truthy. `compare_at_price` — це число або `nil`, і фільтр лишає товари, де воно є. Так відбирають усе, що «заповнене»: товари з фото, статті з тегами, блоки з текстом.',
      },
      { type: 'h', text: 'Параметри' },
      {
        type: 'table',
        head: ['Параметр', 'Тип', 'Що робить'],
        rows: [
          ['властивість', 'string', 'Імʼя властивості елемента: `"vendor"`, `"available"`, `"type"`. У лапках.'],
          ['значення (необовʼязкове)', 'string / number / boolean', 'З чим порівнювати. Без нього фільтр лишає елементи, у яких властивість truthy.'],
        ],
      },
      {
        type: 'example',
        title: 'Шукати за значенням false',
        preset: 'collection',
        template: `{% assign sold_out = collection.products | where: "available", false %}
Немає в наявності: {{ sold_out | map: "title" | join: ", " }}`,
        note: 'Щоб знайти саме `false`, значення треба передати явно. Одна форма (`where: "available"`) тут не підійде — вона працює навпаки. Для «усе, крім» є окремий фільтр [reject](/docs/filters/reject).',
      },
      {
        type: 'note',
        tone: 'warn',
        title: 'Головна пастка: порівняння СУВОРЕ',
        text: 'Рядок `"5"` і число `5` для `where` — різні значення, і жодного приведення типів не відбувається. Тому найчастіший баг із цим фільтром виглядає так: `id` дістали з тексту через [split](/docs/filters/split) — а там усе стає **рядками**, — і `where: "id", id` мовчки повертає порожній масив. Не помилка, не попередження: просто нічого не знайшлося.',
      },
      {
        type: 'example',
        title: 'Суворе порівняння в дії',
        template: `{% assign a = items | where: "id", "5" %}Шукали рядок "5": {{ a | map: "t" | join: ", " }}
{% assign b = items | where: "id", 5 %}Шукали число 5:  {{ b | map: "t" | join: ", " }}`,
        data: { items: [{ id: 5, t: 'елемент із числовим id' }, { id: '5', t: 'елемент із рядковим id' }] },
        note: 'Два однакові на вигляд запити знайшли **різні** елементи. Саме через це фільтр так часто «не працює» без видимої причини.',
      },
      {
        type: 'example',
        title: 'Той самий баг на реальних даних',
        preset: 'collection',
        template: `{%- assign wanted = "1002,1004" | split: "," -%}
{% for id in wanted %}id {{ id }} → знайдено: {{ collection.products | where: "id", id | size }}
{% endfor %}
А ось так спрацює: {{ collection.products | where: "id", 1002 | size }}`,
        note: 'Після `split` у змінній `id` лежить рядок `"1002"`, а в товарі — число `1002`. Рецепт: привести рядок до числа арифметикою (`{% assign n = id | plus: 0 %}`) або відбирати за текстовою властивістю — `handle` для цього годиться краще за `id`.',
      },
      { type: 'h', text: 'Ланцюжок: where → map → join' },
      {
        type: 'p',
        text: 'Сам по собі `where` віддає масив обʼєктів — виводити його немає сенсу. Сила в ланцюжку: відібрали, дістали потрібну властивість, склеїли в рядок. Три фільтри роблять те, на що інакше пішов би цикл із умовою та змінною-накопичувачем.',
      },
      {
        type: 'example',
        title: 'Ланцюжки на кожен день',
        preset: 'product',
        template: `Доступні обʼєми: {{ product.variants | where: "available" | map: "title" | join: ", " }}
Артикули в наявності: {{ product.variants | where: "available" | map: "sku" | join: " / " }}
Найдешевший доступний: {{ product.variants | where: "available" | map: "price" | sort | first | money }}
Варіантів зі старою ціною: {{ product.variants | where: "compare_at_price" | size }}`,
        note: 'Перший рядок — готовий підпис «є в наявності» під селектором варіантів. Третій показує, що після `where` можна вести хоч яку арифметику: [map](/docs/filters/map) робить масив чисел, [sort](/docs/filters/sort) упорядковує, `first` бере мінімум.',
      },
      {
        type: 'example',
        title: 'where і sum: підсумки за умовою',
        preset: 'cart',
        template: `{%- assign coco = cart.items | where: "vendor", "Cocochoco" -%}
Cocochoco: {{ coco | sum: "quantity" }} шт на {{ coco | sum: "final_line_price" | money }}

{%- assign discounted = cart.items | where: "total_discount" -%}
Позицій зі знижкою: {{ discounted | size }}, зекономлено {{ discounted | sum: "total_discount" | money }}`,
        note: 'Звʼязка `where` + [sum](/docs/filters/sum) закриває майже всі підсумки кошика, яких немає в готових полях: сума за брендом, вага товарів, кількість позицій, що потребують доставки.',
      },
      { type: 'h', text: 'where проти циклу з if' },
      {
        type: 'p',
        text: 'Те саме можна написати циклом з умовою. Різниця не в довжині коду, а в тому, що `where` дає **масив**: його можна порахувати (`.size`), відсортувати, передати в сніпет, показати «нічого не знайдено» через `{% else %}`. Усередині циклу з `if` нічого з цього недоступне — ти дізнаєшся, що збігів не було, тільки після того, як цикл закінчиться.',
      },
      {
        type: 'example',
        title: 'Цикл з if: заголовок не вміє рахувати',
        preset: 'collection',
        template: `{% for product in collection.products %}
  {%- if product.vendor == "Cocochoco" %}- {{ product.title }}
{% endif -%}
{% endfor %}
А скільки їх було? Змінну-лічильник довелось би заводити окремо.`,
        note: 'Працює, але заголовок «Знайдено N» тут не написати, а порожній результат виглядатиме просто як порожнє місце.',
      },
      {
        type: 'example',
        title: 'where: масив, лічильник і чесне «нічого немає»',
        preset: 'collection',
        template: `{%- assign found = collection.products | where: "vendor", "Cocochoco" -%}
{%- assign missing = collection.products | where: "vendor", "Brae" -%}
Знайдено: {{ found.size }}
{% for product in found %}- {{ product.title }}
{% else %}Товарів цього бренду немає{% endfor %}
Brae: {{ missing.size }} — {% if missing.size == 0 %}список порожній{% endif %}`,
        note: 'Гілка `{% else %}` в циклі спрацьовує на порожньому масиві — саме через це `where` зручніший за `if` усередині. І зверни увагу: коли збігів немає, повертається **порожній масив**, а не `nil`, тож `.size` і цикл далі працюють нормально.',
      },
      { type: 'h', text: 'Сусіди: find, reject, has' },
      {
        type: 'table',
        head: ['Фільтр', 'Що повертає', 'Коли брати'],
        rows: [
          ['`where`', 'Масив усіх збігів (можливо порожній)', 'Потрібен список або лічильник'],
          ['[find](/docs/filters/find)', '**Один** елемент — перший збіг, або `nil`', 'Потрібен рівно один обʼєкт: варіант за назвою, блок за типом'],
          ['[reject](/docs/filters/reject)', 'Масив усіх, хто **не** збігся', 'Потрібне «все, крім»'],
          ['[has](/docs/filters/has)', '`true` або `false`', 'Потрібна лише відповідь «чи є такий», без самого елемента'],
        ],
      },
      {
        type: 'example',
        title: 'Чотири фільтри на одних даних',
        preset: 'collection',
        template: `{%- assign one = collection.products | find: "vendor", "Inoar" -%}
where:  {{ collection.products | where: "vendor", "Inoar" | map: "title" | join: ", " }}
find:   {{ one.title }} ({{ one.price | money }})
reject: {{ collection.products | reject: "vendor", "Inoar" | map: "title" | join: ", " }}
has:    {{ collection.products | has: "vendor", "Inoar" }} / {{ collection.products | has: "vendor", "Brae" }}`,
        note: '`find` віддає **сам обʼєкт**, а не масив із одного елемента, тому його завжди кладуть у змінну й далі звертаються через крапку. Раніше замість нього писали `where: … | first` — це працює й досі, але проходить увесь масив, тоді як `find` зупиняється на першому збігу.',
      },
      {
        type: 'note',
        tone: 'warn',
        title: 'Пастка: масив у властивості не збігається',
        text: '`collection.products | where: "tags", "хіт"` поверне **порожньо**, хоча теги в товарів є. Причина проста: `tags` — це масив, а порівнюється він цілком, як одне значення, і масив ніколи не дорівнює рядку. Для тегів потрібен цикл із `contains`: `{% if product.tags contains "хіт" %}`.',
      },
      {
        type: 'note',
        tone: 'warn',
        title: 'Пастка: вкладений шлях у властивості',
        text: 'Спокуса написати `where: "metafields.custom.ph", 5.5` велика, але `where` дивиться на властивість **першого рівня** й крапкового шляху не розбирає. До того ж метаполе — це обʼєкт, а не число, тож порівнювати довелось би з `.value`, куди `where` теж не дістанеться. Для вкладених значень лишається цикл із `if`.',
      },
      {
        type: 'note',
        tone: 'shopify',
        title: 'Головне обмеження: where бачить лише завантажене',
        text: 'Це найважливіше, що треба знати про `where` у Shopify, і саме це відрізняє людину з досвідом. `collection.products` — **не вся колекція**, а максимум 50 товарів: без `paginate` це перші 50, із `paginate by 24` — 24 товари поточної сторінки. Тому `collection.products | where: "vendor", "Inoar"` насправді означає «товари Inoar серед тих, що вже на цій сторінці». Колекція з 300 товарів дасть різні результати на першій і другій сторінці, а бренд, чиї товари лежать глибше, не знайдеться взагалі. Те саме з `blog.articles` і `search.results`.',
      },
      {
        type: 'note',
        tone: 'tip',
        title: 'Що робити замість',
        text: 'Якщо треба відібрати з **усієї** колекції — це робота сервера, а не шаблону. Варіанти: окрема колекція з автоматичними умовами; адреса виду `/collections/home-care/inoar` (фільтр за тегом, `collection.current_tags`); параметри фільтрації Search & Discovery (`?filter.p.vendor=Inoar`); Storefront API з клієнта. `where` у шаблоні лишається для **коротких** списків, де все точно завантажене: варіанти товару, рядки кошика, блоки секції, метаобʼєкти, замовлення клієнтки.',
      },
      {
        type: 'example',
        title: 'Де where завжди безпечний: блоки секції',
        template: `{%- assign features = section.blocks | where: "type", "feature" -%}
Переваг у секції: {{ features.size }}
{% for block in features %}
- {{ block.settings.title }}
{%- endfor %}

{% schema %}
{
  "name": "Переваги",
  "blocks": [
    { "type": "feature", "name": "Перевага", "settings": [
      { "type": "text", "id": "title", "label": "Заголовок", "default": "Без сульфатів" } ] },
    { "type": "note", "name": "Примітка", "settings": [] }
  ],
  "presets": [ { "name": "Переваги", "blocks": [ { "type": "feature" }, { "type": "note" }, { "type": "feature" } ] } ]
}
{% endschema %}`,
        note: '`section.blocks` — масив, який завжди завантажений цілком, тож обмеження з 50 товарами тут не діє. Відбір блоків за `type` — найчастіший і найбезпечніший `where` у справжніх темах.',
      },
      {
        type: 'example',
        title: 'Межові випадки',
        template: `[{{ nil | where: "a", 1 | size }}]
[{{ collection.products | where: "vendor", "Brae" | size }}]
[{{ collection.products | where: "неіснуюча_властивість" | size }}]`,
        preset: 'collection',
        note: '`nil` перетворюється на порожній масив. Немає збігів — теж порожній масив, а не `nil`: далі по ланцюжку все працює. Невідома властивість у одній формі дає порожній результат, бо `nil` — це falsy; помилки не буде ніде, і саме тому опечатку в імені властивості так легко не помітити.',
      },
      {
        type: 'note',
        tone: 'interview',
        title: 'На співбесіді',
        text: '`where` питають майже завжди, і питають у три заходи. Перший, junior: «як відібрати доступні варіанти?» — `product.variants | where: "available"`, і поясни, що одна форма перевіряє truthy, а дві — рівність. Другий, middle: «чому `where` нічого не знайшов?» — три причини в порядку ймовірності: типи не збіглися (`"5"` ≠ `5` після `split`), регістр, або властивість насправді масив (як `tags`). Третій, senior, і саме він вирішує: «чи можна фільтром `where` зробити фільтр колекції за брендом?» — **ні**, бо `collection.products` віддає максимум 50 товарів поточної сторінки, тож відбір буде неповним і різним на кожній сторінці; справжня фільтрація — це окрема колекція, адреса з тегом або параметри Search & Discovery. Додай наприкінці, що для одного елемента є `find`, для «все, крім» — `reject`, а для простої перевірки наявності — `has`, який не будує зайвого масиву.',
      },
    ],
  },
]
