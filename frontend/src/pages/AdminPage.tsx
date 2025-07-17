import React from 'react';
import { AdminDashboard } from '../components/Admin/AdminDashboard';
import { Layout } from '../components/Layout/Layout';

export function AdminPage() {
  return (
    <Layout>
      <AdminDashboard />
    </Layout>
  );
}