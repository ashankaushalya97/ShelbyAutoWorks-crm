import CrudModule from '@/modules/CrudModule/CrudModule';
import DynamicForm from '@/forms/DynamicForm';
import { fields } from './config';

export default function Vehicle() {
  const entity = 'vehicle';
  const searchConfig = {
    displayLabels: ['make', 'model', 'licensePlate'],
    searchFields: 'make,model,licensePlate',
  };

  const Labels = {
    PANEL_TITLE: 'Vehicle',
    DATATABLE_TITLE: 'Vehicle List',
    ADD_NEW_ENTITY: 'Add New Vehicle',
    ENTITY_NAME: 'Vehicle',
  };

  const config = {
    entity,
    ...Labels,
    fields,
    searchConfig,
    deleteModalLabels: ['make', 'model', 'licensePlate'],
  };

  return (
    <CrudModule
      createForm={<DynamicForm fields={fields} />}
      updateForm={<DynamicForm fields={fields} />}
      config={config}
    />
  );
}
