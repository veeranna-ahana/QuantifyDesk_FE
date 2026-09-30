import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function GuidelineHeader({ totalDocuments, onAddClick }) {
  return (
    <div className="flex flex-row justify-between items-center w-full h-[44px] shrink-0">
      <div className="flex flex-row items-center gap-3">
        <h1 className="text-[24px] font-bold leading-[32px] tracking-[-0.5px] text-[#0F172A] m-0">
          Guidelines
        </h1>
        {totalDocuments > 0 && (
          <span className="inline-flex items-center bg-[#D5E0F7] text-[#586377] text-[12px] font-semibold px-2 py-[2px] rounded-[12px] border-0 select-none">
            {totalDocuments} Total Documents
          </span>
        )}
      </div>
      <Button
        size="lg"
        leftIcon={<Plus className="h-4 w-4 stroke-[2.5]" />}
        onClick={onAddClick}
        className="text-[16px] font-semibold h-[44px] px-5 bg-action-primary hover:bg-action-primary-hover shadow-1"
      >
        Add Guideline
      </Button>
    </div>
  );
}
