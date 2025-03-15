const encryptedSupabaseUrl =
  "aHR0cHM6Ly9pZnh4cnRtYmxyaHJkaGhueXlucS5zdXBhYmFzZS5jbw==";
const encryptedSupabaseKey =
  "ZXlKaGJHY2lPaUpJVXpJMU5pSXNJblI1Y0NJNklrcFhWQ0o5LmV5SnBjM01pT2lKemRYQmhZbUZ6WlNJc0luSmxaaUk2SW14alptTmxjVzFxYW5aNmRuZG9aSFIwZFdscElpd2ljbTlzWlNJNkltRnViMjRpTENKcFlYUWlPakUzTXprMU5EUTFPVFVzSW1WNGNDSTZNakExTlRFeU1EVTVOWDAuMlduTjFHVlFUTzF5UFAzRGdreDVzSTJ4SUVtbXk2Y0tlMnRiRDJ2Mmd6aw==";
const encryptedAdminPassword = "MDQxMDA3";

function decrypt(encryptedStr) {
  return atob(encryptedStr);
}

const supabaseUrl = decrypt(encryptedSupabaseUrl);
const supabaseKey = decrypt(encryptedSupabaseKey);
supabaseUrl = "https://ifxxrtmblrhrdhhnyynq.supabase.co/";
supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlmeHhydG1ibHJocmRoaG55eW5xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk2MzU3MDYsImV4cCI6MjA1NTIxMTcwNn0.Oho8ZMoeoIbUMR3oY0y0VLGvJgN9TS6tAYK1dPCSWfI";
const adminPassword = decrypt(encryptedAdminPassword);

const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);
(async () => {
  console.log(await supabase.from("users").select("username"));
})();

const adminLoginContainer = document.getElementById("adminLoginContainer");
const adminPanelContainer = document.getElementById("adminPanelContainer");

const adminLoginForm = document.getElementById("adminLoginForm");
const adminPasswordInput = document.getElementById("adminPasswordInput");
const adminLoginMessage = document.getElementById("adminLoginMessage");

const productSelect = document.getElementById("productSelect");
const logoutAdminBtn = document.getElementById("logoutAdminBtn");

const usersTableBody = document.querySelector("#usersTable tbody");

const addUserForm = document.getElementById("addUserForm");
const newUsernameInput = document.getElementById("newUsername");
const newPasswordInput = document.getElementById("newPassword");

const editUserForm = document.getElementById("editUserForm");
const editUsernameInput = document.getElementById("editUsername");
const loadUserBtn = document.getElementById("loadUserBtn");
const editFieldsDiv = document.getElementById("editFields");
const deleteUserBtn = document.getElementById("deleteUserBtn");

const adminMessage = document.getElementById("adminMessage");

const dynamicFieldsContainer = document.getElementById("dynamicFieldsContainer");

let currentTableName = null;

adminLoginForm.addEventListener("submit", (e) => {
  e.preventDefault();
  if (adminPasswordInput.value === adminPassword) {
    adminLoginMessage.textContent = "Успешный вход в админ-режим!";
    adminLoginContainer.classList.add("hidden");
    adminPanelContainer.classList.remove("hidden");

    loadProductsIntoSelect();
  } else {
    adminLoginMessage.textContent = "Неверный админ-пароль.";
  }
});

logoutAdminBtn.addEventListener("click", () => {
  window.location.href = "index.html";
});

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

    currentTableName = productSelect.value;
    loadUsersTable(currentTableName);

    productSelect.addEventListener("change", () => {
      currentTableName = productSelect.value;
      loadUsersTable(currentTableName);
    });
  } catch (err) {
    console.error("Ошибка загрузки products.txt", err);
  }
}

async function loadUsersTable(tableName) {
  try {
    const { data, error } = await supabase.from(tableName).select();

    console.log("loadUsersTable -> data:", data, "error:", error);

    if (error) {
      throw error;
    }

    usersTableBody.innerHTML = "";

    const usersTable = document.querySelector("#usersTable");
    let thead = usersTable.querySelector("thead");
    if (!thead) {
      thead = document.createElement("thead");
      usersTable.insertBefore(thead, usersTableBody);
    }
    thead.innerHTML = "";

    if (!data || data.length === 0) {
      const tr = document.createElement("tr");
      const td = document.createElement("td");
      td.colSpan = 1;
      td.textContent = "Нет данных";
      tr.appendChild(td);
      usersTableBody.appendChild(tr);
      return;
    }

    const columns = Object.keys(data[0]);

    const headerRow = document.createElement("tr");
    columns.forEach((col) => {
      const th = document.createElement("th");
      th.textContent = col;
      headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);

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
  } catch (err) {
    console.error("Ошибка при загрузке пользователей:", err);
  }
}

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
    loadUsersTable(currentTableName);
  } catch (err) {
    console.error("Ошибка при добавлении пользователя:", err);
    adminMessage.textContent = "Ошибка при добавлении пользователя.";
  }
});

loadUserBtn.addEventListener("click", async () => {
  if (!currentTableName) return;
  const usernameToEdit = editUsernameInput.value.trim();
  if (!usernameToEdit) return;

  adminMessage.textContent = "";
  editFieldsDiv.classList.add("hidden");
  dynamicFieldsContainer.innerHTML = "";

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

    for (const columnName in data) {
      const fieldWrapper = document.createElement("div");
      fieldWrapper.style.marginBottom = "8px";

      const label = document.createElement("label");
      label.textContent = columnName + ": ";

      const input = document.createElement("input");
      input.type = "text";
      input.name = columnName;
      input.value = data[columnName] !== null && data[columnName] !== undefined
        ? data[columnName]
        : "";

      label.appendChild(input);
      fieldWrapper.appendChild(label);
      dynamicFieldsContainer.appendChild(fieldWrapper);
    }

    editFieldsDiv.classList.remove("hidden");
  } catch (err) {
    console.error("Ошибка при загрузке пользователя:", err);
    adminMessage.textContent = "Ошибка при загрузке данных.";
  }
});

editUserForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!currentTableName) return;
  const usernameToEdit = editUsernameInput.value.trim();

  const updates = {};
  const inputs = dynamicFieldsContainer.querySelectorAll("input");
  inputs.forEach((input) => {
    const fieldName = input.name;
    updates[fieldName] = input.value;
  });

  try {
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
    editUsernameInput.value = "";
    editFieldsDiv.classList.add("hidden");
    dynamicFieldsContainer.innerHTML = "";

    loadUsersTable(currentTableName);
  } catch (err) {
    console.error("Ошибка при обновлении пользователя:", err);
    adminMessage.textContent = "Ошибка при обновлении пользователя.";
  }
});

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
    editUsernameInput.value = "";
    editFieldsDiv.classList.add("hidden");
    dynamicFieldsContainer.innerHTML = "";

    loadUsersTable(currentTableName);
  } catch (err) {
    console.error("Ошибка при удалении пользователя:", err);
    adminMessage.textContent = "Ошибка при удалении пользователя.";
  }
});
