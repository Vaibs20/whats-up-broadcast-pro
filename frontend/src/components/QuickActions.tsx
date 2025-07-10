
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Upload, FileText, Send } from "lucide-react";
import { Link } from "react-router-dom";

export function QuickActions() {
  const actions = [
    {
      title: "Create Broadcast",
      description: "Send messages to contact groups",
      icon: Send,
      color: "bg-green-600 hover:bg-green-700",
      url: "/broadcasts",
    },
    {
      title: "New Template",
      description: "Create message template",
      icon: FileText,
      color: "bg-blue-600 hover:bg-blue-700",
      url: "/templates",
    },
    {
      title: "Upload Contacts",
      description: "Import from CSV file",
      icon: Upload,
      color: "bg-purple-600 hover:bg-purple-700",
      url: "/contacts",
    },
    {
      title: "Add Contact",
      description: "Manually add new contact",
      icon: Plus,
      color: "bg-orange-600 hover:bg-orange-700",
      url: "/contacts",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {actions.map((action, index) => (
          <Button
            key={index}
            variant="outline"
            className="w-full justify-start h-auto p-4 hover:bg-gray-50"
            asChild
          >
            <Link to={action.url}>
              <div className={`p-2 rounded-lg mr-3 ${action.color}`}>
                <action.icon className="w-4 h-4 text-white" />
              </div>
              <div className="text-left">
                <div className="font-medium">{action.title}</div>
                <div className="text-sm text-gray-500">{action.description}</div>
              </div>
            </Link>
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}
