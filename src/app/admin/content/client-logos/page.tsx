import ClientLogosManager from "@/components/admin/content/client-logos/ClientLogosManager";

import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Müştəri Loqoları",
}


export default function ClientLogosPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Brendlər (Client Logos)</h2>
      </div>
      <ClientLogosManager />
    </div>
  );
}
