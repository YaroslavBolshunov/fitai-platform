import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Repeat,
  Clock,
  Layers,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { fetchWorkoutById } from '../api/api';
import Loader from '../components/Loader';
import './WorkoutPage.css';

const WorkoutPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [workout, setWorkout] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchWorkoutById(id)
      .then(setWorkout)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Loader />;
  if (error || !workout) {
    return (
      <div className="workout-detail">
        <Link to="/workouts" className="workout-back">
          <ArrowLeft size={16} />
          <span>Назад к базе упражнений</span>
        </Link>
        <p className="workout-not-found">
          {error ? `Ошибка загрузки: ${error}` : 'Упражнение не найдено.'}
        </p>
      </div>
    );
  }

  const handleAskCoach = () => {
    navigate('/chat', {
      state: {
        initialPrompt: `Разбери технику, ключевые ошибки и предложи замену для упражнения: ${workout.name}`,
      },
    });
  };

  return (
    <div className="workout-detail">
      <div className="workout-detail-nav">
        <Link to="/workouts" className="workout-back">
          <ArrowLeft size={16} />
          <span>Назад к базе упражнений</span>
        </Link>

        <button type="button" className="workout-ai-btn" onClick={handleAskCoach}>
          <Sparkles size={15} />
          <span>Разобрать с ИИ-тренером</span>
        </button>
      </div>

      <div className="workout-detail-header">
        <div className="workout-detail-badges">
          <span className="workout-detail-cat">{workout.category}</span>
          <span className="workout-detail-diff">Сложность: {workout.difficulty}</span>
        </div>

        <h1 className="workout-detail-title">{workout.name}</h1>

        <div className="workout-detail-metrics">
          <div className="workout-detail-metric">
            <Repeat size={15} className="workout-detail-icon" />
            <span>Режим: {workout.setsReps}</span>
          </div>
          <div className="workout-detail-metric">
            <Clock size={15} className="workout-detail-icon" />
            <span>Время: ~{workout.durationMinutes} мин</span>
          </div>
          <div className="workout-detail-metric">
            <Layers size={15} className="workout-detail-icon" />
            <span>Инвентарь: {workout.equipment.join(', ')}</span>
          </div>
        </div>
      </div>

      <div className="workout-detail-card">
        <h2 className="workout-detail-section-title">Целевые мышечные группы</h2>
        <div className="workout-detail-tags">
          {workout.muscles.map((m) => (
            <span key={m} className="workout-detail-tag">
              {m}
            </span>
          ))}
        </div>
      </div>

      <div className="workout-detail-card">
        <h2 className="workout-detail-section-title">
          <CheckCircle2 size={18} className="workout-detail-icon" />
          <span>Пошаговая техника выполнения</span>
        </h2>
        <ol className="workout-detail-steps">
          {workout.steps.map((step, i) => (
            <li key={i}>{step}</li>
          ))}
        </ol>
      </div>

      {workout.mistakes && workout.mistakes.length > 0 && (
        <div className="workout-detail-card workout-detail-card-warn">
          <h2 className="workout-detail-section-title workout-detail-warn-title">
            <AlertTriangle size={18} />
            <span>Частые ошибки и травмоопасные моменты</span>
          </h2>
          <ul className="workout-detail-mistakes">
            {workout.mistakes.map((mistake, i) => (
              <li key={i}>{mistake}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default WorkoutPage;