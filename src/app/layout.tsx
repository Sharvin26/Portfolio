import type { Metadata } from "next";
import { Cormorant_Garamond, DM_Sans } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
    variable: "--font-cormorant",
    subsets: ["latin"],
    weight: ["300", "400", "500", "600"],
    display: "swap",
});

const dmSans = DM_Sans({
    variable: "--font-dm-sans",
    subsets: ["latin"],
    weight: ["300", "400", "500"],
    display: "swap",
});

export const metadata: Metadata = {
    metadataBase: new URL("https://sharvinshah.com"),
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
                className={`${cormorant.variable} ${dmSans.variable} antialiased`}
            >
                {children}
            </body>
        </html>
    );
}
