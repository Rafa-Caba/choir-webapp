// src/components/components-public/MemberSection.tsx

import {
    Avatar,
    Box,
    Paper,
    Typography,
} from '@mui/material';

import { PublicResourceNotice } from '../public/PublicResourceNotice';
import { usePublicGlobal } from '../../context/PublicGlobalContext';
import { useMemberStore } from '../../store/public/useMemberStore';

const MemberSection = () => {
    const { choirCode } = usePublicGlobal();
    const members = useMemberStore((state) => (
        state.loadedChoirCode === choirCode ? state.members : []
    ));
    const loading = useMemberStore((state) => (
        state.loadedChoirCode === choirCode && state.loading
    ));
    const errorMessage = useMemberStore((state) => (
        state.loadedChoirCode === choirCode ? state.errorMessage : null
    ));

    if (loading || errorMessage) {
        return (
            <PublicResourceNotice
                loading={loading}
                loadingMessage="Cargando integrantes..."
                errorMessage={errorMessage}
            />
        );
    }

    return (
        <Box
            component="section"
            sx={{
                width: '100%',
                minWidth: 0,
            }}
        >
            <Paper
                elevation={0}
                sx={{
                    width: '100%',
                    p: {
                        xs: 1,
                        sm: 2,
                        md: 3,
                    },
                    borderRadius: {
                        xs: 1.5,
                        md: 2,
                    },
                    backgroundColor: 'color-mix(in srgb, var(--color-card) 82%, transparent)',
                    border: '1px solid color-mix(in srgb, var(--color-border) 84%, transparent)',
                    color: 'var(--color-text)',
                    boxShadow: '0 10px 28px rgba(15, 23, 42, 0.06)',
                    overflow: 'hidden',
                }}
            >
                <Typography
                    component="h1"
                    sx={{
                        mb: {
                            xs: 1.5,
                            md: 3,
                        },
                        textAlign: 'center',
                        fontSize: {
                            xs: '1.45rem',
                            md: '2rem',
                        },
                        fontWeight: 950,
                        lineHeight: 1.1,
                    }}
                >
                    Integrantes
                </Typography>

                {members.length > 0 ? (
                    <Box
                        sx={{
                            width: '100%',
                            display: 'grid',
                            gridTemplateColumns: {
                                xs: 'repeat(2, minmax(0, 1fr))',
                                sm: 'repeat(2, minmax(0, 1fr))',
                                md: 'repeat(3, minmax(0, 1fr))',
                                lg: 'repeat(4, minmax(0, 1fr))',
                            },
                            gap: {
                                xs: 1,
                                sm: 2,
                                md: 2.5,
                            },
                            justifyItems: 'stretch',
                        }}
                    >
                        {members.map((member) => {
                            const instrumentText =
                                member.instrumentLabel ||
                                member.instrument ||
                                'Sin instrumento asignado';

                            return (
                                <Paper
                                    key={member.id}
                                    elevation={0}
                                    sx={{
                                        width: '100%',
                                        height: '100%',
                                        p: {
                                            xs: 1,
                                            sm: 1.5,
                                            md: 2,
                                        },
                                        borderRadius: {
                                            xs: 1.5,
                                            md: 2,
                                        },
                                        backgroundColor:
                                            'color-mix(in srgb, var(--color-card) 88%, var(--color-primary) 12%)',
                                        // border: '1px solid var(--color-border)',
                                        color: 'var(--color-text)',
                                        boxShadow: '0 12px 32px rgba(15, 23, 42, 0.08)',
                                        transition: 'transform 0.18s ease, box-shadow 0.18s ease',
                                        '&:hover': {
                                            transform: 'translateY(-4px)',
                                            boxShadow: '0 18px 42px rgba(15, 23, 42, 0.14)',
                                        },
                                    }}
                                >
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            textAlign: 'center',
                                            gap: {
                                                xs: 0.85,
                                                md: 1.25,
                                            },
                                            minWidth: 0,
                                        }}
                                    >
                                        <Avatar
                                            src={member.imageUrl || '/images/default-user.png'}
                                            alt={member.name}
                                            sx={{
                                                width: {
                                                    xs: 90,
                                                    sm: 116,
                                                    md: 160,
                                                },
                                                height: {
                                                    xs: 90,
                                                    sm: 116,
                                                    md: 160,
                                                },
                                                border: '3px solid color-mix(in srgb, var(--color-primary) 72%, white)',
                                                boxShadow: '0 10px 26px rgba(15, 23, 42, 0.16)',
                                            }}
                                        />

                                        <Box sx={{ width: '100%', minWidth: 0 }}>
                                            <Typography
                                                component="h2"
                                                sx={{
                                                    fontSize: {
                                                        xs: '0.86rem',
                                                        sm: '1.05rem',
                                                        md: '1.15rem',
                                                    },
                                                    fontWeight: 950,
                                                    lineHeight: 1.15,
                                                    overflowWrap: 'anywhere',
                                                }}
                                            >
                                                {member.name}
                                            </Typography>

                                            <Typography
                                                sx={{
                                                    mt: {
                                                        xs: 0.1,
                                                        md: 0.75,
                                                    },
                                                    fontSize: {
                                                        xs: '0.76rem',
                                                        sm: '0.86rem',
                                                        md: '0.95rem',
                                                    },
                                                    fontWeight: 800,
                                                    color: 'var(--color-secondary-text)',
                                                    overflowWrap: 'anywhere',
                                                }}
                                            >
                                                {instrumentText}
                                            </Typography>

                                            {member.voice && (
                                                <Typography
                                                    sx={{
                                                        mt: 0.1,
                                                        fontSize: {
                                                            xs: '0.76rem',
                                                            md: '0.9rem',
                                                        },
                                                        fontWeight: 800,
                                                        color: 'var(--color-primary)',
                                                    }}
                                                >
                                                    Voz
                                                </Typography>
                                            )}
                                        </Box>
                                    </Box>
                                </Paper>
                            );
                        })}
                    </Box>
                ) : (
                    <Typography
                        sx={{
                            py: 5,
                            textAlign: 'center',
                            fontWeight: 800,
                            color: 'var(--color-secondary-text)',
                        }}
                    >
                        No hay miembros por mostrar.
                    </Typography>
                )}
            </Paper>
        </Box>
    );
};

export default MemberSection;