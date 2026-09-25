import axios from 'axios';
import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';

import { getProjectById } from '@/features/projects/services/projectsService';

import { DETAIL_TABS } from '../constants';

const TAB_IDS = DETAIL_TABS.map((t) => t.id);

/** Maps the editable form fields onto both the snake_case and camelCase keys the project object may carry. */
const applyFormFields = (prev, f) => ({
  ...prev,
  project_type: f.projectType ?? prev?.project_type, projectType: f.projectType ?? prev?.projectType,
  nbd_id: f.nbdId ?? prev?.nbd_id, nbdId: f.nbdId ?? prev?.nbdId,
  o2d_id: f.o2dId ?? prev?.o2d_id, o2dId: f.o2dId ?? prev?.o2dId,
  project_code: f.projectCode ?? prev?.project_code, projectCode: f.projectCode ?? prev?.projectCode,
  sub_category: f.subCategory ?? prev?.sub_category, subCategory: f.subCategory ?? prev?.subCategory,
  description: f.description ?? prev?.description,
});

/**
 * State + actions for the project view / edit screen (tabs, edit mode, save).
 * Behaviour is unchanged from the previous page: fetch via getProjectById, PUT to
 * `${VITE_API_BASE_URL}/api/projects/:id` on save (falls back to a local update if the API is unavailable).
 */
export function useProjectDetails() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'Project Overview');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(null);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && TAB_IDS.includes(tab)) setActiveTab(tab);
  }, [searchParams]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const data = await getProjectById(id || 1);
        if (mounted) setProject(data);
      } catch (err) {
        console.error(err);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [id]);

  const save = async (fields) => {
    const data = fields || formData;
    if (!data) return;
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL;
      const token = localStorage.getItem('token') || '';
      if (baseUrl && project?.id) {
        try {
          await axios.put(
            `${baseUrl}/api/projects/${project.id}`,
            {
              name: project.project_name || project.projectName || project.name,
              projectType: data.projectType,
              nbdId: data.nbdId,
              o2dId: data.o2dId,
              projectCode: data.projectCode,
              subCategory: data.subCategory,
              description: data.description,
            },
            { headers: { Authorization: `Bearer ${token}` } },
          );
        } catch (apiErr) {
          console.warn('Backend update API failed or unavailable, updated locally:', apiErr);
        }
      }
      setProject((prev) => applyFormFields(prev, data));
      toast.success('Project updated successfully!');
      setIsEditing(false);
    } catch (err) {
      console.error('Save error:', err);
      toast.error('Failed to update project.');
    }
  };

  const goToTab = (tab, fields) => {
    if (fields) {
      setFormData((prev) => ({ ...prev, ...fields }));
      setProject((prev) => applyFormFields(prev, fields));
    }
    setActiveTab(tab);
  };

  return { project, loading, activeTab, setActiveTab, isEditing, setIsEditing, formData, setFormData, save, goToTab };
}
