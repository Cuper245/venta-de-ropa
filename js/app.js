const WHATSAPP_NUMBER = "5218120106311";

function getWhatsAppLink(product) {
  const message =
    `Hola! Me interesa la prenda ${product.id} - ${product.nombre}. ` +
    `¿Sigue disponible?`;

  return (
    `https://wa.me/${WHATSAPP_NUMBER}` +
    `?text=${encodeURIComponent(message)}`
  );
}

const productModal =
  document.getElementById("productModal");

const modalBody =
  document.getElementById("modalBody");


let products = [];

const SHEET_ID =
  "14Xm9vVfCgUi-vs2wUDkvieD_kRiR-MDkWTbH_TKEAdE";

const SHEET_GID =
  "2108941421";

const SHEET_URL =
  `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq` +
  `?gid=${SHEET_GID}&tqx=out:json`;



function openProductModal(
  product,
  updateUrl = true
) {

  const availability =
    String(product.disponible)
      .toLowerCase()
      .trim();

  const sold =
    availability === "vendida" ||
    availability === "vendido";

  const reserved =
    availability === "reservada" ||
    availability === "reservado";

  modalBody.innerHTML = `
    <div class="product-detail">

      <div class="product-detail-image-wrapper">

        <img
          src="${product.foto1}"
          alt="${product.nombre}"
          class="product-detail-image"
        >

        ${
          sold
            ? `<div class="status-banner sold-banner">VENDIDO</div>`
            : reserved
              ? `<div class="status-banner reserved-banner">RESERVADO</div>`
              : ""
        }

      </div>

      <div class="product-detail-info">

        <p class="product-detail-id">
          ${product.id}
        </p>

        <h2>
          ${product.nombre}
        </h2>

        <p class="product-detail-price">
          $${product.precio}
        </p>

        <div class="product-details-list">

          <p>
            <strong>Marca:</strong>
            ${product.marca || "-"}
          </p>

          <p>
            <strong>Talla:</strong>
            ${product.talla || "-"}
          </p>

          <p>
            <strong>Color:</strong>
            ${product.color || "-"}
          </p>

          <p>
            <strong>Estado:</strong>
            ${product.estado || "-"}
          </p>

        </div>

        ${
          product.descripcion
            ? `
              <p class="product-description">
                ${product.descripcion}
              </p>
            `
            : ""
        }

        ${
          sold
            ? `
                <button
                  class="contact-button sold-button"
                  disabled
                >
                  Vendido
                </button>
              `
            : reserved
              ? `
                  <button
                    class="contact-button sold-button"
                    disabled
                  >
                    Reservado
                  </button>
                `
              : `
                  <a
                    href="${getWhatsAppLink(product)}"
                    class="contact-button whatsapp-button"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <svg
                      class="whatsapp-icon"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        fill="currentColor"
                        d="M12 2a9.9 9.9 0 0 0-8.49 15.01L2 22l5.13-1.46A9.98 9.98 0 1 0 12 2Zm0 18a7.9 7.9 0 0 1-4.02-1.1l-.29-.17-3.04.86.87-2.96-.19-.3A8 8 0 1 1 12 20Zm4.37-5.95c-.24-.12-1.42-.7-1.64-.78-.22-.08-.38-.12-.54.12-.16.24-.62.78-.76.94-.14.16-.28.18-.52.06-.24-.12-1.01-.37-1.92-1.18-.71-.63-1.19-1.41-1.33-1.65-.14-.24-.02-.37.1-.49.11-.11.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.54-1.3-.74-1.78-.2-.47-.4-.4-.54-.41h-.46c-.16 0-.42.06-.64.3-.22.24-.84.82-.84 2s.86 2.32.98 2.48c.12.16 1.69 2.58 4.1 3.62.57.25 1.02.4 1.37.51.58.18 1.1.16 1.51.1.46-.07 1.42-.58 1.62-1.14.2-.56.2-1.04.14-1.14-.06-.1-.22-.16-.46-.28Z"
                      />
                    </svg>

                    Me interesa por WhatsApp
                  </a>
                `
        }

      </div>

    </div>
  `;

  productModal.classList.remove("hidden");
  document.body.style.overflow = "hidden";

  if (updateUrl) {

    const url =
      new URL(window.location.href);

    url.searchParams.set(
      "producto",
      product.id
    );

    window.history.pushState(
      {},
      "",
      url
    );

  }
}

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
          foto1: `images_web/${cells[0]}.webp`
        };

      })
      .filter(product =>
        product.id &&
        product.nombre &&
        product.precio !== ""
      );

    createCategories();
    createSizes();
    renderProducts(products);

    const productId =
      getProductFromUrl();

    if (productId) {

      const product =
        products.find(item =>
          String(item.id)
            .toLowerCase() ===
          String(productId)
            .toLowerCase()
        );

      if (product) {
        openProductModal(product, false);
      }

    }

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

const sizeFilter =
  document.getElementById("sizeFilter");

const priceFilter =
  document.getElementById("priceFilter");

const mobileFilterButton =
  document.getElementById("mobileFilterButton");

const filterPanel =
  document.getElementById("filterPanel");

const productCount =
  document.getElementById("productCount");

