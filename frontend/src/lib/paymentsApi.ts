import { apiClient } from "@/lib/apiClient";
import type { EntitlementRecord } from "@/types/payments";

export const paymentsApi = {
  getMyEntitlements: () => apiClient.get<EntitlementRecord[]>("/api/payments/entitlements"),
};
