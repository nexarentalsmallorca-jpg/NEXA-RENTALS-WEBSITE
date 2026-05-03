"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Conversation = {
  phone: string;
  name?: string;
  ai_enabled: boolean;
  escalated: boolean;
  last_message?: string;
  last_message_at?: string;
  unread_count: number;
};

type Message = {
  id: string;
  phone: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
  is_manual?: boolean;
  media_url?: string;
  media_type?: string;
  file_name?: string;
  status?: "sent" | "delivered" | "read" | "failed" | string;
  delivery_status?: "sent" | "delivered" | "read" | "failed" | string;
  delivered_at?: string | null;
  read_at?: string | null;
  failed_reason?: string | null;
};

type BookingInfo = {
  name?: string;
  phone?: string;
  date?: string;
  time?: string;
  duration?: string;
  vehicle?: string;
  quantity?: string;
  license?: string;
  age?: string;
  licenseSince?: string;
};

export default function WhatsAppAdminPage() {
  const [password, setPassword] = useState("");
  const [savedPassword, setSavedPassword] = useState("");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedPhone, setSelectedPhone] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [reply, setReply] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [previewMedia, setPreviewMedia] = useState<Message | null>(null);
  const [showMobileDetails, setShowMobileDetails] = useState(false);
  const [showNewContact, setShowNewContact] = useState(false);
  const [newContactName, setNewContactName] = useState("");
  const [newContactPhone, setNewContactPhone] = useState("");
  const [newContactMessage, setNewContactMessage] = useState("");
  const [creatingContact, setCreatingContact] = useState(false);
  const [isNearBottom, setIsNearBottom] = useState(true);
  const [notificationStatus, setNotificationStatus] = useState<
    "default" | "granted" | "denied" | "unsupported"
  >("default");

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const messagesBoxRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const previousSelectedPhoneRef = useRef("");
  const previousLastMessageIdRef = useRef("");

  const selectedConversation = useMemo(
    () => conversations.find((c) => c.phone === selectedPhone),
    [conversations, selectedPhone]
  );

  const bookingInfo = useMemo(() => {
    return extractBookingInfo(messages, selectedConversation);
  }, [messages, selectedConversation]);

  const selectedIsEscalated = Boolean(selectedConversation?.escalated);

  const urgentCount = useMemo(() => {
    return conversations.filter((c) => c.escalated).length;
  }, [conversations]);

  const customerPresence = useMemo(() => {
    return getCustomerPresence(messages, selectedConversation);
  }, [messages, selectedConversation]);

  useEffect(() => {
    const stored = localStorage.getItem("nexa_admin_password") || "";
    setSavedPassword(stored);

    if (typeof window !== "undefined") {
      if (!("Notification" in window)) {
        setNotificationStatus("unsupported");
      } else {
        setNotificationStatus(Notification.permission);
      }
    }
  }, []);

  useEffect(() => {
    if (!savedPassword) return;

    fetchConversations();
    const interval = setInterval(fetchConversations, 4000);

    return () => clearInterval(interval);
  }, [savedPassword]);

  useEffect(() => {
    if (!selectedPhone || !savedPassword) return;

    fetchMessages(selectedPhone);
    markRead(selectedPhone);
    setShowMobileDetails(false);
    setSelectedFile(null);

    const interval = setInterval(() => fetchMessages(selectedPhone), 3000);

    return () => clearInterval(interval);
  }, [selectedPhone, savedPassword]);

  useEffect(() => {
    if (!messages.length) return;

    const latestMessage = messages[messages.length - 1];
    const latestMessageId = latestMessage?.id || "";
    const changedChat = previousSelectedPhoneRef.current !== selectedPhone;
    const isNewMessage = previousLastMessageIdRef.current !== latestMessageId;
    const isIncomingCustomerMessage = latestMessage?.role === "user";

    if (changedChat) {
      scrollToBottom("auto");
    } else if (isNewMessage && (isIncomingCustomerMessage || isNearBottom)) {
      scrollToBottom("smooth");
    }

    previousSelectedPhoneRef.current = selectedPhone;
    previousLastMessageIdRef.current = latestMessageId;
  }, [messages, selectedPhone, isNearBottom]);

  function scrollToBottom(behavior: ScrollBehavior = "smooth") {
    requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({ behavior });
    });
  }

  function handleMessagesScroll() {
    const box = messagesBoxRef.current;
    if (!box) return;

    const distanceFromBottom =
      box.scrollHeight - box.scrollTop - box.clientHeight;

    setIsNearBottom(distanceFromBottom < 180);
  }

  function saveLogin() {
    localStorage.setItem("nexa_admin_password", password);
    setSavedPassword(password);
  }

  function logout() {
    localStorage.removeItem("nexa_admin_password");
    setSavedPassword("");
    setPassword("");
    setSelectedPhone("");
    setMessages([]);
    setSelectedFile(null);
  }

  async function apiFetch(url: string, options: RequestInit = {}) {
    const isFormData = options.body instanceof FormData;

    return fetch(url, {
      ...options,
      headers: {
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
        "x-admin-password": savedPassword,
        ...(options.headers || {}),
      },
    });
  }

  async function requestNotifications() {
    if (typeof window === "undefined" || !("Notification" in window)) {
      setNotificationStatus("unsupported");
      alert("Notifications are not supported on this browser.");
      return;
    }

    const permission = await Notification.requestPermission();
    setNotificationStatus(permission);

    if (permission === "granted") {
      new Notification("NEXA WhatsApp", {
        body: "Notifications are now enabled for this device.",
      });
    }
  }

  async function fetchConversations() {
    const res = await apiFetch("/api/admin/whatsapp/conversations");
    if (!res.ok) return;

    const data = await res.json();
    const chats: Conversation[] = data.conversations || [];

    const sortedChats = sortConversations(chats);
    setConversations(sortedChats);

    const urgent = sortedChats.find((c) => c.escalated || c.unread_count > 0);
    const lastNotifiedKey = localStorage.getItem("nexa_last_notified_key");

    if (
      urgent &&
      typeof window !== "undefined" &&
      "Notification" in window &&
      Notification.permission === "granted"
    ) {
      const notifyKey = `${urgent.phone}-${urgent.last_message_at}`;

      if (notifyKey !== lastNotifiedKey) {
        new Notification(
          urgent.escalated ? "URGENT: NEXA WhatsApp" : "NEXA WhatsApp",
          {
            body: `${urgent.name || urgent.phone}: ${
              urgent.last_message || "New message"
            }`,
          }
        );

        localStorage.setItem("nexa_last_notified_key", notifyKey);
      }
    }
  }

  async function fetchMessages(phone: string) {
    const res = await apiFetch(`/api/admin/whatsapp/messages?phone=${phone}`);
    if (!res.ok) return;

    const data = await res.json();
    setMessages(data.messages || []);
  }

  async function markRead(phone: string) {
    await apiFetch("/api/admin/whatsapp/mark-read", {
      method: "POST",
      body: JSON.stringify({ phone }),
    });

    fetchConversations();
  }

  async function sendReply() {
    if ((!reply.trim() && !selectedFile) || !selectedPhone) return;

    setLoading(true);

    let res: Response;

    if (selectedFile) {
      const formData = new FormData();
      formData.append("phone", selectedPhone);
      formData.append("message", reply.trim());
      formData.append("file", selectedFile);

      res = await apiFetch("/api/admin/whatsapp/send", {
        method: "POST",
        body: formData,
      });
    } else {
      res = await apiFetch("/api/admin/whatsapp/send", {
        method: "POST",
        body: JSON.stringify({
          phone: selectedPhone,
          message: reply.trim(),
        }),
      });
    }

    setLoading(false);

    if (!res.ok) {
      let errorMessage = "Message failed. Check Vercel logs.";

      try {
        const errorData = await res.json();
        errorMessage =
          errorData?.error ||
          errorData?.message ||
          errorData?.details ||
          errorMessage;
      } catch {}

      alert(errorMessage);
      return;
    }

    setReply("");
    setSelectedFile(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    await fetchMessages(selectedPhone);
    await fetchConversations();
    scrollToBottom("smooth");
  }

  async function createNewContactAndSend() {
    const cleanPhone = normalizePhone(newContactPhone);
    const message = newContactMessage.trim();

    if (!cleanPhone) {
      alert("Please enter the customer phone number with country code.");
      return;
    }

    if (!message) {
      alert("Please write the first message.");
      return;
    }

    setCreatingContact(true);

    const res = await apiFetch("/api/admin/whatsapp/send", {
      method: "POST",
      body: JSON.stringify({
        phone: cleanPhone,
        name: newContactName.trim() || null,
        message,
      }),
    });

    setCreatingContact(false);

    if (!res.ok) {
      let errorMessage =
        "Message failed. Make sure the phone number has country code, for example 34612345678. Also check Vercel logs.";

      try {
        const errorData = await res.json();
        errorMessage =
          errorData?.error ||
          errorData?.message ||
          errorData?.details ||
          errorMessage;
      } catch {}

      alert(errorMessage);
      return;
    }

    setShowNewContact(false);
    setNewContactName("");
    setNewContactPhone("");
    setNewContactMessage("");

    setSelectedPhone(cleanPhone);
    await fetchConversations();
    await fetchMessages(cleanPhone);
    scrollToBottom("auto");
  }

  async function toggleAI(enabled: boolean) {
    if (!selectedPhone) return;

    await apiFetch("/api/admin/whatsapp/ai-toggle", {
      method: "POST",
      body: JSON.stringify({
        phone: selectedPhone,
        ai_enabled: enabled,
      }),
    });

    fetchConversations();
  }

  function openChat(phone: string) {
    setSelectedPhone(phone);
    markRead(phone);
  }

  function closeMobileChat() {
    setSelectedPhone("");
    setShowMobileDetails(false);
    setSelectedFile(null);
  }

  function handleFileSelect(file?: File) {
    if (!file) return;

    const maxSizeMb = 15;
    const maxSizeBytes = maxSizeMb * 1024 * 1024;

    if (file.size > maxSizeBytes) {
      alert(`File is too large. Maximum size is ${maxSizeMb}MB.`);
      return;
    }

    setSelectedFile(file);
  }

  if (!savedPassword) {
    return (
      <main className="min-h-[100dvh] bg-neutral-950 text-white flex items-center justify-center p-5">
        <div className="w-full max-w-md rounded-3xl bg-neutral-900 border border-neutral-800 p-6 shadow-2xl">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-orange-500 to-yellow-300 flex items-center justify-center text-black text-2xl font-black">
            N
          </div>

          <h1 className="mt-5 text-2xl font-black">NEXA WhatsApp Inbox</h1>
          <p className="text-neutral-400 mt-2">
            Enter your admin password to open the chat dashboard.
          </p>

          <input
            type="password"
            className="mt-6 w-full rounded-2xl bg-neutral-800 border border-neutral-700 px-4 py-4 outline-none text-base"
            placeholder="Admin password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") saveLogin();
            }}
          />

          <button
            onClick={saveLogin}
            className="mt-4 w-full rounded-2xl bg-orange-500 py-4 font-black text-black hover:bg-orange-400 active:scale-[0.99]"
          >
            Enter Dashboard
          </button>

          <p className="mt-4 text-xs text-neutral-500 leading-relaxed">
            Tip: open this page in Chrome on your phone and add it to your home
            screen for faster access.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="h-[100dvh] bg-neutral-950 text-white flex overflow-hidden">
      <aside
        className={`w-full md:w-[370px] border-r border-neutral-800 bg-neutral-900 flex flex-col ${
          selectedPhone ? "hidden md:flex" : "flex"
        }`}
      >
        <div className="p-4 md:p-5 border-b border-neutral-800 shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black">NEXA Inbox</h1>
              <p className="text-sm text-neutral-400">
                WhatsApp AI + manual control
              </p>
            </div>

            <button
              onClick={logout}
              className="text-xs rounded-full bg-neutral-800 px-3 py-2 text-neutral-300 hover:bg-neutral-700 active:scale-95"
            >
              Logout
            </button>
          </div>

          {urgentCount > 0 && (
            <div className="mt-4 rounded-2xl border border-red-500 bg-red-500/10 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-black text-red-200">
                    🔴 {urgentCount} chat{urgentCount > 1 ? "s" : ""} need
                    human attention
                  </p>
                  <p className="mt-1 text-xs text-red-200/80">
                    Urgent chats are pinned at the top. Open and take over as
                    soon as possible.
                  </p>
                </div>
              </div>
            </div>
          )}

          <button
            onClick={() => setShowNewContact(true)}
            className="mt-4 w-full rounded-2xl bg-orange-500 px-4 py-3 font-black text-black hover:bg-orange-400 active:scale-[0.98]"
          >
            + New Contact / Send Message
          </button>

          <div className="mt-2 grid grid-cols-2 gap-2">
            <button
              onClick={requestNotifications}
              className="text-xs rounded-2xl bg-neutral-800 px-3 py-3 text-neutral-300 hover:bg-neutral-700 active:scale-[0.98]"
            >
              {notificationStatus === "granted"
                ? "Notifications ON"
                : notificationStatus === "denied"
                ? "Notifications Blocked"
                : notificationStatus === "unsupported"
                ? "Not Supported"
                : "Enable Alerts"}
            </button>

            <button
              onClick={fetchConversations}
              className="text-xs rounded-2xl bg-neutral-800 px-3 py-3 font-bold text-neutral-300 hover:bg-neutral-700 active:scale-[0.98]"
            >
              Refresh
            </button>
          </div>

          {notificationStatus === "denied" && (
            <p className="mt-3 text-xs text-red-300 leading-relaxed">
              Notifications are blocked. Enable them from Chrome site settings.
            </p>
          )}
        </div>

        <div className="overflow-y-auto flex-1 pb-[env(safe-area-inset-bottom)]">
          {conversations.length === 0 && (
            <div className="p-5 text-sm text-neutral-500">
              No chats yet. Add a new contact or wait for a WhatsApp message.
            </div>
          )}

          {conversations.map((chat) => {
            const active = isRecentlyActive(chat.last_message_at);

            return (
              <button
                key={chat.phone}
                onClick={() => openChat(chat.phone)}
                className={`w-full text-left p-4 border-b hover:bg-neutral-800 active:bg-neutral-800 ${
                  chat.escalated
                    ? "border-red-500/40 bg-red-500/10"
                    : "border-neutral-800"
                } ${selectedPhone === chat.phone ? "bg-neutral-800" : ""}`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`relative h-12 w-12 rounded-full flex items-center justify-center text-black font-black shrink-0 ${
                      chat.escalated
                        ? "bg-gradient-to-br from-red-500 to-orange-400"
                        : "bg-gradient-to-br from-orange-500 to-yellow-300"
                    }`}
                  >
                    {(chat.name || chat.phone).slice(0, 1).toUpperCase()}

                    {chat.escalated ? (
                      <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-600 border-2 border-neutral-900 flex items-center justify-center text-[10px] text-white">
                        !
                      </span>
                    ) : (
                      active && (
                        <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full bg-green-500 border-2 border-neutral-900" />
                      )
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <div className="font-bold truncate">
                        {chat.name || `+${chat.phone}`}
                      </div>

                      {chat.unread_count > 0 && (
                        <span className="text-xs bg-orange-500 text-black font-bold rounded-full min-w-6 h-6 px-2 flex items-center justify-center">
                          {chat.unread_count}
                        </span>
                      )}
                    </div>

                    <div
                      className={`text-xs ${
                        chat.escalated ? "text-red-200" : "text-neutral-400"
                      }`}
                    >
                      {chat.escalated
                        ? "Needs human attention"
                        : active
                        ? "Recently active"
                        : chat.last_message_at
                        ? `Last message ${formatShortTime(
                            chat.last_message_at
                          )}`
                        : `+${chat.phone}`}
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-2 flex-wrap">
                  {!chat.ai_enabled && (
                    <span className="text-[10px] bg-blue-500 text-white rounded-full px-2 py-1 font-bold">
                      HUMAN
                    </span>
                  )}

                  {chat.escalated && (
                    <span className="text-[10px] bg-red-600 text-white rounded-full px-2 py-1 font-black">
                      NEEDS HUMAN ATTENTION
                    </span>
                  )}
                </div>

                <p
                  className={`mt-2 text-sm line-clamp-2 ${
                    chat.escalated ? "text-red-100" : "text-neutral-300"
                  }`}
                >
                  {chat.last_message || "No message yet"}
                </p>
              </button>
            );
          })}
        </div>
      </aside>

      <section
        className={`flex-1 flex flex-col min-w-0 ${
          selectedPhone ? "flex" : "hidden md:flex"
        }`}
      >
        {!selectedPhone ? (
          <div className="flex-1 flex items-center justify-center text-neutral-500">
            <div className="text-center px-6">
              <div className="text-5xl mb-4">💬</div>
              <p>Select a chat to start</p>
              <button
                onClick={() => setShowNewContact(true)}
                className="mt-5 rounded-2xl bg-orange-500 px-5 py-3 font-black text-black hover:bg-orange-400 active:scale-[0.98]"
              >
                + New Contact / Send Message
              </button>
            </div>
          </div>
        ) : (
          <>
            <header
              className={`h-[72px] md:h-20 border-b px-3 md:px-6 flex items-center justify-between shrink-0 ${
                selectedIsEscalated
                  ? "border-red-500/50 bg-red-950/40"
                  : "border-neutral-800 bg-neutral-900"
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <button
                  onClick={closeMobileChat}
                  className="md:hidden h-10 w-10 rounded-full bg-neutral-800 flex items-center justify-center text-xl active:scale-95"
                  aria-label="Back to chats"
                >
                  ‹
                </button>

                <div
                  className={`relative h-11 w-11 rounded-full flex items-center justify-center text-black font-black shrink-0 ${
                    selectedIsEscalated
                      ? "bg-gradient-to-br from-red-500 to-orange-400"
                      : "bg-gradient-to-br from-orange-500 to-yellow-300"
                  }`}
                >
                  {(selectedConversation?.name || selectedPhone)
                    .slice(0, 1)
                    .toUpperCase()}

                  {selectedIsEscalated ? (
                    <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-600 border-2 border-neutral-900 flex items-center justify-center text-[10px] text-white">
                      !
                    </span>
                  ) : (
                    customerPresence.active && (
                      <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full bg-green-500 border-2 border-neutral-900" />
                    )
                  )}
                </div>

                <div className="min-w-0">
                  <h2 className="text-base md:text-xl font-bold truncate">
                    {selectedConversation?.name || `+${selectedPhone}`}
                  </h2>
                  <p
                    className={`text-xs md:text-sm truncate ${
                      selectedIsEscalated ? "text-red-200" : "text-neutral-400"
                    }`}
                  >
                    {selectedIsEscalated
                      ? "Needs human attention"
                      : customerPresence.label}
                  </p>
                </div>
              </div>

              <div className="flex gap-2 md:gap-3 shrink-0">
                <button
                  onClick={() => setShowMobileDetails(true)}
                  className="md:hidden rounded-2xl bg-neutral-800 px-3 py-2 text-xs font-bold text-neutral-200 active:scale-95"
                >
                  Info
                </button>

                {selectedConversation?.ai_enabled ? (
                  <button
                    onClick={() => toggleAI(false)}
                    className="rounded-2xl bg-red-500 px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm font-bold text-white hover:bg-red-400 active:scale-95"
                  >
                    Take Over
                  </button>
                ) : (
                  <button
                    onClick={() => toggleAI(true)}
                    className="rounded-2xl bg-green-500 px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm font-bold text-black hover:bg-green-400 active:scale-95"
                  >
                    Give AI
                  </button>
                )}
              </div>
            </header>

            {selectedIsEscalated && (
              <div className="shrink-0 border-b border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                <strong>Human attention required:</strong> Nero has marked this
                chat as needing team review. Take over the chat and reply
                manually if needed.
              </div>
            )}

            <div className="grid md:grid-cols-[1fr_360px] flex-1 min-h-0">
              <div className="flex flex-col min-h-0 relative">
                <div
                  ref={messagesBoxRef}
                  onScroll={handleMessagesScroll}
                  className="flex-1 overflow-y-auto p-3 md:p-6 space-y-3 md:space-y-4 bg-[radial-gradient(circle_at_top,_#1f2937,_#0a0a0a_45%)]"
                >
                  {messages.map((msg) => {
                    const isCustomer = msg.role === "user";

                    return (
                      <div
                        key={msg.id}
                        className={`flex ${
                          isCustomer ? "justify-start" : "justify-end"
                        }`}
                      >
                        <div
                          className={`max-w-[86%] md:max-w-[75%] rounded-3xl px-4 md:px-5 py-3 shadow-xl text-sm md:text-base ${
                            isCustomer
                              ? "bg-neutral-800 text-white rounded-bl-md"
                              : msg.is_manual
                              ? "bg-orange-500 text-black rounded-br-md"
                              : "bg-green-500 text-black rounded-br-md"
                          }`}
                        >
                          {msg.media_url ? (
                            <MediaPreview
                              msg={msg}
                              onOpen={() => setPreviewMedia(msg)}
                            />
                          ) : (
                            <p className="whitespace-pre-wrap break-words">
                              {msg.content}
                            </p>
                          )}

                          <div className="mt-2 flex items-center justify-end gap-1 text-[10px] opacity-75">
                            <span>
                              {msg.is_manual
                                ? "Manual reply"
                                : isCustomer
                                ? "Customer"
                                : "AI Nero"}{" "}
                              ·{" "}
                              {new Date(msg.created_at).toLocaleTimeString(
                                [],
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )}
                            </span>

                            {!isCustomer && <MessageTicks msg={msg} />}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  <div ref={messagesEndRef} />
                </div>

                {!isNearBottom && (
                  <button
                    onClick={() => scrollToBottom("smooth")}
                    className="absolute bottom-32 left-1/2 -translate-x-1/2 rounded-full bg-orange-500 text-black px-4 py-2 text-xs font-black shadow-xl md:bottom-36"
                  >
                    New messages ↓
                  </button>
                )}

                <footer className="border-t border-neutral-800 bg-neutral-900 p-3 md:p-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] shrink-0">
                  {selectedFile && (
                    <SelectedFilePreview
                      file={selectedFile}
                      onRemove={() => {
                        setSelectedFile(null);
                        if (fileInputRef.current) {
                          fileInputRef.current.value = "";
                        }
                      }}
                    />
                  )}

                  <div className="flex gap-2 md:gap-3 items-end">
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
                      onChange={(e) => handleFileSelect(e.target.files?.[0])}
                    />

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="rounded-2xl bg-neutral-800 border border-neutral-700 px-4 min-h-[52px] font-black text-neutral-200 hover:bg-neutral-700 active:scale-95"
                      title="Attach image, video, or document"
                    >
                      📎
                    </button>

                    <textarea
                      value={reply}
                      onChange={(e) => setReply(e.target.value)}
                      placeholder={
                        selectedIsEscalated
                          ? "This chat needs human attention. Write manual reply..."
                          : selectedFile
                          ? "Add a caption optional..."
                          : "Write manual reply..."
                      }
                      className="flex-1 resize-none rounded-2xl bg-neutral-800 border border-neutral-700 px-4 py-3 outline-none min-h-[52px] max-h-32 text-base"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          sendReply();
                        }
                      }}
                    />

                    <button
                      onClick={sendReply}
                      disabled={loading || (!reply.trim() && !selectedFile)}
                      className="rounded-2xl bg-orange-500 px-5 md:px-6 min-h-[52px] font-black text-black hover:bg-orange-400 disabled:opacity-50 active:scale-95"
                    >
                      {loading ? "..." : "Send"}
                    </button>
                  </div>
                </footer>
              </div>

              <DesktopInfoPanel
                selectedIsEscalated={selectedIsEscalated}
                bookingInfo={bookingInfo}
                selectedPhone={selectedPhone}
                selectedConversation={selectedConversation}
                messages={messages}
                toggleAI={toggleAI}
                setPreviewMedia={setPreviewMedia}
                customerPresence={customerPresence}
              />
            </div>
          </>
        )}
      </section>

      {showNewContact && (
        <NewContactModal
          name={newContactName}
          phone={newContactPhone}
          message={newContactMessage}
          loading={creatingContact}
          onNameChange={setNewContactName}
          onPhoneChange={setNewContactPhone}
          onMessageChange={setNewContactMessage}
          onClose={() => setShowNewContact(false)}
          onSend={createNewContactAndSend}
        />
      )}

      {showMobileDetails && selectedPhone && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/70 flex items-end">
          <div className="w-full max-h-[88dvh] overflow-y-auto rounded-t-3xl bg-neutral-950 border-t border-neutral-800 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-black">Chat Info</h3>
              <button
                onClick={() => setShowMobileDetails(false)}
                className="rounded-full bg-neutral-800 px-4 py-2 font-bold"
              >
                Close
              </button>
            </div>

            <InfoPanelContent
              selectedIsEscalated={selectedIsEscalated}
              bookingInfo={bookingInfo}
              selectedPhone={selectedPhone}
              selectedConversation={selectedConversation}
              messages={messages}
              toggleAI={toggleAI}
              setPreviewMedia={setPreviewMedia}
              customerPresence={customerPresence}
            />
          </div>
        </div>
      )}

      {previewMedia && (
        <MediaModal msg={previewMedia} onClose={() => setPreviewMedia(null)} />
      )}
    </main>
  );
}

function MessageTicks({ msg }: { msg: Message }) {
  const status = getMessageStatus(msg);

  if (status === "read") {
    return (
      <span
        className="font-black text-blue-700"
        title={msg.read_at ? `Read ${formatFullTime(msg.read_at)}` : "Read"}
      >
        ✓✓
      </span>
    );
  }

  if (status === "delivered") {
    return (
      <span
        className="font-black opacity-80"
        title={
          msg.delivered_at
            ? `Delivered ${formatFullTime(msg.delivered_at)}`
            : "Delivered"
        }
      >
        ✓✓
      </span>
    );
  }

  if (status === "failed") {
    return (
      <span
        className="font-black text-red-700"
        title={msg.failed_reason || "Failed"}
      >
        !
      </span>
    );
  }

  return (
    <span className="font-black opacity-70" title="Sent">
      ✓
    </span>
  );
}

function getMessageStatus(msg: Message) {
  const raw = String(msg.delivery_status || msg.status || "").toLowerCase();

  if (raw === "read" || raw.includes("read")) return "read";
  if (raw === "delivered" || raw.includes("delivered")) return "delivered";
  if (raw === "failed" || raw.includes("failed")) return "failed";
  if (raw === "sent" || raw.includes("sent")) return "sent";

  if (msg.read_at) return "read";
  if (msg.delivered_at) return "delivered";

  return "sent";
}

function SelectedFilePreview({
  file,
  onRemove,
}: {
  file: File;
  onRemove: () => void;
}) {
  const isImage = file.type.startsWith("image/");
  const isVideo = file.type.startsWith("video/");
  const objectUrl = useMemo(() => URL.createObjectURL(file), [file]);

  useEffect(() => {
    return () => URL.revokeObjectURL(objectUrl);
  }, [objectUrl]);

  return (
    <div className="mb-3 rounded-2xl border border-neutral-700 bg-neutral-800 p-3 flex items-center gap-3">
      <div className="h-14 w-14 rounded-xl bg-neutral-900 border border-neutral-700 overflow-hidden flex items-center justify-center shrink-0">
        {isImage ? (
          <img
            src={objectUrl}
            alt={file.name}
            className="h-full w-full object-cover"
          />
        ) : isVideo ? (
          <span className="text-xl">🎥</span>
        ) : (
          <span className="text-xl">📎</span>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="font-bold truncate text-sm">{file.name}</p>
        <p className="text-xs text-neutral-400">
          {file.type || "File"} · {formatFileSize(file.size)}
        </p>
      </div>

      <button
        onClick={onRemove}
        className="rounded-full bg-neutral-700 px-3 py-2 text-xs font-bold hover:bg-neutral-600 active:scale-95"
      >
        Remove
      </button>
    </div>
  );
}

function NewContactModal({
  name,
  phone,
  message,
  loading,
  onNameChange,
  onPhoneChange,
  onMessageChange,
  onClose,
  onSend,
}: {
  name: string;
  phone: string;
  message: string;
  loading: boolean;
  onNameChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
  onMessageChange: (value: string) => void;
  onClose: () => void;
  onSend: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-end md:items-center justify-center p-0 md:p-6">
      <div className="w-full md:max-w-lg rounded-t-3xl md:rounded-3xl bg-neutral-900 border border-neutral-800 p-5 md:p-6 shadow-2xl pb-[calc(1.25rem+env(safe-area-inset-bottom))]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black">New Contact</h2>
            <p className="mt-1 text-sm text-neutral-400">
              Add a customer number and send the first WhatsApp message.
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-full bg-neutral-800 px-4 py-2 font-bold text-neutral-200 hover:bg-neutral-700"
          >
            Close
          </button>
        </div>

        <div className="mt-4 rounded-2xl border border-yellow-500/30 bg-yellow-500/10 p-3">
          <p className="text-xs text-yellow-100 leading-relaxed">
            Important: if this customer has not messaged you first or the
            24-hour WhatsApp window is closed, Meta may block normal first
            messages. In that case, you need an approved WhatsApp template.
          </p>
        </div>

        <div className="mt-5 space-y-3">
          <div>
            <label className="text-sm font-bold text-neutral-300">
              Customer name optional
            </label>
            <input
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder="Example: Nuno"
              className="mt-2 w-full rounded-2xl bg-neutral-800 border border-neutral-700 px-4 py-3 outline-none text-base"
            />
          </div>

          <div>
            <label className="text-sm font-bold text-neutral-300">
              WhatsApp phone number
            </label>
            <input
              value={phone}
              onChange={(e) => onPhoneChange(e.target.value)}
              placeholder="Example: 34612345678"
              inputMode="tel"
              className="mt-2 w-full rounded-2xl bg-neutral-800 border border-neutral-700 px-4 py-3 outline-none text-base"
            />
            <p className="mt-2 text-xs text-neutral-500">
              Use country code. Spain example: 34612345678. No need to add +.
            </p>
          </div>

          <div>
            <label className="text-sm font-bold text-neutral-300">
              First message
            </label>
            <textarea
              value={message}
              onChange={(e) => onMessageChange(e.target.value)}
              placeholder="Hello, this is Sahil from NEXA Rentals..."
              className="mt-2 w-full min-h-32 resize-none rounded-2xl bg-neutral-800 border border-neutral-700 px-4 py-3 outline-none text-base"
            />
          </div>
        </div>

        <button
          onClick={onSend}
          disabled={loading}
          className="mt-5 w-full rounded-2xl bg-orange-500 py-4 font-black text-black hover:bg-orange-400 disabled:opacity-50 active:scale-[0.99]"
        >
          {loading ? "Sending..." : "Create Contact & Send Message"}
        </button>
      </div>
    </div>
  );
}

function DesktopInfoPanel({
  selectedIsEscalated,
  bookingInfo,
  selectedPhone,
  selectedConversation,
  messages,
  toggleAI,
  setPreviewMedia,
  customerPresence,
}: {
  selectedIsEscalated: boolean;
  bookingInfo: BookingInfo;
  selectedPhone: string;
  selectedConversation?: Conversation;
  messages: Message[];
  toggleAI: (enabled: boolean) => void;
  setPreviewMedia: (msg: Message) => void;
  customerPresence: { active: boolean; label: string };
}) {
  return (
    <aside className="hidden md:block border-l border-neutral-800 bg-neutral-950 p-5 overflow-y-auto">
      <InfoPanelContent
        selectedIsEscalated={selectedIsEscalated}
        bookingInfo={bookingInfo}
        selectedPhone={selectedPhone}
        selectedConversation={selectedConversation}
        messages={messages}
        toggleAI={toggleAI}
        setPreviewMedia={setPreviewMedia}
        customerPresence={customerPresence}
      />
    </aside>
  );
}

function InfoPanelContent({
  selectedIsEscalated,
  bookingInfo,
  selectedPhone,
  selectedConversation,
  messages,
  toggleAI,
  setPreviewMedia,
  customerPresence,
}: {
  selectedIsEscalated: boolean;
  bookingInfo: BookingInfo;
  selectedPhone: string;
  selectedConversation?: Conversation;
  messages: Message[];
  toggleAI: (enabled: boolean) => void;
  setPreviewMedia: (msg: Message) => void;
  customerPresence: { active: boolean; label: string };
}) {
  return (
    <>
      <div className="rounded-3xl border border-neutral-800 bg-neutral-900 p-5">
        <h3 className="font-black text-lg">Customer Status</h3>

        <div className="mt-4 flex items-center gap-3">
          <div className="relative h-12 w-12 rounded-full bg-gradient-to-br from-orange-500 to-yellow-300 flex items-center justify-center text-black font-black">
            {(selectedConversation?.name || selectedPhone)
              .slice(0, 1)
              .toUpperCase()}
            {customerPresence.active && (
              <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full bg-green-500 border-2 border-neutral-900" />
            )}
          </div>

          <div>
            <div className="font-bold">
              {selectedConversation?.name || `+${selectedPhone}`}
            </div>
            <div className="text-sm text-neutral-400">
              {customerPresence.label}
            </div>
          </div>
        </div>

        <p className="mt-3 text-xs text-neutral-500 leading-relaxed">
          WhatsApp Cloud API does not provide real online/last seen. This status
          is based on recent customer activity in this inbox.
        </p>
      </div>

      <div
        className={`mt-4 rounded-3xl border p-5 ${
          selectedIsEscalated
            ? "border-red-500 bg-red-500/10"
            : "border-neutral-800 bg-neutral-900"
        }`}
      >
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-black text-lg">
            {selectedIsEscalated
              ? "Human Attention Required"
              : "Booking Alert"}
          </h3>

          {selectedIsEscalated ? (
            <span className="text-xs bg-red-600 text-white rounded-full px-3 py-1 font-black">
              URGENT
            </span>
          ) : (
            <span className="text-xs bg-neutral-700 text-neutral-300 rounded-full px-3 py-1">
              Normal
            </span>
          )}
        </div>

        <p
          className={`mt-2 text-sm ${
            selectedIsEscalated ? "text-red-100" : "text-neutral-400"
          }`}
        >
          {selectedIsEscalated
            ? "This customer needs a human/team reply. Take over the chat and respond manually."
            : "When AI says it will pass the booking to the team, this chat becomes urgent here."}
        </p>

        <div className="mt-5 space-y-3 text-sm">
          <InfoRow label="Name" value={bookingInfo.name} />
          <InfoRow
            label="Phone"
            value={`+${bookingInfo.phone || selectedPhone}`}
          />
          <InfoRow label="Vehicle" value={bookingInfo.vehicle} />
          <InfoRow label="Date" value={bookingInfo.date} />
          <InfoRow label="Time" value={bookingInfo.time} />
          <InfoRow label="Duration" value={bookingInfo.duration} />
          <InfoRow label="Quantity" value={bookingInfo.quantity} />
          <InfoRow label="License" value={bookingInfo.license} />
          <InfoRow label="Age" value={bookingInfo.age} />
          <InfoRow label="License since" value={bookingInfo.licenseSince} />
        </div>

        <div className="mt-5 grid grid-cols-1 gap-2">
          <button
            onClick={() => toggleAI(false)}
            className="rounded-2xl bg-red-500 px-4 py-3 font-bold text-white hover:bg-red-400 active:scale-[0.98]"
          >
            Take Over This Chat
          </button>

          <button
            onClick={() => toggleAI(true)}
            className="rounded-2xl bg-green-500 px-4 py-3 font-bold text-black hover:bg-green-400 active:scale-[0.98]"
          >
            Give Back to AI
          </button>
        </div>
      </div>

      <div className="mt-4 rounded-3xl border border-neutral-800 bg-neutral-900 p-5">
        <h3 className="font-black text-lg">Customer Files</h3>
        <p className="mt-2 text-sm text-neutral-400">
          Images, videos, and documents sent by the customer will show here.
        </p>

        <div className="mt-4 space-y-2">
          {messages.filter((m) => m.media_url).length === 0 ? (
            <div className="text-sm text-neutral-500">
              No files received yet.
            </div>
          ) : (
            messages
              .filter((m) => m.media_url)
              .map((m) => (
                <MediaPreview
                  key={m.id}
                  msg={m}
                  onOpen={() => setPreviewMedia(m)}
                />
              ))
          )}
        </div>
      </div>
    </>
  );
}

function InfoRow({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-neutral-800 pb-2">
      <span className="text-neutral-400">{label}</span>
      <span className="font-semibold text-right">
        {value || "Not collected"}
      </span>
    </div>
  );
}

function MediaPreview({
  msg,
  onOpen,
}: {
  msg: Message;
  onOpen?: () => void;
}) {
  if (!msg.media_url) return null;

  const type = msg.media_type || "";

  if (type.startsWith("image")) {
    return (
      <button onClick={onOpen} className="block text-left">
        <img
          src={msg.media_url}
          alt={msg.file_name || "WhatsApp image"}
          className="max-h-72 max-w-full md:max-w-[320px] rounded-2xl object-cover border border-neutral-700"
        />
        {msg.content && (
          <p className="mt-2 text-sm whitespace-pre-wrap break-words">
            {msg.content}
          </p>
        )}
      </button>
    );
  }

  if (type.startsWith("video")) {
    return (
      <div>
        <video
          controls
          onClick={onOpen}
          className="max-h-72 max-w-full md:max-w-[320px] rounded-2xl border border-neutral-700 cursor-pointer"
        >
          <source src={msg.media_url} />
        </video>
        {msg.content && (
          <p className="mt-2 text-sm whitespace-pre-wrap break-words">
            {msg.content}
          </p>
        )}
      </div>
    );
  }

  return (
    <button
      onClick={onOpen}
      className="block rounded-2xl bg-neutral-800 px-4 py-3 underline break-all text-left"
    >
      📎 {msg.file_name || "Open file"}
      {msg.content && (
        <p className="mt-2 text-sm whitespace-pre-wrap break-words no-underline">
          {msg.content}
        </p>
      )}
    </button>
  );
}

function MediaModal({
  msg,
  onClose,
}: {
  msg: Message;
  onClose: () => void;
}) {
  if (!msg.media_url) return null;

  const type = msg.media_type || "";

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 md:p-6"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-5 right-5 rounded-full bg-white text-black px-4 py-2 font-bold"
      >
        Close
      </button>

      <div
        onClick={(e) => e.stopPropagation()}
        className="max-w-[92vw] max-h-[90dvh]"
      >
        {type.startsWith("image") ? (
          <img
            src={msg.media_url}
            alt={msg.file_name || "WhatsApp image"}
            className="max-w-[92vw] max-h-[85dvh] rounded-2xl object-contain"
          />
        ) : type.startsWith("video") ? (
          <video
            src={msg.media_url}
            controls
            autoPlay
            className="max-w-[92vw] max-h-[85dvh] rounded-2xl"
          />
        ) : (
          <a
            href={msg.media_url}
            target="_blank"
            className="rounded-2xl bg-orange-500 text-black px-6 py-4 font-bold"
          >
            Open file
          </a>
        )}
      </div>
    </div>
  );
}

function getCustomerPresence(
  messages: Message[],
  conversation?: Conversation
): { active: boolean; label: string } {
  const lastCustomerMessage = [...messages]
    .reverse()
    .find((m) => m.role === "user");

  const lastTime =
    lastCustomerMessage?.created_at || conversation?.last_message_at || "";

  if (!lastTime) {
    return {
      active: false,
      label: conversation?.phone ? `+${conversation.phone}` : "No activity yet",
    };
  }

  const active = isRecentlyActive(lastTime);

  return {
    active,
    label: active
      ? "Recently active"
      : `Last customer activity ${formatShortTime(lastTime)}`,
  };
}

function sortConversations(chats: Conversation[]) {
  return [...chats].sort((a, b) => {
    if (a.escalated !== b.escalated) {
      return a.escalated ? -1 : 1;
    }

    if (a.unread_count !== b.unread_count) {
      return b.unread_count - a.unread_count;
    }

    const aTime = new Date(a.last_message_at || 0).getTime();
    const bTime = new Date(b.last_message_at || 0).getTime();

    return bTime - aTime;
  });
}

function isRecentlyActive(date?: string) {
  if (!date) return false;

  const time = new Date(date).getTime();
  if (Number.isNaN(time)) return false;

  const diffMs = Date.now() - time;
  return diffMs >= 0 && diffMs <= 2 * 60 * 1000;
}

function formatShortTime(date: string) {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "";

  const today = new Date();
  const isToday = d.toDateString() === today.toDateString();

  if (isToday) {
    return d.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return d.toLocaleDateString([], {
    day: "2-digit",
    month: "short",
  });
}

function formatFullTime(date: string) {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "";

  return d.toLocaleString([], {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatFileSize(bytes: number) {
  if (!bytes) return "0 KB";

  const kb = bytes / 1024;
  const mb = kb / 1024;

  if (mb >= 1) return `${mb.toFixed(1)} MB`;
  return `${Math.ceil(kb)} KB`;
}

function extractBookingInfo(
  messages: Message[],
  conversation?: Conversation
): BookingInfo {
  const allText = messages.map((m) => m.content).join("\n").toLowerCase();

  return {
    name: conversation?.name,
    phone: conversation?.phone,
    vehicle: findMatch(allText, [
      "scooter",
      "ebike",
      "e-bike",
      "bike",
      "125cc",
      "piaggio",
    ]),
    date: extractDate(allText),
    time: extractTime(allText),
    duration: extractDuration(allText),
    quantity: extractQuantity(allText),
    license: extractLicense(allText),
    age: extractAge(allText),
    licenseSince: extractLicenseSince(allText),
  };
}

function normalizePhone(phone: string) {
  return phone.replace(/[^\d]/g, "");
}

function findMatch(text: string, words: string[]) {
  return words.find((w) => text.includes(w));
}

function extractDate(text: string) {
  const match =
    text.match(/\b\d{1,2}[/-]\d{1,2}[/-]?\d{0,4}\b/) ||
    text.match(
      /\b(today|tomorrow|monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/
    );
  return match?.[0];
}

function extractTime(text: string) {
  const match = text.match(/\b\d{1,2}(:\d{2})?\s?(am|pm)?\b/);
  return match?.[0];
}

function extractDuration(text: string) {
  const match = text.match(/\b\d+\s?(hour|hours|h|day|days|d)\b/);
  return match?.[0];
}

function extractQuantity(text: string) {
  const match = text.match(
    /\b\d+\s?(scooter|scooters|bike|bikes|e-bike|e-bikes)\b/
  );
  return match?.[0];
}

function extractLicense(text: string) {
  const match = text.match(
    /\b(a1|a2|a|b license|b licence|car license|car licence)\b/
  );
  return match?.[0];
}

function extractAge(text: string) {
  const match = text.match(
    /\b(i am|i'm|age is)?\s?(\d{2})\s?(years old|yo|yrs)?\b/
  );
  return match?.[2];
}

function extractLicenseSince(text: string) {
  const match =
    text.match(/\blicense since\s?(\d{4})\b/) ||
    text.match(/\blicence since\s?(\d{4})\b/) ||
    text.match(/\bsince\s?(\d{4})\b/);
  return match?.[1];
}