import { useEffect, useState } from "react";

export interface Donor {
  name: string;
  amount: number;
}

export interface DonorsData {
  recent: Donor[];
  weekly: Donor[];
  monthly: Donor[];
  allTime: Donor[];
}

/**
 * Hook to fetch donor data from API (currently mocked with JSON)
 * Replace the fetch URL when ready to use real API
 */
export const useDonors = () => {
  const [donors, setDonors] = useState<DonorsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDonors = async () => {
      try {
        setIsLoading(true);
        // Currently fetches from local JSON file
        // TODO: Replace with real API endpoint when ready
        const response = await fetch("/donors.json");
        if (!response.ok) {
          throw new Error("Failed to fetch donors data");
        }
        const data = await response.json();
        setDonors(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
        // Fallback data in case of error
        setDonors({
          recent: [],
          weekly: [],
          monthly: [],
          allTime: [],
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDonors();
  }, []);

  return { donors, isLoading, error };
};
