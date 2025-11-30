"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import {
  MagnifyingGlassIcon,
  ChatBubbleLeftRightIcon,
} from "@heroicons/react/24/outline";

export default function ChatPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (session) {
      fetchConversations();
    }
  }, [session]);

  const fetchConversations = async () => {
    try {
      const response = await fetch("/api/chat/conversations");
      const data = await response.json();

      if (data.success) {
        setConversations(data.conversations);
      }
    } catch (error) {
      console.error("Error fetching conversations:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredConversations = conversations.filter((conv: any) => {
    const otherParticipant = conv.participants.find(
      (p: any) => p.userId !== session?.user?.id
    );
    return otherParticipant?.user.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
  });

  if (!session) {
    router.push("/login");
    return null;
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6 border-b">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                Messages
              </h1>

              {/* Search */}
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search conversations..."
                  className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="text-center py-12">
                <ChatBubbleLeftRightIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No conversations yet
                </h3>
                <p className="text-gray-600">
                  Start chatting with suppliers or mechanics
                </p>
              </div>
            ) : (
              <div className="divide-y">
                {filteredConversations.map((conversation: any) => {
                  const otherParticipant = conversation.participants.find(
                    (p: any) => p.userId !== session.user.id
                  );
                  const lastMessage = conversation.messages[0];
                  const unreadCount = conversation.messages.filter(
                    (m: any) => !m.read && m.senderId !== session.user.id
                  ).length;

                  return (
                    <div
                      key={conversation.id}
                      onClick={() => router.push(`/chat/${conversation.id}`)}
                      className="p-4 hover:bg-gray-50 cursor-pointer transition"
                    >
                      <div className="flex items-center gap-4">
                        <img
                          src={
                            otherParticipant?.user.image ||
                            "/default-avatar.png"
                          }
                          alt={otherParticipant?.user.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-semibold text-gray-900 truncate">
                              {otherParticipant?.user.name}
                            </h3>
                            {lastMessage && (
                              <span className="text-xs text-gray-500">
                                {new Date(
                                  lastMessage.createdAt
                                ).toLocaleDateString()}
                              </span>
                            )}
                          </div>

                          {lastMessage && (
                            <p className="text-sm text-gray-600 truncate">
                              {lastMessage.senderId === session.user.id &&
                                "You: "}
                              {lastMessage.content}
                            </p>
                          )}
                        </div>

                        {unreadCount > 0 && (
                          <span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                            {unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
