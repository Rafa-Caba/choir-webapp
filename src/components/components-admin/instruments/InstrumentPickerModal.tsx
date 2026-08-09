// src/components/components-admin/instruments/InstrumentPickerModal.tsx

import { useMemo, useState, type ChangeEvent } from 'react';

import {
    Box,
    Button,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    InputAdornment,
    Paper,
    TextField,
    Typography,
} from '@mui/material';

import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import MusicNoteRoundedIcon from '@mui/icons-material/MusicNoteRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';

import type { Instrument } from '../../../types/instrument';

interface InstrumentPickerModalProps {
    show: boolean;
    onClose: () => void;
    instruments?: Instrument[];
    selectedInstrumentId?: string | null;
    onSelectInstrument: (instrument: Instrument | null) => void;
}

export const InstrumentPickerModal = ({
    show,
    onClose,
    instruments = [],
    selectedInstrumentId,
    onSelectInstrument,
}: InstrumentPickerModalProps) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredInstruments = useMemo(() => {
        const term = searchTerm.toLowerCase();

        return instruments.filter((instrument) => (
            instrument.name.toLowerCase().includes(term) ||
            instrument.slug.toLowerCase().includes(term) ||
            (instrument.category || '').toLowerCase().includes(term)
        ));
    }, [instruments, searchTerm]);

    const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
    };

    const handleSelect = (instrument: Instrument) => {
        onSelectInstrument(instrument);
        onClose();
    };

    const handleClearSelection = () => {
        onSelectInstrument(null);
        onClose();
    };

    const handleHide = () => {
        onClose();
    };

    return (
        <Dialog
            open={show}
            onClose={handleHide}
            fullWidth
            maxWidth="lg"
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
                    justifyContent: 'space-between',
                    gap: 1,
                    fontWeight: 950,
                    borderBottom: '1px solid color-mix(in srgb, var(--color-border) 36%, transparent)',
                }}
            >
                <Box
                    component="span"
                    sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 1,
                    }}
                >
                    <MusicNoteRoundedIcon sx={{ color: 'var(--color-primary)' }} />
                    Seleccionar instrumento
                </Box>

                <IconButton
                    aria-label="Cerrar selector de instrumento"
                    onClick={handleHide}
                    sx={{
                        color: 'var(--color-text)',
                    }}
                >
                    <CloseRoundedIcon />
                </IconButton>
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
                <TextField
                    type="text"
                    label="Buscar"
                    placeholder="Buscar por nombre, slug o categoría..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    fullWidth
                    sx={{ my: 2 }}
                    slotProps={{
                        input: {
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchRoundedIcon sx={{ color: 'var(--color-primary)' }} />
                                </InputAdornment>
                            ),
                        },
                    }}
                />

                {filteredInstruments.length === 0 ? (
                    <Typography
                        sx={{
                            py: 4,
                            textAlign: 'center',
                            color: 'var(--color-secondary-text)',
                            fontWeight: 800,
                        }}
                    >
                        {instruments.length === 0 && searchTerm.trim().length === 0
                            ? 'No hay instrumentos configurados para este coro. Puedes escribir uno manualmente en el formulario.'
                            : 'No se encontraron instrumentos con ese criterio.'}
                    </Typography>
                ) : (
                    <Box
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: {
                                xs: '1fr',
                                md: 'repeat(2, minmax(0, 1fr))',
                            },
                            gap: 1.5,
                        }}
                    >
                        {filteredInstruments.map((instrument) => {
                            const isSelected = instrument.id === selectedInstrumentId;

                            return (
                                <Paper
                                    key={instrument.id}
                                    elevation={0}
                                    component="button"
                                    type="button"
                                    onClick={() => handleSelect(instrument)}
                                    sx={{
                                        width: '100%',
                                        p: 1.25,
                                        borderRadius: 2,
                                        cursor: 'pointer',
                                        textAlign: 'left',
                                        backgroundColor: isSelected
                                            ? 'color-mix(in srgb, var(--color-primary) 14%, var(--color-card) 86%)'
                                            : 'color-mix(in srgb, var(--color-card) 90%, var(--color-primary) 10%)',
                                        border: isSelected
                                            ? '2px solid var(--color-primary)'
                                            : '1px solid color-mix(in srgb, var(--color-border) 34%, transparent)',
                                        color: 'var(--color-text)',
                                        display: 'grid',
                                        gridTemplateColumns: {
                                            xs: '110px minmax(0, 1fr)',
                                            sm: '140px minmax(0, 1fr)',
                                        },
                                        gap: 1.25,
                                        alignItems: 'center',
                                        transition: 'all 0.18s ease',
                                        '&:hover': {
                                            transform: 'translateY(-1px)',
                                            boxShadow: '0 12px 28px rgba(15, 23, 42, 0.12)',
                                            borderColor:
                                                'color-mix(in srgb, var(--color-primary) 50%, var(--color-border) 50%)',
                                        },
                                    }}
                                >
                                    <Box
                                        sx={{
                                            width: {
                                                xs: 110,
                                                sm: 140,
                                            },
                                            height: {
                                                xs: 130,
                                                sm: 170,
                                            },
                                            borderRadius: 1.5,
                                            border:
                                                '1px solid color-mix(in srgb, var(--color-border) 32%, transparent)',
                                            display: 'grid',
                                            placeItems: 'center',
                                            overflow: 'hidden',
                                            backgroundColor:
                                                'color-mix(in srgb, var(--color-card) 82%, var(--color-primary) 18%)',
                                        }}
                                    >
                                        {instrument.iconUrl ? (
                                            <Box
                                                component="img"
                                                src={instrument.iconUrl}
                                                alt={instrument.name}
                                                sx={{
                                                    width: '100%',
                                                    height: '100%',
                                                    objectFit: 'contain',
                                                    display: 'block',
                                                }}
                                            />
                                        ) : (
                                            <Box
                                                sx={{
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    alignItems: 'center',
                                                    gap: 0.75,
                                                    color: 'var(--color-secondary-text)',
                                                    textAlign: 'center',
                                                    px: 1,
                                                }}
                                            >
                                                <MusicNoteRoundedIcon sx={{ fontSize: 34 }} />

                                                <Typography
                                                    sx={{
                                                        fontWeight: 800,
                                                        fontSize: '0.78rem',
                                                        overflowWrap: 'anywhere',
                                                    }}
                                                >
                                                    {instrument.iconKey || 'Icono'}
                                                </Typography>
                                            </Box>
                                        )}
                                    </Box>

                                    <Box sx={{ minWidth: 0 }}>
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                gap: 1,
                                                mb: 0.75,
                                            }}
                                        >
                                            <Typography
                                                sx={{
                                                    fontWeight: 950,
                                                    overflowWrap: 'anywhere',
                                                }}
                                            >
                                                {instrument.name}
                                            </Typography>

                                            <Chip
                                                size="small"
                                                label={instrument.isActive ? 'Activo' : 'Inactivo'}
                                                color={instrument.isActive ? 'success' : 'default'}
                                                sx={{
                                                    flexShrink: 0,
                                                    fontWeight: 950,
                                                }}
                                            />
                                        </Box>

                                        <Typography
                                            sx={{
                                                color: 'var(--color-secondary-text)',
                                                fontWeight: 800,
                                                fontSize: '0.83rem',
                                                overflowWrap: 'anywhere',
                                            }}
                                        >
                                            Slug:{' '}
                                            <Box component="code">
                                                {instrument.slug}
                                            </Box>
                                        </Typography>

                                        {instrument.category && (
                                            <Typography
                                                sx={{
                                                    mt: 0.4,
                                                    color: 'var(--color-secondary-text)',
                                                    fontWeight: 800,
                                                    fontSize: '0.83rem',
                                                    overflowWrap: 'anywhere',
                                                }}
                                            >
                                                Categoría: {instrument.category}
                                            </Typography>
                                        )}

                                        {isSelected && (
                                            <Typography
                                                sx={{
                                                    mt: 0.75,
                                                    color: 'var(--color-primary)',
                                                    fontWeight: 950,
                                                    fontSize: '0.84rem',
                                                }}
                                            >
                                                Seleccionado actualmente
                                            </Typography>
                                        )}
                                    </Box>
                                </Paper>
                            );
                        })}
                    </Box>
                )}
            </DialogContent>

            <DialogActions
                sx={{
                    p: 1.5,
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: 1,
                    borderTop: '1px solid color-mix(in srgb, var(--color-border) 36%, transparent)',
                }}
            >
                <Button
                    variant="outlined"
                    onClick={handleClearSelection}
                    type="button"
                    sx={{
                        borderRadius: 1.5,
                        fontWeight: 950,
                    }}
                >
                    Quitar instrumento
                </Button>

                <Button
                    variant="contained"
                    onClick={handleHide}
                    type="button"
                    sx={{
                        borderRadius: 1.5,
                        fontWeight: 950,
                    }}
                >
                    Cerrar
                </Button>
            </DialogActions>
        </Dialog>
    );
};