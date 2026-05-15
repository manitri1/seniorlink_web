import Link from "next/link";

export function HomeLanding() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--color-background)",
      }}
    >
      <header
        style={{
          borderBottom: "1px solid var(--color-outline-variant)",
          background: "var(--color-surface)",
          boxShadow: "var(--shadow-ambient)",
        }}
      >
        <div
          style={{
            maxWidth: "var(--container-max)",
            margin: "0 auto",
            padding: "16px var(--space-gutter)",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "16px",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: "1.125rem",
              color: "var(--color-primary)",
            }}
          >
            Seniorlink
          </span>
          <nav aria-label="계정" style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <Link href="/login" className="sl-button sl-button--outline">
              로그인
            </Link>
            <Link href="/signup" className="sl-button sl-button--outline">
              기업 회원가입
            </Link>
            <Link href="/signup?role=senior" className="sl-button sl-button--cta">
              시니어 회원가입
            </Link>
          </nav>
        </div>
      </header>

      <main
        style={{
          maxWidth: "var(--container-max)",
          margin: "0 auto",
          padding: "calc(var(--space-unit) * 6) var(--space-gutter)",
        }}
      >
        <section className="sl-stack" style={{ maxWidth: "40rem" }}>
          <p
            style={{
              margin: 0,
              fontSize: "0.875rem",
              fontWeight: 600,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              color: "var(--color-primary-container)",
            }}
          >
            기업·시니어 웹 매칭
          </p>
          <h1 style={{ margin: 0, fontSize: "clamp(1.75rem, 4vw, 2.25rem)" }}>
            퇴직 시니어 전문가와 단기 TF를 정밀 매칭합니다
          </h1>
          <p
            style={{
              margin: 0,
              fontSize: "1.125rem",
              lineHeight: 1.65,
              color: "var(--color-on-surface-variant)",
            }}
          >
            기업은 TF 요청·매칭·제안·계약·정산을 웹에서 관리하고, 시니어 전문가도 동일 웹에서 제안
            수신·응답·계약 진행을 처리합니다.
          </p>
        </section>

        <section
          style={{
            marginTop: "calc(var(--space-unit) * 6)",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: "var(--space-stack)",
          }}
          aria-label="핵심 가치"
        >
          {[
            {
              title: "요청 중심",
              body: "기간·예산·지역·목표를 명확히 하면 후보 탐색과 제안이 이어집니다.",
            },
            {
              title: "웹 단일 채널",
              body: "기업·시니어 모두 브라우저에서 로그인해 각자 대시보드와 알림 흐름을 사용합니다.",
            },
            {
              title: "문서와 정합",
              body: "제품·IA·디자인 토큰은 저장소 docs/와 DESIGN.md를 기준으로 합니다.",
            },
          ].map((item) => (
            <section
              key={item.title}
              className="sl-card"
              aria-labelledby={`landing-${item.title}`}
            >
              <h2
                id={`landing-${item.title}`}
                className="sl-card__header"
                style={{ marginTop: 0 }}
              >
                {item.title}
              </h2>
              <p style={{ margin: 0, color: "var(--color-on-surface-variant)" }}>{item.body}</p>
            </section>
          ))}
        </section>

        <section
          style={{
            marginTop: "calc(var(--space-unit) * 6)",
            padding: "var(--space-card-padding)",
            borderRadius: "var(--radius-card)",
            background: "var(--color-primary)",
            color: "var(--color-on-primary)",
            boxShadow: "var(--shadow-elevated)",
          }}
          aria-labelledby="landing-cta"
        >
          <h2
            id="landing-cta"
            style={{
              margin: "0 0 var(--space-unit)",
              fontFamily: "var(--font-display)",
              fontSize: "1.25rem",
              color: "inherit",
            }}
          >
            지금 시작하기
          </h2>
          <p style={{ margin: "0 0 var(--space-stack)", opacity: 0.92 }}>
            역할에 맞는 계정으로 가입하면 기업 대시보드 또는 시니어 워크스페이스로 이동합니다.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
            <Link href="/signup" className="sl-button sl-button--cta" style={{ minHeight: "52px" }}>
              기업으로 가입
            </Link>
            <Link
              href="/signup?role=senior"
              className="sl-button sl-button--cta"
              style={{ minHeight: "52px" }}
            >
              시니어로 가입
            </Link>
            <Link
              href="/login"
              className="sl-button sl-button--outline"
              style={{
                minHeight: "52px",
                borderColor: "rgba(255,255,255,0.85)",
                color: "var(--color-on-primary)",
              }}
            >
              이미 계정이 있어요
            </Link>
          </div>
        </section>
      </main>

      <footer
        style={{
          marginTop: "calc(var(--space-unit) * 4)",
          padding: "var(--space-gutter)",
          fontSize: "0.875rem",
          color: "var(--color-on-surface-variant)",
          textAlign: "center",
        }}
      >
        <p style={{ margin: 0 }}>
          자세한 요구사항·화면 구조는 저장소의 <code>docs/prd.md</code>, <code>docs/ia.md</code>,{" "}
          <code>docs/design.md</code>를 참고하세요.
        </p>
      </footer>
    </div>
  );
}
