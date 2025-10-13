
import { atom } from "jotai";
import { DashboardSideBarTypes, NavItems, PartnersTypes, PlanType } from "./types";
import { ICONS } from "@/lib/utils/icons";


export const navItems: NavItems[] = [
  {
    title: "Home",
    link: "/",
  },
  {
    title: "About",
    link: "/about-us",
  },
  {
    title: "Resources",
    link: "/coming-soon",
  },
  {
    title: "Features",
    link: "/features",
  },
  {
    title: "Blogs",
    link: "/blog",
  },
  {
    title: "Docs",
    link: "/api-doc",
  },
];

export const partners: PartnersTypes[] = [
  {
    url: "https://media.beehiiv.com/cdn-cgi/image/fit=scale-down,onerror=redirect,format=auto,width=1080,quality=75/www/company-logos-cyber-ink-bg/CompanyLogosCyberInkBG/resume-worded.svg",
  },
  {
    url: "https://media.beehiiv.com/cdn-cgi/image/fit=scale-down,onerror=redirect,format=auto,width=1080,quality=75/www/company-logos-cyber-ink-bg/CompanyLogosCyberInkBG/clickhole.svg",
  },
  {
    url: "https://media.beehiiv.com/cdn-cgi/image/fit=scale-down,onerror=redirect,format=auto,width=1080,quality=75/www/company-logos-cyber-ink-bg/CompanyLogosCyberInkBG/cre.svg",
  },
  {
    url: "https://media.beehiiv.com/cdn-cgi/image/fit=scale-down,onerror=redirect,format=auto,width=1080,quality=75/www/company-logos-cyber-ink-bg/CompanyLogosCyberInkBG/rap-tv.svg",
  },
  {
    url: "https://media.beehiiv.com/cdn-cgi/image/fit=scale-down,onerror=redirect,format=auto,width=1080,quality=75/www/company-logos-cyber-ink-bg/CompanyLogosCyberInkBG/awa.svg",
  },
  {
    url: "/GeeLogo.png",
  },
  {
    url: "/gnb.png",
  },
];

export const FreePlan: PlanType[] = [
  { title: "Up to 500 subscribers" }, // matched with PLAN_LIMITS.FREE
  { title: "Send up to 2 emails" },
  { title: "1 campaign and 1 category" },
  { title: "Custom subcribtion page" },
  { title: "Newsletter analytics" },
];



export const GrowPlan: PlanType[] = [
  { title: "Up to 2,000 subscribers" }, // matched with PLAN_LIMITS.LUNCH
  { title: "Send up to 10 emails" },
  { title: "5 campaigns and 2 categories" },
  { title: "Custom subcribtion page" },
  { title: "API access" },
  // { title: "Blog access" },
  { title: "Access to TheNews community" },
];

export const ScalePlan: PlanType[] = [
  { title: "Up to 10,000 subscribers" }, 
  { title: "Send up to 50 emails" },
  { title: "10 campaigns and 5 categories" },
  { title: "Advanced support system" },
  { title: "Ad Network" },
];

export const sideBarActiveItem = atom<string>("/dashboard");

export const reportFilterActiveItem = atom<string>("Overview");

export const emailEditorDefaultValue = atom<string>("");

export const settingsActiveItem = atom<string>("Profile");

export const sideBarItems: DashboardSideBarTypes[] = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: ICONS.dashboard,
  },

  //   {
  //   title: "Campaign",
  //   url: "/dashboard/campaigns",
  //   icon: ICONS.analytics,
  // },
  
   {
    title: "Mail",
    url: "/dashboard/mail",
    icon: ICONS.write,
  },
  {
    title: "Blog",
    url: "/dashboard/blog",
    icon: ICONS.blog,
  },
    {
    title: "Audience",
    url: "/dashboard/subscribers",
    icon: ICONS.audience,
  },

];

export const sideBarBottomItems: DashboardSideBarTypes[] = [
  {
    title: "Setting",
    url: "/dashboard/settings",
    icon: ICONS.settings,
  },
  // {
  //   title: "Generated URL",
  //   url: "/dashboard/url",
  //   icon: ICONS.world,
  // },

];


export const AdminsideBarItems: DashboardSideBarTypes[] = [
  {
    title: "Dashboard",
    url: "/xontrol/dashboard",
    icon: ICONS.dashboard,
  },
  {
    title: "Users",
    url: "/xontrol/users",
    icon: ICONS.profile,
  },
  {
    title: "KYC",
    url: "/xontrol/kyc",
    icon: ICONS.form,
  },
  {
    title: "Blog",
    url: "/xontrol/blog",
    icon: ICONS.blog,
  },
];

export const AdminsideBarBottomItems: DashboardSideBarTypes[] = [
  {
    title: "Settings",
    url: "/xontrol/settings",
    icon: ICONS.settings,
  },
  {
    title: "Generated URL",
    url: "/dashboard/url",
    icon: ICONS.world,
  },

];