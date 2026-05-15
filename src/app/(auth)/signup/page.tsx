import { SignupForm } from "@/app/(auth)/signup/SignupForm";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string }>;
}) {
  const sp = await searchParams;
  const defaultRole = sp.role === "senior" ? "senior" : "company";
  return <SignupForm defaultRole={defaultRole} />;
}
