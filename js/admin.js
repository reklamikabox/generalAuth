// js/admin.js

// Зашифрованные данные (base64 в примере)
const encryptedSupabaseUrl =
  "aHR0cHM6Ly9sY2ZjZXFtamp2enZ3aGR0dHVpaS5zdXBhYmFzZS5jbw==";
const encryptedSupabaseKey =
  "ZXlKaGJHY2lPaUpJVXpJMU5pSXNJblI1Y0NJNklrcFhWQ0o5LmV5SnBjM01pT2lKemRYQmhZbUZ6WlNJc0luSmxaaUk2SW14alptTmxjVzFxYW5aNmRuZG9aSFIwZFdscElpd2ljbTlzWlNJNkltRnViMjRpTENKcFlYUWlPakUzTXprMU5EUTFPVFVzSW1WNGNDSTZNakExTlRFeU1EVTVOWDAuMlduTjFHVlFUTzF5UFAzRGdreDVzSTJ4SUVtbXk2Y0tlMnRiRDJ2Mmd6aw==";
const encryptedAdminPassword = "MDQxMDA3"; // "041007" в base64 (пример)

// Функция расшифровки (base64)
function decrypt(encryptedStr) {
  return atob(encryptedStr);
}

// Расшифровываем реальные значения
const supabaseUrl = decrypt(encryptedSupabaseUrl);
const supabaseKey = decrypt(encryptedSupabaseKey);
const adminPassword = decrypt(encryptedAdminPassword);

// Инициализация supabase
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);
(async () => {
  // Тестовый запрос (закомментируйте при необходимости)
  console.log(await supabase.from("users").select("username"));
})();

// Селекторы
const adminLoginContainer = document.getElementById("adminLoginContainer");
const adminPanelContainer = document.getElementById("adminPanelContainer");

const adminLoginForm = document.getElementById("adminLoginForm");
const adminPasswordInput = document.getElementById("adminPasswordInput");
const adminLoginMessage = document.getElementById("adminLoginMessage");

const productSelect = document.getElementById("productSelect");
const logoutAdminBtn = document.getElementById("logoutAdminBtn");

const usersTableBody = document.querySelector("#usersTable tbody");

// Форма добавления пользователя
const addUserForm = document.getElementById("addUserForm");
const newUsernameInput = document.getElementById("newUsername");
const newPasswordInput = document.getElementById("newPassword");

// *** СТАРАЯ ЛОГИКА ДЛЯ РЕДАКТИРОВАНИЯ (прежние поля) ***
// const editUserForm = document.getElementById("editUserForm");
// const editUsernameInput = document.getElementById("editUsername");
// const loadUserBtn = document.getElementById("loadUserBtn");
// const editFieldsDiv = document.getElementById("editFields");
// const editPasswordInput = document.getElementById("editPassword");
// const editCreatedInput = document.getElementById("editCreated");
// const editActiveInput = document.getElementById("editActive");
// const deleteUserBtn = document.getElementById("deleteUserBtn");

// Но нам всё равно нужны эти селекторы для новой логики,
// поэтому раскомментируем, но некоторые используем лишь частично:
const editUserForm = document.getElementById("editUserForm");
const editUsernameInput = document.getElementById("editUsername");
const loadUserBtn = document.getElementById("loadUserBtn");
const editFieldsDiv = document.getElementById("editFields");
// const editPasswordInput = document.getElementById("editPassword");
// const editCreatedInput = document.getElementById("editCreated");
// const editActiveInput = document.getElementById("editActive");
const deleteUserBtn = document.getElementById("deleteUserBtn");

const adminMessage = document.getElementById("adminMessage");

// Контейнер для динамических полей редактирования
const dynamicFieldsContainer = document.getElementById("dynamicFieldsContainer");

// Текущее выбранное название таблицы
let currentTableName = null;

// ----- Шаг 1: Авторизация админа -----
adminLoginForm.addEventListener("submit", (e) => {
  e.preventDefault();
  if (adminPasswordInput.value === adminPassword) {
    // Успешно
    adminLoginMessage.textContent = "Успешный вход в админ-режим!";
    adminLoginContainer.classList.add("hidden");
    adminPanelContainer.classList.remove("hidden");

    // Загружаем список продуктов в селект
    loadProductsIntoSelect();
  } else {
    adminLoginMessage.textContent = "Неверный админ-пароль.";
  }
});

logoutAdminBtn.addEventListener("click", () => {
  // На практике можно сделать более сложную логику
  window.location.href = "index.html";
});

