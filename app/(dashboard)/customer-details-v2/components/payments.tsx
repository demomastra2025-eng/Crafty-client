"use client";

import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Smartphone, ArrowRight, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

import paymentsData from "../data/payments.json";

export type Payment = (typeof paymentsData)[number];

const formatCurrency = (amount: number) => {
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);
  const formatted = new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2
  }).format(absAmount);

  return isNegative ? `- ${formatted}` : formatted;
};

const getPaymentIcon = (method: string, type: string) => {
  if (method === "Mobile money") {
    return <Smartphone className="text-muted-foreground h-4 w-4" />;
  } else if (method === "Transfer") {
    return type === "credit" ? (
      <ArrowLeft className="text-success h-4 w-4" />
    ) : (
      <ArrowRight className="text-muted-foreground h-4 w-4" />
    );
  }
  return null;
};

const columns: ColumnDef<Payment>[] = [
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => (
      <div className="text-muted-foreground text-sm font-medium">{row.getValue("date")}</div>
    )
  },
  {
    accessorKey: "method",
    header: "Payment method",
    cell: ({ row }) => {
      const method = row.getValue("method") as string;
      const type = row.original.type;
      return (
        <div className="flex items-center gap-2">
          {getPaymentIcon(method, type)}
          <span className="text-muted-foreground text-sm">{method}</span>
        </div>
      );
    }
  },
  {
    accessorKey: "paidTo",
    header: "Paid to",
    cell: ({ row }) => <div className="text-sm font-medium">{row.getValue("paidTo")}</div>
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => {
      const amount = row.getValue("amount") as number;
      const type = row.original.type;
      return (
        <div
          className={cn(
            "text-right text-sm font-medium",
            type === "credit" ? "text-success" : "text-foreground"
          )}>
          {formatCurrency(amount)}
        </div>
      );
    }
  }
];

interface PaymentsTableProps {
  data: Payment[];
}

export default function PaymentsTable({ data }: PaymentsTableProps) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 8
      }
    }
  });

  const { pageIndex, pageSize } = table.getState().pagination;
  const totalRows = table.getFilteredRowModel().rows.length;
  const startRow = pageIndex * pageSize + 1;
  const endRow = Math.min((pageIndex + 1) * pageSize, totalRows);

  return (
    <div className="space-y-4">
      {/* Table Header */}
      <div className="text-muted-foreground grid grid-cols-4 gap-4 border-b px-0 py-2 text-sm">
        {table.getHeaderGroups().map((headerGroup) =>
          headerGroup.headers.map((header) => (
            <div
              key={header.id}
              className={cn("font-medium", header.id === "amount" && "text-right")}>
              {flexRender(header.column.columnDef.header, header.getContext())}
            </div>
          ))
        )}
      </div>

      {/* Table Body */}
      <div className="space-y-3">
        {table.getRowModel().rows.map((row) => (
          <div
            key={row.id}
            className="border-muted/50 grid grid-cols-4 gap-4 border-b px-0 py-3 last:border-0">
            {row.getVisibleCells().map((cell) => (
              <div key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</div>
            ))}
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between pt-4">
        <div className="text-muted-foreground text-sm">
          Viewing {startRow}-{endRow} of {totalRows} results
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="text-muted-foreground flex items-center gap-1">
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}>
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
