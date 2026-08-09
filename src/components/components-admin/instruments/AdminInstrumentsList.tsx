// src/components/components-admin/instruments/AdminInstrumentsList.tsx

import { useEffect, useState, type ReactNode } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import Swal from 'sweetalert2';

import {
    Avatar,
    Box,
    Button,
    Chip,
    CircularProgress,
    IconButton,
    InputAdornment,
    Paper,
    TextField,
    Tooltip,
    Typography,
} from '@mui/material';

import AddRoundedIcon from '@mui/icons-material/AddRounded';
import BuildRoundedIcon from '@mui/icons-material/BuildRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import MusicNoteRoundedIcon from '@mui/icons-material/MusicNoteRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';

import { useInstrumentsStore } from '../../../store/admin/useInstrumentsStore';
import { useClientPagination } from '../../../hooks/useClientPagination';
import { AdminCardGrid } from '../../common/AdminCardGrid';
import { AdminCardPagination } from '../../common/AdminCardPagination';
import { AdminListCard } from '../../common/AdminListCard';
import type { Instrument } from '../../../types/instrument';

interface SectionHeaderProps {
    title: string;
    subtitle: string;
    icon: ReactNode;
    action?: ReactNode;
}

const SectionHeader = ({ title, subtitle, icon, action }: SectionHeaderProps) => {
    return (
        <Paper
            elevation={0}
            sx={{
                flexShrink: 0,
                p: {
                    xs: 1.5,
                    md: 2,
                },
                borderRadius: 2,
                background:
                    'linear-gradient(145deg, color-mix(in srgb, var(--color-card) 88%, var(--color-primary) 12%) 0%, color-mix(in srgb, var(--color-card) 78%, transparent) 100%)',
                border: '1px solid color-mix(in srgb, var(--color-border) 38%, transparent)',
                boxShadow:
                    'inset 0 1px 0 color-mix(in srgb, var(--color-button-text) 14%, transparent), 0 12px 38px rgba(15, 23, 42, 0.06)',
                color: 'var(--color-text)',
                overflow: 'hidden',
            }}
        >
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: {
                        xs: 'column',
                        sm: 'row',
                    },
                    alignItems: {
                        xs: 'stretch',
                        sm: 'center',
                    },
                    justifyContent: 'space-between',
                    gap: 1.5,
                }}
            >
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: {
                            xs: 'center',
                            sm: 'flex-start',
                        },
                        gap: 1.25,
                        textAlign: {
                            xs: 'center',
                            sm: 'left',
                        },
                    }}
                >
                    <Box
                        sx={{
                            width: {
                                xs: 40,
                                md: 50,
                            },
                            height: {
                                xs: 40,
                                md: 50,
                            },
                            display: 'grid',
                            placeItems: 'center',
                            borderRadius: 1.5,
                            color: 'var(--color-button-text)',
                            background:
                                'linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 100%)',
                            boxShadow:
                                '0 10px 24px rgba(15, 23, 42, 0.14), inset 0 1px 0 rgba(255, 255, 255, 0.24)',
                            flexShrink: 0,
                        }}
                    >
                        {icon}
                    </Box>

                    <Box sx={{ minWidth: 0 }}>
                        <Typography
                            component="h1"
                            sx={{
                                m: 0,
                                fontSize: {
                                    xs: '1.3rem',
                                    md: '2rem',
                                },
                                fontWeight: 950,
                                lineHeight: 1.1,
                            }}
                        >
                            {title}
                        </Typography>

                        <Typography
                            sx={{
                                mt: 0.4,
                                color: 'var(--color-secondary-text)',
                                fontWeight: 800,
                                fontSize: {
                                    xs: '0.8rem',
                                    md: '1rem',
                                },
                            }}
                        >
                            {subtitle}
                        </Typography>
                    </Box>
                </Box>

                {action}
            </Box>
        </Paper>
    );
};

