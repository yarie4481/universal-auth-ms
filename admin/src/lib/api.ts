import { getApiKey, getApiUrl } from "./auth";
import type {
  Application,
  CreateApplicationPayload,
  CreateApplicationResponse,
  OAuthProvider,
  UpsertProviderPayload,
} from "./types";

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public body?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new ApiError("Not authenticated", 401);
  }

  const headers = new Headers(init.headers);
  headers.set("x-admin-api-key", apiKey);
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 15000);

  let res: Response;
  try {
    res = await fetch(`${getApiUrl()}${path}`, {
      ...init,
      headers,
      signal: controller.signal,
    });
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new ApiError("Request timed out — is the NestJS API running on port 3001?", 408);
    }
    throw err;
  } finally {
    window.clearTimeout(timeout);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  const text = await res.text();
  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text) as unknown;
    } catch {
      data = { message: text };
    }
  }

  if (!res.ok) {
    const message =
      typeof data === "object" &&
      data &&
      "message" in data &&
      typeof (data as { message: unknown }).message === "string"
        ? (data as { message: string }).message
        : `Request failed (${res.status})`;
    throw new ApiError(message, res.status, data);
  }

  return data as T;
}

export async function verifyAdminAccess(): Promise<void> {
  await request<{ items: Application[] }>("/api/v1/admin/applications");
}

export async function listApplications(): Promise<Application[]> {
  const data = await request<{ items: Application[] }>(
    "/api/v1/admin/applications",
  );
  return data.items;
}

export async function getApplication(id: string): Promise<Application> {
  return request<Application>(`/api/v1/admin/applications/${id}`);
}

export async function createApplication(
  payload: CreateApplicationPayload,
): Promise<CreateApplicationResponse> {
  return request<CreateApplicationResponse>("/api/v1/admin/applications", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateApplication(
  id: string,
  payload: Partial<CreateApplicationPayload> & { status?: string },
): Promise<Application> {
  return request<Application>(`/api/v1/admin/applications/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function deleteApplication(id: string): Promise<void> {
  await request<void>(`/api/v1/admin/applications/${id}`, {
    method: "DELETE",
  });
}

export async function rotateApplicationSecret(
  id: string,
): Promise<{ clientSecret: string; warning: string }> {
  return request(`/api/v1/admin/applications/${id}/rotate-secret`, {
    method: "POST",
  });
}

export async function listProviders(
  applicationId: string,
): Promise<OAuthProvider[]> {
  const data = await request<{ items: OAuthProvider[] }>(
    `/api/v1/admin/applications/${applicationId}/providers`,
  );
  return data.items;
}

export async function upsertProvider(
  applicationId: string,
  payload: UpsertProviderPayload,
): Promise<OAuthProvider> {
  return request<OAuthProvider>(
    `/api/v1/admin/applications/${applicationId}/providers`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}

export async function updateProvider(
  id: string,
  payload: Partial<UpsertProviderPayload>,
): Promise<OAuthProvider> {
  return request<OAuthProvider>(`/api/v1/admin/providers/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function deleteProvider(id: string): Promise<void> {
  await request<void>(`/api/v1/admin/providers/${id}`, {
    method: "DELETE",
  });
}
