import React, { useState, useEffect } from 'react';
import { useShop } from '../context/ShopContext';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

const bannerData = [
  {
    id: 1,
    subtitle: 'Great Indian Festive Sale',
    title: "Women's & Men's Latest Trends",
    price: '₹499',
    image: '/assets/images/banner-1.jpg'
  },
  {
    id: 2,
    subtitle: 'Vibe Premium Premiere',
    title: 'Designer Sunglasses & Smartwatches',
    price: '₹799',
    image: '/assets/images/banner-2.jpg'
  },
  {
    id: 3,
    subtitle: 'Flash Value Dhamaka',
    title: 'Casual Streetwear & Footwear',
    price: '₹349',
    image: '/assets/images/banner-3.jpg'
  }
];

export const Banner = () => {
  const { setActivePage } = useShop();
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % bannerData.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % bannerData.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + bannerData.length) % bannerData.length);

  return (
    <div className="banner">
      <div className="container">
        <div className="slider-container has-scrollbar">
          {bannerData.map((item, index) => (
            <div
              key={item.id}
              className={`slider-item ${index === currentSlide ? 'active' : ''}`}
              style={{ display: index === currentSlide ? 'block' : 'none' }}
            >
              <img
                src={item.image}
                alt={item.title}
                className="banner-img"
              />

              <div className="banner-content">
                <p className="banner-subtitle">
                  <Sparkles size={14} style={{ display: 'inline', marginRight: 4 }} />
                  {item.subtitle}
                </p>
                <h2 className="banner-title">{item.title}</h2>
                <p className="banner-text">
                  starting from <b>{item.price}</b>
                </p>
                <button
                  onClick={() => {
                    const el = document.getElementById('products-section');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="banner-btn"
                >
                  Shop Now
                </button>
              </div>
            </div>
          ))}

          <div className="banner-nav">
            <button className="banner-nav-btn prev" onClick={prevSlide} aria-label="Previous Banner">
              <ChevronLeft size={20} />
            </button>
            <button className="banner-nav-btn next" onClick={nextSlide} aria-label="Next Banner">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
