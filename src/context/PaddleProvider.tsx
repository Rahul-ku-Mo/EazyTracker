import { subscribeToPlan } from "@/apis/billing";
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
        switch (event.name) {
          case "checkout.completed":
            subscribeToPlan({
              priceId: event.data.items[0].price_id,
              customerId: event.data.customer.id,
              email: event.data.customer.email,
              billingCycle: event.data.items[0].billing_cycle.interval,
              status: event.data.status,
            });
        }
      },
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
