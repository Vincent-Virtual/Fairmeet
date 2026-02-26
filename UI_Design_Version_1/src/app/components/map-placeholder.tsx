import { MapPin } from "lucide-react";

interface MapPlaceholderProps {
  markers?: Array<{ id: string; lat: number; lng: number; label?: string; isHighlight?: boolean }>;
}

export function MapPlaceholder({ markers = [] }: MapPlaceholderProps) {
  return (
    <div className="w-full h-full bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-center relative overflow-hidden">
      {/* Simple grid pattern to simulate map */}
      <div className="absolute inset-0 opacity-10">
        <svg width="100%" height="100%">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="gray" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Markers if provided */}
      {markers.length > 0 ? (
        <div className="absolute inset-0">
          {markers.map((marker) => (
            <div
              key={marker.id}
              className="absolute"
              style={{
                left: `${marker.lng}%`,
                top: `${marker.lat}%`,
                transform: "translate(-50%, -100%)",
              }}
            >
              <MapPin
                className={`h-6 w-6 ${marker.isHighlight ? "text-gray-900 fill-gray-900" : "text-gray-500 fill-gray-500"}`}
              />
              {marker.label && (
                <span className="absolute top-full mt-1 left-1/2 -translate-x-1/2 text-xs bg-white px-2 py-1 rounded shadow-sm whitespace-nowrap">
                  {marker.label}
                </span>
              )}
            </div>
          ))}
        </div>
      ) : (
        <MapPin className="h-12 w-12 text-gray-300" />
      )}
    </div>
  );
}
