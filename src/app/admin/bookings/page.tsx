"use client";

import React, { useState } from "react";
import { ModuleHeader } from "@/components/admin/layout/ModuleHeader";
import { cn } from "@/lib/utils";
import { BookingsList } from "@/components/admin/bookings/BookingsList";
import { BookingTypesManager } from "@/components/admin/bookings/BookingTypesManager";
import { AvailabilityEditor } from "@/components/admin/bookings/AvailabilityEditor";
import { TimeOffManager } from "@/components/admin/bookings/TimeOffManager";

const TABS = [
  { id: "bookings", label: "Rezervasiyalar" },
  { id: "types", label: "Görüş növləri" },
  { id: "hours", label: "İş cədvəli" },
  { id: "timeoff", label: "Bağlı vaxtlar" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function BookingsAdminPage() {
  const [tab, setTab] = useState<TabId>("bookings");

  return (
    <div>
      <ModuleHeader title="Rezervasiyalar" />
      <div className="mb-6 flex flex-wrap gap-1 rounded-lg bg-[var(--muted)] p-1 w-fit">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={cn("px-4 py-2 text-sm font-medium rounded-md", tab === t.id ? "bg-white shadow-sm text-black" : "text-gray-500")}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tab === "bookings" && <BookingsList />}
      {tab === "types" && <BookingTypesManager />}
      {tab === "hours" && <AvailabilityEditor />}
      {tab === "timeoff" && <TimeOffManager />}
    </div>
  );
}
