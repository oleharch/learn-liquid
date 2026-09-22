/**
 * Швидко подивитись, що виведе шаблон у пісочниці.
 *   pnpm exec tsx scripts/try.ts '{{ "a" | upcase }}'
 *   pnpm exec tsx scripts/try.ts '{{ product.price | money }}' product
 *   pnpm exec tsx scripts/try.ts --file /tmp/x.liquid all '{"x":1}'
 */
import { readFileSync } from 'node:fs'
import { renderLiquid } from '../src/engine/liquid'
import type { PresetId } from '../src/content/types'

const args = process.argv.slice(2)
const template = args[0] === '--file' ? readFileSync(args.splice(0, 2)[1], 'utf8') : args.shift() ?? ''
const preset = args[0] && !args[0].startsWith('{') ? (args.shift() as PresetId) : undefined
const data = args[0] ? JSON.parse(args[0]) : undefined
const r = await renderLiquid({ template, preset, data, trace: true })
if (r.error) console.log(`ПОМИЛКА: ${r.error.raw}\n→ ${r.error.message}`)
else console.log(r.output)
