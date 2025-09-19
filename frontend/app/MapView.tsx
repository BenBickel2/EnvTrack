'use client';

import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

function expandBounds(bounds: mapboxgl.LngLatBounds, expansion = 0.005) {
  const sw = bounds.getSouthWest();
  const ne = bounds.getNorthEast();
  return new mapboxgl.LngLatBounds(
    [sw.lng - expansion, sw.lat - expansion],
    [ne.lng + expansion, ne.lat + expansion]
  );
}

function featureBounds(feature: any): mapboxgl.LngLatBounds {
  const g = feature.geometry;
  let coords: number[][] = [];
  if (g.type === 'Polygon') coords = g.coordinates.flat(1);
  else if (g.type === 'MultiPolygon') coords = g.coordinates.flat(2);
  else if (g.type === 'LineString') coords = g.coordinates;
  else if (g.type === 'MultiLineString') coords = g.coordinates.flat(1);
  else if (g.type === 'Point') coords = [g.coordinates];

  const start = coords[0] as [number, number];
  return coords.reduce(
    (b: mapboxgl.LngLatBounds, c: number[]) => b.extend(c as [number, number]),
    new mapboxgl.LngLatBounds(start, start)
  );
}

function getAQIColor(aqi: number): string {
  if (aqi <= 50) return '#00e400';    // Good (0-50)
  if (aqi <= 100) return '#ffff00';   // Moderate (51-100)
  if (aqi <= 150) return '#ff7e00';   // Unhealthy for Sensitive Groups (101-150)
  if (aqi <= 200) return '#ff0000';   // Unhealthy (151-200)
  if (aqi <= 300) return '#8f3f97';   // Very Unhealthy (201-300)
  return '#7e0023';                   // Hazardous (300+)
}

