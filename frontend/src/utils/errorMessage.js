/**
 * Extracts a user-friendly error message from an Axios error.
 *
 * Priority:
 * 1. Backend JSON { error: "..." }
 * 2. HTTP status text
 * 3. Network/connection problem
 * 4. Generic fallback
 */
export function getErrorMessage(err) {
  if (err?.response?.data?.error) {
    return err.response.data.error;
  }

  if (err?.response) {
    const status = err.response.status;
    if (status === 400) return "Invalid data sent to the server.";
    if (status === 404) return "Record not found.";
    if (status === 409) return "Conflict: a record with this data already exists.";
    if (status === 422) return "Operation not allowed due to existing references.";
    if (status >= 500) return "Server error. Please try again later.";
    return `Unexpected response from server (${status}).`;
  }

  if (err?.request) {
    return "Unable to reach the server. Check your connection and try again.";
  }

  return "An unexpected error occurred.";
}
