"use server";

import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

export interface UserSettings {
  stealth_mode: boolean;
  notifications_enabled: boolean;
  alert_frequency: "all" | "high_priority";
  handshake_interval: number;
}

export async function getUserSettings(userId: string): Promise<UserSettings | null> {
  const { data, error } = await supabase
    .from("profile_settings")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      // Row not found, create defaults
      const defaults: UserSettings = {
        stealth_mode: false,
        notifications_enabled: true,
        alert_frequency: "high_priority",
        handshake_interval: 120,
      };
      
      const { data: newData, error: createError } = await supabase
        .from("profile_settings")
        .insert({
          user_id: userId,
          ...defaults
        })
        .select()
        .single();

      if (createError) {
        console.error("Failed to create default settings:", createError.message);
        return defaults;
      }
      return newData;
    }
    console.error("Failed to fetch settings:", error.message);
    return null;
  }

  return data;
}

export async function updateUserSettings(userId: string, settings: Partial<UserSettings>) {
  const { error } = await supabase
    .from("profile_settings")
    .update(settings)
    .eq("user_id", userId);

  if (error) {
    console.error("Failed to update settings:", error.message);
    throw new Error(error.message);
  }

  revalidatePath("/settings");
  return { success: true };
}

export async function deleteUserAccount(userId: string) {
  // 1. Fetch all active companies to trigger GDPR erasure (optional based on plan)
  const { data: companies } = await supabase
    .from("companies")
    .select("name, status, policy_report, data_types")
    .eq("user_id", userId)
    .eq("status", "ACTIVE");

  // Note: Mass GDPR erasure logic would go here if approved. 
  // For MVP, we proceed with data purge.

  // 2. Cascade delete will handle companies, history, and profile_settings 
  // because they all reference auth.users(id) with ON DELETE CASCADE.
  
  const { error } = await supabase.auth.admin.deleteUser(userId);

  if (error) {
    console.error("Failed to delete user:", error.message);
    throw new Error(error.message);
  }

  return { success: true };
}
