// src/App.tsx

import { Routes, Route } from 'react-router-dom';

// Layouts
import PublicLayout from './layouts/public/PublicLayout';
import AdminLayout from './layouts/admin/AdminLayout';

// Context & Styles
import { PublicGlobalProvider } from './context/PublicGlobalContext';
import { PrivateRoute } from './components/PrivateRoute';
import { PasswordChangeRoute } from './components/auth/PasswordChangeRoute';
import './assets/styles/global.scss';

// --- Public Pages (English Filenames) ---
import { HomePage } from './pages/public/Home';
import { Contact } from './pages/public/Contact';
import { Members as MembersPublic } from './pages/public/Members';
import { Songs } from './pages/public/Songs';
import { AboutUs } from './pages/public/AboutUs';

// --- Auth Pages (English Filenames) ---
import { Login } from './pages/auth/Login';
import { ChangePassword } from './pages/auth/ChangePassword';

// --- Admin Pages (English Filenames) ---
import { Dashboard } from './pages/admin/Dashboard';

// --- Choirs ---
import { ChoirList } from './pages/admin/choir/ChoirList';
import { ChoirForm } from './pages/admin/choir/ChoirForm';
import { AdminChoirDetail } from './components/choirs/AdminChoirDetail';
import { ChoirUserForm } from './components/choirs/ChoirUserForm';
import { ChoirUserEditForm } from './components/choirs/ChoirUserEditForm';

// Users
import { UsersList } from './pages/admin/user/UsersList';
import { UserForm } from './pages/admin/user/UserForm';

// Songs (Cantos)
import { SongList } from './pages/admin/songs/SongList';
import { Song } from './pages/admin/songs/Song';
import { NewSong } from './pages/admin/songs/NewSong';
import { EditSong } from './pages/admin/songs/EditSong';

// Song Types (Tipos Canto)
import { SongTypeList } from './pages/admin/songs/SongTypeList';
import { EditSongType } from './pages/admin/songs/EditSongType';
import { NewSongType } from './pages/admin/songs/NewSongType';

// Gallery
import { GalleryList } from './pages/admin/gallery/GalleryList';
import { Media } from './pages/admin/gallery/Media';
import { NewMedia } from './pages/admin/gallery/NewMedia';
import { EditMedia } from './pages/admin/gallery/EditMedia';

// Themes
import { ThemeList } from './pages/admin/theme/ThemeList';
import { NewTheme } from './pages/admin/theme/NewTheme';
import { EditTheme } from './pages/admin/theme/EditTheme';

// Members (Choir Members)
import { Members } from './pages/admin/members/Members';
import { NewMember } from './pages/admin/members/NewMember';
import { EditMember } from './pages/admin/members/EditMember';

// Blog
import { BlogList } from './pages/admin/blog/BlogList';
import { NewBlogPost } from './pages/admin/blog/NewBlogPost';
import { EditBlogPost } from './pages/admin/blog/EditBlogPost';
import { BlogPostsView } from './pages/admin/blog/BlogPostsView';
import { BlogPostSingleView } from './pages/admin/blog/BlogPostSingleView';

// Announcements (Avisos)
import { AnnouncementList } from './pages/admin/announcements/AnnouncementList';
import { NewAnnouncement } from './pages/admin/announcements/NewAnnouncement';
import { EditAnnouncement } from './pages/admin/announcements/EditAnnouncement';

// Settings & Logs
import { WebsiteSettings } from './pages/admin/settings/WebsiteSettings';
import { MyProfilePage } from './pages/admin/user/MyProfilePage';
import { LogsPage } from './pages/admin/log/Logs';
import { ChatGroup } from './pages/admin/chat/ChatGroup';
import { EditProfile } from './pages/admin/user/EditProfile';
import { PublicTestDashboard } from './pages/admin/log/PublicTestDashboard';

// Instruments
import { InstrumentsList } from './pages/admin/instruments/InstrumentsList';
import { InstrumentForm } from './pages/admin/instruments/InstrumentForm';

