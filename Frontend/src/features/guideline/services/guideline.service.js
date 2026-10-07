import { mockGuidelines } from '../mock/guideline.mock';
import { PAGE_SIZE } from '../constants';

const delay = (ms) => new Promise(res => setTimeout(res, ms));

export const guidelineService = {
  getGuidelines: async ({ page = 1, searchQuery = '', filters = { versions: [], lastUpdated: 'all' } }) => {
    await delay(400); // Simulate network

    const query = searchQuery.toLocaleLowerCase();
    const selectedVersions = new Set(filters.versions);
    const today = new Date();
    const todayString = [
      today.getFullYear(),
      String(today.getMonth() + 1).padStart(2, '0'),
      String(today.getDate()).padStart(2, '0'),
    ].join('-');
    const daysAgo = new Date(today);
    const days = filters.lastUpdated === '7d' ? 7 : filters.lastUpdated === '30d' ? 30 : null;
    if (days !== null) daysAgo.setDate(daysAgo.getDate() - days);
    const cutoffString = days === null
      ? null
      : [
          daysAgo.getFullYear(),
          String(daysAgo.getMonth() + 1).padStart(2, '0'),
          String(daysAgo.getDate()).padStart(2, '0'),
        ].join('-');

    let filtered = [...mockGuidelines];
    filtered = filtered.filter((guideline) => {
      const matchesSearch = !query
        || guideline.name.toLocaleLowerCase().includes(query)
        || (guideline.ownerName || guideline.owner || '').toLocaleLowerCase().includes(query);
      const matchesVersion = selectedVersions.size === 0 || selectedVersions.has(guideline.version);
      const updated = typeof guideline.lastUpdated === 'string'
        ? guideline.lastUpdated.slice(0, 10)
        : '';
      const matchesDate = cutoffString === null
        || (/^\d{4}-\d{2}-\d{2}$/.test(updated) && updated >= cutoffString && updated <= todayString);
      return matchesSearch && matchesVersion && matchesDate;
    });

    const totalElements = filtered.length;
    const totalPages = Math.max(1, Math.ceil(totalElements / PAGE_SIZE));
    const offset = (page - 1) * PAGE_SIZE;
    const content = filtered.slice(offset, offset + PAGE_SIZE);
    const versions = [...new Set(mockGuidelines.map((guideline) => guideline.version).filter(Boolean))]
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));

    return {
      content,
      totalElements,
      totalPages,
      page,
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
