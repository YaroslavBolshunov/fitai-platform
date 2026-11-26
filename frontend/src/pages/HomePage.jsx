import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  BookOpen,
  ArrowUpRight,
  Send,
  Dumbbell,
  Layers,
  Zap,
} from 'lucide-react';
import { fetchWorkouts } from '../api/api';
import { WORKOUT_CATEGORIES } from '../data/constants';
import './HomePage.css';

const QUICK_HINTS = [
  'Спросите тренера, например: «Составь тренировку на грудь и спину»...',
  'Спросите тренера, например: «Какие упражнения сделать на ноги с гантелями?»...',
  'Спросите тренера, например: «Разбери частые ошибки в румынской тяге»...',
  'Спросите тренера, например: «Подбери упражнения на плечи и пресс за 15 минут»...',
  'Спросите тренера, например: «Как правильно выполнять жим на наклонной скамье?»...',
  'Спросите тренера, например: «Составь сплит на всё тело для набора массы»...',
];

const HomePage = () => {
  const [quickQuery, setQuickQuery] = useState('');
  const [hintIndex, setHintIndex] = useState(0);
  const [hintVisible, setHintVisible] = useState(true);
  const [workoutsCount, setWorkoutsCount] = useState(6);
  const navigate = useNavigate();

  useEffect(() => {
    fetchWorkouts()
      .then((data) => setWorkoutsCount(data.length))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (quickQuery) return;

    const interval = setInterval(() => {
      setHintVisible(false);
      setTimeout(() => {
        setHintIndex((prev) => (prev + 1) % QUICK_HINTS.length);
        setHintVisible(true);
      }, 280);
    }, 5000);

    return () => clearInterval(interval);
  }, [quickQuery]);

  const handleQuickSubmit = (e) => {
    e.preventDefault();
    const trimmed = quickQuery.trim();
    if (!trimmed) {
      navigate('/chat');
      return;
    }
    navigate('/chat', { state: { initialPrompt: trimmed } });
  };

  const categoriesCount = WORKOUT_CATEGORIES.length - 1;

  return (
    <div className="home">
      <div className="home-hero">
        <div className="home-badge">
          <Sparkles size={14} />
          <span>Интеллектуальная база знаний • Спорт и тренировки</span>
        </div>

        <h1 className="home-title">
          Персональный <span className="home-title-accent">ИИ-тренер</span> и каталог упражнений
        </h1>

        <p className="home-subtitle">
          Составляйте программы тренировок под свои цели, оттачивайте технику и подбирайте
          упражнения под доступный инвентарь.
        </p>

        <form className="home-quick-form" onSubmit={handleQuickSubmit}>
          <div className="home-quick-input-wrap">
            {!quickQuery && (
              <span
                className={`home-quick-placeholder ${
                  hintVisible ? 'home-quick-placeholder-visible' : ''
                }`}
              >
                {QUICK_HINTS[hintIndex]}
              </span>
            )}
            <input
              type="text"
              className="home-quick-input"
              value={quickQuery}
              onChange={(e) => setQuickQuery(e.target.value)}
            />
          </div>
          <button type="submit" className="home-quick-btn" title="Перейти в чат">
            <span>Спросить</span>
            <Send size={15} />
          </button>
        </form>
      </div>

      <div className="home-stats">
        <div className="home-stat-item">
          <Dumbbell size={16} className="home-stat-icon" />
          <span>
            <strong>{workoutsCount}</strong> упражнений в базе
          </span>
        </div>
        <div className="home-stat-divider" />
        <div className="home-stat-item">
          <Layers size={16} className="home-stat-icon" />
          <span>
            <strong>{categoriesCount}</strong> мышечных групп
          </span>
        </div>
        <div className="home-stat-divider" />
        <div className="home-stat-item">
          <Zap size={16} className="home-stat-icon" />
          <span>Умный поиск по технике и ошибкам</span>
        </div>
      </div>

      <div className="home-cards">
        <Link to="/chat" className="home-card">
          <div className="home-card-top">
            <div className="home-card-icon">
              <Sparkles size={20} />
            </div>
            <ArrowUpRight size={18} className="home-card-arrow" />
          </div>
          <h2 className="home-card-title">Чат с ИИ-тренером</h2>
          <p className="home-card-text">
            Умный ассистент соберёт программу тренировок под ваши задачи, подскажет правильную
            технику и подберёт подходящие упражнения из базы знаний.
          </p>
        </Link>

        <Link to="/workouts" className="home-card">
          <div className="home-card-top">
            <div className="home-card-icon">
              <BookOpen size={20} />
            </div>
            <ArrowUpRight size={18} className="home-card-arrow" />
          </div>
          <h2 className="home-card-title">База упражнений</h2>
          <p className="home-card-text">
            Структурированный справочник с фильтрацией по группам мышц, инвентарю, пошаговой
            техникой и списком частых ошибок.
          </p>
        </Link>
      </div>
    </div>
  );
};

export default HomePage;