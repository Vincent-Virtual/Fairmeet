import { X, MapPin } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";

interface ParticipantCardProps {
  name: string;
  location: string;
  tags: string[];
  onRemove: () => void;
}

// Generate a consistent color based on the name
function getAvatarColor(name: string) {
  const colors = [
    "from-blue-400 to-blue-600",
    "from-purple-400 to-purple-600",
    "from-pink-400 to-pink-600",
    "from-green-400 to-green-600",
    "from-orange-400 to-orange-600",
    "from-cyan-400 to-cyan-600",
    "from-indigo-400 to-indigo-600",
  ];
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
}

export function ParticipantCard({ name, location, tags, onRemove }: ParticipantCardProps) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-start gap-3 shadow-sm hover:shadow-md transition-shadow">
      <div
        className={`w-12 h-12 rounded-full bg-gradient-to-br ${getAvatarColor(name)} flex items-center justify-center text-white flex-shrink-0`}
      >
        {initials}
      </div>
      
      <div className="flex-1 min-w-0">
        <p className="text-gray-900 mb-1">{name}</p>
        <div className="flex items-center gap-1 text-sm text-gray-500 mb-2">
          <MapPin className="h-3.5 w-3.5" />
          <span className="truncate">{location}</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag, index) => (
            <Badge
              key={index}
              variant="secondary"
              className="bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 hover:from-blue-100 hover:to-purple-100 border-0 text-xs"
            >
              {tag}
            </Badge>
          ))}
        </div>
      </div>
      
      <Button
        variant="ghost"
        size="icon"
        onClick={onRemove}
        className="h-8 w-8 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 flex-shrink-0"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}