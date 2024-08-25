import React, { useState, useEffect, CSSProperties } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import TranscriptEditor from './transcriptionEditor';

type Audio = {
    id: string; // or number, depending on your data
    name: string;
    transcription?: string;
    summary?: string;
    comments?: Comment[];
  };  

const AudioManager: React.FC = () => {
  const [audios, setAudios] = useState<Audio[]>([
    {
      id: '1',
      name: 'Sample Audio 1',
      transcription: 'This is a sample transcription for audio 1. It contains some example text to illustrate how the transcription will appear on the frontend.',
      summary: 'This is a summary of the sample transcription for audio 1.',
    },
    {
      id: '2',
      name: 'Sample Audio 2',
      transcription: 'This is a sample transcription for audio 2. It also contains example text for demonstration purposes.',
      summary: 'Summary for the second sample audio.',
    },
  ]);
  const [selectedAudio, setSelectedAudio] = useState<Audio | null>(audios[0] || null);

  useEffect(() => {
    const fetchAudios = async () => {
      //const response = await axios.get('/api/audios');
      //setAudios(response.data);
      //setSelectedAudio(response.data[0] || null);
    };
    fetchAudios();
  }, []);

  const handleAudioClick = (audio: Audio) => {
    setSelectedAudio(audio);
  };

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    //await axios.post('/api/upload', formData);

    //const response = await axios.get('/api/audios');
    //setAudios(response.data);
    //setSelectedAudio(response.data[0] || null);
  };

  const handleGenerateSummary = async () => {
    if (selectedAudio) {
      //const response = await axios.post(`/api/audios/${selectedAudio.id}/summary`, { comments });
      //const summary = response.data.summary;
      //setSelectedAudio({ ...selectedAudio, summary });
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.sidebar}>
        <input
          type="file"
          accept="audio/*"
          onChange={handleUpload}
          style={{ display: 'none' }}
          id="upload-audio"
        />
        <label htmlFor="upload-audio" style={styles.uploadButton as CSSProperties}>
          Upload Audio
        </label>
        <div style={styles.audioList as CSSProperties}>
          {audios.map((audio) => (
            <div key={audio.id} style={styles.audioItem}>
              <button style={styles.audioButton as CSSProperties} onClick={() => handleAudioClick(audio)}>
                {audio.name}
              </button>
            </div>
          ))}
        </div>
      </div>

      <div style={styles.dashboard as CSSProperties}>
        <div style={styles.section}>
          <h2 style={styles.title}>Transcription for {selectedAudio?.name}</h2>
          {selectedAudio ? (
            <TranscriptEditor text={selectedAudio.transcription ?? ''} />
          ) : (
            <div style={styles.selectPrompt}>Select an audio to view its transcription</div>
          )}
          </div>
        <div style={styles.section}>
          <h2 style={styles.title}>Feedback Summary</h2>
          {selectedAudio ? (
            <div style={styles.summaryBox as CSSProperties}>{selectedAudio.summary || 'No summary available'}</div>
          ) : (
            <div style={styles.selectPrompt}>Select an audio to view its summary</div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    height: '100vh',
    fontFamily: 'Arial, sans-serif',
  },
  sidebar: {
    width: '15%',
    padding: '20px',
    borderRight: '1px solid #e0e0e0',
    backgroundColor: '#f7f7f7',
  },
  uploadButton: {
    cursor: 'pointer',
    color: '#0070f3',
    display: 'block',
    marginBottom: '20px',
    fontSize: '16px',
    textAlign: 'center',
    padding: '10px',
    border: '1px solid #0070f3',
    borderRadius: '5px',
    backgroundColor: '#fff',
    transition: 'background-color 0.3s ease',
  },
  audioList: {
    maxHeight: 'calc(100% - 100px)',
    overflowY: 'auto',
  },
  audioItem: {
    marginBottom: '10px',
  },
  audioButton: {
    width: '100%',
    padding: '10px',
    textAlign: 'left',
    backgroundColor: '#ffffff',
    border: '1px solid #ddd',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '16px',
    transition: 'background-color 0.3s ease',
  },
  dashboard: {
    width: '85%',
    padding: '20px',
    backgroundColor: '#ffffff',
    overflowY: 'auto',
  },
  title: {
    fontSize: '24px',
    marginBottom: '20px',
    color: '#333',
  },
  section: {
    marginBottom: '20px',
    width: '100%',
  },
  summaryBox: {
    padding: '15px',
    border: '1px solid #ddd',
    borderRadius: '5px',
    backgroundColor: '#f9f9f9',
    minHeight: '100px',
  },
  selectPrompt: {
    textAlign: 'center' as 'center',
    padding: '50px',
    color: '#888',
  },
};

export default AudioManager;
