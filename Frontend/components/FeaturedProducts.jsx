"use client";

import React, { useState, useEffect, useCallback } from 'react';
import './FeaturedProducts.css';
import Link from 'next/link';
import Reveal from './Reveal';
import { formatCurrency } from '@/lib/utils';

function StarIcon() {
  return (
    <svg viewBox="0 0 24 24" className="star-icon" fill="currentColor">
      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
    </svg>
  );
}

function SkeletonCard({ position }) {
  return (
    <div className={`carousel-card ${position}`}>
      <div className="card-image-wrapper" style={{ background: 'linear-gradient(135deg, #f0ece6 0%, #e8e2d8 100%)', animation: 'pulse-glow 2s ease-in-out infinite' }} />
      <div className="card-content-bottom">
        <div style={{ height: '9px', width: '60px', background: 'rgba(197,160,89,0.2)', borderRadius: '4px', marginBottom: '8px' }} />
        <div style={{ height: '24px', width: '80%', background: 'rgba(26,29,54,0.08)', borderRadius: '4px' }} />
      </div>
    </div>
  );
}

export default function FeaturedProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Fetch featured products from the backend
  useEffect(() => {
    async function fetchFeatured() {
      try {
        const res = await fetch('/api/products/featured?limit=10');
        if (!res.ok) throw new Error('Failed to fetch');
        const json = await res.json();
        setProducts(json.products || []);
        setActiveIndex(json.products?.length > 1 ? 1 : 0);
      } catch (err) {
        console.error('[FeaturedProducts] fetch error:', err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }
    fetchFeatured();
  }, []);

  const nextSlide = useCallback(() => {
    if (products.length === 0) return;
    setActiveIndex((prev) => (prev + 1) % products.length);
  }, [products.length]);

  useEffect(() => {
    if (isPaused || products.length <= 1) return;
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [isPaused, nextSlide, products.length]);

  const getCardClass = (index) => {
    const total = products.length;
    if (total === 0) return 'card-hidden';
    const diff = (index - activeIndex + total) % total;
    if (diff === 0) return 'card-active';
    if (diff === 1) return 'card-right';
    if (diff === total - 1) return 'card-left';
    return 'card-hidden';
  };

  // Map Supabase product to display shape
  const mapProduct = (p) => ({
    id: p.id,
    category: (p.category || p.sub_category || 'SKINCARE').toUpperCase(),
    title: p.title || p.name || '',
    price: formatCurrency(p.price || 0),
    image: p.image_url || '',
    link: `/products/${p.id}`,
  });

  return (
    <section className="featured-section" id="featured-products">
      <div className="luxury-overlay" />
      <div className="section-shell">
        <Reveal width="100%">
          <div className="featured-header">
            <span className="editorial-label">Elite Selection</span>
            <h2 className="section-title">
              The Featured <span className="italic-gold">Edit</span>
            </h2>
            <div className="header-divider">
              <span className="line" />
              <span className="dot" />
              <span className="line rev" />
            </div>
            <Link href="/products" className="read-all-link">
              DISCOVER FULL COLLECTION <span className="arrow">↗</span>
            </Link>
          </div>
        </Reveal>

        {/* Loading state */}
        {loading && (
          <div
            className="carousel-container"
            style={{ pointerEvents: 'none' }}
          >
            <div className="carousel-track">
              <SkeletonCard position="card-left" />
              <SkeletonCard position="card-active" />
              <SkeletonCard position="card-right" />
            </div>
          </div>
        )}

        {/* Empty state — no featured products yet */}
        {!loading && products.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            position: 'relative',
            zIndex: 10,
          }}>
            <p style={{
              fontSize: '11px',
              fontWeight: 600,
              letterSpacing: '0.3em',
              color: 'rgba(197,160,89,0.6)',
              textTransform: 'uppercase',
              marginBottom: '12px',
            }}>
              Coming Soon
            </p>
            <p style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '1.8rem',
              color: '#1a1d36',
              opacity: 0.5,
            }}>
              No featured products yet
            </p>
            <p style={{ fontSize: '13px', color: 'rgba(26,29,54,0.4)', marginTop: '8px' }}>
              Mark products as Featured from the admin panel.
            </p>
          </div>
        )}

        {/* Carousel */}
        {!loading && products.length > 0 && (
          <>
            <div
              className="carousel-container"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
            >
              <div className="carousel-track">
                {products.map((product, index) => {
                  const item = mapProduct(product);
                  const cardClass = getCardClass(index);
                  return (
                    <div
                      key={item.id}
                      className={`carousel-card ${cardClass}`}
                      onClick={() => setActiveIndex(index)}
                    >
                      <div className="card-image-wrapper">
                        {item.image ? (
                          <img src={item.image} alt={item.title} className="card-image" />
                        ) : (
                          <div style={{
                            width: '100%',
                            height: '100%',
                            background: 'linear-gradient(135deg, #f5f3ff 0%, #e8e4f8 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}>
                            <span style={{ fontSize: '10px', color: 'rgba(197,160,89,0.4)', letterSpacing: '0.3em', textTransform: 'uppercase' }}>
                              CAMLIQA
                            </span>
                          </div>
                        )}
                        {cardClass === 'card-active' && (
                          <div className="card-luxury-badge">
                            <span>FEATURED</span>
                          </div>
                        )}
                      </div>

                      <div className="card-content-bottom">
                        <p className="card-mini-label">{item.category}</p>
                        <h3 className="card-bottom-title">{item.title}</h3>
                        <div className="card-bottom-meta">
                          <span className="card-price-small">{item.price}</span>
                          {cardClass === 'card-active' && (
                            <Link href={item.link} className="card-discover-link">
                              Discover ↗
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="carousel-indicators">
              {products.map((_, index) => (
                <button
                  key={index}
                  className={`indicator ${index === activeIndex ? 'active' : ''}`}
                  onClick={() => setActiveIndex(index)}
                  aria-label={`Go to product ${index + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
