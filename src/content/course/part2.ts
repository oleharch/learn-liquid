import type { Lesson } from '../types'

/** Формат грошей для завдань на власних даних (без пресета): той самий, що в магазині «Liquid Lab». */
const shopUah = { money_format: '{{amount}} ₴' }

/* ═══════════════════════ l06 · Цикл for ═══════════════════════ */

const l06: Lesson = {
  id: 'l06',
  module: 2,
  title: 'Цикл for: параметри й обʼєкт forloop',
  goal: 'Перебирати масиви й діапазони, керувати проходом через `limit`, `offset` і `reversed`, а нумерацію, роздільники й класи розставляти за допомогою `forloop`.',
  minutes: 30,
  blocks: [
    {
      type: 'p',
      text: 'У Liquid рівно один цикл загального призначення — `for`. Немає `while`, немає `for (let i = 0; …)`, немає способу крутити лічильник вручну. Це не бідність мови, а запобіжник: шаблон рендериться на сервері Shopify на кожен запит, і цикл, який може не закінчитись, поклав би магазин. `for` завжди йде по **скінченній** колекції — масиву або діапазону чисел — і тому гарантовано зупиняється.',
    },
    {
      type: 'example',
      title: 'Перебір масиву',
      template: `<ul>
{% for tag in tags %}
  <li>{{ tag }}</li>
{% endfor %}
</ul>`,
      data: { tags: ['догляд', 'кератин', 'хіт'] },
      view: 'html',
      note: 'Змінна `tag` — чергове значення масиву, як у `for (const tag of tags)`. Імʼя довільне, але в темах заведено: колекція в множині, змінна в одиничному — `product in collection.products`.',
    },
    {
      type: 'p',
      text: 'Аналогія з `for…of` працює до першого `assign`. У JS `let` усередині циклу помирає разом з ітерацією. У Liquid блочної області видимості немає: змінна, створена через `assign` у тілі циклу, **лишається жити після `endfor`** з останнім значенням. А от сама змінна циклу (`tag`) і обʼєкт `forloop` за межами циклу вже порожні.',
    },
    { type: 'h', text: 'Діапазон замість масиву' },
    {
      type: 'example',
      title: 'Діапазон `(від..до)`',
      template: `Рейтинг: {% for i in (1..max) %}{% if i <= rating %}★{% else %}☆{% endif %}{% endfor %}
Сторінки: {% for page in (1..3) %}[{{ page }}] {% endfor %}`,
      data: { rating: 4, max: 5 },
      note: 'Обидві межі **входять** у діапазон: `(1..5)` — це пʼять ітерацій, а не чотири. Межею може бути число, змінна або властивість: `(1..product.variants.size)`. Дужки обовʼязкові.',
    },
    {
      type: 'note',
      tone: 'warn',
      title: 'Діапазон рахує лише вгору',
      text: '`(5..1)` не піде у зворотний бік — цикл просто не виконається жодного разу й нічого не виведе, без жодної помилки. Потрібен зворотний відлік — пиши `(1..5) reversed`.',
    },
    { type: 'h', text: 'Параметри: limit, offset, reversed' },
    {
      type: 'example',
      title: 'Частина колекції',
      template: `усі:               {% for p in products %}{{ p }} {% endfor %}
limit: 3           {% for p in products limit: 3 %}{{ p }} {% endfor %}
offset: 2          {% for p in products offset: 2 %}{{ p }} {% endfor %}
limit + offset:    {% for p in products limit: 2 offset: 1 %}{{ p }} {% endfor %}
reversed:          {% for p in products reversed %}{{ p }} {% endfor %}
reversed limit: 2  {% for p in products reversed limit: 2 %}{{ p }} {% endfor %}`,
      data: { products: ['Шампунь', 'Маска', 'Спрей', 'Олійка', 'Бальзам', 'Сироватка'] },
      note: '`limit` — скільки взяти, `offset` — скільки пропустити спочатку. Разом це `products.slice(offset, offset + limit)` із JS. Сам масив не змінюється — параметри діють лише на цей прохід. А тепер подивись на останній рядок.',
    },
    {
      type: 'note',
      tone: 'warn',
      title: 'Пастка: reversed спрацьовує останнім',
      text: 'Порядок завжди один: спершу `offset`, потім `limit`, і лише тоді `reversed`. Тому `reversed limit: 2` дає не «два останні товари», а **два перші у зворотному порядку**. Потрібні саме останні — розверни масив фільтром [reverse](/docs/filters/reverse) ще до циклу або порахуй `offset` від `products.size`. І пиши `reversed` одразу після колекції, перед `limit` та `offset` — саме такий запис описано в документації.',
    },
    { type: 'h', text: 'Обʼєкт forloop' },
    {
      type: 'p',
      text: 'Лічильника `i` у тебе немає, зате всередині кожного циклу автоматично зʼявляється обʼєкт `forloop` — він знає, де ти зараз і скільки ще лишилось.',
    },
    {
      type: 'table',
      head: ['Властивість', 'Що містить', 'Для чого'],
      rows: [
        ['`forloop.index`', 'номер ітерації, рахунок з 1', 'нумерація для людей'],
        ['`forloop.index0`', 'номер ітерації, рахунок з 0', '`data-index`, затримка анімації, індекс масиву'],
        ['`forloop.rindex`, `forloop.rindex0`', 'скільки ітерацій до кінця (з 1 / з 0)', '«ще 3 товари», зворотна нумерація'],
        ['`forloop.first`, `forloop.last`', '`true` на першій / останній ітерації', 'класи, роздільники'],
        ['`forloop.length`', 'скільки всього ітерацій у ЦЬОМУ проході', '«2 з 5»'],
        ['`forloop.parentloop`', '`forloop` зовнішнього циклу', 'вкладені цикли (див. нижче)'],
      ],
    },
    {
      type: 'example',
      title: 'Нумерація й позиція',
      template: `{% for step in steps %}
  {{ forloop.index }}/{{ forloop.length }} {{ step }}{% if forloop.first %} ← старт{% endif %}{% if forloop.last %} ← фініш{% endif %} (лишилось {{ forloop.rindex0 }})
{% endfor %}`,
      data: { steps: ['Діагностика', 'Миття', 'Нанесення складу', 'Запаювання'] },
    },
    {
      type: 'example',
      title: 'Роздільник без хвоста',
      template: `Теги: {% for tag in tags %}<a href="/collections/all/{{ tag }}">{{ tag }}</a>{% unless forloop.last %}, {% endunless %}{% endfor %}`,
      data: { tags: ['догляд', 'кератин', 'хіт'] },
      view: 'html',
      note: 'Кома ставиться після кожного елемента, **крім останнього**. Для простих рядків вистачило б фільтра `join`, але тут кожен елемент — шматок розмітки, і `join` уже не допоможе. Це найчастіше застосування `forloop.last` у темах: теги, хлібні крихти, автори статті.',
    },
    {
      type: 'note',
      tone: 'warn',
      title: 'forloop.length — це не розмір масиву',
      text: 'Він рахує ітерації саме цього проходу — вже після `limit` та `offset`. У циклі з `limit: 4` по колекції з 20 товарів `forloop.length` дорівнює 4, і `forloop.last` спрацює на четвертому товарі. Потрібен розмір усього масиву — бери `products.size`.',
    },
    { type: 'h', text: 'Вкладені цикли' },
    {
      type: 'example',
      title: 'Номер групи всередині вкладеного циклу',
      template: `{% for group in menu %}
  {% assign group_no = forloop.index %}
  {{ group_no }}. {{ group.title }}
  {% for link in group.links %}
    {{ group_no }}.{{ forloop.index }} {{ link }}
  {% endfor %}
{% endfor %}`,
      data: {
        menu: [
          { title: 'Каталог', links: ['Шампуні', 'Маски', 'Стайлінг'] },
          { title: 'Про нас', links: ['Студія', 'Контакти'] },
        ],
      },
      note: 'Усередині внутрішнього циклу `forloop` — це вже **внутрішній** лічильник: зовнішній він затуляє. Тому номер групи збережено в змінну ще до входу у вкладений цикл.',
    },
    {
      type: 'code',
      lang: 'liquid',
      title: 'Те саме через forloop.parentloop (Shopify)',
      code: `{% for group in menu %}
  {% for link in group.links %}
    {{ forloop.parentloop.index }}.{{ forloop.index }} {{ link }}
  {% endfor %}
{% endfor %}`,
    },
    {
      type: 'note',
      tone: 'shopify',
      text: '`forloop.parentloop` віддає `forloop` зовнішнього циклу, тож проміжна змінна не обовʼязкова. На верхньому рівні `parentloop` порожній — це не помилка, батьківського циклу там просто немає. Ще одне обмеження Shopify, якого тут не відчуєш: цикл `for` робить **щонайбільше 50 ітерацій**. Товарів у колекції більше — потрібен тег `paginate` ([урок 16](/learn/l16)).',
    },
    {
      type: 'note',
      tone: 'interview',
      title: 'На співбесіді',
      text: '«Як вивести товари з другого по пʼятий?» — `offset: 1 limit: 4`. «Як поставити кому між елементами, але не в кінці?» — `{% unless forloop.last %}`. «Чим `index` відрізняється від `index0` і що таке `rindex`?» Сильна відповідь додає нюанси: `reversed` застосовується вже після `limit` та `offset`, `forloop.length` ці параметри враховує, змінна з `assign` переживає цикл, а в Shopify `for` обмежений 50 ітераціями, тому великі колекції перебирають через `paginate`.',
    },
  ],
  exercises: [
    {
      id: 'l06-e1',
      title: 'Список тегів',
      task: [
        'У змінній `tags` — масив тегів товару. Виведи маркований список: усередині `<ul>` для кожного тега свій `<li>` з нового рядка.',
        'Для тегів «догляд», «кератин», «хіт» має вийти три пункти `<li>догляд</li>`, `<li>кератин</li>`, `<li>хіт</li>`. Прихована перевірка підставить інший масив — іншої довжини.',
      ],
      starter: `<ul>
  {% comment %} Пройдись циклом по tags і виведи кожен тег у <li> {% endcomment %}
</ul>`,
      solution: `<ul>
  {% for tag in tags %}
    <li>{{ tag }}</li>
  {% endfor %}
</ul>`,
      data: { tags: ['догляд', 'кератин', 'хіт'] },
      altData: { tags: ['стайлінг', 'термозахист', 'новинка', 'веган'] },
      mustUse: [{ pattern: '\\{%-?\\s*for\\b', label: 'Використай цикл `for`' }],
      hints: [
        'Цикл має форму `{% for змінна in масив %} … {% endfor %}`. Усе між тегами повториться для кожного елемента.',
        'Усередині циклу поточний тег доступний під іменем, яке ти дав змінній: `{{ tag }}`.',
        '`{% for tag in tags %}<li>{{ tag }}</li>{% endfor %}` — лишилось поставити це всередину `<ul>`, кожен `<li>` з нового рядка.',
      ],
      explain: 'Розмітка в тілі циклу повторюється стільки разів, скільки елементів у масиві, — саме тому список не можна «набрати руками»: у реальній темі ти не знаєш, скільки тегів у товару. `<ul>` стоїть ЗОВНІ циклу: якби він був усередині, кожен тег отримав би власний список.',
      view: 'html',
    },
    {
      id: 'l06-e2',
      title: 'Номери сторінок',
      task: [
        'Є `total_pages` — кількість сторінок каталогу і `current` — номер поточної. Виведи номери всіх сторінок через пробіл, а поточну візьми у квадратні дужки.',
        'Для `total_pages = 5` і `current = 3` результат: `1 2 [3] 4 5`.',
      ],
      starter: `{% comment %} Діапазон від 1 до total_pages; поточну сторінку — в [дужки] {% endcomment %}
1 2 [3] 4 5`,
      solution: `{% for page in (1..total_pages) %}{% if page == current %}[{{ page }}]{% else %}{{ page }}{% endif %} {% endfor %}`,
      data: { total_pages: 5, current: 3 },
      altData: { total_pages: 3, current: 1 },
      mustUse: [{ pattern: '\\(\\s*1\\s*\\.\\.', label: 'Використай діапазон `(1..total_pages)`' }],
      hints: [
        'Масиву сторінок у даних немає — його замінює діапазон: `{% for page in (1..total_pages) %}`.',
        'Усередині циклу порівняй `page` із `current` звичайним `{% if page == current %}`.',
        'У гілці `if` виведи `[{{ page }}]`, в `else` — просто `{{ page }}`; після `endif` постав пробіл.',
      ],
      explain: 'Діапазон — спосіб повторити щось N разів, коли масиву немає: сторінки пагінації, зірочки рейтингу, порожні клітинки сітки. Межа діапазону — звичайна змінна, тож код не залежить від конкретного числа сторінок. У справжній темі номери сторінок віддає обʼєкт `paginate`, але принцип той самий.',
    },
    {
      id: 'l06-e3',
      title: 'Хлібні крихти',
      task: [
        'У `crumbs` — шлях до сторінки: масив обʼєктів із полями `title` та `url`. Збери навігацію всередині `<nav class="crumbs">`: кожен пункт, **крім останнього**, — посилання `<a href="…">Назва</a>`, після якого через пробіл стоїть роздільник `›`. Останній пункт — поточна сторінка: не посилання, а `<span>Назва</span>`, і без роздільника після нього.',
        'Приклад: `<a href="/">Головна</a> › <a href="/collections/all">Каталог</a> › <span>Шампуні</span>`.',
      ],
      starter: `<nav class="crumbs">
  {% comment %} Усі пункти, крім останнього, — посилання з роздільником ›. Останній — <span> {% endcomment %}
  {% for crumb in crumbs %}
    <a href="{{ crumb.url }}">{{ crumb.title }}</a> ›
  {% endfor %}
</nav>`,
      solution: `<nav class="crumbs">
  {% for crumb in crumbs %}
    {% if forloop.last %}
      <span>{{ crumb.title }}</span>
    {% else %}
      <a href="{{ crumb.url }}">{{ crumb.title }}</a> ›
    {% endif %}
  {% endfor %}
</nav>`,
      data: {
        crumbs: [
          { title: 'Головна', url: '/' },
          { title: 'Каталог', url: '/collections/all' },
          { title: 'Шампуні', url: '/collections/shampoo' },
          { title: 'Шампунь із кератином', url: '/products/keratin-shampoo' },
        ],
      },
      altData: {
        crumbs: [
          { title: 'Головна', url: '/' },
          { title: 'Журнал', url: '/blogs/journal' },
        ],
      },
      mustUse: [{ pattern: 'forloop\\.last', label: 'Визнач останній пункт через `forloop.last`' }],
      hints: [
        'Стартовий код робить посиланням кожен пункт і лишає `›` у самому кінці. Потрібно, щоб остання ітерація поводилась інакше.',
        '`forloop.last` дорівнює `true` лише на останній ітерації — загорни тіло циклу в `{% if forloop.last %} … {% else %} … {% endif %}`.',
        'У гілці `if` — `<span>{{ crumb.title }}</span>`, в `else` — посилання і ` ›` після нього.',
      ],
      explain: 'Перевіряти «чи це останній» за назвою або за довжиною масиву не вийде: шлях у кожної сторінки свій. `forloop.last` не залежить ні від вмісту, ні від кількості пунктів. Так само в темах роблять перелік тегів через кому й авторів статті.',
      view: 'html',
    },
    {
      id: 'l06-e4',
      title: 'Каталог із наскрізною нумерацією',
      task: [
        'У `catalog` — групи товарів: у кожної є `title` і масив назв `products`. Для кожної групи виведи заголовок `<h3>1. Шампуні — 2 шт.</h3>` (номер групи, назва, кількість товарів у ній), а під ним — список `<ol>`, де кожен товар має подвійний номер «група.товар»: `<li>1.1 Шампунь із кератином</li>`, `<li>1.2 …</li>`, у другій групі — `2.1`, `2.2` і так далі.',
        'Останній товар у КОЖНІЙ групі отримує клас: `<li class="last">…</li>`.',
      ],
      starter: `{% for group in catalog %}
  <h3>{{ group.title }}</h3>
  <ol>
    {% comment %} Вкладений цикл по group.products. Номер групи всередині нього вже не дістати через forloop — збережи його заздалегідь {% endcomment %}
  </ol>
{% endfor %}`,
      solution: `{% for group in catalog %}
  {% assign group_no = forloop.index %}
  <h3>{{ group_no }}. {{ group.title }} — {{ group.products.size }} шт.</h3>
  <ol>
    {% for name in group.products %}
      <li{% if forloop.last %} class="last"{% endif %}>{{ group_no }}.{{ forloop.index }} {{ name }}</li>
    {% endfor %}
  </ol>
{% endfor %}`,
      data: {
        catalog: [
          { title: 'Шампуні', products: ['Шампунь із кератином', 'Шампунь щоденний'] },
          { title: 'Маски', products: ['Маска глибокого відновлення', 'Маска для кінчиків', 'Нічна маска'] },
        ],
      },
      altData: {
        catalog: [
          { title: 'Стайлінг', products: ['Термозахисний спрей'] },
          { title: 'Олійки', products: ['Олійка для кінчиків', 'Суха олійка'] },
          { title: 'Набори', products: ['Набір «Після кератину»', 'Дорожній набір', 'Подарунковий набір', 'Набір для блонду'] },
        ],
      },
      mustUse: [{ pattern: 'forloop\\.index', label: 'Нумерацію бери з `forloop.index`, а не набирай руками' }],
      hints: [
        'Циклів два: зовнішній по `catalog`, внутрішній — по `group.products`. Кількість товарів у групі — `group.products.size`.',
        'У внутрішньому циклі `forloop.index` — це вже номер товару. Номер групи збережи ДО входу в нього: `{% assign group_no = forloop.index %}`.',
        'Рядок товару: `<li{% if forloop.last %} class="last"{% endif %}>{{ group_no }}.{{ forloop.index }} {{ name }}</li>`.',
      ],
      explain: 'Кожен цикл має власний `forloop`, і внутрішній затуляє зовнішній — тому номер групи довелося винести в змінну. У Shopify те саме можна взяти з `forloop.parentloop.index`, але прийом з `assign` працює в будь-якій реалізації Liquid. `forloop.last` тут теж внутрішній: клас отримує останній товар кожної групи, а не лише останній у каталозі. Так будують багаторівневі меню й зміст довгих сторінок.',
      view: 'html',
    },
  ],
  quiz: [
    {
      id: 'l06-q1',
      q: 'Що виведе цей код?',
      template: '{% for i in (1..4) reversed limit: 2 %}{{ i }}{% endfor %}',
      options: ['43', '21', '12', '34'],
      correct: 1,
      explain: 'Спершу застосовується `limit` — лишаються `1` і `2`, і лише потім `reversed` розвертає те, що лишилось. «Два останні у зворотному порядку» так не отримати.',
    },
    {
      id: 'l06-q2',
      q: 'У масиві `items` пʼять елементів. Що виведе цикл?',
      template: '{% for item in items offset: 2 %}{{ forloop.index }}/{{ forloop.length }} {% endfor %}',
      data: { items: ['a', 'b', 'c', 'd', 'e'] },
      options: ['3/5 4/5 5/5', '1/3 2/3 3/3', '1/5 2/5 3/5', '2/3 3/3 4/3'],
      correct: 1,
      explain: '`forloop` описує сам прохід, а не масив: після `offset: 2` лишається три ітерації, нумерація починається з 1, а `forloop.length` дорівнює 3. Позицію в початковому масиві `forloop` не знає.',
    },
    {
      id: 'l06-q3',
      q: 'Усередині циклу по товарах стоїть `{% assign last_title = product.title %}`. Що буде в `last_title` після `{% endfor %}`?',
      options: [
        'Назва останнього товару — змінна з `assign` переживає цикл',
        'Нічого: усе, що створено в циклі, зникає разом із ним',
        'Назва першого товару — `assign` спрацьовує лише раз',
        'Помилка: `assign` не можна писати всередині `for`',
      ],
      correct: 0,
      explain: 'Блочної області видимості в Liquid немає. `assign` у тілі циклу перезаписує змінну на кожній ітерації, і після `endfor` у ній лишається останнє значення. Зникають лише змінна циклу (`product`) і `forloop`.',
    },
    {
      id: 'l06-q4',
      q: 'Що виведе цей код?',
      template: '{% for i in (3..1) %}{{ i }}{% endfor %}[кінець]',
      options: ['321[кінець]', '[кінець]', '123[кінець]', 'Помилка: початок діапазону більший за кінець'],
      correct: 1,
      explain: 'Діапазон рахує лише вгору. Якщо початок більший за кінець, він порожній: цикл не виконується жодного разу, помилки немає. Зворотний відлік — це `(1..3) reversed`.',
    },
  ],
  docs: ['tags/iteration', 'filters/reverse', 'filters/size', 'filters/join'],
  topics: ['iteration'],
}

