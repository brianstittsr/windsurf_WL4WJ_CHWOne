'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Eye, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth, AuthProvider } from '@/contexts/AuthContext';
import AdminLayout from '@/components/Layout/AdminLayout';
import { CarouselService } from '@/lib/carousel-service';
import { 
  CarouselSlide, 
  CarouselSlideFormData,
  CTAAction, 
  TargetAudience, 
  ImagePosition,
  GRADIENT_PRESETS,
  ACCENT_COLOR_PRESETS,
  DEFAULT_CAROUSEL_SLIDES,
} from '@/types/carousel.types';

const CTA_ACTIONS: { value: CTAAction; label: string }[] = [
  { value: 'register_chw', label: 'Register as CHW' },
  { value: 'register_nonprofit', label: 'Register Nonprofit' },
  { value: 'register_association', label: 'Register Association' },
  { value: 'login', label: 'Login / Dashboard' },
  { value: 'learn_more', label: 'Learn More' },
  { value: 'custom_link', label: 'Custom Link' },
];

const TARGET_AUDIENCES: { value: TargetAudience; label: string }[] = [
  { value: 'chw', label: 'Community Health Workers' },
  { value: 'nonprofit', label: 'Nonprofit Organizations' },
  { value: 'association', label: 'CHW Associations' },
  { value: 'general', label: 'General / All Visitors' },
];

const IMAGE_POSITIONS: { value: ImagePosition; label: string }[] = [
  { value: 'none', label: 'No Image' },
  { value: 'left', label: 'Left Side' },
  { value: 'right', label: 'Right Side' },
  { value: 'background', label: 'Background Overlay' },
];

