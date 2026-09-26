import type { Credentials } from "../sheared/types/common"

export const API_URL = "https://api.green-api.com"

function buildUrl(method: string, credentials: Credentials): string {
  const [path, query] = method.split("?")

  const url = `${API_URL}/waInstance${encodeURIComponent(
    credentials.idInstance,
  )}/${path}/${encodeURIComponent(credentials.apiTokenInstance)}`

  return query ? `${url}?${query}` : url
}

async function parseResponse<T>(response: Response): Promise<T> {
  const text = await response.text()

  let data: unknown = null

  try {
    data = text ? JSON.parse(text) : null
  } catch {
    data = text
  }

  if (!response.ok) {
    const message =
      typeof data === "object" &&
      data !== null &&
      "message" in data &&
      typeof data.message === "string"
        ? data.message
        : typeof data === "string"
          ? data
          : `HTTP ${response.status}`

    throw new Error(message)
  }

  return data as T
}

export async function greenApiGet<T>(
  method: string,
  credentials: Credentials,
  signal?: AbortSignal,
): Promise<T> {
  const response = await fetch(buildUrl(method, credentials), {
    signal,
  })

  return parseResponse<T>(response)
}

export async function greenApiPost<T>(
  method: string,
  credentials: Credentials,
  body: unknown,
  signal?: AbortSignal,
): Promise<T> {
  const response = await fetch(buildUrl(method, credentials), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    signal,
  })

  return parseResponse<T>(response)
}

export async function greenApiDelete<T>(
  method: string,
  credentials: Credentials,
  signal?: AbortSignal,
  pathSuffix = "",
): Promise<T> {
  const response = await fetch(
    `${API_URL}/waInstance${encodeURIComponent(
      credentials.idInstance,
    )}/${method}/${encodeURIComponent(
      credentials.apiTokenInstance,
    )}${pathSuffix}`,
    {
      method: "DELETE",
      signal,
    },
  )

  return parseResponse<T>(response)
}
