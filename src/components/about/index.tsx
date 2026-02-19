export function AboutSection() {
    return (
        <section id="about" className="py-20 md:py-28 border-b border-border">
            <div className="max-w-[1200px] mx-auto px-6">
                <div className="animate-on-scroll">
                    <div className="section-label mb-6">About Me</div>
                    <div className="grid md:grid-cols-[1fr_1fr] gap-12 md:gap-20 items-start">
                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
                            Software Engineer.<br />
                            <span style={{ color: "var(--primary-700)" }}>Agency Founder.</span><br />
                            Builder at heart.
                        </h2>
                        <div className="text-base space-y-5">
                            <p style={{ color: "var(--neutral-500)" }} className="leading-relaxed">
                                I&apos;m a software engineer who started
                                MTechZilla because too many good ideas were
                                dying from bad execution. Since 2021, I&apos;ve
                                led a team of developers and designers helping
                                startups and businesses turn product ideas into
                                software that works — and keeps working.
                            </p>
                            <p style={{ color: "var(--neutral-500)" }} className="leading-relaxed">
                                I&apos;ve built across the stack for over a
                                decade: SaaS platforms, IoT systems, mobile
                                apps, backend infrastructure. I&apos;ve shipped
                                products across industries and picked up enough
                                hard-won experience to know what kills projects
                                early — and how to avoid it.
                            </p>
                            <p style={{ color: "var(--neutral-500)" }} className="leading-relaxed">
                                When I&apos;m not building, I&apos;m reading
                                Marvel, watching TV I can&apos;t stop thinking
                                about, or traveling somewhere I&apos;ve never
                                been. I also write regularly on freeCodeCamp —
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
