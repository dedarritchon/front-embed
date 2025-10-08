import React from 'react';
import styled from 'styled-components';
import { Button, Input, Paragraph } from '@frontapp/ui-kit';
import { useLocationSearch } from '../hooks/useLocationSearch';

// Styled Components
const SearchContainer = styled.div`
  padding: 1rem;
  background: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
  display: flex;
  gap: 0.5rem;
  align-items: center;
`;

const AutocompleteContainer = styled.div`
  position: relative;
  flex: 1;
`;

const AutocompleteDropdown = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #dee2e6;
  border-top: none;
  border-radius: 0 0 4px 4px;
  max-height: 200px;
  overflow-y: auto;
  z-index: 1000;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const AutocompleteItem = styled.div`
  padding: 0.75rem;
  cursor: pointer;
  border-bottom: 1px solid #f8f9fa;
  
  &:hover {
    background: #f8f9fa;
  }
  
  &:last-child {
    border-bottom: none;
  }
`;

const AutocompleteMainText = styled.div`
  font-weight: 500;
  color: #212529;
  margin-bottom: 0.25rem;
`;

const AutocompleteSecondaryText = styled.div`
  font-size: 0.875rem;
  color: #6c757d;
`;

const LoadingSpinner = styled.div`
  padding: 0.75rem;
  text-align: center;
  color: #6c757d;
  font-size: 0.875rem;
`;

const ErrorMessage = styled.div`
  padding: 0.75rem;
  font-size: 0.875rem;
`;

interface LocationSearchProps {
  onLocationSelect: (location: string) => void;
  placeholder?: string;
}

export const LocationSearch: React.FC<LocationSearchProps> = ({
  onLocationSelect,
  placeholder = "Search for a location..."
}) => {
  const {
    searchQuery,
    searchResults,
    showAutocomplete,
    isLoadingAutocomplete,
    handleInputChange,
    handleResultSelect,
    handleInputFocus,
    handleInputBlur,
    handleSearch,
  } = useLocationSearch(onLocationSelect);

  return (
    <SearchContainer>
      <AutocompleteContainer>
        <Input
          placeholder={placeholder}
          value={searchQuery}
          onChange={(value: string) => {
            // Create a synthetic event for compatibility with our hook
            const syntheticEvent = {
              target: { value }
            } as React.ChangeEvent<HTMLInputElement>;
            handleInputChange(syntheticEvent);
          }}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
        />
        {showAutocomplete && (
          <AutocompleteDropdown>
            {isLoadingAutocomplete ? (
              <LoadingSpinner>Loading suggestions...</LoadingSpinner>
            ) : searchResults.length > 0 ? (
              searchResults.map((result) => (
                <AutocompleteItem
                  key={result.place_id}
                  onClick={() => handleResultSelect(result)}
                >
                  <AutocompleteMainText>
                    {result.structured_formatting.main_text}
                  </AutocompleteMainText>
                  <AutocompleteSecondaryText>
                    {result.structured_formatting.secondary_text}
                  </AutocompleteSecondaryText>
                </AutocompleteItem>
              ))
            ) : (
              <LoadingSpinner>No results found</LoadingSpinner>
            )}
          </AutocompleteDropdown>
        )}
      </AutocompleteContainer>
      <Button 
        type="primary"
        onClick={handleSearch}
        isDisabled={!searchQuery.trim()}
      >
        Search
      </Button>
    </SearchContainer>
  );
};
