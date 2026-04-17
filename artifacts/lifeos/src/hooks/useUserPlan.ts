import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

export interface UserPlan {
  userId: string;
  email: string;
  name: string;
  imageUrl: string;
  plan: "FREE" | "PRO" | "ELITE" | "BETA";
  role: "USER" | "ADMIN" | "SUPER_ADMIN";
  isAdmin: boolean;
  isBeta: boolean;
  features: {
    unlimitedTasks: boolean;
    unlimitedHabits: boolean;
    financeTracker: boolean;
    contentStudio: boolean;
    analytics: boolean;
    allThemes: boolean;
    engineeringLab: boolean;
    adminPanel: boolean;
    betaFeatures: boolean;
    advancedAnalytics: boolean;
    prioritySupport: boolean;
  };
}

export function useUserPlan() {
  const { getToken, isSignedIn } = useAuth();

  return useQuery<UserPlan>({
    queryKey: ["me"],
    queryFn: async () => {
      const token = await getToken();
      const res = await fetch(`${BASE}/api/me`, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error(`API error ${res.status}`);
      return res.json();
    },
    enabled: !!isSignedIn,
    staleTime: 5 * 60_000,
  });
}
