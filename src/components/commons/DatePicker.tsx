import AntdDatePicker, {
  DatePickerProps,
  RangePickerProps,
} from "antd/es/date-picker";
import { Moment } from "moment";

const { RangePicker: AntdRangePicker } = AntdDatePicker;

const acceptedFormat = ["MMM DD, YYYY", "MMMM DD, YYYY", "MM/DD/YYYY"];

export function RangePicker(props: RangePickerProps) {
  return <AntdRangePicker format={acceptedFormat} {...props} />;
}

export default function DatePicker(props: DatePickerProps<Moment>) {
  return <AntdDatePicker format={acceptedFormat} {...props} />;
}

DatePicker.RangePicker = RangePicker;
