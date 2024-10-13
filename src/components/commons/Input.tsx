import { Input as AntdInput } from "antd";
import {
  GroupProps,
  InputProps,
  PasswordProps,
  SearchProps,
  TextAreaProps,
} from "antd/es/input";
import AntdInputNumber, { InputNumberProps } from "antd/es/input-number";
import AntdGroup from "antd/es/input/Group";
import { OTPProps } from "antd/es/input/OTP";
import AntdOTP from "antd/es/input/OTP";
import AntdPassword from "antd/es/input/Password";
import AntdSearch from "antd/es/input/Search";
import AntdTextArea from "antd/es/input/TextArea";

function Number(props: InputNumberProps) {
  return <AntdInputNumber {...props} />;
}

function TextArea(props: TextAreaProps) {
  return <AntdTextArea autoSize={{ minRows: 10, maxRows: 15 }} {...props} />;
}

function Password(props: PasswordProps) {
  return <AntdPassword {...props} />;
}

function OTP(props: OTPProps) {
  return <AntdOTP {...props} />;
}

function Search(props: SearchProps) {
  return <AntdSearch {...props} />;
}

function Group(props: GroupProps) {
  return <AntdGroup {...props} />;
}

export default function Input(props: InputProps) {
  return <AntdInput {...props} />;
}

Input.TextArea = TextArea;
Input.Password = Password;
Input.OTP = OTP;
Input.Search = Search;
Input.Group = Group;
Input.Number = Number;
