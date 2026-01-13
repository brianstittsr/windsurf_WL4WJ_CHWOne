'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Copy, 
  Eye, 
  EyeOff, 
  GripVertical,
  ArrowLeft,
  MoreVertical,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useCarouselAdmin } from '@/hooks/useCarouselSlides';
import { useAuth, AuthProvider } from '@/contexts/AuthContext';
import { CarouselSlide } from '@/types/carousel.types';
import UnifiedLayout from '@/components/Layout/UnifiedLayout';

// Inner component that uses auth context
function CarouselAdminContent() {
  const router = useRouter();
  const { currentUser } = useAuth();
  const { slides, loading, toggleActive, deleteSlide, duplicateSlide } = useCarouselAdmin();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [slideToDelete, setSlideToDelete] = useState<CarouselSlide | null>(null);

  const handleToggleActive = async (slide: CarouselSlide) => {
    if (!currentUser?.uid) return;
    await toggleActive(slide.id, !slide.isActive, currentUser.uid);
  };

  const handleDuplicate = async (slide: CarouselSlide) => {
    if (!currentUser?.uid) return;
    const result = await duplicateSlide(slide.id, currentUser.uid);
    if (result.success && result.slideId) {
      router.push(`/admin/carousel/${result.slideId}`);
    }
  };

  const handleDeleteClick = (slide: CarouselSlide) => {
    setSlideToDelete(slide);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!slideToDelete) return;
    await deleteSlide(slideToDelete.id);
    setDeleteDialogOpen(false);
    setSlideToDelete(null);
  };

  const getAudienceBadgeColor = (audience: string) => {
    switch (audience) {
      case 'chw': return 'bg-blue-100 text-blue-800';
      case 'nonprofit': return 'bg-teal-100 text-teal-800';
      case 'association': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading carousel slides...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" asChild>
                <Link href="/admin">
                  <ArrowLeft className="h-5 w-5" />
                </Link>
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Carousel Management</h1>
                <p className="text-sm text-gray-500">Manage hero carousel slides for the home page</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" asChild>
                <Link href="/" target="_blank">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Preview Home
                </Link>
              </Button>
              <Button asChild>
                <Link href="/admin/carousel/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Slide
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {slides.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <p className="text-gray-500 mb-4">No carousel slides configured yet.</p>
              <Button asChild>
                <Link href="/admin/carousel/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Slide
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {slides.map((slide, index) => (
              <Card key={slide.id} className={`transition-all ${!slide.isActive ? 'opacity-60' : ''}`}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    {/* Drag Handle */}
                    <div className="flex items-center justify-center w-8 h-full cursor-grab text-gray-400 hover:text-gray-600">
                      <GripVertical className="h-5 w-5" />
                    </div>

                    {/* Preview Thumbnail */}
                    <div 
                      className={`w-32 h-20 rounded-lg flex-shrink-0 flex items-center justify-center text-white text-xs font-medium ${slide.backgroundGradient}`}
                    >
                      Slide {index + 1}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="font-semibold text-gray-900 truncate">{slide.title}</h3>
                          <p className="text-sm text-gray-500 truncate">{slide.subtitle}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge className={getAudienceBadgeColor(slide.targetAudience)}>
                              {slide.targetAudience.toUpperCase()}
                            </Badge>
                            <Badge variant={slide.isActive ? 'default' : 'secondary'}>
                              {slide.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                            {slide.stats && slide.stats.length > 0 && (
                              <Badge variant="outline">{slide.stats.length} stats</Badge>
                            )}
                            {slide.testimonial && (
                              <Badge variant="outline">Has testimonial</Badge>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500">
                              {slide.isActive ? 'Active' : 'Inactive'}
                            </span>
                            <Switch
                              checked={slide.isActive}
                              onCheckedChange={() => handleToggleActive(slide)}
                            />
                          </div>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link href={`/admin/carousel/${slide.id}`}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDuplicate(slide)}>
                                <Copy className="h-4 w-4 mr-2" />
                                Duplicate
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => handleDeleteClick(slide)}
                                className="text-red-600 focus:text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Info Card */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-lg">Tips for Effective Carousel Slides</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-gray-600 space-y-2">
            <p>• <strong>Keep it focused:</strong> Each slide should target one specific audience with a clear value proposition.</p>
            <p>• <strong>Use social proof:</strong> Include testimonials and statistics to build trust.</p>
            <p>• <strong>Clear CTAs:</strong> Make sure each slide has a prominent call-to-action button.</p>
            <p>• <strong>Limit slides:</strong> 3-5 slides is optimal. Too many slides reduce engagement.</p>
            <p>• <strong>Test regularly:</strong> Preview your changes on the home page before publishing.</p>
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Slide</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &ldquo;{slideToDelete?.title}&rdquo;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// Export wrapped component with AuthProvider and UnifiedLayout
export default function CarouselAdminPage() {
  return (
    <AuthProvider>
      <UnifiedLayout>
        <CarouselAdminContent />
      </UnifiedLayout>
    </AuthProvider>
  );
}
