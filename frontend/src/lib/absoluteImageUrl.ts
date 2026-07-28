const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://localhost:5001";

export function absoluteImageUrl(path: string) {
  return path.startsWith("http") ? path : `${API_BASE_URL}${path}`;
}
