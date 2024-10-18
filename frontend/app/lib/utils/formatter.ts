const postDateFormat = (dateString: string): string => {
  const date = new Date(dateString);
  const diff = (Date.now() - date.getTime()) / 1000;

  // Less than 1 minute ago
  if (diff < 60) return `${Math.floor(diff)}s`;

  // Less than 1 hour ago
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;

  // Less than 1 day ago
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;

  // Less than 1 week ago
  if (diff < 604800) return `${Math.floor(diff / 86400)}d`;

  // Otherwise, return the full date and time
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
};

export { postDateFormat };
