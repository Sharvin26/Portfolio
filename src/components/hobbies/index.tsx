export function HobbiesSection() {
    return (
        <section
            id="hobbies"
            className="py-24 md:py-32 border-t border-border"
        >
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
                        04
                    </div>
                    <div>
                        <h2 className="text-4xl md:text-5xl font-light mb-12">
                            Hobbies &amp; Interests
                        </h2>
                        <div className="grid sm:grid-cols-2 gap-0">
                            <div className="hobby-card-hover p-8 bg-card">
                                <h3 className="text-2xl font-light mb-3">
                                    Marvel &amp; TV Shows
                                </h3>
                                <p className="text-muted-foreground text-base leading-relaxed">
                                    Good storytelling is a skill. Marvel and a
                                    well-written series are how I study how
                                    narratives land - and why some ideas stick
                                    while others don&apos;t.
                                </p>
                            </div>
                            <div className="hobby-card-hover p-8 bg-card">
                                <h3 className="text-2xl font-light mb-3">
                                    Traveling
                                </h3>
                                <p className="text-muted-foreground text-base leading-relaxed">
                                    Seeing how different places solve the same
                                    problems differently is one of the best ways
                                    I know to stay flexible in how I think.
                                </p>
                            </div>
                            <div className="hobby-card-hover p-8 bg-card">
                                <h3 className="text-2xl font-light mb-3">
                                    Gaming
                                </h3>
                                <p className="text-muted-foreground text-base leading-relaxed">
                                    Video games are some of the most complex
                                    interactive systems ever built. Playing them
                                    is the hobby. Watching how they balance
                                    depth and usability is the education.
                                </p>
                            </div>
                            <div className="hobby-card-hover p-8 bg-card">
                                <h3 className="text-2xl font-light mb-3">
                                    Writing &amp; Sharing
                                </h3>
                                <p className="text-muted-foreground text-base leading-relaxed">
                                    I write regularly on freeCodeCamp and
                                    MTechZilla&apos;s blog. If I&apos;ve solved
                                    a problem worth documenting, I&apos;d rather
                                    put it where someone else can find it.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
