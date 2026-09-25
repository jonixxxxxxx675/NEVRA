(() => {
  const $ = selector => document.querySelector(selector);
  const storageKey = 'nevra-cart';
  const cart = JSON.parse(localStorage.getItem(storageKey) || '[]');
  const thumbs = [...document.querySelectorAll('.hoodie-thumb')];
  const sizes = [...document.querySelectorAll('.hoodie-size')];
  const mainImage = $('#hoodie-main-image');
  let size = '';
  const price = 2900;

  function setMainImage(path, thumb) {
    const cleanPath = String(path || '').replace(/^\/*(?:\.\/)*assets\//i, 'assets/').toLowerCase();
    if (!cleanPath.startsWith('assets/')) return;
    mainImage.src = cleanPath;
    mainImage.alt = thumb?.querySelector('img')?.alt || 'NEVRA Essential Hoodie';
    thumbs.forEach(item => item.classList.toggle('active', item === thumb));
  }

  thumbs.forEach(thumb => {
    thumb.addEventListener('click', () => setMainImage(thumb.dataset.image, thumb));
  });

  mainImage.addEventListener('error', () => {
    if (mainImage.getAttribute('src') !== 'assets/hoodie-1.jpg') {
      mainImage.src = 'assets/hoodie-1.jpg';
    }
  });

  sizes.forEach(button => {
    button.addEventListener('click', () => {
      size = button.dataset.size;
      sizes.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
      $('#hoodie-message').textContent = 'Size ' + size + ' selected.';
    });
  });

  function render() {
    if ($('#cart-count')) $('#cart-count').textContent = cart.reduce((sum, item) => sum + item.qty, 0);
    localStorage.setItem(storageKey, JSON.stringify(cart));
  }

  $('#hoodie-add').addEventListener('click', () => {
    if (!size) {
      $('#hoodie-message').textContent = 'Please select a size first.';
      return;
    }
    const existing = cart.find(item => item.type === 'hoodie' && item.size === size);
    if (existing) existing.qty += 1;
    else cart.push({ type: 'hoodie', title: 'NEVRA Essential Hoodie', size, qty: 1, price });
    render();
    location.href = 'checkout.html';
  });

  $('#cart-open').addEventListener('click', () => { location.href = 'checkout.html'; });
  render();
})();
