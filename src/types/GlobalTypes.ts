import { ModalProps as AntdModalProps } from "antd";

import { Credentials, Users } from "./APIResponseTypes";

export type AuthProfileType = Credentials & {
  user: Users;
};

export type ModalProps<TData = any> = AntdModalProps & {
  selectedData?: TData & {
    request_type: ModalRequestTypes;
  };
  onCancel: () => void;
};

export type APIResponseTypes<TResult> = {
  count: number;
  results: TResult;
};

export type APIActionResponseTypes<TResult> = {
  title: string;
  content: string;
  payload: TResult;
};

export type ExcludeOptionTypes = {
  value: string;
  label: string;
  className?: string;
};

export type ModalRequestTypes = "view" | "update" | undefined;
