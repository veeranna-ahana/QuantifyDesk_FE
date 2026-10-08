import { mockGuidelines } from '../mock/guideline.mock';
import { PAGE_SIZE } from '../constants';

const delay = (ms) => new Promise(res => setTimeout(res, ms));

const normalizeSearchText = (value) => String(value ?? '')
  .trim()
  .replace(/\s+/g, ' ')
  .toLocaleLowerCase();

const parseDateOnly = (value) => {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return Date.UTC(value.getFullYear(), value.getMonth(), value.getDate());
  }

  if (typeof value !== 'string') return null;

  const isoDate = value.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  const displayDate = value.match(/^(\d{1,2})-([a-z]{3})-(\d{4})$/i);
  let year;
  let month;
  let day;

  if (isoDate) {
    [, year, month, day] = isoDate;
  } else if (displayDate) {
    const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
    day = displayDate[1];
    month = months.indexOf(displayDate[2].toLowerCase()) + 1;
    year = displayDate[3];
    if (month === 0) return null;
  } else {
    return null;
  }

  const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
  if (
    date.getUTCFullYear() !== Number(year)
    || date.getUTCMonth() !== Number(month) - 1
    || date.getUTCDate() !== Number(day)
  ) {
    return null;
  }
  return date.getTime();
};

const filterGuidelines = (guidelines, searchQuery, filters, today = new Date()) => {
  const query = normalizeSearchText(searchQuery);
  const selectedVersions = new Set(filters.versions);
  const days = filters.lastUpdated === '7d' ? 7 : filters.lastUpdated === '30d' ? 30 : null;
  const endDate = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
  const cutoffDate = new Date(today);
  if (days !== null) cutoffDate.setDate(cutoffDate.getDate() - days);
  const startDate = days === null
    ? null
    : Date.UTC(cutoffDate.getFullYear(), cutoffDate.getMonth(), cutoffDate.getDate());

  return guidelines.filter((guideline) => {
    const name = normalizeSearchText(guideline.name);
    const owner = normalizeSearchText(guideline.ownerName || guideline.owner);
    const matchesSearch = !query || name.includes(query) || owner.includes(query);
    const matchesVersion = selectedVersions.size === 0 || selectedVersions.has(guideline.version);
    const updatedDate = parseDateOnly(guideline.lastUpdated);
    const matchesDate = startDate === null
      || (updatedDate !== null && updatedDate >= startDate && updatedDate <= endDate);
    return matchesSearch && matchesVersion && matchesDate;
  });
};

export const guidelineService = {
  getGuidelines: async ({ page = 1, searchQuery = '', filters = { versions: [], lastUpdated: 'all' } }) => {
    await delay(400); // Simulate network

    const filtered = filterGuidelines(mockGuidelines, searchQuery, filters);

    const totalElements = filtered.length;
    const totalDocuments = mockGuidelines.length;
    const totalPages = Math.max(1, Math.ceil(totalElements / PAGE_SIZE));
    const currentPage = Math.min(Math.max(page, 1), totalPages);
    const offset = (currentPage - 1) * PAGE_SIZE;
    const content = filtered.slice(offset, offset + PAGE_SIZE);
    const versions = [...new Set(mockGuidelines.map((guideline) => guideline.version).filter(Boolean))]
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));

    return {
      content,
      totalElements,
      totalDocuments,
      totalPages,
      page: currentPage,
      versions,
    };
  },

  getGuidelineById: async (id) => {
    await delay(200);
    return mockGuidelines.find(g => String(g.id) === String(id)) || null;
  },

  createGuideline: async (data) => {
    await delay(300);
    const newGuideline = {
      id: Date.now(),
      name: data.name,
      link: data.link ? (data.link.startsWith('http') ? data.link : `https://${data.link}`) : '',
      version: data.version,
      ownerName: data.ownerName || '',
      createdDate: data.effectiveDate || new Date().toISOString().split('T')[0],
      lastUpdated: new Date().toISOString().split('T')[0],
      scope: data.scope || ''
    };
    mockGuidelines.unshift(newGuideline);
    return newGuideline;
  },

  updateGuideline: async (id, data) => {
    await delay(300);
    const index = mockGuidelines.findIndex(g => String(g.id) === String(id));
    if (index !== -1) {
      mockGuidelines[index] = {
        ...mockGuidelines[index],
        name: data.name,
        link: data.link ? (data.link.startsWith('http') ? data.link : `https://${data.link}`) : mockGuidelines[index].link,
        version: data.version,
        ownerName: data.ownerName || mockGuidelines[index].ownerName || '',
        createdDate: data.effectiveDate || mockGuidelines[index].createdDate,
        lastUpdated: new Date().toISOString().split('T')[0],
        scope: data.scope || mockGuidelines[index].scope
      };
      return mockGuidelines[index];
    }
    throw new Error('Guideline not found');
  }
};
