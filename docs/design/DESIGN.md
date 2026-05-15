---
name: Legacy Professionalism
colors:
  surface: '#faf9f6'
  surface-dim: '#dbdad7'
  surface-bright: '#faf9f6'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f4f3f0'
  surface-container: '#efeeeb'
  surface-container-high: '#e9e8e5'
  surface-container-highest: '#e3e2df'
  on-surface: '#1a1c1a'
  on-surface-variant: '#43474e'
  inverse-surface: '#2f312f'
  inverse-on-surface: '#f2f1ee'
  outline: '#73777f'
  outline-variant: '#c3c6cf'
  surface-tint: '#436084'
  primary: '#002444'
  on-primary: '#ffffff'
  primary-container: '#1a3a5c'
  on-primary-container: '#87a4cc'
  inverse-primary: '#abc9f2'
  secondary: '#795900'
  on-secondary: '#ffffff'
  secondary-container: '#fece65'
  on-secondary-container: '#755700'
  tertiary: '#00253d'
  on-tertiary: '#ffffff'
  tertiary-container: '#1b3b54'
  on-tertiary-container: '#87a5c2'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d2e4ff'
  primary-fixed-dim: '#abc9f2'
  on-primary-fixed: '#001c37'
  on-primary-fixed-variant: '#2a486b'
  secondary-fixed: '#ffdf9f'
  secondary-fixed-dim: '#eec058'
  on-secondary-fixed: '#261a00'
  on-secondary-fixed-variant: '#5b4300'
  tertiary-fixed: '#cce5ff'
  tertiary-fixed-dim: '#abcae8'
  on-tertiary-fixed: '#001d31'
  on-tertiary-fixed-variant: '#2b4963'
  background: '#faf9f6'
  on-background: '#1a1c1a'
  surface-variant: '#e3e2df'
typography:
  display-lg:
    fontFamily: Manrope
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.2'
  display-md:
    fontFamily: Manrope
    fontSize: 36px
    fontWeight: '700'
    lineHeight: '1.3'
  headline-lg:
    fontFamily: Manrope
    fontSize: 28px
    fontWeight: '600'
    lineHeight: '1.4'
  headline-md:
    fontFamily: Manrope
    fontSize: 22px
    fontWeight: '600'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Work Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Work Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-lg:
    fontFamily: Work Sans
    fontSize: 16px
    fontWeight: '600'
    lineHeight: '1.4'
    letterSpacing: 0.02em
  label-md:
    fontFamily: Work Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1.4'
    letterSpacing: 0.03em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  container-max: 1280px
  gutter: 24px
  margin-mobile: 20px
  padding-card: 32px
  stack-gap: 24px
---

# 시니어링크 디자인 시스템

## 브랜드 & 스타일

이 디자인 시스템은 "격조 있는 경험(Distinguished Experience)"이라는 개념을 중심으로 구성됩니다. 전통적인 기업 문화와 현대 AI 기반 효율성 사이의 간극을 메우며, 가독성·고대비 명확성·안정감을 최우선으로 추구합니다.

**Corporate Modernism**에서 영감을 받아 유행적인 시각적 혼잡함을 배제하고 구조적 완결성을 추구합니다. 넉넉한 여백과 의도된 색 팔레트를 통해 멘토링, 신뢰, 상호 존중의 감정을 불러일으킵니다. 모든 인터랙션은 정밀함과 명확한 소통을 중시하는 사용자에게 의도적이고 자연스럽게 느껴지도록 설계됩니다.

## 색상

팔레트의 근간은 **Deep Navy Blue**로, 기관에 대한 신뢰의 토대를 제공합니다. 이와 대비되는 **Warm Gold**는 고가치 액션과 퇴직 전문가가 가진 "황금 기준" 경험을 강조하는 데 사용됩니다.

배경에는 **Soft Off-White**를 사용해 순수 흰색 대비 눈 피로를 줄이고, 종이와 같은 따뜻한 독서 경험을 제공합니다. 핵심 텍스트에 대해 WCAG AAA 기준의 고대비율을 유지해 타깃 사용자층의 접근성을 보장합니다.

