'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/atoms/Button';
import { Modal } from '@/components/atoms/Modal';
import {
  mapGuestFormToCreateAddressInput,
  validateAuthInlineShippingForm,
  type GuestCheckoutField,
  type GuestCheckoutFormState,
} from '@/lib/checkout/guestCheckoutValidation';
import type { SavedAddress, UseAddressesResult } from '@/lib/hooks/useAddresses';
import { formatThaiPhoneNumberForDisplay } from '@/lib/helpers/phone';
import { cn } from '@/lib/utils';
import { ShippingAddressFields } from './ShippingAddressFields';

type AddressModalView = 'list' | 'add' | 'edit' | 'delete';

type AddressSelectBoxProps = {
  address: SavedAddress;
  selectedId: string | null;
  onSelect: (id: string) => void;
};

function AddressSelectBox({ address, selectedId, onSelect }: AddressSelectBoxProps) {
  const isSelected = selectedId === address.id;
  const addressLine = [
    address.addressLine1,
    address.tumbon,
    address.amphoe,
    address.province,
    address.postalCode,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type="button"
      role="radio"
      aria-checked={isSelected}
      data-testid={`address-option-${address.id}`}
      onClick={() => onSelect(address.id)}
      className={cn(
        'w-full rounded-sop-12px border px-sop-16px py-sop-12px text-left transition-colors',
        isSelected
          ? 'border-sop-primary-500 bg-sop-primary-100'
          : 'border-sop-neutral-grayalpha-300 bg-sop-base-white',
      )}
    >
      <div className="space-y-sop-4px">
        <div className="flex flex-wrap items-center gap-sop-8px">
          <p className="sop-body-sm-medium text-sop-neutral-gray-300">{address.fullName}</p>
          {address.isDefault ? (
            <span
              className="sop-body-xs-medium rounded-sop-16 bg-sop-secondary-100 px-2.5 py-1 text-sop-secondary-500"
              data-testid="default-address-badge"
            >
              ค่าเริ่มต้น
            </span>
          ) : null}
        </div>
        <p className="sop-body-xs-regular text-sop-neutral-gray-400">
          {formatThaiPhoneNumberForDisplay(address.phone)}
        </p>
        <p className="sop-body-xs-regular text-sop-neutral-gray-400">{addressLine}</p>
      </div>
    </button>
  );
}

const EMPTY_SHIPPING_FORM: Pick<
  GuestCheckoutFormState,
  'address' | 'subDistrict' | 'district' | 'province' | 'postalCode' | 'recipientFullName' | 'recipientPhone'
> = {
  address: '',
  subDistrict: '',
  district: '',
  province: '',
  postalCode: '',
  recipientFullName: '',
  recipientPhone: '',
};

function savedAddressToShippingForm(address: SavedAddress) {
  return {
    address: address.addressLine1,
    subDistrict: address.tumbon ?? '',
    district: address.amphoe,
    province: address.province,
    postalCode: address.postalCode,
    recipientFullName: address.fullName,
    recipientPhone: address.phone,
  };
}

type AddressManagementModalProps = {
  isOpen: boolean;
  onClose: () => void;
  addresses: SavedAddress[];
  selectedAddressId: string | null;
  onConfirmSelection: (addressId: string) => void;
  addressesApi: Pick<
    UseAddressesResult,
    'createAddress' | 'updateAddress' | 'deleteAddress' | 'setDefaultAddress'
  >;
};

