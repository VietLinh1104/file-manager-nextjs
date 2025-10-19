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
export function confirmToast({
  title = "Xác nhận hành động",
  description = "Bạn có chắc muốn tiếp tục?",
  confirmText = "Xác nhận",
  cancelText = "Hủy",
  variant = "destructive",
  onConfirm,
}: {
  title?: string
  description?: string
  confirmText?: string
  cancelText?: string
  variant?: "default" | "destructive"
  onConfirm: () => void | Promise<void>
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
          <Button
            variant={variant}
            onClick={async () => {
              try {
                await onConfirm()
              } catch (err) {
                console.error(err)
              } finally {
                handleClose()
              }
            }}
          >
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
