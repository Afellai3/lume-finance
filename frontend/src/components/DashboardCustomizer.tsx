import React from 'react';
import { Settings, Eye, EyeOff, ChevronUp, ChevronDown, RotateCcw, X } from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { theme } from '../styles/theme';
import { DashboardWidget, WidgetId } from '../hooks/useDashboardLayout';

interface DashboardCustomizerProps {
  widgets: DashboardWidget[];
  onToggleVisibility: (id: WidgetId) => void;
  onMoveUp: (id: WidgetId) => void;
  onMoveDown: (id: WidgetId) => void;
  onReset: () => void;
  onClose: () => void;
}

export const DashboardCustomizer: React.FC<DashboardCustomizerProps> = ({
  widgets,
  onToggleVisibility,
  onMoveUp,
  onMoveDown,
  onReset,
  onClose,
}) => {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: theme.spacing.lg,
      }}
      onClick={onClose}
    >
      <Card
        padding="lg"
        style={{
          maxWidth: '500px',
          width: '100%',
          maxHeight: '80vh',
          overflow: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.lg }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.sm }}>
            <Settings size={24} color={theme.colors.primary.DEFAULT} />
            <h2 style={{ margin: 0, fontSize: theme.typography.fontSize.xl }}>Personalizza Dashboard</h2>
          </div>
          <Button variant="ghost" size="sm" leftIcon={<X size={18} />} onClick={onClose} />
        </div>

        <p style={{ color: theme.colors.text.secondary, fontSize: theme.typography.fontSize.sm, marginBottom: theme.spacing.lg }}>
          Mostra/nascondi widget e riordina il layout della dashboard
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.sm, marginBottom: theme.spacing.lg }}>
          {widgets.map((widget, index) => (
            <div
              key={widget.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: theme.spacing.sm,
                padding: theme.spacing.md,
                backgroundColor: widget.visible ? theme.colors.surface : theme.colors.background,
                borderRadius: theme.borderRadius.md,
                border: `1px solid ${theme.colors.border.light}`,
                transition: `all ${theme.transitions.base}`,
              }}
            >
              <Button
                variant="ghost"
                size="sm"
                leftIcon={widget.visible ? <Eye size={18} /> : <EyeOff size={18} />}
                onClick={() => onToggleVisibility(widget.id)}
                style={{ color: widget.visible ? theme.colors.success : theme.colors.text.secondary }}
              />

              <span
                style={{
                  flex: 1,
                  fontSize: theme.typography.fontSize.sm,
                  fontWeight: theme.typography.fontWeight.medium,
                  color: widget.visible ? theme.colors.text.primary : theme.colors.text.secondary,
                }}
              >
                {widget.label}
              </span>

              <div style={{ display: 'flex', gap: theme.spacing.xs }}>
                <Button
                  variant="ghost"
                  size="sm"
                  leftIcon={<ChevronUp size={16} />}
                  onClick={() => onMoveUp(widget.id)}
                  disabled={index === 0}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  leftIcon={<ChevronDown size={16} />}
                  onClick={() => onMoveDown(widget.id)}
                  disabled={index === widgets.length - 1}
                />
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: theme.spacing.sm, justifyContent: 'space-between' }}>
          <Button variant="secondary" leftIcon={<RotateCcw size={16} />} onClick={onReset}>
            Reset Default
          </Button>
          <Button variant="primary" onClick={onClose}>
            Fatto
          </Button>
        </div>
      </Card>
    </div>
  );
};
