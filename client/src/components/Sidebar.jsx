import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { Plus, Minus, Star, Sparkles } from 'lucide-react';

const accordionSections = [
  {
    title: 'Ethnic & Western Wear',
    icon: '/assets/images/icons/dress.svg',
    slug: 'clothes',
    items: [
      { name: 'Pure Cotton Shirts', count: 320, slug: 'shirt' },
      { name: 'Casual Shorts & Joggers', count: 140, slug: 'shorts' },
      { name: 'Winter Bomber Jackets', count: 85, slug: 'jacket' },
      { name: 'Kurta & Ethnic Wear', count: 180, slug: 'clothes' }
    ]
  },
  {
    title: 'Footwear & Shoes',
    icon: '/assets/images/icons/shoes.svg',
    slug: 'footwear',
    items: [
      { name: 'Running & Trekking Shoes', count: 95, slug: 'sports' },
      { name: 'Oxford Formal Leather', count: 110, slug: 'footwear' },
      { name: 'Party Wear Heels', count: 75, slug: 'party-wear' }
    ]
  },
  {
    title: 'Jewelry & Accessories',
    icon: '/assets/images/icons/jewelry.svg',
    slug: 'jewellery',
    items: [
      { name: 'Rose Gold Earrings', count: 86, slug: 'jewellery' },
      { name: 'Austrian CZ Pendants', count: 52, slug: 'jewellery' }
    ]
  },
  {
    title: 'Luxury Perfumes',
    icon: '/assets/images/icons/perfume.svg',
    slug: 'perfume',
    items: [
      { name: 'Royal Oudh & Amber Cologne', count: 34, slug: 'perfume' },
      { name: 'Daily Fresh Deodorants', count: 80, slug: 'perfume' }
    ]
  },
  {
    title: 'Ayurvedic & Cosmetics',
    icon: '/assets/images/icons/cosmetics.svg',
    slug: 'cosmetics',
    items: [
      { name: 'Argan Hair Spa Combos', count: 65, slug: 'cosmetics' },
      { name: 'Facewash & Glow Kits', count: 92, slug: 'cosmetics' }
    ]
  }
];

const bestSellers = [
  {
    id: 101,
    title: 'Baby Comfort Fabric Booties',
    price: 399.00,
    originalPrice: 599.00,
    image: '/assets/images/products/1.jpg'
  },
  {
    id: 102,
    title: "Men's Solid Hooded Sweatshirt",
    price: 899.00,
    originalPrice: 1499.00,
    image: '/assets/images/products/2.jpg'
  },
  {
    id: 103,
    title: "Girls Bio-Washed Graphic Tee",
    price: 349.00,
    originalPrice: 599.00,
    image: '/assets/images/products/3.jpg'
  },
  {
    id: 104,
    title: 'Thermal Woolen Beanie Cap',
    price: 499.00,
    originalPrice: 899.00,
    image: '/assets/images/products/4.jpg'
  }
];

export const Sidebar = () => {
  const { setSelectedCategory, selectedCategory, formatPrice } = useShop();
  const [openIndex, setOpenIndex] = useState(0);

  const toggleAccordion = (index) => {
    setOpenIndex(openIndex === index ? -1 : index);
  };

  return (
    <div className="sidebar has-scrollbar">
      {/* Category Accordion */}
      <div className="sidebar-category">
        <div className="sidebar-top">
          <h2 className="sidebar-title">Categories</h2>
          {selectedCategory !== 'all' && (
            <button
              className="reset-filter-btn"
              onClick={() => setSelectedCategory('all')}
              style={{ fontSize: '12px', color: 'var(--vibe-primary)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
            >
              Reset All
            </button>
          )}
        </div>

        <ul className="sidebar-menu-category-list">
          {accordionSections.map((sec, idx) => (
            <li className="sidebar-menu-category" key={idx}>
              <button
                className={`sidebar-accordion-menu ${openIndex === idx ? 'active' : ''}`}
                onClick={() => toggleAccordion(idx)}
              >
                <div className="menu-title-flex">
                  <img src={sec.icon} alt={sec.title} width="20" height="20" className="menu-title-img" />
                  <p className="menu-title">{sec.title}</p>
                </div>

                <div>
                  {openIndex === idx ? <Minus size={14} /> : <Plus size={14} />}
                </div>
              </button>

              <ul
                className={`sidebar-submenu-category-list ${openIndex === idx ? 'active' : ''}`}
                style={{ display: openIndex === idx ? 'block' : 'none' }}
              >
                {sec.items.map((sub, sIdx) => (
                  <li className="sidebar-submenu-category" key={sIdx}>
                    <a
                      href="#products-section"
                      className={`sidebar-submenu-title ${selectedCategory === sub.slug ? 'active' : ''}`}
                      onClick={() => setSelectedCategory(sub.slug)}
                    >
                      <p className="product-name">{sub.name}</p>
                      <data value={sub.count} className="stock">{sub.count}</data>
                    </a>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </div>

      {/* Best Sellers */}
      <div className="product-showcase">
        <h3 className="showcase-heading" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Sparkles size={16} color="var(--vibe-primary)" />
          Best Sellers
        </h3>

        <div className="showcase-wrapper">
          <div className="showcase-container">
            {bestSellers.map((item) => (
              <div className="showcase" key={item.id}>
                <a href="#products-section" className="showcase-img-box">
                  <img src={item.image} alt={item.title} width="75" height="75" className="showcase-img" />
                </a>

                <div className="showcase-content">
                  <a href="#products-section">
                    <h4 className="showcase-title">{item.title}</h4>
                  </a>

                  <div className="showcase-rating">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={12} fill="#ffb703" color="#ffb703" />
                    ))}
                  </div>

                  <div className="price-box">
                    <p className="price">{formatPrice(item.price)}</p>
                    <del>{formatPrice(item.originalPrice)}</del>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
