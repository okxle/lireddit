import { Box } from "@chakra-ui/react";
import React from "react";

export type WrapperVariant = "small" | "regular";

type Props = {
  children: React.ReactNode;
  variant?: WrapperVariant;
};

const Wrapper = ({ children, variant = "regular" }: Props) => {
  return (
    <Box
      maxW={variant === "regular" ? "800px" : "400px"}
      w="100%"
      mt={8}
      mx="auto"
    >
      {children}
    </Box>
  );
};

export default Wrapper;
