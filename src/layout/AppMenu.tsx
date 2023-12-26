/* eslint-disable @next/next/no-img-element */

import React, { useContext } from 'react';
import AppMenuitem from './AppMenuitem';
import { LayoutContext } from './context/layoutcontext';
import { MenuProvider } from './context/menucontext';
import Link from 'next/link';
import { AppMenuItem } from '../types/types';

const AppMenu = () => {
  const { layoutConfig } = useContext(LayoutContext);

  return (
    <MenuProvider>
      <ul className="layout-menu">
        <Link href="https://blocks.primereact.org" target="_blank" style={{ cursor: 'pointer' }}>
          <img
            alt="Prime Blocks"
            className="w-full mt-3"
            src={`/layout/images/banner-primeblocks${layoutConfig.colorScheme === 'light' ? '' : '-dark'}.png`}
          />
        </Link>
      </ul>
    </MenuProvider>
  );
};

export default AppMenu;
