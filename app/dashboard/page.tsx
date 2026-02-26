import { DashboardContent } from "@/components/dashboard/dashboard-content";

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">ダッシュボード</h1>
        <p className="text-muted-foreground">
          AITuber のテストセッションを管理します
        </p>
      </div>
      <DashboardContent />
    </div>
  );
}
