import { useMemo } from "react";
import { App as AntdApp } from "antd";
import { AxiosError } from "axios";
import { QueryCache, QueryClient } from "@tanstack/react-query";

const useConfiguredQueryClient = () => {
  const { notification } = AntdApp.useApp();

  return useMemo(() => {
    return new QueryClient({
      queryCache: new QueryCache({
        onError: (err) => {
          if (err instanceof AxiosError) {
            notification.error({
              message: err.response?.data.title ?? "Something went wrong",
              description:
                err.response?.data.content ?? "Kindly contact an admin",
            });
          } else {
            notification.error({
              message: "Something went wrong",
              description: "Kindly contact an admin",
            });
          }
        },
      }),
      defaultOptions: {
        queries: {
          refetchOnWindowFocus: false,
          retry: 2,
          staleTime: 1000 * 60 * 1,
        },
      },
    });
  }, [notification]);
};

export default useConfiguredQueryClient;
