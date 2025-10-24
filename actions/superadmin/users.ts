'use server'

import { getServerAuth } from "@/lib/auth/getauth"
import { database } from "@/lib/database"


interface User {
  id: string
  fullName: string
  email: string
  userName: string
  plan: string
  subscriptionStatus: string
  createdAt: string
  organization?: string
  isEmailVerified: boolean
}

export async function getUsers(): Promise<User[]> {
  try {
    // Get user info directly from server
    const user = await getServerAuth()
    if (!user) throw new Error("You must be logged in to access users")
    
    // Check if user is SUPERADMIN
    if (user.role !== "SUPERADMIN") {
      throw new Error("Unauthorized: You must be an admin")
    }

    const users = await database.user.findMany({
      select: {
        id: true,
        fullName: true,
        email: true,
        userName: true,
        plan: true,
        subscriptionStatus: true,
        createdAt: true,
        organization: true,
        isEmailVerified: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Convert Date objects to ISO strings and handle null values
    return users.map(user => ({
      ...user,
      createdAt: user.createdAt.toISOString().split('T')[0], // Format as YYYY-MM-DD
      plan: String(user.plan), // Convert enum to string
      subscriptionStatus: String(user.subscriptionStatus), // Convert enum to string
      organization: user.organization || undefined, // Convert null to undefined
    }))
  } catch (error) {
    console.error('Error fetching users:', error)
    throw new Error(error instanceof Error ? error.message : 'Failed to fetch users')
  }
}

export async function deleteUser() {
  try {
    // Get user info directly from server
    const user = await getServerAuth()
    if (!user) throw new Error("You must be logged in to delete users")
    
    // Check if user is SUPERADMIN
    if (user.role !== "SUPERADMIN") {
      throw new Error("Unauthorized: You must be an admin")
    }

    const userId = user.userId;

    await database.user.delete({
      where: { userId: userId } 
    })

    return { success: true }
  } catch (error) {
    console.error('Error deleting user:', error)
    throw new Error(error instanceof Error ? error.message : 'Failed to delete user')
  }
}