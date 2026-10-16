'use client';

import React, { useEffect, useState } from 'react';
import { TemplateBuilder } from '@/components/templates/TemplateBuilder';
import { Layers, Dumbbell, Play } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function TemplatesPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<any[]>([]);
  const [exercises, setExercises] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = () => {
    Promise.all([
      fetch('/api/templates').then((r) => r.json()),
      fetch('/api/exercises').then((r) => r.json()),
    ])
      .then(([tpls, exs]) => {
        setTemplates(tpls);
        setExercises(exs);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStartWithTemplate = async (templateId: string) => {
    const res = await fetch('/api/session/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ templateId }),
    });

    if (res.ok) {
      router.push('/session');
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Layers className="w-6 h-6 text-blue-400" />
          <span>Workout Templates</span>
        </h1>
        <p className="text-slate-400 text-sm">
          Select an existing workout template or create custom routines.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-semibold text-white">Registered Routines</h2>

          {loading ? (
            <div className="p-8 text-center text-slate-500 bg-slate-900 border border-slate-800 rounded-xl">
              Loading templates...
            </div>
          ) : templates.length === 0 ? (
            <div className="p-8 text-center text-slate-500 bg-slate-900 border border-slate-800 rounded-xl">
              No templates registered yet. Use the form on the right to create your first routine!
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {templates.map((tpl) => (
                <div
                  key={tpl.id}
                  className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between shadow-lg"
                >
                  <div className="space-y-3">
                    <h3 className="font-bold text-white text-base">{tpl.name}</h3>
                    <div className="space-y-1.5">
                      {tpl.items.map((item: any, i: number) => {
                        const exName =
                          exercises.find((e) => e.id === item.exerciseId)?.name || item.exerciseId;
                        return (
                          <div
                            key={i}
                            className="text-xs text-slate-400 flex items-center justify-between"
                          >
                            <span>&bull; {exName}</span>
                            <span className="font-mono text-slate-500">{item.plannedSets} sets</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="pt-5">
                    <button
                      onClick={() => handleStartWithTemplate(tpl.id)}
                      className="w-full flex items-center justify-center gap-2 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg transition"
                    >
                      <Play className="w-3.5 h-3.5" /> Start Workout
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          {exercises.length > 0 && (
            <TemplateBuilder
              availableExercises={exercises}
              onTemplateCreated={loadData}
            />
          )}
        </div>
      </div>
    </div>
  );
}
