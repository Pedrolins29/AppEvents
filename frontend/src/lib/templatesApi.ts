import { apiClient } from "@/lib/apiClient";
import type { TemplateRecord } from "@/types/template";

export const templatesApi = {
  list: () => apiClient.get<TemplateRecord[]>("/api/templates"),
  get: (id: string) => apiClient.get<TemplateRecord>(`/api/templates/${id}`),
};
