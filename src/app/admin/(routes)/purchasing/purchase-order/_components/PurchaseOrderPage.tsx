"use client";
import React from "react";

import moment from "moment";
import dynamic from "next/dynamic";
import { AiOutlineSearch } from "react-icons/ai";
import { BsPencilFill, BsTrashFill } from "react-icons/bs";
import { FaEye } from "react-icons/fa";
import { AdminPageComponentType } from "@app-types/AdminRouteTypes";
import {
  PurchaseOrderDetails,
  PurchaseOrders,
  Suppliers,
} from "@app-types/APIResponseTypes";
import { ExcludeOptionTypes, ModalProps } from "@app-types/GlobalTypes";

import Button from "@components/commons/Button";

import Input from "@components/commons/Input";

import Popover from "@components/commons/Popover";

import Table from "@components/commons/Table";

import { Context } from "@context/AdminProvider";

import { useDeleteRequest, useGetRequest } from "@utils/api/apiRequests";

import PurchaseOrderModal from "./PurchaseOrderModal";
import { purchaseOrderColumns } from "./tableColumns";

export type PurchaseOrderModalData = ModalProps<
  Omit<PurchaseOrders, "purchase_order_details"> & {
    supplier_contact_no: string;
    supplier: Suppliers & ExcludeOptionTypes;
    purchase_order_details: (Omit<PurchaseOrderDetails, "inventory"> &
      ExcludeOptionTypes)[];
  }
>["selectedData"];

export default function PurchaseOrderPage({ title }: AdminPageComponentType) {
  const { profile } = React.useContext(Context);
  const [search, setSearch] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [isPurchaseOrderOpen, setIsPurchaseOrderOpen] = React.useState(false);
  const [selectedPurchaseOrder, setSelectedPurchaseOrder] =
    React.useState<PurchaseOrderModalData>();

  const { data: purchaseOrdersData, isFetching: isPurchaseOrdersLoading } =
    useGetRequest<PurchaseOrders>("/api/purchase-orders", {
      queryKey: ["purchase-orders"],
      axiosConfig: {
        params: {
          take: 10,
        },
      },
    });

  const { mutate: deletePurchaseOrder, isPending: isDeletingPurchaseOrder } =
    useDeleteRequest("/api/purchase-orders", {
      invalidateQueryKey: ["purchase-orders"],
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
                  setIsPurchaseOrderOpen(true);
                }}
                className="w-full"
              >
                Add Purchase Order
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
            rowKey="purchase_order_id"
            columns={purchaseOrderColumns}
            dataSource={purchaseOrdersData?.results}
            showHeader={true}
            tableLayout="fixed"
            loading={isPurchaseOrdersLoading || isDeletingPurchaseOrder}
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
                  let selectedRow = purchaseOrdersData?.results?.find(
                    ({ purchase_order_id }) =>
                      purchase_order_id === rest["data-row-key"]
                  );

                  if (rest["data-row-key"] && selectedRow) {
                    if (selectedRow) {
                      const supplier = {
                        ...selectedRow.supplier,
                        value: selectedRow.supplier.supplier_id,
                        label: selectedRow.supplier.supplier_name,
                        className: "!hidden",
                      };

                      const purchase_order_details =
                        selectedRow?.purchase_order_details.map(
                          ({ inventory, ...rest }) => {
                            return {
                              ...rest,
                              value: rest.inventory_id,
                              label: inventory?.complete_item_name,
                              className: "!hidden",
                            };
                          }
                        );

                      return (
                        <Popover
                          getPopupContainer={() => document.body}
                          placement="top"
                          content={
                            <div className="grid grid-cols-1 gap-2">
                              <Button
                                type="text"
                                onClick={() => {
                                  setSelectedPurchaseOrder({
                                    ...selectedRow,
                                    order_date: moment(selectedRow.order_date),
                                    supplier_id:
                                      selectedRow.supplier.supplier_id,
                                    supplier_contact_no:
                                      selectedRow.supplier.contact_no,
                                    supplier,
                                    purchase_order_details,
                                    request_type: "view",
                                  });

                                  setIsPurchaseOrderOpen(true);
                                }}
                                className="!p-2"
                              >
                                <div className="flex items-center gap-2 text-sm">
                                  <FaEye className="text-sm" />
                                  <div>View</div>
                                </div>
                              </Button>
                              {selectedRow.status !== "completed" && (
                                <Button
                                  type="text"
                                  onClick={() => {
                                    setSelectedPurchaseOrder({
                                      ...selectedRow,
                                      order_date: moment(
                                        selectedRow.order_date
                                      ),
                                      supplier_id:
                                        selectedRow.supplier.supplier_id,
                                      supplier_contact_no:
                                        selectedRow.supplier.contact_no,
                                      supplier,
                                      purchase_order_details,
                                      request_type: "update",
                                    });

                                    setIsPurchaseOrderOpen(true);
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
                                    deletePurchaseOrder({
                                      id: rest["data-row-key"],
                                    });
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
                  }

                  return <tr {...rest} />;
                },
              },
            }}
            pagination={{
              pageSize: 10,
              hideOnSinglePage: true,
              showSizeChanger: false,
              total: purchaseOrdersData?.count,
              current: page,
              onChange: (page) => setPage(page),
            }}
          />
        </div>
      </div>
      <PurchaseOrderModal
        open={isPurchaseOrderOpen}
        onCancel={() => {
          setSelectedPurchaseOrder(undefined);
          setIsPurchaseOrderOpen(false);
        }}
        selectedData={selectedPurchaseOrder}
      />
    </>
  );
}
