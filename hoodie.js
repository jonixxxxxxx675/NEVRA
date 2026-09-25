(() => {
  const $ = s => document.querySelector(s);
  const sizes = [...document.querySelectorAll('.hoodie-size')];
  const thumbs = [...document.querySelectorAll('.hoodie-thumb')];
  const cart = JSON.parse(localStorage.getItem('nevra-cart') || '[]');
  const product = { type:'hoodie', title:'NEVRA Essential Hoodie', price:2900, image:'./assets/hoodie-1.jpg' };
  let size = '';
  const money = v => '₴' + Number(v).toLocaleString('uk-UA');
  thumbs.forEach(t => t.addEventListener('click', () => { thumbs.forEach(x => x.classList.toggle('active', x === t)); $('#hoodie-main-image').src = t.dataset.image; }));
  sizes.forEach(b => b.addEventListener('click', () => { size=b.dataset.size; sizes.forEach(x=>x.setAttribute('aria-pressed',String(x===b))); $('#hoodie-message').textContent='Size '+size+' selected.'; }));
  function render(){ const count=cart.reduce((s,i)=>s+i.qty,0); $('#cart-count').textContent=count; localStorage.setItem('nevra-cart',JSON.stringify(cart)); }
  $('#hoodie-add').addEventListener('click',()=>{ if(!size){$('#hoodie-message').textContent='Please select a size first.';sizes[0].focus();return;} const existing=cart.find(i=>i.type==='hoodie'&&i.size===size); if(existing) existing.qty+=1; else cart.push({...product,size,qty:1}); render(); window.location.href='./checkout.html'; });
  $('#cart-open').addEventListener('click',()=>window.location.href='./checkout.html');
  render();
})();
