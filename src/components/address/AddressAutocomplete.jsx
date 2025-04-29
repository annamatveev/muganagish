
import React, { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AddressAutocomplete({ value, onChange, onLocationSelect, label = "כתובת", placeholder = "הזן כתובת", className = "", required = false, id = "address" }) {
  const inputRef = useRef(null);
  const autocompleteRef = useRef(null);
  const [debouncedValue, setDebouncedValue] = useState(value);
  const [isSearching, setIsSearching] = useState(false);
  
  // Debounce input changes
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, 300);
    
    return () => {
      clearTimeout(handler);
    };
  }, [value]);
  
  // Handle input changes with debouncing
  const handleInputChange = (e) => {
    onChange(e.target.value);
  };

  const getCurrentLocation = () => {
    setIsSearching(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log("Got position:", position.coords);
          // Use reverse geocoding to get address from coordinates
          if (window.google && window.google.maps) {
            const geocoder = new window.google.maps.Geocoder();
            const latlng = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            };
            
            console.log("Using coordinates for geocoding:", latlng);
            
            geocoder.geocode({ 
              location: latlng,
              region: 'IL',
              language: 'he'
            }, (results, status) => {
              console.log("Geocoder results:", status, results);
              if (status === "OK" && results[0]) {
                const address = results[0].formatted_address;
                onChange(address);
                
                if (onLocationSelect) {
                  onLocationSelect({
                    address: address,
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                  });
                }
              } else {
                console.error("Geocoder failed due to: " + status);
                alert("לא ניתן למצוא את הכתובת הנוכחית שלך. אנא נסה להזין כתובת ידנית.");
              }
              setIsSearching(false);
            });
          } else {
            console.log("Google Maps not available, using coordinates directly");
            // If Google Maps isn't loaded, just use the coordinates
            if (onLocationSelect) {
              onLocationSelect({
                address: "מיקום נוכחי",
                lat: position.coords.latitude,
                lng: position.coords.longitude
              });
            }
            onChange("מיקום נוכחי");
            setIsSearching(false);
          }
        },
        (error) => {
          console.error("Geolocation error:", error);
          alert("לא ניתן לאתר את המיקום הנוכחי שלך. אנא נסה להזין כתובת ידנית.");
          setIsSearching(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    } else {
      alert("הדפדפן שלך אינו תומך באיתור מיקום.");
      setIsSearching(false);
    }
  };

  // Handle direct input submission with debouncing
  const handleInputSubmit = (e) => {
    if (e.key === 'Enter' && inputRef.current.value) {
      e.preventDefault();
      
      if (!window.google || !window.google.maps) {
        console.error("Google Maps API not loaded");
        return;
      }
      
      const geocoder = new window.google.maps.Geocoder();
      setIsSearching(true);
      
      geocoder.geocode({ 
        address: inputRef.current.value,
        region: 'IL',
        language: 'he'
      }, (results, status) => {
        setIsSearching(false);
        if (status === "OK" && results[0]) {
          const location = results[0].geometry.location;
          const address = results[0].formatted_address;
          
          onChange(address);
          
          if (onLocationSelect) {
            onLocationSelect({
              address: address,
              lat: location.lat(),
              lng: location.lng()
            });
          }
        }
      });
    }
  };

  useEffect(() => {
    const initAutocomplete = () => {
      if (!window.google || !window.google.maps || !window.google.maps.places || !inputRef.current) {
        setTimeout(initAutocomplete, 500);
        return;
      }

      try {
        autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
          componentRestrictions: { country: "il" },
          fields: ["formatted_address", "geometry", "name"],
          types: ["geocode", "establishment"], // Include establishments like airports, businesses
          language: "he"
        });

        autocompleteRef.current.addListener("place_changed", () => {
          const place = autocompleteRef.current.getPlace();
          
          if (place.geometry && place.geometry.location) {
            const location = {
              address: place.formatted_address || inputRef.current.value,
              lat: place.geometry.location.lat(),
              lng: place.geometry.location.lng()
            };
            
            console.log("Selected location with coordinates:", location);
            onChange(location.address);
            
            if (onLocationSelect) {
              onLocationSelect(location);
            }
          }
        });
      } catch (err) {
        console.error("Error initializing autocomplete:", err);
      }
    };

    initAutocomplete();

    // Add styles to fix the autocomplete dropdown
    const style = document.createElement('style');
    style.textContent = `
      .pac-container {
        font-family: 'Assistant', sans-serif !important;
        direction: rtl !important;
        text-align: right !important;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06) !important;
        border-radius: 0.5rem !important;
        border: 1px solid #e2e8f0 !important;
        margin-top: 4px !important;
        z-index: 1100 !important;
      }
      .pac-item {
        padding: 8px 10px !important;
        font-size: 14px !important;
        cursor: pointer !important;
      }
      .pac-item:hover {
        background-color: #f7fafc !important;
      }
    `;
    document.head.appendChild(style);

    return () => {
      window.google?.maps?.event?.clearInstanceListeners(autocompleteRef.current);
      document.head.removeChild(style);
    };
  }, [onChange, onLocationSelect]);

  return (
    <div className={`relative ${className}`}>
      {label && (
        <Label htmlFor={id} className="text-base font-medium mb-1 block">
          {label}{required && "*"}
        </Label>
      )}
      
      <div className="relative">
        <MapPin className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
        <Input
          ref={inputRef}
          id={id}
          value={value || ""}
          onChange={handleInputChange}
          placeholder={placeholder}
          className="pr-10 pl-10"
          required={required}
          dir="rtl"
          onKeyDown={handleInputSubmit}
        />
        <Button 
          variant="ghost" 
          size="icon" 
          className="absolute left-1 top-1 h-8 w-8 text-blue-500"
          onClick={getCurrentLocation}
          type="button"
          title="השתמש במיקום הנוכחי שלי"
          disabled={isSearching}
        >
          {isSearching ? (
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          ) : (
            <MapPin className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
}
