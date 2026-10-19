import React, { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export const InstallPwaCard: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if already in standalone mode
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    if (isStandalone) {
      setIsInstalled(true);
    }

    // Check for iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isAppleMobile = /iphone|ipad|ipod/.test(userAgent);
    if (isAppleMobile && !isStandalone) {
      setIsIOS(true);
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    try {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } catch (err) {
      console.warn('PWA install prompt failed', err);
    }
  };

  return (
    <section className="settings-section-card pwa-install-card">
      <div className="section-card-header">
        <div className="section-card-icon" style={{ background: '#eff6ff', color: '#2563eb' }}>
          <span className="material-symbols-outlined">install_mobile</span>
        </div>
        <div>
          <h2 className="section-card-title">DayFlow Progressive Web App (PWA)</h2>
          <p className="section-card-desc">Install DayFlow on your Windows desktop or Android device for quick offline access.</p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.25rem' }}>
        {isInstalled ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', color: '#16a34a', fontWeight: 600, fontSize: '0.9rem' }}>
            <span className="material-symbols-outlined">check_circle</span>
            <span>DayFlow is already running in installed / standalone mode!</span>
          </div>
        ) : deferredPrompt ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <p style={{ margin: 0, fontSize: '0.875rem', color: '#334155', fontWeight: 500 }}>
                Browser installation is ready. Add DayFlow to your home screen or desktop taskbar.
              </p>
            </div>
            <button
              type="button"
              className="action-outline-btn"
              style={{
                background: '#2563eb',
                color: '#ffffff',
                border: 'none',
                boxShadow: '0 4px 12px rgba(37,99,235,0.25)',
                padding: '0.55rem 1.1rem',
              }}
              onClick={handleInstallClick}
            >
              <span className="material-symbols-outlined">download</span>
              <span>Install DayFlow App</span>
            </button>
          </div>
        ) : isIOS ? (
          <div style={{ fontSize: '0.875rem', color: '#475569', lineHeight: 1.5 }}>
            <p style={{ margin: '0 0 0.5rem 0', fontWeight: 600, color: '#0f172a' }}>To install on iOS (Safari):</p>
            <p style={{ margin: 0 }}>Tap the <strong>Share</strong> button in Safari, then select <strong>"Add to Home Screen"</strong>.</p>
          </div>
        ) : (
          <div style={{ fontSize: '0.875rem', color: '#64748b', lineHeight: 1.5 }}>
            <p style={{ margin: 0 }}>
              To install DayFlow on Windows or Android: Look for the <strong>Install</strong> or <strong>App available</strong> icon in your browser's address bar (Chrome, Edge, or Brave), or select <strong>Install app</strong> from the browser menu (⋮).
            </p>
          </div>
        )}

        <div style={{ padding: '0.875rem 1rem', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '0.8125rem', color: '#64748b' }}>
          <strong>PWA Features Enabled:</strong> Fast loading, offline app shell cache, standalone full-screen window, and responsive mobile interface.
        </div>
      </div>
    </section>
  );
};

export default InstallPwaCard;
