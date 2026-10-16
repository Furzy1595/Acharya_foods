import { Link } from 'react-router-dom';

export function NotFound() {
  return (
    <section className="section page-top">
      <div className="container narrow">
        <h1>This page is not here</h1>
        <p className="lead">The address may be old or mistyped. Everything we make is on the products page.</p>
        <div className="button-row">
          <Link to="/products/" className="btn btn-primary">
            See our products
          </Link>
          <Link to="/" className="btn btn-outline">
            Go to the home page
          </Link>
        </div>
      </div>
    </section>
  );
}
