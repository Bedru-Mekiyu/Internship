import type { ReactNode } from 'react';
import {
  AnalyticsOutlined,
  BookOutlined,
  CalendarMonthOutlined,
  ChatBubbleOutlined,
  DashboardOutlined,
  DescriptionOutlined,
  EmojiEventsOutlined,
  FolderOutlined,
  GroupsOutlined,
  LayersOutlined,
  NotificationsOutlined,
  SettingsOutlined,
  VideoLibraryOutlined,
  PersonOutlined,
  HelpOutlined,
  TuneOutlined,
} from '@mui/icons-material';
import type { LearnSpaceRole } from '../types';

export type { LearnSpaceRole };

export interface NavigationItem {
  label: string;
  to: string;
  icon: ReactNode;
  roles: Array<LearnSpaceRole | 'guest'>;
  section?: 'overview' | 'learning' | 'content' | 'admin' | 'settings';
}

export interface NavigationSection {
  heading: string;
  items: NavigationItem[];
}

export interface PageProps {
  title: string;
  description: string;
  eyebrow?: string;
  actionLabel?: string;
  actionTo?: string;
  children?: ReactNode;
}

export const drawerWidth = 258;

// Base navigation items with proper role restrictions
export const baseNavigationItems: NavigationItem[] = [
  // Student navigation items
  { label: 'Dashboard', to: '/dashboard', icon: <DashboardOutlined />, roles: ['student'], section: 'overview' },
  { label: 'My Courses', to: '/courses', icon: <BookOutlined />, roles: ['student'], section: 'overview' },
  { label: 'Schedule', to: '/activity', icon: <CalendarMonthOutlined />, roles: ['student'], section: 'overview' },
  { label: 'Messages', to: '/messages', icon: <ChatBubbleOutlined />, roles: ['student'], section: 'overview' },
  { label: 'Achievements', to: '/certificates', icon: <EmojiEventsOutlined />, roles: ['student'], section: 'overview' },
  { label: 'Profile', to: '/profile-settings', icon: <PersonOutlined />, roles: ['student'], section: 'settings' },
  { label: 'Preferences', to: '/settings/notifications', icon: <TuneOutlined />, roles: ['student'], section: 'settings' },
  { label: 'Help Center', to: '/help', icon: <HelpOutlined />, roles: ['student'], section: 'settings' },

  // Instructor navigation items
  { label: 'Instructor Dashboard', to: '/instructor/dashboard', icon: <DashboardOutlined />, roles: ['instructor'], section: 'overview' },
  { label: 'My Courses', to: '/courses', icon: <BookOutlined />, roles: ['instructor'], section: 'overview' },
  { label: 'Create New Course', to: '/courses/new', icon: <LayersOutlined />, roles: ['instructor'], section: 'overview' },
  { label: 'Upload Lesson', to: '/lessons/upload', icon: <VideoLibraryOutlined />, roles: ['instructor'], section: 'overview' },
  { label: 'Activity', to: '/activity', icon: <AnalyticsOutlined />, roles: ['instructor'], section: 'learning' },
  { label: 'Messages', to: '/messages', icon: <ChatBubbleOutlined />, roles: ['instructor'], section: 'settings' },
  { label: 'Analytics', to: '/admin/analytics', icon: <AnalyticsOutlined />, roles: ['instructor'], section: 'overview' },
  { label: 'Media Library', to: '/cms/media', icon: <FolderOutlined />, roles: ['instructor'], section: 'content' },
  { label: 'Profile', to: '/profile-settings', icon: <PersonOutlined />, roles: ['instructor'], section: 'settings' },
  { label: 'Help Center', to: '/help', icon: <HelpOutlined />, roles: ['instructor'], section: 'settings' },

  // Admin navigation items
  { label: 'Admin Dashboard', to: '/admin/dashboard', icon: <DashboardOutlined />, roles: ['admin'], section: 'overview' },
  { label: 'Course Management', to: '/admin/courses', icon: <BookOutlined />, roles: ['admin'], section: 'admin' },
  { label: 'Analytics', to: '/admin/analytics', icon: <AnalyticsOutlined />, roles: ['admin'], section: 'overview' },
  { label: 'User Management', to: '/admin/users', icon: <GroupsOutlined />, roles: ['admin'], section: 'admin' },
  { label: 'Content Manager', to: '/cms/content', icon: <DescriptionOutlined />, roles: ['admin'], section: 'content' },
  { label: 'Page Builder', to: '/cms/pages', icon: <LayersOutlined />, roles: ['admin'], section: 'content' },
  { label: 'Media Library', to: '/cms/media', icon: <FolderOutlined />, roles: ['admin'], section: 'content' },
  { label: 'System Settings', to: '/admin/settings', icon: <SettingsOutlined />, roles: ['admin'], section: 'admin' },
  { label: 'Profile', to: '/profile-settings', icon: <PersonOutlined />, roles: ['admin'], section: 'settings' },
  { label: 'Notifications', to: '/notifications', icon: <NotificationsOutlined />, roles: ['admin'], section: 'admin' },
  { label: 'Messages', to: '/messages', icon: <ChatBubbleOutlined />, roles: ['admin'], section: 'admin' },

  // Content Manager navigation items
  { label: 'Content Manager', to: '/cms/content', icon: <DescriptionOutlined />, roles: ['content_manager'], section: 'overview' },
  { label: 'Page Builder', to: '/cms/pages', icon: <LayersOutlined />, roles: ['content_manager'], section: 'overview' },
  { label: 'Media Library', to: '/cms/media', icon: <FolderOutlined />, roles: ['content_manager'], section: 'overview' },
  { label: 'Notifications', to: '/notifications', icon: <NotificationsOutlined />, roles: ['content_manager'], section: 'settings' },
  { label: 'Messages', to: '/messages', icon: <ChatBubbleOutlined />, roles: ['content_manager'], section: 'settings' },
  { label: 'Profile', to: '/profile-settings', icon: <PersonOutlined />, roles: ['content_manager'], section: 'settings' },
];

