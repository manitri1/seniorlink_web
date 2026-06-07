# SPEC-API-002 (Compact)

## Requirements

- REQ-CONTRACT-001: `/contracts` 목록 + `/contracts/[contractId]` 상세, contracts를 status/progress%/시니어 이름/TF 제목 nested select 조회.
- REQ-CONTRACT-002: When PDF 요청, Storage 업로드 또는 Edge Function 생성 → pdf_url contracts 저장. generateContractPdf Server Action + buildContractPdfBytes 순수 PDF 생성기 + contracts 버킷 + 1년 서명 URL 구현 완료.
- REQ-CONTRACT-003: While 상세, when 정산/리뷰 상태 변경, progress%/status 일관 갱신.
- REQ-SETTLEMENT-001: While `/contracts/[contractId]/settlement`, settlements Server Action(RLS) CRUD.
- REQ-SETTLEMENT-002: While 정산 진행, status 스테퍼 pending → held → released/failed.
- REQ-WEBHOOK-001: When Toss 웹훅 `/api/webhooks/payment` 수신, 서명 검증 후 service role로 정산 status 갱신. Basic Auth 검증 + mapTossStatus + service role DB 업데이트 구현 완료.
- REQ-WEBHOOK-002: If 서명 검증 실패, then 요청 거부 + DB 미갱신.
- REQ-REVIEW-001: When 리뷰 생성, contract.status='completed' AND reviewer=auth.uid()일 때만 contract_reviews insert.
- REQ-REVIEW-002: If status≠completed 또는 reviewer≠auth.uid(), then 리뷰 차단.
- REQ-SENIOR-CONTRACT-001: `/senior/contracts` RLS 읽기 전용 목록.

## Acceptance Criteria

- Given 계약 존재, When 목록/상세 접근, Then status/progress%/시니어 이름/TF 제목 nested 표시.
- Given 정산 진행, When settlement 접근, Then 스테퍼 pending→held→released/failed + CRUD.
- Given completed 계약 당사자, When 리뷰 작성, Then insert; 조건 불충족 시 차단.
- Given Toss 웹훅 수신, When 서명 통과, Then service role 정산 갱신; 실패 시 거부+미갱신. ✅
- Given 계약 체결, When PDF 요청, Then PDF 생성 + pdf_url 저장. ✅
- Given 시니어 당사자, When `/senior/contracts` 접근, Then RLS 읽기 전용 목록.
