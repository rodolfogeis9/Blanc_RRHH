// src/App.tsx
import { Routes, Route, Navigate } from "react-router-dom";
import { Box } from "@chakra-ui/react";

import LoginPage from "./pages/auth/LoginPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";

import EmployeeProfilePage from "./pages/employee/EmployeeProfilePage";
import EmployeeVacationsPage from "./pages/employee/EmployeeVacationsPage";

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

        {/* Empleado (cuando ya estés logueado) */}
        <Route path="/mi-perfil" element={<EmployeeProfilePage />} />
        <Route path="/mis-vacaciones" element={<EmployeeVacationsPage />} />

        {/* 404 simple */}
        <Route path="*" element={<Box p={10}>Página no encontrada</Box>} />
      </Routes>
    </Box>
  );
}

export default App;
