"use client";
import React from "react";

import dynamic from "next/dynamic";
import { AiOutlineSearch } from "react-icons/ai";
import { BsPencilFill, BsTrashFill } from "react-icons/bs";
import { FaEye } from "react-icons/fa";
import { AdminPageComponentType } from "@app-types/AdminRouteTypes";
import { Inventories } from "@app-types/APIResponseTypes";
import { ModalProps } from "@app-types/GlobalTypes";
import Button from "@components/commons/Button";

import Input from "@components/commons/Input";

import Popover from "@components/commons/Popover";

import Table from "@components/commons/Table";

import { Context } from "@context/AdminProvider";

import { useDeleteRequest, useGetRequest } from "@utils/api/apiRequests";

import InventoryModal from "./InventoryModal";
import { inventoriesColumns } from "./tableColumns";

export default function InventoryPage({ title }: AdminPageComponentType) {
  const { profile } = React.useContext(Context);
  const [search, setSearch] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [isItemsOpen, setIsItemsOpen] = React.useState(false);
  const [selectedItem, setSelectedItem] =
    React.useState<ModalProps<Inventories>["selectedData"]>();

  const { data: inventoryData, isFetching: isInventoryLoading } =
    useGetRequest<Inventories>("/api/inventories", {
      queryKey: ["inventories"],
      axiosConfig: {
        params: {
          take: 10,
        },
      },
    });

  const { mutate: deleteInventory, isPending: isDeletingInventory } =
    useDeleteRequest("/api/inventories", {
      invalidateQueryKey: ["inventories"],
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
                  setIsItemsOpen(true);
                }}
                className="w-full"
              >
                Add Item
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
            rowKey="inventory_id"
            columns={inventoriesColumns}
            dataSource={inventoryData?.results}
            showHeader={true}
            tableLayout="fixed"
            loading={isInventoryLoading || isDeletingInventory}
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
                  let selectedRow = inventoryData?.results?.find(
                    ({ inventory_id }) => inventory_id === rest["data-row-key"]
                  );

                  if (rest["data-row-key"] && selectedRow) {
                    return (
                      <Popover
                        getPopupContainer={() => document.body}
                        placement="top"
                        content={
                          <div className="grid grid-cols-1 gap-2">
                            <Button
                              type="text"
                              onClick={() => {
                                setSelectedItem({
                                  ...selectedRow,
                                  request_type: "view",
                                });

                                setIsItemsOpen(true);
                              }}
                              className="!p-2"
                            >
                              <div className="flex items-center gap-2 text-sm">
                                <FaEye className="text-sm" />
                                <div>View</div>
                              </div>
                            </Button>
                            <Button
                              type="text"
                              onClick={() => {
                                setSelectedItem({
                                  ...selectedRow,
                                  request_type: "update",
                                });

                                setIsItemsOpen(true);
                              }}
                              className="!p-2"
                            >
                              <div className="flex items-center gap-2 text-sm">
                                <BsPencilFill className="text-sm" />
                                <div>Edit</div>
                              </div>
                            </Button>
                            {["superadmin"].includes(
                              profile?.user.role as string
                            ) && (
                              <Button
                                type="text"
                                onClick={() => {
                                  deleteInventory(rest["data-row-key"]);
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
              total: inventoryData?.count,
              current: page,
              onChange: (page) => setPage(page),
            }}
          />
        </div>
      </div>
      <InventoryModal
        open={isItemsOpen}
        onCancel={() => {
          setSelectedItem(undefined);
          setIsItemsOpen(false);
        }}
        selectedData={selectedItem}
      />
    </>
  );
}
