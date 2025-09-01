import { nextTick } from "vue";

/**
 * Formats a phone number string with proper Brazilian formatting: (XX) X XXXX-XXXX
 * @param digits String containing only the numeric digits of the phone number
 * @returns Formatted phone number string
 */
export function formatPhoneNumber(digits: string): string {
  const digitsOnly = digits.replace(/\D/g, '');
  let formatted = '';

  if (digitsOnly.length > 0) {
    // Add area code with parentheses
    formatted = `(${digitsOnly.substring(0, Math.min(2, digitsOnly.length))}`;

    if (digitsOnly.length > 2) {
      // Add closing parenthesis and first digit
      formatted += `) ${digitsOnly.substring(2, 3)}`;

      if (digitsOnly.length > 3) {
        // Add middle digits
        formatted += ` ${digitsOnly.substring(3, Math.min(7, digitsOnly.length))}`;

        if (digitsOnly.length > 7) {
          // Add final digits with hyphen
          formatted += `-${digitsOnly.substring(7, digitsOnly.length)}`;
        }
      }
    }
  }

  return formatted;
}

/**
 * Find the position right before where the hyphen would be in a formatted phone number
 * @param formattedNumber The formatted phone number string
 * @returns The cursor position right before the hyphen
 */
export function findPositionBeforeHyphen(formattedNumber: string): number {
  // Find position before the hyphen (after the 7th digit)
  let digitCount = 0;
  for (let i = 0; i < formattedNumber.length; i++) {
    if (/\d/.test(formattedNumber.charAt(i))) {
      digitCount++;
      if (digitCount === 7) {
        return i + 1; // Position after the 7th digit
      }
    }
  }
  return formattedNumber.length; // If no hyphen, position at the end
}

/**
 * Extracts only the digits from a phone number string
 * @param phoneNumber The phone number string that may contain formatting
 * @returns String containing only the numeric digits
 */
export function getPhoneDigits(phoneNumber: string): string {
  return (phoneNumber || '').replace(/\D/g, '');
}

/**
 * A Vue directive that automatically formats phone number inputs
 * Can be used like: v-phone-mask
 */
export const phoneDirective = {
  mounted(el: HTMLElement) {
    // Only apply to input elements
    if (!(el instanceof HTMLInputElement)) {
      console.warn('Phone mask directive should only be used on input elements');
      return;
    }

    // We need to handle the input event in a way that correctly updates v-model
    const handler = function(event: Event) {
      // Safety check - ensure we're working with an input element
      const input = event.target as HTMLInputElement;
      if (!input || !input.value) return;

      // First apply our formatting
      const originalValue = input.value;
      const digitsOnly = originalValue.replace(/\D/g, '');
      const limitedDigits = digitsOnly.substring(0, 11);

      // If trying to add more than 11 digits, just keep previous value
      if (digitsOnly.length > 11 && (event as InputEvent).inputType !== 'deleteContentBackward') {
        // We keep the last valid 11-digit value
        input.value = formatPhoneNumber(limitedDigits);

        // Manually dispatch input event to ensure v-model gets updated with right value
        event.stopImmediatePropagation();
        input.dispatchEvent(new Event('input', { bubbles: true }));

        // Position cursor at the end
        const cursorPos = input.value.length;
        input.setSelectionRange(cursorPos, cursorPos);
        return;
      }

      // Format the value (handles normal cases)
      input.value = formatPhoneNumber(limitedDigits);

      // Update cursor position (handled in the existing handlePhoneInput function)
      handlePhoneCursorPosition(input, originalValue, event as InputEvent);
    };

    // Add our event listener
    el.addEventListener('input', handler);

    // Store the handler for cleanup
    (el as any)._phoneMaskHandler = handler;
  },

  updated(el: HTMLElement) {
    // Ensure model value is correctly formatted (for programmatic changes)
    if (el instanceof HTMLInputElement && el.value) {
      const digitsOnly = el.value.replace(/\D/g, '');
      const limitedDigits = digitsOnly.substring(0, 11);
      el.value = formatPhoneNumber(limitedDigits);
    }
  },

  unmounted(el: HTMLElement) {
    // Clean up the event listener
    if ((el as any)._phoneMaskHandler) {
      el.removeEventListener('input', (el as any)._phoneMaskHandler);
      delete (el as any)._phoneMaskHandler;
    }
  }
};

