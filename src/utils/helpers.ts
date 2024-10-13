import { FormInstance } from "antd";
import moment from "moment";
import { NumberFormatValues } from "react-number-format/types/types";
import { ModalRequestTypes } from "@app-types/GlobalTypes";

type RangeOfLimitProps = {
  formattedValue: string;
  value: string;
  floatValue: number;
};

export function formResetExlude(fieldsToExclude: String[], form: FormInstance) {
  const fields = form.getFieldsValue();
  const fieldsToReset = Object.keys(fields).filter(
    (field) => !fieldsToExclude.includes(field)
  );
  form.resetFields(fieldsToReset);
}

export function classNameMerge(
  ...classes: Array<boolean | string | undefined>
) {
  return classes.filter((value) => value).join(" ");
}

export function numberToAlphabet(num: number): string {
  if (num < 1 || num > 26) {
    throw new Error(
      "Invalid input: Number must be between 1 and 26 inclusive."
    );
  }

  // Convert ASCII code to alphabet letter
  return String.fromCharCode(64 + num);
}

export function mobileFormat(mobile_no: string) {
  const digitsOnly = mobile_no.replace(/\D/g, "");
  const formattedNumber = digitsOnly.replace(
    /(\d{4})(\d{3})(\d{4})/,
    "$1 $2 $3"
  );
  return formattedNumber;
}

export function removeNumberFormatting(number: string, decimals?: number) {
  const numericValue = Number(number?.toString()?.replace(/[^0-9\.-]+/g, ""));

  return Number(numericValue.toFixed(decimals));
}

export function removeMobileFormatting(number: string) {
  return number?.toString()?.replace(/[^0-9\.-]+/g, "");
}

