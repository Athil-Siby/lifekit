import { Link } from 'react-router-dom';
import { useSeo } from '../../hooks/useSeo';
import { staticPages } from '../../config/pages';
import { LegalLayout } from './LegalLayout';
import { ContactLine } from './ContactLine';

const toc = [
  { id: 'acceptance', label: 'Acceptance' },
  { id: 'service', label: 'The service' },
  { id: 'acceptable-use', label: 'Acceptable use' },
  { id: 'your-content', label: 'Your content' },
  { id: 'ip', label: 'Intellectual property' },
  { id: 'disclaimer', label: 'Disclaimers' },
  { id: 'liability', label: 'Limitation of liability' },
  { id: 'third-party', label: 'Third-party links and ads' },
  { id: 'changes', label: 'Changes' },
  { id: 'contact', label: 'Contact' },
];

export default function Terms() {
  const meta = staticPages.find((p) => p.path === '/terms')!;
  useSeo({ title: meta.title, description: meta.description, path: meta.path });
  return (
    <LegalLayout title="Terms of Service" intro="Please read these terms before using LifeKit." toc={toc}>
      <h2 id="acceptance">Acceptance of these terms</h2>
      <p>
        By accessing or using LifeKit (“the service”), you agree to these Terms of Service and to our{' '}
        <Link to="/privacy">Privacy Policy</Link>. If you do not agree, please do not use the service.
      </p>

      <h2 id="service">The service</h2>
      <p>
        LifeKit provides free online utilities, including PDF, image, text, calculation and conversion tools. Most
        tools run entirely in your web browser. We may add, change or remove tools and features at any time, and we
        do not guarantee that the service will be available without interruption.
      </p>
      <p>No account is required. The service is offered free of charge and may in future be supported by advertising.</p>

      <h2 id="acceptable-use">Acceptable use</h2>
      <p>You agree not to:</p>
      <ul>
        <li>use the service for any unlawful purpose or to process content you do not have the right to use;</li>
        <li>attempt to disrupt, overload or gain unauthorised access to the website or its infrastructure;</li>
        <li>use automated means to access the service in a way that places an unreasonable load on it;</li>
        <li>copy, resell or redistribute the service or its content as your own;</li>
        <li>interfere with any advertising or security features of the site in a way that harms other users.</li>
      </ul>

      <h2 id="your-content">Your content</h2>
      <p>
        You keep all rights to the files and text you use with LifeKit. Because the tools process your content in your
        browser, we do not receive, store or claim any rights over it. You are responsible for making sure you have the
        right to process and share the content you use with the tools.
      </p>

      <h2 id="ip">Intellectual property</h2>
      <p>
        The LifeKit name, logo, website design, text and original code are owned by the operator of LifeKit or its
        licensors and are protected by intellectual-property laws. Open-source libraries used by the site remain
        subject to their own licences. You may link to any page of the site.
      </p>

      <h2 id="disclaimer">Disclaimers</h2>
      <p>
        The service is provided <strong>“as is” and “as available”</strong>, without warranties of any kind, whether
        express or implied, including fitness for a particular purpose, accuracy and non-infringement.
      </p>
      <p>
        We work hard to make the tools accurate, but results such as calculations, conversions, time-zone offsets,
        compressed files or generated passwords may contain errors. Do not rely on them as your only source for
        legal, financial, medical, safety-critical or other important decisions. Always keep a copy of your original
        files and check important results.
      </p>

      <h2 id="liability">Limitation of liability</h2>
      <p>
        To the fullest extent permitted by law, the operator of LifeKit will not be liable for any indirect,
        incidental, special or consequential damages, or for any loss of data, profits or business, arising from your
        use of or inability to use the service. Nothing in these terms limits liability that cannot be limited under
        applicable law, such as liability for death or personal injury caused by negligence, or for fraud.
      </p>

      <h2 id="third-party">Third-party links and advertising</h2>
      <p>
        The site may contain links to other websites and, in future, advertisements from third parties. We are not
        responsible for the content, products or practices of third-party sites or advertisers.
      </p>

      <h2 id="changes">Changes to these terms</h2>
      <p>
        We may update these terms from time to time. The “Last updated” date shows when they were last changed.
        Continuing to use the service after changes means you accept the updated terms.
      </p>

      <h2 id="contact">Contact</h2>
      <ContactLine />
    </LegalLayout>
  );
}
