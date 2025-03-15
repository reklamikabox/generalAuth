function createBlockElement(classNames, textContent) {
  const div = document.createElement("div");
  for (let name of classNames) {
    div.classList.add(name);
  }
  div.textContent = textContent;
  return div;
}

fetch("products.txt")
  .then((response) => response.text())
  .then((text) => {
    const lines = text.trim().split("\n");
    const productsContainer = document.getElementById("productsContainer");

    lines.forEach((line) => {
      const [productName, tableName] = line.split("|").map((s) => s.trim());
      const productBlock = createBlockElement(
        ["product-block", `${productName.replace(" ", "")}`],
        productName
      );

      productBlock.addEventListener("click", () => {
        const encodedName = encodeURIComponent(productName);
        const encodedTable = encodeURIComponent(tableName);
        window.location.href = `productLogin.html?productName=${encodedName}&tableName=${encodedTable}`;
      });

      productsContainer.appendChild(productBlock);
    });

    const adminBlock = createBlockElement(["admin-block"], "Администратор");
    adminBlock.addEventListener("click", () => {
      window.location.href = "admin.html";
    });
    productsContainer.appendChild(adminBlock);
  })
  .catch((err) => {
    console.error("Ошибка загрузки products.txt", err);
  });
