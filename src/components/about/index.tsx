export function AboutSection() {
    return (
        <section id="about" className="py-24 md:py-32 border-t border-border">
            <div className="max-w-[1200px] mx-auto px-6">
                <div className="grid md:grid-cols-[120px_1fr] gap-12 md:gap-20 animate-on-scroll">
                    <div
                        className="hidden md:block leading-none select-none"
                        style={{
                            fontFamily: "var(--font-cormorant), Georgia, serif",
                            fontSize: "6rem",
                            fontWeight: 300,
                            color: "var(--border)",
                        }}
                    >
                        01
                    </div>
                    <div>
                        <h2 className="text-4xl md:text-5xl font-light mb-8">
                            About Me
                        </h2>
                        <div className="text-base space-y-5 max-w-2xl">
                            <p className="text-muted-foreground leading-relaxed">
                                I&apos;m a software engineer who started
                                MTechZilla because too many good ideas were
                                dying from bad execution. Since 2021, I&apos;ve
                                led a team of developers and designers helping
                                startups and businesses turn product ideas into
                                software that works - and keeps working.
                            </p>
                            <p className="text-muted-foreground leading-relaxed">
                                I&apos;ve built across the stack for over a
                                decade: SaaS platforms, IoT systems, mobile
                                apps, backend infrastructure. I&apos;ve shipped
                                products across industries and picked up enough
                                hard-won experience to know what kills projects
                                early - and how to avoid it. That&apos;s what
                                goes into everything my team builds.
                            </p>
                            <p className="text-muted-foreground leading-relaxed">
                                When I&apos;m not building, I&apos;m reading
                                Marvel, watching TV I can&apos;t stop thinking
                                about, or traveling somewhere I&apos;ve never
                                been. I also write regularly on freeCodeCamp -
                                if I&apos;ve solved a problem worth documenting,
                                I&apos;d rather share it than let it collect
                                dust.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
