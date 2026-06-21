import type {Metadata} from 'next';
import './globals.css';
import { FirebaseClientProvider } from '@/firebase';

const faviconSvg = 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><rect width=%22100%22 height=%22100%22 rx=%222%22 fill=%22%230D1117%22/><text y=%22.9em%22 x=%225%22 font-size=%2280%22 fill=%22%2358A6FF%22 font-family=%22monospace%22 font-weight=%22bold%22>B</text><rect x=%2270%22 y=%2270%22 width=%2220%22 height=%2220%22 fill=%22%2358A6FF%22 opacity=%220.5%22/></svg>';

export const metadata: Metadata = {
  title: 'BWB | Code Assistant',
  description: 'Industrial-grade MCP capability analyzer and code generation suite',
  icons: {
    icon: [
      { url: faviconSvg, type: 'image/svg+xml' },
      { url: faviconSvg, sizes: '32x32', type: 'image/svg+xml' },
      { url: faviconSvg, sizes: '16x16', type: 'image/svg+xml' },
    ],
    shortcut: [faviconSvg],
    apple: [
      { url: faviconSvg, sizes: '180x180', type: 'image/svg+xml' },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased bg-background text-foreground overflow-hidden">
        <FirebaseClientProvider>
          {children}
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
