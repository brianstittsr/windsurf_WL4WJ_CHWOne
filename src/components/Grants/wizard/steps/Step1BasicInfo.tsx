'use client';

import { useGrantWizard } from '@/contexts/GrantWizardContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

export function Step1BasicInfo() {
  const { grantData, updateGrantData } = useGrantWizard();
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Basic Information</h2>
        <p className="text-muted-foreground">Enter the basic details about the grant.</p>
      </div>
      
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="grantName">Grant Name *</Label>
            <Input
              id="grantName"
              placeholder="Enter grant name"
              value={grantData.name || ''}
              onChange={(e) => updateGrantData({ name: e.target.value })}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="fundingSource">Funding Source *</Label>
            <Input
              id="fundingSource"
              placeholder="E.g., Federal, State, Private Foundation"
              value={grantData.fundingSource || ''}
              onChange={(e) => updateGrantData({ fundingSource: e.target.value })}
              required
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <textarea
            id="description"
            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="Provide a brief description of the grant"
            value={grantData.description || ''}
            onChange={(e) => updateGrantData({ description: e.target.value })}
            rows={4}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Start Date *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !grantData.startDate && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {grantData.startDate ? (
                    format(new Date(grantData.startDate), 'PPP')
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={grantData.startDate ? new Date(grantData.startDate) : undefined}
                  onSelect={(date) =>
                    updateGrantData({ startDate: date?.toISOString().split('T')[0] })
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="space-y-2">
            <Label>End Date *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !grantData.endDate && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {grantData.endDate ? (
                    format(new Date(grantData.endDate), 'PPP')
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={grantData.endDate ? new Date(grantData.endDate) : undefined}
                  onSelect={(date) =>
                    updateGrantData({ endDate: date?.toISOString().split('T')[0] })
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>
    </div>
  );
}
