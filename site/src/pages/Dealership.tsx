import { content } from '../content';
import { Heading } from '../components/Heading';
import { InquiryForm } from '../components/InquiryForm';
import { Benefits } from './Home';

export function Dealership() {
  const { dealership, nepali } = content;
  return (
    <section className="section page-top">
      <div className="container split">
        <div>
          <Heading as="h1" np={nepali?.dealership}>
            {dealership.title}
          </Heading>
          <p className="lead">{dealership.intro}</p>
          <a className="btn btn-primary jump-to-form" href="#apply">
            Fill in the application
          </a>
          <Benefits />
        </div>
        <div className="form-card" id="apply">
          <h2>{dealership.formTitle}</h2>
          <p>{dealership.formIntro}</p>
          <InquiryForm type="dealer" />
        </div>
      </div>
    </section>
  );
}
