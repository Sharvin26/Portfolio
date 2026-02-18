import Image from "next/image";
import Link from "next/link";

const headline = "I turn product ideas into working software.";
const words = headline.split(" ");

export function HeroSection() {
    return (
        <section className="py-20 md:py-28">
            <div className="max-w-[1200px] mx-auto px-6 w-full">
                <div className="grid md:grid-cols-[1fr_260px] lg:grid-cols-[1fr_380px] xl:grid-cols-[1fr_420px] gap-12 xl:gap-20 items-center">
                    {/* ── Text Block ── */}
                    <div className="min-w-0 flex flex-col gap-8">
                        {/* Headline - flex-wrap + gap-x prevents overflow */}
                        <h1 className="flex flex-wrap gap-x-[0.22em] text-4xl sm:text-5xl lg:text-7xl font-light leading-[1.05]">
                            {words.map((word, i) => (
                                <span
                                    key={i}
                                    className="animate-word-reveal"
                                    style={{
                                        animationDelay: `${0.2 + i * 0.08}s`,
                                    }}
                                >
                                    {word}
                                </span>
                            ))}
                        </h1>

                        {/* Animated divider rule */}
                        <hr
                            className="hero-rule animate-hero-rule"
                            style={{ animationDelay: "0.72s" }}
                        />

                        {/* Founder label + bio */}
                        <div
                            className="animate-hero-fade flex flex-col gap-4"
                            style={{ animationDelay: "0.85s" }}
                        >
                            <p className="text-muted-foreground text-base max-w-lg leading-relaxed">
                                I&apos;m Sharvin - Founder &amp; CEO of{" "}
                                <Link
                                    href="https://www.mtechzilla.com/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-accent hover:underline underline-offset-4"
                                >
                                    MTechZilla
                                </Link>
                                , a software agency that helps startups and
                                businesses go from idea to working product. Over
                                10 years in the industry, I&apos;ve led teams
                                building full-stack web apps, mobile apps, and
                                AI-powered tools that real users actually rely
                                on.
                            </p>
                        </div>
                    </div>

                    {/* ── Image Block ── */}
                    <div
                        className="animate-hero-fade"
                        style={{ animationDelay: "0.4s" }}
                    >
                        {/* Portrait - small square on mobile, full 3:4 column on desktop */}
                        <div className="relative w-full max-w-[240px] mx-auto md:max-w-none aspect-square overflow-hidden">
                            <Image
                                src="/sharvin.png"
                                alt="Sharvin Shah"
                                fill
                                sizes="(max-width: 768px) 240px, (max-width: 1024px) 260px, 420px"
                                className="object-cover object-top"
                                priority
                            />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
