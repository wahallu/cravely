import React, { useState, useEffect, useRef } from "react";
import { FaStore, FaHome, FaMotorcycle } from "react-icons/fa";

// Map container style
const containerStyle = {
  width: "100%",
  height: "100%",
  position: "relative",
};

// Real locations from provided Google Maps links
const LOCATIONS = {
  // User location: https://maps.app.goo.gl/pZ5nKXkYiBECspnKA
  USER: {
    lat: 6.919046153191951,
    lng: 79.97284612974553
  },
  // Driver location: https://maps.app.goo.gl/8sxPzBtJVbTomgq8A
  DRIVER: {
    lat: 6.911211309346461,
    lng: 79.97210071637732
  },
  // Restaurant location: https://maps.app.goo.gl/uRvAx9zqsYx2CK8e8
  RESTAURANT: {
    lat: 6.906903629778984,
    lng: 79.97375369604222
  }
};

export default function MapComponent({
  driverLocation,
  destination,
  restaurantLocation,
}) {
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const mapMarkers = useRef({
    driver: null,
    restaurant: null,
    destination: null,
  });

  // Use provided locations or fall back to our real locations
  const effectiveDriverLocation = driverLocation || LOCATIONS.DRIVER;
  const effectiveRestaurantLocation = restaurantLocation || LOCATIONS.RESTAURANT;
  const effectiveDestination = destination || LOCATIONS.USER;

  useEffect(() => {
    // Create a script element to load Google Maps API
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyBO8qCm4gXtCLqp8c-oovgJpr5HmSb_iLs&callback=initMap&libraries=maps,marker&v=beta`;
    script.async = true;
    script.defer = true;

    // Define the callback function that Google Maps will call
    window.initMap = () => {
      if (!mapContainerRef.current) return;

      try {
        // Calculate center point between all three locations
        const centerLat = (effectiveDriverLocation.lat + effectiveRestaurantLocation.lat + effectiveDestination.lat) / 3;
        const centerLng = (effectiveDriverLocation.lng + effectiveRestaurantLocation.lng + effectiveDestination.lng) / 3;
        
        // Create the map instance centered on calculated coordinates
        const map = new window.google.maps.Map(mapContainerRef.current, {
          center: { lat: centerLat, lng: centerLng },
          zoom: 15, // Lower zoom level to show more of the area
          mapId: "DEMO_MAP_ID",
          mapTypeControl: false,
          fullscreenControl: false,
          streetViewControl: false,
          zoomControl: true,
          zoomControlOptions: {
            position: window.google.maps.ControlPosition.RIGHT_BOTTOM,
          },
        });

        mapRef.current = map;

        // Create the markers
        if (effectiveDriverLocation) {
          const driverMarker =
            new window.google.maps.marker.AdvancedMarkerElement({
              position: effectiveDriverLocation,
              map: map,
              title: "Driver Location",
              content: createCustomMarker("driver"),
            });
          mapMarkers.current.driver = driverMarker;
        }

        if (effectiveRestaurantLocation) {
          const restaurantMarker =
            new window.google.maps.marker.AdvancedMarkerElement({
              position: effectiveRestaurantLocation,
              map: map,
              title: "Restaurant",
              content: createCustomMarker("restaurant"),
            });
          mapMarkers.current.restaurant = restaurantMarker;
        }

        if (effectiveDestination) {
          const destinationMarker =
            new window.google.maps.marker.AdvancedMarkerElement({
              position: effectiveDestination,
              map: map,
              title: "Your Location",
              content: createCustomMarker("destination"),
            });
          mapMarkers.current.destination = destinationMarker;
        }

        // Create and render the directions service
        if (
          effectiveDriverLocation &&
          effectiveDestination &&
          effectiveRestaurantLocation
        ) {
          const directionsService = new window.google.maps.DirectionsService();
          const directionsRenderer = new window.google.maps.DirectionsRenderer({
            map: map,
            suppressMarkers: true, // We use our custom markers
            polylineOptions: {
              strokeColor: "#FF6B00",
              strokeWeight: 5,
              strokeOpacity: 0.7,
            },
          });

          // Request directions from restaurant to destination through driver
          const request = {
            origin: effectiveRestaurantLocation,
            destination: effectiveDestination,
            waypoints: [
              {
                location: effectiveDriverLocation,
                stopover: true,
              },
            ],
            travelMode: window.google.maps.TravelMode.DRIVING,
            region: 'lk', // Set region to Sri Lanka
          };

          directionsService.route(request, (result, status) => {
            if (status === window.google.maps.DirectionsStatus.OK) {
              directionsRenderer.setDirections(result);

              // Fit the map to show all markers
              const bounds = new window.google.maps.LatLngBounds();
              bounds.extend(effectiveRestaurantLocation);
              bounds.extend(effectiveDriverLocation);
              bounds.extend(effectiveDestination);
              map.fitBounds(bounds);
              
              // Make sure we're not zoomed in too close
              const listener = window.google.maps.event.addListenerOnce(map, 'idle', function() {
                if (map.getZoom() > 16) {  // Adjusted from 15 to 16
                  map.setZoom(16);
                }
              });
            } else {
              console.error("Directions request failed: " + status);
              // If directions fail, use the bounds approach
              const bounds = new window.google.maps.LatLngBounds();
              bounds.extend(effectiveRestaurantLocation);
              bounds.extend(effectiveDriverLocation);
              bounds.extend(effectiveDestination);
              map.fitBounds(bounds);
            }
          });
        } else {
          // If we don't have all locations for directions, just fit bounds
          const bounds = new window.google.maps.LatLngBounds();
          if (effectiveRestaurantLocation) bounds.extend(effectiveRestaurantLocation);
          if (effectiveDriverLocation) bounds.extend(effectiveDriverLocation);
          if (effectiveDestination) bounds.extend(effectiveDestination);
          map.fitBounds(bounds);
          
          // Ensure we're not zoomed in too close
          const listener = window.google.maps.event.addListenerOnce(map, 'idle', function() {
            if (map.getZoom() > 15) {
              map.setZoom(15);
            }
          });
        }

        setIsMapLoaded(true);
      } catch (error) {
        console.error("Error initializing map:", error);
      }
    };

    // Append the script to the document to load the API
    document.head.appendChild(script);

    return () => {
      // Clean up
      window.initMap = undefined;
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  // Update driver marker position whenever it changes
  useEffect(() => {
    if (mapRef.current && mapMarkers.current.driver && driverLocation) {
      mapMarkers.current.driver.position = driverLocation;

      // Smoothly pan the map to follow the driver
      mapRef.current.panTo(driverLocation);
    }
  }, [driverLocation]);

  // Helper function to create custom marker elements
  const createCustomMarker = (type) => {
    const element = document.createElement("div");
    element.className = "custom-marker";
    element.style.display = "flex";
    element.style.alignItems = "center";
    element.style.justifyContent = "center";
    element.style.width = "40px";
    element.style.height = "40px";
    element.style.borderRadius = "50%";
    element.style.boxShadow = "0 2px 6px rgba(0,0,0,0.3)";

    switch (type) {
      case "driver":
        element.style.backgroundColor = "#3b82f6"; // blue
        element.innerHTML =
          '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" width="24" height="24"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>';
        break;
      case "restaurant":
        element.style.backgroundColor = "#f97316"; // orange
        element.innerHTML =
          '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" width="24" height="24"><path d="M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-9.03C11.34 12.84 13 11.12 13 9V2h-2v7zm5-3v8h2.5v8H21V2c-2.76 0-5 2.24-5 4z"/></svg>';
        break;
      case "destination":
        element.style.backgroundColor = "#22c55e"; // green
        element.innerHTML =
          '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" width="24" height="24"><path d="M12 12c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm6-1.8C18 6.57 15.35 4 12 4s-6 2.57-6 6.2c0 2.34 1.95 5.44 6 9.14 4.05-3.7 6-6.8 6-9.14zM12 2c4.2 0 8 3.22 8 8.2 0 3.32-2.67 7.25-8 11.8-5.33-4.55-8-8.48-8-11.8C4 5.22 7.8 2 12 2z"/></svg>';
        break;
      default:
        element.style.backgroundColor = "#6b7280"; // gray
    }

    // Add bounce animation for the driver marker
    if (type === "driver") {
      element.style.animation = "bounce 1s infinite alternate";
      const style = document.createElement("style");
      style.textContent = `
        @keyframes bounce {
          0% { transform: translateY(0); }
          100% { transform: translateY(-10px); }
        }
      `;
      document.head.appendChild(style);
    }

    return element;
  };

  return (
    <div style={containerStyle} className="rounded-lg overflow-hidden">
      {/* Google Maps container */}
      <div ref={mapContainerRef} style={{ width: "100%", height: "100%" }} />

      {/* Overlay loading indicator */}
      {!isMapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-orange-500"></div>
        </div>
      )}

      {/* Info overlay */}
      <div className="absolute bottom-4 left-4 bg-white bg-opacity-90 p-3 rounded-lg shadow-lg max-w-xs">
        <div className="flex items-center mb-2">
          <FaMotorcycle className="text-blue-500 mr-2" />
          <span className="font-medium">Driver Location</span>
        </div>
        <div className="flex items-center mb-2">
          <FaStore className="text-orange-500 mr-2" />
          <span className="font-medium">Restaurant</span>
        </div>
        <div className="flex items-center">
          <FaHome className="text-green-500 mr-2" />
          <span className="font-medium">Your Location</span>
        </div>
      </div>
    </div>
  );
}
