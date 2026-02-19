import { ExperienceItem } from "./experience-item";

export function ExperienceSection() {
    return (
        <section
            id="experience"
            className="py-20 md:py-28 border-b border-border"
        >
            <div className="max-w-[1200px] mx-auto px-6">
                <div className="animate-on-scroll">
                    <div className="section-label mb-6">Experience</div>
                    <h2 className="text-3xl md:text-4xl font-bold mb-12">
                        Where I&apos;ve Built &amp; Led
                    </h2>
                    <ExperienceItem
                        title="Founder & CEO"
                        company="MTechZilla"
                        period="Feb 2021 – Present"
                        current
                        description="I built MTechZilla to give startups real engineering support — without the overhead of a large agency. We work the full product lifecycle: scoping, architecture, shipping, and iteration. Our clients arrive with ideas and leave with software that's ready for real users."
                    />
                    <ExperienceItem
                        title="Contributor"
                        company="freeCodeCamp"
                        period="May 2020 – Present"
                        description="I write practical guides on web development, SaaS architecture, and lessons from shipping real products. No toy examples — just what actually works in production."
                    />
                    <ExperienceItem
                        title="Software Developer"
                        company="KPlay Team"
                        period="Jul 2020 – Jan 2021"
                        description="Built and owned the backend REST APIs powering the platform's core features. Worked directly with the frontend team to make sure APIs were fast, reliable, and built to the right contract."
                    />
                    <ExperienceItem
                        title="Software Developer"
                        company="Phynart"
                        period="Oct 2018 – Mar 2020"
                        description="Built backend services and secure APIs for an IoT platform managing device data at scale. Designed and shipped an Over-the-Air (OTA) update system that let the team push software to smart devices without manual steps."
                    />
                </div>
            </div>
        </section>
    );
}
