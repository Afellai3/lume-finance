import { useState } from 'react';
import { ArrowLeftRight, List, Repeat, Tag } from 'lucide-react';
import { Tabs } from '../components/ui/Tabs';
import Movimenti from './Movimenti';
import Ricorrenze from './Ricorrenze';
import Categorie from './Categorie';

type MovimentiTab = 'tutti' | 'ricorrenze' | 'categorie';

function MovimentiWithTabs() {
  const [activeTab, setActiveTab] = useState<MovimentiTab>('tutti');

  const tabs = [
    { id: 'tutti', label: 'Tutti', icon: <List size={16} /> },
    { id: 'ricorrenze', label: 'Ricorrenze', icon: <Repeat size={16} /> },
    { id: 'categorie', label: 'Categorie', icon: <Tag size={16} /> },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Page Title */}
      <div style={{ marginBottom: '0.5rem' }}>
        <h1 style={{ 
          margin: 0, 
          fontSize: '1.875rem', 
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <ArrowLeftRight size={32} />
          Movimenti
        </h1>
        <p style={{ 
          margin: '0.5rem 0 0 0', 
          fontSize: '0.875rem',
          opacity: 0.7
        }}>
          Gestisci le tue transazioni, ricorrenze e categorie
        </p>
      </div>

      {/* Tabs Navigation */}
      <Tabs
        tabs={tabs}
        activeTab={activeTab}
        onChange={(tabId) => setActiveTab(tabId as MovimentiTab)}
        variant="pills"
        fullWidth
      />

      {/* Tab Content */}
      <div>
        {activeTab === 'tutti' && <Movimenti />}
        {activeTab === 'ricorrenze' && <Ricorrenze />}
        {activeTab === 'categorie' && <Categorie />}
      </div>
    </div>
  );
}

export default MovimentiWithTabs;
