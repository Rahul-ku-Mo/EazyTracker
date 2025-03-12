import { toast } from "sonner";
import axios from "axios";

interface Column {
  id: string;
  title: string;
  boardId: string;
  order?: number;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

/***Column CRUD API ***/
export const createColumn = async (
  accessToken: string, 
  title: string, 
  boardId: string
): Promise<Column | undefined> => {
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
    return undefined;
  } catch (err) {
    console.log(err);
    toast.error("Something wrong happened");
    return undefined;
  }
};

export const fetchColumns = async (
  accessToken: string, 
  boardId: string
): Promise<Column[] | undefined> => {
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
    return undefined;
  } catch (err) {
    console.log(err);
    return undefined;
  }
};

export const fetchColumn = async (
  accessToken: string, 
  columnId: string
): Promise<Column | undefined> => {
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
    return undefined;
  } catch (err) {
    console.log(err);
    return undefined;
  }
};

export const updateColumn = async (
  accessToken: string, 
  title: string, 
  columnId: string
): Promise<Column | undefined> => {
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
    return undefined;
  } catch (err) {
    console.log(err);
    toast.error("Something wrong happened 🔥");
    return undefined;
  }
};

export const deleteColumn = async (
  accessToken: string, 
  columnId: string
): Promise<void> => {
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

export const updateColumnOrdering = async (
  accessToken: string, 
  columns: Column[]
): Promise<Column[] | undefined> => {
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
    return undefined;
  } catch (error) {
    console.log(error);
    return undefined;
  }
};
