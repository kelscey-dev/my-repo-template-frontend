import React from "react";
import { Modal as AntdModal, ModalProps } from "antd";
import { v4 } from "uuid";

export default function Modal(props: ModalProps) {
  const [modalKey, setModalKey] = React.useState("");

  React.useEffect(() => {
    if (!props.open) {
      setModalKey(v4());
    }
  }, [props.open]);

  return (
    <AntdModal
      width={"90rem"}
      centered={true}
      key={modalKey}
      {...props}
      footer={null}
    />
  );
}
