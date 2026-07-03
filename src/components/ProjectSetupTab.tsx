import React from 'react';
import { ProjectSetup } from '../types';
import { Briefcase, User, Calendar, Percent, ShieldAlert } from 'lucide-react';

interface ProjectSetupTabProps {
  setup: ProjectSetup;
  onChange: (updated: ProjectSetup) => void;
}

export const ProjectSetupTab: React.FC<ProjectSetupTabProps> = ({ setup, onChange }) => {
  const handleInputChange = (field: keyof ProjectSetup, value: string | number) => {
    onChange({
      ...setup,
      [field]: value
    });
  };

  return (
    <div className="space-y-8 tab-fade-up">
      {/* Overview Card */}
      <div className="standard-card">
        <h2 className="font-heading-title text-2xl font-bold text-[var(--color-primary)] mb-2">Project Profile & Parameters</h2>
        <p className="text-[var(--color-muted)] text-sm mb-6">
          Establish the general project information, administrative metadata, and financial markup percentages. These configurations dynamically calculate the overall contract valuation and budget contingencies.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Project Name */}
          <div className="flex flex-col space-y-1">
            <label className="label-uppercase flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5" /> Project Name
            </label>
            <input
              type="text"
              id="setup-project-name"
              className="input-editable font-medium focus:ring-1"
              value={setup.projectName}
              onChange={(e) => handleInputChange('projectName', e.target.value)}
            />
          </div>

          {/* Client */}
          <div className="flex flex-col space-y-1">
            <label className="label-uppercase flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" /> Client Entity
            </label>
            <input
              type="text"
              id="setup-client"
              className="input-editable"
              value={setup.client}
              onChange={(e) => handleInputChange('client', e.target.value)}
            />
          </div>

          {/* Bid Date */}
          <div className="flex flex-col space-y-1">
            <label className="label-uppercase flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" /> Submission Bid Date
            </label>
            <input
              type="date"
              id="setup-bid-date"
              className="input-editable"
              value={setup.bidDate}
              onChange={(e) => handleInputChange('bidDate', e.target.value)}
            />
          </div>

          {/* Estimator */}
          <div className="flex flex-col space-y-1">
            <label className="label-uppercase flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" /> Lead Estimator
            </label>
            <input
              type="text"
              id="setup-estimator"
              className="input-editable"
              value={setup.estimator}
              onChange={(e) => handleInputChange('estimator', e.target.value)}
            />
          </div>

          {/* Project Type */}
          <div className="flex flex-col space-y-1">
            <label className="label-uppercase flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5" /> Construction Class
            </label>
            <select
              id="setup-project-type"
              className="input-editable h-[38px]"
              value={setup.projectType}
              onChange={(e) => handleInputChange('projectType', e.target.value)}
            >
              <option value="Commercial Core & Shell">Commercial Core & Shell</option>
              <option value="Residential Multi-Family">Residential Multi-Family</option>
              <option value="Industrial Warehouse">Industrial Warehouse</option>
              <option value="Civil Infrastructure">Civil Infrastructure</option>
              <option value="Institutional Academy">Institutional Academy</option>
            </select>
          </div>

          {/* Markup % */}
          <div className="flex flex-col space-y-1">
            <label className="label-uppercase flex items-center gap-1.5">
              <Percent className="w-3.5 h-3.5 text-[var(--color-accent)]" /> G&A Markup (%)
            </label>
            <input
              type="number"
              id="setup-markup-percent"
              step="0.1"
              min="0"
              max="100"
              className="input-editable font-mono-val"
              value={setup.markupPercent}
              onChange={(e) => handleInputChange('markupPercent', parseFloat(e.target.value) || 0)}
            />
          </div>

          {/* Contingency % */}
          <div className="flex flex-col space-y-1">
            <label className="label-uppercase flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-[var(--color-accent)]" /> Project Contingency (%)
            </label>
            <input
              type="number"
              id="setup-contingency-percent"
              step="0.1"
              min="0"
              max="100"
              className="input-editable font-mono-val"
              value={setup.contingencyPercent}
              onChange={(e) => handleInputChange('contingencyPercent', parseFloat(e.target.value) || 0)}
            />
          </div>
        </div>
      </div>

      {/* Insight Section */}
      <div className="insight-block">
        <h4 className="font-heading-title text-base font-semibold text-[var(--color-primary)] mb-1">
          AIA Standard Formulation Note
        </h4>
        <p className="text-[var(--color-body-text)] text-xs">
          General & Administrative (G&A) Markup is set to <span className="font-semibold text-[var(--color-accent)]">{setup.markupPercent}%</span>, and Contingency is pegged at <span className="font-semibold text-[var(--color-accent)]">{setup.contingencyPercent}%</span>. Direct costs calculated within individual assemblies will be compounded by these exact weights to formulate the comprehensive schedule of values (AIA Document G703 format).
        </p>
      </div>
    </div>
  );
};
