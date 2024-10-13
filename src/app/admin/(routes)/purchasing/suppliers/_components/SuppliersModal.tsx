"use client";
import React from "react";

import { AxiosResponse } from "axios";
import { NumericFormat, PatternFormat } from "react-number-format";
import { Suppliers } from "@app-types/APIResponseTypes";
import { ModalProps } from "@app-types/GlobalTypes";
import Button from "@components/commons/Button";

import Form from "@components/commons/Form";

import Input from "@components/commons/Input";
import Modal from "@components/commons/Modal";
import { Context } from "@context/AdminProvider";
import { usePatchRequest, usePostRequest } from "@utils/api/apiRequests";
import {
  isObjectEmpty,
  removeMobileFormatting,
  requestTitle,
} from "@utils/helpers";

import { APIActionResponseTypes } from "../../../../../../types/GlobalTypes";

type SupplierModalProps = ModalProps<Suppliers> & {
  afterCreate?: (res: APIActionResponseTypes<Suppliers>) => void;
};

export default function SuppliersModal({
  onCancel,
  selectedData,
  afterCreate,
  ...rest
}: SupplierModalProps) {
  const [SuppliersForm] = Form.useForm();

  const { mutate: addSupplier, isPending: isAddingSupplier } = usePostRequest(
    "/api/suppliers",
    {
      invalidateQueryKey: ["suppliers"],
      invalidateInfiniteQueryKey: [
        {
          queryKey: "suppliers-selection",
          updater: (res) => {
            const {
              data: { payload },
            } = res;
            return [
              {
                value: payload.supplier_id,
                label: payload.supplier_name,
                contact_no: payload.contact_no,
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
          onCancel();
        },
      },
    }
  );

  const { mutate: editSupplier, isPending: isEditingSupplier } =
    usePatchRequest("/api/suppliers", {
      invalidateQueryKey: ["suppliers"],
      mutationOptions: {
        onSuccess: (res) => {
          onCancel();
        },
      },
    });

  React.useEffect(() => {
    SuppliersForm.setFieldsValue(selectedData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedData]);

  const isViewing = selectedData?.request_type === "view";
  const isEditing = selectedData?.request_type === "update";
  const isLoading = isAddingSupplier || isEditingSupplier;

  return (
    <Modal width="100rem" onCancel={onCancel} destroyOnClose {...rest}>
      <div className="space-y-12">
        <h4>{requestTitle(selectedData?.request_type, "Supplier")}</h4>
        <Form
          form={SuppliersForm}
          name="supplier-form"
          onFinish={(values) => {
            if (!isEditing) {
              addSupplier(values);
            } else {
              editSupplier({
                id: selectedData?.supplier_id,
                payload: values,
              });
            }
          }}
          preserve={false}
          disabled={isViewing}
        >
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
              <div className="grid grid-cols-1 md:grid-cols-2 col-span-full gap-8">
                <h5 className="col-span-full border-b border-standard-border pb-4">
                  Supplier Information
                </h5>
                <Form.Item
                  label="Supplier Name"
                  name="supplier_name"
                  rules={[{ required: true, message: "This is required!" }]}
                >
                  <Input placeholder="Sample Name" />
                </Form.Item>
                <Form.Item name="supplier_address" label="Supplier Address">
                  <Input placeholder="123 Main St, Cavite" />
                </Form.Item>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 col-span-full gap-8">
                <h5 className="col-span-full border-b border-standard-border pb-4">
                  Contact Information
                </h5>
                <Form.Item
                  name="contact_name"
                  label="Contact Name"
                  rules={[{ required: true, message: "This is required!" }]}
                >
                  <Input placeholder="Juan Dela Cruz" />
                </Form.Item>
                <Form.Item
                  name="contact_no"
                  label="Contact No."
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
                          return Promise.reject(
                            "Must be a valid mobile number"
                          );
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
                  />
                </Form.Item>
                <Form.Item
                  name="contact_email"
                  label="Contact Email"
                  rules={[
                    {
                      type: "email",
                      message: "Must be a valid email",
                    },
                  ]}
                >
                  <Input placeholder="juandela.cruz@gmail.com" />
                </Form.Item>
              </div>
            </div>
            <div className="flex max-md:flex-wrap [&>*]:basis-full md:[&>*]:basis-1/2 gap-4 md:max-w-[35rem] md:ml-auto justify-end items-center !mt-20">
              <Button type="default" onClick={onCancel} disabled={false}>
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
