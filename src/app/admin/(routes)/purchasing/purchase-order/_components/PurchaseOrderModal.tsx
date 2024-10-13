"use client";
import React from "react";
import moment from "moment";
import { AiFillMinusCircle } from "react-icons/ai";
import { IoMdAddCircle } from "react-icons/io";
import { NumericFormat, PatternFormat } from "react-number-format";
import { twMerge } from "tailwind-merge";
import InventoryModal from "@admin-routes/(routes)/inventory/_components/InventoryModal";
import SuppliersModal from "@admin-routes/(routes)/purchasing/suppliers/_components/SuppliersModal";
import { PurchaseOrders } from "@app-types/APIResponseTypes";
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
import purchaseOrderStatusData, {
  PurchaseOrderStatusTypes,
} from "@utils/data/purchaseOrderStatusData";
import {
  removeNumberFormatting,
  removeMobileFormatting,
  isObjectEmpty,
  requestTitle,
  getNextItem,
} from "@utils/helpers";
import { purchaseOrderStatusPalette } from "@utils/palettes";

import { PurchaseOrderModalData } from "./PurchaseOrderPage";

type PurchaseOrderModalProps = ModalProps<PurchaseOrderModalData>;
export default function PurchaseOrderModal({
  onCancel,
  selectedData,
  ...rest
}: PurchaseOrderModalProps) {
  const [PurchaseOrderForm] = Form.useForm();
  const [isSupplierModalOpen, setIsSupplierModalOpen] = React.useState(false);
  const [isItemModalOpen, setIsItemModalOpen] = React.useState(false);
  const [currentItemIndex, setCurrentItemIndex] = React.useState<number | null>(
    null
  );
  const [excludeSuppliersOptions, setExcludeSuppliersOptions] = React.useState<
    ExcludeOptionTypes[]
  >([]);
  const [excludeInventoryOptions, setExcludeInventoryOptions] = React.useState<
    ExcludeOptionTypes[]
  >([]);

  let excludeInventoryIds = excludeInventoryOptions.flatMap(
    ({ value }) => value
  );
  let excludeSuppliersIds = excludeSuppliersOptions.flatMap(
    ({ value }) => value
  );

  const {
    data: suppliersSelectionData,
    isFetching: isSuppliersSelectionLoading,
    isFetchingNextPage: isSuppliersNextPageLoading,
    fetchNextPage: fetchSupplierNextPage,
  } = useGetInfiniteRequest("/api/suppliers/selection", {
    queryKey: ["suppliers-selection", excludeSuppliersOptions],
    axiosConfig: {
      params: {
        exclude_ids: excludeSuppliersIds,
        take: 1,
      },
    },
    queryOptions: {
      enabled: rest.open,
    },
  });

  const {
    data: itemsSelectionData,
    isFetching: isInventorySelectionLoading,
    isFetchingNextPage: isInventoryNextPageLoading,
    fetchNextPage: fetchInventoryNextPage,
  } = useGetInfiniteRequest("/api/inventories/selection", {
    queryKey: ["inventory-selection", excludeInventoryOptions],
    axiosConfig: {
      params: {
        exclude_ids: excludeInventoryIds,
        item_type: "ingredient",
        take: 1,
      },
    },
    queryOptions: {
      enabled: rest.open,
    },
  });

  let mergeInventorySelectionData = {
    count:
      Number(itemsSelectionData?.count ?? 1) +
      Number(excludeInventoryOptions?.length),
    results: [
      ...(itemsSelectionData?.results ?? []),
      ...excludeInventoryOptions,
    ],
  };

  let mergeSuppliersSelectionData = {
    count:
      Number(suppliersSelectionData?.count ?? 1) +
      Number(excludeSuppliersOptions?.length),
    results: [
      ...(suppliersSelectionData?.results ?? []),
      ...excludeSuppliersOptions,
    ],
  };

  const { mutate: addPurchaseOrder, isPending: isAddingPurchaseOrder } =
    usePostRequest("/api/purchase-orders", {
      invalidateQueryKey: ["purchase-orders"],
      mutationOptions: {
        onSuccess: () => {
          PurchaseOrderForm.resetFields();
          onCancel();
        },
      },
    });

  const { mutate: editPurchaseOrder, isPending: isEditingPurchaseOrder } =
    usePatchRequest("/api/purchase-orders", {
      invalidateQueryKey: ["purchase-orders"],
      mutationOptions: {
        onSuccess: () => {
          PurchaseOrderForm.resetFields();
          onCancel();
        },
      },
    });

  React.useEffect(() => {
    PurchaseOrderForm.setFieldsValue(selectedData);
    setExcludeSuppliersOptions(
      selectedData?.supplier ? [selectedData.supplier] : []
    );
    setExcludeInventoryOptions(selectedData?.purchase_order_details ?? []);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedData]);

  const purchaseOrderStatus = selectedData?.status;
  const isViewing = selectedData?.request_type === "view";
  const isEditing = selectedData?.request_type === "update";
  const isLoading = isAddingPurchaseOrder || isEditingPurchaseOrder;
  const disableAll = purchaseOrderStatus === "completed" || isViewing;
  const nextStatusButton = getNextItem(
    purchaseOrderStatusData,
    purchaseOrderStatus as string,
    "value"
  );

  return (
    <>
      <Modal width="100rem" destroyOnClose onCancel={onCancel} {...rest}>
        <Form
          form={PurchaseOrderForm}
          onFinish={(values) => {
            delete values.supplier_contact_no;
            delete values.custom_id;
            delete values.order_by;

            values.status = PurchaseOrderForm.getFieldValue("status");

            values.purchase_order_details = values.purchase_order_details.map(
              ({ total_cost, ...rest }: { total_cost: number }) => rest
            );

            if (!isEditing) {
              addPurchaseOrder(values);
            } else {
              editPurchaseOrder({
                id: selectedData?.purchase_order_id as string,
                payload: values,
              });
            }
          }}
          onValuesChange={(changedValues, values) => {
            if (changedValues.purchase_order_details) {
              const index = changedValues.purchase_order_details.findIndex(
                (item: any) => {
                  return item;
                }
              );
              let focusedItem = values.purchase_order_details[index];
              if (
                changedValues.purchase_order_details[index]?.quantity ||
                changedValues.purchase_order_details[index]?.cost
              ) {
                const total_cost =
                  Number(removeNumberFormatting(focusedItem?.cost)) *
                  Number(focusedItem?.quantity);
                const updatedItems = [...values.purchase_order_details];
                updatedItems[index] = {
                  ...focusedItem,
                  total_cost,
                };
                const overallPurchaseCost = updatedItems.reduce(
                  (acc, curr) => acc + curr?.total_cost ?? 0,
                  0
                );
                PurchaseOrderForm.setFieldsValue({
                  purchase_order_details: updatedItems,
                  overall_purchase_cost: overallPurchaseCost,
                });
              }
            }
          }}
          disabled={disableAll}
          preserve={false}
          className="space-y-12"
        >
          <div className="flex justify-between items-center flex-wrap gap-y-8 gap-x-4">
            <h4>
              {requestTitle(selectedData?.request_type, "Purchase Order")}
            </h4>
            {purchaseOrderStatus && (
              <div
                className={twMerge(
                  "p-4 rounded-lg font-semibold text-sm tracking-wider capitalize min-w-[10rem] max-md:w-full text-center bg-opacity-40",
                  purchaseOrderStatusPalette(purchaseOrderStatus, "class")
                )}
              >
                {purchaseOrderStatusPalette(purchaseOrderStatus, "label")}
              </div>
            )}
          </div>
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {isEditing && (
                <Form.Item
                  label="Purchase Order No."
                  name="custom_id"
                  rules={[{ required: true, message: "This is required!" }]}
                  className="col-span-full"
                >
                  <Input disabled={true} />
                </Form.Item>
              )}
              <Form.Item
                name="supplier_id"
                label="Supplier Name"
                rules={[{ required: true, message: "This is required!" }]}
              >
                <Select.Infinite
                  options={mergeSuppliersSelectionData.results}
                  optionMaxCount={mergeSuppliersSelectionData?.count}
                  loading={
                    isSuppliersSelectionLoading || isSuppliersNextPageLoading
                  }
                  dropdownRender={(menu) => (
                    <>
                      {menu}
                      <Button
                        type="primary"
                        block
                        className="!rounded-none"
                        icon={<IoMdAddCircle />}
                        onClick={() => setIsSupplierModalOpen(true)}
                      >
                        Add Supplier
                      </Button>
                    </>
                  )}
                  onChange={async (id, prevId) => {
                    let selectedSupplier =
                      await suppliersSelectionData.results.find(
                        ({ value }: { value: string }) => {
                          return value === id;
                        }
                      );

                    if (!id) {
                      return setExcludeSuppliersOptions((prevState) =>
                        prevState.filter((obj) => obj.value !== prevId)
                      );
                    }

                    if (id && prevId) {
                      return setExcludeSuppliersOptions((prevState) =>
                        prevState.map((obj) =>
                          obj.value === prevId
                            ? {
                                ...selectedSupplier,
                                disabled: true,
                                className: "!hidden",
                              }
                            : obj
                        )
                      );
                    }

                    setExcludeSuppliersOptions((prevState) => [
                      ...prevState,
                      {
                        ...selectedSupplier,
                        disabled: true,
                        className: "!hidden",
                      },
                    ]);

                    PurchaseOrderForm.setFieldsValue({
                      supplier_contact_no: selectedSupplier.contact_no,
                    });
                  }}
                  onScrollBottom={(inView) => {
                    if (inView) {
                      fetchSupplierNextPage();
                    }
                  }}
                />
              </Form.Item>
              <Form.Item
                label="Order Date"
                name="order_date"
                rules={[{ required: true, message: "This is required!" }]}
              >
                <DatePicker />
              </Form.Item>
              <Form.Item
                name="supplier_contact_no"
                label="Supplier Contact No."
                rules={[
                  { required: true, message: "" },
                  {
                    validator: (rule, value) => {
                      const cleanValue = value
                        ? removeMobileFormatting(value).toString()
                        : "";
                      if (value && /^(09|\+639)\d{9}$/.test(cleanValue)) {
                        return Promise.resolve();
                      } else {
                        return Promise.reject("Must be a valid mobile number");
                      }
                    },
                  },
                ]}
                getValueFromEvent={(e) =>
                  removeMobileFormatting(e.target.value)
                }
              >
                <PatternFormat
                  format="#### ### ####"
                  placeholder="09XX XXXX XXXX"
                  customInput={Input}
                  disabled={true}
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
              <Form.List name="purchase_order_details">
                {(fields, { add, remove }) => {
                  return (
                    <div className="col-span-full space-y-4">
                      <h6 className="font-semibold">Items</h6>
                      <div className="md:border border-standard-border rounded-lg grid grid-cols-1 gap-4 md:p-4">
                        {fields.map(({ name, key }, index) => {
                          return (
                            <div
                              className="grid md:grid-cols-4 grid-cols-1 gap-4 p-4 pt-8 relative border border-standard-border rounded-md"
                              key={index}
                            >
                              {fields.length > 1 && !disableAll && (
                                <AiFillMinusCircle
                                  className="absolute top-0 right-0 m-2 text-primary-100 text-3xl cursor-pointer"
                                  onClick={() => {
                                    let activeItemValue =
                                      PurchaseOrderForm.getFieldValue([
                                        "purchase_order_details",
                                        name,
                                        "inventory_id",
                                      ]);
                                    setExcludeInventoryOptions((prevState) =>
                                      prevState.filter(
                                        (obj) => obj.value !== activeItemValue
                                      )
                                    );
                                    remove(name);
                                  }}
                                />
                              )}
                              <Form.Item
                                label="Item Name"
                                name={[name, "inventory_id"]}
                                rules={[
                                  {
                                    required: true,
                                    message: "This is required!",
                                  },
                                ]}
                              >
                                <Select.Infinite
                                  options={mergeInventorySelectionData.results}
                                  optionMaxCount={
                                    mergeInventorySelectionData?.count
                                  }
                                  loading={
                                    isInventorySelectionLoading ||
                                    isInventoryNextPageLoading
                                  }
                                  dropdownRender={(menu) => (
                                    <>
                                      {menu}
                                      <Button
                                        type="primary"
                                        block
                                        className="!rounded-none"
                                        icon={<IoMdAddCircle />}
                                        onClick={() => {
                                          setCurrentItemIndex(name);
                                          setIsItemModalOpen(true);
                                        }}
                                      >
                                        Add Item
                                      </Button>
                                    </>
                                  )}
                                  onScrollBottom={(inView) => {
                                    if (inView) {
                                      fetchInventoryNextPage();
                                    }
                                  }}
                                  onChange={async (id, prevId) => {
                                    let selectedItemData =
                                      await itemsSelectionData?.results.find(
                                        ({ value }: { value: string }) =>
                                          value === id
                                      );

                                    if (!id) {
                                      return setExcludeInventoryOptions(
                                        (prevState) =>
                                          prevState.filter(
                                            (obj) => obj.value !== prevId
                                          )
                                      );
                                    }

                                    if (id && prevId) {
                                      return setExcludeInventoryOptions(
                                        (prevState) =>
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

                                    setExcludeInventoryOptions((prevState) => [
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
                              <Form.Item
                                label="Quantity"
                                name={[name, "quantity"]}
                                rules={[
                                  {
                                    required: true,
                                    message: "This is required!",
                                  },
                                ]}
                                getValueFromEvent={(e) => {
                                  return removeNumberFormatting(e.target.value);
                                }}
                              >
                                <NumericFormat
                                  customInput={Input}
                                  thousandSeparator={true}
                                  placeholder="0"
                                />
                              </Form.Item>
                              <Form.Item
                                label="Cost"
                                name={[name, "cost"]}
                                rules={[
                                  {
                                    required: true,
                                    message: "This is required!",
                                  },
                                ]}
                                getValueFromEvent={(e) => {
                                  return removeNumberFormatting(e.target.value);
                                }}
                              >
                                <NumericFormat
                                  customInput={Input}
                                  prefix="₱ "
                                  thousandSeparator={true}
                                  placeholder="₱ 5,000"
                                />
                              </Form.Item>
                              <Form.Item
                                label="Total"
                                name={[name, "total_cost"]}
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
                          );
                        })}
                        {!disableAll && (
                          <div
                            className={
                              "p-4 pt-8 relative border border-standard-border rounded-md"
                            }
                          >
                            <div className="blur-sm grid md:grid-cols-4 grid-cols-1 gap-4">
                              <Form.Item label="Item Name">
                                <Select placeholder="Alamang"></Select>
                              </Form.Item>
                              <Form.Item label="Quantity">
                                <Input placeholder="0" />
                              </Form.Item>
                              <Form.Item label="Cost">
                                <NumericFormat
                                  customInput={Input}
                                  prefix="₱ "
                                  thousandSeparator={true}
                                  placeholder="₱ 5,000"
                                />
                              </Form.Item>
                              <Form.Item label="Total">
                                <NumericFormat
                                  customInput={Input}
                                  prefix="₱ "
                                  thousandSeparator={true}
                                  placeholder="₱ 5,000"
                                  disabled={true}
                                />
                              </Form.Item>
                            </div>
                            {!disableAll && (
                              <div
                                className={
                                  "absolute top-0 left-0 h-full w-full flex justify-center items-center cursor-pointer"
                                }
                                onClick={() => {
                                  add();
                                }}
                              >
                                <IoMdAddCircle
                                  className={"text-[3rem] text-primary"}
                                />
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                }}
              </Form.List>
              <div className="col-span-full grid grid-cols-1 md:grid-cols-4">
                <Form.Item
                  label="Grand Total"
                  name="overall_purchase_cost"
                  rules={[
                    {
                      required: true,
                      message: "This is required!",
                    },
                  ]}
                  className="md:col-start-4 md:px-4"
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
              {!disableAll &&
                !isViewing &&
                nextStatusButton &&
                purchaseOrderStatus && (
                  <Button
                    type="primary"
                    loading={isLoading}
                    disabled={disableAll}
                    htmlType="submit"
                    onClick={() => {
                      PurchaseOrderForm.setFieldsValue({
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
        afterCreate={({ payload }) => {
          PurchaseOrderForm.setFieldsValue({
            supplier_id: payload.supplier_id,
            supplier_contact_no: payload.contact_no,
          });
        }}
      />
      <InventoryModal
        open={isItemModalOpen}
        onCancel={() => setIsItemModalOpen(false)}
        afterCreate={({ payload }) => {
          PurchaseOrderForm.setFieldValue(
            ["purchase_order_details", currentItemIndex, "inventory_id"],
            payload.inventory_id
          );
        }}
      />
    </>
  );
}
