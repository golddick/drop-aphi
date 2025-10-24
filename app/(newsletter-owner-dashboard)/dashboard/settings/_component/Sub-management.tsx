"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {  Download, Calendar, Zap, Check, AlertTriangle } from "lucide-react"

import { cancelSubscription, downgradeToFreePlan, getBillingHistory, getCurrentSubscription, getUsageStats, toggleAutoRenew } from "@/actions/plan/subscription-plan"
import { availablePlans } from "@/lib/planLimit"
import { useRouter } from "next/navigation"
import { paystackSubscribe } from "@/actions/paystack/paystack.subscribe"
import { Plan } from "@/lib/generated/prisma" 
import { useAuthUser } from "@/lib/auth/getClientAuth"
import { toast } from "sonner"
import Loader from "@/components/_component/Loader"

type SubscriptionData = { 
  plan: Plan
  subscriptionStatus: string
  currentPeriodEnd: Date | null
  nextPaymentDate: Date | null
  amount: number
  currency: string
  subscriberLimit: number
  emailLimit: number
  blogPostLimit: number
  aiGenerationLimit: number
}

type UsageData = {
  emailsSent: number
  subscribersAdded: number
  blogPostsCreated: number
  aiGenerationsUsed: number
}

type BillingHistoryItem = {
  id: string
  date: string
  amount: number
  status: string
  description: string
  invoiceUrl: string
}

