// src/components/websitelogs/AdminLogs.tsx

import { useEffect, useState, type ReactNode } from 'react';

import {
    Avatar,
    Box,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    IconButton,
    InputAdornment,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
    useMediaQuery,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material/Select';
import type { Theme } from '@mui/material/styles';

import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import FilterListRoundedIcon from '@mui/icons-material/FilterListRounded';
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';

import { useLogStore } from '../../store/admin/useLogStore';
import type { LogAction, LogFilters } from '../../types/log';
import { capitalizeWord } from '../../utils/capitalize';

interface SectionHeaderProps {
    title: string;
    subtitle: string;
    icon: ReactNode;
}

const collectionOptions = [
    { value: 'Songs', label: 'Cantos' },
    { value: 'GalleryImages', label: 'Imágenes' },
    { value: 'Members', label: 'Miembros' },
    { value: 'Announcements', label: 'Avisos' },
    { value: 'BlogPosts', label: 'BlogPosts' },
    { value: 'Themes', label: 'Themes' },
    { value: 'Users', label: 'Usuarios' },
    { value: 'Settings', label: 'Settings' },
];

const actionOptions: readonly { readonly value: LogAction; readonly label: string }[] = [
    { value: 'create', label: 'Create' },
    { value: 'update', label: 'Update' },
    { value: 'delete', label: 'Delete' },
    { value: 'add_reaction', label: 'Agregar reacción' },
    { value: 'remove_reaction', label: 'Quitar reacción' },
];

const SectionHeader = ({ title, subtitle, icon }: SectionHeaderProps) => {
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
                        width: 44,
                        height: 44,
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
                                xs: '1.55rem',
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
                            fontSize: '0.9rem',
                        }}
                    >
                        {subtitle}
                    </Typography>
                </Box>
            </Box>
        </Paper>
    );
};

