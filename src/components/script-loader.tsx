'use client';

import { useEffect, useState } from 'react';

export default function ScriptLoader() {
  const [currentScriptIndex, setCurrentScriptIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const scripts = [
    { src: '/js/vendor/jquery/jquery.min.js', name: 'jQuery' },
    { src: '/js/plugins/js/plugins.min.js', name: 'Plugins' },
    { src: '/js/theme.js', name: 'Theme' },
    { src: '/js/demo-it-services.js', name: 'Demo IT Services' },
    { src: '/js/theme.init.js', name: 'Theme Initialization' },
  ];

  useEffect(() => {
    const loadScript = (src: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        // Check if script is already loaded
        const existingScript = document.querySelector(`script[src="${src}"]`);
        if (existingScript) {
          existingScript.remove();
        }

        const script = document.createElement('script');
        script.src = src;
        script.async = false; // Important: ensures execution order
        script.defer = false;

        script.onload = () => {
          console.log(`✅ ${scripts.find((s) => s.src === src)?.name} loaded successfully`);
          resolve();
        };

        script.onerror = (error) => {
          console.error(`❌ Failed to load ${src}:`, error);
          reject(new Error(`Failed to load script: ${src}`));
        };

        document.head.appendChild(script);
      });
    };

    const loadScriptsSequentially = async () => {
      try {
        for (let i = 0; i < scripts.length; i++) {
          setCurrentScriptIndex(i);
          await loadScript(scripts[i].src);
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
        Loading scripts... {currentScriptIndex + 1}/{scripts.length}
        <br />
        {scripts[currentScriptIndex]?.name}
      </div>
    );
  }

  return null;
}
