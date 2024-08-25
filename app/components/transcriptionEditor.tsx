import React, { useState } from 'react';

interface TranscriptEditorProps {
  text: string;
}

interface HighlightedText {
  start: number;
  end: number;
}

const TranscriptEditor: React.FC<TranscriptEditorProps> = ({ text }) => {
  const [highlighted, setHighlighted] = useState<HighlightedText[]>([]);

  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.toString()) {
      const range = selection.getRangeAt(0);
      
      const start = calculateGlobalOffset(range.startContainer, range.startOffset);
      const end = calculateGlobalOffset(range.endContainer, range.endOffset);


      console.log('Selection:', selection.toString());
      console.log('Range:', { start, end });
      
      if (start !== end) {
        const newHighlight: HighlightedText = {
          start: Math.min(start, end),
          end: Math.max(start, end),
        };
        console.log('New Highlight:', newHighlight);
        setHighlighted((prevHighlights) => {
          const updatedHighlights = mergeHighlights([...prevHighlights, newHighlight]);
          console.log('Updated Highlights:', updatedHighlights);
          return updatedHighlights;
        });
      }
      selection.removeAllRanges(); // Clear selection after processing
    }
  };

  const calculateGlobalOffset = (node: Node, offset: number): number => {
    let totalOffset = offset;
    while (node && node.previousSibling) {
      node = node.previousSibling;
      if (node.nodeType === Node.TEXT_NODE) {
        totalOffset += node.textContent?.length || 0;
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        totalOffset += (node as HTMLElement).innerText.length;
      }
    }
    return totalOffset;
  };

  // Function to merge overlapping or adjacent highlights
  const mergeHighlights = (highlights: HighlightedText[]): HighlightedText[] => {
    if (highlights.length === 0) return [];

    const merged: HighlightedText[] = [];
    highlights.sort((a, b) => a.start - b.start);

    let currentHighlight: HighlightedText = highlights[0];

    for (let i = 1; i < highlights.length; i++) {
      const nextHighlight = highlights[i];
      if (nextHighlight.start <= currentHighlight.end) {
        // Merge overlapping or adjacent highlights
        currentHighlight.end = Math.max(currentHighlight.end, nextHighlight.end);
      } else {
        merged.push(currentHighlight);
        currentHighlight = nextHighlight;
      }
    }

    merged.push(currentHighlight);
    return merged;
  };

  // Render the text with highlights
  const renderHighlightedText = (text: string): JSX.Element[] => {
    const highlights = mergeHighlights(highlighted);
    console.log('Text Length:', text.length);
    console.log('Highlights:', highlights);
    
    let lastIndex = 0;
    const parts: JSX.Element[] = [];

    highlights.forEach(({ start, end }, index) => {
        start = start + lastIndex
        end = end + lastIndex
      if (start > lastIndex) {
        parts.push(
        <span key={`text-${index}-before`}>
            {text.slice(lastIndex, start)}
            </span>);
      }
      parts.push(
        <mark key={`highlight-${index}`} style={{ backgroundColor: 'yellow' }}>
          {text.slice(start, end)}
        </mark>
      );
      lastIndex = end;
    });

    if (lastIndex < text.length) {
        parts.push(
        <span key="text-after">
          {text.slice(lastIndex)}
        </span>);
      }

    return parts;
  };

  return (
    <div>
      <p><i>Highlight text to add comments</i></p>
      <div
        style={{ border: '1px solid #ccc', padding: '10px', minHeight: '150px', whiteSpace: 'pre-wrap' }}
        onMouseUp={handleTextSelection}
      >
        {renderHighlightedText(text)}
      </div>
    </div>
  );
};

export default TranscriptEditor;
