import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { RequestStatus } from "@/lib/tf-request";

export type DashboardCounts = {
  /** `open` · `matching` · `in_progress` */
  tfActive: number;
  /** `pending` 제안 */
  proposalsPending: number;
  /** `draft` · `active` · `settlement_requested` 계약 */
  contractsPipeline: number;
};

export type DashboardRecentRequest = {
  id: string;
  title: string;
  status: RequestStatus | string;
  created_at: string;
};

export type DashboardSnapshot = {
  counts: DashboardCounts;
  recentRequests: DashboardRecentRequest[];
  loadError: string | null;
};

export const getDashboardSnapshot = cache(
  async (): Promise<DashboardSnapshot> => {
    const supabase = await createClient();

    const [tfRes, propRes, ctrRes, recentRes] = await Promise.all([
      supabase
        .from("tf_requests")
        .select("*", { count: "exact", head: true })
        .in("status", ["open", "matching", "in_progress"]),
      supabase
        .from("proposals")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending"),
      supabase
        .from("contracts")
        .select("*", { count: "exact", head: true })
        .in("status", ["draft", "active", "settlement_requested"]),
      supabase
        .from("tf_requests")
        .select("id, title, status, created_at")
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

    const firstError =
      tfRes.error?.message ??
      propRes.error?.message ??
      ctrRes.error?.message ??
      recentRes.error?.message ??
      null;

    return {
      counts: {
        tfActive: tfRes.count ?? 0,
        proposalsPending: propRes.count ?? 0,
        contractsPipeline: ctrRes.count ?? 0,
      },
      recentRequests: (recentRes.data ?? []) as DashboardRecentRequest[],
      loadError: firstError,
    };
  }
);
