"use client";

import { useState, useEffect } from "react";
import { getSubscribers } from "@/actions/subscriber/get.subscribers";
import { Subscriber } from "../generated/prisma";
import { useAuthUser } from "../auth/getClientAuth";

export default function useSubscribersData() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);

  const { user } = useAuthUser();
  const newsLetterOwnerId = user?.id;

  useEffect(() => {
    if (!newsLetterOwnerId) return;

    const fetchSubscribers = async () => {
      try {
        setLoading(true);
        const res = await getSubscribers();

        if (res.error) {
          throw new Error(res.error);
        }

        setSubscribers(res.subscribers || []);
      } catch (error) {
        console.error("Error fetching subscribers:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscribers();
  }, [newsLetterOwnerId]);

  return { subscribers, loading };
}
