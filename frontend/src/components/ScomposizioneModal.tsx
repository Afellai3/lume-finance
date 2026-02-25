import { X } from 'lucide-react';
import './ScomposizioneModal.css';

interface Componente {
  voce: string;
  importo: number;
  dettagli?: string;
}

interface Scomposizione {
  costo_totale: number;
  componenti?: Componente[];
  dettagli?: string;
}

interface ScomposizioneModalProps {
  scomposizione: Scomposizione;
  onClose: () => void;
}

function ScomposizioneModal({ scomposizione, onClose }: ScomposizioneModalProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value || 0);
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="scomposizione-overlay" onClick={handleOverlayClick}>
      <div className="scomposizione-modal">
        <div className="scomposizione-header">
          <div>
            <h2>🔥 Scomposizione Costi Nascosti</h2>
            <p>Analisi dettagliata del movimento</p>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="scomposizione-body">
          {/* Total Cost */}
          <div className="total-cost">
            <div className="total-label">Costo Totale</div>
            <div className="total-amount">{formatCurrency(scomposizione.costo_totale)}</div>
          </div>

          {/* Components Breakdown */}
          {scomposizione.componenti && scomposizione.componenti.length > 0 && (
            <div className="components-section">
              <h3>📊 Composizione</h3>
              <div className="components-list">
                {scomposizione.componenti.map((comp, index) => {
                  const percentage = scomposizione.costo_totale > 0 
                    ? (comp.importo / scomposizione.costo_totale) * 100 
                    : 0;

                  return (
                    <div key={index} className="component-item">
                      <div className="component-header">
                        <div className="component-info">
                          <span className="component-voce">{comp.voce}</span>
                          {comp.dettagli && (
                            <span className="component-dettagli">{comp.dettagli}</span>
                          )}
                        </div>
                        <div className="component-amount">
                          <span className="amount">{formatCurrency(comp.importo)}</span>
                          <span className="percentage">{percentage.toFixed(0)}%</span>
                        </div>
                      </div>
                      <div className="component-bar">
                        <div 
                          className="component-fill" 
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Additional Details */}
          {scomposizione.dettagli && (
            <div className="scomposizione-note">
              <strong>ℹ️ Nota:</strong> {scomposizione.dettagli}
            </div>
          )}
        </div>

        <div className="scomposizione-footer">
          <button className="btn btn-primary" onClick={onClose}>
            Ho Capito
          </button>
        </div>
      </div>
    </div>
  );
}

export default ScomposizioneModal;
