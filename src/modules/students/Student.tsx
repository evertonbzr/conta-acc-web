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
import { useDebounce } from 'primereact/hooks';
import { DateTime } from 'luxon';
import { InputTextarea } from 'primereact/inputtextarea';
import { useInfo } from '../../core/provider';
import { Dropdown } from 'primereact/dropdown';
import { useRouter } from 'next/navigation';

export default function StudentListPage() {
  const mainLink = '/student';

  let emptyEntity: any = {
    id: undefined,
    name: undefined,
    email: undefined,
    enrollId: undefined,
    password: undefined
  };

  const { course } = useInfo();

  const router = useRouter();

  const toastRef = React.useRef<Toast>(null);

  const [entities, setEntities] = useState<any[]>([]);
  const [entityDialog, setEntityDialog] = useState(false);
  const [secondaries, setSecondaries] = useState<any[]>([]); // Resolutions
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [entity, setEntity] = useState<any>(emptyEntity);
  const [search, debouncedSearch, setSearch] = useDebounce('', 400);

  useEffect(() => {
    getEntities(debouncedSearch).then((data) => setEntities(data as any));
  }, [debouncedSearch]);

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
    setEntity({ name: entity.user.name, email: entity.user.email, enrollId: entity.enrollId, id: entity.id });
    setSubmitted(false);
    setEntityDialog(true);
  };

  const getEntities = async (search = '') => {
    setLoading(true);
    try {
      const response = await api.get(mainLink, {
        params: {
          include: 'user',
          ...(search.length > 0 && { search })
        }
      });
      const { data } = await response.data;
      return data.students;
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const getSecondaries = async () => {
    setLoading(true);
    try {
      const response = await api.get('/resolution', {
        params: {
          pageSize: 9999
        }
      });
      const { data } = await response.data;
      return data.resolutions;
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getEntities('').then((data) => setEntities(data as any));
    getSecondaries().then((data) => setSecondaries(data as any));
  }, []);

  const handleSave = async () => {
    setSubmitted(true);
    try {
      const _entity = { ...entity };

      if (entity.id) {
        await api.put(`${mainLink}/${entity.id}`, _entity);
        toastRef.current?.show({ severity: 'success', summary: 'Sucesso', detail: 'Aluno atualizado com sucesso.' });
      } else {
        await api.post(mainLink, _entity);
        toastRef.current?.show({ severity: 'success', summary: 'Sucesso', detail: 'Aluno criada com sucesso.' });
      }
      await getEntities('').then((data) => setEntities(data as any));
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
      await api.delete(`${mainLink}/${id}`);
      toastRef.current?.show({ severity: 'success', summary: 'Sucesso', detail: 'Deletado com sucesso.' });
      setEntity(emptyEntity);
      setEntityDialog(false);
    } catch (error) {
      toastRef.current?.show({ severity: 'error', summary: 'Erro', detail: 'Erro ao deletar.' });
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
      <div className="flex w-full align-items-center justify-content-between">
        <div>
          <div className="text-3xl font-medium text-900 mb-3">Alunos</div>
          <div className="font-medium text-500 mb-3">Segue a lista de atividades cadastradas do curso: {course.name}</div>
        </div>
      </div>
      <div className="border-2 border-round border-300 mt-2">
        <div className="p-3 flex align-items-center justify-content-between">
          <div>
            <span className="p-input-icon-left">
              <i className="pi pi-search" />
              <InputText value={search} placeholder="Buscar" onChange={(e) => setSearch(e.target.value)} />
            </span>
          </div>
          <div>
            <Button label="Recarregar" size="small" icon="pi pi-refresh" className="mr-2" severity="info" onClick={() => getEntities()} />
            <Button label="Novo" size="small" icon="pi pi-plus" severity="success" className="mr-2" onClick={openNew} />
          </div>
        </div>

        <DataTable size="small" stripedRows value={entities} emptyMessage="Nenhum dado encontrado." loading={loading} className="border-round" tableStyle={{ minWidth: '50rem' }}>
          <Column field="user.name" style={{ maxWidth: '20%' }} header="Nome"></Column>
          <Column field="user.email" header="E-mail"></Column>

          <Column field="enrollId" header="Matrícula"></Column>

          <Column
            field="createdAt"
            header="Status"
            body={(rowData: any) => {
              return DateTime.fromJSDate(new Date(rowData.createdAt)).toFormat('dd/MM/yyyy');
            }}
          ></Column>

          <Column
            body={(rowData: any) => {
              return (
                <>
                  <span className="p-buttonset">
                    <Button size="small" icon="pi pi-pencil" severity="success" onClick={() => openEdit(rowData)} />
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

      <Dialog closeOnEscape={false} visible={entityDialog} style={{ width: '550px' }} header={entity.id ? 'Editar Aluno' : 'Nova Aluno'} modal className="p-fluid" footer={entityDialogFooter} onHide={hideDialog}>
        <div className="field">
          <label htmlFor="name">Nome</label>
          <InputText
            id="name"
            value={entity.name}
            onChange={(e) => onInputChange(e, 'name')}
            required
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
          {submitted && !entity.code && <small className="p-invalid">Código é requerido.</small>}
        </div>
        <div className="field">
          <label htmlFor="enrollId">Matrícula</label>
          <InputText
            id="enrollId"
            value={entity.enrollId}
            onChange={(e) => onInputChange(e, 'enrollId')}
            required
            className={classNames({
              'p-invalid': submitted && !entity.enrollId
            })}
          />
          {submitted && !entity.enrollId && <small className="p-invalid">Matrícula é requerido.</small>}
        </div>
        <div className="field">
          <label htmlFor="password">Senha</label>
          <InputText
            id="password"
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
