import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Check, ChevronLeft, ChevronRight, Star } from 'lucide-react';
import './ReviewsSection.css';

const reviewsData = [
  {
    id: 1,
    name: 'Priya Sharma',
    city: 'New Delhi',
    initials: 'PS',
    rating: 5,
    purchased: 'Plum Cotton Kurta Set',
    text: 'Ordered for my sister’s roka — fabric feels rich, colour exactly like photos. Stitching is neat and it arrived in 4 days. Worth every rupee.',
  },
  {
    id: 2,
    name: 'Arjun Mehta',
    city: 'Pune',
    initials: 'AM',
    rating: 5,
    purchased: 'Gents Wedding Kurta',
    text: 'Fit shoulder se bilkul sahi tha, linen blend garmi mein comfortable hai. Packaging bhi achhi thi, no wrinkles.',
  },
  {
    id: 3,
    name: 'Divya Nair',
    city: 'Kochi',
    initials: 'DN',
    rating: 5,
    purchased: 'Onam Dupatta Set',
    text: 'Looked premium in person. Pallu print is subtle, blouse piece fabric is soft. Got compliments — already recommended trendkaari to two friends.',
  },
  {
    id: 4,
    name: 'Rohit Kulkarni',
    city: 'Nagpur',
    initials: 'RK',
    rating: 4,
    purchased: 'Ethnic Co-ord Set',
    text: 'First time buying ethnic wear online and honestly impressed. Size chart was accurate, exchange process was smooth when I needed M instead of L.',
  },
  {
    id: 5,
    name: 'Ananya Iyer',
    city: 'Chennai',
    initials: 'AI',
    rating: 5,
    purchased: 'Office Diwali Co-ord',
    text: 'Lightweight, does not cling, and the belt detail sits well on waist. Washed once, colour did not fade.',
  },
  {
    id: 6,
    name: 'Kavita Verma',
    city: 'Jaipur',
    initials: 'KV',
    rating: 5,
    purchased: 'Shirt & Chinos Combo',
    text: 'Shirt collar stiff hai formal look ke liye, trousers ki length perfect thi. Fast delivery to Jaipur.',
  },
  {
    id: 7,
    name: 'Shreya Das',
    city: 'Kolkata',
    initials: 'SD',
    rating: 5,
    purchased: 'Wedding Lehenga Choli',
    text: 'Zari embroidery is rich, dupatta border is gorgeous. Took custom blouse stitching locally, lehenga base was flawless.',
  },
  {
    id: 8,
    name: 'Vikram Singh',
    city: 'Chandigarh',
    initials: 'VS',
    rating: 4,
    purchased: 'Travel Track Pants',
    text: 'Stretch is good, pockets deep enough for phone. Colour true black, no fading after three washes. Good value at this price.',
  },
  {
    id: 9,
    name: 'Pooja Reddy',
    city: 'Hyderabad',
    initials: 'PR',
    rating: 5,
    purchased: 'Temple Georgette Saree',
    text: 'Drape fall is beautiful — georgette is not see-through, blouse piece included. Received two days before promised date.',
  },
  {
    id: 10,
    name: 'Nandini Pillai',
    city: 'Coimbatore',
    initials: 'NP',
    rating: 5,
    purchased: 'Plus Size Kurta 3XL',
    text: '3XL shoulder room sahi mila, side slits comfortable. Finally something that fits without alteration.',
  },
  {
    id: 11,
    name: 'Sneha Joshi',
    city: 'Indore',
    initials: 'SJ',
    rating: 5,
    purchased: 'Ganpati Palazzo Suit',
    text: 'Breezy rayon, print colours vibrant even in evening lights. Palazzo length perfect for my 5\'2" height without hemming.',
  },
  {
    id: 12,
    name: 'Karan Malhotra',
    city: 'Gurgaon',
    initials: 'KM',
    rating: 5,
    purchased: 'Nehru Jacket Set',
    text: 'Slim fit without feeling tight. Buttons sturdy, inner lining neat. Wore to engagement, looked sharper than rental outfit.',
  },
  {
    id: 13,
    name: 'Fatima Khan',
    city: 'Lucknow',
    initials: 'FK',
    rating: 5,
    purchased: 'Maternity Anarkali',
    text: 'Empire waist comfortable, flare hides bump nicely. Fabric not itchy on skin. Thank you team for quick size guidance on chat.',
  },
  {
    id: 14,
    name: 'Suresh Menon',
    city: 'Thiruvananthapuram',
    initials: 'SM',
    rating: 4,
    purchased: 'Office Linen Shirt',
    text: 'Wrinkles less than expected, collar stays crisp till evening. Ordered two more colours after first wash test passed.',
  },
  {
    id: 15,
    name: 'Ishita Banerjee',
    city: 'Bhubaneswar',
    initials: 'IB',
    rating: 5,
    purchased: 'Sangeet Sharara Set',
    text: 'Mirror work catches light beautifully, dupatta not too heavy to carry. Zip at side made changing easy backstage.',
  },
  {
    id: 16,
    name: 'Rahul Desai',
    city: 'Vadodara',
    initials: 'RD',
    rating: 4,
    purchased: 'Travel Hoodie Set',
    text: 'Soft fleece inside, waistband does not roll down on long flights. Colour matches website, no surprise shade.',
  },
  {
    id: 17,
    name: 'Meera Krishnan',
    city: 'Mysuru',
    initials: 'MK',
    rating: 5,
    purchased: 'Sunday Maxi Dress',
    text: 'Pockets are deep (finally!), neckline modest for family outings. Washed on gentle cycle, no shrinkage.',
  },
  {
    id: 18,
    name: 'Imran Sheikh',
    city: 'Srinagar',
    initials: 'IS',
    rating: 5,
    purchased: 'Eid Pathani Suit',
    text: 'Salwar comfortable, kameez length ideal for sandals. Thread work on collar is subtle, not flashy.',
  },
  {
    id: 19,
    name: 'Tanvi Agarwal',
    city: 'Kota',
    initials: 'TA',
    rating: 5,
    purchased: 'Block Print Kurta',
    text: 'Breathable, did not stain after mehendi hands. Friends asked brand name on spot.',
  },
  {
    id: 20,
    name: 'Amitabh Roy',
    city: 'Patna',
    initials: 'AR',
    rating: 4,
    purchased: 'Interview Blazer',
    text: 'Shoulders sit clean, single vent looks modern. Needed minor sleeve alteration locally; base fit was already close.',
  },
  {
    id: 21,
    name: 'Lakshmi Sundaram',
    city: 'Madurai',
    initials: 'LS',
    rating: 5,
    purchased: 'Reception Chiffon Saree',
    text: 'Pallu pins easily, fall is fluid not stiff. Blouse fabric matches tone perfectly.',
  },
  {
    id: 22,
    name: 'Harpreet Kaur',
    city: 'Amritsar',
    initials: 'HK',
    rating: 5,
    purchased: 'Kids Ethnic Set',
    text: 'Soft on skin, no loose buttons. Size 8 fit true for age 7. Will order again for Diwali.',
  },
  {
    id: 23,
    name: 'Nikhil Patwardhan',
    city: 'Nashik',
    initials: 'NP',
    rating: 4,
    purchased: 'Denim Jacket',
    text: 'Medium wash looks premium, metal buttons solid. Layered over kurta for casual Friday, got nice comments at work.',
  },
  {
    id: 24,
    name: 'Zara Siddiqui',
    city: 'Bhopal',
    initials: 'ZS',
    rating: 5,
    purchased: 'New Year Festive Gown',
    text: 'Off-shoulder stays in place with inner grip strip, sequins did not shed on car seat. Felt glamorous without heavy weight.',
  },
  {
    id: 25,
    name: 'Geetika Mishra',
    city: 'Raipur',
    initials: 'GM',
    rating: 5,
    purchased: 'Daily Wear Leggings Pack',
    text: 'Opaque, squat-proof at gym test. Waistband high enough, no rolling. Good staple to stock from trendkaari.',
  },
];

