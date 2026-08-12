// src/theme/mui/createMuiAppTheme.ts

import { createTheme, type PaletteMode, type Theme } from '@mui/material/styles';

export interface CreateMuiAppThemeOptions {
    mode?: PaletteMode;
}

export const createMuiAppTheme = (options: CreateMuiAppThemeOptions = {}): Theme => {
    const { mode = 'light' } = options;

    return createTheme({
        palette: {
            mode,
            primary: {
                main: '#2563eb',
                contrastText: '#ffffff',
            },
            secondary: {
                main: '#7c3aed',
                contrastText: '#ffffff',
            },
            background: {
                default: mode === 'dark' ? '#020617' : '#f8fafc',
                paper: mode === 'dark' ? '#0f172a' : '#ffffff',
            },
            text: {
                primary: mode === 'dark' ? '#f8fafc' : '#111827',
                secondary: mode === 'dark' ? '#cbd5e1' : '#64748b',
            },
            divider: mode === 'dark' ? '#1e293b' : '#e5e7eb',
            error: {
                main: '#dc2626',
                contrastText: '#ffffff',
            },
            warning: {
                main: '#d97706',
                contrastText: '#ffffff',
            },
            info: {
                main: '#2563eb',
                contrastText: '#ffffff',
            },
            success: {
                main: '#16a34a',
                contrastText: '#ffffff',
            },
        },
        shape: {
            borderRadius: 10,
        },
        typography: {
            fontFamily: 'system-ui, Avenir, Helvetica, Arial, sans-serif',
            button: {
                textTransform: 'none',
                fontWeight: 800,
            },
        },
        components: {
            MuiCssBaseline: {
                styleOverrides: {
                    html: {
                        width: '100%',
                        minHeight: '100%',
                        overflowX: 'hidden',
                        scrollBehavior: 'smooth',
                    },
                    body: {
                        width: '100%',
                        minHeight: '100%',
                        margin: 0,
                        backgroundColor: 'var(--color-background)',
                        color: 'var(--color-text)',
                        overflowX: 'hidden',
                    },
                    '#root': {
                        width: '100%',
                        minHeight: '100vh',
                    },
                    a: {
                        color: 'inherit',
                        textDecoration: 'none',
                    },
                    img: {
                        maxWidth: '100%',
                    },
                    button: {
                        fontFamily: 'inherit',
                    },
                    input: {
                        fontFamily: 'inherit',
                    },
                    textarea: {
                        fontFamily: 'inherit',
                    },
                    select: {
                        fontFamily: 'inherit',
                    },
                },
            },
            MuiAppBar: {
                styleOverrides: {
                    root: {
                        backgroundImage: 'none',
                        backgroundColor: 'var(--color-nav)',
                        color: 'var(--color-text)',
                    },
                },
            },
            MuiDrawer: {
                styleOverrides: {
                    paper: {
                        border: 'none',
                        backgroundColor: 'var(--color-card)',
                        color: 'var(--color-text)',
                    },
                },
            },
            MuiPaper: {
                styleOverrides: {
                    root: {
                        color: 'var(--color-text)',
                    },
                },
            },
            MuiButton: {
                styleOverrides: {
                    root: {
                        borderRadius: 10,
                        fontWeight: 800,
                    },
                    contained: {
                        backgroundColor: 'var(--color-button)',
                        color: 'var(--color-button-text)',
                        boxShadow: '0 8px 18px rgba(15, 23, 42, 0.12)',
                        '&:hover': {
                            backgroundColor: 'var(--color-accent)',
                            boxShadow: '0 12px 24px rgba(15, 23, 42, 0.16)',
                        },
                    },
                    outlined: {
                        color: 'var(--color-primary)',
                        borderColor: 'var(--color-primary)',
                        '&:hover': {
                            borderColor: 'var(--color-accent)',
                            backgroundColor: 'color-mix(in srgb, var(--color-accent) 10%, transparent)',
                        },
                    },
                    text: {
                        color: 'var(--color-primary)',
                        '&:hover': {
                            backgroundColor: 'color-mix(in srgb, var(--color-primary) 10%, transparent)',
                        },
                    },
                },
            },
            MuiIconButton: {
                styleOverrides: {
                    root: {
                        color: 'inherit',
                        borderRadius: 10,
                    },
                },
            },
            MuiChip: {
                styleOverrides: {
                    root: {
                        fontWeight: 800,
                    },
                },
            },
            MuiListItemButton: {
                styleOverrides: {
                    root: {
                        borderRadius: 10,
                    },
                },
            },
            MuiDialog: {
                styleOverrides: {
                    paper: {
                        backgroundColor: 'var(--color-card)',
                        color: 'var(--color-text)',
                        border: '1px solid var(--color-border)',
                    },
                },
            },
            MuiDialogTitle: {
                styleOverrides: {
                    root: {
                        color: 'var(--color-text)',
                    },
                },
            },
            MuiDialogContent: {
                styleOverrides: {
                    root: {
                        color: 'var(--color-text)',
                    },
                },
            },
            MuiTextField: {
                defaultProps: {
                    variant: 'outlined',
                    fullWidth: true,
                },
            },
            MuiOutlinedInput: {
                styleOverrides: {
                    root: {
                        borderRadius: 10,
                        backgroundColor: 'color-mix(in srgb, var(--color-card) 92%, var(--color-primary) 8%)',
                        color: 'var(--color-text)',
                        '& fieldset': {
                            borderColor: 'var(--color-border)',
                        },
                        '&:hover fieldset': {
                            borderColor: 'var(--color-primary)',
                        },
                        '&.Mui-focused fieldset': {
                            borderColor: 'var(--color-primary)',
                        },
                    },
                    input: {
                        color: 'var(--color-text)',
                    },
                },
            },
            MuiInputLabel: {
                styleOverrides: {
                    root: {
                        color: 'var(--color-secondary-text)',
                        '&.Mui-focused': {
                            color: 'var(--color-primary)',
                        },
                    },
                },
            },
            MuiFormHelperText: {
                styleOverrides: {
                    root: {
                        color: 'var(--color-secondary-text)',
                        fontWeight: 700,
                    },
                },
            },
            MuiAccordion: {
                styleOverrides: {
                    root: {
                        backgroundColor: 'color-mix(in srgb, var(--color-card) 92%, var(--color-primary) 8%)',
                        color: 'var(--color-text)',
                        border: '1px solid var(--color-border)',
                        boxShadow: 'none',
                        '&::before': {
                            display: 'none',
                        },
                    },
                },
            },
            MuiAccordionSummary: {
                styleOverrides: {
                    root: {
                        color: 'var(--color-text)',
                    },
                },
            },
            MuiAccordionDetails: {
                styleOverrides: {
                    root: {
                        color: 'var(--color-text)',
                        borderTop: '1px solid var(--color-border)',
                        backgroundColor: 'var(--color-card)',
                    },
                },
            },
            MuiBottomNavigation: {
                styleOverrides: {
                    root: {
                        backgroundColor: 'var(--color-card)',
                        color: 'var(--color-text)',
                    },
                },
            },
            MuiBottomNavigationAction: {
                styleOverrides: {
                    root: {
                        color: 'var(--color-secondary-text)',
                        '&.Mui-selected': {
                            color: 'var(--color-primary)',
                        },
                    },
                    label: {
                        fontWeight: 800,
                    },
                },
            },
            MuiCircularProgress: {
                styleOverrides: {
                    root: {
                        color: 'var(--color-primary)',
                    },
                },
            },
        },
    });
};