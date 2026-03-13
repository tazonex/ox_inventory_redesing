import React from 'react';
import { fetchNui } from '../../utils/fetchNui';
import { Locale } from '../../store/locale';

const InventoryControl: React.FC = () => {
  return (
    <div className="inventory-control">
      <button className="inventory-control-close" onClick={() => fetchNui('exit')}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 6L6 18" /><path d="M6 6l12 12" />
        </svg>
        {Locale.ui_close || 'Close'}
      </button>
    </div>
  );
};

export default InventoryControl;
