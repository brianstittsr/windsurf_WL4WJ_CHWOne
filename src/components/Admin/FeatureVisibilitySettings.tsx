'use client';

import React, { useState, useEffect } from 'react';
import { 
  Eye, EyeOff, Save, Loader2, Users, Building2, Globe, Landmark, 
  User, Search, CheckCircle, ChevronDown, ChevronRight, Settings,
  LayoutDashboard, Map, Heart, FolderKanban, DollarSign, FileText,
  Database, BarChart3, Bot, Wrench, Lightbulb, Send, AlertCircle
} from 'lucide-react';
import UserManagementService from '@/services/UserManagementService';
import NonprofitSearchService from '@/services/NonprofitSearchService';
import ChwAssociationService from '@/services/ChwAssociationService';
import StateService from '@/services/StateService';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

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

interface Entity {
  id: string;
  name: string;
  subtitle?: string;
}

interface EntityConfig {
  type: EntityType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const entityConfigs: EntityConfig[] = [
  { type: 'user', label: 'Per User', icon: User },
  { type: 'nonprofit', label: 'Per Nonprofit', icon: Building2 },
  { type: 'association', label: 'Per Association', icon: Globe },
  { type: 'state', label: 'Per State', icon: Landmark },
];

export default function FeatureVisibilitySettings() {
  const [activeEntityType, setActiveEntityType] = useState<EntityType>('user');
  const [selectedEntity, setSelectedEntity] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [visibility, setVisibility] = useState<Record<string, Record<string, boolean>>>({});
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    navigation: true,
    tools: true,
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Real data from Firestore
  const [entities, setEntities] = useState<Record<EntityType, Entity[]>>({
    user: [],
    nonprofit: [],
    association: [],
    state: [],
  });

  // Fetch real data from Firestore
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        // Fetch users
        const users = await UserManagementService.getAllUsers();
        const userEntities: Entity[] = users.map(u => ({
          id: u.uid || (u as any).id || '',
          name: u.displayName || u.email || 'Unknown User',
          subtitle: u.email || '',
        }));

        // Fetch nonprofits
        const nonprofits = await NonprofitSearchService.getAllNonprofits();
        const nonprofitEntities: Entity[] = nonprofits.map(n => ({
          id: n.id || '',
          name: n.name || 'Unknown Nonprofit',
          subtitle: n.address?.city ? `${n.address.city}, ${n.address.state}` : '',
        }));

        // Fetch associations
        const associations = await ChwAssociationService.getAllAssociations();
        const associationEntities: Entity[] = associations.map(a => ({
          id: a.id || '',
          name: a.name || 'Unknown Association',
          subtitle: (a as any).stateName || a.stateId || '',
        }));

        // Fetch states
        const states = await StateService.getAllStates();
        const stateEntities: Entity[] = states.map(s => ({
          id: s.id || '',
          name: s.name || 'Unknown State',
          subtitle: s.abbreviation || '',
        }));

        setEntities({
          user: userEntities,
          nonprofit: nonprofitEntities,
          association: associationEntities,
          state: stateEntities,
        });

        // Initialize visibility (all visible by default)
        const allEntities = [...userEntities, ...nonprofitEntities, ...associationEntities, ...stateEntities];
        const initialVisibility: Record<string, Record<string, boolean>> = {};
        features.forEach(feature => {
          initialVisibility[feature.id] = {};
          allEntities.forEach(entity => {
            initialVisibility[feature.id][entity.id] = true;
          });
        });
        setVisibility(initialVisibility);

        // Try to load saved visibility from Firestore
        try {
          const visibilityDoc = await getDoc(doc(db, 'settings', 'featureVisibility'));
          if (visibilityDoc.exists()) {
            setVisibility(prev => ({ ...prev, ...visibilityDoc.data() }));
          }
        } catch (e) {
          console.warn('Could not load saved visibility settings');
        }

      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data. Please try again.');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const activeConfig = entityConfigs.find(c => c.type === activeEntityType)!;
  const currentEntities = entities[activeEntityType];
  
  const filteredEntities = currentEntities.filter(entity => 
    entity.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    entity.subtitle?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({ ...prev, [category]: !prev[category] }));
  };

