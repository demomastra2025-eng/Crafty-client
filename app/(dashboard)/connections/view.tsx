"use client";

import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  ArrowUpRight,
  BarChart3,
  CheckCircle2,
  Clock3,
  Instagram,
  MessageCircle,
  Send,
  Users2,
  Loader2,
  Wifi,
  QrCode,
  CirclePause,
  XCircle,
  RotateCcw,
  Play
} from "lucide-react";
import {
  connectInstance,
  deleteInstance,
  createInstance,
  fetchInstances,
  restartInstance,
  logoutInstance,
  fetchConnectionState,
  readPreferredInstance,
  setPreferredInstance
} from "@/lib/evo-api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { formatDateTimeWithTz } from "@/lib/timezone";

const quickPlatforms = [
  {
    id: "whatsapp",
    label: "WhatsApp Evolution",
    hint: "Baileys / Cloud",
    icon: MessageCircle,
    tone: "bg-emerald-50 text-emerald-700 border-emerald-100"
  },
  {
    id: "instagram",
    label: "Instagram",
    hint: "DM + истории",
    icon: Instagram,
    tone: "bg-pink-50 text-pink-700 border-pink-100"
  },
  {
    id: "telegram",
    label: "Telegram",
    hint: "Бот / канал",
    icon: Send,
    tone: "bg-sky-50 text-sky-700 border-sky-100"
  }
] as const;

const statusTone = (status?: string) => {
  const s = (status || "").toLowerCase();
  if (s === "open") return "bg-emerald-100 text-emerald-700";
  if (s === "connecting" || s === "pairing") return "bg-amber-100 text-amber-800";
  return "bg-gray-100 text-gray-700";
};

const statusLabel = (status?: string) => {
  const s = (status || "").toLowerCase();
  if (s === "open") return "Активен";
  if (s === "connecting" || s === "pairing") return "Подключается";
  return "Оффлайн";
};

type Connector = {
  id: string;
  instanceName: string;
  number?: string;
  ownerJid?: string;
  connectionStatus?: string;
  updatedAt?: string;
  token?: string;
  counts?: {
    Message?: number;
    Contact?: number;
    Chat?: number;
  };
};

type ApiInstance = {
  instanceId?: string;
  id?: string;
  instanceName?: string;
  name?: string;
  number?: string;
  ownerJid?: string;
  connectionStatus?: string;
  updatedAt?: string;
  token?: string;
  _count?: Connector["counts"];
};

