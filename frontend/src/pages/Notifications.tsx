
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Bell, 
  MessageSquare, 
  Send,
  AlertTriangle,
  CheckCircle,
  Clock,
  X
} from "lucide-react";

export default function Notifications() {
  const notifications = [
    {
      id: 1,
      type: "message",
      title: "New message received",
      description: "You have a new message from John Smith",
      timestamp: "2 minutes ago",
      unread: true,
      icon: MessageSquare,
      color: "text-blue-600"
    },
    {
      id: 2,
      type: "broadcast",
      title: "Broadcast campaign completed",
      description: "Your 'Holiday Sale' campaign has been sent to 150 contacts",
      timestamp: "1 hour ago",
      unread: true,
      icon: Send,
      color: "text-green-600"
    },
    {
      id: 3,
      type: "warning",
      title: "Template approval pending",
      description: "Your 'Welcome Message' template is pending approval",
      timestamp: "3 hours ago",
      unread: true,
      icon: AlertTriangle,
      color: "text-yellow-600"
    },
    {
      id: 4,
      type: "success",
      title: "Template approved",
      description: "Your 'Order Confirmation' template has been approved",
      timestamp: "1 day ago",
      unread: false,
      icon: CheckCircle,
      color: "text-green-600"
    },
    {
      id: 5,
      type: "info",
      title: "System maintenance scheduled",
      description: "Scheduled maintenance on Dec 15, 2024 from 2:00-4:00 AM",
      timestamp: "2 days ago",
      unread: false,
      icon: Clock,
      color: "text-gray-600"
    }
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
            <p className="text-gray-600">Stay updated with your WhatsApp Business activities</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              Mark All as Read
            </Button>
            <Button variant="outline">
              <X className="w-4 h-4 mr-2" />
              Clear All
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Bell className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{notifications.length}</p>
                  <p className="text-sm text-gray-600">Total</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Bell className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{unreadCount}</p>
                  <p className="text-sm text-gray-600">Unread</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <MessageSquare className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {notifications.filter(n => n.type === "message").length}
                  </p>
                  <p className="text-sm text-gray-600">Messages</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Send className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {notifications.filter(n => n.type === "broadcast").length}
                  </p>
                  <p className="text-sm text-gray-600">Campaigns</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Recent Notifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div 
                  key={notification.id}
                  className={`flex items-start gap-4 p-4 rounded-lg border transition-colors hover:bg-gray-50 ${
                    notification.unread ? 'bg-blue-50 border-blue-200' : 'bg-white'
                  }`}
                >
                  <div className={`p-2 rounded-lg ${
                    notification.unread ? 'bg-white' : 'bg-gray-100'
                  }`}>
                    <notification.icon className={`w-5 h-5 ${notification.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-gray-900">{notification.title}</h4>
                      {notification.unread && (
                        <Badge className="bg-blue-600 text-white text-xs">New</Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{notification.description}</p>
                    <p className="text-xs text-gray-400">{notification.timestamp}</p>
                  </div>
                  <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100">
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
