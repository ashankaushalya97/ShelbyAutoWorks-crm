export const fields = {
  date: {
    show: true,
    label: 'Date',
    type: 'date',
    required: true,
  },
  amount: {
    show: true,
    label: 'Amount (LKR)',
    type: 'currency',
    required: true,
  },
  category: {
    show: true,
    label: 'Category',
    type: 'select',
    required: true,
    options: [
      { value: 'parts', label: 'Parts' },
      { value: 'salary', label: 'Salary' },
      { value: 'utilities', label: 'Utilities' },
      { value: 'tools', label: 'Tools' },
      { value: 'rent', label: 'Rent' },
      { value: 'other', label: 'Other' },
    ],
  },
  description: {
    show: true,
    label: 'Description',
    type: 'string',
    required: true,
    placeholder: 'What was this expense for?',
  },
  reference: {
    show: true,
    label: 'Reference / Receipt No.',
    type: 'string',
    required: false,
    placeholder: 'e.g. shop name or receipt number',
  },
};
