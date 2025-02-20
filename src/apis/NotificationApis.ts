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
