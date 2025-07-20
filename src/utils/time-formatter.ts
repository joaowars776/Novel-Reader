import type { TimeFormat } from '../types';

export const formatDuration = (milliseconds: number, format: TimeFormat = 'auto'): string => {
  if (milliseconds === 0) return '0 minutes';

  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  switch (format) {
    case 'minutes':
      return `${Math.ceil(milliseconds / (1000 * 60))} minutes`;
    
    case 'hours':
      const totalHours = milliseconds / (1000 * 60 * 60);
      return `${totalHours.toFixed(1)} hours`;
    
    case 'detailed':
      const parts: string[] = [];
      if (days > 0) parts.push(`${days} day${days !== 1 ? 's' : ''}`);
      if (hours % 24 > 0) parts.push(`${hours % 24} hour${hours % 24 !== 1 ? 's' : ''}`);
      if (minutes % 60 > 0) parts.push(`${minutes % 60} minute${minutes % 60 !== 1 ? 's' : ''}`);
      return parts.join(', ') || '0 minutes';
    
    case 'auto':
    default:
      if (days > 0) {
        return `${days} day${days !== 1 ? 's' : ''} ${hours % 24}h`;
      } else if (hours > 0) {
        return `${hours} hour${hours !== 1 ? 's' : ''} ${minutes % 60}m`;
      } else if (minutes > 0) {
        return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
      } else {
        return `${seconds} second${seconds !== 1 ? 's' : ''}`;
      }
  }
};

export const formatShortDuration = (milliseconds: number): string => {
  const minutes = Math.floor(milliseconds / (1000 * 60));
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days}d ${hours % 24}h`;
  } else if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  } else {
    return `${minutes}m`;
  }
};

export const formatTimeRange = (startTime: Date, endTime: Date): string => {
  const start = startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const end = endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
  const startDate = startTime.toDateString();
  const endDate = endTime.toDateString();
  
  if (startDate === endDate) {
    return `${start} - ${end}`;
  } else {
    return `${startTime.toLocaleDateString()} ${start} - ${endTime.toLocaleDateString()} ${end}`;
  }
};

export const formatRelativeTime = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 1) {
    return 'Just now';
  } else if (diffMinutes < 60) {
    return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  } else if (diffDays < 7) {
    return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  } else {
    return date.toLocaleDateString();
  }
};

export const getReadingTimeMessage = (totalTime: number): string => {
  const hours = Math.floor(totalTime / (1000 * 60 * 60));
  const minutes = Math.floor((totalTime % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 0) {
    return `You've spent ${hours} hour${hours !== 1 ? 's' : ''} ${minutes > 0 ? `${minutes} minute${minutes !== 1 ? 's' : ''}` : ''} reading this book`;
  } else if (minutes > 0) {
    return `You've spent ${minutes} minute${minutes !== 1 ? 's' : ''} reading this book`;
  } else {
    return 'You haven\'t spent much time reading this book yet';
  }
};
