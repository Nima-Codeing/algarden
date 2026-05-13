const BASE_URL = import.meta.env.VITE_API_BASE_URL;

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
