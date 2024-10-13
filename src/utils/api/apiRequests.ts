import { App as AntdApp } from "antd";
import { AxiosError, AxiosResponse, AxiosRequestConfig } from "axios";
import { APIResponseTypes } from "@app-types/GlobalTypes";
import {
  useQuery,
  UseQueryOptions,
  useMutation,
  useQueryClient,
  UseMutationOptions,
  useInfiniteQuery,
  UseInfiniteQueryOptions,
  InfiniteData,
  UseQueryResult,
} from "@tanstack/react-query";
import apiClient from "@utils/api";

export function useGetRequest<TData = any>(
  url: string,
  {
    axiosConfig,
    queryKey,
    queryOptions,
  }: {
    axiosConfig?: AxiosRequestConfig;
    queryKey: UseQueryOptions["queryKey"];
    queryOptions?: Omit<UseQueryOptions, "queryFn" | "queryKey">;
  }
): UseQueryResult<APIResponseTypes<TData[]>, Error> {
  return useQuery<any>({
    queryKey,
    queryFn: () =>
      apiClient.get(url, axiosConfig).then((res) => {
        return res.data;
      }),
    ...queryOptions,
  });
}

export function useGetByIdRequest<TData = any>(
  url: string,
  pathParam: string,
  {
    axiosConfig,
    queryKey,
    queryOptions,
  }: {
    axiosConfig?: AxiosRequestConfig;
    queryKey: UseQueryOptions["queryKey"];
    queryOptions?: Omit<UseQueryOptions, "queryFn" | "queryKey">;
  }
): UseQueryResult<TData, Error> {
  return useQuery<any>({
    queryKey,
    queryFn: () =>
      apiClient.get(url + "/" + pathParam, axiosConfig).then((res) => {
        return res.data;
      }),
    ...queryOptions,
  });
}

export function useGetInfiniteRequest(
  url: string,
  {
    queryKey,
    axiosConfig,
    queryOptions,
  }: {
    queryKey: UseInfiniteQueryOptions["queryKey"];
    axiosConfig?: AxiosRequestConfig;
    queryOptions?: Omit<
      UseInfiniteQueryOptions<any, Error, any>,
      | "queryFn"
      | "queryKey"
      | "getNextPageParam"
      | "getPreviousPageParam"
      | "initialPageParam"
    >;
  }
) {
  return useInfiniteQuery<
    any,
    Error,
    any,
    UseInfiniteQueryOptions["queryKey"],
    any
  >({
    queryKey,
    queryFn: ({ pageParam }) =>
      apiClient
        .get(url, {
          ...axiosConfig,
          params: {
            ...axiosConfig?.params,
            page: pageParam,
          },
        })
        .then((res) => {
          return res.data;
        }),
    select: (data) => {
      const allResults = data.pages.flatMap((page) => page.results ?? []);

      return { count: data?.pages[0]?.count, results: allResults };
    },
    ...queryOptions,
    getNextPageParam: (lastPage = {}, allPages = [], lastPageParam = 1) => {
      if (lastPage.length === 0) {
        return undefined;
      }

      return lastPageParam + 1;
    },
    getPreviousPageParam: (firstPage, allPages, firstPageParam) => {
      if (firstPageParam <= 1) {
        return undefined;
      }
      return firstPageParam - 1;
    },
    initialPageParam: 1,
  });
}

export function usePostRequest(
  url: string,
  {
    axiosConfig,
    invalidateQueryKey,
    invalidateInfiniteQueryKey,
    mutationOptions,
    overWriteSuccessNotification,
    overWriteErrorNotification,
  }: {
    axiosConfig?: AxiosRequestConfig;
    invalidateQueryKey?: string[];
    invalidateInfiniteQueryKey?: {
      queryKey: string;
      updater: (res: AxiosResponse) => void;
    }[];
    mutationOptions?: Omit<
      UseMutationOptions<AxiosResponse<any, any>, AxiosError, void, unknown>,
      "mutationFn"
    >;
    overWriteSuccessNotification?: boolean;
    overWriteErrorNotification?: boolean;
  } = {}
) {
  const { notification } = AntdApp.useApp();
  const queryClient = useQueryClient();

  return useMutation({
    ...mutationOptions,
    mutationFn: (payload) => apiClient.post(url, payload, axiosConfig),
    onSuccess: (res, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: invalidateQueryKey,
      });

      if (invalidateInfiniteQueryKey) {
        invalidateInfiniteQueryKey.map(({ queryKey, updater }) => {
          const activeKey = queryClient.getQueryCache().find({
            exact: false,
            type: "active",
            queryKey: [queryKey],
          });

          if (activeKey) {
            queryClient.setQueryData(
              activeKey.queryKey,
              ({
                pages,
                pageParams,
              }: {
                pages: { count: number; [key: string]: any }[];
                pageParams: string[];
              }) => {
                let newData = updater(res);
                let newCount = pages[0]?.count + 1;
                let newPages = pages.map(({ count, results }) => {
                  return {
                    count: count + 1,
                    results,
                  };
                });

                return {
                  pageParams: [...pageParams, newCount],
                  pages: [{ count: newCount, results: newData }, ...newPages],
                };
              }
            );
          }
        });
      }

      if (!overWriteSuccessNotification) {
        notification.success({
          message: res.data.title,
          description: res.data.content,
        });
      }

      if (mutationOptions?.onSuccess) {
        mutationOptions?.onSuccess(res, variables, context);
      }
    },
    onError: (err: AxiosError<any>, variables, context) => {
      if (!overWriteErrorNotification) {
        notification.error({
          message: err.response?.data.title ?? "Internal Server Error",
          description: err.response?.data.content ?? "Kindly contact an admin",
        });
      }

      if (mutationOptions?.onError) {
        mutationOptions?.onError?.(err, variables, context);
      }
    },
  });
}

