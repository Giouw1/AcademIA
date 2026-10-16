'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ActiveSessionView } from '@/components/session/ActiveSessionView';
import { Play, Dumbbell, AlertCircle } from 'lucide-react';

export default function SessionPage() {
  const router = useRouter();
  const [activeSession, setActiveSession] = useState<any>(null);
  const [exercises, setExercises] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchState = async () => {
    try {
      const [sessRes, exRes] = await Promise.all([
        fetch('/api/session/active'),
        fetch('/api/exercises'),
      ]);

      const sessData = await sessRes.json();
      const exData = await exRes.json();

      setExercises(exData);
      if (sessData.active && sessData.session) {
        setActiveSession(sessData.session);
      } else {
        setActiveSession(null);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchState();
  }, []);

  const handleStartFreeform = async () => {
    setLoading(true);
    const res = await fetch('/api/session/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });

    if (res.ok) {
      await fetchState();
    }
  };

  const handleFinishSession = async () => {
    if (!activeSession) return;
    setLoading(true);

    const res = await fetch(`/api/session/${activeSession.id}/complete`, {
      method: 'POST',
    });

    if (res.ok) {
      router.push('/');
    } else {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-500 bg-slate-900 border border-slate-800 rounded-xl">
        Loading workout session...
      </div>
    );
  }

  if (!activeSession) {
    return (
      <div className="max-w-md mx-auto text-center space-y-6 py-12">
        <div className="w-16 h-16 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-2xl flex items-center justify-center mx-auto">
          <Dumbbell className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-white">No Active Session</h1>
          <p className="text-slate-400 text-sm">
            You don't have a workout in progress. Start an empty session or pick a routine template.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={handleStartFreeform}
            className="flex items-center justify-center gap-2 py-3 px-6 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/20 transition"
          >
            <Play className="w-4 h-4" /> Start Quick Workout
          </button>
          <button
            onClick={() => router.push('/templates')}
            className="py-3 px-6 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-xl border border-slate-700 transition"
          >
            Choose from Templates
          </button>
        </div>
      </div>
    );
  }

  return (
    <ActiveSessionView
      sessionId={activeSession.id}
      templateId={activeSession.templateId}
      initialSets={activeSession.sets || []}
      availableExercises={exercises}
      onFinishSession={handleFinishSession}
    />
  );
}
