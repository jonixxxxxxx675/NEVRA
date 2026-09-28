(() => {
  const $ = selector => document.querySelector(selector);
  const storageKey = 'nevra-cart';
  const colors = [...document.querySelectorAll('.product-color-option')];
  const sizes = [...document.querySelectorAll('.product-size-option')];
  const cart = JSON.parse(localStorage.getItem(storageKey) || '[]');
  let color = 'Black';
  let size = '';
  let quantity = 1;

  const money = value => '₴' + Number(value || 0).toLocaleString('uk-UA');
  const product = () => window.NEVRA_PRODUCT_API.byColor(color);

  function toast(message) {
    const el = $('#toast');
    if (!el) return;
    el.textContent = message;
    el.classList.add('show');
    window.setTimeout(() => el.classList.remove('show'), 2100);
  }

  function setProductImage(img, path, alt) {
    const cleanPath = String(path || '').replace(/^\.?\/?/, '');
    img.src = cleanPath || 'assets/shirt-black.jpg';
    img.alt = alt || '';
  }

  function cartQuantity(p, selectedSize) {
    return cart
      .filter(item => item.productId === p.id && item.size === selectedSize)
      .reduce((sum, item) => sum + Number(item.qty || 0), 0);
  }

  function maxPurchaseQuantity(p) {
    if (!size) return 0;
    const stock = window.NEVRA_PRODUCT_API.stock(p.id, size);
    return Math.max(0, stock - cartQuantity(p, size));
  }

  function syncQuantity() {
    const max = maxPurchaseQuantity(product());
    quantity = max > 0 ? Math.min(quantity, max) : 0;
    $('#quantity-value').textContent = quantity;
    $('#quantity-minus').disabled = quantity <= 1;
    $('#quantity-plus').disabled = max <= quantity;
    $('#detail-add').disabled = !size || max <= 0;
  }

  function renderSizes(p) {
    const availableSizes = Array.isArray(p.sizes) ? p.sizes : [];
    const holder = $('.product-size-options');
    if (!holder) return;

    holder.innerHTML = availableSizes.map(itemSize => {
      const available = window.NEVRA_PRODUCT_API.available(p.id, itemSize) && (window.NEVRA_PRODUCT_API.stock(p.id, itemSize) - cartQuantity(p, itemSize) > 0);
      const selected = itemSize === size;
      return `<button class="product-size-option" type="button" data-size="${itemSize}" aria-pressed="${selected}"${available ? '' : ' disabled'}>${itemSize}</button>`;
    }).join('');

    holder.querySelectorAll('.product-size-option').forEach(button => {
      button.addEventListener('click', () => {
        size = button.dataset.size;
        quantity = 1;
        holder.querySelectorAll('.product-size-option').forEach(item => {
          item.setAttribute('aria-pressed', String(item === button));
        });
        const available = maxPurchaseQuantity(p);
        $('#detail-message').textContent = available > 0 ? 'Size ' + size + ' selected. ' + available + ' available.' : 'This size is currently unavailable.';
        syncQuantity();
      });
    });
  }

  function setColor(value) {
    color = value;
    size = '';
    quantity = 1;

    const p = product();
    colors.forEach(button => {
      button.setAttribute('aria-pressed', String(button.dataset.color === value));
    });

    $('#detail-title').textContent = p.name;
    $('#current-color').textContent = value;
    if ($('#product-id')) $('#product-id').textContent = 'ID — ' + p.id;

    const price = $('.product-detail-price');
    if (price) price.textContent = money(p.price);

    const img = $('#detail-image');
    setProductImage(img, p.images[0], p.name);
    img.onerror = () => {
      img.onerror = null;
      img.src = 'assets/shirt-black.jpg';
    };

    img.style.filter = value === 'White'
      ? 'brightness(1.7) grayscale(1)'
      : value === 'Grey'
        ? 'grayscale(1) brightness(1.3)'
        : value === 'Khaki'
          ? 'sepia(.45) hue-rotate(25deg) saturate(.75)'
          : 'none';

    renderSizes(p);
    $('#detail-message').textContent = 'Select a size to continue.';
    syncQuantity();
  }

  function renderCart() {
    const count = cart.reduce((sum, item) => sum + Number(item.qty || 0), 0);
    const total = cart.reduce((sum, item) => sum + Number(item.qty || 0) * Number(item.price || 0), 0);

    $('#cart-count').textContent = count;
    $('#cart-heading-count').textContent = '(' + count + ')';
    $('#cart-total').textContent = money(total);

    $('#cart-items').innerHTML = cart.length
      ? cart.map((item, index) => `
          <article class="cart-item">
            <img src="${item.image || 'assets/shirt-black.jpg'}" alt="${item.title || ''}">
            <div>
              <strong>${item.title || ''}</strong>
              <small>Size ${item.size} · ${money(item.price)} × ${item.qty}</small>
            </div>
            <button class="remove-item" type="button" data-remove="${index}">Remove</button>
          </article>
        `).join('')
      : '<p class="empty-cart">Your cart is empty.</p>';

    localStorage.setItem(storageKey, JSON.stringify(cart));

    document.querySelectorAll('[data-remove]').forEach(button => {
      button.addEventListener('click', () => {
        cart.splice(Number(button.dataset.remove), 1);
        renderCart();
      });
    });
  }

  const openCart = () => {
    $('#cart-panel').classList.add('is-open');
    $('#cart-panel').setAttribute('aria-hidden', 'false');
    $('#cart-backdrop').hidden = false;
    document.body.classList.add('cart-open');
  };

  const closeCart = () => {
    $('#cart-panel').classList.remove('is-open');
    $('#cart-panel').setAttribute('aria-hidden', 'true');
    $('#cart-backdrop').hidden = true;
    document.body.classList.remove('cart-open');
  };

  colors.forEach(button => button.addEventListener('click', () => setColor(button.dataset.color)));

  $('#quantity-minus').addEventListener('click', () => {
    quantity = Math.max(1, quantity - 1);
    syncQuantity();
  });

  $('#quantity-plus').addEventListener('click', () => {
    const max = maxPurchaseQuantity(product());
    if (max <= 0 || quantity >= max) return;
    quantity += 1;
    syncQuantity();
  });

  $('#detail-add').addEventListener('click', () => {
    if (!size) {
      $('#detail-message').textContent = 'Please select a size first.';
      const firstAvailable = document.querySelector('.product-size-option:not([disabled])');
      if (firstAvailable) firstAvailable.focus();
      return;
    }

    const p = product();
    const max = maxPurchaseQuantity(p);
    if (!window.NEVRA_PRODUCT_API.available(p.id, size) || max <= 0 || quantity <= 0) {
      $('#detail-message').textContent = 'This size is currently unavailable.';
      return;
    }

    const existing = cart.find(item => item.productId === p.id && item.size === size);
    const nextQuantity = (existing ? Number(existing.qty) : 0) + quantity;

    if (nextQuantity > window.NEVRA_PRODUCT_API.stock(p.id, size)) {
      $('#detail-message').textContent = 'Not enough stock for this size.';
      return;
    }

    if (existing) {
      existing.qty = nextQuantity;
    } else {
      cart.push({
        productId: p.id,
        title: p.name,
        size,
        qty: quantity,
        price: p.price,
        image: p.images[0],
        color
      });
    }

    renderCart();
    toast(p.name + ' added to cart.');
    openCart();
  });

  $('#cart-open').addEventListener('click', (e) => { e.preventDefault(); openCart(); });
  $('#cart-close').addEventListener('click', closeCart);
  $('#cart-backdrop').addEventListener('click', closeCart);
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeCart();
  });

  $('#checkout-button').addEventListener('click', () => {
    if (!cart.length) {
      toast('Your cart is empty.');
      return;
    }
    window.location.href = './checkout.html';
  });

  const colorParam = new URLSearchParams(window.location.search).get('color');
  setColor(['Black', 'White', 'Grey', 'Khaki'].includes(colorParam) ? colorParam : 'Black');
  renderCart();
})();
