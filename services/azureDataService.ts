import { supabase } from "../lib/supabase";

export interface AzureData {
  id: number;
  deviceId: string; // UUID reference to devices table
  azureDeviceId: string; // Denormalized azure device ID
  roundCount: number;
  slimCount: number;
  roundVoidCount: number;
  slimVoidCount: number;
  enqueuedAt: string;
  rawPayload?: any; // JSONB field
  createdAt: string;
}

export async function fetchAzureData(
  azureDeviceId?: string,
  userId?: string
): Promise<AzureData[]> {
  let query = supabase
    .from("azure_data")
    .select(
      "id, device_id, azure_device_id, round_count, slim_count, round_void_count, slim_void_count, enqueued_at, raw_payload, created_at, devices!inner(user_id)"
    )
    .order("enqueued_at", { ascending: false });

  // Filter by user_id if provided (via join with devices table)
  if (userId) {
    query = query.eq("devices.user_id", userId);
  }

  // Filter by azure_device_id if provided
  if (azureDeviceId) {
    query = query.eq("azure_device_id", azureDeviceId);
  }

  const { data, error } = await query;
  if (error) {
    console.error("Error fetching Azure data:", error);
    return [];
  }
  return ((data as any[]) || []).map((row) => ({
    id: row.id,
    deviceId: row.device_id,
    azureDeviceId: row.azure_device_id,
    roundCount: row.round_count,
    slimCount: row.slim_count,
    roundVoidCount: Number(row.round_void_count),
    slimVoidCount: Number(row.slim_void_count),
    enqueuedAt: row.enqueued_at,
    rawPayload: row.raw_payload,
    createdAt: row.created_at,
  }));
}
