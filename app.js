// variable belong to navigation bar
const navIcon = document.querySelector(".nav-icon");
const closeNavBtn = document.querySelector(".close-nav-btn");
const verticalNav = document.querySelector(".vertical-navbar");
// variable belong to cart
const cartDOM = document.querySelector(".cart");
const cartBg = document.querySelector(".cart-bg");
const cartBtn = document.querySelector(".cart-btn");
const closeCartBtn = document.querySelector(".close-cart-btn");
const cartContent = document.querySelector(".cart-content");
const cartCount = document.querySelector(".cart-items");
const cartTotal = document.querySelector(".cart-total h2");
const clearCartBtn = document.querySelector(".clear-cart-btn");
// product center
const productCenter = document.querySelector(".product-center");
const navBar = document.querySelector(".navbar");
const verticalNavBar = document.querySelector(".vertical-navbar ul");
const navItems = document.getElementsByClassName("nav-item");
const sectionTitle = document.querySelector(".section-title h2");

let cart = JSON.parse(localStorage.getItem("cart")) || [];
let buttonsDOM = [];

class Product {
  async getProducts() {
    try {
      let data = await fetch("./products.json");
      let products = await data.json();
      return products.items;
    } catch (error) {
      console.log(error);
    }
  }
}

class UI {
  // I. set up UI
  setupUI() {
    // 1.1 add close nav logic
    closeNavBtn.addEventListener("click", this.closeNav);
    // 1.2 add open nav logic
    navIcon.addEventListener("click", this.showNav);
    // 1.3 add show cart logic
    cartBtn.addEventListener("click", this.showCart);
    //1.4 add close cart logic
    closeCartBtn.addEventListener("click", this.closeCart);
    // 1.5 get current cart
    // let cart = JSON.parse(localStorage.getItem("cart")) || [];
    // populate cart
    this.renderCart(cart);
    // set  cart value
    this.setCartValue(cart);
  }

  renderCart(cart) {
    cart.forEach(item => this.addItemToCart(item));
  }

  showNav() {
    verticalNav.style.transform = "translateX(0)";
  }

  closeNav() {
    verticalNav.style.transform = "translateX(-100%)";
  }

  showCart() {
    cartBg.style.visibility = "visible";
    cartDOM.style.transform = "translateX(0)";
  }
  
  closeCart() {
    cartBg.style.visibility = "hidden";
    cartDOM.style.transform = "translateX(100%)";
  }

  // II. Display products
  displayproducts(products) {
    let productUi = "";
    products.forEach(product => {
      productUi += `
        <article class="product">
          <div class="img-container">
            <img src=${product.image} alt="product" class="product-img">
            <button class="add-to-cart-btn" data-id=${product.id}>
              <i class="fas fa-shopping-cart"></i>
              add to cart
            </button>
          </div>
          <h3>${product.title}</h2>
          <h4>$ ${product.price}</h3>
        </article>
      `;
    });
    productCenter.innerHTML = productUi;
    this.addTocart();
  }

  // III add to cart button logic
  addTocart() {
    let addToCartBtns = [...document.querySelectorAll(".add-to-cart-btn")];
    buttonsDOM = addToCartBtns;
    addToCartBtns.forEach(btn => {
      let id = btn.dataset.id;
      let inCart = cart.find(item => { return item.id === id});
      if (inCart) {
        btn.innerText = "inCart";
        btn.disabled = true;
      } else {
        btn.addEventListener("click", () => {
          // change product UI
          btn.innerText = "inCart";
          btn.disabled = true;
          // get product from store and add to cart
          let cartItem = this.getProduct(id);
          cartItem = { ...cartItem, amount: 1};
          // save cart to localstorage
          cart = [...cart, cartItem];
          localStorage.setItem("cart", JSON.stringify(cart));
          // add to cart UI
          this.addItemToCart(cartItem);
          // set cart values
          this.setCartValue(cart);
          // show cart
          this.showCart();
        });
      }
    });
  }

  getProduct(id) {
    let products = JSON.parse(localStorage.getItem("products")) || [];
    let specProduct = products.filter(product => {return product.id === id});
    return specProduct[0];
  }

  addItemToCart(item) {
    let div = document.createElement("div");
    div.classList.add("cart-item");
    div.innerHTML = `<img src=${item.image} alt="item image" class="cart-item-img">
      <div class="cart-item-info" data-id=${item.id}>
        <h4 class="cart-item-title">${item.title}</h4>
        <p>$ ${item.price}</p>
        <p class="remove-item" data-id=${item.id}>remove</p>
      </div>
      <div class="item-amount">
        <i class="fas fa-chevron-up" data-id=${item.id}></i>
        <p>${item.amount}</p>
        <i class="fas fa-chevron-down" data-id=${item.id}></i>
      </div>
    `;
    cartContent.appendChild(div);
  }

