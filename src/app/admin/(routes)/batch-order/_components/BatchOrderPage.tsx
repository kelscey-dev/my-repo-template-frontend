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

import { BatchOrderStatusTypes } from "@utils/data/batchOrderStatusData";

import BatchOrderModal from "./BatchOrderModal";
import { batchOrderColumns } from "./tableColumns";

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
          {["superadmin"].includes(profile?.user.role as string) && (
            <div className="flex max-sm:flex-wrap max-sm:flex-auto items-center gap-4 basis-[12rem]">
              <Button
                onClick={() => {
                  setIsBatchOrderOpen(true);
                }}
                className="w-full"
              >
                Add Batch Order
              </Button>
            </div>
          )}
        </div>
        <div className="flex justify-between items-center gap-4 flex-wrap md:flex-nowrap !mt-8">
          <div className="basis-full">
            <Input
              placeholder="Search"
              prefix={<AiOutlineSearch className="text-lg text-casper-500" />}
              className="rounded-xl shadow-none"
              // onChange={(e: any) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="flex flex-col flex-auto min-h-[30rem]">
          <Table
            id="tab"
            rowKey="batch_order_id"
            columns={batchOrderColumns}
            dataSource={batchOrdersData?.results}
            showHeader={true}
            tableLayout="fixed"
            loading={isPurchaseOrdersLoading || isDeletingBatchOrder}
            components={{
              table: ({ ...rest }) => {
                const percentage =
                  (rest.children[3].props.data.length / 10) * 100;
                if (percentage) {
                  return (
                    <table
                      {...rest}
                      style={{
                        maxHeight: `${percentage}%`,
                      }}
                    />
                  );
                }

                return <table {...rest} />;
              },
              body: {
                row: ({ ...rest }) => {
                  let selectedRow = batchOrdersData?.results?.find(
                    ({ batch_order_id }) =>
                      batch_order_id === rest["data-row-key"]
                  );

                  if (rest["data-row-key"] && selectedRow) {
                    const product = {
                      ...selectedRow.product,
                      value: selectedRow.inventory_id,
                      label: selectedRow.product.complete_item_name,
                      className: "!hidden",
                    };

                    const batch_order_details =
                      selectedRow?.batch_order_details.map(
                        ({ inventory, ...rest }: any) => {
                          return {
                            ...rest,
                            value: rest.inventory_id,
                            label: inventory?.complete_item_name,
                            className: "!hidden",
                          };
                        }
                      );

                    selectedRow.actual_date =
                      selectedRow.actual_date &&
                      moment(selectedRow.actual_date);

                    selectedRow.planned_date = moment(selectedRow.planned_date);

                    return (
                      <Popover
                        getPopupContainer={() => document.body}
                        placement="top"
                        content={
                          <div className="grid grid-cols-1 gap-2">
                            <Button
                              type="text"
                              onClick={() => {
                                setSelectedBatchOrder({
                                  ...selectedRow,
                                  product,
                                  batch_order_details,
                                  request_type: "view",
                                });

                                setIsBatchOrderOpen(true);
                              }}
                              className="!p-2"
                            >
                              <div className="flex items-center gap-2 text-sm">
                                <FaEye className="text-sm" />
                                <div>View</div>
                              </div>
                            </Button>
                            {selectedRow?.status !== "completed" && (
                              <Button
                                type="text"
                                onClick={() => {
                                  setSelectedBatchOrder({
                                    ...selectedRow,
                                    product,
                                    batch_order_details,
                                    request_type: "update",
                                  });

                                  setIsBatchOrderOpen(true);
                                }}
                                className="!p-2"
                              >
                                <div className="flex items-center gap-2 text-sm">
                                  <BsPencilFill className="text-sm" />
                                  <div>Edit</div>
                                </div>
                              </Button>
                            )}
                            {["superadmin"].includes(
                              profile?.user.role as string
                            ) && (
                              <Button
                                type="text"
                                onClick={() => {
                                  deleteBatchOrder(rest["data-row-key"]);
                                }}
                                className="!p-2"
                              >
                                <div className="flex items-center gap-2 text-sm">
                                  <BsTrashFill className="text-sm" />
                                  <div>Delete</div>
                                </div>
                              </Button>
                            )}
                          </div>
                        }
                        trigger="click"
                      >
                        <tr {...rest} />
                      </Popover>
                    );
                  }

                  return <tr {...rest} />;
                },
              },
            }}
            pagination={{
              pageSize: 10,
              hideOnSinglePage: true,
              showSizeChanger: false,
              total: batchOrdersData?.count,
              current: page,
              onChange: (page) => setPage(page),
            }}
          />
        </div>
      </div>
      <BatchOrderModal
        open={isBatchOrderOpen}
        onCancel={() => {
          setSelectedBatchOrder(undefined);
          setIsBatchOrderOpen(false);
        }}
        selectedData={selectedBatchOrder}
      />
    </>
  );
}
