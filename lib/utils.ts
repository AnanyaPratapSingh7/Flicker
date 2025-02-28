import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines multiple class names using clsx and optimizes them with tailwind-merge
 * This helps avoid class conflicts when using Tailwind CSS
 * 
 * @param inputs - Class values to be combined
 * @returns Optimized class string
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a number as currency
 * 
 * @param value - Number to format
 * @param currency - Currency code (default: USD)
 * @param locale - Locale for formatting (default: en-US)
 * @returns Formatted currency string
 */
export function formatCurrency(
  value: number,
  currency = "USD",
  locale = "en-US"
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(value);
}

/**
 * Formats a number with specified decimal places
 * 
 * @param value - Number to format
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted number string
 */
export function formatNumber(value: number, decimals = 2): string {
  return value.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Truncates text with ellipsis if it exceeds the specified length
 * 
 * @param text - Text to truncate
 * @param length - Maximum length before truncation (default: 30)
 * @returns Truncated text
 */
export function truncateText(text: string, length = 30): string {
  if (text.length <= length) return text;
  return `${text.substring(0, length)}...`;
}

/**
 * Truncates a blockchain address for display
 * 
 * @param address - Blockchain address to truncate
 * @param startChars - Number of characters to show at start (default: 6)
 * @param endChars - Number of characters to show at end (default: 4)
 * @returns Truncated address
 */
export function truncateAddress(
  address: string,
  startChars = 6,
  endChars = 4
): string {
  if (!address) return "";
  if (address.length <= startChars + endChars) return address;
  
  const start = address.substring(0, startChars);
  const end = address.substring(address.length - endChars);
  
  return `${start}...${end}`;
}

/**
 * Converts a hex color to RGBA
 * 
 * @param hex - Hex color code
 * @param alpha - Alpha value (0-1)
 * @returns RGBA color string
 */
export function hexToRgba(hex: string, alpha = 1): string {
  // Remove # if present
  hex = hex.replace("#", "");
  
  // Parse hex values
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  // Return rgba string
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Creates a gold gradient text style
 * 
 * @param intensity - Gradient intensity (0-1)
 * @returns CSS style object for gold gradient text
 */
export function goldGradientStyle(intensity = 1): React.CSSProperties {
  return {
    background: `linear-gradient(to right, rgba(255, 215, 0, ${intensity}), rgba(255, 193, 37, ${intensity}), rgba(184, 134, 11, ${intensity}))`,
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
    color: "transparent",
  };
}

/**
 * Debounces a function
 * 
 * @param fn - Function to debounce
 * @param ms - Debounce delay in milliseconds
 * @returns Debounced function
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  ms = 300
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  
  return function(...args: Parameters<T>) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), ms);
  };
}

/**
 * Generates a random ID
 * 
 * @param length - Length of the ID (default: 8)
 * @returns Random ID string
 */
export function generateId(length = 8): string {
  return Math.random()
    .toString(36)
    .substring(2, 2 + length);
}
