import { NavLink, useParams } from 'react-router-dom';
import { categories, categoryName, content, findCategory, products } from '../content';
import { Heading } from '../components/Heading';
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
          <Heading as="h1" np={category ? undefined : content.nepali?.products}>
            {category ? findCategory(category)?.seoName ?? categoryName(category) : 'Our products'}
          </Heading>
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
        {category && findCategory(category)?.intro && <p className="lead category-intro">{findCategory(category)?.intro}</p>}
        <ProductGrid items={shown} />
      </div>
    </section>
  );
}
