"use client" // thêm dòng này

import { DialogForm } from "@/components/ui/dialog-form"

export default function DialogFile() {
  return (
    <DialogForm
      title="Upload File"
      description="Upload your file here. Make sure to follow the guidelines."
      triggerLabel="Upload File"
      fields={[
        { id: "fileName", label: "User Name", defaultValue: "Name" },
        { id: "file", label: "Upload", type: "file" },
        { id: "description", label: "Description", type: "textarea", defaultValue: "Description" },
        { id: "tags", label: "Tags", type: "text", defaultValue: "tag1, tag2" },
        { id: "date", label: "Date", type: "date", defaultValue: new Date().toISOString().split("T")[0] },
        { id: "status", label: "Status", type: "select", defaultValue: "active", options: ["active", "inactive"] },
      ]}
      onSubmit={(formData) => {
        console.log("Form data:", Object.fromEntries(formData.entries()))
      }}
    />
  )
}
