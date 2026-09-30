'use client'

import {useChat} from '@ai-sdk/react'
import {DefaultChatTransport, getToolOrDynamicToolName, isToolOrDynamicToolUIPart, type UIMessage} from 'ai'
import {useState} from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

const REVISIONS = ['unknown', 'v0.0', 'v1.0', 'v1.1', 'v3.0', 'v3.1'] as const

const EXAMPLES = [
  'Can I use the internal pull-up on GPIO34–39 for a button?',
  'I’m reading a sensor on GPIO36 while Wi-Fi is on and get random low glitches. Why?',
  'Chip is ESP32-D0WD (revision v1.1). Is PSRAM safe to use?',
  'Should we move our product from v1.1 to v3.1? What do we gain and what new bugs do we get?',
]

type ToolPart = Extract<UIMessage['parts'][number], {toolCallId: string}>

function describeTool(part: ToolPart) {
  const name = getToolOrDynamicToolName(part)
  const input = (part as {input?: Record<string, unknown>}).input ?? {}
  if (name === 'kb_initial_context') return {icon: '📚', label: 'Read Knowledge Base outline'}
  if (name === 'kb_knowledge_base_read') {
    const paths = (input.paths as string[] | undefined) ?? []
    return {icon: '📖', label: `Read ${paths.length || ''} KB entr${paths.length === 1 ? 'y' : 'ies'}`, detail: paths.join(', ')}
  }
  if (name === 'db_groq_query') return {icon: '🗄️', label: 'Queried errata database', detail: String(input.query ?? '')}
  if (name === 'db_initial_context') return {icon: '🧭', label: 'Loaded errata schema'}
  if (name === 'db_schema_explorer') return {icon: '🧭', label: `Explored schema: ${String(input.type ?? '')}`}
  if (name === 'identifyRevision') return {icon: '🔎', label: 'Identified silicon revision'}
  return {icon: '🔧', label: name}
}

export default function Page() {
  const [revision, setRevision] = useState<(typeof REVISIONS)[number]>('unknown')
  const [input, setInput] = useState('')
  const {messages, sendMessage, status, error} = useChat({
    transport: new DefaultChatTransport({api: '/api/chat'}),
  })
  const busy = status === 'submitted' || status === 'streaming'

  const send = (text: string) => {
    if (!text.trim() || busy) return
    sendMessage({text}, {body: {revision: revision === 'unknown' ? undefined : revision}})
    setInput('')
  }

  return (
    <main className="shell">
      <header className="top">
        <div>
          <h1>
            Errata<span>Lens</span>
          </h1>
          <p className="sub">ESP32 answers that check the errata before trusting the datasheet.</p>
        </div>
        <label className="rev">
          Silicon revision
          <select value={revision} onChange={(e) => setRevision(e.target.value as typeof revision)}>
            {REVISIONS.map((r) => (
              <option key={r} value={r}>
                {r === 'unknown' ? 'Not sure' : r}
              </option>
            ))}
          </select>
        </label>
      </header>

      <section className="log">
        {messages.length === 0 && (
          <div className="empty">
            <p>Try one of these:</p>
            <div className="examples">
              {EXAMPLES.map((e) => (
                <button key={e} onClick={() => send(e)}>
                  {e}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m) => (
          <article key={m.id} className={`msg ${m.role}`}>
            {m.parts.map((part, i) => {
              if (part.type === 'text')
                return m.role === 'user' ? (
                  <p key={i}>{part.text}</p>
                ) : (
                  <div key={i} className="md">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{part.text}</ReactMarkdown>
                  </div>
                )
              if (isToolOrDynamicToolUIPart(part)) {
                const d = describeTool(part)
                const done = part.state === 'output-available'
                const failed = part.state === 'output-error'
                return (
                  <details key={i} className={`tool ${done ? 'done' : ''} ${failed ? 'failed' : ''}`}>
                    <summary>
                      <span>{d.icon}</span> {d.label}
                      {!done && !failed && <em> …</em>}
                      {failed && <em> failed</em>}
                    </summary>
                    {d.detail && <code>{d.detail}</code>}
                  </details>
                )
              }
              return null
            })}
          </article>
        ))}
        {error && <p className="err">Something went wrong: {error.message}</p>}
      </section>

      <form
        className="composer"
        onSubmit={(e) => {
          e.preventDefault()
          send(input)
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about a pin, peripheral, or paste your esptool output…"
          disabled={busy}
        />
        <button type="submit" disabled={busy || !input.trim()}>
          {busy ? 'Checking…' : 'Ask'}
        </button>
      </form>
    </main>
  )
}
