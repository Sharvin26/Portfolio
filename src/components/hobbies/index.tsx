const hobbies = [
    {
        icon: "◈",
        title: "Marvel & TV Shows",
        description:
            "Good storytelling is a skill. Marvel and a well-written series are how I study how narratives land — and why some ideas stick while others don't.",
    },
    {
        icon: "◈",
        title: "Traveling",
        description:
            "Seeing how different places solve the same problems differently is one of the best ways I know to stay flexible in how I think.",
    },
    {
        icon: "◈",
        title: "Gaming",
        description:
            "Video games are some of the most complex interactive systems ever built. Playing them is the hobby. Watching how they balance depth and usability is the education.",
    },
    {
        icon: "◈",
        title: "Writing & Sharing",
        description:
            "I write regularly on freeCodeCamp and MTechZilla's blog. If I've solved a problem worth documenting, I'd rather put it where someone else can find it.",
    },
];

export function HobbiesSection() {
    return (
        <section
            id="hobbies"
            className="py-20 md:py-28 border-b border-border"
        >
            <div className="max-w-[1200px] mx-auto px-6">
                <div className="animate-on-scroll">
                    <div className="section-label mb-6">Hobbies &amp; Interests</div>
                    <h2 className="text-3xl md:text-4xl font-bold mb-12">
                        Beyond the Code
                    </h2>
                    <div
                        className="grid sm:grid-cols-2 gap-px border border-[oklch(0.2478_0_0)]"
                        style={{ backgroundColor: "var(--neutral-700)" }}
                    >
                        {hobbies.map((hobby) => (
                            <div
                                key={hobby.title}
                                className="hobby-card-hover p-8 flex flex-col gap-4"
                                style={{ backgroundColor: "var(--neutral-200)" }}
                            >
                                <span
                                    className="text-lg"
                                    style={{ color: "var(--primary-500)" }}
                                >
                                    {hobby.icon}
                                </span>
                                <h3 className="text-xl font-bold">{hobby.title}</h3>
                                <p
                                    className="text-base leading-relaxed"
                                    style={{ color: "var(--neutral-500)" }}
                                >
                                    {hobby.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