// ----- Шаг 2: Загрузка списка продуктов и инициализация -----
async function loadProductsIntoSelect() {
  try {
    const response = await fetch("products.txt");
    const text = await response.text();
    const lines = text.trim().split("\n");

    productSelect.innerHTML = "";
    lines.forEach((line) => {
      const [productName, tableName] = line.split("|").map((s) => s.trim());
      const option = document.createElement("option");
      option.value = tableName;
      option.textContent = productName;
      productSelect.appendChild(option);
    });

    // Выставляем текущую таблицу – первую по умолчанию
    currentTableName = productSelect.value;
    loadUsersTable(currentTableName);

    // Изменение выбора продукта
    productSelect.addEventListener("change", () => {
      currentTableName = productSelect.value;
      loadUsersTable(currentTableName);
    });
  } catch (err) {
    console.error("Ошибка загрузки products.txt", err);
  }
}

// ----- Шаг 3: Функция загрузки таблицы (динамически по всем столбцам) -----
async function loadUsersTable(tableName) {
  try {
    const { data, error } = await supabase.from(tableName).select();

    console.log("loadUsersTable -> data:", data, "error:", error);

    if (error) {
      throw error;
    }

    // --- НОВЫЙ КОД: динамическое получение всех столбцов ---
    // Очищаем tbody
    usersTableBody.innerHTML = "";

    const usersTable = document.querySelector("#usersTable");
    // Если хотим динамически менять и заголовки (thead), то сначала очистим/пересоздадим thead
    let thead = usersTable.querySelector("thead");
    if (!thead) {
      thead = document.createElement("thead");
      usersTable.insertBefore(thead, usersTableBody);
    }
    thead.innerHTML = "";

    // Если данных нет, просто выведем что-то в таблицу (или оставим пустым)
    if (!data || data.length === 0) {
      const tr = document.createElement("tr");
      const td = document.createElement("td");
      td.colSpan = 1; // или сделать шире
      td.textContent = "Нет данных";
      tr.appendChild(td);
      usersTableBody.appendChild(tr);
      return;
    }

    // Берём ключи (названия столбцов) из первого объекта
    const columns = Object.keys(data[0]);

    // Создаём шапку таблицы
    const headerRow = document.createElement("tr");
    columns.forEach((col) => {
      const th = document.createElement("th");
      th.textContent = col;
      headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);

    // Заполняем строки таблицы
    data.forEach((row) => {
      const tr = document.createElement("tr");
      columns.forEach((col) => {
        const td = document.createElement("td");
        td.textContent =
          row[col] !== null && row[col] !== undefined ? row[col] : "";
        tr.appendChild(td);
      });
      usersTableBody.appendChild(tr);
    });
    // --- Конец нового кода ---
  } catch (err) {
    console.error("Ошибка при загрузке пользователей:", err);
  }
}

// ----- Шаг 4: Добавление нового пользователя (старая логика, завязанная на поля username, password, created_at, active) -----
addUserForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!currentTableName) return;

  const newUserData = {
    username: newUsernameInput.value.trim(),
    password: newPasswordInput.value,
    created_at: new Date().toISOString(),
    active: true,
  };

  try {
    const { data, error } = await supabase
      .from(currentTableName)
      .insert(newUserData)
      .select();

    if (error) {
      throw error;
    }

    adminMessage.textContent = "Новый пользователь успешно добавлен!";
    newUsernameInput.value = "";
    newPasswordInput.value = "";
    // Перезагружаем таблицу
    loadUsersTable(currentTableName);
  } catch (err) {
    console.error("Ошибка при добавлении пользователя:", err);
    adminMessage.textContent = "Ошибка при добавлении пользователя.";
  }
});

