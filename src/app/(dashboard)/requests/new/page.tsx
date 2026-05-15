import Link from "next/link";
import { TfRequestForm } from "@/app/(dashboard)/requests/TfRequestForm";

export default function NewTfRequestPage() {
  return (
    <div className="sl-stack">
      <p style={{ margin: 0 }}>
        <Link href="/requests" style={{ fontSize: "0.9375rem" }}>
          ← 요청 목록
        </Link>
      </p>
      <TfRequestForm mode="create" />
    </div>
  );
}
