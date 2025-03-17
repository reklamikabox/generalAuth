const encryptedSupabaseUrl =
  "aHR0cHM6Ly9pZnh4cnRtYmxyaHJkaGhueXlucS5zdXBhYmFzZS5jby8=";
const encryptedSupabaseKey =
  "ZXlKaGJHY2lPaUpJVXpJMU5pSXNJblI1Y0NJNklrcFhWQ0o5LmV5SnBjM01pT2lKemRYQmhZbUZ6WlNJc0luSmxaaUk2SW1sbWVIaHlkRzFpYkhKb2NtUm9hRzU1ZVc1eElpd2ljbTlzWlNJNkluTmxjblpwWTJWZmNtOXNaU0lzSW1saGRDSTZNVGN6T1RZek5UY3dOaXdpWlhod0lqb3lNRFUxTWpFeE56QTJmUS5HYlVTeUhYa1BOUDg2czltSWFsLTdVRE5TV1FDM1owWEU2UzRwUC15SEM4";

function decrypt(encryptedStr) {
  return atob(encryptedStr);
}

const supabaseUrl = decrypt(encryptedSupabaseUrl);
const supabaseKey = decrypt(encryptedSupabaseKey);
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

const adminPanelContainer = document.getElementById("adminPanelContainer");
const productSelect = document.getElementById("productSelect");
const logoutAdminBtn = document.getElementById("logoutAdminBtn");
const usersTableBody = document.querySelector("#usersTable tbody");
const editModal = document.getElementById("editModal");
const modalClose = document.getElementById("modalClose");
const cancelEditBtn = document.getElementById("cancelEditBtn");
const dynamicFieldsContainer = document.getElementById(
  "dynamicFieldsContainer"
);
const deleteUserBtn = document.getElementById("deleteUserBtn");
const editUserForm = document.getElementById("editUserForm");

let currentTableName = null;
let selectedUser = null;

// Инициализация админ-панели
async function initAdminPanel() {
  loadProductsIntoSelect();
}

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

    if (error) throw error;

    usersTableBody.innerHTML = "";
    const thead = usersTable.querySelector("thead");
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

    // Create table header
    const columns = Object.keys(data[0]);
    const headerRow = document.createElement("tr");
    columns.forEach((col) => {
      const th = document.createElement("th");
      th.textContent = col;
      headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);

    // Create table rows
    data.forEach((row) => {
      const tr = document.createElement("tr");
      tr.classList.add("clickable-row");
      tr.dataset.user = JSON.stringify(row);

      columns.forEach((col) => {
        const td = document.createElement("td");
        td.textContent = row[col] ?? "";
        tr.appendChild(td);
      });

      tr.addEventListener("click", () => showEditModal(row));
      usersTableBody.appendChild(tr);
    });
  } catch (err) {
    console.error("Ошибка при загрузке пользователей:", err);
  }
}

function showEditModal(userData) {
  selectedUser = userData;
  dynamicFieldsContainer.innerHTML = "";

  Object.entries(userData).forEach(([key, value]) => {
    const fieldDiv = document.createElement("div");
    fieldDiv.className = "form-field";

    const label = document.createElement("label");
    label.textContent = key + ":";

    const input = document.createElement("input");
    input.type = "text";
    input.name = key;
    input.value = value ?? "";
    if (key === "created_at") input.readOnly = true;

    fieldDiv.append(label, input);
    dynamicFieldsContainer.appendChild(fieldDiv);
  });

  editModal.style.display = "flex";
}

// Закрытие модального окна
function closeModal() {
  editModal.style.display = "none";
  selectedUser = null;
  dynamicFieldsContainer.innerHTML = "";
}

// Обработчики событий
modalClose.addEventListener("click", closeModal);
cancelEditBtn.addEventListener("click", closeModal);

editUserForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!currentTableName || !selectedUser) return;

  const updates = {};
  const inputs = dynamicFieldsContainer.querySelectorAll("input");
  inputs.forEach((input) => {
    updates[input.name] = input.value;
  });

  try {
    const { data, error } = await supabase
      .from(currentTableName)
      .update(updates)
      .eq("username", selectedUser.username)
      .select();

    if (error) throw error;

    closeModal();
    loadUsersTable(currentTableName);
  } catch (err) {
    console.error("Ошибка при обновлении пользователя:", err);
  }
});

deleteUserBtn.addEventListener("click", async () => {
  if (!currentTableName || !selectedUser) return;
  if (!confirm("Вы уверены, что хотите удалить пользователя?")) return;

  try {
    const { error } = await supabase
      .from(currentTableName)
      .delete()
      .eq("username", selectedUser.username);

    if (error) throw error;

    closeModal();
    loadUsersTable(currentTableName);
  } catch (err) {
    console.error("Ошибка при удалении пользователя:", err);
  }
});

logoutAdminBtn.addEventListener("click", () => {
  window.location.href = "index.html";
});

// Инициализация при загрузке
document.addEventListener("DOMContentLoaded", initAdminPanel);

// Добавить в начало списка переменных
const addUserBtn = document.getElementById("addUserBtn");
const addUserModal = document.getElementById("addUserModal");
const addModalClose = document.getElementById("addModalClose");
const cancelAddBtn = document.getElementById("cancelAddBtn");
const addUserForm = document.getElementById("addUserForm");
const newUsername = document.getElementById("newUsername");
const newPassword = document.getElementById("newPassword");
const newActive = document.getElementById("newActive");

// Добавить обработчики после инициализации
addUserBtn.addEventListener("click", () => {
  addUserModal.style.display = "flex";
});

addModalClose.addEventListener("click", () => {
  addUserModal.style.display = "none";
});

cancelAddBtn.addEventListener("click", () => {
  addUserModal.style.display = "none";
});

addUserForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!currentTableName) return;

  const newUser = {
    username: newUsername.value.trim(),
    password: newPassword.value,
    active: newActive.checked,
    created_at: new Date().toISOString(),
  };

  try {
    const { data, error } = await supabase
      .from(currentTableName)
      .insert(newUser)
      .select();

    if (error) throw error;

    addUserModal.style.display = "none";
    newUsername.value = "";
    newPassword.value = "";
    newActive.checked = true;
    loadUsersTable(currentTableName);
  } catch (err) {
    console.error("Ошибка при создании пользователя:", err);
    alert("Ошибка при создании пользователя");
  }
});
