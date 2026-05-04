import type { ZodType } from "astro/zod";
import {
  ApiMessageSchema,
  AuthMeResponseSchema,
  AuthSignInInputSchema,
  AuthSignInResponseSchema,
  HealthResponseSchema,
  ProjectInputSchema,
  ProjectListResponseSchema,
  ProjectResponseSchema,
  StackInputSchema,
  StackListResponseSchema,
  StackResponseSchema,
  type AuthSignInInput,
  type ProjectInput,
  type StackInput,
} from "./schema";

const API_URL = import.meta.env.PUBLIC_API_URL;

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public body: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type ApiFetchInit = RequestInit & {
  json?: unknown;
};

function getApiUrl(path: string) {
  if (!API_URL) {
    throw new Error("PUBLIC_API_URL is not configured.");
  }

  return new URL(path, API_URL).toString();
}

function getJsonInit(init: ApiFetchInit = {}): RequestInit {
  const { json, headers, ...rest } = init;
  const requestHeaders = new Headers(headers);

  if (json === undefined) {
    return {
      credentials: "include",
      ...rest,
      headers: requestHeaders,
    };
  }

  requestHeaders.set("Content-Type", "application/json");

  return {
    credentials: "include",
    ...rest,
    headers: requestHeaders,
    body: JSON.stringify(json),
  };
}

function getRequestCookieHeaders(request: Request) {
  return {
    cookie: request.headers.get("cookie") ?? "",
  };
}

export async function apiFetch<TSchema extends ZodType>(
  path: string,
  schema: TSchema,
  init?: ApiFetchInit,
): Promise<TSchema["_output"]> {
  const { data } = await apiFetchWithResponse(path, schema, init);
  return data;
}

export async function apiFetchWithResponse<TSchema extends ZodType>(
  path: string,
  schema: TSchema,
  init?: ApiFetchInit,
): Promise<{ data: TSchema["_output"]; response: Response }> {
  const response = await fetch(getApiUrl(path), getJsonInit(init));
  const json: unknown = await response.json();

  if (!response.ok) {
    const message =
      typeof json === "object" &&
      json !== null &&
      "message" in json &&
      typeof json.message === "string"
        ? json.message
        : `API request failed: ${response.status}`;

    throw new ApiError(message, response.status, json);
  }

  return {
    data: schema.parse(json),
    response,
  };
}

function assertId(id: number) {
  if (!Number.isInteger(id) || id < 1) {
    throw new Error("Expected a positive integer ID.");
  }
}

export function getBaseMessage() {
  return apiFetch("/", ApiMessageSchema);
}

export function getHealth() {
  return apiFetch("/health", HealthResponseSchema);
}

export function signIn(input: AuthSignInInput) {
  return apiFetch("/auth/sign-in", AuthSignInResponseSchema, {
    method: "POST",
    json: AuthSignInInputSchema.parse(input),
  });
}

export function signInWithResponse(input: AuthSignInInput) {
  return apiFetchWithResponse("/auth/sign-in", AuthSignInResponseSchema, {
    method: "POST",
    json: AuthSignInInputSchema.parse(input),
  });
}

export function getMe() {
  return apiFetch("/auth/me", AuthMeResponseSchema);
}

export function getMeFromRequest(request: Request) {
  return apiFetch("/auth/me", AuthMeResponseSchema, {
    headers: {
      cookie: request.headers.get("cookie") ?? "",
    },
  });
}

export function getProjects() {
  return apiFetch("/projects/", ProjectListResponseSchema);
}

export function getFeaturedProjects() {
  return apiFetch("/projects/featured", ProjectListResponseSchema);
}

export function createProject(input: ProjectInput) {
  return apiFetch("/projects/", ProjectResponseSchema, {
    method: "POST",
    json: ProjectInputSchema.parse(input),
  });
}

export function createProjectFromRequest(request: Request, input: ProjectInput) {
  return apiFetch("/projects/", ProjectResponseSchema, {
    method: "POST",
    headers: getRequestCookieHeaders(request),
    json: ProjectInputSchema.parse(input),
  });
}

export function updateProject(projectId: number, input: ProjectInput) {
  assertId(projectId);

  return apiFetch(`/projects/${projectId}`, ProjectResponseSchema, {
    method: "PUT",
    json: ProjectInputSchema.parse(input),
  });
}

export function updateProjectFromRequest(
  request: Request,
  projectId: number,
  input: ProjectInput,
) {
  assertId(projectId);

  return apiFetch(`/projects/${projectId}`, ProjectResponseSchema, {
    method: "PUT",
    headers: getRequestCookieHeaders(request),
    json: ProjectInputSchema.parse(input),
  });
}

export function deleteProject(projectId: number) {
  assertId(projectId);

  return apiFetch(`/projects/${projectId}`, ProjectResponseSchema, {
    method: "DELETE",
  });
}

export function deleteProjectFromRequest(request: Request, projectId: number) {
  assertId(projectId);

  return apiFetch(`/projects/${projectId}`, ProjectResponseSchema, {
    method: "DELETE",
    headers: getRequestCookieHeaders(request),
  });
}

export function getStacks() {
  return apiFetch("/stacks/", StackListResponseSchema);
}

export function createStack(input: StackInput) {
  return apiFetch("/stacks/", StackResponseSchema, {
    method: "POST",
    json: StackInputSchema.parse(input),
  });
}

export function createStackFromRequest(request: Request, input: StackInput) {
  return apiFetch("/stacks/", StackResponseSchema, {
    method: "POST",
    headers: getRequestCookieHeaders(request),
    json: StackInputSchema.parse(input),
  });
}

export function updateStack(stackId: number, input: StackInput) {
  assertId(stackId);

  return apiFetch(`/stacks/${stackId}`, StackResponseSchema, {
    method: "PUT",
    json: StackInputSchema.parse(input),
  });
}

export function updateStackFromRequest(
  request: Request,
  stackId: number,
  input: StackInput,
) {
  assertId(stackId);

  return apiFetch(`/stacks/${stackId}`, StackResponseSchema, {
    method: "PUT",
    headers: getRequestCookieHeaders(request),
    json: StackInputSchema.parse(input),
  });
}

export function deleteStack(stackId: number) {
  assertId(stackId);

  return apiFetch(`/stacks/${stackId}`, StackResponseSchema, {
    method: "DELETE",
  });
}

export function deleteStackFromRequest(request: Request, stackId: number) {
  assertId(stackId);

  return apiFetch(`/stacks/${stackId}`, StackResponseSchema, {
    method: "DELETE",
    headers: getRequestCookieHeaders(request),
  });
}
