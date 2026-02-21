import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { headers } from "next/headers";
import { AppProviders } from "@/shared/providers";
import { getTenantFromDomain } from "@/shared/config/env";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "GestiCash - Solution de Gestion & de Vente",
  description: "GestiCash simplifie la gestion et booste la performance de votre activité",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Récupérer la locale et les messages
  const locale = await getLocale();
  const messages = await getMessages();
  
  // Extraire le tenant depuis le hostname
  const headersList = await headers();
  const hostname = headersList.get("host") || "";
  const tenantSlug = getTenantFromDomain(hostname);

  return (
    <html lang={locale} suppressHydrationWarning>
      <body
        className={`${montserrat.variable} antialiased`}
        suppressHydrationWarning
      >
        {/* Applique le thème sur <html> avant hydratation pour que le tenant (et tout le reste) voie le bon mode */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var k='gesticash-theme';var t;try{t=localStorage.getItem(k);}catch(e){}var r=t==='dark'||t==='light'?t:(window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');document.documentElement.classList.remove('light','dark');document.documentElement.classList.add(r);})();`,
          }}
        />
        <NextIntlClientProvider messages={messages}>
          <AppProviders tenantSlug={tenantSlug}>
            {children}
          </AppProviders>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
