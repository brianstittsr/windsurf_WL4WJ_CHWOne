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
  Divider
} from '@mui/material';
import { Plus, Trash2, Sparkles, DollarSign } from 'lucide-react';
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
      const narrative = await generateSection('budget');
      updateProposalData({ generatedBudgetJustification: narrative });
    } catch (error) {
      console.error('Error generating budget narrative:', error);
    } finally {
      setGenerating(false);
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

      {/* Add Budget Item Button */}
      <Box sx={{ mb: 2 }}>
        <Button variant="outlined" startIcon={<Plus />} onClick={addBudgetItem}>
          Add Budget Item
        </Button>
      </Box>

      {/* Budget Items */}
      {(proposalData.budgetItems || []).length === 0 ? (
        <Alert severity="warning" sx={{ mb: 3 }}>
          No budget items yet. Click "Add Budget Item" to start building your budget.
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
          <Button
            variant="outlined"
            startIcon={<Sparkles />}
            onClick={handleGenerateBudgetNarrative}
            disabled={generating || (proposalData.budgetItems || []).length === 0}
            size="small"
          >
            {generating ? 'Generating...' : 'AI Generate Narrative'}
          </Button>
        </Box>

        <TextField
          fullWidth
          multiline
          rows={6}
          value={proposalData.generatedBudgetJustification || ''}
          onChange={(e) => updateProposalData({ generatedBudgetJustification: e.target.value })}
          placeholder="Provide an overall budget narrative explaining how the budget supports your project goals..."
          helperText="AI can generate this based on your budget items, or you can write it yourself"
        />
      </Box>
    </Box>
  );
}
