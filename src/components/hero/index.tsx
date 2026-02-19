import Image from "next/image";
import Link from "next/link";

const stats = [
    { value: "10+", label: "Years Experience" },
    { value: "30+", label: "Projects Shipped" },
    { value: "2021", label: "Founded MTechZilla" },
    { value: "$10M+", label: "Client Revenue" },
];

export function HeroSection() {
    return (
        <section className="border-b border-border">
            {/* ── Main hero grid ── */}
            <div className="max-w-[1200px] mx-auto px-6 w-full py-16 md:py-24">
                <div className="grid md:grid-cols-[1fr_300px] lg:grid-cols-[1fr_360px] gap-12 lg:gap-20 items-center">

                    {/* ── Text Block ── */}
                    <div className="flex flex-col gap-7">
                        {/* Eyebrow label */}
                        <div className="section-label animate-hero-fade" style={{ animationDelay: "0.1s" }}>
                            Founder &amp; CEO, MTechZilla
                        </div>

                        {/* Headline */}
                        <h1
                            className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.08] tracking-tight animate-hero-fade"
                            style={{ animationDelay: "0.2s" }}
                        >
                            I turn product ideas<br />
                            into{" "}
                            <span style={{ color: "var(--primary-700)" }}>
                                working software.
                            </span>
                        </h1>

                        {/* Bio */}
                        <p
                            className="text-base leading-relaxed max-w-lg animate-hero-fade"
                            style={{ color: "var(--neutral-500)", animationDelay: "0.35s" }}
                        >
                            I&apos;m Sharvin — Founder &amp; CEO of{" "}
                            <Link
                                href="https://www.mtechzilla.com/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-semibold underline underline-offset-4"
                                style={{ color: "var(--primary-700)" }}
                            >
                                MTechZilla
                            </Link>
                            . Over 10 years building full-stack web apps, mobile
                            apps, and AI-powered tools — for startups and businesses
                            that need real engineering, not just promises.
                        </p>

                        {/* CTAs */}
                        <div
                            className="flex flex-wrap gap-3 animate-hero-fade"
                            style={{ animationDelay: "0.5s" }}
                        >
                            <Link
                                href="https://www.mtechzilla.com/contact"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn-primary"
                            >
                                Work With Me →
                            </Link>
                            <Link
                                href="https://www.mtechzilla.com/blog"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn-outline"
                            >
                                Read My Blog
                            </Link>
                        </div>
                    </div>

                    {/* ── Image Block ── */}
                    <div
                        className="animate-hero-fade"
                        style={{ animationDelay: "0.3s" }}
                    >
                        <div
                            className="relative w-full max-w-[260px] mx-auto md:max-w-none aspect-[3/4] overflow-hidden"
                            style={{ border: "1.5px solid var(--border)" }}
                        >
                            <Image
                                src="/sharvin.png"
                                alt="Sharvin Shah"
                                fill
                                sizes="(max-width: 768px) 260px, (max-width: 1024px) 300px, 360px"
                                className="object-cover object-top"
                                priority
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Stats bar ── */}
            <div
                className="animate-hero-fade"
                style={{
                    backgroundColor: "var(--neutral-700)",
                    animationDelay: "0.65s",
                }}
            >
                <div className="max-w-[1200px] mx-auto px-6 py-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-0">
                        {stats.map((stat) => (
                            <div
                                key={stat.label}
                                className="flex flex-col items-center text-center md:border-r last:border-r-0"
                                style={{ borderColor: "var(--dark-border)" }}
                            >
                                <span
                                    className="text-4xl md:text-5xl font-bold leading-none"
                                    style={{ color: "var(--neutral-100)" }}
                                >
                                    {stat.value}
                                </span>
                                <span
                                    className="text-xs font-semibold tracking-widest uppercase mt-2"
                                    style={{ color: "var(--neutral-400)" }}
                                >
                                    {stat.label}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
