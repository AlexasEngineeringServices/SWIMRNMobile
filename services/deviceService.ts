import { supabase } from "../lib/supabase";

export interface Device {
  id: string;
  user_id: string;
  azure_device_id: string;
  device_name: string;
  created_at: string;
}

export const fetchDevices = async (userId: string): Promise<Device[]> => {
  const { data, error } = await supabase
    .from("devices")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data || [];
};

export const addDevice = async (userId: string, device_name: string, azure_device_id: string) => {
  const { error } = await supabase.from("devices").insert({
    user_id: userId,
    device_name,
    azure_device_id,
  });
  if (error) throw new Error(error.message);
};

export const editDevice = async (id: string, device_name: string, azure_device_id: string) => {
  const { error } = await supabase
    .from("devices")
    .update({ device_name, azure_device_id })
    .eq("id", id);
  if (error) throw new Error(error.message);
};

export const deleteDevice = async (id: string) => {
  const { error } = await supabase.from("devices").delete().eq("id", id);
  if (error) throw new Error(error.message);
};
