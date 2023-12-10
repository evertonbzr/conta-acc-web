import { ItemMenu } from '../../types/layout';

export const menu: ItemMenu[] = [
    {
        label: 'Inicio',
        icon: 'pi pi-fw pi-home',
        to: '/'
    },
    {
        label: 'Cursos',
        icon: 'pi pi-fw pi-book',
        items: [
            {
                label: 'Cursos',
                icon: 'pi pi-fw pi-book',
                to: '/cursos'
            },
            {
                label: 'Crear Curso',
                icon: 'pi pi-fw pi-book',
                to: '/cursos/new'
            }
        ]
    },
    {
        label: 'Fodas',
        icon: 'pi pi-fw pi-book',
        items: [
            {
                label: 'Cursos',
                icon: 'pi pi-fw pi-book',
                to: '/cursos'
            },
            {
                label: 'Crear Curso',
                icon: 'pi pi-fw pi-book',
                to: '/cursos/new'
            }
        ]
    }
];

export const sysadmin: ItemMenu[] = [
    {
        label: 'Inicio',
        icon: 'pi pi-fw pi-home',
        to: '/app'
    },
    {
        label: 'Departamentos',
        icon: 'pi pi-fw pi-book',
        to: '/app/departaments'
    }
];