function CarouselSlideEditorContent() {
  const params = useParams();
  const router = useRouter();
  const { currentUser } = useAuth();
  const slideId = params?.id as string;
  const isNew = slideId === 'new';

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('content');

  const [formData, setFormData] = useState<CarouselSlideFormData>({
    title: '',
    subtitle: '',
    description: '',
    ctaText: 'Get Started',
    ctaAction: 'login',
    ctaLink: '',
    secondaryCtaText: '',
    secondaryCtaLink: '',
    backgroundGradient: GRADIENT_PRESETS[0].value,
    accentColor: ACCENT_COLOR_PRESETS[0].value,
    imageUrl: '',
    imagePosition: 'none',
    testimonial: undefined,
    stats: [],
    targetAudience: 'general',
    isActive: false,
    order: 0,
  });

  const [hasTestimonial, setHasTestimonial] = useState(false);
  const [hasStats, setHasStats] = useState(false);

  useEffect(() => {
    if (!isNew) {
      loadSlide();
    }
  }, [slideId, isNew]);

  const loadSlide = async () => {
    try {
      const slide = await CarouselService.getSlideById(slideId);
      if (slide) {
        setFormData({
          title: slide.title,
          subtitle: slide.subtitle,
          description: slide.description,
          ctaText: slide.ctaText,
          ctaAction: slide.ctaAction,
          ctaLink: slide.ctaLink || '',
          secondaryCtaText: slide.secondaryCtaText || '',
          secondaryCtaLink: slide.secondaryCtaLink || '',
          backgroundGradient: slide.backgroundGradient,
          accentColor: slide.accentColor,
          imageUrl: slide.imageUrl || '',
          imagePosition: slide.imagePosition,
          testimonial: slide.testimonial,
          stats: slide.stats || [],
          targetAudience: slide.targetAudience,
          isActive: slide.isActive,
          order: slide.order,
        });
        setHasTestimonial(!!slide.testimonial);
        setHasStats(!!slide.stats && slide.stats.length > 0);
      }
    } catch (error) {
      console.error('Error loading slide:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!currentUser?.uid) return;

    setSaving(true);
    try {
      const dataToSave = {
        ...formData,
        testimonial: hasTestimonial ? formData.testimonial : undefined,
        stats: hasStats ? formData.stats : [],
      };

      if (isNew) {
        const allSlides = await CarouselService.getAllSlides();
        dataToSave.order = allSlides.length;
        const result = await CarouselService.createSlide(dataToSave, currentUser.uid);
        if (result.success) {
          router.push('/admin/carousel');
        }
      } else {
        const result = await CarouselService.updateSlide(slideId, dataToSave, currentUser.uid);
        if (result.success) {
          router.push('/admin/carousel');
        }
      }
    } catch (error) {
      console.error('Error saving slide:', error);
    } finally {
      setSaving(false);
    }
  };

  const updateFormData = (field: keyof CarouselSlideFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateTestimonial = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      testimonial: {
        quote: prev.testimonial?.quote || '',
        author: prev.testimonial?.author || '',
        role: prev.testimonial?.role || '',
        avatarUrl: prev.testimonial?.avatarUrl,
        [field]: value,
      },
    }));
  };

  const addStat = () => {
    setFormData(prev => ({
      ...prev,
      stats: [...(prev.stats || []), { value: '', label: '' }],
    }));
  };

  const updateStat = (index: number, field: 'value' | 'label', value: string) => {
    setFormData(prev => ({
      ...prev,
      stats: prev.stats?.map((stat, i) => 
        i === index ? { ...stat, [field]: value } : stat
      ) || [],
    }));
  };

  const removeStat = (index: number) => {
    setFormData(prev => ({
      ...prev,
      stats: prev.stats?.filter((_, i) => i !== index) || [],
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" asChild>
                <Link href="/admin/carousel">
                  <ArrowLeft className="h-5 w-5" />
                </Link>
              </Button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {isNew ? 'Create New Slide' : 'Edit Slide'}
                </h1>
                <p className="text-sm text-gray-500">
                  {isNew ? 'Add a new carousel slide' : formData.title}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Label htmlFor="active-toggle" className="text-sm">Active</Label>
                <Switch
                  id="active-toggle"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => updateFormData('isActive', checked)}
                />
              </div>
              <Button onClick={handleSave} disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Saving...' : 'Save Slide'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Editor */}
          <div className="lg:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="content">Content</TabsTrigger>
                <TabsTrigger value="cta">Call to Action</TabsTrigger>
                <TabsTrigger value="design">Design</TabsTrigger>
                <TabsTrigger value="social">Social Proof</TabsTrigger>
              </TabsList>

              {/* Content Tab */}
              <TabsContent value="content" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Slide Content</CardTitle>
                    <CardDescription>The main messaging for this slide</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="title">Title (Headline)</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => updateFormData('title', e.target.value)}
                        placeholder="e.g., Elevate Your CHW Career"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="subtitle">Subtitle</Label>
                      <Input
                        id="subtitle"
                        value={formData.subtitle}
                        onChange={(e) => updateFormData('subtitle', e.target.value)}
                        placeholder="e.g., Join 500+ Community Health Workers..."
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => updateFormData('description', e.target.value)}
                        placeholder="2-3 sentences about the value proposition..."
                        className="mt-1"
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label htmlFor="audience">Target Audience</Label>
                      <Select
                        value={formData.targetAudience}
                        onValueChange={(value) => updateFormData('targetAudience', value)}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {TARGET_AUDIENCES.map((audience) => (
                            <SelectItem key={audience.value} value={audience.value}>
                              {audience.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* CTA Tab */}
              <TabsContent value="cta" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Primary Call to Action</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="ctaText">Button Text</Label>
                      <Input
                        id="ctaText"
                        value={formData.ctaText}
                        onChange={(e) => updateFormData('ctaText', e.target.value)}
                        placeholder="e.g., Register Now"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="ctaAction">Button Action</Label>
                      <Select
                        value={formData.ctaAction}
                        onValueChange={(value) => updateFormData('ctaAction', value)}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {CTA_ACTIONS.map((action) => (
                            <SelectItem key={action.value} value={action.value}>
                              {action.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {formData.ctaAction === 'custom_link' && (
                      <div>
                        <Label htmlFor="ctaLink">Custom URL</Label>
                        <Input
                          id="ctaLink"
                          value={formData.ctaLink}
                          onChange={(e) => updateFormData('ctaLink', e.target.value)}
                          placeholder="https://..."
                          className="mt-1"
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Secondary Call to Action (Optional)</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="secondaryCtaText">Button Text</Label>
                      <Input
                        id="secondaryCtaText"
                        value={formData.secondaryCtaText}
                        onChange={(e) => updateFormData('secondaryCtaText', e.target.value)}
                        placeholder="e.g., Learn More"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="secondaryCtaLink">Link URL</Label>
                      <Input
                        id="secondaryCtaLink"
                        value={formData.secondaryCtaLink}
                        onChange={(e) => updateFormData('secondaryCtaLink', e.target.value)}
                        placeholder="/about or https://..."
                        className="mt-1"
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Design Tab */}
              <TabsContent value="design" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Background</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Gradient Preset</Label>
                      <div className="grid grid-cols-4 gap-2 mt-2">
                        {GRADIENT_PRESETS.map((preset) => (
                          <button
                            key={preset.value}
                            onClick={() => updateFormData('backgroundGradient', preset.value)}
                            className={`h-16 rounded-lg ${preset.value} ${
                              formData.backgroundGradient === preset.value
                                ? 'ring-2 ring-blue-500 ring-offset-2'
                                : ''
                            }`}
                            title={preset.name}
                          />
                        ))}
                      </div>
                    </div>
                    <div>
                      <Label>Accent Color</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {ACCENT_COLOR_PRESETS.map((color) => (
                          <button
                            key={color.value}
                            onClick={() => updateFormData('accentColor', color.value)}
                            className={`w-10 h-10 rounded-full border-2 ${
                              formData.accentColor === color.value
                                ? 'ring-2 ring-blue-500 ring-offset-2'
                                : 'border-gray-200'
                            }`}
                            style={{
                              backgroundColor: color.value === 'white' ? 'white' : undefined,
                            }}
                            title={color.name}
                          >
                            {color.value !== 'white' && (
                              <span className={`block w-full h-full rounded-full bg-${color.value}`} />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Image (Optional)</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="imageUrl">Image URL</Label>
                      <Input
                        id="imageUrl"
                        value={formData.imageUrl}
                        onChange={(e) => updateFormData('imageUrl', e.target.value)}
                        placeholder="https://..."
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Image Position</Label>
                      <Select
                        value={formData.imagePosition}
                        onValueChange={(value) => updateFormData('imagePosition', value)}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {IMAGE_POSITIONS.map((pos) => (
                            <SelectItem key={pos.value} value={pos.value}>
                              {pos.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Social Proof Tab */}
              <TabsContent value="social" className="space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Testimonial</CardTitle>
                        <CardDescription>Add a quote from a satisfied user</CardDescription>
                      </div>
                      <Switch
                        checked={hasTestimonial}
                        onCheckedChange={setHasTestimonial}
                      />
                    </div>
                  </CardHeader>
                  {hasTestimonial && (
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="quote">Quote</Label>
                        <Textarea
                          id="quote"
                          value={formData.testimonial?.quote || ''}
                          onChange={(e) => updateTestimonial('quote', e.target.value)}
                          placeholder="What they said about CHWOne..."
                          className="mt-1"
                          rows={2}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="author">Author Name</Label>
                          <Input
                            id="author"
                            value={formData.testimonial?.author || ''}
                            onChange={(e) => updateTestimonial('author', e.target.value)}
                            placeholder="Jane Doe"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="role">Role/Title</Label>
                          <Input
                            id="role"
                            value={formData.testimonial?.role || ''}
                            onChange={(e) => updateTestimonial('role', e.target.value)}
                            placeholder="CHW, Durham County"
                            className="mt-1"
                          />
                        </div>
                      </div>
                    </CardContent>
                  )}
                </Card>

                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Statistics</CardTitle>
                        <CardDescription>Show impact numbers</CardDescription>
                      </div>
                      <Switch
                        checked={hasStats}
                        onCheckedChange={setHasStats}
                      />
                    </div>
                  </CardHeader>
                  {hasStats && (
                    <CardContent className="space-y-4">
                      {formData.stats?.map((stat, index) => (
                        <div key={index} className="flex items-end gap-2">
                          <div className="flex-1">
                            <Label>Value</Label>
                            <Input
                              value={stat.value}
                              onChange={(e) => updateStat(index, 'value', e.target.value)}
                              placeholder="500+"
                              className="mt-1"
                            />
                          </div>
                          <div className="flex-1">
                            <Label>Label</Label>
                            <Input
                              value={stat.label}
                              onChange={(e) => updateStat(index, 'label', e.target.value)}
                              placeholder="Active CHWs"
                              className="mt-1"
                            />
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeStat(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button variant="outline" onClick={addStat} className="w-full">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Statistic
                      </Button>
                    </CardContent>
                  )}
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Preview */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Preview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div 
                  className={`aspect-video rounded-lg ${formData.backgroundGradient} p-4 text-white overflow-hidden`}
                >
                  <h3 className="font-bold text-sm truncate">{formData.title || 'Title'}</h3>
                  <p className="text-xs opacity-80 truncate mt-1">{formData.subtitle || 'Subtitle'}</p>
                  <p className="text-xs opacity-70 mt-2 line-clamp-2">{formData.description || 'Description...'}</p>
                  {hasStats && formData.stats && formData.stats.length > 0 && (
                    <div className="flex gap-3 mt-3">
                      {formData.stats.slice(0, 3).map((stat, i) => (
                        <div key={i} className="text-center">
                          <div className="text-sm font-bold">{stat.value || '0'}</div>
                          <div className="text-xs opacity-70">{stat.label || 'Label'}</div>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="mt-3">
                    <span className="inline-block bg-white text-gray-900 text-xs px-2 py-1 rounded">
                      {formData.ctaText || 'CTA'}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-3 text-center">
                  This is a simplified preview. View the home page for full experience.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CarouselSlideEditorPage() {
  return (
    <AuthProvider>
      <AdminLayout>
        <CarouselSlideEditorContent />
      </AdminLayout>
    </AuthProvider>
  );
}
