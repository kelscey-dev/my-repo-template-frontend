const inventoryData = [
  {
    label: "Product",
    value: "product",
  },
  {
    label: "Equipment",
    value: "equipment",
  },
  {
    label: "Ingredient",
    value: "ingredient",
  },
  {
    label: "Cleaning Material",
    value: "cleaning_material",
  },
] as const;

export type InventoryTypes = (typeof inventoryData)[number]["value"];

export const inventoryTypesData = inventoryData.map((item) => ({
  label: item.label,
  value: item.value,
}));

const unitOfMeasurementsData = [
  {
    label: "Kilogram",
    value: "kg",
  },
  {
    label: "Gram",
    value: "g",
  },
  {
    label: "Milligram",
    value: "mg",
  },
  {
    label: "Tonne",
    value: "t",
  },
  {
    label: "Pound",
    value: "lb",
  },
  {
    label: "Ounce",
    value: "oz",
  },
  {
    label: "Liter",
    value: "L",
  },
  {
    label: "Milliliter",
    value: "mL",
  },
  {
    label: "Gallon",
    value: "gal",
  },
] as const;

export type UnitOfMeasurementsTypes =
  (typeof unitOfMeasurementsData)[number]["value"];

export const unitOfMeasurementsTypesData = unitOfMeasurementsData.map(
  (item) => ({
    label: item.label,
    value: item.value,
  })
);
