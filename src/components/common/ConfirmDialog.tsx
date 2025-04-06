import { Button } from "../ui/button"

interface ConfirmDialogProps {
  title: string
  message: string
  confirmLabel: string
  cancelLabel: string
  onConfirm: () => void
  onCancel: () => void
  icon?: React.ReactNode
  variant?: "danger" | "warning" | "info"
}

export function ConfirmDialog({
  title,
  message,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
  icon,
  variant = "info"
}: ConfirmDialogProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case "danger":
        return {
          confirmButton: "bg-red-600 hover:bg-red-700 text-white",
          iconBg: "bg-red-100",
          iconColor: "text-red-600"
        }
      case "warning":
        return {
          confirmButton: "bg-amber-600 hover:bg-amber-700 text-white",
          iconBg: "bg-amber-100",
          iconColor: "text-amber-600"
        }
      default:
        return {
          confirmButton: "bg-blue-600 hover:bg-blue-700 text-white",
          iconBg: "bg-blue-100",
          iconColor: "text-blue-600"
        }
    }
  }

  const styles = getVariantStyles()

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto">
      {icon && (
        <div className="flex items-center gap-3 mb-4">
          <div className={`${styles.iconBg} p-2 rounded-full`}>
            <div className={styles.iconColor}>{icon}</div>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
      )}
      
      {!icon && <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>}
      
      <p className="text-gray-700 mb-6">{message}</p>
      
      <div className="flex justify-end gap-3">
        <Button 
          variant="outline" 
          onClick={onCancel}
          className="border-gray-200 hover:bg-gray-50 text-gray-700"
        >
          {cancelLabel}
        </Button>
        <Button 
          onClick={onConfirm}
          className={styles.confirmButton}
        >
          {confirmLabel}
        </Button>
      </div>
    </div>
  )
}