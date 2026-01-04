// src/App.tsx
import { Routes, Route, Navigate } from "react-router-dom";
import { Box } from "@chakra-ui/react";

import LoginPage from "./pages/auth/LoginPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";
import ProtectedRoute from "./routes/ProtectedRoute";

import EmployeeDashboard from "./pages/employee/EmployeeDashboard";
import EmployeeProfilePage from "./pages/employee/EmployeeProfilePage";
import EmployeeDocumentsPage from "./pages/employee/EmployeeDocumentsPage";
import EmployeeVacationsPage from "./pages/employee/EmployeeVacationsPage";
import EmployeeLicensesPage from "./pages/employee/EmployeeLicensesPage";
import EmployeeEducationPage from "./pages/employee/EmployeeEducationPage";
import EmployeeWorkHistoryPage from "./pages/employee/EmployeeWorkHistoryPage";
import EmployeeRemunerationsPage from "./pages/employee/EmployeeRemunerationsPage";
import EmployeeExtraHoursPage from "./pages/employee/EmployeeExtraHoursPage";

import AdminEmployeesPage from "./pages/admin/AdminEmployeesPage";
import AdminVacationsPage from "./pages/admin/AdminVacationsPage";
import AdminAuditPage from "./pages/admin/AdminAuditPage";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";

function App() {
  return (
    <Box minH="100vh">
      <Routes>
        {/* Redirige raíz a /login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Auth */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* Portal empleado */}
        <Route element={<ProtectedRoute roles={['EMPLEADO']} />}>
          <Route path="/portal" element={<EmployeeDashboard />} />
          <Route path="/portal/mis-datos" element={<EmployeeProfilePage />} />
          <Route path="/portal/educacion" element={<EmployeeEducationPage />} />
          <Route path="/portal/antecedentes-laborales" element={<EmployeeWorkHistoryPage />} />
          <Route path="/portal/documentos" element={<EmployeeDocumentsPage />} />
          <Route path="/portal/vacaciones" element={<EmployeeVacationsPage />} />
          <Route path="/portal/licencias" element={<EmployeeLicensesPage />} />
          <Route path="/portal/remuneraciones" element={<EmployeeRemunerationsPage />} />
          <Route path="/portal/horas-extras" element={<EmployeeExtraHoursPage />} />
        </Route>

        {/* Portal administración */}
        <Route element={<ProtectedRoute roles={['ADMIN_RRHH', 'ADMIN_DIRECCION']} />}>
          <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
          <Route path="/admin/empleados" element={<AdminEmployeesPage />} />
          <Route path="/admin/solicitudes" element={<AdminVacationsPage />} />
          <Route path="/admin/auditoria" element={<AdminAuditPage />} />
        </Route>

        {/* 404 simple */}
        <Route path="*" element={<Box p={10}>Página no encontrada</Box>} />
      </Routes>
    </Box>
  );
}

export default App;
