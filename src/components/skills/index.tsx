import { SkillCard } from "./skill-card";

export function SkillsSection() {
    return (
        <section id="skills" className="py-24 md:py-32 border-t border-border">
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
                        03
                    </div>
                    <div>
                        <h2 className="text-4xl md:text-5xl font-light mb-12">
                            Skills &amp; Expertise
                        </h2>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-0">
                            <SkillCard
                                title="Frontend Development"
                                skills={[
                                    "React",
                                    "Next.js",
                                    "TypeScript",
                                    "Tailwind CSS",
                                ]}
                            />
                            <SkillCard
                                title="Backend Development"
                                skills={["Node.js", "Express", "AI"]}
                            />
                            <SkillCard
                                title="Mobile Development"
                                skills={["React Native", "Flutter"]}
                            />
                            <SkillCard
                                title="Databases"
                                skills={[
                                    "MongoDB",
                                    "PostgreSQL",
                                    "MySQL",
                                    "Redis",
                                    "Supabase",
                                ]}
                            />
                            <SkillCard
                                title="DevOps"
                                skills={[
                                    "Docker",
                                    "Kubernetes",
                                    "AWS",
                                    "CI/CD",
                                    "Terraform",
                                ]}
                            />
                            <SkillCard
                                title="Other Skills"
                                skills={[
                                    "UI/UX Design",
                                    "Project Management",
                                    "Team Leadership",
                                    "Technical Writing",
                                ]}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
