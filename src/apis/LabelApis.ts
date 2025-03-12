import axios from "axios";

interface Label {
  id: string;
  name: string;
  color: string;
  cardId: string;
  createdAt?: string;
  updatedAt?: string;
}

export const fetchLabels = async (
  accessToken: string, 
  cardId: string
): Promise<Label[] | undefined> => {
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
    return undefined;
  }
};

export const createLabel = async (
  accessToken: string, 
  data: Partial<Label>, 
  cardId: string
): Promise<Label | undefined> => {
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
    return undefined;
  }
};

export const deleteLabel = async (
  accessToken: string, 
  labelId: string
): Promise<any> => {
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
