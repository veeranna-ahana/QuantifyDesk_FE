import { mockGuidelines } from '../mock/guideline.mock';
import { PAGE_SIZE } from '../constants';

const delay = (ms) => new Promise(res => setTimeout(res, ms));

export const guidelineService = {
  getGuidelines: async ({ page = 1, searchQuery = '' }) => {
    await delay(400); // Simulate network

    let filtered = [...mockGuidelines];
    if (searchQuery) {
      filtered = filtered.filter(g => 
        g.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    const totalElements = filtered.length;
    const totalPages = Math.ceil(totalElements / PAGE_SIZE);
    const offset = (page - 1) * PAGE_SIZE;
    const content = filtered.slice(offset, offset + PAGE_SIZE);

    return {
      content,
      totalElements,
      totalPages,
      page
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
        createdDate: data.effectiveDate || mockGuidelines[index].createdDate,
        lastUpdated: new Date().toISOString().split('T')[0],
        scope: data.scope || mockGuidelines[index].scope
      };
      return mockGuidelines[index];
    }
    throw new Error('Guideline not found');
  }
};
