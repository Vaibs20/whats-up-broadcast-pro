
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, AlertCircle, MessageSquare } from "lucide-react";

export function RecentActivity() {
  const activities = [
    {
      id: 1,
      type: "broadcast",
      title: "Product Launch Campaign completed",
      description: "Sent to 1,920 contacts",
      time: "2 minutes ago",
      status: "success",
      icon: CheckCircle,
    },
    {
      id: 2,
      type: "template",
      title: "New template submitted for approval",
      description: "Welcome Message v2.0",
      time: "15 minutes ago",
      status: "pending",
      icon: Clock,
    },
    {
      id: 3,
      type: "message",
      title: "New message received",
      description: "From +1 234 567 8900",
      time: "32 minutes ago",
      status: "info",
      icon: MessageSquare,
    },
    {
      id: 4,
      type: "error",
      title: "Template rejected by Meta",
      description: "Holiday Promotion template",
      time: "1 hour ago",
      status: "error",
      icon: AlertCircle,
    },
    {
      id: 5,
      type: "broadcast",
      title: "Weekly Newsletter scheduled",
      description: "Will send to 3,400 contacts tomorrow",
      time: "2 hours ago",
      status: "scheduled",
      icon: Clock,
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "text-green-600 bg-green-100";
      case "pending":
        return "text-yellow-600 bg-yellow-100";
      case "error":
        return "text-red-600 bg-red-100";
      case "scheduled":
        return "text-blue-600 bg-blue-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Completed</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">Pending</Badge>;
      case "error":
        return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Failed</Badge>;
      case "scheduled":
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Scheduled</Badge>;
      default:
        return <Badge variant="secondary">Info</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <div className={`p-2 rounded-lg ${getStatusColor(activity.status)}`}>
                <activity.icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-900 truncate">{activity.title}</h4>
                  {getStatusBadge(activity.status)}
                </div>
                <p className="text-sm text-gray-500 mt-1">{activity.description}</p>
                <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
