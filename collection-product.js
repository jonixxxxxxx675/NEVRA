(() => {
  const $ = selector => document.querySelector(selector);
  const productId = document.body.dataset.productId;
  const product = window.NEVRA_PRODUCT_API.get(productId);
  const storageKey = 'nevra-cart';
  const cart = JSON.parse(localStorage.getItem(storageKey) || '[]');
  const thumbs = [...document.querySelectorAll('.hoodie-thumb')];
  const sizes = [...document.querySelectorAll('.hoodie-size')];
  const mainImage = $('#hoodie-main-image');
  let size = '';

  const money = value => '₴' + Number(value || 0).toLocaleString('uk-UA');
  const cartQtyForSize = selectedSize => cart.filter(item => item.productId === product.id && item.size === selectedSize).reduce((sum, item) => sum + Number(item.qty || 0), 0);
  const availableForSize = selectedSize => Math.max(0, window.NEVRA_PRODUCT_API.stock(product.id, selectedSize) - cartQtyForSize(selectedSize));

  const setMainImage = (path, thumb) => {
    mainImage.src = path;
    mainImage.alt = product.name;
    thumbs.forEach(item => item.classList.toggle('active', item === thumb));
  };

  thumbs.forEach(thumb => thumb.addEventListener('click', () => setMainImage(thumb.dataset.image, thumb)));

  sizes.forEach(button => button.addEventListener('click', () => {
    if (button.disabled) return;
    size = button.dataset.size;
    sizes.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    $('#hoodie-message').textContent = 'Size ' + size + ' selected. ' + availableForSize(size) + ' available.';
  }));

  const renderSizes = () => sizes.forEach(button => {
    const available = availableForSize(button.dataset.size) > 0;
    button.disabled = !available;
    button.setAttribute('aria-pressed', String(button.dataset.size === size));
  });

  const renderCartDrawer = () => {
    const count = cart.reduce((sum, item) => sum + Number(item.qty || 0), 0);
    const total = cart.reduce((sum, item) => sum + Number(item.qty || 0) * Number(item.price || 0), 0);
    $('#cart-count').textContent = count;
    $('#cart-heading-count').textContent = '(' + count + ')';
    $('#cart-total').textContent = money(total);
    $('#cart-items').innerHTML = cart.length ? cart.map((item, index) => `
      <article class="cart-item"><img src="${item.image || ''}" alt=""><div class="cart-item-info"><strong>${item.title || ''}</strong><span>${item.size ? 'Size ' + item.size + ' · ' : ''}${item.qty || 1} × ${money(item.price)}</span></div><button class="cart-remove" type="button" data-remove="${index}" aria-label="Remove item">×</button></article>`).join('') : '<p class="empty-cart">Your cart is empty.</p>';
    document.querySelectorAll('[data-remove]').forEach(button => button.addEventListener('click', () => {
      cart.splice(Number(button.dataset.remove), 1);
      localStorage.setItem(storageKey, JSON.stringify(cart));
      renderCartDrawer();
      renderSizes();
    }));
    localStorage.setItem(storageKey, JSON.stringify(cart));
  };

  const openCart = () => {
    renderCartDrawer();
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

  $('#hoodie-add').addEventListener('click', () => {
    if (!size) { $('#hoodie-message').textContent = 'Please select a size first.'; return; }
    if (availableForSize(size) <= 0) { $('#hoodie-message').textContent = 'This size is currently unavailable.'; renderSizes(); return; }
    const existing = cart.find(item => item.productId === product.id && item.size === size);
    if (existing) existing.qty += 1;
    else cart.push({ productId: product.id, title: product.name, size, qty: 1, price: product.price, image: product.images[0] });
    renderCartDrawer();
    openCart();
  });

  $('#cart-open').addEventListener('click', event => { event.preventDefault(); openCart(); });
  $('#cart-close').addEventListener('click', closeCart);
  $('#cart-backdrop').addEventListener('click', closeCart);
  $('#checkout-button').addEventListener('click', () => { if (cart.length) window.location.href = './checkout.html'; });

  document.querySelector('.hoodie-price').textContent = money(product.price);
  document.querySelector('.hoodie-product-id').textContent = 'ID — ' + product.id;
  document.querySelector('.hoodie-main-image img').src = product.images[0];
  renderSizes();
  renderCartDrawer();
})();
