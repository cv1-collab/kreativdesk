import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2, // 2 minutes data cache to eliminate duplicate network calls
      gcTime: 1000 * 60 * 10,    // 10 minutes cache retention in memory
      refetchOnWindowFocus: false, // Prevent jarring re-renders when switching tabs
      retry: 1,
    },
    mutations: {
      retry: 0,
    },
  },
});
