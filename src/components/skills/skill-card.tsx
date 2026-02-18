import { Badge } from "@/components/ui/badge";

interface SkillCardProps {
    title: string;
    skills: string[];
}

export function SkillCard({ title, skills }: SkillCardProps) {
    return (
        <div className="skill-card-hover p-6 bg-card">
            <h3
                className="uppercase text-base tracking-[0.08em] font-medium font-sans mb-4"
                style={{ color: "var(--muted-foreground)" }}
            >
                {title}
            </h3>
            <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                    <Badge key={skill} variant="outline">
                        {skill}
                    </Badge>
                ))}
            </div>
        </div>
    );
}
