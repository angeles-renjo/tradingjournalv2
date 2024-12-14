import { getAuthenticatedUser } from "@/lib/utils/db";
import { getTradesByUser } from "@/lib/actions/trades";
import { columns } from "@/components/journal/table-columns";
import { DataTable } from "@/components/journal/data-table";
export default async function JournalPage() {
  const user = await getAuthenticatedUser();
  const { data: trades, error } = await getTradesByUser(user.id);

  if (error) {
    throw error;
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Trading Journal</h1>
      </div>

      <DataTable
        initialData={trades || []}
        columns={columns}
        userId={user.id}
      />
    </div>
  );
}