function App() {
    return (
        <div>
            <Routes>
                <Route
                    path="/"
                    element={
                        <PublicGlobalProvider>
                            <PublicLayout />
                        </PublicGlobalProvider>
                    }
                >
                    <Route index element={<HomePage />} />
                    <Route path="contact" element={<Contact />} />
                    <Route path="members" element={<MembersPublic />} />
                    <Route path="songs" element={<Songs />} />
                    <Route path="about" element={<AboutUs />} />
                </Route>

                <Route
                    path="/:choirKey"
                    element={
                        <PublicGlobalProvider>
                            <PublicLayout />
                        </PublicGlobalProvider>
                    }
                >
                    <Route index element={<HomePage />} />
                    <Route path="contact" element={<Contact />} />
                    <Route path="members" element={<MembersPublic />} />
                    <Route path="songs" element={<Songs />} />
                    <Route path="about" element={<AboutUs />} />
                </Route>

                {/* --- Admin Section --- */}
                <Route
                    path="/admin"
                    element={
                        <PrivateRoute>
                            <AdminLayout />
                        </PrivateRoute>
                    }
                >
                    <Route index element={<Dashboard />} />

                    {/* Choirs */}
                    <Route path="choirs" element={<ChoirList />} />
                    <Route path="choirs/new" element={<ChoirForm />} />
                    <Route path="choirs/edit/:id" element={<ChoirForm />} />
                    <Route path="choirs/view/:id" element={<AdminChoirDetail />} />
                    <Route path="choirs/view/:choirId/users/new" element={<ChoirUserForm />} />
                    <Route path="choirs/view/:choirId/users/edit/:userId" element={<ChoirUserEditForm />} />

                    {/* Users */}
                    <Route path="users" element={<UsersList />} />
                    <Route path="users/new" element={<UserForm />} />
                    <Route path="users/edit/:id" element={<UserForm />} />

                    {/* Songs */}
                    <Route path="songs" element={<SongList />} />
                    <Route path="song/:id" element={<Song />} />
                    <Route path="songs/new" element={<NewSong />} />
                    <Route path="songs/edit/:id" element={<EditSong />} />

                    {/* Song Types */}
                    <Route path="song-types" element={<SongTypeList />} />
                    <Route path="song-types/new" element={<NewSongType />} />
                    <Route path="song-types/edit/:id" element={<EditSongType />} />

                    {/* Gallery */}
                    <Route path="gallery" element={<GalleryList />} />
                    <Route path="gallery/media/:id" element={<Media />} />
                    <Route path="gallery/new" element={<NewMedia />} />
                    <Route path="gallery/edit/:id" element={<EditMedia />} />

                    {/* Themes */}
                    <Route path="themes" element={<ThemeList />} />
                    <Route path="themes/new" element={<NewTheme />} />
                    <Route path="themes/edit/:id" element={<EditTheme />} />

                    {/* Members */}
                    <Route path="members" element={<Members />} />
                    <Route path="members/new" element={<NewMember />} />
                    <Route path="members/edit/:id" element={<EditMember />} />

                    {/* Blog */}
                    <Route path="blog" element={<BlogList />} />
                    <Route path="blog/view" element={<BlogPostsView />} />
                    <Route path="blog/view/:id" element={<BlogPostSingleView />} />
                    <Route path="blog/new" element={<NewBlogPost />} />
                    <Route path="blog/edit/:id" element={<EditBlogPost />} />

                    {/* Announcements */}
                    <Route path="announcements" element={<AnnouncementList />} />
                    <Route path="announcements/new" element={<NewAnnouncement />} />
                    <Route path="announcements/edit/:id" element={<EditAnnouncement />} />

                    {/* Instruments (fixed paths) */}
                    <Route path="instruments" element={<InstrumentsList />} />
                    <Route path="instruments/new" element={<InstrumentForm />} />
                    <Route path="instruments/edit/:id" element={<InstrumentForm />} />

                    {/* Settings & Tools */}
                    <Route path="settings" element={<WebsiteSettings />} />
                    <Route path="profile" element={<MyProfilePage />} />
                    <Route path="edit-profile" element={<EditProfile />} />
                    <Route path="logs" element={<LogsPage />} />
                    <Route path="chat-group" element={<ChatGroup />} />
                    <Route path="public-test" element={<PublicTestDashboard />} />
                </Route>

                {/* --- Authentication --- */}
                <Route path="/auth/login" element={<Login />} />
                <Route
                    path="/auth/change-password"
                    element={
                        <PasswordChangeRoute>
                            <ChangePassword />
                        </PasswordChangeRoute>
                    }
                />
            </Routes>
        </div>
    );
}

export default App;
