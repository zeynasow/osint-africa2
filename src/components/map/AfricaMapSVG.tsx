import React, { useMemo } from 'react';
import { Country, OsintEvent } from '../../types';

interface AfricaMapSVGProps {
  countries: Country[];
  events: OsintEvent[];
  selectedEventId: string | null;
  selectedCountryId: string | null;
  heatmapMode: boolean;
  zoomLevel: number;
  onSelectEvent: (event: OsintEvent) => void;
  onSelectCluster: (events: OsintEvent[]) => void;
  onSelectCountry: (country: Country) => void;
}

// Convert lat/lng to SVG projection coordinates for Africa
export const projectCoordinates = (lat: number, lng: number) => {
  const minLat = -36;
  const maxLat = 38;
  const minLng = -26;
  const maxLng = 53;

  // SVG viewBox: 0 0 800 850
  const x = ((lng - minLng) / (maxLng - minLng)) * 760 + 20;
  const y = ((maxLat - lat) / (maxLat - minLat)) * 800 + 25;
  return { x, y };
};

export const AfricaMapSVG: React.FC<AfricaMapSVGProps> = ({
  countries,
  events,
  selectedEventId,
  selectedCountryId,
  heatmapMode,
  zoomLevel,
  onSelectEvent,
  onSelectCluster,
  onSelectCountry
}) => {
  // CLUSTERING LOGIC
  const clusters = useMemo(() => {
    const gridSize = 35; // Pixels distance for clustering
    const grid = new Map<string, OsintEvent[]>();
    const noCoords: OsintEvent[] = [];

    events.forEach(evt => {
      if (!evt.coordinates) {
        noCoords.push(evt);
        return;
      }
      const { x, y } = projectCoordinates(evt.coordinates.lat, evt.coordinates.lng);
      const gridX = Math.floor(x / gridSize);
      const gridY = Math.floor(y / gridSize);
      const key = `${gridX}-${gridY}`;
      if (!grid.has(key)) grid.set(key, []);
      grid.get(key)!.push(evt);
    });

    return Array.from(grid.values());
  }, [events]);

  return (
    <div 
      className="w-full h-full flex items-center justify-center p-2 transition-transform duration-300 origin-center"
      style={{ transform: `scale(${zoomLevel})` }}
    >
      <svg
        viewBox="0 0 800 850"
        className="w-full h-full max-h-[750px] select-none"
      >
        <defs>
          <filter id="glow-critique" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="glow-eleve" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <radialGradient id="heat-grad-crit" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.75" />
            <stop offset="50%" stopColor="#f97316" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#f43f5e" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="heat-grad-eleve" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#f97316" stopOpacity="0.65" />
            <stop offset="60%" stopColor="#fbbf24" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Africa Outline Path */}
        <path
          d="M 330 60 
             C 380 50, 480 50, 520 80 
             C 580 120, 640 180, 680 250 
             C 720 320, 750 380, 710 440 
             C 680 490, 620 540, 580 600 
             C 540 660, 490 750, 430 810 
             C 390 840, 360 820, 340 780 
             C 310 720, 300 640, 270 560 
             C 250 510, 210 470, 160 450 
             C 100 420, 40 370, 40 300 
             C 40 240, 90 190, 140 150 
             C 200 100, 270 70, 330 60 Z"
          fill="#0d1424"
          stroke="#1e293b"
          strokeWidth="2"
        />

        {/* Internal Regional Boundary Lines */}
        <g stroke="#1e293b" strokeWidth="1" strokeDasharray="3 3" fill="none" opacity="0.6">
          <path d="M 60 280 C 120 300, 180 340, 260 360" />
          <path d="M 120 220 C 250 240, 380 250, 500 240" />
          <path d="M 300 360 C 380 390, 450 420, 520 440" />
          <path d="M 520 200 C 580 230, 640 280, 680 320" />
          <path d="M 300 560 C 380 580, 460 600, 520 600" />
        </g>

        {/* Heatmap Density Layer */}
        {heatmapMode && (
          <g id="heatmap-layer" className="transition-opacity duration-500">
            {events.map((evt) => {
              if (!evt.coordinates) return null;
              const { x, y } = projectCoordinates(evt.coordinates.lat, evt.coordinates.lng);
              const isCrit = evt.severity === 'CRITIQUE' || evt.alertLevel === 'CRITIQUE';
              const radius = isCrit ? 65 : 50;
              return (
                <circle
                  key={`heat-${evt.id}`}
                  cx={x}
                  cy={y}
                  r={radius}
                  fill={isCrit ? 'url(#heat-grad-crit)' : 'url(#heat-grad-eleve)'}
                  className="pointer-events-none mix-blend-screen"
                />
              );
            })}
          </g>
        )}

        {/* 25 Priority Countries Reference Markers & Labels */}
        {countries.map((c) => {
          const { x, y } = projectCoordinates(c.coordinates.lat, c.coordinates.lng);
          const isSelected = selectedCountryId === c.id;

          return (
            <g
              key={c.id}
              className="cursor-pointer group"
              onClick={(e) => {
                e.stopPropagation();
                onSelectCountry(c);
              }}
            >
              <circle
                cx={x}
                cy={y}
                r={isSelected ? '6' : '3.5'}
                fill={isSelected ? '#3b82f6' : '#334155'}
                stroke={isSelected ? '#93c5fd' : '#1e293b'}
                strokeWidth="1.5"
                className="group-hover:fill-blue-400 transition-colors"
              />
              <text
                x={x + 7}
                y={y + 3}
                fill={isSelected ? '#93c5fd' : '#64748b'}
                fontSize="10"
                fontFamily="monospace"
                fontWeight={isSelected ? 'bold' : 'normal'}
                className="group-hover:fill-slate-200 transition-colors select-none"
              >
                {c.code}
              </text>
            </g>
          );
        })}

        {/* Event Pins & Clusters */}
        {clusters.map((cluster, idx) => {
          if (cluster.length === 1) {
            const evt = cluster[0];
            const { x, y } = projectCoordinates(evt.coordinates!.lat, evt.coordinates!.lng);
            const isCrit = evt.severity === 'CRITIQUE' || evt.alertLevel === 'CRITIQUE';
            const isHigh = evt.severity === 'ELEVE' || evt.alertLevel === 'ÉLEVÉ';
            const isMod = evt.severity === 'MODERE' || evt.alertLevel === 'MODÉRÉ';
            const pinColor = isCrit ? '#f43f5e' : isHigh ? '#f97316' : isMod ? '#f59e0b' : '#10b981';
            const isSelected = selectedEventId === evt.id;

            return (
              <g
                key={`evt-${evt.id}`}
                className="cursor-pointer group"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectEvent(evt);
                }}
              >
                <circle cx={x} cy={y} r="24" fill="transparent" className="cursor-pointer" />
                {(isCrit || isHigh) && (
                  <circle cx={x} cy={y} r="16" fill={pinColor} opacity="0.3" className="animate-ping pointer-events-none" />
                )}
                {isSelected && (
                  <circle cx={x} cy={y} r="16" fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeDasharray="4 2" className="animate-spin pointer-events-none origin-center" />
                )}
                <circle cx={x} cy={y} r="12" fill={pinColor} opacity="0.2" className="group-hover:opacity-60 transition-opacity pointer-events-none" />
                <circle
                  cx={x} cy={y} r={isSelected ? 10 : 8}
                  fill={pinColor} stroke="#0b0f17" strokeWidth="2"
                  className="group-hover:scale-125 transition-transform origin-center pointer-events-none"
                  filter={isCrit ? 'url(#glow-critique)' : isHigh ? 'url(#glow-eleve)' : undefined}
                />
                <circle cx={x} cy={y} r="3" fill="#ffffff" className="pointer-events-none" />
              </g>
            );
          } else {
            // Cluster of multiple events
            // Compute average center
            let sumX = 0, sumY = 0;
            let hasCrit = false;
            let hasHigh = false;
            cluster.forEach(e => {
              const p = projectCoordinates(e.coordinates!.lat, e.coordinates!.lng);
              sumX += p.x;
              sumY += p.y;
              if (e.severity === 'CRITIQUE' || e.alertLevel === 'CRITIQUE') hasCrit = true;
              if (e.severity === 'ELEVE' || e.alertLevel === 'ÉLEVÉ') hasHigh = true;
            });
            const cx = sumX / cluster.length;
            const cy = sumY / cluster.length;
            const clusterColor = hasCrit ? '#f43f5e' : hasHigh ? '#f97316' : '#3b82f6';

            return (
              <g
                key={`cluster-${idx}`}
                className="cursor-pointer group"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectCluster(cluster);
                }}
              >
                <circle cx={cx} cy={cy} r="30" fill="transparent" />
                <circle cx={cx} cy={cy} r="18" fill={clusterColor} opacity="0.2" className="group-hover:opacity-40 transition-opacity" />
                <circle cx={cx} cy={cy} r="14" fill={clusterColor} stroke="#0b0f17" strokeWidth="2" className="group-hover:scale-110 transition-transform origin-center" />
                <text x={cx} y={cy + 4} fill="#ffffff" fontSize="11" fontWeight="bold" textAnchor="middle" className="pointer-events-none">
                  {cluster.length}
                </text>
              </g>
            );
          }
        })}
      </svg>
    </div>
  );
};
