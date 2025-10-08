import { useState, useEffect, useRef } from 'react';
import type { AutocompletePrediction, UseGoogleMapsSearchReturn } from '../types/googleMaps';

// Extend the global Window interface for Google Maps
declare global {
  interface Window {
    google: any;
    initGoogleMaps: () => void;
  }
}

export const useGoogleMapsSearch = (
  apiKey: string,
  onLocationSelect: (location: string) => void
): UseGoogleMapsSearchReturn => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [autocompletePredictions, setAutocompletePredictions] = useState<AutocompletePrediction[]>([]);
  const [showAutocomplete, setShowAutocomplete] = useState<boolean>(false);
  const [isLoadingAutocomplete, setIsLoadingAutocomplete] = useState<boolean>(false);
  const [autocompleteTimeout, setAutocompleteTimeout] = useState<NodeJS.Timeout | null>(null);
  const [isGoogleMapsLoaded, setIsGoogleMapsLoaded] = useState<boolean>(false);
  const autocompleteService = useRef<any>(null);
  const placesService = useRef<any>(null);


  // Load Google Maps JavaScript API
  useEffect(() => {
    const loadGoogleMaps = () => {
      if (window.google && window.google.maps && window.google.maps.places) {
        setIsGoogleMapsLoaded(true);
        autocompleteService.current = new window.google.maps.places.AutocompleteService();
        placesService.current = new window.google.maps.places.PlacesService(
          document.createElement('div')
        );
        return;
      }

      // Check if script is already being loaded
      const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
      if (existingScript) {
        // Script is loading, wait for it
        const checkLoaded = setInterval(() => {
          if (window.google && window.google.maps && window.google.maps.places) {
            clearInterval(checkLoaded);
            setIsGoogleMapsLoaded(true);
            autocompleteService.current = new window.google.maps.places.AutocompleteService();
            placesService.current = new window.google.maps.places.PlacesService(
              document.createElement('div')
            );
          }
        }, 100);
        return;
      }

      // Load the script
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initGoogleMaps`;
      script.async = true;
      script.defer = true;
      
      // Set up global callback
      window.initGoogleMaps = () => {
        setIsGoogleMapsLoaded(true);
        autocompleteService.current = new window.google.maps.places.AutocompleteService();
        placesService.current = new window.google.maps.places.PlacesService(
          document.createElement('div')
        );
      };
      
      script.onerror = () => {
        console.error('Failed to load Google Maps API');
        setIsGoogleMapsLoaded(false);
      };
      
      document.head.appendChild(script);
    };

    if (apiKey) {
      loadGoogleMaps();
    }
  }, [apiKey]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (autocompleteTimeout) {
        clearTimeout(autocompleteTimeout);
      }
    };
  }, [autocompleteTimeout]);

  const fetchAutocompletePredictions = (input: string) => {
    if (!input.trim() || input.length < 2 || !isGoogleMapsLoaded || !autocompleteService.current) {
      setAutocompletePredictions([]);
      setShowAutocomplete(false);
      return;
    }

    setIsLoadingAutocomplete(true);
    
    const request = {
      input: input.trim(),
      types: ['geocode']
    };

    autocompleteService.current.getPlacePredictions(request, (predictions: any[], status: any) => {
      setIsLoadingAutocomplete(false);
      
      if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
        // Transform the predictions to match our interface
        const transformedPredictions: AutocompletePrediction[] = predictions.map((prediction: any) => ({
          description: prediction.description,
          place_id: prediction.place_id,
          structured_formatting: {
            main_text: prediction.structured_formatting?.main_text || prediction.description,
            secondary_text: prediction.structured_formatting?.secondary_text || ''
          }
        }));
        
        setAutocompletePredictions(transformedPredictions);
        setShowAutocomplete(true);
      } else {
        console.error('Autocomplete error:', status);
        setAutocompletePredictions([]);
        setShowAutocomplete(false);
      }
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    // Clear existing timeout
    if (autocompleteTimeout) {
      clearTimeout(autocompleteTimeout);
    }
    
    if (value.length >= 2 && isGoogleMapsLoaded) {
      // Debounce the autocomplete request
      const timeout = setTimeout(() => {
        fetchAutocompletePredictions(value);
      }, 300);
      setAutocompleteTimeout(timeout);
    } else {
      setAutocompletePredictions([]);
      setShowAutocomplete(false);
    }
  };

  const handleAutocompleteSelect = (prediction: AutocompletePrediction) => {
    setSearchQuery(prediction.description);
    setShowAutocomplete(false);
    setAutocompletePredictions([]);
    onLocationSelect(prediction.description);
  };

  const handleInputFocus = () => {
    if (autocompletePredictions.length > 0) {
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
    autocompletePredictions,
    showAutocomplete,
    isLoadingAutocomplete,
    handleInputChange,
    handleKeyPress,
    handleAutocompleteSelect,
    handleInputFocus,
    handleInputBlur,
    handleSearch,
  };
};
