const USERNAME = /^[a-z0-9][a-z0-9._-]*$/;
const PASSWORD = /^(?=.*\p{L})(?=.*\d).+$/u;

export type LoginInput = { username: string; password: string };
export type AccountInput = { username: string; password: string; role: string };
export type PasswordInput = { currentPassword: string; password: string };

export function readLogin(formData: FormData): LoginInput | string {
  const username = String(formData.get("username") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  if (!username || !password) {
    return "Saisissez l'identifiant et le mot de passe.";
  }
  return { username, password };
}

export function readAccount(formData: FormData): AccountInput | string {
  const username = String(formData.get("username") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const role = String(formData.get("role") ?? "");
  if (!USERNAME.test(username)) {
    return "L'identifiant commence par une lettre ou un chiffre, puis reste en minuscules.";
  }
  const passwordError = passwordMessage(password, username);
  if (passwordError) {
    return passwordError;
  }
  if (!["AGENT", "SUPERVISOR", "AUDITOR", "ADMINISTRATOR"].includes(role)) {
    return "Choisissez un rôle.";
  }
  return { username, password, role };
}

export function readPassword(formData: FormData): PasswordInput | string {
  const currentPassword = String(formData.get("currentPassword") ?? "");
  const password = String(formData.get("password") ?? "");
  if (!currentPassword) {
    return "Saisissez le mot de passe actuel.";
  }
  const passwordError = passwordMessage(password, "");
  if (passwordError) {
    return passwordError;
  }
  return { currentPassword, password };
}

function passwordMessage(password: string, username: string): string | null {
  if (password.length < 12 || password.length > 72) {
    return "Le mot de passe doit contenir de 12 à 72 caractères.";
  }
  if (username && password.toLowerCase() === username) {
    return "Le mot de passe doit être différent de l'identifiant.";
  }
  if (!PASSWORD.test(password)) {
    return "Le mot de passe doit contenir une lettre et un chiffre.";
  }
  return null;
}
