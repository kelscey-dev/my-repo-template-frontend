"use client";
import { useState, type PropsWithChildren } from "react";
import { ConfigProvider, App as AntdApp } from "antd";
import { useServerInsertedHTML } from "next/navigation";
import { createCache, extractStyle, StyleProvider } from "@ant-design/cssinjs";

const colors = require("@styles/theme.ts");
const tailwindColors = require("tailwindcss/colors");

export default function AntdConfigProvider({ children }: PropsWithChildren) {
  const [cache] = useState(() => createCache());

  useServerInsertedHTML(() => {
    return (
      <script
        dangerouslySetInnerHTML={{
          __html: `</script>${extractStyle(cache)}<script>`,
        }}
      />
    );
  });

  return (
    <ConfigProvider
      getPopupContainer={(triggerNode) => {
        return triggerNode ? triggerNode.parentElement! : document.body;
      }}
      theme={{
        hashed: false,
        components: {
          Layout: {
            siderBg: colors.standard["page"],
            headerBg: colors.standard["page"],
            footerBg: colors.standard["page"],
            bodyBg: colors.standard["page"],
          },
        },
        token: {
          colorPrimary: colors.primary["500"],
          colorPrimaryBg: colors.primary["500"],
          colorPrimaryBgHover: colors.primary["600"],
          colorPrimaryActive: colors.primary["700"],
          colorPrimaryTextActive: colors.primary["700"],
          colorBorder: colors.standard["border"],
          colorBorderSecondary: colors.standard["border"],
          colorBgContainerDisabled: colors.standard["disabledBg"],
          colorText: colors.standard["text"],
          colorTextDisabled: colors.standard["disabledText"],
          colorTextPlaceholder: colors.standard["placeHolder"],
          colorBgContainer: colors.standard["page"],
          colorBgLayout: colors.standard["page"],
          colorBgBase: colors.standard["page"],
          fontFamily: "var(--font-raleway)",
          colorWarning: tailwindColors.yellow["500"],
          colorError: colors.primary["500"],
          colorInfo: tailwindColors.blue["500"],
          colorSuccess: tailwindColors.green["500"],
          //   boxShadow: colors.standard["shadow"],
          //   colorBgElevated: colors.primary["50"],
        },
      }}
    >
      <AntdApp className={`flex h-[calc(100dvh)]`}>
        <StyleProvider cache={cache}>{children}</StyleProvider>
      </AntdApp>
    </ConfigProvider>
  );
}
