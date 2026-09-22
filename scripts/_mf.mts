import { renderLiquid } from '../src/engine/liquid'
const data = {
  mf: { value: 'Тримає 3 місяці', type: 'single_line_text_field' },
  bool: { value: false, type: 'boolean' },
  list: { value: ['Печерськ', 'Оболонь', 'Поділ'], type: 'list.single_line_text_field', 'list?': true },
  json: { value: { temperature: 230, unit: '°C' }, type: 'json' },
  ns: { size: { value: 400, type: 'number_integer' }, ph: { value: 5.5, type: 'number_decimal' } },
}
const t = [
  ['напряму', '{{ mf }}'],
  ['.value', '{{ mf.value }}'],
  ['.type', '{{ mf.type }}'],
  ['list?', '[{{ list.list? }}] [{{ mf.list? }}]'],
  ['value.size', '{{ list.value.size }} / first {{ list.value.first }} / last {{ list.value.last }} / [0] {{ list.value[0] }}'],
  ['цикл', '{% for x in list.value %}{{ x }}·{% endfor %}'],
  ['json', '{{ json.value.temperature }}{{ json.value["unit"] }}'],
  ['json цикл', '{% for p in json.value %}{{ p.first }}={{ p.last }} {% endfor %}'],
  ['boolean false', '[{{ bool.value }}] if:{% if bool.value %}так{% else %}ні{% endif %}'],
  ['ключ size крапкою', '{{ ns.size }}'],
  ['ключ size дужками', '{{ ns["size"].value }}'],
  ['порожнє', '[{{ ns.nema.value }}] [{% if ns.nema %}є{% else %}нема{% endif %}]'],
]
for (const [name, tpl] of t) {
  const r = await renderLiquid({ template: tpl, data })
  console.log(`${name.padEnd(18)} → ${r.error ? 'ПОМИЛКА: ' + r.error.raw : JSON.stringify(r.output)}`)
}
