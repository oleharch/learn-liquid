import type { DocPage } from '../types'

export const sandboxPages: DocPage[] = [
  {
    slug: 'sandbox',
    section: 'basics',
    title: 'Про пісочницю: чим вона відрізняється від Shopify',
    summary:
      'Приклади на цьому сайті виконує LiquidJS у браузері, а не Ruby-Liquid на серверах Shopify. Тут перелічено, де вони розходяться і що саме емулюється.',
    blocks: [
      {
        type: 'p',
        text: 'Справжній Shopify рендерить Liquid **на сервері**, рушієм на Ruby. Тут шаблони виконує **LiquidJS** — незалежна реалізація тієї самої мови на JavaScript — просто у твоєму браузері. Синтаксис, теги й базові фільтри збігаються, тож вчити мову на ній можна. Але це дві різні програми, і на межах вони поводяться по-різному. Знати ці межі корисно й саме по собі: питання «а чим Liquid у Shopify відрізняється від інших реалізацій» на співбесідах звучить.',
      },
      { type: 'h', text: 'Що підігнано під поведінку Shopify' },
      {
        type: 'p',
        text: 'Найвідоміша розбіжність — ділення. У Ruby ціле на ціле ділиться **націло**, у JavaScript цілих чисел немає взагалі. Пісочниця відтворює поведінку Shopify:',
      },
      {
        type: 'example',
        template: '{{ 10 | divided_by: 4 }}\n{{ 10 | divided_by: 4.0 }}\n{{ 10.0 | divided_by: 4 }}',
        note: 'Третій рядок — межа емуляції: у JavaScript `10.0` і `10` — одне й те саме число, тож пісочниця не бачить, що ділене було дробовим. «Дробовість» вона помічає лише в **дільника**, записаного літералом.',
        shopifyOutput: '2\n2.5\n2.5',
      },
      {
        type: 'list',
        items: [
          '`divided_by` — цілочисельне ділення для цілих, як у Ruby.',
          'Невідомий фільтр — **помилка**, а не мовчазний пропуск. У Shopify теж буде помилка; LiquidJS за замовчуванням просто проігнорував би його.',
          'Дати друкуються у **своєму** часовому поясі (той, що записаний у даних), а не в поясі твого браузера — вивід однаковий у всіх.',
          '`image_url` без `width` чи `height` — помилка, як і в Shopify.',
        ],
      },
      { type: 'h', text: 'Де пісочниця все одно відрізняється' },
      {
        type: 'table',
        head: ['Що', 'Пісочниця (LiquidJS)', 'Shopify (Ruby)'],
        rows: [
          ['Цілі дробові: `{{ 4.0 | times: 2 }}`', '`8`', '`8.0` — Ruby памʼятає, що число було дробовим'],
          ['`{{ 10.0 | divided_by: 4 }}`', '`2`', '`2.5`'],
          ['Обʼєкти магазину', 'звичайний JSON', 'Drop-обʼєкти: властивості рахуються ліниво, частина доступна лише на своїх сторінках'],
          ['Метаполя', 'справжня форма — `value`, `type`, `list?`', 'так само — тому `.value` обовʼязкове і тут, і там'],
          ['`collections[\'handle\']`, `all_products[\'handle\']`', 'лише те, що покладено в дані пресета', 'звернення до будь-якого ресурсу магазину за handle'],
          ['`{{ product }}` (обʼєкт цілком)', '`[object Object]`', '`ProductDrop`'],
          ['Помилка у шаблоні', 'рендер зупиняється, показується помилка', 'на сторінку друкується `Liquid error: …`, решта рендериться далі'],
          ['Ліміти', 'обмеження памʼяті й часу рендера', '`for` до 50 ітерацій без `paginate`, пагінація до 250, ліміт розміру файлу 256 КБ'],
        ],
      },
      {
        type: 'note',
        tone: 'warn',
        title: 'Дробові числа',
        text: 'Якщо приклад на сайті дає у Shopify інший результат, під виводом стоїть окремий рядок **«У Shopify»** із правильним значенням. Орієнтуйся на нього.',
      },
      { type: 'h', text: 'Що з Shopify емулюється' },
      {
        type: 'p',
        text: 'Фільтри й теги Shopify тут **відтворюють форму результату**, щоб на них можна було тренуватись. Інфраструктури за ними немає: адреси CDN вигадані, переклади беруться зі змінної `locales`, форми нікуди не відправляються.',
      },
      {
        type: 'table',
        head: ['Група', 'Емулюється'],
        rows: [
          ['Гроші', '`money`, `money_with_currency`, `money_without_currency`, `money_without_trailing_zeros` — формат береться з `shop.money_format`'],
          ['Зображення', '`image_url`, `image_tag`, `img_url` (застарілий), `placeholder_svg_tag`'],
          ['Файли', '`asset_url`, `asset_img_url`, `file_url`, `global_asset_url`, `shopify_asset_url`, `stylesheet_tag`, `script_tag`, `preload_tag`'],
          ['Рядки', '`handleize`, `camelize`, `pluralize`, `url_escape`, `url_param_escape`, `highlight`'],
          ['Посилання', '`link_to`, `link_to_vendor`, `link_to_type`, `link_to_tag`, `url_for_vendor`, `url_for_type`, `within`, `sort_by`'],
          ['Інше', '`t` / `translate`, `time_tag`, `weight_with_unit`, `default_pagination`, `item_count_for_variant`, `json`'],
          ['Теги', '`schema`, `doc`, `style`, `stylesheet`, `javascript`, `section`, `content_for \'blocks\'`, `form`, `paginate`, `layout`'],
        ],
      },
      {
        type: 'example',
        title: 'Схема секції працює',
        template:
          '<h2>{{ section.settings.heading }}</h2>\n{% for block in section.blocks %}\n  <p {{ block.shopify_attributes }}>{{ block.settings.text }}</p>\n{% endfor %}\n\n{% schema %}\n{\n  "name": "Переваги",\n  "settings": [\n    { "type": "text", "id": "heading", "label": "Заголовок", "default": "Чому ми" }\n  ],\n  "blocks": [\n    { "type": "item", "name": "Пункт", "settings": [\n      { "type": "text", "id": "text", "label": "Текст", "default": "Нова перевага" }\n    ] }\n  ],\n  "presets": [\n    { "name": "Переваги", "blocks": [\n      { "type": "item", "settings": { "text": "Доставка за 1 день" } },\n      { "type": "item" }\n    ] }\n  ]\n}\n{% endschema %}',
        view: 'html',
        note: 'Пісочниця читає `{% schema %}` і збирає обʼєкт `section` так, як це зробив би редактор теми: налаштування — з `default`, блоки — з першого пресета. Зміни `default` у схемі й подивись на вивід.',
      },
      {
        type: 'p',
        text: 'Решта Shopify-фільтрів (кольори `color_*`, шрифти `font_*`, платіжні, медіа-плеєри, метаполя) тут **не працюють**: спроба викликати такий фільтр дасть зрозумілу помилку з поясненням, що він існує в Shopify, але не в пісочниці. Їхній опис — у [повному індексі Shopify](/shopify/reference).',
      },
      {
        type: 'note',
        tone: 'interview',
        title: 'Як це звучить на співбесіді',
        text: 'Liquid — це **відкрита мова шаблонів**, і Shopify — лише найвідоміший її користувач. Є Ruby-реалізація (оригінал), LiquidJS, реалізації на Python, Go, .NET. Jekyll теж використовує Liquid. Ядро мови спільне, а **обʼєкти, частина тегів і більшість фільтрів — це розширення конкретної платформи**: `product`, `{% section %}`, `money` не існують поза Shopify.',
      },
    ],
    related: ['basics/variations', 'basics/introduction'],
  },
]
