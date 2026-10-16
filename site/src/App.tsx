import { Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Contact } from './pages/Contact';
import { Dealership } from './pages/Dealership';
import { Home } from './pages/Home';
import { NotFound } from './pages/NotFound';
import { ProductPage } from './pages/Product';
import { Products } from './pages/Products';
import { Support } from './pages/Support';

export function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/category/:category" element={<Products />} />
        <Route path="/products/:slug" element={<ProductPage />} />
        <Route path="/dealership" element={<Dealership />} />
        <Route path="/support" element={<Support />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
