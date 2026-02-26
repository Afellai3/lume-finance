import { useState } from 'react';
import { Landmark, CreditCard, Car } from 'lucide-react';
import { Tabs } from '../components/ui/Tabs';
import Conti from './Conti';
import Beni from './Beni';

type PatrimonioTab = 'conti' | 'beni';

function Patrimonio() {
  const [activeTab, setActiveTab] = useState<PatrimonioTab>('conti');

  const tabs = [
    { id: 'conti', label: 'Conti', icon: <CreditCard size={16} /> },
    { id: 'beni', label: 'Beni', icon: <Car size={16} /> },
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
          <Landmark size={32} />
          Patrimonio
        </h1>
        <p style={{ 
          margin: '0.5rem 0 0 0', 
          fontSize: '0.875rem',
          opacity: 0.7
        }}>
          Gestisci i tuoi conti bancari e beni
        </p>
      </div>

      {/* Tabs Navigation */}
      <Tabs
        tabs={tabs}
        activeTab={activeTab}
        onChange={(tabId) => setActiveTab(tabId as PatrimonioTab)}
        variant="pills"
        fullWidth
      />

      {/* Tab Content */}
      <div>
        {activeTab === 'conti' && <Conti />}
        {activeTab === 'beni' && <Beni />}
      </div>
    </div>
  );
}

export default Patrimonio;
