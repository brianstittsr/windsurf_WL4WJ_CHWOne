'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Paper,
  Radio,
  RadioGroup,
  FormControlLabel,
  Divider,
  TextField,
  Grid,
  Checkbox,
  FormControl,
  FormLabel
} from '@mui/material';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { mockPaymentService, PaymentMethod, PAYMENT_METHODS } from '@/services/payment/PaymentService';
import Image from 'next/image';

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_mock');

interface PaymentFormProps {
  courseId: string;
  amount: number;
  onSuccess: (paymentId: string) => void;
  onCancel: () => void;
}

export default function PaymentForm({ courseId, amount, onSuccess, onCancel }: PaymentFormProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializePayment = async () => {
      try {
        // In a real implementation, we would call the API to create a payment intent
        // For now, we'll use the mock service
        const paymentIntent = await mockPaymentService.createPaymentIntent(
          amount * 100, // Convert to cents
          'usd',
          { courseId }
        );
        
        setClientSecret(paymentIntent.clientSecret);
      } catch (err) {
        console.error('Error initializing payment:', err);
        setError(`Failed to initialize payment: ${err instanceof Error ? err.message : 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    };
    
    initializePayment();
  }, [amount, courseId]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant="outlined" onClick={onCancel}>
          Go Back
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" sx={{ mb: 3 }}>
        Payment Details
      </Typography>
      
      {clientSecret && (
        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <CheckoutForm 
            amount={amount} 
            courseId={courseId} 
            onSuccess={onSuccess} 
            onCancel={onCancel} 
          />
        </Elements>
      )}
    </Box>
  );
}

interface CheckoutFormProps {
  courseId: string;
  amount: number;
  onSuccess: (paymentId: string) => void;
  onCancel: () => void;
}

function CheckoutForm({ courseId, amount, onSuccess, onCancel }: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [paymentMethod, setPaymentMethod] = useState<string>('card');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [savePaymentMethod, setSavePaymentMethod] = useState(false);
  const [billingDetails, setBillingDetails] = useState({
    address: '',
    city: '',
    state: '',
    zip: '',
    country: 'US'
  });

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }
    
    setProcessing(true);
    setError(null);
    
    try {
      // For demonstration purposes, we'll use the mock service
      // In a real implementation, we would use Stripe's confirmPayment
      
      // Simulate Stripe payment confirmation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Process the payment with our mock service
      const payment = await mockPaymentService.processPayment(
        paymentMethod,
        'pi_mock_id'
      );
      
      onSuccess(payment.id);
    } catch (err) {
      console.error('Payment error:', err);
      setError(`Payment failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Typography variant="h6" sx={{ mb: 2 }}>
        Select Payment Method
      </Typography>
      
      <Paper variant="outlined" sx={{ mb: 3, p: 2 }}>
        <RadioGroup
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
        >
          {PAYMENT_METHODS.map((method) => (
            <React.Fragment key={method.id}>
              <FormControlLabel
                value={method.id}
                control={<Radio />}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box sx={{ width: 32, height: 32, mr: 1, position: 'relative' }}>
                      <Image
                        src={method.icon}
                        alt={method.name}
                        fill
                        style={{ objectFit: 'contain' }}
                      />
                    </Box>
                    <Box>
                      <Typography variant="body1">{method.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {method.description}
                      </Typography>
                    </Box>
                  </Box>
                }
              />
              {method.id !== PAYMENT_METHODS[PAYMENT_METHODS.length - 1].id && (
                <Divider sx={{ my: 1 }} />
              )}
            </React.Fragment>
          ))}
        </RadioGroup>
      </Paper>
      
      <Typography variant="h6" sx={{ mb: 2 }}>
        Billing Information
      </Typography>
      
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12}>
          <TextField
            label="Email"
            type="email"
            fullWidth
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label="Full Name"
            fullWidth
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label="Address"
            fullWidth
            required
            value={billingDetails.address}
            onChange={(e) => setBillingDetails({ ...billingDetails, address: e.target.value })}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            label="City"
            fullWidth
            required
            value={billingDetails.city}
            onChange={(e) => setBillingDetails({ ...billingDetails, city: e.target.value })}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            label="State"
            fullWidth
            required
            value={billingDetails.state}
            onChange={(e) => setBillingDetails({ ...billingDetails, state: e.target.value })}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            label="ZIP Code"
            fullWidth
            required
            value={billingDetails.zip}
            onChange={(e) => setBillingDetails({ ...billingDetails, zip: e.target.value })}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            label="Country"
            fullWidth
            required
            value={billingDetails.country}
            onChange={(e) => setBillingDetails({ ...billingDetails, country: e.target.value })}
          />
        </Grid>
      </Grid>
      
      {paymentMethod === 'card' && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Card Details
          </Typography>
          
          <Paper variant="outlined" sx={{ p: 2 }}>
            {/* In a real implementation, this would be the Stripe PaymentElement */}
            <Box sx={{ height: 150, border: '1px dashed #ccc', borderRadius: 1, p: 2, mb: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                This is a mock payment form. In a real implementation, this would be the Stripe PaymentElement.
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    label="Card Number"
                    fullWidth
                    placeholder="4242 4242 4242 4242"
                    disabled={processing}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="Expiry Date"
                    fullWidth
                    placeholder="MM/YY"
                    disabled={processing}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="CVC"
                    fullWidth
                    placeholder="123"
                    disabled={processing}
                  />
                </Grid>
              </Grid>
            </Box>
            
            <FormControlLabel
              control={
                <Checkbox
                  checked={savePaymentMethod}
                  onChange={(e) => setSavePaymentMethod(e.target.checked)}
                  disabled={processing}
                />
              }
              label="Save this card for future payments"
            />
          </Paper>
        </Box>
      )}
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 4 }}>
        <Button
          variant="outlined"
          onClick={onCancel}
          disabled={processing}
        >
          Cancel
        </Button>
        
        <Box sx={{ textAlign: 'right' }}>
          <Typography variant="h6" sx={{ mb: 1 }}>
            Total: ${amount.toFixed(2)}
          </Typography>
          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={!stripe || processing}
          >
            {processing ? 'Processing...' : 'Pay Now'}
          </Button>
        </Box>
      </Box>
    </form>
  );
}
