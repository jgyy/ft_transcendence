'use client'

import React, { useState } from 'react'
import {
  VALID_MAX_SCORES,
  GAME_THEMES,
  THEME_COLORS,
  BALL_SPEED_MULTIPLIERS,
  PADDLE_SPEED_MULTIPLIERS,
  BALL_SIZE_MULTIPLIERS,
  PADDLE_SIZE_MULTIPLIERS
} from '@/lib/game-constants'

interface GameSettings {
  ballSpeed: number
  ballSize: number
  paddleSpeed: number
  paddleSize: number
  maxScore: number
  theme: keyof typeof GAME_THEMES
  powerUpsEnabled: boolean
  soundEnabled: boolean
}

interface GameSettingsProps {
  initialSettings: Partial<GameSettings>
  onSave: (settings: GameSettings) => void
  onCancel: () => void
}

export function GameSettings({
  initialSettings,
  onSave,
  onCancel
}: GameSettingsProps) {
  const defaultSettings: GameSettings = {
    ballSpeed: 3,
    ballSize: 3,
    paddleSpeed: 3,
    paddleSize: 3,
    maxScore: 11,
    theme: 'CLASSIC',
    powerUpsEnabled: false,
    soundEnabled: true,
    ...initialSettings
  }

  const [settings, setSettings] = useState<GameSettings>(defaultSettings)
  const [showPreview, setShowPreview] = useState(false)

  const handleChange = <K extends keyof GameSettings>(key: K, value: GameSettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  const handleSave = () => {
    onSave(settings)
  }

  const themeLowercase = GAME_THEMES[settings.theme] as keyof typeof THEME_COLORS
  const themeColors = THEME_COLORS[themeLowercase]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gray-900 border-b border-gray-700 p-6">
          <h2 className="text-2xl font-bold text-white">Game Settings</h2>
        </div>

        <div className="p-6 space-y-6">
          {/* Theme Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-200 mb-3">
              Theme
            </label>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {(Object.keys(GAME_THEMES) as Array<keyof typeof GAME_THEMES>).map(
                (themeName) => {
                  const themeValue = GAME_THEMES[themeName]
                  const colors = THEME_COLORS[themeValue]
                  return (
                    <button
                      key={themeValue}
                      onClick={() => handleChange('theme', themeName)}
                      className={`p-3 rounded-lg border-2 transition ${
                        settings.theme === themeName
                          ? 'border-blue-500 bg-blue-500 bg-opacity-10'
                          : 'border-gray-600 hover:border-gray-500'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: colors.ball }}
                        />
                        <div
                          className="w-4 h-2 rounded"
                          style={{ backgroundColor: colors.paddle }}
                        />
                      </div>
                      <p className="text-xs font-semibold text-gray-300 capitalize">
                        {themeValue}
                      </p>
                    </button>
                  )
                }
              )}
            </div>
          </div>

          {/* Ball Speed */}
          <div>
            <label className="block text-sm font-semibold text-gray-200 mb-2">
              Ball Speed: {settings.ballSpeed}/5
              <span className="text-xs text-gray-400 ml-2">
                ({(BALL_SPEED_MULTIPLIERS[settings.ballSpeed] * 100).toFixed(0)}%)
              </span>
            </label>
            <input
              type="range"
              min="1"
              max="5"
              value={settings.ballSpeed}
              onChange={(e) =>
                handleChange('ballSpeed', parseInt(e.target.value) as 1 | 2 | 3 | 4 | 5)
              }
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>Slow</span>
              <span>Fast</span>
            </div>
          </div>

          {/* Ball Size */}
          <div>
            <label className="block text-sm font-semibold text-gray-200 mb-2">
              Ball Size: {settings.ballSize}/5
              <span className="text-xs text-gray-400 ml-2">
                ({(BALL_SIZE_MULTIPLIERS[settings.ballSize] * 100).toFixed(0)}%)
              </span>
            </label>
            <input
              type="range"
              min="1"
              max="5"
              value={settings.ballSize}
              onChange={(e) =>
                handleChange('ballSize', parseInt(e.target.value) as 1 | 2 | 3 | 4 | 5)
              }
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>Small</span>
              <span>Large</span>
            </div>
          </div>

          {/* Paddle Speed */}
          <div>
            <label className="block text-sm font-semibold text-gray-200 mb-2">
              Paddle Speed: {settings.paddleSpeed}/5
              <span className="text-xs text-gray-400 ml-2">
                ({(PADDLE_SPEED_MULTIPLIERS[settings.paddleSpeed] * 100).toFixed(0)}%)
              </span>
            </label>
            <input
              type="range"
              min="1"
              max="5"
              value={settings.paddleSpeed}
              onChange={(e) =>
                handleChange(
                  'paddleSpeed',
                  parseInt(e.target.value) as 1 | 2 | 3 | 4 | 5
                )
              }
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>Slow</span>
              <span>Fast</span>
            </div>
          </div>

          {/* Paddle Size */}
          <div>
            <label className="block text-sm font-semibold text-gray-200 mb-2">
              Paddle Size: {settings.paddleSize}/5
              <span className="text-xs text-gray-400 ml-2">
                ({(PADDLE_SIZE_MULTIPLIERS[settings.paddleSize] * 100).toFixed(0)}%)
              </span>
            </label>
            <input
              type="range"
              min="1"
              max="5"
              value={settings.paddleSize}
              onChange={(e) =>
                handleChange(
                  'paddleSize',
                  parseInt(e.target.value) as 1 | 2 | 3 | 4 | 5
                )
              }
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>Small</span>
              <span>Large</span>
            </div>
          </div>

          {/* Max Score */}
          <div>
            <label className="block text-sm font-semibold text-gray-200 mb-3">
              Max Score
            </label>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
              {VALID_MAX_SCORES.map((score) => (
                <button
                  key={score}
                  onClick={() => handleChange('maxScore', score)}
                  className={`py-2 px-3 rounded-lg border-2 font-semibold transition ${
                    settings.maxScore === score
                      ? 'border-blue-500 bg-blue-500 bg-opacity-20 text-blue-400'
                      : 'border-gray-600 text-gray-300 hover:border-gray-500'
                  }`}
                >
                  {score}
                </button>
              ))}
            </div>
          </div>

          {/* Toggles */}
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.soundEnabled}
                onChange={(e) => handleChange('soundEnabled', e.target.checked)}
                className="w-4 h-4 cursor-pointer"
              />
              <span className="text-sm font-semibold text-gray-200">Enable Sound</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer opacity-50">
              <input
                type="checkbox"
                checked={settings.powerUpsEnabled}
                onChange={(e) => handleChange('powerUpsEnabled', e.target.checked)}
                disabled
                className="w-4 h-4 cursor-pointer"
              />
              <span className="text-sm font-semibold text-gray-200">
                Enable Power-ups (Coming Soon)
              </span>
            </label>
          </div>

          {/* Preview */}
          <div className="pt-4 border-t border-gray-700">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="text-sm text-blue-400 hover:text-blue-300 font-semibold"
            >
              {showPreview ? '▼' : '▶'} Theme Preview
            </button>

            {showPreview && (
              <div
                className="mt-4 p-4 rounded-lg border-2"
                style={{ borderColor: themeColors.ui }}
              >
                <div
                  className="rounded p-4 flex items-center justify-center gap-4 h-32"
                  style={{ backgroundColor: themeColors.background }}
                >
                  {/* Ball preview */}
                  <div
                    className="w-6 h-6 rounded-full"
                    style={{ backgroundColor: themeColors.ball }}
                  />

                  {/* Paddle preview */}
                  <div
                    className="w-2 h-12 rounded"
                    style={{ backgroundColor: themeColors.paddle }}
                  />

                  {/* Paddle preview */}
                  <div
                    className="w-2 h-12 rounded"
                    style={{ backgroundColor: themeColors.paddle }}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-2 text-center">Theme Preview</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-900 border-t border-gray-700 p-6 flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  )
}
