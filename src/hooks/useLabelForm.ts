import { useState } from "react";

import { toast } from "sonner";
import Cookies from "js-cookie";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createLabel } from "../apis/LabelApis";
import { useParams } from "react-router-dom";

const useLabelForm = (cardId: string) => {
  const { id: boardId } = useParams();
  const queryClient = useQueryClient();
  const accessToken = Cookies.get("accessToken");

  const [currentLabelInput, setCurrentLabelInput] = useState("");
  const [selectedColorId, setSelectedColorId] = useState(null);

  const createLabelMutation = useMutation({
    mutationFn: async ({ name, color }: { name: string; color: string }) => {
      const labelData = {
        name: name,
        color: color,
      };

      return await createLabel(accessToken, labelData, cardId);
    },
    onSuccess: () => {
      setCurrentLabelInput("");
      setSelectedColorId(null);

      toast.success("Label created successfully 🎉");
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["columns", "boards", boardId],
      });

      await queryClient.invalidateQueries({
        queryKey: ["labels", cardId],
      });
    },
  });

  const handleSubmit = async (event: { preventDefault: () => void; target: { elements: { label: { value: string; }; color: { value: string; }; }; }; }) => {
    event.preventDefault();

    const labelName = event.target.elements.label.value;
    const selectedLabelColorValue = event.target.elements.color.value;

    if (labelName === "") {
      toast.error("Label shouldn't be empty!");
      return;
    }

    if (selectedLabelColorValue === "") {
      toast.error("Label color shouldnt' be empty!");
      return;
    }

    createLabelMutation.mutate({
      name: labelName,
      color: selectedLabelColorValue,
    });
  };

  return {
    createLabelMutation,
    setCurrentLabelInput,
    currentLabelInput,
    selectedColorId,
    setSelectedColorId,
    handleSubmit,
  };
};

export default useLabelForm;
