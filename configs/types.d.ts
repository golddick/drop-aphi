import { KycResponse } from "../type";

type NavItems = {
  title: String;
  link: string;
};
type PartnersTypes = {
  url: string;
};

type PlanType = {
  title: string;
};

export type DashboardSideBarTypes = {
  title: string;
  url: string;
  icon: any;
};

type subscribersDataTypes = {
  _id: string;
  email: string;
  createdAt: string | Date;
  source: string;
  status?: string;
};



type MembershipTypes = {
  _id: string;
  userId: string;
  email?: string;
  paystackCustomerId: string;
  paystackSubscriptionId?: string;
  plan: "FREE" | "LUNCH" | "GROW" | "SCALE";
  subscriptionStatus?: "active" | "inactive" | "past_due" | "cancelled";
  currentPeriodEnd?: Date | string;
  lastPaymentDate?: Date | string;
  cancellationDate?: Date | string;
  createdAt: Date | string;
  updatedAt: Date | string;
  subscriberLimit?: number; // new
  emailLimit?: number; // new
};




export type SubscriberWithCampaign = {
  email: string;
  name: string | null;
  createdAt: Date;
  campaign: {
    id: string;
    name: string;
  } | null;
};




type PlanType = {
  id: string;
  name: string;
  price: { monthly: number; yearly: number };
  features: string[];
  paystackId: { monthly: string; yearly: string };
  popular?: boolean;
};



// types/notification.ts

export interface NotificationContent {
  title: string;
  subtitle: string;
  mainHeading: string;
  mainContent: string;
  features: string[];
  details: Record<string, string>;
  ctaText: string;
  ctaUrl: string;
}

export interface CreateNotificationInput {
  type: NotificationType;
  category: NotificationCategory;
  title: string;
  content: string;
  textContent?: string;
  priority?: NotificationPriority;
  userId: string;
  metadata?: any;
  integrationId?: string;
}

export interface Notification extends CreateNotificationInput {
  id: string;
  status: NotificationStatus;
  recipient: number;
  emailsSent?: number;
  openCount?: number;
  clickCount?: number;
  recipients?: number;
  bounceCount?: number;
  openedByEmails: string[];
  clickedByEmails: string[];
  lastOpened?: Date;
  lastClicked?: Date;
  sentAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  read: boolean;
}


type TopNewsletter = {
  name: string;
  owner: string;
  subscribers: number;
  openRate: string;
  email: number
};

// Then your NewsletterStats type
export type NewsletterStats = {
  totalOwners: number;
  activeOwners: number;
  premiumOwners: number;
  totalSubscribers: number;
  avgSubscribersPerNewsletter: number;
  topPerformingNewsletters: TopNewsletter[];
};