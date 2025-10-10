import { supabase } from "../lib/supabase";

export interface Device {
  id: string;
  user_id: string;
  device_number: string;
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

export const addDevice = async (userId: string, device_name: string, device_number: string) => {
  const { error } = await supabase.from("devices").insert({
    user_id: userId,
    device_name,
    device_number,
  });
  if (error) throw new Error(error.message);
};

export const editDevice = async (id: string, device_name: string, device_number: string) => {
  const { error } = await supabase
    .from("devices")
    .update({ device_name, device_number })
    .eq("id", id);
  if (error) throw new Error(error.message);
};

export const deleteDevice = async (id: string) => {
  const { error } = await supabase.from("devices").delete().eq("id", id);
  if (error) throw new Error(error.message);
};