function createSizes() {

  sizeFilter.innerHTML = `
    <option value="todas">
      Todas las tallas
    </option>
  `;

  const sizes = [
    ...new Set(
      products
        .map(product => String(product.talla).trim())
        .filter(Boolean)
    )
  ];

  sizes.forEach(size => {

    const option =
      document.createElement("option");

    option.value = size;
    option.textContent = `Talla ${size}`;

    sizeFilter.appendChild(option);

  });

}

function getProductFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("producto");
}

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

function sortProducts(productList) {
  const statusPriority = {
    "si": 0,
    "sí": 0,
    "disponible": 0,

    "reservada": 1,
    "reservado": 1,

    "vendida": 2,
    "vendido": 2
  };

  return [...productList].sort((a, b) => {
    const statusA =
      String(a.disponible)
        .toLowerCase()
        .trim();

    const statusB =
      String(b.disponible)
        .toLowerCase()
        .trim();

    const priorityA =
      statusPriority[statusA] ?? 0;

    const priorityB =
      statusPriority[statusB] ?? 0;

    return priorityA - priorityB;
  });
}

function renderProducts(productList) {

  productsContainer.innerHTML = "";

  const sortedProducts =
    sortProducts(productList);

  productCount.textContent =
    `${sortedProducts.length} prendas`;

  sortedProducts.forEach(product => {

    const availability =
      String(product.disponible)
        .toLowerCase()
        .trim();

    const sold =
      availability === "vendida" ||
      availability === "vendido";

    const reserved =
      availability === "reservada" ||
      availability === "reservado";

    const card =
      document.createElement("article");

    card.className =
      `product-card ${sold ? "sold" : ""} ${reserved ? "reserved" : ""}`;

    const image = product.foto1
        ? `
            <img
              src="${product.foto1}"
              alt="${product.nombre}"
              class="product-image"
              loading="lazy"
              decoding="async"
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
            ? `<div class="status-banner sold-banner">VENDIDO</div>`
            : reserved
              ? `<div class="status-banner reserved-banner">RESERVADO</div>`
              : ""
        }

      </div>

      <div class="product-info">

        <p class="product-code">
          ${product.id}
        </p>

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

    

    card.addEventListener("click", () => {
      openProductModal(product);
    });

    const contactButton =
      card.querySelector(".contact-button");

    if (contactButton) {
      contactButton.addEventListener("click", event => {
        event.stopPropagation();
      });
    }

    productsContainer.appendChild(card);

  });

}

function closeProductModal() {

  productModal.classList.add("hidden");
  document.body.style.overflow = "";

  const url =
    new URL(window.location.href);

  url.searchParams.delete("producto");

  window.history.pushState(
    {},
    "",
    url
  );
}

document
  .querySelectorAll("[data-close-modal]")
  .forEach(element => {

    element.addEventListener(
      "click",
      closeProductModal
    );

  });

document.addEventListener("keydown", event => {

  if (event.key === "Escape") {
    closeProductModal();
  }

});

function updateFilterButton() {

  let activeFilters = 0;

  if (categoryFilter.value !== "todas") {
    activeFilters++;
  }

  if (sizeFilter.value !== "todas") {
    activeFilters++;
  }

  if (priceFilter.value !== "todas") {
    activeFilters++;
  }

  mobileFilterButton.textContent =
    activeFilters > 0
      ? `Filtros (${activeFilters})`
      : "Filtros";
}

function filterProducts() {

  const search =
    searchInput.value
      .toLowerCase()
      .trim();

  const category =
    categoryFilter.value;

  const size =
    sizeFilter.value;

  const priceRange =
    priceFilter.value;

  const filtered =
    products.filter(product => {

      const matchesSearch =
        String(product.nombre)
          .toLowerCase()
          .includes(search)
        ||
        String(product.marca)
          .toLowerCase()
          .includes(search);

      const matchesCategory =
        category === "todas"
        ||
        product.categoria === category;
      
      const matchesSize =
        size === "todas"
        ||
        String(product.talla).trim() === size;

      const price =
        Number(product.precio);

      let matchesPrice = true;

      if (priceRange === "0-100") {
        matchesPrice = price <= 100;
      }

      if (priceRange === "101-200") {
        matchesPrice = price >= 101 && price <= 200;
      }

      if (priceRange === "201-300") {
        matchesPrice = price >= 201 && price <= 300;
      }

      if (priceRange === "301-500") {
        matchesPrice = price >= 301 && price <= 500;
      }

      if (priceRange === "501+") {
        matchesPrice = price >= 501;
      }

      return (
        matchesSearch &&
        matchesCategory &&
        matchesSize &&
        matchesPrice
      );

    });

  renderProducts(filtered);
  updateFilterButton();

}

window.addEventListener(
  "popstate",
  () => {

    const productId =
      getProductFromUrl();

    if (!productId) {

      productModal.classList.add("hidden");
      document.body.style.overflow = "";

      return;
    }

    const product =
      products.find(item =>
        String(item.id)
          .toLowerCase() ===
        String(productId)
          .toLowerCase()
      );

    if (product) {
      openProductModal(product, false);
    }

  }
);

searchInput.addEventListener(
  "input",
  filterProducts
);

categoryFilter.addEventListener(
  "change",
  filterProducts
);

sizeFilter.addEventListener(
  "change",
  filterProducts
);

priceFilter.addEventListener(
  "change",
  filterProducts
);

mobileFilterButton.addEventListener("click", () => {
  filterPanel.classList.toggle("open");
});


loadProducts();