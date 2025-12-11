'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Grid,
  Button,
  Card,
  CardContent,
  IconButton,
  MenuItem,
  Alert,
  Divider,
  CircularProgress,
  Tooltip
} from '@mui/material';
import { Plus, Trash2, Sparkles, DollarSign, Calculator, FileText } from 'lucide-react';
import { useGrantGenerator } from '@/contexts/GrantGeneratorContext';

const BUDGET_CATEGORIES = [
  'Personnel',
  'Fringe Benefits',
  'Travel',
  'Equipment',
  'Supplies',
  'Contractual',
  'Construction',
  'Other Direct Costs',
  'Indirect Costs'
];

export function GeneratorStep6Budget() {
  const { proposalData, updateProposalData, generateSection } = useGrantGenerator();
  const [generating, setGenerating] = useState(false);
  const [generatingBudgetItems, setGeneratingBudgetItems] = useState(false);
  const [totalBudget, setTotalBudget] = useState(0);

  useEffect(() => {
    const total = (proposalData.budgetItems || []).reduce((sum, item) => sum + item.amount, 0);
    setTotalBudget(total);
    updateProposalData({ totalBudget: total });
  }, [proposalData.budgetItems]);

  const addBudgetItem = () => {
    const newItem = {
      id: `budget-${Date.now()}`,
      category: 'Personnel',
      item: '',
      amount: 0,
      justification: ''
    };
    updateProposalData({ budgetItems: [...(proposalData.budgetItems || []), newItem] });
  };

  const updateBudgetItem = (id: string, field: string, value: any) => {
    const updatedItems = (proposalData.budgetItems || []).map(item =>
      item.id === id ? { ...item, [field]: value } : item
    );
    updateProposalData({ budgetItems: updatedItems });
  };

  const removeBudgetItem = (id: string) => {
    const updatedItems = (proposalData.budgetItems || []).filter(item => item.id !== id);
    updateProposalData({ budgetItems: updatedItems });
  };

  const handleGenerateBudgetNarrative = async () => {
    try {
      setGenerating(true);
      const response = await fetch('/api/ai/generate-proposal-section', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          section: 'budget_narrative',
          proposalData
        })
      });
      const result = await response.json();
      if (result.success && result.content) {
        updateProposalData({ generatedBudgetJustification: result.content });
      }
    } catch (error) {
      console.error('Error generating budget narrative:', error);
    } finally {
      setGenerating(false);
    }
  };

  const handleGenerateBudgetItems = async () => {
    try {
      setGeneratingBudgetItems(true);
      const response = await fetch('/api/ai/generate-proposal-section', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          section: 'budget_items',
          proposalData
        })
      });
      const result = await response.json();
      if (result.success && result.budgetItems) {
        // Add the generated budget items
        const newItems = result.budgetItems.map((item: any, index: number) => ({
          id: `budget-${Date.now()}-${index}`,
          category: item.category || 'Other Direct Costs',
          item: item.item || item.description || '',
          amount: item.amount || 0,
          justification: item.justification || ''
        }));
        updateProposalData({
          budgetItems: [...(proposalData.budgetItems || []), ...newItems]
        });
      }
    } catch (error) {
      console.error('Error generating budget items:', error);
    } finally {
      setGeneratingBudgetItems(false);
    }
  };

  const getBudgetByCategory = () => {
    const byCategory: Record<string, number> = {};
    (proposalData.budgetItems || []).forEach(item => {
      byCategory[item.category] = (byCategory[item.category] || 0) + item.amount;
    });
    return byCategory;
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 1 }}>
        Budget & Resources
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Detail your budget and provide justification for each expense
      </Typography>

      {/* Budget Summary */}
      <Card sx={{ mb: 3, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <DollarSign />
              <Typography variant="h6">Total Budget</Typography>
            </Box>
            <Typography variant="h4" fontWeight={700}>
              ${totalBudget.toLocaleString()}
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Add Budget Item Buttons */}
      <Box sx={{ mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        <Tooltip title="AI will recommend budget line items with dollar amounts based on your project scope, activities, and target population">
          <Button
            variant="contained"
            color="primary"
            startIcon={generatingBudgetItems ? <CircularProgress size={16} color="inherit" /> : <Calculator size={16} />}
            onClick={handleGenerateBudgetItems}
            disabled={generatingBudgetItems || !proposalData.problemStatement}
          >
            {generatingBudgetItems ? 'Generating...' : 'AI Recommend Budget Items'}
          </Button>
        </Tooltip>
        <Button variant="outlined" startIcon={<Plus />} onClick={addBudgetItem}>
          Add Budget Item
        </Button>
      </Box>

      {/* AI Generation Info */}
      {generatingBudgetItems && (
        <Alert severity="info" sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CircularProgress size={16} />
            <Typography variant="body2">
              AI is generating recommended budget items with dollar amounts based on your project...
            </Typography>
          </Box>
        </Alert>
      )}

      {/* Budget Items */}
      {(proposalData.budgetItems || []).length === 0 ? (
        <Alert severity="warning" sx={{ mb: 3 }}>
          No budget items yet. Click "AI Recommend Budget Items" or "Add Budget Item" to start building your budget.
        </Alert>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
          {(proposalData.budgetItems || []).map((item) => (
            <Card key={item.id} variant="outlined">
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
                  <IconButton size="small" onClick={() => removeBudgetItem(item.id)} color="error">
                    <Trash2 size={18} />
                  </IconButton>
                </Box>

                <Grid container spacing={2}>
                  <Grid item xs={12} md={3}>
                    <TextField
                      fullWidth
                      select
                      label="Category"
                      value={item.category}
                      onChange={(e) => updateBudgetItem(item.id, 'category', e.target.value)}
                      required
                    >
                      {BUDGET_CATEGORIES.map((cat) => (
                        <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                      ))}
                    </TextField>
                  </Grid>

                  <Grid item xs={12} md={5}>
                    <TextField
                      fullWidth
                      label="Item Description"
                      value={item.item}
                      onChange={(e) => updateBudgetItem(item.id, 'item', e.target.value)}
                      required
                      placeholder="e.g., Project Director (0.5 FTE)"
                    />
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Amount"
                      value={item.amount}
                      onChange={(e) => updateBudgetItem(item.id, 'amount', parseFloat(e.target.value) || 0)}
                      required
                      InputProps={{
                        startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>
                      }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      multiline
                      rows={2}
                      label="Justification"
                      value={item.justification}
                      onChange={(e) => updateBudgetItem(item.id, 'justification', e.target.value)}
                      required
                      placeholder="Explain why this expense is necessary for the project..."
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      {/* Budget Summary by Category */}
      {(proposalData.budgetItems || []).length > 0 && (
        <>
          <Divider sx={{ my: 3 }} />
          <Typography variant="h6" gutterBottom>Budget Summary by Category</Typography>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            {Object.entries(getBudgetByCategory()).map(([category, amount]) => (
              <Grid item xs={12} sm={6} md={4} key={category}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="body2" color="text.secondary">{category}</Typography>
                    <Typography variant="h6">${amount.toLocaleString()}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </>
      )}

      {/* Budget Narrative */}
      <Divider sx={{ my: 3 }} />
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Budget Narrative</Typography>
          <Tooltip title="AI will generate a comprehensive budget narrative using your project context, budget items, and justifications">
            <Button
              variant="contained"
              color="success"
              startIcon={generating ? <CircularProgress size={16} color="inherit" /> : <FileText size={16} />}
              onClick={handleGenerateBudgetNarrative}
              disabled={generating || (proposalData.budgetItems || []).length === 0}
              size="small"
            >
              {generating ? 'Generating...' : 'AI Generate Narrative'}
            </Button>
          </Tooltip>
        </Box>

        {generating && (
          <Alert severity="info" sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CircularProgress size={16} />
              <Typography variant="body2">
                AI is generating a comprehensive budget narrative based on your project and budget items...
              </Typography>
            </Box>
          </Alert>
        )}

        <TextField
          fullWidth
          multiline
          rows={8}
          value={proposalData.generatedBudgetJustification || ''}
          onChange={(e) => updateProposalData({ generatedBudgetJustification: e.target.value })}
          placeholder="Provide an overall budget narrative explaining how the budget supports your project goals..."
          helperText="AI will use your project context, problem statement, activities, and budget items to generate a comprehensive narrative"
        />
      </Box>
    </Box>
  );
}
