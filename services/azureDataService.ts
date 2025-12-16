import { supabase } from "../lib/supabase";

export interface AzureData {
  id: number;
  userId: string;
  roundCount: number;
  slimCount: number;
  roundVoidCount: number;
  slimVoidCount: number;
  enqueuedAt: string;
  azureDeviceId: string;
  createdAt: string;
}

export async function fetchAzureData(deviceId?: string, userId?: string): Promise<AzureData[]> {
  let query = supabase
    .from("azure_data_test")
    .select("id, user_id, round_count, slim_count, round_void_count, slim_void_count, enqueued_at, azure_device_id, created_at")
    .order("enqueued_at", { ascending: false });
  
  // Filter by user_id if provided
  if (userId) {
    query = query.eq("user_id", userId);
  }
  
  // Filter by device_id if provided
  if (deviceId) {
    query = query.eq("azure_device_id", deviceId);
  }
  
  const { data, error } = await query;
  if (error) {
    console.error("Error fetching Azure data:", error);
    return [];
  }
  return (
    (data as any[] || []).map((row) => ({
      id: row.id,
      userId: row.user_id,
      roundCount: row.round_count,
      slimCount: row.slim_count,
      roundVoidCount: Number(row.round_void_count),
      slimVoidCount: Number(row.slim_void_count),
      enqueuedAt: row.enqueued_at,
      azureDeviceId: row.azure_device_id,
      createdAt: row.created_at,
    }))
  );
}
