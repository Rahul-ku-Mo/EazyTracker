import axios from "axios";

export const fetchUserProfile = async (accessToken) => {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_API_URL}/users/me`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    return response.data.data;
  } catch (err) {
    console.log(err);
  }
};

export const updateUserProfile = async (accessToken, formState) => {
  try {
    const response = await axios.patch(
      `${import.meta.env.VITE_API_URL}/users/me`,
      formState,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    return response.data.data;
  } catch (e) {
    console.log(e);
  }
};

export const fetchUsers = async (accessToken) => {
  try {
    const response = await axios.get(`${import.meta.env.VITE_API_URL}/users`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return response.data.data;
  } catch (err) {
    console.log(err);
  }
};

export const updateUserIntegrations = async (accessToken, integrations) => {
  const response = await fetch(`${API_URL}/user/integrations`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
    body: JSON.stringify(integrations),
  });

  if (!response.ok) {
    throw new Error('Failed to update user integrations');
  }

  return response.json();
};