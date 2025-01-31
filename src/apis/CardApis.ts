import axios from "axios";
import Cookies from "js-cookie";
import { TCreateCardProps, TCardData } from "../types";

/***Column CRUD API ***/
export const createCard = async ({
  accessToken,
  cardData,
  columnId,
}: TCreateCardProps) => {
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
  } catch (err) {
    console.log(err);
  }
};

export const fetchCards = async (accessToken : string, columnId : string) => {
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
  } catch (err) {
    console.log(err);
  }
};

export const fetchCard = async (accessToken : string, cardId : string) => {
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
  } catch (err) {
    console.log(err);
  }
};

export const updateCard = async (
  accessToken: string,
  data: TCardData,
  cardId: string
) => {
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
  } catch (err) {
    console.log(err);
  }
};

export const deleteCard = async (accessToken: string, cardId: string) => {
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
  } catch (err) {
    console.log(err);

    return "error";
  }
};

/***Card CRUD API ***/

export const getCardDetails = async (cardId : string) => {
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
  } catch (err) {
    console.log(err);
  }
};
