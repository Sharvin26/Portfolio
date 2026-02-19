import { SkillCard } from "./skill-card";

export function SkillsSection() {
    return (
        <section id="skills" className="py-20 md:py-28 border-b border-border">
            <div className="max-w-[1200px] mx-auto px-6">
                <div className="animate-on-scroll">
                    <div className="section-label mb-6">Skills &amp; Expertise</div>
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold max-w-lg">
                            Technologies I Build With
                        </h2>
                        <p
                            className="text-sm max-w-xs leading-relaxed"
                            style={{ color: "var(--neutral-500)" }}
                        >
                            A decade of shipping across the full stack —
                            from mobile to cloud infrastructure.
                        </p>
                    </div>
                    <div
                        className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px border border-[oklch(0.2478_0_0)]"
                        style={{ backgroundColor: "var(--neutral-700)" }}
                    >
                        {[
                            {
                                number: "01",
                                title: "Frontend Development",
                                skills: ["React", "Next.js", "TypeScript", "Tailwind CSS"],
                            },
                            {
                                number: "02",
                                title: "Backend Development",
                                skills: ["Node.js", "Express", "REST APIs", "AI/LLM Integration"],
                            },
                            {
                                number: "03",
                                title: "Mobile Development",
                                skills: ["React Native", "Flutter"],
                            },
                            {
                                number: "04",
                                title: "Databases",
                                skills: ["PostgreSQL", "MongoDB", "MySQL", "Redis", "Supabase"],
                            },
                            {
                                number: "05",
                                title: "DevOps & Cloud",
                                skills: ["AWS", "Docker", "Kubernetes", "CI/CD", "Terraform"],
                            },
                            {
                                number: "06",
                                title: "Leadership & Strategy",
                                skills: ["UI/UX Design", "Project Management", "Team Leadership", "Technical Writing"],
                            },
                        ].map((card) => (
                            <SkillCard key={card.number} {...card} />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
