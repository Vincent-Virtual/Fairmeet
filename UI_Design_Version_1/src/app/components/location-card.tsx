import { MapPin, Activity, Star } from "lucide-react";

interface LocationCardProps {
  rank: number;
  name: string;
  activityType: string;
  avgTravel: string;
  matchScore: number;
  explanation: string;
  isHighlight?: boolean;
}

export function LocationCard({
  rank,
  name,
  activityType,
  avgTravel,
  matchScore,
  explanation,
  isHighlight = false,
}: LocationCardProps) {
  return (
    <div
      className={`bg-white border rounded-2xl p-5 transition-all ${
        isHighlight
          ? "border-blue-500 shadow-lg shadow-blue-100 ring-2 ring-blue-500 ring-opacity-50"
          : "border-gray-200 hover:border-blue-300 hover:shadow-md"
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className={`text-sm px-2 py-0.5 rounded-full ${isHighlight ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
              #{rank}
            </span>
            <h3 className="text-gray-900">{name}</h3>
            {isHighlight && <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />}
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <Activity className="h-3.5 w-3.5 text-blue-500" />
              {activityType}
            </span>
          </div>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm px-3 py-1.5 rounded-full shadow-sm">
          {matchScore}%
        </div>
      </div>

      <div className="space-y-2 mb-3">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <MapPin className="h-3.5 w-3.5 text-green-500" />
          <span>{avgTravel}</span>
        </div>
      </div>

      <p className="text-sm text-gray-600 leading-relaxed">{explanation}</p>
    </div>
  );
}