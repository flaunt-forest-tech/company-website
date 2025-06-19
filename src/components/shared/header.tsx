'use client';
// import "../app/globals.css";
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';

type HeaderProps = {
  activePage: 'Home' | 'AboutUs' | 'ItServicesOverview'; // prop to determine the active page
};

const Header: React.FC<HeaderProps> = ({ activePage }) => {
  return (
    <header
      id="header"
      className="header-effect-shrink"
      data-plugin-options="{'stickyEnabled': true, 'stickyEffect': 'shrink', 'stickyEnableOnBoxed': true, 'stickyEnableOnMobile': false, 'stickyChangeLogo': true, 'stickyStartAt': 120, 'stickyHeaderContainerHeight': 90}"
    >
      <div className="header-body border-top-0 box-shadow-none">
        <div className="header-container container container-xl-custom">
          <div className="header-row">
            <div className="header-column">
              <div className="header-row">
                <div className="header-logo">
                  <a href="demo-it-services.html">
                    <Image alt="Porto" width={162} height={42} src="/img/logo.png" priority />
                  </a>
                </div>
              </div>
            </div>
            <div className="header-column justify-content-end">
              <div className="header-row">
                <div className="header-nav header-nav-line header-nav-bottom-line header-nav-bottom-line-effect-1 order-2 order-lg-1">
                  <div className="header-nav-main header-nav-main-square header-nav-main-dropdown-no-borders header-nav-main-effect-2 header-nav-main-sub-effect-1">
                    <nav className="collapse">
                      <ul className="nav nav-pills" id="mainNav">
                        <li>
                          <Link
                            className={cn('nav-link', { active: activePage === 'Home' })}
                            href="/"
                          >
                            Home
                          </Link>
                        </li>
                        <li>
                          <Link
                            className={cn('nav-link', { active: activePage === 'AboutUs' })}
                            href="/about-us"
                          >
                            About Us
                          </Link>
                        </li>
                        <li className="dropdown">
                          <Link
                            className={cn('dropdown-item dropdown-toggle', {
                              active: activePage === 'ItServicesOverview',
                            })}
                            href="/it-services/overview"
                          >
                            IT Services
                          </Link>
                          <ul className="dropdown-menu">
                            <li>
                              <Link className="nav-link" href="/it-services/overview">
                                Overview
                              </Link>
                            </li>
                            <li>
                              <a className="nav-link" href="demo-it-services-services-detail.html">
                                Cloud Services
                              </a>
                            </li>
                            <li>
                              <a className="nav-link" href="demo-it-services-services-detail.html">
                                Tech Support
                              </a>
                            </li>
                            <li>
                              <a className="nav-link" href="demo-it-services-services-detail.html">
                                Data Security
                              </a>
                            </li>
                            <li>
                              <a className="nav-link" href="demo-it-services-services-detail.html">
                                Software Dev
                              </a>
                            </li>
                          </ul>
                        </li>
                        <li>
                          <a className="nav-link" href="demo-it-services-blog.html">
                            Resources
                          </a>
                        </li>
                        <li>
                          <a className="nav-link" href="demo-it-services-careers.html">
                            Careers
                          </a>
                        </li>
                        <li>
                          <a className="nav-link" href="demo-it-services-contact.html">
                            Contact
                          </a>
                        </li>
                      </ul>
                    </nav>
                  </div>
                  <button
                    className="btn header-btn-collapse-nav"
                    data-bs-toggle="collapse"
                    data-bs-target=".header-nav-main nav"
                  >
                    <i className="fas fa-bars"></i>
                  </button>
                </div>
                <div className="d-none d-sm-inline-flex order-1 order-lg-2 ms-2">
                  <ul className="header-extra-info d-flex">
                    <li className="d-none d-xl-flex flex-column">
                      <span className="d-block font-weight-semibold text-color-dark text-2 line-height-3">
                        SUPPORT
                      </span>
                      <a
                        href="tel:+16093393835"
                        className="font-weight-bold text-color-primary text-5"
                      >
                        609-339-3835
                      </a>
                    </li>
                    <li className="d-flex flex-column">
                      <span className="d-block font-weight-semibold text-color-dark text-2 line-height-3">
                        SALES
                      </span>
                      <a
                        href="tel:+16467520078"
                        className="font-weight-bold text-color-primary text-5"
                      >
                        646-752-0078
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
