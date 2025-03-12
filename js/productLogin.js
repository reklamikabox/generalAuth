// js/productLogin.js

// Примеры "зашифрованных" строк (здесь — base64).
// Ниже будет функция decrypt, которая расшифрует их.
const encryptedSupabaseUrl =
  "aHR0cHM6Ly9pZnh4cnRtYmxyaHJkaGgueXlucS5zdXBhYmFzZS5jby8=";
const encryptedSupabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...SWZleHhydG1ibHJocmRoaG55eW5x...";
// Замените на реальный зашифрованный ключ
// (Выглядит урезанным, т.к. для примера; на практике вставьте полный base64)

// Функция "расшифровки" (base64).
function decrypt(encryptedStr) {
  // Расшифровка base64 в JavaScript
  // (Если нужно, используйте более безопасные методы)
  const decoded = atob(encryptedStr);
  return decoded;
}

// Реальные значения, используемые далее
const supabaseUrl = decrypt(encryptedSupabaseUrl);
const supabaseKey = decrypt(encryptedSupabaseKey);

// Инициализируем Supabase
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

// Парсим параметры из URL
const urlParams = new URLSearchParams(window.location.search);
const productName = urlParams.get("productName") || "Неизвестный продукт";
const tableName = urlParams.get("tableName") || "users";

// Устанавливаем заголовок на странице
document.getElementById(
  "productTitle"
).textContent = `Авторизация: ${productName}`;

// Элементы формы
const loginForm = document.getElementById("loginForm");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const messageDiv = document.getElementById("message");

// Функция для получения пользователя из Supabase
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

// Обработчик отправки формы
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
      // Показываем данные в JSON-формате
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