  const toggleFeatureVisibility = (featureId: string, entityId: string) => {
    setVisibility(prev => ({
      ...prev,
      [featureId]: {
        ...prev[featureId],
        [entityId]: !prev[featureId]?.[entityId]
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
      currentEntities.forEach(entity => {
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
    try {
      await setDoc(doc(db, 'settings', 'featureVisibility'), visibility);
      setSaved(true);
    } catch (err) {
      console.error('Error saving visibility settings:', err);
      setError('Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const getVisibleCount = (entityId: string) => {
    return features.filter(f => visibility[f.id]?.[entityId] !== false).length;
  };

  const getEntityVisibleCount = (featureId: string) => {
    return currentEntities.filter(e => visibility[featureId]?.[e.id] !== false).length;
  };

  const navigationFeatures = features.filter(f => f.category === 'navigation');
  const toolFeatures = features.filter(f => f.category === 'tools');

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-[#0071E3] animate-spin mx-auto mb-4" />
          <p className="text-[#6E6E73]">Loading data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Apple-style Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-[#1D1D1F] tracking-tight">Feature Visibility</h2>
          <p className="text-[#6E6E73] mt-1">Control which features are visible to users, nonprofits, associations, or states</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0071E3] text-white rounded-xl font-medium hover:bg-[#0077ED] transition-colors disabled:opacity-50"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save Changes
            </>
          )}
        </button>
      </div>

      {/* Success/Error Messages */}
      {saved && (
        <div className="p-4 bg-[#34C759]/10 border border-[#34C759]/20 rounded-xl flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-[#34C759]" />
          <p className="text-[#34C759] font-medium">Feature visibility settings saved successfully!</p>
        </div>
      )}

      {error && (
        <div className="p-4 bg-[#FF3B30]/10 border border-[#FF3B30]/20 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-[#FF3B30]" />
          <p className="text-[#FF3B30]">{error}</p>
        </div>
      )}

      {/* Entity Type Selector - Apple Style */}
      <div className="bg-white rounded-2xl border border-[#D2D2D7] p-6">
        <h3 className="text-sm font-semibold text-[#1D1D1F] mb-2">Select Entity Type</h3>
        <p className="text-sm text-[#6E6E73] mb-4">Choose which type of entity to configure visibility for</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {entityConfigs.map((config) => {
            const IconComponent = config.icon;
            const isActive = activeEntityType === config.type;
            const count = entities[config.type].length;
            return (
              <button
                key={config.type}
                onClick={() => {
                  setActiveEntityType(config.type);
                  setSelectedEntity(null);
                  setSearchQuery('');
                }}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                  isActive
                    ? 'bg-[#0071E3]/10 border-[#0071E3] shadow-sm'
                    : 'bg-white border-[#D2D2D7] hover:border-[#86868B] hover:bg-[#F5F5F7]'
                }`}
              >
                <IconComponent className={`h-6 w-6 ${isActive ? 'text-[#0071E3]' : 'text-[#86868B]'}`} />
                <span className={`text-sm font-medium ${isActive ? 'text-[#0071E3]' : 'text-[#1D1D1F]'}`}>
                  {config.label}
                </span>
                <span className={`text-xs ${isActive ? 'text-[#0071E3]' : 'text-[#6E6E73]'}`}>
                  {count} {count === 1 ? 'item' : 'items'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Entity List */}
        <div className="bg-white rounded-2xl border border-[#D2D2D7] overflow-hidden">
          <div className="p-4 border-b border-[#D2D2D7]">
            <div className="flex items-center gap-2 mb-3">
              <activeConfig.icon className="h-5 w-5 text-[#0071E3]" />
              <h3 className="font-semibold text-[#1D1D1F]">
                {activeConfig.label.replace('Per ', '')}s
              </h3>
              <span className="ml-auto text-sm text-[#6E6E73]">{currentEntities.length}</span>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#86868B]" />
              <input
                type="text"
                placeholder={`Search ${activeConfig.label.replace('Per ', '').toLowerCase()}s...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-[#F5F5F7] border-0 rounded-xl text-[#1D1D1F] placeholder-[#86868B] focus:outline-none focus:ring-2 focus:ring-[#0071E3]"
              />
            </div>
          </div>
          <div className="max-h-[400px] overflow-y-auto p-3 space-y-2">
            {filteredEntities.length === 0 ? (
              <div className="text-center py-8 text-[#6E6E73]">
                <p>No {activeConfig.label.replace('Per ', '').toLowerCase()}s found</p>
              </div>
            ) : (
              filteredEntities.map((entity) => {
                const visibleCount = getVisibleCount(entity.id);
                const isSelected = selectedEntity === entity.id;
                return (
                  <button
                    key={entity.id}
                    onClick={() => setSelectedEntity(entity.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all text-left ${
                      isSelected
                        ? 'bg-[#0071E3]/10 border-[#0071E3]'
                        : 'bg-white border-[#D2D2D7] hover:border-[#86868B]'
                    }`}
                  >
                    <div className="min-w-0">
                      <p className={`font-medium truncate ${isSelected ? 'text-[#0071E3]' : 'text-[#1D1D1F]'}`}>
                        {entity.name}
                      </p>
                      {entity.subtitle && (
                        <p className="text-xs text-[#6E6E73] truncate">{entity.subtitle}</p>
                      )}
                    </div>
                    <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-lg ${
                      visibleCount === features.length
                        ? 'bg-[#34C759]/10 text-[#34C759]'
                        : 'bg-[#F5F5F7] text-[#6E6E73]'
                    }`}>
                      {visibleCount}/{features.length}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Feature Visibility Controls */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[#D2D2D7] overflow-hidden">
          <div className="p-4 border-b border-[#D2D2D7] flex items-center justify-between">
            <h3 className="font-semibold text-[#1D1D1F]">
              {selectedEntity 
                ? `Features for ${currentEntities.find(e => e.id === selectedEntity)?.name}`
                : 'Select an entity to configure'}
            </h3>
            {selectedEntity && (
              <div className="flex gap-2">
                <button
                  onClick={() => toggleAllForEntity(selectedEntity, true)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-[#34C759] bg-[#34C759]/10 rounded-lg hover:bg-[#34C759]/20 transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  Show All
                </button>
                <button
                  onClick={() => toggleAllForEntity(selectedEntity, false)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-[#FF3B30] bg-[#FF3B30]/10 rounded-lg hover:bg-[#FF3B30]/20 transition-colors"
                >
                  <EyeOff className="w-4 h-4" />
                  Hide All
                </button>
              </div>
            )}
          </div>
          <div className="p-4">
            {selectedEntity ? (
              <div className="space-y-4">
                {/* Navigation Features */}
                <div>
                  <button
                    onClick={() => toggleCategory('navigation')}
                    className="flex items-center gap-2 w-full text-left mb-3"
                  >
                    {expandedCategories.navigation ? (
                      <ChevronDown className="h-4 w-4 text-[#86868B]" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-[#86868B]" />
                    )}
                    <span className="font-semibold text-[#1D1D1F]">Navigation Items</span>
                    <span className="ml-auto px-2 py-0.5 text-xs font-medium bg-[#F5F5F7] text-[#6E6E73] rounded-lg">
                      {navigationFeatures.filter(f => visibility[f.id]?.[selectedEntity] !== false).length}/{navigationFeatures.length}
                    </span>
                  </button>
                  {expandedCategories.navigation && (
                    <div className="grid gap-2 pl-6">
                      {navigationFeatures.map((feature) => {
                        const IconComponent = feature.icon;
                        const isVisible = visibility[feature.id]?.[selectedEntity] !== false;
                        return (
                          <div
                            key={feature.id}
                            className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                              isVisible ? 'bg-white border-[#D2D2D7]' : 'bg-[#F5F5F7] border-[#E5E5EA]'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              {isVisible ? (
                                <Eye className="h-4 w-4 text-[#34C759]" />
                              ) : (
                                <EyeOff className="h-4 w-4 text-[#86868B]" />
                              )}
                              <IconComponent className={`h-5 w-5 ${isVisible ? 'text-[#1D1D1F]' : 'text-[#86868B]'}`} />
                              <span className={`font-medium ${isVisible ? 'text-[#1D1D1F]' : 'text-[#86868B]'}`}>
                                {feature.label}
                              </span>
                            </div>
                            <button
                              onClick={() => toggleFeatureVisibility(feature.id, selectedEntity)}
                              className={`relative w-12 h-7 rounded-full transition-colors ${
                                isVisible ? 'bg-[#34C759]' : 'bg-[#E5E5EA]'
                              }`}
                            >
                              <span className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                                isVisible ? 'right-1' : 'left-1'
                              }`} />
                            </button>
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
                    className="flex items-center gap-2 w-full text-left mb-3"
                  >
                    {expandedCategories.tools ? (
                      <ChevronDown className="h-4 w-4 text-[#86868B]" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-[#86868B]" />
                    )}
                    <span className="font-semibold text-[#1D1D1F]">CHW Tools</span>
                    <span className="ml-auto px-2 py-0.5 text-xs font-medium bg-[#F5F5F7] text-[#6E6E73] rounded-lg">
                      {toolFeatures.filter(f => visibility[f.id]?.[selectedEntity] !== false).length}/{toolFeatures.length}
                    </span>
                  </button>
                  {expandedCategories.tools && (
                    <div className="grid gap-2 pl-6">
                      {toolFeatures.map((feature) => {
                        const IconComponent = feature.icon;
                        const isVisible = visibility[feature.id]?.[selectedEntity] !== false;
                        return (
                          <div
                            key={feature.id}
                            className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                              isVisible ? 'bg-white border-[#D2D2D7]' : 'bg-[#F5F5F7] border-[#E5E5EA]'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              {isVisible ? (
                                <Eye className="h-4 w-4 text-[#34C759]" />
                              ) : (
                                <EyeOff className="h-4 w-4 text-[#86868B]" />
                              )}
                              <IconComponent className={`h-5 w-5 ${isVisible ? 'text-[#1D1D1F]' : 'text-[#86868B]'}`} />
                              <span className={`font-medium ${isVisible ? 'text-[#1D1D1F]' : 'text-[#86868B]'}`}>
                                {feature.label}
                              </span>
                            </div>
                            <button
                              onClick={() => toggleFeatureVisibility(feature.id, selectedEntity)}
                              className={`relative w-12 h-7 rounded-full transition-colors ${
                                isVisible ? 'bg-[#34C759]' : 'bg-[#E5E5EA]'
                              }`}
                            >
                              <span className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                                isVisible ? 'right-1' : 'left-1'
                              }`} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 rounded-2xl bg-[#F5F5F7] flex items-center justify-center mb-4">
                  <activeConfig.icon className="h-8 w-8 text-[#86868B]" />
                </div>
                <p className="text-[#6E6E73]">
                  Select a {activeConfig.label.replace('Per ', '').toLowerCase()} from the list to configure feature visibility
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bulk Feature Control */}
      <div className="bg-white rounded-2xl border border-[#D2D2D7] overflow-hidden">
        <div className="p-4 border-b border-[#D2D2D7]">
          <h3 className="font-semibold text-[#1D1D1F]">Bulk Feature Control</h3>
          <p className="text-sm text-[#6E6E73] mt-1">
            Quickly enable or disable features for all {activeConfig.label.replace('Per ', '').toLowerCase()}s
          </p>
        </div>
        <div className="p-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {features.slice(0, 6).map((feature) => {
              const IconComponent = feature.icon;
              const visibleCount = getEntityVisibleCount(feature.id);
              const allVisible = visibleCount === currentEntities.length;
              return (
                <div
                  key={feature.id}
                  className="flex items-center justify-between p-3 rounded-xl border border-[#D2D2D7] bg-white"
                >
                  <div className="flex items-center gap-3">
                    <IconComponent className="h-5 w-5 text-[#6E6E73]" />
                    <div>
                      <p className="font-medium text-sm text-[#1D1D1F]">{feature.label}</p>
                      <p className="text-xs text-[#6E6E73]">{visibleCount}/{currentEntities.length} enabled</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => toggleAllForFeature(feature.id, true)}
                      className={`p-2 rounded-lg transition-colors ${
                        allVisible ? 'text-[#34C759] bg-[#34C759]/10' : 'text-[#86868B] hover:bg-[#F5F5F7]'
                      }`}
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => toggleAllForFeature(feature.id, false)}
                      className={`p-2 rounded-lg transition-colors ${
                        visibleCount === 0 ? 'text-[#FF3B30] bg-[#FF3B30]/10' : 'text-[#86868B] hover:bg-[#F5F5F7]'
                      }`}
                    >
                      <EyeOff className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
