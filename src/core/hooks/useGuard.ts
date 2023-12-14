import { useRouter } from 'next/navigation';
import { useInfo } from '../provider';

export const useGuard = (roles: string | string[]) => {
  const { user } = useInfo();
  const router = useRouter();

  const role = typeof roles === 'string' ? [roles] : roles;

  const hasRole = role.includes(user?.role);

  if (!hasRole) {
    router.push('/app');
  }

  return;
};
