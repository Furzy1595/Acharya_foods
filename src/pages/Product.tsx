import { Link, useParams } from 'react-router-dom';
import { categoryName, findProduct, formatPrice, products } from '../content';
import { Picture } from '../components/Picture';
import { ProductGrid } from '../components/ProductCard';
import { NotFound } from './NotFound';

export function ProductPage() {
  const { slug } = useParams();
  const product = findProduct(slug);
  if (!product) return <NotFound />;
  const price = formatPrice(product.price);
  const related = products.filter((p) => p.category === product.category && p.id !== product.id);
  const others = related.length > 0 ? related : products.filter((p) => p.id !== product.id).slice(0, 3);

  return (
    <>
      <section className="section page-top product">
        <div className="container">
          <nav className="crumbs" aria-label="You are here">
            <Link to="/products/">Products</Link>
            <span aria-hidden="true">/</span>
            <Link to={`/products/category/${product.category}/`}>{categoryName(product.category)}</Link>
          </nav>
          <div className="product__inner">
            <div className="product__photo">
              <Picture file={product.image} alt={`${product.name} — Acharya Foods`} sizes="(min-width: 900px) 520px, 100vw" eager />
            </div>
            <div className="product__text">
              <h1>{product.name}</h1>
              {product.nameNp && (
                <p className="product__np" lang="ne">
                  {product.nameNp}
                </p>
              )}
              {(price || product.pack) && (
                <p className="product__price">
                  {price}
                  {product.pack && <span className="product__pack">{product.pack}</span>}
                </p>
              )}
              <p className="product__desc">{product.description}</p>
              <div className="button-row">
                <Link to={`/contact/?product=${product.slug}`} className="btn btn-primary">
                  Ask about this product
                </Link>
                <Link to="/dealership/" className="btn btn-outline">
                  Stock it in your shop
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section section--tint">
        <div className="container">
          <div className="section-head">
            <h2>{related.length > 0 ? `More ${categoryName(product.category).toLowerCase()}` : 'More from our kitchen'}</h2>
          </div>
          <ProductGrid items={others} />
        </div>
      </section>
    </>
  );
}
