import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from '../App';

function renderWithRouter(initialRoute = '/') {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <App />
    </MemoryRouter>,
  );
}

describe('App', () => {
  it('renders the app shell with navigation', () => {
    renderWithRouter();
    expect(screen.getByText('TeachAssist AI')).toBeInTheDocument();
  });

  it('renders Today Workspace at /', () => {
    renderWithRouter('/');
    expect(screen.getByText('Today Workspace')).toBeInTheDocument();
  });

  it('renders Composer at /composer', () => {
    renderWithRouter('/composer');
    expect(screen.getByText('Universal Composer')).toBeInTheDocument();
  });

  it('renders Output Workbench at /workbench', () => {
    renderWithRouter('/workbench');
    expect(screen.getByText('Output Workbench')).toBeInTheDocument();
  });

  it('renders Class Context at /classes', () => {
    renderWithRouter('/classes');
    expect(screen.getByText('Class Context')).toBeInTheDocument();
  });

  it('renders Delivery Hub at /delivery', () => {
    renderWithRouter('/delivery');
    expect(screen.getByText('Delivery Hub')).toBeInTheDocument();
  });

  it('shows sidebar navigation links', () => {
    renderWithRouter();
    expect(screen.getByText('Today')).toBeInTheDocument();
    expect(screen.getByText('Composer')).toBeInTheDocument();
    expect(screen.getByText('Workbench')).toBeInTheDocument();
    expect(screen.getByText('Classes')).toBeInTheDocument();
    expect(screen.getByText('Delivery')).toBeInTheDocument();
  });

  it('renders parameterized workbench route', () => {
    renderWithRouter('/workbench/some-request-id');
    expect(screen.getByText('Output Workbench')).toBeInTheDocument();
  });
});

describe('Composer', () => {
  it('renders textarea and submit button', () => {
    renderWithRouter('/composer');
    expect(screen.getByLabelText('What do you need?')).toBeInTheDocument();
    expect(screen.getByText('Generate Package')).toBeInTheDocument();
  });

  it('disables submit button when prompt is empty', () => {
    renderWithRouter('/composer');
    const button = screen.getByText('Generate Package');
    expect(button).toBeDisabled();
  });

  it('enables submit button when prompt has content', () => {
    renderWithRouter('/composer');
    const textarea = screen.getByLabelText('What do you need?');
    fireEvent.change(textarea, { target: { value: 'Create a lesson plan' } });
    const button = screen.getByText('Generate Package');
    expect(button).not.toBeDisabled();
  });

  it('shows error on failed API call', async () => {
    // Mock fetch to simulate failure
    const originalFetch = global.fetch;
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: 'Server error' }),
    });

    renderWithRouter('/composer');
    const textarea = screen.getByLabelText('What do you need?');
    fireEvent.change(textarea, { target: { value: 'Create a lesson plan' } });
    fireEvent.click(screen.getByText('Generate Package'));

    await waitFor(() => {
      expect(screen.getByText('Server error')).toBeInTheDocument();
    });

    global.fetch = originalFetch;
  });
});

describe('OutputWorkbench', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('shows loading indicator when fetching', () => {
    // Mock fetch to never resolve (keeps loading state)
    global.fetch = vi.fn().mockImplementation(() => new Promise(() => {}));

    renderWithRouter('/workbench/test-request-id');
    expect(screen.getByText('Generating your teaching materials...')).toBeInTheDocument();
  });

  it('shows prompt message when no requestId', () => {
    renderWithRouter('/workbench');
    expect(screen.getByText('Select a request to view generated artifacts.')).toBeInTheDocument();
  });
});
