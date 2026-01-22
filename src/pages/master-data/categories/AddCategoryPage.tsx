import React from 'react';
import { CategoryForm } from '../../../components/categories';
import { useCategoryForm } from '../../../hooks/useCategoryForm';

const AddCategoryPage: React.FC = () => {
  const {
    formData,
    fieldErrors,
    companies,
    isSubmitting,
    error,
    successMessage,
    handleInputChange,
    handleSelectChange,
    handleStatusChange,
    handleSubmit,
    handleCancel,
    setError,
    setSuccessMessage,
  } = useCategoryForm({ mode: 'create' });

  return (
    <CategoryForm
      mode="create"
      formData={formData}
      fieldErrors={fieldErrors}
      companies={companies}
      isSubmitting={isSubmitting}
      error={error}
      successMessage={successMessage}
      onInputChange={handleInputChange}
      onSelectChange={handleSelectChange}
      onStatusChange={handleStatusChange}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      onErrorClose={() => setError('')}
      onSuccessClose={() => setSuccessMessage('')}
    />
  );
};

export default AddCategoryPage;
