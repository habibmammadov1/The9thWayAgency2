import { BrandingModule } from "@/components/admin/branding/BrandingModule"

import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Brendinq",
}


export default function BrandingPage() {
  return <BrandingModule />
}
