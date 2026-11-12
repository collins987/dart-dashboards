import axios, { AxiosError, type AxiosAdapter, type AxiosResponse } from "axios";
import { API_BASE_URL, USE_MOCK_DATA } from "@/lib/constants";
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

/**
 * Fake transport used while USE_MOCK_DATA is true. It answers each request from
 * the stored dart-api.yaml responses in src/data.ts, and it fails in the same way
 * (AxiosError with the Error body), so the rest of the app cannot tell the
 * difference. The data module is loaded only when this transport is used.
 */
const sampleTransport: AxiosAdapter = async (config) => {
  const { answerSample } = await import("./sampleRouter");
  const requestId = `req_${Math.random().toString(16).slice(2, 14).padEnd(12, "0")}`;
  const { status, body } = answerSample(
    config.url ?? "",
    (config.params ?? {}) as Record<string, unknown>,
    requestId
  );

  const response = {
    data: body,
    status,
    statusText: status < 400 ? "OK" : "Error",
    headers: { "content-type": "application/json", "x-request-id": requestId },
    config,
    request: {},
  } as unknown as AxiosResponse;

  if (status >= 400) {
    throw new AxiosError(
      `Request failed with status code ${status}`,
      status >= 500 ? AxiosError.ERR_BAD_RESPONSE : AxiosError.ERR_BAD_REQUEST,
      config,
      {},
      response
    );
  }
  return response;
};

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  adapter: USE_MOCK_DATA ? sampleTransport : undefined,
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
