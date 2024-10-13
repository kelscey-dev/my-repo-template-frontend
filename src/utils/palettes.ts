import batchOrderStatusData, {
  BatchOrderStatusTypes,
} from "./data/batchOrderStatusData";
import purchaseOrderStatusData, {
  PurchaseOrderStatusTypes,
} from "./data/purchaseOrderStatusData";
import salesStatusData, { SalesStatusTypes } from "./data/salesStatusData";
import salesTypeData, { SalesTypes } from "./data/salesTypeData";

export function purchaseOrderStatusPalette(
  status: PurchaseOrderStatusTypes,
  type: "class" | "label"
) {
  if (type === "class") {
    switch (status) {
      case "pending":
        return "bg-gray-200 text-gray-700";
      case "completed":
        return "bg-green-200 text-green-700";
      default:
        return "bg-gray-200 text-gray-700";
    }
  }

  if (type === "label") {
    return purchaseOrderStatusData.find(({ value }) => value === status)?.label;
  }
}

export function batchOrderStatusPalette(
  status: BatchOrderStatusTypes,
  type: "class" | "label"
) {
  if (type === "class") {
    switch (status) {
      case "pending":
        return "bg-gray-200 text-gray-700";
      case "in_progress":
        return "bg-yellow-200 text-yellow-700";
      case "completed":
        return "bg-green-200 text-green-700";
      default:
        return "bg-gray-200 text-gray-700";
    }
  }

  if (type === "label") {
    return batchOrderStatusData.find(({ value }) => value === status)?.label;
  }
}

export function salesStatusPalette(
  status: SalesStatusTypes,
  type: "class" | "label"
) {
  if (type === "class") {
    switch (status) {
      case "pending":
        return "bg-gray-200 text-gray-700";
      case "refunded":
        return "bg-red-200 text-red-700";
      case "returned":
        return "bg-red-300 text-red-800";
      case "cancelled":
        return "bg-red-400 text-red-900";
      case "shipped":
        return "bg-lime-200 text-lime-700";
      case "completed":
        return "bg-green-200 text-green-700";
      default:
        return "bg-gray-200 text-gray-700";
    }
  }

  if (type === "label") {
    return salesStatusData.find(({ value }) => value === status)?.label;
  }
}

export function salesTypesPalette(
  salesType: SalesTypes,
  type: "class" | "label"
) {
  if (type === "class") {
    switch (salesType) {
      case "walk_in":
        return "bg-gray-200 text-gray-900";
      case "tiktok":
        return "bg-yellow-200 text-black";
      case "shopee":
        return "bg-red-200 text-white";
      case "lazada":
        return "bg-red-200 text-white";
      case "facebook":
        return "bg-green-200 text-white";
      default:
        return "bg-gray-200 text-gray-700";
    }
  }

  if (type === "label") {
    return salesTypeData.find(({ value }) => value === salesType)?.label;
  }
}
