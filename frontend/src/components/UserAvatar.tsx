import React, { useState } from 'react';
import './UserAvatar.css';

interface UserAvatarProps {
  avatarUrl?: string | null;
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  avatarUrl,
  name,
  size = 'md',
  className = '',
}) => {
  const [imageError, setImageError] = useState(false);

  const getInitials = (fullName?: string): string => {
    if (!fullName || !fullName.trim()) return 'DF';
    const parts = fullName.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const getAvatarSrc = (): string | null => {
    if (!avatarUrl || imageError) return null;
    if (avatarUrl.startsWith('/api/')) {
      const token = localStorage.getItem('dayflow_token') || sessionStorage.getItem('dayflow_token');
      const separator = avatarUrl.includes('?') ? '&' : '?';
      return token ? `${avatarUrl}${separator}t=${encodeURIComponent(token)}` : avatarUrl;
    }
    return avatarUrl;
  };

  const resolvedSrc = getAvatarSrc();

  if (resolvedSrc) {
    return (
      <img
        src={resolvedSrc}
        alt={name || 'User avatar'}
        className={`user-avatar-img avatar-${size} ${className}`}
        onError={() => setImageError(true)}
      />
    );
  }

  return (
    <div
      className={`user-avatar-fallback avatar-${size} ${className}`}
      aria-label={name || 'Default user avatar'}
    >
      <span className="avatar-initials">{getInitials(name)}</span>
    </div>
  );
};

export default UserAvatar;
