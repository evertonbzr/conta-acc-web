/* eslint-disable @next/next/no-img-element */
'use client';
import nookies from 'nookies';

import { useRouter } from 'next/navigation';
import React, { useContext, useRef, useState } from 'react';
import { Checkbox } from 'primereact/checkbox';
import { Button } from 'primereact/button';
import { Password } from 'primereact/password';
import { InputText } from 'primereact/inputtext';
import { classNames } from 'primereact/utils';
import { LayoutContext } from '../../../../../layout/context/layoutcontext';
import Link from 'next/link';
import { Toast } from 'primereact/toast';
import { api } from '../../../../../core/services/api';

interface formDataType {
    [key: string]: FormDataEntryValue;
}
const LoginPage = () => {
    const responseBody: formDataType | any = {};

    const [password, setPassword] = useState('');
    const [checked, setChecked] = useState(false);
    const { layoutConfig } = useContext(LayoutContext);
    const toast = useRef<Toast>(null);

    const router = useRouter();
    const containerClassName = classNames('surface-ground flex align-items-center justify-content-center min-h-screen min-w-screen overflow-hidden', { 'p-input-filled': layoutConfig.inputStyle === 'filled' });

    const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget as HTMLFormElement);
        formData.forEach((value, property: string) => (responseBody[property] = value));
        if (!responseBody.email || !responseBody.password) {
            toast.current?.show({ severity: 'error', summary: 'Error Message', detail: 'E-mail ou senha vazio.', life: 3000 });
            return;
        }
        api.post('/manager/sign-in', responseBody)
            .then((response) => {
                const { data } = response.data;
                toast.current?.show({ severity: 'success', summary: 'Bem-vindo', detail: 'Login efetuado com sucesso.', life: 3000 });
                nookies.set(null, 'session', data.token, { path: '/' });
                location.reload();
            })
            .catch((error) => {
                toast.current?.show({ severity: 'error', summary: 'Error Message', detail: 'E-mail ou senha incorretos.', life: 3000 });
            });
    };

    return (
        <div className={containerClassName}>
            <Toast ref={toast} />

            <div className="flex flex-column align-items-center justify-content-center">
                <img src={`/layout/images/logo-${layoutConfig.colorScheme === 'light' ? 'dark' : 'white'}.svg`} alt="Sakai logo" className="mb-5 w-6rem flex-shrink-0" />
                <div
                    style={{
                        borderRadius: '56px',
                        padding: '0.3rem',
                        background: 'linear-gradient(180deg, var(--gray-900) 10%, rgba(33, 150, 243, 0) 30%)'
                    }}
                >
                    <div className="w-full surface-card py-8 px-5 sm:px-8" style={{ borderRadius: '53px' }}>
                        <div className="text-center mb-5">
                            <div className="text-900 text-3xl font-medium mb-3">Bem-vindo ao ContaACC</div>
                            <span className="text-600 font-medium">
                                Não tem conta ainda? <Link href="/auth/register">Cadastre-se</Link>
                            </span>
                        </div>
                        <form onSubmit={handleLogin}>
                            <div>
                                <label htmlFor="email1" className="block text-900 text-xl font-medium mb-2">
                                    E-mail
                                </label>
                                <InputText id="email1" name="email" type="text" placeholder="E-mail" className="w-full md:w-30rem mb-5" style={{ padding: '1rem' }} />

                                <label htmlFor="password1" className="block text-900 font-medium text-xl mb-2">
                                    Senha
                                </label>
                                <Password
                                    inputId="password1"
                                    name="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    feedback={false}
                                    placeholder="Senha"
                                    toggleMask
                                    className="w-full mb-5"
                                    inputClassName="w-full p-3 md:w-30rem"
                                ></Password>

                                <div className="flex align-items-center justify-content-between mb-5 gap-5">
                                    <div className="flex align-items-center">
                                        <Checkbox inputId="rememberme1" checked={checked} onChange={(e) => setChecked(e.checked ?? false)} className="mr-2"></Checkbox>
                                        <label htmlFor="rememberme1">Remember me</label>
                                    </div>
                                    <a className="font-medium no-underline ml-2 text-right cursor-pointer" style={{ color: 'var(--primary-color)' }}>
                                        Forgot password?
                                    </a>
                                </div>
                                <Button type="submit" label="Sign In" severity="success" className="w-full" onClick={() => router.push('/app')}></Button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
