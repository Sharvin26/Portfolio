import type { Metadata } from "next";
import { Urbanist, Manrope } from "next/font/google";
import "./globals.css";

const urbanist = Urbanist({
    variable: "--font-urbanist",
    subsets: ["latin"],
    weight: ["300", "400", "500", "600", "700", "800"],
    display: "swap",
});

const manrope = Manrope({
    variable: "--font-manrope",
    subsets: ["latin"],
    weight: ["300", "400", "500", "600", "700", "800"],
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
                className={`${urbanist.variable} ${manrope.variable} antialiased`}
            >
                {children}
            </body>
        </html>
    );
}
