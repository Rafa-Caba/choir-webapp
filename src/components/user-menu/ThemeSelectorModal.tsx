// src/components/user-menu/ThemeSelectorModal.tsx

import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Paper,
    Typography,
} from '@mui/material';

import PaletteRoundedIcon from '@mui/icons-material/PaletteRounded';

import type { Theme } from '../../types/theme';

interface Props {
    show: boolean;
    onClose: () => void;
    themes: Theme[];
    onSelect: (theme: Theme) => void;
    selectedThemeId?: string | null;
    globalThemeName?: string;
    onUseGlobalTheme?: () => void;
}

export const ThemeSelectorModal = ({
    show,
    onClose,
    themes,
    onSelect,
    selectedThemeId = null,
    globalThemeName = '',
    onUseGlobalTheme,
}: Props) => {
    return (
        <Dialog
            open={show}
            onClose={onClose}
            fullWidth
            maxWidth="sm"
            scroll="paper"
            slotProps={{
                paper: {
                    sx: {
                        borderRadius: 2,
                        backgroundColor: 'var(--color-card)',
                        color: 'var(--color-text)',
                        border: '1px solid color-mix(in srgb, var(--color-border) 46%, transparent)',
                        boxShadow: '0 22px 70px rgba(15, 23, 42, 0.22)',
                        overflow: 'hidden',
                    },
                },
            }}
        >
            <DialogTitle
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    fontWeight: 950,
                    borderBottom: '1px solid color-mix(in srgb, var(--color-border) 36%, transparent)',
                }}
            >
                <PaletteRoundedIcon sx={{ color: 'var(--color-primary)' }} />
                Tema personal de la consola
            </DialogTitle>

            <DialogContent
                sx={{
                    p: 2,
                    backgroundColor: 'var(--color-card)',
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                    '&::-webkit-scrollbar': {
                        display: 'none',
                    },
                }}
            >
                <Box
                    sx={{
                        paddingTop: 2,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 1.25,
                    }}
                >
                    {onUseGlobalTheme && (
                        <Paper
                            elevation={0}
                            role="button"
                            tabIndex={0}
                            onClick={onUseGlobalTheme}
                            onKeyDown={(event) => {
                                if (event.key === 'Enter' || event.key === ' ') {
                                    onUseGlobalTheme();
                                }
                            }}
                            sx={{
                                p: 1.5,
                                borderRadius: 1.5,
                                cursor: 'pointer',
                                backgroundColor: !selectedThemeId
                                    ? 'color-mix(in srgb, var(--color-primary) 18%, var(--color-card) 82%)'
                                    : 'color-mix(in srgb, var(--color-card) 88%, var(--color-primary) 12%)',
                                border: !selectedThemeId
                                    ? '2px solid var(--color-primary)'
                                    : '1px solid color-mix(in srgb, var(--color-border) 34%, transparent)',
                                color: 'var(--color-text)',
                                transition: 'all 0.18s ease',
                                '&:hover': {
                                    transform: 'translateY(-1px)',
                                    boxShadow: '0 12px 28px rgba(15, 23, 42, 0.12)',
                                },
                            }}
                        >
                            <Typography sx={{ fontWeight: 950 }}>
                                Usar tema del coro
                            </Typography>
                            <Typography
                                sx={{
                                    mt: 0.25,
                                    color: 'var(--color-secondary-text)',
                                    fontWeight: 750,
                                    fontSize: '0.84rem',
                                }}
                            >
                                {globalThemeName
                                    ? `Tema global actual: ${globalThemeName}`
                                    : 'Usa automáticamente el tema global configurado para el coro.'}
                            </Typography>
                        </Paper>
                    )}

                    {themes.length === 0 ? (
                        <Typography
                            sx={{
                                py: 4,
                                textAlign: 'center',
                                color: 'var(--color-secondary-text)',
                                fontWeight: 800,
                            }}
                        >
                            No hay temas disponibles.
                        </Typography>
                    ) : (
                        themes.map((theme) => {
                            const isSelected = selectedThemeId === theme.id;

                            return (
                                <Paper
                                    key={theme.id}
                                    elevation={0}
                                    role="button"
                                    tabIndex={0}
                                    onClick={() => onSelect(theme)}
                                    onKeyDown={(event) => {
                                        if (event.key === 'Enter' || event.key === ' ') {
                                            onSelect(theme);
                                        }
                                    }}
                                    sx={{
                                        p: 1.5,
                                        borderRadius: 1.5,
                                        cursor: 'pointer',
                                        backgroundColor: isSelected
                                            ? 'color-mix(in srgb, var(--color-primary) 18%, var(--color-card) 82%)'
                                            : 'color-mix(in srgb, var(--color-card) 88%, var(--color-primary) 12%)',
                                        border: isSelected
                                            ? '2px solid var(--color-primary)'
                                            : '1px solid color-mix(in srgb, var(--color-border) 34%, transparent)',
                                        color: 'var(--color-text)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        gap: 1.5,
                                        transition: 'all 0.18s ease',
                                        '&:hover': {
                                            transform: 'translateY(-1px)',
                                            boxShadow: '0 12px 28px rgba(15, 23, 42, 0.12)',
                                            borderColor:
                                                'color-mix(in srgb, var(--color-primary) 50%, var(--color-border) 50%)',
                                        },
                                    }}
                                >
                                    <Box sx={{ minWidth: 0 }}>
                                        <Typography sx={{ fontWeight: 950, overflowWrap: 'anywhere' }}>
                                            {theme.name}
                                        </Typography>

                                        <Typography
                                            sx={{
                                                color: 'var(--color-secondary-text)',
                                                fontWeight: 750,
                                                fontSize: '0.84rem',
                                            }}
                                        >
                                            {theme.isDark ? 'Modo Oscuro' : 'Modo Claro'}
                                            {isSelected ? ' · Seleccionado' : ''}
                                        </Typography>
                                    </Box>

                                    <Box
                                        sx={{
                                            display: 'flex',
                                            gap: 0.5,
                                            flexShrink: 0,
                                        }}
                                    >
                                        {[theme.backgroundColor, theme.primaryColor, theme.accentColor].map((colorValue) => (
                                            <Box
                                                key={colorValue}
                                                title={colorValue}
                                                sx={{
                                                    width: 26,
                                                    height: 26,
                                                    borderRadius: 0.8,
                                                    backgroundColor: colorValue,
                                                    border: '1px solid color-mix(in srgb, var(--color-border) 70%, transparent)',
                                                    boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.18)',
                                                }}
                                            />
                                        ))}
                                    </Box>
                                </Paper>
                            );
                        })
                    )}
                </Box>
            </DialogContent>

            <DialogActions
                sx={{
                    p: 1.5,
                    borderTop: '1px solid color-mix(in srgb, var(--color-border) 36%, transparent)',
                }}
            >
                <Button
                    variant="outlined"
                    onClick={onClose}
                    sx={{
                        borderRadius: 1.5,
                        fontWeight: 950,
                    }}
                >
                    Cancelar
                </Button>
            </DialogActions>
        </Dialog>
    );
};
