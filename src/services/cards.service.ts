import { api } from "@/lib/api";

export const cardsService = {
    getCard: async (cardId: number) => {
        const { data } = await api.get(`/cards/${cardId}`);
        return data;
    }
}