/* ═══════════════════════ l07 · Цикли далі ═══════════════════════ */

const l07: Lesson = {
  id: 'l07',
  module: 2,
  title: 'Цикли далі: break, continue, cycle, tablerow, else',
  goal: 'Обробляти порожні колекції через `else`, пропускати й обривати ітерації, чергувати значення через `cycle`, будувати таблиці з `tablerow` і продовжувати цикл з місця зупинки.',
  minutes: 30,
  blocks: [
    {
      type: 'p',
      text: 'Базовий `for` закриває половину випадків. Друга половина — це «а якщо колекція порожня?», «як пропустити розпродані?», «як зупинитись після трьох?», «як зробити зебру?». На кожне з цих питань у Liquid є окремий інструмент, і в кожного — своя пастка.',
    },
    { type: 'h', text: 'else: коли перебирати нічого' },
    {
      type: 'example',
      title: 'Порожня колекція',
      template: `<ul>
{% for title in results %}
  <li>{{ title }}</li>
{% else %}
  <li class="empty">Нічого не знайдено</li>
{% endfor %}
</ul>`,
      data: { results: [] },
      view: 'html',
      note: 'Масив `results` порожній, тіло циклу не виконалось жодного разу — спрацювала гілка `else`. Впиши в дані `"results": ["Шампунь"]`, і вона зникне. Так само `else` спрацює, якщо змінної немає взагалі (`nil`).',
    },
    {
      type: 'note',
      tone: 'info',
      title: 'Це не Python',
      text: 'У JS довелося б загортати цикл у `if (results.length) { … } else { … }`. Тут перевірка вбудована в сам тег. Але якщо знаєш Python — обережно: там `for … else` означає «цикл закінчився без `break`». У Liquid `else` — **лише** про порожню колекцію.',
    },
    { type: 'h', text: 'continue і break' },
    {
      type: 'example',
      title: 'continue: пропустити розпродане',
      template: `{% for product in products %}
  {% unless product.available %}{% continue %}{% endunless %}
  {{ forloop.index }}. {{ product.title }}
{% endfor %}`,
      data: {
        products: [
          { title: 'Шампунь із кератином', available: true },
          { title: 'Маска глибокого відновлення', available: true },
          { title: 'Термозахисний спрей', available: false },
          { title: 'Олійка для кінчиків', available: true },
        ],
      },
      note: '`continue` обриває поточну ітерацію й одразу переходить до наступної — усе, що нижче в тілі циклу, для цього товару не рендериться. Тепер глянь на нумерацію: після 2 одразу йде 4.',
    },
    {
      type: 'note',
      tone: 'warn',
      title: 'forloop нічого не знає про continue',
      text: 'Пропущена ітерація все одно порахована: `forloop.index` іде з дірками, `forloop.length` включає розпродані, а якщо пропущено саме останній елемент — `forloop.last` не спрацює взагалі, і твій роздільник повисне в кінці рядка. Потрібна чесна нумерація — веди власний лічильник або відфільтруй масив ДО циклу фільтром `where` ([урок 10](/learn/l10)).',
    },
    {
      type: 'example',
      title: 'break: перші два ДОСТУПНІ товари',
      template: `{% assign shown = 0 %}
{% for product in products %}
  {% unless product.available %}{% continue %}{% endunless %}
  {% if shown == 2 %}{% break %}{% endif %}
  {% assign shown = shown | plus: 1 %}
  {{ shown }}. {{ product.title }}
{% endfor %}`,
      data: {
        products: [
          { title: 'Термозахисний спрей', available: false },
          { title: 'Шампунь із кератином', available: true },
          { title: 'Маска глибокого відновлення', available: true },
          { title: 'Олійка для кінчиків', available: true },
        ],
      },
      note: '`limit: 2` тут не підійде: він відрахує два перші елементи масиву разом із розпроданим спреєм. `break` зупиняє цикл повністю — за умовою, яку ти перевіряєш на ходу. Власний лічильник `shown` росте через фільтр `plus` (детально — в [уроці 9](/learn/l09)). У вкладених циклах `break` і `continue` діють лише на найближчий цикл.',
    },
    { type: 'h', text: 'cycle: значення по колу' },
    {
      type: 'example',
      title: 'Зебра',
      template: `<table>
{% for row in rows %}
  <tr class="{% cycle "row--odd", "row--even" %}"><td>{{ row }}</td></tr>
{% endfor %}
</table>`,
      data: { rows: ['250 мл — 649 ₴', '400 мл — 899 ₴', '1000 мл — 1 199 ₴'] },
      view: 'html',
      note: 'Кожен виклик `cycle` віддає наступне значення зі списку, а дійшовши до кінця — починає спочатку. Для двох значень те саме можна зробити через `forloop.index | modulo: 2`, але `cycle` читається краще і так само легко працює з трьома чи чотирма значеннями — наприклад, із класами колонок сітки.',
    },
    {
      type: 'example',
      title: 'Іменовані групи',
      template: `Без імені:
{% for i in (1..3) %}{% cycle "A", "B" %} {% endfor %}
{% for i in (1..3) %}{% cycle "A", "B" %} {% endfor %}

З іменами груп:
{% for i in (1..3) %}{% cycle "first": "A", "B" %} {% endfor %}
{% for i in (1..3) %}{% cycle "second": "A", "B" %} {% endfor %}`,
      note: '`cycle` памʼятає позицію **на весь шаблон**, а не на один цикл. Перший список закінчився на `A` — тож другий почав із `B`. Іменована група (`"імʼя": значення, …`) дає кожному списку власний лічильник.',
    },
    {
      type: 'note',
      tone: 'warn',
      title: 'Безіменні cycle ділять лічильник',
      text: 'Безіменний `cycle` впізнає «свою» групу за набором значень: два теги з однаковими значеннями мають один лічильник на двох, де б вони не стояли. Дві таблиці-зебри на одній сторінці — і друга може початися з «парного» рядка. Правило просте: більше одного `cycle` у файлі — давай кожному імʼя. Пісочниця тут навіть суворіша за Shopify: у ній лічильник ділять і безіменні `cycle` з різними значеннями, якщо значень однакова кількість.',
    },
    { type: 'h', text: 'tablerow: таблиця без ручних <tr>' },
    {
      type: 'example',
      title: 'Три колонки',
      template: `<table>
{% tablerow product in products cols: 3 %}
  {{ product }}
{% endtablerow %}
</table>`,
      data: { products: ['Шампунь', 'Маска', 'Спрей', 'Олійка', 'Бальзам'] },
      view: 'html',
      note: '`tablerow` сам генерує `<tr class="row1">` і `<td class="col1">`, переносячи рядок кожні `cols` елементів. Тег `<table>` довкола пишеш ти. Параметри `limit` та `offset` працюють так само, як у `for`.',
    },
    {
      type: 'p',
      text: 'Усередині доступний обʼєкт `tablerowloop` — усе те саме, що у `forloop`, плюс `col`, `col0`, `row`, `col_first` і `col_last`. У сучасних темах `tablerow` майже не трапляється: сітку товарів роблять на CSS Grid, а таблиця заради розкладки — погана семантика. Але для справжніх табличних даних (розмірна сітка, порівняння варіантів) це найкоротший шлях, і на співбесідах про нього питають.',
    },
    { type: 'h', text: 'offset: continue — продовжити з того ж місця' },
    {
      type: 'example',
      title: 'Два цикли по одній колекції',
      template: `<h3>Хіти</h3>
{% for product in products limit: 2 %}
  ★ {{ product }}
{% endfor %}
<h3>Решта</h3>
{% for product in products offset: continue %}
  · {{ product }}
{% endfor %}`,
      data: { products: ['Шампунь', 'Маска', 'Спрей', 'Олійка', 'Бальзам'] },
      note: 'Другий цикл починає там, де зупинився попередній цикл **по тій самій колекції з тим самим іменем змінної**. Зміни `limit: 2` на `limit: 3` — другий список підлаштується сам, на відміну від жорсткого `offset: 2`.',
    },
    {
      type: 'note',
      tone: 'shopify',
      text: 'Класичний макет колекції: перші два товари — великими банерами, решта — звичайною сіткою. Два цикли з `limit` та `offset: continue` роблять це без жодної арифметики. А «показати лише доступні» в бойовій темі краще вирішувати не через `continue`, а фільтром `where` до циклу: тоді й `forloop.index`, і `forloop.last`, і сам `limit` рахують лише те, що справді потрапило на сторінку.',
    },
    {
      type: 'note',
      tone: 'interview',
      title: 'На співбесіді',
      text: '«Чим `break` відрізняється від `limit`?» — `limit` відраховує елементи масиву наперед, `break` зупиняє цикл за умовою, яку ти перевіряєш у процесі (наприклад, «набралось три доступні товари»). «Навіщо `cycle` іменовані групи?» — бо безіменні `cycle` з однаковими значеннями ділять один лічильник на весь шаблон. «Що робить `else` у `for`?» — рендериться, коли колекція порожня або `nil`; це не пітонівський `for … else`. Бонус — `offset: continue`: про нього мало хто знає, і це легкий спосіб виділитись.',
    },
  ],
  exercises: [
    {
      id: 'l07-e1',
      title: 'Порожній пошук',
      task: [
        'У `results` — назви товарів, знайдених пошуком. Виведи їх пунктами `<li>` всередині `<ul class="results">`.',
        'Якщо пошук нічого не знайшов (масив порожній), усередині списку має бути один пункт: `<li class="empty">Нічого не знайдено</li>`. Зроби це гілкою самого циклу, без окремого `if`.',
      ],
      starter: `<ul class="results">
  {% comment %} Цикл по results; для порожнього масиву — пункт «Нічого не знайдено» {% endcomment %}
</ul>`,
      solution: `<ul class="results">
  {% for title in results %}
    <li>{{ title }}</li>
  {% else %}
    <li class="empty">Нічого не знайдено</li>
  {% endfor %}
</ul>`,
      data: { results: ['Шампунь із кератином', 'Кондиціонер щоденний'] },
      altData: { results: [] },
      mustUse: [{ pattern: '\\{%-?\\s*else\\s*-?%\\}', label: 'Використай гілку `else` всередині `for`' }],
      mustNotUse: [{ pattern: '\\{%-?\\s*(if|unless)\\b', label: 'Обійдися без `if` та `unless` — цикл уміє це сам' }],
      hints: [
        'На видимих даних масив не порожній, але прихована перевірка підставить порожній — подбай про обидва випадки.',
        'Тег `for` має власну гілку `{% else %}`: вона рендериться, коли перебирати нічого.',
        '`{% for title in results %}<li>{{ title }}</li>{% else %}<li class="empty">Нічого не знайдено</li>{% endfor %}`',
      ],
      explain: 'Порожній стан — не виняток, а буденність: пошук без результатів, колекція після фільтра, кошик без товарів. `for … else` закриває його без зайвої перевірки `results.size`. Гілка спрацьовує і для порожнього масиву, і для `nil`.',
      view: 'html',
    },
    {
      id: 'l07-e2',
      title: 'Лише в наявності',
      task: [
        'У `products` — товари з полями `title` та `available`. Виведи пунктами `<li>` назви лише тих, що є в наявності. Розпродані пропускай тегом `continue` на самому початку тіла циклу.',
        'Для чотирьох товарів, один з яких розпроданий, у списку має лишитись три пункти.',
      ],
      starter: `<ul>
  {% for product in products %}
    {% comment %} Якщо товару немає в наявності — перейди до наступного {% endcomment %}
    <li>{{ product.title }}</li>
  {% endfor %}
</ul>`,
      solution: `<ul>
  {% for product in products %}
    {% unless product.available %}{% continue %}{% endunless %}
    <li>{{ product.title }}</li>
  {% endfor %}
</ul>`,
      data: {
        products: [
          { title: 'Шампунь із кератином', available: true },
          { title: 'Термозахисний спрей', available: false },
          { title: 'Олійка для кінчиків', available: true },
          { title: 'Кондиціонер щоденний', available: true },
        ],
      },
      altData: {
        products: [
          { title: 'Нічна маска', available: false },
          { title: 'Суха олійка', available: true },
          { title: 'Бальзам для блонду', available: false },
          { title: 'Сироватка для кінчиків', available: true },
          { title: 'Пінка для обʼєму', available: false },
        ],
      },
      mustUse: [{ pattern: '\\{%-?\\s*continue\\s*-?%\\}', label: 'Пропускай розпродані тегом `continue`' }],
      hints: [
        '`continue` завжди стоїть усередині умови: «якщо цей товар нам не підходить — далі».',
        'Умова «НЕ в наявності» найкоротше пишеться через `unless`: `{% unless product.available %} … {% endunless %}`.',
        'Перший рядок тіла циклу: `{% unless product.available %}{% continue %}{% endunless %}`.',
      ],
      explain: 'Той самий результат дав би `{% if product.available %}` довкола `<li>`. Але коли тіло циклу — це сорок рядків картки товару, ранній вихід через `continue` читається значно краще, ніж ще один рівень вкладеності: «відсіяли непотрібне — і далі працюємо лише з потрібним». У JS це той самий патерн guard clause.',
      view: 'html',
    },
    {
      id: 'l07-e3',
      title: 'Сітка в три колонки',
      task: [
        'У `products` — назви товарів. Виведи кожну в `<div>` із класом колонки: перший товар — `col-1`, другий — `col-2`, третій — `col-3`, четвертий — знову `col-1` і так далі по колу.',
        'Приклад рядка: `<div class="col-2">Маска</div>`. Арифметики не потрібно — для цього є тег `cycle`.',
      ],
      starter: `{% for product in products %}
  {% comment %} Клас має чергуватись: col-1, col-2, col-3, col-1… {% endcomment %}
  <div class="col-1">{{ product }}</div>
{% endfor %}`,
      solution: `{% for product in products %}
  <div class="{% cycle "col-1", "col-2", "col-3" %}">{{ product }}</div>
{% endfor %}`,
      data: { products: ['Шампунь', 'Маска', 'Спрей', 'Олійка', 'Бальзам'] },
      altData: { products: ['Крем', 'Пінка', 'Лак', 'Віск', 'Гель', 'Пудра', 'Тонік'] },
      mustUse: [{ pattern: '\\{%-?\\s*cycle\\b', label: 'Використай тег `cycle`' }],
      hints: [
        '`{% cycle "a", "b", "c" %}` при кожному виклику друкує наступне значення зі списку й після останнього повертається до першого.',
        'Тег можна поставити просто всередину атрибута: `class="{% cycle … %}"`.',
        '`<div class="{% cycle "col-1", "col-2", "col-3" %}">{{ product }}</div>`',
      ],
      explain: 'Через `modulo` це теж робиться, але довше: треба порахувати залишок, додати одиницю й склеїти клас. `cycle` описує намір прямо — «ці значення по колу». Якщо на сторінці зʼявиться друга така сітка, дай кожному `cycle` імʼя групи, інакше друга сітка продовжить із місця, де зупинилась перша.',
      view: 'html',
    },
    {
      id: 'l07-e4',
      title: 'Вітрина: перші доступні товари',
      task: [
        'Блок «Рекомендуємо» показує щонайбільше `max` товарів, і лише тих, що є в наявності. У `products` — товари з полями `title` та `available`.',
        'Усередині `<div class="grid">` виведи картки виду `<div class="card card--left">1. Шампунь із кератином</div>`. Номер — порядковий номер ПОКАЗАНОЇ картки (1, 2, 3 — без дірок, хоч би скільки товарів було пропущено). Другий клас чергується по колу: `card--left`, `card--center`, `card--right`.',
        'Розпродані товари пропускай, а щойно показано `max` карток — зупиняй цикл.',
      ],
      starter: `<div class="grid">
  {% assign shown = 0 %}
  {% for product in products %}
    {% comment %} 1) розпродані — continue; 2) уже показано max — break; 3) збільш shown і виведи картку {% endcomment %}
    <div class="card">{{ forloop.index }}. {{ product.title }}</div>
  {% endfor %}
</div>`,
      solution: `<div class="grid">
  {% assign shown = 0 %}
  {% for product in products %}
    {% unless product.available %}{% continue %}{% endunless %}
    {% if shown == max %}{% break %}{% endif %}
    {% assign shown = shown | plus: 1 %}
    <div class="card {% cycle "card--left", "card--center", "card--right" %}">{{ shown }}. {{ product.title }}</div>
  {% endfor %}
</div>`,
      data: {
        max: 3,
        products: [
          { title: 'Шампунь із кератином', available: true },
          { title: 'Термозахисний спрей', available: false },
          { title: 'Маска глибокого відновлення', available: true },
          { title: 'Олійка для кінчиків', available: true },
          { title: 'Кондиціонер щоденний', available: true },
          { title: 'Нічна маска', available: false },
        ],
      },
      altData: {
        max: 2,
        products: [
          { title: 'Бальзам для блонду', available: false },
          { title: 'Суха олійка', available: true },
          { title: 'Пінка для обʼєму', available: true },
          { title: 'Сироватка для кінчиків', available: true },
          { title: 'Лак сильної фіксації', available: true },
        ],
      },
      mustUse: [
        { pattern: '\\{%-?\\s*break\\s*-?%\\}', label: 'Зупиняй цикл тегом `break`' },
        { pattern: '\\{%-?\\s*cycle\\b', label: 'Класи колонок чергуй тегом `cycle`' },
      ],
      hints: [
        '`forloop.index` не годиться для номера: він рахує і пропущені товари. Потрібен власний лічильник — `shown`, який росте лише тоді, коли картку справді виведено: `{% assign shown = shown | plus: 1 %}`.',
        'Порядок у тілі циклу важливий: спершу `continue` для розпроданих, потім перевірка `{% if shown == max %}{% break %}{% endif %}`, і лише тоді — збільшення лічильника й картка.',
        'Картка: `<div class="card {% cycle "card--left", "card--center", "card--right" %}">{{ shown }}. {{ product.title }}</div>`. `cycle` стоїть ПІСЛЯ `continue`, тож на пропущених товарах він не просувається.',
      ],
      explain: '`limit` тут безсилий: він рахує елементи масиву, а не показані картки. Тому звʼязка «власний лічильник + `break`» — стандартний прийом для блоків на кшталт «перші N доступних». Зверни увагу на `cycle`: він просувається лише тоді, коли до нього дійшло виконання, тож пропущений товар не збиває чергування колонок — на відміну від класу, порахованого з `forloop.index`.',
      view: 'html',
    },
  ],
  quiz: [
    {
      id: 'l07-q1',
      q: 'Що виведе цей код?',
      template: '{% for i in (1..5) %}{% if i == 2 %}{% continue %}{% endif %}{% if i == 4 %}{% break %}{% endif %}{{ i }}{% endfor %}',
      options: ['13', '1345', '135', '123'],
      correct: 0,
      explain: 'На двійці `continue` пропускає вивід і переходить до трійки. На четвірці `break` зупиняє цикл повністю — до пʼятірки справа вже не доходить.',
    },
    {
      id: 'l07-q2',
      q: 'Два цикли з однаковим безіменним `cycle` стоять в одному шаблоні. Що виведе код?',
      template: '{% for i in (1..3) %}{% cycle "A", "B" %}{% endfor %}-{% for i in (1..3) %}{% cycle "A", "B" %}{% endfor %}',
      options: ['ABA-ABA', 'ABA-BAB', 'AB-AB', 'ABA-'],
      correct: 1,
      explain: '`cycle` памʼятає позицію на весь шаблон, а безіменні теги з однаковими значеннями ділять один лічильник. Перший цикл зупинився після `A`, тому другий починає з `B`. Щоб другий список теж стартував з `A`, потрібні іменовані групи.',
    },
    {
      id: 'l07-q3',
      q: 'Коли виконується гілка `{% else %}` усередині `{% for %}`?',
      options: [
        'Коли колекція порожня або її немає (`nil`) — тобто цикл не зробив жодної ітерації',
        'Коли цикл дійшов до кінця без `break`, як у Python',
        'Після останньої ітерації — завжди, як завершальний блок',
        'Коли на якійсь ітерації спрацював `continue`',
      ],
      correct: 0,
      explain: '`else` у `for` — це вбудована перевірка «а чи є що перебирати». Якщо хоча б одна ітерація відбулась, гілка не рендериться, хоч би що було всередині циклу — `break`, `continue` чи порожній вивід.',
    },
    {
      id: 'l07-q4',
      q: 'У масиві три товари, останній — розпроданий (`available: false`). Що виведе код?',
      template: '{% for p in products %}{% unless p.available %}{% continue %}{% endunless %}{{ forloop.index }}{% unless forloop.last %}, {% endunless %}{% endfor %}',
      data: {
        products: [
          { title: 'Шампунь', available: true },
          { title: 'Маска', available: true },
          { title: 'Спрей', available: false },
        ],
      },
      options: ['1, 2', '1, 2,', '1, 2, 3', '1, 3'],
      correct: 1,
      explain: '`forloop.last` стає `true` лише на третій ітерації — а її пропустив `continue`, тож до перевірки роздільника справа не дійшла. На другій ітерації `forloop.last` ще `false`, і кома повисла в кінці. Ліки — відфільтрувати масив до циклу.',
    },
  ],
  docs: ['tags/iteration', 'filters/where', 'filters/modulo'],
  topics: ['iteration', 'practical'],
}