export function SubscriptionSettings() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly")
  const [autoRenew, setAutoRenew] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useAuthUser()
  const history = useRouter();
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null)
  const [usage, setUsage] = useState<UsageData | null>(null)
  const [billingHistory, setBillingHistory] = useState<BillingHistoryItem[]>([])

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const [subscriptionResponse, usageResponse, billingHistoryResponse] = await Promise.all([
          getCurrentSubscription(),
          getUsageStats(),
          getBillingHistory()
        ])

        // Handle errors for each response
        if ('error' in subscriptionResponse) {
          throw new Error(subscriptionResponse.error)
        }
        if ('error' in usageResponse) {
          throw new Error(usageResponse.error)
        }
        if ('error' in billingHistoryResponse) {
          // Billing history might be empty, but not an error
          if (billingHistoryResponse.error !== "Failed to fetch billing history") {
            throw new Error(billingHistoryResponse.error)
          }
        }

        // Type assertions after error checks
        const subscriptionData = subscriptionResponse as SubscriptionData
        const usageData = usageResponse as UsageData
        const billingHistoryData = !('error' in billingHistoryResponse) 
          ? billingHistoryResponse as BillingHistoryItem[] 
          : []

        setSubscription(subscriptionData)
        setUsage(usageData)
        setBillingHistory(billingHistoryData)
        setAutoRenew(subscriptionData.subscriptionStatus === "active")
        
      } catch (error) {
        console.error('Error fetching data:', error)
        toast.error(error instanceof Error ? error.message : "Failed to load subscription data")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const handlePlanChange = async (
    plan: "FREE" | "LAUNCH" | "SCALE",
    billingCycle: "monthly" | "yearly"
  ) => {
    if (!user || !user.id) {
      history.push("/");
      return;
    }

    setIsLoading(true);
    try {
      if (plan === "FREE") {
        const response = await downgradeToFreePlan();
        if (response.success) {
          toast.success("You have been downgraded to the Free plan.");
          history.refresh();
        } else {
          toast.error(response.error || "Failed to downgrade to Free plan");
        }
        return;
      }

      const result = await paystackSubscribe({
        planName: plan,
        userId: user.userId,
        billingCycle,
      });

      // Handle KYC required case
      if (result.kycRequired) {
        toast.error("KYC verification is required before upgrading.");
        history.push("/dashboard/settings?tab=KYC");
        return;
      }

      // Handle payment initiation
      if (result.success && result.url) {
        toast.success("Payment initiated. Please wait for confirmation.");
        window.location.href = result.url;
      } else {
        toast.error(result.error || "Failed to initiate payment");
      }

    } catch (error: any) {
      toast.error(error.message || "Payment failed");
    } finally {
      setIsLoading(false);
    }
  }

  const handleCancelSubscription = async () => {
    setIsLoading(true)
    try {
      const result = await cancelSubscription()
      
      if (!result.success) {
        throw new Error(result.error || "Failed to cancel subscription")
      }

      if (subscription) {
        setSubscription({
          ...subscription,
          subscriptionStatus: "cancelled",
          nextPaymentDate: null
        })
      }

      toast.success("Your subscription will remain active until the end of the current billing period.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to cancel subscription")
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleAutoRenew = async (checked: boolean) => {
    const previousState = autoRenew
    setAutoRenew(checked)
    
    try {
      const result = await toggleAutoRenew(checked)
      
      if (!result.success) {
        throw new Error(result.error || "Failed to update auto-renewal")
      }

      if (subscription) {
        setSubscription({
          ...subscription,
          subscriptionStatus: checked ? "active" : "inactive"
        })
      }
      toast.success("Auto-renewal status updated")
    } catch (error) {
      setAutoRenew(previousState)
      toast.error(error instanceof Error? error.message : "Failed to update auto-renewal")
    }
  }

  if (isLoading && !subscription) {
    return <Loader/>
  }

  if (!subscription || !usage) {
    return <div className="flex justify-center items-center h-64">Failed to load subscription data</div>
  }

  return (
    <div className="space-y-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto mb-4">
      {/* Current Plan Overview */}
      <div>
        <Card>
          <CardHeader>
            <CardTitle className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-xred-500" />
                <span>Current Plan: {subscription.plan}</span>
              </div>
              <Badge className={`w-fit ${
                subscription.subscriptionStatus === "active" 
                  ? "bg-xred-100 text-xred-800 hover:bg-xred-100" 
                  : "bg-gray-100 text-gray-800 hover:bg-gray-100"
              }`}>
                {subscription.subscriptionStatus.charAt(0).toUpperCase() + subscription.subscriptionStatus.slice(1)}
              </Badge>
            </CardTitle>
            <CardDescription className="text-sm sm:text-base">
              N{subscription.amount / 100} {subscription.currency} / {billingCycle === "monthly" ? "month" : "year"} • 
              {subscription.nextPaymentDate ? ` Next billing: ${new Date(subscription.nextPaymentDate).toLocaleDateString()}` : " No upcoming billing"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-medium">Plan Features</h4>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500" />
                    Up to {subscription.subscriberLimit.toLocaleString()} subscribers
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500" />
                    {subscription.emailLimit.toLocaleString()} emails per month
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500" />
                    {subscription.blogPostLimit.toLocaleString()} blog posts
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500" />
                    {subscription.aiGenerationLimit.toLocaleString()} AI generations
                  </li>
                </ul>
              </div>
              <div className="space-y-4">
                <h4 className="font-medium">Usage This Month</h4>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Subscribers</span>
                      <span>
                        {usage.subscribersAdded.toLocaleString()} / {subscription.subscriberLimit.toLocaleString()}
                      </span>
                    </div>
                    <Progress 
                      value={(usage.subscribersAdded / subscription.subscriberLimit) * 100} 
                      className="h-2" 
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Emails Sent</span>
                      <span>
                        {usage.emailsSent.toLocaleString()} / {subscription.emailLimit.toLocaleString()}
                      </span>
                    </div>
                    <Progress 
                      value={(usage.emailsSent / subscription.emailLimit) * 100} 
                      className="h-2" 
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Blog Posts</span>
                      <span>
                        {usage.blogPostsCreated.toLocaleString()} / {subscription.blogPostLimit.toLocaleString()}
                      </span>
                    </div>
                    <Progress 
                      value={(usage.blogPostsCreated / subscription.blogPostLimit) * 100} 
                      className="h-2" 
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>AI Generations</span>
                      <span>
                        {usage.aiGenerationsUsed.toLocaleString()} / {subscription.aiGenerationLimit.toLocaleString()}
                      </span>
                    </div>
                    <Progress 
                      value={(usage.aiGenerationsUsed / subscription.aiGenerationLimit) * 100} 
                      className="h-2" 
                    />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Plan Comparison */}
      <div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <h3 className="text-lg sm:text-xl font-semibold">Available Plans</h3>
          <div className="flex items-center gap-4">
            <Label htmlFor="billing-toggle" className="text-sm sm:text-base">Monthly</Label>
            <Switch
              id="billing-toggle"
              checked={billingCycle === "yearly"}
              onCheckedChange={(checked) => setBillingCycle(checked ? "yearly" : "monthly")}
            />
            <Label htmlFor="billing-toggle" className="text-sm sm:text-base">
              Yearly{" "}
              <Badge variant="secondary" className="ml-1">
                Save 20%
              </Badge>
            </Label>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {availablePlans.map((plan) => (
            <Card key={plan.id} className={`relative ${plan.popular ? "border-xred-500 shadow-lg" : ""}`}>
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-red-500 hover:bg-red-500">Most Popular</Badge>
                </div>
              )}
              <CardHeader>
                <CardTitle className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span>{plan.name}</span>
                  {subscription.plan === plan.id && <Badge variant="outline" className="hidden lg:block">Current</Badge>}
                </CardTitle>
                <div className="text-2xl sm:text-3xl font-bold">
                  N{plan.price[billingCycle]}
                  <span className="text-sm sm:text-lg font-normal text-muted-foreground">
                    /{billingCycle === "monthly" ? "mo" : "yr"}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 text-xs sm:text-sm">
                      <Check className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 flex-shrink-0 mt-0.5" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button
                  className={`w-full ${
                    subscription.plan === plan.id
                      ? "bg-gray-100 text-black cursor-not-allowed"
                      : "bg-black text-white hover:bg-white hover:text-black"
                  }`}
                  disabled={subscription.plan === plan.id || isLoading}
                  onClick={() => handlePlanChange(plan.name as "FREE" | "LAUNCH" | "SCALE", billingCycle)}
                >
                  {subscription.plan === plan.id ? "Current Plan" : `Switch to ${plan.name}`}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Billing History */}
      {billingHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Billing History
            </CardTitle>
            <CardDescription>View and download your past invoices.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {billingHistory.map((invoice) => (
                <div key={invoice.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg gap-4 sm:gap-0">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <Check className="h-3 w-3 sm:h-5 sm:w-5 text-green-600" />
                    </div>
                    <div>
                      <div className="font-medium text-sm sm:text-base">{invoice.description}</div>
                      <div className="text-xs sm:text-sm text-muted-foreground">
                        {new Date(invoice.date).toLocaleDateString()} • {invoice.id}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
                    <div className="text-right w-full sm:w-auto">
                      <div className="font-medium text-sm sm:text-base">${invoice.amount.toFixed(2)} {subscription.currency}</div>
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-100 text-xs">{invoice.status}</Badge>
                    </div>
                    <Button variant="outline" size="sm" asChild className="w-full sm:w-auto">
                      <a href={invoice.invoiceUrl} download>
                        <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                        Download
                      </a>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Billing Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Billing Preferences</CardTitle>
          <CardDescription>Configure your billing and renewal settings.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex sm:items-center justify-between gap-4">
            <div>
              <Label htmlFor="auto-renew" className="text-sm sm:text-base font-medium">
                Auto-renewal
              </Label>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Automatically renew your subscription at the end of each billing period
              </p>
            </div>
            <Switch 
              id="auto-renew" 
              checked={autoRenew} 
              onCheckedChange={handleToggleAutoRenew}
              disabled={subscription.subscriptionStatus === "cancelled" || isLoading}
            />
          </div>
         
          <Separator />
          <div className="flex sm:items-center justify-between gap-4">
            <div>
              <Label className="text-sm sm:text-base font-medium">Usage alerts</Label>
              <p className="text-xs sm:text-sm text-muted-foreground">Get notified when you&apos;re approaching your plan limits</p>
            </div>
            <Switch defaultChecked disabled={isLoading} />
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Danger Zone
          </CardTitle>
          <CardDescription>These actions are irreversible. Please proceed with caution.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-red-200 rounded-lg gap-4 sm:gap-0">
            <div>
              <h4 className="font-medium text-sm sm:text-base">Cancel Subscription</h4>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Cancel your subscription. You&apos;ll retain access until the end of your billing period.
              </p>
            </div>
            <Button 
              variant="destructive" 
              onClick={handleCancelSubscription}
              disabled={subscription.subscriptionStatus === "cancelled" || isLoading}
              className="w-full sm:w-auto"
            >
              {subscription.subscriptionStatus === "cancelled" ? "Cancellation Pending" : "Cancel Subscription"}
            </Button>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-red-200 rounded-lg gap-4 sm:gap-0">
            <div>
              <h4 className="font-medium text-sm sm:text-base">Delete Account</h4>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Permanently delete your account and all associated data. This action cannot be undone.
              </p>
            </div>
            <Button variant="destructive" className="w-full sm:w-auto" disabled={isLoading}>
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}