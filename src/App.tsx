// src/App.tsx

import type { JSX } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import AdminLayout from './layouts/admin/AdminLayout';
import { PrivateRoute } from './components/PrivateRoute';
import { PasswordChangeRoute } from './components/auth/PasswordChangeRoute';
import { RoleGuard } from './components/auth/RoleGuard';
import { TenantContextGuard } from './components/auth/TenantContextGuard';
import { PlatformContextGuard } from './components/auth/PlatformContextGuard';
import type { PermissionKey } from './auth/permissions';
import './assets/styles/global.scss';
import { HomePage } from './pages/public/Home';
import { BlogPostsView as PublicBlogPostsView } from './pages/public/BlogPostsView';
import { BlogPostView as PublicBlogPostView } from './pages/public/BlogPostView';
import { PublicRootRoute } from './routing/PublicRootRoute';
import { PublicChoirRoute } from './routing/PublicChoirRoute';
import { Contact } from './pages/public/Contact';
import { Members as MembersPublic } from './pages/public/Members';
import { Songs } from './pages/public/Songs';
import { AboutUs } from './pages/public/AboutUs';
import { Login } from './pages/auth/Login';
import { ChangePassword } from './pages/auth/ChangePassword';
import { SessionExpired } from './pages/auth/SessionExpired';
import { AdminEntryRoute } from './components/auth/AdminEntryRoute';
import { ChoirList } from './pages/admin/choir/ChoirList';
import { ChoirForm } from './pages/admin/choir/ChoirForm';
import { AdminChoirDetail } from './components/choirs/AdminChoirDetail';
import { UsersList } from './pages/admin/user/UsersList';
import { UserForm } from './pages/admin/user/UserForm';
import { SongList } from './pages/admin/songs/SongList';
import { Song } from './pages/admin/songs/Song';
import { NewSong } from './pages/admin/songs/NewSong';
import { EditSong } from './pages/admin/songs/EditSong';
import { SongTypeList } from './pages/admin/songs/SongTypeList';
import { EditSongType } from './pages/admin/songs/EditSongType';
import { NewSongType } from './pages/admin/songs/NewSongType';
import { GalleryList } from './pages/admin/gallery/GalleryList';
import { Media } from './pages/admin/gallery/Media';
import { NewMedia } from './pages/admin/gallery/NewMedia';
import { EditMedia } from './pages/admin/gallery/EditMedia';
import { ThemeList } from './pages/admin/theme/ThemeList';
import { NewTheme } from './pages/admin/theme/NewTheme';
import { EditTheme } from './pages/admin/theme/EditTheme';
import { Members } from './pages/admin/members/Members';
import { NewMember } from './pages/admin/members/NewMember';
import { EditMember } from './pages/admin/members/EditMember';
import { BlogList } from './pages/admin/blog/BlogList';
import { NewBlogPost } from './pages/admin/blog/NewBlogPost';
import { EditBlogPost } from './pages/admin/blog/EditBlogPost';
import { BlogPostsView } from './pages/admin/blog/BlogPostsView';
import { BlogPostSingleView } from './pages/admin/blog/BlogPostSingleView';
import { AnnouncementList } from './pages/admin/announcements/AnnouncementList';
import { NewAnnouncement } from './pages/admin/announcements/NewAnnouncement';
import { EditAnnouncement } from './pages/admin/announcements/EditAnnouncement';
import { WebsiteSettings } from './pages/admin/settings/WebsiteSettings';
import { MyProfilePage } from './pages/admin/user/MyProfilePage';
import { LogsPage } from './pages/admin/log/Logs';
import { ChatGroup } from './pages/admin/chat/ChatGroup';
import { EditProfile } from './pages/admin/user/EditProfile';
import { PublicTestDashboard } from './pages/admin/log/PublicTestDashboard';
import { InstrumentsList } from './pages/admin/instruments/InstrumentsList';
import { InstrumentForm } from './pages/admin/instruments/InstrumentForm';

const requirePermission = (element: JSX.Element, permission: PermissionKey): JSX.Element => (
    <RoleGuard permission={permission}>{element}</RoleGuard>
);

const requireTenant = (element: JSX.Element, permission?: PermissionKey): JSX.Element => (
    <TenantContextGuard>
        {permission ? requirePermission(element, permission) : element}
    </TenantContextGuard>
);

const requirePlatform = (element: JSX.Element, permission: PermissionKey): JSX.Element => (
    <PlatformContextGuard>
        {requirePermission(element, permission)}
    </PlatformContextGuard>
);

