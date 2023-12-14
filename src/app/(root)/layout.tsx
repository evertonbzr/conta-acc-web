import { InfoProvider } from '../../core/provider';
import { cookies } from 'next/headers';

interface RootLayoutProps {
  children: React.ReactNode;
}

export default async function RootLayout({ children }: RootLayoutProps) {
  const session = cookies().get('session')?.value || '';
  let user: any = null;
  let course: any = null;

  if (session) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/manager/me?include=course`, {
      headers: {
        Authorization: `Bearer ${session}`
      }
    });
    const data = await res.json();

    if (data.data.user) {
      user = data.data.user;
    }
    if (data.data.user.course) {
      course = data.data.user.course;
    }
  }

  return (
    <InfoProvider user={user} course={course}>
      {children}
    </InfoProvider>
  );
}
