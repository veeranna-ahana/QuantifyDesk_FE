// src/features/projects/services/projectsService.js
import { mockProjects } from "../mock/mockProjects";

/**
 * Fetch all projects.
 *
 * Currently returns mock data with a simulated 500ms network delay.
 *
 * To switch to a real API, replace this function body with:
 *   import axiosInstance from '../../../shared/axiosInstance';
 *   const res = await axiosInstance.get('/projects');
 *   return res.data;
 */
export const getProjects = () =>
  new Promise((resolve) => {
    setTimeout(() => resolve(mockProjects), 500);
  });

const DASHBOARD_PROJECTS = [
  { id: 'KBL-042', projectName: 'Core Banking Upgrade', projectCode: 'KBL-042', code: 'KBL-042', pmsId: 'PMS-KBL-042', units: 8, completion: 82, risk: 'Low', status: 'On Track', customer: 'Ahana IT', owner: 'Rahul Sharma', startDate: '2026-03-15', endDate: '2026-09-18', projectType: 'One Time Project', subCategory: 'Core Banking', description: 'Core Banking Upgrade and modernisation initiative.' },
  { id: 'KBL-031', projectName: 'Mobile Banking', code: 'KBL-031', projectCode: 'KBL-031', pmsId: 'PMS-KBL-031', units: 6, completion: 61, risk: 'High', status: 'At Risk', customer: 'Ahana IT', owner: 'Priya Patel', startDate: '2026-02-01', endDate: '2026-08-30', projectType: 'Fixed Price', subCategory: 'Mobile App', description: 'Mobile banking application redesign and feature enhancements.' },
  { id: 'KBL-018', projectName: 'API Gateway', code: 'KBL-018', projectCode: 'KBL-018', pmsId: 'PMS-KBL-018', units: 4, completion: 73, risk: 'Medium', status: 'In Progress', customer: 'Ahana IT', owner: 'Anand Krishnan', startDate: '2026-01-15', endDate: '2026-07-20', projectType: 'Time & Material', subCategory: 'API Infrastructure', description: 'Next-generation API Gateway rollout and service mesh.' },
  { id: 'KBL-022', projectName: 'Data Warehouse', code: 'KBL-022', projectCode: 'KBL-022', pmsId: 'PMS-KBL-022', units: 5, completion: 45, risk: 'High', status: 'Delayed', customer: 'Ahana IT', owner: 'Sunita Reddy', startDate: '2026-03-01', endDate: '2026-10-31', projectType: 'Fixed Price', subCategory: 'Data Engineering', description: 'Enterprise Data Warehouse build and pipeline automation.' },
  { id: 'KBL-055', projectName: 'Payment Gateway', code: 'KBL-055', projectCode: 'KBL-055', pmsId: 'PMS-KBL-055', units: 3, completion: 92, risk: 'Low', status: 'On Track', customer: 'Ahana IT', owner: 'Vikram Singh', startDate: '2026-01-10', endDate: '2026-06-15', projectType: 'One Time Project', subCategory: 'Payments', description: 'Seamless multi-channel payment gateway integration.' },
  { id: 'KBL-009', projectName: 'User Portal', code: 'KBL-009', projectCode: 'KBL-009', pmsId: 'PMS-KBL-009', units: 4, completion: 38, risk: 'Critical', status: 'At Risk', customer: 'Ahana IT', owner: 'Meera Iyer', startDate: '2026-04-01', endDate: '2026-11-15', projectType: 'Time & Material', subCategory: 'Web Portal', description: 'Unified self-service user portal and dashboard.' },
  { id: 'KBL-067', projectName: 'Analytics Engine', code: 'KBL-067', projectCode: 'KBL-067', pmsId: 'PMS-KBL-067', units: 5, completion: 56, risk: 'Medium', status: 'In Progress', customer: 'Ahana IT', owner: 'Sarah J.', startDate: '2026-02-15', endDate: '2026-09-30', projectType: 'Retainer Contract', subCategory: 'Analytics', description: 'Real-time analytics engine and business intelligence engine.' },
  { id: 'KBL-078', projectName: 'DevOps Pipeline', code: 'KBL-078', projectCode: 'KBL-078', pmsId: 'PMS-KBL-078', units: 3, completion: 88, risk: 'Low', status: 'On Track', customer: 'Ahana IT', owner: 'David Park', startDate: '2026-01-01', endDate: '2026-06-30', projectType: 'Internal RnD', subCategory: 'DevOps', description: 'Automated CI/CD DevOps Pipeline and container orchestration.' },
];

/**
 * Fetch a single project by ID.
 * Future: axiosInstance.get(`/projects/${id}`)
 */
export const getProjectById = (id) =>
  new Promise((resolve) => {
    setTimeout(() => {
      const query = String(id || '').trim().toLowerCase();
      // First search in mockProjects
      let project = mockProjects.find(
        (p) =>
          String(p.id).toLowerCase() === query ||
          (p.pmsId && p.pmsId.toLowerCase() === query) ||
          (p.projectCode && String(p.projectCode).toLowerCase() === query) ||
          (p.projectName && p.projectName.toLowerCase() === query)
      );

      // Next search in DASHBOARD_PROJECTS
      if (!project) {
        project = DASHBOARD_PROJECTS.find(
          (p) =>
            String(p.id).toLowerCase() === query ||
            (p.code && p.code.toLowerCase() === query) ||
            (p.projectName && p.projectName.toLowerCase() === query)
        );
      }

      // Fallback
      if (!project) {
        project = {
          id: id,
          projectName: String(id),
          projectCode: String(id),
          pmsId: `PMS-${id}`,
          customer: "Ahana IT",
          owner: "Sarah J.",
          status: "In Progress",
          units: 6,
          completion: 70,
          risk: "Low",
          startDate: "2024-08-01",
          endDate: "2024-10-15",
          projectType: "One Time Project",
          subCategory: "General",
          description: `Details and delivery performance for ${id}.`,
        };
      }

      resolve(project);
    }, 200);
  });

/**
 * Import projects from a file upload.
 * Future: axiosInstance.post('/projects/import', formData)
 */
export const importProjects = (file) =>
  new Promise((resolve) => {
    setTimeout(() => {
      console.log("Import Project clicked – file:", file?.name ?? "none");
      resolve({ success: true });
    }, 300);
  });