/**
 * Helper function to handle cursor positioning in phone inputs
 */
function handlePhoneCursorPosition(
  input: HTMLInputElement,
  previousValue: string,
  event: InputEvent
) {
  const cursorPos = input.selectionStart || 0;
  const isBackspace = event.inputType === 'deleteContentBackward';

  nextTick(() => {
    // If not backspacing, try to maintain cursor relative to digits
    if (!isBackspace) {
      // Count digits before cursor in the original value
      let originalDigitsBeforeCursor = 0;
      for (let i = 0; i < cursorPos; i++) {
        if (/\d/.test(previousValue.charAt(i))) {
          originalDigitsBeforeCursor++;
        }
      }

      // Limit the count to 11 digits
      originalDigitsBeforeCursor = Math.min(originalDigitsBeforeCursor, 11);

      // Find position with the same number of digits in new value
      let newPos = 0;
      let digitsCount = 0;
      for (let i = 0; i < input.value.length; i++) {
        if (digitsCount === originalDigitsBeforeCursor) {
          newPos = i;
          break;
        }
        if (/\d/.test(input.value.charAt(i))) {
          digitsCount++;
        }
        newPos = i + 1;
      }

      input.setSelectionRange(newPos, newPos);
    }
    // If backspacing, position cursor more carefully
    else if (cursorPos > 0) {
      // Check if we're backspacing from the end of the string
      if (cursorPos >= previousValue.length) {
        // Position at the end of the new formatted value
        input.setSelectionRange(input.value.length, input.value.length);
      } else {
        // Count digits before cursor in the original value
        let digitsBeforeCursor = 0;
        for (let i = 0; i < cursorPos; i++) {
          if (/\d/.test(previousValue.charAt(i))) {
            digitsBeforeCursor++;
          }
        }

        // If the cursor was right after a digit that was removed, adjust
        if (/\d/.test(previousValue.charAt(cursorPos - 1))) {
          digitsBeforeCursor = Math.max(0, digitsBeforeCursor - 1);
        }

        // Find the corresponding position in the new formatted string
        let newPos = 0;
        let digitCount = 0;
        for (let i = 0; i < input.value.length; i++) {
          if (digitCount === digitsBeforeCursor) {
            newPos = i;
            break;
          }
          if (/\d/.test(input.value.charAt(i))) {
            digitCount++;
          }
          newPos = i + 1;
        }

        input.setSelectionRange(newPos, newPos);
      }
    }
  });
}

/**
 * Handler for phone number input events with cursor position preservation
 * @param event The input event from a text field
 */
export function handlePhoneInput(event: Event) {
  const input = event.target as HTMLInputElement;
  const previousValue = input.value;

  // Get only digits from current value
  const digitsOnly = input.value.replace(/\D/g, '');

  // Strictly limit to 11 digits maximum
  const limitedDigits = digitsOnly.substring(0, 11);

  // Format using our helper method
  input.value = formatPhoneNumber(limitedDigits);

  // Use our helper for cursor positioning
  handlePhoneCursorPosition(input, previousValue, event as InputEvent);
}

/**
 * Composable that provides phone masking functionality
 * @returns Object with phone masking methods
 */
export function usePhoneMask() {
  return {
    formatPhoneNumber,
    getPhoneDigits,
    handlePhoneInput
  };
}

// Register the directive plugin
export default {
  install(app: any) {
    app.directive('phone-mask', phoneDirective);
  }
};