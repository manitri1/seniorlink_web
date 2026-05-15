import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import {
  isRequestStatus,
  mapPostgrestError,
  type TfRequestRow,
} from "@/lib/tf-request";

/** 동일 요청에 대해 레이아웃·페이지에서 중복 조회하지 않도록 캐시 */
export const getTfRequestById = cache(
  async (
    requestId: string
  ): Promise<{ row: TfRequestRow | null; error?: string }> => {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("tf_requests")
      .select("*")
      .eq("id", requestId)
      .maybeSingle();

    if (error) return { row: null, error: mapPostgrestError(error) };
    if (!data) return { row: null };
    if (!isRequestStatus(data.status)) {
      return { row: null, error: "알 수 없는 요청 상태입니다." };
    }
    return { row: data as TfRequestRow };
  }
);
