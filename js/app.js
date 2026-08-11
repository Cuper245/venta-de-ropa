let products = [];

const SHEET_ID = "14Xm9vVfCgUi-vs2wUDkvieD_kRiR-MDkWTbH_TKEAdE";
const SHEET_GID = "2108941421";

const SHEET_URL =
  `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq` +
  `?gid=${SHEET_GID}&tqx=out:json`;


async function loadProducts() {
  try {

    const response = await fetch(SHEET_URL);

    if (!response.ok) {
      throw new Error("No se pudo cargar el catálogo");
    }

    const text = await response.text();

    const jsonText = text
      .replace(
        "/*O_o*/\ngoogle.visualization.Query.setResponse(",
        ""
      )
      .replace(/\);$/, "");

    const data = JSON.parse(jsonText);

    const rows = data.table.rows;

    products = rows
      .map(row => {

        const cells = row.c.map(cell =>
          cell ? cell.v : ""
        );

        return {
          id: cells[0],
          nombre: cells[1],
          categoria: cells[2],
          marca: cells[3],
          talla: cells[4],
          color: cells[5],
          precio: cells[6],
          estado: cells[7],
          descripcion: cells[8],
          disponible: cells[9],
          fechaPublicacion: cells[10],
          foto1: cells[11]
        };

      })
      .filter(product =>
        product.id &&
        product.nombre &&
        product.precio !== ""
      );

    createCategories();
    renderProducts(products);

  } catch (error) {

    console.error(error);

    productsContainer.innerHTML = `
      <p>
        No se pudo cargar el catálogo.
        Intenta nuevamente más tarde.
      </p>
    `;

  }
}


const productsContainer =
  document.getElementById("products");

const searchInput =
  document.getElementById("searchInput");

const categoryFilter =
  document.getElementById("categoryFilter");

const productCount =
  document.getElementById("productCount");


function createCategories() {

  categoryFilter.innerHTML = `
    <option value="todas">
      Todas las categorías
    </option>
  `;

  const categories = [
    ...new Set(
      products
        .map(product => product.categoria)
        .filter(Boolean)
    )
  ].sort();

  categories.forEach(category => {

    const option =
      document.createElement("option");

    option.value = category;
    option.textContent = category;

    categoryFilter.appendChild(option);

  });

}



function renderProducts(productList) {

  productsContainer.innerHTML = "";

  productCount.textContent =
    `${productList.length} prendas`;

  productList.forEach(product => {

    const availability =
      String(product.disponible)
        .toLowerCase()
        .trim();

    const sold =
      availability === "vendida" ||
      availability === "vendido";

    const card =
      document.createElement("article");

    card.className =
      `product-card ${sold ? "sold" : ""}`;

    const image = product.foto1
        ? `
            <img
            src="${product.foto1}"
            alt="${product.nombre}"
            class="product-image"
            loading="lazy"
            >
        `
        : `
            <div class="product-image-placeholder">
            <span>Sin imagen</span>
            </div>
        `;

    card.innerHTML = `
      <div class="product-image-wrapper">

        ${image}

        ${
          sold
            ? `<div class="sold-banner">VENDIDO</div>`
            : ""
        }

      </div>

      <div class="product-info">

        <h2 class="product-name">
          ${product.nombre}
        </h2>

        <p class="product-meta">
          ${product.marca} · Talla ${product.talla}
        </p>

        <p class="product-price">
          $${product.precio}
        </p>

      </div>
    `;

    productsContainer.appendChild(card);

  });

}


function filterProducts() {

  const search =
    searchInput.value
      .toLowerCase()
      .trim();

  const category =
    categoryFilter.value;

  const filtered =
    products.filter(product => {

      const matchesSearch =
        product.nombre
          .toLowerCase()
          .includes(search)
        ||
        product.marca
          .toLowerCase()
          .includes(search);

      const matchesCategory =
        category === "todas"
        ||
        product.categoria === category;

      return (
        matchesSearch &&
        matchesCategory
      );

    });

  renderProducts(filtered);

}


searchInput.addEventListener(
  "input",
  filterProducts
);

categoryFilter.addEventListener(
  "change",
  filterProducts
);

loadProducts();