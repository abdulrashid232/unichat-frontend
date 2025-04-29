export interface Topic {
  id: string;
  name: string;
  description?: string;
}

export const PREDEFINED_TOPICS: Topic[] = [
  { id: "math", name: "Mathematics" },
  { id: "cs", name: "Computer Science" },
  { id: "phys", name: "Physics" },
  { id: "chem", name: "Chemistry" },
  { id: "bio", name: "Biology" },
  { id: "eng", name: "Engineering" },
  { id: "lit", name: "Literature" },
  { id: "hist", name: "History" },
  { id: "psyc", name: "Psychology" },
  { id: "econ", name: "Economics" },
];
