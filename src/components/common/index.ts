// Re-export from categorized folders for backward compatibility
export { ConfirmDialog } from '../feedback';
export { TableSkeleton, LazyImage, FilterManager } from '../data-display';
export type { FilterField } from '../data-display';
export { FormSection, StatusSelector, DangerZone, ActionButtons } from '../forms';
export { PageHeader } from '../navigation';

// Keep SuspenseRoute in common as it's a utility wrapper
export { default as SuspenseRoute } from './SuspenseRoute';
