import { useState } from "react";
import { useNavigate } from "react-router";
import { Header } from "../components/header";
import { MapPlaceholder } from "../components/map-placeholder";
import { ParticipantCard } from "../components/participant-card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Plus, Send } from "lucide-react";

interface Participant {
  id: string;
  name: string;
  location: string;
  tags: string[];
}

export function PlanMeetupPage() {
  const navigate = useNavigate();
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [participantName, setParticipantName] = useState("");
  const [participantLocation, setParticipantLocation] = useState("");
  const [participantHobbies, setParticipantHobbies] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  
  // Meetup details state
  const [meetupName, setMeetupName] = useState("");
  const [preferredArea, setPreferredArea] = useState("");
  const [budget, setBudget] = useState("");
  const [activityType, setActivityType] = useState("");
  
  // Check if all meetup details are filled
  const isMeetupDetailsComplete = meetupName.trim() && preferredArea.trim() && budget && activityType;

  const handleAddParticipant = () => {
    if (!participantName.trim() || !participantLocation.trim()) return;

    const tags = participantHobbies
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag);

    const newParticipant: Participant = {
      id: Date.now().toString(),
      name: participantName,
      location: participantLocation,
      tags: tags.length > 0 ? tags : ["No interests"],
    };

    setParticipants([...participants, newParticipant]);
    setParticipantName("");
    setParticipantLocation("");
    setParticipantHobbies("");
  };

  const handleRemoveParticipant = (id: string) => {
    setParticipants(participants.filter((p) => p.id !== id));
  };




  const handleGeneratePlan = () => {
    navigate("/results");
  };

  // modify handleGeneratePlan
//   const handleGeneratePlan = async () => {
//   const payload = {
//     meetupName,
//     preferredArea,
//     budget,
//     activityType,
//     participants,
//   };

//   const res = await fetch("/api/plan", {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify(payload),
//   });

//   const data = await res.json();

//   navigate("/results", { state: data });
// };





  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex flex-col">
      <Header />

      <main className="flex-1 overflow-hidden">
        <div className="h-full flex justify-center">
          {/* Center Panel - Input Section */}
          <div className="w-full max-w-2xl overflow-y-auto p-8">
            <div>
              {/* Hero Section */}
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-6 mb-6 text-white shadow-lg">
                <h2 className="text-2xl mb-2">Plan Your Meetup</h2>
                <p className="text-blue-100 text-sm">Find the perfect spot that's fair for everyone</p>
              </div>

              {/* Main Form */}
              <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
                <div className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="meetup-name" className="text-gray-700">Meetup Name</Label>
                    <Input
                      id="meetup-name"
                      placeholder="Sunday Brunch"
                      value={meetupName}
                      onChange={(e) => setMeetupName(e.target.value)}
                      className="bg-gray-50 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location" className="text-gray-700">Preferred Area</Label>
                    <Input
                      id="location"
                      placeholder="Downtown, City Center, or pin description"
                      value={preferredArea}
                      onChange={(e) => setPreferredArea(e.target.value)}
                      className="bg-gray-50 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="budget" className="text-gray-700">Budget</Label>
                    <Select
                      value={budget}
                      onValueChange={(value) => setBudget(value)}
                    >
                      <SelectTrigger className="bg-gray-50 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500">
                        <SelectValue placeholder="Select budget range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">$ - Budget-friendly</SelectItem>
                        <SelectItem value="medium">$$ - Moderate</SelectItem>
                        <SelectItem value="high">$$$ - Premium</SelectItem>
                        <SelectItem value="any">Any</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="activity-type" className="text-gray-700">Activity Type</Label>
                    <Select
                      value={activityType}
                      onValueChange={(value) => setActivityType(value)}
                    >
                      <SelectTrigger className="bg-gray-50 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500">
                        <SelectValue placeholder="Select activity type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="indoor">Indoor</SelectItem>
                        <SelectItem value="outdoor">Outdoor</SelectItem>
                        <SelectItem value="cafe">Café / Restaurant</SelectItem>
                        <SelectItem value="entertainment">Entertainment</SelectItem>
                        <SelectItem value="sports">Sports / Active</SelectItem>
                        <SelectItem value="any">Any</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Add Participant Section */}
              {isMeetupDetailsComplete && (
                <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <Plus className="h-4 w-4 text-white" />
                    </div>
                    <h3 className="text-gray-900">Add Participants</h3>
                  </div>
                  
                  <div className="space-y-4 mb-4">
                    <div className="space-y-2">
                      <Label htmlFor="participant-name" className="text-gray-700">Name</Label>
                      <Input
                        id="participant-name"
                        placeholder="Participant name"
                        value={participantName}
                        onChange={(e) => setParticipantName(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleAddParticipant()}
                        className="bg-gray-50 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="participant-location" className="text-gray-700">Location</Label>
                      <Input
                        id="participant-location"
                        placeholder="Participant location"
                        value={participantLocation}
                        onChange={(e) => setParticipantLocation(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleAddParticipant()}
                        className="bg-gray-50 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="hobbies" className="text-gray-700">Hobbies / Interests</Label>
                      <Input
                        id="hobbies"
                        placeholder="Coffee, Hiking, Art (comma-separated)"
                        value={participantHobbies}
                        onChange={(e) => setParticipantHobbies(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleAddParticipant()}
                        className="bg-gray-50 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>

                    <Button
                      onClick={handleAddParticipant}
                      className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl shadow-md h-11"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Participant
                    </Button>
                  </div>

                  {/* Participants List */}
                  {participants.length > 0 && (
                    <div className="space-y-3 pt-4 border-t border-gray-100">
                      <p className="text-sm text-gray-500">{participants.length} participant{participants.length !== 1 ? 's' : ''} added</p>
                      {participants.map((participant) => (
                        <ParticipantCard
                          key={participant.id}
                          name={participant.name}
                          location={participant.location}
                          tags={participant.tags}
                          onRemove={() => handleRemoveParticipant(participant.id)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Invite Section */}
              {isMeetupDetailsComplete && (
                <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
                  <h3 className="text-gray-900 mb-4">Invite Others</h3>
                  <div className="flex gap-3">
                    <Input
                      placeholder="Email or name"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      className="bg-gray-50 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500"
                    />
                    <Button variant="outline" className="border-gray-200 rounded-xl hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300">
                      <Send className="h-4 w-4 mr-2" />
                      Invite
                    </Button>
                  </div>
                </div>
              )}

              {/* Generate Button */}
              <Button
                onClick={handleGeneratePlan}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl shadow-lg h-14 text-lg"
                disabled={participants.length === 0 || !isMeetupDetailsComplete}
              >
                Generate Plan ✨
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}