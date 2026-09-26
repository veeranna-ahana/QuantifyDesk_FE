// Effort estimate mock data. Shape = future API rows: { id, role, name, effortDays, bufferDays }.

/** Roles in display order. */
export const EFFORT_ROLES = ['BA', 'Solution Architect', 'FE Dev', 'BE Dev', 'UI/UX', 'Tester', 'Deployment', 'Warranty & Support', 'Project Manager'];

/** Members available in the "Add Member" picker. */
export const EFFORT_MEMBERS = [
  'Rahul Sharma', 'Priya Nair', 'Amit Patel', 'Sneha Rao', 'Vikas Gupta', 'Pooja Hegde',
  'Suresh Raina', 'Karthik N', 'Mohan Raj', 'Rohan Verma', 'Meera Iyer',
];

const people = [
  ['BA', 'Navith'], ['BA', 'Kusum'], ['FE Dev', 'Soumya'], ['FE Dev', 'Ranjitha'], ['BE Dev', 'Ankit'], ['UI/UX', 'Devanshi'],
];

/** Import wizard starts with empty estimates. */
export const IMPORT_EFFORT_ROWS = people.map(([role, name], i) => ({ id: `r${i + 1}`, role, name, effortDays: 0, bufferDays: 0 }));

/** Existing project (view/edit) has estimates filled in: 12.5d = 100 hrs effort, 2.5d = 20 hrs buffer. */
export const EXISTING_EFFORT_ROWS = people.map(([role, name], i) => ({ id: `e${i + 1}`, role, name, effortDays: 12.5, bufferDays: 2.5 }));