/* ═══════════════════════ l08 · Фільтри рядків ═══════════════════════ */

const l08: Lesson = {
  id: 'l08',
  module: 3,
  title: 'Фільтри рядків',
  goal: 'Приводити, обрізати, чистити й збирати рядки ланцюжками фільтрів — і пояснити, чому порядок фільтрів змінює результат.',
  minutes: 35,
  blocks: [
    {
      type: 'p',
      text: 'Фільтр — це функція: бере значення зліва від `|`, щось із ним робить і віддає результат далі. Рядкові фільтри — найуживаніші: жодна картка товару не обходиться без обрізання назви, чистки опису чи складання класу. Думай про ланцюжок як про `title.trim().toUpperCase()` у JS. Аналогія ламається у двох місцях. Параметри пишуться через двокрапку й кому, без дужок: `replace: "a", "b"`. І фільтр не можна вкласти в параметр іншого фільтра — проміжний результат спершу кладуть у змінну через `assign`. Сама змінна при цьому не змінюється: `{{ title | upcase }}` нічого не робить із `title`.',
    },
    { type: 'h', text: 'Регістр: upcase, downcase, capitalize' },
    {
      type: 'example',
      template: `{{ title | upcase }}
{{ title | downcase }}
{{ title | capitalize }}
{{ vendor | capitalize }}`,
      data: { title: 'шампунь із КЕРАТИНОМ', vendor: 'Inoar Professional' },
      note: '`capitalize` робить великою першу літеру **рядка**, а все інше переводить у нижній регістр. Останній рядок — наочно: «Professional» втратив свою велику літеру.',
    },
    {
      type: 'note',
      tone: 'warn',
      title: 'capitalize — не те, що в CSS',
      text: 'CSS `text-transform: capitalize` піднімає першу літеру КОЖНОГО слова. Фільтр `capitalize` — лише першу в рядку, і ще й нищить решту великих літер: бренд `INOAR` у назві товару стане `inoar`. Для заголовків лишай регістр таким, як його ввів власник магазину, а оформлення віддай CSS.',
    },
    { type: 'h', text: 'Склеїти, замінити, прибрати' },
    {
      type: 'example',
      template: `{{ handle | prepend: "/products/" | append: "?ref=home" }}
{{ phone | remove: " " | remove: "(" | remove: ")" | remove: "-" }}
{{ sku | replace: "LL", "XX" }}
{{ sku | replace_first: "LL", "XX" }}
{{ sku | remove_last: "-LL" }}`,
      data: { handle: 'keratin-shampoo', phone: '+38 (067) 111-22-33', sku: 'LL-001-LL' },
      note: '`append` дописує в кінець, `prepend` — на початок. Другий рядок — типова чистка телефону для посилання `tel:`: чотири `remove` поспіль, бо кожен прибирає лише свій підрядок.',
    },
    {
      type: 'p',
      text: 'Усі фільтри заміни працюють із **точним підрядком**: регулярних виразів у Liquid немає. `replace` і `remove` чіпають усі входження, варіанти `_first` і `_last` — лише перше чи останнє. `remove: x` — це коротший запис `replace: x, ""`. Якщо передати в `append` число, воно стане рядком: `"5" | append: 3` дасть `53`, а не `8`.',
    },
    { type: 'h', text: 'Пробіли по краях: strip, lstrip, rstrip' },
    {
      type: 'example',
      title: 'Чому порівняння мовчки не спрацьовує',
      template: `{% capture badge %}
  new
{% endcapture %}
[{{ badge }}]
[{{ badge | strip }}]
{% if badge == "new" %}збіглося{% else %}не збіглося{% endif %}
{% assign clean = badge | strip %}
{% if clean == "new" %}а після strip — збіглося{% endif %}`,
      note: '`capture` забирає все між тегами — разом із переносами й відступами. На сторінці цього не видно (браузер схлопує пробіли), а от порівняння `==` мовчки провалюється. `strip` обрізає пробільні символи з обох боків, `lstrip` — лише зліва, `rstrip` — лише справа. Пробілів усередині рядка жоден із них не чіпає.',
    },
    { type: 'h', text: 'Обрізати: truncate, truncatewords, slice' },
    {
      type: 'example',
      template: `{{ title | truncate: 20 }}
{{ title | truncate: 20, "" }}
{{ title | truncatewords: 3 }}
{{ title | truncatewords: 3, " →" }}
{{ title | slice: 0, 7 }}
{{ title | slice: -7, 7 }}
{{ title | slice: 0 }}`,
      data: { title: 'Шампунь із кератином для щоденного догляду' },
      note: 'Три крапки **входять** у ліміт `truncate`: із 20 символів текстом буде лише 17. `truncatewords` рахує слова й ніколи не ріже посеред слова — для карток товарів це зазвичай те, що треба. `slice` — як `substr` у JS: початок (відʼємний — з кінця) і довжина; без довжини віддає один символ, що зручно для ініціалів.',
    },
    { type: 'h', text: 'Рядок ↔ масив: split, join, size' },
    {
      type: 'example',
      template: `{% assign tags = csv | split: ", " %}
Тегів: {{ tags | size }}
Перший: {{ tags | first }}
Разом: {{ tags | join: " · " }}
Символів у рядку: {{ csv | size }}`,
      data: { csv: 'догляд, кератин, хіт' },
      note: 'У Liquid немає літерала масиву — `["a", "b"]` написати не можна. `split` — штатний спосіб створити масив просто в шаблоні. `size` працює і для рядків (символи), і для масивів (елементи); у тегах зручніший запис через крапку: `{% if tags.size > 2 %}`.',
    },
    { type: 'h', text: 'HTML та адреси: strip_html, newline_to_br, url_encode, handleize' },
    {
      type: 'example',
      template: `{{ description | strip_html }}
{{ address | newline_to_br }}
/search?q={{ query | url_encode }}
section-{{ type | handleize }}`,
      data: {
        description: '<p>Мʼякий <strong>безсульфатний</strong> шампунь.</p>',
        address: 'вул. Хрещатик, 1\nКиїв, 01001',
        query: 'шампунь & маска',
        type: 'Hair Care & Styling',
      },
      note: '`strip_html` викидає теги й лишає текст — для мета-опису й коротких анонсів. `newline_to_br` ставить `<br />` перед кожним переносом рядка: так адреса з текстового поля не злипається в один рядок. `url_encode` робить рядок безпечним для адреси (пробіл стає `+`). `handleize` — фільтр уже не базового Liquid, а Shopify: нижній регістр, а все, що не літера й не цифра, — на дефіс.',
    },
    {
      type: 'note',
      tone: 'shopify',
      text: '`handleize` потрібен для **власних** ідентифікаторів: `id` якоря, CSS-клас із типу товару, ключ для порівняння. Адресу товару чи колекції руками не збирай — у кожного обʼєкта є готові `product.url` і `product.handle`, і лише вони гарантовано збігаються з тим, що знає Shopify.',
    },
    { type: 'h', text: 'Порядок у ланцюжку має значення' },
    {
      type: 'example',
      template: `{{ description | strip_html | truncate: 20 }}
{{ description | truncate: 20 | strip_html }}

{{ "liquid lab" | upcase | capitalize }}
{{ "liquid lab" | capitalize | upcase }}`,
      data: { description: '<p>Мʼякий <strong>безсульфатний</strong> шампунь.</p>' },
      note: 'Ланцюжок виконується **зліва направо**, кожен фільтр отримує результат попереднього. Перший рядок: спершу прибрали теги, потім обрізали чистий текст. Другий: обрізали HTML посеред тега `<strong>`, і `strip_html` уже не впізнав обрубок — у вивід потрапило сміття. У реальній темі такий обрубок здатен зламати розмітку всієї картки.',
    },
    {
      type: 'note',
      tone: 'interview',
      title: 'На співбесіді',
      text: '«Що виведе `{{ "hello world" | capitalize }}`?» — `Hello world`, а не `Hello World`. «Чи важливий порядок фільтрів?» — так, ланцюжок іде зліва направо; класичний приклад — `strip_html` обовʼязково ПЕРЕД `truncate`, інакше можна розрізати тег навпіл. «Як створити масив у Liquid?» — літерала немає, тому `split`. «Чим `truncate` відрізняється від `truncatewords`?» — перший рахує символи разом із трьома крапками, другий — слова. Добре звучить і згадка, що регулярних виразів немає: `replace` працює лише з точним підрядком.',
    },
  ],
  exercises: [
    {
      id: 'l08-e1',
      title: 'Бейдж без зайвих пробілів',
      task: [
        'Текст бейджа `label` прийшов із налаштувань із випадковими пробілами по краях і малими літерами. Виведи його у квадратних дужках, ВЕЛИКИМИ літерами й без пробілів усередині дужок.',
        'Для `"  новинка  "` результат: `[НОВИНКА]`.',
      ],
      starter: `{% comment %} Прибери пробіли по краях і зроби всі літери великими {% endcomment %}
[{{ label }}]`,
      solution: `[{{ label | strip | upcase }}]`,
      data: { label: '  новинка  ' },
      altData: { label: ' хіт продажів ' },
      hints: [
        'Потрібні два фільтри в одному ланцюжку: один обрізає пробіли по краях, другий піднімає регістр.',
        'Пробіли по краях прибирає `strip`, великі літери робить `upcase`.',
        '`[{{ label | strip | upcase }}]`',
      ],
      explain: 'Тут порядок фільтрів не важить — `upcase | strip` дасть те саме. Важить інше: дані з налаштувань і метаполів вводять люди, і зайвий пробіл у кінці — звична річ. `strip` перед виводом чи порівнянням — дешева страховка.',
    },
    {
      id: 'l08-e2',
      title: 'Мета-опис',
      task: [
        'В `description` — HTML-опис товару. Збери з нього тег `<meta name="description" content="…">`: у `content` має бути чистий текст без HTML-тегів, обрізаний до 60 символів (разом із трьома крапками).',
        'Подумай, у якому порядку ставити фільтри: теги в описі не повинні «зʼїдати» ліміт символів.',
      ],
      starter: `{% comment %} Спершу прибери HTML, потім обріж до 60 символів {% endcomment %}
<meta name="description" content="{{ description }}">`,
      solution: `<meta name="description" content="{{ description | strip_html | truncate: 60 }}">`,
      data: {
        description: '<p>Мʼякий <strong>безсульфатний</strong> шампунь для волосся після реконструкції. Підходить для щоденного використання.</p>',
      },
      altData: {
        description: '<p>Легка <em>незмивна</em> олійка без обтяження: розгладжує кінчики, додає блиску й захищає від фена. Вистачає на три місяці.</p>',
      },
      mustUse: [{ pattern: '\\|\\s*strip_html\\b', label: 'Прибери теги фільтром `strip_html`' }],
      hints: [
        'Потрібні два фільтри: `strip_html` і `truncate: 60`.',
        'Якщо обрізати першим, у ліміт потраплять символи тегів `<p>` і `<strong>`, а тег можна розрізати навпіл.',
        '`content="{{ description | strip_html | truncate: 60 }}"`',
      ],
      explain: 'Порядок тут — суть завдання. `truncate | strip_html` рахує 60 символів разом із розміткою, тож тексту лишиться менше, а розрізаний навпіл тег `strip_html` не впізнає й залишить у виводі. Правило: спершу чистимо, потім міряємо.',
    },
    {
      id: 'l08-e3',
      title: 'Рядок тегів',
      task: [
        'У `tag_line` теги записані одним рядком через кому з пробілом: `"догляд, кератин, хіт"`. Виведи їхню кількість, а після тире — ті самі теги, розділені ` · ` (крапка посередині з пробілами).',
        'Результат для прикладу: `Тегів: 3 — догляд · кератин · хіт`.',
      ],
      starter: `{% comment %} Перетвори рядок на масив, порахуй елементи, склей назад з іншим роздільником {% endcomment %}
Тегів: ? — {{ tag_line }}`,
      solution: `{% assign tags = tag_line | split: ", " %}
Тегів: {{ tags | size }} — {{ tags | join: " · " }}`,
      data: { tag_line: 'догляд, кератин, хіт' },
      altData: { tag_line: 'стайлінг, термозахист, новинка, веган, без сульфатів' },
      mustUse: [{ pattern: '\\|\\s*split\\b', label: 'Розбий рядок на масив фільтром `split`' }],
      hints: [
        'Порахувати теги в рядку неможливо — спершу зроби з нього масив: `split` із роздільником `", "`.',
        'Збережи масив у змінну: `{% assign tags = tag_line | split: ", " %}` — він знадобиться двічі.',
        'Кількість — `{{ tags | size }}`, склеювання — `{{ tags | join: " · " }}`.',
      ],
      explain: '`split` → робота з масивом → `join` — базовий конвеєр Liquid: так розбирають метаполя зі списками, теги з префіксами, рядки налаштувань. Роздільник у `split` — саме `", "` з пробілом: із самою комою кожен тег, крім першого, починався б із пробілу.',
    },
    {
      id: 'l08-e4',
      title: 'Картка товару',
      task: [
        'У стартовому коді — каркас картки, куди дані товару підставлено «як є». Доведи його до ладу чотирма ланцюжками фільтрів:',
        '1) модифікатор класу — з типу товару у форматі handle: `Hair Mask` → `card--hair-mask`; 2) бренд — великими літерами; 3) назва — не довша за 30 символів (разом із трьома крапками); 4) текст — опис без HTML-тегів, перші 6 слів.',
      ],
      starter: `<article class="card card--{{ product.type }}">
  <p class="card__vendor">{{ product.vendor }}</p>
  <h3 class="card__title">{{ product.title }}</h3>
  <p class="card__text">{{ product.description }}</p>
</article>`,
      solution: `<article class="card card--{{ product.type | handleize }}">
  <p class="card__vendor">{{ product.vendor | upcase }}</p>
  <h3 class="card__title">{{ product.title | truncate: 30 }}</h3>
  <p class="card__text">{{ product.description | strip_html | truncatewords: 6 }}</p>
</article>`,
      data: {
        product: {
          title: 'Маска глибокого відновлення для пористого волосся',
          vendor: 'Inoar',
          type: 'Hair Mask',
          description: '<p>Інтенсивна маска для <em>пористого</em> волосся. Наносити на 10 хвилин двічі на тиждень.</p>',
        },
      },
      altData: {
        product: {
          title: 'Термозахисний спрей-кондиціонер незмивний',
          vendor: 'Erayba',
          type: 'Heat Protect & Styling',
          description: '<p>Захист до <strong>230 °C</strong> без обтяження. Розпилити на вологе волосся перед укладанням феном.</p>',
        },
      },
      mustUse: [{ pattern: '\\|\\s*handleize\\b', label: 'Клас збери фільтром `handleize`' }],
      hints: [
        'Кожен із чотирьох виводів отримує свій ланцюжок. Почни з простих: `upcase` для бренду, `truncate: 30` для назви.',
        'Клас: `{{ product.type | handleize }}` — фільтр сам зробить нижній регістр і замінить пробіли та `&` на дефіси.',
        'Опис: спершу `strip_html`, потім `truncatewords: 6` — саме в такому порядку.',
      ],
      explain: 'Це мініатюра справжнього сніпета картки: дані приходять «сирими», а шаблон відповідає за те, щоб довга назва не ламала сітку, HTML з опису не потрапив у превʼю, а клас був валідним. `handleize` рятує від пробілів і спецсимволів у класі; `truncatewords` після `strip_html` ніколи не обірве слово й не розріже тег.',
      view: 'html',
    },
  ],
  quiz: [
    {
      id: 'l08-q1',
      q: 'Що виведе цей код?',
      template: '{{ "liquid lab" | upcase | capitalize }}',
      options: ['LIQUID LAB', 'Liquid Lab', 'Liquid lab', 'liquid lab'],
      correct: 2,
      explain: 'Ланцюжок іде зліва направо: `upcase` дає `LIQUID LAB`, а `capitalize` лишає великою тільки першу літеру рядка, решту опускає. Кожне слово з великої `capitalize` не робить — це не CSS.',
    },
    {
      id: 'l08-q2',
      q: 'Що виведе цей код?',
      template: '{{ "a-b-c-a" | remove_first: "a" | replace: "-", "+" }}',
      options: ['+b+c+a', '+b+c+', 'b+c+a', '-b-c-a'],
      correct: 0,
      explain: '`remove_first` прибирає лише перше `a` — лишається `-b-c-a`. Далі `replace` міняє ВСІ дефіси на плюси, включно з першим.',
    },
    {
      id: 'l08-q3',
      q: 'Потрібен масив із трьох розмірів просто в шаблоні, без даних ззовні. Як його отримати?',
      options: [
        '`{% assign sizes = "S,M,L" | split: "," %}`',
        '`{% assign sizes = ["S", "M", "L"] %}`',
        '`{% assign sizes = array: "S", "M", "L" %}`',
        'Ніяк: масиви в Liquid приходять лише з обʼєктів магазину',
      ],
      correct: 0,
      explain: 'Літерала масиву в Liquid немає, тож запис із квадратними дужками не спрацює. Штатний спосіб — рядок плюс `split`.',
    },
    {
      id: 'l08-q4',
      q: 'Що виведе цей код?',
      template: '{{ "Кератин" | truncate: 5 }}',
      options: ['Керат', 'Керат...', 'Ке...', 'Кера…'],
      correct: 2,
      explain: 'Три крапки входять у ліміт: із пʼяти символів три забирає хвіст, на текст лишається два. Потрібно саме пʼять літер без хвоста — передай другим параметром порожній рядок: `truncate: 5, ""`.',
    },
  ],
  docs: [
    'filters/upcase',
    'filters/downcase',
    'filters/capitalize',
    'filters/append',
    'filters/prepend',
    'filters/replace',
    'filters/remove',
    'filters/strip',
    'filters/truncate',
    'filters/truncatewords',
    'filters/split',
    'filters/join',
    'filters/slice',
    'filters/size',
    'filters/strip_html',
    'filters/newline_to_br',
    'filters/url_encode',
    'shopify/url-and-html-filters',
  ],
  topics: ['filters'],
}