export const AdminInstrumentsList = () => {
    const [searchTerm, setSearchTerm] = useState('');

    const {
        instruments,
        loading,
        fetchInstruments,
        deleteInstrumentById,
    } = useInstrumentsStore();

    useEffect(() => {
        void fetchInstruments();
    }, [fetchInstruments]);

    const handleDelete = async (id: string) => {
        const result = await Swal.fire({
            title: '¿Estás seguro?',
            text: 'Esta acción eliminará el instrumento permanentemente.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
        });

        if (!result.isConfirmed) {
            return;
        }

        try {
            await deleteInstrumentById(id);
            Swal.fire('Eliminado', 'El instrumento ha sido eliminado.', 'success');
        } catch (error) {
            console.error(error);
            Swal.fire('Error', 'No se pudo eliminar el instrumento.', 'error');
        }
    };

    const filteredInstruments = instruments.filter((instrument: Instrument) => {
        const term = searchTerm.toLowerCase();

        return (
            instrument.name.toLowerCase().includes(term) ||
            instrument.slug.toLowerCase().includes(term) ||
            instrument.category.toLowerCase().includes(term) ||
            instrument.iconKey.toLowerCase().includes(term)
        );
    });

    const {
        page, pageSize, totalPages, totalItems, paginatedItems: paginatedInstruments, setPage, setPageSize,
    } = useClientPagination(filteredInstruments);

    return (
        <Box
            component="section"
            sx={{
                width: '100%',
                minHeight: 0,
                height: '100%',
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                overflow: 'hidden',
            }}
        >
            <SectionHeader
                title="Gestión de Instrumentos"
                subtitle="Administra instrumentos, categorías, iconos y disponibilidad para usuarios y miembros."
                icon={<BuildRoundedIcon />}
                action={
                    <Button
                        component={RouterLink}
                        to="/admin/instruments/new"
                        variant="contained"
                        startIcon={<AddRoundedIcon />}
                        sx={{
                            borderRadius: 1.5,
                            px: 2,
                            py: 0.9,
                            fontWeight: 950,
                        }}
                    >
                        Nuevo Instrumento
                    </Button>
                }
            />

            <Paper
                elevation={0}
                sx={{
                    flex: 1,
                    minHeight: 0,
                    p: {
                        xs: 1.25,
                        md: 2,
                    },
                    borderRadius: 2,
                    background:
                        'linear-gradient(145deg, color-mix(in srgb, var(--color-card) 86%, var(--color-primary) 14%) 0%, color-mix(in srgb, var(--color-card) 76%, transparent) 100%)',
                    border: '1px solid color-mix(in srgb, var(--color-border) 38%, transparent)',
                    boxShadow:
                        'inset 0 1px 0 color-mix(in srgb, var(--color-button-text) 14%, transparent), 0 12px 42px rgba(15, 23, 42, 0.06)',
                    color: 'var(--color-text)',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1.5,
                }}
            >
                <TextField
                    type="text"
                    label="Buscar"
                    placeholder="Buscar por nombre, slug, categoría o iconKey..."
                    value={searchTerm}
                    onChange={(event) => {
                        setSearchTerm(event.target.value);
                        setPage(1);
                    }}
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

                {loading ? (
                    <Box
                        sx={{
                            flex: 1,
                            minHeight: 320,
                            display: 'grid',
                            placeItems: 'center',
                        }}
                    >
                        <Box sx={{ textAlign: 'center' }}>
                            <CircularProgress />
                            <Typography sx={{ mt: 2, fontWeight: 800 }}>
                                Cargando instrumentos...
                            </Typography>
                        </Box>
                    </Box>
                ) : (
                    <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
                        {filteredInstruments.length === 0 ? (
                            <Typography sx={{ py: 5, textAlign: 'center', color: 'var(--color-secondary-text)', fontWeight: 800 }}>
                                No se encontraron instrumentos con ese criterio.
                            </Typography>
                        ) : (
                            <AdminCardGrid>
                                {paginatedInstruments.map((instrument) => (
                                    <AdminListCard
                                        key={instrument.id}
                                        leading={(
                                            <Avatar src={instrument.iconUrl || undefined} alt={instrument.name} variant="rounded" sx={{ width: 58, height: 58, borderRadius: 1.5, bgcolor: 'color-mix(in srgb, var(--color-card) 78%, var(--color-primary) 22%)', color: 'var(--color-primary)' }}>
                                                <MusicNoteRoundedIcon />
                                            </Avatar>
                                        )}
                                        title={instrument.name}
                                        subtitle={<><Box component="code">{instrument.slug}</Box>{instrument.category ? ` · ${instrument.category}` : ''}</>}
                                        badges={(
                                            <>
                                                <Chip size="small" label={instrument.isActive ? 'Activo' : 'Inactivo'} color={instrument.isActive ? 'success' : 'default'} sx={{ fontWeight: 950 }} />
                                                <Chip size="small" label={`Orden ${instrument.order}`} variant="outlined" />
                                            </>
                                        )}
                                        actions={(
                                            <>
                                                <Tooltip title="Editar instrumento">
                                                    <IconButton component={RouterLink} to={`/admin/instruments/edit/${instrument.id}`} aria-label={`Editar ${instrument.name}`} sx={{ color: 'var(--color-primary)' }}>
                                                        <EditRoundedIcon />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Eliminar instrumento">
                                                    <IconButton aria-label={`Eliminar ${instrument.name}`} onClick={() => handleDelete(instrument.id)} sx={{ color: '#dc2626' }}>
                                                        <DeleteRoundedIcon />
                                                    </IconButton>
                                                </Tooltip>
                                            </>
                                        )}
                                    >
                                        <Typography sx={{ color: 'var(--color-secondary-text)', fontSize: '0.82rem', fontWeight: 800 }}>
                                            Icon key
                                        </Typography>
                                        <Typography component="code" sx={{ fontWeight: 850, overflowWrap: 'anywhere' }}>
                                            {instrument.iconKey}
                                        </Typography>
                                    </AdminListCard>
                                ))}
                            </AdminCardGrid>
                        )}
                    </Box>
                )}


                <AdminCardPagination
                    page={page}
                    pageSize={pageSize}
                    totalPages={totalPages}
                    totalItems={totalItems}
                    onPageChange={setPage}
                    onPageSizeChange={setPageSize}
                    disabled={loading}
                />
            </Paper>
        </Box>
    );
};