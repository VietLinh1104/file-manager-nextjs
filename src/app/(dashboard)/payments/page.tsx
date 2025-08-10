import { columns, Payment } from "./columns"
import { DataTable } from "@/components/ui/data-table"

async function getData(): Promise<Payment[]> {
  // Fetch data from your API here.
  return [
    {
        id: "728ed52f",
        amount: 100,
        status: "pending",
        email: "m@example.com",
        createdAt: "2023-10-01T12:00:00Z",
    },
    // ...
  ]
}

export default async function DemoPage() {
  const data = await getData()

  return (
    <div className="container mx-auto py-10">
      <DataTable columns={columns} data={data} />
    </div>
  )
}