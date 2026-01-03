import { createBrowserRouter, Navigate } from 'react-router-dom';
import LoginPage from '../pages/auth/LoginPage';
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage';
import ResetPasswordPage from '../pages/auth/ResetPasswordPage';
import ProtectedRoute from './ProtectedRoute';
import EmployeeDashboard from '../pages/employee/EmployeeDashboard';
import EmployeeProfilePage from '../pages/employee/EmployeeProfilePage';
import EmployeeDocumentsPage from '../pages/employee/EmployeeDocumentsPage';
import EmployeeVacationsPage from '../pages/employee/EmployeeVacationsPage';
import EmployeeLicensesPage from '../pages/employee/EmployeeLicensesPage';
import AdminEmployeesPage from '../pages/admin/AdminEmployeesPage';
import AdminVacationsPage from '../pages/admin/AdminVacationsPage';
import AdminAuditPage from '../pages/admin/AdminAuditPage';
import AdminDashboardPage from '../pages/admin/AdminDashboardPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/login" replace />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/forgot-password',
    element: <ForgotPasswordPage />,
  },
  {
    path: '/reset-password',
    element: <ResetPasswordPage />,
  },
  {
    element: <ProtectedRoute roles={['EMPLEADO']} />,
    children: [
      { path: '/portal', element: <EmployeeDashboard /> },
      { path: '/portal/mis-datos', element: <EmployeeProfilePage /> },
      { path: '/portal/documentos', element: <EmployeeDocumentsPage /> },
      { path: '/portal/vacaciones', element: <EmployeeVacationsPage /> },
      { path: '/portal/licencias', element: <EmployeeLicensesPage /> },
    ],
  },
  {
    element: <ProtectedRoute roles={['ADMIN_DIRECCION', 'ADMIN_RRHH']} />,
    children: [
      { path: '/admin/dashboard', element: <AdminDashboardPage /> },
      { path: '/admin/empleados', element: <AdminEmployeesPage /> },
      { path: '/admin/solicitudes', element: <AdminVacationsPage /> },
      { path: '/admin/auditoria', element: <AdminAuditPage /> },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/login" replace />,
  },
]);
