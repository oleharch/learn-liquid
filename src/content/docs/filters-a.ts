import type { DocPage } from '../types'

/** Одна фіксована дата на всю сторінку `date`: неділя, 8 березня 2026, 14:05:09, пояс +02:00. */
const SAMPLE_DATE = '2026-03-08T14:05:09+02:00'

export const filtersA: DocPage[] = [
  /* ───────────────────────── abs ───────────────────────── */
  {
    slug: 'abs',
    section: 'filters',
    title: 'abs',
    category: 'math',
    syntax: 'number | abs',
    summary: 'Повертає модуль числа: відкидає мінус, додатне число лишає як є.',
    officialUrl: 'https://shopify.github.io/liquid/filters/abs/',
    related: ['filters/minus', 'filters/at_least', 'filters/round', 'basics/types'],
    blocks: [
      {
        type: 'p',
        text: '`abs` — це «відстань до нуля»: `-17` стає `17`, а `17` так і лишається `17`. Потрібен він рідше за інші математичні фільтри, зате закриває конкретну ситуацію: ти віднімаєш два числа й **не знаєш наперед, яке з них більше**, а показати треба різницю без мінуса.',
      },
      {
        type: 'example',
        title: 'Базовий випадок',
        template: '{{ -17 | abs }}\n{{ 4 | abs }}\n{{ -19.86 | abs }}',
        note: 'Дробова частина зберігається — `abs` нічого не округлює, лише прибирає знак.',
      },
      {
        type: 'example',
        title: 'Різниця цін без мінуса',
        preset: 'product',
        template:
          '{% assign diff = product.price | minus: product.compare_at_price %}\nСира різниця: {{ diff }}\nЕкономія: {{ diff | abs | money }}',
        note: 'Відняли «не в той бік» — вийшло відʼємне число. `abs` прибирає знак, а [money](/docs/shopify/money-filters) перетворює копійки на суму.',
      },
      { type: 'h', text: 'Рядки, nil і сміття на вході' },
      {
        type: 'p',
        text: 'Як і вся математика в Liquid, `abs` спершу пробує **перетворити вхід на число**. Рядок із числом працює, а все, що числом не є, мовчки стає нулем — помилки не буде.',
      },
      {
        type: 'example',
        title: 'Межові випадки',
        template: '{{ "-19.86" | abs }}\n{{ "не число" | abs }}\n[{{ nothing | abs }}]',
        note: 'Другий і третій рядки — `0`. Неіснуюча змінна (`nil`) не дає порожнього виводу, як у рядкових фільтрів, а саме **нуль**.',
      },
      {
        type: 'note',
        tone: 'warn',
        title: 'Пастка: abs ховає помилку в даних',
        text: 'Якщо `compare_at_price` раптом **менший** за `price` (менеджер переплутав поля), `abs` усе одно покаже гарну «економію». Там, де знак має значення, спершу порівняй числа в `{% if %}`, а `abs` лишай для випадків, коли напрямок різниці справді байдужий.',
      },
      {
        type: 'note',
        tone: 'shopify',
        text: 'У темах `abs` трапляється біля залишків: `variant.inventory_quantity` може бути **відʼємним**, якщо товару дозволено продаватись «у мінус». Текст «очікуємо ще {{ n }} шт.» будують через `abs`. Друге місце — різниця дат у секундах, коли не важливо, подія в минулому чи в майбутньому.',
      },
      {
        type: 'note',
        tone: 'interview',
        title: 'На співбесіді',
        text: 'Питають рідко й зазвичай у звʼязці: «що повернуть математичні фільтри на рядку чи `nil`?». Відповідь: Liquid приводить вхід до числа, рядок `"-5"` спрацює, а нечислове значення й `nil` стануть `0` — **без помилки**. Тому математичний фільтр на порожньому метаполі друкує `0`, а не порожнечу, і це треба ловити перевіркою `{% if %}` до обчислень.',
      },
    ],
  },

  /* ───────────────────────── append ───────────────────────── */
  {
    slug: 'append',
    section: 'filters',
    title: 'append',
    category: 'string',
    syntax: 'string | append: string',
    summary: 'Дописує рядок у кінець іншого рядка. Головний спосіб «склеїти» текст у Liquid, де немає оператора `+`.',
    officialUrl: 'https://shopify.github.io/liquid/filters/append/',
    related: ['filters/prepend', 'filters/join', 'filters/concat', 'tags/variable'],
    blocks: [
      {
        type: 'p',
        text: 'У Liquid немає конкатенації через `+` чи шаблонних рядків. Склеїти два рядки можна двома способами: фільтром `append` або тегом `capture`. `append` — для коротких склейок «на льоту»: дописати параметр до URL, модифікатор до класу, розширення до імені файлу.',
      },
      {
        type: 'example',
        title: 'Базовий випадок',
        template: '{{ "Шампунь" | append: " із кератином" }}',
        note: 'Пробіл сам не зʼявиться — він частина аргументу.',
      },
      {
        type: 'example',
        title: 'Збираємо URL',
        preset: 'product',
        template:
          '{% assign variant = product.selected_or_first_available_variant %}\n{% assign url = product.url | append: "?variant=" | append: variant.id %}\n{{ url }}',
        note: 'Аргументом може бути змінна, і не лише рядок: число `variant.id` перетворюється на текст автоматично. Кілька `append` поспіль — звичайний ланцюжок, виконується зліва направо.',
      },
      {
        type: 'example',
        title: 'Збираємо класи за умовами',
        preset: 'product',
        view: 'html',
        template: `{% for variant in product.variants %}
  {%- assign cls = "swatch" -%}
  {%- unless variant.available -%}
    {%- assign cls = cls | append: " swatch--sold-out" -%}
  {%- endunless -%}
  {%- if variant.compare_at_price -%}
    {%- assign cls = cls | append: " swatch--sale" -%}
  {%- endif %}
  <button class="{{ cls }}">{{ variant.title }}</button>
{% endfor %}`,
        note: '`append` **не змінює** змінну — він повертає новий рядок. Щоб «накопичити» класи, результат треба знову покласти в ту саму змінну через `assign`.',
      },
      { type: 'h', text: 'append чи capture' },
      {
        type: 'table',
        head: ['', '`append`', '`capture`'],
        rows: [
          ['Що це', 'фільтр, працює всередині виразу', 'тег-блок, збирає в змінну все, що надруковано всередині'],
          ['Зручно, коли', 'частин 2–3 і результат одразу йде далі в ланцюжок фільтрів', 'частин багато, є умови, цикли чи HTML'],
          ['Пробіли', 'лише ті, що ти написав в аргументі', 'у змінну потрапляють і переноси рядків — потрібні `{%-` `-%}` або [strip](/docs/filters/strip)'],
          ['Читабельність', 'довгий ланцюжок із пʼяти `append` читати важко', 'виглядає як звичайний шаблон'],
        ],
      },
      {
        type: 'example',
        title: 'Те саме через capture',
        preset: 'product',
        template:
          '{% capture url %}{{ product.url }}?variant={{ product.selected_or_first_available_variant.id }}{% endcapture %}\n{{ url }}',
        note: 'Результат той самий. У реальних темах побачиш обидва варіанти; для довгих рядків із кількома змінними `capture` читається легше.',
      },
      {
        type: 'example',
        title: 'Межові випадки',
        template: '{{ "Сторінка " | append: 5 }}\n[{{ "a" | append: nothing }}]\n[{{ nothing | append: "x" }}]\n{{ 5 | append: 5 }}',
        note: '`nil` з будь-якого боку — це порожній рядок, помилки не буде. Останній рядок — улюблена пастка: `append` завжди **склеює текст**, тож `5` і `5` дають `55`, а не `10`. Додавати числа — [plus](/docs/filters/plus).',
      },
      {
        type: 'note',
        tone: 'warn',
        title: 'Порядок у ланцюжку',
        text: 'Фільтр застосовується до того, що стоїть **ліворуч від нього на цей момент**. `{{ "icon-" | append: name | append: ".svg" | asset_url }}` — правильно: спершу зібрали імʼя файлу, потім попросили його адресу. Якщо поставити `asset_url` раніше, `append` допише `.svg` уже до готового URL із версією `?v=…` — і посилання зламається.',
      },
      {
        type: 'note',
        tone: 'shopify',
        text: 'Де це в темах: параметри до адрес (`?variant=`, `?sort_by=`, `&page=`), імена файлів для `asset_url`, ключі перекладів (`"products.badge." | append: badge_type | t`), `id` елементів, унікальні в межах секції (`"Slider-" | append: section.id`).',
      },
      {
        type: 'note',
        tone: 'interview',
        title: 'На співбесіді',
        text: '«Як у Liquid склеїти рядки?» — `append`/`prepend` або `capture`; оператора `+` немає, а [plus](/docs/filters/plus) додає **числа**. Сильна відповідь згадує дві речі: фільтр не мутує змінну (потрібен `assign`), і що для масивів є окремий фільтр — [concat](/docs/filters/concat), а `append` до масиву не застосовують.',
      },
    ],
  },

  /* ───────────────────────── at_least ───────────────────────── */
  {
    slug: 'at_least',
    section: 'filters',
    title: 'at_least',
    category: 'math',
    syntax: 'number | at_least: number',
    summary: 'Задає нижню межу: якщо число менше за вказане — повертає межу, інакше саме число.',
    officialUrl: 'https://shopify.github.io/liquid/filters/at_least/',
    related: ['filters/at_most', 'filters/abs', 'filters/default', 'filters/minus'],
    blocks: [
      {
        type: 'p',
        text: 'У Liquid немає функцій `min` і `max`. Їх замінюють два фільтри: `at_least` («щонайменше») і [at_most](/docs/filters/at_most) («щонайбільше»). `at_least: 5` читається як «результат буде **не менший** за 5» — тобто це `max(число, 5)`.',
      },
      {
        type: 'example',
        title: 'Базовий випадок',
        template: '{{ 4 | at_least: 5 }}\n{{ 4 | at_least: 3 }}',
        note: 'У першому рядку 4 менше за межу — повертається межа. У другому число вже задовольняє умову й проходить без змін.',
      },
      {
        type: 'example',
        title: 'Скільки лишилось до безкоштовної доставки',
        preset: 'cart',
        template:
          'У кошику: {{ cart.total_price | money }}\nДо порога 5 000 ₴: {{ 500000 | minus: cart.total_price | at_least: 0 | money }}\nДо порога 3 000 ₴: {{ 300000 | minus: cart.total_price | at_least: 0 | money }}',
        note: 'Другий поріг уже перейдено, і без `at_least: 0` там стояла б відʼємна сума. Замість `{% if %}` навколо всього рядка — один фільтр.',
      },
      {
        type: 'example',
        title: 'Рядки, nil і затискання в діапазон',
        data: { qty: 0 },
        template:
          '{{ qty | at_least: 1 }}\n{{ "0" | at_least: 1 }}\n[{{ nothing | at_least: 1 }}]\n{{ 15 | at_least: 1 | at_most: 10 }}',
        note: 'Рядок приводиться до числа, `nil` рахується як `0` — тож на виході завжди число. Останній рядок — «clamp»: пара `at_least` + `at_most` тримає значення в межах від 1 до 10.',
      },
      {
        type: 'note',
        tone: 'warn',
        title: 'Назва плутає',
        text: 'Рука тягнеться написати `at_least`, коли хочеш «не більше, ніж…», бо в голові крутиться слово «мінімум». Перевіряй себе фразою: `x | at_least: 1` — «**щонайменше** один». Нижня межа — `at_least`, верхня — `at_most`.',
      },
      {
        type: 'note',
        tone: 'shopify',
        text: 'Типові місця: кількість у полі `quantity` (`| at_least: 1`), число колонок чи слайдів із налаштувань секції (щоб `0` із поля `number` не зламав сітку й не призвів до ділення на нуль), залишок на складі для показу (`inventory_quantity | at_least: 0`, бо він буває відʼємним).',
      },
      {
        type: 'note',
        tone: 'interview',
        title: 'На співбесіді',
        text: '«Як обмежити значення діапазоном, якщо в Liquid немає `min`/`max`?» — `{{ value | at_least: 1 | at_most: 10 }}`. Добре додати, **навіщо**: значення з налаштувань теми приходять від людини, і фільтр-запобіжник дешевший за три рядки `if`. Якщо спитають про старі теми — до появи цих фільтрів те саме робили через `{% if value < 1 %}{% assign value = 1 %}{% endif %}`.',
      },
    ],
  },

  /* ───────────────────────── at_most ───────────────────────── */
  {
    slug: 'at_most',
    section: 'filters',
    title: 'at_most',
    category: 'math',
    syntax: 'number | at_most: number',
    summary: 'Задає верхню межу: якщо число більше за вказане — повертає межу, інакше саме число.',
    officialUrl: 'https://shopify.github.io/liquid/filters/at_most/',
    related: ['filters/at_least', 'filters/divided_by', 'filters/times', 'filters/round'],
    blocks: [
      {
        type: 'p',
        text: '`at_most` — дзеркало [at_least](/docs/filters/at_least): «результат буде **не більший** за…», тобто `min(число, межа)`. Потрібен усюди, де значення не має права вилізти за стелю: відсотки за 100, кількість елементів за розмір сітки, кількість у кошику за залишок на складі.',
      },
      {
        type: 'example',
        title: 'Базовий випадок',
        template: '{{ 4 | at_most: 5 }}\n{{ 4 | at_most: 3 }}',
        note: 'Число в межах — проходить як є. Перевищило — повертається межа.',
      },
      {
        type: 'example',
        title: 'Смуга прогресу до безкоштовної доставки',
        preset: 'cart',
        view: 'html',
        template:
          '{% assign percent = cart.total_price | times: 100 | divided_by: 500000 | at_most: 100 %}\n<div style="width: 240px; background: #ddd">\n  <div style="width: {{ percent }}%; background: #0e8f8b; color: #fff">{{ percent }}%</div>\n</div>\n\nПоріг 3 000 ₴: {{ cart.total_price | times: 100 | divided_by: 300000 | at_most: 100 }}%',
        note: 'Без `at_most: 100` другий рядок показав би 125% — і смуга в реальній темі вилізла б за контейнер. Зверни увагу на порядок: спершу `times`, потім [divided_by](/docs/filters/divided_by), інакше цілочисельне ділення дасть нуль.',
      },
      {
        type: 'example',
        title: 'Межові випадки',
        preset: 'collection',
        template:
          '{{ collection.products.size | at_most: 4 }}\n{{ "12" | at_most: 10 }}\n[{{ nothing | at_most: 5 }}]\n{{ -3 | at_most: 0 }}',
        note: 'Рядок приводиться до числа. `nil` стає `0`, а `0` менший за межу — тож виводиться `0`, а не межа. Це не значення за замовчуванням: для «порожньо → 5» потрібен [default](/docs/filters/default).',
      },
      {
        type: 'note',
        tone: 'warn',
        title: 'at_most не підставляє значення замість порожнього',
        text: '`{{ section.settings.limit | at_most: 12 }}` на порожньому налаштуванні дасть `0`, і цикл із `limit: 0` не виведе нічого. Правильний порядок: спершу `default`, потім межі — `{{ limit | default: 8 | at_least: 1 | at_most: 12 }}`.',
      },
      {
        type: 'note',
        tone: 'shopify',
        text: 'У темах: відсоток заповнення смуги, кількість карток у рядку (`| at_most: 6`), `max` для поля кількості (`variant.inventory_quantity | at_most: 10`), ліміт товарів у блоці рекомендацій. Усе, що вводить людина в редакторі теми, варто затискати з обох боків.',
      },
      {
        type: 'note',
        tone: 'interview',
        title: 'На співбесіді',
        text: 'Класична міні-задача: «порахуй відсоток прогресу до безкоштовної доставки». Очікують три речі: множити **до** ділення (або ділити на дробове), обмежити результат `at_most: 100`, а залишок суми — `at_least: 0`. Якщо скажеш, що сам кошик оновлюється через AJAX і тому цю арифметику доведеться продублювати в JS або перерендерити секцію, — це вже рівень middle.',
      },
    ],
  },

  /* ───────────────────────── capitalize ───────────────────────── */
  {
    slug: 'capitalize',
    section: 'filters',
    title: 'capitalize',
    category: 'string',
    syntax: 'string | capitalize',
    summary: 'Робить першу літеру рядка великою, а всі інші — малими. Це не «кожне слово з великої».',
    officialUrl: 'https://shopify.github.io/liquid/filters/capitalize/',
    related: ['filters/downcase', 'filters/upcase', 'filters/split', 'filters/join'],
    blocks: [
      {
        type: 'p',
        text: '`capitalize` приводить рядок до вигляду «як початок речення»: перший символ — великий, **решта — малі**. Друга половина цього правила і є головною несподіванкою: фільтр не просто піднімає першу літеру, а ще й опускає все інше.',
      },
      {
        type: 'example',
        title: 'Базовий випадок',
        template: '{{ "шампунь із кератином" | capitalize }}\n{{ "hELLO wORLD" | capitalize }}',
        note: 'Кирилиця працює так само, як латиниця. У другому рядку видно обидві дії: `h` піднялась, а `ELLO wORLD` стало малими. Друге слово з великої літери **не** почалось.',
      },
      {
        type: 'example',
        title: 'Коли фільтр шкодить',
        template: '{{ "Cocochoco PRO із SPF 30" | capitalize }}\n{{ "iPhone-чохол" | capitalize }}',
        note: 'Абревіатури й назви брендів зіпсовано. Тому `capitalize` не застосовують «про всяк випадок» до назв товарів і вендорів — лише до тексту, про який точно відомо, що він увесь малими: теги, handle-подібні значення, опції.',
      },
      {
        type: 'example',
        title: 'Межові випадки',
        template: '[{{ " шампунь" | capitalize }}]\n[{{ "123abc" | capitalize }}]\n[{{ nothing | capitalize }}]\n[{{ 5 | capitalize }}]',
        note: 'Фільтр дивиться рівно на **перший символ**. Якщо це пробіл чи цифра — піднімати нічого, і рядок лишається як був. Пробіл на початку приходить частіше, ніж здається, — після `split: ","`. Ліки: [strip](/docs/filters/strip) перед `capitalize`.',
      },
      { type: 'h', text: 'Кожне слово з великої' },
      {
        type: 'p',
        text: 'Окремого фільтра «title case» в Liquid немає. Якщо це потрібно саме в HTML (а не лише на вигляд), слова доведеться обробити по одному: [split](/docs/filters/split) → цикл → `capitalize`.',
      },
      {
        type: 'example',
        title: 'Title case вручну',
        template: `{%- assign words = "термозахисний спрей ERAYBA" | split: " " -%}
{%- capture title -%}
  {%- for word in words -%}
    {{ word | capitalize }}{% unless forloop.last %} {% endunless %}
  {%- endfor -%}
{%- endcapture -%}
{{ title }}`,
        note: 'І тут та сама ціна: `ERAYBA` перетворилась на `Erayba`.',
      },
      {
        type: 'note',
        tone: 'tip',
        title: 'Часто досить CSS',
        text: 'Якщо велика літера потрібна **лише візуально** — `text-transform: capitalize` (кожне слово) або `::first-letter { text-transform: uppercase }` зроблять це без зміни тексту. Дані лишаються оригінальними: пошук, копіювання й читалки екрана бачать те, що ввів менеджер.',
      },
      {
        type: 'note',
        tone: 'shopify',
        text: 'Де справді вживають: теги товару й статей у фільтрах і хмарі тегів (їх зазвичай заводять малими), значення опцій варіантів, `customer.first_name`, введене клієнтом як «софія». Для заголовків із `product.title` — майже ніколи.',
      },
      {
        type: 'note',
        tone: 'interview',
        title: 'На співбесіді',
        text: '«Що виведе `{{ "hello WORLD" | capitalize }}`?» — `Hello world`, і це питання саме на другу половину: решта рядка стає малими. Далі можуть спитати, як зробити кожне слово з великої: фільтра немає, або `split` + цикл + `capitalize`, або CSS `text-transform`. Вибір на користь CSS варто пояснити: це оформлення, а не дані.',
      },
    ],
  },

  /* ───────────────────────── ceil ───────────────────────── */
  {
    slug: 'ceil',
    section: 'filters',
    title: 'ceil',
    category: 'math',
    syntax: 'number | ceil',
    summary: 'Округлює число вгору до найближчого цілого.',
    officialUrl: 'https://shopify.github.io/liquid/filters/ceil/',
    related: ['filters/floor', 'filters/round', 'filters/divided_by', 'filters/modulo'],
    blocks: [
      {
        type: 'p',
        text: '`ceil` («стеля») завжди округлює **вгору**: `1.2` → `2`, і навіть `1.0001` → `2`. Він потрібен, коли рахуєш «скільки штук знадобиться, щоб усе вмістилось»: сторінок, рядків сітки, коробок, хвилин читання. Неповна сторінка — все одно сторінка.',
      },
      {
        type: 'example',
        title: 'Базовий випадок',
        template: '{{ 1.2 | ceil }}\n{{ 183.357 | ceil }}\n{{ 2.0 | ceil }}\n{{ -1.2 | ceil }}',
        note: 'Ціле число лишається собою. Відʼємне теж іде **вгору по числовій осі**, тобто до нуля: `-1.2` → `-1`, а не `-2`.',
      },
      {
        type: 'example',
        title: 'Скільки сторінок потрібно',
        template: '23 товари по 8 на сторінку\nПравильно: {{ 23 | divided_by: 8.0 | ceil }}\nНеправильно: {{ 23 | divided_by: 8 | ceil }}',
        note: 'Другий рядок — типова помилка. [divided_by](/docs/filters/divided_by) на ціле число вже відкинув дробову частину, і `ceil` отримав готову двійку — округлювати нічого. Дільник має бути дробовим: `8.0`.',
      },
      {
        type: 'example',
        title: 'Час читання статті',
        preset: 'blog',
        template:
          '{% assign words = article.content | strip_html | split: " " | size %}\nСлів: {{ words }}\nЧитати: {{ words | divided_by: 200.0 | ceil }} хв',
        note: 'Саме `ceil`, а не `round`: для короткої статті `round` показав би «0 хв».',
      },
      {
        type: 'example',
        title: 'Рядки, nil і сміття',
        template: '{{ "3.5" | ceil }}\n[{{ nothing | ceil }}]\n{{ "багато" | ceil }}',
        note: 'Рядок із числом працює. Усе нечислове, зокрема `nil`, стає `0` — без помилки.',
      },
      {
        type: 'table',
        head: ['Вхід', '`floor`', '`round`', '`ceil`'],
        rows: [
          ['`4.2`', '`4`', '`4`', '`5`'],
          ['`4.7`', '`4`', '`5`', '`5`'],
          ['`-4.2`', '`-5`', '`-4`', '`-4`'],
        ],
      },
      {
        type: 'note',
        tone: 'warn',
        title: 'ceil не рятує після цілочисельного ділення',
        text: 'Якщо і ділене, і дільник — змінні з цілими числами (`products_count`, `section.settings.per_row`), літерала `8.0` написати ніде. Тоді ділене спершу роблять дробовим: `{{ count | times: 1.0 | divided_by: per_row | ceil }}`. У Shopify це працює; **пісочниця цього трюку не відтворює** — деталі на сторінці [divided_by](/docs/filters/divided_by).',
      },
      {
        type: 'note',
        tone: 'shopify',
        text: 'Кількість сторінок рахувати руками зазвичай не треба — її дає `paginate.pages`. `ceil` лишається для того, чого Shopify не рахує: рядки сітки, кількість слайдів-груп у каруселі, час читання, «скільки упаковок замовити».',
      },
      {
        type: 'note',
        tone: 'interview',
        title: 'На співбесіді',
        text: 'Питання звучить як «чим відрізняються `ceil`, `floor` і `round`» — і справжня перевірка в продовженні: «чому `{{ 23 | divided_by: 8 | ceil }}` дає 2, а не 3?». Відповідь: ділення цілого на ціле в Liquid цілочисельне, дробова частина зникає **до** `ceil`. Виправлення — дробовий дільник.',
      },
    ],
  },

  /* ───────────────────────── compact ───────────────────────── */
  {
    slug: 'compact',
    section: 'filters',
    title: 'compact',
    category: 'array',
    syntax: 'array | compact',
    summary: 'Прибирає з масиву всі значення `nil`. Найчастіше стоїть одразу після `map`.',
    officialUrl: 'https://shopify.github.io/liquid/filters/compact/',
    related: ['filters/map', 'filters/where', 'filters/reject', 'filters/uniq'],
    blocks: [
      {
        type: 'p',
        text: '`compact` викидає з масиву «дірки» — елементи зі значенням `nil`. Сам собою масив із дірками в Liquid майже не трапляється; він зʼявляється після [map](/docs/filters/map), коли ти витягуєш властивість, якої **в частини елементів немає**. Тому ці два фільтри майже завжди ходять парою.',
      },
      {
        type: 'example',
        title: 'Базовий випадок',
        data: { volumes: ['250 мл', null, '400 мл', null, '1000 мл'] },
        template: 'Було: {{ volumes | size }}\nСтало: {{ volumes | compact | size }}\n{{ volumes | compact | join: ", " }}',
      },
      {
        type: 'example',
        title: 'Разом із map',
        preset: 'collection',
        template:
          'Без compact: [{{ collection.products | map: "compare_at_price" | join: ", " }}]\nІз compact:  [{{ collection.products | map: "compare_at_price" | compact | join: ", " }}]\n\nТоварів зі старою ціною: {{ collection.products | map: "compare_at_price" | compact | size }}',
        note: 'У трьох товарів із пʼяти `compare_at_price` порожній. Без `compact` у рядку лишаються зайві коми, а `size` рахує й порожні місця.',
      },
      {
        type: 'example',
        title: 'Що compact НЕ прибирає',
        data: { values: [0, false, '', null, 'текст'] },
        template: 'Було: {{ values | size }}\nСтало: {{ values | compact | size }}',
        note: 'Зник лише `null`. `false`, `0` і порожній рядок — повноцінні значення, і `compact` їх не чіпає. Порожні рядки відсіює [reject](/docs/filters/reject) або [where](/docs/filters/where), а не він.',
      },
      {
        type: 'example',
        title: 'Не масив на вході',
        template: '[{{ nothing | compact | size }}]\n[{{ "рядок" | compact }}]',
        note: '`nil` перетворюється на порожній масив, тож ланцюжок не падає. Рядок проходить наскрізь.',
      },
      {
        type: 'note',
        tone: 'warn',
        title: 'compact втрачає відповідність індексів',
        text: 'Після `map | compact` масив стає коротшим за вихідний, і `prices[2]` уже не відповідає `products[2]`. Якщо далі ти йдеш циклом по товарах і береш значення за `forloop.index0` — `compact` усе зламає. Потрібні самі товари, а не їхні властивості? Тоді фільтруй **товари**: `{{ collection.products | where: "compare_at_price" }}`.',
      },
      {
        type: 'note',
        tone: 'info',
        title: 'Недокументований параметр',
        text: 'У Ruby-реалізації Liquid `compact` приймає імʼя властивості (`compact: "compare_at_price"`) і тоді прибирає **обʼєкти**, в яких вона `nil`. У довідці Shopify цього параметра немає, пісочниця його не підтримує — у темах надійніше писати `where`.',
      },
      {
        type: 'note',
        tone: 'shopify',
        text: 'Типові дірки в даних магазину: `compare_at_price` (немає знижки), `featured_image` (товар без фото), метаполя (`product.metafields.custom.…` заповнене не всюди), `variant.image`. Сценарій: зібрати всі фото варіантів у галерею — `product.variants | map: "image" | compact | uniq`.',
      },
      {
        type: 'note',
        tone: 'interview',
        title: 'На співбесіді',
        text: '«Навіщо `compact`, якщо є `where`?» — вони працюють на різних рівнях. `where` фільтрує **обʼєкти** за властивістю, `compact` чистить **уже витягнуті значення**. Після `map` обʼєктів більше немає, є масив значень із `nil` на місці відсутніх, і `where` до нього вже не застосуєш. Друга частина відповіді: `compact` прибирає лише `nil` — не `false` і не порожні рядки.',
      },
    ],
  },

  /* ───────────────────────── concat ───────────────────────── */
  {
    slug: 'concat',
    section: 'filters',
    title: 'concat',
    category: 'array',
    syntax: 'array | concat: array',
    summary: 'Зʼєднує два масиви в один. Дублікати не прибирає, аргументом приймає лише масив.',
    officialUrl: 'https://shopify.github.io/liquid/filters/concat/',
    related: ['filters/uniq', 'filters/split', 'filters/join', 'filters/append'],
    blocks: [
      {
        type: 'p',
        text: '`concat` дописує елементи одного масиву в кінець іншого й повертає **новий** масив. Це для масивів те саме, що [append](/docs/filters/append) для рядків. І це єдиний спосіб «додати елемент» у масив: методів на кшталт `push` у Liquid немає, масиви незмінні.',
      },
      {
        type: 'example',
        title: 'Базовий випадок',
        data: { care: ['шампунь', 'маска'], styling: ['спрей', 'маска'] },
        template: '{% assign all = care | concat: styling %}\n{{ all | join: ", " }}\nУ care досі: {{ care | size }}',
        note: '«маска» зустрічається двічі — `concat` нічого не звіряє. І вихідний масив `care` не змінився.',
      },
      {
        type: 'example',
        title: 'Кілька масивів і без дублікатів',
        data: { care: ['шампунь', 'маска'], styling: ['спрей', 'маска'], extra: ['олійка'] },
        template: '{{ care | concat: styling | concat: extra | uniq | join: ", " }}',
        note: 'Ланцюжок `concat` зʼєднує скільки завгодно масивів, а [uniq](/docs/filters/uniq) у кінці прибирає повтори.',
      },
      {
        type: 'example',
        title: 'Додати один елемент',
        preset: 'product',
        template:
          '{% assign extra = "новинка" | split: "|" %}\n{% assign tags = product.tags | concat: extra %}\n{{ tags | join: ", " }}',
        note: 'Літерала масиву в Liquid немає, тому масив з одного елемента роблять через [split](/docs/filters/split) за роздільником, якого в рядку точно нема.',
      },
      {
        type: 'example',
        title: 'Рядок замість масиву',
        data: { care: ['шампунь', 'маска'] },
        template: '{{ care | concat: "олійка" | join: ", " }}',
        shopifyOutput: 'Liquid error: concat filter requires an array argument',
        note: 'Пісочниця тут поблажлива й просто додає рядок як елемент. **Shopify так не робить**: аргумент `concat` мусить бути масивом, інакше — помилка. Орієнтуйся на рядок «У Shopify».',
      },
      {
        type: 'note',
        tone: 'warn',
        title: 'concat не змінює масив на місці',
        text: '`{{ tags | concat: extra }}` без `assign` просто надрукує склеєні елементи впритул і забуде результат. Щоб користуватись новим масивом далі, його треба зберегти: `{% assign tags = tags | concat: extra %}`.',
      },
      {
        type: 'note',
        tone: 'shopify',
        text: 'У темах `concat` зʼєднує товари кількох колекцій для одного блока (`collections["new"].products | concat: collections["sale"].products`), теги товару зі службовими бейджами, фото товару з фото варіантів. Памʼятай, що в кожному з масивів — лише те, що Shopify віддав без пагінації, тож «усі товари двох великих колекцій» так не зібрати.',
      },
      {
        type: 'note',
        tone: 'interview',
        title: 'На співбесіді',
        text: '«Як додати елемент у масив у Liquid?» — напряму ніяк: масиви незмінні, літералів немає. Роблять масив з одного елемента через `split` і зʼєднують `concat`, результат кладуть у змінну через `assign`. Уточнення, яке відрізняє того, хто пробував: `concat` приймає **тільки масив** (на рядок Shopify дасть помилку) і не прибирає дублікати — для цього `uniq`.',
      },
    ],
  },

  /* ───────────────────────── date ───────────────────────── */
  {
    slug: 'date',
    section: 'filters',
    title: 'date',
    category: 'date',
    syntax: 'string | date: string',
    summary:
      'Форматує дату за шаблоном `strftime`: `%d.%m.%Y` → `08.03.2026`. Приймає рядок із датою, Unix-timestamp або слова `"now"` і `"today"`.',
    officialUrl: 'https://shopify.github.io/liquid/filters/date/',
    related: ['filters/default', 'filters/minus', 'filters/divided_by', 'shopify/locales', 'shopify/liquid-and-js', 'shopify/performance'],
    blocks: [
      {
        type: 'p',
        text: 'Дати в Shopify приходять у машинному вигляді: `2026-03-08 14:05:09 +0200`. `date` перетворює таку дату на текст для людини. Формат описується рядком із **директив** — пар «відсоток + літера», кожна з яких замінюється на частину дати. Усе інше в рядку (крапки, пробіли, слова) друкується як є. Синтаксис директив Liquid узяв у Ruby-функції `strftime`, тому він однаковий у Ruby, C, Python і PHP.',
      },
      {
        type: 'example',
        title: 'Базовий випадок',
        data: { published: SAMPLE_DATE },
        template:
          '{{ published | date: "%d.%m.%Y" }}\n{{ published | date: "%Y-%m-%d %H:%M:%S" }}\n{{ published | date: "%B %-d, %Y" }}\n{{ published | date: "%A, %H:%M" }}',
        note: 'Одна й та сама дата — чотири вигляди. Зміни формат і подивись, що вийде. На цій сторінці всюди одна дата: неділя, 8 березня 2026 року, 14:05:09, пояс +02:00.',
      },
      { type: 'h', text: 'Директиви strftime' },
      {
        type: 'p',
        text: 'Приклади в таблиці — для тієї самої дати. Регістр літери має значення: `%m` — місяць, `%M` — хвилини; `%d` — день, `%D` — зовсім інше; `%y` — дві цифри року, `%Y` — чотири.',
      },
      {
        type: 'table',
        head: ['Директива', 'Що означає', 'Приклад'],
        rows: [
          ['`%Y`', 'рік, чотири цифри', '`2026`'],
          ['`%y`', 'рік, дві останні цифри', '`26`'],
          ['`%m`', 'місяць числом, із нулем', '`03`'],
          ['`%-m`', 'місяць числом, без нуля', '`3`'],
          ['`%B`', 'назва місяця повністю (англійською)', '`March`'],
          ['`%b`', 'назва місяця скорочено', '`Mar`'],
          ['`%d`', 'день місяця, із нулем', '`08`'],
          ['`%-d`', 'день місяця, без нуля', '`8`'],
          ['`%e`', 'день місяця, замість нуля — пробіл', '` 8`'],
          ['`%j`', 'день року, 001–366', '`067`'],
          ['`%H`', 'година, 24-годинний формат', '`14`'],
          ['`%I`', 'година, 12-годинний формат', '`02`'],
          ['`%-I`', 'те саме без нуля', '`2`'],
          ['`%M`', 'хвилини', '`05`'],
          ['`%S`', 'секунди', '`09`'],
          ['`%p`', '`AM` / `PM`', '`PM`'],
          ['`%P`', '`am` / `pm` малими', '`pm`'],
          ['`%A`', 'день тижня повністю (англійською)', '`Sunday`'],
          ['`%a`', 'день тижня скорочено', '`Sun`'],
          ['`%u`', 'день тижня числом, понеділок = 1', '`7`'],
          ['`%w`', 'день тижня числом, неділя = 0', '`0`'],
          ['`%U` / `%W`', 'номер тижня року (тиждень від неділі / від понеділка)', '`10`'],
          ['`%z`', 'зміщення поясу від UTC', '`+0200`'],
          ['`%:z`', 'те саме з двокрапкою', '`+02:00`'],
          ['`%Z`', 'назва поясу; **пісочниця** друкує зміщення', '`EET`'],
          ['`%s`', 'Unix-timestamp: секунди від 1970 року', '`1772971509`'],
          ['`%%`', 'просто знак відсотка', '`%`'],
        ],
      },
      {
        type: 'p',
        text: 'Між відсотком і літерою можна поставити **прапорець**: `-` прибирає ведучий нуль (`%-d`, `%-m`, `%-H`), `^` робить великими (`%^b` → `MAR`), `_` замінює нуль пробілом. Найуживаніший — мінус: «8 березня», а не «08 березня».',
      },
      {
        type: 'example',
        title: 'Спробуй усі директиви',
        data: { d: SAMPLE_DATE },
        template:
          'Рік: {{ d | date: "%Y / %y" }}\nМісяць: {{ d | date: "%m / %-m / %B / %b / %^b" }}\nДень: {{ d | date: "%d / %-d / %j" }}\nЧас 24: {{ d | date: "%H:%M:%S" }}\nЧас 12: {{ d | date: "%-I:%M %p" }}\nДень тижня: {{ d | date: "%A / %a / %u / %w" }}\nПояс: {{ d | date: "%z / %:z" }}\nTimestamp: {{ d | date: "%s" }}\nЗнижка 20%: {{ d | date: "20%% до %d.%m" }}',
      },
      {
        type: 'note',
        tone: 'info',
        title: 'Складені директиви',
        text: 'У Ruby є скорочення: `%F` = `%Y-%m-%d`, `%T` = `%H:%M:%S`, `%R` = `%H:%M`, `%D` = `%m/%d/%y`, `%c`, `%x`, `%X`. У Shopify вони працюють, **у пісочниці — ні** (або друкують інше). Пиши повну форму: вона однакова всюди і її легше прочитати колезі.',
      },
      { type: 'h', text: 'Формати для українського магазину' },
      {
        type: 'example',
        title: 'Цифрові формати',
        data: { d: SAMPLE_DATE },
        template: '{{ d | date: "%d.%m.%Y" }}\n{{ d | date: "%d.%m.%y" }}\n{{ d | date: "%d.%m.%Y о %H:%M" }}\n{{ d | date: "%-d.%m" }}',
        note: 'Звичний для України запис — день, місяць, рік через крапку. Слова у форматі («о») друкуються як є. Американський `%m/%d/%Y` український покупець прочитає навпаки: 03/08 для нього — 3 серпня.',
      },
      {
        type: 'p',
        text: 'Назви місяців і днів тижня з `%B`, `%b`, `%A`, `%a` — **завжди англійською**, мову магазину `strftime` не знає. До того ж українською після числа потрібен родовий відмінок: «8 березня», а не «8 березень». Найпростіший вихід — власний список місяців.',
      },
      {
        type: 'example',
        title: 'Дата словами українською',
        data: { d: SAMPLE_DATE },
        template: `{%- assign months = "січня,лютого,березня,квітня,травня,червня,липня,серпня,вересня,жовтня,листопада,грудня" | split: "," -%}
{%- assign i = d | date: "%-m" | minus: 1 -%}
{{ d | date: "%-d" }} {{ months[i] }} {{ d | date: "%Y" }}`,
        note: '`%-m` дає номер місяця без нуля, `minus: 1` перетворює його на індекс масиву (масиви рахуються з нуля) і заразом із рядка робить число.',
      },
      {
        type: 'note',
        tone: 'shopify',
        title: 'Формати з файлів перекладу',
        text: 'У Shopify `date` має ще й іменований параметр `format` — він бере готовий формат **під мову магазину**: `abbreviated_date`, `basic`, `date`, `date_at_time`, `default`, `on_date`. Власні формати можна оголосити в локалі теми в розділі `date_formats`. Це «правильний» шлях для багатомовного магазину; пісочниця його не емулює. Про файли перекладу — [Локалі](/docs/shopify/locales).',
      },
      {
        type: 'code',
        lang: 'liquid',
        title: 'Лише в Shopify',
        code: `{{ article.published_at | date: format: 'abbreviated_date' }}

{% comment %} locales/uk.json: "date_formats": { "day_month": "%-d.%m" } {% endcomment %}
{{ article.published_at | date: format: 'day_month' }}`,
      },
      { type: 'h', text: 'Що можна подати на вхід' },
      {
        type: 'list',
        items: [
          '**Дата з обʼєкта Shopify** — `article.published_at`, `order.created_at`, `product.created_at`, `customer.orders.first.created_at`. Основний випадок.',
          '**Рядок із датою** — `"2026-03-08T14:05:09+02:00"`, `"2026-03-08"`, `"March 8, 2026"`. Корисно для дат із метаполів і налаштувань.',
          '**Unix-timestamp** — число секунд або рядок із самих цифр.',
          '**Слова `"now"` і `"today"`** — поточний момент. Обидва означають одне й те саме: «зараз», із годинами й хвилинами.',
        ],
      },
      {
        type: 'example',
        title: 'Timestamp і поточний час',
        template:
          '{{ 1772964000 | date: "%d.%m.%Y" }}\n{{ "1772964000" | date: "%d.%m.%Y" }}\n© {{ "now" | date: "%Y" }} Liquid Lab',
        note: 'Timestamp не містить часового поясу — це момент у UTC. Shopify покаже його в **поясі магазину** (Settings → General), пісочниця — у поясі твого браузера. Рік у копірайті — найпоширеніше й безпечне вживання `"now"`.',
      },
      {
        type: 'note',
        tone: 'warn',
        title: 'Пастка: "now" застигає в кеші',
        text: 'Liquid виконується **на сервері, у момент рендеру сторінки**, а готовий HTML Shopify кешує. Тому `"now"` — це не «час, коли покупець відкрив сторінку», а «час, коли сторінку востаннє зібрали». Рік у футері від цього не страждає. А от таймер до кінця акції, «сьогодні ми працюємо до…», «замов до 15:00 — відправимо сьогодні» на чистому Liquid брехатимуть: хтось побачить сторінку, зібрану годину тому. Усе, що залежить від поточної хвилини, рахують **у JavaScript**, а Liquid лише передає цільову дату.',
      },
      {
        type: 'code',
        lang: 'liquid',
        title: 'Таймер акції: Liquid дає дату, JS рахує',
        code: `<div class="countdown" data-ends-at="{{ section.settings.sale_end | date: '%Y-%m-%dT%H:%M:%S%z' }}"></div>

<script>
  const el = document.querySelector('.countdown')
  const left = new Date(el.dataset.endsAt) - Date.now() // рахується в браузері, у момент перегляду
</script>`,
      },
      { type: 'h', text: 'Порівняння й арифметика дат' },
      {
        type: 'p',
        text: 'Дати в Liquid не можна віднімати напряму. Їх переводять у секунди через `%s`, а далі працює звичайна математика. Результат `date` — **рядок**, тому перед порівнянням його роблять числом (`plus: 0`).',
      },
      {
        type: 'example',
        title: 'Бейдж «новинка» для статей, молодших за 30 днів',
        preset: 'blog',
        data: { today: '2026-09-20T12:00:00+03:00' },
        template: `{%- assign now_s = today | date: "%s" | plus: 0 -%}
{%- for article in blog.articles %}
  {%- assign pub_s = article.published_at | date: "%s" | plus: 0 -%}
  {%- assign days = now_s | minus: pub_s | divided_by: 86400 %}
{{ article.published_at | date: "%d.%m.%Y" }} · {{ article.title }} · {{ days }} дн.{% if days <= 30 %} · НОВИНКА{% endif %}
{%- endfor %}`,
        note: 'Тут «сьогодні» зафіксовано в даних, щоб приклад не залежав від дня, коли ти його читаєш. У темі замість `today` стояло б `"now"` — з тією самою поправкою на кеш: бейдж може запізнитись, і для «новинки» це не страшно. 86400 — секунд у добі.',
      },
      {
        type: 'example',
        title: 'Погані дані на вході',
        data: { d: SAMPLE_DATE },
        template: '[{{ "скоро" | date: "%d.%m.%Y" }}]\n[{{ nothing | date: "%d.%m.%Y" }}]\n[{{ "" | date: "%d.%m.%Y" }}]',
        note: 'Те, що не вдалося розпізнати як дату, повертається **без змін** і без помилки — тож «скоро» з метаполя так і надрукується. `nil` і порожній рядок дають порожній вивід; підстрахуватись можна через [default](/docs/filters/default).',
      },
      {
        type: 'note',
        tone: 'warn',
        title: 'Часовий пояс',
        text: 'Дати обʼєктів Shopify віддає в поясі магазину, і `date` друкує їх у ньому ж. Рядок без поясу (`"2026-03-08"`) кожна реалізація трактує по-своєму — пісочниця, наприклад, прочитає його як північ за UTC і покаже у твоєму поясі. Для дат, які заводиш сам (метаполя, налаштування секції), пиши повний ISO-запис зі зміщенням: `2026-03-08T00:00:00+02:00`.',
      },
      {
        type: 'note',
        tone: 'interview',
        title: 'На співбесіді',
        text: 'Три питання, які справді звучать. **«Як вивести дату у форматі 08.03.2026?»** — `| date: "%d.%m.%Y"`; добре одразу назвати `%-d` і сказати, що `%m` — місяць, а `%M` — хвилини. **«Як вивести поточний рік?»** — `{{ "now" | date: "%Y" }}`. **«Чому таймер на Liquid показує неправильний час?»** — бо Liquid рендериться на сервері й кешується: `"now"` — це час рендеру, а не перегляду. Рішення: Liquid віддає цільову дату в `data`-атрибут, рахує JS. Бонус для middle: назви місяців з `%B` завжди англійські, локалізація — через `date: format:` і `date_formats` у файлах перекладу або через власний масив місяців.',
      },
    ],
  },

  /* ───────────────────────── default ───────────────────────── */
  {
    slug: 'default',
    section: 'filters',
    title: 'default',
    category: 'other',
    syntax: 'variable | default: variable',
    summary:
      'Підставляє запасне значення, якщо вхід — `nil`, `false` або порожній (порожній рядок, порожній масив). З `allow_false: true` значення `false` лишається собою.',
    officialUrl: 'https://shopify.github.io/liquid/filters/default/',
    related: ['basics/truthy-and-falsy', 'basics/types', 'shopify/theme-settings', 'shopify/snippets-render'],
    blocks: [
      {
        type: 'p',
        text: '`default` — запобіжник від порожнечі: «якщо значення немає, візьми оце». Дані магазину заповнює людина, і заповнює не всі: метаполе порожнє, заголовок секції стерли, клієнт не вказав імʼя. Замість `{% if %}…{% else %}…{% endif %}` навколо кожного виводу — один фільтр.',
      },
      {
        type: 'example',
        title: 'Базовий випадок',
        preset: 'product',
        template:
          'Привіт, {{ customer.first_name | default: "гостю" }}!\n{{ product.metafields.custom.subtitle | default: product.type | default: "Товар" }}',
        note: 'Покупець не залогінений — `customer` дорівнює `nil`, спрацьовує запасний текст. Другий рядок — **ланцюжок** запасних варіантів: метаполя `subtitle` немає, тож береться тип товару; був би порожній і він — надрукувалось би «Товар». Аргументом може бути інша змінна.',
      },
      { type: 'h', text: 'На що саме спрацьовує' },
      {
        type: 'p',
        text: 'Правило `default` **ширше**, ніж звичайна перевірка `{% if %}`. В умові порожній рядок — truthy, а `default` його замінює. Водночас `0` і рядок із пробілу — значення, і їх він не чіпає.',
      },
      {
        type: 'example',
        title: 'Усі випадки поруч',
        data: { empty_list: [] },
        template:
          'nil: [{{ nothing | default: "запас" }}]\nfalse: [{{ false | default: "запас" }}]\nпорожній рядок: [{{ "" | default: "запас" }}]\nпорожній масив: [{{ empty_list | default: "запас" }}]\nнуль: [{{ 0 | default: "запас" }}]\nпробіл: [{{ " " | default: "запас" }}]\nпробіл + strip: [{{ " " | strip | default: "запас" }}]',
        note: 'Перші чотири — спрацював. `0` і `" "` пройшли без змін. Якщо в полі можуть бути самі пробіли (менеджер натиснув пробіл, щоб «очистити» заголовок) — став [strip](/docs/filters/strip) перед `default`.',
      },
      {
        type: 'table',
        head: ['Значення', 'У `{% if %}`', '`default` підставить запас?'],
        rows: [
          ['`nil` (змінної немає)', 'falsy', 'так'],
          ['`false`', 'falsy', 'так — якщо немає `allow_false: true`'],
          ['`""` порожній рядок', '**truthy**', 'так'],
          ['порожній масив', '**truthy**', 'так'],
          ['`0`', 'truthy', 'ні'],
          ['`" "` рядок із пробілу', 'truthy', 'ні'],
        ],
      },
      { type: 'h', text: 'Параметри' },
      {
        type: 'table',
        head: ['Параметр', 'Тип', 'Що робить'],
        rows: [
          ['перший аргумент', 'будь-що', 'Запасне значення: рядок, число, булеве або інша змінна.'],
          ['`allow_false`', 'boolean', 'Іменований, необовʼязковий. З `allow_false: true` значення `false` вважається справжнім і **не** замінюється. `nil` і порожній рядок замінюються, як і раніше.'],
        ],
      },
      {
        type: 'example',
        title: 'allow_false',
        template:
          'Без параметра: {{ false | default: true }}\nІз параметром: {{ false | default: true, allow_false: true }}\nnil із параметром: {{ nothing | default: true, allow_false: true }}',
      },
      {
        type: 'note',
        tone: 'warn',
        title: 'Пастка: чекбокс, який неможливо вимкнути',
        text: 'Класична помилка — `{% assign show_vendor = section.settings.show_vendor | default: true %}`. Задум зрозумілий: «якщо налаштування немає — вважай, що ввімкнено». Але знятий чекбокс — це `false`, а `false` для `default` — привід підставити запас. Виходить `true` **за будь-якого** положення чекбокса: менеджер клацає, а вендор не зникає. Те саме з булевим параметром сніпета. Для булевих значень — завжди `default: true, allow_false: true`.',
      },
      {
        type: 'example',
        title: 'Та сама пастка в параметрі сніпета',
        preset: 'product',
        snippets: {
          'vendor-line':
            '{% assign show = show_vendor | default: true %}{% if show %}{{ product.vendor }}{% else %}(приховано){% endif %}',
          'vendor-line-fixed':
            '{% assign show = show_vendor | default: true, allow_false: true %}{% if show %}{{ product.vendor }}{% else %}(приховано){% endif %}',
        },
        template:
          'Параметра немає: {% render "vendor-line", product: product %}\nПередали false: {% render "vendor-line", product: product, show_vendor: false %}\nІз allow_false: {% render "vendor-line-fixed", product: product, show_vendor: false %}',
        note: 'Другий рядок — баг: просили сховати, а вендор показано. Третій сніпет відрізняється одним параметром — і поважає `false`. Водночас пропущений параметр (`nil`) усе ще дає `true`: це саме та поведінка «ввімкнено, якщо не сказано інакше».',
      },
      {
        type: 'note',
        tone: 'shopify',
        text: 'У налаштуваннях секцій і теми значення за замовчуванням задає **схема** (`"default": …`), і фільтр там здебільшого зайвий — виняток становлять текстові поля, які менеджер може стерти дочиста: `{{ section.settings.heading | default: collection.title }}`. Справжня територія `default` — необовʼязкові параметри сніпетів (`{% render %}` не має значень за замовчуванням), метаполя, дані клієнта, `alt` зображень: `{{ image.alt | default: product.title | escape }}`.',
      },
      {
        type: 'note',
        tone: 'interview',
        title: 'На співбесіді',
        text: '«Коли спрацьовує `default`?» — на `nil`, `false` і на порожнє: порожній рядок та порожній масив. Сильна відповідь одразу протиставляє це truthy/falsy: у `{% if %}` порожній рядок правдивий, а `default` його замінить; `0` не замінить ні те, ні те. І обовʼязково — про `allow_false: true` з прикладом чекбокса: це найпоширеніший реальний баг із цим фільтром, і інтервʼюер чекає саме на нього.',
      },
    ],
  },

  /* ───────────────────────── divided_by ───────────────────────── */
  {
    slug: 'divided_by',
    section: 'filters',
    title: 'divided_by',
    category: 'math',
    syntax: 'number | divided_by: number',
    summary:
      'Ділить число на число. Тип результату залежить від дільника: на ціле — ділення націло, на дробове — дробовий результат.',
    officialUrl: 'https://shopify.github.io/liquid/filters/divided_by/',
    related: ['filters/times', 'filters/modulo', 'filters/round', 'filters/ceil', 'filters/floor', 'basics/sandbox'],
    blocks: [
      {
        type: 'p',
        text: 'Найпідступніший із математичних фільтрів. У Liquid є два види чисел — цілі й дробові, — і `divided_by` поводиться по-різному залежно від того, **на що** ділиш. Поділив на ціле — отримав ціле, дробова частина просто зникла. Хочеш дробовий результат — дільник має бути дробовим.',
      },
      {
        type: 'example',
        title: 'Ціле проти дробового',
        template: '{{ 10 | divided_by: 4 }}\n{{ 10 | divided_by: 4.0 }}\n{{ 20 | divided_by: 7 }}\n{{ 20 | divided_by: 7.0 }}',
        note: '`10 / 4` — це `2`, а не `2.5`, і не `3`: дробова частина відкидається, округлення немає. Досить дописати до дільника `.0` — і результат стає дробовим.',
      },
      {
        type: 'table',
        head: ['Вираз', 'Результат', 'Чому'],
        rows: [
          ['`10 | divided_by: 4`', '`2`', 'ціле на ціле — націло'],
          ['`10 | divided_by: 4.0`', '`2.5`', 'дільник дробовий'],
          ['`10.0 | divided_by: 4`', '`2.5` у Shopify', 'дробове ділене теж дає дробовий результат (пісочниця покаже `2`)'],
          ['`-7 | divided_by: 2`', '`-4`', 'націло — це округлення **вниз**, а не до нуля'],
          ['`10 | divided_by: 0`', 'помилка', '`Liquid error: divided by 0`'],
        ],
      },
      { type: 'h', text: 'Коли дільник — змінна' },
      {
        type: 'p',
        text: 'До літерала легко дописати `.0`. А якщо ділиш на `product.compare_at_price` чи `section.settings.per_row`? Ціни, кількості, налаштування типу `range` — усе це **цілі**. Прийом із тем Shopify: зробити дробовим ділене, помноживши на `1.0` або `100.0`.',
      },
      {
        type: 'example',
        title: 'Відсоток знижки',
        preset: 'product',
        template:
          '{% assign saved = product.compare_at_price | minus: product.price %}\nНацило: {{ saved | times: 100 | divided_by: product.compare_at_price }}%\nЧерез 100.0: {{ saved | times: 100.0 | divided_by: product.compare_at_price | round }}%',
        shopifyOutput: 'Націло: 18%\nЧерез 100.0: 19%',
        note: 'Справжня знижка — 18,77%. Цілочисельне ділення чесно відкинуло `.77`, і бейдж показує 18%. У Shopify `times: 100.0` робить число дробовим, ділення стає точним, а [round](/docs/filters/round) дає 19. **Пісочниця тут розходиться з Shopify**: у JavaScript `1500000.0` і `1500000` — одне число, «дробовість» губиться, і другий рядок теж показує 18.',
      },
      {
        type: 'note',
        tone: 'info',
        title: 'Межа емуляції',
        text: 'Пісочниця бачить, що дільник дробовий, лише коли він записаний **літералом** (`4.0`). Дробове ділене або змінна з `8.0` для неї — звичайні цілі. Якщо під прикладом є рядок «У Shopify» — правильний саме він. Докладно — [Про пісочницю](/docs/basics/sandbox).',
      },
      {
        type: 'example',
        title: 'Округлення самими цілими',
        preset: 'product',
        template:
          '{% assign saved = product.compare_at_price | minus: product.price %}\n{{ saved | times: 1000 | divided_by: product.compare_at_price | plus: 5 | divided_by: 10 }}%',
        note: 'Спосіб, який дає правильні 19 і тут, і в Shopify: рахуємо десяті частки відсотка (187), додаємо 5 і ділимо націло на 10. Старий прийом цілочисельної арифметики — корисно знати, хоча в темі простіше написати `times: 100.0 | … | round`.',
      },
      { type: 'h', text: 'Гроші й ділення' },
      {
        type: 'example',
        title: 'Копійки не ділять на 100',
        preset: 'product',
        data: { price: 64950 },
        template: '{{ price | divided_by: 100 }} ₴\n{{ price | divided_by: 100.0 }} ₴\n{{ price | money }}',
        note: 'Ціни в Shopify — у копійках. Перший рядок загубив 50 копійок, другий покаже `649.5` без другого знака після коми й без роздільників. Для цін є [грошові фільтри](/docs/shopify/money-filters) — вони ще й поважають формат валюти магазину.',
      },
      {
        type: 'example',
        title: 'Ділення на нуль',
        template: '{{ 10 | divided_by: 0 }}',
        expectError: true,
        note: 'У Shopify на сторінці зʼявиться текст `Liquid error: divided by 0`, решта сторінки відрендериться. Пісочниця зупиняє рендер цілком.',
      },
      {
        type: 'note',
        tone: 'warn',
        title: 'Нуль приходить звідти, де його не чекаєш',
        text: 'Ніхто не пише `divided_by: 0` руками. Нуль приходить із даних: `compare_at_price` порожній (а `nil` у математиці — це `0`), у колекції немає товарів, менеджер поставив `0` у налаштуванні «колонок у рядку». Перед діленням на змінну завжди став перевірку: `{% if product.compare_at_price > product.price %}` — вона заразом відсікає і `nil`, і нуль, і «знижку» в мінус. Для налаштувань — `| at_least: 1`.',
      },
      {
        type: 'note',
        tone: 'interview',
        title: 'На співбесіді',
        text: '«Що виведе `{{ 10 | divided_by: 4 }}`?» — `2`. Це, мабуть, найпопулярніше питання про фільтри взагалі. Повна відповідь: тип результату визначає дільник; ціле на ціле — ділення націло з відкиданням дробу (для відʼємних — округлення вниз); щоб отримати `2.5`, ділять на `4.0`, а коли дільник — змінна, ділене множать на `1.0`. Продовження зазвичай практичне: «порахуй відсоток знижки» — `compare | minus: price | times: 100.0 | divided_by: compare | round`, обгорнуте в перевірку, що `compare_at_price` більший за ціну, — інакше спіймаєш ділення на нуль.',
      },
    ],
  },

  /* ───────────────────────── downcase ───────────────────────── */
  {
    slug: 'downcase',
    section: 'filters',
    title: 'downcase',
    category: 'string',
    syntax: 'string | downcase',
    summary: 'Переводить усі літери рядка в нижній регістр. Основне застосування — порівняння без урахування регістру.',
    officialUrl: 'https://shopify.github.io/liquid/filters/downcase/',
    related: ['filters/upcase', 'filters/capitalize', 'basics/operators', 'shopify/url-and-html-filters'],
    blocks: [
      {
        type: 'p',
        text: '`downcase` робить усі літери малими. Для оформлення тексту він майже не потрібен — це справа CSS. Його справжня робота — **нормалізація перед порівнянням**: оператори `==` і `contains` у Liquid чутливі до регістру, а теги, вендори й опції люди вводять як заманеться.',
      },
      {
        type: 'example',
        title: 'Базовий випадок',
        template: '{{ "ШАМПУНЬ Keratin PRO" | downcase }}',
        note: 'Кирилиця й латиниця обробляються однаково; цифри й розділові знаки не змінюються.',
      },
      {
        type: 'example',
        title: 'Порівняння без урахування регістру',
        preset: 'product',
        template: `{%- assign vendor = product.vendor | downcase -%}
Вендор у даних: {{ product.vendor }}
{% if product.vendor == "cocochoco" %}збіг напряму{% else %}напряму — не збіг{% endif %}
{% if vendor == "cocochoco" %}збіг після downcase{% endif %}`,
        note: '`"Cocochoco" == "cocochoco"` — хибно. Після `downcase` порівнюємо малі з малими, і неважливо, як вендора записали в адмінці.',
      },
      {
        type: 'note',
        tone: 'warn',
        title: 'Фільтр не можна написати просто в умові',
        text: 'Хочеться `{% if product.vendor | downcase == "cocochoco" %}` — але в тегах `if`, `unless`, `case` фільтри **не працюють**. Значення спершу кладуть у змінну через `assign`, а потім порівнюють змінну. Це стосується всіх фільтрів, просто з `downcase` на це наступають найчастіше.',
      },
      {
        type: 'example',
        title: 'Пошук тегу в будь-якому регістрі',
        data: { tags: ['Догляд', 'ХІТ', 'Кератин'] },
        template: `{%- assign normalized = tags | join: "," | downcase | split: "," -%}
{% if tags contains "хіт" %}знайшов напряму{% else %}напряму — ні{% endif %}
{% if normalized contains "хіт" %}знайшов після нормалізації{% endif %}`,
        note: '`downcase` працює з рядком, а не з масивом. Тому масив склеюють у рядок ([join](/docs/filters/join)), опускають регістр і розбирають назад ([split](/docs/filters/split)).',
      },
      {
        type: 'example',
        title: 'Межові випадки',
        template: '[{{ nothing | downcase }}]\n[{{ 2026 | downcase }}]\n{{ "Cocochoco PRO" | downcase }} ≠ {{ "Cocochoco PRO" | handleize }}',
        note: '`nil` дає порожній рядок, число стає текстом. І `downcase` — **не** спосіб зробити слаг: пробіли й символи лишаються на місці. Для класів, `id` та адрес є `handleize`.',
      },
      {
        type: 'note',
        tone: 'shopify',
        text: 'Де в темах: порівняння назв опцій (`option.name | downcase` → `"color"`, `"колір"`), пошук службових тегів, порівняння `product.type` зі значенням із налаштувань секції, ключі перекладів зі значень даних. Для верхнього регістру в кнопках і бейджах бери CSS `text-transform` — текст у HTML лишиться нормальним для пошуковиків і читалок екрана.',
      },
      {
        type: 'note',
        tone: 'interview',
        title: 'На співбесіді',
        text: '«Як порівняти рядки без урахування регістру?» — оператори Liquid регістрозалежні, тому обидві частини приводять до одного регістру через `downcase`. Ключове уточнення: **фільтри не працюють усередині `{% if %}`**, тож спершу `assign`, потім порівняння. Якщо спитають про масив тегів — `join | downcase | split`, і порівнювати вже з малими літерами.',
      },
    ],
  },

  /* ───────────────────────── escape ───────────────────────── */
  {
    slug: 'escape',
    section: 'filters',
    title: 'escape',
    category: 'string',
    syntax: 'string | escape',
    summary: 'Замінює символи `<`, `>`, `&`, `"` і `\'` на HTML-сутності, щоб текст не міг стати розміткою. Головний захист від XSS у темі.',
    officialUrl: 'https://shopify.github.io/liquid/filters/escape/',
    related: ['filters/escape_once', 'filters/strip_html', 'filters/url_encode', 'shopify/security', 'shopify/liquid-and-js'],
    blocks: [
      {
        type: 'p',
        text: 'Головне, що треба знати про вивід у Liquid: `{{ … }}` **нічого не екранує**. На відміну від React, Twig чи Blade, де небезпечні символи знешкоджуються автоматично, Liquid друкує значення як є. Якщо в ньому є `<script>` — у сторінці буде `<script>`. `escape` перетворює пʼять службових символів HTML на сутності, і браузер показує їх як текст, а не виконує.',
      },
      {
        type: 'example',
        title: 'Базовий випадок',
        template: `{{ "<b>Tom & Jerry</b> сказали \\"привіт\\"" | escape }}`,
        shopifyOutput: '&lt;b&gt;Tom &amp; Jerry&lt;/b&gt; сказали &quot;привіт&quot;',
        note: 'Подвійну лапку пісочниця записує числовою сутністю `&#34;`, Shopify — іменованою `&quot;`. Для браузера це одне й те саме.',
      },
      {
        type: 'table',
        head: ['Символ', 'Стає', 'Чому небезпечний'],
        rows: [
          ['`<`', '`&lt;`', 'відкриває тег'],
          ['`>`', '`&gt;`', 'закриває тег'],
          ['`&`', '`&amp;`', 'починає сутність'],
          ['`"`', '`&quot;`', 'закриває значення атрибута'],
          ['`\'`', '`&#39;`', 'те саме для атрибутів в одинарних лапках'],
        ],
      },
      {
        type: 'example',
        title: 'Відгук зі шкідливим кодом',
        data: { review: '<img src=x onerror="alert(document.cookie)"> Класний шампунь!' },
        template: 'Без фільтра:\n{{ review }}\n\nЗ escape:\n{{ review | escape }}',
        note: 'Перший варіант у справжній сторінці став би тегом `<img>` з обробником, який виконує чужий JavaScript у браузері кожного відвідувача. Другий — просто текст із кутовими дужками.',
      },
      {
        type: 'example',
        title: 'Атрибути — окрема небезпека',
        data: { q: '" autofocus onfocus="alert(1)' },
        template: 'Без фільтра: <input name="q" value="{{ q }}">\nЗ escape:     <input name="q" value="{{ q | escape }}">',
        note: 'Жодного `<script>` — лише лапка. Вона закриває `value`, і решта рядка стає **новими атрибутами** поля. Саме тому `escape` замінює й лапки, і саме так ламають сторінку пошуку, де запит підставляють у поле.',
      },
      { type: 'h', text: 'Що екранувати, а що ні' },
      {
        type: 'table',
        head: ['Дані', 'Що робити', 'Чому'],
        rows: [
          ['`search.terms`, параметри з URL', '**завжди** `escape`', 'це пише відвідувач, і посилання з «начинкою» можна надіслати жертві'],
          ['`cart.note`, властивості позицій кошика, `customer.name`, текст із форм', '**завжди** `escape`', 'введено покупцем'],
          ['`product.title`, `collection.title`, `image.alt`, текстові налаштування', '`escape`', 'простий текст від менеджера: амперсанд чи лапка в назві зламають розмітку, надто в атрибутах'],
          ['`product.description`, `article.content`, `page.content`, налаштування `richtext`', '**не** екранувати', 'це HTML навмисно — після `escape` покупець побачить теги текстом'],
          ['значення для JavaScript', '`json`, не `escape`', 'HTML-сутності всередині `<script>` не розкодовуються'],
          ['значення для адреси', '`url_encode`', 'в URL свої правила кодування'],
        ],
      },
      {
        type: 'example',
        title: 'Межові випадки',
        preset: 'product',
        template: '[{{ nothing | escape }}]\n[{{ 2026 | escape }}]\n{{ product.description | escape }}\n{{ product.description | strip_html | escape }}',
        note: '`nil` — порожній рядок, число — текст. Третій рядок показує, що буде, якщо заекранувати HTML-опис: теги стали видимим текстом. Для мета-опису чи `title` потрібен чистий текст — спершу [strip_html](/docs/filters/strip_html), потім `escape`.',
      },
      {
        type: 'note',
        tone: 'shopify',
        title: 'Коли Shopify екранує сам',
        text: 'У звичайному виводі `{{ }}` — **ніколи**. Винятки — фільтри, які самі будують HTML: `image_tag` екранує `alt` та інші атрибути, а фільтр перекладу `t` екранує **підставлені змінні** (`{{ "cart.greeting" | t: name: customer.first_name }}`), якщо ключ перекладу не закінчується на `_html`. Усе, що ти вставляєш у розмітку власноруч, — твоя відповідальність. У Dawn `| escape` стоїть біля кожного `product.title`, і це не параноя, а стандарт.',
      },
      {
        type: 'note',
        tone: 'warn',
        title: 'Подвійне екранування',
        text: 'Якщо заекранувати вже заекранований рядок, `&amp;` перетвориться на `&amp;amp;`, і покупець побачить на сторінці `&amp;` замість `&`. Так стається, коли значення екранують і перед передачею в сніпет, і всередині сніпета. Домовленість проста: екрануємо **один раз, у місці виводу**. Для даних, про які невідомо, чи вони вже заекрановані, є [escape_once](/docs/filters/escape_once).',
      },
      {
        type: 'note',
        tone: 'interview',
        title: 'На співбесіді',
        text: '«Як захистити тему від XSS?» Каркас відповіді: Liquid не екранує вивід автоматично, тому все, що не є навмисним HTML, виводиться через `| escape` — насамперед те, що контролює відвідувач: `search.terms`, нотатка й властивості кошика, дані форм. В атрибутах екранування обовʼязкове завжди, бо там досить однієї лапки. Дані в JavaScript передають через `| json`, а не `escape`. HTML-поля (`description`, `content`, `richtext`) не екранують — їм довіряємо, бо редагує їх лише персонал магазину. Згадка про `escape_once` і про `_html`-ключі перекладів — ознака досвіду.',
      },
    ],
  },

  /* ───────────────────────── escape_once ───────────────────────── */
  {
    slug: 'escape_once',
    section: 'filters',
    title: 'escape_once',
    category: 'string',
    syntax: 'string | escape_once',
    summary: 'Екранує HTML так само, як `escape`, але не чіпає сутності, які вже є в рядку. Рятує від `&amp;amp;`.',
    officialUrl: 'https://shopify.github.io/liquid/filters/escape_once/',
    related: ['filters/escape', 'filters/strip_html', 'shopify/security'],
    blocks: [
      {
        type: 'p',
        text: '[escape](/docs/filters/escape) — фільтр прямолінійний: бачить `&` — замінює на `&amp;`, навіть якщо цей амперсанд уже був частиною `&amp;`. `escape_once` уважніший: готові сутності (`&amp;`, `&lt;`, `&#39;`) він **пропускає**, а екранує лише «сирі» символи. Результат: скільки разів його не застосуй, рядок заекрановано рівно один раз.',
      },
      {
        type: 'example',
        title: 'escape двічі проти escape_once',
        template:
          'Оригінал: {{ "Догляд & стайлінг" }}\nescape: {{ "Догляд & стайлінг" | escape }}\nescape двічі: {{ "Догляд & стайлінг" | escape | escape }}\nescape + escape_once: {{ "Догляд & стайлінг" | escape | escape_once }}',
        note: 'Третій рядок у браузері виглядатиме як «Догляд &amp;amp; стайлінг» → на екрані `&amp;`. Четвертий — правильний, хоч фільтрів теж два.',
      },
      {
        type: 'example',
        title: 'Змішаний рядок',
        data: { title: 'Догляд &amp; стайлінг <b>-20%</b>' },
        template: 'escape:      {{ title | escape }}\nescape_once: {{ title | escape_once }}',
        note: 'У рядку водночас і готова сутність, і сирі кутові дужки. `escape` зіпсував `&amp;`, `escape_once` заекранував лише `<b>`. Саме для таких «напівчистих» даних фільтр і придумали.',
      },
      {
        type: 'example',
        title: 'Межові випадки',
        template: '[{{ nothing | escape_once }}]\n{{ "1 &lt; 2 & 3 > 2" | escape_once }}\n{{ "AT&T; і &nbsp;" | escape_once }}',
        note: '`nil` — порожній рядок. В останньому рядку `&nbsp;` лишився, бо це справжня сутність, а от на `&T;` подивись сам: фільтр розпізнає сутність за **формою** (`&` + літери + `;`), а не за словником.',
      },
      { type: 'h', text: 'Коли який' },
      {
        type: 'table',
        head: ['Ситуація', 'Фільтр'],
        rows: [
          ['Сирі дані з Shopify: `product.title`, `search.terms`, `cart.note`', '`escape`'],
          ['Дані, які могли заекранувати раніше: текст із застосунку, імпортований каталог, метаполе, заповнене через API', '`escape_once`'],
          ['Сніпет, який отримує рядок параметром і не знає, чи екранували його зовні', '`escape_once`'],
          ['Навмисний HTML (`description`, `richtext`)', 'жоден'],
        ],
      },
      {
        type: 'note',
        tone: 'warn',
        title: 'Це не «безпечніший escape»',
        text: 'Рефлекс «ставлю всюди `escape_once`, щоб напевно» — поганий. По-перше, він ховає безлад: якщо ти не знаєш, заекрановані дані чи ні, це проблема конвеєра даних, а не фільтра. По-друге, якщо в тексті сутність має бути **видимою** (стаття про HTML, де написано `&amp;`), `escape_once` її не чіпатиме, і браузер покаже `&` замість `&amp;`. Правило лишається тим самим: екрануємо один раз, у місці виводу, звичайним `escape`.',
      },
      {
        type: 'note',
        tone: 'shopify',
        text: 'Типове джерело вже заекранованих рядків — не сам Shopify, а те, що навколо: CSV-імпорт зі старої платформи, де в назвах лишились `&amp;` і `&quot;`, застосунки відгуків, метаполя, які пише зовнішній сервіс. У власних сніпетах трапляється й так: батьківський шаблон зробив `| escape` перед `{% render %}`, а сніпет екранує ще раз.',
      },
      {
        type: 'note',
        tone: 'interview',
        title: 'На співбесіді',
        text: '«Чим `escape_once` відрізняється від `escape`?» — він не екранує повторно те, що вже є HTML-сутністю, тому не дає `&amp;amp;`. Далі питають «а коли він потрібен?»: коли джерело даних не гарантує, сирі вони чи вже заекрановані, — імпорт, сторонні застосунки, рядок, що пройшов через кілька сніпетів. І добре додати, що це латка: у здоровій темі екранування відбувається один раз у місці виводу, і звичайного `escape` досить.',
      },
    ],
  },

  /* ───────────────────────── find ───────────────────────── */
  {
    slug: 'find',
    section: 'filters',
    title: 'find',
    category: 'array',
    syntax: 'array | find: string, string',
    summary: 'Повертає **перший** елемент масиву, в якого властивість дорівнює заданому значенню. Не знайшов — `nil`.',
    officialUrl: 'https://shopify.dev/docs/api/liquid/filters/find',
    related: ['filters/find_index', 'filters/where', 'filters/first', 'filters/has', 'filters/default'],
    blocks: [
      {
        type: 'p',
        text: '`find` шукає в масиві обʼєктів один — перший, що підходить. Перший аргумент — **імʼя властивості**, другий — **значення**, якому вона має дорівнювати. На відміну від [where](/docs/filters/where), який повертає масив усіх збігів, `find` віддає сам обʼєкт — одразу можна звертатись до його полів.',
      },
      {
        type: 'example',
        title: 'Базовий випадок',
        preset: 'collection',
        template: '{% assign oil = collection.products | find: "handle", "ends-oil" %}\n{{ oil.title }} — {{ oil.price | money }}',
        note: 'Результат кладемо в змінну через `assign`: це цілий обʼєкт товару, з яким далі працюємо як зі звичайним `product`.',
      },
      {
        type: 'example',
        title: 'Значення — не лише рядок',
        preset: 'product',
        template:
          '{% assign sold_out = product.variants | find: "available", false %}\nНемає в наявності: {{ sold_out.title }}\n\n{% assign by_number = product.variants | find: "id", 12 %}\n{% assign by_string = product.variants | find: "id", "12" %}\nЧислом: [{{ by_number.title }}]\nРядком: [{{ by_string.title }}]',
        note: 'Шукати можна за булевим значенням і за числом. Але порівняння **суворе**: `id` у даних — число, тож рядок `"12"` нічого не знайде. Це реальна пастка, коли ідентифікатор приходить із налаштування чи з URL і є рядком.',
      },
      {
        type: 'example',
        title: 'Нічого не знайдено',
        preset: 'collection',
        template:
          '{% assign gift = collection.products | find: "type", "Сертифікат" %}\n[{{ gift.title }}]\n{{ gift.title | default: "Такого товару немає" }}\n{% if gift %}є{% else %}gift — це nil{% endif %}',
        note: 'Помилки немає: `find` повертає `nil`, звернення до поля `nil` дає порожнечу. Далі працює або [default](/docs/filters/default), або звичайна перевірка в `{% if %}`.',
      },
      { type: 'h', text: 'find проти where | first' },
      {
        type: 'example',
        title: 'Два записи одного й того самого',
        preset: 'collection',
        template:
          '{% assign a = collection.products | find: "vendor", "Inoar" %}\n{% assign b = collection.products | where: "vendor", "Inoar" | first %}\n{{ a.title }}\n{{ b.title }}',
      },
      {
        type: 'table',
        head: ['', '`find`', '`where … | first`'],
        rows: [
          ['Що повертає', 'один обʼєкт або `nil`', 'масив → перший елемент або `nil`'],
          ['Як працює', 'зупиняється на першому збігу', 'проходить масив до кінця, збирає всі збіги, потім бере перший'],
          ['Намір у коді', 'видно одразу: «мені потрібен один»', 'треба дочитати ланцюжок до кінця'],
          ['Де зустрінеш', 'нові теми', 'майже всі теми, написані до появи `find`'],
        ],
      },
      {
        type: 'note',
        tone: 'warn',
        title: 'find бачить лише те, що вже в масиві',
        text: '`collection.products | find: …` шукає **не по всій колекції**, а по тих товарах, які Shopify віддав у цей масив, — поза `{% paginate %}` це перші 50. Товар номер 51 не знайдеться, і жодної помилки не буде. Якщо потрібен конкретний товар за handle, бери його напряму: `all_products["ends-oil"]` або налаштування типу `product`.',
      },
      {
        type: 'note',
        tone: 'shopify',
        text: 'Де зручно: знайти варіант за `id` з URL чи за значенням опції, блок секції за типом (`section.blocks | find: "type", "price"`), пункт меню за адресою, метаобʼєкт у списку за ключем. `find` зʼявився в Liquid відносно недавно, разом із [find_index](/docs/filters/find_index), [has](/docs/filters/has) і [reject](/docs/filters/reject), тож у старших темах на його місці стоїть `where | first` або цикл із `{% break %}`.',
      },
      {
        type: 'note',
        tone: 'interview',
        title: 'На співбесіді',
        text: '«Як дістати з масиву один обʼєкт за значенням поля?» — `find: "властивість", значення`; раніше писали `where: … | first` або `for` з `break`. Що варто проговорити: `find` повертає обʼєкт, а не масив; якщо збігу немає — `nil`, тож результат перевіряють або страхують `default`; порівняння суворе за типом (`12` ≠ `"12"`); пошук іде лише по завантаженій частині масиву — до 50 елементів без пагінації.',
      },
    ],
  },

  /* ───────────────────────── find_index ───────────────────────── */
  {
    slug: 'find_index',
    section: 'filters',
    title: 'find_index',
    category: 'array',
    syntax: 'array | find_index: string, string',
    summary: 'Повертає індекс (від нуля) першого елемента, в якого властивість дорівнює значенню. Не знайшов — `nil`.',
    officialUrl: 'https://shopify.dev/docs/api/liquid/filters/find_index',
    related: ['filters/find', 'filters/where', 'filters/has', 'filters/plus', 'basics/truthy-and-falsy'],
    blocks: [
      {
        type: 'p',
        text: '`find_index` — брат [find](/docs/filters/find): ті самі аргументи, той самий пошук, але повертає він не обʼєкт, а його **позицію в масиві**. Позиція потрібна, коли цікавить не сам елемент, а його сусіди або порядковий номер: «попередній / наступний товар», «варіант 2 із 3», «активний слайд».',
      },
      {
        type: 'example',
        title: 'Базовий випадок',
        preset: 'collection',
        template:
          '{{ collection.products | find_index: "handle", "keratin-shampoo" }}\n{{ collection.products | find_index: "handle", "ends-oil" }}\n[{{ collection.products | find_index: "handle", "no-such-product" }}]',
        note: 'Лічба — **з нуля**, як у `forloop.index0` і в доступі `array[0]`. Перший товар має індекс `0`, четвертий — `3`. Якщо збігу немає, повертається `nil` — порожній вивід, а не `-1`, як у JavaScript.',
      },
      {
        type: 'example',
        title: 'Попередній і наступний товар',
        preset: 'collection',
        template: `{%- assign i = collection.products | find_index: "handle", "deep-repair-mask" -%}
{%- assign prev_i = i | minus: 1 -%}
{%- assign next_i = i | plus: 1 -%}
← {{ collection.products[prev_i].title }}
→ {{ collection.products[next_i].title }}`,
        note: 'Індекс — звичайне число: до нього застосовні [plus](/docs/filters/plus) і [minus](/docs/filters/minus), а результат іде у квадратні дужки. Для першого елемента `prev_i` стане `-1` — а відʼємний індекс у Liquid рахується з кінця масиву, тож перед виводом «попереднього» перевіряй `i > 0`.',
      },
      {
        type: 'example',
        title: 'Порядковий номер для людини',
        preset: 'product',
        template:
          '{% assign i = product.variants | find_index: "title", "400 мл" %}\nВаріант {{ i | plus: 1 }} із {{ product.variants.size }}',
        note: 'Людям рахують з одиниці, тож до індексу додаємо 1.',
      },
      {
        type: 'example',
        title: 'Індекс 0 — це «знайдено»',
        preset: 'collection',
        template: `{%- assign first_i = collection.products | find_index: "handle", "keratin-shampoo" -%}
{%- assign none_i = collection.products | find_index: "handle", "no-such-product" -%}
{% if first_i %}індекс {{ first_i }}: знайдено{% else %}не знайдено{% endif %}
{% if none_i %}знайдено{% else %}nil: не знайдено{% endif %}`,
        note: 'У JavaScript `if (index)` для нульового індексу дав би `false` — класичний баг. У Liquid **`0` — truthy**, falsy лише `nil` і `false`. Тому `{% if i %}` — коректна перевірка «чи знайшлося», навіть для першого елемента.',
      },
      {
        type: 'note',
        tone: 'warn',
        title: 'nil у математиці стає нулем',
        text: 'Якщо елемент не знайдено й ти без перевірки пишеш `{{ i | plus: 1 }}`, отримаєш `1`: `nil` у математичних фільтрах — це `0`. Сторінка бадьоро покаже «Варіант 1 із 3» для варіанта, якого не існує. Спершу `{% if i %}`, потім арифметика.',
      },
      {
        type: 'note',
        tone: 'shopify',
        text: 'Сценарії в темах: стартовий слайд галереї (`product.media | find_index: "id", variant.featured_media.id`), номер поточного кроку в списку блоків секції, позиція пункту меню для підсвічування сусідів. Якщо позиція потрібна **всередині циклу** по тому самому масиву — `find_index` зайвий, там уже є `forloop.index0`.',
      },
      {
        type: 'note',
        tone: 'interview',
        title: 'На співбесіді',
        text: 'Саме про `find_index` питають рідко, але він добре розкриває тему truthy/falsy. Питання-пастка: «`find_index` повернув `0` — що зробить `{% if index %}`?» Гілка **виконається**: у Liquid falsy лише `nil` і `false`, а `0`, порожній рядок і порожній масив — truthy. Хто приходить із JavaScript, тут помиляється. Додай, що за відсутності збігу повертається `nil`, а не `-1`.',
      },
    ],
  },

  /* ───────────────────────── first ───────────────────────── */
  {
    slug: 'first',
    section: 'filters',
    title: 'first',
    category: 'array',
    syntax: 'array | first',
    summary: 'Повертає перший елемент масиву. Існує і як фільтр (`| first`), і як властивість через крапку (`.first`).',
    officialUrl: 'https://shopify.github.io/liquid/filters/first/',
    related: ['filters/last', 'filters/find', 'filters/where', 'filters/slice', 'tags/iteration'],
    blocks: [
      {
        type: 'p',
        text: '`first` дістає з масиву перший елемент. Особливість у тому, що записати це можна двома способами: фільтром `{{ array | first }}` і через крапку — `{{ array.first }}`. Результат однаковий, а от **місця, де кожен запис дозволений, різні** — і про це люблять питати.',
      },
      {
        type: 'example',
        title: 'Два записи',
        preset: 'product',
        template: '{{ product.tags | first }}\n{{ product.tags.first }}\n{{ product.variants.first.title }}',
        note: 'Через крапку зручно йти далі вглиб: `product.variants.first.title`. З фільтром так не вийде — `{{ product.variants | first.title }}` не спрацює, довелося б спершу робити `assign`.',
      },
      { type: 'h', text: 'Коли що' },
      {
        type: 'table',
        head: ['Ситуація', 'Запис', 'Чому'],
        rows: [
          ['Всередині `{% if %}`, `{% case %}`, `{% for %}`', '`.first`', 'у тегах фільтри не працюють'],
          ['Потрібне поле першого елемента', '`.first.title`', 'крапку можна продовжити, фільтр — ні'],
          ['Перший елемент **результату інших фільтрів**', '`| first`', 'у ланцюжку `where`, `sort`, `split` крапку поставити нікуди'],
        ],
      },
      {
        type: 'example',
        title: 'Крапка — в умові, фільтр — у ланцюжку',
        preset: 'collection',
        template: `{% if collection.products.first.available %}Перший товар у наявності{% endif %}

{% assign cheapest = collection.products | sort: "price" | first %}
Найдешевший: {{ cheapest.title }} — {{ cheapest.price | money }}

{% assign first_word = "Шампунь із кератином" | split: " " | first %}
Перше слово: {{ first_word }}`,
        note: '`sort … | first` — стандартний спосіб знайти мінімум, а [last](/docs/filters/last) у тому самому ланцюжку — максимум.',
      },
      {
        type: 'example',
        title: 'Порожній масив і nil',
        data: { empty_list: [] },
        template:
          '[{{ empty_list | first }}]\n[{{ empty_list.first }}]\n[{{ nothing | first }}]\n[{{ nothing.first.title }}]\n{{ empty_list.first.title | default: "Товарів немає" }}',
        note: 'Жодної помилки: порожній масив і `nil` дають `nil`, а ланцюжок крапок через `nil` просто повертає порожнечу. Зручно, але підступно: помилка в імені змінної виглядає так само, як порожні дані.',
      },
      {
        type: 'note',
        tone: 'warn',
        title: 'first — для масивів, не для рядків',
        text: 'Спокуса взяти першу літеру імені через `{{ customer.first_name | first }}` зрозуміла, але `first` задуманий для масивів, і на рядку реалізації Liquid поводяться по-різному — навіть у цій пісочниці фільтр і крапка дадуть різне. Перший символ рядка надійно бере [slice](/docs/filters/slice): `{{ customer.first_name | slice: 0 }}`.',
      },
      {
        type: 'note',
        tone: 'shopify',
        text: 'У темах: `product.images.first` (хоча для головного фото є `product.featured_image`), `product.variants.first`, `collection.products.first`, `customer.orders.first` — останнє замовлення, бо вони відсортовані від нових. Обережно з `product.variants.first`: перший варіант може бути **розпроданий**. Для ціни й кнопки «Купити» беруть `product.selected_or_first_available_variant` — він враховує і `?variant=` в адресі, і наявність.',
      },
      {
        type: 'note',
        tone: 'interview',
        title: 'На співбесіді',
        text: '«Чим `array.first` відрізняється від `array | first`?» — результатом нічим, різниця в тому, де їх можна написати. Крапка працює всюди, де працює звернення до властивості, — зокрема в `{% if %}`, куди фільтр не поставиш, — і дозволяє йти далі: `.first.title`. Фільтр потрібен у кінці ланцюжка: `where … | first`, `sort … | first`. Разом із `last` і `size` це три «властивості-фільтри» Liquid. Бонус: для «першого, що відповідає умові» тепер є [find](/docs/filters/find).',
      },
    ],
  },

  /* ───────────────────────── floor ───────────────────────── */
  {
    slug: 'floor',
    section: 'filters',
    title: 'floor',
    category: 'math',
    syntax: 'number | floor',
    summary: 'Округлює число вниз до найближчого цілого.',
    officialUrl: 'https://shopify.github.io/liquid/filters/floor/',
    related: ['filters/ceil', 'filters/round', 'filters/divided_by', 'filters/modulo'],
    blocks: [
      {
        type: 'p',
        text: '`floor` («підлога») відкидає дробову частину, округлюючи **вниз**: `1.9` → `1`. Він відповідає на питання «скільки **повних** штук уміщається»: повних зірок у рейтингу, повних місяців, повних сотень гривень у сумі, за які нараховуються бонуси.',
      },
      {
        type: 'example',
        title: 'Базовий випадок',
        template: '{{ 1.2 | floor }}\n{{ 183.957 | floor }}\n{{ 2.0 | floor }}\n{{ -1.2 | floor }}',
        note: 'Навіть `183.957` стає `183` — близькість до наступного цілого нічого не важить. Відʼємне число йде **вниз по осі**, тобто від нуля: `-1.2` → `-2`. Це не «відкинути дріб» — так вийшло б `-1`.',
      },
      {
        type: 'example',
        title: 'Зірки рейтингу',
        data: { rating: 4.7 },
        template: `{%- assign full = rating | floor -%}
{%- assign rest = 5 | minus: full -%}
{% for i in (1..full) %}★{% endfor %}{% for i in (1..rest) %}☆{% endfor %} {{ rating }}
floor: {{ rating | floor }} · round: {{ rating | round }} · ceil: {{ rating | ceil }}`,
        note: 'Для 4.7 `round` і `ceil` намалювали б пʼять зірок — і магазин «прикрасив» би рейтинг. `floor` показує лише чесно зароблені.',
      },
      {
        type: 'example',
        title: 'floor і ділення',
        template: '{{ 95 | divided_by: 30 }}\n{{ 95 | divided_by: 30.0 }}\n{{ 95 | divided_by: 30.0 | floor }}',
        note: 'Для додатних чисел ділення цілого на ціле — це вже `floor`: перший і третій рядки однакові. Окремий `floor` потрібен, коли число **вже дробове** — рейтинг із метаполя, результат ділення на дробове, вага.',
      },
      {
        type: 'example',
        title: 'Прибрати «.0»',
        template: '{{ 4.0 | times: 2 }}\n{{ 4.0 | times: 2 | floor }}',
        shopifyOutput: '8.0\n8',
        note: 'Shopify памʼятає, що число було дробовим, і друкує `8.0`. `floor` (як і `round` чи `ceil`) повертає **ціле**, і хвіст зникає. Пісочниця цієї різниці не показує — у JavaScript `8.0` і `8` однакові.',
      },
      {
        type: 'example',
        title: 'Рядки, nil і сміття',
        template: '{{ "3.9" | floor }}\n[{{ nothing | floor }}]\n{{ "багато" | floor }}',
        note: 'Рядок із числом приводиться до числа, решта стає `0` без помилки.',
      },
      {
        type: 'note',
        tone: 'warn',
        title: 'floor — не форматування грошей',
        text: '`{{ product.price | divided_by: 100.0 | floor }} ₴` виглядає як спосіб показати ціну без копійок, але він мовчки **відрізає** копійки (649,90 → 649) і не ставить роздільників тисяч. Для цін є `money_without_trailing_zeros` та інші [грошові фільтри](/docs/shopify/money-filters).',
      },
      {
        type: 'note',
        tone: 'shopify',
        text: 'У темах `floor` живе поруч із рейтингами (метаполе `reviews.rating` — дробове), бонусними балами («1 бал за кожні повні 100 ₴»), переведенням грамів у кілограми й днів у місяці. Якщо вихідні числа цілі — часто досить самого [divided_by](/docs/filters/divided_by).',
      },
      {
        type: 'note',
        tone: 'interview',
        title: 'На співбесіді',
        text: '«`floor`, `ceil`, `round` — у чому різниця?» — вниз, угору, до найближчого; `round` ще й приймає кількість знаків після коми, а `floor` і `ceil` — ні. Сильніше звучить приклад вибору: зірки рейтингу — `floor`, кількість сторінок — `ceil`, відсоток знижки — `round`. І нюанс про відʼємні: `-1.2 | floor` дає `-2`, бо «вниз» — це до мінус нескінченності, а не до нуля.',
      },
    ],
  },
]
