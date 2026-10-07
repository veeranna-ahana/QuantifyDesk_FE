import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function GuidelineHeader({ totalDocuments, onAddClick }) {
  return (
    <div className="guideline-list-header-row flex flex-row justify-between items-center w-full h-[44px] shrink-0">
      <div className="flex flex-row items-center gap-3">
        <h1 className="guideline-list-title">
          Guidelines
        </h1>
        {totalDocuments > 0 && (
          <span className="guideline-list-count">
            {totalDocuments} Total Documents
          </span>
        )}
      </div>
      <Button
        size="lg"
        leftIcon={<Plus className="guideline-list-add-icon" strokeWidth={2.5} />}
        onClick={onAddClick}
        className="guideline-list-add-button"
      >
        Add Guideline
      </Button>
    </div>
  );
}
