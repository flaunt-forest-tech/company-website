import React from 'react';

const Carousel: React.FC = () => {
  return (
    <div className="custom-section-svg">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="1820"
        height="840"
        viewBox="0 0 481.54166 222.25"
        version="1.1"
        style={{
          backgroundImage: 'url(img/backgrounds/bg-full.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <g transform="translate(0,-74.749984)">
          <path
            style={{
              fill: '#0053ce',
              fillOpacity: 0.83417089,
              strokeWidth: 0.26458332,
            }}
            d="M -37.41942,65.027063 V 297.04648 h 555.625 V 65.027063 Z m 385.24418,26.073343 c 5.16568,-0.06559 10.30682,1.828283 14.17588,5.697327 l 22.51077,22.510767 c 2.81369,2.8137 7.10706,1.33438 7.86464,-2.23708 2.21908,-6.43973 5.15977,-13.60111 8.76741,-17.208757 10.10198,-10.101963 25.7768,-10.300582 35.62522,-0.452167 9.84843,9.848414 9.64978,25.523244 -0.45217,35.625204 -3.60765,3.60766 -10.76936,6.54852 -17.20929,8.76743 -3.57201,0.75699 -4.34764,5.75355 -2.23655,7.86463 l 29.54549,29.54549 c 7.73808,7.73808 7.57481,20.56352 -0.36227,28.50058 l -17.31727,17.31729 c -4.32922,4.32922 -12.15765,3.7166 -14.93552,-1.94717 -2.07338,-4.96117 -4.86992,-9.19938 -6.98047,-11.3099 -9.8484,-9.84841 -25.52375,-9.64979 -35.62572,0.45217 -10.10177,10.10177 -10.3006,25.77732 -0.45218,35.62573 2.11053,2.11053 6.34937,4.90595 11.30941,6.98045 4.94276,3.49888 6.27689,10.60629 1.94767,14.93552 l -17.31729,17.31729 c -7.93724,7.93726 -20.76249,8.09984 -28.50057,0.36174 l -84.41553,-84.41552 c -7.7381,-7.7381 -7.57482,-20.56301 0.36225,-28.50007 l 79.37139,-79.371375 v -5.16e-4 c 3.96862,-3.968627 9.15901,-5.993473 14.3247,-6.059063 z"
          />
          <path
            style={{
              fill: '#ffffff',
              fillOpacity: 1,
              stroke: 'none',
              strokeWidth: 0.26052347,
              strokeOpacity: 1,
            }}
            d="m 314.90636,266.1817 0.0512,0.0512 h 71.61114 v 0 c -23.89724,-0.003 -47.7139,0.007 -71.61114,0 z m 71.66229,0.0512 c 0,0 -0.0376,2.36455 -1.54522,4.09644 -5.94783,6.83282 -18.34141,18.62228 -18.34141,18.62228 -7.93727,7.93727 -20.76199,8.23348 -28.50007,0.49537 L 314.95751,266.23286 H -43.089358 v 31.34279 H 521.98518 v -31.34279 z"
            id="rect857"
          />
        </g>
      </svg>
      <div className="container container-xl-custom z-index-1">
        <div className="row">
          <div className="col-md-7 col-lg-6">
            <h1
              className="text-color-light font-weight-extra-bold text-6 text-lg-10 text-xl-14 line-height-1-1 negative-ls-1 pb-2 mb-2 mb-xl-4 appear-animation"
              data-appear-animation="fadeInUpShorter"
              data-appear-animation-delay="300"
            >
              ARE YOU LOOKING FOR SUPERIOR TECH IT SUPPORT?
            </h1>
            <p
              className="custom-font-secondary custom-text-color-light-1 line-height-5 text-xl-5 pe-5 pb-3 mb-2 mb-xl-4 appear-animation"
              data-appear-animation="fadeInUpShorter"
              data-appear-animation-delay="500"
            >
              We provide <strong className="text-color-light">affordable</strong>, highly responsive{' '}
              <strong className="text-color-light">IT Support</strong> and Services for small and
              medium businesses.
            </p>
            <a
              href="#services"
              className="btn btn-secondary btn-outline text-color-light font-weight-semibold border-width-4 custom-link-effect-1 text-1 text-xl-3 d-inline-flex align-items-center px-4 py-3 appear-animation"
              data-hash
              data-hash-offset="0"
              data-hash-offset-lg="90"
              data-appear-animation="fadeInUpShorter"
              data-appear-animation-delay="700"
            >
              GET STARTED NOW <i className="custom-arrow-icon ms-2"></i>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Carousel;
