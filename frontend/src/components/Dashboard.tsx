
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Send, 
  FileText, 
  MessageSquare, 
  TrendingUp, 
  Clock,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { StatsCard } from "@/components/StatsCard";
import { RecentActivity } from "@/components/RecentActivity";
import { QuickActions } from "@/components/QuickActions";

export function Dashboard() {
  const stats = [
    {
      title: "Total Contacts",
      value: "2,847",
      change: "+12%",
      icon: Users,
      color: "blue",
    },
    {
      title: "Messages Sent",
      value: "15,420",
      change: "+25%",
      icon: Send,
      color: "green",
    },
    {
      title: "Active Templates",
      value: "23",
      change: "+3",
      icon: FileText,
      color: "purple",
    },
    {
      title: "Delivery Rate",
      value: "98.5%",
      change: "+2.1%",
      icon: TrendingUp,
      color: "orange",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back!</h1>
          <p className="text-gray-600">Here's what's happening with your WhatsApp Business today.</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-green-600 border-green-200">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
            Connected
          </Badge>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-1">
          <QuickActions />
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <RecentActivity />
        </div>
      </div>

      {/* Campaign Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="w-5 h-5" />
            Active Campaigns
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { name: "New Product Launch", status: "sending", progress: 65, sent: 1250, total: 1920 },
              { name: "Weekly Newsletter", status: "scheduled", progress: 0, sent: 0, total: 3400 },
              { name: "Cart Abandonment", status: "completed", progress: 100, sent: 890, total: 890 },
            ].map((campaign, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    campaign.status === 'sending' ? 'bg-blue-500' :
                    campaign.status === 'scheduled' ? 'bg-yellow-500' :
                    'bg-green-500'
                  }`}></div>
                  <div>
                    <h4 className="font-medium">{campaign.name}</h4>
                    <p className="text-sm text-gray-500">
                      {campaign.sent} / {campaign.total} messages
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full" 
                      style={{ width: `${campaign.progress}%` }}
                    ></div>
                  </div>
                  <Badge variant={
                    campaign.status === 'sending' ? 'default' :
                    campaign.status === 'scheduled' ? 'secondary' :
                    'outline'
                  }>
                    {campaign.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
