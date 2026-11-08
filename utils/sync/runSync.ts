// utils/sync/runSync.ts

import { supabaseAdmin } from "@/utils/supabase/admin";

export interface SyncResult {
    recordsProcessed: number;
    metadata?: Record<string, unknown>;
  }


export async function runSync(
  syncType: string,
  syncFn: () => Promise<SyncResult>
) {
  const { data: log } = await supabaseAdmin
    .from("sync_log")
    .insert({
      sync_type: syncType,
    })
    .select()
    .single();

  try {
    const result = await syncFn();

    await supabaseAdmin
      .from("sync_log")
      .update({
        success: true,
        finished_at: new Date().toISOString(),
        records_processed: result.recordsProcessed,
        metadata: result.metadata,
      })
      .eq("id", log.id);

    return result;
  } catch (error) {
    await supabaseAdmin
      .from("sync_log")
      .update({
        success: false,
        finished_at: new Date().toISOString(),
        error_message:
          error instanceof Error
            ? error.message
            : String(error),
      })
      .eq("id", log.id);

    throw error;
  }
}