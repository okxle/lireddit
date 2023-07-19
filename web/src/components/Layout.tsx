import React from "react";
import Navbar from "./Navbar";
import Wrapper, { WrapperVariant } from "./Wrapper";

type Props = {
  children: React.ReactNode;
  variant?: WrapperVariant;
};

const Layout = ({ children, variant }: Props) => {
  return (
    <>
      <Navbar />
      <Wrapper>{children}</Wrapper>
    </>
  );
};

export default Layout;
