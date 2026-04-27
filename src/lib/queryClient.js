import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Default: 5 minutes for historical/analytics data
      staleTime: 5 * 60_000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

// Override staleTime for real-time keys (today's habits, active workout)
export const REALTIME_STALE = 30_000
