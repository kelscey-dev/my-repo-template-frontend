"use client";
import React from "react";

import { NumericFormat, PatternFormat } from "react-number-format";
import { twMerge } from "tailwind-merge";
import InventoryModal from "@admin-routes/(routes)/inventory/_components/InventoryModal";
import { ExcludeOptionTypes, ModalProps } from "@app-types/GlobalTypes";
import Button from "@components/commons/Button";
import DatePicker from "@components/commons/DatePicker";

import Form from "@components/commons/Form";

import Input from "@components/commons/Input";

import Modal from "@components/commons/Modal";
import Select from "@components/commons/Select";
import {
  useGetInfiniteRequest,
  usePatchRequest,
  usePostRequest,
} from "@utils/api/apiRequests";
import salesStatusData from "@utils/data/salesStatusData";
import salesTypeData from "@utils/data/salesTypeData";
import {
  removeNumberFormatting,
  requestTitle,
  getNextItem,
} from "@utils/helpers";

import { salesStatusPalette } from "@utils/palettes";

import InventoryChecker from "./InventoryChecker";
import { SalesModalData } from "./SalesPage";

type SalesModalProps = ModalProps<SalesModalData>;
export default function SalesModal({
  onCancel,
  selectedData,
  ...rest
}: SalesModalProps) {
  const [SalesForm] = Form.useForm();
  const [isItemModalOpen, setIsItemModalOpen] = React.useState(false);

  const [excludeInventoryOptions, setExcludeInventoryOptions] = React.useState<
    ExcludeOptionTypes[]
  >([]);

  let excludeInventoryIds = excludeInventoryOptions.flatMap(
    ({ value }) => value
  );

  const {
    data: inventorySelectionData,
    isFetching: isInventorySelectionLoading,
    isFetchingNextPage: isInventoryNextPageLoading,
    fetchNextPage: fetchInventoryNextPage,
  } = useGetInfiniteRequest("/api/inventories/selection", {
    queryKey: ["inventory-selection", excludeInventoryOptions],
    axiosConfig: {
      params: {
        exclude_ids: excludeInventoryIds,
        item_type: "product",
        take: 1,
      },
    },
    queryOptions: {
      enabled: rest.open,
    },
  });

  let mergeInventorySelectionData = {
    count:
      Number(inventorySelectionData?.count ?? 1) +
      Number(excludeInventoryOptions?.length),
    results: [
      ...(inventorySelectionData?.results ?? []),
      ...excludeInventoryOptions,
    ],
  };

  const { mutate: addSales, isPending: isAddingSales } = usePostRequest(
    "/api/sales",
    {
      invalidateQueryKey: ["sales"],
      mutationOptions: {
        onSuccess: () => {
          onCancel();
          SalesForm.resetFields();
        },
      },
    }
  );

  const { mutate: editSales, isPending: isEditingSales } = usePatchRequest(
    "/api/sales",
    {
      invalidateQueryKey: ["sales"],
      mutationOptions: {
        onSuccess: () => {
          onCancel();
          SalesForm.resetFields();
        },
      },
    }
  );

  React.useEffect(() => {
    SalesForm.setFieldsValue(selectedData);

    setExcludeInventoryOptions(selectedData?.sales_details ?? []);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedData]);

  const salesStatus = selectedData?.status;
  const isViewing = selectedData?.request_type === "view";
  const isEditing = selectedData?.request_type === "update";
  const isLoading = isAddingSales || isEditingSales;
  const disableAll = salesStatus === "completed" || isViewing;
  const nextStatusButton = getNextItem(
    salesStatusData,
    salesStatus as string,
    "value"
  );

  function calculateOverallSalesCost(values: {
    sales_details: { total?: { used_items_cost?: string } }[];
  }) {
    if (values.sales_details && values.sales_details.length >= 1) {
      return values.sales_details.reduce((acc, curr) => {
        const usedItemsCost = curr?.total?.used_items_cost
          ? removeNumberFormatting(curr.total.used_items_cost)
          : 0;
        return acc + usedItemsCost;
      }, 0);
    }

    return 0;
  }

  return (
    <>
      <Modal width="100rem" destroyOnClose onCancel={onCancel} {...rest}>
        <Form
          form={SalesForm}
          onFinish={(values) => {
            delete values.custom_id;
            delete values.created_by;

            values.status = SalesForm.getFieldValue("status");

            values.sales_details = values.sales_details?.map(
              ({
                amount,
                quantity,
                inventory_id,
                sales_details_id,
                breakdown,
                items_stock_out,
              }: any) => {
                let mergedBreakdown = breakdown.map((bd: any) => {
                  const matchingItem =
                    items_stock_out &&
                    items_stock_out.find(
                      (out: any) => out.item_stock_in_id === bd.item_stock_in_id
                    );

                  if (matchingItem) {
                    return {
                      ...bd,
                      item_stock_out_id: matchingItem.item_stock_out_id,
                    };
                  } else {
                    return bd;
                  }
                });

                const merged_items_stock_out = mergedBreakdown.map(
                  ({
                    used_quantity,
                    item_stock_in_id,
                    item_stock_out_id,
                  }: any) => {
                    return {
                      quantity: used_quantity,
                      item_stock_in_id,
                      item_stock_out_id,
                    };
                  }
                );
                return {
                  sales_details_id,
                  inventory_id,
                  quantity,
                  amount,
                  items_stock_out: merged_items_stock_out,
                };
              }
            );

            if (!isEditing) {
              addSales(values);
            } else {
              editSales({
                id: selectedData?.sales_id,
                payload: values,
              });
            }
          }}
          onValuesChange={(changedValues, values) => {
            if (changedValues.sales_details) {
              const index = changedValues.sales_details.findIndex(
                (item: any) => {
                  return item;
                }
              );
              let focusedItem = values.sales_details[index];
              if (
                changedValues.sales_details[index]?.quantity ||
                changedValues.sales_details[index]?.amount
              ) {
                const overallSalesCost = calculateOverallSalesCost(values);

                const total_amount =
                  Number(removeNumberFormatting(focusedItem?.amount)) *
                  Number(focusedItem?.quantity);
                const updatedItems = [...values.sales_details];
                updatedItems[index] = {
                  ...focusedItem,
                  total_amount,
                };
                const overallSalesAmount = updatedItems.reduce(
                  (acc, curr) => acc + curr?.total_amount ?? 0,
                  0
                );

                SalesForm.setFieldsValue({
                  sales_details: updatedItems,
                  overall_sales_amount: overallSalesAmount,
                  overall_sales_cost: overallSalesCost,
                  total_profit: overallSalesAmount - overallSalesCost,
                });
              }
            }
          }}
          disabled={disableAll}
          preserve={false}
          className="space-y-12"
        >
          <div className="flex justify-between items-center flex-wrap gap-y-8 gap-x-4">
            <h4>{requestTitle(selectedData?.request_type, "Sales")}</h4>
            {salesStatus && (
              <div
                className={twMerge(
                  "p-4 rounded-lg font-semibold text-sm tracking-wider capitalize min-w-[10rem] max-md:w-full text-center bg-opacity-40",
                  salesStatusPalette(salesStatus, "class")
                )}
              >
                {salesStatusPalette(salesStatus, "label")}
              </div>
            )}
          </div>
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {isEditing && (
                <Form.Item
                  label="Sales No."
                  name="custom_id"
                  rules={[{ required: true, message: "This is required!" }]}
                  className="col-span-full"
                >
                  <Input disabled={true} />
                </Form.Item>
              )}
              <Form.Item
                name="seller_name"
                label="Seller Name"
                rules={[{ required: true, message: "This is required!" }]}
              >
                <Input placeholder="Juan Dela Cruz" />
              </Form.Item>
              <Form.Item
                label="Sales Date"
                name="sales_date"
                rules={[{ required: true, message: "This is required!" }]}
              >
                <DatePicker />
              </Form.Item>
              <Form.Item
                label="Sales Type"
                name="sales_type"
                rules={[{ required: true, message: "This is required!" }]}
              >
                <Select options={salesTypeData} />
              </Form.Item>
              {isEditing && (
                <Form.Item
                  label="Created By"
                  name={["created_by", "full_name"]}
                  rules={[{ required: true, message: "This is required!" }]}
                >
                  <Input disabled={true} />
                </Form.Item>
              )}
              <Form.List name="sales_details">
                {(fields, { add, remove }) => {
                  return (
                    <div className="col-span-full space-y-4">
                      <h6 className="font-semibold">Ingredients</h6>
                      <div className="md:border border-standard-border rounded-lg grid grid-cols-1 gap-4 md:p-4">
                        {fields.map(({ name }) => {
                          return (
                            <InventoryChecker
                              key={name}
                              fieldKey={name}
                              type="form"
                              list={{ fields, add, remove }}
                              disabled={disableAll}
                              form={SalesForm}
                              loading={
                                isInventorySelectionLoading ||
                                isInventoryNextPageLoading
                              }
                              selectionData={inventorySelectionData}
                              selectionOption={mergeInventorySelectionData}
                              setExcludeInventoryOptions={
                                setExcludeInventoryOptions
                              }
                              fetchNextPage={fetchInventoryNextPage}
                              salesStatus={salesStatus}
                              selectedData={selectedData}
                            />
                          );
                        })}
                        {!disableAll && (
                          <InventoryChecker
                            list={{ add }}
                            disabled={disableAll}
                            type="blur"
                          />
                        )}
                      </div>
                    </div>
                  );
                }}
              </Form.List>
              <Form.Item name="notes" label="Notes" className="col-span-full">
                <Input.TextArea placeholder="Type here..." />
              </Form.Item>
              <div className="flex flex-wrap col-span-full justify-end">
                <div className="flex flex-wrap [&>*]:basis-full md:max-w-[30rem] gap-4 w-full">
                  <Form.Item
                    label="Total Sales Amount"
                    name="overall_sales_amount"
                    rules={[
                      {
                        required: true,
                        message: "This is required!",
                      },
                    ]}
                    getValueFromEvent={(e) =>
                      removeNumberFormatting(e.target.value)
                    }
                  >
                    <NumericFormat
                      customInput={Input}
                      prefix="₱ "
                      thousandSeparator={true}
                      placeholder="₱ 5,000"
                      disabled={true}
                    />
                  </Form.Item>
                  <Form.Item
                    label="Total Sales Cost"
                    name="overall_sales_cost"
                    rules={[
                      {
                        required: true,
                        message: "This is required!",
                      },
                    ]}
                    getValueFromEvent={(e) =>
                      removeNumberFormatting(e.target.value)
                    }
                  >
                    <NumericFormat
                      customInput={Input}
                      prefix="₱ "
                      thousandSeparator={true}
                      placeholder="₱ 5,000"
                      disabled={true}
                    />
                  </Form.Item>
                  <Form.Item
                    label="Total Profit"
                    name="total_profit"
                    rules={[
                      {
                        required: true,
                        message: "This is required!",
                      },
                    ]}
                    getValueFromEvent={(e) =>
                      removeNumberFormatting(e.target.value)
                    }
                  >
                    <NumericFormat
                      customInput={Input}
                      prefix="₱ "
                      thousandSeparator={true}
                      placeholder="₱ 5,000"
                      disabled={true}
                    />
                  </Form.Item>
                </div>
              </div>
            </div>
            <div className="flex max-md:flex-wrap [&>*]:basis-full md:[&>*]:basis-1/3 gap-4 md:max-w-[35rem] md:ml-auto justify-end items-center !mt-20">
              <Button type="default" onClick={onCancel} disabled={false}>
                Cancel
              </Button>
              {!disableAll && !isViewing && (
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={isLoading}
                  disabled={disableAll}
                >
                  {!isEditing ? "Create" : "Save"}
                </Button>
              )}
              {!disableAll && !isViewing && nextStatusButton && salesStatus && (
                <Button
                  type="primary"
                  loading={isLoading}
                  disabled={disableAll}
                  htmlType="submit"
                  onClick={() => {
                    SalesForm.setFieldsValue({
                      status: nextStatusButton.value,
                    });
                  }}
                >
                  {nextStatusButton.buttonLabel}
                </Button>
              )}
            </div>
          </div>
        </Form>
      </Modal>
      <InventoryModal
        open={isItemModalOpen}
        onCancel={() => setIsItemModalOpen(false)}
      />
    </>
  );
}
