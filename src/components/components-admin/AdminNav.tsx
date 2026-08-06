// src/components/components-admin/AdminNav.tsx

import { Container, Nav, Navbar } from 'react-bootstrap';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const AdminNav = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const {
        choir,
        targetChoir,
        hasTenantContext,
        isSuperAdmin,
        canManageUsers,
        canManageContent,
        canManageInstruments,
        canManageMembers,
        canManageSettings,
        canManageSongTypes,
        canManageThemes,
        canViewTenantLogs,
        returnToPlatform,
        user,
    } = useAuth();

    if (!user) {
        return null;
    }

    const effectiveChoir = targetChoir ?? choir;
    const choirCode = effectiveChoir?.code ?? user.choirCode ?? '';

    const isActive = (path: string): boolean => (
        path === '/admin'
            ? location.pathname === '/admin'
            : location.pathname === path || location.pathname.startsWith(`${path}/`)
    );

    const handleReturnToPlatform = (): void => {
        returnToPlatform();
        navigate('/admin/choirs', { replace: true });
    };

    return (
        <Navbar expand="lg" className="layout-nav">
            <Container fluid className="justify-content-center">
                <Navbar.Toggle aria-controls="admin-nav-collapse" />
                <Navbar.Collapse id="admin-nav-collapse" className="justify-content-center">
                    <Nav className="nav w-100 nav-pills nav-fill align-items-center justify-content-center admin-nav-links-wrapper flex-wrap">
                        {isSuperAdmin && (
                            <Nav.Item>
                                <Nav.Link
                                    as={Link}
                                    to="/admin/choirs"
                                    active={isActive('/admin/choirs')}
                                    className="admin-nav-link"
                                >
                                    Coros
                                </Nav.Link>
                            </Nav.Item>
                        )}

                        {hasTenantContext && (
                            <>
                                <Nav.Item>
                                    <Nav.Link as={Link} to="/admin" active={isActive('/admin')} className="admin-nav-link">
                                        Inicio
                                    </Nav.Link>
                                </Nav.Item>
                                <Nav.Item>
                                    <Nav.Link as={Link} to="/admin/songs" active={isActive('/admin/songs')} className="admin-nav-link">
                                        Cantos
                                    </Nav.Link>
                                </Nav.Item>
                                <Nav.Item>
                                    <Nav.Link as={Link} to="/admin/gallery" active={isActive('/admin/gallery')} className="admin-nav-link">
                                        Galería
                                    </Nav.Link>
                                </Nav.Item>
                                <Nav.Item>
                                    <Nav.Link as={Link} to="/admin/blog/view" active={isActive('/admin/blog/view')} className="admin-nav-link">
                                        Blog
                                    </Nav.Link>
                                </Nav.Item>
                                {canManageUsers && (
                                    <Nav.Item>
                                        <Nav.Link as={Link} to="/admin/users" active={isActive('/admin/users')} className="admin-nav-link">
                                            Usuarios
                                        </Nav.Link>
                                    </Nav.Item>
                                )}
                                {canViewTenantLogs && (
                                    <Nav.Item>
                                        <Nav.Link as={Link} to="/admin/logs" active={isActive('/admin/logs')} className="admin-nav-link">
                                            Logs
                                        </Nav.Link>
                                    </Nav.Item>
                                )}
                                {canManageInstruments && (
                                    <Nav.Item>
                                        <Nav.Link as={Link} to="/admin/instruments" active={isActive('/admin/instruments')} className="admin-nav-link">
                                            Instrumentos
                                        </Nav.Link>
                                    </Nav.Item>
                                )}
                                {canManageSongTypes && (
                                    <Nav.Item>
                                        <Nav.Link as={Link} to="/admin/song-types" active={isActive('/admin/song-types')} className="admin-nav-link">
                                            Tipos de cantos
                                        </Nav.Link>
                                    </Nav.Item>
                                )}
                                {canManageMembers && (
                                    <Nav.Item>
                                        <Nav.Link as={Link} to="/admin/members" active={isActive('/admin/members')} className="admin-nav-link">
                                            Miembros
                                        </Nav.Link>
                                    </Nav.Item>
                                )}
                                {canManageContent && (
                                    <>
                                        <Nav.Item>
                                            <Nav.Link as={Link} to="/admin/announcements" active={isActive('/admin/announcements')} className="admin-nav-link">
                                                Avisos
                                            </Nav.Link>
                                        </Nav.Item>
                                        <Nav.Item>
                                            <Nav.Link as={Link} to="/admin/blog" active={isActive('/admin/blog')} className="admin-nav-link">
                                                Admin Blogs
                                            </Nav.Link>
                                        </Nav.Item>
                                    </>
                                )}
                                {canManageSettings && (
                                    <Nav.Item>
                                        <Nav.Link as={Link} to="/admin/settings" active={isActive('/admin/settings')} className="admin-nav-link">
                                            Ajustes
                                        </Nav.Link>
                                    </Nav.Item>
                                )}
                                {canManageThemes && (
                                    <Nav.Item>
                                        <Nav.Link as={Link} to="/admin/themes" active={isActive('/admin/themes')} className="admin-nav-link">
                                            Temas
                                        </Nav.Link>
                                    </Nav.Item>
                                )}
                                {choirCode && (
                                    <Nav.Item>
                                        <Nav.Link as={Link} to={`/${choirCode}?fromAdmin=true`} className="admin-nav-link">
                                            Página Pública
                                        </Nav.Link>
                                    </Nav.Item>
                                )}
                            </>
                        )}

                        {isSuperAdmin && hasTenantContext && (
                            <Nav.Item>
                                <Nav.Link as="button" onClick={handleReturnToPlatform} className="admin-nav-link">
                                    Volver a consola
                                </Nav.Link>
                            </Nav.Item>
                        )}
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};
