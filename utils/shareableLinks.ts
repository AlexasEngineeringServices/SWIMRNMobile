/**
 * Helper functions for generating shareable dashboard links
 */

/**
 * Generates a shareable link to the public dashboard
 * @param baseUrl - The base URL of your deployed web app (e.g., "https://your-domain.com")
 * @returns Full URL to the shared dashboard
 */
export function generateSharedDashboardLink(baseUrl: string): string {
  return `${baseUrl}/shared-dashboard`;
}

/**
 * Generates a shareable link to a specific device's usage history
 * @param baseUrl - The base URL of your deployed web app (e.g., "https://your-domain.com")
 * @param deviceId - The device ID (e.g., "device-001")
 * @returns Full URL to the shared usage history for that device
 */
export function generateSharedDeviceHistoryLink(baseUrl: string, deviceId: string): string {
  return `${baseUrl}/shared-usage-history?deviceId=${encodeURIComponent(deviceId)}`;
}

/**
 * Copies a shareable link to the clipboard
 * @param url - The URL to copy
 * @returns Promise that resolves when copy is complete
 */
export async function copyShareableLinkToClipboard(url: string): Promise<boolean> {
  try {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(url);
      return true;
    }
    return false;
  } catch (error) {
    console.error("Failed to copy to clipboard:", error);
    return false;
  }
}

/**
 * Gets the shareable link configuration for the current environment
 * You can customize this based on your deployment setup
 */
export function getShareableBaseUrl(): string {
  if (typeof window !== "undefined") {
    // If running in a browser, use the current origin
    return window.location.origin;
  }
  
  // Default values for different environments
  // Update these with your actual deployment URLs
  const isDevelopment = process.env.NODE_ENV === "development";
  const isStaging = process.env.EXPO_PUBLIC_ENV === "staging";
  
  if (isDevelopment) {
    return "http://localhost:8081"; // or your local web dev server port
  } else if (isStaging) {
    return "https://staging.your-domain.com"; // Update with your staging URL
  } else {
    return "https://your-domain.com"; // Update with your production URL
  }
}

/**
 * Example usage in a component:
 * 
 * import { generateSharedDashboardLink, getShareableBaseUrl, copyShareableLinkToClipboard } from '@/utils/shareableLinks';
 * 
 * const handleShare = async () => {
 *   const baseUrl = getShareableBaseUrl();
 *   const link = generateSharedDashboardLink(baseUrl);
 *   const success = await copyShareableLinkToClipboard(link);
 *   
 *   if (success) {
 *     Alert.alert('Success', 'Link copied to clipboard!');
 *   }
 * };
 */
