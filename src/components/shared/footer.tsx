import { CONTACT } from '@/constants/contact';
import { SERVICES } from '@/constants/services';
import Image from 'next/image';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer id="footer" className="bg-color-primary border-0 mt-0">
      <div className="container container-xl-custom pt-4 pb-3">
        <div className="row py-5">
          <div className="col-md-4 col-lg-2 mb-4 mb-lg-0">
            <h4 className="ls-0">OUR ADDRESS</h4>
            <ul className="list list-unstyled">
              <li className="mb-1">{CONTACT.ADDRESS.street}</li>
              <li>{`${CONTACT.ADDRESS.city}, ${CONTACT.ADDRESS.state} ${CONTACT.ADDRESS.zip}`}</li>
            </ul>
          </div>

          <div className="col-md-4 col-lg-2 mb-4 mb-lg-0">
            <h4 className="ls-0">OUR CONTACTS</h4>
            <ul className="list-unstyled">
              <li className="pb-1 mb-2">
                <span className="d-block line-height-2">SUPPORT</span>
                <a
                  href={`tel:${CONTACT.CELL.support}`}
                  className="text-color-light text-6 text-lg-4 text-xl-6 font-weight-bold"
                >
                  {CONTACT.CELL.supportFormatted}
                </a>
              </li>
              <li>
                <span className="d-block line-height-2">SALES</span>
                <a
                  href={`tel:${CONTACT.CELL.sales}`}
                  className="text-color-light text-6 text-lg-4 text-xl-6 font-weight-bold"
                >
                  {CONTACT.CELL.salesFormatted}
                </a>
              </li>
            </ul>
          </div>

          <div className="col-md-4 col-lg-2 mb-4 mb-lg-0">
            <h4 className="ls-0">USEFUL LINKS</h4>
            <ul className="list-unstyled">
              <li className="mb-1">
                <Link href="/it-services">Our Services</Link>
              </li>
              <li className="mb-1">
                <Link href="#">Payment Methods</Link>
              </li>
              <li className="mb-1">
                <Link href="/it-services">Services Guide</Link>
              </li>
              <li>
                <Link href="#">FAQs</Link>
              </li>
            </ul>
          </div>

          <div className="col-md-4 col-lg-2 mb-4 mb-md-0">
            <h4 className="ls-0">OUR SERVICES</h4>
            <ul className="list-unstyled">
              {SERVICES.map((service) => (
                <li key={service.title} className="mb-1">
                  <Link href={service.link}>{service.title}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-md-4 col-lg-2 mb-4 mb-md-0">
            <h4 className="ls-0">ABOUT</h4>
            <ul className="list-unstyled">
              <li className="mb-1">
                <Link href="/about-us">About Us</Link>
              </li>
              <li>
                <Link href="/contact">Send a Message</Link>
              </li>
            </ul>
          </div>

          <div className="col-md-4 col-lg-2">
            <h4 className="ls-0">SOCIAL MEDIA</h4>
            <ul className="social-icons social-icons-clean custom-social-icons-icon-light">
              <li>
                <a href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer">
                  <i className="fab fa-instagram"></i>
                </a>
              </li>
              <li>
                <a href="https://x.com/flauntforest/" target="_blank" rel="noopener noreferrer">
                  <i className="fab fa-x-twitter"></i>
                </a>
              </li>
              <li>
                <a href="https://www.facebook.com/" target="_blank" rel="noopener noreferrer">
                  <i className="fab fa-facebook-f"></i>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="footer-copyright bg-color-primary">
        <div className="container container-xl-custom pb-4">
          <div className="row">
            <div className="col">
              <hr className="my-0 bg-color-light opacity-2" />
            </div>
          </div>
          <div className="row align-items-center py-4 mt-2">
            <div className="col-lg-6 d-flex justify-content-center justify-content-lg-start mb-4 mb-lg-0">
              <Link href="/">
                <Image alt="Porto" width={115} height={30} src="/img/logo-light.png" />
              </Link>
            </div>
            <div className="col-lg-6 d-flex justify-content-center justify-content-lg-end">
              <p className="text-3 mb-0">Flaunt Forest Tech. © 2025. All Rights Reserved</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
