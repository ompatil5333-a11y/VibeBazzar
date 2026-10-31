import React from 'react';

const blogPosts = [
  {
    id: 1,
    title: 'Top 10 Indian Festive Fashion Trends to Rock This Season',
    category: 'Fashion',
    author: 'Vibe Style Team',
    date: 'Oct 24, 2026',
    image: '/assets/images/blog-1.jpg'
  },
  {
    id: 2,
    title: 'How to Choose the Perfect Smartwatch for Daily Fitness & Calling',
    category: 'Tech',
    author: 'Aman Verma',
    date: 'Oct 18, 2026',
    image: '/assets/images/blog-2.jpg'
  },
  {
    id: 3,
    title: 'Essential Leather Shoe Care Tips to Make Footwear Last Years',
    category: 'Footwear',
    author: 'Rohan Kapoor',
    date: 'Oct 10, 2026',
    image: '/assets/images/blog-3.jpg'
  },
  {
    id: 4,
    title: 'Ayurvedic Skincare vs Chemical Products: The Ultimate Guide',
    category: 'Beauty',
    author: 'Dr. Nivedita Sen',
    date: 'Oct 02, 2026',
    image: '/assets/images/blog-4.jpg'
  }
];

export const Blog = () => {
  return (
    <div className="blog" id="blog-section">
      <div className="container">
        <h2 className="title" style={{ marginBottom: 20 }}>Vibe Trends &amp; Guides</h2>
        <div className="blog-container has-scrollbar">
          {blogPosts.map((blog) => (
            <div className="blog-card" key={blog.id}>
              <a href="#blog-section">
                <img
                  src={blog.image}
                  alt={blog.title}
                  width="300"
                  className="blog-banner"
                />
              </a>

              <div className="blog-content">
                <span className="blog-category">
                  {blog.category}
                </span>

                <h3 className="blog-title">{blog.title}</h3>

                <p className="blog-meta">
                  By <cite>{blog.author}</cite> / <time dateTime={blog.date}>{blog.date}</time>
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
