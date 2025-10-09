










"use client";

import {  useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import {
  Search, UserPlus, MoreVertical, Mail, Trash2, Eye, User, UserCheck, UserMinus, Grid, List
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AddSubscriberDialog } from "./add-subscriber-dialog";
import { useSubscribers } from "@/actions/subscriber/use.subscriber";
import { formatDate, formatString } from "@/lib/utils";
import { ImportSubscriberModal } from "./ImportSubscriberModal";
import { useAuthUser } from "@/lib/auth/getClientAuth";
import { SubscriptionStatus } from "@/lib/generated/prisma";
import Loader from "@/components/_component/Loader";

export function SubscribersDashboard() {
  const { user } = useAuthUser();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");

  const {
    subscribers,
    loading: subscribersLoading,
    error: subscribersError,
    refetch: refetchSubscribers
  } = useSubscribers();

  console.log(subscribers, 'data from subscriber')

  const filteredSubscribers = subscribers.filter((subscriber) => {
    const matchesSearch =
      subscriber.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subscriber.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || subscriber.status.toLowerCase() === statusFilter.toLowerCase();
    const macthesEmail = subscriber.email.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch && matchesStatus && macthesEmail;
  });

  const totalSubscribers = subscribers.length;
  const activeSubscribers = subscribers.filter((s) => s.status === SubscriptionStatus.SUBSCRIBED).length;
  const unsubscribedCount = subscribers.filter((s) => s.status === SubscriptionStatus.UNSUBSCRIBED).length;

  const getStatusColor = (status: SubscriptionStatus) => {
    switch (status) {
      case SubscriptionStatus.SUBSCRIBED:
        return "bg-green-100 text-green-800 border-green-200";
      case SubscriptionStatus.UNSUBSCRIBED:
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-blue-100 text-blue-800 border-blue-200";
    }
  };



  if (subscribersLoading) return <Loader />;

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-200">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-black">All Subscribers</h1>
            <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-600">
              Manage subscribers across all campaigns and integrations
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
            >
              {viewMode === "grid" ? (
                <List className="h-4 w-4 mr-2" />
              ) : (
                <Grid className="h-4 w-4 mr-2" />
              )}
              {viewMode === "grid" ? "List View" : "Grid View"}
            </Button>
            <Button
              onClick={() => setShowAddDialog(true)}
              className="bg-black hover:bg-white hover:text-black text-white font-medium w-full sm:w-auto"
              size="sm"
            >
              <UserPlus className="h-4 w-4 mr-2" /> Add Subscriber
            </Button>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6 space-y-4">
        {/* Statistics */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <Card>
            <CardContent className="p-2 sm:p-6 flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600">Total Subscribers</p>
                <p className="text-xl sm:text-2xl font-bold text-black">{totalSubscribers}</p>
              </div>
              <div className="bg-blue-100 p-2 rounded-full"><User className="w-5 h-5 text-blue-600" /></div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-2 sm:p-6 flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600">Active</p>
                <p className="text-xl sm:text-2xl font-bold text-black">{activeSubscribers}</p>
              </div>
              <div className="bg-green-100 p-2 rounded-full"><UserCheck className="w-5 h-5 text-green-600" /></div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-2 sm:p-6 flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600">Unsubscribed</p>
                <p className="text-xl sm:text-2xl font-bold text-black">{unsubscribedCount}</p>
              </div>
              <div className="bg-yellow-100 p-2 rounded-full"><UserMinus className="w-5 h-5 text-yellow-600" /></div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className=" border-none shadow-none">
          <CardContent className="p-4 flex  gap-4 items-center justify-between w-full ">
            <div className="flex items-center gap-3 w-full">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full"
                />
              </div>
            </div>
            <ImportSubscriberModal newsletterOwnerId={user?.id} onImportComplete={refetchSubscribers} />
          </CardContent>
        </Card>

        {/* Subscribers List */}
        {filteredSubscribers.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-500">No subscribers yet.</p>
            <Button onClick={() => setShowAddDialog(true)} className="mt-4 bg-black text-white hover:bg-white hover:text-black">
              <UserPlus className="h-4 w-4 mr-2" /> Add First Subscriber
            </Button>
          </div>
        ) : viewMode === "list" ? (
          <Card>
            <CardHeader className="bg-black text-white p-3 sm:p-6">
              <CardTitle>Subscribers ({filteredSubscribers.length})</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="text-left p-3 font-medium text-gray-900 text-sm">Subscriber</th>
                      <th className="text-left p-3 font-medium text-gray-900 text-sm hidden md:table-cell">Joined </th>
                      <th className="text-left p-3 font-medium text-gray-900 text-sm hidden md:table-cell">Source</th>
                      <th className="text-left p-3 font-medium text-gray-900 text-sm">Status</th>
                      <th className="text-left p-3 font-medium text-gray-900 text-sm">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSubscribers.map((subscriber) => (
                      <tr key={subscriber.id} className="border-b hover:bg-gray-50">
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                                     <Avatar className="h-8 w-8 hidden md:block">
                                  <AvatarFallback className="bg-black text-red-600  text-lg">
                                    {subscriber.name
                                      ? subscriber.name[0].toUpperCase()
                                      : subscriber.email[0].toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                            <div>
                              {
                                subscriber.name && (
                                    <div className="font-medium text-gray-900 text-xs truncate max-w-[150px] md:max-w-[150px] lg:max-w-[200px]">{subscriber.name}</div>
                                )
                              }
                              <div className="text-gray-500 text-xs truncate max-w-[100px] md:max-w-[150px] lg:max-w-[200px]">{subscriber.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-3  hidden md:table-cell">
                          <div className="text-gray-900 text-xs">{formatDate(subscriber.createdAt)}</div>
                        </td>
                        <td className="p-3  hidden md:table-cell">
                          <div className="text-gray-900 text-xs ">{formatString(subscriber.source)}</div>
                        </td>
                        <td className="p-3">
                          <div className="text-gray-900 text-xs">
                            <Badge className={getStatusColor(subscriber.status as SubscriptionStatus)}>
                            {subscriber.status}
                          </Badge>
                          </div>
                        </td>
                        <td className="p-3">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="h-4 w-4" /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="text-xs">
                              <DropdownMenuItem><Eye className="h-4 w-4 mr-2" />View Details</DropdownMenuItem>
                              <DropdownMenuItem><Mail className="h-4 w-4 mr-2" />Send Email</DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600"><Trash2 className="h-4 w-4 mr-2" />Remove</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4  gap-4">
            {filteredSubscribers.map((subscriber) => (

              <Card
              key={subscriber.id}
              className="hover:shadow-lg transition-shadow rounded-lg  border border-gray-200"
            >
            <CardContent className="p-2">
              <div className="flex items-center justify-between">
                {/* Left section: Avatar + Info */}
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8 hidden md:block">
                    <AvatarFallback className="bg-black text-red-600  text-lg">
                      {subscriber.name
                        ? subscriber.name[0].toUpperCase()
                        : subscriber.email[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex flex-col space-y-1">
                    {
                      subscriber.name && (
                      <h3 className="font-medium text-gray-900">
                      {subscriber.name}
                    </h3>
                      )
                    }
                  
                    <p className="text-gray-500 text-sm truncate max-w-[150px] ">
                      {subscriber.email}
                    </p>
                    <span className="text-xs text-gray-400">
                      Joined: {formatDate(subscriber.createdAt)}
                    </span>
                    <Badge className={getStatusColor(subscriber.status as SubscriptionStatus)}>
                    {subscriber.status}
                  </Badge>
                  </div>
                </div>

                {/* Right section: Status + Menu */}
                <div className="flex items-center gap-2 ">
                 

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="text-xs">
                      <DropdownMenuItem>
                        <Eye className="h-4 w-4 mr-2" /> View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Mail className="h-4 w-4 mr-2" /> Send Email
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">
                        <Trash2 className="h-4 w-4 mr-2" /> Remove
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardContent>
          </Card>

            ))}
          </div>
        )}
      </div>

      <AddSubscriberDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
      />
    </div>
  );
}