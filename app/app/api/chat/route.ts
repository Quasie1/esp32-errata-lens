import {anthropic} from '@ai-sdk/anthropic'
import {convertToModelMessages, stepCountIs, streamText, type UIMessage} from 'ai'
import {connectContext} from '@/lib/context'
import {systemPrompt} from '@/lib/prompt'
import {identifyRevision, REVISIONS, type Revision} from '@/lib/revision'

export const maxDuration = 60

export async function POST(req: Request) {
  const {messages, revision}: {messages: UIMessage[]; revision?: string} = await req.json()
  const rev = (REVISIONS as readonly string[]).includes(revision ?? '') ? (revision as Revision) : null

  const context = await connectContext()

  try {
    const result = streamText({
      model: anthropic(process.env.ANTHROPIC_MODEL || 'claude-sonnet-5-5'),
      system: systemPrompt({revision: rev, connected: context.connected}),
      messages: await convertToModelMessages(messages),
      tools: {...context.tools, identifyRevision},
      stopWhen: stepCountIs(12),
      onFinish: () => context.close(),
      onError: () => context.close(),
      onAbort: () => context.close(),
    })
    return result.toUIMessageStreamResponse({
      onError: (error) => {
        console.error('[chat] stream error:', error)
        return error instanceof Error ? error.message : String(error)
      },
    })
  } catch (err) {
    await context.close()
    throw err
  }
}
