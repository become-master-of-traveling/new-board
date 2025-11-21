import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); 

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/sticky_wall';

mongoose
  .connect(mongoUri)
  .then(() => console.log('已連線 MongoDB'))
  .catch((err) => console.error(err));

const noteSchema = new mongoose.Schema(
  {
    author: String,
    content: { type: String, required: true },
    color: String,
  },
  { timestamps: true }
);

const Note = mongoose.model('Note', noteSchema);

app.get('/api/notes', async (req, res) => {
  const notes = await Note.find().sort({ createdAt: -1 });
  res.json(notes);
});

app.post('/api/notes', async (req, res) => {
  try {
    console.log('收到的 body:', req.body);

    const { author, content, color } = req.body;
    if (!content) {
      return res.status(400).json({ error: 'content 為必填' });
    }

    const note = await Note.create({ author, content, color });
    res.status(201).json(note);
  } catch (err) {
    console.error('新增留言錯誤：', err);
    res.status(500).json({ error: '新增留言失敗' });
  }
});

app.delete('/api/notes/:id', async (req, res) => {
  try {
    const id = req.params.id;
    console.log('刪除請求 id:', id);

    const deleted = await Note.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ error: '找不到這則留言' });
    }

    res.json({ message: '已刪除' });
  } catch (err) {
    console.error('刪除留言錯誤：', err);
    res.status(500).json({ error: '刪除留言失敗' });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`伺服器運作在 http://localhost:${PORT}`);
});