## 타이포그래피

이중 폰트 전략을 사용합니다. 헤드라인에는 현대적이고 균형 잡힌 **Manrope**를, 본문과 레이블에는 안정적이고 가독성 높은 **Work Sans**를 사용합니다.

본문 최소 크기는 16px이며, 장문 콘텐츠에는 18px를 권장합니다. 행간은 의도적으로 넉넉하게(1.6x) 설정해 사용자가 피로 없이 텍스트를 따라 읽을 수 있도록 합니다. 위계는 극단적인 크기 차이 대신 폰트 굵기와 색상으로 표현하여 차분하고 정돈된 흐름을 유지합니다.

## 레이아웃 & 여백

데스크탑에서는 **고정 그리드(Fixed Grid)** 모델을 사용해 콘텐츠가 중앙에 정렬되고 대형 모니터에서도 가독성을 유지합니다. 태블릿과 모바일에서는 유동적 모델로 전환합니다. 12컬럼 그리드에 넓은 24px 거터를 적용해 정보 밀도가 과부하처럼 느껴지지 않도록 합니다.

여백은 8px 모듈 단위로 구성되며, 컴포넌트 간 간격은 24px 이하로 줄어들지 않아야 합니다. 카드 내부 패딩은 최소 32px을 유지해 고급스럽고 여유로운 느낌을 줍니다.

## 입체감 & 깊이

**Tonal Layers**와 **Ambient Shadows**로 시각적 위계를 표현합니다. 딱딱한 테두리 대신 Navy 틴트(#1A3A5C, 8% 투명도)가 적용된 부드럽고 확산된 그림자로 표면을 띄워 "책상 위의 물건"처럼 직관적인 느낌을 만듭니다.

- **레벨 0 (기본):** Soft off-white 배경
- **레벨 1 (카드/컨테이너):** 흰색 표면 + 미묘한 그림자 (Y: 4, Blur: 12)
- **레벨 2 (인터랙티브/플로팅):** 흰색 표면 + 강조 그림자 (Y: 8, Blur: 24) — 클릭 가능성·포커스 표시
- **레벨 3 (모달):** 고대비 오버레이 + 깊고 넓은 그림자 — 모든 주의를 집중

## 형태

형태 언어는 **둥글함(Roundedness)**으로 정의됩니다. 카드와 주요 UI 블록의 기본 반지름은 16px(1rem)으로 친근하고 접근하기 쉬운 분위기를 만듭니다.

버튼과 입력 필드는 약간 작은 반지름(8px)을 사용해 정밀함을 유지하고, 상태 표시기와 칩에는 "알약형(pill)" 태그를 사용해 직사각형 카드 레이아웃과 시각적으로 명확히 구분됩니다.

## 컴포넌트

### 버튼

Primary 버튼은 흰색 텍스트의 Navy 단색으로, 터치하기 쉬운 56px 높이를 사용합니다. CTA 버튼은 가시성 극대화를 위해 Warm Gold 배경에 Navy 텍스트를 사용합니다.

### 카드

카드는 기본 조직 단위입니다. 16px 이상의 모서리 반지름과 32px 패딩을 반드시 적용해야 합니다. 카드 내부의 고대비 Navy 헤더가 섹션을 명확히 구분합니다.

### 입력 필드

입력 필드는 흰색 배경에 포커스 시 2px Navy 테두리를 사용합니다. 레이블은 항상 표시되어야 하며(플레이스홀더만 사용 금지), 굵은 폰트 굵기로 필드 위에 배치합니다.

### 칩 & 태그

전문 분야 표시(예: "재무 컨설팅", "프로젝트 관리")에 사용합니다. 연한 Navy 틴트 배경에 진한 Navy 텍스트를 적용하고, 알약 형태로 액션 버튼과 시각적으로 구분합니다.

### 목록

매칭 결과 또는 전문가 프로필 목록은 항목 간 충분한 수직 패딩(24px)을 두고, 연한 회청색 구분선으로 시각적 소음 없이 명확한 분리를 유지합니다.
