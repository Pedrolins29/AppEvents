import { apiClient } from "@/lib/apiClient";
import type { CreateEventRequest, EventRecord, UpdateEventRequest } from "@/types/event";

export const eventsApi = {
  list: () => apiClient.get<EventRecord[]>("/api/events"),
  create: (request: CreateEventRequest) => apiClient.post<EventRecord>("/api/events", request),
  get: (id: string) => apiClient.get<EventRecord>(`/api/events/${id}`),
  update: (id: string, request: UpdateEventRequest) =>
    apiClient.put<EventRecord>(`/api/events/${id}`, request),
  remove: (id: string) => apiClient.delete<void>(`/api/events/${id}`),
  uploadCoverImage: (id: string, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return apiClient.upload<EventRecord>(`/api/events/${id}/cover-image`, formData);
  },
  publish: (id: string) => apiClient.post<EventRecord>(`/api/events/${id}/publish`),
  unpublish: (id: string) => apiClient.post<EventRecord>(`/api/events/${id}/unpublish`),
  uploadGalleryImage: (id: string, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return apiClient.upload<EventRecord>(`/api/events/${id}/gallery-images`, formData);
  },
  removeGalleryImage: (id: string, imageId: string) =>
    apiClient.delete<EventRecord>(`/api/events/${id}/gallery-images/${imageId}`),
};
