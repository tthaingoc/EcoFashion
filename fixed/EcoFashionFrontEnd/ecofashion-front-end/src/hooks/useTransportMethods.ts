import { useQuery } from '@tanstack/react-query';
import materialService, { TransportMethodOption } from '../services/api/materialService';

export const useTransportMethods = (country: string | null) => {
  return useQuery<TransportMethodOption[]>({
    queryKey: ['transportMethods', country],
    queryFn: async () => {
      if (!country) throw new Error('Country is required');
      const methods = await materialService.getAvailableTransportMethods(country);
      return methods;
    },
    enabled: !!country, // Only run query when country is provided
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });
};

export const useSupportedCountries = () => {
  return useQuery<string[]>({
    queryKey: ['supportedCountries'],
    queryFn: async () => {
      const countries = await materialService.getSupportedCountries();
      return countries;
    },
    staleTime: 30 * 60 * 1000, // 30 minutes - countries don't change often
    gcTime: 60 * 60 * 1000, // 1 hour
    retry: 2,
  });
};
