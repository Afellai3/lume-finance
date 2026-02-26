import { CSSProperties } from 'react';
import { theme } from '../../styles/theme';

interface SkeletonProps {
  width?: string;
  height?: string;
  circle?: boolean;
  style?: CSSProperties;
}

export function Skeleton({ width = '100%', height = '20px', circle = false, style }: SkeletonProps) {
  return (
    <>
      <div
        style={{
          width,
          height,
          borderRadius: circle ? '50%' : theme.borderRadius.md,
          backgroundColor: theme.colors.border.light,
          position: 'relative',
          overflow: 'hidden',
          ...style
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: '-100%',
            width: '100%',
            height: '100%',
            background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent)',
            animation: 'shimmer 1.5s infinite'
          }}
        />
      </div>

      <style>{`
        @keyframes shimmer {
          0% { left: -100%; }
          100% { left: 100%; }
        }
      `}</style>
    </>
  );
}

interface SkeletonTextProps {
  lines?: number;
  lastLineWidth?: string;
}

export function SkeletonText({ lines = 3, lastLineWidth = '70%' }: SkeletonTextProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.sm }}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          width={i === lines - 1 ? lastLineWidth : '100%'}
          height="16px"
        />
      ))}
    </div>
  );
}
