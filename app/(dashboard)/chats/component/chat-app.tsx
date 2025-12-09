"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase-client";
import { ConversationList } from "@/app/(dashboard)/chats/component/conversation-list";
import { ChatArea } from "@/app/(dashboard)/chats/component/chat-area";
import { UserProfile } from "@/app/(dashboard)/chats/component/user-profile";
import {
  sendTextMessage,
  resolveInstance,
  handleLabel,
  markChatAsRead,
  fetchConnectionState,
  sendMedia,
  sendLocation,
  sendContact,
  sendReaction,
  sendButtons,
  sendList,
  sendPoll,
  sendMediaFile,
  connectInstance,
  updateMessage,
  readPreferredInstance
} from "@/lib/evo-api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

type MessageKey = {
  id?: string | null;
  remoteJid?: string | null;
  remoteJidAlt?: string | null;
  participant?: string | null;
  fromMe?: boolean | null;
};

type MediaMessage = {
  url?: string;
  directPath?: string;
  caption?: string;
  fileName?: string;
  mimetype?: string;
};

type MessageContent = {
  conversation?: string;
  extendedTextMessage?: { text?: string | null };
  imageMessage?: MediaMessage;
  videoMessage?: MediaMessage;
  documentMessage?: MediaMessage;
  audioMessage?: MediaMessage;
};

type MessageRow = {
  id: string;
  key?: MessageKey | null;
  message?: MessageContent | null;
  messageType?: string | null;
  messageTimestamp?: number | null;
  pushName?: string | null;
  status?: string | null;
  source?: string | null;
  chatId?: string | null;
  labels?: string | null;
};

type MessageUpdateRow = {
  messageId?: string;
  status?: string | null;
};

type ChatRow = {
  id: string;
  remoteJid: string;
  name?: string | null;
  unreadMessages?: number | null;
  updatedAt?: string | null;
  createdAt?: string | null;
  instanceId: string;
  labels?: string | null;
};

type Conversation = {
  id: string;
  remoteJid: string;
  name: string;
  avatar: string;
  lastMessage: string;
  timestamp: string;
  lastMessageTs?: number;
  lastSource?: string;
  unreadCount: number;
  isActive: boolean;
  status: string;
  labels?: LabelTag[];
  instanceId?: string;
};

type Message = {
  id: string;
  senderId: string;
  participant?: string;
  content: string;
  timestamp: string;
  timestampMs?: number;
  source?: string;
  isOwn: boolean;
  status?: string;
  keyId?: string;
  attachments?: Array<{
    type: "image" | "video" | "document" | "audio";
    url?: string;
    name?: string;
    caption?: string;
    mimetype?: string;
    sizeBytes?: number;
  }>;
};

type Contact = {
  remoteJid: string;
  pushName?: string | null;
  profilePicUrl?: string | null;
};

type InstanceStatus = {
  id: string;
  connectionStatus: string;
};

type LabelRow = {
  labelId: string;
  name?: string | null;
  color?: string | null;
  instanceId?: string | null;
};

type LabelTag = {
  labelId: string;
  name: string;
  color?: string | null;
};

type MediaRow = {
  id: string;
  fileName?: string | null;
  type?: string | null;
  mimetype?: string | null;
  messageId?: string | null;
  fileUrl?: string | null;
};

const fallbackAvatar = "/logo.png";