export default function ConnectorsView() {
  const defaultInstanceName =
    process.env.NEXT_PUBLIC_EVOLUTION_INSTANCE || process.env.EVOLUTION_INSTANCE || "";
  const defaultNumber =
    process.env.NEXT_PUBLIC_EVOLUTION_OWNER_NUMBER || process.env.EVOLUTION_OWNER_NUMBER || "";
  const [instanceIdHint, setInstanceIdHint] = useState("");
  const [newInstanceNumber, setNewInstanceNumber] = useState(defaultNumber);
  const [createOpen, setCreateOpen] = useState(false);
  const [connectors, setConnectors] = useState<Connector[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);
  const [qrData, setQrData] = useState<string | null>(null);
  const [qrInstance, setQrInstance] = useState<string | null>(null);
  const [pairingCode, setPairingCode] = useState<string | null>(null);
  const [newInstanceName, setNewInstanceName] = useState(defaultInstanceName || "");
  const [connectionMessage, setConnectionMessage] = useState<string | null>(null);
  const [currentInstanceName, setCurrentInstanceName] = useState<string | null>(null);
  const [currentInstanceId, setCurrentInstanceId] = useState<string | null>(null);

  useEffect(() => {
    loadInstances();
  }, []);

  useEffect(() => {
    if (!qrInstance) return;
    let cancelled = false;
    const interval = setInterval(async () => {
      try {
        const res = await fetchConnectionState(qrInstance);
        const state = res?.instance?.state || res?.state;
        if (state === "open" && !cancelled) {
          setConnectionMessage(`Инстанс ${qrInstance} успешно подключен`);
          setQrData(null);
          setPairingCode(null);
          setQrInstance(null);
          void loadInstances();
          clearInterval(interval);
        }
      } catch (err) {
        console.error("connectionState poll failed", err);
      }
    }, 1000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [qrInstance]);

  useEffect(() => {
    const saved = readPreferredInstance();
    if (saved) {
      if (saved.name) setCurrentInstanceName(saved.name);
      if (saved.id) setCurrentInstanceId(saved.id);
    }
  }, []);

  async function loadInstances() {
    setLoading(true);
    try {
      const list = (await fetchInstances()) as ApiInstance[];
      const base = list.map((i) => ({
        id: i.instanceId || i.id || i.instanceName || "unknown",
        instanceName: i.instanceName || i.name || "—",
        number: i.number || defaultNumber,
        ownerJid: i.ownerJid,
        connectionStatus: i.connectionStatus,
        updatedAt: i.updatedAt,
        token: i.token,
        counts: i._count
      }));

      const withLiveStatus = await Promise.all(
        base.map(async (c) => {
          try {
            const live = await fetchConnectionState(c.instanceName);
            const state = live?.instance?.state || live?.state;
            return state ? { ...c, connectionStatus: state } : c;
          } catch (err) {
            console.error("connectionState check failed", err);
            return c;
          }
        })
      );

      setConnectors(withLiveStatus);
      if (!instanceIdHint && list[0]?.instanceId) {
        setInstanceIdHint(list[0].instanceId);
      }
      const hasCurrent =
        currentInstanceName && withLiveStatus.some((c) => c.instanceName === currentInstanceName);
      if (!hasCurrent) {
        const fallback =
          withLiveStatus.find((c) => c.connectionStatus === "open") ||
          withLiveStatus[0] ||
          null;
        const fallbackName = fallback?.instanceName || defaultInstanceName || null;
        const fallbackId = fallback?.id || null;
        if (fallbackName) {
          setCurrentInstanceName(fallbackName);
          setCurrentInstanceId(fallbackId);
          setPreferredInstance({ id: fallbackId, name: fallbackName });
        }
      }
    } finally {
      setLoading(false);
    }
  }

  const activeCount = connectors.filter((c) => c.connectionStatus === "open").length;
  const draftCount = connectors.filter((c) => c.connectionStatus !== "open").length;

  async function handleCreateInstance() {
    if (!newInstanceName.trim()) return;
    setActionId("create");
    setQrData(null);
    setPairingCode(null);
    try {
      const response = await createInstance({
        instanceName: newInstanceName.trim(),
        qrcode: true,
        integration: "WHATSAPP-BAILEYS",
        number: newInstanceNumber.trim() || undefined
      });
      const qrcode =
        response?.qrcode?.base64 ||
        response?.qrCode ||
        response?.qrcode ||
        response?.base64 ||
        null;
      const pairing =
        response?.pairingCode ||
        response?.qrcode?.pairingCode ||
        response?.code ||
        null;
      if (qrcode) {
        setQrData(qrcode.startsWith("data:") ? qrcode : `data:image/png;base64,${qrcode}`);
        setQrInstance(newInstanceName.trim());
      }
      setConnectionMessage(null);
      setInstanceIdHint(response?.instance?.instanceId || instanceIdHint);
      if (pairing) {
        setPairingCode(pairing);
      }
      await loadInstances();
      setCreateOpen(false);
    } catch (err) {
      console.error("create instance failed", err);
      alert("Не удалось создать инстанс");
    } finally {
      setActionId(null);
    }
  }

  const handleAction = async (
    id: string,
    action: "connect" | "restart" | "logout" | "delete"
  ) => {
    setActionId(id);
    setQrData(null);
    setQrInstance(null);
    setPairingCode(null);
    try {
      if (action === "connect") {
          const response = await connectInstance(id, {
          number:
            connectors.find((c) => c.instanceName === id)?.number ||
            newInstanceNumber ||
            defaultNumber
        });
        const qrcode =
          response?.qrcode?.base64 ||
          response?.qrCode ||
          response?.qrcode ||
          response?.base64 ||
          null;
        const pairing =
          response?.pairingCode ||
          response?.qrcode?.pairingCode ||
          response?.code ||
          null;
        if (qrcode) {
          setQrData(
            qrcode.startsWith("data:")
              ? qrcode
              : `data:image/png;base64,${qrcode}`
          );
          setQrInstance(id);
        }
        if (pairing) {
          setPairingCode(pairing);
        }
      } else if (action === "restart") {
        await restartInstance(id);
      } else if (action === "logout") {
        await logoutInstance(id);
      } else if (action === "delete") {
        await deleteInstance(id, { instanceId: connectors.find((c) => c.instanceName === id)?.id });
      }
      await loadInstances();
    } catch (err) {
      console.error(`${action} failed`, err);
      alert(`Не удалось выполнить действие: ${action}`);
    } finally {
      setActionId(null);
    }
  };

  const defaultInstance = useMemo(() => connectors[0]?.instanceName, [connectors]);
  const currentSession =
    currentInstanceName ||
    defaultInstance ||
    defaultInstanceName ||
    connectors[0]?.instanceName ||
    "—";

  const handleSelectInstance = (instanceName: string, instanceId?: string) => {
    setCurrentInstanceName(instanceName);
    setCurrentInstanceId(instanceId || null);
    setPreferredInstance({ id: instanceId || null, name: instanceName });
    setConnectionMessage(`Текущая сессия переключена на ${instanceName}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-muted/40 to-background p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold">Коннекты мессенджеров</h1>
            <p className="text-sm text-muted-foreground">
              Проекты, их каналы и статус синхронизации. Настройте коннекты и отправляйте лиды в CRM.
            </p>
            {connectionMessage ? (
              <p className="text-sm text-emerald-700">{connectionMessage}</p>
            ) : null}
          </div>
          <Button variant="outline" className="gap-2 w-full sm:w-auto" onClick={loadInstances}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wifi className="h-4 w-4" />}
            Обновить статусы
          </Button>
        </header>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="space-y-3 p-4">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                Активных коннектов
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              </div>
              <div className="text-3xl font-semibold">{activeCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="space-y-3 p-4">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                Ожидают подключения
                <Clock3 className="h-4 w-4 text-amber-500" />
              </div>
              <div className="text-3xl font-semibold">{draftCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="space-y-3 p-4">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                Текущая сессия
                <Users2 className="h-4 w-4 text-blue-500" />
              </div>
              <div className="text-3xl font-semibold">{currentSession}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="space-y-3 p-4">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                SLA ответов
                <BarChart3 className="h-4 w-4 text-purple-500" />
              </div>
              <div className="text-3xl font-semibold">7 сек</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1.5">
              <CardTitle>Подключись в мессенджеры</CardTitle>
              <CardDescription>Выберите канал и закрепите его за проектом или пайплайном.</CardDescription>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input placeholder="Поиск проектов или каналов" className="w-full sm:w-72" />
            </div>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-3">
            {quickPlatforms.map((platform) => (
              <button
                key={platform.id}
                onClick={platform.id === "whatsapp" ? () => setCreateOpen(true) : undefined}
                className={`flex h-full flex-col justify-between rounded-xl border shadow-sm ${platform.tone} p-4 text-left transition hover:-translate-y-0.5 hover:shadow-lg ${
                  platform.id === "whatsapp" ? "cursor-pointer" : "cursor-not-allowed opacity-70"
                }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/70 text-base">
                      <platform.icon className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold">{platform.label}</p>
                      <p className="text-xs text-muted-foreground">
                        {platform.id === "whatsapp" ? platform.hint : "Доступно скоро"}
                      </p>
                    </div>
                  </div>
                  <ArrowUpRight className="h-4 w-4" />
                </div>
                <div className="mt-3 rounded-lg bg-white/70 p-2 text-xs text-muted-foreground">
                  {platform.id === "whatsapp"
                    ? "Создайте инстанс, получите QR и подключите канал."
                    : "Недоступно"}
                </div>
              </button>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1.5">
              <CardTitle>Текущие коннекты</CardTitle>
              <CardDescription>Статусы, токены и действия по каждому каналу.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="grid gap-3 lg:grid-cols-3">
            {connectors.map((connector) => (
              <Card
                key={connector.id}
                className="border-muted/60 bg-gradient-to-br from-white/70 via-background to-muted/40 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md py-2">
                <CardContent className="space-y-1 p-4 pt-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="secondary" className="gap-1">
                          <MessageCircle className="h-4 w-4" />
                          WhatsApp
                        </Badge>
                        <Badge className={statusTone(connector.connectionStatus)}>
                          {statusLabel(connector.connectionStatus)}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-lg font-semibold tracking-tight">{connector.instanceName}</p>
                        <p className="text-sm text-muted-foreground">
                          {connector.number ? `+${connector.number}` : connector.ownerJid || "—"}
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Обновлено:{" "}
                          {connector.updatedAt
                          ? formatDateTimeWithTz(connector.updatedAt)
                          : "—"}
                      </p>
                    </div>
                    {connector.connectionStatus === "connecting" ? (
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-9 w-9"
                        onClick={() => handleAction(connector.instanceName, "connect")}
                        disabled={actionId === connector.instanceName}>
                        {actionId === connector.instanceName ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <QrCode className="h-4 w-4" />
                        )}
                      </Button>
                    ) : null}
                  </div>

                  <div className="grid grid-cols-3 gap-2 rounded-lg border border-muted/60 bg-muted/40 p-3 text-center text-xs">
                    <div className="flex flex-col items-center gap-1">
                      <MessageCircle className="h-4 w-4 text-muted-foreground" />
                      <span className="font-semibold">{connector.counts?.Message ?? 0}</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <Users2 className="h-4 w-4 text-muted-foreground" />
                      <span className="font-semibold">{connector.counts?.Contact ?? 0}</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <Send className="h-4 w-4 text-muted-foreground" />
                      <span className="font-semibold">{connector.counts?.Chat ?? 0}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-2">
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => handleAction(connector.instanceName, "connect")}
                      disabled={actionId === connector.instanceName}
                      title="Подключить">
                      {actionId === connector.instanceName ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Play className="h-4 w-4 text-emerald-600" />
                      )}
                    </Button>
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => handleAction(connector.instanceName, "restart")}
                      disabled={actionId === connector.instanceName}
                      title="Перезапуск">
                      <RotateCcw className="h-4 w-4 text-blue-600" />
                    </Button>
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => handleAction(connector.instanceName, "logout")}
                      disabled={actionId === connector.instanceName}
                      title="Остановить">
                      <CirclePause className="h-4 w-4 text-red-500" />
                    </Button>
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => handleAction(connector.instanceName, "delete")}
                      disabled={actionId === connector.instanceName}
                      title="Выход">
                      <XCircle className="h-4 w-4 text-amber-500" />
                    </Button>
                  </div>
                  <Button
                    variant={currentSession === connector.instanceName ? "default" : "secondary"}
                    className="w-full justify-center"
                    onClick={() => handleSelectInstance(connector.instanceName, connector.id)}
                    disabled={currentSession === connector.instanceName}>
                    {currentSession === connector.instanceName ? "Текущая сессия" : "Выбрать"}
                  </Button>
                </CardContent>
              </Card>
            ))}
            {connectors.length === 0 && (
              <div className="col-span-3 flex items-center justify-center text-sm text-muted-foreground">
                {loading ? "Загружаем коннекты…" : "Нет доступных коннектов"}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      <Dialog
        open={Boolean(qrData)}
        onOpenChange={(open) => {
          if (!open) {
            setQrData(null);
            setPairingCode(null);
            setQrInstance(null);
            setConnectionMessage(null);
            void loadInstances();
          }
        }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>QR для подключения</DialogTitle>
            <DialogDescription>
              Отсканируйте QR в приложении WhatsApp для instance {qrInstance || ""}.
            </DialogDescription>
          </DialogHeader>
          {qrData ? (
            <div className="flex flex-col items-center gap-3">
              <img src={qrData} alt="QR" className="w-64 h-64 rounded-lg border" />
              {pairingCode ? (
                <div className="text-sm font-medium text-center">
                  Паринг-код: <span className="font-mono">{pairingCode}</span>
                </div>
              ) : null}
              <Separator />
              <Button onClick={() => setQrData(null)}>Закрыть</Button>
            </div>
          ) : (
            <div className="flex items-center justify-center py-6 text-sm text-muted-foreground">
              Нет QR-кода
            </div>
          )}
          <DialogFooter />
        </DialogContent>
      </Dialog>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Создать инстанс WhatsApp</DialogTitle>
            <DialogDescription>Укажите имя и номер, чтобы получить QR для подключения.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="instanceName">Имя инстанса</Label>
              <Input
                id="instanceName"
                placeholder="Например, akhan"
                value={newInstanceName}
                onChange={(e) => setNewInstanceName(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="instanceNumber">Номер (без +)</Label>
              <Input
                id="instanceNumber"
                placeholder="7706..."
                value={newInstanceNumber}
                onChange={(e) => setNewInstanceNumber(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleCreateInstance} disabled={actionId === "create"}>
              {actionId === "create" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {actionId === "create" ? "Создаем…" : "Создать"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
