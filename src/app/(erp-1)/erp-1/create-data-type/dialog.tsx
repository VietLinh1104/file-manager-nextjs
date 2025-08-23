"use client" 

import { DialogForm } from "@/components/ui/dialog-form"

export default function DialogFile() {
  return (
    <DialogForm
      title="Survey"
      triggerLabel="Open Survey"
      fields={[
        { id: "username", label: "User Name", defaultValue: "John" },
        { id: "gender", label: "Gender", type: "radio", defaultValue: "Male", options: ["Male", "Female"] },
        { id: "hobbies", label: "Hobbies", type: "checkbox", defaultValue: ["Coding", "Music"], options: ["Coding", "Music", "Travel"] },
      ]}
      onSubmit={(formData) => {
        console.log("username:", formData.get("username"))
        console.log("gender:", formData.get("gender"))
        console.log("hobbies:", formData.getAll("hobbies")) // 👉 trả về mảng
      }}
    />
  )
}
