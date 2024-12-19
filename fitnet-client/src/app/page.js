"use client";

import React, { useEffect, useState } from "react";
import { Inter } from "next/font/google";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import axios from "axios";
import "leaflet/dist/leaflet.css";

const inter = Inter({ subsets: ["latin"] });

const HomePage = () => {
  const [locations, setLocations] = useState([]);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [isClient, setIsClient] = useState(false); // Track if it's the client
  const [userIPLocation, setUserIPLocation] = useState(null);
  const [sessionID, setSessionID] = useState(null);

  // Custom marker icons
  const greenIcon = window && new L.Icon({
    iconUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    shadowUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

  const redIcon = window && new L.Icon({
    iconUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-red.png",
    shadowUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

  useEffect(() => {
    // Set isClient to true after component mounts (client-side)
    setIsClient(true);

    // Only run this on the client side
    if (typeof window !== "undefined") {
      let storedSessionID = localStorage.getItem("sessionID");
      if (!storedSessionID) {
        storedSessionID = `session-${Math.floor(Math.random() * 100000)}`;
        localStorage.setItem("sessionID", storedSessionID);
      }
      setSessionID(storedSessionID);

      const fetchUserIPLocation = async () => {
        try {
          const response = await axios.get(
            "https://ipinfo.io/json?token=1fc3f9d9c4cba5"
          );
          const { loc, ip } = response.data;
          const [lat, lng] = loc.split(",");
          setUserIPLocation({ lat: parseFloat(lat), lng: parseFloat(lng), ip });
        } catch (error) {
          console.error("Error fetching user IP location:", error);
        }
      };

      fetchUserIPLocation();
    }

    const updateLocationAndSpeed = async () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const speed = Math.floor(Math.random() * 100) + 1; // Simulated internet speed
            const newLocation = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
              speed,
              ip: userIPLocation?.ip || "unknown", // Save IP
              time: new Date().toISOString(), // Save time of the location
              sessionID, // Include the sessionID
            };

            setCurrentLocation({ lat: newLocation.lat, lng: newLocation.lng });

            setLocations((prevLocations) => {
              const exists = prevLocations.some(
                (location) =>
                  location.ip === newLocation.ip ||
                  (location.lat === newLocation.lat &&
                    location.lng === newLocation.lng)
              );
              if (!exists) {
                return [...prevLocations, newLocation];
              }
              return prevLocations; // Don't add duplicate
            });

            try {
              await axios.post(
                "https://fitnet-rxe6.onrender.com:10000/save-location", // Your backend endpoint to save location data
                newLocation
              );
            } catch (error) {
              console.error("Error saving location to backend:", error);
            }
          },
          (error) => console.error("Geolocation error:", error),
          { enableHighAccuracy: true }
        );
      } else {
        console.error("Geolocation is not supported by this browser.");
      }
    };

    // Fetch location and speed every 10 seconds
    const interval = setInterval(updateLocationAndSpeed, 10000);
    updateLocationAndSpeed();

    return () => clearInterval(interval);
  }, [userIPLocation, sessionID]);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await axios.get(
          "https://fitnet-rxe6.onrender.com:10000/get-locations"
        );
        setLocations(response.data);
      } catch (error) {
        console.error("Error fetching locations:", error);
      }
    };

    if (userIPLocation) {
      fetchLocations();
    }
  }, [userIPLocation]);

  if (!isClient || !userIPLocation) {
    return <div>Loading...</div>;
  }

  const getMarkerIcon = (loc) => {
    const userLocations = locations.filter(
      (location) => location.ip === loc.ip
    );
    if (userLocations.length > 0) {
      const latestLocation = userLocations.reduce((latest, location) => {
        return new Date(location.time) > new Date(latest.time)
          ? location
          : latest;
      }, userLocations[0]);

      if (loc.ip === latestLocation.ip && loc.time === latestLocation.time) {
        return greenIcon;
      }
    }
    return redIcon;
  };

  return (
    <div
      className={inter.className}
      style={{ height: "100vh", width: "100vw" }}
    >
      <div
        style={{
          padding: "20px",
          textAlign: "center",
          backgroundColor: "#ffffff",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
          borderRadius: "10px",
        }}
      >
        <h1
          style={{
            marginBottom: "10px",
            fontSize: "4em",
            fontWeight: "700",
            color: "#007BFF",
          }}
        >
          fitnet
        </h1>
        <div
          style={{
            marginTop: "10px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <p style={{ fontSize: "1.25em", color: "#555", margin: "5px 0" }}>
            <strong>Total Users:</strong> {locations.length}
          </p>
        </div>
      </div>

      <MapContainer
        center={[9.145, 40.4897]}
        zoom={6}
        style={{ height: "80%", width: "100%" }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {locations.map((loc, index) => (
          <Marker
            key={index}
            position={[loc.lat, loc.lng]}
            icon={getMarkerIcon(loc)}
          >
            <Popup>
              <div>
                <h4>User: {loc.user}</h4>
                <p>Speed: {loc.speed} Mbps</p>
                <p>
                  Location: {loc.lat}, {loc.lng}
                </p>
                <p>Time: {new Date(loc.time).toLocaleString()}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default HomePage;
