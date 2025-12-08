import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Step4ParticipantUpload from '@/components/QRTracking/steps/Step4ParticipantUpload';
import { QRWizardProvider } from '@/contexts/QRWizardContext';
import { AuthProvider } from '@/contexts/AuthContext';

// Mock dependencies
jest.mock('@/lib/firebase', () => ({
  db: {},
  auth: {}
}));

jest.mock('@/contexts/AuthContext', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useAuth: () => ({
    currentUser: { uid: 'test-user-123' },
    loading: false
  })
}));

// Mock PapaParse
jest.mock('papaparse', () => ({
  parse: jest.fn((file, options) => {
    const mockData = {
      data: [
        { Name: 'John Doe', Email: 'john@example.com', Phone: '555-0100' },
        { Name: 'Jane Smith', Email: 'jane@example.com', Phone: '555-0101' }
      ],
      errors: [],
      meta: {
        fields: ['Name', 'Email', 'Phone']
      }
    };
    options.complete(mockData);
  })
}));

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <AuthProvider>
      <QRWizardProvider>{component}</QRWizardProvider>
    </AuthProvider>
  );
};

describe('Step4ParticipantUpload', () => {
  describe('Initial Render', () => {
    it('should render upload section', () => {
      renderWithProviders(<Step4ParticipantUpload />);
      
      expect(screen.getByText(/Upload Participant Data/i)).toBeInTheDocument();
      expect(screen.getByText(/Download Template/i)).toBeInTheDocument();
    });

    it('should show file upload button', () => {
      renderWithProviders(<Step4ParticipantUpload />);
      
      expect(screen.getByText(/Upload CSV/i)).toBeInTheDocument();
    });
  });

  describe('Template Download', () => {
    it('should download template when button clicked', () => {
      renderWithProviders(<Step4ParticipantUpload />);
      
      // Mock URL.createObjectURL
      global.URL.createObjectURL = jest.fn(() => 'mock-url');
      
      const downloadButton = screen.getByText(/Download Template/i);
      fireEvent.click(downloadButton);
      
      expect(global.URL.createObjectURL).toHaveBeenCalled();
    });
  });

  describe('CSV Upload', () => {
    it('should handle file upload', async () => {
      renderWithProviders(<Step4ParticipantUpload />);
      
      const file = new File(
        ['Name,Email,Phone\nJohn Doe,john@example.com,555-0100'],
        'participants.csv',
        { type: 'text/csv' }
      );
      
      const input = screen.getByLabelText(/upload csv/i) as HTMLInputElement;
      
      await waitFor(() => {
        fireEvent.change(input, { target: { files: [file] } });
      });
      
      await waitFor(() => {
        expect(screen.getByText(/participants.csv/i)).toBeInTheDocument();
      });
    });

    it('should parse CSV data', async () => {
      renderWithProviders(<Step4ParticipantUpload />);
      
      const file = new File(
        ['Name,Email,Phone\nJohn Doe,john@example.com,555-0100'],
        'participants.csv',
        { type: 'text/csv' }
      );
      
      const input = screen.getByLabelText(/upload csv/i) as HTMLInputElement;
      
      await waitFor(() => {
        fireEvent.change(input, { target: { files: [file] } });
      });
      
      await waitFor(() => {
        expect(screen.getByText(/2 participants/i)).toBeInTheDocument();
      });
    });
  });

  describe('Field Mapping', () => {
    it('should show field mapping after upload', async () => {
      renderWithProviders(<Step4ParticipantUpload />);
      
      const file = new File(
        ['Name,Email,Phone\nJohn Doe,john@example.com,555-0100'],
        'participants.csv',
        { type: 'text/csv' }
      );
      
      const input = screen.getByLabelText(/upload csv/i) as HTMLInputElement;
      
      await waitFor(() => {
        fireEvent.change(input, { target: { files: [file] } });
      });
      
      await waitFor(() => {
        expect(screen.getByText(/Field Mapping/i)).toBeInTheDocument();
      });
    });

    it('should allow mapping CSV columns to fields', async () => {
      renderWithProviders(<Step4ParticipantUpload />);
      
      const file = new File(
        ['Name,Email,Phone\nJohn Doe,john@example.com,555-0100'],
        'participants.csv',
        { type: 'text/csv' }
      );
      
      const input = screen.getByLabelText(/upload csv/i) as HTMLInputElement;
      
      await waitFor(() => {
        fireEvent.change(input, { target: { files: [file] } });
      });
      
      await waitFor(() => {
        const mappingSelects = screen.getAllByRole('combobox');
        expect(mappingSelects.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Data Preview', () => {
    it('should show data preview table', async () => {
      renderWithProviders(<Step4ParticipantUpload />);
      
      const file = new File(
        ['Name,Email,Phone\nJohn Doe,john@example.com,555-0100\nJane Smith,jane@example.com,555-0101'],
        'participants.csv',
        { type: 'text/csv' }
      );
      
      const input = screen.getByLabelText(/upload csv/i) as HTMLInputElement;
      
      await waitFor(() => {
        fireEvent.change(input, { target: { files: [file] } });
      });
      
      await waitFor(() => {
        expect(screen.getByText(/Data Preview/i)).toBeInTheDocument();
        expect(screen.getByText(/John Doe/i)).toBeInTheDocument();
        expect(screen.getByText(/Jane Smith/i)).toBeInTheDocument();
      });
    });

    it('should limit preview to first 10 rows', async () => {
      const rows = Array.from({ length: 15 }, (_, i) => 
        `Person ${i + 1},person${i + 1}@example.com,555-${String(i).padStart(4, '0')}`
      );
      
      const csvContent = 'Name,Email,Phone\n' + rows.join('\n');
      
      renderWithProviders(<Step4ParticipantUpload />);
      
      const file = new File([csvContent], 'participants.csv', { type: 'text/csv' });
      const input = screen.getByLabelText(/upload csv/i) as HTMLInputElement;
      
      await waitFor(() => {
        fireEvent.change(input, { target: { files: [file] } });
      });
      
      await waitFor(() => {
        expect(screen.getByText(/Showing first 10/i)).toBeInTheDocument();
      });
    });
  });

  describe('Validation', () => {
    it('should show validation summary', async () => {
      renderWithProviders(<Step4ParticipantUpload />);
      
      const file = new File(
        ['Name,Email,Phone\nJohn Doe,john@example.com,555-0100'],
        'participants.csv',
        { type: 'text/csv' }
      );
      
      const input = screen.getByLabelText(/upload csv/i) as HTMLInputElement;
      
      await waitFor(() => {
        fireEvent.change(input, { target: { files: [file] } });
      });
      
      await waitFor(() => {
        expect(screen.getByText(/Validation Summary/i)).toBeInTheDocument();
      });
    });

    it('should validate required fields', async () => {
      renderWithProviders(<Step4ParticipantUpload />);
      
      const file = new File(
        ['Name,Email\nJohn Doe,john@example.com'],
        'participants.csv',
        { type: 'text/csv' }
      );
      
      const input = screen.getByLabelText(/upload csv/i) as HTMLInputElement;
      
      await waitFor(() => {
        fireEvent.change(input, { target: { files: [file] } });
      });
      
      await waitFor(() => {
        expect(screen.getByText(/Total Participants/i)).toBeInTheDocument();
      });
    });
  });

  describe('AI Analysis', () => {
    it('should show AI analysis button', () => {
      renderWithProviders(<Step4ParticipantUpload />);
      
      expect(screen.getByText(/Get AI Data Validation/i)).toBeInTheDocument();
    });

    it('should trigger AI analysis on button click', async () => {
      global.fetch = jest.fn(() =>
        Promise.resolve({
          json: () => Promise.resolve({
            success: true,
            analysis: 'Data looks good!'
          })
        })
      ) as jest.Mock;

      renderWithProviders(<Step4ParticipantUpload />);
      
      const aiButton = screen.getByText(/Get AI Data Validation/i);
      fireEvent.click(aiButton);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/ai/analyze-qr-wizard',
          expect.objectContaining({
            method: 'POST'
          })
        );
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid file type', async () => {
      renderWithProviders(<Step4ParticipantUpload />);
      
      const file = new File(['invalid content'], 'test.txt', { type: 'text/plain' });
      const input = screen.getByLabelText(/upload csv/i) as HTMLInputElement;
      
      await waitFor(() => {
        fireEvent.change(input, { target: { files: [file] } });
      });
      
      // Should show error or not process
      await waitFor(() => {
        expect(screen.queryByText(/Data Preview/i)).not.toBeInTheDocument();
      });
    });

    it('should handle empty CSV', async () => {
      renderWithProviders(<Step4ParticipantUpload />);
      
      const file = new File([''], 'empty.csv', { type: 'text/csv' });
      const input = screen.getByLabelText(/upload csv/i) as HTMLInputElement;
      
      await waitFor(() => {
        fireEvent.change(input, { target: { files: [file] } });
      });
      
      // Should handle gracefully
      await waitFor(() => {
        expect(screen.getByText(/Upload CSV/i)).toBeInTheDocument();
      });
    });
  });
});
