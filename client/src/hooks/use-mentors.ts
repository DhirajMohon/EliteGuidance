import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { z } from "zod";

export function useMentors(filters?: z.infer<typeof api.mentors.list.input>) {
  // Construct query string for key consistency
  const queryString = filters ? JSON.stringify(filters) : '';
  
  return useQuery({
    queryKey: [api.mentors.list.path, queryString],
    queryFn: async () => {
      // Build URL with query params
      const url = new URL(api.mentors.list.path, window.location.origin);
      if (filters?.university) url.searchParams.set("university", filters.university);
      if (filters?.expertise) url.searchParams.set("expertise", filters.expertise);
      
      const res = await fetch(url.toString(), { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch mentors");
      return api.mentors.list.responses[200].parse(await res.json());
    },
  });
}

export function useMentor(id: number) {
  return useQuery({
    queryKey: [api.mentors.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.mentors.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch mentor");
      return api.mentors.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}
