import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  acceptFriendRequest,
  createCoupleSpace,
  fetchFriendActivity,
  fetchFriendViews,
  fetchListCompare,
  fetchMySpaces,
  leaveSpace,
  removeFriendship,
  searchProfiles,
  sendFriendRequest,
} from "../data/social";

export function useFriends(selfId: string | undefined) {
  return useQuery({
    queryKey: ["friends", selfId],
    queryFn: () => fetchFriendViews(selfId as string),
    enabled: !!selfId,
  });
}

export function useProfileSearch(term: string, selfId: string | undefined) {
  return useQuery({
    queryKey: ["profile-search", term, selfId],
    queryFn: () => searchProfiles(term, selfId as string),
    enabled: !!selfId && term.trim().length >= 2,
  });
}

export function useFriendActions(selfId: string) {
  const qc = useQueryClient();
  const invalidate = () => {
    void qc.invalidateQueries({ queryKey: ["friends", selfId] });
    void qc.invalidateQueries({ queryKey: ["profile-search"] });
  };
  return {
    request: useMutation({
      mutationFn: (targetId: string) => sendFriendRequest(selfId, targetId),
      onSuccess: invalidate,
    }),
    accept: useMutation({
      mutationFn: (friendshipId: string) => acceptFriendRequest(friendshipId),
      onSuccess: invalidate,
    }),
    remove: useMutation({
      mutationFn: (friendshipId: string) => removeFriendship(friendshipId),
      onSuccess: invalidate,
    }),
  };
}

export function useFriendActivity(selfId: string | undefined) {
  return useQuery({
    queryKey: ["friend-activity", selfId],
    queryFn: () => fetchFriendActivity(24),
    enabled: !!selfId,
    staleTime: 60_000,
  });
}

export function useListCompare(friendId: string | undefined) {
  return useQuery({
    queryKey: ["list-compare", friendId],
    queryFn: () => fetchListCompare(friendId as string),
    enabled: !!friendId,
    staleTime: 30_000,
  });
}

export function useSpaces(selfId: string | undefined) {
  return useQuery({
    queryKey: ["spaces", selfId],
    queryFn: () => fetchMySpaces(selfId as string),
    enabled: !!selfId,
  });
}

export function useSpaceActions(selfId: string) {
  const qc = useQueryClient();
  return {
    create: useMutation({
      mutationFn: (args: { friendId: string; name: string }) =>
        createCoupleSpace(args.friendId, args.name),
      onSuccess: () => qc.invalidateQueries({ queryKey: ["spaces", selfId] }),
    }),
    leave: useMutation({
      mutationFn: (spaceId: string) => leaveSpace(spaceId, selfId),
      onSuccess: () => qc.invalidateQueries({ queryKey: ["spaces", selfId] }),
    }),
  };
}
