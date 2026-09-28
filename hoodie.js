(() => {
  const $ = selector => document.querySelector(selector);
  const product = window.NEVRA_PRODUCT_API.get('NEVRA-HOODIE-001');
  const storageKey = 'nevra-cart';
  const cart = JSON.parse(localStorage.getItem(storageKey) || '[]');
  const thumbs = [...document.querySelectorAll('.hoodie-thumb')];
  const sizes = [...document.querySelectorAll('.hoodie-size')];
  const mainImage = $('#hoodie-main-image');
  let size = '';

  const cartQtyForSize = selectedSize => cart
    .filter(item => item.productId === product.id && item.size === selectedSize)
    .reduce((sum, item) => sum + Number(item.qty || 0), 0);

  const availableForSize = selectedSize => Math.max(0, window.NEVRA_PRODUCT_API.stock(product.id, selectedSize) - cartQtyForSize(selectedSize));

  const setMainImage = (path, thumb) => {
    const cleanPath = String(path || '').replace(/^\/*(?:\.\/)*assets\//i, 'assets/');
    if (!cleanPath.startsWith('assets/')) return;
    mainImage.src = cleanPath;
    mainImage.alt = thumb?.querySelector('img')?.alt || product.name;
    thumbs.forEach(item => item.classList.toggle('active', item === thumb));
  };

  thumbs.forEach(thumb => thumb.addEventListener('click', () => setMainImage(thumb.dataset.image, thumb)));

  function renderSizes() {
    sizes.forEach(button => {
      const available = availableForSize(button.dataset.size) > 0;
      button.disabled = !available;
      button.setAttribute('aria-pressed', String(button.dataset.size === size));
    });
  }

  sizes.forEach(button => button.addEventListener('click', () => {
    if (button.disabled) return;
    size = button.dataset.size;
    sizes.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    $('#hoodie-message').textContent = 'Size ' + size + ' selected. ' + availableForSize(size) + ' available.';
  }));

  function render() {
    if ($('#cart-count')) $('#cart-count').textContent = cart.reduce((sum, item) => sum + Number(item.qty || 0), 0);
    localStorage.setItem(storageKey, JSON.stringify(cart));
    renderSizes();
  }

  $('#hoodie-add').addEventListener('click', () => {
    if (!size) { $('#hoodie-message').textContent = 'Please select a size first.'; return; }
    if (!product.availability || availableForSize(size) <= 0) {
      $('#hoodie-message').textContent = 'This size is currently unavailable.';
      renderSizes();
      return;
    }
    const existing = cart.find(item => item.productId === product.id && item.size === size);
    if (existing) existing.qty += 1;
    else cart.push({ productId: product.id, title: product.name, size, qty: 1, price: product.price, image: product.images[0] });
    render();
    openCart();
  });

  function openCart(){
    const panel = document.querySelector('#cart-panel');
    const backdrop = document.querySelector('#cart-backdrop');
    if(panel){ panel.classList.add('is-open'); panel.setAttribute('aria-hidden','false'); }
    if(backdrop){ backdrop.hidden = false; }
    document.body.classList.add('cart-open');
  }
  function closeCart(){
    const panel = document.querySelector('#cart-panel');
    const backdrop = document.querySelector('#cart-backdrop');
    if(panel){ panel.classList.remove('is-open'); panel.setAttribute('aria-hidden','true'); }
    if(backdrop){ backdrop.hidden = true; }
    document.body.classList.remove('cart-open');
  }
  $('#cart-open').addEventListener('click', (e) => { e.preventDefault(); openCart(); });
  render();
})();
