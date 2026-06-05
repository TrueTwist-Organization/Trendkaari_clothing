import React from 'react';
import { ArrowLeft } from 'lucide-react';
import './PageBackButton.css';

export default function PageBackButton({ onClick, label = 'Back', className = '' }) {
  return (
    <button
      type="button"
      className={`page-back-btn${className ? ` ${className}` : ''}`}
      onClick={onClick}
      aria-label={label}
    >
      <ArrowLeft size={16} strokeWidth={2} aria-hidden />
      <span>{label}</span>
    </button>
  );
}
