import type { Metadata } from "next";

import { NavBar } from "@/components/common/navbar";
import { Footer } from "@/components/common/footer";
import { HeroSection } from "@/components/hero";
import { AboutSection } from "@/components/about";
import { ExperienceSection } from "@/components/experience";
import { SkillsSection } from "@/components/skills";
import { HobbiesSection } from "@/components/hobbies";

const siteDescription =
    "Sharvin Shah is the Founder & CEO of MTechZilla, a software agency helping startups and businesses build full-stack web apps, mobile apps, and AI tools. Based in India.";

export const metadata: Metadata = {
    title: "Sharvin Shah | Founder of MTechZilla - Software Agency",
    description: siteDescription,
    keywords: [
        "Sharvin Shah",
        "MTechZilla",
        "software agency India",
        "software development agency",
        "startup software development",
        "full-stack development",
        "SaaS development",
        "web development",
        "mobile app development",
        "AI development",
        "hire software engineer India",
    ],
    authors: [{ name: "Sharvin Shah" }],
    openGraph: {
        title: "Sharvin Shah | Founder & CEO, MTechZilla",
        description: siteDescription,
        url: "https://sharvinshah.com",
        siteName: "Sharvin Shah",
        type: "profile",
        images: [
            {
                url: "/sharvin.png",
                width: 720,
                height: 960,
                alt: "Sharvin Shah - Founder of MTechZilla",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "Sharvin Shah | Founder & CEO, MTechZilla",
        description: siteDescription,
        creator: "@sharvinshah26",
        images: ["/sharvin.png"],
    },
    alternates: { canonical: "https://sharvinshah.com" },
};

const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Sharvin Shah",
    url: "https://sharvinshah.com",
    image: "https://sharvinshah.com/sharvin.png",
    jobTitle: "Founder & CEO",
    worksFor: {
        "@type": "Organization",
        name: "MTechZilla",
        url: "https://www.mtechzilla.com",
    },
    sameAs: [
        "https://x.com/sharvinshah26",
        "https://www.linkedin.com/in/sharvinshah/",
        "https://github.com/Sharvin26",
    ],
    description: siteDescription,
};

export default function Home() {
    return (
        <div className="flex min-h-screen flex-col bg-background">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <NavBar />
            <HeroSection />
            <main>
                <AboutSection />
                <ExperienceSection />
                <SkillsSection />
                <HobbiesSection />
            </main>
            <Footer />
        </div>
    );
}
