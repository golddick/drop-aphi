"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserPlus, AlertCircle } from "lucide-react";
import { addSubscriber } from "@/actions/subscriber/add.subscriber";
import { SubscriptionStatus } from "@/lib/generated/prisma";
import { toast } from "sonner";


interface AddSubscriberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const sources = [
  { value: "website_form", label: "Website Form" },
  { value: "manual_add", label: "Manual Add" },
  { value: "api_import", label: "API Import" },
  { value: "social_media", label: "Social Media" },
  { value: "referral", label: "Referral" },
  { value: "popup_form", label: "Popup Form" },
  { value: "checkout_form", label: "Checkout Form" },
  { value: "unknown", label: "Unknown" },
];

const statuses = [
  {
    value: SubscriptionStatus.SUBSCRIBED,
    label: "Subscribed",
    color: "bg-green-100 text-green-800",
  },
  {
    value: SubscriptionStatus.UNSUBSCRIBED,
    label: "Unsubscribed",
    color: "bg-red-100 text-red-800",
  },
];

export function AddSubscriberDialog({
  open,
  onOpenChange,
  onSuccess,
}: AddSubscriberDialogProps) {
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    source: "manual_add",
    status: SubscriptionStatus.SUBSCRIBED,
    pageUrl: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const payload = {
        email: formData.email,
        name: formData.name || undefined,
        source: formData.source,
        status: formData.status,
        pageUrl: formData.pageUrl || undefined,
      };

      const result = await addSubscriber(payload);
      if (!result.success) throw new Error(result.error);

      toast.success("Subscriber added successfully!");
      setFormData({
        email: "",
        name: "",
        source: "manual_add",
        status: SubscriptionStatus.SUBSCRIBED,
        pageUrl: "",
      });
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to add subscriber"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <UserPlus className="h-6 w-6 text-yellow-600" />
            Add New Subscriber
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email and Name */}
          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="subscriber@example.com"
                    className={`mt-1 ${errors.email ? "border-red-500" : ""}`}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.email}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="name">Full Name (Optional)</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="John Smith"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Status & Source */}
          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Status *</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => handleInputChange("status", value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statuses.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          <Badge className={status.color}>{status.label}</Badge>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Source *</Label>
                  <Select
                    value={formData.source}
                    onValueChange={(value) => handleInputChange("source", value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {sources.map((source) => (
                        <SelectItem key={source.value} value={source.value}>
                          {source.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Page URL */}
          <Card>
            <CardContent className="p-4">
              <Label htmlFor="pageUrl">Page URL (Optional...)</Label>
              <Input
                id="pageUrl"
                value={formData.pageUrl}
                onChange={(e) => handleInputChange("pageUrl", e.target.value)}
                placeholder="https://example.com"
              />
            </CardContent>
          </Card>

          {/* Actions */}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Adding..." : "Add Subscriber"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}