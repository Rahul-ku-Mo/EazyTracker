import axios from "axios";

export const fetchBoards = async (accessToken) => {
  try {
    const response = await axios.get(`${import.meta.env.VITE_API_URL}/boards`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (response.status === 200) return response.data.data;
  } catch (error) {
    console.log(error);
  }
};

export const fetchBoard = async (accessToken : string, boardId : string) => {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_API_URL}/boards/${boardId}`,
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

export const createBoard = async (accessToken, data) => {
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/boards`,
      data,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (response.status === 201) return response.data.data;
  } catch (error) {
    console.log(error);
  }
};

export const deleteBoard = async (accessToken, boardId) => {
  try {
    const response = await axios.delete(
      `${import.meta.env.VITE_API_URL}/boards/${boardId}`,
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

export const updateBoard = async (accessToken : string, boardId : string, data : TBoard) => {
  try {
    const response = await axios.patch(`${import.meta.env.VITE_API_URL}/boards/${boardId}`, data, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (response.status === 200) return response.data.data;
  } catch (error) {
    console.log(error);
  }
}
