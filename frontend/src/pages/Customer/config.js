export const fields = {
  firstName: {
    show: true,
    label: 'First Name',
    type: 'string',
    required: true,
    placeholder: 'First name',
  },
  lastName: {
    show: true,
    label: 'Last Name',
    type: 'string',
    required: true,
    placeholder: 'Last name',
  },
  phone: {
    show: true,
    label: 'Phone',
    type: 'phone',
    required: true,
    placeholder: 'e.g. 077 123 4567',
  },
  email: {
    show: true,
    label: 'Email',
    type: 'email',
    required: false,
    placeholder: 'Optional',
  },
};
