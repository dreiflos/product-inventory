import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import ProductionDashboard from './pages/ProductionDashboard.jsx';
import ProductsPage from './pages/ProductsPage.jsx';
import RawMaterialsPage from './pages/RawMaterialsPage.jsx';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<ProductionDashboard />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="materials" element={<RawMaterialsPage />} />
      </Route>
    </Routes>
  );
}

export default App;