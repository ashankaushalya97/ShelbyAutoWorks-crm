import { useSelector } from 'react-redux';
import { selectCurrentRole } from '@/redux/auth/selectors';

// Renders children only if the current user's role is in the `roles` array.
// Usage: <RoleGuard roles={['admin']}><DeleteButton /></RoleGuard>
export default function RoleGuard({ roles, children, fallback = null }) {
  const currentRole = useSelector(selectCurrentRole);
  if (!roles.includes(currentRole)) return fallback;
  return children;
}
