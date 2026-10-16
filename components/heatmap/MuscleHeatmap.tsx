'use client';

import React from 'react';
import { MuscleGroup } from '@/domain/value_objects/MuscleGroup';

interface MuscleHeatmapProps {
  impactData: Record<string, number>;
}

export function MuscleHeatmap({ impactData }: MuscleHeatmapProps) {
  // Find maximum volume to normalize colors
  const values = Object.values(impactData);
  const maxVal = Math.max(...values, 100);

  const getColor = (group: MuscleGroup) => {
    const val = impactData[group] || 0;
    if (val === 0) return '#374151'; // neutral dark gray (idle)

    const ratio = Math.min(val / maxVal, 1.0);
    if (ratio < 0.25) return '#3b82f6'; // light blue
    if (ratio < 0.5) return '#10b981'; // green
    if (ratio < 0.75) return '#f59e0b'; // amber/orange
    return '#ef4444'; // intense red
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-white shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold">Muscle Stress Heatmap</h3>
        <div className="flex items-center gap-2 text-xs">
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-slate-700 inline-block"></span> 0</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-blue-500 inline-block"></span> Low</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-emerald-500 inline-block"></span> Med</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-amber-500 inline-block"></span> High</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-500 inline-block"></span> Max</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        {/* Anterior / Front Anatomy */}
        <div className="flex flex-col items-center">
          <span className="text-sm font-semibold text-slate-400 mb-2">Anterior (Front)</span>
          <svg viewBox="0 0 200 400" className="w-48 h-80 drop-shadow-md">
            {/* Head */}
            <circle cx="100" cy="35" r="22" fill="#475569" />

            {/* Neck */}
            <rect x="94" y="58" width="12" height="15" fill="#475569" />

            {/* Shoulders */}
            <circle cx="65" cy="85" r="14" fill={getColor(MuscleGroup.SHOULDERS)} />
            <circle cx="135" cy="85" r="14" fill={getColor(MuscleGroup.SHOULDERS)} />

            {/* Chest (Pectorals) */}
            <path
              d="M 80 80 Q 100 85 100 115 Q 80 115 78 85 Z"
              fill={getColor(MuscleGroup.CHEST)}
              className="transition-colors duration-300"
            />
            <path
              d="M 120 80 Q 100 85 100 115 Q 120 115 122 85 Z"
              fill={getColor(MuscleGroup.CHEST)}
              className="transition-colors duration-300"
            />

            {/* Biceps */}
            <rect x="52" y="105" width="14" height="32" rx="6" fill={getColor(MuscleGroup.BICEPS)} />
            <rect x="134" y="105" width="14" height="32" rx="6" fill={getColor(MuscleGroup.BICEPS)} />

            {/* Forearms */}
            <rect x="48" y="142" width="12" height="35" rx="5" fill="#475569" />
            <rect x="140" y="142" width="12" height="35" rx="5" fill="#475569" />

            {/* Core / Abs */}
            <rect x="85" y="120" width="30" height="50" rx="6" fill={getColor(MuscleGroup.CORE)} />

            {/* Quadriceps */}
            <rect x="74" y="180" width="22" height="70" rx="8" fill={getColor(MuscleGroup.QUADRICEPS)} />
            <rect x="104" y="180" width="22" height="70" rx="8" fill={getColor(MuscleGroup.QUADRICEPS)} />

            {/* Calves */}
            <rect x="76" y="260" width="18" height="55" rx="6" fill={getColor(MuscleGroup.CALVES)} />
            <rect x="106" y="260" width="18" height="55" rx="6" fill={getColor(MuscleGroup.CALVES)} />
          </svg>
        </div>

        {/* Posterior / Back Anatomy */}
        <div className="flex flex-col items-center">
          <span className="text-sm font-semibold text-slate-400 mb-2">Posterior (Back)</span>
          <svg viewBox="0 0 200 400" className="w-48 h-80 drop-shadow-md">
            {/* Head */}
            <circle cx="100" cy="35" r="22" fill="#475569" />

            {/* Traps & Upper / Mid Back */}
            <path
              d="M 72 75 L 100 62 L 128 75 L 120 135 L 100 145 L 80 135 Z"
              fill={getColor(MuscleGroup.BACK)}
              className="transition-colors duration-300"
            />

            {/* Triceps */}
            <rect x="52" y="105" width="14" height="32" rx="6" fill={getColor(MuscleGroup.TRICEPS)} />
            <rect x="134" y="105" width="14" height="32" rx="6" fill={getColor(MuscleGroup.TRICEPS)} />

            {/* Glutes */}
            <rect x="75" y="165" width="23" height="30" rx="8" fill={getColor(MuscleGroup.GLUTES)} />
            <rect x="102" y="165" width="23" height="30" rx="8" fill={getColor(MuscleGroup.GLUTES)} />

            {/* Hamstrings */}
            <rect x="74" y="200" width="22" height="55" rx="8" fill={getColor(MuscleGroup.HAMSTRINGS)} />
            <rect x="104" y="200" width="22" height="55" rx="8" fill={getColor(MuscleGroup.HAMSTRINGS)} />

            {/* Calves (Back) */}
            <rect x="76" y="265" width="18" height="50" rx="6" fill={getColor(MuscleGroup.CALVES)} />
            <rect x="106" y="265" width="18" height="50" rx="6" fill={getColor(MuscleGroup.CALVES)} />
          </svg>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {Object.values(MuscleGroup).map((g) => (
          <div key={g} className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700/50 flex flex-col">
            <span className="text-xs text-slate-400 capitalize">{g.toLowerCase()}</span>
            <span className="text-sm font-semibold">{Math.round(impactData[g] || 0)} <span className="text-xs text-slate-500 font-normal">pts</span></span>
          </div>
        ))}
      </div>
    </div>
  );
}
