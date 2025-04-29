import React, { useEffect, useRef, useState } from "react";
import { MapPin } from "lucide-react";

export default function ShelterMap({ shelters = [], center, radius = 1000, onShelterClick, showRadius = true }) {
  const mapRef = useRef(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const [googleLoaded, setGoogleLoaded] = useState(!!window.google?.maps);

  // Check if Google Maps is loaded
  useEffect(() => {
    console.log("ShelterMap: Initial Google Maps check", { 
      isLoaded: !!window.google?.maps,
      mapElementExists: !!mapRef.current
    });
    
    if (window.google?.maps) {
      setGoogleLoaded(true);
      return;
    }

    // Check every 100ms if Google Maps has been loaded
    const checkGoogleMapsLoaded = setInterval(() => {
      if (window.google?.maps) {
        console.log("ShelterMap: Google Maps loaded during check");
        setGoogleLoaded(true);
        clearInterval(checkGoogleMapsLoaded);
      }
    }, 100);

    // Clean up interval
    return () => clearInterval(checkGoogleMapsLoaded);
  }, []);

  // Initialize map
  useEffect(() => {
    // Only proceed if Google Maps is loaded
    if (!googleLoaded) {
      console.log("ShelterMap: Waiting for Google Maps to load");
      return;
    }

    console.log("ShelterMap: Initializing map with Google loaded", {
      googleMapsExists: !!window.google?.maps,
      mapRef: !!mapRef.current
    });

    // Check if container exists
    if (!mapRef.current) {
      console.error("ShelterMap: Map container not found");
      setError("תקלה בטעינת המפה - מיכל המפה לא נמצא");
      setIsLoading(false);
      return;
    }

    try {
      const mapCenter = center || { lat: 31.7683, lng: 35.2137 }; // Default to Israel's center
      
      console.log("ShelterMap: Creating map with center:", mapCenter);

      // Create map instance
      mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
        center: mapCenter,
        zoom: center ? 15 : 8,
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: false,
        zoomControl: true,
        zoomControlOptions: {
          position: window.google.maps.ControlPosition.LEFT_BOTTOM
        },
        gestureHandling: "cooperative",
        language: "he"
      });

      // Add circle if needed
      if (center && radius && showRadius) {
        new window.google.maps.Circle({
          map: mapInstanceRef.current,
          center: mapCenter,
          radius,
          strokeColor: "#3498DB",
          strokeOpacity: 0.4,
          strokeWeight: 2,
          fillColor: "#3498DB",
          fillOpacity: 0.1
        });

        // Add center marker
        new window.google.maps.Marker({
          position: mapCenter,
          map: mapInstanceRef.current,
          title: "מיקום החיפוש",
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: "#3498DB",
            fillOpacity: 1,
            strokeWeight: 2,
            strokeColor: "#FFFFFF"
          }
        });
      }

      // Add shelter markers
      if (shelters && shelters.length > 0) {
        console.log("ShelterMap: Adding markers for shelters:", shelters.length);
        const bounds = new window.google.maps.LatLngBounds();
        let validMarkerCount = 0;

        shelters.forEach(shelter => {
          if (!shelter.lat || !shelter.lng) {
            console.warn("ShelterMap: Shelter missing coordinates:", shelter);
            return;
          }

          const position = {
            lat: parseFloat(shelter.lat),
            lng: parseFloat(shelter.lng)
          };

          if (isNaN(position.lat) || isNaN(position.lng)) {
            console.warn("ShelterMap: Invalid coordinates for shelter:", shelter);
            return;
          }

          console.log("ShelterMap: Adding marker at:", position);
          validMarkerCount++;

          const marker = new window.google.maps.Marker({
            position,
            map: mapInstanceRef.current,
            title: shelter.address,
            icon: {
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 10,
              fillColor: "#e74c3c",
              fillOpacity: 0.9,
              strokeWeight: 2,
              strokeColor: "#FFFFFF"
            }
          });

          marker.addListener("click", () => {
            if (onShelterClick) onShelterClick(shelter);
          });

          markersRef.current.push(marker);
          bounds.extend(position);
        });

        // Fit bounds if no specific center and we have valid markers
        if (!center && validMarkerCount > 0) {
          console.log("ShelterMap: Fitting bounds to markers");
          mapInstanceRef.current.fitBounds(bounds);
        }
        
        console.log(`ShelterMap: Added ${validMarkerCount} markers out of ${shelters.length} shelters`);
      }

      console.log("ShelterMap: Map initialization complete");
      setIsLoading(false);
    } catch (err) {
      console.error("ShelterMap: Map initialization error:", err);
      setError(`שגיאה בטעינת המפה: ${err.message || 'Unknown error'}`);
      setIsLoading(false);
    }
  }, [googleLoaded, center, radius, shelters, showRadius, onShelterClick]);

  return (
    <div className="relative w-full h-full min-h-[400px] rounded-lg overflow-hidden">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-10">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-gray-600">{!googleLoaded ? "טוען Google Maps..." : "טוען מפה..."}</p>
          </div>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-50 rounded-lg p-4">
          <div className="text-center">
            <MapPin className="w-12 h-12 text-red-500 mx-auto mb-2" />
            <p className="text-red-600">{error}</p>
            <button 
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              onClick={() => window.location.reload()}
            >
              טען מחדש
            </button>
          </div>
        </div>
      )}

      <div 
        ref={mapRef}
        className="absolute inset-0 w-full h-full"
        style={{ 
          minHeight: "400px",
          height: "100%",
          width: "100%"
        }}
      />
    </div>
  );
}