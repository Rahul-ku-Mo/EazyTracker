import { initializePaddle, Paddle } from "@paddle/paddle-js";
import { createContext, useContext, useState, useEffect } from "react";

export const PaddleContext = createContext<Paddle | null>(null);

export const PaddleProvider = ({ children }: { children: React.ReactNode }) => {
  const [paddle, setPaddle] = useState<Paddle | null>(null);

  useEffect(() => {
    initializePaddle({
      token: import.meta.env.VITE_PADDLE_TOKEN || "",
      environment: import.meta.env.VITE_PADDLE_ENVIRONMENT || "",
      eventCallback: (event: any) => {
        console.log("Paddle event:", event);
        
        // Handle checkout completion
        if (event.name === "checkout.completed") {
          console.log("Checkout completed:", event.data);
          
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        }
      }
    }).then((paddleInstance: Paddle | undefined) => {
      if (paddleInstance) {
        setPaddle(paddleInstance);
      }
    });
  }, []);

  return (
    <PaddleContext.Provider value={paddle}>{children}</PaddleContext.Provider>
  );
};

export const usePaddle = () => {
  const paddle = useContext(PaddleContext);
  if (!paddle) {
    throw new Error("usePaddle must be used within a PaddleProvider");
  }
  return paddle;
};
