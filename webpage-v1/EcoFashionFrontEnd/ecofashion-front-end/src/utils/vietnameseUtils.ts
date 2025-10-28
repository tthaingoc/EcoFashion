/**
 * Utility functions for handling Vietnamese text
 */

/**
 * Remove Vietnamese accents/diacritics from a string
 * Example: "Phường Vườn Lài" -> "Phuong Vuon Lai"
 */
export function removeVietnameseAccents(str: string): string {
  if (!str) return "";

  // Normalize to NFD (Canonical Decomposition)
  str = str.normalize("NFD");

  // Remove combining diacritical marks
  str = str.replace(/[\u0300-\u036f]/g, "");

  // Replace Đ/đ with D/d
  str = str.replace(/[Đ]/g, "D");
  str = str.replace(/[đ]/g, "d");

  return str;
}

/**
 * Normalize Vietnamese string for searching
 * - Removes accents
 * - Converts to lowercase
 * - Trims whitespace
 * - Removes extra spaces
 */
export function normalizeVietnameseForSearch(str: string): string {
  if (!str) return "";

  return removeVietnameseAccents(str)
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " "); // Replace multiple spaces with single space
}

/**
 * Check if a Vietnamese string matches a search query (fuzzy matching)
 * Supports searching with or without accents
 *
 * @param text - The text to search in
 * @param query - The search query
 * @returns true if the text contains the query (case-insensitive, accent-insensitive)
 */
export function vietnameseSearchMatch(text: string, query: string): boolean {
  if (!query) return true;
  if (!text) return false;

  const normalizedText = normalizeVietnameseForSearch(text);
  const normalizedQuery = normalizeVietnameseForSearch(query);

  return normalizedText.includes(normalizedQuery);
}

/**
 * Filter and sort an array of items by Vietnamese text matching
 * Items that start with the query are ranked higher
 *
 * @param items - Array of items to filter
 * @param query - Search query
 * @param getTextFn - Function to extract text from item
 * @returns Filtered and sorted array
 */
export function filterVietnameseText<T>(
  items: T[],
  query: string,
  getTextFn: (item: T) => string
): T[] {
  if (!query) return items;

  const normalizedQuery = normalizeVietnameseForSearch(query);

  const matches = items
    .filter((item) => {
      const text = getTextFn(item);
      return vietnameseSearchMatch(text, query);
    })
    .sort((a, b) => {
      const textA = normalizeVietnameseForSearch(getTextFn(a));
      const textB = normalizeVietnameseForSearch(getTextFn(b));

      // Items starting with query come first
      const aStarts = textA.startsWith(normalizedQuery);
      const bStarts = textB.startsWith(normalizedQuery);

      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;

      // Otherwise sort alphabetically
      return textA.localeCompare(textB);
    });

  return matches;
}
