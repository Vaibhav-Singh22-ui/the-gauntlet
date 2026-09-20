'use client';

import React, { useEffect, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { audio } from '@/lib/audio';

export default function AudioToggle() {
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    setMuted(audio.getMuted());
    const unsubscribe = audio.subscribe((isMuted) => setMuted(isMuted));
    return unsubscribe;
  }, []);

  const handleToggle = () => {
    const nextState = audio.toggleMute();
    setMuted(nextState);
  };

  return (
    <button
      onClick={handleToggle}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all text-xs font-semibold tracking-wider uppercase cursor-pointer ${
        muted
          ? 'bg-red-950/40 border-red-800/60 text-red-300 hover:bg-red-900/50'
          : 'bg-emerald-950/40 border-emerald-700/60 text-emerald-300 hover:bg-emerald-900/50'
      }`}
      title={muted ? 'Unmute Sound' : 'Mute Sound'}
      aria-label="Toggle Sound"
    >
      {muted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
      <span>{muted ? 'Sound Off' : 'Sound On'}</span>
    </button>
  );
}
