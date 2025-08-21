import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider, useTheme } from '../ThemeProvider';
import { HeaderThemeToggle } from '../HeaderThemeToggle';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Test component to use the theme hook
function TestComponent() {
  const { theme, setTheme, toggleTheme, isDark } = useTheme();
  return (
    <div>
      <span data-testid="theme">{theme}</span>
      <span data-testid="is-dark">{isDark.toString()}</span>
      <button onClick={() => setTheme('light')} data-testid="set-light">
        Set Light
      </button>
      <button onClick={() => setTheme('dark')} data-testid="set-dark">
        Set Dark
      </button>
      <button onClick={toggleTheme} data-testid="toggle">
        Toggle
      </button>
    </div>
  );
}

describe('ThemeProvider', () => {
  beforeEach(() => {
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    document.documentElement.removeAttribute('data-theme');
  });

  it('should render children', () => {
    render(
      <ThemeProvider>
        <div data-testid="child">Test Child</div>
      </ThemeProvider>
    );
    
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('should initialize with light theme by default', async () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('theme')).toHaveTextContent('light');
      expect(screen.getByTestId('is-dark')).toHaveTextContent('false');
    });
  });

  it('should initialize with stored theme from localStorage', async () => {
    localStorageMock.getItem.mockReturnValue('dark');
    
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('theme')).toHaveTextContent('dark');
      expect(screen.getByTestId('is-dark')).toHaveTextContent('true');
    });
  });

  it('should set theme and update localStorage', async () => {
    localStorageMock.getItem.mockReturnValue('light');
    
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    fireEvent.click(screen.getByTestId('set-dark'));

    await waitFor(() => {
      expect(screen.getByTestId('theme')).toHaveTextContent('dark');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('ai-recruiter-theme', 'dark');
    });
  });

  it('should toggle theme', async () => {
    localStorageMock.getItem.mockReturnValue('light');
    
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    fireEvent.click(screen.getByTestId('toggle'));

    await waitFor(() => {
      expect(screen.getByTestId('theme')).toHaveTextContent('dark');
    });

    fireEvent.click(screen.getByTestId('toggle'));

    await waitFor(() => {
      expect(screen.getByTestId('theme')).toHaveTextContent('light');
    });
  });

  it('should apply theme to document element', async () => {
    localStorageMock.getItem.mockReturnValue('dark');
    
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });
  });

  it('should throw error when useTheme is used outside provider', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    expect(() => render(<TestComponent />)).toThrow('useTheme must be used within a ThemeProvider');
    
    consoleSpy.mockRestore();
  });
});

describe('HeaderThemeToggle', () => {
  beforeEach(() => {
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    document.documentElement.removeAttribute('data-theme');
  });

  it('should render with light theme icon', async () => {
    localStorageMock.getItem.mockReturnValue('light');
    
    render(
      <ThemeProvider>
        <HeaderThemeToggle />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(screen.getByRole('button')).toHaveTextContent('🌙');
    });
  });

  it('should render with dark theme icon', async () => {
    localStorageMock.getItem.mockReturnValue('dark');
    
    render(
      <ThemeProvider>
        <HeaderThemeToggle />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(screen.getByRole('button')).toHaveTextContent('☀️');
    });
  });

  it('should have correct aria attributes', async () => {
    localStorageMock.getItem.mockReturnValue('light');
    
    render(
      <ThemeProvider>
        <HeaderThemeToggle />
      </ThemeProvider>
    );

    const button = screen.getByRole('button');
    
    await waitFor(() => {
      expect(button).toHaveAttribute('aria-pressed', 'false');
      expect(button).toHaveAttribute('aria-label', 'Switch to dark mode');
    });
  });

  it('should toggle theme when clicked', async () => {
    localStorageMock.getItem.mockReturnValue('light');
    
    render(
      <ThemeProvider>
        <HeaderThemeToggle />
      </ThemeProvider>
    );

    const button = screen.getByRole('button');
    
    await waitFor(() => {
      expect(button).toHaveTextContent('🌙');
    });

    fireEvent.click(button);

    await waitFor(() => {
      expect(button).toHaveTextContent('☀️');
      expect(button).toHaveAttribute('aria-pressed', 'true');
      expect(button).toHaveAttribute('aria-label', 'Switch to light mode');
    });
  });

  it('should show label when showLabel is true', async () => {
    localStorageMock.getItem.mockReturnValue('light');
    
    render(
      <ThemeProvider>
        <HeaderThemeToggle showLabel />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Dark')).toBeInTheDocument();
    });
  });

  it('should apply custom className', async () => {
    localStorageMock.getItem.mockReturnValue('light');
    
    render(
      <ThemeProvider>
        <HeaderThemeToggle className="custom-class" />
      </ThemeProvider>
    );

    const button = screen.getByRole('button');
    
    await waitFor(() => {
      expect(button).toHaveClass('custom-class');
    });
  });

  it('should have different sizes', async () => {
    localStorageMock.getItem.mockReturnValue('light');
    
    const { rerender } = render(
      <ThemeProvider>
        <HeaderThemeToggle size="sm" />
      </ThemeProvider>
    );

    let button = screen.getByRole('button');
    
    await waitFor(() => {
      expect(button).toHaveClass('w-8', 'h-8');
    });

    rerender(
      <ThemeProvider>
        <HeaderThemeToggle size="lg" />
      </ThemeProvider>
    );

    button = screen.getByRole('button');
    
    await waitFor(() => {
      expect(button).toHaveClass('w-12', 'h-12');
    });
  });
});

describe('ThemeProvider with custom storage key', () => {
  it('should use custom storage key', async () => {
    localStorageMock.getItem.mockReturnValue('dark');
    
    render(
      <ThemeProvider storageKey="custom-theme-key">
        <TestComponent />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(localStorageMock.getItem).toHaveBeenCalledWith('custom-theme-key');
    });
  });
});
