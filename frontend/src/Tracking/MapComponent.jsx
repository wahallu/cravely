import React, { useState } from "react";
import { FaStore, FaHome, FaMotorcycle } from "react-icons/fa";

// Map container style
const containerStyle = {
  width: "100%",
  height: "100%",
};

// Mock map component that doesn't require Google Maps API
export default function MapComponent({
  driverLocation,
  destination,
  restaurantLocation,
}) {
  const [selectedMarker, setSelectedMarker] = useState(null);

  // Mock delivery info
  const deliveryInfo = {
    distance: "2.3 km",
    duration: "8 mins",
  };

  // Calculate positions on a basic canvas (scaled between 0-100%)
  const getRelativePosition = (location) => {
    // These calculations are very simplified - just for demonstration
    const minLat = 40.712776;
    const maxLat = 40.73061;
    const minLng = -74.005974;
    const maxLng = -73.935242;

    const x = ((location.lng - minLng) / (maxLng - minLng)) * 100;
    const y = 100 - ((location.lat - minLat) / (maxLat - minLat)) * 100; // Invert Y for top-down view

    return { x: `${x}%`, y: `${y}%` };
  };

  const restaurantPos = restaurantLocation
    ? getRelativePosition(restaurantLocation)
    : null;
  const destinationPos = destination ? getRelativePosition(destination) : null;
  const driverPos = driverLocation ? getRelativePosition(driverLocation) : null;

  // Calculate path points for the route line
  const getPathPoints = () => {
    if (!restaurantLocation || !destination || !driverLocation) return "";

    // Create path through restaurant to destination
    const driver = getRelativePosition(driverLocation);
    const restaurant = getRelativePosition(restaurantLocation);
    const dest = getRelativePosition(destination);

    return `M ${driver.x} ${driver.y} L ${restaurant.x} ${restaurant.y} L ${dest.x} ${dest.y}`;
  };

  return (
    <div
      className="relative w-full h-full bg-gray-100 overflow-hidden"
      style={containerStyle}
    >
      {/* Static Map Background */}
      <div className="absolute inset-0 bg-gray-200 z-0">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "url('https://maps.googleapis.com/maps/api/staticmap?center=40.722776,-73.996974&zoom=13&size=1000x1000&maptype=roadmap&key=DEMO_KEY_ONLY')",
            backgroundSize: "cover",
          }}
        ></div>

        {/* Grid lines */}
        <div className="absolute inset-0 grid grid-cols-4 grid-rows-4">
          {[...Array(16)].map((_, i) => (
            <div key={i} className="border border-gray-300"></div>
          ))}
        </div>
      </div>

      {/* Path line */}
      <svg className="absolute inset-0 z-10 w-full h-full">
        <path
          d={getPathPoints()}
          stroke="#1976D2"
          strokeWidth="3"
          fill="none"
          strokeDasharray="5,5"
        />
      </svg>

      {/* Restaurant Marker */}
      {restaurantPos && (
        <div
          className="absolute z-20 transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
          style={{ left: restaurantPos.x, top: restaurantPos.y }}
          onClick={() =>
            setSelectedMarker(
              selectedMarker === "restaurant" ? null : "restaurant"
            )
          }
        >
          <div className="p-2 rounded-full bg-orange-500 text-white">
            <FaStore size={16} />
          </div>

          {/* Info Window for Restaurant */}
          {selectedMarker === "restaurant" && (
            <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 bg-white p-2 rounded shadow-md w-40">
              <div className="flex items-center">
                <FaStore className="text-orange-500 mr-2" />
                <h3 className="font-medium">Restaurant</h3>
              </div>
              <p className="text-sm text-gray-600">Order pickup location</p>
            </div>
          )}
        </div>
      )}

      {/* Destination Marker */}
      {destinationPos && (
        <div
          className="absolute z-20 transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
          style={{ left: destinationPos.x, top: destinationPos.y }}
          onClick={() =>
            setSelectedMarker(
              selectedMarker === "destination" ? null : "destination"
            )
          }
        >
          <div className="p-2 rounded-full bg-green-500 text-white">
            <FaHome size={16} />
          </div>

          {/* Info Window for Destination */}
          {selectedMarker === "destination" && (
            <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 bg-white p-2 rounded shadow-md w-40">
              <div className="flex items-center">
                <FaHome className="text-green-500 mr-2" />
                <h3 className="font-medium">Delivery Location</h3>
              </div>
              <p className="text-sm text-gray-600">Your delivery address</p>
            </div>
          )}
        </div>
      )}

      {/* Driver Marker */}
      {driverPos && (
        <div
          className="absolute z-30 transform -translate-x-1/2 -translate-y-1/2 cursor-pointer animate-bounce"
          style={{ left: driverPos.x, top: driverPos.y }}
          onClick={() =>
            setSelectedMarker(selectedMarker === "driver" ? null : "driver")
          }
        >
          <div className="p-2 rounded-full bg-blue-500 text-white">
            <FaMotorcycle size={16} />
          </div>

          {/* Info Window for Driver */}
          {selectedMarker === "driver" && (
            <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 bg-white p-2 rounded shadow-md w-40">
              <div className="flex items-center">
                <FaMotorcycle className="text-blue-500 mr-2" />
                <h3 className="font-medium">Your Driver</h3>
              </div>
              <p className="text-sm text-gray-600">
                {deliveryInfo.distance} • {deliveryInfo.duration} away
              </p>
            </div>
          )}
        </div>
      )}

      {/* Map Attribution */}
      <div className="absolute bottom-2 right-2 text-xs text-gray-500 bg-white bg-opacity-70 px-1 rounded">
        Map display (simulation only)
      </div>
    </div>
  );
}
