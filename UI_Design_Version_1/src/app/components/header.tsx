import { Users, Bell, Settings } from "lucide-react";
import { Button } from "./ui/button";

export function Header() {
  return (
    <header className="border-b border-gray-200 bg-white shadow-sm">
      <div className="px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <Users className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            FairMeet
          </h1>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="rounded-full">
            <Bell className="h-5 w-5 text-gray-600" />
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full">
            <Settings className="h-5 w-5 text-gray-600" />
          </Button>
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-pink-400 to-orange-400 flex items-center justify-center text-white text-sm ml-2">
            You
          </div>
        </div>
      </div>
    </header>
  );
}