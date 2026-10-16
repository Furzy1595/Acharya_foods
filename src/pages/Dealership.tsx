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
          <Benefits />
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
