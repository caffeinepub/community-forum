import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Id } from "../backend";
import { useActor } from "./useActor";

export function useListCategories() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listCategories();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useListThreadsByCategory(categoryId: Id) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["threads", categoryId.toString()],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listThreadsByCategory(categoryId);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useThreadWithPosts(threadId: Id) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["thread", threadId.toString()],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getThreadWithPosts(threadId);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateThread() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      title,
      body,
      categoryId,
    }: { title: string; body: string; categoryId: Id }) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.createThread(title, body, categoryId);
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({
        queryKey: ["threads", vars.categoryId.toString()],
      });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}

export function useCreatePost() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ threadId, body }: { threadId: Id; body: string }) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.createPost(threadId, body);
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({
        queryKey: ["thread", vars.threadId.toString()],
      });
    },
  });
}

export function useUpvoteThread() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (threadId: Id) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.upvoteThread(threadId);
    },
    onSuccess: (_, threadId) => {
      queryClient.invalidateQueries({
        queryKey: ["thread", threadId.toString()],
      });
      queryClient.invalidateQueries({ queryKey: ["threads"] });
    },
  });
}

export function useIsAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateCategory() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      name,
      description,
    }: { name: string; description: string }) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.createCategory(name, description);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}
