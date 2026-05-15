# Seniorlink Web — 디자인 가이드 (웹)

> **버전**: 0.4 · **브랜드·토큰 SSOT**: [design/DESIGN.md](./design/DESIGN.md) (YAML 프론트매터 + 서술 명세)  
> **연계**: [prd.md](./prd.md) · [ia.md](./ia.md) · [stack-next-supabase.md](./stack-next-supabase.md)

---

## 1. 원본과의 관계

색·타이포·간격·그림자·컴포넌트 원칙의 **정본**은 저장소 내 [design/DESIGN.md](./design/DESIGN.md)입니다. 상단 YAML은 도구/빌드 파이프라인에서 토큰으로 소비할 수 있고, 본 문서는 **Next.js 웹 구현** 시 변수 이름·우선순위·주의사항만 압축합니다.

**백엔드 스택과 무관**: Supabase 대시보드 기본 테마·Studio UI는 제품 브랜드가 아닙니다. **고객이 보는 앱 UI**는 항상 [design/DESIGN.md](./design/DESIGN.md) / 본 문서 토큰만 적용합니다([stack-next-supabase.md](./stack-next-supabase.md) 2절 design 항목과 동일).

---

## 2. 시맨틱 색상 (YAML → 웹 CSS 변수)

`DESIGN.md`의 `colors` 키를 아래처럼 매핑하는 것을 권장합니다.

| YAML 키 | 용도 | Hex |
|---------|------|-----|
| `primary` | 브랜드 주색, Primary 버튼 배경 | `#002444` |
| `on-primary` | Primary 위 텍스트 | `#ffffff` |
| `primary-container` | 틴트 표면·칩 배경 등 | `#1a3a5c` |
| `on-primary-container` | 틴트 위 보조 텍스트 | `#87a4cc` |
| `secondary` | CTA 배경 (Warm Gold) | `#795900` |
| `on-secondary` | CTA 위 텍스트(문서: Navy 권장 — 구현 시 `on-secondary` 또는 `primary`로 대비 검증) | `#ffffff` (문서 컴포넌트 절에서는 Gold 배경 + Navy 텍스트 명시) |
| `secondary-container` / `on-secondary-container` | 고정/컨테이너 톤 | `#fece65` / `#755700` |
| `background` / `on-background` | 페이지 배경·본문 | `#faf9f6` / `#1a1c1a` |
| `surface` … `surface-container-highest` | 카드·레이어 스택 | `#faf9f6` ~ `#e3e2df` 계열 |
| `surface-container-lowest` | 카드 면 등 밝은 표면 | `#ffffff` |
| `outline` / `outline-variant` | 구분선·비강조 테두리 | `#73777f` / `#c3c6cf` |
| `error` 및 `error-container` 계열 | 폼·인라인 오류 | `#ba1a1a` 등 |

그림자: Navy 틴트 `#1A3A5C` **8% 투명도** — `DESIGN.md` “입체감” 절의 레벨 1~3(Y/Blur)과 함께 사용합니다.

---

## 3. 타이포그래피 스케일 (YAML `typography`)

| 스타일 키 | 폰트 | 크기 | 굵기 | 행간 |
|-----------|------|------|------|------|
| `display-lg` | Manrope | 48px | 700 | 1.2 |
| `display-md` | Manrope | 36px | 700 | 1.3 |
| `headline-lg` | Manrope | 28px | 600 | 1.4 |
| `headline-md` | Manrope | 22px | 600 | 1.4 |
| `body-lg` | Work Sans | 18px | 400 | 1.6 |
| `body-md` | Work Sans | 16px | 400 | 1.6 |
| `label-lg` | Work Sans | 16px | 600 | 1.4 (+ letter-spacing 0.02em) |
| `label-md` | Work Sans | 14px | 600 | 1.4 (+ letter-spacing 0.03em) |

웹: `next/font/google`으로 Manrope·Work Sans 로드 후 CSS 변수(예: `--font-display`, `--font-body`)에 할당합니다.

---

## 4. 형태·간격 (`rounded` · `spacing`)

| 토큰 | 값 | 웹 활용 |
|------|-----|---------|
| `rounded.lg` | 1rem (16px) | 카드·주요 블록 기본 반지름 |
| `rounded.DEFAULT` / `md` | 0.5rem / 0.75rem | 보조 컨테이너 |
| `rounded` (버튼·필드) | 문서 본문: **8px** | 입력·Primary 보조 |
| `rounded.full` | pill | 칩·태그 |
| `spacing.unit` | 8px | 그리드 기본 |
| `spacing.stack-gap` | 24px | 컴포넌트 세로 간격 하한 |
| `spacing.padding-card` | 32px | 카드 내부 패딩 하한 |
| `spacing.gutter` | 24px | 12컬럼 그리드 거터 |
| `spacing.container-max` | 1280px | 메인 콘텐츠 `max-width` |

---

## 5. 컴포넌트 (DESIGN.md “컴포넌트” 절 준수)

1. **버튼**: Primary — Navy 배경 + 밝은 텍스트, **높이 56px**. CTA — Warm Gold 배경 + **Navy 텍스트**(가시성 극대화 문구 따름).
2. **카드**: 반지름 **16px 이상**, 패딩 **32px**; 카드 내 **Navy 헤더**로 섹션 구분.
3. **입력**: 흰 배경, 포커스 **2px Navy** 테두리; **레이블 상시 표시**(플레이스홀더만 금지), 레이블은 필드 위·강조 굵기.
4. **칩·태그**: 연한 Navy 틴트 배경 + 진한 Navy 텍스트, **알약형**.
5. **목록**(매칭·프로필): 행 간 **수직 여유 24px**, 연한 회청 **구분선**으로 구획.

---

## 5.1 역할별 앱 셸 (기업·시니어)

- **동일 토큰**: 기업 대시보드와 시니어 워크스페이스는 **색·타이포·버튼·카드** 규칙을 공유합니다([ia.md](./ia.md) §5).
- **구분**: 상단 바 제목(“기업 대시보드” / “시니어 워크스페이스”)·좌측 내비 항목만 역할에 맞게 바꿉니다. **시니어 전용으로 별도 브랜드 팔레트를 두지 않습니다.**

---

## 6. 입체감 (레벨 0~3)

앱 셸·모달·드롭다운에 `DESIGN.md`의 레벨 정의를 그대로 적용합니다(배경 → 카드 → 인터랙티브 → 모달).

---

## 7. 접근성 체크리스트 (웹)

- `DESIGN.md` 목표: 핵심 텍스트 **WCAG AAA** 수준 고대비 지향.
- 키보드만으로 TF 작성 → 제안 발송 완료 가능.
- 포커스 링이 배경·Primary와 구분되도록 유지.
- 상태는 색만이 아니라 아이콘·텍스트 병행.
- 폼 오류: `aria-describedby`로 필드와 메시지 연결.

---

## 8. Tailwind / 테마

`theme.extend`에 YAML Hex를 반영하거나, 빌드 단계에서 `design/DESIGN.md`의 YAML을 파싱해 CSS 변수를 생성합니다. shadcn/ui 사용 시 동일 토큰을 한 번만 주입합니다.

---

## 9. 변경 이력

| 날짜 | 버전 | 내용 |
|------|------|------|
| 2026-05-14 | 0.1 | 최초 작성(웹 적용 요약) |
| 2026-05-14 | 0.2 | `docs/design/DESIGN.md` SSOT 반영, 토큰·타이포·컴포넌트 정렬 |
| 2026-05-14 | 0.4 | 시니어·기업 공용 셸(§5.1): 동일 토큰·내비만 역할별 분기 |
