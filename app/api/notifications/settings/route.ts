import { type NextRequest, NextResponse } from "next/server"

// Mock settings data - replace with actual database
const mockSettings = new Map()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 })
    }

    // Get user settings or return defaults
    const settings = mockSettings.get(userId) || {
      dailyReminders: true,
      questNotifications: true,
      achievementAlerts: true,
      podUpdates: true,
      streakWarnings: true,
      reminderTime: "09:00",
      quietHours: {
        enabled: true,
        start: "22:00",
        end: "08:00",
      },
    }

    return NextResponse.json({ settings })
  } catch (error) {
    console.error("Error fetching notification settings:", error)
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, settings } = body

    if (!userId || !settings) {
      return NextResponse.json({ error: "User ID and settings required" }, { status: 400 })
    }

    // Save settings - replace with actual database update
    mockSettings.set(userId, settings)

    // Schedule/update notification jobs based on new settings
    // This would typically trigger background job updates

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error saving notification settings:", error)
    return NextResponse.json({ error: "Failed to save settings" }, { status: 500 })
  }
}
