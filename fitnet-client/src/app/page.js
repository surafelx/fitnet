"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import axios from "axios";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

// Dynamically load MapComponent
const MapComponent = dynamic(() => import("../components/MapComponent"), {
  ssr: false, // Ensure it's client-side only
});

const HomePage = () => {
  const [locations, setLocations] = useState([]);
  const [userIPLocation, setUserIPLocation] = useState(null);
  const [sessionID, setSessionID] = useState(null);

  useEffect(() => {
    const fetchUserIPLocation = async () => {
      try {
        const response = await axios.get(
          "https://ipinfo.io/json?token=1fc3f9d9c4cba5"
        );
        const { loc } = response.data;
        const [lat, lng] = loc.split(",");
        setUserIPLocation({ lat: parseFloat(lat), lng: parseFloat(lng) });
      } catch (error) {
        console.error("Error fetching user IP location:", error);
      }
    };

    fetchUserIPLocation();
  }, []);

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

    fetchLocations();
  }, []);

  const getMarkerIcon = (loc) => {
    const isCurrentUser = loc.ip === userIPLocation?.ip;
    return isCurrentUser ? greenIcon : redIcon;
  };

  if (!userIPLocation) {
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

      <MapComponent locations={locations} getMarkerIcon={getMarkerIcon} />
    </div>
  );
};

export default HomePage;
