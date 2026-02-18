import { ExperienceItem } from "./experience-item";

export function ExperienceSection() {
    return (
        <section
            id="experience"
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
                        02
                    </div>
                    <div>
                        <h2 className="text-4xl md:text-5xl font-light mb-12">
                            Experience
                        </h2>
                        <div>
                            <ExperienceItem
                                title="Founder & CEO"
                                company="MTechZilla"
                                period="Feb 2021 – Present"
                                description="I built MTechZilla to give startups real engineering support - without the overhead of a large agency. We work the full product lifecycle: scoping, architecture, shipping, and iteration. Our clients arrive with ideas and leave with software that's ready for real users."
                            />
                            <ExperienceItem
                                title="Contributor"
                                company="freeCodeCamp"
                                period="May 2020 – Present"
                                description="I write practical guides on web development, SaaS architecture, and lessons from shipping real products. No toy examples - just what actually works in production."
                            />
                            <ExperienceItem
                                title="Software Developer"
                                company="KPlay Team"
                                period="Jul 2020 – Jan 2021"
                                description="Built and owned the backend REST APIs powering the platform's core features. Worked directly with the frontend team to make sure APIs were fast, reliable, and built to the right contract. Gained experience in backend performance, security, and cross-team integration."
                            />
                            <ExperienceItem
                                title="Software Developer"
                                company="Phynart"
                                period="Oct 2018 – Mar 2020"
                                description="Built backend services and secure APIs for an IoT platform managing device data at scale. Designed and shipped an Over-the-Air (OTA) update system that let the team push software to smart devices without manual steps - cutting deployment friction significantly."
                            />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
