// src/App.tsx

import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';

const API_BASE = 'http://localhost:3000';

interface Note {
  _id: string;
  author?: string;
  content: string;
  color?: string;
  createdAt: string;
}

function formatDate(iso: string) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function App() {
  console.log('✅ App component 被 render 了');

  const [notes, setNotes] = useState<Note[]>([]);
  const [author, setAuthor] = useState('');
  const [content, setContent] = useState('');
  const [loadingList, setLoadingList] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 從後端抓留言
  const fetchNotes = async () => {
    try {
      console.log('📥 正在向後端抓留言...');
      setLoadingList(true);
      setError(null);
      const res = await fetch(`${API_BASE}/api/notes`);
      console.log('📥 GET /api/notes 狀態碼:', res.status);
      const data = await res.json();
      console.log('📥 抓到的留言:', data);
      setNotes(data);
    } catch (err) {
      console.error('❌ 取得留言失敗', err);
      setError('載入留言失敗，稍後再試一次');
    } finally {
      setLoadingList(false);
    }
  };

  // 頁面一載入就抓一次
  useEffect(() => {
    console.log('🔁 useEffect 初次載入，呼叫 fetchNotes');
    fetchNotes();
  }, []);

  // 送出留言
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('🟡 handleSubmit 被呼叫了！目前內容:', {
      author,
      content,
    });

    if (!content.trim()) {
      alert('請先輸入留言內容');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      console.log('📤 準備送出到後端:', {
        author,
        content,
      });

      const res = await fetch(`${API_BASE}/api/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          author,
          content,
          color: '#ffeb3b',
        }),
      });

      console.log('📤 POST /api/notes 狀態碼:', res.status);

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        console.error('❌ 後端錯誤內容:', errData);
        throw new Error(errData.error || '送出失敗');
      }

      setAuthor('');
      setContent('');

      await fetchNotes();
    } catch (err) {
      console.error('❌ 送出留言失敗', err);
      setError((err as Error).message || '送出留言失敗');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="app">
      <h1>便利貼留言牆</h1>

      <form className="note-form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="姓名（可留空）"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
        />
        <textarea
          placeholder="寫一則留言吧～"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={3}
        />
        <button
          type="submit"
          disabled={submitting}
          onClick={() => console.log('🟠 按鈕被點擊')}
        >
          {submitting ? '送出中…' : '送出'}
        </button>
      </form>

      {error && <p className="error">{error}</p>}

      {loadingList ? (
        <p>留言載入中…</p>
      ) : notes.length === 0 ? (
        <p>目前還沒有留言，來當第一個吧！</p>
      ) : (
        <div className="note-list">
          {notes.map((note) => (
            <div key={note._id} className="note-card">
              <div className="note-header">
                <span className="note-author">
                  {note.author?.trim() || '匿名'}
                </span>
                <span className="note-time">
                  {note.createdAt && formatDate(note.createdAt)}
                </span>
              </div>
              <div className="note-content">{note.content}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;
