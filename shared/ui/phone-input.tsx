"use client";

import * as React from "react";
import IntlTelInput from "react-intl-tel-input";
import "react-intl-tel-input/dist/main.css";
import { normalizePhone } from "@/shared/constants/phone";
import { cn } from "@/shared/utils/cn";

export interface PhoneInputProps {
  value?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  id?: string;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  /** Classe pour le conteneur (ligne code + numéro) */
  containerClassName?: string;
  /** Afficher une erreur de style (bordure rouge) */
  error?: boolean;
}

/** Pays préférés (Afrique de l'Ouest + France) en codes ISO2 pour le sélecteur */
const PREFERRED_COUNTRIES = ["ci", "sn", "ml", "bf", "tg", "bj", "fr", "cm", "ng"];

/**
 * Champ téléphone avec code pays et numéro au format E.164, basé sur react-intl-tel-input.
 * value/onChange en E.164 (ex: +2250700000000).
 */
const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(
  (
    {
      value = "",
      onChange,
      onBlur,
      id,
      placeholder = "00 00 00 00 00",
      className,
      containerClassName,
      disabled,
      error,
    },
    _ref
  ) => {
    const normalizedValue = normalizePhone(value);

    const handlePhoneNumberChange = React.useCallback(
      (
        _isValid: boolean,
        _inputValue: string,
        _selectedCountryData: unknown,
        fullNumber: string,
        _extension: string
      ) => {
        onChange?.(normalizePhone(fullNumber || ""));
      },
      [onChange]
    );

    const handleBlur = React.useCallback(
      (
        _isValid: boolean,
        _inputValue: string,
        _selectedCountryData: unknown,
        _fullNumber: string,
        _extension: string,
        event: React.FocusEvent<HTMLInputElement>
      ) => {
        onBlur?.();
        // Permettre au parent de réagir au blur si besoin
        const target = event?.target;
        if (target && typeof target.blur === "function") {
          // déjà blur, pas d'action supplémentaire
        }
      },
      [onBlur]
    );

    const inputClasses = cn(
      "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
      "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      "disabled:cursor-not-allowed disabled:opacity-50",
      error && "!border-red-500 focus-visible:!ring-red-500",
      className
    );

    return (
      <div
        className={cn(
          "intl-tel-input-wrapper",
          error && "intl-tel-input-wrapper--error",
          containerClassName
        )}
        data-error={error}
      >
        <IntlTelInput
          containerClassName={cn(
            "intl-tel-input flex rounded-md overflow-hidden border border-input",
            error && "!border-red-500"
          )}
          inputClassName={inputClasses}
          fieldId={id}
          fieldName="phone"
          value={normalizedValue}
          onPhoneNumberChange={handlePhoneNumberChange}
          onPhoneNumberBlur={handleBlur}
          defaultCountry="ci"
          preferredCountries={PREFERRED_COUNTRIES}
          placeholder={placeholder}
          disabled={disabled}
          format={true}
          autoPlaceholder={!placeholder}
          telInputProps={{
            "aria-label": "Numéro de téléphone",
            autoComplete: "tel-national",
          }}
        />
      </div>
    );
  }
);
PhoneInput.displayName = "PhoneInput";

export { PhoneInput };
