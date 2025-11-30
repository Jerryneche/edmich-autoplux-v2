"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import {
  PaperAirplaneIcon,
  PhotoIcon,
  MapPinIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";

// Define types — this fixes the "never[]" error forever
interface Sender {
  id: string;
  name: string;
  image?: string;
}

interface Message {
  id: string;
  content: string;
  sender: Sender;
  senderId: string;
  createdAt: string;
}

export default function ChatThreadPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const params = useParams();
  const conversationId = params.id as string;

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [otherUser, setOtherUser] = useState<Sender | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (session && conversationId) {
      fetchMessages();
      const interval = setInterval(fetchMessages, 3000);
      return () => clearInterval(interval);
    }
  }, [session, conversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const response = await fetch(
        `/api/chat/messages?conversationId=${conversationId}`
      );
      const data = await response.json();

      if (data.success) {
        setMessages(data.messages);

        if (data.messages.length > 0) {
          const other = data.messages.find(
            (m: Message) => m.sender.id !== session?.user?.id
          );
          if (other) {
            setOtherUser(other.sender);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    const messageText = newMessage.trim();
    setNewMessage("");
    setSending(true);

    try {
      const response = await fetch("/api/chat/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          participantId: otherUser?.id,
          message: messageText,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setMessages((prev) => [...prev, result.message]);
      } else {
        setNewMessage(messageText); // restore if failed
        alert("Failed to send message");
      }
    } catch (error) {
      console.error("Send failed:", error);
      setNewMessage(messageText);
    } finally {
      setSending(false);
    }
  };

  if (!session) {
    router.push("/login");
    return null;
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 pt-24 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col h-[calc(100vh-12rem)]">
            {/* Header */}
            <div className="p-4 border-b flex items-center gap-4 bg-gray-50">
              <button
                onClick={() => router.push("/chat")}
                aria-label="Back to conversations"
                className="p-2 hover:bg-gray-200 rounded-lg transition"
              >
                <ArrowLeftIcon className="h-6 w-6" />
              </button>

              {otherUser ? (
                <div className="flex items-center gap-3">
                  <img
                    src={otherUser.image || "/default-avatar.png"}
                    alt={otherUser.name}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-white"
                  />
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {otherUser.name}
                    </h3>
                    <p className="text-xs text-green-600">Online</p>
                  </div>
                </div>
              ) : (
                <div className="h-10 w-10 bg-gray-200 rounded-full animate-pulse" />
              )}
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-chat-bg">
              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                </div>
              ) : messages.length === 0 ? (
                <p className="text-center text-gray-500 py-12">
                  No messages yet. Say hello!
                </p>
              ) : (
                messages.map((message) => {
                  const isOwn = message.sender.id === session.user.id;
                  return (
                    <div
                      key={message.id}
                      className={`flex ${
                        isOwn ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-xs md:max-w-md lg:max-w-lg ${
                          isOwn
                            ? "bg-blue-600 text-white"
                            : "bg-gray-100 text-gray-900"
                        } rounded-2xl px-4 py-3 shadow-sm`}
                      >
                        {!isOwn && (
                          <p className="text-xs font-medium opacity-70 mb-1">
                            {message.sender.name}
                          </p>
                        )}
                        <p className="break-words">{message.content}</p>
                        <p
                          className={`text-xs mt-1 ${
                            isOwn ? "text-blue-100" : "text-gray-500"
                          }`}
                        >
                          {new Date(message.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={sendMessage} className="p-4 border-t bg-white">
              <div className="flex gap-2 items-center">
                <button
                  type="button"
                  aria-label="Attach photo"
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                >
                  <PhotoIcon className="h-6 w-6 text-gray-600" />
                </button>

                <button
                  type="button"
                  aria-label="Share location"
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                >
                  <MapPinIcon className="h-6 w-6 text-gray-600" />
                </button>

                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={sending}
                />

                <button
                  type="submit"
                  disabled={sending || !newMessage.trim()}
                  aria-label="Send message"
                  className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 p-3 rounded-xl transition"
                >
                  <PaperAirplaneIcon className="h-6 w-6 text-white rotate-90" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
