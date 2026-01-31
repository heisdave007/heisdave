// ===== PRODUCTS DATA =====
let products = [];

// ===== UTILITY FUNCTIONS =====
function getCart() {
  return JSON.parse(localStorage.getItem('cart')) || [];
}

// ===== FETCH PRODUCTS FROM API =====
async function fetchProducts() {
  try {
    const response = await fetch('/api/v1/products');
    if (!response.ok) {
      throw new Error('Failed to fetch products');
    }
    const data = await response.json();
    products = data.products || [];
    displayProducts(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    // Fallback: show error message
    document.getElementById('no-products').style.display = 'block';
    document.getElementById('no-products').textContent = 'Error loading products. Please refresh the page.';
  }
}

// ===== DOM ELEMENTS =====
const productList = document.getElementById("product-list");
const cartItems = document.getElementById("cart-items");
const cartCount = document.getElementById("cart-count");
const cartTotal = document.getElementById("cart-total");
const searchInput = document.getElementById("searchInput");
const sortSelect = document.getElementById("sortSelect");
const noProductsMessage = document.getElementById("no-products");

// ===== STATE =====
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let filteredProducts = [...products];

// ===== SAVE CART TO LOCALSTORAGE =====
function saveCart() {
  localStorage.setItem('cart', JSON.stringify(cart));
}

// ===== DISPLAY & FILTER PRODUCTS =====
function displayProducts(productsToDisplay = filteredProducts) {
  productList.innerHTML = "";
  
  if (productsToDisplay.length === 0) {
    noProductsMessage.style.display = "block";
    return;
  }
  
  noProductsMessage.style.display = "none";
  
  productsToDisplay.forEach((product) => {
    const div = document.createElement("div");
    div.classList.add("product");
    div.innerHTML = `
      <img src="${product.image || 'https://via.placeholder.com/200?text=No+Image'}" alt="${product.title || 'Product'}" />
      <h3>${product.title || 'Unknown Product'}</h3>
      <p>$${product.price || '0.00'}</p>
      <button onclick="addToCart('${product._id}')">Add to Cart</button>
    `;
    productList.appendChild(div);
  });
}

// ===== SEARCH FUNCTIONALITY =====
function handleSearch() {
  const searchTerm = searchInput.value.toLowerCase();
  
  filteredProducts = products.filter(product =>
    (product.title || '').toLowerCase().includes(searchTerm)
  );
  
  applySorting();
}

// ===== SORTING FUNCTIONALITY =====
function applySorting() {
  const sortOption = sortSelect.value;
  
  switch (sortOption) {
    case "price-low":
      filteredProducts.sort((a, b) => a.price - b.price);
      break;
    case "price-high":
      filteredProducts.sort((a, b) => b.price - a.price);
      break;
    case "name":
      filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case "featured":
    default:
      filteredProducts.sort((a, b) => a.id - b.id);
      break;
  }
  
  displayProducts(filteredProducts);
}

// ===== EVENT LISTENERS =====
if (searchInput) {
  searchInput.addEventListener("input", handleSearch);
}

if (sortSelect) {
  sortSelect.addEventListener("change", applySorting);
}

// ===== CART FUNCTIONS =====
function addToCart(id) {
  // Check if user is logged in
  const token = localStorage.getItem("token");
  if (!token) {
    alert("Please login or register to add items to your cart!");
    window.location.href = "./login.html";
    return;
  }

  const item = products.find((p) => p._id === id);
  if (item) {
    cart.push(item);
    updateCart();
  }
}

function updateCart() {
  cartItems.innerHTML = "";
  let total = 0;

  cart.forEach((item, index) => {
    total += item.price;
    const li = document.createElement("li");
    li.innerHTML = `
      ${item.name} - $${item.price}
      <button onclick="removeFromCart(${index})">❌</button>
    `;
    cartItems.appendChild(li);
  });

  cartTotal.textContent = `Total: $${total}`;
  cartCount.textContent = cart.length;
  saveCart(); // Save cart to localStorage after update
}

function removeFromCart(index) {
  cart.splice(index, 1);
  updateCart();
}

// ===== INITIALIZE PAGE =====
document.addEventListener('DOMContentLoaded', function () {
  // Update cart display on page load
  updateCart();
  
  // Fetch products from API on page load
  fetchProducts().then(() => {
    // Populate carousel with products after fetching
    populateCarousel();
    initCarousel();
  });
});

// ===== POPULATE CAROUSEL WITH PRODUCTS =====
function populateCarousel() {
  const slidesEl = document.querySelector('.slides');
  if (!slidesEl) return;
  
  // Clear existing slides
  slidesEl.innerHTML = '';
  
  // Get first 6 products for carousel
  const carouselProducts = products.slice(0, 6);
  
  if (carouselProducts.length === 0) {
    // If no products, show placeholder
    slidesEl.innerHTML = `<div class="slide"><img src="https://via.placeholder.com/800x400?text=No+Products+Available" alt="No Products" /></div>`;
    return;
  }
  
  // Create slides from products
  carouselProducts.forEach((product) => {
    const slide = document.createElement('div');
    slide.classList.add('slide');
    slide.innerHTML = `
      <img src="${product.image || 'https://via.placeholder.com/800x400?text=No+Image'}" alt="${product.title || 'Product'}" />
      <div style="position: absolute; bottom: 0; left: 0; right: 0; background: rgba(0,0,0,0.7); color: white; padding: 10px; text-align: center;">
        <p style="margin: 0; font-weight: bold;">${product.title || 'Product'}</p>
        <p style="margin: 5px 0; font-size: 0.9em;">$${product.price || '0.00'}</p>
      </div>
    `;
    slidesEl.appendChild(slide);
  });
}

// ===== INITIALIZE CAROUSEL =====
function initCarousel() {
  const slidesEl = document.querySelector('.slides');
  const slides = Array.from(document.querySelectorAll('.slide'));
  const prevBtn = document.querySelector('.prev');
  const nextBtn = document.querySelector('.next');
  const dotsContainer = document.querySelector('.dots');
  
  if (!slidesEl || slides.length === 0) return;
  
  let index = 0;
  let timer = null;
  const interval = 4000;

  // Build dots
  slides.forEach((_, i) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.setAttribute('aria-label', `Go to slide ${i + 1}`);
    btn.addEventListener('click', () => show(i));
    dotsContainer.appendChild(btn);
  });

  const dots = Array.from(dotsContainer.children);

  function show(i) {
    index = (i + slides.length) % slides.length;
    slidesEl.style.transform = `translateX(-${index * 100}%)`;
    dots.forEach((d, idx) => d.classList.toggle('active', idx === index));
    resetTimer();
  }

  function prev() { show(index - 1); }
  function next() { show(index + 1); }

  prevBtn.addEventListener('click', prev);
  nextBtn.addEventListener('click', next);

  function resetTimer() {
    if (timer) clearInterval(timer);
    timer = setInterval(next, interval);
  }

  // Initialize carousel
  show(0);
  resetTimer();

  // Pause on hover
  const slider = document.querySelector('.featured-slider');
  if (slider) {
    slider.addEventListener('mouseenter', () => clearInterval(timer));
    slider.addEventListener('mouseleave', resetTimer);
  }
}

// ===== INITIAL DISPLAY =====
displayProducts();