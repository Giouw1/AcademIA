'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { MuscleHeatmap } from '@/components/heatmap/MuscleHeatmap';
import { Dumbbell, PlusCircle, TrendingUp, Calendar } from 'lucide-react';

export default function DashboardPage() {
  const [impactData, setImpactData] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/metrics/impact')
      .then((res) => res.json())
      .then((data) => {
        if (data.impact) {
          setImpactData(data.impact);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-8">
      {/* Welcome Hero */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-gradient-to-r from-blue-900/40 via-slate-900 to-slate-900 border border-slate-800 rounded-2xl shadow-xl">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Gym Assistant Dashboard
          </h1>
          <p className="text-slate-400 text-sm">
            Track muscular volume, manage routines, and monitor your personal development.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/session"
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-blue-500/20 transition"
          >
            <Dumbbell className="w-4 h-4" /> Start Workout
          </Link>
          <Link
            href="/templates"
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium rounded-xl border border-slate-700 transition"
          >
            <PlusCircle className="w-4 h-4" /> Routines
          </Link>
        </div>
      </div>

      {/* Muscular Stress Heatmap */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-400" />
            <span>Muscle Volume & Heatmap (Last 30 Days)</span>
          </h2>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-500 bg-slate-900 border border-slate-800 rounded-xl">
            Loading metrics...
          </div>
        ) : (
          <MuscleHeatmap impactData={impactData} />
        )}
      </section>
    </div>
  );
}