const LEN = reviewsData.length;

function wrapIndex(index) {
  return ((index % LEN) + LEN) % LEN;
}

/** Compact dot strip — keeps pagination readable with many reviews */
function getVisibleDotIndices(active, total, maxVisible = 11) {
  if (total <= maxVisible) {
    return Array.from({ length: total }, (_, i) => i);
  }
  const half = Math.floor(maxVisible / 2);
  let start = Math.max(0, active - half);
  let end = Math.min(total - 1, start + maxVisible - 1);
  start = Math.max(0, end - maxVisible + 1);
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

function ReviewArchCard({ review, position = 'center', isSlide = false }) {
  return (
    <article
      className={`review-arch-card review-arch-card--${position}${isSlide ? ' review-arch-card--slide' : ''}`}
      aria-hidden={!isSlide && position !== 'center'}
    >
      <div className="review-arch-card__border">
        <Star className="review-arch-card__crown" size={16} fill="#D4B483" stroke="#D4B483" aria-hidden />

        <div className="review-arch-card__avatar" aria-hidden>
          {review.initials}
        </div>

        <h3 className="review-arch-card__name">{review.name}</h3>
        <p className="review-arch-card__city">{review.city}</p>

        <div className="review-arch-card__stars" aria-label={`${review.rating} out of 5 stars`}>
          {Array.from({ length: 5 }, (_, i) => (
            <Star
              key={i}
              size={14}
              fill={i < review.rating ? '#D4B483' : 'transparent'}
              stroke={i < review.rating ? '#D4B483' : '#e0d5c8'}
              strokeWidth={1.5}
            />
          ))}
        </div>

        <span className="review-arch-card__verified">
          <Check size={10} strokeWidth={3} aria-hidden />
          Verified buyer
        </span>

        <p className="review-arch-card__text">&ldquo;{review.text}&rdquo;</p>

        <div className="review-arch-card__divider" aria-hidden />

        <p className="review-arch-card__purchased">
          Purchased: <span>{review.purchased}</span>
        </p>
      </div>
    </article>
  );
}

const MOBILE_MQ = '(max-width: 768px)';

export default function ReviewsSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia(MOBILE_MQ).matches : false,
  );
  const trackRef = useRef(null);
  const scrollRafRef = useRef(null);
  const skipScrollSyncRef = useRef(false);

  useEffect(() => {
    const mq = window.matchMedia(MOBILE_MQ);
    const onChange = (e) => setIsMobile(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const scrollToIndex = useCallback((index, behavior = 'smooth') => {
    const track = trackRef.current;
    if (!track) return;
    const slide = track.querySelector('.review-arch-card--slide');
    const slideWidth = slide ? slide.getBoundingClientRect().width : track.clientWidth;
    track.scrollTo({ left: index * slideWidth, behavior });
  }, []);

  useEffect(() => {
    if (!isMobile) return;
    if (skipScrollSyncRef.current) {
      skipScrollSyncRef.current = false;
      return;
    }
    scrollToIndex(activeIndex);
  }, [activeIndex, isMobile, scrollToIndex]);

  const handleTrackScroll = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    if (scrollRafRef.current) cancelAnimationFrame(scrollRafRef.current);
    scrollRafRef.current = requestAnimationFrame(() => {
      const slide = track.querySelector('.review-arch-card--slide');
      const slideWidth = slide ? slide.getBoundingClientRect().width : track.clientWidth;
      if (!slideWidth) return;
      const idx = Math.round(track.scrollLeft / slideWidth);
      const wrapped = wrapIndex(idx);
      setActiveIndex((prev) => {
        if (prev === wrapped) return prev;
        skipScrollSyncRef.current = true;
        return wrapped;
      });
    });
  }, []);

  const visibleTriplet = useMemo(
    () => [
      { review: reviewsData[wrapIndex(activeIndex - 1)], position: 'left' },
      { review: reviewsData[wrapIndex(activeIndex)], position: 'center' },
      { review: reviewsData[wrapIndex(activeIndex + 1)], position: 'right' },
    ],
    [activeIndex],
  );

  const goNext = useCallback(() => {
    setActiveIndex((i) => wrapIndex(i + 1));
  }, []);

  const goPrev = useCallback(() => {
    setActiveIndex((i) => wrapIndex(i - 1));
  }, []);

  const dotIndices = useMemo(
    () => getVisibleDotIndices(activeIndex, LEN),
    [activeIndex]
  );

  return (
    <section className="reviews-premium section-padding" aria-labelledby="reviews-heading">
      <div className="container reviews-premium__container">
        <Star className="reviews-premium__ornament" size={18} fill="#D4B483" stroke="#D4B483" aria-hidden />
        
        <div className="section-heading-container">
          <h2 id="reviews-heading" className="section-title reviews-premium__title">
            CUSTOMER REVIEWS
          </h2>
        </div>

        <div className="reviews-premium__carousel">
          <button
            type="button"
            className="reviews-premium__nav reviews-premium__nav--prev"
            onClick={goPrev}
            aria-label="Previous review"
          >
            <ChevronLeft size={22} strokeWidth={1.75} />
          </button>

          <div
            ref={isMobile ? trackRef : null}
            className={`reviews-premium__stage${isMobile ? ' reviews-premium__stage--scroll' : ''}`}
            onScroll={isMobile ? handleTrackScroll : undefined}
          >
            {isMobile
              ? reviewsData.map((review) => (
                  <ReviewArchCard key={review.id} review={review} position="center" isSlide />
                ))
              : visibleTriplet.map(({ review, position }) => (
                  <ReviewArchCard key={`${review.id}-${position}`} review={review} position={position} />
            ))}
          </div>

          <button
            type="button"
            className="reviews-premium__nav reviews-premium__nav--next"
            onClick={goNext}
            aria-label="Next review"
          >
            <ChevronRight size={22} strokeWidth={1.75} />
          </button>
        </div>

        <div className="reviews-premium__dots" role="tablist" aria-label="Review slides">
          {dotIndices.map((idx) => (
              <button
              key={reviewsData[idx].id}
              type="button"
              role="tab"
              aria-selected={idx === activeIndex}
              aria-label={`Show review by ${reviewsData[idx].name}`}
              className={`reviews-premium__dot ${idx === activeIndex ? 'is-active' : ''}`}
              onClick={() => setActiveIndex(idx)}
              />
            ))}
        </div>
      </div>
    </section>
  );
}
