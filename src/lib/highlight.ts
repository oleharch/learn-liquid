/**
 * Легка підсвітка Liquid для СТАТИЧНИХ блоків коду (живі приклади підсвічує
 * CodeMirror). Три кольори несуть зміст: вивід, тег, фільтр — ті самі, що
 * й у всьому інтерфейсі.
 */
export type TokenKind = 'text' | 'delim-out' | 'delim-tag' | 'tag' | 'filter' | 'string' | 'number' | 'comment' | 'pipe' | 'ident'
export interface Token { kind: TokenKind; text: string }

const INNER = /("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')|(\|)|(-?\d+(?:\.\d+)?)|([A-Za-z_][\w-]*\??)|(\s+)|([^\s\w"'|]+)/g

function inner(code: string, isTag: boolean): Token[] {
  const out: Token[] = []
  let afterPipe = false
  let first = isTag
  for (const m of code.matchAll(INNER)) {
    const [text, str, pipe, num, ident] = m
    if (str) out.push({ kind: 'string', text })
    else if (pipe) { out.push({ kind: 'pipe', text }); afterPipe = true; continue }
    else if (num) out.push({ kind: 'number', text })
    else if (ident) {
      out.push({ kind: first ? 'tag' : afterPipe ? 'filter' : 'ident', text })
      first = false
    } else out.push({ kind: 'text', text })
    if (!/^\s+$/.test(text)) afterPipe = false
  }
  return out
}

export function highlightLiquid(code: string): Token[] {
  const tokens: Token[] = []
  const re = /(\{%-?\s*comment\s*-?%\}[\s\S]*?\{%-?\s*endcomment\s*-?%\})|(\{\{-?)([\s\S]*?)(-?\}\})|(\{%-?)([\s\S]*?)(-?%\})/g
  let last = 0
  for (const m of code.matchAll(re)) {
    if (m.index > last) tokens.push({ kind: 'text', text: code.slice(last, m.index) })
    if (m[1]) tokens.push({ kind: 'comment', text: m[1] })
    else if (m[2]) tokens.push({ kind: 'delim-out', text: m[2] }, ...inner(m[3], false), { kind: 'delim-out', text: m[4] })
    else if (/^\s*#/.test(m[6])) tokens.push({ kind: 'comment', text: m[0] })
    else tokens.push({ kind: 'delim-tag', text: m[5] }, ...inner(m[6], true), { kind: 'delim-tag', text: m[7] })
    last = m.index + m[0].length
  }
  if (last < code.length) tokens.push({ kind: 'text', text: code.slice(last) })
  return tokens
}
