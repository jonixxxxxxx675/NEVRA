/* NEVRA product catalog
 * Single source of truth for product data.
 * Product fields: ID, name, price, photos, sizes, availability, quantity.
 * inventory is the per-size quantity used by the storefront.
 */
(function () {
  const sizes = ['S', 'M', 'L', 'XL', 'XXL'];
  const stock = (quantity = 10) => Object.fromEntries(sizes.map(size => [size, quantity]));

  const products = {
    'NEVRA-HOODIE-001': {
      id: 'NEVRA-HOODIE-001',
      name: 'NEVRA Essential Hoodie',
      price: 2900,
      images: ['assets/hoodie-1.jpg', 'assets/hoodie-2.jpg', 'assets/hoodie-3.jpg', 'assets/hoodie-4.jpg', 'assets/hoodie-6.jpg', 'assets/hoodie-7.jpg'],
      sizes,
      availability: true,
      quantity: 50,
      inventory: stock(10)
    },
    'NEVRA-TRACKSUIT-001': {
      id: 'NEVRA-TRACKSUIT-001',
      name: 'NEVRA Tracksuit',
      price: 5900,
      images: ['assets/suit-3.png', 'assets/suit-4.png', 'assets/suit-5.png', 'assets/suit-6.png', 'assets/suit-7.png', 'assets/suit-8.png', 'assets/suit-9.png'],
      sizes,
      availability: true,
      quantity: 50,
      inventory: stock(10)
    },
    'NEVRA-TSHIRT-BLK-001': {
      id: 'NEVRA-TSHIRT-BLK-001',
      name: 'Black T-shirt',
      price: 1200,
      images: ['assets/shirt-black.jpg'],
      sizes,
      availability: true,
      quantity: 50,
      inventory: stock(10),
      color: 'Black'
    },
    'NEVRA-TSHIRT-WHT-001': {
      id: 'NEVRA-TSHIRT-WHT-001',
      name: 'White T-shirt',
      price: 1200,
      images: ['assets/shirt-black.jpg'],
      sizes,
      availability: true,
      quantity: 50,
      inventory: stock(10),
      color: 'White'
    },
    'NEVRA-TSHIRT-GRY-001': {
      id: 'NEVRA-TSHIRT-GRY-001',
      name: 'Grey T-shirt',
      price: 1200,
      images: ['assets/shirt-black.jpg'],
      sizes,
      availability: true,
      quantity: 50,
      inventory: stock(10),
      color: 'Grey'
    },
    'NEVRA-TSHIRT-KHK-001': {
      id: 'NEVRA-TSHIRT-KHK-001',
      name: 'Khaki T-shirt',
      price: 1200,
      images: ['assets/shirt-khaki.jpg'],
      sizes,
      availability: true,
      quantity: 50,
      inventory: stock(10),
      color: 'Khaki'
    }
  };

  const colorIds = {
    Black: 'NEVRA-TSHIRT-BLK-001',
    White: 'NEVRA-TSHIRT-WHT-001',
    Grey: 'NEVRA-TSHIRT-GRY-001',
    Khaki: 'NEVRA-TSHIRT-KHK-001'
  };

  function get(id) { return products[id] || null; }
  function all() { return Object.values(products); }
  function byColor(color) { return get(colorIds[color]); }

  function stockFor(product, size) {
    if (!product) return 0;
    if (product.inventory && size && Object.prototype.hasOwnProperty.call(product.inventory, size)) {
      return Math.max(0, Number(product.inventory[size]) || 0);
    }
    return Math.max(0, Number(product.quantity) || 0);
  }

  function totalStock(product) {
    if (!product) return 0;
    if (product.inventory) return Object.values(product.inventory).reduce((sum, value) => sum + Math.max(0, Number(value) || 0), 0);
    return Math.max(0, Number(product.quantity) || 0);
  }

  function isAvailable(product, size) {
    if (!product || !product.availability) return false;
    if (size && !product.sizes.includes(size)) return false;
    return size ? stockFor(product, size) > 0 : totalStock(product) > 0;
  }

  function normalize(product) {
    if (!product) return null;
    return {
      id: product.id,
      name: product.name,
      price: Number(product.price) || 0,
      images: Array.isArray(product.images) ? product.images.slice() : [],
      sizes: Array.isArray(product.sizes) ? product.sizes.slice() : [],
      availability: Boolean(product.availability),
      quantity: totalStock(product),
      inventory: product.inventory ? { ...product.inventory } : {},
      color: product.color || null
    };
  }

  window.NEVRA_PRODUCTS = products;
  window.NEVRA_PRODUCT_API = {
    get,
    all,
    byColor,
    available(id, size) { return isAvailable(get(id), size); },
    stock(id, size) { return stockFor(get(id), size); },
    totalStock(id) { return totalStock(get(id)); },
    normalize
  };
})();