export function AddressManagementModal({
  isOpen,
  onClose,
  addresses,
  selectedAddressId,
  onConfirmSelection,
  addressesApi,
}: AddressManagementModalProps) {
  const [view, setView] = useState<AddressModalView>('list');
  const [pendingSelectionId, setPendingSelectionId] = useState<string | null>(null);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [deletingAddressId, setDeletingAddressId] = useState<string | null>(null);
  const [formValues, setFormValues] = useState(EMPTY_SHIPPING_FORM);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<GuestCheckoutField, string>>>({});
  const [showFieldErrors, setShowFieldErrors] = useState(false);
  const [mutationLoading, setMutationLoading] = useState(false);
  const [mutationError, setMutationError] = useState<string | null>(null);

  const sortedAddresses = useMemo(
    () => [...addresses].sort((a, b) => Number(b.isDefault) - Number(a.isDefault)),
    [addresses],
  );

  const resetModalState = useCallback(() => {
    setView('list');
    setPendingSelectionId(selectedAddressId);
    setEditingAddressId(null);
    setDeletingAddressId(null);
    setFormValues(EMPTY_SHIPPING_FORM);
    setFieldErrors({});
    setShowFieldErrors(false);
    setMutationError(null);
  }, [selectedAddressId]);

  const handleFormChange = (field: keyof typeof formValues, value: string) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
    if (showFieldErrors) {
      const errorKeyMap: Partial<Record<keyof typeof formValues, GuestCheckoutField>> = {
        recipientFullName: 'recipientName',
        recipientPhone: 'recipientPhone',
        address: 'address',
        district: 'district',
        subDistrict: 'subDistrict',
        province: 'province',
        postalCode: 'postalCode',
      };
      const errorKey = errorKeyMap[field];
      if (errorKey) {
        setFieldErrors((prev) => {
          const next = { ...prev };
          delete next[errorKey];
          return next;
        });
      }
    }
  };

  const handleCascadeReset = (fields: Array<keyof typeof formValues>) => {
    setFormValues((prev) => {
      const next = { ...prev };
      for (const field of fields) {
        next[field] = '';
      }
      return next;
    });
  };

  const validateForm = () => {
    const validation = validateAuthInlineShippingForm({
      contactPhone: '',
      ...formValues,
    });
    if (!validation.valid) {
      setShowFieldErrors(true);
      setFieldErrors(validation.errors);
      return false;
    }
    return true;
  };

  const handleAddSave = async () => {
    if (!validateForm()) return;

    setMutationLoading(true);
    setMutationError(null);

    try {
      const created = await addressesApi.createAddress(
        mapGuestFormToCreateAddressInput(
          { contactPhone: '', ...formValues },
          { isDefault: false },
        ),
      );

      if (!created?.id) {
        setMutationError('ไม่สามารถบันทึกที่อยู่ได้');
        return;
      }

      setPendingSelectionId(created.id);
      setView('list');
      setFormValues(EMPTY_SHIPPING_FORM);
    } catch {
      setMutationError('ไม่สามารถบันทึกที่อยู่ได้');
    } finally {
      setMutationLoading(false);
    }
  };

  const handleEditSave = async () => {
    if (!editingAddressId || !validateForm()) return;

    setMutationLoading(true);
    setMutationError(null);

    try {
      const input = mapGuestFormToCreateAddressInput(
        { contactPhone: '', ...formValues },
        { isDefault: false },
      );
      const updated = await addressesApi.updateAddress(editingAddressId, {
        recipientName: input.recipientName,
        recipientPhone: input.recipientPhone,
        addressLine1: input.addressLine1,
        addressLine2: input.addressLine2,
        tumbon: input.tumbon,
        amphoe: input.amphoe,
        province: input.province,
        postalCode: input.postalCode,
      });

      if (!updated) {
        setMutationError('ไม่สามารถบันทึกที่อยู่ได้');
        return;
      }

      setView('list');
      setEditingAddressId(null);
    } catch {
      setMutationError('ไม่สามารถบันทึกที่อยู่ได้');
    } finally {
      setMutationLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingAddressId) return;

    setMutationLoading(true);
    setMutationError(null);

    try {
      const deleted = await addressesApi.deleteAddress(deletingAddressId);
      if (!deleted) {
        setMutationError('ไม่สามารถลบที่อยู่ได้');
        return;
      }

      if (pendingSelectionId === deletingAddressId) {
        setPendingSelectionId(null);
      }

      setView('list');
      setDeletingAddressId(null);
    } catch {
      setMutationError('ไม่สามารถลบที่อยู่ได้');
    } finally {
      setMutationLoading(false);
    }
  };

  if (!isOpen) return null;

  const renderListView = () => (
    <div
      role="radiogroup"
      aria-label="เลือกที่อยู่จัดส่ง"
      className="flex flex-col gap-sop-12px"
    >
      {sortedAddresses.map((address) => (
        <div key={address.id} className="space-y-sop-8px">
          <AddressSelectBox
            address={address}
            selectedId={pendingSelectionId}
            onSelect={setPendingSelectionId}
          />
          <div className="flex flex-wrap gap-sop-8px px-sop-4px">
            {!address.isDefault ? (
              <Button
                variant="ghost"
                size="sm"
                type="button"
                data-testid={`address-set-default-${address.id}`}
                disabled={mutationLoading}
                onClick={async () => {
                  setMutationLoading(true);
                  try {
                    await addressesApi.setDefaultAddress(address.id);
                  } finally {
                    setMutationLoading(false);
                  }
                }}
              >
                ตั้งเป็นค่าเริ่มต้น
              </Button>
            ) : null}
            <Button
              variant="outline"
              size="sm"
              type="button"
              data-testid={`address-edit-${address.id}`}
              disabled={mutationLoading}
              onClick={() => {
                setEditingAddressId(address.id);
                setFormValues(savedAddressToShippingForm(address));
                setView('edit');
              }}
            >
              แก้ไข
            </Button>
            <Button
              variant="outline"
              size="sm"
              type="button"
              data-testid={`address-delete-${address.id}`}
              disabled={mutationLoading}
              onClick={() => {
                setDeletingAddressId(address.id);
                setView('delete');
              }}
            >
              ลบ
            </Button>
          </div>
        </div>
      ))}
    </div>
  );

  const renderFormView = (mode: 'add' | 'edit') => (
    <div data-testid={mode === 'add' ? 'address-modal-add' : `address-modal-edit-${editingAddressId}`}>
      <ShippingAddressFields
        values={formValues}
        onChange={handleFormChange}
        onCascadeReset={handleCascadeReset}
        errors={fieldErrors}
        showErrors={showFieldErrors}
        showHeading={false}
      />
      {mutationError ? (
        <p role="alert" className="mt-sop-12px sop-body-sm-regular text-sop-system-error-400">
          {mutationError}
        </p>
      ) : null}
      <div className="mt-sop-16px flex flex-col gap-sop-8px sm:flex-row sm:justify-end">
        <Button
          variant="filled"
          size="md"
          type="button"
          data-testid={mode === 'add' ? 'address-add-cancel' : 'address-edit-cancel'}
          onClick={() => {
            setView('list');
            setEditingAddressId(null);
            setFormValues(EMPTY_SHIPPING_FORM);
          }}
        >
          ยกเลิก
        </Button>
        <Button
          variant="primary"
          size="md"
          type="button"
          loading={mutationLoading}
          disabled={mutationLoading}
          data-testid={mode === 'add' ? 'address-add-submit' : 'address-edit-submit'}
          onClick={() => {
            void (mode === 'add' ? handleAddSave() : handleEditSave());
          }}
        >
          บันทึก
        </Button>
      </div>
    </div>
  );

  const renderDeleteView = () => (
    <div data-testid="address-delete-confirm">
      <p className="sop-body-sm-regular text-sop-neutral-gray-300">
        คุณต้องการลบที่อยู่นี้หรือไม่?
      </p>
      {mutationError ? (
        <p role="alert" className="mt-sop-12px sop-body-sm-regular text-sop-system-error-400">
          {mutationError}
        </p>
      ) : null}
      <div className="mt-sop-16px flex flex-col gap-sop-8px sm:flex-row sm:justify-end">
        <Button
          variant="filled"
          size="md"
          type="button"
          data-testid="address-delete-confirm-cancel"
          onClick={() => {
            setView('list');
            setDeletingAddressId(null);
          }}
        >
          ยกเลิก
        </Button>
        <Button
          variant="destructive"
          size="md"
          type="button"
          loading={mutationLoading}
          disabled={mutationLoading}
          data-testid="address-delete-confirm-submit"
          onClick={() => {
            void handleDeleteConfirm();
          }}
        >
          ลบ
        </Button>
      </div>
    </div>
  );

  return (
    <Modal
      data-testid="address-modal"
      onClose={onClose}
      header={
        <div className="flex items-center justify-between gap-sop-12px">
          <h2
            className="sop-body-lg-medium text-sop-neutral-gray-200"
            data-testid="address-modal-title"
          >
            ข้อมูลการจัดส่ง
          </h2>
          {view === 'list' ? (
            <Button
              variant="outline"
              size="sm"
              type="button"
              data-testid="address-add-button"
              onClick={() => {
                setFormValues(EMPTY_SHIPPING_FORM);
                setView('add');
              }}
            >
              เพิ่มที่อยู่ใหม่
            </Button>
          ) : null}
        </div>
      }
      footer={
        view === 'list' ? (
          <div className="flex flex-col gap-sop-8px sm:flex-row sm:justify-end">
            <Button
              variant="filled"
              size="md"
              type="button"
              data-testid="address-cancel-button"
              onClick={onClose}
            >
              ยกเลิก
            </Button>
            <Button
              variant="primary"
              size="md"
              type="button"
              disabled={pendingSelectionId === null || mutationLoading}
              data-testid="address-confirm-button"
              onClick={() => {
                if (pendingSelectionId) {
                  onConfirmSelection(pendingSelectionId);
                  onClose();
                }
              }}
            >
              ยืนยัน
            </Button>
          </div>
        ) : null
      }
    >
      {view === 'list' ? renderListView() : null}
      {view === 'add' ? renderFormView('add') : null}
      {view === 'edit' ? renderFormView('edit') : null}
      {view === 'delete' ? renderDeleteView() : null}
    </Modal>
  );
}
