'use client';
import { useState } from 'react';
import AudioManager from './components/audioManager';

export default function Home() {
  const [selectedAudio, setSelectedAudio] = useState(null);

  return (
    <div>
      <AudioManager />
    </div>
  );
}
