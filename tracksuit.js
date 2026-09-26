(() => {
  const $ = selector => document.querySelector(selector);
  const storageKey = 'nevra-cart';
  const cart = JSON.parse(localStorage.getItem(storageKey) || '[]');
  const thumbs = [...document.querySelectorAll('.hoodie-thumb')];
  const sizes = [...document.querySelectorAll('.hoodie-size')];
  const mainImage = $('#hoodie-main-image');
  let size = '';
  const price = 5900;

  function setMainImage(path, thumb) {
    const cleanPath = String(path || '').replace(/^\/*(?:\.\/)*assets\//i, 'assets/');
    if (!cleanPath.toLowerCase().startsWith('assets/suit-')) return;
    mainImage.src = cleanPath;
    mainImage.alt = thumb?.querySelector('img')?.alt || 'NEVRA Tracksuit';
    thumbs.forEach(item => item.classList.toggle('active', item === thumb));
  }

  thumbs.forEach(thumb => thumb.addEventListener('click', () => setMainImage(thumb.dataset.image, thumb)));

  sizes.forEach(button => button.addEventListener('click', () => {
    size = button.dataset.size;
    sizes.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    $('#hoodie-message').textContent = 'Size ' + size + ' selected.';
  }));

  function render() {
    if ($('#cart-count')) $('#cart-count').textContent = cart.reduce((sum, item) => sum + item.qty, 0);
    localStorage.setItem(storageKey, JSON.stringify(cart));
  }

  $('#hoodie-add').addEventListener('click', () => {
    if (!size) {
      $('#hoodie-message').textContent = 'Please select a size first.';
      return;
    }
    const existing = cart.find(item => item.type === 'tracksuit' && item.size === size);
    if (existing) existing.qty += 1;
    else cart.push({ type: 'tracksuit', title: 'NEVRA Tracksuit', size, qty: 1, price });
    render();
    location.href = 'checkout.html';
  });

  $('#cart-open').addEventListener('click', () => { location.href = 'checkout.html'; });
  render();
})();