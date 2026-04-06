import Header from '@/components/shared/header';
import Footer from '@/components/shared/footer';
import PageHeader, { type PageHeaderProps } from '@/components/shared/page-header';

const sections = [
  {
    title: 'Website access and acceptable use',
    points: [
      'This website is provided for general informational, marketing, and business communication purposes.',
      'You agree not to misuse the site, interfere with its operation, or attempt unauthorized access to systems or content.',
      'We may revise or update website content, offerings, and materials at any time without separate notice.',
    ],
  },
  {
    title: 'Service inquiries and project discussions',
    points: [
      'Any scope discussion, quote, estimate, or proposal is informational until confirmed through a separate written agreement where applicable.',
      'Submitting a form, requesting contact, or discussing a project does not by itself create a client, contractor, or advisory relationship.',
      'We reserve the right to decline inquiries or projects that are outside our scope, schedule, or business fit.',
    ],
  },
  {
    title: 'Content, links, and availability',
    points: [
      'Website materials remain subject to applicable intellectual property and ownership rights.',
      'This site may include references or links to third-party services, platforms, or websites for convenience only.',
      'We aim to keep the site available and accurate, but uninterrupted access and error-free operation cannot be guaranteed at all times.',
    ],
  },
  {
    title: 'Disclaimer and limitation of liability',
    points: [
      'To the extent permitted by law, the website is provided “as is” and “as available” without warranties of every kind.',
      'We are not responsible for losses arising from temporary outages, third-party systems, or reliance on website content alone.',
      'Nothing on this page limits rights or obligations that must be addressed separately in a signed service agreement.',
    ],
  },
];

export default function TermsPage() {
  const pageHeaderData: PageHeaderProps = {
    title: 'TERMS OF USE',
    breadcrumbs: [{ label: 'Home', href: '/' }, { label: 'Terms of Use' }],
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
                      Basic website terms
                    </p>
                    <h2 className="text-8 mb-3">Terms of use</h2>
                    <p className="mb-2 text-4 line-height-8">
                      These terms describe the general conditions for using this website and
                      contacting Flaunt Forest Tech through it.
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

                  <div>
                    <h3 className="text-5 mb-3">Questions</h3>
                    <p className="mb-0 text-4 line-height-8">
                      If you have questions about these terms, please contact us through the website
                      contact page.
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
