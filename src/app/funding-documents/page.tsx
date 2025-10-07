'use client';

import { useState } from 'react';
import { Button, Card, Flex, Heading, Text, Input } from '@once-ui-system/components';

interface FundingProject {
  id: string;
  title: string;
  description: string;
  contributors: string[];
  status: 'draft' | 'collecting' | 'synthesizing' | 'complete';
  createdAt: Date;
}

export default function FundingDocumentsPage() {
  const [projects, setProjects] = useState<FundingProject[]>([]);
  const [newProjectTitle, setNewProjectTitle] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');

  const createProject = () => {
    if (!newProjectTitle.trim()) return;

    const newProject: FundingProject = {
      id: Date.now().toString(),
      title: newProjectTitle,
      description: newProjectDescription,
      contributors: [],
      status: 'draft',
      createdAt: new Date(),
    };

    setProjects([...projects, newProject]);
    setNewProjectTitle('');
    setNewProjectDescription('');
  };

  return (
    <Flex direction="column" gap="xl" padding="xl">
      <Heading size="xl">Funding Document Synthesis</Heading>
      <Text>
        Create collaborative funding documents by gathering input from multiple contributors
        and synthesizing them into professional 1-pagers and pitch packages.
      </Text>

      {/* Create New Project */}
      <Card padding="lg" background="surface">
        <Heading size="lg" marginBottom="md">Create New Funding Project</Heading>
        <Flex direction="column" gap="md">
          <Input
            label="Project Title"
            value={newProjectTitle}
            onChange={(e) => setNewProjectTitle(e.target.value)}
            placeholder="e.g., Community Health Initiative Funding 2025"
          />
          <Input
            label="Description"
            value={newProjectDescription}
            onChange={(e) => setNewProjectDescription(e.target.value)}
            placeholder="Brief description of the funding opportunity"
          />
          <Button onClick={createProject} variant="primary">
            Create Project
          </Button>
        </Flex>
      </Card>

      {/* Existing Projects */}
      <Card padding="lg" background="surface">
        <Heading size="lg" marginBottom="md">Your Projects</Heading>
        {projects.length === 0 ? (
          <Text color="secondary">No projects yet. Create your first funding document project above.</Text>
        ) : (
          <Flex direction="column" gap="md">
            {projects.map((project) => (
              <Card key={project.id} padding="md" background="neutral-weak">
                <Flex justifyContent="space-between" alignItems="center">
                  <Flex direction="column" gap="xs">
                    <Heading size="md">{project.title}</Heading>
                    <Text size="sm" color="secondary">{project.description}</Text>
                    <Text size="xs" color="tertiary">
                      Status: {project.status} • Created: {project.createdAt.toLocaleDateString()}
                    </Text>
                  </Flex>
                  <Flex gap="sm">
                    <Button size="sm" variant="secondary">Edit</Button>
                    <Button size="sm" variant="primary">View Contributions</Button>
                  </Flex>
                </Flex>
              </Card>
            ))}
          </Flex>
        )}
      </Card>
    </Flex>
  );
}
