import api from "../lib/api";

export const fetchNotifications = async ({ limit = 20 } = {}) => {
  const response = await api.get("/api/notifications", {
    params: { limit },
  });

  return response.data;
};

export const updateNotificationStatus = async (notificationId, read) => {
  const response = await api.patch(
    `/api/notifications/${encodeURIComponent(notificationId)}`,
    { read },
  );

  return response.data;
};
