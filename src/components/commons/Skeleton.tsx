import { Skeleton as AntdSkeleton, SkeletonProps } from "antd";
import SkeletonAvatar, { AvatarProps } from "antd/es/skeleton/Avatar";
import SkeletonButton, { SkeletonButtonProps } from "antd/es/skeleton/Button";
import SkeletonImage, { SkeletonImageProps } from "antd/es/skeleton/Image";
import SkeletonInput, { SkeletonInputProps } from "antd/es/skeleton/Input";

import SkeletonNode, { SkeletonNodeProps } from "antd/es/skeleton/Node";

import AntdTable from "./Table";

const removeFunctionFields = (columns: any[]) => {
  return columns.map((column) => {
    // Create a new column object to avoid mutating the original
    let newColumn = { ...column };

    // Remove the fields that are functions
    Object.keys(newColumn).forEach((key) => {
      if (typeof newColumn[key] === "function") {
        delete newColumn[key];
      }
    });

    // Recursively process the 'children' property if it exists
    if (newColumn.children && Array.isArray(newColumn.children)) {
      newColumn.children = removeFunctionFields(newColumn.children);
    }

    return newColumn;
  });
};

function Table({
  columns,
  numberOfRows,
}: {
  columns: { [key: string]: any }[];
  numberOfRows: number;
}) {
  let filteredColumns = removeFunctionFields(columns);

  return (
    <AntdTable
      rowKey="key"
      pagination={false}
      locale={{
        emptyText: (
          <div className="absolute h-full w-full top-0 left-0 flex flex-col gap-1">
            {[...Array(numberOfRows)].map((u, index) => (
              <Skeleton.Input
                active={true}
                className="flex-auto [&_.ant-skeleton-input]:!h-full [&_.ant-skeleton-input]:!rounded-none"
                key={index}
              />
            ))}
          </div>
        ),
      }}
      columns={filteredColumns}
    />
  );
}

function Input(props: SkeletonInputProps) {
  return <SkeletonInput {...props} />;
}

function Button(props: SkeletonButtonProps) {
  return <SkeletonButton {...props} />;
}

function Avatar(props: AvatarProps) {
  return <SkeletonAvatar {...props} />;
}

function Image(props: SkeletonImageProps) {
  return <SkeletonImage {...props} />;
}

function Node(props: SkeletonNodeProps) {
  return <SkeletonNode {...props} />;
}

export default function Skeleton(props: SkeletonProps) {
  return <AntdSkeleton {...props} />;
}

Skeleton.Table = Table;
Skeleton.Input = Input;
Skeleton.Button = Button;
Skeleton.Avatar = Avatar;
Skeleton.Image = Image;
Skeleton.Node = Node;
