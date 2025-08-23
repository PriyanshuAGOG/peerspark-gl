import { NextRequest, NextResponse } from 'next/server'
import { generateText } from 'ai'
import { openai } from '@ai-sdk/openai'

export async function POST(request: NextRequest) {
  try {
    const { subject, duration, dailyStudyTime, difficulty } = await request.json()

    if (!subject || !duration || !dailyStudyTime || !difficulty) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const prompt = `
      Create a detailed, day-by-day study plan roadmap for the subject "${subject}"
      at a ${difficulty} level. The plan should span ${duration} days, assuming the user
      can study for ${dailyStudyTime} hours per day.

      Structure the output clearly with headings for each week and day.
      For each day, provide:
      1. The main topic(s) to cover.
      2. A brief list of key concepts or sub-topics.
      3. A suggested activity (e.g., "Read Chapter X", "Watch a tutorial on Y", "Complete 5 practice problems", "Build a small project Z").

      The plan should be encouraging and practical.
    `;

    const { text } = await generateText({
      model: openai('gpt-4o'),
      system: 'You are an expert academic and career advisor, skilled at creating structured and motivating learning plans.',
      prompt,
    });

    return NextResponse.json({ roadmap: text })
  } catch (error) {
    console.error('AI study plan error:', error)
    return NextResponse.json(
      { error: 'Failed to generate study plan' },
      { status: 500 }
    )
  }
}
