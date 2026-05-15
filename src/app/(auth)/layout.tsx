export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "var(--space-gutter)",
        background: "var(--color-background)",
      }}
    >
      <div style={{ width: "100%", maxWidth: "28rem" }}>{children}</div>
    </div>
  );
}
