import type { ApiProblem } from "@/types/auth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://localhost:5001";

export class ApiError extends Error {
  status: number;
  problem: ApiProblem | null;

  constructor(status: number, problem: ApiProblem | null) {
    super(problem?.detail ?? problem?.title ?? `Request failed with status ${status}`);
    this.status = status;
    this.problem = problem;
  }
}

type AccessTokenAccessor = () => string | null;
type RefreshHandler = () => Promise<string | null>;

let getAccessToken: AccessTokenAccessor = () => null;
let refreshAccessToken: RefreshHandler = async () => null;

export function configureApiClient(accessor: AccessTokenAccessor, refresher: RefreshHandler) {
  getAccessToken = accessor;
  refreshAccessToken = refresher;
}

async function parseProblem(response: Response): Promise<ApiProblem | null> {
  try {
    return (await response.json()) as ApiProblem;
  } catch {
    return null;
  }
}

async function request<T>(path: string, init: RequestInit, retryOn401 = true): Promise<T> {
  const token = getAccessToken();
  const headers = new Headers(init.headers);
  // FormData bodies must keep the browser-generated multipart boundary — only force JSON
  // for plain string bodies (produced by JSON.stringify in the helpers below).
  if (typeof init.body === "string") {
    headers.set("Content-Type", "application/json");
  }
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
    credentials: "include",
  });

  if (response.status === 401 && retryOn401) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      return request<T>(path, init, false);
    }
  }

  if (!response.ok) {
    throw new ApiError(response.status, await parseProblem(response));
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export const apiClient = {
  get: <T>(path: string) => request<T>(path, { method: "GET" }),
  post: <T>(path: string, body?: unknown, options?: { retryOn401?: boolean }) =>
    request<T>(
      path,
      { method: "POST", body: body ? JSON.stringify(body) : undefined },
      options?.retryOn401 ?? true,
    ),
  put: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "PUT", body: body ? JSON.stringify(body) : undefined }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
  upload: <T>(path: string, formData: FormData) => request<T>(path, { method: "POST", body: formData }),
};