/* ═══════════════════════ l09 · Числа й математика ═══════════════════════ */

const l09: Lesson = {
  id: 'l09',
  module: 3,
  title: 'Числа й математика',
  goal: 'Рахувати просто в шаблоні — суми в копійках, відсоток знижки, межі значень — і не вскочити в цілочисельне ділення.',
  minutes: 30,
  blocks: [
    {
      type: 'p',
      text: 'У Liquid немає операторів `+`, `-`, `*`, `/` — узагалі. `{{ price * 2 }}` нічого не порахує. Уся арифметика — це фільтри: `plus`, `minus`, `times`, `divided_by`, `modulo`. Причина та сама, що й з відсутністю `while`: мова шаблонів свідомо не дає писати в ній програми. Але рахувати в шаблоні доводиться постійно — сума позиції в кошику, відсоток знижки, «до безкоштовної доставки лишилось…» — тож ці фільтри треба знати напамʼять разом з їхніми пастками.',
    },
    {
      type: 'example',
      title: 'Пʼять дій',
      template: `{{ 7 | plus: 3 }}
{{ 7 | minus: 10 }}
{{ 7 | times: 3 }}
{{ 7 | modulo: 2 }}
{{ 2 | plus: 3 | times: 4 }}`,
      note: 'Останній рядок — не `2 + 3 × 4 = 14`. Пріоритету операцій у ланцюжку немає: фільтри йдуть зліва направо, тому спершу `2 + 3`, потім `× 4`.',
    },
    {
      type: 'note',
      tone: 'warn',
      title: 'Дужок теж немає',
      text: 'Вираз на кшталт `a × (b + c)` рахують у два кроки: `{% assign sum = b | plus: c %}`, потім `{{ a | times: sum }}`. Параметром фільтра може бути змінна, але не інший ланцюжок фільтрів.',
    },
    {
      type: 'note',
      tone: 'tip',
      title: 'Рядок чи число',
      text: 'Рядок, схожий на число, математичні фільтри перетворять самі: `"5" | plus: 3` дасть `8`. А `"5" | append: 3` — це вже склеювання, `53`. Значення з текстових полів (налаштування теми типу `text`, `properties` позиції кошика) — завжди рядки, тож `| plus: 0` — поширений спосіб сказати «мені потрібне число».',
    },
    { type: 'h', text: 'Ділення: ціле чи дробове' },
    {
      type: 'example',
      template: `{{ 7 | divided_by: 2 }}
{{ 7 | divided_by: 2.0 }}
{{ 20 | divided_by: 7 }}
{{ 20 | divided_by: 7.0 | round: 2 }}`,
      note: 'Ціле на ціле ділиться **націло**: дробова частина відкидається, а не заокруглюється. Варто зробити дільник дробовим (`2.0`) — і результат теж стає дробовим. Це поведінка Ruby, на якому написаний Liquid у Shopify; у JS ти такого не зустрінеш.',
    },
    {
      type: 'note',
      tone: 'warn',
      title: 'Пастка номер один у темах',
      text: '`{{ product.price | divided_by: 100 }}` мовчки губить копійки: `64950` стає `649`, а не `649.5`. Потрібна дробова частина — діли на `100.0`. І межа пісочниці: вона бачить «дробовість» лише в дільнику, записаному **літералом**. Якщо `4.0` прийде зі змінної або дробовим буде ділене (`10.0 | divided_by: 4`), пісочниця поділить націло, а Shopify — ні. Деталі — на сторінці [про пісочницю](/docs/basics/sandbox).',
    },
    {
      type: 'example',
      title: 'Ділення націло як інструмент',
      template: `{{ minutes | divided_by: 60 }} год {{ minutes | modulo: 60 }} хв

{% for i in (1..6) %}{{ i }}{% assign rest = i | modulo: 3 %}{% if rest == 0 %} | {% else %} {% endif %}{% endfor %}`,
      data: { minutes: 185 },
      note: 'Пара `divided_by` + `modulo` розкладає хвилини на години й хвилини. А `modulo` сам по собі відповідає на питання «кожен третій?»: залишок 0 — значить, кратне. Зверни увагу: залишок спершу йде в `assign` — просто в умові `if` фільтри не пишуть.',
    },
    { type: 'h', text: 'Округлення: round, ceil, floor, abs' },
    {
      type: 'example',
      template: `{{ 4.5 | round }} {{ 4.4 | round }}
{{ 3.14159 | round: 2 }}
{{ 4.1 | ceil }}
{{ 4.9 | floor }}
{{ -7 | abs }}
Сторінок: {{ 25 | divided_by: 12.0 | ceil }}`,
      note: '`round` — до найближчого цілого або до вказаної кількості знаків, `ceil` — завжди вгору, `floor` — завжди вниз, `abs` — модуль. Останній рядок — типова задача: 25 товарів по 12 на сторінку. Ділимо на `12.0`, щоб не втратити дробову частину, і `ceil` піднімає результат до наступного цілого. З `divided_by: 12` остання сторінка просто загубилась би.',
    },
    { type: 'h', text: 'Межі: at_least і at_most' },
    {
      type: 'example',
      template: `Лишилось: {{ stock | minus: in_cart | at_least: 0 }}
Кількість: {{ wanted | at_most: 10 }}
У межах 1–10: {{ 0 | at_least: 1 | at_most: 10 }}`,
      data: { stock: 3, in_cart: 5, wanted: 14 },
      note: 'Назви читаються як вимога до результату: `at_least: 0` — «щонайменше нуль», тобто це `Math.max(x, 0)`; `at_most: 10` — «щонайбільше десять», `Math.min(x, 10)`. Плутають постійно: `at_least` — це НЕ мінімум із двох чисел, а якраз навпаки.',
    },
    { type: 'h', text: 'Гроші: усе в копійках' },
    {
      type: 'p',
      text: 'Shopify зберігає й віддає ціни **цілими числами в найменших одиницях валюти**: `64900` — це 649 гривень. Причина та сама, з якої банки не рахують гроші у `float`: дробові числа у двійковій арифметиці накопичують похибку, а цілі копійки складаються й множаться точно. Тому вся математика — в копійках, а на гривні ділить уже фільтр `money`, у самому кінці.',
    },
    {
      type: 'example',
      title: 'Фільтри money',
      template: `{{ product.price }}
{{ product.price | money }}
{{ product.price | money_with_currency }}
{{ product.price | money_without_trailing_zeros }}
{{ product.price | times: 3 | money }}`,
      preset: 'product',
      note: '`money` ділить на 100 і форматує за шаблоном із налаштувань магазину (тут це `{{amount}} ₴`). Змінить власник формат в адмінці — зміниться вся тема без жодної правки коду. Тому ціну не форматують вручну через `divided_by: 100.0` та `append: " ₴"`. Детальніше — в [довіднику грошових фільтрів](/docs/shopify/money-filters).',
    },
    {
      type: 'example',
      title: 'Відсоток знижки',
      template: `{% assign saved = product.compare_at_price | minus: product.price %}
{% assign percent = saved | times: 100 | divided_by: product.compare_at_price %}
Стара ціна: {{ product.compare_at_price | money }}
Економія: {{ saved | money }}
Бейдж: −{{ percent }}%`,
      preset: 'product',
      note: 'Формула: `(стара − нова) × 100 / стара`. Порядок принциповий: **спершу множимо, потім ділимо**. Поділиш першим — ціле ділення дасть `0` (економія менша за стару ціну), і відсоток завжди буде нульовим. Усі числа тут цілі, тож і результат цілий, з відкинутим хвостом.',
    },
    {
      type: 'note',
      tone: 'shopify',
      text: 'У бойових темах зазвичай хочуть чесне округлення, тому пишуть `times: 100.0 | divided_by: product.compare_at_price | round`: дробове `100.0` робить дробовим увесь подальший ланцюжок. Пісочниця цього не відтворить (для JavaScript `100.0` і `100` — одне й те саме число), тому в завданнях уроку відсоток рахуємо в цілих. Другий бойовий нюанс: `compare_at_price` буває `nil`, тож бейдж завжди загортають в умову `{% if product.compare_at_price > product.price %}`.',
    },
    {
      type: 'note',
      tone: 'interview',
      title: 'На співбесіді',
      text: '«Що виведе `{{ 10 | divided_by: 4 }}`?» — `2`: ціле на ціле ділиться націло, дробова частина відкидається. «Як отримати 2.5?» — зробити дільник дробовим: `divided_by: 4.0`. «Чому ціни в копійках?» — цілі числа не мають похибок `float`, а форматує їх `money` за налаштуваннями магазину. «Як порахувати відсоток знижки?» — `compare_at_price | minus: price | times: 100 | divided_by: compare_at_price`: множення ПЕРЕД діленням, плюс перевірка, що стара ціна справді більша. Бонус: у Liquid немає ні пріоритету операцій, ні дужок — ланцюжок іде зліва направо, складні вирази розбивають через `assign`.',
    },
  ],
  exercises: [
    {
      id: 'l09-e1',
      title: 'Сума позиції',
      task: [
        'У кошику лежить позиція: `price` — ціна за одиницю в копійках, `quantity` — кількість. Виведи вартість усієї позиції в копійках — одним числом.',
        'Для ціни `39900` і кількості `3` результат: `119700`.',
      ],
      starter: `{% comment %} Помнож ціну на кількість {% endcomment %}
{{ price }}`,
      solution: `{{ price | times: quantity }}`,
      data: { price: 39900, quantity: 3 },
      altData: { price: 64900, quantity: 2 },
      hints: [
        'Оператора `*` у Liquid немає — множать фільтром.',
        'Фільтр називається `times`, а його параметром може бути змінна.',
        '`{{ price | times: quantity }}`',
      ],
      explain: 'Параметр математичного фільтра — не обовʼязково літерал: `times: quantity` бере значення змінної. У справжньому кошику таку суму вже порахував Shopify (`item.line_price`), але щойно знадобиться щось своє — наприклад, вага позиції чи бали лояльності — рахувати доведеться саме так.',
    },
    {
      id: 'l09-e2',
      title: 'Тривалість процедури',
      task: [
        'У `minutes` — тривалість процедури у хвилинах. Виведи її у форматі `3 год 5 хв`: скільки повних годин і скільки хвилин понад них.',
        'Для `185` результат: `3 год 5 хв`.',
      ],
      starter: `{% comment %} Повні години — ділення націло, решта хвилин — залишок від ділення {% endcomment %}
{{ minutes }} хв`,
      solution: `{{ minutes | divided_by: 60 }} год {{ minutes | modulo: 60 }} хв`,
      data: { minutes: 185 },
      altData: { minutes: 250 },
      mustUse: [{ pattern: '\\|\\s*modulo\\b', label: 'Залишок хвилин порахуй фільтром `modulo`' }],
      hints: [
        'Тут цілочисельне ділення — не пастка, а саме те, що треба: `185 / 60` націло дає кількість повних годин.',
        'Хвилини понад повні години — це залишок від ділення на 60, фільтр `modulo`.',
        '`{{ minutes | divided_by: 60 }} год {{ minutes | modulo: 60 }} хв`',
      ],
      explain: 'Ціле на ціле в Liquid ділиться націло — і тут це працює на тебе: округлювати вниз окремо не треба. Та сама пара `divided_by` + `modulo` розкладає секунди на хвилини, грами на кілограми, порядковий номер картки — на рядок і колонку сітки.',
    },
    {
      id: 'l09-e3',
      title: 'До безкоштовної доставки',
      task: [
        'Безкоштовна доставка діє від суми `free_from`, у кошику зараз товарів на `cart_total` (обидва значення — в копійках). Виведи рядок `До безкоштовної доставки: 350.50 ₴` — скільки ще треба докласти, відформатовано фільтром `money`.',
        'Якщо поріг уже перейдено, сума не може стати відʼємною: має вийти `0.00 ₴`.',
      ],
      starter: `{% comment %} Різниця free_from − cart_total, але не менше нуля; наприкінці — money {% endcomment %}
До безкоштовної доставки: {{ free_from | money }}`,
      solution: `До безкоштовної доставки: {{ free_from | minus: cart_total | at_least: 0 | money }}`,
      data: { shop: shopUah, cart_total: 164950, free_from: 200000 },
      altData: { shop: shopUah, cart_total: 250000, free_from: 150000 },
      mustUse: [{ pattern: '\\|\\s*at_least\\b', label: 'Обмеж результат знизу фільтром `at_least`' }],
      hints: [
        'Ланцюжок із трьох ланок: відняти, обмежити знизу, відформатувати.',
        'Відʼємну різницю на нуль перетворює `at_least: 0` — «щонайменше нуль».',
        '`{{ free_from | minus: cart_total | at_least: 0 | money }}` — `money` обовʼязково останнім.',
      ],
      explain: 'Уся арифметика — в копійках, `money` — останньою ланкою: після нього у тебе вже рядок із символом валюти, і рахувати з ним далі не вийде. `at_least: 0` замінює цілий `if`: без нього клієнтка з великим кошиком побачила б «лишилось −1 000 ₴».',
    },
    {
      id: 'l09-e4',
      title: 'Ціна й бейдж знижки',
      task: [
        'У `products` — товари з полями `price` і `compare_at_price` (у копійках; `compare_at_price` — стара ціна, у товарів без знижки там `nil`). Для кожного товару виведи блок `<div class="price">`: у ньому завжди є `<span class="price__now">` із поточною ціною через `money`.',
        'Якщо стара ціна більша за поточну, додай після нього `<s>стара ціна</s>` (теж через `money`) і бейдж `<span class="badge">−18%</span>`. Відсоток — ціле число з відкинутою дробовою частиною: `(стара − нова) × 100 / стара`. Знак перед числом — мінус `−` зі стартового коду.',
      ],
      starter: `{% for product in products %}
  <div class="price">
    <span class="price__now">{{ product.price }}</span>
    {% comment %} Якщо є знижка: <s>стара ціна</s> і <span class="badge">−N%</span> {% endcomment %}
  </div>
{% endfor %}`,
      solution: `{% for product in products %}
  <div class="price">
    <span class="price__now">{{ product.price | money }}</span>
    {% if product.compare_at_price > product.price %}
      {% assign saved = product.compare_at_price | minus: product.price %}
      {% assign percent = saved | times: 100 | divided_by: product.compare_at_price %}
      <s>{{ product.compare_at_price | money }}</s>
      <span class="badge">−{{ percent }}%</span>
    {% endif %}
  </div>
{% endfor %}`,
      data: {
        shop: shopUah,
        products: [
          { title: 'Шампунь із кератином', price: 64900, compare_at_price: 79900 },
          { title: 'Маска глибокого відновлення', price: 84900, compare_at_price: null },
          { title: 'Термозахисний спрей', price: 48750, compare_at_price: 65000 },
        ],
      },
      altData: {
        shop: shopUah,
        products: [
          { title: 'Олійка для кінчиків', price: 39900, compare_at_price: null },
          { title: 'Кондиціонер щоденний', price: 46400, compare_at_price: 58000 },
          { title: 'Нічна маска', price: 99900, compare_at_price: 129900 },
          { title: 'Суха олійка', price: 52000, compare_at_price: 56000 },
        ],
      },
      mustUse: [
        { pattern: '\\|\\s*divided_by\\b', label: 'Відсоток порахуй у шаблоні (`times` і `divided_by`)' },
        { pattern: '\\|\\s*money\\b', label: 'Ціни форматуй фільтром `money`' },
      ],
      hints: [
        'Умова знижки: `{% if product.compare_at_price > product.price %}`. Для товару з `nil` у старій ціні вона просто хибна — окремо перевіряти `nil` не обовʼязково.',
        'Економію збережи в змінну: `{% assign saved = product.compare_at_price | minus: product.price %}`.',
        'Відсоток: `{% assign percent = saved | times: 100 | divided_by: product.compare_at_price %}` — множення ПЕРЕД діленням, інакше ціле ділення дасть нуль.',
      ],
      explain: 'Це майже дослівно блок ціни з реальної картки товару. Три речі, які варто вміти пояснити: чому множимо до ділення (ціле ділення меншого на більше — це нуль), чому результат цілий без `round` (ціле на ціле ділиться націло) і чому бейдж загорнуто в `if` (у більшості товарів старої ціни немає). У бойовій темі відсоток частіше округлюють чесно — через `times: 100.0 … | round`.',
      view: 'html',
    },
  ],
  quiz: [
    {
      id: 'l09-q1',
      q: 'Що виведе цей код?',
      template: '{{ 10 | divided_by: 4 }}',
      options: ['2.5', '2', '3', 'Помилка: результат не є цілим числом'],
      correct: 1,
      explain: 'Ціле на ціле ділиться націло: дробова частина відкидається (не заокруглюється — інакше було б 3). Щоб отримати `2.5`, дільник має бути дробовим: `divided_by: 4.0`.',
    },
    {
      id: 'l09-q2',
      q: 'Що виведе цей код?',
      template: '{{ 2 | plus: 3 | times: 4 }}',
      options: ['14', '20', '24', 'Помилка: потрібні дужки'],
      correct: 1,
      explain: 'Пріоритету операцій у ланцюжку фільтрів немає — він виконується зліва направо: `2 + 3 = 5`, потім `5 × 4 = 20`. Щоб отримати 14, спершу порахуй `3 × 4` в окремий `assign`.',
    },
    {
      id: 'l09-q3',
      q: 'Що виведе цей код?',
      template: '{{ 12 | at_least: 5 | at_most: 10 }}',
      options: ['5', '10', '12', 'true'],
      correct: 1,
      explain: '`at_least: 5` — «щонайменше 5»: 12 уже більше, лишається 12. `at_most: 10` — «щонайбільше 10»: 12 завелике, стає 10. Разом ця пара затискає число в діапазон 5–10, як `Math.min(Math.max(x, 5), 10)`.',
    },
    {
      id: 'l09-q4',
      q: 'У `product.price` лежить `64900`. Що це означає і як правильно вивести ціну?',
      options: [
        'Це 649 гривень у копійках; `{{ product.price | money }}` сам поділить на 100 і відформатує за налаштуваннями магазину',
        'Це 64 900 гривень; `money` лише дописує знак валюти',
        'Це 649 гривень у копійках; правильно — `divided_by: 100` і дописати `₴` через `append`',
        'Залежить від валюти магазину: для гривні це гривні, для долара — центи',
      ],
      correct: 0,
      explain: 'Ціни в Shopify — завжди цілі числа в найменших одиницях валюти. `money` ділить на 100 і застосовує формат магазину, тож тема не залежить ні від валюти, ні від уподобань власника. Ручний варіант з `divided_by: 100` ще й загубить копійки через ціле ділення.',
    },
  ],
  docs: [
    'filters/plus',
    'filters/minus',
    'filters/times',
    'filters/divided_by',
    'filters/modulo',
    'filters/round',
    'filters/ceil',
    'filters/floor',
    'filters/abs',
    'filters/at_least',
    'filters/at_most',
    'shopify/money-filters',
    'basics/sandbox',
  ],
  topics: ['filters', 'types', 'practical'],
}

export const lessonsPart2: Lesson[] = [l06, l07, l08, l09]
