"use client";
import dynamic from "next/dynamic";
import React, { useEffect, useState } from "react";
import { Inter } from "next/font/google";
import axios from "axios";

const MapComponent = dynamic(() => import("../components/MapComponent"), { ssr: false });

const inter = Inter({ subsets: ["latin"] });

// Setup FastSpeedtest API for speed testing
let speedtest = new FastSpeedtest({
  token: "YXNkZmFzZGxmbnNkYWZoYXNkZmhrYWxm", // required
  verbose: false, // default: false
  timeout: 10000, // default: 5000
  https: true, // default: true
  urlCount: 5, // default: 5
  bufferSize: 8, // default: 8
  unit: FastSpeedtest.UNITS.Mbps, // default: Bps
  proxy: undefined,
});


const HomePage = () => {
  const [locations, setLocations] = useState([]);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [isClient, setIsClient] = useState(false);
  const [userIPLocation, setUserIPLocation] = useState(null);
  const [sessionID, setSessionID] = useState(null);

  useEffect(() => {
    setIsClient(true);

    if (typeof window !== "undefined") {
      let storedSessionID = localStorage.getItem("sessionID");
      if (!storedSessionID) {
        storedSessionID = `sessionID-${Math.floor(Math.random() * 100000)}`;
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
            let speed = 0;
    try {
      speed = await speedtest.getSpeed(); // Get the speed in Mbps
    } catch (e) {
      console.error("Error getting speed:", e.message);
    }

            const newLocation = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
              speed,
              ip: userIPLocation?.ip || "unknown",
              time: new Date().toISOString(),
              sessionID,
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
              return prevLocations;
            });

            try {
              await axios.post(
                "https://fitnet-1.onrender.com/save-location",
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

    const interval = setInterval(updateLocationAndSpeed, 10000);
    updateLocationAndSpeed();

    return () => clearInterval(interval);
  }, [userIPLocation, sessionID]);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await axios.get(
          "https://fitnet-1.onrender.com/get-locations"
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
      <MapComponent locations={locations} />
    </div>
  );
};

export default HomePage;
