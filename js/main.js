// js/main.js

// Функция для создания HTML-элемента с заданными классами и текстом
function createBlockElement(classNames, textContent) {
  const div = document.createElement("div");
  for (let name of classNames) {
    div.classList.add(name);
  }
  div.textContent = textContent;
  return div;
}

// Загружаем список продуктов из products.txt
// В формате: "Продукт 1|users_1" (каждая строка - отдельный продукт)
fetch("products.txt")
  .then((response) => response.text())
  .then((text) => {
    const lines = text.trim().split("\n");
    const productsContainer = document.getElementById("productsContainer");

    // Для каждой строки создаём блок
    lines.forEach((line) => {
      const [productName, tableName] = line.split("|").map((s) => s.trim());
      // Создаем блок продукта
      const productBlock = createBlockElement(
        ["product-block", `${productName.replace(" ", "")}`],
        productName
      );

      // При клике переходим на productLogin.html с параметром
      productBlock.addEventListener("click", () => {
        // Кодируем название продукта, чтобы потом распарсить
        const encodedName = encodeURIComponent(productName);
        const encodedTable = encodeURIComponent(tableName);
        window.location.href = `productLogin.html?productName=${encodedName}&tableName=${encodedTable}`;
      });

      productsContainer.appendChild(productBlock);
    });

    // В конце добавляем блок "Администратор"
    const adminBlock = createBlockElement(["admin-block"], "Администратор");
    adminBlock.addEventListener("click", () => {
      window.location.href = "admin.html";
    });
    productsContainer.appendChild(adminBlock);
  })
  .catch((err) => {
    console.error("Ошибка загрузки products.txt", err);
  });