export function usePatchRequest(
  url: string,
  {
    axiosConfig,
    invalidateQueryKey,
    invalidateInfiniteQueryKey,
    mutationOptions,
    overWriteSuccessNotification,
    overWriteErrorNotification,
  }: {
    axiosConfig?: AxiosRequestConfig;
    invalidateQueryKey?: string[];
    invalidateInfiniteQueryKey?: {
      queryKey: string;
      updater: (res: AxiosResponse) => void;
    }[];
    mutationOptions?: Omit<
      UseMutationOptions<
        AxiosResponse<any, any>,
        AxiosError,
        { id: string; payload: { [key: string]: any } },
        unknown
      >,
      "mutationFn"
    >;
    overWriteSuccessNotification?: boolean;
    overWriteErrorNotification?: boolean;
  } = {}
) {
  const { notification } = AntdApp.useApp();
  const queryClient = useQueryClient();

  return useMutation({
    ...mutationOptions,
    mutationFn: ({ id, payload }) =>
      apiClient.patch(url + "/" + id, payload, axiosConfig),
    onSuccess: (res, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: invalidateQueryKey,
      });

      if (invalidateInfiniteQueryKey) {
        invalidateInfiniteQueryKey.map(({ queryKey, updater }) => {
          const activeKey = queryClient.getQueryCache().find({
            exact: false,
            type: "active",
            queryKey: [queryKey],
          });

          if (activeKey) {
            queryClient.setQueryData(
              activeKey.queryKey,
              ({
                pages,
                pageParams,
              }: {
                pages: { count: number; [key: string]: any }[];
                pageParams: string[];
              }) => {
                let newData = updater(res);
                let newCount = pages[0]?.count + 1;
                let newPages = pages.map(({ count, results }) => {
                  return {
                    count: count + 1,
                    results,
                  };
                });

                return {
                  pageParams: [...pageParams, newCount],
                  pages: [{ count: newCount, results: newData }, ...newPages],
                };
              }
            );
          }
        });
      }

      if (!overWriteSuccessNotification) {
        notification.success({
          message: res.data.title,
          description: res.data.content,
        });
      }

      if (mutationOptions?.onSuccess) {
        mutationOptions?.onSuccess(res, variables, context);
      }
    },
    onError: (err: AxiosError<any>, variables, context) => {
      if (!overWriteErrorNotification) {
        notification.error({
          message: err.response?.data.title ?? "Internal Server Error",
          description: err.response?.data.content ?? "Kindly contact an admin",
        });
      }

      if (mutationOptions?.onError) {
        mutationOptions?.onError?.(err, variables, context);
      }
    },
  });
}

export function useDeleteRequest(
  url: string,
  {
    axiosConfig,
    invalidateQueryKey,
    mutationOptions,
    overWriteSuccessNotification,
    overWriteErrorNotification,
  }: {
    axiosConfig?: AxiosRequestConfig;
    invalidateQueryKey?: string[];
    mutationOptions?: Omit<
      UseMutationOptions<
        AxiosResponse<any, any>,
        AxiosError,
        { id: string },
        unknown
      >,
      "mutationFn"
    >;
    overWriteSuccessNotification?: boolean;
    overWriteErrorNotification?: boolean;
  } = {}
) {
  const { notification } = AntdApp.useApp();
  const queryClient = useQueryClient();

  return useMutation({
    ...mutationOptions,
    mutationFn: ({ id }) => apiClient.delete(url + "/" + id, axiosConfig),
    onSuccess: (res, variables: any, context) => {
      queryClient.invalidateQueries({
        queryKey: invalidateQueryKey,
      });

      if (!overWriteSuccessNotification) {
        notification.success({
          message: res.data.title,
          description: res.data.content,
        });
      }

      if (mutationOptions?.onSuccess) {
        mutationOptions?.onSuccess(res, variables, context);
      }
    },
    onError: (err: AxiosError<any>, variables, context) => {
      if (!overWriteErrorNotification) {
        notification.error({
          message: err.response?.data.title ?? "Internal Server Error",
          description: err.response?.data.content ?? "Kindly contact an admin",
        });
      }

      if (mutationOptions?.onError) {
        mutationOptions?.onError?.(err, variables, context);
      }
    },
  });
}
