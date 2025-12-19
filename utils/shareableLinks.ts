/**
 * Helper functions for generating shareable dashboard links
 */

import { encryptUserId } from './encryption';

/**
 * Generates a shareable link to the public dashboard
 * @param baseUrl - The base URL of your deployed web app (e.g., "https://your-domain.com")
 * @param userId - The user ID to encrypt in the URL
 * @returns Full URL to the shared dashboard with encrypted user ID
 */
export async function generateSharedDashboardLink(baseUrl: string, userId: string): Promise<string> {
  const encryptedUserId = await encryptUserId(userId);
  return `${baseUrl}/shared-dashboard?token=${encryptedUserId}`;
}

/**
 * Generates a shareable link to a specific device's usage history
 * @param baseUrl - The base URL of your deployed web app (e.g., "https://your-domain.com")
 * @param deviceId - The device ID (e.g., "device-001")
 * @param userId - The user ID to encrypt in the URL
 * @returns Full URL to the shared usage history for that device with encrypted user ID
 */
export async function generateSharedDeviceHistoryLink(baseUrl: string, deviceId: string, userId: string): Promise<string> {
  const encryptedUserId = await encryptUserId(userId);
  return `${baseUrl}/shared-usage-history?deviceId=${encodeURIComponent(deviceId)}&userId=${encryptedUserId}`;
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
  
  // Use the environment variable for the app URL
  return process.env.EXPO_PUBLIC_APP_URL || "http://localhost:8081";
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
