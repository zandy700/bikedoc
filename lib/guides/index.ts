import type { Guide, IssueCategory } from "@/lib/types";
import { GUIDES } from "./data";

export { GUIDES };

const BY_ID = new Map<string, Guide>(GUIDES.map((g) => [g.id, g]));

export function getGuide(id: string): Guide | undefined {
  return BY_ID.get(id);
}

export function guidesByCategory(c: IssueCategory): Guide[] {
  return GUIDES.filter((g) => g.category === c);
}
