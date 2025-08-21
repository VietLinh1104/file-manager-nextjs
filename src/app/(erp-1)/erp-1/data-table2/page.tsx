
import { columns, Payment } from "./columns"
import { DataTable } from "@/components/ui/data-table"
import DialogFile from "./dialog"


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
  ]
}

export default async function DocumentListTableSection() {
  const data = await getData()

  return (
    <>
      <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
        <span className="text-xl text-muted-foreground">Document List</span>
      </h2>
      <div className="container mx-auto py-10">
        
        <div className="header-table mb-4">
          <DialogFile/>
        </div>

        <DataTable columns={columns} data={data} />
      </div>
    </>
  )
}