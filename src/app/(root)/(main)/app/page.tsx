'use client';
import React, { useMemo } from 'react';
import ListCoursePage from '../../../../modules/courses/ListCoursePage';
import { useInfo } from '../../../../core/provider';
import CoordinatorPage from '../../../../modules/coordinators/CoordinatorPage';
import StudentListPage from '../../../../modules/students/Student';
import StudentHomePage from '../../../../modules/students/StudentHome';

export default function Home() {
  const { user } = useInfo();
  const render = useMemo(() => {
    switch (user?.role) {
      case 'SYSADMIN':
        return <ListCoursePage />;
      case 'ADMIN':
        return <CoordinatorPage />;
      case 'COORDINATOR':
        return <StudentListPage />;
      case 'STUDENT':
        return <StudentHomePage />;
      default:
        return <ListCoursePage />;
    }
  }, [user]);

  return render;
}
