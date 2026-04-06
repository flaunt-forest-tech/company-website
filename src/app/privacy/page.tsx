import Header from '@/components/shared/header';
import Footer from '@/components/shared/footer';
import PrivacyPreferencesPanel from '@/components/privacy-preferences-panel';
import PageHeader, { type PageHeaderProps } from '@/components/shared/page-header';

const sections = [
  {
    title: 'Information we may collect',
    points: [
      'Basic website usage data such as visited pages, referrer information, and CTA interactions.',
      'An optional anonymous browser identifier stored locally only after analytics consent is provided.',
      'Campaign attribution values, such as UTM source, medium, or campaign, when you arrive via tagged links.',
    ],
  },
  {
    title: 'How information is used',
    points: [
      'To understand which pages, services, and topics are useful to visitors and prospective clients.',
      'To measure repeat visits and improve the website experience, messaging, and navigation over time.',
      'To support internal business analytics and lead qualification in an aggregated, operational manner.',
    ],
  },
  {
    title: 'Analytics consent and storage',
    points: [
      'Optional analytics is disabled until you choose to accept it through the site banner or preference controls.',
      'If you decline, the site remains available and optional repeat-visit tracking is not enabled.',
      'If you later withdraw consent, the locally stored analytics identifiers are cleared from your browser.',
    ],
  },
  {
    title: 'Your choices',
    points: [
      'You may revisit your analytics choice at any time from this page.',
      'You can also clear your browser storage or cookies to remove previously saved identifiers on your device.',
      'For privacy-related questions, you may contact us through the website contact form.',
    ],
  },
];

export default function PrivacyPage() {
  const pageHeaderData: PageHeaderProps = {
    title: 'PRIVACY & COOKIES',
    breadcrumbs: [{ label: 'Home', href: '/' }, { label: 'Privacy & Cookies' }],
  };

  return (
    <div className="body">
      <Header activePage="Contact" />
      <div role="main" className="main">
        <PageHeader {...pageHeaderData} />

        <section className="section border-0 bg-transparent m-0">
          <div className="container container-xl-custom py-4">
            <div className="row justify-content-center">
              <div className="col-lg-9">
                <div
                  style={{
                    borderRadius: '20px',
                    padding: '24px',
                    background:
                      'linear-gradient(180deg, rgba(248,250,252,0.98), rgba(241,245,249,0.96))',
                    border: '1px solid rgba(148,163,184,0.18)',
                    boxShadow: '0 16px 40px rgba(15, 23, 42, 0.06)',
                    display: 'grid',
                    gap: '18px',
                  }}
                >
                  <div>
                    <p
                      className="text-uppercase text-3 mb-2"
                      style={{ color: '#2563eb', fontWeight: 700 }}
                    >
                      Transparent by default
                    </p>
                    <h2 className="text-8 mb-3">Privacy & cookie notice</h2>
                    <p className="mb-2 text-4 line-height-8">
                      We keep analytics lightweight and optional. The site can be used without
                      accepting analytics tracking, and we only store the repeat-visit identifier
                      after consent is given.
                    </p>
                    <p className="mb-0 text-3" style={{ color: '#64748b' }}>
                      Last updated: April 5, 2026
                    </p>
                  </div>

                  {sections.map((section) => (
                    <div key={section.title}>
                      <h3 className="text-5 mb-3">{section.title}</h3>
                      <ul className="list list-icons list-icons-sm mb-0">
                        {section.points.map((point) => (
                          <li key={point} className="mb-2">
                            <i className="fas fa-check text-color-primary"></i>
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}

                  <PrivacyPreferencesPanel />

                  <div>
                    <h3 className="text-5 mb-3">Contact</h3>
                    <p className="mb-0 text-4 line-height-8">
                      If you have a privacy-related question, please use the contact form on our
                      website and mention that your request relates to privacy or cookies.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
}
