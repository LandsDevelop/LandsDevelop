// controllers/chatController.js
import db from '../db.js';

export const handleChatMessage = async (req, res) => {
  const { message } = req.body;
  const q = message.toLowerCase();

  try {
    let query = 'SELECT * FROM properties';
    const whereClauses = [];

    if (q.includes('villa')) whereClauses.push(`development_type LIKE '%villa%'`);
    if (q.includes('rera')) whereClauses.push('rera_approved = 1');

    const locMatch = q.match(/in\s+([a-zA-Z\s]+)/);
    if (locMatch) {
      const location = locMatch[1].trim();
      whereClauses.push(`location LIKE '%${location}%'`);
    }

    if (whereClauses.length > 0) {
      query += ' WHERE ' + whereClauses.join(' AND ');
    }

    const [rows] = await db.query(query);

    if (rows.length === 0) {
      return res.json({ reply: "Sorry, no matching properties found." });
    }

    const reply = rows.slice(0, 5).map(
      p => `• ${p.title} in ${p.location} (${p.total_area} sq yards)`
    ).join('\n');

    res.json({ reply: `Found ${rows.length} project(s):\n${reply}` });
  } catch (err) {
    console.error('Chat error:', err);
    res.status(500).json({ reply: 'Server error.' });
  }
};
