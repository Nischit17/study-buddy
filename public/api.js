// The browser keeps the login token in localStorage (it survives page reloads)
const TOKEN_KEY = "studyBuddyToken";

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const saveToken = (token) => localStorage.setItem(TOKEN_KEY, token);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

// Every request to our backend goes through this one function
export async function api(path, { method = "GET", json, formData } = {}) {
  const headers = {};
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  let body;
  if (json) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(json);
  } else if (formData) {
    body = formData; // the browser sets the multipart/form-data header itself
  }

  const response = await fetch(`/api${path}`, { method, headers, body });
  const data = await response.json();
  if (!response.ok) {
    const error = new Error(data.error || `Request failed with status ${response.status}`);
    error.status = response.status;
    throw error;
  }
  return data;
}
