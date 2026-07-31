import { apiClient } from "@/lib/apiClient";
import type { AddGuestRequest, GuestListResponse, GuestRecord, UpdateGuestRequest } from "@/types/guest";

export const guestsApi = {
  list: (eventId: string) => apiClient.get<GuestListResponse>(`/api/events/${eventId}/guests`),
  add: (eventId: string, request: AddGuestRequest) =>
    apiClient.post<GuestRecord>(`/api/events/${eventId}/guests`, request),
  update: (eventId: string, guestId: string, request: UpdateGuestRequest) =>
    apiClient.put<GuestRecord>(`/api/events/${eventId}/guests/${guestId}`, request),
  remove: (eventId: string, guestId: string) =>
    apiClient.delete<void>(`/api/events/${eventId}/guests/${guestId}`),
  remindEmail: (eventId: string, guestId: string) =>
    apiClient.post<GuestRecord>(`/api/events/${eventId}/guests/${guestId}/remind-email`),
};
