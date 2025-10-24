// app/api/templates/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { database } from '@/lib/database'
import { getServerAuth } from '@/lib/auth/getauth'

export async function GET(request: NextRequest) {
  try {
    const user = await getServerAuth()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch user's templates and public templates
    const templates = await database.systemEmailTemplate.findMany({
      where: {
        OR: [
          { userId: user.userId },
          { isPublic: true }
        ]
      },
      select: {
        id: true,
        name: true,
        description: true,
        category: true,
        tags: true,
        elements: true,
        subject: true,
        isPublic: true,
        isFeatured: true,
        usageCount: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: [
        { isFeatured: 'desc' },
        { usageCount: 'desc' },
        { createdAt: 'desc' }
      ]
    })

    return NextResponse.json({
      success: true,
      data: templates
    })
  } catch (error) {
    console.error('Error fetching templates:', error)
    return NextResponse.json(
      { error: 'Failed to fetch templates' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getServerAuth()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, subject, elements, description, category } = body

    if (!name || !subject || !elements) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const template = await database.systemEmailTemplate.create({
      data: {
        name,
        description: description || '',
        category: category || 'Custom',
        tags: ['mail-studio'],
        elements: elements as any,
        subject,
        isPublic: false,
        isFeatured: false,
        usageCount: 0,
        userId: user.userId
      }
    })

    return NextResponse.json({
      success: true,
      data: template
    })
  } catch (error) {
    console.error('Error creating template:', error)
    return NextResponse.json(
      { error: 'Failed to create template' },
      { status: 500 }
    )
  }
}