export const AdminLogs = () => {
    const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));

    const [search, setSearch] = useState('');
    const [filters, setFilters] = useState<LogFilters>({});
    const [filtersDialogOpen, setFiltersDialogOpen] = useState(false);

    const {
        visibleLogs,
        loading,
        currentPage,
        totalPages,
        fetchLogs,
        setPage,
        searchLogsText,
    } = useLogStore();

    useEffect(() => {
        void fetchLogs(currentPage, filters);
    }, [currentPage, filters, fetchLogs]);

    useEffect(() => {
        const delay = window.setTimeout(() => {
            if (search.trim()) {
                searchLogsText(search.trim());
                return;
            }

            searchLogsText('');
            void fetchLogs(1, filters);
        }, 500);

        return () => window.clearTimeout(delay);
    }, [search, filters, fetchLogs, searchLogsText]);

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setPage(newPage);
        }
    };

    const handleCollectionChange = (event: SelectChangeEvent<string>) => {
        const nextValue = event.target.value;

        setPage(1);
        setFilters((previousValue) => ({
            ...previousValue,
            collectionName: nextValue || undefined,
        }));
    };

    const handleActionChange = (event: SelectChangeEvent<string>) => {
        const nextValue = event.target.value;
        const nextAction = actionOptions.find((option) => option.value === nextValue)?.value;

        setPage(1);
        setFilters((previousValue) => ({
            ...previousValue,
            action: nextAction,
        }));
    };

    const handleClearFilters = () => {
        setSearch('');
        setFilters({});
        setPage(1);
    };

    const handleOpenFiltersDialog = () => {
        setFiltersDialogOpen(true);
    };

    const handleCloseFiltersDialog = () => {
        setFiltersDialogOpen(false);
    };

    const activeFiltersCount = [
        search.trim(),
        filters.collectionName,
        filters.action,
    ].filter(Boolean).length;

    const renderFiltersContent = () => (
        <Box
            sx={{
                display: 'grid',
                gridTemplateColumns: {
                    xs: '1fr',
                    md: 'minmax(0, 1fr) 220px 180px auto',
                },
                gap: 1.25,
                alignItems: 'center',
            }}
        >
            <TextField
                type="text"
                label="Buscar"
                placeholder="Buscar por ID, username, colección..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                fullWidth
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

            <FormControl fullWidth>
                <InputLabel id="logs-collection-filter-label">Colección</InputLabel>
                <Select
                    labelId="logs-collection-filter-label"
                    value={filters.collectionName || ''}
                    label="Colección"
                    onChange={handleCollectionChange}
                >
                    <MenuItem value="">
                        <em>Todas</em>
                    </MenuItem>

                    {collectionOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                            {option.label}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

            <FormControl fullWidth>
                <InputLabel id="logs-action-filter-label">Acción</InputLabel>
                <Select
                    labelId="logs-action-filter-label"
                    value={filters.action || ''}
                    label="Acción"
                    onChange={handleActionChange}
                >
                    <MenuItem value="">
                        <em>Todas</em>
                    </MenuItem>

                    {actionOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                            {option.label}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

            <Button
                variant="outlined"
                onClick={handleClearFilters}
                sx={{
                    borderRadius: 1.5,
                    px: 2,
                    py: 0.9,
                    fontWeight: 950,
                    whiteSpace: 'nowrap',
                }}
            >
                Limpiar
            </Button>
        </Box>
    );

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
                title="Bitácora de Cambios"
                subtitle="Consulta acciones realizadas por usuarios dentro del panel administrativo."
                icon={<HistoryRoundedIcon />}
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
                {isMobile ? (
                    <Box
                        sx={{
                            flexShrink: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: 1,
                        }}
                    >
                        <Button
                            variant="contained"
                            startIcon={<FilterListRoundedIcon />}
                            onClick={handleOpenFiltersDialog}
                            sx={{
                                borderRadius: 1.5,
                                px: 2,
                                py: 0.9,
                                fontWeight: 950,
                            }}
                        >
                            Filtros
                            {activeFiltersCount > 0 ? ` (${activeFiltersCount})` : ''}
                        </Button>

                        {activeFiltersCount > 0 && (
                            <Button
                                variant="outlined"
                                onClick={handleClearFilters}
                                sx={{
                                    borderRadius: 1.5,
                                    px: 2,
                                    py: 0.9,
                                    fontWeight: 950,
                                }}
                            >
                                Limpiar
                            </Button>
                        )}
                    </Box>
                ) : (
                    <Box sx={{ flexShrink: 0 }}>
                        {renderFiltersContent()}
                    </Box>
                )}

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
                                Cargando bitácora...
                            </Typography>
                        </Box>
                    </Box>
                ) : (
                    <TableContainer
                        sx={{
                            flex: 1,
                            minHeight: 0,
                            overflow: 'auto',
                            borderRadius: 1.5,
                            scrollbarWidth: 'none',
                            msOverflowStyle: 'none',
                            '&::-webkit-scrollbar': {
                                display: 'none',
                            },
                        }}
                    >
                        <Table stickyHeader>
                            <TableHead>
                                <TableRow>
                                    {['Usuario', 'Colección', 'Acción', 'ID Referencia', 'Fecha'].map((label) => (
                                        <TableCell
                                            key={label}
                                            align={label === 'Fecha' ? 'right' : 'left'}
                                            sx={{
                                                backgroundColor:
                                                    'color-mix(in srgb, var(--color-card) 82%, var(--color-primary) 18%)',
                                                color: 'var(--color-text)',
                                                fontWeight: 950,
                                                borderBottom:
                                                    '1px solid color-mix(in srgb, var(--color-border) 42%, transparent)',
                                                whiteSpace: 'nowrap',
                                            }}
                                        >
                                            {label}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {visibleLogs.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={5}
                                            sx={{
                                                py: 5,
                                                textAlign: 'center',
                                                color: 'var(--color-secondary-text)',
                                                fontWeight: 800,
                                                borderBottom: 'none',
                                            }}
                                        >
                                            No hay registros.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    visibleLogs.map((log) => {
                                        const userName = log.actor?.name ?? 'Usuario no disponible';
                                        const username = log.actor?.username ?? '';

                                        return (
                                            <TableRow
                                                key={log.id}
                                                hover
                                                sx={{
                                                    '&:hover': {
                                                        backgroundColor:
                                                            'color-mix(in srgb, var(--color-primary) 8%, transparent)',
                                                    },
                                                }}
                                            >
                                                <TableCell
                                                    sx={{
                                                        color: 'var(--color-text)',
                                                        borderBottom:
                                                            '1px solid color-mix(in srgb, var(--color-border) 32%, transparent)',
                                                        minWidth: 210,
                                                    }}
                                                >
                                                    <Box
                                                        sx={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: 1,
                                                        }}
                                                    >
                                                        <Avatar
                                                            sx={{
                                                                width: 36,
                                                                height: 36,
                                                                bgcolor: 'var(--color-primary)',
                                                                color: 'var(--color-button-text)',
                                                                fontWeight: 950,
                                                            }}
                                                        >
                                                            {userName.slice(0, 1).toUpperCase()}
                                                        </Avatar>

                                                        <Box sx={{ minWidth: 0 }}>
                                                            <Typography sx={{ fontWeight: 950, lineHeight: 1.1 }}>
                                                                {userName}
                                                            </Typography>

                                                            {username && (
                                                                <Typography
                                                                    sx={{
                                                                        color: 'var(--color-secondary-text)',
                                                                        fontWeight: 750,
                                                                        fontSize: '0.82rem',
                                                                    }}
                                                                >
                                                                    @{username}
                                                                </Typography>
                                                            )}
                                                        </Box>
                                                    </Box>
                                                </TableCell>

                                                <TableCell
                                                    sx={{
                                                        color: 'var(--color-text)',
                                                        fontWeight: 850,
                                                        borderBottom:
                                                            '1px solid color-mix(in srgb, var(--color-border) 32%, transparent)',
                                                        minWidth: 150,
                                                    }}
                                                >
                                                    {log.collectionName}
                                                </TableCell>

                                                <TableCell
                                                    sx={{
                                                        color: 'var(--color-primary)',
                                                        fontWeight: 950,
                                                        borderBottom:
                                                            '1px solid color-mix(in srgb, var(--color-border) 32%, transparent)',
                                                        minWidth: 120,
                                                    }}
                                                >
                                                    {capitalizeWord(log.action)}
                                                </TableCell>

                                                <TableCell
                                                    sx={{
                                                        color: 'var(--color-secondary-text)',
                                                        fontWeight: 800,
                                                        borderBottom:
                                                            '1px solid color-mix(in srgb, var(--color-border) 32%, transparent)',
                                                        minWidth: 240,
                                                        maxWidth: 300,
                                                        overflowWrap: 'anywhere',
                                                    }}
                                                >
                                                    {log.referenceId || '-'}
                                                </TableCell>

                                                <TableCell
                                                    align="right"
                                                    sx={{
                                                        color: 'var(--color-text)',
                                                        fontWeight: 800,
                                                        borderBottom:
                                                            '1px solid color-mix(in srgb, var(--color-border) 32%, transparent)',
                                                        minWidth: 210,
                                                        whiteSpace: 'nowrap',
                                                    }}
                                                >
                                                    {new Date(log.createdAt).toLocaleString('es-MX', {
                                                        dateStyle: 'medium',
                                                        timeStyle: 'short',
                                                    })}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}

                <Box
                    sx={{
                        flexShrink: 0,
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: 1,
                    }}
                >
                    <Button
                        variant="outlined"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1 || loading}
                        sx={{
                            borderRadius: 1.5,
                            fontWeight: 950,
                        }}
                    >
                        Anterior
                    </Button>

                    <Typography sx={{ fontWeight: 800 }}>
                        Página {currentPage} de {totalPages}
                    </Typography>

                    <Button
                        variant="outlined"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages || loading}
                        sx={{
                            borderRadius: 1.5,
                            fontWeight: 950,
                        }}
                    >
                        Siguiente
                    </Button>
                </Box>
            </Paper>

            <Dialog
                open={filtersDialogOpen}
                onClose={handleCloseFiltersDialog}
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
                        <FilterListRoundedIcon sx={{ color: 'var(--color-primary)' }} />
                        Filtros de bitácora
                    </Box>

                    <IconButton
                        aria-label="Cerrar filtros"
                        onClick={handleCloseFiltersDialog}
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
                        mt: 2,
                        backgroundColor: 'var(--color-card)',
                        scrollbarWidth: 'none',
                        msOverflowStyle: 'none',
                        '&::-webkit-scrollbar': {
                            display: 'none',
                        },
                    }}
                >
                    {renderFiltersContent()}
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
                        onClick={handleClearFilters}
                        sx={{
                            borderRadius: 1.5,
                            fontWeight: 950,
                        }}
                    >
                        Limpiar
                    </Button>

                    <Button
                        variant="contained"
                        onClick={handleCloseFiltersDialog}
                        sx={{
                            borderRadius: 1.5,
                            fontWeight: 950,
                        }}
                    >
                        Aplicar
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};