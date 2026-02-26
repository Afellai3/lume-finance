import { useState } from 'react';
import { TrendingUp, Wallet, Target } from 'lucide-react';
import { Tabs } from '../components/ui/Tabs';
import Budget from './Budget';
import Obiettivi from './Obiettivi';

type FinanzaTab = 'budget' | 'obiettivi';

function Finanza() {
  const [activeTab, setActiveTab] = useState<FinanzaTab>('budget');

  const tabs = [
    { id: 'budget', label: 'Budget', icon: <Wallet size={16} /> },
    { id: 'obiettivi', label: 'Obiettivi', icon: <Target size={16} /> },
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
          <TrendingUp size={32} />
          Finanza
        </h1>
        <p style={{ 
          margin: '0.5rem 0 0 0', 
          fontSize: '0.875rem',
          opacity: 0.7
        }}>
          Monitora i tuoi budget e raggiungi i tuoi obiettivi
        </p>
      </div>

      {/* Tabs Navigation */}
      <Tabs
        tabs={tabs}
        activeTab={activeTab}
        onChange={(tabId) => setActiveTab(tabId as FinanzaTab)}
        variant="pills"
        fullWidth
      />

      {/* Tab Content */}
      <div>
        {activeTab === 'budget' && <Budget />}
        {activeTab === 'obiettivi' && <Obiettivi />}
      </div>
    </div>
  );
}

export default Finanza;
