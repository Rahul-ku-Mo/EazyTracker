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
    console.log(err);
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
    if (response.status === 200) return response.data.data;
  } catch (err) {
    console.log(err);
  }
};

export const markNotificationAsRead = async (
  accessToken: string,
  notificationId: number
) => {
  try {
    const response = await axios.patch(
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
    console.log(err);
  }
};

export const markAllNotificationsAsRead = async (accessToken: string) => {
  try {
    const response = await axios.patch(
      `${import.meta.env.VITE_API_URL}/notifications/mark-all-read`,
      {},
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    if (response.status === 200) return response.data;
  } catch (err) {
    console.log(err);
  }
};
