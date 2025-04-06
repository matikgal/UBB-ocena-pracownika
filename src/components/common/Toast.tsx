import { toast as sonnerToast } from "sonner"

type ToastOptions = Parameters<typeof sonnerToast>[1]

export const toast = {
  success: (message: string, options?: ToastOptions) => 
    sonnerToast.success(message, options),
  
  error: (message: string, options?: ToastOptions) => 
    sonnerToast.error(message, options),
  
  info: (message: string, options?: ToastOptions) => 
    sonnerToast.info(message, options),
  
  warning: (message: string, options?: ToastOptions) => 
    sonnerToast.warning(message, options),
  
  custom: (render: (id: string | number) => React.ReactElement, options?: ToastOptions) => 
    sonnerToast.custom(render, options),
  
  dismiss: (toastId?: string | number) => 
    sonnerToast.dismiss(toastId)
}