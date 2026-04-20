"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase-server";

// This is a real server action for the MVP
export async function revokeConsent(id: string) {
  console.log(`Revoking consent for ID: ${id}`);
  
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  // 1. Get company details for history
  const { data: company } = await supabase
    .from('companies')
    .select('name, data_types')
    .eq('id', id)
    .single();

  // 2. Update company status
  const { error: updateError } = await supabase
    .from('companies')
    .update({ status: 'REVOKED' })
    .eq('id', id)
    .eq('user_id', user.id);
  
  if (updateError) return { success: false, error: updateError.message };

  // 3. Log to history
  if (company) {
    await supabase.from('history').insert({
      user_id: user.id,
      company_name: company.name,
      action: 'REVOKED',
      data_types: company.data_types.map((dt: any) => dt.name)
    });
  }
  
  revalidatePath("/");
  return { success: true };
}

export async function connectService(serviceName: string) {
  console.log(`Connecting service: ${serviceName}`);
  
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  // Simulated connection for the demo
  // In a real app, this would involve OAuth or API key exchange
  const { error } = await supabase.from('companies').insert({
    user_id: user.id,
    name: serviceName,
    category: 'CONSUMER',
    risk: 'LOW',
    status: 'ACTIVE',
    description: 'Manually connected service for demo purposes.',
    logo_uid: serviceName.toLowerCase()
  });

  if (error) return { success: false, error: error.message };

  revalidatePath("/");
  return { success: true };
}
