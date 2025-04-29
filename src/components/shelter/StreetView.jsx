import React, { useEffect, useRef } from 'react';

export default function StreetView({ lat, lng }) {
  const streetViewRef = useRef(null);
  const panoramaRef = useRef(null);

  useEffect(() => {
    if (!window.google || !lat || !lng) return;

    const position = { lat: parseFloat(lat), lng: parseFloat(lng) };
    
    // Create a new Street View instance
    panoramaRef.current = new window.google.maps.StreetViewPanorama(
      streetViewRef.current,
      {
        position: position,
        pov: { heading: 0, pitch: 0 },
        zoom: 1,
        addressControl: true,
        showRoadLabels: true,
        zoomControl: true,
      }
    );

    // Check if Street View is available at this location
    const streetViewService = new window.google.maps.StreetViewService();
    streetViewService.getPanorama({ location: position, radius: 50 }, (data, status) => {
      if (status !== 'OK') {
        // If no street view available, show a message
        if (streetViewRef.current) {
          streetViewRef.current.innerHTML = `
            <div class="flex items-center justify-center h-full bg-gray-100 rounded-lg">
              <div class="text-center p-6">
                <p class="text-gray-600 mb-2">אין תצוגת רחוב זמינה במיקום זה</p>
                <p class="text-sm text-gray-500">נסו להתרחק מעט מהמיקום המדויק</p>
              </div>
            </div>
          `;
        }
      }
    });

  }, [lat, lng]);

  return (
    <div 
      ref={streetViewRef} 
      className="w-full h-[400px] rounded-lg overflow-hidden"
      style={{ minHeight: "400px" }}
    />
  );
}