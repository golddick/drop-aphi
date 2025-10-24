export interface PlanLimits {
    blogPostLimit: number;
    campaignLimit: number ;
    emailLimit: number;
    subscriberLimit: number;
  }
  

  
  // export  const planDetails = {
  //   FREE: {
  //     amount: 0,
  //     subscriberLimit: 500,
  //     emailLimit: 20,
  //     blogPostLimit: 10,
  //     aiGenerationLimit: 5,
  //   },
  //   LAUNCH: {
  //     amount: 2900, // in cents/kobo
  //     subscriberLimit: 5000,
  //     emailLimit: 50,
  //     blogPostLimit: 50,
  //     aiGenerationLimit: 20,
  //   },
  //   SCALE: {
  //     amount: 9900, // in cents/kobo
  //     subscriberLimit: 20000,
  //     emailLimit: 100,
  //     blogPostLimit: 200,
  //     aiGenerationLimit: 100,
  //   },
  // } as const;


export  const PLAN_LIMITS = {
    FREE: {
      subscriberLimit: 500,
      emailLimit: 20,
      blogPostLimit: 5,
      aiGenerationLimit: 5,
    },
    LAUNCH: {
      subscriberLimit: 1000,
      emailLimit: 50,
      blogPostLimit: 10,
      aiGenerationLimit: 10,
    },
    SCALE: {
      subscriberLimit: 5000,
      emailLimit: 100,
      blogPostLimit: 20,
      aiGenerationLimit: 20,
    },
  } as const;


export const PLAN_CONFIG = {
  LAUNCH: {
    monthly: { id: "PLN_rvpduy0rmjjt573", amount: 10000, name:"LAUNCH" },
    yearly: { id: "PLN_rgstsf6wp9oknj8", amount: 96000, name:"LAUNCH" },
  },
  SCALE: {
    monthly: { id: "PLN_21dokhpcgmvofkf", amount: 25000 },
    yearly: { id: "PLN_k900i8ga01qcdbh", amount: 255000 },
  },
  FREE: {
    monthly: { id: "PLN_free_monthly_id", amount: 0 },
    yearly: { id: "PLN_free_yearly_id", amount: 0 },
  },
} as const;



export const availablePlans = [
  {
    id: "FREE",
    name: "Free",
    paystackId: { monthly: null, yearly: null },
    price: { monthly: 0, yearly: 0 },
    features: [
      "Up to 500 subscribers",
      "Send up to 20 mails",
      "Post up to 5 Blog content ",
      "use AI to generaate content",
      " Dev key free for first tym user for 1 month ",
      "Custom subscription page",
      "Basic analytics",
      "Email support",
    ],
  },
  {
    id: "LAUNCH",
    name: "LAUNCH",
    paystackId: {
      monthly: PLAN_CONFIG.LAUNCH.monthly.id,
      yearly: PLAN_CONFIG.LAUNCH.yearly.id,
    },
    price: { monthly: PLAN_CONFIG.LAUNCH.monthly.amount, yearly: PLAN_CONFIG.LAUNCH.yearly.amount },
    features: [
      "Everything in FREE plus:",
      "Up to 1,000 subscribers",
      "Send up to 50 emails",
      "10 blog posts",
      "AI-powered content generation",
      "Custom subscription page",
      "Dev API access",
    ],
    popular: true,
  },
  {
    id: "SCALE",
    name: "SCALE",
    paystackId: {
      monthly: PLAN_CONFIG.SCALE.monthly.id,
      yearly: PLAN_CONFIG.SCALE.yearly.id,
    },
    price: { monthly: PLAN_CONFIG.SCALE.monthly.amount, yearly: PLAN_CONFIG.SCALE.yearly.amount },
    features: [
      "Everything in LAUNCH plus:",
      "Up to 5,000 subscribers",
      "Send up to 100 emails",
      "20 blog posts",
      "AI-powered content generation",
      "Custom subscription page",
      "Advanced analytics",
      "Priority support",
      "Extended Dev API access",
    ],
  },
];
