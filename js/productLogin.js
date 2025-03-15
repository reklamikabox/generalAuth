const encryptedSupabaseUrl =
  "aHR0cHM6Ly9pZnh4cnRtYmxyaHJkaGhueXlucS5zdXBhYmFzZS5jby8=";
const encryptedSupabaseKey =
  "ZXlKaGJHY2lPaUpJVXpJMU5pSXNJblI1Y0NJNklrcFhWQ0o5LmV5SnBjM01pT2lKemRYQmhZbUZ6WlNJc0luSmxaaUk2SW1sbWVIaHlkRzFpYkhKb2NtUm9hRzU1ZVc1eElpd2ljbTlzWlNJNkltRnViMjRpTENKcFlYUWlPakUzTXprMk16VTNNRFlzSW1WNGNDSTZNakExTlRJeE1UY3dObjAuT2hvOFpNb2VvSWJVTVIzb1kweTBWTEd2SmdOOVRTNnRBWUsxZFBDU1dmSQ==";

function decrypt(encryptedStr) {
  const decoded = atob(encryptedStr);
  return decoded;
}

const supabaseUrl = decrypt(encryptedSupabaseUrl);
const supabaseKey = decrypt(encryptedSupabaseKey);

const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

const urlParams = new URLSearchParams(window.location.search);
const productName = urlParams.get("productName") || "Неизвестный продукт";
const tableName = urlParams.get("tableName") || "users";

document.getElementById(
  "productTitle"
).textContent = `Авторизация: ${productName}`;

const loginForm = document.getElementById("loginForm");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const messageDiv = document.getElementById("message");

async function getUserData(username) {
  const { data, error } = await supabase
    .from(tableName)
    .select()
    .eq("username", username)
    .single();

  if (error) {
    return null;
  }
  return data;
}

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const username = usernameInput.value.trim();
  const password = passwordInput.value;
  messageDiv.textContent = "Проверка...";

  try {
    const userData = await getUserData(username);
    if (!userData) {
      messageDiv.textContent = "Пользователь не найден.";
      return;
    }
    if (!userData.active) {
      messageDiv.textContent = "Доступ для этого пользователя отключён.";
    } else if (password === userData.password) {
      messageDiv.textContent = JSON.stringify(
        {
          username: userData.username,
          password: userData.password,
          created_at: userData.created_at,
          active: userData.active,
        },
        null,
        2
      );
    } else {
      messageDiv.textContent = "Неверный пароль.";
    }
  } catch (err) {
    console.error("Ошибка:", err);
    messageDiv.textContent = "Ошибка при проверке пользователя.";
  }
});
