"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Clock, Eye, CheckCircle, AlertTriangle, Shield, PieChart } from "lucide-react";
import { getKycStats } from "@/actions/superadmin/KYC";

type KycStats = {
  pending: number;
  underReview: number;
  approved: number;
  rejected: number;
  total: number;
  completionRate: number;
  avgProcessingTime: string;
  recentApplications: {
    id: string;
    name: string;
    date: string;
    status: string;
    completion: number;
  }[];
};

// Helper function to get status badge color
const getStatusColor = (status: string) => {
  switch (status) {
    case "PENDING":
      return "bg-yellow-100 text-yellow-800";
    case "UNDER_REVIEW":
      return "bg-blue-100 text-blue-800";
    case "APPROVED":
      return "bg-green-100 text-green-800";
    case "REJECTED":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

// Format status for display
const formatStatus = (status: string) => {
  return status.toLowerCase().replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
};

const KycCard = () => {
  const [kycStats, setKycStats] = useState<KycStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchKycStats = async () => {
      try {
        const data = await getKycStats(); // Server action call
        setKycStats(data);
      } catch (error) {
        console.error("Error fetching KYC stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchKycStats();
  }, []);

  if (loading) {
    return <div className="p-4 text-center text-gray-500">Loading KYC stats...</div>;
  }

  if (!kycStats) {
    return <div className="p-4 text-center text-red-500">Failed to load KYC stats</div>;
  }

  return (
    <div className="space-y-6">
      {/* Top Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kycStats.pending}</div>
            <Progress value={(kycStats.pending / kycStats.total) * 100} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Under Review</CardTitle>
            <Eye className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kycStats.underReview}</div>
            <Progress value={(kycStats.underReview / kycStats.total) * 100} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kycStats.approved}</div>
            <Progress value={(kycStats.approved / kycStats.total) * 100} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kycStats.rejected}</div>
            <Progress value={(kycStats.rejected / kycStats.total) * 100} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kycStats.completionRate}%</div>
            <p className="text-xs text-muted-foreground">Avg {kycStats.avgProcessingTime} days</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Applications */}
      <Card>
        <CardHeader>
          <CardTitle>Recent KYC Applications</CardTitle>
          <CardDescription>Latest KYC submissions and their current status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {kycStats.recentApplications.map((application) => (
              <div key={application.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <Shield className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">{application.name}</p>
                    <p className="text-sm text-muted-foreground">{application.id}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-sm">Completion: {application.completion}%</p>
                    <p className="text-xs text-muted-foreground">{application.date}</p>
                  </div>
                  <Badge className={getStatusColor(application.status)}>
                    {formatStatus(application.status)}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default KycCard;

