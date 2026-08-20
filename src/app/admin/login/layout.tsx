export default function LoginLayout({ children }: { children: React.ReactNode }) {
  // The parent admin/layout.tsx already provides <html> and <body>.
  // This layout simply passes through so AdminLayoutClient can detect /admin/login
  // and skip the admin shell.
  return <>{children}</>
}
