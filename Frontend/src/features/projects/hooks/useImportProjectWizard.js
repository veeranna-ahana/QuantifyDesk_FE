import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

import { WIZARD_STEPS } from '../constants';

const EMPTY_PMS = { projectName: '', customer: '', presaleId: '', startDate: '', endDate: '', description: '', status: '' };
const EMPTY_FORM = { projectType: '', nbdId: '', o2dId: '', projectCode: '', subCategory: '' };

/**
 * State for the 4-step Import Project wizard: current step, PMS sync and the manual fields.
 * The PMS sync is simulated (900ms) - replace `handleSync` with the real PMS call when ready.
 */
export function useImportProjectWizard() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [pmsId, setPmsIdRaw] = useState('');
  const [synced, setSynced] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [pms, setPms] = useState(EMPTY_PMS);
  const [form, setForm] = useState(EMPTY_FORM);

  const setPmsId = (v) => { setPmsIdRaw(v); setSynced(false); };

  const handleSync = async () => {
    if (!pmsId.trim()) return;
    setSyncing(true);
    await new Promise((r) => setTimeout(r, 900));
    setPms({
      projectName: 'FMS – Field Management System',
      customer: 'Ahana IT',
      presaleId: `${pmsId}-PRE`,
      startDate: '09/08/2026',
      endDate: '08/09/2027',
      status: 'In Progress',
      description: 'Automated field workforce tracking platform with GPS, task dispatch, and real-time analytics.',
    });
    setSynced(true);
    setSyncing(false);
  };

  /** Single object in the shape ProjectInfoForm expects. */
  const values = { ...pms, ...form };
  const changeValue = (field, value) => {
    if (field === 'description') setPms((p) => ({ ...p, description: value }));
    else setForm((f) => ({ ...f, [field]: value }));
  };

  return {
    step,
    steps: WIZARD_STEPS,
    goTo: (id) => id < step && setStep(id), // only completed steps are clickable
    next: () => setStep((s) => Math.min(s + 1, WIZARD_STEPS.length)),
    back: () => setStep((s) => Math.max(s - 1, 1)),
    cancel: () => navigate('/projects'),
    create: () => {
      toast.success('Project created successfully!');
      navigate('/projects');
    },
    pmsId, setPmsId, synced, syncing, handleSync,
    values, changeValue,
  };
}
