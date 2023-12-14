'use client';

import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { ConfirmPopup, confirmPopup } from 'primereact/confirmpopup';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { classNames } from 'primereact/utils';
import React, { useEffect, useState } from 'react';
import { api } from '../../core/services/api';
import { useDebounce } from 'primereact/hooks';
import { useRouter } from 'next/navigation';
import { Password } from 'primereact/password';
import { AxiosError } from 'axios';
import { useInfo } from '../../core/provider';

export default function CoordinatorPage() {
  let emptyEntity: any = {
    id: null,
    name: '',
    email: '',
    password: ''
  };

  const toastRef = React.useRef<Toast>(null);

  const { course } = useInfo();

  const [entities, setEntities] = useState<any[]>([]);
  const [secondaries, setSecondaries] = useState<any[]>([]); // Course
  const [entityDialog, setEntityDialog] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [entity, setEntity] = useState<any>(emptyEntity);

  const [search, debouncedSearch, setSearch] = useDebounce('', 400);

  const router = useRouter();

  // useEffect(() => {
  // getEntities(debouncedSearch).then((data) => setEntities(data as any));
  // }, [debouncedSearch]);

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, name: string) => {
    const val = (e.target && e.target.value) || '';
    let _entity = { ...entity };
    _entity[`${name}`] = val;

    setEntity(_entity);
  };

  const hideDialog = () => {
    setSubmitted(false);
    setEntityDialog(false);
  };

  const openNew = () => {
    // if (secondaries.length === 0) {
    //     getSecondaries().then((data) => setSecondaries(data as any));
    // }
    setEntity(emptyEntity);
    setSubmitted(false);
    setEntityDialog(true);
  };

  const openEdit = (entity: any) => {
    // if (secondaries.length === 0) {
    //     getSecondaries().then((data) => setSecondaries(data as any));
    // }
    setEntity({ ...entity, password: undefined });
    setSubmitted(false);
    setEntityDialog(true);
  };

  const getEntities = async (search = '') => {
    setLoading(true);
    try {
      const response = await api.get('/user', {
        params: {
          courseId: course.id,
          role: 'COORDINATOR'
        }
      });
      const { data } = await response.data;
      return data.users;
    } catch (error) {
      toastRef.current?.show({ severity: 'error', summary: 'Erro', detail: 'Erro ao buscar coordenadores.' });
    } finally {
      setLoading(false);
    }
  };

  const getSecondaries = async () => {
    setLoading(true);
    try {
      const response = await api.get('/department');
      const { data } = await response.data;
      console.log(data);
      return [];
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getEntities().then((data) => setEntities(data as any));
    // getDepartaments().then((data) => setDepartaments(data as any));
  }, []);

  const handleSave = async () => {
    setSubmitted(true);
    const _entity = { ...entity, courseId: course.id, role: 'COORDINATOR' };
    try {
      if (entity.id) {
        await api.put(`/user/${entity.id}`, _entity);
        toastRef.current?.show({ severity: 'success', summary: 'Sucesso', detail: 'Coordernador atualizado com sucesso.' });
      } else {
        await api.post('/user', _entity);
        toastRef.current?.show({ severity: 'success', summary: 'Sucesso', detail: 'Coordernador criado com sucesso.' });
      }
      await getEntities().then((data) => setEntities(data as any));
      setEntity(emptyEntity);
      setEntityDialog(false);
    } catch (error: any) {
      if (error instanceof AxiosError) {
        toastRef.current?.show({ severity: 'error', summary: 'Erro', detail: error.response?.data.error });
      } else {
        toastRef.current?.show({ severity: 'error', summary: 'Erro', detail: error.message });
      }
    } finally {
      setSubmitted(false);
    }
  };

  const handleDelete = async (id: string) => {
    setSubmitted(true);
    try {
      await api.delete(`/department/${id}`);
      toastRef.current?.show({ severity: 'success', summary: 'Sucesso', detail: 'Coordenador deletado com sucesso.' });
      setEntity(emptyEntity);
      setEntityDialog(false);
    } catch (error) {
      toastRef.current?.show({ severity: 'error', summary: 'Erro', detail: 'Erro ao deletar Coordenador.' });
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
      <div className="text-3xl font-medium text-900 mb-3">Coordenador de horas</div>
      <div className="font-medium text-500 mb-3">Atual coordenador de horas</div>
      <div className="border-2 border-round border-300 mt-2">
        <div className="p-3 flex align-items-center justify-content-between">
          <div>
            {/* <span className="p-input-icon-left">
                            <i className="pi pi-search" />
                            <InputText value={search} placeholder="Buscar" onChange={(e) => setSearch(e.target.value)} />
                        </span> */}
          </div>
          <div>
            <Button size="small" label="Recarregar" icon="pi pi-refresh" className="mr-2" severity="info" onClick={() => getEntities()} />
            <Button disabled={entities.length > 0} size="small" label="Novo" icon="pi pi-plus" severity="success" className=" mr-2" onClick={openNew} />
          </div>
        </div>

        <DataTable size="small" stripedRows value={entities} emptyMessage="Nenhum coordenardor encontrado." loading={loading} className="border-round" tableStyle={{ minWidth: '50rem' }}>
          <Column field="name" header="Nome"></Column>
          <Column field="email" header="E-mail"></Column>
          <Column
            style={{ width: '10rem' }}
            body={(rowData: any) => {
              return (
                <>
                  <span className="p-buttonset">
                    {/* <Button size="small" icon="pi pi-info-circle" severity="info" onClick={() => router.push(`/app/course/${rowData.id}`)} /> */}
                    <Button icon="pi pi-pencil" size="small" severity="success" onClick={() => openEdit(rowData)} />
                    <Button
                      icon="pi pi-trash"
                      size="small"
                      severity="warning"
                      onClick={(event) => {
                        confirmPopup({
                          target: event.currentTarget,
                          message: 'Deseja realmente excluir?',
                          icon: 'pi pi-info-circle',
                          acceptLabel: 'Sim',
                          rejectLabel: 'Não',
                          acceptClassName: 'p-button-danger',
                          accept: () => handleDelete(rowData.id),
                          reject: () => {}
                        });
                      }}
                    />
                  </span>
                </>
              );
            }}
          ></Column>
        </DataTable>
      </div>

      <Dialog closeOnEscape={false} visible={entityDialog} style={{ width: '450px' }} header={entity.id ? 'Editar coordenador de horas' : 'Novo coordenador de horas'} modal className="p-fluid" footer={entityDialogFooter} onHide={hideDialog}>
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
          <label htmlFor="email">E-mail</label>
          <InputText
            id="email"
            value={entity.email}
            onChange={(e) => onInputChange(e, 'email')}
            required
            className={classNames({
              'p-invalid': submitted && !entity.email
            })}
          />
          {submitted && !entity.email && <small className="p-invalid">E-mail é requerido.</small>}
        </div>

        <div className="field">
          <label htmlFor="password">Senha</label>
          <Password
            id="password"
            toggleMask
            feedback={false}
            value={entity.password}
            onChange={(e) => onInputChange(e, 'password')}
            required
            className={classNames({
              'p-invalid': submitted && !entity.password
            })}
          />
          {submitted && !entity.password && <small className="p-invalid">Senha é requerido.</small>}
        </div>
      </Dialog>
    </div>
  );
}
