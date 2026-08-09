// src/components/members/MembersList.tsx

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
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';

import { useMemberStore } from '../../store/admin/useMemberStore';
import { AdminCardGrid } from '../common/AdminCardGrid';
import { AdminCardPagination } from '../common/AdminCardPagination';
import { AdminListCard } from '../common/AdminListCard';
import type { Member } from '../../types/member';

interface SectionHeaderProps {
    title: string;
    subtitle: string;
    icon: ReactNode;
    action?: ReactNode;
}

interface MemberInstrumentFields {
    instrumentId?: string;
    instrumentLabel?: string;
    instrument?: string;
}

type MemberWithInstrument = Member & MemberInstrumentFields;

const getMemberInstrumentLabel = (member: Member): string => {
    const memberWithInstrument = member as MemberWithInstrument;

    return memberWithInstrument.instrumentLabel || memberWithInstrument.instrument || '-';
};

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

                {action}
            </Box>
        </Paper>
    );
};

export const MembersList = () => {
    const [searchText, setSearchText] = useState('');

    const {
        members,
        currentPage,
        totalPages,
        totalMembers,
        pageSize,
        loading,
        fetchMembers,
        removeMember,
        setCurrentPage,
        setPageSize,
        searchMembersByText,
    } = useMemberStore();

    useEffect(() => {
        const delay = window.setTimeout(() => {
            if (searchText.trim() === '') {
                void fetchMembers(currentPage, pageSize);
                return;
            }

            void searchMembersByText(searchText, currentPage, pageSize);
        }, 350);

        return () => window.clearTimeout(delay);
    }, [searchText, currentPage, pageSize, fetchMembers, searchMembersByText]);

    const handleDelete = async (id: string) => {
        const result = await Swal.fire({
            title: '¿Estás seguro?',
            text: 'Esta acción eliminará al miembro y su imagen',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
        });

        if (!result.isConfirmed) {
            return;
        }

        try {
            await removeMember(id);
            Swal.fire('Eliminado', 'El miembro ha sido eliminado.', 'success');
        } catch (error) {
            console.error(error);
            Swal.fire('Error', 'No se pudo eliminar el miembro', 'error');
        }
    };

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
                title="Miembros"
                subtitle="Administra integrantes, instrumentos, voz y foto de perfil."
                icon={<GroupsRoundedIcon />}
                action={
                    <Button
                        component={RouterLink}
                        to="/admin/members/new"
                        variant="contained"
                        startIcon={<AddRoundedIcon />}
                        sx={{
                            borderRadius: 1.5,
                            px: 2,
                            py: 0.9,
                            fontWeight: 950,
                        }}
                    >
                        Nuevo Miembro
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
                    placeholder="Buscar por nombre o instrumento..."
                    value={searchText}
                    onChange={(event) => {
                        setSearchText(event.target.value);
                        setCurrentPage(1);
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
                                Cargando miembros...
                            </Typography>
                        </Box>
                    </Box>
                ) : (
                    <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
                        {members.length === 0 ? (
                            <Typography sx={{ py: 5, textAlign: 'center', color: 'var(--color-secondary-text)', fontWeight: 800 }}>
                                No se encontraron miembros con ese criterio.
                            </Typography>
                        ) : (
                            <AdminCardGrid>
                                {members.map((member: Member) => (
                                    <AdminListCard
                                        key={member.id}
                                        leading={(
                                            <Avatar src={member.imageUrl || '/images/default-user.png'} alt={member.name} sx={{ width: 64, height: 64, bgcolor: 'var(--color-primary)', fontWeight: 950 }}>
                                                {member.name.slice(0, 1).toUpperCase()}
                                            </Avatar>
                                        )}
                                        title={member.name}
                                        subtitle={getMemberInstrumentLabel(member)}
                                        badges={(
                                            <Chip size="small" label={member.voice ? 'Con voz' : 'Sin voz'} color={member.voice ? 'success' : 'default'} sx={{ fontWeight: 950 }} />
                                        )}
                                        actions={(
                                            <>
                                                <Tooltip title="Editar miembro">
                                                    <IconButton component={RouterLink} to={`/admin/members/edit/${member.id}`} aria-label={`Editar ${member.name}`} sx={{ color: 'var(--color-primary)' }}>
                                                        <EditRoundedIcon />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Eliminar miembro">
                                                    <IconButton aria-label={`Eliminar ${member.name}`} onClick={() => handleDelete(member.id)} sx={{ color: '#dc2626' }}>
                                                        <DeleteRoundedIcon />
                                                    </IconButton>
                                                </Tooltip>
                                            </>
                                        )}
                                    />
                                ))}
                            </AdminCardGrid>
                        )}
                    </Box>
                )}

                <AdminCardPagination
                    page={currentPage}
                    pageSize={pageSize}
                    totalPages={totalPages}
                    totalItems={totalMembers}
                    onPageChange={setCurrentPage}
                    onPageSizeChange={setPageSize}
                    disabled={loading}
                />
            </Paper>
        </Box>
    );
};