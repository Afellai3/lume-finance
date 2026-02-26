import { Card } from './Card';
import { Skeleton, SkeletonText } from './Skeleton';
import { theme } from '../../styles/theme';

interface SkeletonCardProps {
  lines?: number;
  showAvatar?: boolean;
}

export function SkeletonCard({ lines = 3, showAvatar = false }: SkeletonCardProps) {
  return (
    <Card padding="lg">
      <div style={{ display: 'flex', gap: theme.spacing.md }}>
        {showAvatar && <Skeleton width="48px" height="48px" circle />}
        <div style={{ flex: 1 }}>
          <Skeleton width="60%" height="20px" style={{ marginBottom: theme.spacing.sm }} />
          <SkeletonText lines={lines} />
        </div>
      </div>
    </Card>
  );
}
