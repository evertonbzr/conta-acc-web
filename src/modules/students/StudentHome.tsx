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
import { Chart } from 'primereact/chart';
import { ProgressBar } from 'primereact/progressbar';

export default function StudentHomePage() {
  const mainLink = '/student/me/review';

  let emptyEntity: any = {
    id: undefined,
    activityId: undefined
  };

  const { course, user } = useInfo();

  const router = useRouter();

  const toastRef = React.useRef<Toast>(null);

  const [entities, setEntities] = useState<any[]>([]);
  const [entityDialog, setEntityDialog] = useState(false);
  const [categories, setCategories] = useState<any[]>([]); // Categories
  const [activities, setActivities] = useState<any[]>([]); // activities
  const [resolution, setResolution] = useState<any>(null); // resolutions

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [entity, setEntity] = useState<any>(emptyEntity);
  const [search, debouncedSearch, setSearch] = useDebounce('', 400);

  useEffect(() => {
    getEntities(debouncedSearch).then((data) => setEntities(data as any));
  }, [debouncedSearch]);

  useEffect(() => {
    if (entity.category) {
      getActivities(entity.category.id);
    }
  }, [entity.category]);

  const documentStyle = getComputedStyle(document.documentElement);

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
      const response = await api.get('student/me/review', {
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

  const getActivities = async (categoryId: string) => {
    setActivities([]);
    setLoading(true);
    try {
      const response = await api.get('/activities/' + categoryId, {
        params: {
          pageSize: 9999
        }
      });
      const { data } = await response.data;
      setActivities(data.activities);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const getResolutions = async () => {
    setActivities([]);
    setLoading(true);
    try {
      const response = await api.get('/resolution', {
        params: {
          isCurrent: true,
          include: 'categories'
        }
      });
      const { data } = await response.data;
      if (data.resolutions.length > 0) {
        const resolution = data.resolutions[0];
        const _categories = resolution.categories;
        setCategories(_categories);
        return resolution;
      }
      return null;
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    getEntities('').then((data) => setEntities(data as any));
    getResolutions().then((data) => setResolution(data as any));
  }, []);

  const handleSave = async () => {
    setSubmitted(true);
    try {
      const _entity = { activityId: entity.activity.activityId };

      if (entity.id) {
        await api.put(`${mainLink}/${entity.id}`, _entity);
        toastRef.current?.show({ severity: 'success', summary: 'Sucesso', detail: 'Registro atualizado com sucesso.' });
      } else {
        await api.post(mainLink, _entity);
        toastRef.current?.show({ severity: 'success', summary: 'Sucesso', detail: 'Registro criada com sucesso.' });
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
    <div className="flex-1">
      <div className="p-2">
        <div className="card mb-2">
          <p className="m-0 text-2xl">Olá {user.name}, seja bem-vindo(a)</p>
        </div>
      </div>
      {/* <div className="grid">
        <div className="col-12 md:col-6 lg:col-3">
          <div className=" card p-3  border-50 border-round">
            <div className="flex justify-content-between mb-3">
              <div>
                <span className="block text-500 font-medium mb-3">Atividades</span>
                <div className="text-900 font-medium text-xl">$2.100</div>
              </div>
              <div className="flex align-items-center justify-content-center bg-blue-100 border-round" style={{ width: '2.5rem', height: '2.5rem' }}>
                <i className="pi pi-book text-blue-500 text-xl"></i>
              </div>
            </div>
          </div>
        </div>
      </div> */}
      <div className="grid p-2">
        <div className="col-12 xl:col-8">
          <div className="card flex-1 p-5">
            <Toast ref={toastRef} />
            <ConfirmPopup />
            <div className="flex w-full align-items-center justify-content-between">
              <h5 className="mb-3">Atividades registradas</h5>
            </div>
            <div className="border-1 border-round border-300 mt-2">
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

              <DataTable size="small" paginator rows={5} stripedRows value={entities} emptyMessage="Nenhum dado encontrado." loading={loading}>
                <Column field="activityOnCategory.code" header="Código"></Column>
                <Column field="activityOnCategory.name" header="Nome"></Column>
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

            <Dialog closeOnEscape={false} visible={entityDialog} style={{ width: '550px' }} header={entity.id ? 'Editar Registro' : 'Novo Registro'} modal className="p-fluid" footer={entityDialogFooter} onHide={hideDialog}>
              <div className="field">
                <label htmlFor="category">Categoria</label>
                <Dropdown
                  value={entity.category}
                  onChange={(e: any) => {
                    onInputChange(e, 'category');
                  }}
                  options={categories}
                  optionLabel="name"
                  placeholder="Selecione uma categoria"
                  className={classNames('w-full', {
                    'p-invalid': submitted && !entity.category
                  })}
                  style={{ overflow: 'hidden' }}
                />
                {submitted && !entity.category && <small className="p-invalid">Categoria é requerido.</small>}
              </div>
              <div className="field">
                <label htmlFor="activity">Atividade</label>
                <Dropdown
                  value={entity.activity}
                  onChange={(e: any) => {
                    onInputChange(e, 'activity');
                  }}
                  options={activities}
                  optionLabel="name"
                  disabled={activities.length === 0}
                  placeholder="Selecione uma atividade"
                  className={classNames('w-full', {
                    'p-invalid': submitted && !entity.activity
                  })}
                  style={{ overflow: 'hidden' }}
                />
                {submitted && !entity.activity && <small className="p-invalid">Categoria é requerido.</small>}
              </div>
            </Dialog>
          </div>
        </div>
        <div className="col-12 xl:col-4">
          <div className="card">
            <div className="flex w-full align-items-center justify-content-between">
              <h5 className="mb-3">Status</h5>
            </div>

            <div className="mt-3">
              <span>Progresso</span>
              <ProgressBar color={documentStyle.getPropertyValue('--green-500')} className="mt-2" value={50}></ProgressBar>
            </div>

            <div className="mt-3">
              <span>Progresso</span>
              <ProgressBar color={documentStyle.getPropertyValue('--yellow-500')} className="mt-2" value={50}></ProgressBar>
            </div>

            <hr />
            <div>
              <span className="font-medium">Total</span>
              <ProgressBar color={documentStyle.getPropertyValue('--blue-500')} className="mt-2" value={50}></ProgressBar>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
