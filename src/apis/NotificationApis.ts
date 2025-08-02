import axios from "axios";

export const createInviteNotification = async (
  accessToken: string,
  message: string,
  receiverId: string
) => {
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/notifications/invite`,
      {
        receiverId,
        message,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    if (response.status === 201) return response.data.data;
  } catch (err) {
    console.log('Error creating invite notification:', err);
  }
};

export const fetchNotifications = async (accessToken: string) => {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_API_URL}/notifications`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    if (response.status === 200) return response.data.data.notifications || [];
  } catch (err) {
    console.log('Error fetching notifications:', err);
    return [];
  }
};

export const markNotificationAsRead = async (
  accessToken: string,
  notificationId: number
) => {
  try {
    const response = await axios.put(
      `${import.meta.env.VITE_API_URL}/notifications/${notificationId}/read`,
      {},
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    if (response.status === 200) return response.data.data;
  } catch (err) {
    console.log('Error marking notification as read:', err);
  }
};

export const markAllNotificationsAsRead = async (accessToken: string) => {
  try {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      console.error('User ID not found in localStorage');
      return;
    }

    const response = await axios.put(
      `${import.meta.env.VITE_API_URL}/notifications/${userId}/read-all`,
      {},
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    if (response.status === 200) return response.data;
  } catch (err) {
    console.log('Error marking all notifications as read:', err);
  }
};

export const getUnreadNotificationCount = async (accessToken: string) => {
  try {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      console.error('User ID not found in localStorage');
      return 0;
    }

    const response = await axios.get(
      `${import.meta.env.VITE_API_URL}/notifications/${userId}/count`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    if (response.status === 200) return response.data.data.count || 0;
  } catch (err) {
    console.log('Error getting unread count:', err);
    return 0;
  }
};

export const deleteNotification = async (
  accessToken: string,
  notificationId: number
) => {
  try {
    const response = await axios.delete(
      `${import.meta.env.VITE_API_URL}/notifications/${notificationId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    if (response.status === 200) return response.data;
  } catch (err) {
    console.log('Error deleting notification:', err);
  }
};
