interface ExperienceItemProps {
  title: string
  company: string
  period: string
  description: string
}

export function ExperienceItem({ title, company, period, description }: ExperienceItemProps) {
  return (
    <div className="mb-8 border-l-2 border-muted-foreground/20 pl-4">
      <h3 className="text-xl font-bold">{title}</h3>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <p className="font-medium">{company}</p>
        <p className="text-sm text-muted-foreground">{period}</p>
      </div>
      <p className="mt-2 text-muted-foreground">{description}</p>
    </div>
  )
}

