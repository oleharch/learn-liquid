import type { DocPage } from '../types'

export const filtersB: DocPage[] = [
  /* ───────────────────────── has ───────────────────────── */
  {
    slug: 'has',
    section: 'filters',
    title: 'has',
    category: 'array',
    syntax: 'array | has: string, string',
    summary:
      'Перевіряє, чи є в масиві обʼєктів **хоча б один** елемент із заданим значенням властивості. Повертає `true` або `false`.',
    officialUrl: 'https://shopify.dev/docs/api/liquid/filters/has',
    related: ['filters/where', 'filters/reject', 'filters/find', 'filters/find_index', 'tags/control-flow'],
    blocks: [
      {
        type: 'p',
        text: '`has` відповідає на питання «чи є серед елементів такий, у якого властивість дорівнює значенню?». Він не повертає ні елемент, ні масив — лише булеве `true`/`false`. Це один із новіших фільтрів масивів: раніше те саме робили через `where` і перевірку `size`, або циклом із прапорцем.',
      },
      {
        type: 'example',
        title: 'Базовий випадок: властивість + значення',
        preset: 'collection',
        template: `Є Inoar: {{ collection.products | has: 'vendor', 'Inoar' }}
Є Schwarzkopf: {{ collection.products | has: 'vendor', 'Schwarzkopf' }}`,
        note: 'У колекції два товари Inoar — але `has` це не цікавить: йому досить першого збігу.',
      },
      { type: 'h', text: 'Параметри' },
      {
        type: 'table',
        head: ['Параметр', 'Тип', 'Що робить'],
        rows: [
          ['перший', 'рядок', 'Імʼя властивості, яку перевіряємо в кожного елемента: `vendor`, `available`, `type`.'],
          ['другий', 'будь-який', 'Значення, з яким порівнюємо. Порівняння **строге**: число `39900` і рядок `"39900"` — різні речі. Якщо не передати, перевіряється, що властивість truthy.'],
        ],
      },
      {
        type: 'example',
        title: 'Булева властивість',
        preset: 'collection',
        template: `{% assign any_sold_out = collection.products | has: 'available', false %}
{% assign any_sale = collection.products | has: 'compare_at_price' %}

{% if any_sold_out %}Частину товарів розпродано.{% endif %}
{% if any_sale %}У колекції є знижки.{% endif %}`,
        note: 'Перший виклик шукає `available == false`. Другий — без значення: досить, щоб `compare_at_price` був truthy (у товарів без знижки там `nil`).',
      },
      {
        type: 'note',
        tone: 'warn',
        title: 'У `if` фільтр не вставиш',
        text: 'У Shopify умова тега `if` не приймає фільтрів: `{% if collection.products | has: … %}` не спрацює так, як ти чекаєш. Спершу `assign`, потім `if` по змінній — як у прикладі вище. Пісочниця (LiquidJS) тут поблажливіша за Shopify, тож не перевіряй цю пастку на ній.',
      },
      { type: 'h', text: '`has` проти `where`' },
      {
        type: 'example',
        title: 'Старий спосіб і новий',
        preset: 'collection',
        template: `{% assign inoar = collection.products | where: 'vendor', 'Inoar' %}
where + size: {% if inoar.size > 0 %}так{% else %}ні{% endif %}

{% assign has_inoar = collection.products | has: 'vendor', 'Inoar' %}
has: {% if has_inoar %}так{% else %}ні{% endif %}`,
        note: 'Результат той самий, але `has` прямо каже, що тобі потрібна відповідь «так/ні», а не відфільтрований масив.',
      },
      {
        type: 'table',
        head: ['Фільтр', 'Що повертає', 'Коли брати'],
        rows: [
          ['[where](/docs/filters/where)', 'масив усіх збігів', 'треба вивести знайдені елементи'],
          ['[reject](/docs/filters/reject)', 'масив усього, **крім** збігів', 'треба прибрати зайве'],
          ['[find](/docs/filters/find)', 'перший збіг або `nil`', 'потрібен один конкретний елемент'],
          ['[find_index](/docs/filters/find_index)', 'індекс першого збігу або `nil`', 'потрібна позиція'],
          ['`has`', '`true` / `false`', 'потрібен лише факт наявності'],
        ],
      },
      {
        type: 'example',
        title: 'Межові випадки',
        preset: 'collection',
        data: { empty_list: [] },
        template: `nil: {{ nothing | has: 'vendor', 'Inoar' }}
порожній масив: {{ empty_list | has: 'vendor', 'Inoar' }}
немає такої властивості: {{ collection.products | has: 'color', 'red' }}
інший регістр: {{ collection.products | has: 'vendor', 'inoar' }}
рядок замість числа: {{ collection.products | has: 'price', '39900' }}
число: {{ collection.products | has: 'price', 39900 }}`,
        note: 'Помилок немає ніде — просто `false`. Дві останні стрічки — про строге порівняння: ціна в даних число, тож рядок `"39900"` із нею не збігається.',
      },
      {
        type: 'note',
        tone: 'shopify',
        text: 'Типові місця в темі: показати блок «Повідомити про наявність», якщо `product.variants | has: \'available\', false`; вивести плашку про доставку, якщо в кошику `cart.items | has: \'requires_shipping\', true`. Довідка Shopify описує `has` у формі з двома аргументами; коротка форма для булевих властивостей поводиться так само, як у `where`. Хочеш без сюрпризів — пиши значення явно: `has: \'available\', true`.',
      },
      {
        type: 'note',
        tone: 'warn',
        title: 'Це для масивів обʼєктів',
        text: '`has` шукає **властивість** елемента. Для масиву простих рядків (`product.tags`) він не підходить — там працює оператор `contains`: `{% if product.tags contains \'хіт\' %}`.',
      },
      {
        type: 'note',
        tone: 'interview',
        title: 'На співбесіді',
        text: '«Як перевірити, чи є в колекції хоч один товар певного вендора?» Сильна відповідь — назвати обидва шляхи: класичний `where: \'vendor\', \'X\'` плюс `size > 0` і новий `has: \'vendor\', \'X\'`, який одразу дає булеве значення. І додати, що результат треба покласти в змінну через `assign`, бо фільтри в умові `if` не працюють.',
      },
    ],
  },

  /* ───────────────────────── join ───────────────────────── */
  {
    slug: 'join',
    section: 'filters',
    title: 'join',
    category: 'array',
    syntax: 'array | join: string',
    summary: 'Склеює елементи масиву в один рядок через роздільник. Без параметра роздільник — пробіл.',
    officialUrl: 'https://shopify.github.io/liquid/filters/join/',
    related: ['filters/split', 'filters/map', 'filters/replace_last', 'filters/concat', 'tags/iteration'],
    blocks: [
      {
        type: 'p',
        text: '`join` — це вихід із світу масивів назад у світ рядків. Масив у Liquid не можна нормально надрукувати: `{{ product.tags }}` виведе елементи **впритул**, без жодного роздільника. Тому майже кожен ланцюжок, який починається зі `split` або `map`, закінчується на `join`.',
      },
      {
        type: 'example',
        title: 'Базовий випадок',
        preset: 'product',
        template: `Без join: {{ product.tags }}
join без параметра: {{ product.tags | join }}
join: ', ' → {{ product.tags | join: ', ' }}`,
        note: 'Перший рядок — причина, чому `join` існує. Другий — роздільник за замовчуванням, **один пробіл**.',
      },
      { type: 'h', text: 'Параметри' },
      {
        type: 'table',
        head: ['Параметр', 'Тип', 'Що робить'],
        rows: [
          ['роздільник', 'рядок, необовʼязковий', 'Що вставити **між** елементами. За замовчуванням — пробіл. Порожній рядок `\'\'` склеїть упритул. Може бути й шматком HTML.'],
        ],
      },
      {
        type: 'example',
        title: 'Після split і після map',
        preset: 'collection',
        template: `{{ 'шампунь,маска,олійка' | split: ',' | join: ' · ' }}
{{ collection.products | map: 'title' | join: ' | ' }}`,
        note: '`split` розбив рядок на масив, `map` витягнув із товарів назви — в обох випадках далі йде масив, і надрукувати його по-людськи може лише `join`.',
      },
      {
        type: 'example',
        title: 'HTML як роздільник',
        preset: 'product',
        view: 'html',
        template: `<ul><li>{{ product.tags | join: '</li><li>' }}</li></ul>`,
        note: 'Роздільник стає **між** елементами, тому перший `<li>` і останній `</li>` дописуємо руками. Трюк зручний для простих рядків; щойно елементу потрібна розмітка чи умова — бери `for`.',
      },
      {
        type: 'note',
        tone: 'warn',
        title: 'Після join це вже рядок',
        text: 'Усе, що стоїть у ланцюжку після `join`, працює з рядком: `size` порахує **символи**, а не елементи, `first` дасть першу літеру, `for` по ньому не пройдеться. Фільтри масивів (`sort`, `uniq`, `reverse`) став **до** `join`.',
      },
      {
        type: 'example',
        title: 'size до і після',
        preset: 'product',
        template: `Елементів: {{ product.tags | size }}
Символів у склеєному рядку: {{ product.tags | join: ', ' | size }}`,
      },
      {
        type: 'example',
        title: 'Межові випадки',
        data: { mixed: [1, null, 'x', true], empty_list: [] },
        template: `nil: [{{ nothing | join: ', ' }}]
порожній масив: [{{ empty_list | join: ', ' }}]
рядок замість масиву: [{{ 'кератин' | join: ', ' }}]
масив із nil усередині: [{{ mixed | join: ', ' }}]`,
        note: 'Рядок `join` не чіпає — розбивати його на літери він не буде. А `nil` усередині масиву дає порожнє місце між двома комами; прибрати такі діри допоможе [compact](/docs/filters/compact).',
      },
      {
        type: 'note',
        tone: 'tip',
        text: 'Потрібне «а, б та в» замість «а, б, в»? Склей через кому, а тоді заміни останню: `{{ product.tags | join: \', \' | replace_last: \', \', \' та \' }}` — див. [replace_last](/docs/filters/replace_last).',
      },
      {
        type: 'note',
        tone: 'shopify',
        text: 'У темах `join` живе в трьох місцях: список тегів чи вендорів у фільтрах колекції, `data-`атрибути для JS (`data-tags="{{ product.tags | join: \',\' }}"`) і класи з масиву (`class="{{ classes | join: \' \' }}"`). Якщо дані йдуть у JavaScript — краще одразу [фільтр `json`](/docs/shopify/liquid-and-js), а не ручне склеювання.',
      },
      {
        type: 'note',
        tone: 'interview',
        title: 'На співбесіді',
        text: '«Що виведе `{{ product.tags }}`?» — елементи впритул, без роздільників, бо Liquid приводить масив до рядка простим склеюванням. «Як вивести через кому?» — `join: \', \'`. Бонус: `split` і `join` — дзеркальна пара, і через неї роблять те, чого в Liquid немає напряму, наприклад розворот рядка: `split: \'\' | reverse | join: \'\'`.',
      },
    ],
  },

  /* ───────────────────────── last ───────────────────────── */
  {
    slug: 'last',
    section: 'filters',
    title: 'last',
    category: 'array',
    syntax: 'array | last',
    summary: 'Повертає останній елемент масиву. Працює і як фільтр (`| last`), і як властивість через крапку (`.last`).',
    officialUrl: 'https://shopify.github.io/liquid/filters/last/',
    related: ['filters/first', 'filters/split', 'filters/sort', 'filters/reverse', 'tags/iteration'],
    blocks: [
      {
        type: 'p',
        text: '`last` бере з масиву останній елемент — рядок, число або цілий обʼєкт. Параметрів у нього немає. Дзеркальний фільтр — [first](/docs/filters/first). Обидва цікаві тим, що мають другу форму запису: через крапку, як звичайна властивість.',
      },
      {
        type: 'example',
        title: 'Базовий випадок',
        preset: 'product',
        template: `Останній тег: {{ product.tags | last }}
Останнє розширення: {{ 'photo.final.jpg' | split: '.' | last }}`,
        note: 'Другий рядок — класичний прийом: розбити рядок `split`-ом і взяти хвіст. Так дістають розширення файлу або останній сегмент адреси.',
      },
      { type: 'h', text: 'Форма через крапку: `.last`' },
      {
        type: 'p',
        text: 'Фільтри не можна писати всередині тегів `if`, `case`, `for` — лише у виводі й в `assign`. А `.last` — це не фільтр, а звернення до властивості, тому воно працює **всюди**. І ще одне: елемент масиву обʼєктів — це обʼєкт, тож після `.last` можна одразу йти далі по крапці.',
      },
      {
        type: 'example',
        title: '.last у виводі та в умові',
        preset: 'product',
        template: `{{ product.variants.last.title }}

{% if product.variants.last.available == false %}
Найбільший обʼєм тимчасово закінчився.
{% endif %}`,
        note: 'З фільтром довелося б писати два кроки: `assign v = product.variants | last`, а потім `v.title`. Через крапку — один вираз.',
      },
      {
        type: 'example',
        title: 'Найдорожчий варіант',
        preset: 'product',
        template: `{{ product.variants | map: 'price' | sort | last | money }}`,
        note: '`map` дістав ціни, `sort` упорядкував за зростанням — отже, останній елемент найбільший. Для найменшого — `first`.',
      },
      {
        type: 'example',
        title: 'Межові випадки',
        data: { empty_list: [] },
        template: `порожній масив: [{{ empty_list | last }}]
nil: [{{ nothing | last }}]
рядок: [{{ 'кератин' | last }}]`,
        note: 'Порожній масив і `nil` дають порожнечу без помилки. А от рядок — розбіжність: пісочниця повертає останню літеру, справжній Shopify — нічого, бо для нього `last` існує лише в масивів.',
        shopifyOutput: 'порожній масив: []\nnil: []\nрядок: []',
      },
      {
        type: 'note',
        tone: 'warn',
        title: 'Не плутай із forloop.last',
        text: '`forloop.last` — це **булеве** значення «чи остання зараз ітерація», воно існує лише всередині `for`. А `array.last` — сам останній елемент. Кому після останнього елемента прибирають саме через `forloop.last`: `{% unless forloop.last %}, {% endunless %}`.',
      },
      {
        type: 'note',
        tone: 'shopify',
        text: 'У темах: `product.images.last`, `collection.products.last`, `blog.articles.last`, `customer.orders.last`. Памʼятай, що «останній» — це останній **у тому порядку, в якому масив прийшов**: у `customer.orders` найновіше замовлення стоїть першим, тож `last` дасть найстаріше.',
      },
      {
        type: 'note',
        tone: 'interview',
        title: 'На співбесіді',
        text: '«Чим `| last` відрізняється від `.last`?» Результат однаковий, різниця — де це можна написати. Фільтр працює лише у виводі `{{ }}` та в `assign`; форма через крапку — ще й в умовах `if`/`unless` і в будь-якому виразі, і після неї можна продовжити ланцюжок властивостей: `product.variants.last.price`.',
      },
    ],
  },

  /* ───────────────────────── lstrip ───────────────────────── */
  {
    slug: 'lstrip',
    section: 'filters',
    title: 'lstrip',
    category: 'string',
    syntax: 'string | lstrip',
    summary: 'Прибирає всі пробільні символи (пробіли, таби, переноси рядка) на **початку** рядка. Середину й кінець не чіпає.',
    officialUrl: 'https://shopify.github.io/liquid/filters/lstrip/',
    related: ['filters/rstrip', 'filters/strip', 'filters/strip_newlines', 'basics/whitespace'],
    blocks: [
      {
        type: 'p',
        text: '`lstrip` — «left strip»: зрізає пробільні символи зліва. Є трійка фільтрів-родичів: `lstrip` (зліва), [rstrip](/docs/filters/rstrip) (справа) і [strip](/docs/filters/strip) (з обох боків). На практиці найчастіше беруть `strip`, а `lstrip` — коли хвіст рядка треба зберегти як є.',
      },
      {
        type: 'example',
        title: 'Три родичі поруч',
        template: `[{{ '   Кератин  ' | lstrip }}]
[{{ '   Кератин  ' | rstrip }}]
[{{ '   Кератин  ' | strip }}]`,
        note: 'Квадратні дужки тут лише для того, щоб побачити, де лишилися пробіли.',
      },
      {
        type: 'example',
        title: 'Не лише пробіли',
        data: { text: '\n\t  Перший рядок\n  другий рядок  ' },
        template: `[{{ text | lstrip }}]`,
        note: 'На початку було: перенос рядка, таб і два пробіли — усе зрізано. Відступ перед «другий рядок» залишився: це вже **середина** рядка.',
      },
      {
        type: 'p',
        text: 'Звідки взагалі беруться пробіли на початку? Найчастіше — з `capture`: усе, що стоїть між `{% capture %}` і `{% endcapture %}`, включно з відступами й переносами, потрапляє у змінну.',
      },
      {
        type: 'example',
        title: 'Після capture',
        preset: 'product',
        template: `{% capture label %}
    {{ product.vendor }} · {{ product.type }}
{% endcapture %}
[{{ label }}]
[{{ label | lstrip }}]
[{{ label | strip }}]`,
        note: '`lstrip` прибрав перенос і відступ зліва, але перенос у кінці лишився — закривна дужка зʼїхала на новий рядок. Для значень із `capture` майже завжди потрібен саме `strip`.',
      },
      {
        type: 'note',
        tone: 'warn',
        title: 'lstrip — не те саме, що {%- -%}',
        text: 'Дефіси в тегах (`{%-`, `-%}`, `{{-`, `-}}`) зрізають пробіли **в тексті шаблону** навколо тега. `lstrip` зрізає пробіли **у значенні**, яке через нього проходить. Якщо пробіл прийшов у даних (назва товару, введена з пробілом на початку) — дефіси не допоможуть, потрібен фільтр. Докладніше — [керування пробілами](/docs/basics/whitespace).',
      },
      {
        type: 'example',
        title: 'Межові випадки',
        template: `nil: [{{ nothing | lstrip }}]
самі пробіли: [{{ '     ' | lstrip }}]
число: [{{ 42 | lstrip }}]`,
        note: '`nil` стає порожнім рядком, число — рядком `"42"`. Помилок немає.',
      },
      {
        type: 'note',
        tone: 'shopify',
        text: 'Пробіли в даних — не вигадка: мерчанти копіюють назви, теги й тексти налаштувань з таблиць і документів. Порівняння `{% if tag == \'хіт\' %}` мовчки провалиться на тегу `" хіт"`. Тому значення, які далі порівнюються або йдуть в атрибути (`class`, `id`, `data-*`), варто пропускати через `strip`.',
      },
      {
        type: 'note',
        tone: 'interview',
        title: 'На співбесіді',
        text: '«Як прибрати зайві пробіли у виводі?» Розділи відповідь на два випадки. Пробіли від самої розмітки шаблону — це whitespace control, дефіси в тегах. Пробіли всередині значення — фільтри `strip`, `lstrip`, `rstrip`, а переноси посеред тексту — `strip_newlines`. Хто називає обидва механізми й пояснює різницю, той показує, що розуміє, як Liquid будує вивід.',
      },
    ],
  },

  /* ───────────────────────── map ───────────────────────── */
  {
    slug: 'map',
    section: 'filters',
    title: 'map',
    category: 'array',
    syntax: 'array | map: string',
    summary:
      'Із масиву обʼєктів робить масив значень однієї властивості: з товарів — назви, з варіантів — ціни, з позицій кошика — кількості.',
    officialUrl: 'https://shopify.github.io/liquid/filters/map/',
    related: ['filters/join', 'filters/uniq', 'filters/compact', 'filters/sum', 'filters/where', 'filters/sort', 'tags/iteration'],
    blocks: [
      {
        type: 'p',
        text: '`map` проходить по масиву обʼєктів і з кожного дістає **одну властивість**. На вході — пʼять товарів, на виході — пʼять назв. Це головний спосіб працювати з колекціями даних без циклу: далі результат можна відсортувати, почистити від дублікатів, порахувати чи склеїти в рядок.',
      },
      {
        type: 'example',
        title: 'Базовий випадок',
        preset: 'collection',
        template: `{{ collection.products | map: 'title' | join: ', ' }}`,
        note: 'Параметр — **імʼя властивості рядком**, у лапках. Не `map: title` — так Liquid шукатиме змінну `title`.',
      },
      {
        type: 'note',
        tone: 'warn',
        title: 'map повертає масив, а не рядок',
        text: 'Найчастіша помилка — надрукувати результат `map` напряму. Liquid приводить масив до рядка простим склеюванням, без роздільників. Після `map` у виводі майже завжди має стояти [join](/docs/filters/join).',
      },
      {
        type: 'example',
        title: 'Що буде без join',
        preset: 'collection',
        template: `{{ collection.products | map: 'vendor' }}`,
        note: 'Пʼять вендорів злиплися в одне слово. Помилки немає — і саме тому цей баг легко пропустити.',
      },
      { type: 'h', text: 'Параметри' },
      {
        type: 'table',
        head: ['Параметр', 'Тип', 'Що робить'],
        rows: [
          ['властивість', 'рядок', 'Імʼя властивості, яку треба дістати з кожного елемента. Один рівень: `title`, `vendor`, `price`, `featured_image`.'],
        ],
      },
      { type: 'h', text: 'Комбінації, які треба знати' },
      {
        type: 'example',
        title: 'map | uniq | sort | join — список вендорів',
        preset: 'collection',
        template: `{{ collection.products | map: 'vendor' | uniq | sort | join: ', ' }}`,
        note: '`map` дав пʼять значень із повторами, `uniq` лишив три унікальні, `sort` упорядкував за абеткою, `join` склеїв. Порядок важливий: `join` — завжди останній, бо після нього це вже рядок.',
      },
      {
        type: 'example',
        title: 'map | compact — прибрати порожні',
        preset: 'collection',
        template: `Товарів: {{ collection.products | size }}
Із фото: {{ collection.products | map: 'featured_image' | compact | size }}

{{ collection.products | map: 'featured_image' | compact | map: 'alt' | join: ' | ' }}`,
        note: 'В одного товару `featured_image` — `nil`, і `map` чесно кладе цей `nil` у масив. [compact](/docs/filters/compact) викидає такі діри. Останній рядок — два `map` поспіль: спершу дістали обʼєкти зображень, потім із них — `alt`.',
      },
      {
        type: 'example',
        title: 'map | sum — порахувати',
        preset: 'cart',
        template: `Одиниць у кошику: {{ cart.items | map: 'quantity' | sum }}
Те саме коротше: {{ cart.items | sum: 'quantity' }}`,
        note: '[sum](/docs/filters/sum) уміє приймати імʼя властивості сам, тож `map` перед ним не обовʼязковий. Але звʼязку `map | sum` варто впізнавати — у старіших темах вона трапляється.',
      },
      {
        type: 'table',
        head: ['Ланцюжок', 'Що дає'],
        rows: [
          ['`map: \'x\' | join: \', \'`', 'значення через кому'],
          ['`map: \'x\' | uniq`', 'унікальні значення (вендори, типи)'],
          ['`map: \'x\' | uniq | sort`', 'унікальні за абеткою'],
          ['`map: \'x\' | compact`', 'без `nil`'],
          ['`map: \'x\' | sum`', 'сума числової властивості'],
          ['`map: \'price\' | sort | first` / `last`', 'мінімум / максимум'],
          ['`where: \'available\' | map: \'title\'`', 'спершу відфільтрувати обʼєкти, потім діставати властивість'],
        ],
      },
      {
        type: 'example',
        title: 'Межові випадки',
        preset: 'collection',
        template: `немає такої властивості: [{{ collection.products | map: 'color' | join: ',' }}]
після compact лишилось: {{ collection.products | map: 'color' | compact | size }}
nil замість масиву: [{{ nothing | map: 'title' | join: ',' }}]`,
        note: 'Неіснуюча властивість — не помилка: виходить масив із пʼяти `nil` (чотири коми між порожнечами). `nil` на вході дає порожній масив.',
      },
      {
        type: 'note',
        tone: 'warn',
        title: 'Фільтруй до map, а не після',
        text: 'Після `map: \'title\'` у тебе масив **рядків** — в них уже немає ні `available`, ні `vendor`. Тому `where`, `reject`, `sort: \'price\'` мають стояти **перед** `map`, поки елементи ще обʼєкти. І ще: вкладений шлях пиши двома кроками (`map: \'featured_image\' | map: \'alt\'`), а не одним рядком `\'featured_image.alt\'` — пісочниця таке пробачає, Ruby-Liquid у Shopify шукає властивість буквально з таким імʼям.',
      },
      {
        type: 'note',
        tone: 'shopify',
        text: 'Класика тем — зібрати вендорів для фільтра: `collection.products | map: \'vendor\' | uniq`. Але `collection.products` віддає лише **поточну сторінку** пагінації (до 50 товарів), тож на великій колекції список буде неповний. Для всієї колекції є готові `collection.all_vendors`, `collection.all_types`, `collection.all_tags`. `map` лишається для всього іншого: `product.variants | map: \'price\'`, `cart.items | map: \'product_id\'`, `product.images | map: \'alt\'`.',
      },
      {
        type: 'note',
        tone: 'interview',
        title: 'На співбесіді',
        text: 'Питання звучить як задача: «виведи через кому унікальних вендорів колекції за абеткою». Відповідь — один рядок: `collection.products | map: \'vendor\' | uniq | sort | join: \', \'`. Проговори кожен крок і дві пастки: `map` повертає **масив**, який без `join` друкується злиплим; і `collection.products` — це лише поточна сторінка, для повного списку є `collection.all_vendors`. Часто додають: «а як без `map`?» — циклом `for` із `capture` або накопиченням рядка, що довше й гірше читається.',
      },
    ],
  },

  /* ───────────────────────── minus ───────────────────────── */
  {
    slug: 'minus',
    section: 'filters',
    title: 'minus',
    category: 'math',
    syntax: 'number | minus: number',
    summary: 'Віднімає число від числа. Оператора `-` у Liquid немає — віднімання робиться лише цим фільтром.',
    officialUrl: 'https://shopify.github.io/liquid/filters/minus/',
    related: ['filters/plus', 'filters/times', 'filters/divided_by', 'filters/modulo', 'filters/at_least', 'shopify/money-filters'],
    blocks: [
      {
        type: 'p',
        text: 'У Liquid немає арифметичних операторів: `{{ a - b }}` не порахує нічого. Уся математика — фільтрами: [plus](/docs/filters/plus), `minus`, [times](/docs/filters/times), [divided_by](/docs/filters/divided_by), [modulo](/docs/filters/modulo). Значення зліва від `|` — зменшуване, параметр — відʼємник.',
      },
      {
        type: 'example',
        title: 'Базовий випадок',
        template: `{{ 10 | minus: 3 }}
{{ 3 | minus: 10 }}
{{ 10 | minus: 2.5 }}`,
        note: 'Результат може бути відʼємним — Liquid нічого не обрізає. Якщо бере участь дробове число, результат теж дробовий.',
      },
      { type: 'h', text: 'Параметри' },
      {
        type: 'table',
        head: ['Параметр', 'Тип', 'Що робить'],
        rows: [['відʼємник', 'число (або рядок із числом)', 'Скільки відняти. Може бути літералом, змінною або властивістю обʼєкта: `minus: product.price`.']],
      },
      {
        type: 'example',
        title: 'Економія і відсоток знижки',
        preset: 'product',
        template: `{% assign saved = product.compare_at_price | minus: product.price %}
Економія: {{ saved | money }}
Знижка: {{ saved | times: 100 | divided_by: product.compare_at_price }}%`,
        note: 'Ціни — в копійках, тому різницю спершу рахуємо, а форматуємо через `money` в самому кінці. Відсоток: різницю множимо на 100 і лише потім ділимо — інакше ціле ділення дало б нуль.',
      },
      {
        type: 'example',
        title: 'Скільки лишилось до безкоштовної доставки',
        preset: 'cart',
        template: `{% assign left = 400000 | minus: cart.total_price | at_least: 0 %}
{% if left > 0 %}
Додай ще на {{ left | money }} — і доставка безкоштовна.
{% else %}
Доставка безкоштовна!
{% endif %}`,
        note: 'Поріг — 4 000 ₴, тобто `400000` копійок. [at_least](/docs/filters/at_least)`: 0` не дає різниці піти в мінус, коли кошик уже більший за поріг.',
      },
      {
        type: 'example',
        title: 'Рядки, nil і дробові',
        data: { qty_text: '10' },
        template: `рядок-число: {{ qty_text | minus: '3' }}
nil зліва: {{ nothing | minus: 3 }}
nil справа: {{ 10 | minus: nothing }}
не число: {{ 'abc' | minus: 1 }}
дробові: {{ 5.5 | minus: 0.5 }}`,
        shopifyOutput: 'рядок-число: 7\nnil зліва: -3\nnil справа: 10\nне число: -1\nдробові: 5.0',
        note: 'Рядок із числом приводиться до числа. `nil` і нечисловий рядок рахуються як `0` — **без помилки**, тож одруківка в імені змінної дасть тихо неправильну суму. Останній рядок — розбіжність пісочниці: Shopify памʼятає, що число було дробовим, і надрукує `5.0`.',
      },
      {
        type: 'note',
        tone: 'warn',
        title: 'Порядок у ланцюжку = порядок дій',
        text: 'Дужок і пріоритетів операцій у Liquid немає: фільтри виконуються зліва направо. `{{ 10 | minus: 2 | times: 3 }}` — це (10 − 2) × 3 = 24, а не 10 − 6. Потрібен інший порядок — рахуй проміжне значення окремим `assign`.',
      },
      {
        type: 'note',
        tone: 'shopify',
        text: 'Де це в темі: бейдж «−18%» і рядок «Ви економите» на картці товару, прогрес-бар безкоштовної доставки в кошику, `forloop.length | minus: forloop.index` для «ще N товарів». Рахуй завжди в копійках і форматуй [грошовим фільтром](/docs/shopify/money-filters) останнім кроком — після `money` це вже рядок, і арифметика з ним зламається.',
      },
      {
        type: 'note',
        tone: 'interview',
        title: 'На співбесіді',
        text: '«Порахуй відсоток знижки в Liquid». Чекають ланцюжок `compare_at_price | minus: price | times: 100 | divided_by: compare_at_price` і два пояснення: арифметичних операторів немає, лише фільтри; і множити на 100 треба **до** ділення, бо ціле на ціле ділиться націло. Добрий тон — згадати перевірку `compare_at_price > price`, щоб не показати «знижку 0%» чи відʼємну.',
      },
    ],
  },

  /* ───────────────────────── modulo ───────────────────────── */
  {
    slug: 'modulo',
    section: 'filters',
    title: 'modulo',
    category: 'math',
    syntax: 'number | modulo: number',
    summary: 'Повертає остачу від ділення. Головне застосування — «кожен N-й елемент» у циклі: ряди сітки, парні/непарні рядки.',
    officialUrl: 'https://shopify.github.io/liquid/filters/modulo/',
    related: ['filters/divided_by', 'filters/minus', 'filters/plus', 'filters/times', 'tags/iteration'],
    blocks: [
      {
        type: 'p',
        text: '`modulo` — те, що в інших мовах пишуть як `%`: остача від ділення. `12 | modulo: 5` — це 2, бо 12 = 5 × 2 + **2**. Сам по собі фільтр простий; цінність у тому, що остача від ділення лічильника циклу на N дорівнює нулю рівно на кожному N-му елементі.',
      },
      {
        type: 'example',
        title: 'Базовий випадок',
        template: `{{ 12 | modulo: 5 }}
{{ 12 | modulo: 4 }}
{{ 7.5 | modulo: 2 }}`,
        note: 'Остача `0` означає «ділиться без остачі» — на цьому й будуються всі перевірки кратності.',
      },
      { type: 'h', text: 'Параметри' },
      {
        type: 'table',
        head: ['Параметр', 'Тип', 'Що робить'],
        rows: [['дільник', 'число (або рядок із числом)', 'На що ділимо. Не нуль.']],
      },
      { type: 'h', text: 'Кожен третій елемент' },
      {
        type: 'example',
        title: 'forloop.index + modulo',
        preset: 'collection',
        template: `{% for product in collection.products %}
  {%- assign rest = forloop.index | modulo: 3 -%}
  {{ product.title }}{% if rest == 0 %} ⟵ кінець ряду{% endif %}
{% endfor %}`,
        note: 'Беремо саме `forloop.index` (рахує з 1), а не `forloop.index0`: з нульовим лічильником «кратним трьом» виявився б перший елемент.',
      },
      {
        type: 'note',
        tone: 'warn',
        title: 'Фільтр в умові не працює',
        text: 'Хочеться написати `{% if forloop.index | modulo: 3 == 0 %}` — але в тезі `if` фільтрів бути не може. Завжди два кроки: `assign rest = forloop.index | modulo: 3`, потім `if rest == 0`.',
      },
      {
        type: 'example',
        title: 'Ряди по два: закрити й відкрити обгортку',
        preset: 'collection',
        view: 'html',
        template: `<div class="row">
{% for product in collection.products %}
  <div class="col">{{ product.title }}</div>
  {%- assign rest = forloop.index | modulo: 2 -%}
  {%- if rest == 0 and forloop.last == false %}
</div>
<div class="row">
  {%- endif %}
{% endfor %}
</div>`,
        note: 'Після кожного другого елемента закриваємо ряд і відкриваємо новий. Перевірка `forloop.last == false` потрібна, щоб при парній кількості товарів не лишити в кінці порожній `<div class="row">`.',
      },
      {
        type: 'example',
        title: 'Хвилини в години й хвилини',
        data: { duration_min: 135 },
        template: `{{ duration_min | divided_by: 60 }} год {{ duration_min | modulo: 60 }} хв`,
        note: 'Пара `divided_by` + `modulo` — ціла частина й остача. Так само ділять секунди на хвилини чи копійки на гривні.',
      },
      {
        type: 'example',
        title: 'Межові випадки',
        template: `рядки: {{ '12' | modulo: '5' }}
відʼємне ділене: {{ -7 | modulo: 3 }}
nil: {{ nothing | modulo: 3 }}
ціле дробове: {{ 9.0 | modulo: 4 }}`,
        shopifyOutput: 'рядки: 2\nвідʼємне ділене: 2\nnil: 0\nціле дробове: 1.0',
        note: 'Знак результату збігається зі знаком **дільника** (як у Ruby, не як у JavaScript): `-7 modulo 3` — це 2, а не −1. Останній рядок — відома розбіжність пісочниці з дробовими.',
      },
      {
        type: 'note',
        tone: 'warn',
        title: 'Ділення на нуль',
        text: 'У Shopify `modulo: 0` — це помилка `Liquid error: divided by 0` просто на сторінці. Пісочниця замість помилки виведе `NaN`. Якщо дільник приходить із налаштувань (`section.settings.columns`), підстрахуйся: `| at_least: 1`.',
      },
      {
        type: 'note',
        tone: 'shopify',
        text: 'Сьогодні сітку товарів верстають на CSS Grid, і обгортки рядів не потрібні. Але `modulo` лишається для логіки: вставити банер після кожного четвертого товару, чергувати розкладку «фото зліва / фото справа» в секціях, розбити меню на колонки. Для простого чергування двох-трьох значень є коротший шлях — тег `cycle` (див. [ітерацію](/docs/tags/iteration)).',
      },
      {
        type: 'note',
        tone: 'interview',
        title: 'На співбесіді',
        text: '«Як вставити рекламний блок після кожного третього товару?» — `assign rest = forloop.index | modulo: 3`, далі `if rest == 0`. Три деталі, які відрізняють упевнену відповідь: `index`, а не `index0`; фільтр не можна писати в самому `if`; для чергування класів «парний/непарний» простіше `cycle`, ніж `modulo`.',
      },
    ],
  },

  /* ───────────────────────── newline_to_br ───────────────────────── */
  {
    slug: 'newline_to_br',
    section: 'filters',
    title: 'newline_to_br',
    category: 'string',
    syntax: 'string | newline_to_br',
    summary: 'Ставить HTML-тег `<br />` перед кожним переносом рядка. Потрібен, щоб багаторядковий текст із налаштувань чи метаполів не злипся в один абзац.',
    officialUrl: 'https://shopify.github.io/liquid/filters/newline_to_br/',
    related: ['filters/strip_newlines', 'filters/escape', 'filters/strip_html', 'shopify/metafields', 'shopify/security'],
    blocks: [
      {
        type: 'p',
        text: 'Браузер ігнорує переноси рядка в HTML: три рядки, які мерчант старанно ввів через Enter, на сторінці стануть одним. `newline_to_br` це виправляє — додає `<br />` до кожного символу переносу (`\\n`). Параметрів немає.',
      },
      {
        type: 'example',
        title: 'Базовий випадок',
        data: { hours: 'Пн–Пт: 10:00–20:00\nСб: 11:00–18:00\nНд: вихідний' },
        view: 'html',
        template: `{{ hours | newline_to_br }}`,
        note: 'Подивись на текстовий вивід: сам перенос `\\n` нікуди не зникає, `<br />` стає **перед** ним. Тобто фільтр доповнює переноси, а не замінює.',
      },
      { type: 'h', text: 'Звідки береться текст із переносами' },
      {
        type: 'list',
        items: [
          'Налаштування типу `textarea` в секціях і блоках — адреса, графік роботи, підпис.',
          'Метаполя типу `multi_line_text_field` — склад, спосіб застосування.',
          'Текст від покупця: `cart.note`, властивості позицій, повідомлення з форм.',
          'Налаштування `richtext` і `product.description` сюди **не** належать — там уже готовий HTML з `<p>`, і `<br />` зламав би верстку.',
        ],
      },
      { type: 'h', text: 'Разом з escape: порядок вирішує' },
      {
        type: 'example',
        title: 'Правильно і неправильно',
        data: { note: 'Знижка <b>-20%</b>\nлише сьогодні' },
        template: `{{ note | escape | newline_to_br }}
=====
{{ note | newline_to_br | escape }}`,
        note: 'Спершу `escape`, потім `newline_to_br`. У другому варіанті `escape` знешкоджує вже й наш `<br />` — він перетворюється на `&lt;br /&gt;` і зʼявиться на сторінці текстом.',
      },
      {
        type: 'note',
        tone: 'warn',
        title: 'Текст від користувача — лише через escape',
        text: '`newline_to_br` нічого не екранує. Якщо вивести `{{ cart.note | newline_to_br }}`, будь-який HTML, який покупець вписав у примітку, потрапить на сторінку як розмітка. Для всього, що вводить не розробник: `| escape | newline_to_br` — саме в такому порядку. Докладніше — [безпека](/docs/shopify/security).',
      },
      {
        type: 'example',
        title: 'Межові випадки',
        data: { windows: 'рядок 1\r\nрядок 2', double: 'абзац 1\n\nабзац 2' },
        template: `nil: [{{ nothing | newline_to_br }}]
без переносів: [{{ 'один рядок' | newline_to_br }}]
Windows-перенос: [{{ windows | newline_to_br | strip_newlines }}]
подвійний перенос: [{{ double | newline_to_br | strip_newlines }}]`,
        note: '`strip_newlines` тут прибирає самі символи переносу, щоб було видно лише вставлені теги. Перенос у стилі Windows (`\\r\\n`) рахується за один. Порожній рядок між абзацами дає два `<br />` поспіль.',
      },
      {
        type: 'code',
        lang: 'liquid',
        title: 'Як це виглядає в секції',
        code: `<address>
  {{ section.settings.address | escape | newline_to_br }}
</address>

{%- assign usage = product.metafields.custom.how_to_use.value -%}
{%- if usage != blank -%}
  <p class="product__usage">{{ usage | escape | newline_to_br }}</p>
{%- endif -%}`,
      },
      {
        type: 'note',
        tone: 'tip',
        text: 'Альтернатива без фільтра — CSS: `white-space: pre-line` на контейнері змусить браузер показувати переноси як є. Зручно, коли текст потрапляє на сторінку через JavaScript, де Liquid-фільтра вже немає.',
      },
      {
        type: 'note',
        tone: 'interview',
        title: 'На співбесіді',
        text: '«Мерчант ввів адресу в `textarea` у три рядки, а на сайті вона в один — чому і як виправити?» HTML згортає пробільні символи, тому потрібен `newline_to_br`. Сильне продовження: перед ним ставлю `escape`, бо поле — довільний текст, і порядок саме такий — інакше екранується й сам `<br />`. І відрізняю `textarea` від `richtext`: другий уже віддає HTML, його фільтрувати не треба.',
      },
    ],
  },

  /* ───────────────────────── plus ───────────────────────── */
  {
    slug: 'plus',
    section: 'filters',
    title: 'plus',
    category: 'math',
    syntax: 'number | plus: number',
    summary: 'Додає число до числа. Оператора `+` у Liquid немає — додавання, як і вся арифметика, робиться фільтрами.',
    officialUrl: 'https://shopify.github.io/liquid/filters/plus/',
    related: ['filters/minus', 'filters/times', 'filters/divided_by', 'filters/modulo', 'filters/sum', 'filters/append'],
    blocks: [
      {
        type: 'p',
        text: 'Перше, що дивує в Liquid після JavaScript: тут **немає арифметичних операторів**. Ні `+`, ні `-`, ні `*`, ні `/`. Оператори в Liquid лише для порівнянь і логіки, і лише всередині тегів. Рахують фільтрами: `plus`, [minus](/docs/filters/minus), [times](/docs/filters/times), [divided_by](/docs/filters/divided_by), [modulo](/docs/filters/modulo).',
      },
      {
        type: 'example',
        title: 'Базовий випадок',
        template: `{{ 4 | plus: 2 }}
{{ 4 | plus: 2.5 }}
{{ 4 | plus: -10 }}`,
      },
      {
        type: 'example',
        title: 'А якщо написати плюс?',
        expectError: true,
        template: `{{ 4 + 2 }}`,
        note: 'Пісочниця зупиняється із синтаксичною помилкою. У Shopify додавання теж не відбудеться — `+` для Liquid просто не оператор. Правильно: `{{ 4 | plus: 2 }}`.',
      },
      { type: 'h', text: 'Параметри' },
      {
        type: 'table',
        head: ['Параметр', 'Тип', 'Що робить'],
        rows: [['доданок', 'число (або рядок із числом)', 'Що додати. Літерал, змінна чи властивість: `plus: item.quantity`.']],
      },
      { type: 'h', text: 'Рядки приводяться до чисел' },
      {
        type: 'example',
        title: 'plus рахує, append склеює',
        data: { per_row: '3' },
        template: `plus: {{ per_row | plus: '5' }}
append: {{ per_row | append: '5' }}
не число: {{ 'abc' | plus: 2 }}
nil: {{ nothing | plus: 2 }}`,
        note: 'Значення налаштувань часто приходять **рядками** — `plus` сам перетворить `"3"` на `3`. Нечисловий рядок і `nil` рахуються як `0`, без помилки. А щоб склеїти рядки, потрібен [append](/docs/filters/append): плюс у Liquid ніколи не конкатенує.',
      },
      {
        type: 'example',
        title: 'Дробові числа',
        template: `{{ 1.5 | plus: 1.5 }}
{{ 2.0 | plus: 3 }}
{{ 2 | plus: 0.25 }}`,
        shopifyOutput: '3.0\n5.0\n2.25',
        note: 'Розбіжність пісочниці: у JavaScript `3.0` і `3` — одне число, тому «цілі дробові» друкуються без `.0`. Ruby-Liquid у Shopify памʼятає, що в обчисленні брало участь дробове, і лишає `.0`.',
      },
      {
        type: 'example',
        title: 'Лічильник у циклі',
        preset: 'cart',
        template: `{% assign units = 0 %}
{% for item in cart.items %}
  {%- assign units = units | plus: item.quantity -%}
{% endfor %}
Одиниць товару: {{ units }}
Із доставкою: {{ cart.total_price | plus: 9000 | money }}`,
        note: 'Накопичення — це `assign` змінної самій собі через `plus`. Для простої суми властивості є коротший шлях — [sum](/docs/filters/sum): `cart.items | sum: \'quantity\'`. Доставку (90 ₴ = `9000` копійок) додаємо **до** `money`.',
      },
      {
        type: 'note',
        tone: 'warn',
        title: 'Не після money',
        text: '`money` повертає рядок на кшталт `"649.00 ₴"`. Спробуєш додати до нього число — Liquid мовчки порахує якусь нісенітницю, бо спробує прочитати цей рядок як число. Спершу вся арифметика в копійках, форматування — останнім кроком.',
      },
      {
        type: 'note',
        tone: 'shopify',
        text: 'У темах `plus` — це `forloop.index | plus: 1`, зсув для пагінації, «номер слайда з N», підрахунок у кошику. Для лічильника, який просто росте на одиницю, є ще тег `increment`, але в нього своя окрема область імен — не плутай із `assign` (див. [змінні](/docs/tags/variable)).',
      },
      {
        type: 'note',
        tone: 'interview',
        title: 'На співбесіді',
        text: '«Як у Liquid додати два числа?» — фільтром `plus`, бо арифметичних операторів у мові немає взагалі. Далі зазвичай питають про типи: рядок-число фільтр приведе сам; `nil` стане нулем; цілі дають ціле, з дробовим результат дробовий. І про порядок: фільтри виконуються зліва направо без пріоритетів, тому `2 | plus: 3 | times: 4` — це 20, а не 14.',
      },
    ],
  },

  /* ───────────────────────── prepend ───────────────────────── */
  {
    slug: 'prepend',
    section: 'filters',
    title: 'prepend',
    category: 'string',
    syntax: 'string | prepend: string',
    summary: 'Дописує рядок **на початок** іншого рядка. Дзеркало `append`.',
    officialUrl: 'https://shopify.github.io/liquid/filters/prepend/',
    related: ['filters/append', 'filters/remove_first', 'filters/replace_first', 'shopify/url-and-html-filters'],
    blocks: [
      {
        type: 'p',
        text: 'Конкатенації оператором у Liquid немає, тож рядки збирають двома фільтрами: [append](/docs/filters/append) додає в кінець, `prepend` — на початок. Типові задачі для `prepend`: протокол або домен перед шляхом, префікс CSS-класу, символ перед числом.',
      },
      {
        type: 'example',
        title: 'Базовий випадок',
        template: `{{ 'liquid-lab.example/pages/about' | prepend: 'https://' }}
{{ 1042 | prepend: '№ ' }}`,
        note: 'Другий рядок: число на вході автоматично стає рядком.',
      },
      { type: 'h', text: 'Параметри' },
      {
        type: 'table',
        head: ['Параметр', 'Тип', 'Що робить'],
        rows: [['префікс', 'рядок', 'Що поставити **перед** вхідним значенням. Може бути змінною: `prepend: shop.url`.']],
      },
      {
        type: 'example',
        title: 'Абсолютна адреса і протокол',
        preset: 'product',
        template: `{{ product.url | prepend: shop.url }}
{{ product.featured_image.src | prepend: 'https:' }}`,
        note: '`product.url` — відносний шлях (`/products/…`), а для `og:url`, листів чи розмітки Schema.org потрібна повна адреса. Другий рядок: адреси CDN у Shopify починаються з `//` — без протоколу, і соцмережі таке в `og:image` не розуміють.',
      },
      {
        type: 'example',
        title: 'Префікс CSS-класу',
        preset: 'product',
        view: 'html',
        template: `{% assign badge_class = product.vendor | handleize | prepend: 'badge badge--' %}
<span class="{{ badge_class }}">{{ product.vendor }}</span>`,
        note: 'Спершу `handleize` робить із назви безпечний шматок класу, потім `prepend` додає БЕМ-префікс.',
      },
      {
        type: 'note',
        tone: 'warn',
        title: 'Хто перед ким',
        text: 'У записі `{{ \'Б\' | prepend: \'А\' }}` літера «А» написана **правіше**, але у виводі стане **лівіше** — вийде «АБ». Коли `prepend` кілька поспіль, рядок росте справа наліво: останній у ланцюжку опиниться найпершим у результаті.',
      },
      {
        type: 'example',
        title: 'Кілька prepend поспіль',
        preset: 'product',
        template: `{{ product.title | prepend: ' — ' | prepend: product.vendor }}
{{ product.title | prepend: product.vendor | prepend: ' — ' }}`,
        note: 'Другий рядок — типова помилка порядку: тире опинилось на самому початку.',
      },
      {
        type: 'example',
        title: 'Межові випадки',
        template: `nil на вході: [{{ nothing | prepend: 'x' }}]
nil у параметрі: [{{ 'a' | prepend: nothing }}]
число в параметрі: [{{ 'a' | prepend: 5 }}]`,
        note: '`nil` поводиться як порожній рядок з обох боків. Зверни увагу на перший рядок: префікс надрукується **навіть коли значення немає** — звідси в темах беруться самотні «№ » чи «https://». Перевіряй значення на `blank` до того, як щось до нього ліпити.',
      },
      {
        type: 'note',
        tone: 'shopify',
        text: 'Для адрес у Shopify є спеціальні фільтри, і вони кращі за ручне склеювання: `asset_url`, `file_url`, `image_url`, `within` (див. [URL- та HTML-фільтри](/docs/shopify/url-and-html-filters)). `prepend` лишається для того, чого вони не вміють: дописати `shop.url` до відносного шляху, `https:` до протокол-відносної адреси, `#` до id якоря, `tel:` до телефона.',
      },
      {
        type: 'note',
        tone: 'interview',
        title: 'На співбесіді',
        text: '«Як у Liquid склеїти рядки?» — оператора конкатенації немає; є `append` і `prepend`, а для довших шматків — `capture`. Якщо просять зібрати абсолютний URL товару: `product.url | prepend: shop.url`. І корисне застереження: перед склеюванням перевірити, що значення не `blank`, бо префікс надрукується й до порожнечі.',
      },
    ],
  },

  /* ───────────────────────── reject ───────────────────────── */
  {
    slug: 'reject',
    section: 'filters',
    title: 'reject',
    category: 'array',
    syntax: 'array | reject: string, string',
    summary: 'Повертає масив **без** елементів, у яких властивість дорівнює заданому значенню. Протилежність `where`.',
    officialUrl: 'https://shopify.dev/docs/api/liquid/filters/reject',
    related: ['filters/where', 'filters/has', 'filters/find', 'filters/map', 'filters/compact'],
    blocks: [
      {
        type: 'p',
        text: '[where](/docs/filters/where) каже «залиш лише такі», `reject` — «викинь такі, залиш решту». Це новіший фільтр: до нього «все, крім…» робили циклом з `unless` або `continue`. Синтаксис у пари однаковий — імʼя властивості і, за потреби, значення.',
      },
      {
        type: 'example',
        title: 'Базовий випадок',
        preset: 'collection',
        template: `{{ collection.products | reject: 'vendor', 'Inoar' | map: 'title' | join: ', ' }}`,
        note: 'З пʼяти товарів зникли два від Inoar. Результат — масив обʼєктів, тож далі з ним працюють `map`, `for`, `size`, `sort`.',
      },
      { type: 'h', text: 'Параметри' },
      {
        type: 'table',
        head: ['Параметр', 'Тип', 'Що робить'],
        rows: [
          ['перший', 'рядок', 'Імʼя властивості елемента.'],
          ['другий', 'будь-який', 'Значення, елементи з яким треба **відкинути**. Порівняння строге й чутливе до регістру. Без нього відкидаються елементи, де властивість truthy.'],
        ],
      },
      {
        type: 'example',
        title: 'Булева властивість: обережно з назвою',
        preset: 'collection',
        template: `where: 'available' → {{ collection.products | where: 'available' | map: 'title' | join: ', ' }}

reject: 'available' → {{ collection.products | reject: 'available' | map: 'title' | join: ', ' }}

reject: 'available', false → {{ collection.products | reject: 'available', false | map: 'title' | join: ', ' }}`,
        note: '`reject: \'available\'` читається як «відхили доступні» — тобто лишає **розпродані**. Щоб прибрати розпродані, пиши `reject: \'available\', false` (або просто `where: \'available\'`).',
      },
      {
        type: 'example',
        title: '«Інші товари колекції» — без поточного',
        preset: 'all',
        template: `Зараз дивишся: {{ product.title }}

Ще в цій колекції:
{% assign others = collection.products | reject: 'id', product.id %}
{%- for item in others %}
– {{ item.title }}
{%- endfor %}`,
        note: 'Значенням може бути не лише літерал, а й змінна — тут `product.id`. Це найпоширеніший реальний сценарій для `reject`.',
      },
      {
        type: 'example',
        title: 'where і reject в одному ланцюжку',
        preset: 'collection',
        template: `{{ collection.products | where: 'available' | reject: 'vendor', 'Cocochoco' | map: 'title' | join: ', ' }}`,
        note: 'Кожен фільтр звужує масив: спершу лишили доступні, потім викинули один бренд. Умов «або» так не зробиш — лише послідовне «і».',
      },
      {
        type: 'example',
        title: 'Межові випадки',
        preset: 'collection',
        template: `немає такої властивості: {{ collection.products | reject: 'color', 'red' | size }}
значення не збіглося (регістр): {{ collection.products | reject: 'vendor', 'inoar' | size }}
nil замість масиву: {{ nothing | reject: 'vendor', 'Inoar' | size }}
властивість nil — не truthy: {{ collection.products | reject: 'compare_at_price' | size }}`,
        note: 'Якщо відкидати нічого, масив повертається цілим — усі 5. Останній рядок: без значення відкинуто товари, де `compare_at_price` заповнений, тож лишились ті, що **без знижки**.',
      },
      {
        type: 'table',
        head: ['Хочу', 'Пишу'],
        rows: [
          ['лише товари бренду', '`where: \'vendor\', \'Inoar\'`'],
          ['усе, крім бренду', '`reject: \'vendor\', \'Inoar\'`'],
          ['лише доступні', '`where: \'available\'`'],
          ['лише розпродані', '`reject: \'available\'` або `where: \'available\', false`'],
          ['чи є хоч один розпроданий', '`has: \'available\', false`'],
          ['прибрати `nil` із масиву значень', '[compact](/docs/filters/compact), не `reject`'],
        ],
      },
      {
        type: 'note',
        tone: 'warn',
        title: 'Лише рівність',
        text: '`reject`, як і `where`, уміє тільки «дорівнює». «Дешевше за 500 ₴», «назва містить…», «тег є в масиві тегів» — для цього він не годиться, потрібен цикл `for` з `if`. І працює він по **поточній сторінці** `collection.products`, а не по всьому каталогу.',
      },
      {
        type: 'note',
        tone: 'shopify',
        text: 'Довідка Shopify описує `reject` із двома аргументами — властивість і значення. Коротка форма для булевих властивостей працює за тією ж логікою, що й у `where`. У секціях рекомендацій для «схожих товарів» правильніше брати обʼєкт `recommendations`, а `reject: \'id\', product.id` — для простих блоків на кшталт «ще з цієї колекції».',
      },
      {
        type: 'note',
        tone: 'interview',
        title: 'На співбесіді',
        text: '«Виведи товари колекції, крім поточного». Сучасна відповідь — `collection.products | reject: \'id\', product.id`. Класична, яку теж варто назвати: цикл `for` і `{% if item.id == product.id %}{% continue %}{% endif %}`. Пояснення різниці між `where` і `reject` одним реченням: перший лишає збіги, другий — усе інше; обидва порівнюють лише на рівність і повертають новий масив, не змінюючи вихідний.',
      },
    ],
  },

  /* ───────────────────────── remove ───────────────────────── */
  {
    slug: 'remove',
    section: 'filters',
    title: 'remove',
    category: 'string',
    syntax: 'string | remove: string',
    summary: 'Видаляє з рядка **всі** входження підрядка. Те саме, що `replace` на порожній рядок.',
    officialUrl: 'https://shopify.github.io/liquid/filters/remove/',
    related: ['filters/remove_first', 'filters/remove_last', 'filters/replace', 'filters/strip', 'filters/strip_html'],
    blocks: [
      {
        type: 'p',
        text: '`remove` шукає в рядку заданий шматок і вирізає його всюди, де знайде. Шукає **буквально**: жодних регулярних виразів, масок чи «будь-яка цифра» в Liquid немає. І з урахуванням регістру: `Шампунь` і `шампунь` — різні рядки.',
      },
      {
        type: 'example',
        title: 'Базовий випадок',
        template: `{{ 'Шампунь 250 мл (250 мл)' | remove: '250 мл' }}
{{ 'a  b  c' | remove: ' ' }}`,
        note: 'Вирізано **обидва** входження. Зверни увагу: пробіли й дужки навколо лишились на місці — фільтр прибирає рівно те, що ти назвав, нічого не підчищає.',
      },
      { type: 'h', text: 'Параметри' },
      {
        type: 'table',
        head: ['Параметр', 'Тип', 'Що робить'],
        rows: [['підрядок', 'рядок', 'Що саме вирізати. Збіг точний, із урахуванням регістру. Порожній рядок нічого не змінює.']],
      },
      {
        type: 'example',
        title: 'Телефон для посилання tel:',
        preset: 'customer',
        view: 'html',
        template: `{% assign pretty = '+38 (067) 111-22-33' %}
{% assign digits = pretty | remove: ' ' | remove: '(' | remove: ')' | remove: '-' %}
<a href="tel:{{ digits }}">{{ pretty }}</a>`,
        note: 'Регулярки `[^0-9+]` у Liquid немає, тому кожен зайвий символ прибираємо окремим `remove`. Ланцюжок довгий, але чесний.',
      },
      {
        type: 'example',
        title: 'Чутливість до регістру',
        preset: 'product',
        template: `[{{ product.title | remove: 'Шампунь' }}]
[{{ product.title | remove: 'шампунь' }}]`,
        note: 'Другий виклик нічого не знайшов — мала літера не збіглася з великою. А в першому лишився пробіл на початку: після `remove` часто потрібен [strip](/docs/filters/strip).',
      },
      {
        type: 'example',
        title: 'Межові випадки',
        template: `nil на вході: [{{ nothing | remove: 'a' }}]
nil у параметрі: [{{ 'кератин' | remove: nothing }}]
немає збігу: [{{ 'кератин' | remove: 'x' }}]
число на вході: [{{ 1500 | remove: '0' }}]`,
        note: 'Число спершу стає рядком `"1500"`, і з нього зникають нулі — результат уже теж рядок, а не число.',
      },
      {
        type: 'note',
        tone: 'warn',
        title: 'HTML так не чистять',
        text: '`{{ product.description | remove: \'<p>\' | remove: \'</p>\' }}` працює рівно доти, доки в описі не зʼявиться `<p class="…">` чи інший тег. Щоб прибрати розмітку, є [strip_html](/docs/filters/strip_html). `remove` — для відомих, сталих шматків тексту.',
      },
      {
        type: 'table',
        head: ['Фільтр', 'Скільки входжень прибирає'],
        rows: [
          ['`remove`', 'усі'],
          ['[remove_first](/docs/filters/remove_first)', 'лише перше'],
          ['[remove_last](/docs/filters/remove_last)', 'лише останнє'],
        ],
      },
      {
        type: 'note',
        tone: 'shopify',
        text: 'У темах `remove` найчастіше чистить технічні шматки: `#` з кольору перед вставкою в URL, префікс тегу (`tag | remove: \'filter-\'`), одиниці виміру з рядка-налаштування (`\'24px\' | remove: \'px\'`), а ще — переносить значення з `money` у числовий вигляд, що вже сумнівна ідея: краще одразу брати ціну в копійках.',
      },
      {
        type: 'note',
        tone: 'interview',
        title: 'На співбесіді',
        text: '«Чи є в Liquid регулярні вирази?» — ні. `remove`, `replace` та їхні варіанти шукають точний підрядок із урахуванням регістру. Якщо треба без урахування — спершу `downcase`, але тоді й результат буде в нижньому регістрі. Складніша обробка тексту — це вже задача для JavaScript або для даних (метаполе з готовим значенням), а не для шаблону.',
      },
    ],
  },

  /* ───────────────────────── remove_first ───────────────────────── */
  {
    slug: 'remove_first',
    section: 'filters',
    title: 'remove_first',
    category: 'string',
    syntax: 'string | remove_first: string',
    summary: 'Видаляє лише **перше** входження підрядка; решту лишає.',
    officialUrl: 'https://shopify.github.io/liquid/filters/remove_first/',
    related: ['filters/remove', 'filters/remove_last', 'filters/replace_first', 'filters/lstrip', 'filters/slice'],
    blocks: [
      {
        type: 'p',
        text: 'Брат [remove](/docs/filters/remove), який зупиняється після першого збігу. Потрібен, коли шматок може повторюватись, а прибрати треба тільки той, що на початку: префікс, перший символ, код країни.',
      },
      {
        type: 'example',
        title: 'Базовий випадок',
        template: `remove_first: {{ 'Шампунь 250 мл (250 мл)' | remove_first: '250 мл' }}
remove:       {{ 'Шампунь 250 мл (250 мл)' | remove_first: '250 мл' | remove: '250 мл' }}`,
        note: 'Перший рядок: зникло тільки перше «250 мл», те, що в дужках, залишилось. Другий — для порівняння, що буде, якщо прибрати всі.',
      },
      { type: 'h', text: 'Параметри' },
      {
        type: 'table',
        head: ['Параметр', 'Тип', 'Що робить'],
        rows: [['підрядок', 'рядок', 'Що вирізати. Пошук зліва направо, точний збіг, із урахуванням регістру.']],
      },
      {
        type: 'example',
        title: 'Зняти префікс',
        preset: 'shop',
        template: `Колір без решітки: {{ settings.colors_accent | remove_first: '#' }}
Шлях без першого слеша: {{ routes.cart_url | remove_first: '/' }}`,
      },
      {
        type: 'example',
        title: 'Код країни з телефона',
        preset: 'customer',
        template: `{{ customer.phone }}
{{ customer.phone | remove_first: '+38' }}`,
        note: 'Тут важливо, що саме **first**: якби в номері далі траплялось «38», звичайний `remove` вирізав би й ті цифри.',
      },
      {
        type: 'note',
        tone: 'warn',
        title: '«Перше» — не означає «на початку»',
        text: '`remove_first` прибирає перше входження **де б воно не стояло**. `{{ \'шампунь-про-макс\' | remove_first: \'про-\' }}` спрацює посеред рядка. Якщо префікса на початку немає, а такий самий шматок є далі — виріжеться саме він. Перевірки «рядок починається з…» у Liquid немає; надійний обхід — порівняти `slice: 0, N` з префіксом і лише тоді різати.',
      },
      {
        type: 'example',
        title: 'Межові випадки',
        template: `nil: [{{ nothing | remove_first: 'a' }}]
немає збігу: [{{ 'кератин' | remove_first: 'x' }}]
регістр: [{{ 'Кератин кератин' | remove_first: 'кератин' }}]`,
        note: 'Третій рядок: перше слово з великої літери збігом не вважається, тож вирізано друге.',
      },
      {
        type: 'note',
        tone: 'shopify',
        text: 'Живі приклади з тем: теги-префікси (`badge:Новинка` → `tag | remove_first: \'badge:\'`), id секції без службової частини, handle без мовного префікса. Схема з тегами-префіксами — стара, але поширена; у нових темах її замінюють метаполя.',
      },
      {
        type: 'note',
        tone: 'interview',
        title: 'На співбесіді',
        text: '«Мерчант позначає товари тегами виду `label:Хіт`. Як вивести лише текст?» — у циклі по `product.tags` перевіряю `{% if tag contains \'label:\' %}` і друкую `tag | remove_first: \'label:\'`. Пояснюю вибір: `remove_first`, а не `remove`, бо службовий шматок потрібно зняти один раз, а далі в тексті він теоретично може повторитись.',
      },
    ],
  },

  /* ───────────────────────── remove_last ───────────────────────── */
  {
    slug: 'remove_last',
    section: 'filters',
    title: 'remove_last',
    category: 'string',
    syntax: 'string | remove_last: string',
    summary: 'Видаляє лише **останнє** входження підрядка — зручно для суфіксів, розширень і хвостових роздільників.',
    officialUrl: 'https://shopify.github.io/liquid/filters/remove_last/',
    related: ['filters/remove', 'filters/remove_first', 'filters/replace_last', 'filters/rstrip', 'filters/truncate'],
    blocks: [
      {
        type: 'p',
        text: 'Третій із родини `remove`: шукає підрядок **з кінця** і вирізає одне, останнє входження. Зʼявився пізніше за `remove` і `remove_first`, тому в старих темах його роботу виконують конструкції зі `split` і `slice`.',
      },
      {
        type: 'example',
        title: 'Базовий випадок',
        template: `{{ 'Шампунь 250 мл (250 мл)' | remove_last: '250 мл' }}
{{ 'keratin-shampoo.jpg.jpg' | remove_last: '.jpg' }}`,
        note: 'У першому рядку спорожніли дужки, а перше «250 мл» ціле. У другому — знято лише одне, зайве розширення.',
      },
      { type: 'h', text: 'Параметри' },
      {
        type: 'table',
        head: ['Параметр', 'Тип', 'Що робить'],
        rows: [['підрядок', 'рядок', 'Що вирізати. Пошук справа наліво, точний збіг, із урахуванням регістру.']],
      },
      {
        type: 'example',
        title: 'Хвостовий слеш і «Default Title»',
        template: `{{ '/collections/home-care/' | remove_last: '/' }}
{{ 'Маска глибокого відновлення - Default Title' | remove_last: ' - Default Title' }}`,
        note: 'Перший рядок: початковий `/` лишився, зник тільки кінцевий — `remove` зніс би всі три.',
      },
      {
        type: 'example',
        title: 'Хвіст після циклу',
        preset: 'product',
        template: `{% capture list %}{% for tag in product.tags %}{{ tag }}, {% endfor %}{% endcapture %}
[{{ list }}]
[{{ list | remove_last: ', ' }}]`,
        note: 'Цикл лишає кому після останнього елемента. `remove_last` її знімає. Чистіші способи — `join: \', \'` або `{% unless forloop.last %}`, але прийом корисно знати: так прибирають хвости з уже готових рядків.',
      },
      {
        type: 'note',
        tone: 'warn',
        title: '«Останнє» — не означає «в кінці»',
        text: 'Якщо рядок **не закінчується** на підрядок, `remove_last` усе одно знайде останнє входження десь посередині й виріже його. `{{ \'/pages/about\' | remove_last: \'/\' }}` зіпсує шлях: вийде `/pagesabout`. Коли суфікс не гарантований — спершу перевір кінець рядка через `slice` з відʼємним індексом.',
      },
      {
        type: 'example',
        title: 'Межові випадки',
        template: `nil: [{{ nothing | remove_last: 'a' }}]
немає збігу: [{{ 'кератин' | remove_last: 'x' }}]
одне входження: [{{ 'кератин' | remove_last: 'тин' }}]
пастка з прикладу вище: [{{ '/pages/about' | remove_last: '/' }}]`,
      },
      {
        type: 'note',
        tone: 'shopify',
        text: 'У темах: зняти кінцевий слеш із `routes.root_url` перед склеюванням шляхів (на мультимовних магазинах він буває `/uk/`), прибрати ` - Default Title` з назви позиції, відрізати розширення файлу. Для назви позиції кошика надійніше не різати рядок, а перевірити `item.variant.title != \'Default Title\'` або брати `item.product.title`.',
      },
      {
        type: 'note',
        tone: 'interview',
        title: 'На співбесіді',
        text: 'Окремо про `remove_last` питають рідко; частіше це частина питання «які є способи обрізати рядок у Liquid». Перелік: `remove`/`remove_first`/`remove_last` — за вмістом; `slice` — за позицією; `truncate`/`truncatewords` — за довжиною з трьома крапками; `split` + `first`/`last` — за роздільником; `strip`/`lstrip`/`rstrip` — пробіли. Усе — без регулярних виразів.',
      },
    ],
  },

  /* ───────────────────────── replace ───────────────────────── */
  {
    slug: 'replace',
    section: 'filters',
    title: 'replace',
    category: 'string',
    syntax: 'string | replace: string, string',
    summary: 'Замінює **всі** входження підрядка іншим рядком. Пошук буквальний: без регулярних виразів, із урахуванням регістру.',
    officialUrl: 'https://shopify.github.io/liquid/filters/replace/',
    related: ['filters/replace_first', 'filters/replace_last', 'filters/remove', 'filters/downcase', 'filters/split'],
    blocks: [
      {
        type: 'p',
        text: '`replace` — «знайти й замінити все». Перший параметр — що шукаємо, другий — на що міняємо. Обидва — звичайні рядки. Якщо ти звик до `String.replace` у JavaScript, тут дві відмінності: замінюються **всі** входження, а не перше, і регулярних виразів немає взагалі.',
      },
      {
        type: 'example',
        title: 'Базовий випадок',
        template: `{{ 'Шампунь для волосся, маска для волосся' | replace: 'волосся', 'кінчиків' }}`,
      },
      { type: 'h', text: 'Параметри' },
      {
        type: 'table',
        head: ['Параметр', 'Тип', 'Що робить'],
        rows: [
          ['що шукати', 'рядок', 'Підрядок для пошуку. Точний збіг, регістр має значення.'],
          ['на що замінити', 'рядок', 'Що поставити на місце кожного збігу. Порожній рядок `\'\'` — те саме, що [remove](/docs/filters/remove).'],
        ],
      },
      {
        type: 'example',
        title: 'Без регулярок: крапка — це просто крапка',
        template: `{{ 'v1.2.3' | replace: '.', '-' }}
{{ 'ціна: $5 (було $5)' | replace: '$5', '$10' }}
{{ 'a+b' | replace: '+', ' plus ' }}`,
        note: 'Символи, які в регулярних виразах мають особливе значення (`.`, `$`, `+`, `(`), тут нічого не означають — їх не треба екранувати.',
      },
      {
        type: 'example',
        title: 'Чутливість до регістру',
        template: `{{ 'Keratin keratin KERATIN' | replace: 'keratin', 'кератин' }}
{{ 'Keratin keratin KERATIN' | downcase | replace: 'keratin', 'кератин' }}`,
        note: 'Замінилось тільки слово, написане малими. Обхід — спершу `downcase`, але тоді весь рядок стане малими літерами. Прапорця «ігнорувати регістр» не існує.',
      },
      {
        type: 'example',
        title: 'Підстановка в шаблон тексту',
        preset: 'product',
        data: { promo: 'Купи [товар] від [бренд] — і отримай подарунок. [товар] уже чекає!' },
        template: `{{ promo | replace: '[товар]', product.title | replace: '[бренд]', product.vendor }}`,
        note: 'Другим параметром може бути змінна. Так роблять власні плейсхолдери в текстових налаштуваннях секції: мерчант пише `[товар]`, тема підставляє назву.',
      },
      {
        type: 'example',
        title: 'Межові випадки',
        template: `nil на вході: [{{ nothing | replace: 'a', 'b' }}]
немає збігу: [{{ 'кератин' | replace: 'x', 'y' }}]
число на вході: [{{ 12345 | replace: '3', '-' }}]
заміна на порожнє: [{{ 'ке-ра-тин' | replace: '-', '' }}]`,
        note: 'Якщо шукати нічого — рядок повертається без змін і без помилок. Число на вході стає рядком.',
      },
      {
        type: 'note',
        tone: 'warn',
        title: 'Заміни йдуть по черзі',
        text: 'Кілька `replace` у ланцюжку — це не одночасна заміна: кожен наступний бачить результат попереднього. `{{ \'а б\' | replace: \'а\', \'б\' | replace: \'б\', \'а\' }}` не поміняє літери місцями, а зробить усі «а». Для обміну потрібен проміжний маркер, якого точно немає в тексті.',
      },
      {
        type: 'note',
        tone: 'shopify',
        text: 'Не роби з `replace` те, для чого є готовий фільтр: слаг із назви — це `handleize`, а не `downcase | replace: \' \', \'-\'` (той не впорається з розділовими знаками); безпечний URL — `url_encode`; текст без тегів — `strip_html`. Для перекладних рядків із змінними теж не потрібен `replace` — у `t` є інтерполяція: `{{ \'cart.items\' | t: count: 3 }}` (див. [локалі](/docs/shopify/locales)).',
      },
      {
        type: 'note',
        tone: 'interview',
        title: 'На співбесіді',
        text: '«Чим `replace` у Liquid відрізняється від `replace` у JavaScript?» — замінює всі входження одразу (у JS рядковий `replace` — лише перше), не підтримує регулярних виразів і завжди чутливий до регістру. Для одного входження є `replace_first` і `replace_last`. Хороше завершення: якщо в шаблоні виростає ланцюжок із пʼяти `replace`, це сигнал, що дані треба готувати інакше — метаполем або на боці JS.',
      },
    ],
  },

  /* ───────────────────────── replace_first ───────────────────────── */
  {
    slug: 'replace_first',
    section: 'filters',
    title: 'replace_first',
    category: 'string',
    syntax: 'string | replace_first: string, string',
    summary: 'Замінює лише **перше** входження підрядка; решта лишається як була.',
    officialUrl: 'https://shopify.github.io/liquid/filters/replace_first/',
    related: ['filters/replace', 'filters/replace_last', 'filters/remove_first', 'filters/prepend'],
    blocks: [
      {
        type: 'p',
        text: 'Поводиться як [replace](/docs/filters/replace), але зупиняється після першого збігу. Саме так працює рядковий `replace` у JavaScript — тож якщо переносиш логіку з JS у Liquid один до одного, тобі потрібен `replace_first`, а не `replace`.',
      },
      {
        type: 'example',
        title: 'Базовий випадок',
        template: `replace_first: {{ 'Купи 2 — отримай 2 в подарунок' | replace_first: '2', '3' }}
replace:       {{ 'Купи 2 — отримай 2 в подарунок' | replace: '2', '3' }}`,
        note: 'Умова акції змінилась лише в першій частині. Звичайний `replace` зачепив би обидві двійки.',
      },
      { type: 'h', text: 'Параметри' },
      {
        type: 'table',
        head: ['Параметр', 'Тип', 'Що робить'],
        rows: [
          ['що шукати', 'рядок', 'Підрядок; пошук зліва направо, точний збіг, із урахуванням регістру.'],
          ['на що замінити', 'рядок', 'Що поставити замість першого знайденого входження.'],
        ],
      },
      {
        type: 'example',
        title: 'Виділити перше слово',
        preset: 'product',
        view: 'html',
        template: `{% assign first_word = product.title | split: ' ' | first %}
{% assign marked = first_word | prepend: '<em>' | append: '</em>' %}
<h2>{{ product.title | replace_first: first_word, marked }}</h2>`,
        note: 'Дістали перше слово через `split | first`, обгорнули в `<em>` і замінили **лише перше** його входження. Якби слово повторювалось у назві, `replace` обгорнув би всі.',
      },
      {
        type: 'example',
        title: 'Змінити префікс шляху',
        preset: 'product',
        template: `{{ product.url }}
{{ product.url | replace_first: '/products/', '/uk/products/' }}`,
        note: 'Навчальний приклад: у реальній темі мовний префікс додає сам Shopify через `routes` і `request.locale` — руками адреси не переписують.',
      },
      {
        type: 'example',
        title: 'Межові випадки',
        template: `nil: [{{ nothing | replace_first: 'a', 'b' }}]
немає збігу: [{{ 'кератин' | replace_first: 'x', 'y' }}]
регістр: [{{ 'Кератин і кератин' | replace_first: 'кератин', 'ботокс' }}]`,
        note: 'Третій рядок: слово з великої літери збігом не вважається — «першим» виявилось друге.',
      },
      {
        type: 'note',
        tone: 'warn',
        title: 'Перше входження, а не початок рядка',
        text: 'Фільтр не перевіряє, де стоїть збіг. Якщо очікуваного префікса на початку немає, але такий самий шматок є далі в рядку — заміниться він. Коли це критично, порівняй початок рядка через `slice: 0, N` перед заміною.',
      },
      {
        type: 'table',
        head: ['Фільтр', 'Що замінює'],
        rows: [
          ['[replace](/docs/filters/replace)', 'усі входження'],
          ['`replace_first`', 'перше зліва'],
          ['[replace_last](/docs/filters/replace_last)', 'останнє (перше справа)'],
        ],
      },
      {
        type: 'note',
        tone: 'interview',
        title: 'На співбесіді',
        text: '«Є рядок із плейсхолдером `%s`, який трапляється двічі, і треба підставити два різні значення». Два `replace_first` поспіль: перший замінить перше входження, другий — те, що тепер стало першим. Це показує, що ти розумієш і послідовність ланцюжка фільтрів, і різницю між `replace` та `replace_first`.',
      },
      {
        type: 'example',
        title: 'Два плейсхолдери — два значення',
        preset: 'product',
        template: `{{ '%s від %s' | replace_first: '%s', product.title | replace_first: '%s', product.vendor }}`,
      },
    ],
  },

  /* ───────────────────────── replace_last ───────────────────────── */
  {
    slug: 'replace_last',
    section: 'filters',
    title: 'replace_last',
    category: 'string',
    syntax: 'string | replace_last: string, string',
    summary: 'Замінює лише **останнє** входження підрядка. Улюблений прийом — «а, б та в» після `join`.',
    officialUrl: 'https://shopify.github.io/liquid/filters/replace_last/',
    related: ['filters/replace', 'filters/replace_first', 'filters/remove_last', 'filters/join'],
    blocks: [
      {
        type: 'p',
        text: 'Останній із трійки `replace`: шукає з кінця рядка й замінює одне входження. Новіший за `replace` і `replace_first`, тому в старих темах і підручниках його не зустрінеш — там цю задачу розвʼязували через `split`, `last` і склеювання.',
      },
      {
        type: 'example',
        title: 'Базовий випадок',
        template: `{{ 'Шампунь для волосся, маска для волосся' | replace_last: 'волосся', 'кінчиків' }}`,
        note: 'Перше «волосся» лишилось, змінилось тільки друге.',
      },
      { type: 'h', text: 'Параметри' },
      {
        type: 'table',
        head: ['Параметр', 'Тип', 'Що робить'],
        rows: [
          ['що шукати', 'рядок', 'Підрядок; пошук справа наліво, точний збіг, із урахуванням регістру.'],
          ['на що замінити', 'рядок', 'Що поставити замість останнього знайденого входження.'],
        ],
      },
      {
        type: 'example',
        title: '«а, б та в» — людський перелік',
        preset: 'product',
        template: `{{ product.tags | join: ', ' }}
{{ product.tags | join: ', ' | replace_last: ', ', ' та ' }}`,
        note: 'Склеїли масив через кому й замінили **останню** кому на сполучник. З одним елементом ком немає — фільтр просто нічого не змінить, окрема перевірка не потрібна.',
      },
      {
        type: 'example',
        title: 'Змінити розширення файлу',
        template: `{{ 'hero.jpg.backup.jpg' | replace_last: '.jpg', '.webp' }}
{{ 'hero.jpg.backup.jpg' | replace: '.jpg', '.webp' }}`,
        note: 'Навчальний приклад різниці. Формат зображень у Shopify міняють не рядками, а параметром `format` у `image_url` (див. [зображення](/docs/shopify/images)).',
      },
      {
        type: 'example',
        title: 'Межові випадки',
        data: { one: ['догляд'] },
        template: `nil: [{{ nothing | replace_last: 'a', 'b' }}]
немає збігу: [{{ 'кератин' | replace_last: 'x', 'y' }}]
один елемент: [{{ one | join: ', ' | replace_last: ', ', ' та ' }}]`,
      },
      {
        type: 'note',
        tone: 'warn',
        title: 'Кома всередині елемента',
        text: 'Прийом із `join` + `replace_last` працює з рядком, а не з масивом: йому байдуже, де були межі елементів. Якщо останній елемент сам містить `, ` (назва «Шампунь, 250 мл»), сполучник стане **всередину назви**. Для таких даних надійніше цикл із `forloop.last`.',
      },
      {
        type: 'note',
        tone: 'shopify',
        text: 'Де згодиться: перелік опцій товару в описі для SEO, «Доступні кольори: білий, чорний та сірий», список авторів. Для багатомовної теми сполучник не хардкодять, а беруть із локалі: `replace_last: \', \', and_word`, де `and_word` — результат `\'general.and\' | t` з пробілами по боках.',
      },
      {
        type: 'note',
        tone: 'interview',
        title: 'На співбесіді',
        text: '«Виведи теги товару у форматі „а, б та в“». Короткий шлях — `join: \', \' | replace_last: \', \', \' та \'`. Класичний — цикл `for` з перевірками `forloop.last` і передостаннього елемента (`forloop.rindex == 2`). Назви обидва: перший показує, що ти знаєш нові фільтри, другий — що розумієш `forloop` і не залежиш від версії Liquid.',
      },
    ],
  },

  /* ───────────────────────── reverse ───────────────────────── */
  {
    slug: 'reverse',
    section: 'filters',
    title: 'reverse',
    category: 'array',
    syntax: 'array | reverse',
    summary: 'Розвертає порядок елементів масиву. Працює **лише з масивами** — рядок розвертають через `split` і `join`.',
    officialUrl: 'https://shopify.github.io/liquid/filters/reverse/',
    related: ['filters/sort', 'filters/sort_natural', 'filters/split', 'filters/join', 'filters/last', 'tags/iteration'],
    blocks: [
      {
        type: 'p',
        text: '`reverse` повертає новий масив із тими самими елементами у зворотному порядку. Параметрів немає. Найважливіша його роль — друга половина «сортування за спаданням»: у [sort](/docs/filters/sort) немає напрямку, тож спершу сортують за зростанням, а потім розвертають.',
      },
      {
        type: 'example',
        title: 'Базовий випадок',
        preset: 'product',
        template: `{{ product.tags | join: ', ' }}
{{ product.tags | reverse | join: ', ' }}`,
        note: 'Вихідний масив не змінюється — `reverse`, як і всі фільтри, повертає нове значення.',
      },
      {
        type: 'example',
        title: 'Сортування за спаданням',
        preset: 'collection',
        template: `{% assign expensive_first = collection.products | sort: 'price' | reverse %}
{% for item in expensive_first %}
{{ item.price | money }} — {{ item.title }}
{%- endfor %}`,
        note: '`sort: \'price\'` — від дешевого до дорогого, `reverse` — навпаки. `reverse` має стояти **після** `sort`, інакше сортування просто перекриє розворот.',
      },
      { type: 'h', text: 'Рядок: split → reverse → join' },
      {
        type: 'p',
        text: 'На рядку `reverse` нічого не зробить: для нього рядок — це один елемент, а масив з одного елемента хоч як розвертай. Щоб перевернути текст, його треба спершу розкласти на літери: `split: \'\'` (порожній роздільник) дає масив символів, `reverse` розвертає, `join: \'\'` збирає назад.',
      },
      {
        type: 'example',
        title: 'Розвернути рядок',
        template: `Напряму: {{ 'Кератин' | reverse }}
Через масив: {{ 'Кератин' | split: '' | reverse | join: '' }}
Слова навпаки: {{ 'шампунь маска олійка' | split: ' ' | reverse | join: ' ' }}`,
        note: 'Перший рядок — без змін і без помилки, тому цю пастку легко не помітити. Третій — той самий прийом, але роздільник — пробіл: розвертаються слова, а не літери.',
      },
      {
        type: 'example',
        title: 'reverse чи reversed?',
        preset: 'blog',
        template: `{% for article in blog.articles reversed %}
{{ article.published_at | date: '%d.%m' }} — {{ article.title }}
{%- endfor %}

{% assign oldest_first = blog.articles | reverse %}
Найстаріша: {{ oldest_first.first.title }}`,
        note: '`reversed` — параметр тега `for`: просто пройти цикл у зворотному порядку. Фільтр `reverse` потрібен, коли розвернутий масив треба **зберегти** й використати далі — взяти `first`, передати в сніпет, обрізати через `limit`.',
      },
      {
        type: 'example',
        title: 'Межові випадки',
        data: { empty_list: [] },
        template: `nil: [{{ nothing | reverse | join: ',' }}]
порожній масив: [{{ empty_list | reverse | join: ',' }}]
число: [{{ 123 | reverse }}]`,
        note: 'Нічого не падає. Число, як і рядок, сприймається як один елемент — цифри місцями не поміняються.',
      },
      {
        type: 'note',
        tone: 'warn',
        title: 'reversed + limit',
        text: 'У тезі `for` параметри `limit` та `offset` застосовуються **до** `reversed`: `{% for a in blog.articles limit: 2 reversed %}` візьме перші дві статті й покаже їх у зворотному порядку, а не дві останні. Потрібні саме останні — спершу `assign` з фільтром `reverse`, потім цикл із `limit`.',
      },
      {
        type: 'note',
        tone: 'shopify',
        text: 'Розвертати великі списки в Liquid — крайній захід: `collection.products` — лише поточна сторінка, тож `reverse` переверне 50 товарів, а не весь каталог. Порядок колекції задають параметром `sort_by` в адресі (`price-descending`, `created-descending`), статті блогу Shopify і так віддає від найновішої. `reverse` доречний для коротких масивів: варіанти, зображення, блоки секції, пункти меню.',
      },
      {
        type: 'note',
        tone: 'interview',
        title: 'На співбесіді',
        text: 'Два класичні питання. «Як відсортувати за спаданням?» — `sort: \'price\' | reverse`, бо напрямку в `sort` немає. «Як розвернути рядок?» — `split: \'\' | reverse | join: \'\'`: `reverse` працює тільки з масивами, тому рядок спершу ріжуть на символи. Бонусне уточнення — різниця між фільтром `reverse` і параметром циклу `reversed`.',
      },
    ],
  },
]
