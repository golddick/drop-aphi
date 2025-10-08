// app/actions/notifications.ts
'use server';


import { database } from '@/lib/database';
import { EmailNotification, NotificationCategory, NotificationPriority, NotificationStatus, NotificationType } from '@/lib/generated/prisma';
import { revalidatePath } from 'next/cache';

interface FetchNotificationsParams {
  userId: string;
  page?: number;
  pageSize?: number;
  status?: NotificationStatus;
  type?: NotificationType;
  unreadOnly?: boolean;
}

export async function fetchNotifications({
  userId,
  page = 1,
  pageSize = 10,
  status,
  type,
  unreadOnly = false,
}: FetchNotificationsParams): Promise<{
  data: EmailNotification[];
  total: number;
  page: number;
  pageSize: number;
}> {
  try {
    const skip = (page - 1) * pageSize;
    
    const [notifications, totalCount] = await Promise.all([
      database.emailNotification.findMany({
        where: {
          userId,
          ...(status && { status }),
          ...(type && { type }),
          ...(unreadOnly && { read: false }),
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: pageSize,
      }),
      database.emailNotification.count({
        where: {
          userId,
          ...(status && { status }),
          ...(type && { type }),
          ...(unreadOnly && { read: false }),
        },
      }),
    ]);

    return {
      data: notifications,
      total: totalCount,
      page,
      pageSize,
    };
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw new Error('Failed to fetch notifications');
  }
}

interface MarkAsReadResult {
  success: boolean;
  error?: string;
}

export async function markNotificationAsRead(
  notificationId: string,
  pathToRevalidate?: string
): Promise<MarkAsReadResult> {
  try {
    await database.emailNotification.update({
      where: { id: notificationId },
      data: { 
        read: true, 
        lastOpened: new Date() 
      },
    });

    if (pathToRevalidate) {
      revalidatePath(pathToRevalidate);
    }

    return { success: true };
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to mark notification as read' 
    };
  }
}

export async function markAllAsRead(
  userId: string,
  pathToRevalidate?: string
): Promise<MarkAsReadResult> {
  try {
    await database.emailNotification.updateMany({
      where: { 
        userId,
        read: false 
      },
      data: { 
        read: true,
        lastOpened: new Date() 
      },
    });

    if (pathToRevalidate) {
      revalidatePath(pathToRevalidate);
    }

    return { success: true };
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to mark all notifications as read' 
    };
  }
}

export async function deleteNotification(
  notificationId: string,
  pathToRevalidate?: string
): Promise<MarkAsReadResult> {
  try {
    await database.emailNotification.delete({
      where: { id: notificationId },
    });

    if (pathToRevalidate) {
      revalidatePath(pathToRevalidate);
    }

    return { success: true };
  } catch (error) {
    console.error('Error deleting notification:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to delete notification' 
    };
  }
}



interface CreateNotificationInput {
  userId: string;
  type: NotificationType;
  category: NotificationCategory;
  title: string;
  content: any;
  textContent?: string;
  priority: NotificationPriority;
  metadata?: any;
  htmlContent: string;
}

export async function createNotification(data: CreateNotificationInput) {
  try {
    // First check if a notification with same category and priority already exists
    const existingNotification = await database.emailNotification.findFirst({
      where: {
        userId: data.userId,
        category: data.category,
        priority: data.priority,
      },
    });

    if (existingNotification) {
      return { 
        success: false, 
        error: `A ${data.category} notification with ${data.priority} priority already exists. 
                Each category can only have one notification per priority level.` 
      };
    }

    const notification = await database.emailNotification.create({
      data: {
        userId: data.userId,
        type: data.type,
        category: data.category,
        title: data.title,
        content: data.content,
        textContent: data.textContent || null,
        priority: data.priority,
        metadata: data.metadata || {},
        htmlContent: data.htmlContent,
      },
    });

    revalidatePath("/dashboard/settings/notification");
    revalidatePath("/dashboard/settings");
    return { success: true, notification };
  } catch (error: any) {
    console.error("Create notification error:", error);
    return { success: false, error: error.message };
  }
}

