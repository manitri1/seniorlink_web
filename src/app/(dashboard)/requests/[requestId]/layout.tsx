import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { RequestSubnav } from "@/components/requests/RequestSubnav";
import { getTfRequestById } from "@/lib/tf-request-server";

export default async function RequestDetailLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ requestId: string }>;
}) {
  const { requestId } = await params;
  const { row } = await getTfRequestById(requestId);
  if (!row) {
    notFound();
  }

  return (
    <div className="sl-stack">
      <RequestSubnav requestId={requestId} />
      {children}
    </div>
  );
}
