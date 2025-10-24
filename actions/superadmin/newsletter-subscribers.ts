'use server'

import { getServerAuth } from "@/lib/auth/getauth"
import { database } from "@/lib/database"
import { SubscriptionStatus } from "@prisma/client"

interface Subscriber {
  id: string
  email: string
  name: string | null
  creatorId: string | null
  creatorName: string | null
  subscribedAt: string
  status: SubscriptionStatus
}

export async function getSubscribers(): Promise<Subscriber[]> {
  try {
    // Get user info directly from server
    const user = await getServerAuth()
    if (!user) throw new Error("You must be logged in to access subscribers")
    
    // Check if user is SUPERADMIN
    if (user.role !== "SUPERADMIN") {
      throw new Error("Unauthorized: You must be an admin to view subscribers")
    }

    const subscribers = await database.platformSubscriber.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        userId: true,
        status: true,
        unsubscribedAt: true,
        createdAt: true,
        // We'll need to join with users table to get creator info
        user: {
          select: {
            fullName: true,
            userName: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Transform the data to match the client interface
    return subscribers.map(subscriber => ({
      id: subscriber.id,
      email: subscriber.email,
      name: subscriber.name || 'N/A',
      creatorId: subscriber.userId || 'system',
      creatorName: subscriber.user?.fullName || subscriber.user?.userName || 'System',
      subscribedAt: subscriber.createdAt.toISOString().split('T')[0],
      status: subscriber.status === 'SUBSCRIBED' ? "SUBSCRIBED" : "UNSUBSCRIBED"
    }))
  } catch (error) {
    console.error('Error fetching subscribers:', error)
    throw new Error(error instanceof Error ? error.message : 'Failed to fetch subscribers')
  }
}

export async function deleteSubscriber(subscriberId: string) {
  try {
    // Get user info directly from server
    const user = await getServerAuth()
    if (!user) throw new Error("You must be logged in to delete subscribers")
    
    // Check if user is SUPERADMIN
    if (user.role !== "SUPERADMIN") {
      throw new Error("Unauthorized: You must be an admin to delete subscribers")
    }

    await database.platformSubscriber.delete({
      where: { id: subscriberId }
    })

    return { success: true }
  } catch (error) {
    console.error('Error deleting subscriber:', error)
    throw new Error(error instanceof Error ? error.message : 'Failed to delete subscriber')
  }
}

export async function getSubscriberStats() {
  try {
    const user = await getServerAuth()
    if (!user || user.role !== "SUPERADMIN") {
      throw new Error("Unauthorized")
    }

    const [total, active, unsubscribed] = await Promise.all([
      database.platformSubscriber.count(),
      database.platformSubscriber.count({
        where: { status: 'SUBSCRIBED' }
      }),
      database.platformSubscriber.count({
        where: { status: 'UNSUBSCRIBED' }
      })
    ])

    return {
      total,
      active,
      unsubscribed
    }
  } catch (error) {
    console.error('Error fetching subscriber stats:', error)
    throw new Error(error instanceof Error ? error.message : 'Failed to fetch subscriber stats')
  }
}