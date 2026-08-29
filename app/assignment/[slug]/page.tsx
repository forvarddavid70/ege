import { notFound } from "next/navigation";
import { getProjectBySlug } from "@/lib/assignments";
import StudentAssignment from "@/components/assignments/StudentAssignment";

export const dynamic = "force-dynamic";
export const metadata = { title: "Работа ученика", robots: { index: false, follow: false } };

export default async function AssignmentPage({ params }: { params: { slug: string } }) {
  const project = await getProjectBySlug(params.slug);
  if (!project || project.status === "draft") notFound();
  const safeProject = {
    ...project,
    tasks: project.tasks.map(({ analysisNote: _analysisNote, needsAnalysis: _needsAnalysis, ...task }) => task),
  } as typeof project;
  return <StudentAssignment project={safeProject} />;
}
