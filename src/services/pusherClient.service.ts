import PusherClient from "pusher-js";

const pusherClient = new PusherClient(
  `${import.meta.env.VITE_APP_PUSHER_APP_KEY}`,
  {
    cluster: `${import.meta.env.VITE_APP_PUSHER_APP_CLUSTER}`,
    channelAuthorization: {
      endpoint: `${import.meta.env.VITE_APP_PUSHER_AUTH_ENDPOINT}`,
      transport: "ajax",
    },
  }
);

export default pusherClient;
