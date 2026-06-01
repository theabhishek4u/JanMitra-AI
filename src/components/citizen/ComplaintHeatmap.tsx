"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getComplaints } from "@/lib/complaints";
import type { Complaint } from "@/types";
import {
  Search,
  MapPin,
  AlertTriangle,
  Building2,
  SlidersHorizontal,
  Activity,
  ShieldCheck,
  Zap,
  Sparkles,
  Info
} from "lucide-react";

// Standard Lucknow Coordinates
const LUCKNOW_CENTER: [number, number] = [26.8467, 80.9462];

export default function ComplaintHeatmap({
  onSelectComplaint,
}: {
  onSelectComplaint?: (id: string) => void;
}) {
  const [mounted, setMounted] = useState(false);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedPriority, setSelectedPriority] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    setMounted(true);
    setComplaints(getComplaints());
  }, []);

  if (!mounted) {
    return (
      <div className="h-[520px] w-full bg-card/45 border border-border/20 animate-pulse rounded-2xl flex flex-col items-center justify-center text-muted-foreground">
        <LoaderComponent />
        <span className="text-sm font-bold mt-3 text-muted-foreground/80 tracking-wider">LOADING LUCKNOW DARK GRID MAP...</span>
      </div>
    );
  }

  // Filter complaints
  const filteredComplaints = complaints.filter((c) => {
    const matchesSearch =
      c.id.toLowerCase().includes(search.toLowerCase()) ||
      c.area.toLowerCase().includes(search.toLowerCase()) ||
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      (c.titleHi && c.titleHi.includes(search));

    const matchesCategory = selectedCategory === "all" || c.category === selectedCategory;
    const matchesPriority = selectedPriority === "all" || c.priority === selectedPriority;

    return matchesSearch && matchesCategory && matchesPriority;
  });

  const getPriorityColor = (priority: string) => {
    if (priority === "high") return "#EF4444"; // Red
    if (priority === "medium") return "#F59E0B"; // Amber
    return "#10B981"; // Green
  };

  // Get distinct categories
  const categories = Array.from(new Set(complaints.map((c) => c.category)));

  // Statistics for the map view
  const activeCount = filteredComplaints.length;
  const highPriorityCount = filteredComplaints.filter((c) => c.priority === "high").length;
  const hotspotCount = filteredComplaints.filter((c) => c.isHotspot).length;

  return (
    <div className="relative w-full h-full min-h-[480px] rounded-2xl border border-border/30 overflow-hidden shadow-2xl bg-slate-950">
      {/* CartoDB Dark Heatmap Canvas */}
      <MapContainer
        center={LUCKNOW_CENTER}
        zoom={13}
        style={{ height: "100%", width: "100%" }}
        className="z-10"
        zoomControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
        />

        {filteredComplaints.map((c) => {
          const markerColor = getPriorityColor(c.priority);
          const lat = c.latitude || LUCKNOW_CENTER[0];
          const lng = c.longitude || LUCKNOW_CENTER[1];

          return (
            <CircleMarker
              key={c.id}
              center={[lat, lng]}
              radius={c.priority === "high" ? 13 : c.isHotspot ? 15 : 9}
              fillColor={markerColor}
              color={markerColor}
              weight={c.isHotspot ? 3 : 1.5}
              opacity={0.85}
              fillOpacity={c.priority === "high" ? 0.35 : 0.2}
            >
              <Popup closeButton={false} className="custom-leaflet-popup">
                <div className="p-3.5 space-y-3 max-w-[280px] bg-slate-950/95 text-white rounded-2xl border border-white/10 backdrop-blur-xl shadow-2xl relative overflow-hidden">
                  {/* Glowing background hint */}
                  <div
                    className="absolute -right-12 -bottom-12 w-24 h-24 rounded-full filter blur-xl opacity-10 pointer-events-none"
                    style={{ backgroundColor: markerColor }}
                  />

                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[10px] font-bold text-gray-400 bg-white/5 border border-white/10 px-1.5 py-0.5 rounded">
                      {c.id}
                    </span>
                    <Badge className={`priority-${c.priority} text-[9px] px-2 py-0.5 font-bold uppercase`}>
                      {c.priority}
                    </Badge>
                  </div>

                  <div>
                    <h4 className="font-extrabold text-sm text-white leading-snug tracking-tight">
                      {c.title}
                    </h4>
                    <p className="text-xs text-gray-400 mt-1 flex items-center gap-1 font-semibold">
                      <MapPin className="w-3.5 h-3.5 text-primary-foreground/75" />
                      {c.area}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[10px] bg-white/3 p-2.5 rounded-xl border border-white/5">
                    <div>
                      <span className="text-gray-400 block font-bold tracking-wider">DEPARTMENT</span>
                      <span className="font-extrabold flex items-center gap-0.5 mt-0.5 text-gray-200">
                        <Building2 className="w-3 h-3 text-gov-blue-light" />
                        {c.department.replace("Department", "Dept")}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400 block font-bold tracking-wider">STATUS</span>
                      <span className="font-extrabold block mt-0.5 capitalize text-warning-amber">
                        {c.status.replace(/_/g, " ")}
                      </span>
                    </div>
                  </div>

                  {c.aiSummary && (
                    <p className="text-[10px] text-gray-400 leading-relaxed italic border-t border-white/5 pt-2 flex items-start gap-1">
                      <Zap className="w-3.5 h-3.5 text-ai-purple shrink-0 mt-0.5 animate-pulse" />
                      <span>{c.aiSummary}</span>
                    </p>
                  )}

                  {onSelectComplaint && (
                    <Button
                      size="sm"
                      onClick={() => onSelectComplaint(c.id)}
                      className="w-full text-xs h-8.5 rounded-xl bg-linear-to-r from-gov-blue via-primary to-ai-purple text-white font-extrabold cursor-pointer border-0 shadow-md shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all mt-1"
                    >
                      <Sparkles className="w-3.5 h-3.5 mr-1" />
                      Inspect Detail
                    </Button>
                  )}
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>

      {/* Floating Tactical Panel (Search & Dynamic Filter Trigger) */}
      <div className="absolute top-4 left-4 z-20 w-[280px] sm:w-[320px] transition-all duration-300">
        <div className="glass-premium rounded-2xl p-3 border border-white/10 shadow-2xl flex flex-col gap-2.5 backdrop-blur-xl bg-slate-950/80">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search Gomti Nagar, ID, issue..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9.5 pr-8 h-9 border border-white/10 rounded-xl bg-white/4 text-xs focus-visible:ring-offset-0 focus-visible:ring-1 focus-visible:ring-primary/45 placeholder:text-muted-foreground/60 text-white font-semibold"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground hover:text-white transition-colors cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className={`flex-1 text-[11px] h-8 rounded-xl font-bold transition-all border cursor-pointer ${
                showFilters || selectedCategory !== "all" || selectedPriority !== "all"
                  ? "bg-primary/20 text-primary border-primary/40"
                  : "bg-white/2 border-white/10 text-gray-300 hover:text-white"
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5 mr-1.5" />
              Tactical Filters
              {(selectedCategory !== "all" || selectedPriority !== "all") && (
                <span className="ml-1 w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              )}
            </Button>

            {(selectedCategory !== "all" || selectedPriority !== "all" || search) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedCategory("all");
                  setSelectedPriority("all");
                  setSearch("");
                }}
                className="text-[11px] h-8 px-2.5 rounded-xl border border-white/10 bg-white/1 hover:bg-white/5 text-muted-foreground hover:text-white cursor-pointer font-semibold transition-all"
              >
                Reset
              </Button>
            )}
          </div>

          {/* Expandable Filter Sliders block */}
          {showFilters && (
            <div className="pt-2 border-t border-white/5 space-y-2.5 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider block">Grievance Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full h-8.5 border border-white/10 rounded-xl bg-slate-900/90 text-gray-200 px-2.5 text-[11px] focus:outline-none focus:ring-1 focus:ring-primary/45 font-semibold cursor-pointer"
                >
                  <option value="all">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider block">Threat Priority Level</label>
                <div className="grid grid-cols-4 gap-1">
                  {[
                    { value: "all", label: "All" },
                    { value: "high", label: "High", color: "hover:border-danger-red/40" },
                    { value: "medium", label: "Med", color: "hover:border-warning-amber/40" },
                    { value: "low", label: "Low", color: "hover:border-trust-green/40" },
                  ].map((p) => (
                    <button
                      key={p.value}
                      onClick={() => setSelectedPriority(p.value)}
                      className={`text-[10px] py-1 rounded-lg border font-bold capitalize transition-all cursor-pointer ${
                        selectedPriority === p.value
                          ? p.value === "high"
                            ? "bg-danger-red/10 border-danger-red/40 text-danger-red shadow-sm shadow-danger-red/10"
                            : p.value === "medium"
                            ? "bg-warning-amber/10 border-warning-amber/40 text-warning-amber shadow-sm shadow-warning-amber/10"
                            : p.value === "low"
                            ? "bg-trust-green/10 border-trust-green/40 text-trust-green shadow-sm shadow-trust-green/10"
                            : "bg-primary/10 border-primary/45 text-primary"
                          : "bg-white/1 border-white/5 text-gray-400 hover:text-white"
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Floating Interactive Live Stats HUD overlay (Top-Right) */}
      <div className="absolute top-4 right-4 z-20">
        <div className="glass-premium rounded-2xl p-3 border border-white/10 shadow-2xl flex flex-col gap-2.5 backdrop-blur-xl bg-slate-950/80 min-w-[170px]">
          <div className="flex items-center justify-between pb-1.5 border-b border-white/5">
            <span className="text-[9px] font-extrabold text-muted-foreground uppercase tracking-widest flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-trust-green rounded-full animate-ping" />
              LIVE TELEMETRY
            </span>
            <Badge variant="outline" className="h-4.5 text-[8px] bg-white/5 border-white/10 text-white font-mono px-1">
              ACTIVE
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="bg-white/2 border border-white/5 rounded-xl p-1.5">
              <span className="text-lg font-black text-white leading-none block">
                {activeCount}
              </span>
              <span className="text-[8px] font-extrabold text-muted-foreground uppercase mt-0.5 block">
                GRID TICKETS
              </span>
            </div>

            <div className="bg-white/2 border border-white/5 rounded-xl p-1.5">
              <span className={`text-lg font-black leading-none block ${highPriorityCount > 0 ? "text-danger-red" : "text-white"}`}>
                {highPriorityCount}
              </span>
              <span className="text-[8px] font-extrabold text-muted-foreground uppercase mt-0.5 block">
                HIGH THREAT
              </span>
            </div>
          </div>

          {hotspotCount > 0 && (
            <div className="bg-danger-red/10 border border-danger-red/20 rounded-xl p-1.5 flex items-center gap-2 animate-pulse">
              <AlertTriangle className="w-4 h-4 text-danger-red shrink-0" />
              <div className="text-left">
                <span className="text-[9px] font-black text-danger-red uppercase tracking-wider block">HOTSPOT ALERTS</span>
                <span className="text-[8px] font-bold text-gray-300 block">{hotspotCount} zones active</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Floating Instructions/Help Widget (Bottom Left Overlay) */}
      <div className="absolute bottom-4 left-4 z-20 pointer-events-none">
        <div className="bg-slate-950/80 border border-white/10 rounded-xl px-2.5 py-1.5 flex items-center gap-1.5 backdrop-blur-md">
          <Info className="w-3.5 h-3.5 text-primary" />
          <span className="text-[9px] text-gray-300 font-semibold tracking-wide">
            Interact with markers to override dispatch routing
          </span>
        </div>
      </div>
    </div>
  );
}

function LoaderComponent() {
  return (
    <div className="w-12 h-12 rounded-xl bg-linear-to-br from-ai-purple/20 via-primary/10 to-gov-blue/20 border border-ai-purple/30 flex items-center justify-center shadow-lg animate-spin">
      <Sparkles className="w-6 h-6 text-ai-purple" />
    </div>
  );
}
