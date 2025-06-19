import React from 'react';

export type PageHeaderProps = {
  title: string;
  breadcrumbs: Array<{ label: string; href?: string }>;
};

const PageHeader: React.FC<PageHeaderProps> = ({ title, breadcrumbs }) => (
  <section className="page-header page-header-modern custom-page-header-style-1 bg-color-primary page-header-lg mb-0">
    <div className="container container-xl-custom py-5">
      <div className="row">
        <div className="col-md-8 order-2 order-md-1 align-self-center p-static">
          <h1
            className="font-weight-extra-bold text-14 appear-animation"
            data-appear-animation="fadeInRightShorter"
            data-appear-animation-delay="200"
          >
            {title}
          </h1>
        </div>
        <div className="col-md-4 order-1 order-md-2 align-self-center">
          <ul
            className="breadcrumb d-block text-md-end breadcrumb-light appear-animation"
            data-appear-animation="fadeInRightShorter"
            data-appear-animation-delay="400"
          >
            {breadcrumbs.map((crumb, idx) => (
              <li key={idx} className={idx === breadcrumbs.length - 1 ? 'active' : undefined}>
                {crumb.href && idx !== breadcrumbs.length - 1 ? (
                  <a href={crumb.href}>{crumb.label}</a>
                ) : (
                  crumb.label
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  </section>
);

export default PageHeader;
