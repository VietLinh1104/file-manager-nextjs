import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * Skeleton component (ShadCN UI style)
 * Dùng để hiển thị placeholder khi đang loading dữ liệu.
 */
function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  )
}

export { Skeleton }
