import Modal from "./Modal";
import Button from "./Button";

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Action",
  message = "Are you sure you want to proceed?",
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "primary",
  loading = false,
}) {
  const actions = (
    <>
      <Button variant="ghost" onClick={onClose} disabled={loading}>
        {cancelLabel}
      </Button>
      <Button
        variant={variant === "danger" ? "primary" : variant}
        onClick={onConfirm}
        loading={loading}
        className={variant === "danger" ? "bg-red-600 hover:bg-red-700" : ""}>
        {confirmLabel}
      </Button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      actions={actions}
      size="sm">
      <p className="text-gray-600 dark:text-gray-400">{message}</p>
    </Modal>
  );
}
