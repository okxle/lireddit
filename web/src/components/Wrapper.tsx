import { Box } from "@chakra-ui/react";
import React from "react";

type Props = {
  children: React.ReactNode;
  variant?: "small" | "regular";
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
