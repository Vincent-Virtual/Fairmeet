import { useState } from "react";
import { useNavigate } from "react-router";
import { Header } from "../components/header";
import { MapPlaceholder } from "../components/map-placeholder";
import { LocationCard } from "../components/location-card";
import { Button } from "../components/ui/button";
import { ArrowLeft, Send } from "lucide-react";
import { Star } from "lucide-react";

// Mock data for recommended locations
const mockLocations = [
  {
    id: "1",
    rank: 1,
    name: "The Central Café",
    activityType: "Café / Restaurant",
    avgTravel: "Avg travel: 12 min",
    matchScore: 94,
    explanation:
      "Centrally located with excellent coffee and brunch options. Matches group's preference for relaxed indoor activities.",
    lat: 45,
    lng: 50,
    isHighlight: true,
  },
  {
    id: "2",
    rank: 2,
    name: "Riverside Park",
    activityType: "Outdoor",
    avgTravel: "Avg travel: 15 min",
    matchScore: 88,
    explanation:
      "Great outdoor space with walking paths and picnic areas. Perfect for active groups who enjoy nature.",
    lat: 35,
    lng: 60,
    isHighlight: false,
  },
  {
    id: "3",
    rank: 3,
    name: "Art House Cinema",
    activityType: "Entertainment",
    avgTravel: "Avg travel: 18 min",
    matchScore: 82,
    explanation:
      "Independent cinema with comfortable seating. Ideal for culture enthusiasts and film lovers.",
    lat: 55,
    lng: 40,
    isHighlight: false,
  },
  {
    id: "4",
    rank: 4,
    name: "Urban Sports Complex",
    activityType: "Sports / Active",
    avgTravel: "Avg travel: 22 min",
    matchScore: 76,
    explanation:
      "Modern facility with various sports options. Good for active groups but slightly farther for some participants.",
    lat: 30,
    lng: 70,
    isHighlight: false,
  },
];

export function ResultsPage() {
  const navigate = useNavigate();
  const [selectedLocation, setSelectedLocation] = useState<string | null>("1");

  const markers = mockLocations.map((loc) => ({
    id: loc.id,
    lat: loc.lat,
    lng: loc.lng,
    label: loc.name,
    isHighlight: loc.id === selectedLocation,
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex flex-col">
      <Header />

      <main className="flex-1 overflow-hidden">
        <div className="h-full flex">
          {/* Left Panel - Results */}
          <div className="w-1/2 overflow-y-auto p-8">
            <div className="max-w-xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl text-gray-900">
                  Recommended Meetup Spots
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/")}
                  className="text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Edit
                </Button>
              </div>

              {/* Top Recommendation Highlight */}
              <div className="bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 rounded-2xl p-6 mb-6 text-white shadow-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="h-5 w-5 text-yellow-300 fill-yellow-300" />
                  <span className="text-sm text-blue-100">Best Match</span>
                </div>
                <h3 className="text-2xl mb-3">{mockLocations[0].name}</h3>
                <div className="flex items-center gap-4 text-sm text-blue-100">
                  <span>🎯 {mockLocations[0].activityType}</span>
                  <span>•</span>
                  <span>📍 {mockLocations[0].avgTravel}</span>
                  <span>•</span>
                  <span>✨ {mockLocations[0].matchScore}% match</span>
                </div>
              </div>

              {/* All Recommendations */}
              <div className="space-y-4 mb-8">
                {mockLocations.map((location) => (
                  <div
                    key={location.id}
                    onClick={() => setSelectedLocation(location.id)}
                    className="cursor-pointer"
                  >
                    <LocationCard
                      rank={location.rank}
                      name={location.name}
                      activityType={location.activityType}
                      avgTravel={location.avgTravel}
                      matchScore={location.matchScore}
                      explanation={location.explanation}
                      isHighlight={location.id === selectedLocation}
                    />
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="sticky bottom-0 bg-gradient-to-br from-gray-50 to-blue-50 pt-4">
                <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl shadow-lg h-14 text-lg">
                  <Send className="h-5 w-5 mr-2" />
                  Invite Participants 🎉
                </Button>
              </div>
            </div>
          </div>

          {/* Right Panel - Map */}
          <div className="w-1/2 bg-white border-l border-gray-200 p-8">
            <div className="h-full">
              <MapPlaceholder markers={markers} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}