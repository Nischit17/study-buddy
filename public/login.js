import { api, getToken, saveToken } from "./api.js";

// Already logged in? Go straight to the app
if (getToken()) window.location.href = "app.html";

const message = document.querySelector("#message");

// Runs when a form is submitted; path is "/auth/login" or "/auth/register"
async function submitAuthForm(event, path) {
  event.preventDefault(); // stop the browser from reloading the page
  message.textContent = "Please wait...";
  // FormData reads every input of the form; we turn it into { email: "...", password: "..." }
  const data = Object.fromEntries(new FormData(event.target));
  try {
    const { token } = await api(path, { method: "POST", json: data });
    saveToken(token);
    window.location.href = "app.html";
  } catch (error) {
    message.textContent = error.message;
  }
}

const loginForm = document.querySelector("#login-form");
const registerForm = document.querySelector("#register-form");
loginForm.addEventListener("submit", (event) => submitAuthForm(event, "/auth/login"));
registerForm.addEventListener("submit", (event) => submitAuthForm(event, "/auth/register"));
