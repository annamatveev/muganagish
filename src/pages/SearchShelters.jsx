
import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Shelter } from "@/api/entities";
import { Branch } from "@/api/entities";
import { User } from "@/api/entities";
import { SendEmail } from "@/api/integrations";
import { ShelterReview } from "@/api/entities";
import { ReportModeration } from "@/api/entities";
import { ReviewModeration } from "@/api/entities";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";

// Icons
import { 
  Search, 
  MapPin, 
  List, 
  Map, 
  CheckCircle, 
  AlertTriangle, 
  ThumbsUp, 
  Flag, 
  Building2, 
  HandMetal, 
  Star,
  Shield,
  Info,
  Plus,
  Filter,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Accessibility,
  ArrowDownAZ
} from "lucide-react";

// Custom Components for this page
import ShelterMap from "../components/shelter/ShelterMap";
import ShelterCard from "../components/search/ShelterCard";
import SearchFilters from "../components/search/SearchFilters";
import ReportDialog from "../components/search/ReportDialog";
import ReviewDialog from "../components/search/ReviewDialog";
import VerificationInfo from "../components/search/VerificationInfo";
import AddressAutocomplete from "../components/address/AddressAutocomplete";

export default function SearchShelters() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [shelters, setShelters] = useState([]);
  const [filteredShelters, setFilteredShelters] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(() => {
    const savedState = sessionStorage.getItem('searchState');
    if (savedState) {
      const { showFilters } = JSON.parse(savedState);
      return showFilters || false;
    }
    return false;
  });
  const [searchQuery, setSearchQuery] = useState(() => {
    // Get saved search state from sessionStorage
    const savedState = sessionStorage.getItem('searchState');
    if (savedState) {
      const { query } = JSON.parse(savedState);
      return query || "";
    }
    return "";
  });
  const [searchRadius, setSearchRadius] = useState(() => {
    const savedState = sessionStorage.getItem('searchState');
    if (savedState) {
      const { radius } = JSON.parse(savedState);
      return radius || 5000; // Default to 5km
    }
    return 5000; // Default to 5km
  });
  const [view, setView] = useState(() => {
    const savedState = sessionStorage.getItem('searchState');
    if (savedState) {
      const { viewType } = JSON.parse(savedState);
      return viewType || "list";
    }
    return "mp";
  });
  const [coordinates, setCoordinates] = useState(() => {
    const savedState = sessionStorage.getItem('searchState');
    if (savedState) {
      const { coords } = JSON.parse(savedState);
      return coords || null;
    }
    return null;
  });
  const [filters, setFilters] = useState(() => {
    const savedState = sessionStorage.getItem('searchState');
    if (savedState) {
      const { filterState } = JSON.parse(savedState);
      return filterState || {
        stepFreeAccess: false,
        maneuveringSpace: false,
        rampPresent: false,
        verifiedOnly: false,
        minRating: 0
      };
    }
    return {
      stepFreeAccess: false,
      maneuveringSpace: false,
      rampPresent: false,
      verifiedOnly: false,
      minRating: 0
    };
  });
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [selectedShelter, setSelectedShelter] = useState(null);
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);

  // Count active filters for indicators
  const activeFilterCount = useMemo(() => {
    return Object.keys(filters).reduce((count, key) => {
      if (key === 'minRating' && filters[key] > 0) return count + 1;
      if (key !== 'minRating' && filters[key] === true) return count + 1;
      return count;
    }, 0);
  }, [filters]);

  // Save search state whenever relevant states change
  useEffect(() => {
    const searchState = {
      query: searchQuery,
      radius: searchRadius,
      viewType: view,
      coords: coordinates,
      filterState: filters,
      showFilters: showFilters
    };
    sessionStorage.setItem('searchState', JSON.stringify(searchState));
  }, [searchQuery, searchRadius, view, coordinates, filters, showFilters]);

  useEffect(() => {
    loadData();
    
    // Always attempt to get current location on initial load
    getCurrentLocation();
  }, []);

  // Effect to re-filter shelters when navigating back to the page
  useEffect(() => {
    // Check if we have coordinates and shelters data
    if (coordinates && shelters.length > 0) {
      console.log("Re-running search with saved coordinates on mount");
      handleSearch(coordinates, searchRadius);
    }
  }, [shelters.length]);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      setIsLoadingLocation(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newCoordinates = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setCoordinates(newCoordinates);
          console.log("Got current location:", newCoordinates);
          
          // Try to get address for the location
          if (window.google && window.google.maps) {
            const geocoder = new window.google.maps.Geocoder();
            geocoder.geocode({ 
              location: newCoordinates,
              region: 'IL',
              language: 'he'
            }, (results, status) => {
              console.log("Geocoder results:", status, results);
              if (status === "OK" && results[0]) {
                setSearchQuery(results[0].formatted_address);
              } else {
                console.log("Geocoder failed, setting default value");
                setSearchQuery("מיקום נוכחי");
              }
              setIsLoadingLocation(false);
              
              // Now that we have coordinates, search
              handleSearch(newCoordinates, searchRadius);
            });
          } else {
            setSearchQuery("מיקום נוכחי");
            setIsLoadingLocation(false);
            handleSearch(newCoordinates, searchRadius);
          }
          
          // Switch to map view
          setView("list");
        },
        (error) => {
          console.error("Geolocation error:", error);
          // Default to center of Israel
          setCoordinates({
            lat: 31.7683,
            lng: 35.2137
          });
          setIsLoadingLocation(false);
          alert("לא ניתן לאתר את המיקום הנוכחי שלך. אנא נסה להזין כתובת ידנית.");
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    } else {
      alert("הדפדפן שלך אינו תומך באיתור מיקום.");
    }
  };

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Try to get current user (but don't require login)
      try {
        const userData = await User.me();
        setUser(userData);
      } catch (error) {
        // Not logged in, that's okay for search
        setUser(null);
      }

      // Load all shelters
      const shelterData = await Shelter.list();
      console.log("Total shelters:", shelterData.length);
      
      // Just use the shelters as they are in the database
      setShelters(shelterData);
      
      // If we already have coordinates (from session storage), filter right away
      if (coordinates) {
        console.log("Already have coordinates, filtering shelters");
        // Create a temporary filtered list before setting state
        const filtered = filterSheltersByDistance(shelterData, coordinates, searchRadius);
        setFilteredShelters(filtered);
      }
    } catch (error) {
      console.error("Error loading shelters:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function for direct filtering
  const filterSheltersByDistance = (shelterList, coords, radius) => {
    if (!coords || !window.google) return shelterList;
    
    const filtered = shelterList.filter(shelter => {
      if (!shelter.lat || !shelter.lng) return false;
      
      try {
        const shelterLatLng = new window.google.maps.LatLng(
          parseFloat(shelter.lat),
          parseFloat(shelter.lng)
        );
        const searchLatLng = new window.google.maps.LatLng(
          coords.lat,
          coords.lng
        );
        
        const distance = window.google.maps.geometry.spherical.computeDistanceBetween(
          shelterLatLng,
          searchLatLng
        );
        
        shelter.distance = distance;
        return distance <= radius;
      } catch (error) {
        console.error("Error in direct filtering:", error);
        return false;
      }
    });
    
    return filtered.sort((a, b) => (a.distance || 0) - (b.distance || 0));
  };

  // handleSearch modified version
  const handleSearch = async (searchCoordinates = coordinates, currentRadius = searchRadius) => {
    setIsLoading(true);
    console.log("Running search with:", { searchCoordinates, currentRadius });
    
    try {
      let filtered = [...shelters];
      
      // If we have coordinates and radius, filter by distance first
      if (searchCoordinates && window.google) {
        filtered = filtered.filter(shelter => {
          if (!shelter.lat || !shelter.lng) return false;
          
          try {
            const shelterLatLng = new window.google.maps.LatLng(
              parseFloat(shelter.lat),
              parseFloat(shelter.lng)
            );
            const searchLatLng = new window.google.maps.LatLng(
              searchCoordinates.lat,
              searchCoordinates.lng
            );
            
            const distance = window.google.maps.geometry.spherical.computeDistanceBetween(
              shelterLatLng,
              searchLatLng
            );
            
            // Set the distance on the shelter object for display
            shelter.distance = distance;
            
            return distance <= currentRadius;
          } catch (error) {
            console.error("Error calculating distance for shelter:", shelter, error);
            return false;
          }
        });

        // Sort by distance
        filtered.sort((a, b) => (a.distance || 0) - (b.distance || 0));
      }
      
      // Then apply filters
      filtered = filtered.filter(shelter => {
        // Check accessibility filters
        if (filters.stepFreeAccess && !shelter.step_free_access) return false;
        if (filters.maneuveringSpace && !shelter.maneuvering_space) return false;
        if (filters.rampPresent && !shelter.ramp_present) return false;
        if (filters.verifiedOnly && !shelter.verified) return false;
        if (filters.minRating > 0 && (!shelter.rating || shelter.rating < filters.minRating)) return false;
        
        return true;
      });

      console.log("Filtered results:", {
        total: shelters.length,
        afterFilters: filtered.length,
        coordinates: searchCoordinates,
        radius: currentRadius
      });

      setFilteredShelters(filtered);
    } catch (error) {
      console.error("Error during search:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddressSelect = (location) => {
    if (location) {
      console.log("Selected location:", location);
      const newCoordinates = {
        lat: location.lat,
        lng: location.lng
      };
      setCoordinates(newCoordinates);
      setSearchQuery(location.address);
      setView("list");
      handleSearch(newCoordinates, searchRadius);
    }
  };

  // Update the handleRadiusChange function to make sure it uses meters
  const handleRadiusChange = (value) => {
    const newRadius = value[0] * 1000;
    setSearchRadius(newRadius);
    handleSearch(coordinates, newRadius);
  };

  const handleSearchButton = () => {
    if (!coordinates) {
      // If we don't have coordinates but have a search query, geocode it
      if (searchQuery && window.google?.maps) {
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ address: searchQuery }, (results, status) => {
          if (status === "OK" && results[0]) {
            const location = results[0].geometry.location;
            const newCoordinates = {
              lat: location.lat(),
              lng: location.lng()
            };
            setCoordinates(newCoordinates);
            handleSearch(newCoordinates, searchRadius);
          } else {
            console.error("Geocoding failed:", status);
            alert("לא הצלחנו למצוא את הכתובת שהזנת. אנא נסה שנית.");
          }
        });
      }
    } else {
      handleSearch(coordinates, searchRadius);
    }
  };

  // Add useEffect to handle coordinate changes
  useEffect(() => {
    if (coordinates) {
      handleSearch(coordinates, searchRadius);
    }
  }, [coordinates, searchRadius]);

  const handleFilterChange = (newFilters) => {
    setFilters({ ...filters, ...newFilters });
  };

  const handleClaimShelter = (shelter) => {
    if (!user) {
      // Prompt to login first
      if (confirm("עליך להתחבר כדי לדרוש בעלות על מקלט. האם ברצונך להתחבר?")) {
        User.login();
      }
      return;
    }
    
    // Navigate to business verification with shelter ID
    navigate(createPageUrl(`BusinessVerification?shelter_id=${shelter.id}`));
  };

  const handleReportShelter = async (shelter, reportData) => {
    try {
      // Create a report moderation entry instead of sending email directly
      await ReportModeration.create({
        shelter_id: shelter.id,
        report_type: reportData.type,
        details: reportData.details,
        contact_info: reportData.contact,
        status: "pending"
      });
      
      alert("תודה! הדיווח שלך נשלח בהצלחה ויועבר לבדיקה.");
    } catch (error) {
      console.error("Error sending report:", error);
      alert("אירעה שגיאה בשליחת הדיווח. אנא נסו שנית.");
    }
  };

  const handleUpvoteShelter = async (shelter, reviewData) => {
    try {
      // Try to get current user's email
      let reporterEmail = null;
      try {
        const userData = await User.me();
        reporterEmail = userData.email;
      } catch (error) {
        // User not logged in, that's fine
      }

      // Create review moderation entry - Add shelter_id
      await ReviewModeration.create({
        shelter_id: shelter.id, // Add this line
        rating: reviewData.rating,
        comment: reviewData.comment,
        reporter_email: reporterEmail,
        status: "pending"
      });
      
      alert("תודה! הדירוג שלך התקבל ויעבור בדיקה לפני פרסום.");
    } catch (error) {
      console.error("Error saving review:", error);
      alert("אירעה שגיאה בשמירת הדירוג. אנא נסו שנית.");
    }
  };

  // Update results when radius changes
  useEffect(() => {
    if (coordinates) {
      handleSearch(coordinates, searchRadius);
    }
  }, [searchRadius, coordinates]);

  // Add the search function
  const handleSearchButtonOld = () => {
    if (searchQuery && !coordinates) {
      // If we have an address but no coordinates, geocode it first
      if (window.google && window.google.maps) {
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ address: searchQuery }, (results, status) => {
          if (status === "OK" && results[0]) {
            const location = results[0].geometry.location;
            const newCoordinates = {
              lat: location.lat(),
              lng: location.lng()
            };
            setCoordinates(newCoordinates);
            handleSearch(newCoordinates);
          } else {
            handleSearch(); // Try to search without coordinates
          }
        });
      } else {
        handleSearch();
      }
    } else {
      handleSearch();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6" dir="rtl">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-1">חיפוש מקלטים נגישים</h1>
            <p className="text-gray-600">מצא מקלט נגיש בקרבת מקום במהירות וביעילות</p>
            <div className="mt-1 text-xs text-amber-600 font-medium flex items-center">
              <Info className="h-3 w-3 mr-1" />
              שימו לב: מערכת החיפוש נמצאת בפיתוח ומתעדכנת באופן שוטף
            </div>
          </div>
        </div>

        {/* Search Box */}
        <Card className="shadow-sm mb-6">
          <CardContent className="p-4 md:p-6">
            <div className="space-y-4 md:space-y-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 space-y-2">
                  <Label htmlFor="search" className="font-medium">חפש לפי כתובת</Label>
                  <div className="relative">
                    <AddressAutocomplete
                      id="search"
                      value={searchQuery}
                      onChange={(value) => {
                        setSearchQuery(value);
                        if (!value) {
                          setCoordinates(null);
                          setFilteredShelters(shelters);
                        }
                      }}
                      onLocationSelect={handleAddressSelect}
                      label=""
                      placeholder="הזן כתובת, שכונה או עיר"
                      className="w-full"
                    />
                    <Button 
                      variant="ghost"
                      size="icon" 
                      className="absolute left-1 top-1 h-8 w-8"
                      onClick={getCurrentLocation}
                      title="השתמש במיקום הנוכחי שלי"
                      disabled={isLoadingLocation}
                    >
                      {isLoadingLocation ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
                      ) : (
                        <MapPin className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                <div className="w-full md:w-48 space-y-2">
                  <div className="flex items-center gap-2">
                    רדיוס חיפוש
                    <Slider
                      min={1}
                      max={20}
                      step={1}
                      value={[searchRadius / 1000]}
                      onValueChange={handleRadiusChange}
                      className="flex-1 bg-gray-200"
                    />
                    <span className="text-gray-700 min-w-[2.5rem] text-center">
                      {searchRadius / 1000} ק"מ
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 w-full md:w-auto relative"
                >
                  <Filter className="w-4 h-4" />
                  {showFilters ? "הסתר מסננים" : "הצג מסננים"}
                  {!showFilters && activeFilterCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {activeFilterCount}
                    </span>
                  )}
                </Button>
                
                <Button 
                  onClick={handleSearchButton} 
                  className="bg-[#3498DB] hover:bg-[#2980B9] w-full md:w-auto"
                >
                  <Search className="w-4 h-4 ml-2" />
                  חפש מקלטים
                </Button>
              </div>

              {/* Filters */}
              {showFilters && (
                <SearchFilters filters={filters} onChange={handleFilterChange} />
              )}
            </div>
          </CardContent>
        </Card>

        {/* View Toggle */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">
              {isLoading ? "מחפש מקלטים..." : `${filteredShelters.length} מקלטים נמצאו`}
            </span>
            {!isLoading && filteredShelters.length > 0 && view === "list" && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-7 px-2"
                onClick={() => setFilteredShelters([...filteredShelters].sort((a, b) => a.address.localeCompare(b.address)))}
              >
                <ArrowDownAZ className="w-3 h-3 ml-1" />
                מיון לפי א-ת
              </Button>
            )}
          </div>
          
          <div className="flex gap-2 w-full md:w-auto">
            <Button
              variant={view === "list" ? "default" : "outline"}
              size="sm"
              className={`${view === "list" ? "bg-[#3498DB] hover:bg-[#2980B9]" : ""} flex-1 md:flex-none`}
              onClick={() => setView("list")}
            >
              <List className="w-4 h-4 ml-1" />
              רשימה
            </Button>
            <Button
              variant={view === "map" ? "default" : "outline"}
              size="sm"
              className={`${view === "map" ? "bg-[#3498DB] hover:bg-[#2980B9]" : ""} flex-1 md:flex-none`}
              onClick={() => setView("map")}
            >
              <Map className="w-4 h-4 ml-1" />
              מפה
            </Button>
          </div>
        </div>

        {/* Search Results - Modified to show map even when no results */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin w-12 h-12 border-4 border-[#3498DB] border-t-transparent rounded-full mb-4"></div>
            <p className="text-gray-600">מחפש מקלטים נגישים בקרבת מקום...</p>
          </div>
        ) : (
          <div className="mb-8">
            {view === "list" ? (
              filteredShelters.length === 0 ? (
                <Card className="text-center py-12">
                  <CardContent className="flex flex-col items-center">
                    <div className="bg-gray-100 rounded-full p-4 mb-4">
                      <MapPin className="w-10 h-10 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-medium mb-2">לא נמצאו מקלטים</h3>
                    <p className="text-gray-500 mb-6 max-w-md mx-auto">
                      לא נמצאו מקלטים התואמים לחיפוש. נסו להרחיב את רדיוס החיפוש או לשנות את מסנני הנגישות.
                    </p>
                    <Button 
                      onClick={() => {
                        setSearchQuery("");
                        setSearchRadius(5000);
                        setFilters({
                          stepFreeAccess: false,
                          maneuveringSpace: false,
                          rampPresent: false,
                          verifiedOnly: false,
                          minRating: 0
                        });
                        handleSearch();
                      }}
                      className="bg-[#3498DB] hover:bg-[#2980B9]"
                    >
                      <RefreshCw className="w-4 h-4 ml-2" />
                      נקה מסננים וחפש שוב
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {filteredShelters.map(shelter => {
                    const distanceInKm = shelter.distance ? (shelter.distance / 1000).toFixed(1) : null;

                    return (
                      <ShelterCard 
                        key={shelter.id} 
                        shelter={shelter}
                        distance={distanceInKm}
                        onClaim={() => handleClaimShelter(shelter)}
                        onReport={() => {
                          setSelectedShelter(shelter);
                          setIsReportDialogOpen(true);
                        }}
                        onUpvote={() => {
                          setSelectedShelter(shelter);
                          setIsReviewDialogOpen(true);
                        }}
                        onViewDetails={() => navigate(createPageUrl(`PublicShelterView?id=${shelter.id}`))}
                      />
                    );
                  })}
                </div>
              )
            ) : (
              // Always show map in map view, even if no results
              <div className="h-[600px] w-full rounded-lg overflow-hidden border relative bg-white">
                <ShelterMap 
                  shelters={filteredShelters}
                  center={coordinates}
                  radius={searchRadius}
                  onShelterClick={(shelter) => {
                    navigate(createPageUrl(`PublicShelterView?id=${shelter.id}`));
                  }}
                />
                {filteredShelters.length === 0 && coordinates && (
                  <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur-sm py-2 px-4 rounded-lg shadow-md">
                    <p className="text-sm">לא נמצאו מקלטים במיקום זה</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Report/Review Dialogs */}
        <ReportDialog
          isOpen={isReportDialogOpen}
          onClose={() => setIsReportDialogOpen(false)}
          onReport={(reportData) => {
            handleReportShelter(selectedShelter, reportData);
            setIsReportDialogOpen(false);
          }}
        />

        <ReviewDialog
          isOpen={isReviewDialogOpen}
          onClose={() => setIsReviewDialogOpen(false)}
          onSubmit={(reviewData) => {
            handleUpvoteShelter(selectedShelter, reviewData);
            setIsReviewDialogOpen(false);
          }}
        />
      </div>
    </div>
  );
}
