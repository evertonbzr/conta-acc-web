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
import { Checkbox } from 'primereact/checkbox';

export default function ActivityCategoryPage({ params }: { params: { id: string; data: any } }) {
  const mainLink = '/activities';

  const { id } = params;

  let emptyEntity: any = {
    id: undefined,
    name: null,
    description: undefined,
    code: null,
    workloadSemester: undefined,
    workloadActivity: undefined,
    workloadInput: false
  };

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
    setEntity(entity);
    setSubmitted(false);
    setEntityDialog(true);
  };

  const getEntities = async (search = '') => {
    setLoading(true);
    try {
      const response = await api.get(mainLink + '/' + id, {
        params: {
          ...(search.length > 0 && { search })
        }
      });
      const { data } = await response.data;
      return data.activities;
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
      const _entity = { ...entity, categoryId: id };
      _entity.workloadSemester = _entity.workloadSemester ? parseInt(_entity.workloadSemester) : null;
      _entity.workloadActivity = _entity.workloadActivity ? parseInt(_entity.workloadActivity) : null;

      if (entity.id) {
        await api.put(`${mainLink}/${entity.id}`, _entity);
        toastRef.current?.show({ severity: 'success', summary: 'Sucesso', detail: 'Atividade atualizado com sucesso.' });
      } else {
        await api.post(mainLink, _entity);
        toastRef.current?.show({ severity: 'success', summary: 'Sucesso', detail: 'Atividade criada com sucesso.' });
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
          <div className="text-3xl font-medium text-900 mb-3">Atividades</div>
          <div className="font-medium text-500 mb-3">Segue a lista de atividades cadastradas</div>
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
            <Button
              label="Recarregar"
              size="small"
              icon="pi pi-refresh"
              className="mr-2"
              severity="info"
              onClick={() => getEntities().then((data) => setEntities(data as any))}
            />
            <Button label="Novo" size="small" icon="pi pi-plus" severity="success" className="mr-2" onClick={openNew} />
          </div>
        </div>

        <DataTable
          size="small"
          stripedRows
          value={entities}
          emptyMessage="Nenhum dado encontrado."
          loading={loading}
          className="border-round"
          tableStyle={{ minWidth: '50rem' }}
        >
          <Column field="code" header="Código" rowSpan={1}></Column>
          <Column field="name" style={{ width: '50%' }} header="Nome" rowSpan={1}></Column>
          <Column
            field="workloadActivity"
            header="CHA"
            body={(rowData: any) => {
              return rowData.workloadActivity ? rowData.workloadActivity : '-';
            }}
          ></Column>
          <Column
            field="workloadSemester"
            header="CHS"
            body={(rowData: any) => {
              return rowData.workloadSemester ? rowData.workloadSemester : '-';
            }}
          ></Column>

          <Column
            field="createdAt"
            header="Data de criação"
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

      <Dialog
        closeOnEscape={false}
        visible={entityDialog}
        style={{ width: '550px' }}
        header={entity.id ? 'Editar Atividade' : 'Nova Atividade'}
        modal
        className="p-fluid"
        footer={entityDialogFooter}
        onHide={hideDialog}
      >
        <div className="field">
          <label htmlFor="code">Código</label>
          <InputText
            id="code"
            value={entity.code}
            onChange={(e) => onInputChange(e, 'code')}
            required
            autoFocus
            placeholder='Ex: "AT01"'
            className={classNames({
              'p-invalid': submitted && !entity.code
            })}
          />
          {submitted && !entity.code && <small className="p-invalid">Código é requerido.</small>}
        </div>
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
        <div className="p-fluid formgrid grid">
          <div className="field col-6">
            <label htmlFor="workloadActivity">CHA</label>
            <InputText
              id="workloadActivity"
              keyfilter="int"
              value={entity.workloadActivity}
              type="text"
              disabled={entity.workloadInput}
              onChange={(e) => onInputChange(e, 'workloadActivity')}
            />
            <div className="flex mt-2 align-items-center">
              <Checkbox
                inputId="workloadInput"
                name="workloadInput"
                onChange={(e) => {
                  let _entity = { ...entity };
                  _entity[`workloadInput`] = e.checked;
                  _entity[`workloadActivity`] = '';

                  console.log(_entity);

                  setEntity(_entity);
                }}
                checked={entity.workloadInput}
              />
              <label htmlFor="workloadInput" className="ml-2">
                Valor do certificado
              </label>
            </div>
          </div>
          <div className="field col-6">
            <label htmlFor="workloadSemester">CHS</label>
            <InputText
              id="workloadSemester"
              keyfilter="int"
              value={entity.workloadSemester}
              type="text"
              onChange={(e) => onInputChange(e, 'workloadSemester')}
            />
          </div>
        </div>

        <div className="field">
          <label htmlFor="description">Descrição</label>
          <InputTextarea id="description" value={entity.description} onChange={(e) => onInputChange(e, 'description')} />
        </div>
      </Dialog>
    </div>
  );
}
