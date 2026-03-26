import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import NewProjectActions from '@/_components/Projects/new-project-action';

interface ProjectFormProps {
  onSubmit?: (data: any) => void;
  onCancel?: () => void;
  initialData?: any;
}

const ProjectForm: React.FC<ProjectFormProps> = ({ 
  onSubmit, 
  onCancel, 
  initialData 
}) => {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    status: initialData?.status || 'not_started',
    priority: initialData?.priority || 'none',
    startDate: initialData?.startDate || undefined,
    targetDate: initialData?.targetDate || undefined,
    lead: initialData?.lead || null,
    members: initialData?.members || [],
    milestones: initialData?.milestones || [],
    teamId: initialData?.teamId || localStorage.getItem('teamId') || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(formData);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-lg">
          {initialData ? 'Edit Project' : 'Create New Project'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Project Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Enter project title"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Enter project description"
                rows={3}
              />
            </div>
          </div>

          {/* Project Actions */}
          <div className="space-y-4">
            <Label className="text-sm font-medium">Project Settings</Label>
            <NewProjectActions
              targetDate={formData.targetDate}
              setTargetDate={(date) => handleInputChange('targetDate', date)}
              startDate={formData.startDate}
              setStartDate={(date) => handleInputChange('startDate', date)}
              priority={formData.priority}
              setPriority={(priority) => handleInputChange('priority', priority)}
              status={formData.status}
              setStatus={(status) => handleInputChange('status', status)}
              milestones={formData.milestones}
              setMilestones={(milestones) => handleInputChange('milestones', milestones)}
              lead={formData.lead}
              setLead={(lead) => handleInputChange('lead', lead)}
              members={formData.members}
              setMembers={(members) => handleInputChange('members', members)}
            />
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
            <Button type="submit">
              {initialData ? 'Update Project' : 'Create Project'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ProjectForm; 