import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { getContractById } from "@/lib/contract-server";

export default async function ContractLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ contractId: string }>;
}) {
  const { contractId } = await params;
  const { row } = await getContractById(contractId);
  if (!row) {
    notFound();
  }
  return <>{children}</>;
}
