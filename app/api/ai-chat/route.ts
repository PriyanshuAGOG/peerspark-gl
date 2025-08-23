import { NextRequest, NextResponse } from 'next/server'
import { generateText } from 'ai'
import { openai } from '@ai-sdk/openai'
import { chatService } from '@/lib/chat'

export async function POST(request: NextRequest) {
  try {
    const { roomId, message, replyToId } = await request.json()

    // Get recent conversation context
    const recentMessages = await chatService.getRoomMessages(roomId, 10)

    // Build conversation context
    const conversationContext = recentMessages
      .map(msg => `${msg.isAI ? 'Assistant' : 'User'}: ${msg.content}`)
      .join('\n')

    // Generate AI response
    const { text } = await generateText({
      model: openai('gpt-4o'),
      system: `You are a helpful AI assistant for PeerSpark, a social learning platform.
      You help students and professionals with their questions, provide study guidance,
      explain concepts, and facilitate learning discussions. Be friendly, encouraging,
      and educational in your responses.`,
      prompt: `Recent conversation:
${conversationContext}

User's latest message: ${message}

Please provide a helpful response.`,
    })

    // The chatService on the frontend will receive this and send the AI message to the room.
    // This backend route's primary job is just to get the AI completion.
    // However, the guide's chatService calls this route and then expects this route to also send the message.
    // Let's stick to the guide's implementation where the client-side chatService calls this,
    // and this API route returns the content for the client to then send.
    // The guide's `triggerAIResponse` in `chatService` does exactly this.

    return NextResponse.json({ content: text })
  } catch (error) {
    console.error('AI chat error:', error)
    return NextResponse.json(
      { error: 'Failed to generate AI response' },
      { status: 500 }
    )
  }
}
