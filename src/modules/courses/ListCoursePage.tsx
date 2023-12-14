'use client';

import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { ConfirmPopup, confirmPopup } from 'primereact/confirmpopup';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { classNames } from 'primereact/utils';
import React, { useEffect, useState } from 'react';
import { api } from '../../core/services/api';
import { Dropdown } from 'primereact/dropdown';
import { useDebounce } from 'primereact/hooks';
import { useRouter } from 'next/navigation';

export default function ListCoursePage() {
  let emptyEntity: any = {
    id: null,
    name: '',
    department: ''
  };

  const toastRef = React.useRef<Toast>(null);

  const [entities, setEntities] = useState<any[]>([]);
  const [departaments, setDepartaments] = useState<any[]>([]);
  const [entityDialog, setEntityDialog] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [entity, setEntity] = useState<any>(emptyEntity);

  const [search, debouncedSearch, setSearch] = useDebounce('', 400);

  const router = useRouter();

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
    if (departaments.length === 0) {
      getDepartaments().then((data) => setDepartaments(data as any));
    }
    setEntity(emptyEntity);
    setSubmitted(false);
    setEntityDialog(true);
  };

  const openEdit = (entity: any) => {
    if (departaments.length === 0) {
      getDepartaments().then((data) => setDepartaments(data as any));
    }
    setEntity(entity);
    setSubmitted(false);
    setEntityDialog(true);
  };

  const getEntities = async (search = '') => {
    setLoading(true);
    try {
      const response = await api.get('/course', {
        params: {
          include: 'department',
          pageSize: 1000,
          ...(search.length > 0 && { search })
        }
      });
      const { data } = await response.data;
      return data.courses;
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const getDepartaments = async () => {
    setLoading(true);
    try {
      const response = await api.get('/department');
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
    getDepartaments().then((data) => setDepartaments(data as any));
  }, []);

  const handleSave = async () => {
    setSubmitted(true);
    const _entity = { ...entity, departmentId: entity.department.id, department: undefined };
    try {
      if (entity.id) {
        await api.put(`/course/${entity.id}`, _entity);
        toastRef.current?.show({ severity: 'success', summary: 'Sucesso', detail: 'Departamento atualizado com sucesso.' });
      } else {
        await api.post('/course', _entity);
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
      await api.delete(`/department/${id}`);
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
      <div className="text-3xl font-medium text-900 mb-3">Cursos</div>
      <div className="font-medium text-500 mb-3">Segue a lista de cursos cadastrados</div>
      <div className="border-2 border-round border-300 mt-2">
        <div className="p-3 flex align-items-center justify-content-between">
          <div>
            <span className="p-input-icon-left">
              <i className="pi pi-search" />
              <InputText value={search} placeholder="Buscar" onChange={(e) => setSearch(e.target.value)} />
            </span>
          </div>
          <div>
            <Button size="small" label="Recarregar" icon="pi pi-refresh" className="mr-2" severity="info" onClick={() => getEntities()} />
            <Button size="small" label="Novo" icon="pi pi-plus" severity="success" className=" mr-2" onClick={openNew} />
          </div>
        </div>

        <DataTable size="small" stripedRows value={entities} emptyMessage="Nenhum curso encontrado." loading={loading} className="border-round" tableStyle={{ minWidth: '50rem' }}>
          <Column field="name" header="Nome"></Column>
          <Column field="department.sede" header="Sede"></Column>
          <Column field="department.name" header="Departamento"></Column>
          <Column
            style={{ minWidth: '10rem' }}
            body={(rowData: any) => {
              return (
                <>
                  <span className="p-buttonset">
                    <Button size="small" icon="pi pi-info-circle" severity="info" onClick={() => router.push(`/app/course/${rowData.id}`)} />
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

      <Dialog closeOnEscape={false} visible={entityDialog} style={{ width: '450px' }} header={entity.id ? 'Editar Curso' : 'Novo Curso'} modal className="p-fluid" footer={entityDialogFooter} onHide={hideDialog}>
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
          <label htmlFor="department">Departamento</label>
          <Dropdown
            value={entity.department}
            onChange={(e: any) => {
              onInputChange(e, 'department');
            }}
            options={departaments}
            optionLabel="name"
            placeholder="Selecione o departamento"
            className={classNames('w-full', {
              'p-invalid': submitted && !entity.department
            })}
            style={{ overflow: 'hidden' }}
          />
          {submitted && !entity.department && <small className="p-invalid">Departamento é requerido.</small>}
        </div>
      </Dialog>
    </div>
  );
}
