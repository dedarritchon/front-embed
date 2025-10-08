import { useState } from 'react';

// Types for Nominatim API response
interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  type: string;
  importance: number;
}

interface LocationSearchResult {
  description: string;
  place_id: string;
  lat: string;
  lon: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

interface UseLocationSearchReturn {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchResults: LocationSearchResult[];
  showAutocomplete: boolean;
  isLoadingAutocomplete: boolean;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleKeyPress: (e: React.KeyboardEvent) => void;
  handleResultSelect: (result: LocationSearchResult) => void;
  handleInputFocus: () => void;
  handleInputBlur: () => void;
  handleSearch: () => void;
}

/**
 * Hook for location search using Nominatim (OpenStreetMap) - completely free
 */
export const useLocationSearch = (
  onLocationSelect: (location: string) => void
): UseLocationSearchReturn => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<LocationSearchResult[]>([]);
  const [showAutocomplete, setShowAutocomplete] = useState<boolean>(false);
  const [isLoadingAutocomplete, setIsLoadingAutocomplete] = useState<boolean>(false);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);


  const fetchLocationSuggestions = async (input: string) => {
    if (!input.trim() || input.length < 2) {
      setSearchResults([]);
      setShowAutocomplete(false);
      return;
    }

    setIsLoadingAutocomplete(true);
    
    try {
      // Use Nominatim API (free, no API key required)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?` +
        `format=json&` +
        `q=${encodeURIComponent(input.trim())}&` +
        `limit=5&` +
        `addressdetails=1&` +
        `extratags=1&` +
        `namedetails=1`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch location suggestions');
      }

      const data: NominatimResult[] = await response.json();
      
      // Transform the results to match our interface
      const transformedResults: LocationSearchResult[] = data.map((result) => {
        // Parse the display name to extract main and secondary text
        const parts = result.display_name.split(', ');
        const mainText = parts[0] || result.display_name;
        const secondaryText = parts.slice(1, 3).join(', ') || '';
        
        return {
          description: result.display_name,
          place_id: result.place_id.toString(),
          lat: result.lat,
          lon: result.lon,
          structured_formatting: {
            main_text: mainText,
            secondary_text: secondaryText,
          },
        };
      });
      
      setSearchResults(transformedResults);
      setShowAutocomplete(true);
    } catch (error) {
      console.error('Error fetching location suggestions:', error);
      setSearchResults([]);
      setShowAutocomplete(false);
    } finally {
      setIsLoadingAutocomplete(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    // Clear existing timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    if (value.length >= 2) {
      // Debounce the search request
      const timeout = setTimeout(() => {
        fetchLocationSuggestions(value);
      }, 300);
      setSearchTimeout(timeout);
    } else {
      setSearchResults([]);
      setShowAutocomplete(false);
    }
  };

  const handleResultSelect = (result: LocationSearchResult) => {
    setSearchQuery(result.description);
    setShowAutocomplete(false);
    setSearchResults([]);
    onLocationSelect(result.description);
  };

  const handleInputFocus = () => {
    if (searchResults.length > 0) {
      setShowAutocomplete(true);
    }
  };

  const handleInputBlur = () => {
    // Delay hiding to allow clicking on autocomplete items
    setTimeout(() => {
      setShowAutocomplete(false);
    }, 200);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    onLocationSelect(searchQuery.trim());
  };

  return {
    searchQuery,
    setSearchQuery,
    searchResults,
    showAutocomplete,
    isLoadingAutocomplete,
    handleInputChange,
    handleKeyPress,
    handleResultSelect,
    handleInputFocus,
    handleInputBlur,
    handleSearch,
  };
};
