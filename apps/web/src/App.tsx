import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AppShell from './components/AppShell';
import TodayWorkspace from './pages/TodayWorkspace';
import Composer from './pages/Composer';
import OutputWorkbench from './pages/OutputWorkbench';
import ClassContext from './pages/ClassContext';
import DeliveryHub from './pages/DeliveryHub';

export default function App(): React.ReactElement {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<TodayWorkspace />} />
        <Route path="/composer" element={<Composer />} />
        <Route path="/workbench" element={<OutputWorkbench />} />
        <Route path="/workbench/:requestId" element={<OutputWorkbench />} />
        <Route path="/classes" element={<ClassContext />} />
        <Route path="/delivery" element={<DeliveryHub />} />
      </Route>
    </Routes>
  );
}
