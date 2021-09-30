/**
 * @jest-environment jsdom
 */

 import React from 'react'
 import { render, screen } from '@testing-library/react'

const mockUserCredentialMock = {
  user: {
    sendEmailVerification: jest.fn(),
  },
};

jest.mock('firebase/app', () => {
  return {
    auth: jest.fn().mockReturnThis(),
    createUserWithEmailAndPassword: jest.fn(() => mockUserCredentialMock),
    apps: [],
    initializeApp: jest.fn(),
    database: jest.fn(),
  };
});
jest.mock("react-ga", () => {
    return {
        set: jest.fn()
    }
})
import Home from '../src/pages/index'

 
 describe('Home', () => {
    afterAll(() => {
        jest.resetAllMocks();
      });
   it('renders a empty rentals', () => {
     render(<Home />)
 
     const message = screen.getByTestId("empty-message")
 
     expect(message).toBeInTheDocument()
     expect(message).toHaveTextContent(/you can't rent anything yet/i)
   })
 })