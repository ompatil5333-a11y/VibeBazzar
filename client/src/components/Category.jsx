import React from 'react';
import { useShop } from '../context/ShopContext';

const categoryItems = [
  { name: 'Dress & frock', slug: 'clothes', icon: '/assets/images/icons/dress.svg', count: '53' },
  { name: 'Winter wear', slug: 'jacket', icon: '/assets/images/icons/coat.svg', count: '58' },
  { name: 'Glasses & lens', slug: 'glasses', icon: '/assets/images/icons/glasses.svg', count: '68' },
  { name: 'Shorts & jeans', slug: 'shorts', icon: '/assets/images/icons/shorts.svg', count: '84' },
  { name: 'T-shirts', slug: 'shirt', icon: '/assets/images/icons/tee.svg', count: '35' },
  { name: 'Jacket', slug: 'jacket', icon: '/assets/images/icons/jacket.svg', count: '16' },
  { name: 'Watch', slug: 'watches', icon: '/assets/images/icons/watch.svg', count: '27' },
  { name: 'Hat & caps', slug: 'hat', icon: '/assets/images/icons/hat.svg', count: '39' }
];

export const Category = () => {
  const { setSelectedCategory, selectedCategory } = useShop();

  return (
    <div className="category">
      <div className="container">
        <div className="category-item-container has-scrollbar">
          {categoryItems.map((cat, idx) => (
            <div
              key={idx}
              className={`category-item ${selectedCategory === cat.slug ? 'selected-category' : ''}`}
              onClick={() => {
                setSelectedCategory(selectedCategory === cat.slug ? 'all' : cat.slug);
                const el = document.getElementById('products-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              style={{ cursor: 'pointer' }}
            >
              <div className="category-img-box">
                <img src={cat.icon} alt={cat.name} width="30" />
              </div>

              <div className="category-content-box">
                <div className="category-content-flex">
                  <h3 className="category-item-title">{cat.name}</h3>
                  <p className="category-item-amount">({cat.count})</p>
                </div>

                <span className="category-btn">Show all</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
