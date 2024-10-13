import { AdminLoadingComponentType } from "@app-types/AdminRouteTypes";
import Skeleton from "@components/commons/Skeleton";

import { purchaseOrderColumns } from "./tableColumns";

export default async function Loading({ title }: AdminLoadingComponentType) {
  return (
    <div className="p-[5%] max-md:py-[10%] h-full space-y-8 overflow-auto flex-auto flex flex-col">
      <div className="flex justify-between items-center flex-wrap gap-x-4 gap-y-8">
        <h3 className="max-sm:basis-full">{title}</h3>
        <div className="flex max-sm:flex-wrap max-sm:flex-auto items-center gap-4 basis-[12rem]">
          <Skeleton.Button active={true} />
        </div>
      </div>
      <div className="flex justify-between items-center gap-4 flex-wrap md:flex-nowrap !mt-8">
        <div className="basis-full">
          <Skeleton.Input active={true} />
        </div>
      </div>
      <div className="flex flex-col flex-auto min-h-[30rem]">
        <Skeleton.Table columns={purchaseOrderColumns} numberOfRows={10} />
      </div>
    </div>
  );
}
