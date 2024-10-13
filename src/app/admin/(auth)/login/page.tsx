"use client";

import { Form } from "antd";
import { useRouter } from "next/navigation";
import Button from "@components/commons/Button";
import ImageBlur from "@components/commons/ImageBlur";
import Input from "@components/commons/Input";
import { useGetRequest, usePostRequest } from "@utils/api/apiRequests";

export default function Page() {
  const [LoginForm] = Form.useForm();
  const router = useRouter();

  const { mutate: login, isPending: IsLoginLoading } = usePostRequest(
    "/api/auth/login",
    {
      mutationOptions: {
        onSuccess: () => {
          window.location.reload();
        },
      },
    }
  );

  const {
    data: sampleData,
    isFetching: isSampleLoading,
    refetch: refetchSample,
  } = useGetRequest("/api/auth/me", {
    queryKey: ["inventories"],
    queryOptions: {
      enabled: false,
    },
  });

  console.log(sampleData, "AUTH");

  return (
    <div className="h-full flex-auto flex">
      {!isSampleLoading && (
        <div
          className="hidden md:flex relative basis-full md:basis-[50%]"
          onClick={() => refetchSample()}
        >
          <ImageBlur
            src="/images/login-bg.jpg"
            alt="CRM Login BG"
            loading="eager"
            className="object-cover"
            containerClass="w-full h-full"
            priority={true}
          />
        </div>
      )}
      <div className="absolute md:relative h-full w-full md:w-auto top-0 left-0 flex-auto bg-white">
        <div className="h-full w-full overflow-auto p-[5%] flex flex-col justify-center items-center">
          <div className="space-y-12 md:max-w-xl w-full">
            <ImageBlur
              src="/images/logo.png"
              alt="CRM Logo"
              containerClass="items-center h-[12rem] w-full relative"
              loading="eager"
              priority={true}
            />
            <Form
              form={LoginForm}
              layout="vertical"
              onFinish={(values) => {
                login(values);
              }}
              className="w-full"
            >
              <div className="grid grid-cols-1 gap-y-4">
                <Form.Item
                  label="Username"
                  name="username"
                  rules={[{ required: true, message: "Username is required" }]}
                  required={false}
                >
                  <Input
                    id="username"
                    placeholder="Username"
                    className="rounded-md"
                  />
                </Form.Item>
                <Form.Item
                  label="Password"
                  name="password"
                  rules={[{ required: true, message: "Password is required" }]}
                  required={false}
                >
                  <Input.Password
                    placeholder="Password"
                    className="rounded-md"
                  />
                </Form.Item>
              </div>
              <div className="space-y-4 mt-10 text-center flex flex-col">
                <Button
                  type="primary"
                  htmlType="submit"
                  className="py-4"
                  disabled={IsLoginLoading}
                >
                  LOGIN
                </Button>
                <Button
                  type="link"
                  className="font-semibold text-primary hover:text-primary-700"
                >
                  Forgot Password
                </Button>
              </div>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}
