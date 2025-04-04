import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Sharvin Shah",
    description:
        "MTechZilla Founder & CEO | Web & Mobile App Development, AI/ML Solutions",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <link rel="icon" href="/favicon.ico" sizes="any" />
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased`}
            >
                <div className="container max-w-[1200px] mx-auto px-4">
                    {children}
                </div>
            </body>
        </html>
    );
}
