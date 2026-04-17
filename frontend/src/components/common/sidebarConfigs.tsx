import {
  BookOutlined,
  ChatBubbleOutlined,
  DashboardOutlined,
  DescriptionOutlined,
  ExploreOutlined,
  FolderOutlined,
  HelpOutlined,
  LayersOutlined,
  PersonOutlined,
  SettingsOutlined,
  VideoLibraryOutlined,
  WorkspacePremiumOutlined,
  AnalyticsOutlined,
  GroupsOutlined,
  NotificationsOutlined,
} from '@mui/icons-material';
import type { SidebarNavSection } from './AppSidebar';

/**
 * Sidebar configurations organized by user role.
 * Note: The primary navigation is now handled in learnSpaceNavigation.tsx
 * These configs are kept for backward compatibility and can be used with AppSidebar component.
 */

export const studentSidebarSections: SidebarNavSection[] = [
  {
    heading: 'Overview',
    items: [
      { label: 'Dashboard', icon: <DashboardOutlined />, to: '/dashboard' },
    ],
  },
  {
    heading: 'Learning',
    items: [
      { label: 'My Courses', icon: <BookOutlined />, to: '/courses' },
      { label: 'Explore Courses', icon: <ExploreOutlined />, to: '/courses/explore' },
      { label: 'My Certificates', icon: <WorkspacePremiumOutlined />, to: '/certificates' },
    ],
  },
  {
    heading: 'Settings',
    items: [
      { label: 'Messages', icon: <ChatBubbleOutlined />, to: '/messages' },
      { label: 'Profile', icon: <PersonOutlined />, to: '/profile-settings' },
      { label: 'Help Center', icon: <HelpOutlined />, to: '/help-center' },
    ],
  },
];

export const instructorSidebarSections: SidebarNavSection[] = [
  {
    heading: 'Overview',
    items: [
      { label: 'Instructor Dashboard', icon: <DashboardOutlined />, to: '/instructor/dashboard' },
      { label: 'My Courses', icon: <BookOutlined />, to: '/courses' },
      { label: 'Create New Course', icon: <LayersOutlined />, to: '/courses/new' },
      { label: 'Upload Lesson', icon: <VideoLibraryOutlined />, to: '/lessons/upload' },
      { label: 'Analytics', icon: <AnalyticsOutlined />, to: '/admin/analytics' },
    ],
  },
  {
    heading: 'Content',
    items: [
      { label: 'Media Library', icon: <FolderOutlined />, to: '/cms/media' },
    ],
  },
  {
    heading: 'Settings',
    items: [
      { label: 'Messages', icon: <ChatBubbleOutlined />, to: '/messages' },
      { label: 'Profile', icon: <PersonOutlined />, to: '/profile-settings' },
      { label: 'Help Center', icon: <HelpOutlined />, to: '/help-center' },
    ],
  },
];

export const adminSidebarSections: SidebarNavSection[] = [
  {
    heading: 'Overview',
    items: [
      { label: 'Admin Dashboard', icon: <DashboardOutlined />, to: '/admin/dashboard' },
      { label: 'Analytics', icon: <AnalyticsOutlined />, to: '/admin/analytics' },
    ],
  },
  {
    heading: 'Content',
    items: [
      { label: 'Content Manager', icon: <DescriptionOutlined />, to: '/cms/content' },
      { label: 'Page Builder', icon: <LayersOutlined />, to: '/cms/pages' },
      { label: 'Media Library', icon: <FolderOutlined />, to: '/cms/media' },
    ],
  },
  {
    heading: 'Administration',
    items: [
      { label: 'User Management', icon: <GroupsOutlined />, to: '/admin/users' },
      { label: 'Notifications', icon: <NotificationsOutlined />, to: '/notifications' },
      { label: 'System Settings', icon: <SettingsOutlined />, to: '/admin/settings' },
    ],
  },
];

export const contentManagerSidebarSections: SidebarNavSection[] = [
  {
    heading: 'Overview',
    items: [
      { label: 'Content Manager', icon: <DescriptionOutlined />, to: '/cms/content' },
      { label: 'Page Builder', icon: <LayersOutlined />, to: '/cms/pages' },
      { label: 'Media Library', icon: <FolderOutlined />, to: '/cms/media' },
    ],
  },
  {
    heading: 'Settings',
    items: [
      { label: 'Notifications', icon: <NotificationsOutlined />, to: '/notifications' },
    ],
  },
];
