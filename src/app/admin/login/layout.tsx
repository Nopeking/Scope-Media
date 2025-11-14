export default function AdminLoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // No AuthGuard here - this is the login page
  return <>{children}</>;
}
