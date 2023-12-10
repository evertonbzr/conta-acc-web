'use client';

import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { classNames } from 'primereact/utils';
import React, { useEffect, useState } from 'react';
import { api } from '../../core/services/api';
import { Toast } from 'primereact/toast';
import { ConfirmPopup, confirmPopup } from 'primereact/confirmpopup';

export default function DepartamentsPage() {
    let emptyEntity: any = {
        id: null,
        name: '',
        sede: ''
    };

    const toastRef = React.useRef<Toast>(null);

    const [entities, setEntities] = useState<any[]>([]);
    const [entityDialog, setEntityDialog] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
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
        setEntityDialog(false);
    };

    const openNew = () => {
        setEntity(emptyEntity);
        setSubmitted(false);
        setEntityDialog(true);
    };

    const openEdit = (entity: any) => {
        setEntity(entity);
        setSubmitted(false);
        setEntityDialog(true);
    };

    const getEntities = async () => {
        setLoading(true);
        try {
            const response = await api.get('/departament');
            const { data } = await response.data;
            return data.departaments;
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getEntities().then((data) => setEntities(data as any));
    }, []);

    const handleSave = async () => {
        setSubmitted(true);
        try {
            if (entity.id) {
                await api.put(`/departament/${entity.id}`, entity);
                toastRef.current?.show({ severity: 'success', summary: 'Sucesso', detail: 'Departamento atualizado com sucesso.' });
            } else {
                await api.post('/departament', entity);
                toastRef.current?.show({ severity: 'success', summary: 'Sucesso', detail: 'Departamento criado com sucesso.' });
            }
            await getEntities().then((data) => setEntities(data as any));
            setEntity(emptyEntity);
            setEntityDialog(false);
        } catch (error) {
            console.log(error);
        } finally {
            setSubmitted(false);
        }
    };

    const handleDelete = async (id: string) => {
        setSubmitted(true);
        try {
            await api.delete(`/departament/${id}`);
            toastRef.current?.show({ severity: 'success', summary: 'Sucesso', detail: 'Departamento deletado com sucesso.' });
            setEntity(emptyEntity);
            setEntityDialog(false);
        } catch (error) {
            toastRef.current?.show({ severity: 'error', summary: 'Erro', detail: 'Erro ao deletar departamento.' });
        } finally {
            setSubmitted(false);
        }
    };

    const entityDialogFooter = (
        <>
            <Button label="Cancelar" icon="pi pi-times" text onClick={hideDialog} />
            <Button label="Salvar" icon="pi pi-check" onClick={handleSave} />
        </>
    );
    return (
        <div className="surface-border border-round surface-section flex-1 p-5">
            <Toast ref={toastRef} />
            <ConfirmPopup />

            <div className="text-3xl font-medium text-900 mb-3">Departamentos</div>
            <div className="font-medium text-500 mb-3">Segue a lista de departamentos cadastrados</div>
            <div className="border-2 border-round border-300 mt-2">
                <div className="p-3 flex justify-content-end">
                    <Button label="Novo" size="small" icon="pi pi-plus" severity="success" className=" mr-2" onClick={openNew} />
                </div>

                <DataTable value={entities} emptyMessage="Nenhum departamento encontrado." loading={loading} className="border-round" tableStyle={{ minWidth: '50rem' }}>
                    <Column field="name" header="Nome"></Column>
                    <Column field="sede" header="Sede"></Column>
                    <Column
                        body={(rowData: any) => {
                            return (
                                <>
                                    <Button icon="pi pi-pencil" rounded severity="success" className="mr-2" onClick={() => openEdit(rowData)} />
                                    <Button
                                        icon="pi pi-trash"
                                        rounded
                                        severity="warning"
                                        onClick={(event) => {
                                            confirmPopup({
                                                target: event.currentTarget,
                                                message: 'Deseja realmente excluir este departamento?',
                                                icon: 'pi pi-info-circle',
                                                acceptLabel: 'Sim',
                                                rejectLabel: 'Não',
                                                acceptClassName: 'p-button-danger',
                                                accept: () => handleDelete(rowData.id),
                                                reject: () => {}
                                            });
                                        }}
                                    />
                                </>
                            );
                        }}
                    ></Column>
                </DataTable>
            </div>

            <Dialog closeOnEscape={false} visible={entityDialog} style={{ width: '450px' }} header={entity.id ? 'Editar Departamento' : 'Novo Departamento'} modal className="p-fluid" footer={entityDialogFooter} onHide={hideDialog}>
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
