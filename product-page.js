(() => {
  const $ = selector => document.querySelector(selector);
  const colors = [...document.querySelectorAll('.product-color-option')];
  const sizes = [...document.querySelectorAll('.product-size-option')];
  const storageKey = 'nevra-cart';
  const cart = JSON.parse(localStorage.getItem(storageKey) || '[]');
  const price = 1200;
  let color = 'Black', size = '', quantity = 1;

  const image = value => value === 'Khaki' ? './assets/shirt-khaki.jpg' : './assets/shirt-black.jpg';
  const money = value => '₴' + Number(value).toLocaleString('uk-UA');

  function toast(message) {
    const el = $('#toast');
    if (!el) return;
    el.textContent = message; el.classList.add('show');
    window.setTimeout(() => el.classList.remove('show'), 2100);
  }

  function setColor(value) {
    color = value;
    colors.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.color === value)));
    $('#detail-title').textContent = value + ' T-shirt';
    $('#current-color').textContent = value;
    const img = $('#detail-image');
    img.src = image(value); img.alt = value + ' NEVRA T-shirt';
    img.style.filter = value === 'White' ? 'brightness(1.7) grayscale(1)'
      : value === 'Grey' ? 'grayscale(1) brightness(1.3)'
      : value === 'Khaki' ? 'sepia(.45) hue-rotate(25deg) saturate(.75)' : 'none';
  }

  colors.forEach(b => b.addEventListener('click', () => setColor(b.dataset.color)));
  sizes.forEach(b => b.addEventListener('click', () => {
    size = b.dataset.size;
    sizes.forEach(x => x.setAttribute('aria-pressed', String(x === b)));
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
    const total = cart.reduce((sum, item) => sum + item.qty * price, 0);
    $('#cart-count').textContent = count;
    $('#cart-heading-count').textContent = '(' + count + ')';
    $('#cart-total').textContent = money(total);
    $('#cart-items').innerHTML = cart.length ? cart.map((item, i) => `
      <article class="cart-item"><img src="${image(item.color)}" alt="${item.color} T-shirt">
      <div><strong>${item.color} T-shirt</strong><small>Size ${item.size} · ${money(price)} × ${item.qty}</small></div>
      <button class="remove-item" type="button" data-remove="${i}">Remove</button></article>`).join('') : '<p class="empty-cart">Your cart is empty.</p>';
    localStorage.setItem(storageKey, JSON.stringify(cart));
    document.querySelectorAll('[data-remove]').forEach(button => button.addEventListener('click', () => {
      cart.splice(Number(button.dataset.remove), 1); renderCart();
    }));
  }

  const openCart = () => {
    $('#cart-panel').classList.add('is-open'); $('#cart-panel').setAttribute('aria-hidden','false');
    $('#cart-backdrop').hidden = false; document.body.classList.add('cart-open');
  };
  const closeCart = () => {
    $('#cart-panel').classList.remove('is-open'); $('#cart-panel').setAttribute('aria-hidden','true');
    $('#cart-backdrop').hidden = true; document.body.classList.remove('cart-open');
  };

  $('#detail-add').addEventListener('click', () => {
    if (!size) { $('#detail-message').textContent = 'Please select a size first.'; sizes[0].focus(); return; }
    const existing = cart.find(item => item.color === color && item.size === size);
    if (existing) existing.qty += quantity; else cart.push({color, size, qty: quantity});
    renderCart(); toast(color + ' T-shirt added to cart.'); openCart();
  });

  $('#cart-open').addEventListener('click', openCart);
  $('#cart-close').addEventListener('click', closeCart);
  $('#cart-backdrop').addEventListener('click', closeCart);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeCart(); });
  $('#checkout-button').addEventListener('click', () => {
    if (!cart.length) { toast('Your cart is empty.'); return; }
    window.location.href = './checkout.html';
  });

  const colorParam = new URLSearchParams(window.location.search).get('color');
  if (['Black','White','Grey','Khaki'].includes(colorParam)) setColor(colorParam);
  renderCart();
})();