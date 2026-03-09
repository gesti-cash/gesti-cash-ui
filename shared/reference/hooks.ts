import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../api/axios";
import { queryKeys } from "../api/react-query";

export interface Country {
  id: string;
  name: string;
  code?: string;
}

export interface City {
  id: string;
  name: string;
  country_id?: string;
}

export function useCountries() {
  return useQuery({
    queryKey: queryKeys.reference.countries,
    queryFn: async () => {
      const response = await apiClient.get<Country[]>("/reference/countries");
      return response.data;
    },
    staleTime: 1000 * 60 * 30, // 30 min
  });
}

export function useCities(countryId?: string | null) {
  return useQuery({
    queryKey: queryKeys.reference.cities(countryId ?? undefined),
    queryFn: async () => {
      const response = await apiClient.get<City[]>("/reference/cities", {
        params: countryId ? { country_id: countryId } : undefined,
      });
      return response.data;
    },
    enabled: true,
    staleTime: 1000 * 60 * 30,
  });
}
