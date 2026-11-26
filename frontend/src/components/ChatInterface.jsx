import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import {
  Send,
  Sparkles,
  User,
  Dumbbell,
  ArrowUpRight,
  RotateCcw,
  Copy,
  Check,
} from 'lucide-react';
import { askCoachStream } from '../api/api';
import { SUGGESTED_PROMPTS } from '../data/constants';
import './ChatInterface.css';

const ChatInterface = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  const bottomRef = useRef(null);
  const textareaRef = useRef(null);
  const initialHandledRef = useRef(false);
  const location = useLocation();
  const navigate = useNavigate();

  const isBusy = loading || streaming;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [input]);

  const sendMessage = async (textToSend) => {
    const trimmed = textToSend.trim();
    if (!trimmed || isBusy) return;

    const userMsg = {
      id: Date.now().toString(),
      role: 'user',
      content: trimmed,
    };

    const botMsgId = (Date.now() + 1).toString();
    const initialBotMsg = {
      id: botMsgId,
      role: 'assistant',
      content: '',
      sources: [],
    };

    setMessages((prev) => [...prev, userMsg, initialBotMsg]);
    setInput('');
    setLoading(true);
    setStreaming(true);

    try {
      await askCoachStream(trimmed, {
        onChunk: (chunk) => {
          setLoading(false);
          setMessages((prev) =>
            prev.map((m) =>
              m.id === botMsgId ? { ...m, content: m.content + chunk } : m
            )
          );
        },
        onSources: (sources) => {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === botMsgId ? { ...m, sources } : m
            )
          );
        },
      });
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === botMsgId
            ? {
                ...m,
                content: 'Не удалось связаться с моделью. Проверьте подключение или настройки API.',
                sources: [],
              }
            : m
        )
      );
    } finally {
      setLoading(false);
      setStreaming(false);
    }
  };

  useEffect(() => {
    const incomingPrompt = location.state?.initialPrompt;
    if (incomingPrompt && !initialHandledRef.current) {
      initialHandledRef.current = true;
      navigate(location.pathname, { replace: true, state: {} });
      sendMessage(incomingPrompt);
    }
  }, [location, navigate]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      if (e.ctrlKey || e.shiftKey) {
        e.preventDefault();
        const { selectionStart, selectionEnd } = e.target;
        const nextValue =
          input.slice(0, selectionStart) + '\n' + input.slice(selectionEnd);
        setInput(nextValue);
        requestAnimationFrame(() => {
          if (textareaRef.current) {
            textareaRef.current.selectionStart = selectionStart + 1;
            textareaRef.current.selectionEnd = selectionStart + 1;
          }
        });
        return;
      }

      e.preventDefault();
      if (!isBusy) {
        sendMessage(input);
      }
    }
  };

  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const handleReset = () => {
    if (isBusy) return;
    setMessages([]);
    setInput('');
  };

  return (
    <div className="chat-shell">
      {messages.length > 0 && (
        <div className="chat-topbar">
          <div className="chat-topbar-info">
            <Sparkles size={15} className="chat-topbar-icon" />
            <span>ИИ-Тренер • Поиск по базе знаний</span>
          </div>
          <button
            type="button"
            className="chat-reset-btn"
            onClick={handleReset}
            disabled={isBusy}
          >
            <RotateCcw size={14} />
            <span>Новый диалог</span>
          </button>
        </div>
      )}

      <div className="chat-messages">
        {messages.length === 0 ? (
          <div className="chat-welcome">
            <div className="chat-welcome-icon">
              <Sparkles size={24} />
            </div>
            <h1 className="chat-welcome-title">Чем помочь с тренировкой?</h1>
            <p className="chat-welcome-sub">
              Спросите о технике выполнения, разборе ошибок или попросите собрать программу на
              нужную группу мышц.
            </p>

            <div className="chat-suggestions">
              {SUGGESTED_PROMPTS.map((item) => (
                <button
                  key={item.title}
                  type="button"
                  className="chat-suggestion-card"
                  onClick={() => sendMessage(item.prompt)}
                >
                  <span className="chat-suggestion-title">{item.title}</span>
                  <span className="chat-suggestion-text">{item.prompt}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="chat-thread">
            {messages
              .filter((m) => m.role === 'user' || m.content)
              .map((m) => (
                <div
                  key={m.id}
                  className={`chat-row ${m.role === 'user' ? 'chat-row-user' : 'chat-row-bot'}`}
                >
                  {m.role === 'assistant' && (
                    <div className="chat-avatar chat-avatar-bot">
                      <Sparkles size={16} />
                    </div>
                  )}

                  <div className="chat-content-col">
                    <div
                      className={`chat-bubble ${
                        m.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-bot'
                      }`}
                    >
                      {m.role === 'assistant' ? (
                        <div className="chat-markdown">
                          <ReactMarkdown>{m.content}</ReactMarkdown>
                        </div>
                      ) : (
                        m.content
                      )}
                    </div>

                    {m.role === 'assistant' && !isBusy && (
                      <div className="chat-msg-actions">
                        <button
                          type="button"
                          className="chat-copy-btn"
                          onClick={() => handleCopy(m.id, m.content)}
                          title="Скопировать ответ"
                        >
                          {copiedId === m.id ? <Check size={13} /> : <Copy size={13} />}
                          <span>{copiedId === m.id ? 'Скопировано' : 'Копировать'}</span>
                        </button>
                      </div>
                    )}

                    {m.sources && m.sources.length > 0 && (
                      <div className="chat-sources">
                        <span className="chat-sources-label">Найдено в базе упражнений:</span>
                        <div className="chat-sources-grid">
                          {m.sources.map((src) => (
                            <Link
                              key={src.id}
                              to={`/workouts/${src.id}`}
                              className="chat-source-card"
                            >
                              <div className="chat-source-top">
                                <Dumbbell size={14} className="chat-source-icon" />
                                <span className="chat-source-cat">{src.category}</span>
                                <ArrowUpRight size={14} className="chat-source-arrow" />
                              </div>
                              <div className="chat-source-name">{src.name}</div>
                              <div className="chat-source-meta">{src.setsReps}</div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {m.role === 'user' && (
                    <div className="chat-avatar chat-avatar-user">
                      <User size={16} />
                    </div>
                  )}
                </div>
              ))}

            {loading && (
              <div className="chat-row chat-row-bot">
                <div className="chat-avatar chat-avatar-bot">
                  <Sparkles size={16} />
                </div>
                <div className="chat-typing">
                  <span className="chat-typing-dot" />
                  <span className="chat-typing-dot" />
                  <span className="chat-typing-dot" />
                  <span className="chat-typing-text">Анализирую базу и составляю ответ...</span>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>
        )}
      </div>

      <div className="chat-input-dock">
        <div className="chat-input-box">
          <textarea
            ref={textareaRef}
            rows={1}
            className="chat-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Задайте ваш вопрос ИИ-тренеру..."
          />
          <button
            type="button"
            className="chat-send"
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || isBusy}
            title="Отправить (Enter)"
          >
            <Send size={16} />
          </button>
        </div>
        <div className="chat-disclaimer">
          Ответы формируются на основе локальной базы упражнений FitAI
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;