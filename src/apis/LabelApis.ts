import axios from "axios";

export const fetchLabels = async (accessToken, cardId) => {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_API_URL}/labels?cardId=${cardId}`,
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

export const createLabel = async (accessToken, data, cardId) => {
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/labels?cardId=${cardId}`,
      data,
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

export const deleteLabel = async (accessToken, labelId) => {
  try {
    const response = await axios.delete(
      `${import.meta.env.VITE_API_URL}/labels/${labelId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    return response;
  } catch (error) {
    console.log(error);
  }
};
