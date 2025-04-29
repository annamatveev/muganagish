
import React, { useEffect, useRef, useState } from "react";
import { MapPin, Star, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createPageUrl } from "@/utils";
import { useNavigate } from "react-router-dom";

// Default coordinates for Israel's center
const DEFAULT_CENTER = { lat: 31.7683, lng: 35.2137 };
const DEFAULT_ZOOM = 8;

export default function ShelterMap({ shelters, center, radius = 1000, onShelterClick, showRadius = true }) {
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const mapInstanceRef = useRef(null);
  const circleRef = useRef(null);
  const [mapError, setMapError] = useState(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    const initializeMap = () => {
      if (!window.google || !mapRef.current) {
        console.log("Waiting for Google Maps API...");
        const timer = setTimeout(initializeMap, 100);
        return () => clearTimeout(timer);
      }

      try {
        console.log("Updating map with:", { center, radius, sheltersCount: shelters?.length });
        
        // Create or update map
        if (!mapInstanceRef.current) {
          mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
            center: center || DEFAULT_CENTER,
            zoom: center ? 13 : DEFAULT_ZOOM,
            streetViewControl: false,
            mapTypeControl: false,
            language: "he"
          });
        } else {
          if (center) {
            mapInstanceRef.current.setCenter(center);
          }
        }

        // Clear existing markers
        markersRef.current.forEach(marker => marker.setMap(null));
        markersRef.current = [];

        // Clear existing circle
        if (circleRef.current) {
          circleRef.current.setMap(null);
        }

        // Add search radius circle (only if showRadius is true)
        if (center && radius && showRadius) {
          circleRef.current = new window.google.maps.Circle({
            strokeColor: "#3498DB",
            strokeOpacity: 0.4,
            strokeWeight: 2,
            fillColor: "#3498DB",
            fillOpacity: 0.1,
            map: mapInstanceRef.current,
            center: center,
            radius: radius
          });

          // Add center marker
          new window.google.maps.Marker({
            position: center,
            map: mapInstanceRef.current,
            title: "מיקום החיפוש",
            icon: {
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 8,
              fillColor: "#3498DB",
              fillOpacity: 1,
              strokeWeight: 2,
              strokeColor: "#FFFFFF"
            },
            zIndex: 1000
          });

          // Fit bounds to circle
          const bounds = circleRef.current.getBounds();
          if (bounds) {
            mapInstanceRef.current.fitBounds(bounds);
          }
        }

        // Add shelter markers
        if (shelters?.length > 0) {
          const bounds = new window.google.maps.LatLngBounds();
          
          shelters.forEach(shelter => {
            if (!shelter.lat || !shelter.lng) return;

            const position = {
              lat: parseFloat(shelter.lat),
              lng: parseFloat(shelter.lng)
            };

            if (isNaN(position.lat) || isNaN(position.lng)) return;

            const marker = new window.google.maps.Marker({
              position,
              map: mapInstanceRef.current,
              title: shelter.address,
              icon: {
                path: window.google.maps.SymbolPath.CIRCLE,
                scale: 10,
                fillColor: "#3498DB",
                fillOpacity: 0.9,
                strokeWeight: 2,
                strokeColor: "#FFFFFF"
              },
              clickable: true
            });

            // Create rich info window content
            const infoWindowContent = document.createElement('div');
            infoWindowContent.innerHTML = `
              <div dir="rtl" style="padding: 8px; max-width: 250px;">
                <h3 style="margin: 0 0 8px 0; font-weight: 600;">${shelter.address}</h3>
                <p style="margin: 0 0 8px 0; color: #666;">${shelter.shelter_type}</p>
              </div>
            `;
            
            // Add a button for navigation
            const navigateButton = document.createElement('button');
            navigateButton.innerHTML = 'צפה בפרטי המקלט';
            navigateButton.style.cssText = 'background-color: #3498DB; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 14px; display: block; width: 100%; text-align: center;';
            infoWindowContent.appendChild(navigateButton);
            
            navigateButton.addEventListener('click', () => {
              navigate(createPageUrl(`PublicShelterView?id=${shelter.id}`));
            });
            
            // Create info window with the custom content
            const infoWindow = new window.google.maps.InfoWindow({
              content: infoWindowContent
            });

            // Add click listener to marker
            marker.addListener("click", () => {
              // Close any open info windows
              markersRef.current.forEach(m => m.infoWindow?.close());
              
              // Open this marker's info window
              infoWindow.open(mapInstanceRef.current, marker);
              
              // Call the click handler (for the side panel)
              // We don't need this anymore since we're only using the info window
              // But keeping it in case other functionality needs it
              onShelterClick?.(shelter);
            });

            marker.infoWindow = infoWindow; // Store reference to info window
            markersRef.current.push(marker);
            bounds.extend(position);
          });

          // If we have markers and no center is specified, fit to markers
          if (!center && markersRef.current.length > 0) {
            mapInstanceRef.current.fitBounds(bounds);
          }
        }

      } catch (error) {
        console.error("Error initializing map:", error);
        setMapError(error.message);
      }
    };

    initializeMap();
  }, [center, radius, shelters, onShelterClick, navigate, showRadius]);

  return (
    <div className="w-full h-full rounded-lg relative">
      {mapError && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-50 rounded-lg p-4 z-10">
          <p className="text-red-600 text-center">שגיאה בטעינת המפה: {mapError}</p>
        </div>
      )}
      <div 
        ref={mapRef} 
        className="w-full h-full rounded-lg"
        style={{ minHeight: "600px" }}
      />
      
      {/* Fallback message if no shelters have coordinates */}
      {!mapError && shelters && shelters.length > 0 && !shelters.some(s => s.lat && s.lng) && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-lg p-4 z-10">
          <div className="text-center">
            <MapPin className="w-12 h-12 mx-auto text-gray-400 mb-2" />
            <p className="text-gray-700 font-medium">אין נקודות מיקום על המפה</p>
            <p className="text-gray-500 text-sm max-w-xs mx-auto mt-1">
              למקלטים המוצגים אין נקודות ציון גיאוגרפיות. נסו לחפש בכתובת אחרת.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
