import CrudModule from '@/modules/CrudModule/CrudModule';
import DynamicForm from '@/forms/DynamicForm';
import { fields } from './config';

export default function Expense() {
  const entity = 'expense';
  const searchConfig = {
    displayLabels: ['description'],
    searchFields: 'description',
  };

  const Labels = {
    PANEL_TITLE: 'Expense',
    DATATABLE_TITLE: 'Expense List',
    ADD_NEW_ENTITY: 'Log Expense',
    ENTITY_NAME: 'Expense',
  };

  const config = {
    entity,
    ...Labels,
    fields,
    searchConfig,
    deleteModalLabels: ['description', 'amount'],
  };

  return (
    <CrudModule
      createForm={<DynamicForm fields={fields} />}
      updateForm={<DynamicForm fields={fields} />}
      config={config}
    />
  );
}
