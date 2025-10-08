export interface AutocompletePrediction {
  description: string;
  place_id: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

export interface GoogleMapsSearchProps {
  apiKey: string;
  onLocationSelect: (location: string) => void;
  placeholder?: string;
}

export interface UseGoogleMapsSearchReturn {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  autocompletePredictions: AutocompletePrediction[];
  showAutocomplete: boolean;
  isLoadingAutocomplete: boolean;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleKeyPress: (e: React.KeyboardEvent) => void;
  handleAutocompleteSelect: (prediction: AutocompletePrediction) => void;
  handleInputFocus: () => void;
  handleInputBlur: () => void;
  handleSearch: () => void;
}
