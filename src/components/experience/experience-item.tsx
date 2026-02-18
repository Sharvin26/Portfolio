interface ExperienceItemProps {
    title: string;
    company: string;
    period: string;
    description: string;
}

export function ExperienceItem({
    title,
    company,
    period,
    description,
}: ExperienceItemProps) {
    return (
        <div className="border-b border-border pb-10 mb-10 last:border-b-0 last:mb-0 last:pb-0">
            <p
                className="uppercase text-base tracking-[0.08em] font-medium font-sans mb-2"
                style={{ color: "var(--accent)" }}
            >
                {period}
            </p>
            <h3 className="text-2xl md:text-3xl font-light mb-1">{title}</h3>
            <p
                className="uppercase text-base font-medium tracking-wider mb-3"
                style={{ color: "var(--muted-foreground)" }}
            >
                {company}
            </p>
            <p className="text-base text-muted-foreground leading-relaxed font-sans font-light">
                {description}
            </p>
        </div>
    );
}
