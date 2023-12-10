import { api } from '../../../../../../core/services/api';
import SeeCoursePage from '../../../../../../modules/courses/SeeCoursePage';

export default async function SeeCourse({ params }: { params: { id: string } }) {
    const response = await api.get('/course', {
        params: {
            include: 'department',
            pageSize: 1000,
            id: params.id
        }
    });
    const { data } = await response.data;
    const course = data.courses[0] || null;
    return <SeeCoursePage params={{ id: params.id, data: course }} />;
}
