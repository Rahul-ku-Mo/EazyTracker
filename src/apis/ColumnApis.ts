import { toast } from "sonner";
import axios from "axios";

/***Column CRUD API ***/
export const createColumn = async (accessToken, title, boardId) => {
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/columns?boardId=${boardId}`,
      {
        title: title,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (response.data.data && response.status === 201) {
      toast.success(`${title} created successfully`);

      return response.data.data;
    }
  } catch (err) {
    console.log(err);
    toast.error("Something wrong happened");
  }
};

export const fetchColumns = async (accessToken, boardId) => {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_API_URL}/columns?boardId=${boardId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (response.data.data && response.status === 200) {
      return response.data.data;
    }
  } catch (err) {
    console.log(err);
  }
};

export const fetchColumn = async (accessToken, columnId) => {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_API_URL}/columns/${columnId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (response.data.data && response.status === 200) {
      return response.data.data;
    }
  } catch (err) {
    console.log(err);
  }
};

export const updateColumn = async (accessToken, title, columnId) => {
  try {
    const response = await axios.patch(
      `${import.meta.env.VITE_API_URL}/columns/${columnId}`,
      {
        title: title,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (response.data.data && response.status === 201) {
      toast.success(`${title} updated!`);

      return response.data.data;
    }
  } catch (err) {
    console.log(err);
    toast.error("Something wrong happened 🔥");
  }
};

export const deleteColumn = async (accessToken, columnId) => {
  try {
    const response = await axios.delete(
      `${import.meta.env.VITE_API_URL}/columns/${columnId}`,

      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (response.data.data && response.status === 204) {
      toast.success(`Column deleted successfully! 🎆`);
    }
  } catch (err) {
    console.log(err);
    toast.error("Something wrong happened");
  }
};

export const updateColumnOrdering = async (accessToken, columns) => {
  try {
    const response = await axios.patch(
      `${import.meta.env.VITE_API_URL}/columns/ordering`,
      {
        columns: columns,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (response.status === 200) {
      return response.data.data;
    }
  } catch (error) {
    console.log(error);
  }
};
