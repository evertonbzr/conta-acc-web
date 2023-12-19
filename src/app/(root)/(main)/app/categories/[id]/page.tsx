import React from 'react';
import { api } from '../../../../../../core/services/api';
import ActivityCategoryPage from '../../../../../../modules/categories/ActivityCategory';
import { cookies } from 'next/headers';

export default async function Category({ params }: { params: { id: string } }) {
  // const session = cookies().get('session')?.value;

  let data;

  // if (session) {
  //   const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories?pageSize=1000&resolutionId=${params.id}`, {
  //     headers: {
  //       Authorization: `Bearer ${session}`
  //     }
  //   });

  //   data = await response.json();
  //   data = data;
  //   console.log('data', data);
  //   const resolution = data.categories[0] || null;
  //   data = resolution;
  // }

  return <ActivityCategoryPage params={{ id: params.id, data }} />;
}
