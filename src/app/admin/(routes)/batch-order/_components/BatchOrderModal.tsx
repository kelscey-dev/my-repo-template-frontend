"use client";
import React from "react";

import { IoMdAddCircle } from "react-icons/io";
import { NumericFormat, PatternFormat } from "react-number-format";
import { twMerge } from "tailwind-merge";
import InventoryModal from "@admin-routes/(routes)/inventory/_components/InventoryModal";
import SuppliersModal from "@admin-routes/(routes)/purchasing/suppliers/_components/SuppliersModal";

import { BatchOrders } from "@app-types/APIResponseTypes";

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

import batchOrderStatusData, {
  BatchOrderStatusTypes,
} from "@utils/data/batchOrderStatusData";

import {
  removeNumberFormatting,
  removeMobileFormatting,
  requestTitle,
  getNextItem,
} from "@utils/helpers";

import { batchOrderStatusPalette } from "@utils/palettes";

import { BatchOrderModalData } from "./BatchOrderPage";
import InventoryChecker from "./InventoryChecker";

type BatchOrderModalProps = ModalProps<BatchOrderModalData>;

export default function BatchOrderModal({
  onCancel,
  selectedData,
  ...rest
}: BatchOrderModalProps) {
  const [BatchOrderForm] = Form.useForm();
  const [isSupplierModalOpen, setIsSupplierModalOpen] = React.useState(false);
  const [isItemModalOpen, setIsItemModalOpen] = React.useState(false);

  const [excludeInventoryProductOptions, setExcludeInventoryProductOptions] =
    React.useState<ExcludeOptionTypes[]>([]);

  const [
    excludeInventoryIngredientOptions,
    setExcludeInventoryIngredientOptions,
  ] = React.useState<ExcludeOptionTypes[]>([]);

  let excludeInventoryProductIds = excludeInventoryProductOptions.flatMap(
    ({ value }) => value
  );

  let excludeInventoryIngredientIds = excludeInventoryIngredientOptions.flatMap(
    ({ value }) => value
  );

  const {
    data: inventoryProductSelectionData,
    isFetching: isInventoryProductSelectionLoading,
    isFetchingNextPage: isInventoryProductNextPageLoading,
    fetchNextPage: fetchInventoryProductNextPage,
  } = useGetInfiniteRequest("/api/inventories/selection", {
    queryKey: ["inventory-product-selection", excludeInventoryProductOptions],
    axiosConfig: {
      params: {
        exclude_ids: excludeInventoryProductIds,
        item_type: "product",
        take: 1,
      },
    },
    queryOptions: {
      enabled: rest.open,
    },
  });

  const {
    data: inventoryIngredientSelectionData,
    isFetching: isInventoryIngredientSelectionLoading,
    isFetchingNextPage: isInventoryIngredientNextPageLoading,
    fetchNextPage: fetchInventoryIngredientNextPage,
  } = useGetInfiniteRequest("/api/inventories/selection", {
    queryKey: [
      "inventory-ingredient-selection",
      excludeInventoryIngredientOptions,
    ],
    axiosConfig: {
      params: {
        exclude_ids: excludeInventoryIngredientIds,
        item_type: "ingredient",
        take: 1,
      },
    },
    queryOptions: {
      enabled: rest.open,
    },
  });

  let mergeInventoryProductSelectionData = {
    count:
      Number(inventoryProductSelectionData?.count ?? 1) +
      Number(excludeInventoryProductOptions?.length),
    results: [
      ...(inventoryProductSelectionData?.results ?? []),
      ...excludeInventoryProductOptions,
    ],
  };

  let mergeInventoryIngredientSelectionData = {
    count:
      Number(inventoryIngredientSelectionData?.count ?? 1) +
      Number(excludeInventoryIngredientOptions?.length),
    results: [
      ...(inventoryIngredientSelectionData?.results ?? []),
      ...excludeInventoryIngredientOptions,
    ],
  };

  const { mutate: addBatchOrder, isPending: isAddingBatchOrder } =
    usePostRequest("/api/batch-orders", {
      invalidateQueryKey: ["batch-orders"],
      mutationOptions: {
        onSuccess: () => {
          onCancel();
          BatchOrderForm.resetFields();
        },
      },
    });

  const { mutate: editBatchOrder, isPending: isEditingBatchOrder } =
    usePatchRequest("/api/batch-orders", {
      invalidateQueryKey: ["batch-orders"],
      mutationOptions: {
        onSuccess: () => {
          onCancel();
          BatchOrderForm.resetFields();
        },
      },
    });

  React.useEffect(() => {
    if (!rest.open) {
      BatchOrderForm.resetFields();
    }
    BatchOrderForm.setFieldsValue(selectedData);
    setExcludeInventoryProductOptions(
      selectedData?.product ? [selectedData.product] : []
    );
    setExcludeInventoryIngredientOptions(
      selectedData?.batch_order_details ?? []
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedData]);

  const batchOrderStatus = selectedData?.status;
  const isViewing = selectedData?.request_type === "view";
  const isEditing = selectedData?.request_type === "update";
  const isLoading = isAddingBatchOrder || isEditingBatchOrder;
  const disableAll =
    ["completed", "in_progress"].includes(batchOrderStatus as string) ||
    isViewing;
  const isStatusComplete = batchOrderStatus === "completed";
  const nextStatusButton = getNextItem(
    batchOrderStatusData,
    batchOrderStatus as string,
    "value"
  );

  function calculateOverallBatchCost(values: {
    batch_order_details: { total?: { used_items_cost?: string } }[];
  }) {
    if (values.batch_order_details && values.batch_order_details.length >= 1) {
      return values.batch_order_details.reduce((acc, curr) => {
        const usedItemsCost = curr?.total?.used_items_cost
          ? removeNumberFormatting(curr.total.used_items_cost)
          : 0;
        return acc + usedItemsCost;
      }, 0);
    }

    return 0;
  }

  function updateCostPerBottle(
    overallBatchCost: number,
    quantity: number,
    formKey: string
  ) {
    const estimatedCostPerBottle = Number(
      (overallBatchCost / quantity).toFixed(2)
    );

    BatchOrderForm.setFieldValue(formKey, estimatedCostPerBottle);
  }

  return (
    <>
      <Modal width="100rem" destroyOnClose onCancel={onCancel} {...rest}>
        <Form
          form={BatchOrderForm}
          onFinish={(values) => {
            delete values.custom_id;
            delete values.order_by;

            values.status = BatchOrderForm.getFieldValue("status");

            values.batch_order_details = values.batch_order_details?.map(
              ({
                quantity,
                inventory_id,
                batch_order_details_id,
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
                  batch_order_details_id,
                  inventory_id,
                  quantity,
                  items_stock_out: merged_items_stock_out,
                };
              }
            );

            if (!isEditing) {
              addBatchOrder(values);
            } else {
              editBatchOrder({
                id: selectedData?.batch_order_id,
                payload: values,
              });
            }
          }}
          onValuesChange={(changedValues, values) => {
            const overallBatchCost = calculateOverallBatchCost(values);

            if (changedValues.planned_production_quantity) {
              updateCostPerBottle(
                overallBatchCost,
                values.planned_production_quantity,
                "planned_estimated_cost_per_bottle"
              );
            }

            if (changedValues.actual_production_quantity) {
              updateCostPerBottle(
                overallBatchCost,
                values.actual_production_quantity,
                "actual_estimated_cost_per_bottle"
              );
            }

            if (changedValues.batch_order_details) {
              updateCostPerBottle(
                overallBatchCost,
                values.planned_production_quantity,
                "planned_estimated_cost_per_bottle"
              );
              BatchOrderForm.setFieldValue(
                "overall_batch_cost",
                overallBatchCost
              );
            }
          }}
          disabled={disableAll}
          preserve={false}
          className="space-y-12"
        >
          <div className="flex justify-between items-center flex-wrap gap-y-8 gap-x-4">
            <h4>{requestTitle(selectedData?.request_type, "Batch Order")}</h4>
            {batchOrderStatus && (
              <div
                className={twMerge(
                  "p-4 rounded-lg font-semibold text-sm tracking-wider capitalize min-w-[10rem] max-md:w-full text-center bg-opacity-40",
                  batchOrderStatusPalette(batchOrderStatus, "class")
                )}
              >
                {batchOrderStatusPalette(batchOrderStatus, "label")}
              </div>
            )}
          </div>
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {isEditing && (
                <Form.Item
                  label="Batch Order No."
                  name="custom_id"
                  rules={[{ required: true, message: "This is required!" }]}
                  className="col-span-full"
                >
                  <Input disabled={true} />
                </Form.Item>
              )}
              <Form.Item
                name="inventory_id"
                label="Product Name"
                rules={[{ required: true, message: "This is required!" }]}
              >
                <Select.Infinite
                  options={mergeInventoryProductSelectionData.results}
                  optionMaxCount={mergeInventoryProductSelectionData?.count}
                  loading={
                    isInventoryProductSelectionLoading ||
                    isInventoryProductNextPageLoading
                  }
                  dropdownRender={(menu) => (
                    <>
                      {menu}
                      <Button
                        type="primary"
                        block
                        className="!rounded-none"
                        icon={<IoMdAddCircle />}
                        onClick={() => setIsItemModalOpen(true)}
                      >
                        Add Product
                      </Button>
                    </>
                  )}
                  onScrollBottom={(inView) => {
                    if (inView) {
                      fetchInventoryProductNextPage();
                    }
                  }}
                  onChange={async (id, prevId) => {
                    let selectedItemData =
                      await inventoryProductSelectionData?.results.find(
                        ({ value }: { value: string }) => value === id
                      );

                    if (!id) {
                      return setExcludeInventoryProductOptions((prevState) =>
                        prevState.filter((obj) => obj.value !== prevId)
                      );
                    }

                    if (id && prevId) {
                      return setExcludeInventoryProductOptions((prevState) =>
                        prevState.map((obj) =>
                          obj.value === prevId
                            ? {
                                ...selectedItemData,
                                disabled: true,
                                className: "!hidden",
                              }
                            : obj
                        )
                      );
                    }

                    setExcludeInventoryProductOptions((prevState) => [
                      ...prevState,
                      {
                        ...selectedItemData,
                        disabled: true,
                        className: "!hidden",
                      },
                    ]);
                  }}
                />
              </Form.Item>
              {isEditing && (
                <Form.Item
                  label="Order By"
                  name={["order_by", "full_name"]}
                  rules={[{ required: true, message: "This is required!" }]}
                >
                  <Input disabled={true} />
                </Form.Item>
              )}
              <Form.Item
                label="Planned Date"
                name="planned_date"
                rules={[{ required: true, message: "This is required!" }]}
              >
                <DatePicker />
              </Form.Item>
              <Form.Item
                label="Planned Production Quantity"
                name={"planned_production_quantity"}
                rules={[{ required: true, message: "This is required!" }]}
                getValueFromEvent={(e) =>
                  Number(removeMobileFormatting(e.target.value))
                }
              >
                <NumericFormat
                  customInput={Input}
                  thousandSeparator={true}
                  placeholder="0"
                  addonAfter={<Select value="Bottles" disabled={true} />}
                />
              </Form.Item>
              {isStatusComplete && (
                <Form.Item
                  label="Actual Date"
                  name="actual_date"
                  rules={[{ required: true, message: "This is required!" }]}
                >
                  <DatePicker />
                </Form.Item>
              )}
              {batchOrderStatus && batchOrderStatus !== "pending" && (
                <Form.Item
                  label="Actual Production Quantity"
                  name={"actual_production_quantity"}
                  rules={[
                    { required: true, message: "" },
                    {
                      validator: (rule, value) => {
                        const cleanValue =
                          value && removeNumberFormatting(value);
                        if (value && cleanValue >= 1) {
                          return Promise.resolve();
                        } else {
                          return Promise.reject(`This is required!`);
                        }
                      },
                    },
                  ]}
                  getValueFromEvent={(e) =>
                    Number(removeMobileFormatting(e.target.value))
                  }
                >
                  <NumericFormat
                    customInput={Input}
                    thousandSeparator={true}
                    placeholder="0"
                    disabled={isViewing || isStatusComplete}
                    addonAfter={<Select value="Bottles" disabled={true} />}
                  />
                </Form.Item>
              )}
              <Form.List name="batch_order_details">
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
                              form={BatchOrderForm}
                              loading={
                                isInventoryIngredientSelectionLoading ||
                                isInventoryIngredientNextPageLoading
                              }
                              selectionData={inventoryIngredientSelectionData}
                              selectionOption={
                                mergeInventoryIngredientSelectionData
                              }
                              setExcludeInventoryIngredientOptions={
                                setExcludeInventoryIngredientOptions
                              }
                              fetchNextPage={fetchInventoryIngredientNextPage}
                              batchOrderStatus={batchOrderStatus}
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
              <div className="col-span-full grid grid-cols-1 md:grid-cols-4 gap-4">
                <Form.Item
                  label="Planned Estimated Cost Per Bottle"
                  name="planned_estimated_cost_per_bottle"
                  rules={[
                    {
                      required: true,
                      message: "This is required!",
                    },
                  ]}
                  className="md:col-start-4"
                  getValueFromEvent={(e) =>
                    removeNumberFormatting(e.target.value)
                  }
                >
                  <NumericFormat
                    customInput={Input}
                    prefix="₱ "
                    thousandSeparator={true}
                    placeholder="₱ 0"
                    disabled={true}
                  />
                </Form.Item>
                {batchOrderStatus && batchOrderStatus !== "pending" && (
                  <Form.Item
                    label="Actual Estimated Cost Per Bottle"
                    name="actual_estimated_cost_per_bottle"
                    rules={[
                      {
                        required: true,
                        message: "This is required!",
                      },
                    ]}
                    className="md:col-start-4"
                    getValueFromEvent={(e) =>
                      removeNumberFormatting(e.target.value)
                    }
                  >
                    <NumericFormat
                      customInput={Input}
                      prefix="₱ "
                      thousandSeparator={true}
                      placeholder="₱ 0"
                      disabled={true}
                    />
                  </Form.Item>
                )}
                <Form.Item
                  label="Overall Batch Cost"
                  name="overall_batch_cost"
                  rules={[
                    {
                      required: true,
                      message: "This is required!",
                    },
                  ]}
                  className="md:col-start-4"
                  getValueFromEvent={(e) =>
                    removeNumberFormatting(e.target.value)
                  }
                >
                  <NumericFormat
                    customInput={Input}
                    prefix="₱ "
                    thousandSeparator={true}
                    placeholder="₱ 0"
                    disabled={true}
                  />
                </Form.Item>
              </div>
            </div>
            <div className="flex max-md:flex-wrap [&>*]:basis-full md:[&>*]:basis-1/3 gap-4 md:max-w-[35rem] md:ml-auto justify-end items-center !mt-20">
              <Button type="default" onClick={onCancel} disabled={false}>
                Cancel
              </Button>
              {!isStatusComplete && !isViewing && (
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={isLoading}
                  disabled={isStatusComplete}
                >
                  {!isEditing ? "Create" : "Save"}
                </Button>
              )}
              {!isStatusComplete &&
                !isViewing &&
                nextStatusButton &&
                batchOrderStatus && (
                  <Button
                    type="primary"
                    loading={isLoading}
                    disabled={isStatusComplete}
                    htmlType="submit"
                    onClick={() => {
                      BatchOrderForm.setFieldsValue({
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
      <SuppliersModal
        open={isSupplierModalOpen}
        onCancel={() => setIsSupplierModalOpen(false)}
      />
      <InventoryModal
        open={isItemModalOpen}
        onCancel={() => setIsItemModalOpen(false)}
        itemType="product"
        afterCreate={({ payload }) => {
          BatchOrderForm.setFieldsValue({
            inventory_id: payload.inventory_id,
          });
        }}
      />
    </>
  );
}
