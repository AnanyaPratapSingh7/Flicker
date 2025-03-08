import { Link as TanStackLink, useNavigate as useTanStackNavigate, useParams as useTanStackParams, useSearch as useTanStackSearch } from '@tanstack/react-router';
import type { RegisteredRouter } from '@tanstack/react-router';
import { router } from '../routes';

// Re-export TanStack router components with simpler names
export const Link = TanStackLink;
export const useNavigate = useTanStackNavigate;

// Helper for using params with proper typing
export function useParams<TPath extends keyof RegisteredRouter['routesByPath']>(
  options: { from: TPath }
) {
  return useTanStackParams({ ...options, router });
}

// Helper for using search params with proper typing
export function useSearch<TPath extends keyof RegisteredRouter['routesByPath']>(
  options: { from: TPath }
) {
  return useTanStackSearch({ ...options, router });
}
