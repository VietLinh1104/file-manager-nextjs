"use client"
import * as React from "react"
import Link from "next/link"

interface Field {
  id: number
  name: string
  type: string
  required: boolean
}

interface DataType {
  id: number
  name: string
  fields: Field[]
  createdAt: string
}

export default function DataTypeListPage() {
  const [dataTypes, setDataTypes] = React.useState<DataType[]>([])
  const [loading, setLoading] = React.useState(false)

  // Load list BO
  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/data-types")
      const data = await res.json()
      setDataTypes(data)
    } catch (err) {
      console.error("Failed to fetch data types:", err)
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    fetchData()
  }, [])

  // Xóa BO
  const deleteBO = async (id: number) => {
    if (!confirm("Are you sure to delete this BO?")) return
    try {
      const res = await fetch(`/api/data-types/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Delete failed")
      await fetchData()
    } catch (err) {
      console.error(err)
      alert("Error deleting BO")
    }
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Business Objects</h1>
        <Link
          href="/dev-tool/data-type/create"
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          + Create BO
        </Link>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2 text-left">ID</th>
              <th className="border p-2 text-left">Name</th>
              <th className="border p-2 text-left">Fields</th>
              <th className="border p-2 text-left">Created At</th>
              <th className="border p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {dataTypes.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center p-4">
                  No Business Objects found
                </td>
              </tr>
            ) : (
              dataTypes.map(bo => (
                <tr key={bo.id}>
                  <td className="border p-2">{bo.id}</td>
                  <td className="border p-2 font-semibold">{bo.name}</td>
                  <td className="border p-2">
                    {bo.fields.map(f => (
                      <span
                        key={f.id}
                        className="inline-block bg-gray-200 text-sm px-2 py-1 rounded mr-1"
                      >
                        {f.name}:{f.type}
                        {f.required ? "*" : ""}
                      </span>
                    ))}
                  </td>
                  <td className="border p-2">
                    {new Date(bo.createdAt).toLocaleString()}
                  </td>
                  <td className="border p-2 flex gap-2">
                    <Link
                      href={`/dev-tool/data-type/${bo.id}`}
                      className="px-3 py-1 bg-yellow-500 text-white rounded"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => deleteBO(bo.id)}
                      className="px-3 py-1 bg-red-600 text-white rounded"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  )
}
