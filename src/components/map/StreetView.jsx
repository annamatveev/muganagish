import React, { useEffect, useRef, useState } from "react";

export default function StreetView({ lat, lng, address }) {
  const streetViewRef = useRef(null);
  const [error, setError] = useState(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  
  // Check if Google Maps is loaded
  useEffect(() => {
    if (!window.google || !window.google.maps) {
      setError("Google Maps API not loaded");
      return;
    }
    setMapLoaded(true);
  }, []);
  
  // Initialize Street View
  useEffect(() => {
    if (!mapLoaded || !streetViewRef.current) return;
    if (!lat || !lng) {
      setError("No coordinates provided");
      return;
    }
    
    try {
      const position = new window.google.maps.LatLng(lat, lng);
      
      // Create street view panorama
      const panorama = new window.google.maps.StreetViewPanorama(streetViewRef.current, {
        position,
        pov: { heading: 0, pitch: 0 },
        zoom: 1,
        addressControl: true,
        linksControl: false,
        panControl: true,
        enableCloseButton: false,
        motionTracking: false,
        motionTrackingControl: false
      });
      
      // Check if street view is available
      const streetViewService = new window.google.maps.StreetViewService();
      streetViewService.getPanorama({ location: position, radius: 50 }, (data, status) => {
        if (status !== 'OK') {
          setError("תצוגת רחוב אינה זמינה במיקום זה");
        }
      });
    } catch (err) {
      console.error("Street View initialization error:", err);
      setError("Failed to initialize Street View");
    }
  }, [lat, lng, mapLoaded]);
  
  return (
    <div className="w-full h-full relative">
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10 text-red-500">
          {error}
        </div>
      )}
      
      <div 
        ref={streetViewRef} 
        className="w-full h-full rounded-lg overflow-hidden"
        style={{ minHeight: "200px" }}
      />
    </div>
  );
}