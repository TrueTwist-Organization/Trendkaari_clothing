import { getProductDetailContent, parseAboutBullet } from '../utils/productContent';
import './ProductDetailsAmazon.css';

function KeyValueTable({ rows }) {
  if (!rows?.length) return null;
  return (
    <dl className="pdp-amazon-kv">
      {rows.map(([label, value]) => (
        <div key={label} className="pdp-amazon-kv__row">
          <dt>{label}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  );
}

export default function ProductDetailsAmazon({ product }) {
  const content = getProductDetailContent(product);
  if (!content) return null;

  const highlightRows = content.highlights ? Object.entries(content.highlights) : [];
  const additionalRows = content.additionalInfo ? Object.entries(content.additionalInfo) : [];

  return (
    <section className="pdp-product-details" aria-label="Product details">
      <h2 className="pdp-amazon-main-title">Product details</h2>

      {highlightRows.length > 0 && (
        <div className="pdp-amazon-section">
          <h3 className="pdp-amazon-subtitle">Top highlights</h3>
          <KeyValueTable rows={highlightRows} />
        </div>
      )}

      {content.aboutItems?.length > 0 && (
        <div className="pdp-amazon-section">
          <h3 className="pdp-amazon-subtitle">About this item</h3>
          <ul className="pdp-amazon-bullets">
            {content.aboutItems.map((item, i) => {
              const { label, body } = parseAboutBullet(item);
              return (
                <li key={i}>
                  {label ? (
                    <>
                      <strong>{label}:</strong> {body}
                    </>
                  ) : (
                    item
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <div className="pdp-amazon-section">
        <h3 className="pdp-amazon-subtitle">Product description</h3>
        <div className="pdp-amazon-desc-box">
          <p>{content.descriptionLong || product.description}</p>
        </div>
        <p className="pdp-amazon-model-note">The model (height 170 cm) is wearing a size S.</p>
      </div>

      {additionalRows.length > 0 && (
        <div className="pdp-amazon-section">
          <h3 className="pdp-amazon-subtitle">Additional Information</h3>
          <KeyValueTable rows={additionalRows} />
        </div>
      )}
    </section>
  );
}
