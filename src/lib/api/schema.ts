import { z } from "astro/zod";

export const ApiMessageSchema = z.object({
  message: z.string(),
});

export const ApiStatusSchema = z.object({
  message: z.string(),
  status: z.number(),
});

export const HealthResponseSchema = z.object({
  message: z.string(),
  success: z.boolean(),
});

export const AuthSignInInputSchema = z.object({
  token: z.string().min(1).max(255),
});

export const AuthSignInResponseSchema = ApiStatusSchema.extend({
  status: z.literal(200),
});

export const AuthMeResponseSchema = z.object({
  authenticated: z.boolean(),
});

export const NullableStringSchema = z.object({
  String: z.string(),
  Valid: z.boolean(),
});

export const StackSchema = z.object({
  ID: z.number(),
  Name: z.string(),
});

export const ProjectSchema = z.object({
  ID: z.number(),
  Title: z.string(),
  Description: z.string(),
  Featured: z.boolean(),
  Github: z.string().url(),
  Demo: NullableStringSchema,
  CreatedAt: z.string(),
});

export const ProjectWithStackSchema = ProjectSchema.extend({
  StackID: z.number(),
  StackName: z.string(),
});

export const ProjectInputSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().min(1),
  featured: z.boolean(),
  github: z.string().url(),
  demo: z.string().url().optional(),
  stack_ids: z.array(z.number().int()).min(1),
});

export const StackInputSchema = z.object({
  name: z.string().min(1).max(255),
});

export const ProjectListResponseSchema = ApiStatusSchema.extend({
  status: z.literal(200),
  body: z.array(ProjectWithStackSchema),
});

export const ProjectResponseSchema = ApiStatusSchema.extend({
  body: ProjectSchema,
});

export const StackListResponseSchema = ApiStatusSchema.extend({
  status: z.literal(200),
  body: z.array(StackSchema),
});

export const StackResponseSchema = ApiStatusSchema.extend({
  body: StackSchema,
});

export const UnauthorizedResponseSchema = ApiStatusSchema.extend({
  status: z.literal(401),
});

export type ApiMessage = z.infer<typeof ApiMessageSchema>;
export type HealthResponse = z.infer<typeof HealthResponseSchema>;
export type AuthSignInInput = z.infer<typeof AuthSignInInputSchema>;
export type AuthSignInResponse = z.infer<typeof AuthSignInResponseSchema>;
export type AuthMeResponse = z.infer<typeof AuthMeResponseSchema>;
export type NullableString = z.infer<typeof NullableStringSchema>;
export type Stack = z.infer<typeof StackSchema>;
export type Project = z.infer<typeof ProjectSchema>;
export type ProjectWithStack = z.infer<typeof ProjectWithStackSchema>;
export type ProjectInput = z.infer<typeof ProjectInputSchema>;
export type StackInput = z.infer<typeof StackInputSchema>;
export type ProjectListResponse = z.infer<typeof ProjectListResponseSchema>;
export type ProjectResponse = z.infer<typeof ProjectResponseSchema>;
export type StackListResponse = z.infer<typeof StackListResponseSchema>;
export type StackResponse = z.infer<typeof StackResponseSchema>;
export type UnauthorizedResponse = z.infer<typeof UnauthorizedResponseSchema>;
