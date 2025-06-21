
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { UserMenu } from "./UserMenu";

export function TopNav() {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <SidebarTrigger className="text-gray-600 hover:text-gray-900" />
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
            <p className="text-sm text-gray-500">Manage your WhatsApp Business communications</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <Button className="bg-green-600 hover:bg-green-700" asChild>
            <Link to="/broadcasts">
              <Plus className="w-4 h-4 mr-2" />
              New Broadcast
            </Link>
          </Button>
          
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="relative" asChild>
              <Link to="/notifications">
                <Bell className="w-5 h-5" />
                <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 text-xs bg-red-500">
                  3
                </Badge>
              </Link>
            </Button>
            
            <UserMenu />
          </div>
        </div>
      </div>
    </header>
  );
}
