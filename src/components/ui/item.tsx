"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { File, Trash2 } from "lucide-react"

/**
 * Item: khối hiển thị tổng quát (có thể dùng cho file, thông báo, task,...)
 */
export function Item({
  className,
  variant = "outline",
  children,
}: React.HTMLAttributes<HTMLDivElement> & {
  variant?: "default" | "outline"
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 rounded-xl p-3 transition-all",
        variant === "outline"
          ? "border border-border bg-background hover:bg-muted/50"
          : "bg-muted",
        className
      )}
    >
      {children}
    </div>
  )
}

/**
 * ItemMedia: khu vực icon / hình đại diện bên trái
 */
export function ItemMedia({
  children,
  className,
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex h-10 w-10 items-center justify-center rounded-lg bg-muted/50 shrink-0",
        className
      )}
    >
      {children}
    </div>
  )
}

/**
 * ItemContent: khu vực thông tin chính (title + description)
 */
export function ItemContent({
  title,
  description,
  className,
}: {
  title: string
  description?: string
  className?: string
}) {
  return (
    <div className={cn("flex flex-col flex-1 overflow-hidden", className)}>
      <p className="truncate text-sm font-medium">{title}</p>
      {description && (
        <p className="truncate text-xs text-muted-foreground">
          {description}
        </p>
      )}
    </div>
  )
}

/**
 * ItemActions: nhóm các nút hành động (xóa, xem, tải,...)
 */
export function ItemActions({
  onRemove,
  className,
}: {
  onRemove?: () => void
  className?: string
}) {
  return (
    <div className={cn("flex items-center gap-1", className)}>
      {onRemove && (
        <Button
          size="icon"
          type="button"
          variant="ghost"
          className="h-8 w-8 text-muted-foreground hover:text-destructive"
          onClick={onRemove}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}
