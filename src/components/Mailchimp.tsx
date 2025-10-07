"use client";

import { mailchimp, newsletter } from "@/resources";
import { TextField, Button, Container, Grid, Box, Typography } from "@mui/material";
import { useState } from "react";

function debounce<T extends (...args: any[]) => void>(func: T, delay: number): T {
  let timeout: ReturnType<typeof setTimeout>;
  return ((...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), delay);
  }) as T;
}

interface MailchimpProps {
  className?: string;
}

export const Mailchimp: React.FC<MailchimpProps> = ({ className }) => {
  const [email, setEmail] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [touched, setTouched] = useState<boolean>(false);

  const validateEmail = (email: string): boolean => {
    if (email === "") {
      return true;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);

    if (!validateEmail(value)) {
      setError("Please enter a valid email address.");
    } else {
      setError("");
    }
  };

  const debouncedHandleChange = debounce(handleChange, 2000);

  const handleBlur = () => {
    setTouched(true);
    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
    }
  };

  if (newsletter.display === false) return null;

  return (
    <Container 
      maxWidth="lg"
      sx={{
        py: 5,
        px: 4,
        borderRadius: 4,
        mb: 4,
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
        bgcolor: 'background.paper',
        border: '1px solid rgba(0,0,0,0.1)'
      }}
    >
      {/* Background Effects */}
      <Box sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: mailchimp.effects.gradient.display ? 
          `linear-gradient(${mailchimp.effects.gradient.tilt}deg, 
          ${mailchimp.effects.gradient.colorStart}, 
          ${mailchimp.effects.gradient.colorEnd})` : 'transparent',
        opacity: mailchimp.effects.gradient.opacity,
        zIndex: 0
      }} />
      
      <Box sx={{ position: 'relative', zIndex: 1 }}>
        <Grid container justifyContent="center">
          <Grid item xs={12} md={8} lg={6}>
            <Typography variant="h4" component="h2" sx={{ mb: 3 }}>{newsletter.title}</Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>{newsletter.description}</Typography>
            
            <form
              action={mailchimp.action}
              method="post"
              id="mc-embedded-subscribe-form"
              name="mc-embedded-subscribe-form"
            >
              <Grid container justifyContent="center" spacing={2}>
                <Grid item xs={12} md={8}>
                  <TextField
                    fullWidth
                    id="mce-EMAIL"
                    name="EMAIL"
                    type="email"
                    placeholder="Email"
                    required
                    onChange={(e) => {
                      if (error) {
                        handleChange(e as React.ChangeEvent<HTMLInputElement>);
                      } else {
                        debouncedHandleChange(e as React.ChangeEvent<HTMLInputElement>);
                      }
                    }}
                    onBlur={handleBlur}
                    error={!!error && touched}
                    helperText={error && touched ? error : ''}
                    variant="outlined"
                  />
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Button 
                    id="mc-embedded-subscribe" 
                    value="Subscribe" 
                    type="submit"
                    variant="contained"
                    fullWidth
                    sx={{ height: '56px' }}
                  >
                    Subscribe
                  </Button>
                </Grid>
              </Grid>
              
              {/* Hidden fields for Mailchimp */}
              <div style={{ display: "none" }}>
                <input
                  type="checkbox"
                  readOnly
                  name="group[3492][1]"
                  id="mce-group[3492]-3492-0"
                  value=""
                  checked
                />
              </div>
              <div id="mce-responses" className="clearfalse">
                <div className="response" id="mce-error-response" style={{ display: "none" }}></div>
                <div className="response" id="mce-success-response" style={{ display: "none" }}></div>
              </div>
              <div aria-hidden="true" style={{ position: "absolute", left: "-5000px" }}>
                <input
                  type="text"
                  readOnly
                  name="b_c1a5a210340eb6c7bff33b2ba_0462d244aa"
                  tabIndex={-1}
                  value=""
                />
              </div>
            </form>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};
