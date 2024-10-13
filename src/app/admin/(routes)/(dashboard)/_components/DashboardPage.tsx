"use client";
import React from "react";

import moment from "moment";
import { AiOutlineSearch } from "react-icons/ai";
import { BsPencilFill, BsTrashFill } from "react-icons/bs";
import { FaEye } from "react-icons/fa";
import { AdminPageComponentType } from "@app-types/AdminRouteTypes";
import {
  BatchOrderDetails,
  BatchOrders,
  Inventories,
} from "@app-types/APIResponseTypes";
import {
  APIResponseTypes,
  ExcludeOptionTypes,
  ModalProps,
} from "@app-types/GlobalTypes";

import Button from "@components/commons/Button";

import Input from "@components/commons/Input";

import Popover from "@components/commons/Popover";

import Table from "@components/commons/Table";

import { Context } from "@context/AdminProvider";

import { useDeleteRequest, useGetRequest } from "@utils/api/apiRequests";

export type BatchOrderModalData = ModalProps<
  Omit<BatchOrders, "batch_order_details"> & {
    product: Omit<Inventories, "inventory"> & ExcludeOptionTypes;
    batch_order_details: (BatchOrderDetails & ExcludeOptionTypes)[];
  }
>["selectedData"];

export default function BatchOrderPage({ title }: AdminPageComponentType) {
  const { profile } = React.useContext(Context);
  const [search, setSearch] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [isBatchOrderOpen, setIsBatchOrderOpen] = React.useState(false);
  const [selectedBatchOrder, setSelectedBatchOrder] =
    React.useState<BatchOrderModalData>();

  const { data: batchOrdersData, isFetching: isPurchaseOrdersLoading } =
    useGetRequest<BatchOrders>("/api/batch-orders", {
      queryKey: ["batch-orders"],
      axiosConfig: {
        params: {
          take: 10,
        },
      },
    });

  const { mutate: deleteBatchOrder, isPending: isDeletingBatchOrder } =
    useDeleteRequest("/api/batch-orders", {
      invalidateQueryKey: ["batch-orders"],
    });

  return (
    <>
      <div className="p-[5%] max-md:py-[10%] h-full space-y-8 overflow-auto flex-auto flex flex-col">
        <div className="flex justify-between items-center flex-wrap gap-x-4 gap-y-8">
          <h3 className="max-sm:basis-full">{title}</h3>
        </div>
      </div>
    </>
  );
}
