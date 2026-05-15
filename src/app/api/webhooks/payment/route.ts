import { NextResponse } from "next/server";

/**
 * Phase 6.4 스텁: 토스 등 결제·정산 웹훅은 서명 검증 후 service role로 DB를 갱신합니다.
 * 실제 연동 시 이 Route Handler에서 검증·멱등·감사 로그를 구현하세요.
 */
export async function POST(request: Request) {
  void request;
  return NextResponse.json(
    {
      ok: false,
      message:
        "Webhook not configured. Use dashboard demo actions for settlement flow.",
    },
    { status: 501 }
  );
}
