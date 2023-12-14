'use client';
import React, { useMemo } from 'react';
import ListCoursePage from '../../../../modules/courses/ListCoursePage';
import { useInfo } from '../../../../core/provider';
import CoordinatorPage from '../../../../modules/coordinators/CoordinatorPage';

export default function Home() {
  const { user } = useInfo();
  const render = useMemo(() => {
    switch (user?.role) {
      case 'SYSADMIN':
        return <ListCoursePage />;
      case 'ADMIN':
        return <CoordinatorPage />;
      case 'TEACHER':
        return <ListCoursePage />;
      case 'STUDENT':
        return <ListCoursePage />;
      default:
        return <ListCoursePage />;
    }
  }, [user]);

  return render;
}
