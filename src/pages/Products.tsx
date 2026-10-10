import { NavLink, useParams } from 'react-router-dom';
import { categories, categoryName, products } from '../content';
import { ProductGrid } from '../components/ProductCard';
import { NotFound } from './NotFound';

export function Products() {
  const { category } = useParams();
  if (category && !categories.some((c) => c.slug === category)) return <NotFound />;
  const shown = category ? products.filter((p) => p.category === category) : products;

  return (
    <section className="section page-top">
      <div className="container">
        <div className="section-head">
          <h1>{category ? categoryName(category) : 'Our products'}</h1>
          <nav className="tabs" aria-label="Kinds of product">
            <NavLink to="/products/" end className="tab">
              All
            </NavLink>
            {categories.map((c) => (
              <NavLink key={c.slug} to={`/products/category/${c.slug}/`} className="tab">
                {c.name}
              </NavLink>
            ))}
          </nav>
        </div>
        <ProductGrid items={shown} />
      </div>
    </section>
  );
}