export function numberSeparator(currency: string | number, decimal?: number) {
  return parseFloat(currency?.toString())
    .toFixed(decimal ?? 2)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export function rangeOfLimit(
  values: NumberFormatValues,
  { min, max }: { min: number; max: number }
) {
  const { formattedValue, value, floatValue } = values as RangeOfLimitProps;

  if (value.charAt(0) === "0" && value.charAt(1)) {
    return false;
  }

  return formattedValue === "" || (floatValue <= max && floatValue >= min);
}

export function convertNumber(number: number) {
  return ((Math.log10(number) / 3) | 0) === 0
    ? number
    : Number(
        (number / Math.pow(10, ((Math.log10(number) / 3) | 0) * 3)).toFixed(1)
      ) + ["", "K", "M", "B", "T"][(Math.log10(number) / 3) | 0];
}

export function contactNumberFormatter(number: string) {
  return number.replace(/\s+/g, "").replace(/#/g, "");
}

export function getYoutubeId(url: string) {
  const regex =
    /^.*(youtu.be|v|embed|watch\?|youtube.comuser[^#]*#([^]*?)*)\??v?=?([^#]*).*/g;
  const match = regex.exec(url);
  if (match === null) {
    return match;
  } else {
    return match[3];
  }
}

export function convertMobile(mobile: string) {
  let convertedMobile = mobile.toString();

  return convertedMobile
    .replace("+63", "0")
    .replace(/\s/g, "")
    .replace(/#/g, "");
}

export function capitalizeTitle(title: string, route: string | string[]) {
  let homepage = route === "/admin";
  let notFound = route === "/404";

  if (homepage) {
    route = "Home";
  } else if (notFound) {
    route = "Not Found";
  } else {
    route = (<string>route).split("/");

    route = route
      .filter((data: string) => data)
      .map((q: string) => {
        let string: string[] | string = q.replace(/[^a-zA-Z0-9 ]/g, " ");

        string = string.split(" ");
        string = string
          .filter((data: string) => data)
          .map((text: string) => {
            return text.charAt(0).toUpperCase() + text.substring(1);
          });

        return string.join(" ");
      });

    route = route.join(" | ");
  }
  return `${title} | ${route}`;
}

export function stripTags(text: string) {
  return text?.replace(/(<([^>]+)>)/gi, "");
}

export const keyToTitleCase = (string: string) => {
  string = string
    .split("_")
    .filter((row) => row)
    .map((row) => {
      if (row.includes("id")) {
        return row.toUpperCase();
      }

      return row.charAt(0).toUpperCase() + row.substring(1).toLowerCase();
    })
    .join(" ");

  return string;
};

export function getInitialValue(
  form: FormInstance,
  name: string,
  initial?: boolean
) {
  if (!name) {
    return "";
  }

  let initialValue = form.getFieldValue(name);

  if (!initialValue) {
    return "";
  }

  return `${initial ? "?" : "&"}initial_value=${initialValue}`;
}

export function slugify(str: string) {
  str = str.replace(/^\s+|\s+$/g, ""); // trim leading/trailing white space
  str = str.toLowerCase(); // convert to lower case
  str = str
    .replace(/[^a-z0-9 -]/g, "") // remove any non-alphanumeric characters except spaces and hyphens
    .replace(/\s+/g, "-") // replace spaces with hyphens
    .replace(/-+/g, "-"); // remove consecutive hyphens

  return str;
}

export function getBase64(img: any, callback: any) {
  const reader = new FileReader();
  reader.addEventListener("load", () => callback(reader.result));
  reader.readAsDataURL(img);
}

export function downloadExcel(response: Blob, file_name: string) {
  const url = window.URL.createObjectURL(new Blob([response]));

  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `${file_name}.xlsx`);
  document.body.appendChild(link);
  link.click();
}

export function convertDatesToMoment(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj === "string") {
    const parsedDate = moment(obj, moment.ISO_8601, true);
    if (parsedDate.isValid()) {
      return parsedDate;
    }
  } else if (Array.isArray(obj)) {
    return obj.map(convertDatesToMoment);
  } else if (typeof obj === "object") {
    const newObj: { [key: string]: any } = {};
    for (const key in obj) {
      newObj[key] = convertDatesToMoment(obj[key]);
    }
    return newObj;
  }

  return obj;
}

// export function parseCSV(file: any): Promise<any> {
//   return new Promise((resolve, reject) => {
//     const reader = new FileReader();

//     const headers = [
//       "first_name",
//       "last_name",
//       "section",
//       "department",
//       "position",
//       "grade_level",
//       "employee_status",
//       "email",
//     ];

//     reader.onload = (e) => {
//       const csvData = e.target?.result as string;

//       parse(
//         csvData,
//         {
//           delimiter: ",",
//           columns: headers,
//         },
//         (error, result: any) => {
//           if (error) {
//             console.error("Error parsing CSV:", error);
//             reject(error);
//             return;
//           }

//           // Skip the header
//           const [header, ...rest] = result;

//           // Transform the data if needed
//           const transformedData = rest.map((data: any) => ({
//             ...data,
//           }));

//           resolve(transformedData);
//         }
//       );
//     };

//     reader.readAsText(file.originFileObj);
//   });
// }

export function calculateTotalHours(
  dateRangeArray: { date: moment.MomentInput[] }[]
) {
  dateRangeArray = dateRangeArray?.filter(
    (dateRange) => dateRange && dateRange.date
  );

  if (dateRangeArray?.length > 0) {
    const totalHoursArray = dateRangeArray.map((session) => {
      const startDate = moment(session?.date[0]);
      const endDate = moment(session?.date[1]);
      const durationInHours: number = endDate.diff(startDate, "minutes") / 60;
      return durationInHours;
    });
    const totalHours = totalHoursArray.reduce((acc, hours) => acc + hours, 0);
    return Number(totalHours.toFixed(2));
  }

  return 0;
}

export function splitUrl(url: string) {
  let parts = url.split("/");

  parts = parts.filter((part) => part).map((item) => "/" + item);

  if (parts.length > 1) {
    let mergedInitialParts = parts[0] + parts[1];
    return [mergedInitialParts, ...parts.slice(2)];
  } else {
    return parts;
  }
}

export const isObjectEmpty = (objectName: {} | undefined) => {
  if (objectName) {
    return (
      objectName &&
      Object.keys(objectName).length === 0 &&
      objectName.constructor === Object
    );
  }

  return true;
};

export const requestTitle = (
  typeOfRequest: ModalRequestTypes,
  mainTitle: string
) => {
  switch (typeOfRequest) {
    case "view":
      return `View ${mainTitle}`;
    case "update":
      return `Update ${mainTitle}`;
    default:
      return `Create ${mainTitle}`;
  }
};

export const getNextItem = (
  array: Array<any>,
  currentRefValue: string,
  referenceKey: string,
  returnedValueKey?: string
) => {
  const currentIndex = array.findIndex(
    (item) => item[referenceKey] === currentRefValue
  );

  const nextItemIndex = currentIndex + 1;
  if (nextItemIndex >= 0 && nextItemIndex < array.length) {
    const nextItem = array[nextItemIndex];
    if (returnedValueKey) {
      return nextItem[returnedValueKey];
    } else {
      return nextItem;
    }
  } else {
    return null;
  }
};
