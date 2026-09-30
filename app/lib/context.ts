import {createMCPClient, type MCPClient} from '@ai-sdk/mcp'
import type {ToolSet} from 'ai'

/**
 * Two Sanity Context MCP endpoints, one per retrieval mode:
 *  - Knowledge Base mode: datasheet PDF + errata site + TRM, reconciled at build time
 *    (conflicts between datasheet and errata surface as Issues in the Context app).
 *  - GROQ mode: the structured `erratum` / `chipRevision` documents in the dataset,
 *    which let the agent filter by silicon revision instead of keyword-matching.
 *
 * Tool names collide across modes (both serve `initial_context`), so each set is prefixed.
 */
type Endpoint = {prefix: 'kb' | 'db'; url: string | undefined}

export async function connectContext(): Promise<{tools: ToolSet; close: () => Promise<void>; connected: string[]}> {
  const token = process.env.SANITY_ORGANIZATION_TOKEN
  if (!token) throw new Error('Missing SANITY_ORGANIZATION_TOKEN')

  const endpoints: Endpoint[] = [
    {prefix: 'kb', url: process.env.SANITY_CONTEXT_KB_MCP_URL},
    {prefix: 'db', url: process.env.SANITY_CONTEXT_GROQ_MCP_URL},
  ]

  const clients: MCPClient[] = []
  const tools: ToolSet = {}
  const connected: string[] = []

  for (const {prefix, url} of endpoints) {
    if (!url) continue
    const client = await createMCPClient({
      clientName: 'esp32-errata-agent',
      transport: {type: 'http', url, headers: {Authorization: `Bearer ${token}`}},
      maxRetries: 1,
    })
    clients.push(client)
    connected.push(prefix)
    const set = await client.tools()
    for (const [name, t] of Object.entries(set)) tools[`${prefix}_${name}`] = t as ToolSet[string]
  }

  if (clients.length === 0) {
    throw new Error('Set SANITY_CONTEXT_KB_MCP_URL and/or SANITY_CONTEXT_GROQ_MCP_URL')
  }

  return {
    tools,
    connected,
    close: async () => {
      await Promise.allSettled(clients.map((c) => c.close()))
    },
  }
}
