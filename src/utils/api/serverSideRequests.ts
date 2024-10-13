import { cookies } from "next/headers";

export async function serverGetRequest(
  url: string,
  options?: RequestInit & { params?: Record<string, string> }
) {
  const sid = cookies().get("__session")?.value;

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}${url}?` +
      new URLSearchParams({ ...options?.params }),
    {
      credentials: "include",
      ...options,
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.NEXT_PUBLIC_API_KEY as string,
        cookie: `__session=${sid}`,
        ...options?.headers,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status} URL: ${url}`);
  }

  return await response.json();
}
