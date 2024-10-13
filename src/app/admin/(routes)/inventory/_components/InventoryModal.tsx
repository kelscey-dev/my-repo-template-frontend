"use client";
import React from "react";

import { AxiosResponse } from "axios";
import { NumericFormat, PatternFormat } from "react-number-format";
import { Inventories } from "@app-types/APIResponseTypes";
import { APIActionResponseTypes, ModalProps } from "@app-types/GlobalTypes";
import Button from "@components/commons/Button";

import Form from "@components/commons/Form";

import Input from "@components/commons/Input";
import Modal from "@components/commons/Modal";
import Select from "@components/commons/Select";
import { Context } from "@context/AdminProvider";
import { usePatchRequest, usePostRequest } from "@utils/api/apiRequests";
import {
  InventoryTypes,
  inventoryTypesData,
  unitOfMeasurementsTypesData,
} from "@utils/data/inventoriesData";
import {
  isObjectEmpty,
  removeMobileFormatting,
  requestTitle,
} from "@utils/helpers";

type InventoryModalProps = ModalProps<Inventories> & {
  itemType?: InventoryTypes;
  afterCreate?: (res: APIActionResponseTypes<Inventories>) => void;
};

export default function InventoryModal({
  afterCreate,
  onCancel,
  selectedData,
  itemType,
  ...rest
}: InventoryModalProps) {
  const [InventoryForm] = Form.useForm();

  const { mutate: addInventory, isPending: isAddingInventory } = usePostRequest(
    "/api/inventories",
    {
      invalidateQueryKey: ["inventories"],
      invalidateInfiniteQueryKey: [
        {
          queryKey: "inventory-selection",
          updater: (res) => {
            const {
              data: { payload },
            } = res;

            return [
              {
                value: payload.inventory_id,
                label: payload.complete_item_name,
              },
            ];
          },
        },
        {
          queryKey: "inventory-product-selection",
          updater: (res) => {
            const {
              data: { payload },
            } = res;

            return [
              {
                value: payload.inventory_id,
                label: payload.complete_item_name,
              },
            ];
          },
        },
      ],
      mutationOptions: {
        onSuccess: (res) => {
          if (afterCreate) {
            afterCreate(res.data);
          }
          InventoryForm.resetFields();
          onCancel();
        },
      },
    }
  );

  const { mutate: editInventory, isPending: isEditingInventory } =
    usePatchRequest("/api/inventories", {
      invalidateQueryKey: ["inventories"],
      mutationOptions: {
        onSuccess: () => {
          onCancel();
          InventoryForm.resetFields();
        },
      },
    });

  React.useEffect(() => {
    InventoryForm.setFieldsValue(selectedData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedData]);

  const isViewing = selectedData?.request_type === "view";
  const isEditing = selectedData?.request_type === "update";
  const isLoading = isAddingInventory || isEditingInventory;

  const filteredProductTypes = itemType
    ? inventoryTypesData.filter(({ value }) => value === itemType)
    : inventoryTypesData;

  return (
    <Modal width="100rem" onCancel={onCancel} destroyOnClose {...rest}>
      <div className="space-y-12">
        <h4>{requestTitle(selectedData?.request_type, "Item")}</h4>
        <Form
          form={InventoryForm}
          name="supplier-form"
          onFinish={(values) => {
            if (!isEditing) {
              addInventory(values);
            } else {
              editInventory({
                id: selectedData?.inventory_id,
                payload: values,
              });
            }
          }}
          // onValuesChange={(changedValues, values) => {
          //   if (!changedValues.item_description) {
          //     InventoryForm.setFieldValue(
          //       "item_name",
          //       `${values.item_measurement}${values.item_measurement_type}`
          //     );
          //   }
          // }}
          preserve={false}
          disabled={isViewing}
        >
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 col-span-full gap-8">
              <Form.Item
                label="Item Name"
                name="item_name"
                rules={[{ required: true, message: "This is required!" }]}
                className="col-span-full"
              >
                <Input placeholder="Hermano Sugar" />
              </Form.Item>
              <Form.Item
                label="Item Type"
                name="item_type"
                rules={[{ required: true, message: "This is required!" }]}
                initialValue={itemType}
              >
                <Select options={filteredProductTypes} />
              </Form.Item>
              <Form.Item
                label="Item Measurement"
                name={"item_measurement"}
                rules={[{ required: true, message: "This is required!" }]}
                getValueFromEvent={(e) =>
                  Number(removeMobileFormatting(e.target.value))
                }
              >
                <NumericFormat
                  customInput={Input}
                  thousandSeparator={true}
                  placeholder="0"
                  addonAfter={
                    <Form.Item
                      name={"item_measurement_type"}
                      rules={[{ required: true, message: "This is required!" }]}
                      noStyle
                    >
                      <Select
                        options={unitOfMeasurementsTypesData}
                        className="min-w-[10rem]"
                      />
                    </Form.Item>
                  }
                />
              </Form.Item>
              <Form.Item
                name="item_description"
                label="Item Description"
                className="col-span-full"
              >
                <Input.TextArea placeholder="3kg Sugar Hermano" />
              </Form.Item>
            </div>
            {selectedData?.request_type === "view" && (
              <div className="grid grid-cols-1 md:grid-cols-2 col-span-full gap-8">
                <h5 className="col-span-full border-b border-standard-border pb-4">
                  Stocks Information
                </h5>
                <Form.Item
                  label="Overall Added Quantity"
                  name={["total_stock_in", "quantity"]}
                  rules={[{ required: true, message: "This is required!" }]}
                >
                  <NumericFormat
                    customInput={Input}
                    thousandSeparator={true}
                    placeholder="0"
                  />
                </Form.Item>
                <Form.Item
                  label="Overall Added Cost"
                  name={["total_stock_in", "total_cost"]}
                  rules={[{ required: true, message: "This is required!" }]}
                >
                  <NumericFormat
                    prefix="₱ "
                    customInput={Input}
                    thousandSeparator={true}
                    placeholder="0"
                  />
                </Form.Item>
                <Form.Item
                  label="Overall Used Quantity"
                  name={["total_stock_out", "quantity"]}
                  rules={[{ required: true, message: "This is required!" }]}
                >
                  <NumericFormat
                    customInput={Input}
                    thousandSeparator={true}
                    placeholder="0"
                  />
                </Form.Item>
                <Form.Item
                  label="Overall Used Cost"
                  name={["total_stock_out", "total_cost"]}
                  rules={[{ required: true, message: "This is required!" }]}
                >
                  <NumericFormat
                    prefix="₱ "
                    customInput={Input}
                    thousandSeparator={true}
                    placeholder="0"
                  />
                </Form.Item>
                <Form.Item
                  label="Remaining Quantity"
                  name={["remaining_stocks", "remaining_quantity"]}
                  rules={[{ required: true, message: "This is required!" }]}
                >
                  <NumericFormat
                    customInput={Input}
                    thousandSeparator={true}
                    placeholder="0"
                  />
                </Form.Item>
                <Form.Item
                  label="Remaining Cost"
                  name={["remaining_stocks", "remaining_cost"]}
                  rules={[{ required: true, message: "This is required!" }]}
                >
                  <NumericFormat
                    prefix="₱ "
                    customInput={Input}
                    thousandSeparator={true}
                    placeholder="0"
                  />
                </Form.Item>
              </div>
            )}
            <div className="flex max-md:flex-wrap [&>*]:basis-full md:[&>*]:basis-1/2 gap-4 md:max-w-[35rem] md:ml-auto justify-end items-center !mt-20">
              <Button
                type="default"
                onClick={onCancel}
                className={isViewing ? "col-start-2" : ""}
                disabled={false}
              >
                Cancel
              </Button>
              {!isViewing && (
                <Button type="primary" htmlType="submit" loading={isLoading}>
                  {!isEditing ? "Create" : "Update"}
                </Button>
              )}
            </div>
          </div>
        </Form>
      </div>
    </Modal>
  );
}
