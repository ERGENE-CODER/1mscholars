import Header from "./component/Header";
import Footer from "./component/Footer";
import SocialBar from "./component/SocialBar";

import type { Metadata } from "next";
import { Geist, Geist_Mono, Open_Sans } from "next/font/google";
import "./globals.css";
import { createClient } from "@/lib/supabase/server";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

// Classic, highly readable sans used by the opportunity cards, filters and lists.
const openSans = Open_Sans({
  variable: "--font-open-sans",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "1M Scholars",
  description: "Your Future, Our Mission",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();

  let isAdmin = false;
  let user: { name: string | null; email: string | null } | null = null;

  if (data?.claims) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, full_name, email")
      .eq("id", data.claims.sub)
      .single();

    isAdmin = profile?.role === "admin";

    const metadata = data.claims.user_metadata as
      | { full_name?: string }
      | undefined;

    user = {
      name: profile?.full_name ?? metadata?.full_name ?? null,
      email:
        profile?.email ?? (data.claims as { email?: string }).email ?? null,
    };
  }

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${openSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <SocialBar />
        <Header isAdmin={isAdmin} user={user} />
        {children}
        <Footer />
      </body>
    </html>
  );
}