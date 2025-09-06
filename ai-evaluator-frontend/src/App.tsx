import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { DocumentsPage } from './pages/DocumentsPage';
import { EvaluationPage } from './pages/EvaluationPage';
import { Dashboard } from './components/Dashboard';
import { AuthProvider } from './auth/AuthProvider';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <ProtectedRoute>
            <Routes>
              <Route path="/" element={<DocumentsPage />} />
              <Route path="/evaluate/:id" element={<EvaluationPage />} />
              <Route path="/dashboard" element={<Dashboard />} />
            </Routes>
          </ProtectedRoute>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;