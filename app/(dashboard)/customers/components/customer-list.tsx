"use client";

import { useEffect, useMemo, useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  ColumnDef,
  SortingState
} from "@tanstack/react-table";
import {
  Search,
  Filter,
  MoreHorizontal,
  X,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Loader2
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import StatCards from "@/app/(dashboard)/customers/components/stat-cards";
import NewCustomer from "@/app/(dashboard)/customers/components/new-customer";
import { supabase } from "@/lib/supabase-client";
import { findContacts, resolveInstance, updateBlockStatus, readPreferredInstance } from "@/lib/evo-api";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

export interface Customer {
  id: string;
  name: string;
  phone: string;
  remoteJid?: string;
  totalOrders: number;
  totalSpent: number;
  lastOrder: string;
  isActive: boolean;
  avatar?: string;
}

type EvoContact = {
  id?: string;
  name?: string;
  number?: string;
  remoteJid?: string;
  profilePicUrl?: string | null;
  pushName?: string | null;
};

export default function CustomerList() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [rowSelection, setRowSelection] = useState({});
  const [filterActive, setFilterActive] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [blockedMap, setBlockedMap] = useState<Record<string, boolean>>({});
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const preferred = readPreferredInstance();
      const instanceId = preferred?.id || null;
      const instanceName = preferred?.name || null;

      const contactQuery = supabase
        .from("Contact")
        .select("id,remoteJid,pushName,profilePicUrl,createdAt,instanceId");
      const messageQuery = supabase
        .from("Message")
        .select("id,key,messageTimestamp,instanceId")
        .order("messageTimestamp", { ascending: false })
        .limit(500);

      const [{ data: contactRows }, { data: messageRows }, resolvedInstanceName] = await Promise.all([
        instanceId ? contactQuery.eq("instanceId", instanceId) : contactQuery,
        instanceId ? messageQuery.eq("instanceId", instanceId) : messageQuery,
        instanceName ? Promise.resolve(instanceName) : resolveInstance()
      ]);

      const targetInstanceName = instanceName || resolvedInstanceName || "";
      let evoContacts: EvoContact[] = [];
      if (targetInstanceName) {
        try {
          const evo = await findContacts(targetInstanceName, {});
          if (Array.isArray(evo)) evoContacts = evo;
          if (Array.isArray((evo as { contacts?: EvoContact[] })?.contacts)) {
            evoContacts = (evo as { contacts?: EvoContact[] }).contacts as EvoContact[];
          }
        } catch (err) {
          console.warn("findContacts failed", err);
        }
      }

      type MessageRow = { key?: { remoteJid?: string | null; remoteJidAlt?: string | null }; messageTimestamp?: number | null };
      const messageByRemote: Record<string, { count: number; lastTs?: number }> = {};
      (messageRows || []).forEach((raw) => {
        const row = raw as MessageRow;
        const remote = row?.key?.remoteJid || row?.key?.remoteJidAlt;
        if (!remote) return;
        const ts = row?.messageTimestamp || 0;
        if (!messageByRemote[remote]) {
          messageByRemote[remote] = { count: 0, lastTs: ts };
        }
        messageByRemote[remote].count += 1;
        messageByRemote[remote].lastTs = Math.max(messageByRemote[remote].lastTs || 0, ts);
      });

      type ContactRow = {
        id: string;
        remoteJid: string;
        pushName?: string | null;
        profilePicUrl?: string | null;
        createdAt?: string | null;
      };

      const merged = (contactRows || []).map((c) => {
        const contact = c as ContactRow;
        const evo = evoContacts.find(
          (e) => e.remoteJid === contact.remoteJid || e.number === contact.remoteJid
        );
        const metrics = messageByRemote[contact.remoteJid] || { count: 0, lastTs: undefined };
        const lastDate =
          metrics.lastTs && metrics.lastTs > 0
            ? new Date(metrics.lastTs * 1000)
            : contact.createdAt
              ? new Date(contact.createdAt)
              : null;

        return {
          id: contact.id,
          name: contact.pushName || evo?.name || contact.remoteJid,
          phone: contact.remoteJid.replace(/@.*/, ""),
          remoteJid: contact.remoteJid,
          totalOrders: metrics.count,
          totalSpent: 0,
          lastOrder: lastDate ? lastDate.toISOString() : "",
          isActive: metrics.lastTs ? Date.now() - metrics.lastTs * 1000 < 24 * 60 * 60 * 1000 : false,
          avatar: contact.profilePicUrl || evo?.profilePicUrl
        } as Customer;
      });

      const extras = evoContacts
        .filter((e) => !(contactRows || []).some((c) => (c as ContactRow).remoteJid === e.remoteJid))
        .map((e) => {
          const metrics = messageByRemote[e.remoteJid || ""] || { count: 0, lastTs: undefined };
          const lastDate =
            metrics.lastTs && metrics.lastTs > 0 ? new Date(metrics.lastTs * 1000) : null;
          return {
            id: e.id || e.remoteJid || e.number || crypto.randomUUID(),
          name: e.name || e.pushName || e.remoteJid || e.number || "Контакт",
          phone: (e.remoteJid || e.number || "").replace(/@.*/, ""),
          remoteJid: e.remoteJid || e.number,
          totalOrders: metrics.count,
          totalSpent: 0,
          lastOrder: lastDate ? lastDate.toISOString() : "",
          isActive: metrics.lastTs ? Date.now() - metrics.lastTs * 1000 < 24 * 60 * 60 * 1000 : false,
          avatar: e.profilePicUrl || undefined
          } as Customer;
        });

      setCustomers([...merged, ...extras]);
    } finally {
      setLoading(false);
    }
  }

  const columns: ColumnDef<Customer>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
          className="translate-y-[2px]"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
          className="translate-y-[2px]"
        />
      ),
      enableSorting: false,
      enableHiding: false
    },
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="text-muted-foreground h-auto p-0! text-xs! font-medium tracking-wider uppercase hover:bg-transparent">
            Имя
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const customer = row.original;
        return (
          <div className="flex items-center space-x-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={customer.avatar} alt={customer.name} />
              <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                {customer.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <span className="text-foreground font-medium">{customer.name}</span>
          </div>
        );
      }
    },
    {
      accessorKey: "phone",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="text-muted-foreground h-auto p-0! text-xs! font-medium tracking-wider uppercase hover:bg-transparent">
            Телефон
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => <span className="text-muted-foreground">{row.getValue("phone")}</span>
    },
    {
      accessorKey: "totalOrders",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="text-muted-foreground h-auto p-0! text-xs! font-medium tracking-wider uppercase hover:bg-transparent">
            Сообщений
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => <span className="text-foreground">{row.getValue("totalOrders")}</span>
    },
    {
      accessorKey: "lastOrder",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="text-muted-foreground h-auto p-0 font-medium tracking-wider hover:bg-transparent">
            ПОСЛ. АКТИВНОСТЬ
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const raw = row.getValue("lastOrder") as string;
        const date = raw ? new Date(raw) : null;
        const formatted = date && !isNaN(date.getTime())
          ? new Intl.DateTimeFormat("ru-KZ", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit"
            }).format(date)
          : "—";
        return <span className="text-muted-foreground">{formatted}</span>;
      }
    },
    {
      accessorKey: "isActive",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="text-muted-foreground h-auto p-0 font-medium tracking-wider hover:bg-transparent">
            Статус
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const active = row.getValue("isActive") as boolean;
        return (
          <Badge variant={active ? "secondary" : "outline"}>
            {active ? "На связи" : "Оффлайн"}
          </Badge>
        );
      }
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const customer = row.original;
        const isBlocked = blockedMap[customer.remoteJid || customer.id] || false;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() =>
                  customer.remoteJid
                    ? router.push(`/chats?jid=${encodeURIComponent(customer.remoteJid)}`)
                    : router.push("/chats")
                }>
                Открыть чат
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleBlockToggle(customer)}
                className={isBlocked ? "text-destructive" : ""}>
                {isBlocked ? "Разблокировать" : "Заблокировать"}
              </DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">Удалить</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      }
    }
  ];

  const table = useReactTable({
    data: customers,
    columns,
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      globalFilter,
      rowSelection
    }
  });

  const totalCustomers = customers.length;
  const activeCustomers = customers.filter((c) => c.isActive).length;
  const newCustomers = useMemo(
    () =>
      customers.filter((c) => {
        const d = c.lastOrder ? new Date(c.lastOrder) : null;
        return d && d.getMonth() === new Date().getMonth();
      }).length,
    [customers]
  );

  async function handleBlockToggle(customer: Customer) {
    if (!customer.remoteJid) return;
    const nextState = !blockedMap[customer.remoteJid];
    setBlockedMap((prev) => ({ ...prev, [customer.remoteJid!]: nextState }));
    try {
      const instance = await resolveInstance();
      if (!instance) throw new Error("Нет instance");
      await updateBlockStatus(instance, customer.remoteJid, nextState);
      toast({
        title: nextState ? "Контакт заблокирован" : "Контакт разблокирован",
        description: customer.remoteJid
      });
    } catch (err) {
      console.error("block/unblock failed", err);
      alert("Не удалось выполнить операцию блокировки");
      setBlockedMap((prev) => ({ ...prev, [customer.remoteJid!]: !nextState }));
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-foreground text-2xl font-semibold">Клиенты</h1>
          {loading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
        </div>

        <NewCustomer />
      </div>

      <StatCards
        activeCustomers={activeCustomers}
        newCustomers={newCustomers}
        totalCustomers={totalCustomers}
      />

      {/* Search and Filters */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative max-w-sm flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
          <Input
            placeholder="Поиск по клиентам"
            value={globalFilter ?? ""}
            onChange={(event) => setGlobalFilter(String(event.target.value))}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          {filterActive && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Время: последние 30 дней
              <X className="h-3 w-3 cursor-pointer" onClick={() => setFilterActive(false)} />
            </Badge>
          )}
          <Button variant="outline" className="flex items-center gap-2" onClick={loadData}>
            <Filter />
            Обновить
          </Button>
        </div>
      </div>

      {/* Table */}
      <Card className="py-0">
        <div className="overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead
                        key={header.id}
                        className="text-muted-foreground text-xs font-medium tracking-wider">
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                      className="hover:bg-muted/50">
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id} className="py-4">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center">
                      {loading ? "Загружаем…" : "Нет данных."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <p className="text-muted-foreground text-sm">
            Показываем{" "}
            {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}–{" "}
            {Math.min(
              (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
              table.getFilteredRowModel().rows.length
            )} из {table.getFilteredRowModel().rows.length}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}>
            <ChevronLeft className="h-4 w-4" />
            Назад
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}>
            Далее
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
