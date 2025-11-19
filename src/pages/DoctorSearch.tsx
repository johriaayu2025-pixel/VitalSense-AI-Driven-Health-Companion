import { PageTransition } from "@/components/PageTransition";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { MapPin, Search, Phone, Navigation, Star, Stethoscope } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Doctor {
  id: string;
  name: string;
  clinic: string;
  specialization: string;
  distance: string;
  phone: string;
  rating: number;
  address: string;
}

const DoctorSearch = () => {
  const [location, setLocation] = useState("");
  const [specialization, setSpecialization] = useState("General Physician");
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [searching, setSearching] = useState(false);
  const { toast } = useToast();

  // Mock data (replace with Google Places API)
  const mockDoctors: Doctor[] = [
    {
      id: "1",
      name: "Dr. Sarah Johnson",
      clinic: "City Health Clinic",
      specialization: "General Physician",
      distance: "0.8 km",
      phone: "+1 234-567-8901",
      rating: 4.8,
      address: "123 Main St, City Center",
    },
    {
      id: "2",
      name: "Dr. Michael Chen",
      clinic: "Heart Care Center",
      specialization: "Cardiologist",
      distance: "1.2 km",
      phone: "+1 234-567-8902",
      rating: 4.9,
      address: "456 Medical Plaza, Downtown",
    },
    {
      id: "3",
      name: "Dr. Emily Rodriguez",
      clinic: "Family Medical Practice",
      specialization: "General Physician",
      distance: "1.5 km",
      phone: "+1 234-567-8903",
      rating: 4.7,
      address: "789 Health Ave, Suburb",
    },
  ];

  const handleSearch = async () => {
    setSearching(true);
    
    try {
      const { data, error } = await supabase.functions.invoke("search-doctors", {
        body: { location, specialization }
      });

      if (error) throw error;
      
      setDoctors(data.doctors || []);
      setSearching(false);
      
      toast({
        title: "Search Complete",
        description: `Found ${data.doctors?.length || 0} doctors nearby`,
      });
    } catch (error) {
      console.error("Error searching doctors:", error);
      setSearching(false);
      toast({
        title: "Search Failed",
        description: "Could not search for doctors. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleUseCurrentLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation(`${position.coords.latitude}, ${position.coords.longitude}`);
          toast({
            title: "Location Found",
            description: "Using your current location",
          });
        },
        (error) => {
          toast({
            title: "Location Error",
            description: "Could not get your location",
            variant: "destructive",
          });
        }
      );
    } else {
      toast({
        title: "Not Supported",
        description: "Geolocation is not supported by your browser",
        variant: "destructive",
      });
    }
  };

  const handleBookAppointment = (doctor: Doctor) => {
    toast({
      title: "Booking Appointment",
      description: `Redirecting to book with ${doctor.name}`,
    });
    // Navigate to appointments page with pre-filled data
  };

  return (
    <PageTransition>
      <div className="space-y-5">
          <div>
            <h1>Find Doctor Near Me</h1>
            <p className="text-muted-foreground mt-1">
              Search for doctors and specialists in your area
            </p>
          </div>

        {/* Search Form */}
        <Card>
          <CardHeader>
            <CardTitle>Search Doctors</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="location">Location</Label>
              <div className="flex gap-2">
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Enter your location or zip code"
                />
                <Button
                  variant="outline"
                  onClick={handleUseCurrentLocation}
                  className="gap-2"
                >
                  <Navigation className="w-4 h-4" />
                  Use Current
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor="specialization">Doctor Type</Label>
              <Select value={specialization} onValueChange={setSpecialization}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="General Physician">General Physician</SelectItem>
                  <SelectItem value="Cardiologist">Cardiologist</SelectItem>
                  <SelectItem value="Dermatologist">Dermatologist</SelectItem>
                  <SelectItem value="Neurologist">Neurologist</SelectItem>
                  <SelectItem value="Orthopedic">Orthopedic</SelectItem>
                  <SelectItem value="Pediatrician">Pediatrician</SelectItem>
                  <SelectItem value="Psychiatrist">Psychiatrist</SelectItem>
                  <SelectItem value="Dentist">Dentist</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={handleSearch} disabled={searching} className="w-full gap-2">
              <Search className="w-4 h-4" />
              {searching ? "Searching..." : "Search Doctors"}
            </Button>
          </CardContent>
        </Card>

        {/* Results */}
        {doctors.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">
              {doctors.length} Doctor{doctors.length !== 1 ? "s" : ""} Found
            </h2>
            {doctors.map((doctor) => (
              <Card key={doctor.id}>
                <CardContent className="pt-6">
                  <div className="flex flex-col md:flex-row justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-3 mb-2">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <Stethoscope className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold">{doctor.name}</h3>
                          <p className="text-sm text-muted-foreground">{doctor.specialization}</p>
                          <p className="text-sm font-medium mt-1">{doctor.clinic}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          <span>{doctor.distance} away</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="w-4 h-4 text-muted-foreground" />
                          <span>{doctor.phone}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span>{doctor.rating} rating</span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {doctor.address}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 md:w-40">
                      <Button onClick={() => handleBookAppointment(doctor)}>
                        Book Appointment
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => window.open(`https://www.google.com/maps/search/${encodeURIComponent(doctor.address)}`, '_blank')}
                      >
                        Get Directions
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {doctors.length === 0 && location && (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <Search className="w-12 h-12 mx-auto mb-4" />
              <p>Click "Search Doctors" to find healthcare providers near you</p>
            </CardContent>
          </Card>
        )}
      </div>
      </PageTransition>
  );
};

export default DoctorSearch;
