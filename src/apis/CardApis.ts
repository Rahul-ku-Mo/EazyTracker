import axios from "axios";
import Cookies from "js-cookie";
import { TCreateCardProps, TCardData } from "../types";

interface CardDetail {
  id: number;
  title: string;
  description?: string;
  dueDate?: string;
  columnId: string;
  createdAt?: string;
  updatedAt?: string;
  labels?: any[];
  attachments?: any[];
  [key: string]: any;
}

/***Column CRUD API ***/
export const createCard = async ({
  accessToken,
  cardData,
  columnId,
}: TCreateCardProps): Promise<CardDetail | undefined> => {
  const { title, description, dueDate, labels, attachments } = cardData;

  try {
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/cards?columnId=${columnId}`,
      {
        title: title,
        description: description,
        dueDate: dueDate ? dueDate.toISOString() : null,
        labels: labels,
        attachments: attachments,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (response.data.data && response.status === 201) {
      return response.data.data;
    }
    return undefined;
  } catch (err) {
    console.log(err);
    return undefined;
  }
};

export const fetchCards = async (
  accessToken: string, 
  columnId: string
): Promise<CardDetail[] | undefined> => {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_API_URL}/cards?columnId=${columnId}`,
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

export const fetchCard = async (
  accessToken: string, 
  cardId: number
): Promise<CardDetail | undefined> => {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_API_URL}/cards/${cardId}`,
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

export const updateCard = async (
  accessToken: string,
  data: TCardData,
  cardId: number
): Promise<CardDetail | undefined> => {
  try {
    const response = await axios.patch(
      `${import.meta.env.VITE_API_URL}/cards/${cardId}`,
      data,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (response.data.data && response.status === 201) {
      return response.data.data;
    }
    return undefined;
  } catch (err) {
    console.log(err);
    return undefined;
  }
};

export const deleteCard = async (
  accessToken: string, 
  cardId: number
): Promise<string> => {
  try {
    const response = await axios.delete(
      `${import.meta.env.VITE_API_URL}/cards/${cardId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (response.data.data && response.status === 204) {
      return "success";
    }
    return "error";
  } catch (err) {
    console.log(err);
    return "error";
  }
};

/***Card CRUD API ***/

export const getCardDetails = async (cardId: number): Promise<CardDetail | undefined> => {
  const accessToken = Cookies.get("accessToken");

  try {
    const response = await axios.get(
      `${import.meta.env.VITE_API_URL}/cards/details/${cardId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (response.data.message === "success" && response.status === 200) {
      return response.data.data;
    }
    return undefined;
  } catch (err) {
    console.log(err);
    return undefined;
  }
};

// Mark card as complete
export const markCardComplete = async (
  accessToken: string,
  cardId: number
): Promise<CardDetail | undefined> => {
  try {
    const response = await axios.patch(
      `${import.meta.env.VITE_API_URL}/cards/${cardId}/complete`,
      {},
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

// Mark card as incomplete
export const markCardIncomplete = async (
  accessToken: string,
  cardId: number
): Promise<CardDetail | undefined> => {
  try {
    const response = await axios.patch(
      `${import.meta.env.VITE_API_URL}/cards/${cardId}/incomplete`,
      {},
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

// Get cards with status (completed, overdue, etc.)
export const fetchCardsWithStatus = async (
  accessToken: string,
  columnId?: string,
  boardId?: string
): Promise<any[] | undefined> => {
  try {
    const params = new URLSearchParams();
    if (columnId) params.append('columnId', columnId);
    if (boardId) params.append('boardId', boardId);

    const response = await axios.get(
      `${import.meta.env.VITE_API_URL}/cards/status?${params.toString()}`,
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

// Update card column (for drag and drop)
export const updateCardColumn = async (
  accessToken: string,
  cardId: number,
  columnId: number
): Promise<CardDetail | undefined> => {
  try {
    const response = await axios.patch(
      `${import.meta.env.VITE_API_URL}/cards/${cardId}`,
      {
        columnId: columnId,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (response.data.data && response.status === 201) {
      return response.data.data;
    }
    return undefined;
  } catch (err) {
    console.log(err);
    return undefined;
  }
};

// Update card order (for drag and drop)
export const updateCardOrder = async (
  accessToken: string,
  cardId: number,
  order: number
): Promise<CardDetail | undefined> => {
  try {
    const response = await axios.patch(
      `${import.meta.env.VITE_API_URL}/cards/${cardId}`,
      {
        order: order,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (response.data.data && response.status === 201) {
      return response.data.data;
    }
    return undefined;
  } catch (err) {
    console.log(err);
    return undefined;
  }
};
