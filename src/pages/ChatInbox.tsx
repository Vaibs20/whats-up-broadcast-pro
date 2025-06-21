
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  MessageCircle, 
  Send, 
  Search,
  MoreHorizontal,
  Clock
} from "lucide-react";

export default function ChatInbox() {
  const chats = [
    {
      id: 1,
      contact: "John Doe",
      phone: "+1234567890",
      lastMessage: "Thank you for the quick response!",
      timestamp: "10:30 AM",
      unread: 0,
      status: "online"
    },
    {
      id: 2,
      contact: "Jane Smith",
      phone: "+1234567891",
      lastMessage: "Can I get more information about the product?",
      timestamp: "Yesterday",
      unread: 2,
      status: "offline"
    },
    {
      id: 3,
      contact: "Bob Wilson",
      phone: "+1234567892",
      lastMessage: "Hello, I need help with my order",
      timestamp: "2 days ago",
      unread: 1,
      status: "offline"
    },
  ];

  const currentChat = chats[0];
  const chatMessages = [
    { id: 1, text: "Hello, I have a question about my order", sender: "contact", timestamp: "10:15 AM" },
    { id: 2, text: "Hi! I'd be happy to help you with your order. What's your order number?", sender: "agent", timestamp: "10:16 AM" },
    { id: 3, text: "It's order #12345", sender: "contact", timestamp: "10:17 AM" },
    { id: 4, text: "Thank you for the quick response!", sender: "contact", timestamp: "10:30 AM" },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Chat Inbox</h1>
            <p className="text-gray-600">Respond to incoming WhatsApp messages</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
          {/* Chat List */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  Conversations
                </CardTitle>
                <Badge variant="secondary">3</Badge>
              </div>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input placeholder="Search chats..." className="pl-10" />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-1">
                {chats.map((chat) => (
                  <div 
                    key={chat.id} 
                    className={`p-4 cursor-pointer hover:bg-gray-50 border-l-4 ${
                      chat.id === currentChat.id ? 'border-green-600 bg-green-50' : 'border-transparent'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium text-sm">{chat.contact}</h4>
                      <div className="flex items-center gap-2">
                        {chat.unread > 0 && (
                          <Badge className="bg-green-600 text-white text-xs">{chat.unread}</Badge>
                        )}
                        <span className="text-xs text-gray-500">{chat.timestamp}</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 truncate">{chat.lastMessage}</p>
                    <p className="text-xs text-gray-400 mt-1">{chat.phone}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Chat Window */}
          <Card className="lg:col-span-2">
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <MessageCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">{currentChat.contact}</h4>
                    <p className="text-sm text-gray-500">{currentChat.phone}</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col h-[400px]">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {chatMessages.map((message) => (
                  <div 
                    key={message.id} 
                    className={`flex ${message.sender === 'agent' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-xs p-3 rounded-lg ${
                      message.sender === 'agent' 
                        ? 'bg-green-600 text-white' 
                        : 'bg-gray-100 text-gray-900'
                    }`}>
                      <p className="text-sm">{message.text}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <Clock className="w-3 h-3 opacity-70" />
                        <span className="text-xs opacity-70">{message.timestamp}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Message Input */}
              <div className="border-t pt-4">
                <div className="flex gap-2">
                  <Input placeholder="Type your message..." className="flex-1" />
                  <Button className="bg-green-600 hover:bg-green-700">
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
