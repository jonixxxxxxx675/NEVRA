window.NEVRA_PRODUCTS = {
  'NEVRA-HOODIE-001': {
    id: 'NEVRA-HOODIE-001',
    name: 'NEVRA Essential Hoodie',
    price: 2900,
    images: ['assets/hoodie-1.jpg','assets/hoodie-2.jpg','assets/hoodie-3.jpg','assets/hoodie-4.jpg','assets/hoodie-6.jpg','assets/hoodie-7.jpg'],
    sizes: ['S','M','L','XL','XXL'],
    availability: true,
    quantity: null
  },
  'NEVRA-TRACKSUIT-001': {
    id: 'NEVRA-TRACKSUIT-001',
    name: 'NEVRA Tracksuit',
    price: 5900,
    images: ['assets/suit-3.png','assets/suit-4.png','assets/suit-5.png','assets/suit-6.png','assets/suit-7.png','assets/suit-8.png','assets/suit-9.png'],
    sizes: ['S','M','L','XL','XXL'],
    availability: true,
    quantity: null
  },
  'NEVRA-TSHIRT-BLK-001': { id:'NEVRA-TSHIRT-BLK-001', name:'Black T-shirt', price:1200, images:['assets/shirt-black.jpg'], sizes:['S','M','L','XL','XXL'], availability:true, quantity:null, color:'Black' },
  'NEVRA-TSHIRT-WHT-001': { id:'NEVRA-TSHIRT-WHT-001', name:'White T-shirt', price:1200, images:['assets/shirt-black.jpg'], sizes:['S','M','L','XL','XXL'], availability:true, quantity:null, color:'White' },
  'NEVRA-TSHIRT-GRY-001': { id:'NEVRA-TSHIRT-GRY-001', name:'Grey T-shirt', price:1200, images:['assets/shirt-black.jpg'], sizes:['S','M','L','XL','XXL'], availability:true, quantity:null, color:'Grey' },
  'NEVRA-TSHIRT-KHK-001': { id:'NEVRA-TSHIRT-KHK-001', name:'Khaki T-shirt', price:1200, images:['assets/shirt-khaki.jpg'], sizes:['S','M','L','XL','XXL'], availability:true, quantity:null, color:'Khaki' }
};

window.NEVRA_PRODUCT_API = {
  get(id) { return window.NEVRA_PRODUCTS[id] || null; },
  byColor(color) {
    const key = ({Black:'NEVRA-TSHIRT-BLK-001',White:'NEVRA-TSHIRT-WHT-001',Grey:'NEVRA-TSHIRT-GRY-001',Khaki:'NEVRA-TSHIRT-KHK-001'})[color];
    return this.get(key);
  },
  available(id, size) {
    const product = this.get(id);
    if (!product || !product.availability || !product.sizes.includes(size)) return false;
    const stock = product.inventory?.[size];
    return stock ? stock.available && stock.quantity > 0 : true;
  }
};
