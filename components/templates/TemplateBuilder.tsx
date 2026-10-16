'use client';

import React, { useState } from 'react';
import { Plus, Trash2, CheckCircle2 } from 'lucide-react';

interface ExerciseItem {
  id: string;
  name: string;
}

interface TemplateBuilderProps {
  availableExercises: ExerciseItem[];
  onTemplateCreated?: () => void;
}

export function TemplateBuilder({
  availableExercises,
  onTemplateCreated,
}: TemplateBuilderProps) {
  const [name, setName] = useState('');
  const [items, setItems] = useState<Array<{ exerciseId: string; plannedSets: number }>>([
    { exerciseId: availableExercises[0]?.id || '', plannedSets: 3 },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      { exerciseId: availableExercises[0]?.id || '', plannedSets: 3 },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || items.length === 0) return;

    setIsSubmitting(true);
    setSuccessMsg('');

    try {
      const res = await fetch('/api/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, items }),
      });

      if (res.ok) {
        setName('');
        setSuccessMsg('Template created successfully!');
        if (onTemplateCreated) onTemplateCreated();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4 shadow-xl"
    >
      <h3 className="text-lg font-bold text-white">Create Workout Template</h3>

      {successMsg && (
        <div className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-lg text-sm">
          <CheckCircle2 className="w-4 h-4" />
          <span>{successMsg}</span>
        </div>
      )}

      <div>
        <label className="block text-xs text-slate-400 mb-1">Routine / Template Name</label>
        <input
          type="text"
          placeholder="e.g. Pull Day - Hypertrophy"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
          required
        />
      </div>

      <div className="space-y-3">
        <label className="block text-xs text-slate-400">Planned Exercises & Sets</label>
        {items.map((item, idx) => (
          <div key={idx} className="flex items-center gap-3">
            <select
              value={item.exerciseId}
              onChange={(e) => {
                const val = e.target.value;
                setItems((prev) =>
                  prev.map((it, i) => (i === idx ? { ...it, exerciseId: val } : it))
                );
              }}
              className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
            >
              {availableExercises.map((ex) => (
                <option key={ex.id} value={ex.id}>
                  {ex.name}
                </option>
              ))}
            </select>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Sets:</span>
              <input
                type="number"
                min="1"
                max="20"
                value={item.plannedSets}
                onChange={(e) => {
                  const sets = Number(e.target.value);
                  setItems((prev) =>
                    prev.map((it, i) => (i === idx ? { ...it, plannedSets: sets } : it))
                  );
                }}
                className="w-16 bg-slate-800 border border-slate-700 rounded-lg px-2 py-2 text-sm text-white text-center"
              />
            </div>

            {items.length > 1 && (
              <button
                type="button"
                onClick={() => handleRemoveItem(idx)}
                className="p-2 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={handleAddItem}
          className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 font-medium"
        >
          <Plus className="w-4 h-4" /> Add Exercise
        </button>

        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg shadow transition"
        >
          {isSubmitting ? 'Saving...' : 'Save Template'}
        </button>
      </div>
    </form>
  );
}
