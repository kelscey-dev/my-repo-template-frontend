import {
  FormProviderProps,
  FormProvider as AntdFormProvider,
} from "antd/es/form/context";
import AntdForm, { FormProps, useForm as AntdUseForm } from "antd/es/form/Form";
import AntdFormItem, { FormItemProps } from "antd/es/form/FormItem";
import AntdFormList, { FormListProps } from "antd/es/form/FormList";

interface CustomFormProps extends FormProps {
  children?: React.ReactNode;
}

function List(props: FormListProps) {
  return <AntdFormList {...props} />;
}

function Provider(props: FormProviderProps) {
  return <AntdFormProvider {...props} />;
}

function Item(props: FormItemProps) {
  const requiredRule = Boolean(props.rules?.find((rule: any) => rule.required));

  return (
    <AntdFormItem
      required={false}
      {...props}
      label={
        <div>
          {props.label}{" "}
          <span className="text-xs">
            {props.name ? !requiredRule && "(Optional)" : ""}
          </span>
        </div>
      }
    />
  );
}

export default function Form(props: CustomFormProps) {
  return (
    <AntdForm
      layout="vertical"
      scrollToFirstError={{
        behavior: "smooth",
        block: "center",
        inline: "center",
      }}
      {...props}
    />
  );
}

Form.useForm = AntdUseForm;
Form.Provider = Provider;
Form.Item = Item;
Form.List = List;
