import axios from 'axios';

interface ErrorPayload {
  message?: string;
}

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError<ErrorPayload>(error)) {
    return error.response?.data?.message ?? error.message ?? 'Request failed.';
  }
  return 'Something went wrong. Please try again.';
}
