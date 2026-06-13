export const fields = {
  name: {
    show: true,
    label: 'Name',
    type: 'string',
    required: true,
  },
  role: {
    show: true,
    label: 'Role',
    type: 'string',
    required: false,
    placeholder: 'e.g. Trainee',
  },
  monthlySalary: {
    show: true,
    label: 'Monthly Salary (LKR)',
    type: 'currency',
    required: true,
  },
  startDate: {
    show: true,
    label: 'Start Date',
    type: 'date',
    required: false,
  },
};
