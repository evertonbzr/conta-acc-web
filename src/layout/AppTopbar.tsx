/* eslint-disable @next/next/no-img-element */
'use client';

import { useRouter } from 'next/navigation';

import Link from 'next/link';
import { classNames } from 'primereact/utils';
import React, { forwardRef, useContext, useImperativeHandle, useRef } from 'react';
import { AppTopbarRef } from '../types/types';
import { LayoutContext } from './context/layoutcontext';
import AppContainer from './AppContainer';
import { Menu } from 'primereact/menu';
import { menu } from './constants';
import { ItemMenu } from '../types/layout';
import { Avatar } from 'primereact/avatar';

const MenuLink = ({ item }: { item: ItemMenu }) => {
    const menuLeft = useRef<Menu>(null);
    const router = useRouter();

    return (
        <li>
            <a
                onClick={(event) => menuLeft.current!.toggle(event)}
                className="p-ripple flex px-6 p-3 lg:px-3 lg:py-2 align-items-center text-gray-400 hover:text-white hover:bg-gray-800 font-medium border-round cursor-pointer transition-colors transition-duration-150"
            >
                <i className={classNames('mr-2', item.icon)}></i>
                <span>{item.label}</span>
                <span className="p-ink" style={{ height: '120.208px', width: '120.208px' }}></span>
            </a>
            <Menu
                ref={menuLeft}
                popup
                className="bg-gray-900"
                model={item.items?.map((el) => ({
                    template: (item, options) => {
                        return (
                            <li>
                                <Link href={el.to as string} className="p-ripple flex p-3 align-items-center text-gray-400 hover:text-white hover:bg-gray-800 transition-colors transition-duration-150 cursor-pointer">
                                    <i className={classNames('mr-2', el.icon)}></i>
                                    <span className="font-medium">{el.label}</span>
                                    <span
                                        role="presentation"
                                        className="p-ink"
                                        style={{
                                            height: '0px',
                                            width: '0px'
                                        }}
                                    ></span>
                                </Link>
                            </li>
                        );
                    }
                }))}
            />
        </li>
    );
};

const AppTopbar = forwardRef<AppTopbarRef>((props, ref) => {
    const { layoutConfig, layoutState, onMenuToggle, showProfileSidebar } = useContext(LayoutContext);
    const menubuttonRef = useRef(null);
    const topbarmenuRef = useRef(null);
    const topbarmenubuttonRef = useRef(null);

    useImperativeHandle(ref, () => ({
        menubutton: menubuttonRef.current,
        topbarmenu: topbarmenuRef.current,
        topbarmenubutton: topbarmenubuttonRef.current
    }));

    return (
        <div className="bg-gray-900" style={{ height: '250px' }}>
            <div className="py-3 px-5 flex align-items-center justify-content-between lg:justify-content-center relative lg:static" style={{ minHeight: '80px' }}>
                <img src={`/layout/images/logo-${layoutConfig.colorScheme !== 'light' ? 'white' : 'white'}.svg`} alt="Image" height="40" className="mr-0 lg:mr-6" />
                <a className="p-ripple cursor-pointer block lg:hidden text-gray-400">
                    <i className="pi pi-bars text-4xl"></i>
                    <span role="presentation" className="p-ink" style={{ height: '0px', width: '0px' }}></span>
                </a>
            </div>
            <div className="border-top-1 border-gray-800"></div>
            <AppContainer>
                <div className="pt-3 align-items-center flex-grow-1 justify-content-between hidden lg:flex absolute lg:static w-full bg-gray-900 left-0 top-100 z-1">
                    <ul className="list-none p-0 m-0 flex lg:align-items-center select-none flex-column lg:flex-row">
                        {menu.map((item) => {
                            if (item.items?.length) {
                                return <MenuLink item={item} />;
                            }

                            return (
                                <li>
                                    <Link
                                        href={item.to as string}
                                        className="p-ripple flex px-6 p-3 lg:px-3 lg:py-2 align-items-center text-gray-400 hover:text-white hover:bg-gray-800 font-medium border-round cursor-pointer transition-colors transition-duration-150"
                                    >
                                        <i className="pi pi-home mr-2"></i>
                                        <span>{item.label}</span>
                                        <span className="p-ink" style={{ height: '99.9802px', width: '99.9802px' }}></span>
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                    <ul className="list-none p-0 m-0 flex lg:align-items-center select-none flex-column lg:flex-row border-top-1 border-gray-800 lg:border-top-none">{/* ... rest of the code ... */}</ul>
                </div>
            </AppContainer>
        </div>
    );
});

AppTopbar.displayName = 'AppTopbar';

export default AppTopbar;
