import axios from "axios";
import { API_BASE_URL } from "@/lib/constants";
import type { ApiError, ApiErrorCode } from "@/types/api";

/**
 * Every rejection from this client is a NormalisedError, so callers branch on
 * `code` rather than on an HTTP status, as the integration guide requires.
 */
export interface NormalisedError {
  code: ApiErrorCode;
  message: string;
  requestId: string | null;
  details?: { field: string; issue: string }[];
}

export function isNormalisedError(value: unknown): value is NormalisedError {
  return typeof value === "object" && value !== null && "code" in value;
}

export function isDataNotAvailable(value: unknown): boolean {
  return isNormalisedError(value) && value.code === "DATA_NOT_AVAILABLE";
}

const UNKNOWN_ERROR: Omit<NormalisedError, "requestId"> = {
  code: "INTERNAL_ERROR",
  message: "Something went wrong. Please try again or quote the request ID.",
};

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (!axios.isAxiosError(error)) {
      return Promise.reject({ ...UNKNOWN_ERROR, requestId: null });
    }

    // Sent on every response, successful or not, so it survives a body we cannot parse.
    const headerRequestId =
      (error.response?.headers?.["x-request-id"] as string | undefined) ?? null;

    const body = error.response?.data as ApiError | undefined;

    if (!body?.error) {
      return Promise.reject({ ...UNKNOWN_ERROR, requestId: headerRequestId });
    }

    return Promise.reject({
      code: body.error.code,
      message: body.error.message,
      requestId: body.error.requestId ?? headerRequestId,
      details: body.error.details,
    } satisfies NormalisedError);
  }
);
