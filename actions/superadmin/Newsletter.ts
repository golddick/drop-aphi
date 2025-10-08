

"use server";

import { TopNewsletter } from "@/configs/types";
import { getServerAuth } from "@/lib/auth/getauth";
import { database } from "@/lib/database";


export async function getNewsletterStats() {
  const user = await getServerAuth();
  if (!user) throw new Error("You must be logged in to access newsletter stats");

  const userId = user.userId;

  // Check super admin role
  const userInfo = await database.user.findUnique({
    where: { userId },
    select: { role: true },
  });

//   if (!userInfo || userInfo.role !== "THENEWSADMIN") {
//     throw new Error("Unauthorized: You must be a super admin");
//   }

  // Fetch stats
  const totalOwners = await database.user.count({
    where: {
      OR: [
        { emails: { some: {} } },
        {
          id: {
            in: (
              await database.subscriber.findMany({
                select: { newsLetterOwnerId: true },
                distinct: ["newsLetterOwnerId"],
              })
            ).map((s) => s.newsLetterOwnerId),
          },
        },
      ],
    },
  });

  const activeOwners = await database.user.count({
    where: {
      emails: {
        some: {
          createdAt: {
            gte: new Date(new Date().setDate(new Date().getDate() - 30)),
          },
        },
      },
    },
  });

  const premiumOwners = await database.user.count({
    where: { plan: { not: "FREE" } },
  });

  const totalSubscribers = await database.subscriber.count();

  const ownersWithSubscribers = await database.subscriber.groupBy({
    by: ["newsLetterOwnerId"],
    _count: { id: true },
  });

  const avgSubscribersPerNewsletter =
    ownersWithSubscribers.length > 0
      ? ownersWithSubscribers.reduce((sum, o) => sum + o._count.id, 0) /
        ownersWithSubscribers.length
      : 0;

  const topOwners = await database.user.findMany({
    where: {
      userId: {
        in: ownersWithSubscribers.map((o) => o.newsLetterOwnerId),
      },
    },
    select: {
        id: true,
        userId: true,
      fullName: true,
      emails: {
        select: {
          emailSubject: true,
          openCount: true,
          emailsSentCount: true,
        },
      },
    },
  });

    // Debug logging
  console.log('ownersWithSubscribers:', ownersWithSubscribers);
  console.log('topOwners:', topOwners);


// Map top owners by subscribers and open rate

const topPerformingNewsletters: TopNewsletter[] = topOwners
    .map((owner) => {
      const subscriberObj = ownersWithSubscribers.find(
        (o) => o.newsLetterOwnerId === owner.userId
      );

      if (!subscriberObj) return null;

      const subscribers = subscriberObj._count.id;
      if (subscribers === 0) return null;

      const totalSent = owner.emails.reduce((sum, e) => sum + (e.emailsSentCount || 0), 0);
      const totalOpens = owner.emails.reduce((sum, e) => sum + (e.openCount || 0), 0);
      const openRate = totalSent > 0 ? ((totalOpens / totalSent) * 100).toFixed(1) : "0.0";

      console.log(totalSent, totalOpens, openRate, "Open Rate Calculation");

      return {
        name: owner.emails.length > 0 ? owner.emails[0].emailSubject : "Untitled Newsletter",
        owner: owner.fullName || "Unknown Owner",
        subscribers,
        openRate,
        email:owner.emails.length
      };
    })
    .filter((n): n is TopNewsletter => n !== null)
    .sort((a, b) => b.subscribers - a.subscribers)
    .slice(0, 5);

     console.log('Final topPerformingNewsletters:', topPerformingNewsletters);


  return {
    totalOwners,
    activeOwners,
    premiumOwners,
    totalSubscribers,
    avgSubscribersPerNewsletter,
    topPerformingNewsletters,
  };
}
