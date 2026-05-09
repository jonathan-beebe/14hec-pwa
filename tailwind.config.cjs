/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{html,tsx,ts}'],
  theme: {
    extend: {
      colors: {
        botanical: {
          50: '#f2f7f4',
          100: '#ddeee4',
          200: '#b8d8c4',
          300: '#8ac0a0',
          400: '#5da87e',
          500: '#3d8a5e',
          600: '#2d7048',
          700: '#235a3a',
          800: '#1a4530',
          900: '#133525',
          950: '#0a1f16'
        },
        earth: {
          50: '#f7f5f1',
          100: '#ede8e0',
          200: '#d8cfc4',
          300: '#b3a898',
          400: '#908474',
          500: '#6f6358',
          600: '#554e46',
          700: '#3a3530',
          800: '#282420',
          900: '#1c1a17',
          950: '#100f0c'
        },
        celestial: {
          50: '#f0f0fd',
          100: '#dddcfc',
          200: '#bcb8f9',
          300: '#9a8cf4',
          400: '#7c5eed',
          500: '#6840e3',
          600: '#5a2dd0',
          700: '#4c24af',
          800: '#3e1f8e',
          900: '#341c73',
          950: '#1e0f4d'
        },
        gold: {
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
        },
        sanctuary: {
          heart: '#f43f5e',
          mind: '#3b82f6',
          body: '#22c55e',
          spirit: '#a855f7'
        }
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'Cambria', 'serif'],
        body: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Fira Code"', 'monospace'],
        system: ['system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Helvetica', 'Arial', 'sans-serif']
      },
      animation: {
        'fade-in': 'fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'fade-in-up': 'fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        'fade-in-down': 'fadeInDown 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-in-left': 'slideInLeft 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-in-right': 'slideInRight 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'scale-in': 'scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        'shimmer': 'shimmer 2s linear infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-glow': 'pulseGlow 3s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'spin-slow': 'spin 20s linear infinite',
        'gradient-shift': 'gradientShift 8s ease infinite',
        'breathe': 'breathe 6s ease-in-out infinite',
        'twinkle': 'twinkle 3s ease-in-out infinite',
        'aurora': 'auroraDrift 25s ease-in-out infinite alternate',
        'glow-pulse': 'glowPulse 4s ease-in-out infinite',
        'border-rotate': 'borderRotate 6s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        fadeInDown: {
          '0%': { opacity: '0', transform: 'translateY(-8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-16px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' }
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(16px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' }
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' }
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' }
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '1' }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' }
        },
        gradientShift: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' }
        },
        breathe: {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.5' },
          '50%': { transform: 'scale(1.08)', opacity: '0.8' }
        },
        twinkle: {
          '0%, 100%': { opacity: '0.3', transform: 'scale(0.8)' },
          '50%': { opacity: '1', transform: 'scale(1)' }
        },
        auroraDrift: {
          '0%': { transform: 'translate(0, 0) rotate(0deg) scale(1)' },
          '33%': { transform: 'translate(30px, -20px) rotate(1deg) scale(1.02)' },
          '66%': { transform: 'translate(-20px, 15px) rotate(-1deg) scale(0.98)' },
          '100%': { transform: 'translate(10px, -10px) rotate(0.5deg) scale(1.01)' }
        },
        glowPulse: {
          '0%, 100%': { opacity: '0.6', filter: 'blur(40px)' },
          '50%': { opacity: '1', filter: 'blur(50px)' }
        },
        borderRotate: {
          '0%': { '--border-angle': '0deg' },
          '100%': { '--border-angle': '360deg' }
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      backdropBlur: {
        xs: '2px'
      },
      boxShadow: {
        'glow-botanical': '0 0 15px rgba(93, 168, 126, 0.15), 0 0 45px rgba(93, 168, 126, 0.05)',
        'glow-celestial': '0 0 15px rgba(124, 94, 237, 0.15), 0 0 45px rgba(124, 94, 237, 0.05)',
        'glow-amber': '0 0 15px rgba(245, 158, 11, 0.15), 0 0 45px rgba(245, 158, 11, 0.05)',
        'glow-heart': '0 0 15px rgba(244, 63, 94, 0.15), 0 0 45px rgba(244, 63, 94, 0.05)',
        'glow-mind': '0 0 15px rgba(59, 130, 246, 0.15), 0 0 45px rgba(59, 130, 246, 0.05)',
        'glow-body': '0 0 15px rgba(34, 197, 94, 0.15), 0 0 45px rgba(34, 197, 94, 0.05)',
        'glow-spirit': '0 0 15px rgba(168, 85, 247, 0.15), 0 0 45px rgba(168, 85, 247, 0.05)',
        'glow-botanical-sm': '0 0 8px rgba(93, 168, 126, 0.15), 0 0 24px rgba(93, 168, 126, 0.05)',
        'glow-celestial-sm': '0 0 8px rgba(124, 94, 237, 0.15), 0 0 24px rgba(124, 94, 237, 0.05)',
        'glow-amber-sm': '0 0 8px rgba(245, 158, 11, 0.15), 0 0 24px rgba(245, 158, 11, 0.05)',
        'glow-heart-sm': '0 0 8px rgba(244, 63, 94, 0.15), 0 0 24px rgba(244, 63, 94, 0.05)',
        'glow-mind-sm': '0 0 8px rgba(59, 130, 246, 0.15), 0 0 24px rgba(59, 130, 246, 0.05)',
        'glow-body-sm': '0 0 8px rgba(34, 197, 94, 0.15), 0 0 24px rgba(34, 197, 94, 0.05)',
        'glow-spirit-sm': '0 0 8px rgba(168, 85, 247, 0.15), 0 0 24px rgba(168, 85, 247, 0.05)',
        'inner-light': 'inset 0 1px 0 0 rgba(255,255,255,0.06)',
        'depth-sm': '0 2px 4px rgba(0, 0, 0, 0.2), 0 1px 2px rgba(0, 0, 0, 0.15)',
        'depth': '0 4px 12px -2px rgba(0, 0, 0, 0.3), 0 2px 6px -2px rgba(0, 0, 0, 0.2)',
        'depth-lg': '0 12px 40px -8px rgba(0, 0, 0, 0.5), 0 4px 12px -4px rgba(0, 0, 0, 0.3)',
        'depth-xl': '0 24px 80px -12px rgba(0, 0, 0, 0.6), 0 8px 24px -8px rgba(0, 0, 0, 0.4)',
        'glass': 'inset 0 1px 0 0 rgba(255,255,255,0.04), 0 8px 32px rgba(0, 0, 0, 0.3)',
        'glass-hover': 'inset 0 1px 0 0 rgba(255,255,255,0.08), 0 12px 40px rgba(0, 0, 0, 0.35)',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      transitionTimingFunction: {
        'out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'out-quart': 'cubic-bezier(0.25, 1, 0.5, 1)',
      },
    }
  },
  plugins: []
}
