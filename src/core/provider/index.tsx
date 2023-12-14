'use client';

import { PrimeReactProvider } from 'primereact/api';
import { createContext, useContext } from 'react';
import { LayoutProvider } from '../../layout/context/layoutcontext';
import { ChildContainerProps } from '../../types/types';

interface ProviderProps {
  user: any;
  course?: any;
}

const InfoContext = createContext({} as ProviderProps);

const InfoProvider: React.FC<{ user: any; course?: any } & ChildContainerProps> = ({ children, user, course }) => {
  return (
    <InfoContext.Provider value={{ user, course }}>
      <PrimeReactProvider>
        <LayoutProvider>{children}</LayoutProvider>
      </PrimeReactProvider>
    </InfoContext.Provider>
  );
};

export const useInfo = () => useContext(InfoContext);

export { InfoProvider };
