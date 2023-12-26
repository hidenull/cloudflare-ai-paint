import type { Metadata } from 'next'
import './globals.css'

const APP_NAME = "Drawing Ai";
const APP_DEFAULT_TITLE = "Drawing AI on Cloudflare Pages";
const APP_TITLE_TEMPLATE = "%s - Drawing AI";
const APP_DESCRIPTION = "With Drawing AI on Cloudflare Pages, you can perform a variety of drawing tasks with ease. This app provides smart drawing suggestions and features to help you turn your ideas into reality. Start using Drawing AI and discover your creativity!";

export const metadata: Metadata = {
  applicationName: APP_NAME,
  title: {
    default: APP_DEFAULT_TITLE,
    template: APP_TITLE_TEMPLATE,
  },
  description: APP_DESCRIPTION,
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: APP_DEFAULT_TITLE,
  },
  formatDetection: {
    telephone: false,
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content={APP_DEFAULT_TITLE} />
        <meta name="theme-color" content="#000000" />
      </head>
      <body>{children}</body>
    </html>
  )
}
