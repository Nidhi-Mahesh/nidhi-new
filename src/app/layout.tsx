
import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from '@/context/auth-provider';

export const metadata: Metadata = {
  title: 'Modern Chyrp',
  description: 'A modern, elegant, and powerful blogging platform.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&family=Space+Grotesk:wght@400;500;700&family=Source+Code+Pro&display=swap" rel="stylesheet" />
        <Script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-101FEQ1355"
        ></Script>
        <Script id="google-analytics">
          {
            `window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-101FEQ1355');`
          }
        </Script>
        <Script 
            id="mathjax-script"
            strategy="afterInteractive"
            type="text/javascript"
            dangerouslySetInnerHTML={{
                __html: `
                    window.MathJax = {
                        tex: {
                            inlineMath: [['$', '$'], ['\\(', '\\)']],
                            displayMath: [['$$', '$$'], ['\\[', '\\]']]
                        },
                        svg: {
                            fontCache: 'global'
                        }
                    };
                `
            }}
        />
        <Script 
            id="mathjax-loader"
            strategy="afterInteractive"
            type="text/javascript"
            src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js"
        />
      </head>
      <body className="font-body antialiased">
        <AuthProvider>
          {children}
        </AuthProvider>
        <Toaster />
        <Script type="module" src="https://unpkg.com/@splinetool/viewer@1.10.53/build/spline-viewer.js" />
        </body>
    </html>
  );
}
