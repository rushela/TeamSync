import React, { useState } from "react";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Heading,
  useToast,
  Text,
  Container,
  Flex,
  InputGroup,
  InputRightElement,
  IconButton,
  useColorModeValue,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import axios from "axios";
import bgImage from "../assets/team.jpg";
import SupportChat from "../components/SupportChat";


const Login = () => {
  const [formData, setFormData] = useState({ identifier: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", {
        email: formData.identifier,
        companyID: formData.identifier,
        password: formData.password,
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);
      localStorage.setItem("companyID", res.data.companyID);

      if (res.data.role === "Admin" || res.data.role === "BusinessOwner" || res.data.role === "Manager") {
        navigate("/admindashboard");
      } else {
        navigate("/dashboard");
      }

      toast({ 
        title: "Login Successful", 
        status: "success", 
        duration: 3000,
        position: "top",
        isClosable: true,
      });
    } catch (error) {
      if (error.response && error.response.status === 403) {
        toast({
          title: "Account Locked",
          description: "Your account has been locked. Please contact an administrator.",
          status: "error",
          duration: 3000,
          position: "top",
          isClosable: true,
        });
      } else {
        toast({
          title: "Login Failed",
          description: error.response?.data?.msg || "Invalid credentials",
          status: "error",
          duration: 3000,
          position: "top",
          isClosable: true,
        });
      }
    }
  };

  return (
    <Box
      minH="100vh"
      position="relative"
      overflow="hidden"
      bgImage={`url(${bgImage})`}
      bgSize="cover"
      bgPosition="center"
      bgRepeat="no-repeat"
    >
      {/* Background Elements */}
      <Box
        position="absolute"
        top="-10%"
        left="-10%"
        w="40%"
        h="40%"
        bgGradient="linear(to-br, blue.400, blue.600)"
        borderRadius="full"
        filter="blur(80px)"
        opacity="0.1"
      />
      <Box
        position="absolute"
        bottom="-10%"
        right="-10%"
        w="40%"
        h="40%"
        bgGradient="linear(to-br, purple.400, purple.600)"
        borderRadius="full"
        filter="blur(80px)"
        opacity="0.1"
      />
      <Box
        position="absolute"
        top="30%"
        right="20%"
        w="20%"
        h="20%"
        bgGradient="linear(to-br, teal.400, teal.600)"
        borderRadius="full"
        filter="blur(60px)"
        opacity="0.1"
      />

      {/* Grid Pattern */}
      <Box
        position="absolute"
        top="0"
        left="0"
        right="0"
        bottom="0"
        backgroundImage="linear-gradient(to right, rgba(0,0,0,0.02) 1px, transparent 1px),
                        linear-gradient(to bottom, rgba(0,0,0,0.02) 1px, transparent 1px)"
        backgroundSize="40px 40px"
      />

      <Container maxW="container.xl" h="100vh" position="relative">
        <Flex
          h="full"
          align="center"
          justify="center"
        >
          <Box
            maxW="400px"
            w="full"
            p={8}
            borderRadius="xl"
            boxShadow="2xl"
            bg={bgColor}
            border="1px"
            borderColor={borderColor}
            backdropFilter="blur(10px)"
            _hover={{
              boxShadow: "3xl",
              transform: "translateY(-2px)",
              transition: "all 0.2s ease-in-out"
            }}
          >
            <VStack spacing={6} align="stretch">
              <Box textAlign="center">
                <Heading
                  size="xl"
                  bgGradient="linear(to-r, blue.400, blue.600)"
                  bgClip="text"
                  fontWeight="extrabold"
                >
                  Welcome Back
                </Heading>
                <Text mt={2} color="gray.500">
                  Sign in to continue to your account
                </Text>
              </Box>

              <VStack spacing={4} as="form" onSubmit={handleSubmit}>
                <FormControl isRequired>
                  <FormLabel fontWeight="medium">Email / Company ID</FormLabel>
                  <Input
                    name="identifier"
                    value={formData.identifier}
                    onChange={handleChange}
                    placeholder="Enter your email or company ID"
                    size="lg"
                    borderRadius="md"
                    _focus={{
                      borderColor: "blue.400",
                      boxShadow: "0 0 0 1px var(--chakra-colors-blue-400)",
                    }}
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel fontWeight="medium">Password</FormLabel>
                  <InputGroup size="lg">
                    <Input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter your password"
                      borderRadius="md"
                      _focus={{
                        borderColor: "blue.400",
                        boxShadow: "0 0 0 1px var(--chakra-colors-blue-400)",
                      }}
                    />
                    <InputRightElement>
                      <IconButton
                        variant="ghost"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
                        onClick={() => setShowPassword(!showPassword)}
                      />
                    </InputRightElement>
                  </InputGroup>
                </FormControl>

                <Button
                  type="submit"
                  colorScheme="blue"
                  size="lg"
                  width="full"
                  mt={4}
                  bgGradient="linear(to-r, blue.400, blue.600)"
                  _hover={{
                    bgGradient: "linear(to-r, blue.500, blue.700)",
                  }}
                  _active={{
                    bgGradient: "linear(to-r, blue.600, blue.800)",
                  }}
                >
                  Sign In
                </Button>

                <Flex justify="space-between" width="full" mt={2}>
                  <Button
                    variant="link"
                    colorScheme="blue"
                    onClick={() => navigate("/forgot-password")}
                    fontSize="sm"
                  >
                    Forgot password?
                  </Button>
                  <Button
                    variant="link"
                    colorScheme="blue"
                    onClick={() => navigate("/")}
                    fontSize="sm"
                  >
                    Create account
                  </Button>
                </Flex>
              </VStack>
            </VStack>
          </Box>
        </Flex>
        <SupportChat /> 
      </Container>
    </Box>
    
  );
};

export default Login;