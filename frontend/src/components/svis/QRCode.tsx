import { QRCodeSVG } from "qrcode.react";

interface QRCodeProps {
  value: string;
  size?: number;
}

/**
 * Generates a real, fully scannable QR code using qrcode.react.
 * 
 * @param value - The text/data value to encode in the QR code.
 * @param size - The dimensions of the square QR code component (default: 180).
 */
export function QRCode({ value, size = 180 }: QRCodeProps) {
  return (
    <div className="p-2 bg-white rounded-lg flex items-center justify-center inline-block">
      <QRCodeSVG
        value={value}
        size={size}
        bgColor="#ffffff"
        fgColor="#0f172a"
        level="M"
        includeMargin={false}
      />
    </div>
  );
}
