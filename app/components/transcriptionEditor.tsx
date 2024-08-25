import React, { useState } from 'react';
import { Popover, OverlayTrigger, Button, Modal, Form } from 'react-bootstrap';
import { v4 as uuidv4 } from 'uuid';

interface TranscriptEditorProps {
  text: string;
}

interface HighlightedText {
  id: string;
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
  const [editingHighlightId, setEditingHighlightId] = useState<string | null>(null);

  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.toString()) {
      const range = selection.getRangeAt(0);
      const start = calculateGlobalOffset(range.startContainer, range.startOffset);
      const end = calculateGlobalOffset(range.endContainer, range.endOffset);

      console.log('Selection Text:', selection.toString());
      console.log('Start Offset:', start);
      console.log('End Offset:', end);

      if (start !== end) {
        setSelectionRange({ 
            start: Math.min(start, end), 
            end: Math.max(start, end) });
        
        setCurrentComment('');
        setCurrentType('positive');
        setEditingHighlightId(null);
        setShowModal(true);
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
    console.log('Total Offset:', totalOffset);
    return totalOffset;
  };

  const mergeHighlights = (highlights: HighlightedText[]): HighlightedText[] => {
    if (highlights.length === 0) return [];

    const merged: HighlightedText[] = [];
    highlights.sort((a, b) => a.start - b.start);

    let currentHighlight: HighlightedText = highlights[0];

    for (let i = 1; i < highlights.length; i++) {
      const nextHighlight = highlights[i];
      if (nextHighlight.start <= currentHighlight.end && nextHighlight.start > currentHighlight.start) {
        currentHighlight.end = Math.max(currentHighlight.end, nextHighlight.end);
        //currentHighlight.comment += `; ${nextHighlight.comment}`;
    } else {
        merged.push(currentHighlight);
        currentHighlight = nextHighlight;
      }
    }

    merged.push(currentHighlight);
    console.log('Merged Highlights:', merged);
    return merged;
  };

  const renderHighlightedText = (text: string): JSX.Element[] => {
    const highlights = mergeHighlights(highlighted);
    let lastIndex = 0;
    const parts: JSX.Element[] = [];

    highlights.forEach(({ start, end, comment, type, id }, index) => {
      console.log(`Rendering highlight ${index}: Start = ${start}, End = ${end}`);
      start = start + lastIndex
      end = end + lastIndex
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
            key={`highlight-${index}`}
            style={{
              backgroundColor: type === 'positive' ? 'lightgreen' : 'lightcoral',
              cursor: 'pointer'
            }}
            onClick={() => handleHighlightClick(id)}
          >
            {text.slice(start, end)}
          </mark>
        </OverlayTrigger>
      );
      lastIndex = end;
    });

    if (lastIndex < text.length) {
      parts.push(<span key="text-after">
        {text.slice(lastIndex)}
        </span>);
    }

    console.log('Rendered Parts:', parts);
    return parts;
  };

  const handleCommentSubmit = () => {
    if (editingHighlightId) {
        setHighlighted((prevHighlights) => prevHighlights.map((highlight) =>
            highlight.id === editingHighlightId
              ? { ...highlight, comment: currentComment, type: currentType }
              : highlight
          ));
    }
    else {
      const newHighlight: HighlightedText = {
        id: uuidv4(),
        start: selectionRange!.start,
        end: selectionRange!.end,
        comment: currentComment,
        type: currentType,
      };
      console.log('New Highlight to Add:', newHighlight);

      setHighlighted((prevHighlights) => {
        const updatedHighlights = mergeHighlights([...prevHighlights, newHighlight]);
        console.log('Updated Highlights after Addition:', updatedHighlights);
        return updatedHighlights;
      })};
      setCurrentComment('');
      setSelectionRange(null);
      setShowModal(false);
  };

  const handleHighlightClick = (id: string) => {
    const highlight = highlighted.find((h) => h.id === id);
    if (highlight) {
      setCurrentComment(highlight.comment);
      setCurrentType(highlight.type);
      setEditingHighlightId(id);
      setShowModal(true);
    }
  };

  const handleDeleteHighlight = (id: string) => {
    setHighlighted((prevHighlights) => prevHighlights.filter((highlight) => highlight.id !== id));
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


      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{editingHighlightId ? 'Edit Comment' : 'Add Comment'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="commentText">
              <Form.Label>Comment</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter your comment"
                required
                value={currentComment}
                onChange={(e) => setCurrentComment(e.target.value)}
              />
            </Form.Group>
            <Form.Group controlId="commentType">
              <Form.Label>Type</Form.Label>
              <Form.Control
                as="select"
                value={currentType}
                onChange={(e) => setCurrentType(e.target.value as 'positive' | 'negative')}
              >
                <option value="positive">Positive</option>
                <option value="negative">Negative</option>
              </Form.Control>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleCommentSubmit}>
            Save
          </Button>
          {editingHighlightId && (
            <Button variant="danger" onClick={() => {
              handleDeleteHighlight(editingHighlightId);
              setShowModal(false);
            }}>
              Delete
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default TranscriptEditor;
