'use server'

import { getServerAuth } from "@/lib/auth/getauth";
import { database } from "@/lib/database";





export const getSubscribers = async () => {
  try {
        const user = await getServerAuth();
    if (!user) {
      return { error: 'Unauthorized', subscribers: null }
    }

    const subscribers = await database.subscriber.findMany({
      where: {
        newsLetterOwnerId: user.userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return { subscribers, error: null }
  } catch (error) {
    console.error('[GET_SUBSCRIBERS_ERROR]', error)
    return { 
      error: error instanceof Error ? error.message : 'Failed to fetch subscribers',
      subscribers: null 
    }
  }
}