(() => {
  const $ = (selector) => document.querySelector(selector);
  const colors = [...document.querySelectorAll('.product-color-option')];
  const sizes = [...document.querySelectorAll('.product-size-option')];
  const cart = [];
  const price = 1200;
  let color = 'Black';
  let size = '';
  let quantity = 1;

  const productImage = (value) => value === 'Khaki' ? './assets/shirt-khaki.jpg' : './assets/shirt-black.jpg';
  const money = (amount) => '₴' + amount.toLocaleString('uk-UA');
  function toast(message) {
    const element = $('#toast');
    element.textContent = message;
    element.classList.add('show');
    window.setTimeout(() => element.classList.remove('show'), 2100);
  }
  function setColor(value) {
    color = value;
    colors.forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.color === value)));
    $('#detail-title').textContent = value + ' T-shirt';
    $('#current-color').textContent = value;
    const img = $('#detail-image');
    img.src = productImage(value);
    img.alt = value + ' NEVRA logo T-shirt';
    img.style.filter = value === 'White' ? 'brightness(1.7) grayscale(1)' : value === 'Grey' ? 'grayscale(1) brightness(1.3)' : value === 'Khaki' ? 'sepia(.45) hue-rotate(25deg) saturate(.75)' : 'none';
  }
  colors.forEach((button) => button.addEventListener('click', () => setColor(button.dataset.color)));
  sizes.forEach((button) => button.addEventListener('click', () => {
    size = button.dataset.size;
    sizes.forEach((item) => item.setAttribute('aria-pressed', String(item === button)));
    $('#detail-message').textContent = 'Size ' + size + ' selected.';
  }));

  $('#quantity-minus').addEventListener('click', () => {
    quantity = Math.max(1, quantity - 1);
    $('#quantity-value').textContent = quantity;
  });
  $('#quantity-plus').addEventListener('click', () => {
    quantity = Math.min(99, quantity + 1);
    $('#quantity-value').textContent = quantity;
  });

  function renderCart() {
    const count = cart.reduce((sum, item) => sum + item.qty, 0);
    const subtotal = cart.reduce((sum, item) => sum + item.qty * price, 0);
    $('#cart-count').textContent = count;
    $('#cart-heading-count').textContent = '(' + count + ')';
    $('#cart-total').textContent = money(subtotal);
    $('#cart-items').innerHTML = cart.length ? cart.map((item, index) => `<article class="cart-item"><img src="${productImage(item.color)}" alt="${item.color} NEVRA T-shirt"><div><strong>${item.color} T-shirt</strong><small>Size ${item.size} · ${money(price)} × ${item.qty}</small></div><button class="remove-item" type="button" data-remove="${index}">Remove</button></article>`).join('') : '<p class="empty-cart">Your cart is empty.</p>';
    document.querySelectorAll('[data-remove]').forEach((button) => button.addEventListener('click', () => {
      cart.splice(Number(button.dataset.remove), 1);
      renderCart();
    }));
  }
  function openCart() {
    $('#cart-panel').classList.add('is-open');
    $('#cart-panel').setAttribute('aria-hidden', 'false');
    $('#cart-backdrop').hidden = false;
    document.body.classList.add('cart-open');
  }
  function closeCart() {
    $('#cart-panel').classList.remove('is-open');
    $('#cart-panel').setAttribute('aria-hidden', 'true');
    $('#cart-backdrop').hidden = true;
    document.body.classList.remove('cart-open');
  }
  $('#detail-add').addEventListener('click', () => {
    if (!size) {
      $('#detail-message').textContent = 'Please select a size first.';
      sizes[0].focus();
      return;
    }
    const existing = cart.find((item) => item.color === color && item.size === size);
    if (existing) existing.qty += quantity;
    else cart.push({ color, size, qty: quantity });
    renderCart();
    toast(color + ' T-shirt added to cart.');
    openCart();
  });
  $('#cart-open').addEventListener('click', openCart);
  $('#cart-close').addEventListener('click', closeCart);
  $('#cart-backdrop').addEventListener('click', closeCart);
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && $('#cart-panel').classList.contains('is-open')) closeCart();
  });
  $('#checkout-button').addEventListener('click', () => toast(cart.length ? 'Checkout is not connected yet.' : 'Your cart is empty.'));

  const params = new URLSearchParams(window.location.search);
  const initialColor = params.get('color');
  if (['Black', 'White', 'Grey', 'Khaki'].includes(initialColor)) setColor(initialColor);
  renderCart();
})();
