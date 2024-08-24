import React from "react";
import { render, screen } from "@testing-library/react";
import Greeting from "./Greeting";

test("renders the correct greeting message", () => {
  render(<Greeting name="John" />);

  // 'Hello, John!'라는 텍스트가 화면에 있는지 확인합니다.
  const greetingElement = screen.getByText(/Hello, John!/i);
  expect(greetingElement).toBeInTheDocument();
});
