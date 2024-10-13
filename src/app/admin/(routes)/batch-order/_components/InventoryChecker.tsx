import React from "react";
import { FormInstance, Spin } from "antd";
import { useWatch } from "antd/es/form/Form";
import { FormListFieldData } from "antd/es/form/FormList";
import { AiFillMinusCircle } from "react-icons/ai";
import { IoMdAddCircle } from "react-icons/io";
import { NumericFormat } from "react-number-format";
import { Inventories } from "@app-types/APIResponseTypes";
import Button from "@components/commons/Button";
import Form from "@components/commons/Form";
import Input from "@components/commons/Input";
import Select from "@components/commons/Select";

import Table from "@components/commons/Table";

import { useGetByIdRequest, useGetRequest } from "@utils/api/apiRequests";

import { BatchOrderStatusTypes } from "@utils/data/batchOrderStatusData";

import { removeNumberFormatting } from "@utils/helpers";

import { numberSeparator } from "../../../../../utils/helpers";
import { BatchOrderModalData } from "./BatchOrderPage";
import { inventoryCheckerColumns } from "./tableColumns";

type InventoryCheckerTypes =
  | {
      type: "form";
      list: {
        fields: FormListFieldData[];
        add: () => void;
        remove: (name: number) => void;
      };
      form: FormInstance;
      disabled: boolean;
      loading: boolean;
      setExcludeInventoryIngredientOptions: React.Dispatch<
        React.SetStateAction<any[]>
      >;
      selectionOption: {
        count: number;
        results: any[];
      };
      fetchNextPage: () => void;
      selectionData: any;
      fieldKey: number;
      batchOrderStatus: BatchOrderStatusTypes | undefined;
      selectedData: BatchOrderModalData;
    }
  | {
      type: "blur";
      list: {
        fields?: never;
        add: () => void;
        remove?: never;
      };
      form?: never;
      disabled: boolean;
      loading?: never;
      batchOrderStatus?: never;
      setExcludeInventoryIngredientOptions?: never;
      selectionOption?: never;
      fetchNextPage?: never;
      selectionData?: never;
      fieldKey?: never;
      selectedData?: never;
    };

function filterDataByQuantity(data: any, quantity: number) {
  let filteredData = [];
  let cumulativeQuantity = 0;

  let overall_used_quantity = 0;
  let overall_remaining_quantity = 0;
  let overall_remaining_unit_cost = 0;
  let overall_used_items_cost = 0;

  if (quantity <= 0 || !data?.results) {
    return [];
  }

  for (const item of data?.results) {
    if (cumulativeQuantity < quantity) {
      const used_quantity = Math.min(
        quantity - cumulativeQuantity,
        item.remaining_quantity
      );
      const remaining_quantity = item.remaining_quantity - used_quantity;
      const unit_cost = item.cost;
      const used_items_cost = used_quantity * item.cost;

      overall_used_quantity += used_quantity;
      overall_remaining_unit_cost += unit_cost;
      overall_remaining_quantity += remaining_quantity;
      overall_used_items_cost += used_items_cost;

      filteredData.push({
        ...item,
        used_quantity,
        remaining_quantity,
        unit_cost: `₱ ${numberSeparator(unit_cost, 0)}`,
        used_items_cost: `₱ ${numberSeparator(used_items_cost, 0)}`,
      });

      cumulativeQuantity += used_quantity;
    } else {
      break;
    }
  }

  filteredData.push({
    item_stock_in_id: "total_key",
    purchase_order_id: "Total",
    used_quantity: numberSeparator(overall_used_quantity, 0),
    remaining_quantity: numberSeparator(overall_remaining_quantity, 0),
    unit_cost: `₱ ${numberSeparator(overall_remaining_unit_cost, 0)}`,
    used_items_cost: `₱ ${numberSeparator(overall_used_items_cost, 0)}`,
  });

  return filteredData;
}

