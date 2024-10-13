import { Moment } from "moment";

import {
  InventoryTypes,
  UnitOfMeasurementsTypes,
} from "@utils/data/inventoriesData";

import { BatchOrderStatusTypes } from "../utils/data/batchOrderStatusData";
import { PurchaseOrderStatusTypes } from "../utils/data/purchaseOrderStatusData";
import { SalesStatusTypes } from "../utils/data/salesStatusData";
import { SalesTypes } from "../utils/data/salesTypeData";

export type UserRoles = "user" | "admin" | "superadmin";

export type ItemStockOutStatusTypes = "pending" | "returned" | "used";

export type Users = {
  user_id: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  full_name: string;
  role: UserRoles;
  email: string;
  mobile_no?: string;
  created_at: Date | Moment;
  updated_at: Date | Moment;
  credentials: Credentials[];
  created_purchase_orders: PurchaseOrders[];
  batch_orders: BatchOrders[];
};

export type Credentials = {
  credential_id: string;
  user_id: string;
  user: Users;
  created_at: Date | Moment;
  updated_at: Date | Moment;
  last_login_at?: Date | Moment;
  last_change_password_at?: Date | Moment;
};

export type Suppliers = {
  supplier_id: string;
  custom_id: string;
  supplier_name: string;
  supplier_address?: string;
  contact_name: string;
  contact_no: string;
  contact_email?: string;
  created_at: Date | Moment;
  updated_at: Date | Moment;
  purchase_orders: PurchaseOrders[];
};

export type PurchaseOrders = {
  purchase_order_id: string;
  custom_id: string;
  supplier_id: string;
  supplier: Suppliers;
  status: PurchaseOrderStatusTypes;
  order_by_user_id: string;
  order_by: Users;
  overall_purchase_cost: number;
  order_date: Date | Moment;
  created_at: Date | Moment;
  updated_at: Date | Moment;
  purchase_order_details: PurchaseOrderDetails[];
  purchase_order_history: PurchaseOrderHistory[];
};

export type PurchaseOrderHistory = {
  purchase_order_history_id: string;
  status_from: PurchaseOrderStatusTypes;
  status_to: PurchaseOrderStatusTypes;
  purchase_order_id: string;
  purchase_orders: PurchaseOrders;
  created_at: Date | Moment;
  updated_at: Date | Moment;
};

export type PurchaseOrderDetails = {
  purchase_order_details_id: string;
  custom_id: string;
  quantity: number;
  cost: number;
  inventory_id: string;
  inventory: Inventories;
  purchase_order_id: string;
  purchase_order: PurchaseOrders;
  created_at: Date | Moment;
  updated_at: Date | Moment;
  items_stock_in: ItemsStockIn[];
};

export type Inventories = {
  inventory_id: string;
  custom_id: string;
  item_name: string;
  item_description: string;
  item_type: InventoryTypes;
  item_measurement: number;
  complete_item_name: string;
  item_measurement_type: UnitOfMeasurementsTypes;
  overall_total_remaining_quantity: number;
  created_at: Date | Moment;
  updated_at: Date | Moment;
  items_stock_in: ItemsStockIn[];
  purchase_order_details: PurchaseOrderDetails[];
  batch_order_details: BatchOrderDetails[];
  batch_orders: BatchOrders[];
  sales: Sales[];
  remaining_stocks: any[];
};

export type ItemsStockIn = {
  item_stock_in_id: string;
  custom_id: string;
  quantity: number;
  cost: number;
  purchase_order_details_id?: string;
  purchase_order_details?: PurchaseOrderDetails;
  batch_order_id?: string;
  batch_order?: BatchOrders;
  inventory_id: string;
  inventory: Inventories;
  created_at: Date | Moment;
  updated_at: Date | Moment;
  items_stock_out: ItemsStockOut[];
};

export type ItemsStockOut = {
  item_stock_out_id: string;
  custom_id: string;
  quantity: number;
  price_sold?: number;
  status: ItemStockOutStatusTypes;
  item_stock_in_id: string;
  item_stock_in: ItemsStockIn;
  batch_order_details_id: string;
  batch_order_details: BatchOrderDetails;
  created_at: Date | Moment;
  updated_at: Date | Moment;
};

