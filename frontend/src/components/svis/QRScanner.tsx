import { Html5Qrcode } from "html5-qrcode";
import { useEffect, useRef } from "react";

interface QRScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onScanFailure?: (errorMessage: string) => void;
}

export function QRScanner({ onScanSuccess, onScanFailure }: QRScannerProps) {
  const qrRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    let isMounted = true;
    let html5QrCode: Html5Qrcode | null = null;

    // Inject keyframes styles dynamically (browser-only)
    const styleId = "qr-scanner-styles";
    if (typeof document !== "undefined" && !document.getElementById(styleId)) {
      const style = document.createElement("style");
      style.id = styleId;
      style.innerHTML = `
        @keyframes scanLine {
          0%, 100% {
            top: 0%;
            opacity: 0.8;
          }
          50% {
            top: 100%;
            opacity: 0.8;
          }
        }
      `;
      document.head.appendChild(style);
    }

    // Delay initialization slightly to guarantee DOM mounting is complete
    const timer = setTimeout(() => {
      if (!isMounted) return;

      const container = document.getElementById("qr-reader-container");
      if (!container) return;

      html5QrCode = new Html5Qrcode("qr-reader-container");
      qrRef.current = html5QrCode;

      html5QrCode
        .start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
          },
          (decodedText) => {
            if (isMounted) {
              onScanSuccess(decodedText);
            }
          },
          (errorMessage) => {
            if (isMounted && onScanFailure) {
              onScanFailure(errorMessage);
            }
          }
        )
        .catch((err) => {
          console.error("Failed to start QR scanner stream: ", err);
        });
    }, 200);

    return () => {
      isMounted = false;
      clearTimeout(timer);
      if (html5QrCode) {
        // Stop scanning and release the camera stream
        html5QrCode.stop().catch((err) => {
          console.error("Failed to stop QR scanner stream on cleanup: ", err);
        });
      }
    };
  }, [onScanSuccess, onScanFailure]);

  return (
    <div className="relative w-full aspect-square max-w-sm mx-auto overflow-hidden rounded-xl border border-border bg-black flex items-center justify-center shadow-lg">
      {/* Camera feed canvas container */}
      <div id="qr-reader-container" className="w-full h-full object-cover [&>video]:object-cover [&>video]:w-full [&>video]:h-full" />
      
      {/* Stylized Scan Target Overlay */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <div className="w-60 h-60 border border-primary/30 rounded-xl relative">
          {/* Outer target bracket corners */}
          <div className="absolute -top-1 -left-1 w-6 h-6 border-t-[3px] border-l-[3px] border-primary rounded-tl-md"></div>
          <div className="absolute -top-1 -right-1 w-6 h-6 border-t-[3px] border-r-[3px] border-primary rounded-tr-md"></div>
          <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-[3px] border-l-[3px] border-primary rounded-bl-md"></div>
          <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-[3px] border-r-[3px] border-primary rounded-br-md"></div>
          
          {/* Animated laser scanning line */}
          <div className="w-full h-0.5 bg-primary/80 absolute top-0 shadow-[0_0_8px_rgba(var(--primary),0.8)] animate-[scanLine_2s_ease-in-out_infinite]"></div>
        </div>
      </div>
    </div>
  );
}
