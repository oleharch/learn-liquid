import { useMemo } from 'react'
import CodeMirror from '@uiw/react-codemirror'
import { EditorView } from '@codemirror/view'
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language'
import { tags as t } from '@lezer/highlight'
import { liquid } from '@codemirror/lang-liquid'
import { json } from '@codemirror/lang-json'

/**
 * Кольори беруться з CSS-змінних, тож редактор сам перемикається разом із темою
 * і тримає ті самі три смислові кольори: вивід, тег, фільтр.
 */
const highlight = HighlightStyle.define([
  { tag: [t.keyword, t.controlKeyword, t.operatorKeyword, t.definitionKeyword, t.moduleKeyword], color: 'var(--c-tag)' },
  { tag: [t.function(t.variableName), t.function(t.propertyName)], color: 'var(--c-filter)' },
  { tag: [t.variableName, t.propertyName], color: 'var(--code-ident)' },
  { tag: [t.string, t.special(t.string)], color: 'var(--code-string)' },
  { tag: [t.number, t.bool, t.null, t.atom], color: 'var(--code-number)' },
  { tag: [t.comment, t.blockComment, t.lineComment], color: 'var(--code-comment)', fontStyle: 'italic' },
  { tag: [t.brace, t.processingInstruction], color: 'var(--c-out)', fontWeight: '600' },
  { tag: [t.tagName, t.angleBracket], color: 'var(--code-html)' },
  { tag: t.attributeName, color: 'var(--code-html-attr)' },
  { tag: [t.operator, t.punctuation, t.separator], color: 'var(--code-punct)' },
])

const theme = EditorView.theme({
  '&': { backgroundColor: 'transparent', color: 'var(--code-fg)', fontSize: '13.5px' },
  '.cm-content': { fontFamily: 'var(--font-mono)', padding: '14px 0', caretColor: 'var(--c-out)' },
  '.cm-line': { padding: '0 16px' },
  '.cm-gutters': { backgroundColor: 'transparent', color: 'var(--code-gutter)', border: 'none' },
  '.cm-lineNumbers .cm-gutterElement': { padding: '0 8px 0 14px', minWidth: '28px' },
  '.cm-activeLine': { backgroundColor: 'var(--code-active)' },
  '.cm-activeLineGutter': { backgroundColor: 'transparent', color: 'var(--code-fg)' },
  '&.cm-focused': { outline: 'none' },
  '.cm-selectionBackground, &.cm-focused .cm-selectionBackground, ::selection': { backgroundColor: 'var(--code-selection) !important' },
  '.cm-cursor': { borderLeftColor: 'var(--c-out)', borderLeftWidth: '2px' },
  '.cm-matchingBracket': { backgroundColor: 'var(--code-selection)', outline: 'none' },
  '.cm-tooltip': { backgroundColor: 'var(--surface)', color: 'var(--ink)', border: '1px solid var(--line)', borderRadius: '8px' },
  '.cm-tooltip-autocomplete ul li[aria-selected]': { backgroundColor: 'var(--c-out)', color: '#fff' },
})

interface Props {
  value: string
  onChange?: (value: string) => void
  lang?: 'liquid' | 'json'
  readOnly?: boolean
  minHeight?: string
  maxHeight?: string
  lineNumbers?: boolean
  ariaLabel?: string
}

export function CodeEditor({ value, onChange, lang = 'liquid', readOnly, minHeight = '64px', maxHeight = '420px', lineNumbers = true, ariaLabel }: Props) {
  const extensions = useMemo(
    () => [
      lang === 'json' ? json() : liquid(),
      theme,
      syntaxHighlighting(highlight),
      EditorView.lineWrapping,
      EditorView.contentAttributes.of({ 'aria-label': ariaLabel ?? (lang === 'json' ? 'JSON-дані' : 'Шаблон Liquid') }),
    ],
    [lang, ariaLabel],
  )
  return (
    <CodeMirror
      value={value}
      onChange={onChange}
      extensions={extensions}
      theme="none"
      readOnly={readOnly}
      editable={!readOnly}
      minHeight={minHeight}
      maxHeight={maxHeight}
      basicSetup={{ lineNumbers, foldGutter: false, highlightActiveLine: !readOnly, highlightActiveLineGutter: !readOnly, autocompletion: true, tabSize: 2 }}
    />
  )
}
