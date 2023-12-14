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
import { useGuard } from '../../core/hooks/useGuard';
import { InputTextarea } from 'primereact/inputtextarea';
import { Checkbox } from 'primereact/checkbox';
import { useInfo } from '../../core/provider';

export default function ResolutionPage() {
  const mainLink = '/resolution';
  let emptyEntity: any = {
    id: null,
    name: null,
    description: undefined,
    link: undefined,
    isCurrent: false
  };

  const { course } = useInfo();

  const toastRef = React.useRef<Toast>(null);

  const [entities, setEntities] = useState<any[]>([]);
  const [entityDialog, setEntityDialog] = useState(false);
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
      const response = await api.get(mainLink, {
        params: {
          ...(search.length > 0 && { search })
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
    getEntities().then((data) => setEntities(data as any));
  }, []);

  const handleSave = async () => {
    setSubmitted(true);
    try {
      const _entity = { ...entity, courseId: course.id };

      if (entity.id) {
        await api.put(`${mainLink}/${entity.id}`, _entity);
        toastRef.current?.show({ severity: 'success', summary: 'Sucesso', detail: 'Resolução atualizado com sucesso.' });
      } else {
        await api.post(mainLink, _entity);
        toastRef.current?.show({ severity: 'success', summary: 'Sucesso', detail: 'Resolução criada com sucesso.' });
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
      await api.delete(`${mainLink}/${id}`);
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

      <div className="text-3xl font-medium text-900 mb-3">Resoluções</div>
      <div className="font-medium text-500 mb-3">Segue a lista de resoluções cadastradas</div>
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
          <Column field="name" header="Nome"></Column>
          <Column
            field="createdAt"
            header="Data de criação"
            body={(rowData: any) => {
              return DateTime.fromJSDate(new Date(rowData.createdAt)).toFormat('dd/MM/yyyy');
            }}
          ></Column>
          <Column
            header="Ativo"
            dataType="boolean"
            style={{ minWidth: '8rem' }}
            body={(rowData: any) => {
              return (
                <i
                  className={classNames('ml-1 pi', {
                    'text-green-500 pi-check-circle': rowData.isCurrent,
                    'text-pink-500 pi-times-circle': !rowData.isCurrent
                  })}
                ></i>
              );
            }}
          />
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
                  </span>
                </>
              );
            }}
          ></Column>
        </DataTable>
      </div>

      <Dialog closeOnEscape={false} visible={entityDialog} style={{ width: '450px' }} header={entity.id ? 'Editar Resolução' : 'Nova Resolução'} modal className="p-fluid" footer={entityDialogFooter} onHide={hideDialog}>
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
          <label htmlFor="description">Descrição</label>
          <InputTextarea id="description" value={entity.description} onChange={(e) => onInputChange(e, 'description')} />
        </div>
        <div className="field">
          <label htmlFor="link">Link</label>
          <InputText id="link" value={entity.link} onChange={(e) => onInputChange(e, 'link')} />
        </div>

        <div className="field">
          <div className="flex align-items-center">
            <Checkbox
              inputId="isCurrent"
              name="isCurrent"
              onChange={(e) => {
                let _product = { ...entity };
                _product[`isCurrent`] = e.checked;

                setEntity(_product);
              }}
              checked={entity.isCurrent}
            />
            <label htmlFor="isCurrent" className="ml-2">
              Definir como resolução atual
            </label>
          </div>
          {entity.isCurrent && <p className="mt-2">Essa resolução irá substituir a atual.</p>}
        </div>
      </Dialog>
    </div>
  );
}
