import { Link } from 'react-router-dom';
import { Clock, Repeat, Layers, ArrowUpRight } from 'lucide-react';
import './WorkoutCard.css';

const RecipeCard = ({ workout }) => (
  <Link to={`/workouts/${workout.id}`} className="workout-card">
    <div className="workout-card-top">
      <span className="workout-card-category">{workout.category}</span>
      <span className="workout-card-diff">{workout.difficulty}</span>
    </div>

    <h3 className="workout-card-title">{workout.name}</h3>

    <div className="workout-card-metrics">
      <span className="workout-card-metric">
        <Repeat size={13} />
        {workout.setsReps}
      </span>
      <span className="workout-card-metric">
        <Clock size={13} />
        {workout.durationMinutes} мин
      </span>
    </div>

    <div className="workout-card-muscles">
      {workout.muscles.slice(0, 3).map((muscle) => (
        <span key={muscle} className="workout-card-tag">
          {muscle}
        </span>
      ))}
    </div>

    <div className="workout-card-footer">
      <span className="workout-card-equip">
        <Layers size={13} />
        {workout.equipment.join(', ')}
      </span>
      <ArrowUpRight size={16} className="workout-card-arrow" />
    </div>
  </Link>
);

export default RecipeCard;