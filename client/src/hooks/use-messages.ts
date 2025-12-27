import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { z } from "zod";

export function useMessages(requestId: number) {
  const queryKey = buildUrl(api.messages.list.path, { requestId });
  
  return useQuery({
    queryKey: [queryKey],
    queryFn: async () => {
      const res = await fetch(queryKey, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch messages");
      return api.messages.list.responses[200].parse(await res.json());
    },
    enabled: !!requestId,
    // Poll for new messages every 3 seconds since we don't have WebSocket yet
    refetchInterval: 3000, 
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ requestId, content }: { requestId: number; content: string }) => {
      const url = buildUrl(api.messages.create.path, { requestId });
      const res = await fetch(url, {
        method: api.messages.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to send message");
      return api.messages.create.responses[201].parse(await res.json());
    },
    onSuccess: (data, variables) => {
      const queryKey = buildUrl(api.messages.list.path, { requestId: variables.requestId });
      queryClient.invalidateQueries({ queryKey: [queryKey] });
    },
  });
}
