"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { GithubIcon } from "@/components/icons/github";
import { LinkedInIcon } from "@/components/icons/linkedin";
import { TwitterIcon } from "@/components/icons/twitter";

const navLinks = [
    { label: "About", href: "#about" },
    { label: "Experience", href: "#experience" },
    { label: "Skills", href: "#skills" },
    { label: "Hobbies", href: "#hobbies" },
    { label: "Blog", href: "https://www.mtechzilla.com/blog", external: true },
];

export function NavBar() {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 10);
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <header
            className={`sticky top-0 z-50 w-full border-b border-border transition-all duration-300 ${
                scrolled
                    ? "bg-[rgba(250,250,248,0.92)] backdrop-blur-md"
                    : "bg-background"
            }`}
        >
            <div className="max-w-[1200px] mx-auto px-6 flex h-14 items-center justify-between gap-8">

                {/* Brand */}
                <Link
                    href="/"
                    className="shrink-0 uppercase text-sm tracking-[0.08em] font-semibold text-foreground hover:text-accent transition-colors"
                    style={{ fontFamily: "var(--font-dm-sans), system-ui, sans-serif" }}
                >
                    Sharvin Shah
                </Link>

                {/* Nav links - Tailwind after: for underline animation */}
                <nav className="hidden md:flex items-center gap-7">
                    {navLinks.map(({ label, href, external }) => (
                        <Link
                            key={label}
                            href={href}
                            {...(external
                                ? { target: "_blank", rel: "noopener noreferrer" }
                                : {})}
                            className="relative uppercase text-sm tracking-[0.06em] font-medium text-foreground/60 hover:text-foreground transition-colors duration-200 after:absolute after:bottom-[-2px] after:left-0 after:h-px after:w-0 after:bg-foreground after:transition-[width] after:duration-300 hover:after:w-full"
                        >
                            {label}
                        </Link>
                    ))}
                </nav>

                {/* Social icons */}
                <div className="flex items-center gap-4 shrink-0">
                    <Link
                        href="https://x.com/sharvinshah26"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Twitter"
                        className="text-foreground/40 hover:text-foreground transition-colors duration-200"
                    >
                        <TwitterIcon className="h-[18px] w-[18px]" />
                    </Link>
                    <Link
                        href="https://www.linkedin.com/in/sharvinshah/"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="LinkedIn"
                        className="text-foreground/40 hover:text-foreground transition-colors duration-200"
                    >
                        <LinkedInIcon className="h-[18px] w-[18px]" />
                    </Link>
                    <Link
                        href="https://github.com/Sharvin26"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="GitHub"
                        className="text-foreground/40 hover:text-foreground transition-colors duration-200"
                    >
                        <GithubIcon className="h-[18px] w-[18px]" />
                    </Link>
                </div>

            </div>
        </header>
    );
}
