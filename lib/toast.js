import toast from 'react-hot-toast';

/**
 * Toast notification utilities for better user experience
 */

export const showToast = {
  /**
   * Show success toast
   * @param {string} message - Success message
   */
  success: (message) => {
    toast.success(message);
  },

  /**
   * Show error toast
   * @param {string} message - Error message
   */
  error: (message) => {
    toast.error(message);
  },

  /**
   * Show loading toast
   * @param {string} message - Loading message
   * @returns {string} Toast ID for dismissing later
   */
  loading: (message) => {
    return toast.loading(message);
  },

  /**
   * Show info toast
   * @param {string} message - Info message
   */
  info: (message) => {
    toast(message, {
      icon: 'ℹ️',
    });
  },

  /**
   * Show warning toast
   * @param {string} message - Warning message
   */
  warning: (message) => {
    toast(message, {
      icon: '⚠️',
      style: {
        border: '1px solid #f59e0b',
      },
    });
  },

  /**
   * Show promise-based toast (auto-updates based on promise state)
   * @param {Promise} promise - Promise to track
   * @param {object} messages - Messages for each state
   */
  promise: (promise, messages) => {
    return toast.promise(promise, {
      loading: messages.loading || 'Loading...',
      success: messages.success || 'Success!',
      error: messages.error || 'Something went wrong',
    });
  },

  /**
   * Dismiss a specific toast or all toasts
   * @param {string} toastId - Optional toast ID to dismiss specific toast
   */
  dismiss: (toastId) => {
    if (toastId) {
      toast.dismiss(toastId);
    } else {
      toast.dismiss();
    }
  },

  /**
   * Custom toast with full control
   * @param {string} message - Message to display
   * @param {object} options - Custom options
   */
  custom: (message, options = {}) => {
    return toast(message, options);
  },
};

/**
 * API error handler with toast notifications
 * @param {Error|Response} error - Error object or Response
 * @param {string} defaultMessage - Default error message
 */
export async function handleApiError(error, defaultMessage = 'An error occurred') {
  let errorMessage = defaultMessage;

  try {
    if (error instanceof Response) {
      const data = await error.json();
      errorMessage = data.error || data.message || defaultMessage;
    } else if (error.message) {
      errorMessage = error.message;
    }
  } catch (e) {
    // If parsing fails, use default message
  }

  showToast.error(errorMessage);
  return errorMessage;
}

/**
 * Common toast messages for consistent UX
 */
export const toastMessages = {
  // Auth
  loginSuccess: 'Successfully logged in!',
  loginError: 'Invalid email or password',
  logoutSuccess: 'Successfully logged out',
  registerSuccess: 'Account created successfully!',

  // Generic CRUD
  saveSuccess: 'Changes saved successfully',
  saveError: 'Failed to save changes',
  deleteSuccess: 'Deleted successfully',
  deleteError: 'Failed to delete',
  createSuccess: 'Created successfully',
  createError: 'Failed to create',
  updateSuccess: 'Updated successfully',
  updateError: 'Failed to update',

  // Visits
  visitRequestSuccess: 'Visit request submitted!',
  visitApprovedSuccess: 'Visit approved successfully',
  visitRejectedSuccess: 'Visit rejected',

  // Rewards
  rewardRedeemedSuccess: 'Reward redeemed successfully!',
  rewardError: 'Failed to redeem reward',

  // Network
  networkError: 'Network error. Please check your connection.',
  serverError: 'Server error. Please try again later.',

  // Validation
  validationError: 'Please check your input and try again',

  // Permissions
  permissionDenied: 'You don\'t have permission to perform this action',

  // Loading states
  loadingSave: 'Saving...',
  loadingDelete: 'Deleting...',
  loadingCreate: 'Creating...',
  loadingUpdate: 'Updating...',
};

export default showToast;
