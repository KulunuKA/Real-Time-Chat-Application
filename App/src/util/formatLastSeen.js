import { format, formatDistanceToNow, isToday, isYesterday } from "date-fns";

export function formatLastSeen(lastSeen) {
  const lastSeenDate = new Date(lastSeen);

  if (isToday(lastSeenDate)) {
    return `last seen at today ${format(lastSeenDate, "h:mm a")}`;
  }

  if (isYesterday(lastSeenDate)) {
    return `last seen at yesterday ${format(lastSeenDate, "h:mm a")}`;
  }

  return `last seen at ${format(lastSeenDate, "MMMM d, yyyy h:mm a")}`;
}

export function formatLastMessageTime(lastSeen) {
  if (!lastSeen) {
    return "";
  }
  const lastSeenDate = new Date(lastSeen);

  if (isToday(lastSeenDate)) {
    return `Today ${format(lastSeenDate, "h:mm a")}`;
  }

  if (isYesterday(lastSeenDate)) {
    return `Yesterday ${format(lastSeenDate, "h:mm a")}`;
  }

  return `${format(lastSeenDate, "MMMM d, yyyy h:mm a")}`;
}
