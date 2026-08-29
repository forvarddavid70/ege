import { promises as fs } from "fs";
import path from "path";

export type AssignmentTask = {
  id: string;
  categoryId?: string;
  categoryName?: string;
  title: string;
  statement: string;
  options: string[];
  allowExpandedAnswer: boolean;
  allowDrawing: boolean;
  needsAnalysis: boolean;
  analysisNote: string;
  maxScore: number;
};

export type AssignmentFolder = {
  id: string;
  name: string;
  parentId: string | null;
  tasks: AssignmentTask[];
};

export type StudentAnswer = {
  taskId: string;
  selectedOption: string;
  text: string;
  drawing: string;
};

export type AssignmentSubmission = {
  studentName: string;
  studentContact: string;
  submittedAt: string;
  answers: StudentAnswer[];
};

export type TaskReview = { taskId: string; score: number; comment: string; annotation: string };

export type AssignmentReview = {
  items: TaskReview[];
  total: number;
  finishedAt: string;
};

export type AssignmentProject = {
  id: string;
  slug: string;
  title: string;
  rootFolderId?: string;
  categories?: Array<{ id: string; name: string }>;
  folderIds: string[];
  tasks: AssignmentTask[];
  status: "draft" | "published" | "submitted" | "reviewed";
  createdAt: string;
  submission?: AssignmentSubmission;
  review?: AssignmentReview;
};

export type AssignmentStore = { folders: AssignmentFolder[]; projects: AssignmentProject[] };

const FILE = path.join(process.cwd(), "data", "assignments.local.json");
const EMPTY: AssignmentStore = { folders: [], projects: [] };

export async function getAssignments(): Promise<AssignmentStore> {
  try {
    const raw = await fs.readFile(FILE, "utf8");
    const data = JSON.parse(raw) as Partial<AssignmentStore>;
    return { folders: data.folders ?? [], projects: data.projects ?? [] };
  } catch { return EMPTY; }
}

export async function saveAssignments(value: AssignmentStore): Promise<void> {
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  await fs.writeFile(FILE, JSON.stringify(value, null, 2), "utf8");
}

export async function getProjectBySlug(slug: string) {
  const data = await getAssignments();
  return data.projects.find((p) => p.slug === slug) ?? null;
}

export async function updateProject(id: string, updater: (project: AssignmentProject) => AssignmentProject) {
  const data = await getAssignments();
  const index = data.projects.findIndex((p) => p.id === id);
  if (index < 0) return null;
  data.projects[index] = updater(data.projects[index]);
  await saveAssignments(data);
  return data.projects[index];
}
