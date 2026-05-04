import type { ProjectWithStack } from "@/lib/api/schema";

export type UiProject = {
  id: number;
  title: string;
  date: string;
  description: string;
  tags: string[];
  links: {
    github: string;
    demo?: string;
  };
};

export function mapProjectsToUi(projects: ProjectWithStack[]): UiProject[] {
  const grouped = new Map<number, UiProject>();

  for (const project of projects) {
    const existing = grouped.get(project.ID);

    if (existing) {
      if (!existing.tags.includes(project.StackName)) {
        existing.tags.push(project.StackName);
      }
      continue;
    }

    grouped.set(project.ID, {
      id: project.ID,
      title: project.Title,
      date: project.CreatedAt.slice(0, 4),
      description: project.Description,
      tags: [project.StackName],
      links: {
        github: project.Github,
        demo: project.Demo.Valid ? project.Demo.String : undefined,
      },
    });
  }

  return Array.from(grouped.values());
}
