import { z } from "zod";
import { GUIDE_IDS, ISSUE_CATEGORIES } from "@/lib/types";

export const issueSchema = z.object({
  category: z.enum(ISSUE_CATEGORIES),
  title: z.string().min(1).max(120),
  confidence: z.number().min(0).max(1),
  evidence: z.string().min(1).max(600),
  guideId: z.enum(GUIDE_IDS).nullable(),
});
export type Issue = z.infer<typeof issueSchema>;

export const diagnosisSchema = z.object({
  summary: z.string().max(600),
  issues: z.array(issueSchema).max(8),
});
export type Diagnosis = z.infer<typeof diagnosisSchema>;

/** Max length of a base64 data URL we accept (~3 MB). Client resizes to <=1024px first. */
export const MAX_IMAGE_DATA_URL_LENGTH = 3_000_000;
export const MAX_DESCRIPTION_LENGTH = 2000;

export const diagnoseRequestSchema = z
  .object({
    description: z.string().trim().max(MAX_DESCRIPTION_LENGTH).optional().default(""),
    image: z
      .string()
      .regex(/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/, "Image must be a PNG, JPEG or WebP data URL")
      .max(MAX_IMAGE_DATA_URL_LENGTH, "Image is too large")
      .optional(),
  })
  .refine((v) => v.description.length > 0 || v.image !== undefined, {
    message: "Provide a photo, a description, or both.",
  });
export type DiagnoseRequest = z.infer<typeof diagnoseRequestSchema>;

export type DiagnoseResponse =
  | {
      ok: true;
      mode: "ai" | "demo";
      /** e.g. "openai:gpt-4o-mini"; absent in demo mode */
      model?: string;
      /** Optional notice for the UI, e.g. that AI failed and demo fallback was used */
      notice?: string;
      diagnosis: Diagnosis;
    }
  | { ok: false; error: string };
