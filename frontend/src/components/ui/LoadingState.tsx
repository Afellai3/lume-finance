import React from 'react';
import { Loader2 } from 'lucide-react';
import { theme } from '../../styles/theme';

export type LoadingSize = 'sm' | 'md' | 'lg' | 'xl';
export type LoadingVariant = 'spinner' | 'dots' | 'pulse' | 'skeleton';

interface LoadingStateProps {
  size?: LoadingSize;
  variant?: LoadingVariant;
  message?: string;
  fullScreen?: boolean;
  overlay?: boolean;
}

const SIZE_CONFIG = {
  sm: { spinner: 16, text: theme.typography.fontSize.sm },
  md: { spinner: 24, text: theme.typography.fontSize.base },
  lg: { spinner: 32, text: theme.typography.fontSize.lg },
  xl: { spinner: 48, text: theme.typography.fontSize.xl },
};

export const LoadingState: React.FC<LoadingStateProps> = ({
  size = 'md',
  variant = 'spinner',
  message,
  fullScreen = false,
  overlay = false,
}) => {
  const config = SIZE_CONFIG[size];

  const containerStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.md,
    ...(fullScreen && {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 9998,
    }),
    ...(overlay && {
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      backdropFilter: 'blur(4px)',
    }),
    padding: theme.spacing.xl,
  };

  const renderVariant = () => {
    switch (variant) {
      case 'spinner':
        return (
          <div
            style={{
              animation: 'spin 1s linear infinite',
              color: theme.colors.primary.DEFAULT,
            }}
          >
            <Loader2 size={config.spinner} />
          </div>
        );

      case 'dots':
        return (
          <div
            style={{
              display: 'flex',
              gap: theme.spacing.xs,
            }}
          >
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                style={{
                  width: config.spinner / 4,
                  height: config.spinner / 4,
                  borderRadius: '50%',
                  backgroundColor: theme.colors.primary.DEFAULT,
                  animation: `bounce 1.4s ease-in-out ${i * 0.16}s infinite`,
                }}
              />
            ))}
          </div>
        );

      case 'pulse':
        return (
          <div
            style={{
              width: config.spinner,
              height: config.spinner,
              borderRadius: '50%',
              backgroundColor: theme.colors.primary.DEFAULT,
              animation: 'pulse 1.5s ease-in-out infinite',
            }}
          />
        );

      case 'skeleton':
        return (
          <div
            style={{
              width: '100%',
              maxWidth: '400px',
              display: 'flex',
              flexDirection: 'column',
              gap: theme.spacing.sm,
            }}
          >
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                style={{
                  height: '20px',
                  borderRadius: theme.borderRadius.md,
                  backgroundColor: theme.colors.border.light,
                  animation: 'shimmer 1.5s ease-in-out infinite',
                  width: i === 2 ? '60%' : '100%',
                }}
              />
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div style={containerStyles}>
      {renderVariant()}
      {message && (
        <p
          style={{
            margin: 0,
            fontSize: config.text,
            color: overlay ? '#ffffff' : theme.colors.text.secondary,
            fontWeight: theme.typography.fontWeight.medium,
            textAlign: 'center',
          }}
        >
          {message}
        </p>
      )}

      {/* Animations */}
      <style>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes bounce {
          0%, 80%, 100% {
            transform: scale(0);
            opacity: 0.5;
          }
          40% {
            transform: scale(1);
            opacity: 1;
          }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.5;
            transform: scale(0.8);
          }
        }

        @keyframes shimmer {
          0% {
            opacity: 0.6;
          }
          50% {
            opacity: 1;
          }
          100% {
            opacity: 0.6;
          }
        }
      `}</style>
    </div>
  );
};

// Inline Loading Component (for buttons, small spaces)
interface InlineLoadingProps {
  size?: number;
  color?: string;
}

export const InlineLoading: React.FC<InlineLoadingProps> = ({
  size = 16,
  color = theme.colors.primary.DEFAULT,
}) => {
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        animation: 'spin 1s linear infinite',
        color,
      }}
    >
      <Loader2 size={size} />
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
