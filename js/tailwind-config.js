// Configuración de Tailwind (CDN) con los colores de Busset Agency
tailwind.config = {
  theme: {
    extend: {
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
      colors: {
        brand: { DEFAULT: '#721833', dark: '#5A1228', soft: '#F8EDF1', rose: '#E3A1B5' },
        ink: '#000000'
      }
    }
  }
};
