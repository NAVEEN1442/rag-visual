const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
console.log("BASE_URL", BASE_URL)

type ApiConfig = RequestInit & {
    headers?: Record<string, string>;
};

/**
 * Core fetch wrapper.
 * - `data` can be a plain object/array (sent as JSON) or a FormData instance (sent as-is).
 * - Content-Type is only set for JSON payloads; FormData sets its own multipart
 *   boundary header automatically, so we must NOT set Content-Type ourselves.
 * - If the caller already set a Content-Type in `config.headers`, we respect it.
 * - Non-2xx responses throw an Error (with the API's message if available) so
 *   callers can try/catch instead of silently getting an error payload back.
 * - 204 / empty bodies are handled without crashing on `.json()`.
 */
async function apiClient<T>(
    token: string | null,
    endpoint: string,
    data: unknown,
    config: ApiConfig = {}
): Promise<T> {
    try {
        const isFormData = data instanceof FormData;

        const headers: Record<string, string> = {
            ...(config.headers || {}),
        };

        // Only default to JSON content-type when sending JSON and it isn't already set
        if (!isFormData && data !== undefined && !headers["Content-Type"]) {
            headers["Content-Type"] = "application/json";
        }

        if (token) {
            headers["Authorization"] = `Bearer ${token}`;
        }

        const body = isFormData
            ? (data as FormData)
            : data !== undefined
                ? JSON.stringify(data)
                : undefined;



        const response = await fetch(`${BASE_URL}${endpoint}`, {
            ...config,
            headers,
            body,
        });

        // Parse the body (JSON or text) regardless of status, so error messages
        // from the API can surface to the caller.
        const contentType = response.headers.get("content-type") || "";
        const isJson = contentType.includes("application/json");

        let parsed: unknown = null;
        if (response.status !== 204) {
            parsed = isJson
                ? await response.json().catch(() => null)
                : await response.text().catch(() => null);
        }

        if (!response.ok) {
            const message =
                (parsed &&
                    typeof parsed === "object" &&
                    "message" in (parsed as Record<string, unknown>) &&
                    (parsed as Record<string, unknown>).message) ||
                `Request failed with status ${response.status}`;
            throw new Error(String(message));
        }

        return parsed as T;
    } catch (error) {
        console.log("api-client :", error);
        throw error;
    }
}

export const api = {
    get: <T>(token: string | null, endpoint: string, config: ApiConfig = {}) =>
        apiClient<T>(token, endpoint, undefined, { ...config, method: "GET" }),

    post: <T>(
        token: string | null,
        endpoint: string,
        body?: unknown,
        config: ApiConfig = {}
    ) => apiClient<T>(token, endpoint, body, { ...config, method: "POST" }),

    put: <T>(
        token: string | null,
        endpoint: string,
        body?: unknown,
        config: ApiConfig = {}
    ) => apiClient<T>(token, endpoint, body, { ...config, method: "PUT" }),

    patch: <T>(
        token: string | null,
        endpoint: string,
        body?: unknown,
        config: ApiConfig = {}
    ) => apiClient<T>(token, endpoint, body, { ...config, method: "PATCH" }),

    delete: <T>(
        token: string | null,
        endpoint: string,
        body?: unknown,
        config: ApiConfig = {}
    ) => apiClient<T>(token, endpoint, body, { ...config, method: "DELETE" }),
};

