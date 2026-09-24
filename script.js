(() => {
  const $ = (selector) => document.querySelector(selector);
  const cards = [...document.querySelectorAll('.color-card')];
  const sizes = [...document.querySelectorAll('.size-option')];
  const cart = [];
  let color = 'Black';
  let filter = 'none';
  let size = '';

  const image = (value) => value === 'Khaki' ? './assets/shirt-khaki.jpg' : './assets/shirt-black.jpg';
  const money = (amount) => '₴' + amount.toLocaleString('uk-UA');

  function toast(message) {
    const element = $('#toast');
    element.textContent = message;
    element.classList.add('show');
    window.setTimeout(() => element.classList.remove('show'), 2100);
  }

  function pick(card) {
    color = card.dataset.color;
    filter = card.dataset.filter;
    cards.forEach((item) => item.classList.toggle('selected', item === card));
    $('#product-title').textContent = color + ' T-shirt';
    const productImage = $('#product-image');
    productImage.src = image(color);
    productImage.alt = color + ' NEVRA T-shirt';
    productImage.style.filter = filter === 'white' ? 'brightness(1.7) grayscale(1)'
      : filter === 'grey' ? 'grayscale(1) brightness(1.3)'
      : filter === 'khaki' ? 'sepia(.45) hue-rotate(25deg) saturate(.75)' : 'none';
    $('#selection-message').textContent = size ? 'Size ' + size + ' selected.' : 'Select a size to continue.';
  }

  cards.forEach((card) => card.addEventListener('click', () => {
    window.location.href = './product.html?color=' + encodeURIComponent(card.dataset.color);
  }));

  sizes.forEach((button) => button.addEventListener('click', () => {
    size = button.dataset.size;
    sizes.forEach((item) => item.setAttribute('aria-pressed', String(item === button)));
    $('#selection-message').textContent = 'Size ' + size + ' selected.';
  }));

  function renderCart() {
    const count = cart.reduce((total, item) => total + item.qty, 0);
    const sum = cart.reduce((total, item) => total + item.qty * 1200, 0);
    $('#cart-count').textContent = count;
    $('#cart-heading-count').textContent = '(' + count + ')';
    $('#cart-total').textContent = money(sum);
    $('#cart-items').innerHTML = cart.length
      ? cart.map((item, index) => `<article class="cart-item">
          <img src="${image(item.color)}" alt="${item.color} NEVRA T-shirt">
          <div><strong>${item.color} T-shirt</strong><small>Size ${item.size} · ${money(1200)} × ${item.qty}</small></div>
          <button class="remove-item" type="button" data-remove="${index}">Remove</button>
        </article>`).join('')
      : '<p class="empty-cart">Your cart is empty.</p>';

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

  $('#add-to-cart').addEventListener('click', () => {
    if (!size) {
      $('#selection-message').textContent = 'Please select a size first.';
      sizes[0].focus();
      return;
    }
    const existing = cart.find((item) => item.color === color && item.size === size);
    if (existing) existing.qty += 1;
    else cart.push({ color, size, qty: 1 });
    renderCart();
    toast(color + ' T-shirt added to cart.');
  });

  $('#cart-open').addEventListener('click', openCart);
  $('#cart-close').addEventListener('click', closeCart);
  $('#cart-backdrop').addEventListener('click', closeCart);
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && $('#cart-panel').classList.contains('is-open')) closeCart();
  });
  $('#checkout-button').addEventListener('click', () => toast(cart.length ? 'Checkout is not connected yet.' : 'Your cart is empty.'));
  renderCart();
})();
