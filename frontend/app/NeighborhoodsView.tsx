'use client';

import React, { useEffect, useState } from 'react';
import { collection, getDocs, orderBy, query, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface EnvironmentalData {
  air_quality: {
    pm25: number;
    pm10: number;
    o3: number;
    no2: number;
    so2: number;
    co: number;
    aqi: number;
    last_updated: string;
  };
  water_quality: {
    ph: number;
    turbidity: number;
    dissolved_oxygen: number;
    bacteria_count: number;
    lead_level: number;
    chlorine_residual: number;
    last_updated: string;
  };
  environmental_hazards: {
    noise_level: number;
    traffic_density: number;
    industrial_proximity: number;
    green_space_percentage: number;
    flood_risk: number;
    heat_island_effect: number;
    last_updated: string;
  };
  overall_score: number;
  last_updated: string;
}

interface Neighborhood {
  id: string;
  name: string;
  environmental_data: EnvironmentalData;
  metadata: {
    migrated_at: string;
    data_source: string;
    neighborhood_id: string;
  };
}

export default function NeighborhoodsView() {
  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<Neighborhood | null>(null);

  // Backend API URL
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  useEffect(() => {
    fetchNeighborhoodsWithAQI();
  }, []);

  const fetchNeighborhoodsWithAQI = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch neighborhoods with real-time AQI data from your backend
      const response = await fetch(`${API_BASE_URL}/neighborhoods/with-aqi`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setNeighborhoods(data.neighborhoods || []);
      
    } catch (err: any) {
      console.error('Error fetching neighborhoods with AQI:', err);
      setError(err.message || 'Failed to fetch neighborhoods with AQI data');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-100';
    if (score >= 80) return 'text-blue-600 bg-blue-100';
    if (score >= 70) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getAQIColor = (aqi: number) => {
    if (aqi <= 50) return 'text-green-600';
    if (aqi <= 100) return 'text-yellow-600';
    if (aqi <= 150) return 'text-orange-600';
    return 'text-red-600';
  };

  const getAQICategory = (aqi: number) => {
    if (aqi <= 50) return 'Good';
    if (aqi <= 100) return 'Moderate';
    if (aqi <= 150) return 'Unhealthy for Sensitive Groups';
    if (aqi <= 200) return 'Unhealthy';
    if (aqi <= 300) return 'Very Unhealthy';
    return 'Hazardous';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 relative">
            <div className="absolute inset-0 rounded-full border-4 border-blue-200"></div>
            <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
          </div>
          <div className="bg-white px-6 py-3 rounded-lg shadow-sm border border-gray-200">
            <p className="text-gray-700 font-medium">Loading Environmental Data...</p>
            <p className="text-gray-500 text-sm mt-1">Fetching real-time AQI information</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg shadow-sm">
        <div className="flex items-center space-x-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="font-medium">Error: {error}</span>
        </div>
        <button 
          onClick={fetchNeighborhoodsWithAQI}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Boston Neighborhoods Environmental Data</h2>
        <p className="text-gray-600">Real-time environmental monitoring and analysis for each neighborhood</p>
        <div className="mt-4 flex justify-center">
          <button
            onClick={fetchNeighborhoodsWithAQI}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Refresh Data</span>
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Neighborhoods List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-blue-600 px-6 py-4">
              <h3 className="text-lg font-semibold text-white flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                Neighborhoods by Score
              </h3>
              <p className="text-blue-100 text-sm mt-1">Click to view detailed metrics</p>
            </div>
            
            <div className="max-h-[500px] overflow-y-auto p-4 space-y-3">
              {neighborhoods.map((neighborhood, index) => (
                <div
                  key={neighborhood.id}
                  className={`p-4 rounded-lg cursor-pointer transition-all duration-200 border ${
                    selectedNeighborhood?.id === neighborhood.id
                      ? 'border-blue-500 bg-blue-50 shadow-sm'
                      : 'border-gray-200 hover:border-blue-300 hover:shadow-sm'
                  }`}
                  onClick={() => setSelectedNeighborhood(neighborhood)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white font-bold text-xs ${
                        index < 3 ? 'bg-yellow-500' : 'bg-gray-400'
                      }`}>
                        {index + 1}
                      </div>
                      <h4 className="font-medium text-gray-900">
                        {neighborhood.name}
                      </h4>
                    </div>
                    <div className={`px-2 py-1 rounded text-xs font-medium ${getScoreColor(neighborhood.environmental_data.overall_score)}`}>
                      {neighborhood.environmental_data.overall_score.toFixed(1)}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-1">
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-gray-600">AQI:</span>
                      <span className={`font-medium ${getAQIColor(neighborhood.environmental_data.air_quality.aqi)}`}>
                        {neighborhood.environmental_data.air_quality.aqi}
                      </span>
                    </div>
                    <div className="text-gray-500 text-xs">
                      {neighborhood.environmental_data.environmental_hazards.green_space_percentage}% green
                    </div>
                  </div>
                  
                  {/* Real-time AQI indicator */}
                  <div className="mt-2 text-xs text-gray-500">
                    <span className="inline-flex items-center">
                      <div className={`w-2 h-2 rounded-full mr-1 ${
                        neighborhood.environmental_data.air_quality.aqi <= 50 ? 'bg-green-500' :
                        neighborhood.environmental_data.air_quality.aqi <= 100 ? 'bg-yellow-500' :
                        neighborhood.environmental_data.air_quality.aqi <= 150 ? 'bg-orange-500' : 'bg-red-500'
                      }`}></div>
                      {getAQICategory(neighborhood.environmental_data.air_quality.aqi)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Selected Neighborhood Details */}
        <div className="lg:col-span-2">
          {selectedNeighborhood ? (
            <div className="space-y-6">
              {/* Neighborhood Header */}
              <div className="bg-blue-600 rounded-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold mb-1">{selectedNeighborhood.name}</h3>
                    <p className="text-blue-100">Environmental Analysis & Real-time Monitoring</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">{selectedNeighborhood.environmental_data.overall_score.toFixed(1)}</div>
                    <div className="text-blue-100 text-sm">Overall Score</div>
                  </div>
                </div>
              </div>

              {/* Real-time AQI Alert */}
              <div className={`p-4 rounded-lg border-l-4 ${
                selectedNeighborhood.environmental_data.air_quality.aqi <= 50 ? 'bg-green-50 border-green-400' :
                selectedNeighborhood.environmental_data.air_quality.aqi <= 100 ? 'bg-yellow-50 border-yellow-400' :
                selectedNeighborhood.environmental_data.air_quality.aqi <= 150 ? 'bg-orange-50 border-orange-400' : 'bg-red-50 border-red-400'
              }`}>
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className={`w-5 h-5 ${
                      selectedNeighborhood.environmental_data.air_quality.aqi <= 50 ? 'text-green-400' :
                      selectedNeighborhood.environmental_data.air_quality.aqi <= 100 ? 'text-yellow-400' :
                      selectedNeighborhood.environmental_data.air_quality.aqi <= 150 ? 'text-orange-400' : 'text-red-400'
                    }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h4 className={`text-sm font-medium ${
                      selectedNeighborhood.environmental_data.air_quality.aqi <= 50 ? 'text-green-800' :
                      selectedNeighborhood.environmental_data.air_quality.aqi <= 100 ? 'text-yellow-800' :
                      selectedNeighborhood.environmental_data.air_quality.aqi <= 150 ? 'text-orange-800' : 'text-red-800'
                    }`}>
                      Current Air Quality: {getAQICategory(selectedNeighborhood.environmental_data.air_quality.aqi)}
                    </h4>
                    <p className={`text-sm ${
                      selectedNeighborhood.environmental_data.air_quality.aqi <= 50 ? 'text-green-700' :
                      selectedNeighborhood.environmental_data.air_quality.aqi <= 100 ? 'text-yellow-700' :
                      selectedNeighborhood.environmental_data.air_quality.aqi <= 150 ? 'text-orange-700' : 'text-red-700'
                    }`}>
                      AQI: {selectedNeighborhood.environmental_data.air_quality.aqi} | 
                      Last updated: {new Date(selectedNeighborhood.environmental_data.air_quality.last_updated).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Air Quality Card */}
                <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                  <div className="flex items-center mb-3">
                    <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center mr-3">
                      <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Air Quality (Real-time)</h4>
                      <p className="text-xs text-gray-600">Live atmospheric conditions</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">AQI</span>
                      <span className={`font-bold text-lg ${getAQIColor(selectedNeighborhood.environmental_data.air_quality.aqi)}`}>
                        {selectedNeighborhood.environmental_data.air_quality.aqi}
                      </span>
                    </div>
                    <div className="text-xs text-gray-600 mb-2">
                      {getAQICategory(selectedNeighborhood.environmental_data.air_quality.aqi)}
                    </div>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-600">PM2.5</span>
                        <span className="font-medium">{selectedNeighborhood.environmental_data.air_quality.pm25} μg/m³</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">PM10</span>
                        <span className="font-medium">{selectedNeighborhood.environmental_data.air_quality.pm10} μg/m³</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Ozone</span>
                        <span className="font-medium">{selectedNeighborhood.environmental_data.air_quality.o3} ppm</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">NO₂</span>
                        <span className="font-medium">{selectedNeighborhood.environmental_data.air_quality.no2} ppm</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Water Quality Card */}
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <div className="flex items-center mb-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Water Quality</h4>
                      <p className="text-xs text-gray-600">Water system health</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">pH Level</span>
                      <span className="font-bold text-blue-600">
                        {selectedNeighborhood.environmental_data.water_quality.ph}
                      </span>
                    </div>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Turbidity</span>
                        <span className="font-medium">{selectedNeighborhood.environmental_data.water_quality.turbidity} NTU</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Dissolved O₂</span>
                        <span className="font-medium">{selectedNeighborhood.environmental_data.water_quality.dissolved_oxygen} mg/L</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Bacteria</span>
                        <span className="font-medium">{selectedNeighborhood.environmental_data.water_quality.bacteria_count} CFU/100mL</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Lead</span>
                        <span className="font-medium">{selectedNeighborhood.environmental_data.water_quality.lead_level} mg/L</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Environmental Hazards Card */}
                <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                  <div className="flex items-center mb-3">
                    <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center mr-3">
                      <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Hazards & Risks</h4>
                      <p className="text-xs text-gray-600">Environmental factors</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Green Space</span>
                      <span className="font-bold text-green-600">
                        {selectedNeighborhood.environmental_data.environmental_hazards.green_space_percentage}%
                      </span>
                    </div>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Noise Level</span>
                        <span className="font-medium">{selectedNeighborhood.environmental_data.environmental_hazards.noise_level} dB</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Traffic Density</span>
                        <span className="font-medium">{selectedNeighborhood.environmental_data.environmental_hazards.traffic_density}/10</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Flood Risk</span>
                        <span className="font-medium">{selectedNeighborhood.environmental_data.environmental_hazards.flood_risk}/10</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Heat Island</span>
                        <span className="font-medium">{selectedNeighborhood.environmental_data.environmental_hazards.heat_island_effect}/10</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a Neighborhood</h3>
              <p className="text-gray-600">Choose a neighborhood from the list to view detailed environmental data and real-time AQI metrics</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}