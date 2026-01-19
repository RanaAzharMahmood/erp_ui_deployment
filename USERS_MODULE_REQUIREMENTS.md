# Users Module - Implementation Requirements & Context

## Project Overview
- **Frontend**: React 18 + TypeScript + Material-UI (MUI) v5
- **Backend**: Node.js + Express + TypeScript + Sequelize + PostgreSQL
- **API**: Auto-generated client from Swagger/OpenAPI
- **Authentication**: Bearer token (stored in localStorage as `erp_token` or `auth_token`)

## Login Credentials (for testing)
- **Email**: `john.doe@example.com`
- **Password**: `password123`

## URLs
- **Frontend Dev Server**: http://localhost:3001/
- **Backend API Server**: http://localhost:8000/
- **API Documentation**: http://localhost:8000/api-docs

---

## Design Requirements (Based on Screenshots)

### 1. Filter Design - CRITICAL
The filter should be a **popup/dropdown Card** that appears when clicking the **Filter button** at the top-left.

#### Correct Layout (From Screenshot):
```
Top Bar:
┌────────────────────────────────────────────────────────────┐
│  [☰ Filter]              [🔍 Search............]  [Add User]│
└────────────────────────────────────────────────────────────┘

Filter Popup (appears below Filter button when clicked):
┌─────────────────────────────────┐
│ Company Name   [Select Company▼]│
│ Status         [Select Status ▼]│
│                                  │
│ [💾 Save Filter] [Clear Filter] [Apply Filter] │
└─────────────────────────────────┘
```

#### Key Features:
- **Filter Button**:
  - Position: Top-left corner
  - Style: Outlined button with hamburger icon
  - Text: "Filter"
  - Action: Toggles filter popup visibility

- **Filter Popup**:
  - Appears as a dropdown/popover below the Filter button
  - Card with orange border (`#FF6B35`)
  - White background with shadow
  - Auto-closes when clicking outside or after Apply

- **Layout Inside Popup**:
  - Label on left (fixed width ~120px)
  - Dropdown on right (full width)
  - 2-3 filter rows depending on page:
    - **Companies Page**: Company Name, Status
    - **Users Page**: Company Name, User Role, Status
  - Button row at bottom

