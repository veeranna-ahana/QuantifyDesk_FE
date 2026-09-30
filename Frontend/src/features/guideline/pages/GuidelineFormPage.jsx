import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation, Link } from 'react-router-dom';
import { Check, ExternalLink, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

import { Button } from '@/components/ui/Button';
import { guidelineService } from '../services/guideline.service';

function CheckCircleFill({ className = "h-4 w-4 text-[#00A389]" }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor">
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export function GuidelineFormPage({ mode: propMode }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();

  const isEdit = propMode === 'edit' || location.pathname.includes('/edit/');
  const isView = propMode === 'view' || (Boolean(id) && !isEdit && !location.pathname.includes('/add'));

  const [formData, setFormData] = useState({
    name: 'API Integration & Security Standard 2026',
    link: 'docs.ahana.io/standards/api-sec-guidelines-v1.4',
    version: 'v1.4.0',
    effectiveDate: '08/09/2026',
    scope: 'v1.4.0'
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (location.state?.guideline) {
      const g = location.state.guideline;
      setFormData({
        name: g.name || '',
        link: (g.link || '').replace(/^https?:\/\//, ''),
        version: g.version || '',
        effectiveDate: g.createdDate || '',
        scope: g.scope || ''
      });
      return;
    }

    if (id) {
      guidelineService.getGuidelineById(id).then((g) => {
        if (g) {
          setFormData({
            name: g.name || '',
            link: (g.link || '').replace(/^https?:\/\//, ''),
            version: g.version || '',
            effectiveDate: g.createdDate || '',
            scope: g.scope || ''
          });
        }
      });
    } else if (!isEdit && !isView) {
      setFormData({
        name: 'API Integration & Security Standard 2026',
        link: 'docs.ahana.io/standards/api-sec-guidelines-v1.4',
        version: 'v1.4.0',
        effectiveDate: '08/09/2026',
        scope: 'v1.4.0'
      });
    }
  }, [id, isEdit, isView, location.state]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleOpenLink = () => {
    if (!formData.link) return;
    const url = formData.link.startsWith('http') ? formData.link : `https://${formData.link}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Guideline name is required';
    if (!formData.link.trim()) newErrors.link = 'Guideline link is required';
    if (!formData.version.trim()) newErrors.version = 'Version is required';
    if (!formData.scope.trim()) newErrors.scope = 'Scope & Objectives is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (isView) {
      navigate('/guideline');
      return;
    }

    if (!validate()) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);
      if (isEdit && id) {
        await guidelineService.updateGuideline(id, formData);
        toast.success('Guideline updated successfully');
      } else {
        await guidelineService.createGuideline(formData);
        toast.success('Guideline created successfully');
      }
      navigate('/guideline');
    } catch (err) {
      toast.error('Failed to save guideline');
    } finally {
      setSubmitting(false);
    }
  };

  const pageTitle = isView ? 'View Guideline' : isEdit ? 'Edit Guideline' : 'Add Guideline';

  return (
    <div className="flex flex-col gap-2 w-full">
      {/* Breadcrumb + Title area */}
      <div className="flex flex-col gap-1 shrink-0">
        <div className="flex items-center gap-1.5 text-[12px] font-semibold leading-[16px] tracking-[0.5px]">
          <Link
            to="/guideline"
            className="text-ink-secondary hover:text-action-primary transition-colors no-underline"
          >
            Guideline
          </Link>
          <span className="text-ink-muted">/</span>
          <span className="text-action-primary">{pageTitle}</span>
        </div>

        <div className="flex flex-col">
          <h1 className="text-[24px] font-bold leading-[30px] tracking-[-0.5px] text-ink-primary m-0">
            {pageTitle}
          </h1>
          <p className="text-[13px] text-ink-muted leading-[18px] m-0">
            Create and publish standardized technical, quality, and compliance guidelines for cross-functional projects and sprint execution.
          </p>
        </div>
      </div>

      {/* Main Form Card - Hugs content */}
      <div className="bg-surface-card border border-line-card rounded-md p-4 shadow-1 flex flex-col gap-3">
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {/* Guideline Name */}
          <div className="flex flex-col gap-1">
            <div className="flex justify-between items-center">
              <label className="text-[12px] font-semibold text-ink-secondary">
                Guideline Name <span className="text-accent-error">*</span>
              </label>
              <span className="text-[12px] text-ink-muted font-normal">
                {formData.name.length} / 100
              </span>
            </div>
            <div className="relative flex items-center">
              <input
                type="text"
                maxLength={100}
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                readOnly={isView}
                placeholder="API Integration & Security Standard 2026"
                className={`w-full h-[38px] px-3.5 pr-10 text-[13px] text-ink-primary bg-white border ${
                  errors.name ? 'border-accent-error' : 'border-line-field'
                } rounded-control outline-none focus:border-action-primary focus:ring-1 focus:ring-action-primary transition-all ${
                  isView ? 'bg-surface-field-disabled' : ''
                }`}
              />
              {formData.name.trim().length > 0 && !errors.name && (
                <span className="absolute right-3 flex items-center pointer-events-none">
                  <CheckCircleFill className="h-4 w-4 text-[#00A389]" />
                </span>
              )}
            </div>
            {errors.name && (
              <span className="text-[11px] text-accent-error">{errors.name}</span>
            )}
          </div>

          {/* Guideline Link */}
          <div className="flex flex-col gap-1">
            <label className="text-[12px] font-semibold text-ink-secondary">
              Guideline Link <span className="text-accent-error">*</span>
            </label>
            <div
              className={`relative flex items-center h-[38px] border ${
                errors.link ? 'border-accent-error' : 'border-line-field'
              } rounded-control bg-white overflow-hidden focus-within:border-action-primary focus-within:ring-1 focus-within:ring-action-primary transition-all ${
                isView ? 'bg-surface-field-disabled' : ''
              }`}
            >
              <div className="h-full bg-surface-muted px-3 flex items-center text-[13px] text-ink-muted border-r border-line-field select-none font-normal">
                https://
              </div>
              <input
                type="text"
                value={formData.link}
                onChange={(e) => handleChange('link', e.target.value)}
                readOnly={isView}
                placeholder="docs.ahana.io/standards/api-sec-guidelines-v1.4"
                className="flex-1 h-full px-3 text-[13px] text-ink-primary outline-none bg-transparent"
              />
              <div className="flex items-center gap-2 pr-3">
                {formData.link.trim().length > 0 && (
                  <button
                    type="button"
                    onClick={handleOpenLink}
                    title="Open link in new tab"
                    className="text-ink-muted hover:text-ink-primary transition-colors p-0.5 rounded flex items-center justify-center border-0 bg-transparent cursor-pointer"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </button>
                )}
                {formData.link.trim().length > 0 && !errors.link && (
                  <span className="flex items-center pointer-events-none">
                    <CheckCircleFill className="h-4 w-4 text-[#00A389]" />
                  </span>
                )}
              </div>
            </div>
            {errors.link && (
              <span className="text-[11px] text-accent-error">{errors.link}</span>
            )}
          </div>

          {/* Version & Effective Date Row */}
          <div className="flex items-center gap-3">
            {/* Version */}
            <div className="flex flex-col gap-1 w-[260px] max-w-[50%]">
              <label className="text-[12px] font-semibold text-ink-secondary">
                Version <span className="text-accent-error">*</span>
              </label>
              <input
                type="text"
                value={formData.version}
                onChange={(e) => handleChange('version', e.target.value)}
                readOnly={isView}
                placeholder="v1.4.0"
                className={`w-full h-[38px] px-3.5 text-[13px] text-ink-primary bg-white border ${
                  errors.version ? 'border-accent-error' : 'border-line-field'
                } rounded-control outline-none focus:border-action-primary focus:ring-1 focus:ring-action-primary transition-all ${
                  isView ? 'bg-surface-field-disabled' : ''
                }`}
              />
              {errors.version && (
                <span className="text-[11px] text-accent-error">{errors.version}</span>
              )}
            </div>

            {/* Effective Date (no asterisk) */}
            <div className="flex flex-col gap-1 w-[260px] max-w-[50%]">
              <label className="text-[12px] font-semibold text-ink-secondary">
                Effective Date
              </label>
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={formData.effectiveDate}
                  onChange={(e) => handleChange('effectiveDate', e.target.value)}
                  readOnly={isView}
                  placeholder="08/09/2026"
                  className={`w-full h-[38px] px-3.5 pr-10 text-[13px] text-ink-primary bg-white border border-line-field rounded-control outline-none focus:border-action-primary focus:ring-1 focus:ring-action-primary transition-all ${
                    isView ? 'bg-surface-field-disabled' : ''
                  }`}
                />
                <span className="absolute right-3 text-ink-primary pointer-events-none flex items-center">
                  <Calendar className="h-4 w-4" />
                </span>
              </div>
            </div>
          </div>

          {/* Scope & Objectives */}
          <div className="flex flex-col gap-1">
            <label className="text-[12px] font-semibold text-ink-secondary">
              Scope & Objectives <span className="text-accent-error">*</span>
            </label>
            <textarea
              rows={3}
              value={formData.scope}
              onChange={(e) => handleChange('scope', e.target.value)}
              readOnly={isView}
              placeholder="v1.4.0"
              className={`w-full h-[72px] min-h-[54px] p-2.5 text-[13px] text-ink-primary bg-white border ${
                errors.scope ? 'border-accent-error' : 'border-line-field'
              } rounded-control outline-none focus:border-action-primary focus:ring-1 focus:ring-action-primary transition-all resize-none ${
                isView ? 'bg-surface-field-disabled' : ''
              }`}
            />
            {errors.scope && (
              <span className="text-[11px] text-accent-error">{errors.scope}</span>
            )}
          </div>

          {/* Actions Footer */}
          <div className="flex items-center justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={() => navigate('/guideline')}
              className="px-4 py-2 text-[14px] font-semibold text-ink-secondary hover:text-ink-primary transition-colors cursor-pointer bg-transparent border-0"
            >
              Cancel
            </button>
            {!isView && (
              <Button
                type="submit"
                disabled={submitting}
                leftIcon={<Check className="h-4 w-4 stroke-[2.5]" />}
                className="h-[44px] px-5 text-[14px] font-semibold bg-action-primary hover:bg-action-primary-hover shadow-1"
              >
                {isEdit ? 'Update Guideline' : 'Save Guideline'}
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
