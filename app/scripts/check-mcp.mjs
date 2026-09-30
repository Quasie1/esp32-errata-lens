// Verifies both Context MCP endpoints respond and lists their tools.
// Run: npm run check:mcp   (reads .env.local)
const token = process.env.SANITY_ORGANIZATION_TOKEN
const endpoints = {
  'Knowledge Base': process.env.SANITY_CONTEXT_KB_MCP_URL,
  'GROQ (errata db)': process.env.SANITY_CONTEXT_GROQ_MCP_URL,
}

if (!token) {
  console.error('Missing SANITY_ORGANIZATION_TOKEN in .env.local')
  process.exit(1)
}

let failed = false
for (const [label, url] of Object.entries(endpoints)) {
  if (!url) {
    console.log(`- ${label}: not configured (skipped)`)
    continue
  }
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json, text/event-stream',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({jsonrpc: '2.0', id: 1, method: 'tools/list'}),
  })
  const body = await res.text()
  if (!res.ok) {
    failed = true
    const hint = res.status === 401 ? 'token missing/malformed' : res.status === 403 ? 'token needs org-level Context Viewer' : ''
    console.log(`✗ ${label}: HTTP ${res.status} ${hint}\n  ${body.slice(0, 200)}`)
    continue
  }
  // Response may be JSON or a single SSE event
  const json = JSON.parse(body.includes('data:') ? body.split('data:').pop() : body)
  const names = (json.result?.tools ?? []).map((t) => t.name)
  console.log(`✓ ${label}: ${names.join(', ') || '(no tools)'}`)
}
process.exit(failed ? 1 : 0)
