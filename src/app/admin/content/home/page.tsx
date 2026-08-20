import { HomeContentForm } from "@/components/admin/content/home/HomeContentForm"

import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Ana Səhifə",
}


export default function HomeContentPage() {
  return <HomeContentForm />
}