export default function MapView() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [aqiData, setAqiData] = useState<{[key: string]: any}>({});
  const [isLoadingAQI, setIsLoadingAQI] = useState(false);

  const fetchAQIData = async () => {
    setIsLoadingAQI(true);
    try {
      console.log('Fetching AQI data from:', `${API_BASE_URL}/aqi/boston`);
      const response = await fetch(`${API_BASE_URL}/aqi/boston`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('AQI data received:', data);
      setAqiData(data.neighborhoods || {});
    } catch (err) {
      console.error('Error fetching AQI data:', err);
      setAqiData({});
    } finally {
      setIsLoadingAQI(false);
    }
  };

  // Fetch AQI data when component mounts
  useEffect(() => {
    fetchAQIData();
  }, []);

  useEffect(() => {
    if (!mapContainer.current) return;

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v10',
      center: [-71.0589, 42.3601],
      zoom: 11,
    });
    mapRef.current = map;

    map.on('load', async () => {
      try {
        // Load your neighborhoods GeoJSON from /public
        const res = await fetch('/neighborhoods.json');
        if (!res.ok) throw new Error(`Failed to fetch neighborhoods.json (${res.status})`);
        const neighborhoods = await res.json();

        // Add neighborhoods source; generateId gives each feature a stable runtime id
        map.addSource('neighborhoods', {
          type: 'geojson',
          data: neighborhoods,
          generateId: true,
        } as any);

        // Fill layer with AQI-based coloring
        map.addLayer({
          id: 'neighborhood-fill',
          type: 'fill',
          source: 'neighborhoods',
          paint: {
            'fill-color': [
              'case',
              // Check each neighborhood name and get color from aqiData
              ['==', ['get', 'name'], 'Allston'], aqiData['Allston'] ? getAQIColor(aqiData['Allston'].aqi) : '#3b82f6',
              ['==', ['get', 'name'], 'Back Bay'], aqiData['Back Bay'] ? getAQIColor(aqiData['Back Bay'].aqi) : '#3b82f6',
              ['==', ['get', 'name'], 'Bay Village'], aqiData['Bay Village'] ? getAQIColor(aqiData['Bay Village'].aqi) : '#3b82f6',
              ['==', ['get', 'name'], 'Beacon Hill'], aqiData['Beacon Hill'] ? getAQIColor(aqiData['Beacon Hill'].aqi) : '#3b82f6',
              ['==', ['get', 'name'], 'Brighton'], aqiData['Brighton'] ? getAQIColor(aqiData['Brighton'].aqi) : '#3b82f6',
              ['==', ['get', 'name'], 'Charlestown'], aqiData['Charlestown'] ? getAQIColor(aqiData['Charlestown'].aqi) : '#3b82f6',
              ['==', ['get', 'name'], 'Chinatown'], aqiData['Chinatown'] ? getAQIColor(aqiData['Chinatown'].aqi) : '#3b82f6',
              ['==', ['get', 'name'], 'Dorchester'], aqiData['Dorchester'] ? getAQIColor(aqiData['Dorchester'].aqi) : '#3b82f6',
              ['==', ['get', 'name'], 'East Boston'], aqiData['East Boston'] ? getAQIColor(aqiData['East Boston'].aqi) : '#3b82f6',
              ['==', ['get', 'name'], 'Fenway'], aqiData['Fenway'] ? getAQIColor(aqiData['Fenway'].aqi) : '#3b82f6',
              ['==', ['get', 'name'], 'Hyde Park'], aqiData['Hyde Park'] ? getAQIColor(aqiData['Hyde Park'].aqi) : '#3b82f6',
              ['==', ['get', 'name'], 'Jamaica Plain'], aqiData['Jamaica Plain'] ? getAQIColor(aqiData['Jamaica Plain'].aqi) : '#3b82f6',
              ['==', ['get', 'name'], 'Longwood'], aqiData['Longwood'] ? getAQIColor(aqiData['Longwood'].aqi) : '#3b82f6',
              ['==', ['get', 'name'], 'Mattapan'], aqiData['Mattapan'] ? getAQIColor(aqiData['Mattapan'].aqi) : '#3b82f6',
              ['==', ['get', 'name'], 'Mission Hill'], aqiData['Mission Hill'] ? getAQIColor(aqiData['Mission Hill'].aqi) : '#3b82f6',
              ['==', ['get', 'name'], 'North End'], aqiData['North End'] ? getAQIColor(aqiData['North End'].aqi) : '#3b82f6',
              ['==', ['get', 'name'], 'Roslindale'], aqiData['Roslindale'] ? getAQIColor(aqiData['Roslindale'].aqi) : '#3b82f6',
              ['==', ['get', 'name'], 'Roxbury'], aqiData['Roxbury'] ? getAQIColor(aqiData['Roxbury'].aqi) : '#3b82f6',
              ['==', ['get', 'name'], 'South End'], aqiData['South End'] ? getAQIColor(aqiData['South End'].aqi) : '#3b82f6',
              ['==', ['get', 'name'], 'South Boston'], aqiData['South Boston'] ? getAQIColor(aqiData['South Boston'].aqi) : '#3b82f6',
              ['==', ['get', 'name'], 'West Roxbury'], aqiData['West Roxbury'] ? getAQIColor(aqiData['West Roxbury'].aqi) : '#3b82f6',
              '#3b82f6' // Default blue if no AQI data
            ],
            'fill-opacity': [
              'case',
              ['boolean', ['feature-state', 'hover'], false],
              0.35, // on hover
              0.15, // default
            ],
          },
        });

        // Outline layer with thicker width when selected
        map.addLayer({
          id: 'neighborhood-outline',
          type: 'line',
          source: 'neighborhoods',
          paint: {
            'line-color': '#2563eb',
            'line-width': [
              'case',
              ['boolean', ['feature-state', 'selected'], false],
              3,
              1.25,
            ],
            'line-opacity': 0.9,
          },
        });

        // Optional labels (tries common property names)
        map.addLayer({
          id: 'neighborhood-label',
          type: 'symbol',
          source: 'neighborhoods',
          layout: {
            'text-field': [
              'coalesce',
              ['get', 'name'],
              ['get', 'neighborhood'],
              ['get', 'Neighborhood'],
              ''
            ],
            'text-size': 12,
            'text-allow-overlap': false,
          },
          paint: {
            'text-color': '#111827',
            'text-halo-color': '#ffffff',
            'text-halo-width': 1,
          },
        });

        // Cursor + hover states
        let hoveredId: number | string | null = null;
        let selectedId: number | string | null = null;

        map.on('mouseenter', 'neighborhood-fill', () => {
          map.getCanvas().style.cursor = 'pointer';
        });
        map.on('mouseleave', 'neighborhood-fill', () => {
          map.getCanvas().style.cursor = '';
          if (hoveredId !== null) {
            map.setFeatureState({ source: 'neighborhoods', id: hoveredId }, { hover: false });
            hoveredId = null;
          }
        });

        map.on('mousemove', 'neighborhood-fill', (e) => {
          const f = e.features?.[0];
          if (!f) return;
          const id = f.id as number | string;
          if (hoveredId !== null && hoveredId !== id) {
            map.setFeatureState({ source: 'neighborhoods', id: hoveredId }, { hover: false });
          }
          hoveredId = id;
          map.setFeatureState({ source: 'neighborhoods', id }, { hover: true });
        });

        // Click to select + zoom
        map.on('click', 'neighborhood-fill', (e) => {
          const f = e.features?.[0];
          if (!f) return;

          // toggle selection state
          if (selectedId !== null) {
            map.setFeatureState({ source: 'neighborhoods', id: selectedId }, { selected: false });
          }
          selectedId = f.id as number | string;
          map.setFeatureState({ source: 'neighborhoods', id: selectedId }, { selected: true });

          // fit to clicked neighborhood
          const b = featureBounds(f);
          map.fitBounds(expandBounds(b, 0.005), {
            padding: 36,
            duration: 700,
            maxZoom: 16,
          });
        });

        // Initial fit to all neighborhoods
        const allPolys = (neighborhoods.features ?? [])
          .flatMap((feat: any) => {
            const g = feat.geometry;
            if (g?.type === 'Polygon') return g.coordinates.flat(1);
            if (g?.type === 'MultiPolygon') return g.coordinates.flat(2);
            return [];
          });
        if (allPolys.length) {
          const start = allPolys[0] as [number, number];
          const bounds = allPolys.reduce(
            (b: mapboxgl.LngLatBounds, c: number[]) => b.extend(c as [number, number]),
            new mapboxgl.LngLatBounds(start, start)
          );
          map.fitBounds(expandBounds(bounds, 0.01), { padding: 24 });
        }

        setIsLoading(false);
      } catch (err) {
        console.error(err);
        setIsLoading(false);
      }
    });

    return () => map.remove();
  }, [aqiData]); // Add aqiData as dependency so map updates when AQI data changes

  return (
    <div className="relative w-full h-[600px] rounded-lg overflow-hidden shadow-lg border border-gray-200 bg-white">
      {(isLoading || isLoadingAQI) && (
        <div className="absolute inset-0 bg-gray-50 flex items-center justify-center z-10">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-4 relative">
              <div className="absolute inset-0 rounded-full border-4 border-blue-200"></div>
              <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
            </div>
            <div className="bg-white px-6 py-3 rounded-lg shadow-sm border border-gray-200">
              <p className="text-gray-700 font-medium">Loading Boston Map...</p>
              <p className="text-gray-500 text-sm mt-1">Preparing environmental data</p>
            </div>
          </div>
        </div>
      )}
      <div ref={mapContainer} className="w-full h-full" />
      
      {/* Map Legend */}
      <div className="absolute top-4 right-4 z-10">
        <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-200">
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Good (0-50)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span>Moderate (51-100)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              <span>Unhealthy (101-150)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span>Very Unhealthy (150+)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}