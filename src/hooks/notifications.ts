import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import {
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "../data/notifications";

function notificationsKey(userId: string | undefined) {
  return ["notifications", userId] as const;
}

/** Recent notifications for the signed-in user, kept live with a realtime
 *  subscription so the bell updates the moment a friend rates or notes
 *  something, without waiting for a refetch. */
export function useNotifications(userId: string | undefined) {
  const qc = useQueryClient();
  const query = useQuery({
    queryKey: notificationsKey(userId),
    queryFn: () => fetchNotifications(),
    enabled: !!userId,
    staleTime: 30_000,
  });

  useEffect(() => {
    const sb = supabase;
    if (!userId || !sb) return;
    const channel = sb
      .channel(`notifications:${userId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "notifications", filter: `user_id=eq.${userId}` },
        () => void qc.invalidateQueries({ queryKey: notificationsKey(userId) }),
      )
      .subscribe();
    return () => void sb.removeChannel(channel);
  }, [userId, qc]);

  return query;
}

export function useMarkNotificationRead(userId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => markNotificationRead(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: notificationsKey(userId) }),
  });
}

export function useMarkAllNotificationsRead(userId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => markAllNotificationsRead(),
    onSuccess: () => qc.invalidateQueries({ queryKey: notificationsKey(userId) }),
  });
}