function formatTimestampFromSeconds(seconds?: number | null) {
  if (!seconds) return "";
  const date = new Date(seconds * 1000);
  return date.toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function extractText(message?: MessageContent | null) {
  if (!message) return "";
  return (
    message.conversation ||
    message?.extendedTextMessage?.text ||
    message?.imageMessage?.caption ||
    message?.videoMessage?.caption ||
    ""
  );
}

function extractAttachments(
  message?: MessageContent | null,
  opts?: { allowMmg?: boolean; allowMmgForDocuments?: boolean }
) {
  const attachments: Message["attachments"] = [];
  if (!message) return attachments;
  const mediaUrl = (message as any)?.mediaUrl as string | undefined | null;
  const normalizeUrl = (value?: string | null, allowMmgOverride = false) => {
    if (!value) return undefined;
    // Ссылки mmg.whatsapp.net без авторизации обычно не грузятся в браузере. Для исходящих сообщений
    // оставляем их, чтобы показать превью, иначе прячем. Для документов разрешаем всегда.
    if (value.includes("mmg.whatsapp.net") && !(opts?.allowMmg || allowMmgOverride)) return undefined;
    if (value.startsWith("/")) return undefined;
    return value;
  };
  const parseFileLength = (input?: { low?: number; high?: number; unsigned?: boolean }) => {
    if (!input) return undefined;
    const low = input.low || 0;
    const high = input.high || 0;
    return high ? high * 2 ** 32 + low : low;
  };

  if (message.imageMessage) {
    attachments.push({
      type: "image",
      url:
        normalizeUrl(message.imageMessage.url) ||
        normalizeUrl(message.imageMessage.directPath) ||
        normalizeUrl(mediaUrl),
      caption: message.imageMessage.caption,
      name: message.imageMessage.fileName,
      mimetype: message.imageMessage.mimetype,
      sizeBytes: parseFileLength(message.imageMessage.fileLength as any)
    });
  }

  if (message.videoMessage) {
    attachments.push({
      type: "video",
      url:
        normalizeUrl(message.videoMessage.url) ||
        normalizeUrl(message.videoMessage.directPath) ||
        normalizeUrl(mediaUrl),
      caption: message.videoMessage.caption,
      name: message.videoMessage.fileName,
      mimetype: message.videoMessage.mimetype,
      sizeBytes: parseFileLength(message.videoMessage.fileLength as any)
    });
  }

  if (message.documentMessage) {
    attachments.push({
      type: "document",
      url:
        normalizeUrl(message.documentMessage.url, opts?.allowMmgForDocuments) ||
        normalizeUrl(message.documentMessage.directPath, opts?.allowMmgForDocuments) ||
        normalizeUrl(mediaUrl, opts?.allowMmgForDocuments),
      name: message.documentMessage.fileName,
      mimetype: message.documentMessage.mimetype,
      sizeBytes: parseFileLength(message.documentMessage.fileLength as any)
    });
  }

  if (message.audioMessage) {
    attachments.push({
      type: "audio",
      url:
        normalizeUrl(message.audioMessage.url) ||
        normalizeUrl(message.audioMessage.directPath) ||
        normalizeUrl(mediaUrl),
      name: message.audioMessage.fileName,
      mimetype: message.audioMessage.mimetype,
      sizeBytes: parseFileLength(message.audioMessage.fileLength as any)
    });
  }

  return attachments;
}

function friendlySource(src?: string | null) {
  if (!src) return "";
  const normalized = src.toLowerCase();
  if (normalized === "unknown") return "mobile app";
  return src;
}

function sortConversationsByTime(list: Conversation[]) {
  return [...list].sort((a, b) => (b.lastMessageTs || 0) - (a.lastMessageTs || 0));
}

const stripWhatsappSuffix = (value?: string | null) =>
  (value || "").replace(/@s\.whatsapp\.net$/, "");

function mapMediaAttachment(media?: MediaRow): Message["attachments"][number] | null {
  if (!media) return null;
  const type = (media.type || "").toLowerCase();
  const normalizedType =
    type === "image" || type === "video" || type === "document" || type === "audio"
      ? type
      : "document";
  if (!media.fileUrl) return null;

  return {
    type: normalizedType,
    url: media.fileUrl,
    name: media.fileName || normalizedType,
    mimetype: media.mimetype || undefined
  };
}

function parseLabels(raw?: string | string[] | null): string[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.map(String);
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed.map(String);
    } catch {
      // not JSON, fallback to comma-separated
    }
    return raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
}

