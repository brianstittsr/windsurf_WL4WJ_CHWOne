import AdminLayout from '@/components/Layout/AdminLayout';

export default function NCLegislatureLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminLayout>{children}</AdminLayout>;
}
