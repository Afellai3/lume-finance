import { theme } from '../../styles/theme';

type SpinnerSize = 'sm' | 'md' | 'lg';

interface SpinnerProps {
  size?: SpinnerSize;
  text?: string;
  center?: boolean;
}

const SIZES = {
  sm: 16,
  md: 24,
  lg: 40
};

export function Spinner({ size = 'md', text, center = false }: SpinnerProps) {
  const spinnerSize = SIZES[size];

  const spinner = (
    <div
      style={{
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: theme.spacing.sm
      }}
    >
      <div
        style={{
          width: `${spinnerSize}px`,
          height: `${spinnerSize}px`,
          border: `${spinnerSize / 8}px solid ${theme.colors.border.light}`,
          borderTopColor: theme.colors.primary.DEFAULT,
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite'
        }}
      />
      {text && (
        <span
          style={{
            fontSize: theme.typography.fontSize.sm,
            color: theme.colors.text.secondary
          }}
        >
          {text}
        </span>
      )}

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );

  if (center) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '200px',
          width: '100%'
        }}
      >
        {spinner}
      </div>
    );
  }

  return spinner;
}
