import Sidebar from '@/components/sidebar';

export default function SalesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-background">
      <Sidebar role="SALES_OFFICER" />
      <main className="flex-1 p-6 md:p-10 overflow-y-auto dashboard-grid">
        <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
          {children}
        </div>
      </main>
    </div>
  );
}
