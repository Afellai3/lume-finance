import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { SafeAreaProvider } from './context/SafeAreaContext';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Movimenti from './pages/Movimenti';
import Conti from './pages/Conti';
import Budget from './pages/Budget';
import Obiettivi from './pages/Obiettivi';
import Beni from './pages/Beni';
import BeneDetail from './pages/BeneDetail';
import Categorie from './pages/Categorie';
import Ricorrenze from './pages/Ricorrenze';
import Impostazioni from './pages/Impostazioni';
import FAQ from './pages/FAQ';
import './App.css';

function App() {
  return (
    <SafeAreaProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="movimenti" element={<Movimenti />} />
            <Route path="conti" element={<Conti />} />
            <Route path="budget" element={<Budget />} />
            <Route path="obiettivi" element={<Obiettivi />} />
            <Route path="beni" element={<Beni />} />
            <Route path="beni/:id" element={<BeneDetail />} />
            <Route path="categorie" element={<Categorie />} />
            <Route path="ricorrenze" element={<Ricorrenze />} />
            <Route path="impostazioni" element={<Impostazioni />} />
            <Route path="faq" element={<FAQ />} />
          </Route>
        </Routes>
      </Router>
    </SafeAreaProvider>
  );
}

export default App;
