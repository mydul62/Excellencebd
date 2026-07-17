/**
 * Base API helper — thin wrapper around fetch.
 */

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";

// Token storage key
const TOKEN_KEY = 'bf_access_token';

/**
 * Get stored access token from localStorage
 */
export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

/**
 * Store access token in localStorage
 */
export function setAccessToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, token);
}

/**
 * Remove access token from localStorage
 */
export function removeAccessToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
}

export interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
  };
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  // Add Authorization header with Bearer token if available
  const token = getAccessToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
    credentials: "include", // Still include cookies for refresh token
  });

  if (!res.ok) {
    let message = `Request failed: ${res.status} ${res.statusText}`;

    try {
      const err = await res.json();
      message = err?.message ?? message;
    } catch {}

    // Clear token on 401 Unauthorized
    if (res.status === 401) {
      removeAccessToken();
    }

    throw new Error(message);
  }

  return res.json() as Promise<ApiResponse<T>>;
}











export function apiGet<T>(path: string) {
  return apiFetch<T>(path, {
    method: "GET",
  });
}

export function apiPost<T>(path: string, body: unknown) {
  return apiFetch<T>(path, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function apiPut<T>(path: string, body: unknown) {
  return apiFetch<T>(path, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

export function apiPatch<T>(path: string, body: unknown) {
  return apiFetch<T>(path, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export function apiDelete<T>(path: string) {
  return apiFetch<T>(path, {
    method: "DELETE",
  });
}

export async function apiFetchFormData<T>(
  path: string,
  method: "POST" | "PUT" | "PATCH",
  body: FormData
): Promise<ApiResponse<T>> {
  const headers: Record<string, string> = {};

  // Add Authorization header with Bearer token if available
  const token = getAccessToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body,
    credentials: "include",
  });

  if (!res.ok) {
    let message = `Request failed: ${res.status} ${res.statusText}`;

    try {
      const err = await res.json();
      message = err?.message ?? message;
    } catch {}

    // Clear token on 401 Unauthorized
    if (res.status === 401) {
      removeAccessToken();
    }

    throw new Error(message);
  }

  return res.json() as Promise<ApiResponse<T>>;
}