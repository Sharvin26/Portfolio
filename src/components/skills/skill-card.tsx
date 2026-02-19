interface SkillCardProps {
    number: string;
    title: string;
    skills: string[];
}

export function SkillCard({ number, title, skills }: SkillCardProps) {
    return (
        <div
            className="skill-card-hover p-6 flex flex-col gap-4"
            style={{ backgroundColor: "var(--neutral-200)" }}
        >
            <span
                className="text-xs font-bold tracking-widest"
                style={{ color: "var(--primary-300)" }}
            >
                {number}
            </span>
            <h3 className="text-lg font-bold leading-tight">{title}</h3>
            <div className="flex flex-wrap gap-1.5">
                {skills.map((skill) => (
                    <span
                        key={skill}
                        className="text-xs font-medium px-2.5 py-1"
                        style={{
                            backgroundColor: "var(--primary-100)",
                            color: "var(--primary-700)",
                        }}
                    >
                        {skill}
                    </span>
                ))}
            </div>
        </div>
    );
}