export type BatchOrders = {
  selectedRow: any;
  batch_order_id: string;
  custom_id: string;
  inventory_id: string;
  product: Inventories;
  order_by_user_id: string;
  order_by: Users;
  status: BatchOrderStatusTypes;
  overall_batch_cost: number;
  planned_production_quantity: number;
  planned_estimated_cost_per_bottle: number;
  actual_production_quantity?: number;
  actual_estimated_cost_per_bottle?: number;
  processing_start_date?: Date | Moment;
  processing_end_date?: Date | Moment;
  planned_date: Date | Moment;
  actual_date?: Date | Moment;
  created_at: Date | Moment;
  updated_at: Date | Moment;
  batch_order_details: BatchOrderDetails[];
  items_stock_in?: ItemsStockIn;
  batch_order_history: BatchOrderHistory[];
};

export type BatchOrderHistory = {
  batch_order_history_id: string;
  status_from: BatchOrderStatusTypes;
  status_to: BatchOrderStatusTypes;
  batch_order_id: string;
  batch_orders: BatchOrders;
  created_at: Date | Moment;
  updated_at: Date | Moment;
};

export type BatchOrderDetails = {
  batch_order_details_id: string;
  custom_id: string;
  quantity: number;
  inventory_id: string;
  inventory: Inventories;
  batch_order_id: string;
  batch_order: BatchOrders;
  created_at: Date | Moment;
  updated_at: Date | Moment;
  items_stock_out: ItemsStockOut[];
};

export type Sales = {
  sales_id: string;
  seller_name: string;
  custom_id: string;
  created_by_user_id: string;
  created_by: Users;
  overall_sales_cost: number;
  sales_date: Date | Moment;
  created_at: Date | Moment;
  updated_at: Date | Moment;
  notes: string | null;
  sales_type: SalesTypes;
  status: SalesStatusTypes;
  activity_logs_relations: ActivityLogsRelations[];
  sales_details: SalesDetails[];
};

// Types for SalesDetails model
export type SalesDetails = {
  sales_details_id: string;
  custom_id: string;
  quantity: number;
  cost: number;
  inventory_id: string;
  inventory: Inventories;
  sales_id: string;
  sales: Sales;
  created_at: Date | Moment;
  updated_at: Date | Moment;
  items_stock_out: ItemsStockOut[];
  activity_logs_relations: ActivityLogsRelations[];
};

// Types for ActivityLogs model
export type ActivityLogs = {
  activity_logs_id: string;
  action_type: ActionTypes;
  action_status: ActionStatus;
  updated_fields: any | null;
  timestamp: Date | Moment;
  error: string | null;
  user_id: string;
  actor: Users;
  activity_logs_relations: ActivityLogsRelations[];
};

export type ActivityLogsRelations = {
  activity_logs_relations_id: string;
  activity_logs_id: string | null;
  activity_logs: ActivityLogs | null;
  user_id: string | null;
  user: Users | null;
  credential_id: string | null;
  credential: Credentials | null;
  supplier_id: string | null;
  supplier: Suppliers | null;
  purchase_order_id: string | null;
  purchase_order: PurchaseOrders | null;
  purchase_order_details_id: string | null;
  purchase_order_details: PurchaseOrderDetails | null;
  inventory_id: string | null;
  inventory: Inventories | null;
  item_stock_in_id: string | null;
  item_stock_in: ItemsStockIn | null;
  item_stock_out_id: string | null;
  item_stock_out: ItemsStockOut | null;
  batch_order_id: string | null;
  batch_order: BatchOrders | null;
  batch_order_details_id: string | null;
  batch_order_details: BatchOrderDetails | null;
  sales_id: string | null;
  sales: Sales | null;
  sales_details_id: string | null;
  sales_details: SalesDetails | null;
};

export type ActionStatus = "success" | "failed";

export type ActionTypes = "get" | "post" | "update" | "patch" | "delete";
