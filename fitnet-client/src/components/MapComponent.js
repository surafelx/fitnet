"use client";

import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import {Tooltip} from 'react-tooltip'

// Custom marker icons
const greenIcon = new L.Icon({
  iconUrl: "./black-icon.webp",

  iconSize: [41, 41],
  iconAnchor: [7, 41],
  popupAnchor: [-10, -34],
});

const redIcon = new L.Icon({
  iconUrl: "./red-icon.webp",

  iconSize: [41, 41],
  iconAnchor: [7, 41],
  popupAnchor: [1, -34],
});

const MapComponent = ({ locations }) => {
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
    <MapContainer
      center={[9.145, 40.4897]}
      zoom={6}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {locations.map((loc, index) => (
        <Marker
          key={index}
          position={[loc.lat, loc.lng]}
          icon={getMarkerIcon(loc)}
        >
          {/* Add Tooltip to display the speed */}
          <Tooltip direction="top" offset={[0, -20]} permanent>
            <div
              style={{ fontSize: "12px", fontWeight: "bold", color: "blue" }}
            >
              {loc.speed || 0} Mbps
            </div>
          </Tooltip>

          {/* Popup for detailed information */}
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
  );
};

export default MapComponent;