export default function InventoryChecker(props: InventoryCheckerTypes) {
  const {
    form,
    list: { fields = [], add, remove },
    disabled,
    loading = false,
    setExcludeInventoryIngredientOptions,
    selectionOption,
    fetchNextPage,
    selectionData,
    batchOrderStatus,
    fieldKey,
    selectedData,
  } = props;

  const inventoryID = useWatch(
    ["batch_order_details", fieldKey, "inventory_id"],
    form
  );

  const quantity = useWatch(
    ["batch_order_details", fieldKey, "quantity"],
    form
  );

  const {
    data: inventoryData,
    isFetching: isInventoryLoading,
    isSuccess,
  } = useGetByIdRequest<Inventories>(
    "/api/inventories/inventory-transaction",
    inventoryID,
    {
      queryKey: [
        "inventory-transactions",
        inventoryID,
        selectedData?.batch_order_id,
      ],
      axiosConfig: {
        params: {
          take: 10,
          excluded_batch_order_id: selectedData?.batch_order_id,
          inventory_type: "batch",
        },
      },
      queryOptions: {
        enabled: Boolean(inventoryID),
      },
    }
  );

  const filteredDataByQuantity = filterDataByQuantity(inventoryData, quantity);

  React.useEffect(() => {
    if (isSuccess) {
      form?.setFieldValue(
        ["batch_order_details", fieldKey, "breakdown"],
        filterDataByQuantity(inventoryData, quantity).slice(0, -1)
      );

      form?.setFieldValue(
        ["batch_order_details", fieldKey, "total"],
        filterDataByQuantity(inventoryData, quantity).slice(-1)[0]
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuccess]);

  if (props.type === "form") {
    return (
      <div
        className="grid md:grid-cols-2 grid-cols-1 gap-4 p-4 pt-8 relative border border-standard-border rounded-md"
        key={fieldKey}
      >
        {fields?.length > 1 && !disabled && (
          <AiFillMinusCircle
            className="absolute top-0 right-0 m-2 text-primary-100 text-3xl cursor-pointer"
            onClick={() => {
              let activeItemValue = form?.getFieldValue([
                "batch_order_details",
                fieldKey,
                "inventory_id",
              ]);
              setExcludeInventoryIngredientOptions!((prevState) =>
                prevState.filter((obj) => obj.value !== activeItemValue)
              );
              remove!(fieldKey ?? 0);
            }}
          />
        )}
        <Form.Item
          label="Item Name"
          name={[fieldKey, "inventory_id"]}
          rules={[
            {
              required: true,
              message: "This is required!",
            },
          ]}
        >
          <Select.Infinite
            options={selectionOption?.results}
            optionMaxCount={selectionOption?.count ?? 0}
            loading={loading}
            onScrollBottom={(inView) => {
              if (inView) {
                fetchNextPage!();
              }
            }}
            onChange={async (id, prevId) => {
              let selectedItemData = await selectionData?.results.find(
                ({ value }: { value: string }) => value === id
              );

              if (!id) {
                return setExcludeInventoryIngredientOptions!((prevState) =>
                  prevState.filter((obj) => obj.value !== prevId)
                );
              }

              if (id && prevId) {
                return setExcludeInventoryIngredientOptions!((prevState) =>
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

              setExcludeInventoryIngredientOptions!((prevState) => [
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
          label={`Quantity`}
          extra={
            inventoryID && (
              <div>
                {`(Available: ${
                  (inventoryData?.overall_total_remaining_quantity ?? 0) -
                  (quantity ?? 0)
                })`}
              </div>
            )
          }
          name={[fieldKey, "quantity"]}
          rules={[
            {
              required: true,
              message: "",
            },
            {
              validator: (rule, value) => {
                const cleanValue = value && removeNumberFormatting(value);
                if (
                  value &&
                  cleanValue >
                    (inventoryData?.overall_total_remaining_quantity ?? 0)
                ) {
                  return Promise.reject(
                    `Maximum of ${inventoryData?.overall_total_remaining_quantity} only`
                  );
                }

                if (value && cleanValue >= 1) {
                  return Promise.resolve();
                }

                return Promise.reject(`This is required!`);
              },
            },
          ]}
          getValueFromEvent={(e) => {
            let unformattedValue = removeNumberFormatting(e.target.value);

            form?.setFieldValue(
              ["batch_order_details", fieldKey, "breakdown"],
              filterDataByQuantity(inventoryData, unformattedValue).slice(0, -1)
            );

            form?.setFieldValue(
              ["batch_order_details", fieldKey, "total"],
              filterDataByQuantity(inventoryData, unformattedValue).slice(-1)[0]
            );

            return unformattedValue;
          }}
        >
          <NumericFormat
            customInput={Input}
            thousandSeparator={true}
            placeholder="0"
            allowLeadingZeros={false}
            disabled={batchOrderStatus === "completed"}
          />
        </Form.Item>
        {inventoryID && [...(filteredDataByQuantity ?? [])].length > 1 && (
          <Table
            rowKey="item_stock_in_id"
            className="col-span-full"
            columns={inventoryCheckerColumns}
            dataSource={filteredDataByQuantity}
            pagination={false}
            tableLayout="fixed"
          />
        )}

        {isInventoryLoading && (
          <div className="absolute top-0 left-0 h-full w-full bg-white bg-opacity-50 flex justify-center items-center">
            <Spin />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-4 pt-8 relative border border-standard-border rounded-md">
      <div className="blur-sm grid md:grid-cols-2 grid-cols-1 gap-4">
        <Form.Item label="Item Name">
          <Select placeholder="Alamang"></Select>
        </Form.Item>
        <Form.Item label="Quantity">
          <Input placeholder="0" />
        </Form.Item>
      </div>
      {!disabled && (
        <div
          className={
            "absolute top-0 left-0 h-full w-full flex justify-center items-center cursor-pointer"
          }
          onClick={() => {
            add();
          }}
        >
          <IoMdAddCircle className={"text-[3rem] text-primary"} />
        </div>
      )}
    </div>
  );
}
