import React, { useState } from 'react';

interface TranscriptEditorProps {
  text: string;
}

interface HighlightedText {
    start: number;
    end: number;
  }

const TranscriptEditor: React.FC<TranscriptEditorProps> = ({ text }) => {
  //const [selectedText, setSelectedText] = useState<string>('');
  const [highlightedText, setHighlightedText] = useState<HighlightedText[]>([]);

  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.toString()) {
      const start = selection.anchorOffset;
      const end = selection.focusOffset;
      if (start !== end) {
        const newHighlight: HighlightedText = { 
            start: Math.min(start, end), 
            end: Math.max(start, end) 
          };
          setHighlightedText((prevHighlights) => [...prevHighlights, newHighlight]);
      }
    }
  };

  const renderHighlightedText = (text: string) => {
    if (highlightedText.length === 0) {
        return { __html: text };
      }

      let currentIndex = 0;
      let highlightedHTML = '';

      const sortedHighlights = [...highlightedText].sort((a, b) => a.start - b.start);

      sortedHighlights.forEach(({ start, end }) => {
        highlightedHTML += text.slice(currentIndex, start);
        highlightedHTML += `<mark>${text.slice(start, end)}</mark>`;
        currentIndex = end;
      });
  
      highlightedHTML += text.slice(currentIndex);
  
      return { __html: highlightedHTML };
  };

  return (
    <div>
      <p><i>Highlight text to add comments</i></p>
      <div
        style={{ border: '1px solid #ccc', padding: '10px', minHeight: '150px' }}
        onMouseUp={handleTextSelection}
        dangerouslySetInnerHTML={renderHighlightedText(text)}
      />
    </div>
  );
};

export default TranscriptEditor;
