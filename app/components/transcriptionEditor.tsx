import React, { useState } from 'react';
import { Popover, OverlayTrigger, Button, Modal, Form } from 'react-bootstrap';

interface TranscriptEditorProps {
  text: string;
}

interface HighlightedText {
  start: number;
  end: number;
  comment: string;
  type: 'positive' | 'negative';
}

const TranscriptEditor: React.FC<TranscriptEditorProps> = ({ text }) => {
  const [highlighted, setHighlighted] = useState<HighlightedText[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [currentComment, setCurrentComment] = useState('');
  const [currentType, setCurrentType] = useState<'positive' | 'negative'>('positive');
  const [selectionRange, setSelectionRange] = useState<{ start: number; end: number } | null>(null);

  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.toString()) {
      const range = selection.getRangeAt(0);
      const start = calculateGlobalOffset(range.startContainer, range.startOffset);
      const end = calculateGlobalOffset(range.endContainer, range.endOffset);

      if (start !== end) {
        setSelectionRange({ 
            start: Math.min(start, end), 
            end: Math.max(start, end) });
        setShowModal(true); // Show modal for user input
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

  const mergeHighlights = (highlights: HighlightedText[]): HighlightedText[] => {
    if (highlights.length === 0) return [];

    const merged: HighlightedText[] = [];
    highlights.sort((a, b) => a.start - b.start);

    let currentHighlight: HighlightedText = highlights[0];

    for (let i = 1; i < highlights.length; i++) {
      const nextHighlight = highlights[i];
      if (nextHighlight.start <= currentHighlight.end) {
        currentHighlight.end = Math.max(currentHighlight.end, nextHighlight.end);
      } else {
        merged.push(currentHighlight);
        currentHighlight = nextHighlight;
      }
    }

    merged.push(currentHighlight);
    return merged;
  };

  const renderHighlightedText = (text: string): JSX.Element[] => {
    const highlights = mergeHighlights(highlighted);
    let lastIndex = 0;
    const parts: JSX.Element[] = [];

    highlights.forEach(({ start, end, comment, type }, index) => {
      if (start > lastIndex) {
        parts.push(
          <span key={`text-${index}-before`}>
            {text.slice(lastIndex, start)}
            </span>
        );
      }
      parts.push(
        <OverlayTrigger
          key={`highlight-${index}`}
          placement="top"
          overlay={
            <Popover>
              <Popover.Body>
                <strong>
                    {type.toUpperCase()}
                </strong>: {comment}
              </Popover.Body>
            </Popover>
          }
        >
          <mark
            style={{
              backgroundColor: type === 'positive' ? 'lightgreen' : 'lightcoral',
            }}
          >
            {text.slice(start, end)}
          </mark>
        </OverlayTrigger>
      );
      lastIndex = end;
    });

    if (lastIndex < text.length) {
      parts.push(<span key="text-after">{text.slice(lastIndex)}</span>);
    }

    return parts;
  };

  const handleCommentSubmit = () => {
    if (selectionRange) {
      const newHighlight: HighlightedText = {
        start: selectionRange.start,
        end: selectionRange.end,
        comment: currentComment,
        type: currentType,
      };
      setHighlighted((prevHighlights) => {
        const updatedHighlights = mergeHighlights([...prevHighlights, newHighlight]);
        return updatedHighlights;
      });
      setCurrentComment('');
      setSelectionRange(null);
      setShowModal(false);
    }
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

      {/* Modal for adding comments */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add Comment</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="commentText">
              <Form.Label>Comment</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter your comment"
                value={currentComment}
                onChange={(e) => setCurrentComment(e.target.value)}
              />
            </Form.Group>
            <Form.Group controlId="commentType">
              <Form.Label>Type</Form.Label>
              <Form.Check
                type="radio"
                label="Positive"
                name="commentType"
                value="positive"
                checked={currentType === 'positive'}
                onChange={() => setCurrentType('positive')}
              />
              <Form.Check
                type="radio"
                label="Negative"
                name="commentType"
                value="negative"
                checked={currentType === 'negative'}
                onChange={() => setCurrentType('negative')}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleCommentSubmit}>
            Save Comment
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default TranscriptEditor;
