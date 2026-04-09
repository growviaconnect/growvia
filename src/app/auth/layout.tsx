// Auth pages use their own full-page layout (no shared navbar/footer)
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen">{children}</div>;
}
