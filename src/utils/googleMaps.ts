/**
 * Extracts the source URL from iframe embed code
 */
export const extractSrcFromEmbedCode = (embedCode: string): string => {
  // Try to extract src from iframe embed code
  const srcMatch = embedCode.match(/src=["']([^"']+)["']/);
  if (srcMatch) {
    return srcMatch[1];
  }
  
  // If no src found, try to extract URL from the embed code
  const urlMatch = embedCode.match(/https?:\/\/[^\s"']+/);
  if (urlMatch) {
    return urlMatch[0];
  }
  
  // If still no match, return the embed code as is (might be a direct URL)
  return embedCode;
};

/**
 * Extracts API key from Google Maps embed URL
 */
export const extractApiKeyFromUrl = (url: string): string => {
  const keyMatch = url.match(/key=([^&]+)/);
  return keyMatch ? keyMatch[1] : '';
};

/**
 * Checks if a URL is a Google Maps embed
 */
export const isGoogleMapsEmbed = (url: string): boolean => {
  return url.includes('google.com/maps/embed');
};

/**
 * Generates a new Google Maps embed URL for a specific location
 */
export const generateGoogleMapsUrl = (apiKey: string, location: string): string => {
  const encodedQuery = encodeURIComponent(location.trim());
  return `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${encodedQuery}&maptype=roadmap`;
};

/**
 * Updates a map URL with a new search query
 */
export const updateMapUrlWithSearch = (baseUrl: string, searchQuery: string): string => {
  if (isGoogleMapsEmbed(baseUrl)) {
    const apiKey = extractApiKeyFromUrl(baseUrl);
    if (apiKey) {
      return generateGoogleMapsUrl(apiKey, searchQuery);
    }
  }
  
  // For non-Google Maps embeds, try to update query parameter
  try {
    const url = new URL(baseUrl);
    url.searchParams.set('q', searchQuery.trim());
    return url.toString();
  } catch {
    // If URL parsing fails, return original URL
    return baseUrl;
  }
};
