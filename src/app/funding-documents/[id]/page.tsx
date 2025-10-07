'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { Button, Card, Flex, Heading, Text, Input, Textarea, Select } from '@once-ui-system/components';

interface Contribution {
  id: string;
  contributorName: string;
  contributorEmail: string;
  section: string;
  content: string;
  submittedAt: Date;
}

interface Project {
  id: string;
  title: string;
  description: string;
  status: 'draft' | 'collecting' | 'synthesizing' | 'complete';
}

const CONTRIBUTION_SECTIONS = [
  'Executive Summary',
  'Problem Statement',
  'Solution Overview',
  'Market Analysis',
  'Target Audience',
  'Competitive Landscape',
  'Business Model',
  'Financial Projections',
  'Team & Experience',
  'Milestones & Timeline',
  'Funding Requirements',
  'Use of Funds',
];

export default function ProjectDetailPage() {
  const params = useParams();
  const projectId = params.id as string;

  // Mock project data - in real app, fetch from API
  const [project] = useState<Project>({
    id: projectId,
    title: 'Community Health Initiative Funding 2025',
    description: 'Comprehensive funding proposal for expanding CHW services',
    status: 'collecting',
  });

  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [newContribution, setNewContribution] = useState({
    contributorName: '',
    contributorEmail: '',
    section: '',
    content: '',
  });

  const submitContribution = () => {
    if (!newContribution.contributorName || !newContribution.section || !newContribution.content) {
      return;
    }

    const contribution: Contribution = {
      id: Date.now().toString(),
      contributorName: newContribution.contributorName,
      contributorEmail: newContribution.contributorEmail,
      section: newContribution.section,
      content: newContribution.content,
      submittedAt: new Date(),
    };

    setContributions([...contributions, contribution]);
    setNewContribution({
      contributorName: '',
      contributorEmail: '',
      section: '',
      content: '',
    });
  };

  const generateDocuments = () => {
    // TODO: Implement synthesis and document generation
    alert('Document generation will be implemented next!');
  };

  return (
    <Flex direction="column" gap="xl" padding="xl">
      <Flex justifyContent="space-between" alignItems="center">
        <Flex direction="column" gap="xs">
          <Heading size="xl">{project.title}</Heading>
          <Text color="secondary">{project.description}</Text>
          <Text size="sm" color="tertiary">Status: {project.status}</Text>
        </Flex>
        <Button onClick={generateDocuments} variant="primary" size="lg">
          Generate Documents
        </Button>
      </Flex>

      {/* Contribution Form */}
      <Card padding="lg" background="surface">
        <Heading size="lg" marginBottom="md">Add Your Contribution</Heading>
        <Flex direction="column" gap="md">
          <Flex gap="md">
            <Input
              label="Your Name"
              value={newContribution.contributorName}
              onChange={(e) => setNewContribution({...newContribution, contributorName: e.target.value})}
              placeholder="Enter your full name"
              style={{ flex: 1 }}
            />
            <Input
              label="Email (optional)"
              type="email"
              value={newContribution.contributorEmail}
              onChange={(e) => setNewContribution({...newContribution, contributorEmail: e.target.value})}
              placeholder="your.email@example.com"
              style={{ flex: 1 }}
            />
          </Flex>

          <Select
            label="Section"
            value={newContribution.section}
            onChange={(value) => setNewContribution({...newContribution, section: value})}
            options={CONTRIBUTION_SECTIONS.map(section => ({ value: section, label: section }))}
            placeholder="Select the section you want to contribute to"
          />

          <Textarea
            label="Content"
            value={newContribution.content}
            onChange={(e) => setNewContribution({...newContribution, content: e.target.value})}
            placeholder="Provide your detailed input for this section..."
            rows={6}
          />

          <Button onClick={submitContribution} variant="primary">
            Submit Contribution
          </Button>
        </Flex>
      </Card>

      {/* Existing Contributions */}
      <Card padding="lg" background="surface">
        <Heading size="lg" marginBottom="md">Contributions ({contributions.length})</Heading>
        {contributions.length === 0 ? (
          <Text color="secondary">No contributions yet. Be the first to add your input!</Text>
        ) : (
          <Flex direction="column" gap="md">
            {contributions.map((contribution) => (
              <Card key={contribution.id} padding="md" background="neutral-weak">
                <Flex direction="column" gap="xs">
                  <Flex justifyContent="space-between" alignItems="center">
                    <Heading size="sm">{contribution.section}</Heading>
                    <Text size="xs" color="tertiary">
                      {contribution.submittedAt.toLocaleDateString()}
                    </Text>
                  </Flex>
                  <Text size="sm" color="secondary">By: {contribution.contributorName}</Text>
                  <Text>{contribution.content}</Text>
                </Flex>
              </Card>
            ))}
          </Flex>
        )}
      </Card>

      {/* Output Options */}
      <Card padding="lg" background="surface">
        <Heading size="lg" marginBottom="md">Output Options</Heading>
        <Text marginBottom="md">
          Once you have collected contributions, generate professional documents:
        </Text>
        <Flex direction="column" gap="sm">
          <Text>• <strong>1-Pager:</strong> Concise executive summary PDF</Text>
          <Text>• <strong>Pitch Package:</strong> Full PowerPoint presentation</Text>
          <Text>• <strong>Google Drive:</strong> Direct upload to your Drive</Text>
          <Text>• <strong>Download:</strong> Zipped bundle of all documents</Text>
          <Text>• <strong>Email:</strong> Send directly to stakeholders</Text>
        </Flex>
      </Card>
    </Flex>
  );
}
