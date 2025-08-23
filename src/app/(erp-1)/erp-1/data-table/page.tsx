"use client"

import * as React from "react"
import { columns, Payment } from "./columns"
import { DataTable } from "@/components/ui/data-table"
import DialogFile from "./dialog"
import { getPayments } from "@/services/payment.service"

export default function DocumentListTableSection() {
  const [data, setData] = React.useState<Payment[]>([])
  const [total, setTotal] = React.useState(0)
  const [pageIndex, setPageIndex] = React.useState(0)
  const [loading, setLoading] = React.useState(false)
  const pageSize = 10

  React.useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const res = await getPayments<Payment>(pageIndex + 1, pageSize)

        // res.data chính là DataResponse<Payment>
        setData(res.data.data)
        setTotal(res.data.meta.total)

      } catch (error) {
        console.error("Error fetching payments:", error)
        setData([])
        setTotal(0)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [pageIndex, pageSize])



  return (
    <>
      <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
        <span className="text-xl text-muted-foreground">Document List</span>
      </h2>
      
      <div className="container mx-auto py-10">
        {/* Action */}
        <div className="header-table mb-4">
          <DialogFile />
        </div>

        {/* Data-table */}
        <DataTable
          columns={columns}
          data={data}
          total={total}
          pageSize={pageSize}
          pageIndex={pageIndex}
          onPageChange={setPageIndex}
          withCheckbox
          withMoreButton
          // loading={loading} // nếu DataTable có hỗ trợ
        />
      </div>
    </>
  )
}
