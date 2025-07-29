export const theme = {
  colors: {
    // Dark theme base
    bg: {
      primary: '#0A0A0B',
      secondary: '#111113', 
      tertiary: '#1A1A1D',
      accent: '#212125',
      glass: 'rgba(255, 255, 255, 0.03)',
      glassHover: 'rgba(255, 255, 255, 0.06)',
    },
    
    // Text colors
    text: {
      primary: '#FFFFFF',
      secondary: '#B4B4B7',
      tertiary: '#808084',
      muted: '#565659',
    },
    
    // Brand colors
    brand: {
      primary: '#6366F1',
      secondary: '#8B5CF6',
      accent: '#06B6D4',
    },
    
    // Status colors
    status: {
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      info: '#3B82F6',
    },
    
    // Role colors
    roles: {
      founder: '#F59E0B',
      admin: '#3B82F6', 
      member: '#6B7280',
    },
    
    // Borders
    border: {
      primary: 'rgba(255, 255, 255, 0.08)',
      secondary: 'rgba(255, 255, 255, 0.05)',
      accent: 'rgba(255, 255, 255, 0.12)',
    }
  },
  
  // Professional spacing
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem', 
    md: '0.75rem',
    lg: '1rem',
    xl: '1.5rem',
    '2xl': '2rem',
    '3xl': '3rem',
  },
  
  // Professional typography
  typography: {
    h1: 'text-2xl font-bold tracking-tight',
    h2: 'text-xl font-semibold tracking-tight',
    h3: 'text-lg font-semibold',
    body: 'text-sm',
    caption: 'text-xs',
    button: 'text-sm font-medium',
  },
  
  // Professional shadows
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.25)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.3)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.4)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
  },
  
  // Professional borders and radius
  radius: {
    sm: '0.375rem',
    md: '0.5rem', 
    lg: '0.75rem',
    xl: '1rem',
  }
};

// Professional component styles
export const components = {
  card: `${theme.colors.bg.secondary} border border-white/8 backdrop-blur-sm rounded-lg`,
  button: {
    primary: `bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition-colors rounded-md`,
    secondary: `bg-white/8 hover:bg-white/12 text-white font-medium transition-colors rounded-md border border-white/12`,
    ghost: `hover:bg-white/8 text-white font-medium transition-colors rounded-md`,
  },
  input: `bg-white/5 border border-white/12 rounded-md text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent`,
};
