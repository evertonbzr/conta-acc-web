'use client';

import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { classNames } from 'primereact/utils';
import React, { useEffect, useMemo, useState } from 'react';
import { api, sdk } from '../../core/services/api';
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
import { Tooltip } from 'primereact/tooltip';

export default function StudentHomePage() {
  const mainLink = '/student/me/review';

  let emptyEntity: any = {
    id: undefined,
    activityId: undefined,
    name: null,
    link: undefined
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
  const [info, setInfo] = useState<any>(null); // info
  const [search, debouncedSearch, setSearch] = useDebounce('', 400);

  const percent = useMemo(() => {
    if (info) {
      return Math.round((info.sumOfPoints / info.resolution.totalPoints) * 100);
    }
    return 0;
  }, [info]);

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
      const response = await sdk.student.listReviewActivities({
        query: {
          ...(search.length > 0 && { search })
        }
      });
      const { data } = await response.data;
      if (data.activities) {
        return data.activities.filter((item: any) => item.status !== 'REJECTED');
      }
      return [];
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const getInfo = async () => {
    setLoading(true);
    try {
      const response = await sdk.student.infoActivities({
        query: {}
      });
      const { data } = await response.data;
      return data;
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
      // const response = await api.get('/activities/' + categoryId, {
      //   params: {
      //     pageSize: 9999
      //   }
      // });

      const response = await sdk.activities.listActivities({
        params: {
          categoryId
        },
        query: {
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
    getInfo().then((data) => setInfo(data as any));
  }, []);

  const handleSave = async () => {
    setSubmitted(true);
    try {
      const _entity = {
        activityId: entity.activity.activityId,
        name: entity.name,
        link: entity.link,
        ...(entity.value ? { value: parseInt(entity.value) } : { value: null })
      };

      if (entity.id) {
        await api.put(`${mainLink}/${entity.id}`, _entity);
        toastRef.current?.show({ severity: 'success', summary: 'Sucesso', detail: 'Registro atualizado com sucesso.' });
      } else {
        await sdk.student.newActivity({
          body: _entity
        });
        // await api.post(mainLink, _entity);
        toastRef.current?.show({ severity: 'success', summary: 'Sucesso', detail: 'Registro criada com sucesso.' });
      }
      await getEntities('').then((data) => setEntities(data as any));
      await getInfo().then((data) => setInfo(data as any));
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
      await api.delete(`/student/activities/${id}`);
      toastRef.current?.show({ severity: 'success', summary: 'Sucesso', detail: 'Deletado com sucesso.' });
      setEntity(emptyEntity);
      setEntityDialog(false);
      await getEntities('').then((data) => setEntities(data as any));
      await getInfo().then((data) => setInfo(data as any));
    } catch (error) {
      toastRef.current?.show({ severity: 'error', summary: 'Erro', detail: 'Erro ao deletar.' });
    } finally {
      setSubmitted(false);
    }
  };

  const entityDialogFooter = (
    <>
      <Button label="Cancelar" icon="pi pi-times" text onClick={hideDialog} />
      <Button label="Salvar" disabled={submitted} icon="pi pi-check" onClick={handleSave} />
    </>
  );
  return (
    <div className="flex-1">
      <div className="p-2">
        <div className="card mb-2">
          <p className="m-0 text-2xl">Olá {user.name}, seja bem-vindo(a)</p>
        </div>
        <div className="card">
          <h5 className="m-0">{resolution && resolution.name + ', ' + resolution.totalPoints + ' pontos'}</h5>
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
        <div className="col-12">
          <div className="card p-3">
            <div className="flex w-full align-items-center justify-content-between">
              <div className="flex-1 flex align-items-center">
                <h5 className="mb-0">Status: </h5>
                {info && (
                  <p className=" mb-0 font-medium ml-2">
                    {info.sumOfPoints}/{info.resolution.totalPoints} pontos
                  </p>
                )}
              </div>
              <div className="flex-1">
                <div>
                  <Tooltip mouseTrack mouseTrackLeft={10} target=".custom-target-icon" />

                  <span className="font-medium">Total</span>
                  <ProgressBar
                    data-pr-tooltip={`${percent}%`}
                    color={documentStyle.getPropertyValue('--blue-500')}
                    className="mt-2 custom-target-icon"
                    value={percent}
                  ></ProgressBar>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-12">
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

              <DataTable size="small" paginator rows={5} stripedRows value={entities} emptyMessage="Nenhum dado encontrado." loading={loading}>
                <Column field="name" header="Nome"></Column>
                <Column field="activityOnCategory.name" header="Atividade"></Column>
                <Column
                  header="Atividade"
                  body={(rowData: any) => {
                    if (rowData.link) {
                      return (
                        <>
                          <a
                            href={rowData.link}
                            target="_blank"
                            className="p-button p-component p-button-text-icon-left p-button-plain p-button-sm p-button-text"
                          >
                            Abrir
                          </a>
                        </>
                      );
                    } else {
                      return (
                        <>
                          <a
                            href={rowData.link}
                            target="_blank"
                            className="p-button p-component p-button-text-icon-left p-button-plain p-button-sm p-button-text"
                          >
                            Sem link
                          </a>
                        </>
                      );
                    }
                  }}
                ></Column>
                <Column field="semester" header="Semestre"></Column>

                <Column
                  body={(rowData: any) => {
                    return (
                      <>
                        <Button
                          icon="pi pi-trash"
                          size="small"
                          severity="warning"
                          className="rounded-sm"
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
              header={entity.id ? 'Editar Registro' : 'Novo Registro'}
              modal
              className="p-fluid"
              footer={entityDialogFooter}
              onHide={hideDialog}
            >
              <div className="field">
                <label htmlFor="name">Nome</label>
                <InputText
                  value={entity.name}
                  onChange={(e: any) => {
                    onInputChange(e, 'name');
                  }}
                  placeholder="Digite um nome"
                  className={classNames('w-full', {
                    'p-invalid': submitted && !entity.name
                  })}
                  required
                  autoFocus
                  style={{ overflow: 'hidden' }}
                />
                {submitted && !entity.name && <small className="p-invalid">Nome é requerido.</small>}
              </div>
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
                  required
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
                  required
                  style={{ overflow: 'hidden' }}
                />
                {submitted && !entity.activity && <small className="p-invalid">Categoria é requerido.</small>}
              </div>
              {entity.activity && activities.length && entity.activity.workloadInput && (
                <div className="field">
                  <label htmlFor="value">Valor do certificado</label>
                  <InputText
                    value={entity.value}
                    onChange={(e: any) => {
                      onInputChange(e, 'value');
                    }}
                    placeholder="Valor do certificado"
                    style={{ overflow: 'hidden' }}
                  />
                </div>
              )}
              <div className="field">
                <label htmlFor="link">Link (Opcional)</label>
                <InputText
                  value={entity.link}
                  onChange={(e: any) => {
                    onInputChange(e, 'link');
                  }}
                  placeholder="Link do arquivo"
                  className={classNames('w-full', {
                    'p-invalid': submitted && !entity.link
                  })}
                  style={{ overflow: 'hidden' }}
                />
              </div>
            </Dialog>
          </div>
        </div>
      </div>
    </div>
  );
}
