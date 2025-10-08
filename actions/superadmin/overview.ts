


"use server";

import { getServerAuth } from "@/lib/auth/getauth";
import { database } from "@/lib/database";



export async function getOverviewStats() {
  const user = await getServerAuth();
  if (!user) throw new Error("You must be logged in");

  const userId = user.userId;

  const userInfo = await database.user.findUnique({
    where: { userId },
    select: { role: true },
  });

  const [totalUsers, activeNewsletters, totalKycApplications, totalBlogs, monthlyRevenue] =
    await Promise.all([
      database.user.count(),
      database.user.count({ where: { role: "NEWSLETTEROWNER" } }),
      database.kyc.count(),
      database.blogPost.count(),
      database.invoice.aggregate({
        _sum: { amount: true },
        where: {
          date: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
      }),
    ]);

    console.log("Overview Stats:", {
        totalUsers,
        activeNewsletters,
        totalKycApplications,
        totalBlogs,
        monthlyRevenue: monthlyRevenue._sum.amount || 0,
    })

  return {
    totalUsers,
    activeNewsletters,
    totalKycApplications,
    totalBlogs,
    monthlyRevenue: monthlyRevenue._sum.amount || 0,
    systemUptime: 99.98,
  };
}
