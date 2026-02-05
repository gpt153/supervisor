import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FileTypeBadge } from '../FileTypeBadge';

// Mock the lucide-react icons
vi.mock('lucide-react', () => ({
  FileText: ({ className }: { className?: string }) => <div data-testid="icon-filetext" className={className} />,
  Music: ({ className }: { className?: string }) => <div data-testid="icon-music" className={className} />,
  Mail: ({ className }: { className?: string }) => <div data-testid="icon-mail" className={className} />,
  Image: ({ className }: { className?: string }) => <div data-testid="icon-image" className={className} />,
  File: ({ className }: { className?: string }) => <div data-testid="icon-file" className={className} />,
}));

// Mock the Badge component
vi.mock('@/components/ui/badge', () => ({
  Badge: ({ children, className, variant }: any) => (
    <div data-testid="badge" className={className} data-variant={variant}>
      {children}
    </div>
  ),
}));

// Mock cn utility
vi.mock('@/lib/utils', () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(' '),
}));

describe('FileTypeBadge', () => {
  describe('PDF files', () => {
    it('renders PDF label', () => {
      render(<FileTypeBadge mimeType="application/pdf" />);
      expect(screen.getByText('PDF')).toBeInTheDocument();
    });

    it('renders with FileText icon', () => {
      render(<FileTypeBadge mimeType="application/pdf" />);
      expect(screen.getByTestId('icon-filetext')).toBeInTheDocument();
    });

    it('applies red styling for PDF', () => {
      const { container } = render(<FileTypeBadge mimeType="application/pdf" />);
      const badge = screen.getByTestId('badge');
      expect(badge.className).toContain('bg-red-100');
      expect(badge.className).toContain('text-red-700');
      expect(badge.className).toContain('border-red-200');
    });
  });

  describe('Word documents', () => {
    it('renders DOC label for Word MIME type', () => {
      render(
        <FileTypeBadge mimeType="application/vnd.openxmlformats-officedocument.wordprocessingml.document" />
      );
      expect(screen.getByText('DOC')).toBeInTheDocument();
    });

    it('renders DOC label for old Word format', () => {
      render(<FileTypeBadge mimeType="application/msword" />);
      expect(screen.getByText('DOC')).toBeInTheDocument();
    });

    it('renders with FileText icon for Word', () => {
      render(
        <FileTypeBadge mimeType="application/vnd.openxmlformats-officedocument.wordprocessingml.document" />
      );
      expect(screen.getByTestId('icon-filetext')).toBeInTheDocument();
    });

    it('applies blue styling for Word', () => {
      const { container } = render(
        <FileTypeBadge mimeType="application/vnd.openxmlformats-officedocument.wordprocessingml.document" />
      );
      const badge = screen.getByTestId('badge');
      expect(badge.className).toContain('bg-blue-100');
      expect(badge.className).toContain('text-blue-700');
      expect(badge.className).toContain('border-blue-200');
    });
  });

  describe('Image files', () => {
    it('renders Bild label for PNG', () => {
      render(<FileTypeBadge mimeType="image/png" />);
      expect(screen.getByText('Bild')).toBeInTheDocument();
    });

    it('renders Bild label for JPEG', () => {
      render(<FileTypeBadge mimeType="image/jpeg" />);
      expect(screen.getByText('Bild')).toBeInTheDocument();
    });

    it('renders Bild label for WebP', () => {
      render(<FileTypeBadge mimeType="image/webp" />);
      expect(screen.getByText('Bild')).toBeInTheDocument();
    });

    it('renders with Image icon', () => {
      render(<FileTypeBadge mimeType="image/png" />);
      expect(screen.getByTestId('icon-image')).toBeInTheDocument();
    });

    it('applies green styling for images', () => {
      const { container } = render(<FileTypeBadge mimeType="image/png" />);
      const badge = screen.getByTestId('badge');
      expect(badge.className).toContain('bg-green-100');
      expect(badge.className).toContain('text-green-700');
      expect(badge.className).toContain('border-green-200');
    });
  });

  describe('Audio files', () => {
    it('renders Ljud label for MP3', () => {
      render(<FileTypeBadge mimeType="audio/mpeg" />);
      expect(screen.getByText('Ljud')).toBeInTheDocument();
    });

    it('renders Ljud label for WAV', () => {
      render(<FileTypeBadge mimeType="audio/wav" />);
      expect(screen.getByText('Ljud')).toBeInTheDocument();
    });

    it('renders Ljud label for M4A', () => {
      render(<FileTypeBadge mimeType="audio/mp4" />);
      expect(screen.getByText('Ljud')).toBeInTheDocument();
    });

    it('renders Ljud label for WebM audio', () => {
      render(<FileTypeBadge mimeType="audio/webm" />);
      expect(screen.getByText('Ljud')).toBeInTheDocument();
    });

    it('renders Ljud label for video/mp4', () => {
      render(<FileTypeBadge mimeType="video/mp4" />);
      expect(screen.getByText('Ljud')).toBeInTheDocument();
    });

    it('renders with Music icon', () => {
      render(<FileTypeBadge mimeType="audio/mpeg" />);
      expect(screen.getByTestId('icon-music')).toBeInTheDocument();
    });

    it('applies purple styling for audio', () => {
      const { container } = render(<FileTypeBadge mimeType="audio/mpeg" />);
      const badge = screen.getByTestId('badge');
      expect(badge.className).toContain('bg-purple-100');
      expect(badge.className).toContain('text-purple-700');
      expect(badge.className).toContain('border-purple-200');
    });
  });

  describe('Email files', () => {
    it('renders E-post label for EML', () => {
      render(<FileTypeBadge mimeType="message/rfc822" />);
      expect(screen.getByText('E-post')).toBeInTheDocument();
    });

    it('renders E-post label for MBOX', () => {
      render(<FileTypeBadge mimeType="application/mbox" />);
      expect(screen.getByText('E-post')).toBeInTheDocument();
    });

    it('renders E-post label for Outlook PST', () => {
      render(<FileTypeBadge mimeType="application/vnd.ms-outlook" />);
      expect(screen.getByText('E-post')).toBeInTheDocument();
    });

    it('renders with Mail icon', () => {
      render(<FileTypeBadge mimeType="message/rfc822" />);
      expect(screen.getByTestId('icon-mail')).toBeInTheDocument();
    });

    it('applies orange styling for email', () => {
      const { container } = render(<FileTypeBadge mimeType="message/rfc822" />);
      const badge = screen.getByTestId('badge');
      expect(badge.className).toContain('bg-orange-100');
      expect(badge.className).toContain('text-orange-700');
      expect(badge.className).toContain('border-orange-200');
    });
  });

  describe('Unsupported files', () => {
    it('renders Fil label for unknown MIME type', () => {
      render(<FileTypeBadge mimeType="application/xyz" />);
      expect(screen.getByText('Fil')).toBeInTheDocument();
    });

    it('renders with generic File icon', () => {
      render(<FileTypeBadge mimeType="application/xyz" />);
      expect(screen.getByTestId('icon-file')).toBeInTheDocument();
    });

    it('applies gray styling for unknown types', () => {
      const { container } = render(<FileTypeBadge mimeType="application/xyz" />);
      const badge = screen.getByTestId('badge');
      expect(badge.className).toContain('bg-gray-100');
      expect(badge.className).toContain('text-gray-700');
      expect(badge.className).toContain('border-gray-200');
    });
  });

  describe('Styling and appearance', () => {
    it('applies outline variant', () => {
      render(<FileTypeBadge mimeType="application/pdf" />);
      const badge = screen.getByTestId('badge');
      expect(badge.getAttribute('data-variant')).toBe('outline');
    });

    it('applies custom className', () => {
      render(<FileTypeBadge mimeType="application/pdf" className="custom-class" />);
      const badge = screen.getByTestId('badge');
      expect(badge.className).toContain('custom-class');
    });

    it('includes gap and font-medium classes', () => {
      render(<FileTypeBadge mimeType="application/pdf" />);
      const badge = screen.getByTestId('badge');
      expect(badge.className).toContain('gap-1');
      expect(badge.className).toContain('font-medium');
    });

    it('renders icon with correct size classes', () => {
      render(<FileTypeBadge mimeType="application/pdf" />);
      const icon = screen.getByTestId('icon-filetext');
      expect(icon.className).toContain('h-3');
      expect(icon.className).toContain('w-3');
    });
  });

  describe('Case insensitivity and edge cases', () => {
    it('handles lowercase MIME types', () => {
      render(<FileTypeBadge mimeType="application/pdf" />);
      expect(screen.getByText('PDF')).toBeInTheDocument();
    });

    it('treats uppercase MIME types as unsupported (fallback to other)', () => {
      // The component doesn't normalize MIME types, so uppercase doesn't match
      render(<FileTypeBadge mimeType="APPLICATION/PDF" />);
      expect(screen.getByText('Fil')).toBeInTheDocument(); // Falls back to 'other' type
    });

    it('treats mixed case MIME types by includes() matching (audio matches)', () => {
      // This works because of .includes() which is case-sensitive
      // 'Audio/Mpeg'.includes('audio/') is false, so it falls back
      render(<FileTypeBadge mimeType="Audio/Mpeg" />);
      expect(screen.getByText('Fil')).toBeInTheDocument(); // Falls back to 'other' type
    });

    it('handles empty string MIME type', () => {
      render(<FileTypeBadge mimeType="" />);
      expect(screen.getByText('Fil')).toBeInTheDocument();
    });
  });

  describe('Rendering', () => {
    it('renders without crashing', () => {
      const { container } = render(<FileTypeBadge mimeType="application/pdf" />);
      expect(container).toBeInTheDocument();
    });

    it('renders as JSX.Element', () => {
      const { container } = render(<FileTypeBadge mimeType="application/pdf" />);
      expect(container.firstChild).toBeTruthy();
    });

    it('does not render aria-labels by default', () => {
      const { container } = render(<FileTypeBadge mimeType="application/pdf" />);
      expect(container.querySelector('[aria-label]')).toBeNull();
    });
  });
});
