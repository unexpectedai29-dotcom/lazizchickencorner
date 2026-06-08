/**
 * Unified Global Toast Dispatcher
 * Dispatches animated hot toasts matching the Laziz Chicken theme
 */

export type ToastType = 'success' | 'info' | 'error' | 'warning';

export const showToast = (message: string, type: ToastType = 'success', title?: string) => {
  window.dispatchEvent(
    new CustomEvent('app-toast', {
      detail: { message, type, title },
    })
  );
};
