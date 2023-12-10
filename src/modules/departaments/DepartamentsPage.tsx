'use client';

import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { classNames } from 'primereact/utils';
import React, { useState } from 'react';

export default function DepartamentsPage() {
    let emptyEntity: any = {
        name: '',
        sede: ''
    };

    const [productDialog, setProductDialog] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [entity, setEntity] = useState<any>(emptyEntity);

    const saveProduct = () => {
        setSubmitted(true);
    };

    const onInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, name: string) => {
        const val = (e.target && e.target.value) || '';
        let _product = { ...entity };
        _product[`${name}`] = val;

        setEntity(_product);
    };

    const hideDialog = () => {
        setSubmitted(false);
        setProductDialog(false);
    };

    const openNew = () => {
        setEntity(emptyEntity);
        setSubmitted(false);
        setProductDialog(true);
    };

    const productDialogFooter = (
        <>
            <Button label="Cancelar" icon="pi pi-times" text onClick={hideDialog} />
            <Button label="Salvar" icon="pi pi-check" onClick={saveProduct} />
        </>
    );
    return (
        <div className="surface-border border-round surface-section flex-1 p-5">
            <div className="text-3xl font-medium text-900 mb-3">Departamentos</div>
            <div className="font-medium text-500 mb-3">Segue a lista de departamentos cadastrados</div>
            <div className="border-2 border-round border-300 mt-2">
                <div className="p-3 flex justify-content-end">
                    <Button label="Novo" size="small" icon="pi pi-plus" severity="success" className=" mr-2" onClick={openNew} />
                </div>

                <DataTable
                    value={[
                        {
                            sede: 'Caicó',
                            name: 'CERES - Centro de Ensino Superior do Seridó'
                        }
                    ]}
                    emptyMessage="Nenhum curso encontrado."
                    loading={false}
                    className="border-round"
                    tableStyle={{ minWidth: '50rem' }}
                >
                    <Column field="name" header="Nome"></Column>
                    <Column field="sede" header="Sede"></Column>
                    <Column header=""></Column>
                </DataTable>
            </div>

            <Dialog closeOnEscape={false} visible={productDialog} style={{ width: '450px' }} header="Cadastro de departamento" modal className="p-fluid" footer={productDialogFooter} onHide={hideDialog}>
                <div className="field">
                    <label htmlFor="name">Nome</label>
                    <InputText
                        id="name"
                        value={entity.name}
                        onChange={(e) => onInputChange(e, 'name')}
                        required
                        autoFocus
                        className={classNames({
                            'p-invalid': submitted && !entity.name
                        })}
                    />
                    {submitted && !entity.name && <small className="p-invalid">Nome é requerido.</small>}
                </div>
                <div className="field">
                    <label htmlFor="sede">Sede</label>
                    <InputText
                        id="sede"
                        value={entity.sede}
                        onChange={(e) => onInputChange(e, 'sede')}
                        required
                        autoFocus
                        className={classNames({
                            'p-invalid': submitted && !entity.sede
                        })}
                    />
                    {submitted && !entity.name && <small className="p-invalid">Sede é requerido.</small>}
                </div>
            </Dialog>
        </div>
    );
}
