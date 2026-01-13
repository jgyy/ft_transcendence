import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword, isValidEmail, isValidUsername } from '@/lib/utils'
import { z } from 'zod'

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  username: z.string().min(3).max(20),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  passwordConfirm: z.string(),
}).refine((data) => data.password === data.passwordConfirm, {
  message: 'Passwords do not match',
  path: ['passwordConfirm'],
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const validation = registerSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: validation.error.issues[0].message,
        },
        { status: 400 }
      )
    }

    const { email, username, password } = validation.data

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      )
    }

    if (!isValidUsername(username)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Username must be 3-20 characters, alphanumeric with underscore/hyphen',
        },
        { status: 400 }
      )
    }

    const existingEmail = await prisma.user.findUnique({
      where: { email },
    })

    if (existingEmail) {
      return NextResponse.json(
        { success: false, error: 'Email already registered' },
        { status: 409 }
      )
    }

    const existingUsername = await prisma.user.findUnique({
      where: { username },
    })

    if (existingUsername) {
      return NextResponse.json(
        { success: false, error: 'Username already taken' },
        { status: 409 }
      )
    }

    const hashedPassword = await hashPassword(password)

    const user = await prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
        displayName: username,
      },
      select: {
        id: true,
        email: true,
        username: true,
        displayName: true,
        avatarUrl: true,
      },
    })

    return NextResponse.json(
      {
        success: true,
        message: 'User registered successfully',
        data: user,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
