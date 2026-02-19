interface ExperienceItemProps {
    title: string;
    company: string;
    period: string;
    description: string;
    current?: boolean;
}

export function ExperienceItem({
    title,
    company,
    period,
    description,
    current,
}: ExperienceItemProps) {
    return (
        <div className="grid md:grid-cols-[180px_1fr] gap-4 md:gap-8 border-b border-border pb-10 mb-10 last:border-b-0 last:mb-0 last:pb-0">
            {/* Left: meta */}
            <div className="flex flex-col gap-1 pt-1">
                <span
                    className="text-xs font-semibold tracking-widest uppercase"
                    style={{ color: "var(--neutral-500)" }}
                >
                    {period}
                </span>
                {current && (
                    <span
                        className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-wide uppercase w-fit mt-1 px-2 py-0.5"
                        style={{
                            backgroundColor: "var(--primary-100)",
                            color: "var(--primary-700)",
                        }}
                    >
                        <span
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: "var(--primary-700)" }}
                        />
                        Current
                    </span>
                )}
            </div>
            {/* Right: content */}
            <div>
                <h3 className="text-xl md:text-2xl font-bold mb-0.5">{title}</h3>
                <p
                    className="text-sm font-semibold tracking-widest uppercase mb-3"
                    style={{ color: "var(--primary-700)" }}
                >
                    {company}
                </p>
                <p
                    className="text-base leading-relaxed font-normal"
                    style={{ color: "var(--neutral-500)" }}
                >
                    {description}
                </p>
            </div>
        </div>
    );
}
