import { Link } from 'react-router-dom';
import { formatPrice, type Product } from '../content';
import { Picture } from './Picture';

export function ProductCard({ product }: { product: Product }) {
  const price = formatPrice(product.price);
  return (
    <li className="product-card">
      <Link to={`/products/${product.slug}/`} className="product-card__link">
        <div className="product-card__photo">
          <Picture
            file={product.image}
            alt={`${product.name} — Acharya Foods`}
            sizes="(min-width: 900px) 360px, 50vw"
          />
        </div>
        <div className="product-card__body">
          {product.nameNp && (
            <p className="product-card__np" lang="ne">
              {product.nameNp}
            </p>
          )}
          <div className="product-card__row">
            <h3 className="product-card__name">{product.name}</h3>
            {price && <p className="product-card__price">{price}</p>}
          </div>
        </div>
      </Link>
    </li>
  );
}

export function ProductGrid({ items }: { items: Product[] }) {
  if (items.length === 0) return <p className="empty-note">No products in this category yet.</p>;
  return (
    <ul className="product-grid">
      {items.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </ul>
  );
}
