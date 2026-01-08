'use client';

import React, { useState } from 'react';
import { 
  Eye, EyeOff, Save, Loader2, Users, Building2, Globe, Landmark, 
  User, Search, Info, ChevronDown, ChevronRight, Settings,
  LayoutDashboard, Map, Heart, FolderKanban, DollarSign, FileText,
  Database, BarChart3, Bot, Wrench, Lightbulb, Send
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

// Feature definitions
const features = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, category: 'navigation' },
  { id: 'regions', label: 'Regions', icon: Map, category: 'navigation' },
  { id: 'wl4wj', label: 'WL4WJ', icon: Heart, category: 'navigation' },
  { id: 'admin', label: 'Admin Panel', icon: Settings, category: 'navigation' },
  { id: 'chws', label: 'CHWs', icon: Users, category: 'navigation' },
  { id: 'chw-profiles', label: 'CHW Profiles', icon: User, category: 'navigation' },
  { id: 'resources', label: 'Resources', icon: Search, category: 'navigation' },
  { id: 'reports', label: 'Reports', icon: BarChart3, category: 'navigation' },
  { id: 'civicrm', label: 'CiviCRM', icon: Users, category: 'navigation' },
  { id: 'profile', label: 'My Profile', icon: User, category: 'navigation' },
  { id: 'referrals', label: 'Referrals', icon: Send, category: 'tools' },
  { id: 'projects', label: 'Projects', icon: FolderKanban, category: 'tools' },
  { id: 'grants', label: 'Grants', icon: DollarSign, category: 'tools' },
  { id: 'forms', label: 'Forms', icon: FileText, category: 'tools' },
  { id: 'datasets', label: 'Datasets', icon: Database, category: 'tools' },
  { id: 'ai-assistant', label: 'AI Assistant', icon: Bot, category: 'tools' },
  { id: 'data-tools', label: 'Data Tools', icon: Wrench, category: 'tools' },
  { id: 'ideas', label: 'Platform Ideas', icon: Lightbulb, category: 'tools' },
];

// Entity types for visibility control
type EntityType = 'user' | 'nonprofit' | 'association' | 'state';

interface EntityConfig {
  type: EntityType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  borderColor: string;
}

const entityConfigs: EntityConfig[] = [
  { type: 'user', label: 'Per User', icon: User, color: 'text-blue-600', bgColor: 'bg-blue-50', borderColor: 'border-blue-200' },
  { type: 'nonprofit', label: 'Per Nonprofit', icon: Building2, color: 'text-teal-600', bgColor: 'bg-teal-50', borderColor: 'border-teal-200' },
  { type: 'association', label: 'Per Association', icon: Globe, color: 'text-purple-600', bgColor: 'bg-purple-50', borderColor: 'border-purple-200' },
  { type: 'state', label: 'Per State', icon: Landmark, color: 'text-indigo-600', bgColor: 'bg-indigo-50', borderColor: 'border-indigo-200' },
];

// Mock data for entities
const mockEntities = {
  user: [
    { id: 'user1', name: 'John Smith', email: 'john@example.com' },
    { id: 'user2', name: 'Jane Doe', email: 'jane@example.com' },
    { id: 'user3', name: 'Bob Wilson', email: 'bob@example.com' },
  ],
  nonprofit: [
    { id: 'np1', name: 'Health First NC', location: 'Raleigh, NC' },
    { id: 'np2', name: 'Community Care Partners', location: 'Charlotte, NC' },
    { id: 'np3', name: 'Wellness Alliance', location: 'Durham, NC' },
  ],
  association: [
    { id: 'assoc1', name: 'NC CHW Association', state: 'North Carolina' },
    { id: 'assoc2', name: 'SC CHW Network', state: 'South Carolina' },
  ],
  state: [
    { id: 'state1', name: 'North Carolina', abbr: 'NC' },
    { id: 'state2', name: 'South Carolina', abbr: 'SC' },
    { id: 'state3', name: 'Virginia', abbr: 'VA' },
  ],
};

// Initial visibility state - all features visible by default
const getInitialVisibility = () => {
  const visibility: Record<string, Record<string, boolean>> = {};
  features.forEach(feature => {
    visibility[feature.id] = {};
    Object.keys(mockEntities).forEach(entityType => {
      mockEntities[entityType as EntityType].forEach(entity => {
        visibility[feature.id][entity.id] = true;
      });
    });
  });
  return visibility;
};

