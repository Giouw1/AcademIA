'use client';

import React, { useState } from 'react';
import { Dumbbell, Plus, Check, Play, Edit3, Save } from 'lucide-react';
import { RestTimer } from './RestTimer';

interface ExerciseItem {
  id: string;
  name: string;
  imagePath?: string;
  muscleMultipliers: Record<string, number>;
}

interface SetItem {
  id: string;
  exerciseId: string;
  setNumber: number;
  weight: number;
  weightUnit: string;
  reps: number;
  isWarmup: boolean;
  startedAt: string;
  completedAt: string;
  restTimeBeforeThisSet?: number;
}

interface ActiveSessionViewProps {
  sessionId: string;
  templateId?: string;
  initialSets: SetItem[];
  availableExercises: ExerciseItem[];
  onFinishSession: () => Promise<void>;
}

export function ActiveSessionView({
  sessionId,
  initialSets,
  availableExercises,
  onFinishSession,
}: ActiveSessionViewProps) {
  const [sets, setSets] = useState<SetItem[]>(initialSets);
  const [selectedExerciseId, setSelectedExerciseId] = useState(
    availableExercises[0]?.id || ''
  );
  const [activeSetStartTime, setActiveSetStartTime] = useState<string | null>(null);
  const [weight, setWeight] = useState(60);
  const [reps, setReps] = useState(10);
  const [isWarmup, setIsWarmup] = useState(false);
  const [editingSetId, setEditingSetId] = useState<string | null>(null);
  const [editWeight, setEditWeight] = useState(0);
  const [editReps, setEditReps] = useState(0);
  const [editWarmup, setEditWarmup] = useState(false);
  const [loading, setLoading] = useState(false);

  const lastSet = sets[sets.length - 1];

  const handleStartSet = () => {
    setActiveSetStartTime(new Date().toISOString());
  };

  const handleFinishSet = async () => {
    if (!activeSetStartTime) return;
    setLoading(true);
    const completedAt = new Date().toISOString();

    try {
      const res = await fetch(`/api/session/${sessionId}/set`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          exerciseId: selectedExerciseId,
          weight,
          reps,
          isWarmup,
          startedAt: activeSetStartTime,
          completedAt,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const newSet: SetItem = {
          id: data.loggedSet.id,
          exerciseId: data.loggedSet.exerciseId,
          setNumber: data.loggedSet.setNumber,
          weight: data.loggedSet.weight,
          weightUnit: 'kg',
          reps: data.loggedSet.reps,
          isWarmup: data.loggedSet.isWarmup,
          startedAt: activeSetStartTime,
          completedAt,
          restTimeBeforeThisSet: data.loggedSet.restTimeBeforeThisSet,
        };
        setSets((prev) => [...prev, newSet]);
        setActiveSetStartTime(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStartEditing = (s: SetItem) => {
    setEditingSetId(s.id);
    setEditWeight(s.weight);
    setEditReps(s.reps);
    setEditWarmup(s.isWarmup);
  };

  const handleSaveEdit = async (setId: string) => {
    try {
      const res = await fetch(`/api/session/${sessionId}/set/${setId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weight: editWeight,
          reps: editReps,
          isWarmup: editWarmup,
        }),
      });

      if (res.ok) {
        setSets((prev) =>
          prev.map((s) =>
            s.id === setId
              ? { ...s, weight: editWeight, reps: editReps, isWarmup: editWarmup }
              : s
          )
        );
        setEditingSetId(null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Session Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-lg">
            <Dumbbell className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Active Workout Session</h2>
            <p className="text-xs text-slate-400">Sets completed: {sets.length}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <RestTimer lastCompletedAt={lastSet?.completedAt} />
          <button
            onClick={onFinishSession}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm rounded-lg shadow transition"
          >
            Finish Workout
          </button>
        </div>
      </div>

      {/* Set Logger Form */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-white">Log Exercise Set</h3>
          {activeSetStartTime ? (
            <span className="text-xs px-2.5 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full animate-pulse">
              Set in progress...
            </span>
          ) : (
            <span className="text-xs text-slate-500">Press Start when beginning set</span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs text-slate-400 mb-1">Exercise</label>
            <select
              value={selectedExerciseId}
              onChange={(e) => setSelectedExerciseId(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
            >
              {availableExercises.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">Weight (kg)</label>
            <input
              type="number"
              value={weight}
              onChange={(e) => setWeight(Number(e.target.value))}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
              min="0"
              step="2.5"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">Reps</label>
            <input
              type="number"
              value={reps}
              onChange={(e) => setReps(Number(e.target.value))}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
              min="1"
            />
          </div>

          <div className="flex items-center gap-2 pt-6">
            <input
              type="checkbox"
              id="warmup-check"
              checked={isWarmup}
              onChange={(e) => setIsWarmup(e.target.checked)}
              className="rounded bg-slate-800 border-slate-700 text-blue-500 focus:ring-blue-500"
            />
            <label htmlFor="warmup-check" className="text-sm text-slate-300">
              Warmup Set
            </label>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          {!activeSetStartTime ? (
            <button
              onClick={handleStartSet}
              className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium text-sm transition"
            >
              <Play className="w-4 h-4" /> Start Set
            </button>
          ) : (
            <button
              onClick={handleFinishSet}
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium text-sm transition"
            >
              <Check className="w-4 h-4" /> Complete Set
            </button>
          )}
        </div>
      </div>

      {/* Logged Sets Table / List */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-slate-800">
          <h3 className="font-semibold text-white">Logged Sets (In-Memory / Staging Active)</h3>
        </div>

        {sets.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500">
            No sets logged yet. Select an exercise and click Start Set.
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {sets.map((s, idx) => {
              const exName =
                availableExercises.find((e) => e.id === s.exerciseId)?.name || s.exerciseId;
              const isEditing = editingSetId === s.id;

              return (
                <div key={s.id} className="p-4 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-full bg-slate-800 text-slate-400 text-xs flex items-center justify-center font-bold">
                      #{idx + 1}
                    </span>
                    <div>
                      <p className="font-medium text-white text-sm">{exName}</p>
                      <span className="text-xs text-slate-400">
                        Set {s.setNumber} {s.isWarmup && '• (Warmup)'}
                      </span>
                    </div>
                  </div>

                  {isEditing ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={editWeight}
                        onChange={(e) => setEditWeight(Number(e.target.value))}
                        className="w-16 bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                        placeholder="kg"
                      />
                      <input
                        type="number"
                        value={editReps}
                        onChange={(e) => setEditReps(Number(e.target.value))}
                        className="w-16 bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                        placeholder="reps"
                      />
                      <label className="flex items-center gap-1 text-xs text-slate-400">
                        <input
                          type="checkbox"
                          checked={editWarmup}
                          onChange={(e) => setEditWarmup(e.target.checked)}
                        />
                        W
                      </label>
                      <button
                        onClick={() => handleSaveEdit(s.id)}
                        className="p-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs"
                      >
                        <Save className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <span className="text-sm font-semibold text-white">
                          {s.weight} kg × {s.reps} reps
                        </span>
                        {s.restTimeBeforeThisSet !== undefined && (
                          <p className="text-xs text-slate-500">
                            Rest: {s.restTimeBeforeThisSet}s
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => handleStartEditing(s)}
                        title="Edit Set (Typo fix)"
                        className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
