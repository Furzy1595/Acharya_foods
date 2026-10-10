import { content } from '../content';
import { CheckIcon } from '../components/Icons';
import { InquiryForm } from '../components/InquiryForm';

export function Dealership() {
  const { dealership } = content;
  return (
    <section className="section page-top">
      <div className="container split">
        <div>
          <h1>{dealership.title}</h1>
          <p className="lead">{dealership.intro}</p>
          <ul className="benefits benefits--light">
            {dealership.benefits.map((b) => (
              <li key={b.title}>
                <CheckIcon />
                <span>
                  <strong>{b.title}</strong> — {b.text}
                </span>
              </li>
            ))}
          </ul>
        </div>
        <div className="form-card">
          <h2>{dealership.formTitle}</h2>
          <p>{dealership.formIntro}</p>
          <InquiryForm type="dealer" />
        </div>
      </div>
    </section>
  );
}
