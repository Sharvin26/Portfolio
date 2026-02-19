import Link from "next/link";
import { GithubIcon } from "@/components/icons/github";
import { LinkedInIcon } from "@/components/icons/linkedin";
import { TwitterIcon } from "@/components/icons/twitter";
import { InstagramIcon } from "@/components/icons/instagram";

const socialLinks = [
    {
        label: "LinkedIn",
        href: "https://www.linkedin.com/in/sharvinshah/",
        icon: <LinkedInIcon className="h-4 w-4" />,
    },
    {
        label: "GitHub",
        href: "https://github.com/Sharvin26",
        icon: <GithubIcon className="h-4 w-4" />,
    },
    {
        label: "Twitter / X",
        href: "https://x.com/sharvinshah26",
        icon: <TwitterIcon className="h-4 w-4" />,
    },
    {
        label: "Instagram",
        href: "https://www.instagram.com/thesharvinshah/",
        icon: <InstagramIcon className="h-4 w-4" />,
    },
];

export function Footer() {
    return (
        <footer style={{ backgroundColor: "var(--neutral-200)" }}>
            {/* ── Main footer body ── */}
            <div
                className="border-t"
                style={{ borderColor: "var(--neutral-300)" }}
            >
                <div className="max-w-[1200px] mx-auto px-6 py-14">
                    <div className="grid md:grid-cols-[280px_1fr] gap-12 md:gap-20">

                        {/* Left: brand + contact */}
                        <div className="flex flex-col gap-6">
                            <div>
                                <p
                                    className="text-base font-bold tracking-wide mb-3"
                                    style={{ color: "var(--neutral-700)" }}
                                >
                                    Sharvin Shah
                                </p>
                                <p
                                    className="text-sm leading-relaxed"
                                    style={{ color: "var(--neutral-500)" }}
                                >
                                    Founder &amp; CEO of MTechZilla. Building
                                    software for startups since 2021.
                                </p>
                            </div>
                            <div className="flex flex-col gap-4">
                                <div>
                                    <p
                                        className="text-xs font-semibold uppercase tracking-widest mb-1"
                                        style={{ color: "var(--neutral-500)" }}
                                    >
                                        Start a project
                                    </p>
                                    <Link
                                        href="https://www.mtechzilla.com/contact"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm font-medium underline underline-offset-4 transition-opacity hover:opacity-70"
                                        style={{ color: "var(--primary-700)" }}
                                    >
                                        mtechzilla.com/contact
                                    </Link>
                                </div>
                                <div>
                                    <p
                                        className="text-xs font-semibold uppercase tracking-widest mb-1"
                                        style={{ color: "var(--neutral-500)" }}
                                    >
                                        Read my writing
                                    </p>
                                    <Link
                                        href="https://www.freecodecamp.org/news/author/sharvin/"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm font-medium underline underline-offset-4 transition-opacity hover:opacity-70"
                                        style={{ color: "var(--primary-700)" }}
                                    >
                                        freeCodeCamp
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Right: nav columns */}
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
                            {/* Work */}
                            <div>
                                <p
                                    className="text-xs font-bold uppercase tracking-widest mb-4"
                                    style={{ color: "var(--primary-700)" }}
                                >
                                    Navigation
                                </p>
                                <ul className="flex flex-col gap-2.5">
                                    {[
                                        { label: "About", href: "#about" },
                                        { label: "Experience", href: "#experience" },
                                        { label: "Skills", href: "#skills" },
                                        { label: "Hobbies", href: "#hobbies" },
                                    ].map(({ label, href }) => (
                                        <li key={label}>
                                            <Link
                                                href={href}
                                                className="text-sm transition-colors hover:opacity-70"
                                                style={{ color: "var(--neutral-600)" }}
                                            >
                                                {label}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* MTechZilla */}
                            <div>
                                <p
                                    className="text-xs font-bold uppercase tracking-widest mb-4"
                                    style={{ color: "var(--primary-700)" }}
                                >
                                    MTechZilla
                                </p>
                                <ul className="flex flex-col gap-2.5">
                                    {[
                                        { label: "Our Work", href: "https://www.mtechzilla.com/our-work" },
                                        { label: "Services", href: "https://www.mtechzilla.com/services" },
                                        { label: "Blog", href: "https://www.mtechzilla.com/blog" },
                                        { label: "Contact", href: "https://www.mtechzilla.com/contact" },
                                    ].map(({ label, href }) => (
                                        <li key={label}>
                                            <Link
                                                href={href}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-sm transition-colors hover:opacity-70"
                                                style={{ color: "var(--neutral-600)" }}
                                            >
                                                {label}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Writing */}
                            <div>
                                <p
                                    className="text-xs font-bold uppercase tracking-widest mb-4"
                                    style={{ color: "var(--primary-700)" }}
                                >
                                    Writing
                                </p>
                                <ul className="flex flex-col gap-2.5">
                                    {[
                                        { label: "freeCodeCamp", href: "https://www.freecodecamp.org/news/author/sharvin/" },
                                        { label: "MTechZilla Blog", href: "https://www.mtechzilla.com/blog" },
                                    ].map(({ label, href }) => (
                                        <li key={label}>
                                            <Link
                                                href={href}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-sm transition-colors hover:opacity-70"
                                                style={{ color: "var(--neutral-600)" }}
                                            >
                                                {label}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Bottom bar ── */}
            <div
                className="border-t"
                style={{ borderColor: "var(--neutral-300)" }}
            >
                <div className="max-w-[1200px] mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p
                        className="text-xs"
                        style={{ color: "var(--neutral-500)" }}
                    >
                        © 2026, Sharvin Shah. All rights reserved.
                    </p>

                    {/* Bordered social icon buttons — matching MTechZilla style */}
                    <div className="flex items-center gap-2">
                        {socialLinks.map(({ label, href, icon }) => (
                            <Link
                                key={label}
                                href={href}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={label}
                                className="social-icon-btn"
                            >
                                {icon}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
}
