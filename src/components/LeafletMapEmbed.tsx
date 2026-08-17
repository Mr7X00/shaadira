import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import { 
  MapPin, 
  Navigation, 
  Clock, 
  Compass, 
  Sparkles, 
  Play, 
  Pause, 
  RotateCcw, 
  AlertCircle,
  HelpCircle
} from "lucide-react";

interface LeafletMapEmbedProps {
  clientAddress: string;
  artistAddress?: string;
  artistName?: string;
  artistAvatar?: string;
  bookingStatus?: string;
  onArrived?: () => void;
}

export default function LeafletMapEmbed({
  clientAddress,
  artistAddress = "Flat 402, Royal Residency, Juhu, Mumbai, Maharashtra 400049",
  artistName = "Artist",
  artistAvatar = "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&h=150&q=80",
  bookingStatus = "CONFIRMED",
  onArrived
}: LeafletMapEmbedProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const artistMarkerRef = useRef<L.Marker | null>(null);
  const routePolylineRef = useRef<L.Polyline | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Geographic coordinates
  const [clientCoords, setClientCoords] = useState<[number, number]>([19.0760, 72.8777]);
  const [artistCoords, setArtistCoords] = useState<[number, number]>([19.0968, 72.8264]);
  const [routePath, setRoutePath] = useState<[number, number][]>([]);
  
  // Navigation Info
  const [distance, setDistance] = useState<number>(0);
  const [eta, setEta] = useState<number>(0);
  const [isRealData, setIsRealData] = useState(false);

  // Live Tracking Simulation States
  const [simulating, setSimulating] = useState(false);
  const [simIndex, setSimIndex] = useState(0);
  const [simSpeed, setSimSpeed] = useState(1); // steps per tick
  const [currentArtistPos, setCurrentArtistPos] = useState<[number, number] | null>(null);
  const [simComplete, setSimComplete] = useState(false);

  // 1. Fetch Geocoding and Routing on Mount / Parameters Change
  useEffect(() => {
    let active = true;

    async function loadMapData() {
      setLoading(true);
      setError(null);
      try {
        // Geocode Client Address
        const clientRes = await fetch(`/api/maps/geocode?address=${encodeURIComponent(clientAddress)}`);
        const clientData = await clientRes.json();
        
        // Geocode Artist Address
        const artistRes = await fetch(`/api/maps/geocode?address=${encodeURIComponent(artistAddress)}`);
        const artistData = await artistRes.json();

        if (!active) return;

        const cCoords: [number, number] = [clientData.latitude, clientData.longitude];
        const aCoords: [number, number] = [artistData.latitude, artistData.longitude];

        setClientCoords(cCoords);
        setArtistCoords(aCoords);
        setCurrentArtistPos(aCoords);

        // Fetch Routing from OpenRouteService proxy
        const routeRes = await fetch(
          `/api/maps/route?startLat=${aCoords[0]}&startLng=${aCoords[1]}&endLat=${cCoords[0]}&endLng=${cCoords[1]}`
        );
        const routeData = await routeRes.json();

        if (!active) return;

        setRoutePath(routeData.coordinates);
        setDistance(routeData.distanceKm);
        setEta(routeData.durationMins);
        setIsRealData(routeData.real || clientData.real || artistData.real);
        setSimIndex(0);
        setSimComplete(false);
      } catch (err) {
        console.error("Failed loading map route data:", err);
        setError("Error rendering premium map route.");
      } finally {
        if (active) setLoading(false);
      }
    }

    loadMapData();

    return () => {
      active = false;
    };
  }, [clientAddress, artistAddress]);

  // 2. Initialize and Manage Leaflet Map Instance
  useEffect(() => {
    if (loading || error || !mapContainerRef.current) return;

    // Reset previous instance
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const defaultCenter = [
      (artistCoords[0] + clientCoords[0]) / 2,
      (artistCoords[1] + clientCoords[1]) / 2
    ] as [number, number];

    // Initialize Leaflet Map
    const map = L.map(mapContainerRef.current, {
      center: defaultCenter as L.LatLngExpression,
      zoom: 12,
      zoomControl: true,
      scrollWheelZoom: false
    });

    mapInstanceRef.current = map;

    // Add OpenStreetMap raster tiles
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '© <a href="https://openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Custom Client Pin Icon
    const clientHtml = `
      <div class="relative flex items-center justify-center">
        <div class="absolute w-8 h-8 rounded-full bg-rose-500/30 animate-ping"></div>
        <div class="w-10 h-10 rounded-full bg-rose-600 border-2 border-white shadow-lg flex items-center justify-center text-white relative z-10">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
        </div>
      </div>
    `;
    const clientIcon = L.divIcon({
      html: clientHtml,
      className: "custom-leaflet-marker",
      iconSize: [40, 40],
      iconAnchor: [20, 20]
    });

    // Add Client Marker
    L.marker(clientCoords as L.LatLngExpression, { icon: clientIcon })
      .addTo(map)
      .bindPopup(`
        <div class="font-sans text-xs p-1">
          <strong class="text-slate-800">Event Venue</strong>
          <p class="text-[10px] text-slate-500 mt-0.5 leading-tight">${clientAddress}</p>
        </div>
      `);

    // Custom Artist Marker HTML (Using Avatar Photo)
    const artistHtml = `
      <div class="relative flex items-center justify-center" id="live-artist-marker-bubble">
        <div class="absolute w-9 h-9 rounded-full bg-blue-500/40 animate-pulse"></div>
        <div class="w-11 h-11 rounded-full bg-blue-600 border-[3px] border-white shadow-xl overflow-hidden relative z-10">
          <img src="${artistAvatar}" alt="${artistName}" class="w-full h-full object-cover" />
        </div>
        <div class="absolute -top-1 -right-1 bg-amber-500 text-[8px] font-bold text-white px-1 py-0.5 rounded-full shadow border border-white">
          Nav
        </div>
      </div>
    `;
    const artistIcon = L.divIcon({
      html: artistHtml,
      className: "custom-leaflet-marker",
      iconSize: [44, 44],
      iconAnchor: [22, 22]
    });

    // Add Artist Marker
    const initialPos = currentArtistPos || artistCoords;
    const artistMarker = L.marker(initialPos as L.LatLngExpression, { icon: artistIcon }).addTo(map);
    artistMarkerRef.current = artistMarker;

    artistMarker.bindPopup(`
      <div class="font-sans text-xs p-1">
        <strong class="text-blue-700">${artistName} (Live GPS)</strong>
        <p class="text-[10px] text-slate-500 mt-0.5">En route to your celebration!</p>
      </div>
    `);

    // Add Route Polyline
    if (routePath.length > 0) {
      const polyline = L.polyline(routePath, {
        color: "#3B82F6",
        weight: 5,
        opacity: 0.85,
        dashArray: "2, 8", // Elegant dashed pattern to represent path
        lineJoin: "round"
      }).addTo(map);
      routePolylineRef.current = polyline;

      // Fit map boundary with smooth padding
      map.fitBounds(polyline.getBounds(), {
        padding: [40, 40]
      });
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [loading, error]);

  // 3. Live Simulation Ticking Handler
  useEffect(() => {
    if (!simulating || routePath.length === 0) return;

    const interval = setInterval(() => {
      setSimIndex((prevIdx) => {
        const nextIdx = prevIdx + simSpeed;
        if (nextIdx >= routePath.length - 1) {
          clearInterval(interval);
          setSimulating(false);
          setSimComplete(true);
          
          const finalPos = routePath[routePath.length - 1];
          setCurrentArtistPos(finalPos);
          if (artistMarkerRef.current) {
            artistMarkerRef.current.setLatLng(finalPos);
          }
          if (onArrived) {
            onArrived();
          }
          return routePath.length - 1;
        }

        const currentPos = routePath[nextIdx];
        setCurrentArtistPos(currentPos);
        if (artistMarkerRef.current) {
          artistMarkerRef.current.setLatLng(currentPos);
        }

        // recalculate proportional ETA and distance
        const ratioLeft = 1 - nextIdx / (routePath.length - 1);
        setDistance(parseFloat((distance * ratioLeft).toFixed(2)));
        setEta(Math.round(eta * ratioLeft));

        // Pan map smoothly to stay centered on traveling artist
        if (mapInstanceRef.current) {
          mapInstanceRef.current.panTo(currentPos, { animate: true, duration: 0.2 });
        }

        return nextIdx;
      });
    }, 1200 / simSpeed);

    return () => clearInterval(interval);
  }, [simulating, routePath, simSpeed]);

  // Reset tracking simulation back to initial state
  const handleResetSimulation = () => {
    setSimulating(false);
    setSimIndex(0);
    setSimComplete(false);
    setCurrentArtistPos(artistCoords);
    if (artistMarkerRef.current) {
      artistMarkerRef.current.setLatLng(artistCoords);
    }
    
    // reload initial distance & eta estimation
    const reloadData = async () => {
      try {
        const routeRes = await fetch(
          `/api/maps/route?startLat=${artistCoords[0]}&startLng=${artistCoords[1]}&endLat=${clientCoords[0]}&endLng=${clientCoords[1]}`
        );
        const routeData = await routeRes.json();
        setDistance(routeData.distanceKm);
        setEta(routeData.durationMins);
      } catch (err) {
        console.error("Failed resetting distance and route calculation:", err);
      }
    };
    reloadData();

    if (mapInstanceRef.current && routePolylineRef.current) {
      mapInstanceRef.current.fitBounds(routePolylineRef.current.getBounds(), { padding: [40, 40] });
    }
  };

  if (loading) {
    return (
      <div className="bg-white border border-slate-200 rounded-3xl p-8 flex flex-col items-center justify-center text-center space-y-3 min-h-[360px] shadow-sm font-sans">
        <div className="w-12 h-12 rounded-full border-4 border-blue-100 border-t-blue-600 animate-spin" />
        <span className="text-sm font-bold text-slate-700">Connecting to Live Navigation Engine...</span>
        <span className="text-[11px] text-slate-400">Requesting Geoapify and OpenRouteService assets...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-rose-50/50 border border-rose-200 rounded-3xl p-6 text-center space-y-3 min-h-[200px] flex flex-col items-center justify-center font-sans">
        <AlertCircle className="w-10 h-10 text-rose-600 animate-bounce" />
        <h4 className="text-xs font-bold text-rose-950 uppercase tracking-wider">Map Load Failure</h4>
        <p className="text-[11px] text-rose-700 leading-relaxed max-w-sm">
          {error} Ensure your coordinates are set properly. Check internet connectivity.
        </p>
      </div>
    );
  }

  // Calculate current progress percentage
  const progressPercent = routePath.length > 0 
    ? Math.round((simIndex / (routePath.length - 1)) * 100) 
    : 0;

  return (
    <div className="bg-white border border-slate-200 rounded-[28px] overflow-hidden shadow-lg font-sans flex flex-col md:flex-row min-h-[400px]">
      
      {/* 1. Left side: Leaflet Map Render Area (Responsive) */}
      <div className="flex-1 min-h-[280px] md:min-h-[400px] relative" id="leaflet-map-stage-outer">
        <div ref={mapContainerRef} className="w-full h-full" style={{ position: "absolute", inset: 0 }} />
        
        {/* Floating Coordinates indicator */}
        <div className="absolute top-3 left-3 z-[1000] bg-slate-900/95 backdrop-blur text-white py-1.5 px-3 rounded-xl border border-slate-800 text-[10px] font-mono shadow-md flex items-center gap-2">
          <Compass className="w-3.5 h-3.5 text-blue-400 animate-spin-slow" />
          <span>
            {currentArtistPos ? `${currentArtistPos[0].toFixed(5)}, ${currentArtistPos[1].toFixed(5)}` : "Tracking active..."}
          </span>
        </div>

        {/* Floating Data source indicator */}
        <div className="absolute top-3 right-3 z-[1000] bg-white/95 backdrop-blur text-slate-700 py-1.5 px-3 rounded-xl border border-slate-200 text-[10px] font-semibold shadow-md flex items-center gap-1.5">
          <div className={`w-2 h-2 rounded-full ${isRealData ? "bg-emerald-500" : "bg-amber-500"}`} />
          <span>{isRealData ? "Live OSM & Geoapify API" : "Simulated Path"}</span>
        </div>
      </div>

      {/* 2. Right side: GPS Navigation Control Panel (Beautiful Glass Panel) */}
      <div className="w-full md:w-[320px] bg-slate-50 border-t md:border-t-0 md:border-l border-slate-200 p-5 flex flex-col justify-between">
        <div className="space-y-4">
          
          {/* Header */}
          <div className="border-b border-slate-200 pb-3">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-widest flex items-center gap-1.5">
              <Navigation className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
              <span>Premium GPS Control</span>
            </h4>
            <p className="text-[10px] text-slate-400 mt-1">Live tracking of artist arrival parameters</p>
          </div>

          {/* Navigation KPI metrics */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-white border border-slate-200 p-3 rounded-2xl shadow-sm text-center">
              <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">Distance</span>
              <span className="text-lg font-display font-bold text-slate-800">
                {distance > 0 ? `${distance} km` : simComplete ? "Arrived" : "Near"}
              </span>
            </div>
            <div className="bg-white border border-slate-200 p-3 rounded-2xl shadow-sm text-center">
              <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">ETA Duration</span>
              <span className="text-lg font-display font-bold text-blue-600 flex items-center justify-center gap-1">
                <Clock className="w-4 h-4 text-blue-500" />
                <span>{eta > 0 ? `${eta}m` : simComplete ? "0m" : "1m"}</span>
              </span>
            </div>
          </div>

          {/* Info Card */}
          <div className="bg-blue-50 border border-blue-100 p-3.5 rounded-2xl text-xs text-blue-900 leading-relaxed relative overflow-hidden">
            <div className="absolute right-1 bottom-1 opacity-10">
              <Sparkles className="w-12 h-12 text-blue-900" />
            </div>
            <strong className="block text-blue-950 font-bold mb-0.5">En Route updates</strong>
            <span className="text-[11px] text-blue-800">
              {simComplete 
                ? "✓ Service specialist has arrived. Standard geofence entry clearance is verified!" 
                : simulating 
                ? `Specialist is driving towards your event address. Coordinates updating dynamically.` 
                : "Navigation locked. Press play to simulate the live transit on the street network!"
              }
            </span>
          </div>

          {/* Progress visualizer bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-[10px] font-bold text-slate-500">
              <span>Transit Progress</span>
              <span>{progressPercent}%</span>
            </div>
            <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-600 transition-all duration-300 rounded-full" 
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Live Controller Buttons */}
        <div className="space-y-2 mt-5 md:mt-0">
          <div className="flex gap-2">
            {!simulating ? (
              <button
                onClick={() => setSimulating(true)}
                disabled={simComplete}
                className={`flex-1 py-2 rounded-xl text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow transition-all ${
                  simComplete 
                    ? "bg-emerald-600 cursor-not-allowed opacity-80" 
                    : "bg-blue-600 hover:bg-blue-700 active:scale-[0.98] cursor-pointer"
                }`}
              >
                <Play className="w-3.5 h-3.5" />
                <span>{simComplete ? "Arrived" : "Simulate Live"}</span>
              </button>
            ) : (
              <button
                onClick={() => setSimulating(false)}
                className="flex-1 py-2 bg-amber-500 hover:bg-amber-600 active:scale-[0.98] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow transition-all cursor-pointer"
              >
                <Pause className="w-3.5 h-3.5" />
                <span>Pause GPS</span>
              </button>
            )}

            <button
              onClick={handleResetSimulation}
              className="px-3.5 py-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-600 active:scale-[0.98] transition-all cursor-pointer shadow-sm"
              title="Reset Simulation"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Speed multiplier selector */}
          {simulating && (
            <div className="flex items-center justify-between bg-slate-100 rounded-xl p-2 text-[10px] font-bold text-slate-500 border border-slate-200">
              <span>Simulated Speed</span>
              <div className="flex gap-1">
                {[1, 2, 4].map((speed) => (
                  <button
                    key={speed}
                    onClick={() => setSimSpeed(speed)}
                    className={`px-2 py-0.5 rounded ${
                      simSpeed === speed 
                        ? "bg-blue-600 text-white" 
                        : "bg-white text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {speed}x
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="text-[9px] text-slate-400 text-center flex items-center justify-center gap-1">
            <HelpCircle className="w-3 h-3" />
            <span>Leaflet + OSM dynamic tracking frame</span>
          </div>
        </div>

      </div>
    </div>
  );
}
