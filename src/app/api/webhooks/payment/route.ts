import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

type TossStatus =
  | "DONE"
  | "CANCELED"
  | "PARTIAL_CANCELED"
  | "IN_PROGRESS"
  | "WAITING_FOR_DEPOSIT"
  | (string & Record<never, never>);

type SettlementStatus = "pending" | "held" | "released" | "failed";

function mapTossStatus(s: TossStatus): SettlementStatus | null {
  if (s === "DONE") return "released";
  if (s === "CANCELED" || s === "PARTIAL_CANCELED") return "failed";
  if (s === "IN_PROGRESS" || s === "WAITING_FOR_DEPOSIT") return "held";
  return null;
}

/**
 * Toss Payments 웹훅 Route Handler.
 * Basic Auth 서명 검증 후 service role 로 settlements 상태를 갱신합니다.
 *
 * 환경 변수:
 *   TOSS_SECRET_KEY — Toss 대시보드의 결제 시크릿 키
 */
export async function POST(request: Request) {
  const secret = process.env.TOSS_SECRET_KEY?.trim();
  if (!secret) {
    console.error("[webhook/payment] TOSS_SECRET_KEY not configured");
    return NextResponse.json(
      { ok: false, message: "Webhook secret not configured." },
      { status: 500 },
    );
  }

  // Toss Basic Auth: Authorization: Basic base64(secretKey:)
  const auth = request.headers.get("authorization") ?? "";
  const expected = `Basic ${Buffer.from(`${secret}:`).toString("base64")}`;
  if (auth !== expected) {
    return NextResponse.json({ ok: false, message: "Unauthorized." }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid JSON." }, { status: 400 });
  }

  const orderId = String(body.orderId ?? "").trim();
  const paymentKey = String(body.paymentKey ?? "").trim();
  const tossStatus = String(body.status ?? "") as TossStatus;

  if (!orderId) {
    return NextResponse.json({ ok: false, message: "Missing orderId." }, { status: 400 });
  }

  const settlementStatus = mapTossStatus(tossStatus);
  if (!settlementStatus) {
    // 알 수 없는 status — 멱등 처리 후 200 응답
    return NextResponse.json({ ok: true });
  }

  const supabase = createServiceClient();
  const now = new Date().toISOString();

  const patch: Record<string, unknown> = { status: settlementStatus, updated_at: now };
  if (settlementStatus === "released") {
    patch.released_at = now;
    if (paymentKey) patch.toss_payment_key = paymentKey;
  } else if (settlementStatus === "held") {
    patch.held_at = now;
    if (paymentKey) patch.toss_payment_key = paymentKey;
  } else if (settlementStatus === "failed") {
    patch.failed_reason = `Toss 결제 상태: ${tossStatus}`;
  }

  const { error } = await supabase
    .from("settlements")
    .update(patch)
    .eq("toss_order_id", orderId);

  if (error) {
    console.error("[webhook/payment] DB update failed:", error.message);
    return NextResponse.json(
      { ok: false, message: "DB update failed." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
