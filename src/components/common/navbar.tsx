"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const navLinks = [
    { label: "About", href: "#about" },
    { label: "Experience", href: "#experience" },
    { label: "Skills", href: "#skills" },
    { label: "Hobbies", href: "#hobbies" },
    { label: "Blog", href: "https://www.mtechzilla.com/blog", external: true },
];

export function NavBar() {
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 10);
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <header
            className={`sticky top-0 z-50 w-full transition-all duration-300 ${
                scrolled ? "nav-scrolled" : "bg-white border-b border-border"
            }`}
        >
            <div className="max-w-[1200px] mx-auto px-6 flex h-14 items-center justify-between">

                {/* Brand */}
                <Link
                    href="/"
                    className="shrink-0 text-base font-bold tracking-wide text-foreground hover:text-accent transition-colors"
                >
                    Sharvin Shah
                </Link>

                {/* Nav links */}
                <nav className="hidden md:flex items-center gap-8">
                    {navLinks.map(({ label, href, external }) => (
                        <Link
                            key={label}
                            href={href}
                            {...(external
                                ? { target: "_blank", rel: "noopener noreferrer" }
                                : {})}
                            className="nav-link"
                        >
                            {label}
                        </Link>
                    ))}
                </nav>

                {/* CTA */}
                <div className="hidden md:flex shrink-0">
                    <Link
                        href="https://www.mtechzilla.com/contact"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="nav-cta"
                    >
                        Hire Me
                    </Link>
                </div>

                {/* Mobile hamburger */}
                <button
                    className="md:hidden flex flex-col justify-center gap-[5px] p-1"
                    onClick={() => setMenuOpen(!menuOpen)}
                    aria-label="Toggle menu"
                >
                    <span className={`block h-px w-5 bg-foreground transition-all duration-300 origin-center ${menuOpen ? "rotate-45 translate-y-[6px]" : ""}`} />
                    <span className={`block h-px w-5 bg-foreground transition-all duration-300 ${menuOpen ? "opacity-0" : ""}`} />
                    <span className={`block h-px w-5 bg-foreground transition-all duration-300 origin-center ${menuOpen ? "-rotate-45 -translate-y-[6px]" : ""}`} />
                </button>
            </div>

            {/* Mobile menu */}
            {menuOpen && (
                <div className="md:hidden bg-white border-t border-border px-6 py-5 flex flex-col gap-4">
                    {navLinks.map(({ label, href, external }) => (
                        <Link
                            key={label}
                            href={href}
                            {...(external
                                ? { target: "_blank", rel: "noopener noreferrer" }
                                : {})}
                            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                            onClick={() => setMenuOpen(false)}
                        >
                            {label}
                        </Link>
                    ))}
                    <Link
                        href="https://www.mtechzilla.com/contact"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="nav-cta self-start mt-1"
                        onClick={() => setMenuOpen(false)}
                    >
                        Hire Me
                    </Link>
                </div>
            )}
        </header>
    );
}
