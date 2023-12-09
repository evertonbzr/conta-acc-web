import React, { HTMLProps } from 'react';
import { ChildContainerProps } from '../types/types';
import { classNames } from 'primereact/utils';

type Props = ChildContainerProps & HTMLProps<HTMLDivElement>;

const AppContainer = ({ children, ...rest }: Props) => {
    return (
        <React.Fragment>
            <div
                className="m-auto"
                style={{
                    width: '100%',
                    maxWidth: '1152px'
                }}
                {...rest}
            >
                {children}
            </div>
        </React.Fragment>
    );
};

export default AppContainer;