export function isActiveRoute(currentPath: string, targetPath: string) {
  if (targetPath === '/') {
    return currentPath === '/';
  }

  return currentPath === targetPath || currentPath.startsWith(`${targetPath}/`);
}

export function getLandingRouteForRole(role?: LearnSpaceRole | null) {
  switch (role) {
    case 'admin':
      return '/admin/dashboard';
    case 'instructor':
      return '/instructor/dashboard';
    case 'content_manager':
      return '/cms/content';
    case 'student':
      return '/dashboard';
    default:
      return '/dashboard';
  }
}

/**
 * Get navigation items filtered by role and organized into sections
 */
export function getNavigationItemsForRole(role?: LearnSpaceRole | null): NavigationSection[] {
  if (!role) {
    return [];
  }

  const roleItems = baseNavigationItems.filter((item) => item.roles.includes(role));

  // Group items by section
  const sections: Record<string, NavigationItem[]> = {
    overview: [],
    learning: [],
    content: [],
    admin: [],
    settings: [],
  };

  roleItems.forEach((item) => {
    const section = item.section || 'overview';
    if (sections[section]) {
      sections[section].push(item);
    } else {
      sections.overview.push(item);
    }
  });

  // Build sections array with proper headings and order
  const sectionOrder: Array<{ key: string; heading: string }> = [
    { key: 'overview', heading: 'Overview' },
    { key: 'learning', heading: 'Learning' },
    { key: 'content', heading: 'Content' },
    { key: 'admin', heading: 'Administration' },
    { key: 'settings', heading: 'Settings' },
  ];

  return sectionOrder
    .filter(({ key }) => sections[key].length > 0)
    .map(({ key, heading }) => ({
      heading,
      items: sections[key],
    }));
}
