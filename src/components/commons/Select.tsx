import React from "react";
import AntdSelect, { DefaultOptionType, SelectProps } from "antd/es/select";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { useInView } from "react-intersection-observer";

const { Option: AntdOption, OptGroup: AntdOptGroup } = AntdSelect;

export default function Select({
  higherIndexFilter,
  ...props
}: SelectProps & {
  higherIndexFilter?: {
    optionValue: string;
  };
}) {
  const { optionValue } = higherIndexFilter || {};

  const filteredOptions = React.useMemo(() => {
    if (optionValue && props.options) {
      const index = props.options.findIndex(
        (option) => option.value === optionValue
      );
      if (index !== -1) {
        return props.options.filter((_, idx) => idx >= index);
      }
    }
    return props.options;
  }, [optionValue, props.options]);

  props.options = filteredOptions;

  return (
    <AntdSelect placeholder="Please Select" showSearch allowClear {...props} />
  );
}

export function Infinite({
  options,
  loading,
  optionMaxCount = 100,
  onScrollBottom,
  onClear,
  onChange,
  ...props
}: Omit<SelectProps, "children" | "onClear" | "onChange"> & {
  loading: boolean;
  optionMaxCount: number;
  onClear?: (value: string | undefined) => void;
  onChange?: (
    value: any,
    prevValue: any,
    option: DefaultOptionType | DefaultOptionType[]
  ) => void;
  onScrollBottom: (inView: boolean) => void;
}) {
  const [activeOption, setActiveOption] = React.useState();
  const { ref, inView } = useInView();

  let dynamicOptions: SelectProps["options"] = [
    ...(options ?? []),
    ...(options && options.length >= 1
      ? [
          {
            label: (
              <div ref={ref}>
                {loading ? (
                  <AiOutlineLoading3Quarters className="animate-spin w-full" />
                ) : (
                  "- End of Data -"
                )}
              </div>
            ),
            value: "end_of_data",
            disabled: true,
            className: "text-center",
          },
        ]
      : []),
  ].map((option, index) => {
    return {
      key: index,
      ...option,
    };
  });

  React.useEffect(() => {
    if (inView && !loading && (options ?? []).length < optionMaxCount) {
      onScrollBottom(inView);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, options]);

  return (
    <Select
      {...props}
      onClear={() => onClear?.(activeOption)}
      onChange={(val, option) => {
        onChange?.(val, activeOption, option);
        setActiveOption(val);
      }}
      options={dynamicOptions}
    />
  );
}

Select.Option = AntdOption;
Select.OptGroup = AntdOptGroup;
Select.Infinite = Infinite;
