import { Link } from 'react-router-dom';
import { content } from '../content';
import { InquiryForm } from '../components/InquiryForm';

export function Support() {
  const { support } = content;
  return (
    <section className="section page-top">
      <div className="container split">
        <div>
          <h1>{support.title}</h1>
          <p className="lead">{support.intro}</p>
          {support.faqs.length > 0 && (
            <div className="faqs">
              <h2>Asked often</h2>
              {support.faqs.map((f) => (
                <details key={f.question}>
                  <summary>{f.question}</summary>
                  <p>{f.answer}</p>
                </details>
              ))}
            </div>
          )}
          <p className="aside-note">
            Not about something you bought? <Link to="/contact/">Send us a message</Link> instead.
          </p>
        </div>
        <div className="form-card">
          <h2>Tell us what happened</h2>
          <InquiryForm type="support" />
        </div>
      </div>
    </section>
  );
}
