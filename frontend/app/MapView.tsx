// filepath: c:\Users\gdben\Desktop\EnvTrack\EnvTrack\frontend\app\MapView.tsx
import React, { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
mapboxgl.accessToken = "pk.eyJ1IjoiYmVuYmlja2VsIiwiYSI6ImNtZWh4b2V0aDBjcnYyaXB5b3BvODg2bmQifQ.Z50rog7ZcT11uqu9CsBDhw"; // Replace with your token

export default function MapView() {
  const mapContainer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapContainer.current) return;
    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/light-v10",
      center: [-71.0589, 42.3601], // Boston
      zoom: 11,
    });
    return () => map.remove();
  }, []);

  return <div ref={mapContainer} style={{ width: "100%", height: "600px" }} />;
}