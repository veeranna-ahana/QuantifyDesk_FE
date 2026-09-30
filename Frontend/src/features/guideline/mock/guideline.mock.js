export const mockGuidelines = [
  { id: 1, name: 'UI Design Guideline', createdDate: '2026-09-10', lastUpdated: '2026-09-20', version: 'v1.2', link: 'https://example.com/ui' },
  { id: 2, name: 'Development Guideline', createdDate: '2026-09-12', lastUpdated: '2026-09-18', version: 'v1.0', link: 'https://example.com/dev' },
  { id: 3, name: 'Testing Guideline', createdDate: '2026-09-15', lastUpdated: '2026-09-21', version: 'v2.0', link: 'https://example.com/qa' },
  { id: 4, name: 'API Integration & Security Standard', createdDate: '2026-08-01', lastUpdated: '2026-09-22', version: 'v1.4', link: 'https://example.com/api' },
  { id: 5, name: 'Database Migration Protocol', createdDate: '2026-07-14', lastUpdated: '2026-09-05', version: 'v2.1', link: 'https://example.com/db' },
  { id: 6, name: 'Code Review & PR Checklist', createdDate: '2026-06-28', lastUpdated: '2026-09-12', version: 'v1.1', link: 'https://example.com/pr' },
  { id: 7, name: 'Code Review & PR Checklist', createdDate: '2026-06-28', lastUpdated: '2026-09-12', version: 'v1.1', link: 'https://example.com/pr' },
  { id: 8, name: 'Code Review & PR Checklist', createdDate: '2026-06-28', lastUpdated: '2026-09-12', version: 'v1.1', link: 'https://example.com/pr' },
  { id: 9, name: 'Code Review & PR Checklist', createdDate: '2026-06-28', lastUpdated: '2026-09-12', version: 'v1.1', link: 'https://example.com/pr' },
  { id: 10, name: 'Code Review & PR Checklist', createdDate: '2026-06-28', lastUpdated: '2026-09-12', version: 'v1.1', link: 'https://example.com/pr' },
];

// Add 19 more duplicates just for pagination testing to reach 29
for(let i = 11; i <= 29; i++) {
  mockGuidelines.push({ id: i, name: `Dummy Guideline ${i}`, createdDate: '2026-09-01', lastUpdated: '2026-09-10', version: 'v1.0', link: 'https://example.com' });
}