export default function FeatureVisibilitySettings() {
  const [activeEntityType, setActiveEntityType] = useState<EntityType>('user');
  const [selectedEntity, setSelectedEntity] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [visibility, setVisibility] = useState(getInitialVisibility);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    navigation: true,
    tools: true,
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const activeConfig = entityConfigs.find(c => c.type === activeEntityType)!;
  const entities = mockEntities[activeEntityType];
  
  const filteredEntities = entities.filter(entity => 
    entity.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({ ...prev, [category]: !prev[category] }));
  };

  const toggleFeatureVisibility = (featureId: string, entityId: string) => {
    setVisibility(prev => ({
      ...prev,
      [featureId]: {
        ...prev[featureId],
        [entityId]: !prev[featureId][entityId]
      }
    }));
    setSaved(false);
  };

  const toggleAllForEntity = (entityId: string, visible: boolean) => {
    setVisibility(prev => {
      const newVisibility = { ...prev };
      features.forEach(feature => {
        newVisibility[feature.id] = {
          ...newVisibility[feature.id],
          [entityId]: visible
        };
      });
      return newVisibility;
    });
    setSaved(false);
  };

  const toggleAllForFeature = (featureId: string, visible: boolean) => {
    setVisibility(prev => {
      const newVisibility = { ...prev };
      entities.forEach(entity => {
        newVisibility[featureId] = {
          ...newVisibility[featureId],
          [entity.id]: visible
        };
      });
      return newVisibility;
    });
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSaving(false);
    setSaved(true);
    console.log('Saving visibility settings:', visibility);
  };

  const getVisibleCount = (entityId: string) => {
    return features.filter(f => visibility[f.id]?.[entityId]).length;
  };

  const getEntityVisibleCount = (featureId: string) => {
    return entities.filter(e => visibility[featureId]?.[e.id]).length;
  };

  const navigationFeatures = features.filter(f => f.category === 'navigation');
  const toolFeatures = features.filter(f => f.category === 'tools');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Feature Visibility Settings</h2>
          <p className="text-slate-500">Control which features are visible to specific users, nonprofits, associations, or states</p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
      </div>

      {saved && (
        <Alert className="bg-green-50 border-green-200">
          <Info className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-700">
            Feature visibility settings saved successfully!
          </AlertDescription>
        </Alert>
      )}

      {/* Entity Type Selector */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Select Entity Type</CardTitle>
          <CardDescription>Choose which type of entity to configure visibility for</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {entityConfigs.map((config) => {
              const IconComponent = config.icon;
              const isActive = activeEntityType === config.type;
              return (
                <button
                  key={config.type}
                  onClick={() => {
                    setActiveEntityType(config.type);
                    setSelectedEntity(null);
                  }}
                  className={cn(
                    'flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all',
                    isActive
                      ? cn(config.bgColor, config.borderColor, 'shadow-md')
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  )}
                >
                  <IconComponent className={cn('h-6 w-6', isActive ? config.color : 'text-slate-400')} />
                  <span className={cn('text-sm font-medium', isActive ? config.color : 'text-slate-600')}>
                    {config.label}
                  </span>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Entity List */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <activeConfig.icon className={cn('h-5 w-5', activeConfig.color)} />
              {activeConfig.label.replace('Per ', '')}s
            </CardTitle>
            <div className="relative mt-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder={`Search ${activeConfig.label.replace('Per ', '').toLowerCase()}s...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </CardHeader>
          <CardContent className="max-h-[400px] overflow-y-auto">
            <div className="space-y-2">
              {filteredEntities.map((entity) => {
                const visibleCount = getVisibleCount(entity.id);
                const isSelected = selectedEntity === entity.id;
                return (
                  <button
                    key={entity.id}
                    onClick={() => setSelectedEntity(entity.id)}
                    className={cn(
                      'w-full flex items-center justify-between p-3 rounded-lg border transition-all text-left',
                      isSelected
                        ? cn(activeConfig.bgColor, activeConfig.borderColor)
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    )}
                  >
                    <div>
                      <p className={cn('font-medium', isSelected ? activeConfig.color : 'text-slate-900')}>
                        {entity.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {'email' in entity && entity.email}
                        {'location' in entity && entity.location}
                        {'state' in entity && entity.state}
                        {'abbr' in entity && entity.abbr}
                      </p>
                    </div>
                    <Badge variant={visibleCount === features.length ? 'default' : 'secondary'}>
                      {visibleCount}/{features.length}
                    </Badge>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Feature Visibility Controls */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">
                {selectedEntity 
                  ? `Features for ${entities.find(e => e.id === selectedEntity)?.name}`
                  : 'Select an entity to configure'}
              </CardTitle>
              {selectedEntity && (
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => toggleAllForEntity(selectedEntity, true)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Show All
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => toggleAllForEntity(selectedEntity, false)}
                  >
                    <EyeOff className="h-4 w-4 mr-1" />
                    Hide All
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {selectedEntity ? (
              <div className="space-y-4">
                {/* Navigation Features */}
                <div>
                  <button
                    onClick={() => toggleCategory('navigation')}
                    className="flex items-center gap-2 w-full text-left mb-2"
                  >
                    {expandedCategories.navigation ? (
                      <ChevronDown className="h-4 w-4 text-slate-400" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-slate-400" />
                    )}
                    <span className="font-semibold text-slate-700">Navigation Items</span>
                    <Badge variant="outline" className="ml-auto">
                      {navigationFeatures.filter(f => visibility[f.id]?.[selectedEntity]).length}/{navigationFeatures.length}
                    </Badge>
                  </button>
                  {expandedCategories.navigation && (
                    <div className="grid gap-2 pl-6">
                      {navigationFeatures.map((feature) => {
                        const IconComponent = feature.icon;
                        const isVisible = visibility[feature.id]?.[selectedEntity] ?? true;
                        return (
                          <div
                            key={feature.id}
                            className={cn(
                              'flex items-center justify-between p-3 rounded-lg border transition-all',
                              isVisible ? 'bg-white border-slate-200' : 'bg-slate-50 border-slate-100'
                            )}
                          >
                            <div className="flex items-center gap-3">
                              {isVisible ? (
                                <Eye className="h-4 w-4 text-green-600" />
                              ) : (
                                <EyeOff className="h-4 w-4 text-slate-400" />
                              )}
                              <IconComponent className={cn('h-5 w-5', isVisible ? 'text-slate-700' : 'text-slate-400')} />
                              <span className={cn('font-medium', isVisible ? 'text-slate-900' : 'text-slate-400')}>
                                {feature.label}
                              </span>
                            </div>
                            <Switch
                              checked={isVisible}
                              onCheckedChange={() => toggleFeatureVisibility(feature.id, selectedEntity)}
                            />
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Tool Features */}
                <div>
                  <button
                    onClick={() => toggleCategory('tools')}
                    className="flex items-center gap-2 w-full text-left mb-2"
                  >
                    {expandedCategories.tools ? (
                      <ChevronDown className="h-4 w-4 text-slate-400" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-slate-400" />
                    )}
                    <span className="font-semibold text-slate-700">CHW Tools</span>
                    <Badge variant="outline" className="ml-auto">
                      {toolFeatures.filter(f => visibility[f.id]?.[selectedEntity]).length}/{toolFeatures.length}
                    </Badge>
                  </button>
                  {expandedCategories.tools && (
                    <div className="grid gap-2 pl-6">
                      {toolFeatures.map((feature) => {
                        const IconComponent = feature.icon;
                        const isVisible = visibility[feature.id]?.[selectedEntity] ?? true;
                        return (
                          <div
                            key={feature.id}
                            className={cn(
                              'flex items-center justify-between p-3 rounded-lg border transition-all',
                              isVisible ? 'bg-white border-slate-200' : 'bg-slate-50 border-slate-100'
                            )}
                          >
                            <div className="flex items-center gap-3">
                              {isVisible ? (
                                <Eye className="h-4 w-4 text-green-600" />
                              ) : (
                                <EyeOff className="h-4 w-4 text-slate-400" />
                              )}
                              <IconComponent className={cn('h-5 w-5', isVisible ? 'text-slate-700' : 'text-slate-400')} />
                              <span className={cn('font-medium', isVisible ? 'text-slate-900' : 'text-slate-400')}>
                                {feature.label}
                              </span>
                            </div>
                            <Switch
                              checked={isVisible}
                              onCheckedChange={() => toggleFeatureVisibility(feature.id, selectedEntity)}
                            />
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                  <activeConfig.icon className="h-8 w-8 text-slate-400" />
                </div>
                <p className="text-slate-500">
                  Select a {activeConfig.label.replace('Per ', '').toLowerCase()} from the list to configure feature visibility
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Bulk Feature Control */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Bulk Feature Control</CardTitle>
          <CardDescription>
            Quickly enable or disable features for all {activeConfig.label.replace('Per ', '').toLowerCase()}s
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {features.slice(0, 6).map((feature) => {
              const IconComponent = feature.icon;
              const visibleCount = getEntityVisibleCount(feature.id);
              const allVisible = visibleCount === entities.length;
              return (
                <div
                  key={feature.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-white"
                >
                  <div className="flex items-center gap-2">
                    <IconComponent className="h-5 w-5 text-slate-600" />
                    <div>
                      <p className="font-medium text-sm text-slate-900">{feature.label}</p>
                      <p className="text-xs text-slate-500">{visibleCount}/{entities.length} enabled</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => toggleAllForFeature(feature.id, true)}
                      className={allVisible ? 'text-green-600' : ''}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => toggleAllForFeature(feature.id, false)}
                      className={!allVisible && visibleCount === 0 ? 'text-red-600' : ''}
                    >
                      <EyeOff className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
