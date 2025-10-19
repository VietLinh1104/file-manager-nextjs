"use client"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { createRoot } from "react-dom/client"
import React from "react"

/**
 * confirmToast
 * Hiển thị một Dialog xác nhận nằm trong Toast.
 */
export function confirmDeleteFile({
  title = "Xác nhận xóa tài liệu",
  description = "Bạn muốn xóa tài liệu này hoàn toàn khỏi hệ thống?",
  // option1Text = "Chỉ xóa khỏi giao dịch",
  option2Text = "Xóa trên hệ thống",
  cancelText = "Hủy",
  variant = "destructive",
  // onOption1,
  onOption2,

}: {
  title?: string
  description?: string
  option1Text?: string
  option2Text?: string
  cancelText?: string
  variant?: "default" | "destructive"
  // onOption1: () => void | Promise<void>
  onOption2: () => void | Promise<void>
}) {
  // Tạo node tạm trong body
  const div = document.createElement("div")
  document.body.appendChild(div)
  const root = createRoot(div)

  const handleClose = () => {
    root.unmount()
    div.remove()
  }

  root.render(
    <Dialog open onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="secondary">{cancelText}</Button>
          </DialogClose>
          {/* <Button
            variant={variant}
            onClick={async () => {
              try {
                await onOption1()
              } catch (err) {
                console.error(err)
              } finally {
                handleClose()
              }
            }}
          >
            {option1Text}
          </Button> */}
          <Button
            variant={variant}
            onClick={async () => {
              try {
                await onOption2()
              } catch (err) {
                console.error(err)
              } finally {
                handleClose()
              }
            }}
          >
            {option2Text}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
