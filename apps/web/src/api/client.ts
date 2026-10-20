const BASE_URL = "/api";

export const apiClient = (path: string, options?: RequestInit) => {
  return fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    credentials: "include",
  });
};
