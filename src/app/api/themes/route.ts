import { NextRequest, NextResponse } from 'next/server'
import { THEME_COLORS, GAME_THEMES } from '@/lib/game-constants'

export async function GET(request: NextRequest) {
  try {
    const themeNames = Object.values(GAME_THEMES)

    const themes = themeNames.map((themeName) => ({
      id: themeName,
      name: themeName.charAt(0).toUpperCase() + themeName.slice(1),
      colors: THEME_COLORS[themeName as keyof typeof THEME_COLORS],
      preview: generateThemePreview(themeName)
    }))

    return NextResponse.json({
      themes,
      default: 'classic',
      count: themes.length
    })
  } catch (error) {
    console.error('Error fetching themes:', error)
    return NextResponse.json(
      { error: 'Failed to fetch themes' },
      { status: 500 }
    )
  }
}

function generateThemePreview(
  themeName: keyof typeof THEME_COLORS
): Record<string, string> {
  const colors = THEME_COLORS[themeName]

  return {
    '--theme-background': colors.background,
    '--theme-foreground': colors.foreground,
    '--theme-paddle': colors.paddle,
    '--theme-ball': colors.ball,
    '--theme-ui': colors.ui
  }
}
