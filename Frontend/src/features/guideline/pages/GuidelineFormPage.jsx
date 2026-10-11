import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation, Link } from 'react-router-dom';
import { Check, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';

import { Button } from '@/components/ui/Button';
import { guidelineService } from '../services/guideline.service';
import '../styles/index.css';

function CheckCircleFill({ className = "h-4 w-4 text-[#4CADAB]" }) {
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
    ownerName: 'Kusum G G',
    effectiveDate: '',
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
        ownerName: g.ownerName || 'Kusum G G',
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
            ownerName: g.ownerName || 'Kusum G G',
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
        ownerName: 'Kusum G G',
        effectiveDate: '',
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
    <div className="guideline-form-page flex w-full flex-col gap-2">
      {/* Breadcrumb + Title area */}
      <div className="flex flex-col gap-1 shrink-0">
        <div className="guideline-breadcrumb">
          <Link
            to="/guideline"
            className="guideline-breadcrumb-link no-underline transition-colors hover:text-action-primary"
          >
            Guideline
          </Link>
          <span className="guideline-breadcrumb-separator">/</span>
          <span className="guideline-breadcrumb-active">{pageTitle}</span>
        </div>

        <div className="flex flex-col">
          <h1 className="guideline-page-title">
            {pageTitle}
          </h1>
          <p className="guideline-subtitle">
            Create and publish standardized technical, quality, and compliance guidelines for cross-functional projects and sprint execution.
          </p>
        </div>
      </div>

      {/* Main Form Card - Hugs content */}
      <div className="guideline-card">
        <form onSubmit={handleSubmit} className="guideline-form">
          {/* Guideline Name */}
          <div className="guideline-field">
            <div className="flex justify-between items-center">
              <label className="guideline-field-label">
                Guideline Name <span className="guideline-required">*</span>
              </label>
              <span className="guideline-character-counter">
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
                className={`guideline-input guideline-input--with-tick ${
                  errors.name ? 'guideline-input--invalid' : ''
                } ${
                  isView ? 'bg-surface-field-disabled' : ''
                }`}
              />
              {formData.name.trim().length > 0 && !errors.name && (
                <span className="absolute right-4 flex items-center pointer-events-none">
                  <CheckCircleFill className="guideline-validation-tick" />
                </span>
              )}
            </div>
            {errors.name && (
              <span className="text-[11px] text-accent-error">{errors.name}</span>
            )}
          </div>

          {/* Guideline Link */}
          <div className="guideline-field">
            <label className="guideline-field-label">
              Guideline Link <span className="guideline-required">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={formData.link}
                onChange={(e) => handleChange('link', e.target.value)}
                readOnly={isView}
                placeholder="docs.ahana.io/standards/api-sec-guidelines-v1.4"
                className={`guideline-input guideline-input--with-icons ${
                  errors.link ? 'guideline-input--invalid' : ''
                } ${
                  isView ? 'bg-surface-field-disabled' : 'bg-white'
                }`}
              />
              <div className="guideline-link-icons">
                {formData.link.trim().length > 0 && (
                  <button
                    type="button"
                    onClick={handleOpenLink}
                    title="Open link in new tab"
                    className="guideline-link-icon"
                  >
                    <ExternalLink className="h-3 w-3" />
                  </button>
                )}
                {formData.link.trim().length > 0 && !errors.link && (
                  <span className="pointer-events-none">
                    <CheckCircleFill className="guideline-validation-tick" />
                  </span>
                )}
              </div>
            </div>
            {errors.link && (
              <span className="text-[11px] text-accent-error">{errors.link}</span>
            )}
          </div>

          {/* Version & Owner Name Row */}
          <div className="guideline-form-row">
            <div className="guideline-field">
              <label className="guideline-field-label">
                Version <span className="guideline-required">*</span>
              </label>
              <input
                type="text"
                value={formData.version}
                onChange={(e) => handleChange('version', e.target.value)}
                readOnly={isView}
                placeholder="v1"
                className={`guideline-input ${
                  errors.version ? 'guideline-input--invalid' : ''
                } ${
                  isView ? 'bg-surface-field-disabled' : ''
                }`}
              />
              {errors.version && (
                <span className="text-[11px] text-accent-error">{errors.version}</span>
              )}
            </div>

            <div className="guideline-field">
              <label className="guideline-field-label">
                Owner Name
              </label>
              <input
                type="text"
                value={formData.ownerName}
                onChange={(e) => handleChange('ownerName', e.target.value)}
                readOnly={isView}
                placeholder="Kusum G G"
                className={`guideline-input ${
                  isView ? 'bg-surface-field-disabled' : ''
                }`}
              />
            </div>
          </div>

          {/* Scope & Objectives */}
          <div className="guideline-field">
            <label className="guideline-field-label">
              Scope & Objectives <span className="guideline-required">*</span>
            </label>
            <textarea
              rows={3}
              value={formData.scope}
              onChange={(e) => handleChange('scope', e.target.value)}
              readOnly={isView}
              placeholder="v1.4.0"
              className={`guideline-textarea ${
                errors.scope ? 'guideline-textarea--invalid' : ''
              } ${
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
              className="guideline-cancel-button transition-colors cursor-pointer bg-transparent border-0"
            >
              Cancel
            </button>
            {!isView && (
              <Button
                type="submit"
                disabled={submitting}
                leftIcon={<Check className="h-4 w-4 stroke-[2.5]" />}
                className="guideline-primary-button rounded-control px-6 py-2 text-[16px] font-semibold text-white shadow-none"
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
