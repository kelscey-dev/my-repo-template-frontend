"use client";
import React from "react";

import { AiOutlineSearch } from "react-icons/ai";
import { BsPencilFill, BsTrashFill } from "react-icons/bs";
import { FaEye } from "react-icons/fa";
import { AdminPageComponentType } from "@app-types/AdminRouteTypes";
import { Suppliers } from "@app-types/APIResponseTypes";
import { ModalProps } from "@app-types/GlobalTypes";
import Button from "@components/commons/Button";
import Form from "@components/commons/Form";
import Input from "@components/commons/Input";

import Modal from "@components/commons/Modal";

import Popover from "@components/commons/Popover";

import Table from "@components/commons/Table";

import { Context } from "@context/AdminProvider";

import { useDeleteRequest, useGetRequest } from "@utils/api/apiRequests";

import SuppliersModal from "./SuppliersModal";
import { supplierColumns } from "./tableColumns";

export default function SuppliersPage({ title }: AdminPageComponentType) {
  const { profile } = React.useContext(Context);
  const [search, setSearch] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [isSuppliersOpen, setIsSuppliersOpen] = React.useState(false);
  const [selectedSupplier, setSelectedSupplier] = React.useState<
    ModalProps<Suppliers>["selectedData"] | undefined
  >();

  const { data: suppliersData, isFetching: isSuppliersLoading } =
    useGetRequest<Suppliers>("/api/suppliers", {
      queryKey: ["suppliers"],
      axiosConfig: {
        params: {
          take: 10,
        },
      },
    });

  const { mutate: deleteSupplier, isPending: isDeletingSupplier } =
    useDeleteRequest("/api/suppliers", {
      invalidateQueryKey: ["suppliers"],
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
                  setIsSuppliersOpen(true);
                }}
                className="w-full"
              >
                Add Suppliers
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
            rowKey="supplier_id"
            columns={supplierColumns}
            dataSource={suppliersData?.results}
            showHeader={true}
            tableLayout="fixed"
            loading={isSuppliersLoading || isDeletingSupplier}
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
                  let selectedRow = suppliersData?.results?.find(
                    ({ supplier_id }) => supplier_id === rest["data-row-key"]
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
                                setSelectedSupplier({
                                  ...selectedRow,
                                  request_type: "view",
                                });

                                setIsSuppliersOpen(true);
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
                                setSelectedSupplier({
                                  ...selectedRow,
                                  request_type: "update",
                                });

                                setIsSuppliersOpen(true);
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
                                  deleteSupplier(rest["data-row-key"]);
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
              total: suppliersData?.count,
              current: page,
              onChange: (page) => setPage(page),
            }}
          />
        </div>
      </div>
      <SuppliersModal
        open={isSuppliersOpen}
        onCancel={() => {
          setSelectedSupplier(undefined);
          setIsSuppliersOpen(false);
        }}
        selectedData={selectedSupplier}
      />
    </>
  );
}
