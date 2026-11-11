import { Link } from 'react-router-dom';
import { siteConfig } from '../../config/site';
import { legalConfig, operatorLabel } from '../../config/legal';

export function ContactLine() {
  return (
    <p>
      This website is operated by {operatorLabel}
      {legalConfig.operatorLocation ? `, ${legalConfig.operatorLocation}` : ''}. You can reach us through the{' '}
      <Link to="/contact">contact page</Link>
      {siteConfig.contactEmail && (
        <>
          {' '}or by email at <a href={`mailto:${siteConfig.contactEmail}`}>{siteConfig.contactEmail}</a>
        </>
      )}
      .
    </p>
  );
}
