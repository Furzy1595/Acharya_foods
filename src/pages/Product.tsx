import { Link, useParams } from 'react-router-dom';
import { categoryName, findProduct, products } from '../content';
import { Heading } from '../components/Heading';
import { Picture } from '../components/Picture';
import { PriceSeal, ProductGrid } from '../components/ProductCard';
import { NotFound } from './NotFound';

const CATEGORY_NP: Record<string, string> = {
  pickles: 'अरू अचार',
  flour: 'अरू पिठो',
  snacks: 'अरू खाजा',
  spices: 'अरू मसला',
  seasoning: 'अरू मसला',
};

export function ProductPage() {
  const { slug } = useParams();
  const product = findProduct(slug);
  if (!product) return <NotFound />;
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
              <PriceSeal price={product.price} large />
            </div>
            <div className="product__text">
              {product.badge && <p className="product__badge">{product.badge}</p>}
              <h1 className="product__title">
                {product.nameNp && (
                  <span className="product__np" lang="ne">
                    {product.nameNp}
                  </span>
                )}
                <span className="product__en">{product.name}</span>
              </h1>
              {product.pack && <p className="product__pack">{product.pack}</p>}
              <p className="lead">{product.description}</p>
              {product.ingredients && product.ingredients.length > 0 && (
                <>
                  <p className="product__label">What goes into the jar</p>
                  <ul className="chips">
                    {product.ingredients.map((x) => (
                      <li key={x.text}>
                        <span lang="ne">{x.np}</span> {x.text}
                      </li>
                    ))}
                  </ul>
                </>
              )}
              <div className="button-row">
                <Link to={`/contact/?product=${product.slug}`} className="btn btn-primary">
                  Ask about this product
                </Link>
                <Link to="/dealership/" className="btn btn-quiet">
                  Stock it in your shop
                </Link>
              </div>
              <p className="product__note">No artificial colours, flavours or preservatives.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section section--rule">
        <div className="container">
          <div className="section-head">
            <Heading np={related.length > 0 ? CATEGORY_NP[product.category] : undefined}>
              {related.length > 0 ? `More ${categoryName(product.category).toLowerCase()}` : 'More from our kitchen'}
            </Heading>
          </div>
          <ProductGrid items={others} />
        </div>
      </section>
    </>
  );
}
