"use client";
import React from "react";

import moment from "moment";
import { AiOutlineSearch } from "react-icons/ai";
import { BsPencilFill, BsTrashFill } from "react-icons/bs";
import { FaEye } from "react-icons/fa";
import { AdminPageComponentType } from "@app-types/AdminRouteTypes";
import { Sales, SalesDetails } from "@app-types/APIResponseTypes";

import { ExcludeOptionTypes, ModalProps } from "@app-types/GlobalTypes";

import Button from "@components/commons/Button";

import Input from "@components/commons/Input";

import Popover from "@components/commons/Popover";

import Table from "@components/commons/Table";

import { Context } from "@context/AdminProvider";

import { useDeleteRequest, useGetRequest } from "@utils/api/apiRequests";

import SalesModal from "./SalesModal";

import { salesColumns } from "./tableColumns";

export type SalesModalData = ModalProps<
  Omit<Sales, "sales_details"> & {
    sales_details: (Omit<SalesDetails, "inventory"> & ExcludeOptionTypes)[];
  }
>["selectedData"];

export default function SalesPage({ title }: AdminPageComponentType) {
  const { profile } = React.useContext(Context);
  const [search, setSearch] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [isSalesOpen, setIsSalesOpen] = React.useState(false);
  const [selectedSales, setSelectedSales] = React.useState<SalesModalData>();

  const { data: salesData, isFetching: isSalesLoading } = useGetRequest<Sales>(
    "/api/sales",
    {
      queryKey: ["sales"],
      axiosConfig: {
        params: {
          take: 10,
        },
      },
    }
  );

  const { mutate: deleteSales, isPending: isDeletingSales } = useDeleteRequest(
    "/api/sales",
    {
      invalidateQueryKey: ["sales"],
    }
  );

  return (
    <>
      <div className="p-[5%] max-md:py-[10%] h-full space-y-8 overflow-auto flex-auto flex flex-col">
        <div className="flex justify-between items-center flex-wrap gap-x-4 gap-y-8">
          <h3 className="max-sm:basis-full">{title}</h3>
          {["superadmin"].includes(profile?.user.role as string) && (
            <div className="flex max-sm:flex-wrap max-sm:flex-auto items-center gap-4 basis-[12rem]">
              <Button
                onClick={() => {
                  setIsSalesOpen(true);
                }}
                className="w-full"
              >
                Add Sales
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
            rowKey="sales_id"
            columns={salesColumns}
            dataSource={salesData?.results}
            showHeader={true}
            tableLayout="fixed"
            loading={isSalesLoading || isDeletingSales}
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
                  let selectedRow = salesData?.results?.find(
                    ({ sales_id }) => sales_id === rest["data-row-key"]
                  );

                  if (rest["data-row-key"] && selectedRow) {
                    if (selectedRow) {
                      const sales_details = selectedRow?.sales_details.map(
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
                                  setSelectedSales({
                                    ...selectedRow,
                                    sales_date: moment(selectedRow.sales_date),
                                    sales_details,
                                    request_type: "view",
                                  });

                                  setIsSalesOpen(true);
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
                                    setSelectedSales({
                                      ...selectedRow,
                                      sales_date: moment(
                                        selectedRow.sales_date
                                      ),
                                      sales_details,
                                      request_type: "update",
                                    });

                                    setIsSalesOpen(true);
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
                                    deleteSales({ id: rest["data-row-key"] });
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
              total: salesData?.count,
              current: page,
              onChange: (page) => setPage(page),
            }}
          />
        </div>
      </div>
      <SalesModal
        open={isSalesOpen}
        onCancel={() => {
          setSelectedSales(undefined);
          setIsSalesOpen(false);
        }}
        selectedData={selectedSales}
      />
    </>
  );
}
