import { Link } from 'react-router-dom';
import { useSeo } from '../../hooks/useSeo';
import { staticPages } from '../../config/pages';
import { adsConfig } from '../../config/ads';
import { siteConfig } from '../../config/site';
import { LegalLayout } from './LegalLayout';
import { ContactLine } from './ContactLine';

const toc = [
  { id: 'summary', label: 'Summary' },
  { id: 'collect', label: 'Information we collect' },
  { id: 'files', label: 'Files and tool data' },
  { id: 'extension', label: 'Browser extension' },
  { id: 'contact-form', label: 'Contact form' },
  { id: 'cookies', label: 'Cookies and storage' },
  { id: 'analytics', label: 'Analytics' },
  { id: 'advertising', label: 'Advertising' },
  { id: 'third-parties', label: 'Third-party services' },
  { id: 'retention', label: 'Retention and security' },
  { id: 'rights', label: 'Your rights' },
  { id: 'children', label: 'Children' },
  { id: 'changes', label: 'Changes' },
  { id: 'contact', label: 'Contact' },
];

export default function Privacy() {
  const meta = staticPages.find((p) => p.path === '/privacy')!;
  useSeo({ title: meta.title, description: meta.description, path: meta.path });
  return (
    <LegalLayout title="Privacy Policy" intro="How LifeKit handles information when you use the website and its tools." toc={toc}>
      <h2 id="summary">Summary</h2>
      <ul>
        <li>You can use every tool without an account.</li>
        <li>Files you open in the PDF and image tools are processed in your browser and are <strong>not uploaded</strong> to our servers.</li>
        <li>Text, numbers and passwords you enter into tools stay in your browser and are not sent to us.</li>
        <li>We store a few preferences (such as light or dark theme) in your browser’s local storage.</li>
        <li>We count anonymous page visits with a cookieless analytics service to see which tools are useful. {adsConfig.enabled ? 'Advertising is shown only if you consent.' : 'We do not currently show advertising.'}</li>
      </ul>

      <h2 id="collect">Information we collect</h2>
      <p>
        <strong>Information you give us.</strong> If you use the contact form, we receive the name, email address,
        subject and message you submit.
      </p>
      <p>
        <strong>Technical information.</strong> Like almost every website, the servers and content-delivery network
        that host LifeKit may automatically record standard request data such as your IP address, browser type, the
        page requested and the time of the request. This is used to deliver the site, keep it secure and diagnose
        problems. The exact data and retention period depend on the hosting provider.
      </p>
      <p>We do not ask for, and do not knowingly collect, sensitive personal information.</p>

      <h2 id="files">Files and tool data</h2>
      <p>
        The PDF Merger, PDF Splitter, PDF Compressor, Image Compressor and Image Converter work entirely in your
        browser using JavaScript. When you choose a file, your browser reads it from your device into the page’s
        memory, processes it there, and lets you save the result. The file is not transmitted to LifeKit or any
        third party.
      </p>
      <p>
        Files and results are not written to permanent storage by LifeKit. They remain in the page’s memory until you
        remove them, close the tab or reload the page. Temporary preview links created by your browser are released
        when they are no longer needed.
      </p>
      <p>
        The same applies to everything you type into the calculators, text tools, QR code generator and password
        generator. Generated passwords are never stored or transmitted.
      </p>

      <h2 id="extension">Browser extension</h2>
      <p>
        The LifeKit browser extension is a shortcut to the tools on this website. It does not collect, store or
        transmit any personal data, browsing history or analytics. When you use its right-click options, the selected
        text or the page or link address is passed to the matching tool on this website in the part of the address
        after the “#” symbol. Browsers never send that part to the server, so the content stays on your device and is
        cleared from the address bar once the tool has read it.
      </p>

      <h2 id="contact-form">Contact form</h2>
      {siteConfig.contactEndpoint ? (
        <p>
          Messages sent with the contact form are delivered to us through a third-party form-processing service, which
          stores the message so it can be forwarded to us. We use your details only to reply to you and keep
          correspondence for as long as needed to deal with your enquiry.
        </p>
      ) : (
        <p>
          The contact form is not currently connected to a sending service, so no information you type into it is
          transmitted. If this changes, this section will be updated to name the service used.
        </p>
      )}

      <h2 id="cookies">Cookies and local storage</h2>
      <p>
        LifeKit itself does not set cookies. We use your browser’s local storage to remember your theme preference
        {adsConfig.enabled ? ' and your cookie-consent choices' : ''}. This information never leaves your device. See
        our <Link to="/cookies">Cookie Policy</Link> for details.
      </p>

      <h2 id="analytics">Analytics</h2>
      <p>
        We use <strong>Vercel Web Analytics</strong>, provided by our hosting company Vercel, to understand how many
        people visit LifeKit and which pages are popular. It records the page you visited, the referring website,
        your approximate country, and your browser, operating system and device type. It does not use cookies,
        does not store your IP address, and does not build a profile of you or follow you across other websites.
        Visitors are counted in aggregate, so we cannot see who you are. Content you enter into the tools, and your
        files, are never sent to the analytics service. Learn more in{' '}
        <a href="https://vercel.com/docs/analytics/privacy-policy" target="_blank" rel="noopener noreferrer">
          Vercel's analytics privacy documentation
        </a>
        .
      </p>

      <h2 id="advertising">Advertising</h2>
      {adsConfig.enabled ? (
        <>
          <p>
            We show ads provided by Google AdSense to help fund the site. Ads are only loaded after you consent to
            advertising cookies. When ads are loaded, Google and its partners may use cookies and similar technologies
            to show ads based on your visits to this and other websites, and to measure ad performance.
          </p>
          <p>
            You can learn how Google uses information from sites that use its services at{' '}
            <a href="https://policies.google.com/technologies/partner-sites" target="_blank" rel="noopener noreferrer">
              policies.google.com/technologies/partner-sites
            </a>
            , and manage personalised advertising at{' '}
            <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer">adssettings.google.com</a>.
            You can change your choice at any time using “Cookie settings” in the footer.
          </p>
        </>
      ) : (
        <p>
          LifeKit does not currently display advertising. We may introduce ads, for example through Google AdSense, to
          cover running costs. Before that happens we will update this policy to explain what data the advertising
          provider processes, and we will ask for your consent where required. Ads will never be placed inside a
          tool’s controls.
        </p>
      )}

      <h2 id="third-parties">Third-party services</h2>
      <ul>
        <li><strong>Hosting and content delivery</strong> – to serve the website’s files to your browser.</li>
        <li><strong>Vercel Web Analytics</strong> – cookieless, aggregate visit statistics.</li>
        {siteConfig.contactEndpoint && <li><strong>Form processing</strong> – to deliver contact-form messages to us.</li>}
        {adsConfig.enabled && <li><strong>Google AdSense</strong> – to show ads, only with your consent.</li>}
      </ul>
      <p>
        The site’s fonts and code are served from our own hosting rather than third-party font or script services.
        External links on the site lead to websites we do not control; their own privacy policies apply.
      </p>

      <h2 id="retention">Retention and security</h2>
      <p>
        We keep contact messages only as long as needed to respond and for reasonable record keeping. Server logs are
        kept by the hosting provider according to its own policies. The site is served over HTTPS. No method of
        transmission or storage is completely secure, but because tool data is processed on your device, it is not
        exposed to our servers.
      </p>

      <h2 id="rights">Your rights</h2>
      <p>
        Depending on where you live, you may have rights to access, correct, delete or restrict the use of personal
        information we hold about you, to object to processing, to data portability, and to withdraw consent. To
        exercise these rights, contact us using the details below. You also have the right to complain to your local
        data protection authority.
      </p>
      <p>
        Because tool data and preferences stay in your browser, you can delete them yourself at any time by clearing
        this site’s data in your browser settings.
      </p>

      <h2 id="children">Children</h2>
      <p>
        LifeKit is a general-audience website and is not directed at children under 13. We do not knowingly collect
        personal information from children.
      </p>

      <h2 id="changes">Changes to this policy</h2>
      <p>
        We will update this page when our practices change, for example if we add analytics, advertising or new
        services. The “Last updated” date at the top shows when it was last revised.
      </p>

      <h2 id="contact">Contact</h2>
      <ContactLine />
    </LegalLayout>
  );
}
