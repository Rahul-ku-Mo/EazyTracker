import axios from "axios";

export const fetchOrganization = async (accessToken, organizationId) => {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_API_URL}/organizations/${organizationId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    return response.data.data;
  } catch (error) {
    console.log(error);
  }
};

export const fetchOrganizationsAsLead = async (accessToken) => {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_API_URL}/organizations/leads`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    return response.data.data;
  } catch (error) {
    console.log(error);
  }
};

export const fetchOrganizationsAsMember = async (accessToken) => {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_API_URL}/organizations/members`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    return response.data.data;
  } catch (error) {
    console.log(error);
  }
};

export const createOrganization = async (accessToken, organization) => {
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/organizations`,
      { name: organization.name },
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