  setCartValue(cart) {
    let total = 0, totalItem = 0;
    cart.map(item => {
      totalItem += item.amount;
      total += item.price * item.amount;
    });
    cartCount.innerText = totalItem;
    total = parseFloat(total.toFixed(2));
    cartTotal.innerText = `your total: $ ${total}`;
  }

  // IV Display navigation bar
  displayNavItem(products) {
    let styles = products.map(product => product.styleType);
    styles = Array.from(new Set(styles));
    let navItem = ""
    styles.forEach(style => {
      navItem += `<li class="nav-item"><a href="#products" class="nav-link">${style}</a></li>`;
    });
    navBar.innerHTML = navItem;
    verticalNavBar.innerHTML = navItem;
  }

  // V Add logic to navigation bar
  navBarLogic() {
    let navBarItems = [...navItems];
    navBarItems.forEach(navItem => navItem.addEventListener("click", event => {
      let style = event.target.innerText.toLowerCase();
      let products = JSON.parse(localStorage.getItem("products"));
      let productsFilter = products.filter(product => {return product.styleType === style});
      sectionTitle.innerText = style;
      this.displayproducts(productsFilter);
      this.closeNav();
    }));
  }

  // VI cart logic
  cartLogic() {
    // cart functionality
    cartContent.addEventListener("click", ev => {
      // removeItem
      if (ev.target.classList.contains("remove-item")) {
        // get clicked element
        let removeItem = ev.target;
        // get data id of clicked element
        let id = removeItem.dataset.id;
        cartContent.removeChild(removeItem.parentElement.parentElement);
        this.removeItem(id);
      }
      // adding amount of item
      if (ev.target.classList.contains("fa-chevron-up")) {
        // get clicked element
        let addAmount = ev.target;
        // get data id of clicked element
        let id = addAmount.dataset.id;
        // get selected item from cart
        let selectedItem = cart.find(item => item.id === id);
        selectedItem.amount += 1;
        this.setCartValue(cart);
        localStorage.setItem("cart", JSON.stringify(cart));
        addAmount.nextElementSibling.innerText = selectedItem.amount;
      }
      // subtracting amount of item
      if (ev.target.classList.contains("fa-chevron-down")) {
        // get clicked element
        let lowerAmount = ev.target;
        // get data id of clicked element
        let id = lowerAmount.dataset.id;
        // get tempitem from cart
        let selectedItem = cart.find(item => item.id === id);
        selectedItem.amount = selectedItem.amount - 1;
        if (selectedItem.amount > 0) {
          localStorage.setItem("cart", JSON.stringify(cart));
          this.setCartValue(cart);
          lowerAmount.previousElementSibling.innerText = selectedItem.amount;
        } else {
          cartContent.removeChild(lowerAmount.parentElement.parentElement);
          this.removeItem(id);
        }
      }
    });
    // clear cart
    // clear cart button
    clearCartBtn.addEventListener('click', () => {
      this.clearCart();
    });
  }

  clearCart() {
    let cartItems = cart.map(item => item.id);
    cartItems.forEach(id => this.removeItem(id));

    while (cartContent.children.length > 0) {
      cartContent.removeChild(cartContent.children[0]);
    }
    this.closeCart();
  }

  removeItem(id) {
    // remove item form cart
    cart = cart.filter(item => item.id !== id);
    // reset cart value
    this.setCartValue(cart);
    // save current cart
    localStorage.setItem("cart", JSON.stringify(cart));
    // manipulate add to cart button
    let button = this.getSingleButton(id);
    button.disabled = false;
    button.innerHTML = `<i class="fas fa-shopping-cart"></i>add to cart`;
    
  }

  getSingleButton(id) {
    return buttonsDOM.find(button => button.dataset.id === id);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const products = new Product();
  const ui = new UI();

  // let cart = [];
  // localStorage.setItem("cart", JSON.stringify(cart));
  ui.setupUI();
  products.getProducts()
    .then(products => {
      ui.displayproducts(products);
      ui.displayNavItem(products);
      localStorage.setItem("products", JSON.stringify(products)); 
    })
    .then(() => {
      ui.navBarLogic();
      ui.cartLogic();
    });
});