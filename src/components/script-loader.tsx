'use client';

import { useEffect, useState } from 'react';

declare global {
  interface Window {
    __fftScriptsLoaded?: boolean;
  }
}

export default function ScriptLoader() {
  const [currentScriptIndex, setCurrentScriptIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const baseScripts = [
    { src: '/js/vendor/jquery/jquery.min.js', name: 'jQuery' },
    { src: '/js/plugins/js/plugins.min.js', name: 'Plugins' },
  ];

  const pageScripts = [
    { src: '/js/theme.js', name: 'Theme' },
    { src: '/js/demo-it-services.js', name: 'Demo IT Services' },
    { src: '/js/theme.init.js', name: 'Theme Initialization' },
  ];

  useEffect(() => {
    const loadScript = (src: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        const existingScript = document.querySelector(`script[src="${src}"]`);
        if (existingScript) {
          resolve();
          return;
        }

        const script = document.createElement('script');
        script.src = src;
        script.async = false; // Important: ensures execution order
        script.defer = false;

        script.onload = () => {
          const scriptName = [...baseScripts, ...pageScripts].find((s) => s.src === src)?.name;
          console.log(`✅ ${scriptName} loaded successfully`);
          resolve();
        };

        script.onerror = (error) => {
          console.error(`❌ Failed to load ${src}:`, error);
          reject(new Error(`Failed to load script: ${src}`));
        };

        document.head.appendChild(script);
      });
    };

    const rerunScript = (src: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        const existingDynamicScripts = document.querySelectorAll(
          `script[data-fft-runtime="${src}"]`
        );
        existingDynamicScripts.forEach((node) => node.remove());

        const script = document.createElement('script');
        script.src = `${src}?v=${Date.now()}`;
        script.async = false;
        script.defer = false;
        script.setAttribute('data-fft-runtime', src);

        script.onload = () => resolve();
        script.onerror = (error) => reject(error);

        document.body.appendChild(script);
      });
    };

    const loadScriptsSequentially = async () => {
      try {
        if (!window.__fftScriptsLoaded) {
          for (let i = 0; i < baseScripts.length; i++) {
            setCurrentScriptIndex(i);
            await loadScript(baseScripts[i].src);
          }
          window.__fftScriptsLoaded = true;
        }

        for (let i = 0; i < pageScripts.length; i++) {
          setCurrentScriptIndex(baseScripts.length + i);
          await rerunScript(pageScripts[i].src);
        }

        console.log('🎉 All scripts loaded successfully!');
        setIsLoading(false);
      } catch (error) {
        console.error('Script loading failed:', error);
        setIsLoading(false);
      }
    };

    loadScriptsSequentially();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Optional: Show loading indicator in development
  if (process.env.NODE_ENV === 'development' && isLoading) {
    return (
      <div
        style={{
          position: 'fixed',
          top: '10px',
          right: '10px',
          background: 'rgba(0,0,0,0.8)',
          color: 'white',
          padding: '8px 12px',
          borderRadius: '4px',
          fontSize: '12px',
          zIndex: 9999,
          fontFamily: 'monospace',
        }}
      >
        Loading scripts... {currentScriptIndex + 1}/{baseScripts.length + pageScripts.length}
        <br />
        {[...baseScripts, ...pageScripts][currentScriptIndex]?.name}
      </div>
    );
  }

  return null;
}
