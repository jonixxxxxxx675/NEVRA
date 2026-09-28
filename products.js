/* NEVRA product catalog
 * Single source of truth for product data.
 * Backend/payment integration can replace this data layer later without changing the UI.
 */
(function () {
  const products = {
    'NEVRA-HOODIE-001': {
      id: 'NEVRA-HOODIE-001',
      name: 'NEVRA Essential Hoodie',
      price: 2900,
      images: [
        'assets/hoodie-1.jpg', 'assets/hoodie-2.jpg', 'assets/hoodie-3.jpg',
        'assets/hoodie-4.jpg', 'assets/hoodie-6.jpg', 'assets/hoodie-7.jpg'
      ],
      sizes: ['S', 'M', 'L', 'XL', 'XXL'],
      availability: true,
      quantity: null
    },
    'NEVRA-TRACKSUIT-001': {
      id: 'NEVRA-TRACKSUIT-001',
      name: 'NEVRA Tracksuit',
      price: 5900,
      images: [
        'assets/suit-3.png', 'assets/suit-4.png', 'assets/suit-5.png',
        'assets/suit-6.png', 'assets/suit-7.png', 'assets/suit-8.png', 'assets/suit-9.png'
      ],
      sizes: ['S', 'M', 'L', 'XL', 'XXL'],
      availability: true,
      quantity: null
    },
    'NEVRA-TSHIRT-BLK-001': {
      id: 'NEVRA-TSHIRT-BLK-001',
      name: 'Black T-shirt',
      price: 1200,
      images: ['assets/shirt-black.jpg'],
      sizes: ['S', 'M', 'L', 'XL', 'XXL'],
      availability: true,
      quantity: null,
      color: 'Black'
    },
    'NEVRA-TSHIRT-WHT-001': {
      id: 'NEVRA-TSHIRT-WHT-001',
      name: 'White T-shirt',
      price: 1200,
      images: ['assets/shirt-black.jpg'],
      sizes: ['S', 'M', 'L', 'XL', 'XXL'],
      availability: true,
      quantity: null,
      color: 'White'
    },
    'NEVRA-TSHIRT-GRY-001': {
      id: 'NEVRA-TSHIRT-GRY-001',
      name: 'Grey T-shirt',
      price: 1200,
      images: ['assets/shirt-black.jpg'],
      sizes: ['S', 'M', 'L', 'XL', 'XXL'],
      availability: true,
      quantity: null,
      color: 'Grey'
    },
    'NEVRA-TSHIRT-KHK-001': {
      id: 'NEVRA-TSHIRT-KHK-001',
      name: 'Khaki T-shirt',
      price: 1200,
      images: ['assets/shirt-khaki.jpg'],
      sizes: ['S', 'M', 'L', 'XL', 'XXL'],
      availability: true,
      quantity: null,
      color: 'Khaki'
    }
  };

  const colorIds = {
    Black: 'NEVRA-TSHIRT-BLK-001',
    White: 'NEVRA-TSHIRT-WHT-001',
    Grey: 'NEVRA-TSHIRT-GRY-001',
    Khaki: 'NEVRA-TSHIRT-KHK-001'
  };

  function get(id) {
    return products[id] || null;
  }

  function all() {
    return Object.values(products);
  }

  function byColor(color) {
    return get(colorIds[color]);
  }

  // quantity = total stock when supplied; null means stock is managed externally.
  function isAvailable(product, size) {
    if (!product || !product.availability) return false;
    if (size && !product.sizes.includes(size)) return false;

    if (product.inventory && size) {
      const stock = product.inventory[size];
      return Boolean(stock && stock.available && stock.quantity > 0);
    }

    if (typeof product.quantity === 'number') {
      return product.quantity > 0;
    }

    return true;
  }

  function stockFor(product, size) {
    if (!product) return null;
    if (product.inventory && size && product.inventory[size]) {
      return Number(product.inventory[size].quantity) || 0;
    }
    return typeof product.quantity === 'number' ? product.quantity : null;
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
      quantity: product.quantity == null ? null : Number(product.quantity),
      color: product.color || null
    };
  }

  window.NEVRA_PRODUCTS = products;
  window.NEVRA_PRODUCT_API = {
    get,
    all,
    byColor,
    available(id, size) {
      return isAvailable(get(id), size);
    },
    stock(id, size) {
      return stockFor(get(id), size);
    },
    normalize
  };
})();