// ----- Шаг 5: Загрузка данных пользователя для редактирования (завязано на поле username) -----
loadUserBtn.addEventListener("click", async () => {
  if (!currentTableName) return;
  const usernameToEdit = editUsernameInput.value.trim();
  if (!usernameToEdit) return;

  adminMessage.textContent = "";
  editFieldsDiv.classList.add("hidden");
  dynamicFieldsContainer.innerHTML = ""; // Очищаем динамические поля

  try {
    const { data, error } = await supabase
      .from(currentTableName)
      .select()
      .eq("username", usernameToEdit)
      .single();

    if (error || !data) {
      adminMessage.textContent = "Пользователь не найден.";
      return;
    }

    // *** СТАРЫЙ КОД (жёстко завязан на password, created_at, active) ***
    /*
    // editPasswordInput.value = data.password || "";
    // editCreatedInput.value = data.created_at
    //   ? data.created_at.substring(0, 10)
    //   : "";
    // editActiveInput.checked = !!data.active;
    // editFieldsDiv.classList.remove("hidden");
    */

    // --- НОВЫЙ КОД: динамическая генерация полей ---
    // Пройдёмся по всем ключам объекта data и создадим инпуты
    for (const columnName in data) {
      // Создаём обёртку (div или label)
      const fieldWrapper = document.createElement("div");
      fieldWrapper.style.marginBottom = "8px";

      // Создаём подпись (label)
      const label = document.createElement("label");
      label.textContent = columnName + ": ";

      // Создаём input (для упрощения всё text, но можно делать разные типы в зависимости от данных)
      const input = document.createElement("input");
      input.type = "text";
      input.name = columnName;
      // Если хотите чуть "умнее" определять тип, раскомментируйте и допишите логику
      /*
      if (typeof data[columnName] === "boolean") {
        input.type = "checkbox";
        input.checked = !!data[columnName];
      } else if (columnName === "created_at") {
        input.type = "date";
        if (data[columnName]) {
          input.value = data[columnName].substring(0, 10);
        }
      } else {
        input.type = "text";
      }
      */
      // Пока делаем универсально как текст
      input.value = data[columnName] !== null && data[columnName] !== undefined
        ? data[columnName]
        : "";

      label.appendChild(input);
      fieldWrapper.appendChild(label);
      dynamicFieldsContainer.appendChild(fieldWrapper);
    }

    // Показываем блок редактирования
    editFieldsDiv.classList.remove("hidden");
  } catch (err) {
    console.error("Ошибка при загрузке пользователя:", err);
    adminMessage.textContent = "Ошибка при загрузке данных.";
  }
});

// ----- Шаг 6: Сохранение изменений пользователя (завязано на поле username) -----
editUserForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!currentTableName) return;
  const usernameToEdit = editUsernameInput.value.trim();

  // *** СТАРЫЙ КОД ***
  /*
  const updates = {};
  if (editPasswordInput.value) {
    updates.password = editPasswordInput.value;
  }
  updates.active = editActiveInput.checked;
  */

  // --- НОВЫЙ КОД: собрать данные из dynamicFieldsContainer ---
  const updates = {};
  const inputs = dynamicFieldsContainer.querySelectorAll("input");
  inputs.forEach((input) => {
    const fieldName = input.name;
    // Если у нас были поля checkbox/boolean — нужно учитывать (по желанию)
    // Пока считаем, что всё текст:
    updates[fieldName] = input.value;

    // Если хотим поддерживать checkbox:
    /*
    if (input.type === "checkbox") {
      updates[fieldName] = input.checked;
    } else {
      updates[fieldName] = input.value;
    }
    */
  });

  try {
    // Обратите внимание: критерий обновления — eq("username", usernameToEdit)
    // Вы можете заменить на другой столбец, если нужно
    const { data, error } = await supabase
      .from(currentTableName)
      .update(updates)
      .eq("username", usernameToEdit)
      .select()
      .single();

    if (error) {
      throw error;
    }

    adminMessage.textContent = "Пользователь успешно обновлён!";

    // Очищаем поля
    editUsernameInput.value = "";
    editFieldsDiv.classList.add("hidden");
    dynamicFieldsContainer.innerHTML = "";

    loadUsersTable(currentTableName);
  } catch (err) {
    console.error("Ошибка при обновлении пользователя:", err);
    adminMessage.textContent = "Ошибка при обновлении пользователя.";
  }
});

// ----- Шаг 7: Удаление пользователя (завязано на поле username) -----
deleteUserBtn.addEventListener("click", async () => {
  if (!currentTableName) return;
  const usernameToDelete = editUsernameInput.value.trim();
  if (!usernameToDelete) return;

  if (!confirm("Вы уверены, что хотите удалить пользователя?")) {
    return;
  }

  try {
    const { data, error } = await supabase
      .from(currentTableName)
      .delete()
      .eq("username", usernameToDelete);

    if (error) {
      throw error;
    }

    adminMessage.textContent = "Пользователь удалён!";
    // Очищаем поля
    editUsernameInput.value = "";
    editFieldsDiv.classList.add("hidden");
    dynamicFieldsContainer.innerHTML = "";

    loadUsersTable(currentTableName);
  } catch (err) {
    console.error("Ошибка при удалении пользователя:", err);
    adminMessage.textContent = "Ошибка при удалении пользователя.";
  }
});