export default function ChatApp() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [showProfile, setShowProfile] = useState(false);
  const [loadingChats, setLoadingChats] = useState(false);
  const [contactByRemote, setContactByRemote] = useState<Record<string, Contact>>({});
  const [instanceStatuses, setInstanceStatuses] = useState<Record<string, string>>({});
  const [instanceNames, setInstanceNames] = useState<Record<string, string>>({});
  const [search, setSearch] = useState("");
  const [instanceName, setInstanceName] = useState<string | null>(null);
  const [preferredInstanceId, setPreferredInstanceId] = useState<string | null>(null);
  const [tab, setTab] = useState<"chats" | "groups" | "archive">("chats");
  const [labelsById, setLabelsById] = useState<Record<string, LabelTag>>({});
  const availableLabels = useMemo(() => Object.values(labelsById), [labelsById]);
  const searchParams = useSearchParams();
  const router = useRouter();
  const [qrData, setQrData] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const saved = readPreferredInstance();
    if (saved?.name) setInstanceName(saved.name);
    if (saved?.id) setPreferredInstanceId(saved.id);
    loadChats(saved?.name || null, saved?.id || null);
  }, []);

  useEffect(() => {
    if (instanceName) return;
    resolveInstance()
      .then((name) => setInstanceName((prev) => prev || name))
      .catch((err) => {
        console.error("Не удалось получить instanceName:", err);
        setInstanceName(null);
      });
  }, [instanceName]);

  useEffect(() => {
    if (!instanceName && !preferredInstanceId) return;
    loadChats(instanceName || null, preferredInstanceId);
  }, [instanceName, preferredInstanceId]);

  useEffect(() => {
    const instId = selectedConversation?.instanceId;
    const instName = instId ? instanceNames[instId] : null;
    if (!instId || !instName) return;

    let cancelled = false;
    const pollState = async () => {
      try {
        const res = await fetchConnectionState(instName);
        const state = res?.instance?.state as string | undefined;
        if (!cancelled && state) {
          setInstanceStatuses((prev) => ({ ...prev, [instId]: state }));
        }
      } catch (err) {
        console.warn("connectionState poll failed", err);
      }
    };

    pollState();
    const interval = setInterval(pollState, 30000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [selectedConversation?.instanceId, instanceNames]);

  const currentUser = useMemo(
    () =>
      selectedConversation
        ? {
            id: selectedConversation.remoteJid,
            name: stripWhatsappSuffix(selectedConversation.name),
            avatar: selectedConversation.avatar || fallbackAvatar,
            status: selectedConversation.status || "Онлайн",
            bio: "",
            email: selectedConversation.remoteJid,
            phone: selectedConversation.remoteJid.replace("@s.whatsapp.net", ""),
            location: "Казахстан",
            sharedFiles: [],
            labels: selectedConversation.labels || []
          }
        : null,
    [selectedConversation]
  );

  async function loadChats(preferredInstanceName?: string | null, preferredInstanceId?: string | null) {
    setLoadingChats(true);
    try {
      const chatQuery = supabase
        .from("Chat")
        .select("id,remoteJid,name,unreadMessages,updatedAt,createdAt,instanceId,labels");
      const contactQuery = supabase
        .from("Contact")
        .select("remoteJid,pushName,profilePicUrl,instanceId");
      const messageQuery = supabase
        .from("Message")
        .select("id,key,message,messageTimestamp,pushName,status,source,messageType,instanceId")
        .order("messageTimestamp", { ascending: false })
        .limit(200);

      const [
        { data: chatRows, error: chatError },
        { data: contactRows },
        { data: recentMessages },
        { data: instances },
        { data: labelRows }
      ] = await Promise.all([
        preferredInstanceId ? chatQuery.eq("instanceId", preferredInstanceId) : chatQuery,
        preferredInstanceId ? contactQuery.eq("instanceId", preferredInstanceId) : contactQuery,
        preferredInstanceId ? messageQuery.eq("instanceId", preferredInstanceId) : messageQuery,
        supabase.from("Instance").select("id,name,connectionStatus"),
        supabase.from("Label").select("labelId,name,color,instanceId")
      ]);

      if (chatError) {
        console.error("Ошибка загрузки чатов:", chatError);
        return;
      }

      const contactMap: Record<string, Contact> = {};
      (contactRows || []).forEach((c) => {
        const contact = c as Contact;
        contactMap[contact.remoteJid] = contact;
      });
      setContactByRemote(contactMap);

      const instanceMap: Record<string, string> = {};
      const instanceNameMap: Record<string, string> = {};
      const instanceNameToId: Record<string, string> = {};
      (instances || []).forEach((i: InstanceStatus & { name?: string }) => {
        instanceMap[i.id] = i.connectionStatus;
        if (i.name) {
          instanceNameMap[i.id] = i.name;
          instanceNameToId[i.name] = i.id;
        }
      });
      setInstanceStatuses(instanceMap);
      setInstanceNames(instanceNameMap);
      const targetInstanceId =
        (preferredInstanceName && instanceNameToId[preferredInstanceName]) ||
        (instanceName && instanceNameToId[instanceName]) ||
        preferredInstanceId ||
        null;
      if (!preferredInstanceId && targetInstanceId) {
        setPreferredInstanceId(targetInstanceId);
      }

      const labelMap: Record<string, LabelTag> = {};
      (labelRows || []).forEach((l) => {
        const lbl = l as LabelRow;
        if (!lbl.labelId) return;
        labelMap[lbl.labelId] = {
          labelId: lbl.labelId,
          name: lbl.name || lbl.labelId,
          color: lbl.color
        };
      });
      setLabelsById(labelMap);

      const lastMessageByRemote: Record<string, MessageRow> = {};
      const lastIncomingByRemote: Record<string, MessageRow> = {};
      (recentMessages || []).forEach((m) => {
        const msg = m as MessageRow;
        const remote = msg.key?.remoteJid || msg.key?.remoteJidAlt;
        if (!remote) return;
        if (!lastMessageByRemote[remote]) {
          lastMessageByRemote[remote] = msg;
        }
        if (msg.key?.fromMe === false && !lastIncomingByRemote[remote]) {
          lastIncomingByRemote[remote] = msg;
        }
      });

      const filteredChats = (chatRows || []).filter((chat) => {
        if (!targetInstanceId) return true;
        return (chat as ChatRow).instanceId === targetInstanceId;
      });

      const mapped: Conversation[] = filteredChats.map((chat) => {
        const chatRow = chat as ChatRow;
        const contact = contactMap[chatRow.remoteJid];
        const lastMsg = lastMessageByRemote[chatRow.remoteJid];
        const lastIncoming = lastIncomingByRemote[chatRow.remoteJid];
        const lastText = extractText(lastMsg?.message);
        const lastTs = lastMsg?.messageTimestamp
          ? lastMsg.messageTimestamp * 1000
          : chatRow.updatedAt
            ? Date.parse(chatRow.updatedAt)
            : 0;
        const tsString = lastMsg?.messageTimestamp
          ? formatTimestampFromSeconds(lastMsg.messageTimestamp)
          : chatRow.updatedAt
            ? new Date(chatRow.updatedAt).toLocaleString("ru-RU", {
                day: "2-digit",
                month: "2-digit",
                hour: "2-digit",
                minute: "2-digit"
              })
            : "";
        const status =
          instanceMap[chatRow.instanceId] === "open"
            ? "Онлайн"
            : instanceMap[chatRow.instanceId]
              ? "Оффлайн"
              : contact?.pushName
                ? "На связи"
                : "Не в сети";
        const parsedLabels = parseLabels(chatRow.labels).map(
          (id) => labelMap[id] || { labelId: id, name: id }
        );
        const rawName = chatRow.name || contact?.pushName || chatRow.remoteJid;
        const cleanName = stripWhatsappSuffix(rawName) || "Неизвестный контакт";

        return {
          id: chatRow.id,
          remoteJid: chatRow.remoteJid,
          name: cleanName,
          avatar: contact?.profilePicUrl || fallbackAvatar,
          lastMessage: lastText || "Нет сообщений",
          timestamp: tsString,
          lastMessageTs: lastTs,
          lastSource: friendlySource(lastIncoming?.source || lastMsg?.source),
          unreadCount: chatRow.unreadMessages ?? 0,
          isActive: false,
          status,
          labels: parsedLabels,
          instanceId: chatRow.instanceId
        };
      });

      const sorted = sortConversationsByTime(mapped);
      setConversations(sorted);
      const paramJid = searchParams?.get("jid");
      const found = paramJid ? sorted.find((c) => c.remoteJid === paramJid) : null;
      setSelectedConversation((prev) => prev || found || sorted[0] || null);
    } finally {
      setLoadingChats(false);
    }
  }

  useEffect(() => {
    if (!selectedConversation) {
      setMessages([]);
      return;
    }

    const remoteJid = selectedConversation.remoteJid;
    const targetInstanceId = selectedConversation.instanceId || preferredInstanceId || null;
    let messageFetcher = supabase
      .from("Message")
      .select("id,key,message,messageTimestamp,pushName,status,source,messageType")
      .order("messageTimestamp", { ascending: true })
      .filter("key->>remoteJid", "eq", remoteJid)
      .limit(50);
    if (targetInstanceId) {
      messageFetcher = messageFetcher.eq("instanceId", targetInstanceId);
    }
    messageFetcher.then(async ({ data, error }) => {
        if (error) {
          console.error("Ошибка загрузки сообщений:", error);
          setMessages([]);
          return;
        }

        const messageRows = (data || []) as MessageRow[];
        const ids = messageRows.map((m) => m.id).filter(Boolean);
        let mediaMap: Record<string, Message["attachments"]> = {};
        if (ids.length) {
          const { data: mediaRows, error: mediaError } = await supabase
            .from("Media")
            .select("id,fileName,type,mimetype,messageId")
            .in("messageId", ids);
          if (mediaError) {
            console.error("Ошибка загрузки медиа:", mediaError);
          } else {
            mediaMap = {};
            (mediaRows || []).forEach((row) => {
              const media = row as MediaRow;
              if (!media.messageId) return;
              const att = mapMediaAttachment(media);
              if (!att) return;
              mediaMap[media.messageId] = [...(mediaMap[media.messageId] || []), att];
            });
          }
        }

    const mappedMessages: Message[] = messageRows.map((row) =>
      mapMessageRow(row, mediaMap[row.id])
    );
        mappedMessages.sort((a, b) => (a.timestampMs || 0) - (b.timestampMs || 0));

        setMessages(mappedMessages);

      });
  }, [selectedConversation, contactByRemote, instanceStatuses, preferredInstanceId]);

  async function markConversationAsRead(conversation?: Conversation | null) {
    if (!conversation) return;
    const remoteJid = conversation.remoteJid;
    if (!remoteJid) return;
    setConversations((prev) =>
      prev.map((c) => (c.remoteJid === remoteJid ? { ...c, unreadCount: 0 } : c))
    );
    try {
      const instFromConversation = conversation.instanceId
        ? instanceNames[conversation.instanceId]
        : null;
      const preferred = readPreferredInstance();
      const preferredName = preferred?.name || null;
      let inst = instFromConversation || instanceName || preferredName;
      if (!inst) inst = await resolveInstance();
      if (inst) setInstanceName(inst);
      if (inst) {
        await markChatAsRead(inst, { remoteJid, readMessages: true });
      }
    } catch (err) {
      console.warn("Не удалось пометить прочитанным через API", err);
    }
  }

  useEffect(() => {
    const channel = supabase
      .channel("chats-realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "Message",
          ...(preferredInstanceId ? { filter: `instanceId=eq.${preferredInstanceId}` } : {})
        },
        (payload) => {
          const row = payload.new as MessageRow;
          if (preferredInstanceId && (row as any)?.instanceId !== preferredInstanceId) return;
          const remote = row?.key?.remoteJid || row?.key?.remoteJidAlt;
          if (!remote) return;

          const message = mapMessageRow(row);

          setConversations((prev) => {
            const idx = prev.findIndex((c) => c.remoteJid === remote);
            let next = [...prev];
            if (idx === -1) {
              // новый чат
              next.unshift({
                id: row.chatId || row.id,
                remoteJid: remote,
                name: stripWhatsappSuffix(
                  contactByRemote[remote]?.pushName || row.pushName || remote
                ),
                avatar: contactByRemote[remote]?.profilePicUrl || fallbackAvatar,
                lastMessage: message.content,
                timestamp: message.timestamp,
                lastMessageTs: message.timestampMs,
                lastSource: message.source,
                unreadCount: message.isOwn ? 0 : 1,
                isActive: false,
                status: "Новый"
              });
            } else {
              const updated = {
                ...next[idx],
                lastMessage: message.content,
                timestamp: message.timestamp,
                lastMessageTs: message.timestampMs,
                lastSource: message.source,
                unreadCount: message.isOwn ? next[idx].unreadCount : next[idx].unreadCount + 1
              };
              next.splice(idx, 1);
              next.unshift(updated);
            }
            next = sortConversationsByTime(next);
            return next;
          });

          setSelectedConversation((prev) => {
            if (!prev || prev.remoteJid !== remote) return prev;
            return {
              ...prev,
              lastMessage: message.content,
              timestamp: message.timestamp,
              lastMessageTs: message.timestampMs
            };
          });

          setMessages((prev) => {
            if (selectedConversation?.remoteJid !== remote) return prev;
            const next = [...prev, message];
            next.sort((a, b) => (a.timestampMs || 0) - (b.timestampMs || 0));
            return next;
          });

          if (!message.attachments?.length) {
            appendMediaToMessage(row.id);
          }

        }
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "MessageUpdate",
          ...(preferredInstanceId ? { filter: `instanceId=eq.${preferredInstanceId}` } : {})
        },
        (payload) => {
          const upd = payload.new as MessageUpdateRow;
          if (preferredInstanceId && (upd as any)?.instanceId !== preferredInstanceId) return;
          setMessages((prev) =>
            prev.map((m) =>
              m.id === upd.messageId
                ? { ...m, status: upd.status || m.status }
                : m
            )
          );
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "Chat",
          ...(preferredInstanceId ? { filter: `instanceId=eq.${preferredInstanceId}` } : {})
        },
        (payload) => {
          const updatedChat = payload.new as ChatRow;
          if (preferredInstanceId && updatedChat.instanceId !== preferredInstanceId) return;
          if (!updatedChat) return;
          setConversations((prev) => {
            const idx = prev.findIndex((c) => c.id === updatedChat.id);
            const base = {
              id: updatedChat.id,
              remoteJid: updatedChat.remoteJid,
              name: stripWhatsappSuffix(
                updatedChat.name ||
                  contactByRemote[updatedChat.remoteJid]?.pushName ||
                  updatedChat.remoteJid
              ),
              avatar: contactByRemote[updatedChat.remoteJid]?.profilePicUrl || fallbackAvatar,
              lastMessage: prev[idx]?.lastMessage || "",
              timestamp:
                updatedChat.updatedAt && !Number.isNaN(Date.parse(updatedChat.updatedAt))
                  ? new Date(updatedChat.updatedAt).toLocaleString("ru-RU", {
                      day: "2-digit",
                      month: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit"
                    })
                  : prev[idx]?.timestamp || "",
              lastMessageTs: updatedChat.updatedAt ? Date.parse(updatedChat.updatedAt) : prev[idx]?.lastMessageTs || 0,
              lastSource: prev[idx]?.lastSource,
              unreadCount: updatedChat.unreadMessages ?? prev[idx]?.unreadCount ?? 0,
              isActive: false,
              status: instanceStatuses[updatedChat.instanceId] === "open" ? "Онлайн" : "Не в сети",
              labels: parseLabels(updatedChat.labels).map(
                (id) => labelsById[id] || { labelId: id, name: id }
              )
            };

            const next = [...prev];
            if (idx === -1) {
              next.unshift(base);
            } else {
              const merged = { ...next[idx], ...base, unreadCount: base.unreadCount };
              next.splice(idx, 1);
              next.unshift(merged);
            }
            return sortConversationsByTime(next);
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedConversation, contactByRemote, labelsById, instanceStatuses, preferredInstanceId]);

  useEffect(() => {
    // Авто-пометка прочитанного убрана: делать вручную по действию
  }, [selectedConversation]);

  function mapMessageRow(m: MessageRow, mediaAttachments?: Message["attachments"]): Message {
    const fromPayload = extractAttachments(m.message, {
      allowMmg: Boolean(m.key?.fromMe),
      allowMmgForDocuments: true
    });
    const mergedAttachments = [...fromPayload];
    if (mediaAttachments?.length) {
      mergedAttachments.push(...mediaAttachments);
    }
    const dedupedAttachments = (() => {
      const seen = new Set<string>();
      const isMedia = (att: Message["attachments"][number]) =>
        att.type === "image" || att.type === "video" || att.type === "audio";
      return mergedAttachments.reduce<Message["attachments"]>((acc, att) => {
        if (isMedia(att) && !att.url) return acc; // медиавложение без ссылки не показываем
        const key = `${att.type}-${att.url || att.name || ""}`;
        if (seen.has(key)) return acc;
        seen.add(key);
        acc.push(att);
        return acc;
      }, []);
    })();
    return {
      id: m.id,
      senderId: m.key?.participant || m.pushName || m.key?.remoteJid || "Контакт",
      participant: m.key?.participant || undefined,
      content: extractText(m.message),
      timestamp: formatTimestampFromSeconds(m.messageTimestamp),
      timestampMs: m.messageTimestamp ? m.messageTimestamp * 1000 : undefined,
      source: friendlySource(m.source),
      isOwn: Boolean(m.key?.fromMe),
      status: m.status ?? undefined,
      keyId: m.key?.id || m.id || undefined,
      attachments: dedupedAttachments
    };
  }

  async function appendMediaToMessage(messageId?: string) {
    if (!messageId) return;
    const { data: mediaRows, error } = await supabase
      .from("Media")
      .select("id,fileName,type,mimetype,messageId,fileUrl")
      .eq("messageId", messageId);
    if (error || !mediaRows?.length) return;
    const mediaAttachments = mediaRows
      .map((row) => mapMediaAttachment(row as MediaRow))
      .filter(Boolean) as Message["attachments"];
    if (!mediaAttachments.length) return;
    setMessages((prev) =>
      prev.map((m) =>
        m.id === messageId
          ? { ...m, attachments: [...(m.attachments || []), ...mediaAttachments] }
          : m
      )
    );
  }

  const filteredConversations = conversations
    .filter((c) => {
      const jid = c.remoteJid || "";
      if (tab === "chats") return jid.endsWith("@s.whatsapp.net");
      if (tab === "groups") return !jid.endsWith("@s.whatsapp.net");
      if (tab === "archive") return false; // архив пока пустой
      return true;
    })
    .filter((c) => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return c.name.toLowerCase().includes(q) || c.remoteJid.toLowerCase().includes(q);
    });

  async function handleSendMessage(text: string) {
    if (!selectedConversation) return;
    const resolvedInstance = await ensureInstance();
    try {
      await sendTextMessage(resolvedInstance, {
        number: selectedConversation.remoteJid,
        text
      });
      const unreadClient = messages
        .filter((m) => !m.isOwn && m.keyId && m.status !== "READ")
        .map((m) => ({
          remoteJid: selectedConversation.remoteJid,
          fromMe: false,
          id: m.keyId as string
        }));
      if (unreadClient.length) {
        await markMessagesAsRead(unreadClient);
      }
      toast({ title: "Сообщение отправлено" });
    } catch (err) {
      toast({ title: "Не удалось отправить", description: String(err) });
      throw err;
    }
  }

  async function handleEditMessage(messageId: string, keyId: string, text: string) {
    if (!selectedConversation) return;
    const inst = await ensureInstance();
    try {
      await updateMessage(inst, {
        number: selectedConversation.remoteJid,
        key: {
          remoteJid: selectedConversation.remoteJid,
          fromMe: true,
          id: keyId
        },
        text
      });
      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId ? { ...m, content: text, status: "PENDING" } : m
        )
      );
      toast({ title: "Сообщение отредактировано" });
    } catch (err) {
      toast({ title: "Не удалось отредактировать", description: String(err) });
      throw err;
    }
  }

  async function ensureInstance(): Promise<string> {
    const preferred = readPreferredInstance();
    const preferredName = preferred?.name || null;
    const fromConversation = selectedConversation?.instanceId
      ? instanceNames[selectedConversation.instanceId]
      : null;
    let inst = fromConversation || instanceName || preferredName;
    if (!inst) {
      inst = await resolveInstance();
      if (inst) setInstanceName(inst);
    }
    if (!inst) throw new Error("Instance не получен");
    return inst;
  }

  async function handleSendMedia(payload: { url: string; caption?: string }) {
    if (!selectedConversation) return;
    const inst = await ensureInstance();
    try {
      await sendMedia(inst, {
        number: selectedConversation.remoteJid,
        mediaUrl: payload.url,
        caption: payload.caption
      });
      toast({ title: "Медиа отправлено" });
    } catch (err) {
      toast({ title: "Не удалось отправить медиа", description: String(err) });
      throw err;
    }
  }

  async function handleSendLocation(payload: { latitude: number; longitude: number; address?: string }) {
    if (!selectedConversation) return;
    const inst = await ensureInstance();
    try {
      await sendLocation(inst, {
        number: selectedConversation.remoteJid,
        latitude: payload.latitude,
        longitude: payload.longitude,
        address: payload.address
      });
      toast({ title: "Локация отправлена" });
    } catch (err) {
      toast({ title: "Не удалось отправить локацию", description: String(err) });
      throw err;
    }
  }

  async function handleSendContact(payload: { name: string; phone: string }) {
    if (!selectedConversation) return;
    const inst = await ensureInstance();
    try {
      await sendContact(inst, {
        number: selectedConversation.remoteJid,
        contactName: payload.name,
        contactNumber: payload.phone
      });
      toast({ title: "Контакт отправлен" });
    } catch (err) {
      toast({ title: "Не удалось отправить контакт", description: String(err) });
      throw err;
    }
  }

  async function handleSendReaction(payload: { emoji: string; messageId: string }) {
    if (!selectedConversation) return;
    const inst = await ensureInstance();
    try {
      await sendReaction(inst, {
        number: selectedConversation.remoteJid,
        key: { id: payload.messageId, remoteJid: selectedConversation.remoteJid },
        reaction: payload.emoji
      });
      toast({ title: "Реакция отправлена" });
    } catch (err) {
      toast({ title: "Не удалось отправить реакцию", description: String(err) });
      throw err;
    }
  }

  async function handleSendButtons(payload: { text: string; buttons: string[] }) {
    if (!selectedConversation) return;
    const inst = await ensureInstance();
    try {
      await sendButtons(inst, {
        number: selectedConversation.remoteJid,
        text: payload.text,
        buttons: payload.buttons.map((b, idx) => ({ id: `btn-${idx}`, text: b }))
      });
      toast({ title: "Кнопки отправлены" });
    } catch (err) {
      toast({ title: "Не удалось отправить кнопки", description: String(err) });
      throw err;
    }
  }

  async function handleSendList(payload: {
    title: string;
    description?: string;
    sections: Array<{ title: string; rows: string[] }>;
  }) {
    if (!selectedConversation) return;
    const inst = await ensureInstance();
    try {
      await sendList(inst, {
        number: selectedConversation.remoteJid,
        title: payload.title,
        description: payload.description,
        sections: payload.sections.map((s) => ({
          title: s.title,
          rows: s.rows.map((r, idx) => ({ id: `row-${idx}`, title: r }))
        }))
      });
      toast({ title: "Список отправлен" });
    } catch (err) {
      toast({ title: "Не удалось отправить список", description: String(err) });
      throw err;
    }
  }

  async function handleSendPoll(payload: { name: string; options: string[] }) {
    if (!selectedConversation) return;
    const inst = await ensureInstance();
    try {
      await sendPoll(inst, {
        number: selectedConversation.remoteJid,
        name: payload.name,
        options: payload.options
      });
      toast({ title: "Опрос отправлен" });
    } catch (err) {
      toast({ title: "Не удалось отправить опрос", description: String(err) });
      throw err;
    }
  }

  async function handleSendMediaFile(file: File, caption?: string) {
    if (!selectedConversation) return;
    const inst = await ensureInstance();
    try {
      await sendMediaFile(inst, {
        number: selectedConversation.remoteJid,
        file,
        caption
      });
      toast({ title: "Файл отправлен" });
    } catch (err) {
      toast({ title: "Не удалось отправить файл", description: String(err) });
      throw err;
    }
  }

  async function handleShowQr() {
    const inst = await ensureInstance();
    const response = await connectInstance(inst);
    const qrcode =
      response?.qrcode?.base64 ||
      response?.qrCode ||
      response?.qrcode ||
      response?.base64 ||
      null;
    if (qrcode) {
      setQrData(qrcode.startsWith("data:") ? qrcode : `data:image/png;base64,${qrcode}`);
    }
  }

  async function handleLabelsUpdate(labelIds: string[]) {
    if (!selectedConversation) return;
    const prevLabels = selectedConversation.labels?.map((l) => l.labelId) || [];
    const unique = Array.from(new Set(labelIds));
    const toLabelObjects = (ids: string[]) =>
      ids.map((id) => labelsById[id] || { labelId: id, name: id });

    setSelectedConversation((prev) => (prev ? { ...prev, labels: toLabelObjects(unique) } : prev));
    setConversations((prev) =>
      prev.map((c) => (c.id === selectedConversation.id ? { ...c, labels: toLabelObjects(unique) } : c))
    );

    try {
      let resolvedInstance = instanceName;
      if (!resolvedInstance) {
        resolvedInstance = await resolveInstance();
        if (resolvedInstance) setInstanceName(resolvedInstance);
      }
      if (!resolvedInstance) {
        throw new Error("Instance не получен");
      }

      const adds = unique.filter((id) => !prevLabels.includes(id));
      const removes = prevLabels.filter((id) => !unique.includes(id));
      const number = stripWhatsappSuffix(selectedConversation.remoteJid) || selectedConversation.remoteJid;

      const requests: Promise<unknown>[] = [];
      adds.forEach((labelId) =>
        requests.push(
          handleLabel(resolvedInstance, {
            number,
            labelId,
            action: "add"
          })
        )
      );
      removes.forEach((labelId) =>
        requests.push(
          handleLabel(resolvedInstance, {
            number,
            labelId,
            action: "remove"
          })
        )
      );

      if (requests.length) {
        await Promise.all(requests);
      }
    } catch (err) {
      console.error("handleLabel error", err);
      // rollback optimistic update
      setSelectedConversation((prev) =>
        prev ? { ...prev, labels: toLabelObjects(prevLabels) } : prev
      );
      setConversations((prev) =>
        prev.map((c) =>
          c.id === selectedConversation?.id ? { ...c, labels: toLabelObjects(prevLabels) } : c
        )
      );
      throw err;
    }
  }

  const canSend =
    selectedConversation && selectedConversation.instanceId
      ? instanceStatuses[selectedConversation.instanceId] === "open"
      : false;

  async function markMessagesAsRead(
    items: Array<{ remoteJid: string; fromMe: boolean; id: string }>,
    targetStatus: "READ" | "DELIVERY_ACK" | "SERVER_ACK" = "READ"
  ) {
    if (!items.length || !selectedConversation?.instanceId) return;
    try {
      const targetRemote = items[0]?.remoteJid;
      const conversationEntry =
        conversations.find((c) => c.remoteJid === targetRemote) || selectedConversation;
      const baseUnread = conversationEntry?.unreadCount ?? 0;
      const msgIds: string[] = [];
      items.forEach((item) => {
        const msg = messages.find((m) => m.keyId === item.id || m.id === item.id);
        if (msg) msgIds.push(msg.id);
      });

      if (msgIds.length) {
        await supabase.from("Message").update({ status: targetStatus }).in("id", msgIds);
      }
      const ids = new Set(items.map((i) => i.id));
      setMessages((prev) =>
        prev.map((m) =>
          m.keyId && ids.has(m.keyId) ? { ...m, status: targetStatus } : m
        )
      );

      const incoming = items.filter((i) => !i.fromMe);
      if (incoming.length) {
        const isRead = targetStatus === "READ";
        const delta = incoming.length;
        const updatedUnread = isRead ? Math.max(0, baseUnread - delta) : baseUnread + delta;

        await supabase
          .from("Chat")
          .update({ unreadMessages: updatedUnread, updatedAt: new Date().toISOString() })
          .eq("instanceId", conversationEntry?.instanceId || selectedConversation.instanceId)
          .eq("remoteJid", targetRemote);

        setConversations((prev) =>
          prev.map((c) =>
            incoming.some((i) => i.remoteJid === c.remoteJid)
              ? { ...c, unreadCount: updatedUnread }
              : c
          )
        );
        setSelectedConversation((prev) =>
          prev && incoming.some((i) => i.remoteJid === prev.remoteJid)
            ? { ...prev, unreadCount: updatedUnread }
            : prev
        );
      }
    } catch (err) {
      console.warn("markMessagesAsRead error", err);
    }
  }

  return (
    <div className="flex h-[calc(100vh-72px)] bg-gray-50">
      <ConversationList
        conversations={filteredConversations}
        selectedConversation={selectedConversation}
        loading={loadingChats}
        searchTerm={search}
        onSearch={setSearch}
        selectedTab={tab}
        onTabChange={setTab}
        chatsCount={conversations.filter((c) => c.remoteJid.endsWith("@s.whatsapp.net")).length}
        groupsCount={conversations.filter((c) => !c.remoteJid.endsWith("@s.whatsapp.net")).length}
        onSelectConversation={(c) => setSelectedConversation(c)}
      />

      {selectedConversation ? (
        <ChatArea
          conversation={selectedConversation}
          messages={messages}
          onToggleProfile={() => setShowProfile(!showProfile)}
          onSendMessage={handleSendMessage}
          availableLabels={availableLabels}
          onUpdateLabels={handleLabelsUpdate}
          onSendMedia={(payload) => handleSendMedia(payload)}
          onSendLocation={(payload) => handleSendLocation(payload)}
          onSendContact={(payload) => handleSendContact(payload)}
          onSendReaction={(payload) => handleSendReaction(payload)}
          onSendButtons={(payload) => handleSendButtons(payload)}
          onSendList={(payload) => handleSendList(payload)}
          onSendPoll={(payload) => handleSendPoll(payload)}
          onSendMediaFile={(file, caption) => handleSendMediaFile(file, caption)}
          onShowQr={() => handleShowQr()}
          onMarkMessagesRead={(items) => markMessagesAsRead(items)}
          onMarkMessagesUnread={(items) => markMessagesAsRead(items, "DELIVERY_ACK")}
          onEditMessage={(messageId, keyId, text) => handleEditMessage(messageId, keyId, text)}
          canSend={canSend}
        />
      ) : (
        <div className="flex flex-1 items-center justify-center text-sm text-gray-500">
          Нет выбранных чатов.
        </div>
      )}

      {showProfile && currentUser && (
        <UserProfile user={currentUser} onClose={() => setShowProfile(false)} />
      )}

      <Dialog open={Boolean(qrData)} onOpenChange={(open) => !open && setQrData(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>QR для подключения</DialogTitle>
            <DialogDescription>Отсканируйте в WhatsApp, чтобы открыть сессию.</DialogDescription>
          </DialogHeader>
          {qrData ? (
            <div className="flex flex-col items-center gap-3">
              <img src={qrData} alt="QR" className="h-64 w-64 rounded-lg border" />
              <DialogFooter>
                <Button onClick={() => setQrData(null)}>Закрыть</Button>
              </DialogFooter>
            </div>
          ) : (
            <div className="py-4 text-center text-sm text-gray-500">Нет QR-кода</div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
