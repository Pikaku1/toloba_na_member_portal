import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function installedApp() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in navigator &&
      (navigator as Navigator & { standalone?: boolean }).standalone === true)
  );
}

function iosDevice() {
  const ua = navigator.userAgent;
  return (
    /iPad|iPhone|iPod/.test(ua) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

function iosSafari() {
  return iosDevice() && !/CriOS|FxiOS|EdgiOS|OPiOS/.test(navigator.userAgent);
}

const InstallApp: React.FC = () => {
  const [promptEvent, setPromptEvent] = useState<InstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(true);
  const [ios, setIos] = useState(false);
  const [safari, setSafari] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  useEffect(() => {
    setInstalled(installedApp());
    setIos(iosDevice());
    setSafari(iosSafari());

    const onPrompt = (event: Event) => {
      event.preventDefault();
      setPromptEvent(event as InstallPromptEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setPromptEvent(null);
      setHelpOpen(false);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (installed) return null;
  if (!promptEvent && !ios) return null;

  const install = async () => {
    if (promptEvent) {
      await promptEvent.prompt();
      const choice = await promptEvent.userChoice;
      setPromptEvent(null);
      if (choice.outcome === "accepted") setInstalled(true);
      return;
    }
    setHelpOpen(true);
  };

  return (
    <>
      <button type="button" className="btn btn-ghost install-app" onClick={() => void install()}>
        Install the Toloba NA app
      </button>
      {helpOpen &&
        createPortal(
        <div className="install-sheet" role="presentation" onClick={() => setHelpOpen(false)}>
          <div
            className="install-panel"
            role="dialog"
            aria-labelledby="install-title"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 id="install-title">Install Toloba NA</h2>
            {safari ? (
              <ol>
                <li>Tap the Share button in Safari.</li>
                <li>Tap Add to Home Screen.</li>
                <li>Tap Add.</li>
              </ol>
            ) : (
              <p>Open this page in Safari, then use Share and Add to Home Screen.</p>
            )}
            <button type="button" className="btn btn-navy" onClick={() => setHelpOpen(false)}>
              Done
            </button>
          </div>
        </div>,
        document.body,
      )}
      <style>{`
        .install-app {
          margin-top: 8px;
          width: 100%;
        }

        .install-sheet {
          position: fixed;
          inset: 0;
          z-index: 400;
          background: rgba(9, 9, 11, 0.4);
          display: flex;
          align-items: flex-end;
          justify-content: center;
        }

        .install-panel {
          width: 100%;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 16px 16px 0 0;
          padding: 24px 16px calc(24px + env(safe-area-inset-bottom, 0px));
        }

        .install-panel h2 {
          font-size: 20px;
          margin-bottom: 12px;
        }

        .install-panel ol,
        .install-panel p {
          margin: 0 0 16px;
          color: var(--ink-secondary);
          font-size: 15px;
          line-height: 1.45;
        }

        .install-panel ol {
          padding-left: 20px;
        }

        .install-panel li + li {
          margin-top: 8px;
        }

        @media (min-width: 768px) {
          .install-sheet {
            align-items: center;
            padding: 24px;
          }

          .install-panel {
            max-width: 420px;
            border-radius: 12px;
            padding: 32px 24px;
          }
        }
      `}</style>
    </>
  );
};

export default InstallApp;
