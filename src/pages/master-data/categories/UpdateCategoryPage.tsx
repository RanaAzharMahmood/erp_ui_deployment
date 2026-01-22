import React from 'react';
import { useParams } from 'react-router-dom';
import { CategoryForm } from '../../../components/categories';
import { CategoryFormSkeleton } from '../../../components/forms';
import { useCategoryForm } from '../../../hooks/useCategoryForm';

const UpdateCategoryPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const {
    formData,
    fieldErrors,
    companies,
    isSubmitting,
    isDeleting,
    loading,
    error,
    successMessage,
    handleInputChange,
    handleSelectChange,
    handleStatusChange,
    handleSubmit,
    handleDelete,
    handleCancel,
    setError,
    setSuccessMessage,
  } = useCategoryForm({ categoryId: id, mode: 'edit' });

  if (loading) {
    return <CategoryFormSkeleton />;
  }

  return (
    <CategoryForm
      mode="edit"
      formData={formData}
      fieldErrors={fieldErrors}
      companies={companies}
      isSubmitting={isSubmitting}
      isDeleting={isDeleting}
      error={error}
      successMessage={successMessage}
      onInputChange={handleInputChange}
      onSelectChange={handleSelectChange}
      onStatusChange={handleStatusChange}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      onDelete={handleDelete}
      onErrorClose={() => setError('')}
      onSuccessClose={() => setSuccessMessage('')}
    />
  );
};

export default UpdateCategoryPage;
