"use client"

import * as React from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import Link from "next/link"

export interface ToolbarAction {
  label: string
  href?: string
  icon?: React.ReactNode
  variant?: "default" | "secondary" | "destructive"
  onClick?: () => void
}

interface DataTableSkeletonProps {
  columns?: number
  rows?: number
  withToolbar?: boolean
  toolbarActions?: ToolbarAction[]
}

/** 🦴 Skeleton bảng dữ liệu có toolbar + pagination */
export function DataTableSkeleton({
  columns = 5,
  rows = 10,
  withToolbar = true,
  toolbarActions = [],
}: DataTableSkeletonProps) {
  return (
    <div className="space-y-4">
      {/* 🔍 Thanh toolbar (search + actions) */}
      {withToolbar && (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-xl">
            <Input disabled placeholder="Đang tải..." className="pl-9 h-9" />
          </div>
          <div className="flex gap-2">
            {toolbarActions.length > 0 ? (
              toolbarActions.map((act, idx) =>
                act.href ? (
                  <Button
                    key={idx}
                    asChild
                    disabled
                    variant={act.variant ?? "default"}
                  >
                    <Link href={act.href}>
                      {act.label}
                      {act.icon && <span className="mr-1">{act.icon}</span>}
                    </Link>
                  </Button>
                ) : (
                  <Button
                    key={idx}
                    disabled
                    variant={act.variant ?? "default"}
                  >
                    {act.label}
                    {act.icon && <span className="mr-1">{act.icon}</span>}
                  </Button>
                )
              )
            ) : (
              <>
                <Button disabled variant="outline" className="w-24">
                  <Skeleton className="h-4 w-16" />
                </Button>
                <Button disabled className="w-24">
                  <Skeleton className="h-4 w-16" />
                </Button>
              </>
            )}
          </div>
        </div>
      )}

      {/* 📋 Bảng skeleton */}
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {Array.from({ length: columns }).map((_, i) => (
                <TableHead key={i}>
                  <Skeleton className="h-4 w-24" />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: rows }).map((_, i) => (
              <TableRow key={i}>
                {Array.from({ length: columns }).map((__, j) => (
                  <TableCell key={j}>
                    <Skeleton className="h-4 w-full" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* 📄 Pagination skeleton */}
      <div className="flex items-center justify-between py-2">
        <Skeleton className="h-4 w-32" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-8 rounded-md" />
          <Skeleton className="h-8 w-16 rounded-md" />
          <Skeleton className="h-8 w-8 rounded-md" />
        </div>
      </div>
    </div>
  )
}
