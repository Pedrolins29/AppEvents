"use client";

import qrcode from "qrcode-generator";

interface QrCodeProps {
  value: string;
  size?: number;
}

// Renders a QR code as plain React-owned <rect> elements (no dangerouslySetInnerHTML) so the SVG
// stays fully controlled and themeable. Synchronous — qrcode-generator computes the module matrix
// on the spot, no network call, no loading state needed.
export function QrCode({ value, size = 160 }: QrCodeProps) {
  const qr = qrcode(0, "M");
  qr.addData(value);
  qr.make();

  const moduleCount = qr.getModuleCount();
  const modules: { row: number; col: number }[] = [];
  for (let row = 0; row < moduleCount; row++) {
    for (let col = 0; col < moduleCount; col++) {
      if (qr.isDark(row, col)) {
        modules.push({ row, col });
      }
    }
  }

  return (
    <svg
      viewBox={`0 0 ${moduleCount} ${moduleCount}`}
      width={size}
      height={size}
      shapeRendering="crispEdges"
      role="img"
      aria-label={value}
    >
      <rect x={0} y={0} width={moduleCount} height={moduleCount} fill="#FFFFFF" />
      {modules.map(({ row, col }) => (
        <rect key={`${row}-${col}`} x={col} y={row} width={1} height={1} fill="#14211D" />
      ))}
    </svg>
  );
}
