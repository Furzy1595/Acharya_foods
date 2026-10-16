import { Link } from 'react-router-dom';
import { npDigits, type Product } from '../content';
import { Picture } from './Picture';

/** The round price seal on a product photo: रु and the price in Nepali numerals. */
export function PriceSeal({ price, large = false }: { price?: number | null; large?: boolean }) {
  if (price === null || price === undefined) return null;
  return (
    <span className={`seal${large ? ' seal--large' : ''}`}>
      <span className="seal__rs" lang="ne">
        रु
      </span>
      <span className="seal__np" lang="ne">
        {npDigits(price)}
      </span>
      {large && <span className="seal__en">Rs {price}</span>}
    </span>
  );
}

export function ProductCard({ product }: { product: Product }) {
  const hasPrice = product.price !== null && product.price !== undefined;
  return (
    <li className="product-card">
      <Link to={`/products/${product.slug}/`} className="product-card__link">
        <div className="product-card__photo">
          <Picture file={product.image} alt={`${product.name} — Acharya Foods`} sizes="(min-width: 900px) 360px, 50vw" />
          <PriceSeal price={product.price} />
        </div>
        {product.nameNp && (
          <p className="product-card__np" lang="ne">
            {product.nameNp}
          </p>
        )}
        <p className="product-card__row">
          <span className="product-card__name">{product.name}</span>
          {hasPrice && <span className="product-card__price">Rs {product.price}</span>}
        </p>
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
