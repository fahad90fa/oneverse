import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface RoleAccessStatus {
  isApproved: boolean;
  isLoading: boolean;
  hasRole: boolean;
  isPending: boolean;
  isRejected: boolean;
}

export const useRoleAccess = (requiredRole: 'worker' | 'seller'): RoleAccessStatus => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<RoleAccessStatus>({
    isApproved: false,
    isLoading: true,
    hasRole: false,
    isPending: false,
    isRejected: false,
  });

  useEffect(() => {
    const checkRoleAccess = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.user) {
          setStatus({
            isApproved: false,
            isLoading: false,
            hasRole: false,
            isPending: false,
            isRejected: false,
          });
          return;
        }

        const { data: userRole } = await supabase
          .from('user_roles')
          .select('role, is_active')
          .eq('user_id', session.user.id)
          .eq('role', requiredRole)
          .single();

        if (!userRole) {
          setStatus({
            isApproved: false,
            isLoading: false,
            hasRole: false,
            isPending: false,
            isRejected: false,
          });
          return;
        }

        if (!userRole.is_active) {
          const { data: application } = await supabase
            .from('role_applications')
            .select('status')
            .eq('user_id', session.user.id)
            .eq('role', requiredRole)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          if (application?.status === 'rejected') {
            setStatus({
              isApproved: false,
              isLoading: false,
              hasRole: true,
              isPending: false,
              isRejected: true,
            });
            return;
          }

          if (application?.status === 'pending') {
            setStatus({
              isApproved: false,
              isLoading: false,
              hasRole: true,
              isPending: true,
              isRejected: false,
            });
            return;
          }
        }

        setStatus({
          isApproved: userRole.is_active,
          isLoading: false,
          hasRole: true,
          isPending: !userRole.is_active,
          isRejected: false,
        });
      } catch (error) {
        setStatus({
          isApproved: false,
          isLoading: false,
          hasRole: false,
          isPending: false,
          isRejected: false,
        });
      }
    };

    checkRoleAccess();
  }, [requiredRole]);

  return status;
};

export const useProtectRoute = (requiredRole: 'worker' | 'seller') => {
  const navigate = useNavigate();
  const access = useRoleAccess(requiredRole);

  useEffect(() => {
    if (!access.isLoading && !access.isApproved) {
      if (access.isPending) {
        navigate(`/approval-role/${requiredRole}`, {
          state: { message: 'Your access is pending admin approval. Please wait for verification.' }
        });
      } else if (access.isRejected) {
        navigate('/dashboard', {
          state: { message: 'Your application was rejected. You cannot access this area.' }
        });
      } else if (access.hasRole) {
        navigate(`/approval-role/${requiredRole}`, {
          state: { message: 'Please complete your application to access this area.' }
        });
      } else {
        navigate('/onboarding');
      }
    }
  }, [access, navigate, requiredRole]);

  return access;
};