- **Buttons** (inside popup):
  - **Save Filter**: Green outlined (#4CAF50) with save icon - saves to localStorage
  - **Clear Filter**: Gray outlined - resets all filters
  - **Apply Filter**: Orange filled (#FF6B35) - applies and closes popup

#### Filter Persistence:
- Save filters to localStorage with key format: `filters_{page}_{userId}`
- Example keys:
  - `filters_companies_1` (for user ID 1 on companies page)
  - `filters_users_1` (for user ID 1 on users page)
- Load saved filters on page mount
- Clear filters when user logs out

#### WRONG Implementation (Current):
❌ Filter card is always visible (should be popup)
❌ Takes up too much vertical space
❌ No Filter button toggle
❌ Missing proper popup/dropdown behavior

### 2. Search Bar
- **Position**: Top-right, next to "Add User" button
- **Style**: Text field with search icon
- **Placeholder**: "Search"
- **Functionality**: Search by user name or email (debounced)

### 3. Table Design

#### Columns:
1. **User** (with avatar + name + email below)
2. **Role** (Admin, Manager, Accountant, User)
3. **Status** (Active/Inactive chip)
4. **Last Login** (date)
5. **Actions** (Edit + Delete icons)

#### Features:
- Row hover effect
- Avatar with user initial if no image
- Pagination at bottom (5, 10, 25, 50 rows per page)
- Loading skeleton during data fetch
- Empty state with helpful message

### 4. Add/Edit User Page Design

Based on screenshot, the design is different from what's currently implemented:

#### Layout Structure:
```
┌─────────────────────────────────────────────────┐
│ Add User                              [Admin] 👤 │
├─────────────────────────────────────────────────┤
│                                                   │
│ ┌─────────────────────┐  ┌────────────────────┐ │
│ │ 📋 User Information │  │ 🖼️ User image      │ │
│ │                     │  │   [Image Preview]   │ │
│ │ First Name *  Last  │  │   ✏️ 🗑️            │ │
│ │ [John      ] [Harry]│  └────────────────────┘ │
│ │                     │                          │
│ │ CNIC *      Contact │  ┌────────────────────┐ │
│ │ [00000-...] [+92..] │  │ 📊 Summary         │ │
│ │                     │  │ Companies: 2        │ │
│ │ Contact No* Password│  │ Roles Assign: 4     │ │
│ │ [+92...]    [****]  │  │ Total Permissions:4 │ │
│ │                     │  └────────────────────┘ │
│ │ Email               │                          │
│ │ [example@...]       │  ┌────────────────────┐ │
│ │                     │  │ ⭕ Status           │ │
│ │ About User          │  │ ⚫ Active            │ │
│ │ [Text area...]      │  │ ⚪ Inactive          │ │
│ └─────────────────────┘  └────────────────────┘ │
│                                                   │
│ ┌─────────────────────────────────────────────┐ │
│ │ 🏢 Company Access And Rules                 │ │
│ │                                             │ │
│ │ ➕ Add Company                              │ │
│ │                                             │ │
│ │ Company Name *         Role                │ │
│ │ [EST Gas          ▼]  [Employee        ▼] ❌│ │
│ │                                             │ │
│ │ Permissions                                 │ │
│ │ ☑️ All                                      │ │
│ │ ☑️ Sales Module  ☑️ Purchase Module        │ │
│ │   ☑️ View         ☑️ View                  │ │
│ │   ☑️ Add          ☑️ Add                   │ │
│ │   ☑️ Edit         ☑️ Edit                  │ │
│ │   ☐ Delete        ☐ Delete                │ │
│ │ ☐ Finance & Accounting  ☐ Inventory       │ │
│ │   ☐ View              ☐ View              │ │
│ │   ☐ Add               ☐ Add               │ │
│ │   ☐ Edit              ☐ Edit              │ │
│ │   ☐ Delete            ☐ Delete            │ │
│ │                                             │ │
│ │ [Second Company Row with same structure]   │ │
│ └─────────────────────────────────────────────┘ │
│                                                   │
│                    [Cancel] [➕ Add User]         │
└─────────────────────────────────────────────────┘
```

#### Key Differences from Current Implementation:
1. **No accordions** - Companies are shown as flat list with expandable permissions
2. **Permissions organized by modules** with "All" checkbox
3. **Module-based permission structure**: Sales, Purchase, Finance & Accounting, Inventory
4. **Each module has**: View, Add, Edit, Delete permissions
5. **Visual hierarchy** with proper spacing and borders
6. **Company rows** have delete button (X) on the right
7. **Summary card** shows counts in orange badges

---

## API Endpoints

### Users API
Base URL: `http://localhost:8000/v1/api/users`

#### Endpoints:
1. **GET /v1/api/users** - Get all users (with optional `isActive` filter)
2. **POST /v1/api/users** - Create new user
3. **GET /v1/api/users/:id** - Get user by ID
4. **PUT /v1/api/users/:id** - Update user
5. **DELETE /v1/api/users/:id** - Soft delete user (sets isActive=false)

#### Request/Response Types:

```typescript
// CreateUserRequest
interface CreateUserRequest {
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string;
  fullName: string;
  password: string;
  roleId: number;
  companyIds?: number[];
  permissionIds?: number[];
}

// UpdateUserRequest
interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  password?: string;
  roleId?: number;
  companyIds?: number[];
  permissionIds?: number[];
}

// User (Response)
interface User {
  id?: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  fullName?: string;
  roleId?: number;
  roleName?: string;
  companies?: UserCompanies[];
  permissions?: UserCompanies[];
}

interface UserCompanies {
  id?: number;
  name?: string;
}
```

---

## Frontend Implementation Requirements

### 1. Data Fetching & State Management
- Use API first, localStorage as fallback
- Save API responses to localStorage for offline capability
- Show loading skeletons during fetch
- Display error messages with Snackbar
- Success notifications after CRUD operations

### 2. Filtering & Search
- **Filters**: Company Name, User Role, Status
- **Search**: Debounced (300ms) search by name or email
- **Apply Filter**: Only applies on button click, not automatic
- **Clear Filter**: Resets all filters and search
- **Save Filter**: (Future feature - just show button)

### 3. Pagination
- Default: 10 rows per page
- Options: 5, 10, 25, 50
- Reset to page 1 when filters change
- Material-UI TablePagination component

### 4. Sorting
- Click column headers to sort
- Visual indicator (up/down arrow) for sort direction
- Default sort: Most recent first

### 5. Form Validation
**Required fields:**
- First Name
- Last Name
- Email (with email validation)
- Password (only on create, optional on update)
- At least one company access

**Optional fields:**
- CNIC
- Contact Number
- About User
- User Image

### 6. Image Upload
- Accept: PNG, JPG, GIF, SVG
- Max size: 2MB
- Optimize to 200x200px, 80% quality
- Circular preview
- Edit/Delete buttons on hover

### 7. Company Access Management
- Multiple companies can be assigned
- Each company has:
  - Role (Admin, Manager, Accountant, User)
  - Permissions (module-based: Sales, Purchase, Finance, Inventory)
  - Each permission has: View, Add, Edit, Delete
- "All" checkbox to select/deselect all permissions
- Visual grouping by modules
- Delete button to remove company access

### 8. Error Handling
- API errors → Show Snackbar with error message
- Validation errors → Show inline field errors
- Network errors → Fallback to localStorage
- 401 Unauthorized → Redirect to login

---

## File Structure

### Pages
```
src/pages/
├── UsersPage.tsx           # List page with filters, search, pagination
├── AddUserPage.tsx         # Create new user form
└── UpdateUserPage.tsx      # Edit existing user form
```

### Types
```
src/types/common.types.ts

export interface UserRole {
  id: number;
  name: string;
}

export interface UserCompanyAccess {
  companyId: number;
  companyName: string;
  roleId: number;
  roleName: string;
  permissions: string[];
}

export interface User extends BaseEntity {
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  cnic?: string;
  phone?: string;
  about?: string;
  imageUrl?: string;
  status: 'Active' | 'Inactive';
  roleId?: number;
  roleName?: string;
  companyAccess: UserCompanyAccess[];
}

export type UserFormData = Omit<User, 'id' | 'createdAt' | 'updatedAt'>;
```

### API Client
```
src/generated/api/client.ts

export const getUsersApi = () => new UsersApi(getApiConfig(), undefined, fetchWithAuth as any);
```

---

## Backend Configuration

### Express App (src/app.ts)
```typescript
// Body parser with large limits for base64 images
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
```

### Authentication
- All Users API endpoints require Bearer token
- Token is added via custom `fetchWithAuth` wrapper
- Header format: `Authorization: Bearer <token>`

---

## Known Issues & Fixes Applied

### 1. ✅ Authentication Headers Not Sent
**Problem**: Auto-generated API code didn't add Authorization header
**Solution**: Created `fetchWithAuth` wrapper in client.ts that reads token from localStorage and adds to every request

### 2. ✅ Payload Too Large Error
**Problem**: Base64 images exceeded default Express body size limit
**Solution**: Increased limits to 50mb in backend app.ts

### 3. ✅ TypeScript Type Errors
**Problem**: User interface missing contact fields
**Solution**: Added optional fields to User interface in common.types.ts

### 4. ❌ Filter Design Not Matching Screenshots (CURRENT ISSUE)
**Problem**: Filters are inline without card, missing proper layout
**Solution**: Need to implement card-based filter with button toggle

### 5. ❌ Add/Edit User Design Different (CURRENT ISSUE)
**Problem**: Using accordions instead of flat list, wrong permission structure
**Solution**: Redesign Company Access section to match screenshot

---

## Testing Checklist

### Manual Testing Steps:
1. ✅ Login with test credentials
2. ✅ Navigate to Users page
3. ⚠️ Verify filter design matches screenshot (FAILS - needs fix)
4. ✅ Test search functionality (debounced)
5. ⚠️ Test filter application (needs "Apply Filter" button)
6. ✅ Test pagination (change rows per page, navigate pages)
7. ⚠️ Test sorting (needs implementation)
8. ✅ Click "Add User" button
9. ⚠️ Verify Add User form matches screenshot (FAILS - needs fix)
10. ✅ Fill in required fields
11. ✅ Upload user image
12. ✅ Add multiple companies with permissions
13. ✅ Test "All" permission checkbox
14. ✅ Submit form (test API integration)
15. ✅ Verify success notification
16. ✅ Return to list page
17. ✅ Click Edit on a user
18. ✅ Verify form is pre-populated
19. ✅ Make changes and save
20. ✅ Test delete functionality (with confirmation)
21. ✅ Verify API calls in Network tab
22. ✅ Test error scenarios (missing required fields, invalid email, etc.)

### API Integration Tests:
- ✅ GET /users - Returns list of users
- ✅ POST /users - Creates new user
- ✅ PUT /users/:id - Updates existing user
- ✅ DELETE /users/:id - Soft deletes user
- ✅ Authorization headers sent correctly
- ✅ Error responses handled gracefully

---

## Priority Fixes Needed

### 🔴 HIGH PRIORITY
1. **Fix Filter Design**
   - Add Card wrapper with orange border
   - Position at top-left with Filter button
   - Implement proper label/dropdown layout
   - Add Save/Clear/Apply Filter buttons at bottom

2. **Fix Add/Edit User Page Design**
   - Remove accordions for company access
   - Implement flat list with module-based permissions
   - Add "All" checkbox for each company
   - Organize permissions by modules (Sales, Purchase, Finance, Inventory)
   - Add proper visual hierarchy

3. **Implement Sorting**
   - Add sort functionality to table columns
   - Show visual indicators for sort direction
   - Remember sort state

### 🟡 MEDIUM PRIORITY
4. **Improve Pagination**
   - Show "Showing X-Y of Z results" text
   - Add first/last page buttons

5. **Add Loading States**
   - Skeleton loaders for table
   - Spinner for buttons during API calls

### 🟢 LOW PRIORITY
6. **Save Filter Functionality**
   - Implement saving filter presets
   - Store in localStorage or backend

7. **Advanced Permissions UI**
   - Visual permission matrix
   - Role-based permission templates

---

## Code Standards & Best Practices

### React Best Practices:
- Use functional components with hooks
- Memoize expensive computations with `useMemo`
- Memoize callbacks with `useCallback`
- Use TypeScript for type safety
- Implement proper error boundaries

### Performance Optimizations:
- Lazy load page components
- Debounce search input (300ms)
- Virtualize long lists if needed
- Optimize images before upload
- Code splitting by route

### Code Quality:
- Follow existing patterns from Companies module
- Consistent naming conventions
- Proper error handling
- Loading states for all async operations
- User-friendly error messages

### Material-UI Usage:
- Use MUI components consistently
- Follow design system colors:
  - Primary: `#FF6B35` (orange)
  - Success: `#4CAF50` (green)
  - Error: `#EF5350` (red)
- Consistent spacing (multiples of 8px)
- Responsive design (Grid system)

---

## References

### Design Screenshots Location:
- Filter design: `filter-companies.png`, `filter-users.png`
- Add User page: `add-user-full.png`
- Users list: `users-list.png`

### Related Files:
- `/Users/dev/projects/obiwan/erp_ui/src/pages/CompaniesPage.tsx` (reference implementation)
- `/Users/dev/projects/obiwan/erp_ui/src/pages/AddCompanyPage.tsx` (reference implementation)
- `/Users/dev/projects/obiwan/erp_ui/src/generated/api/client.ts` (API client)
- `/Users/dev/projects/obiwan/erp_system/src/app.ts` (backend config)

### Documentation:
- Material-UI: https://mui.com/material-ui/
- React Router: https://reactrouter.com/
- TypeScript: https://www.typescriptlang.org/

---

## Notes from Conversation

1. User emphasized: "filters are not according to design for both companies and users"
2. User pointed out: "design for editing and adding user is very different"
3. User requested: "pagination searching and filtering, sorting nothing is according to senior full stack engineer work"
4. User wants: "md file with instructions I am giving and the context of this chat so that you don't forget"

## Next Steps

1. Fix filter design to exactly match screenshots
2. Redesign Add/Edit User forms to match screenshot
3. Implement sorting functionality
4. Add comprehensive tests
5. Refactor code for better maintainability
6. Document all components with JSDoc comments

---

**Last Updated**: 2026-01-19
**Status**: In Progress - Filter and form redesign needed
