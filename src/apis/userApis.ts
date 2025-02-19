import axios from "axios";
import Cookies from "js-cookie";

export const fetchUserProfile = async (accessToken: string) => {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_API_URL}/users/me`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (response.status === 200) {
      Cookies.set("username", response?.data?.data?.username);
    }

    return response.data.data;
  } catch (err) {
    console.log(err);
  }
};

export const updateUserProfile = async (
  accessToken: string,
  formState: any
) => {
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

export const fetchUsers = async (accessToken : string) => {
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

export const updateUserIntegrations = async (accessToken : string, integrations : any) => {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/user/integrations`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(integrations),
  });

  if (!response.ok) {
    throw new Error("Failed to update user integrations");
  }

  return response.json();
};
