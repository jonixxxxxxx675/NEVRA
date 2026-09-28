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


  const money = value => '₴' + Number(value || 0).toLocaleString('uk-UA');
  function renderCartDrawer(){
    const count = cart.reduce((sum,item)=>sum + Number(item.qty || 0),0);
    const total = cart.reduce((sum,item)=>sum + Number(item.qty || 0) * Number(item.price || 0),0);
    const countEl = document.querySelector('#cart-count');
    const headingEl = document.querySelector('#cart-heading-count');
    const totalEl = document.querySelector('#cart-total');
    const itemsEl = document.querySelector('#cart-items');
    if(countEl) countEl.textContent = count;
    if(headingEl) headingEl.textContent = '(' + count + ')';
    if(totalEl) totalEl.textContent = money(total);
    if(itemsEl){
      itemsEl.innerHTML = cart.length ? cart.map((item,index)=>`
        <article class="cart-item">
          <img src="${item.image || ''}" alt="">
          <div class="cart-item-info">
            <strong>${item.title || ''}</strong>
            <span>${item.size ? 'Size ' + item.size + ' · ' : ''}${item.qty || 1} × ${money(item.price)}</span>
          </div>
          <button class="cart-remove" type="button" data-remove="${index}" aria-label="Remove item">×</button>
        </article>`).join('') : '<p class="empty-cart">Your cart is empty.</p>';
      itemsEl.querySelectorAll('[data-remove]').forEach(btn=>{
        btn.addEventListener('click',()=>{
          cart.splice(Number(btn.dataset.remove),1);
          localStorage.setItem(storageKey, JSON.stringify(cart));
          renderCartDrawer();
        });
      });
    }
  }
  function openCart(){
    renderCartDrawer();
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
  $('#cart-close').addEventListener('click', closeCart);
  $('#cart-backdrop').addEventListener('click', closeCart);
  $('#checkout-button').addEventListener('click', () => {
    if (!cart.length) return;
    window.location.href = './checkout.html';
  });
  renderCartDrawer();
  render();
})();
