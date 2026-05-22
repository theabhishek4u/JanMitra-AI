"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getComplaints } from "@/lib/complaints";
import type { Complaint } from "@/types";
import { Search, MapPin, AlertTriangle, ShieldAlert, Sparkles, Building2 } from "lucide-react";

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

  useEffect(() => {
    setMounted(true);
    setComplaints(getComplaints());
  }, []);

  if (!mounted) {
    return (
      <div className="h-[450px] w-full bg-card/45 border border-border/20 animate-pulse rounded-2xl flex flex-col items-center justify-center text-muted-foreground">
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

  return (
    <div className="space-y-4">
      {/* Filters Hub */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-muted/20 border border-border/10 p-3.5 rounded-2xl">
        <div className="relative md:col-span-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search Gomti Nagar, ID, or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10 border border-border/40 rounded-xl bg-background/30 focus-visible:ring-offset-0 focus-visible:ring-1 focus-visible:ring-primary/45"
          />
        </div>

        <div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full h-10 border border-border/40 rounded-xl bg-card text-foreground px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary/45 font-semibold"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="w-full h-10 border border-border/40 rounded-xl bg-card text-foreground px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary/45 font-semibold"
          >
            <option value="all">All Priorities</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>
        </div>
      </div>

      {/* CartoDB Dark Heatmap Canvas */}
      <div className="relative overflow-hidden rounded-2xl border border-border/30 h-[450px] bg-slate-950 shadow-inner">
        <MapContainer
          center={LUCKNOW_CENTER}
          zoom={13}
          style={{ height: "100%", width: "100%" }}
          className="z-10"
        >
          {/* CartoDB Dark Matter tile layer for premium dark style */}
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          />

          {filteredComplaints.map((c) => {
            const markerColor = getPriorityColor(c.priority);
            const lat = c.latitude || LUCKNOW_CENTER[0];
            const lng = c.longitude || LUCKNOW_CENTER[1];

            return (
              <CircleMarker
                key={c.id}
                center={[lat, lng]}
                radius={c.priority === "high" ? 14 : 10}
                fillColor={markerColor}
                color={markerColor}
                weight={2}
                opacity={0.8}
                fillOpacity={0.25}
                className="radar-glow"
              >
                <Popup className="glassmorphic-popup">
                  <div className="p-2 space-y-2.5 max-w-[280px] bg-slate-900/90 text-white rounded-xl border border-border/20 backdrop-blur-md">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-gray-400">{c.id}</span>
                      <Badge className={`priority-${c.priority} text-[10px] px-2 py-0.2 font-bold uppercase`}>
                        {c.priority}
                      </Badge>
                    </div>

                    <div>
                      <h4 className="font-extrabold text-sm text-foreground/90 leading-snug">{c.title}</h4>
                      <p className="text-xs text-gray-300 mt-1 flex items-center gap-1 font-semibold">
                        <MapPin className="w-3.5 h-3.5 text-primary" />
                        {c.area}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[10px] bg-white/5 p-2 rounded-lg border border-white/5">
                      <div>
                        <span className="text-gray-400 block font-bold">DEPARTMENT</span>
                        <span className="font-bold flex items-center gap-0.5 mt-0.5 text-gray-200">
                          <Building2 className="w-3 h-3 text-gov-blue-light" />
                          {c.department.replace("Department", "Dept")}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400 block font-bold">STATUS</span>
                        <span className="font-bold block mt-0.5 capitalize text-warning-amber">
                          {c.status.replace(/_/g, " ")}
                        </span>
                      </div>
                    </div>

                    {c.aiSummary && (
                      <p className="text-[10px] text-gray-400 leading-relaxed italic border-t border-white/5 pt-2">
                        {c.aiSummary}
                      </p>
                    )}

                    {onSelectComplaint && (
                      <Button
                        size="sm"
                        onClick={() => onSelectComplaint(c.id)}
                        className="w-full text-xs h-8 rounded-lg bg-gradient-to-r from-gov-blue to-gov-blue-light text-white font-extrabold cursor-pointer"
                      >
                        Inspect Grievance Detail
                      </Button>
                    )}
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
}

function LoaderComponent() {
  return (
    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-ai-purple/20 via-primary/10 to-gov-blue/20 border border-ai-purple/30 flex items-center justify-center shadow-lg animate-spin">
      <Sparkles className="w-6 h-6 text-ai-purple" />
    </div>
  );
}
