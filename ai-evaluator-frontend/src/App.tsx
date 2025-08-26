import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { DocumentsPage } from './pages/DocumentsPage';
import { EvaluationPage } from './pages/EvaluationPage';
import { Dashboard } from './components/Dashboard';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<DocumentsPage />} />
          <Route path="/evaluate/:id" element={<EvaluationPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;