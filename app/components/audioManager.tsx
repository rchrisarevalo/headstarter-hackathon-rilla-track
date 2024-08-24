import { useState, useEffect, CSSProperties } from 'react';
import axios from 'axios';

type Comment = {
  text: string;
  type: 'positive' | 'negative';
  highlight: [number, number];
}

type Audio = {
    id: string; // or number, depending on your data
    name: string;
    transcription?: string;
    summary?: string;
    comments?: Comment[];
  };  

export default function AudioManager() {
  const [audios, setAudios] = useState<Audio[]>([
    {
      id: '1',
      name: 'Sample Audio 1',
      transcription: 'This is a sample transcription for audio 1. It contains some example text to illustrate how the transcription will appear on the frontend.',
      summary: 'This is a summary of the sample transcription for audio 1.',
      comments: [
        { text: 'Great audio!', type: 'positive', highlight: [0, 4] },
        { text: 'Interesting points about the subject.', type: 'positive', highlight: [22, 35] },
        { text: 'Could use more details.', type: 'negative', highlight: [51, 62] }
      ],
    },
    {
      id: '2',
      name: 'Sample Audio 2',
      transcription: 'This is a sample transcription for audio 2. It also contains example text for demonstration purposes.',
      summary: 'Summary for the second sample audio.',
      comments: [
        { text: 'Needs more details.', type: 'negative', highlight: [10, 21] },
        { text: 'Very clear and concise.', type: 'positive', highlight: [27, 37] }
      ],
    },
  ]);
  const [selectedAudio, setSelectedAudio] = useState<Audio | null>(audios[0] || null);
  const [hoveredComment, setHoveredComment] = useState<string | null>(null);
  const [newCommentText, setNewCommentText] = useState('');
  const [commentType, setCommentType] = useState<'positive' | 'negative'>('positive');
  const [highlightStart, setHighlightStart] = useState<number | null>(null);
  const [highlightEnd, setHighlightEnd] = useState<number | null>(null);

  useEffect(() => {
    const fetchAudios = async () => {
      const response = await axios.get('/api/audios');
      setAudios(response.data);
      setSelectedAudio(response.data[0] || null);
    };
    fetchAudios();
  }, []);

  useEffect(() => {
    if (selectedAudio) {
      setHoveredComment(null);
    }
  }, [selectedAudio]);

  const handleAudioClick = (audio: Audio) => {
    setSelectedAudio(audio);
    setHoveredComment(null);
  };

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    await axios.post('/api/upload', formData);

    const response = await axios.get('/api/audios');
    setAudios(response.data);
    setSelectedAudio(response.data[0] || null);
  };

  const handleAddComment = () => {
    if (selectedAudio && highlightStart !== null && highlightEnd !== null && newCommentText.trim()) {
      const updatedComments = [
        ...(selectedAudio.comments || []),
        { text: newCommentText, type: commentType, highlight: [highlightStart, highlightEnd] }
      ];
      //setSelectedAudio({ ...selectedAudio, comments: updatedComments });
      setNewCommentText('');
      setHighlightStart(null);
      setHighlightEnd(null);
    }
  };

  const renderHighlightedText = (text: string, comments: Comment[]) => {
    let highlightedText = text;
    comments.forEach((comment) => {
      const [start, end] = comment.highlight;
      const highlightClass = comment.type === 'positive' ? 'highlight-positive' : 'highlight-negative';
      highlightedText = `${highlightedText.slice(0, start)}<mark class="${highlightClass}" data-comment="${comment.text}">${highlightedText.slice(start, end)}</mark>${highlightedText.slice(end)}`;
    });
    return { __html: highlightedText };
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
      {/* Sidebar for Audio List */}
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

      {/* Dashboard for Transcription, Comments, and Summary */}
      <div style={styles.dashboard as CSSProperties}>
        <div style={styles.section}>
          <h2 style={styles.title}>Transcription for {selectedAudio?.name}</h2>
          {selectedAudio ? (
            <div
              style={styles.transcriptionBox as CSSProperties}
              dangerouslySetInnerHTML={renderHighlightedText(selectedAudio?.transcription || '', selectedAudio?.comments || [])}
              onMouseOver={(e) => {
                const target = e.target as HTMLElement;
                if (target.tagName === 'MARK') {
                  setHoveredComment(target.dataset.comment || null);
                }
              }}
              onMouseOut={() => setHoveredComment(null)}
            />
          ) : (
            <div style={styles.selectPrompt}>Select an audio to view its transcription</div>
          )}
          {hoveredComment && (
            <div style={styles.hoverCommentBox}>{hoveredComment}</div>
          )}
          <div style={styles.commentInput}>
            <textarea
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
              placeholder="Add a comment..."
              style={styles.commentTextarea}
            />
            <div>
              <label style={styles.radioLabel}>
                <input
                  type="radio"
                  value="positive"
                  checked={commentType === 'positive'}
                  onChange={() => setCommentType('positive')}
                  style={styles.radioInput}
                />
                Positive
              </label>
              <label style={styles.radioLabel}>
                <input
                  type="radio"
                  value="negative"
                  checked={commentType === 'negative'}
                  onChange={() => setCommentType('negative')}
                  style={styles.radioInput}
                />
                Negative
              </label>
            </div>
            <button onClick={handleAddComment} style={styles.addButton}>
              Add Comment
            </button>
            <button onClick={handleGenerateSummary} style={styles.generateSummaryButton}>
              Generate Summary
            </button>
          </div>
        </div>
        <div style={styles.section}>
          <h2 style={styles.title}>Comments Summary</h2>
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
  transcriptionBox: {
    padding: '15px',
    border: '1px solid #ddd',
    borderRadius: '5px',
    backgroundColor: '#f9f9f9',
    minHeight: '200px',
    whiteSpace: 'pre-wrap' as 'pre-wrap',
    overflowY: 'auto',
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
  commentInput: {
    marginTop: '20px',
  },
  commentTextarea: {
    width: '100%',
    height: '80px',
    padding: '10px',
    borderRadius: '5px',
    border: '1px solid #ddd',
    fontSize: '16px',
  },
  addButton: {
    marginTop: '10px',
    padding: '10px 20px',
    border: 'none',
    borderRadius: '5px',
    backgroundColor: '#0070f3',
    color: '#fff',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
  },
  radioLabel: {
    marginRight: '15px',
  },
  radioInput: {
    marginRight: '5px',
  },
  generateSummaryButton: {
    marginTop: '10px',
    marginLeft: '10px',
    padding: '10px 20px',
    border: 'none',
    borderRadius: '5px',
    backgroundColor: '#0070f3',
    color: '#fff',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
  },
  hoverCommentBox: {
    padding: '10px',
    backgroundColor: '#fff',
    border: '1px solid #ddd',
    borderRadius: '5px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    top: '0',
    left: '0',
    zIndex: 10,
    fontSize: '14px',
  },
};