function App() {
    return (
        <Routes>
            <Route path="/" element={<PublicRootRoute />} />

            <Route path="/:choirCode" element={<PublicChoirRoute />}>
                <Route index element={<HomePage />} />
                <Route path="contact" element={<Contact />} />
                <Route path="members" element={<MembersPublic />} />
                <Route path="songs" element={<Songs />} />
                <Route path="about" element={<AboutUs />} />
                <Route path="blog" element={<PublicBlogPostsView />} />
                <Route path="blog/:postId" element={<PublicBlogPostView />} />
            </Route>

            <Route
                path="/admin"
                element={(
                    <PrivateRoute>
                        <AdminLayout />
                    </PrivateRoute>
                )}
            >
                <Route index element={<AdminEntryRoute />} />

                <Route path="choirs" element={requirePlatform(<ChoirList />, 'canManageChoirs')} />
                <Route path="choirs/new" element={requirePlatform(<ChoirForm />, 'canManageChoirs')} />
                <Route path="choirs/edit/:id" element={requirePlatform(<ChoirForm />, 'canManageChoirs')} />
                <Route path="choirs/view/:id" element={requirePlatform(<AdminChoirDetail />, 'canManageChoirs')} />

                <Route path="users" element={requireTenant(<UsersList />, 'canManageUsers')} />
                <Route path="users/new" element={requireTenant(<UserForm />, 'canManageUsers')} />
                <Route path="users/edit/:id" element={requireTenant(<UserForm />, 'canManageUsers')} />

                <Route path="songs" element={requireTenant(<SongList />)} />
                <Route path="song/:id" element={requireTenant(<Song />)} />
                <Route path="songs/new" element={requireTenant(<NewSong />, 'canManageContent')} />
                <Route path="songs/edit/:id" element={requireTenant(<EditSong />, 'canManageContent')} />

                <Route path="song-types" element={requireTenant(<SongTypeList />, 'canManageSongTypes')} />
                <Route path="song-types/new" element={requireTenant(<NewSongType />, 'canManageSongTypes')} />
                <Route path="song-types/edit/:id" element={requireTenant(<EditSongType />, 'canManageSongTypes')} />

                <Route path="gallery" element={requireTenant(<GalleryList />)} />
                <Route path="gallery/media/:id" element={requireTenant(<Media />)} />
                <Route path="gallery/new" element={requireTenant(<NewMedia />, 'canManageContent')} />
                <Route path="gallery/edit/:id" element={requireTenant(<EditMedia />, 'canManageContent')} />

                <Route path="themes" element={requireTenant(<ThemeList />, 'canManageThemes')} />
                <Route path="themes/new" element={requireTenant(<NewTheme />, 'canManageThemes')} />
                <Route path="themes/edit/:id" element={requireTenant(<EditTheme />, 'canManageThemes')} />

                <Route path="members" element={requireTenant(<Members />, 'canManageMembers')} />
                <Route path="members/new" element={requireTenant(<NewMember />, 'canManageMembers')} />
                <Route path="members/edit/:id" element={requireTenant(<EditMember />, 'canManageMembers')} />

                <Route path="blog" element={requireTenant(<BlogList />, 'canManageContent')} />
                <Route path="blog/view" element={requireTenant(<BlogPostsView />)} />
                <Route path="blog/view/:id" element={requireTenant(<BlogPostSingleView />)} />
                <Route path="blog/new" element={requireTenant(<NewBlogPost />, 'canManageContent')} />
                <Route path="blog/edit/:id" element={requireTenant(<EditBlogPost />, 'canManageContent')} />

                <Route path="announcements" element={requireTenant(<AnnouncementList />, 'canManageContent')} />
                <Route path="announcements/new" element={requireTenant(<NewAnnouncement />, 'canManageContent')} />
                <Route path="announcements/edit/:id" element={requireTenant(<EditAnnouncement />, 'canManageContent')} />

                <Route path="instruments" element={requireTenant(<InstrumentsList />, 'canManageInstruments')} />
                <Route path="instruments/new" element={requireTenant(<InstrumentForm />, 'canManageInstruments')} />
                <Route path="instruments/edit/:id" element={requireTenant(<InstrumentForm />, 'canManageInstruments')} />

                <Route path="settings" element={requireTenant(<WebsiteSettings />, 'canManageSettings')} />
                <Route path="profile" element={<MyProfilePage />} />
                <Route path="edit-profile" element={<EditProfile />} />
                <Route path="logs" element={requireTenant(<LogsPage />, 'canViewTenantLogs')} />
                <Route path="chat-group" element={requireTenant(<ChatGroup />)} />
                <Route path="public-test" element={requirePlatform(<PublicTestDashboard />, 'canViewPlatformLogs')} />
                <Route path="*" element={<Navigate to="/admin" replace />} />
            </Route>

            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/session-expired" element={<SessionExpired />} />
            <Route
                path="/auth/change-password"
                element={(
                    <PasswordChangeRoute>
                        <ChangePassword />
                    </PasswordChangeRoute>
                )}
            />
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

export default App;
