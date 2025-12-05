// server/routes/signup.js
import express from 'express';
import {
  createParticipant,
  listParticipants,
  updateParticipant,
  deleteParticipant
} from '../repositories/participants.js';

const router = express.Router();

router.post('/', async (req, res, next) => {
  try {
    const { name, email, phone } = req.body;
    if (!name || !email || !phone) {
      return res.status(400).json({ error: '缺少必要欄位' });
    }
    const id = await createParticipant({ name, email, phone });
    res.status(201).json({ id });
  } catch (error) {
    next(error);
  }
});

router.get('/', async (req, res, next) => {
  try {
    const participants = await listParticipants();
    res.json({ items: participants, total: participants.length });
  } catch (error) {
    next(error);
  }
});

router.patch('/:id', async (req, res, next) => {
  try {
    const result = await updateParticipant(req.params.id, req.body);
    if (!result.matchedCount) {
      return res.status(404).json({ error: '找不到資料' });
    }
    res.json({ updated: result.modifiedCount });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const result = await deleteParticipant(req.params.id);
    if (!result.deletedCount) {
      return res.status(404).json({ error: '找不到資料' });
    }
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

export default router;
