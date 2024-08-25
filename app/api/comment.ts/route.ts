import type { NextApiRequest, NextApiResponse } from 'next';

const commentsDatabase = {}; // Temporary in-memory storage

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { audioId, text, comment } = req.body;

  if (req.method === 'POST') {
    if (!commentsDatabase[audioId]) commentsDatabase[audioId] = [];
    commentsDatabase[audioId].push({ text, comment });
    res.status(200).json({ message: 'Comment added' });
  } else if (req.method === 'GET') {
    res.status(200).json(commentsDatabase[audioId] || []);
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}
