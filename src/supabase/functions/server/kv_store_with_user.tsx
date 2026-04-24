/* 
 * Extended KV Store with user_id tracking
 * This wraps the base kv_store functions and adds user_id to the table
 */

import { createClient } from "jsr:@supabase/supabase-js@2.49.8";

const client = () => createClient(
  Deno.env.get("SUPABASE_URL"),
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"),
);

// Set stores a key-value pair in the database with user_id
export const set = async (key: string, value: any, userId?: string): Promise<void> => {
  const supabase = client();
  const { error } = await supabase.from("kv_store_40d4d8fd").upsert({
    key,
    value,
    user_id: userId || null, // Add user_id column
  });
  if (error) {
    console.error('KV store set error:', error);
    throw new Error(error.message);
  }
};

// Get retrieves a key-value pair from the database
export const get = async (key: string): Promise<any> => {
  const supabase = client();
  const { data, error } = await supabase.from("kv_store_40d4d8fd").select("value").eq("key", key).maybeSingle();
  if (error) {
    throw new Error(error.message);
  }
  return data?.value;
};

// Delete deletes a key-value pair from the database
export const del = async (key: string): Promise<void> => {
  const supabase = client();
  const { error } = await supabase.from("kv_store_40d4d8fd").delete().eq("key", key);
  if (error) {
    throw new Error(error.message);
  }
};

// Sets multiple key-value pairs in the database with user_id
export const mset = async (keys: string[], values: any[], userId?: string): Promise<void> => {
  const supabase = client();
  const { error } = await supabase.from("kv_store_40d4d8fd").upsert(
    keys.map((k, i) => ({ 
      key: k, 
      value: values[i],
      user_id: userId || null,
    }))
  );
  if (error) {
    throw new Error(error.message);
  }
};

// Gets multiple key-value pairs from the database
export const mget = async (keys: string[]): Promise<any[]> => {
  const supabase = client();
  const { data, error } = await supabase.from("kv_store_40d4d8fd").select("value").in("key", keys);
  if (error) {
    throw new Error(error.message);
  }
  return data?.map((d) => d.value) ?? [];
};

// Deletes multiple key-value pairs from the database
export const mdel = async (keys: string[]): Promise<void> => {
  const supabase = client();
  const { error } = await supabase.from("kv_store_40d4d8fd").delete().in("key", keys);
  if (error) {
    throw new Error(error.message);
  }
};

// Search for key-value pairs by prefix
export const getByPrefix = async (prefix: string): Promise<any[]> => {
  const supabase = client();
  const { data, error } = await supabase.from("kv_store_40d4d8fd").select("key, value").like("key", prefix + "%");
  if (error) {
    throw new Error(error.message);
  }
  return data?.map((d) => d.value) ?? [];
};

// Search for key-value pairs by user_id
export const getByUserId = async (userId: string): Promise<any[]> => {
  const supabase = client();
  const { data, error } = await supabase.from("kv_store_40d4d8fd").select("key, value").eq("user_id", userId);
  if (error) {
    throw new Error(error.message);
  }
  return data?.map((d) => d.value) ?? [];
};
