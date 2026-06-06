import React from 'react';
import CategoryCircleImage from './CategoryCircleImage';
import { categoryPath } from '../utils/categorySlug';
import './CategoriesSection.css';

const womenCategoriesList = [
  { tag: 'kurtas', label: 'Kurtas', image: '/kurtas/Kurtas/9/DishaParmarVaidya_2_700x.webp', cutoutId: 'women-kurtas' },
  { tag: 'suit sets', label: 'Suit Sets', image: '/suit-sets/Suit Sets/2/0T3A4320_035a159c-78ec-4f4c-87a2-8f86a58473bc_700x.webp', cutoutId: 'women-suit-sets' },
  { tag: 'sarees', label: 'Sarees', image: '/sarees/Sarees/1/0T3A5495_700x.webp', cutoutId: 'women-sarees' },
  { tag: 'lehengas', label: 'Lehengas', image: '/lehengas/Lehengas/1/040A3523_700x.webp', cutoutId: 'women-lehengas' },
  { tag: 'dupatta sets', label: 'Dupatta Sets', image: '/dupatta-sets/6/yellow_peplum_skirt_dupatta_set_1_295fa5d7-8dae-48db-8b9f-8da4c168d45f_700x.webp', cutoutId: 'women-dupatta-sets' },
  { tag: 'tops', label: 'Tops', image: '/tops/1/1.webp', cutoutId: 'women-tops' },
  { tag: 'dresses', label: 'Dresses', image: '/dresses/ws/dress/1/shopping.webp', cutoutId: 'women-dresses' },
  { tag: 'co-ords', label: 'Co-ord Sets', image: '/co-ords/co-ord_set/1/1.webp', cutoutId: 'women-co-ords' },
  { tag: 't-shirts', label: 'T-Shirts', image: '/t-shirts/t-shirt/1/1.webp', cutoutId: 'women-t-shirts' },
  { tag: 'bottoms', label: 'Bottoms', image: '/bottoms/bottom_wear/1/1.webp', cutoutId: 'women-bottoms', imageFocus: 'lower' },
];

const gentsCategoriesList = [
  { tag: 'gents kurtas', label: 'Kurtas', image: '/mens/kurtas/kurta/4/xxl-dmm-daswani-exports-original-imahmgj4r2evzddc.webp', cutoutId: 'gents-kurtas' },
  { tag: 'gents co-ords', label: 'Co-ord Sets (Ethnic)', image: '/mens/coords/co-ordset men/co5/3.webp', cutoutId: 'gents-co-ords' },
  { tag: 'blazers', label: 'Wedding Blazers', image: '/mens/blazers/Blezermen/b10/1.webp', cutoutId: 'gents-blazers' },
  { tag: 'shirts', label: 'Shirts', image: '/mens/shirts/shirt/shirt 9/xxl-ps-37-s-stenfia-original-imahkd8atwr2fqgm.webp', cutoutId: 'gents-shirts' },
  { tag: 'gents t-shirts', label: 'T-Shirts', image: '/mens/tshirts/t-shirt/2/10-11-years-hr-polo-tshirt-red-82-1p-fast-cry-original-imahguhuczyesyh6.webp', cutoutId: 'gents-t-shirts' },
  { tag: 'pants', label: 'Pants', image: '/mens/pants/Pants/2/34-el-p-cot-el-cielo-original-imahed6dbxfeyqvb.webp', cutoutId: 'gents-pants', imageFocus: 'lower' },
  { tag: 'jeans', label: 'Jeans', image: '/mens/jeans/jeans/6/30-jeanlscargo-mgrey-01-urbano-fashion-original-imahhwp4gydryjds.webp', cutoutId: 'gents-jeans', imageFocus: 'lower' },
  { tag: 'hoodies', label: 'Hoodies', image: '/mens/hoodies/Hoodiesmen/h10/1.webp', cutoutId: 'gents-hoodies' },
  { tag: 'trackpants', label: 'Track Pants', image: '/mens/trackpants/TRackpents/T1/s-dd19-l-grey-01-mack-jonney-original-imahkvyfr8ajtawh.webp', cutoutId: 'gents-trackpants', imageFocus: 'lower' },
];

function CategoryCircleItem({ cat, onSelectCategory }) {
  const handleClick = () => {
    if (onSelectCategory) {
      onSelectCategory(cat.tag);
      setTimeout(() => {
        document.getElementById('shop-catalog')?.scrollIntoView({ behavior: 'smooth' });
      }, 200);
      return;
    }
    const url = `${window.location.origin}${categoryPath(cat.tag)}`;
    window.open(url, '_blank');
  };

  return (
    <button
      type="button"
      className="category-circle-item"
      onClick={handleClick}
      role="listitem"
      aria-label={`Shop ${cat.label}`}
    >
      <CategoryCircleImage
        src={cat.image}
        alt={cat.label}
        cutoutId={cat.cutoutId}
        imageFocus={cat.imageFocus}
      />
      <span className="category-circle-label">{cat.label}</span>
    </button>
  );
}

function CategoryAutoScrollRow({ items, onSelectCategory, variant = 'women', reverse = false }) {
  const trackItems = [...items, ...items];

  return (
    <div className="category-scroll-wrap">
      <div
        className={`category-circles-autoscroll category-circles-autoscroll--${variant}${reverse ? ' is-reverse' : ''}`}
        role="list"
      >
        {trackItems.map((cat, index) => (
          <CategoryCircleItem
            key={`${cat.tag}-${index}`}
            cat={cat}
            onSelectCategory={onSelectCategory}
          />
        ))}
      </div>
    </div>
  );
}

export default function CategoriesSection({ onSelectCategory }) {
  return (
    <section className="categories-section section-padding" id="shop-catalog">
      <div className="container categories-section-inner">
        <div className="section-heading-container categories-main-heading">
          <h2 className="section-title categories-main-title">SHOP BY CATEGORIES</h2>
          <div className="categories-main-divider">
            <span />
            <span />
          </div>
        </div>

        <div className="collection-category-block women-collection-block animate-fade-in">
          <div className="collection-subheading-wrap">
            <h3 className="collection-block-title collection-block-title--centered collection-subheading-text">
              WOMEN&apos;S EXQUISITE ETHNIC WEAR
            </h3>
            <div className="collection-subheading-divider" />
          </div>
          <CategoryAutoScrollRow
            items={womenCategoriesList}
            onSelectCategory={onSelectCategory}
            variant="women"
          />
        </div>

        <div className="collection-category-block gents-collection-block animate-fade-in">
          <div className="collection-subheading-wrap">
            <h3 className="collection-block-title collection-block-title--centered collection-subheading-text">
              GENTS&apos; MAJESTIC TRADITIONAL WEAR
            </h3>
            <div className="collection-subheading-divider" />
          </div>
          <CategoryAutoScrollRow
            items={gentsCategoriesList}
            onSelectCategory={onSelectCategory}
            variant="gents"
            reverse
          />
        </div>
      </div>
    </section>
  );
}
