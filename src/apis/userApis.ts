import axios from "axios";
import Cookies from "js-cookie";

interface UserProfile {
  username: string;
  email: string;
  name?: string;
  phoneNumber?: string;
  imageUrl?: string;
  state?: string;
  address?: string;
  zipCode?: string;
  company?: string;
  role?: string;
  department?: string;
  [key: string]: any;
}

interface UserIntegrations {
  discord: boolean;
  slack: boolean;
  mailchimp: boolean;
  github: boolean;
  googleDrive: boolean;
}

export const fetchUserProfile = async (accessToken: string): Promise<UserProfile | undefined> => {
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
    return undefined;
  }
};

export const updateUserProfile = async (
  accessToken: string,
  formState: Partial<UserProfile>
): Promise<UserProfile | undefined> => {
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
    return undefined;
  }
};

export const fetchUsers = async (accessToken: string): Promise<UserProfile[] | undefined> => {
  try {
    const response = await axios.get(`${import.meta.env.VITE_API_URL}/users`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return response.data.data;
  } catch (err) {
    console.log(err);
    return undefined;
  }
};

export const updateUserIntegrations = async (
  accessToken: string, 
  integrations: UserIntegrations
): Promise<UserIntegrations> => {
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
