import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

const useVerifyEmail = () => {
  const queryClient = useQueryClient();

  const { mutate: verifyEmailMutation, isPending: isVerifying } = useMutation({
    mutationFn: async (code) => {
      const response = await axiosInstance.post("/auth/verify-email", { code });
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data.message || "Email verified!");
      queryClient.setQueryData(["authUser"], data.user);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Verification failed");
    },
  });

  const { mutate: resendCodeMutation, isPending: isResending } = useMutation({
    mutationFn: async () => {
      const response = await axiosInstance.post("/auth/resend-code");
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data.message || "Code resent!");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Resend failed");
    },
  });

  return { verifyEmailMutation, isVerifying, resendCodeMutation, isResending };
};

export default useVerifyEmail;
