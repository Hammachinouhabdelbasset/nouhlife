import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

async function apiFetch(url: string, token: string, options?: RequestInit) {
  const res = await fetch(`${BASE}/api${url}`, {
    ...options,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, ...(options?.headers ?? {}) },
  });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
}

export function useGamification() {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: ["gamification"],
    queryFn: async () => {
      const token = await getToken();
      return apiFetch("/gamification/me", token!);
    },
    staleTime: 30_000,
  });
}

export function useDailyLogin() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const token = await getToken();
      return apiFetch("/gamification/daily-login", token!, { method: "POST" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gamification"] });
    },
  });
}
