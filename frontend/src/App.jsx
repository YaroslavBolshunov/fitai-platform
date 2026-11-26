import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import ChatPage from './pages/ChatPage';
import WorkoutsPage from './pages/WorkoutsPage';
import WorkoutPage from './pages/WorkoutPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="chat" element={<ChatPage />} />
        <Route path="workouts" element={<WorkoutsPage />} />
        <Route path="workouts/:id" element={<WorkoutPage />} />
      </Route>
    </Routes>
  );
}

export default App;