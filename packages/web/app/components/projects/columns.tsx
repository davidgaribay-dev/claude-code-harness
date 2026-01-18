"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react"
import type { Project } from "../../lib/types"
import { Button } from "../ui/button"
import { Badge } from "../ui/badge"
import { safeFormatDate } from "../../lib/stats"

export const projectColumns: ColumnDef<Project>[] = [
  {
    accessorKey: "displayName",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Project Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      return (
        <div className="font-medium">
          {row.getValue("displayName")}
        </div>
      )
    },
  },
  {
    accessorKey: "path",
    header: "Path",
    cell: ({ row }) => {
      const path = row.getValue("path") as string
      return (
        <div className="max-w-md truncate text-muted-foreground text-sm">
          {path}
        </div>
      )
    },
  },
  {
    accessorKey: "conversationCount",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Conversations
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      return (
        <Badge variant="secondary">
          {row.getValue("conversationCount")} conversations
        </Badge>
      )
    },
  },
  {
    accessorKey: "lastModified",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Last Modified
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const value = row.getValue("lastModified")
      const formatted = safeFormatDate(value, "MMM dd, yyyy", "Never")
      return (
        <div className={formatted === "Never" ? "text-muted-foreground" : "font-medium"}>
          {formatted}
        </div>
      )
    },
    sortingFn: "datetime",
  },
]
