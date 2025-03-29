import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import Login from '@/app/login'; // Adjust path

test('renders login screen correctly', () => {
  const { getByPlaceholderText, getByText } = render(<Login />);

  const emailInput = getByPlaceholderText('Enter email');
  const passwordInput = getByPlaceholderText('Enter password');
  const loginButton = getByText('Login');

  expect(emailInput).toBeTruthy();
  expect(passwordInput).toBeTruthy();
  expect(loginButton).toBeTruthy();
});

test('allows user to type and submit', () => {
  const { getByPlaceholderText, getByText } = render(<Login />);
  const emailInput = getByPlaceholderText('Enter email');
  const passwordInput = getByPlaceholderText('Enter password');
  const loginButton = getByText('Login');

  fireEvent.changeText(emailInput, 'test@example.com');
  fireEvent.changeText(passwordInput, 'password123');
  fireEvent.press(loginButton);

  expect(emailInput.props.value).toBe('test@example.com');
});
