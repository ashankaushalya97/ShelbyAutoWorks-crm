import CrudModule from '@/modules/CrudModule/CrudModule';
import DynamicForm from '@/forms/DynamicForm';
import { fields } from './config';

export default function Staff() {
  const entity = 'staff';
  const searchConfig = {
    displayLabels: ['name'],
    searchFields: 'name',
  };

  const Labels = {
    PANEL_TITLE: 'Staff',
    DATATABLE_TITLE: 'Staff List',
    ADD_NEW_ENTITY: 'Add Staff Member',
    ENTITY_NAME: 'Staff Member',
  };

  const config = {
    entity,
    ...Labels,
    fields,
    searchConfig,
    deleteModalLabels: ['name'],
  };

  return (
    <CrudModule
      createForm={<DynamicForm fields={fields} />}
      updateForm={<DynamicForm fields={fields} />}
      config={config}
    />
  );
}
