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
  useColorModeValue,
  Container,
  Icon,
  InputGroup,
  InputLeftElement
} from "@chakra-ui/react";
import { FiMail, FiKey, FiShield } from 'react-icons/fi';
import { useNavigate } from "react-router-dom";
import axios from "axios";
import teamImage from "../assets/team.jpg";

const ForgotPassword = () => {
  const [identifier, setIdentifier] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [step, setStep] = useState(1); // 1: enter identifier, 2: enter OTP & new password
  const toast = useToast();
  const navigate = useNavigate();

  const cardBg = useColorModeValue("white", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const textColor = useColorModeValue("gray.700", "white");
  const inputBg = useColorModeValue("gray.50", "gray.600");

  const handleSendOtp = async () => {
    try {
      // Send identifier as both email and companyID
      await axios.post("http://localhost:5000/api/auth/forgot-password", {
        email: identifier,
        companyID: identifier,
      });
      toast({
        title: "OTP Sent",
        description: "Check your email for the OTP",
        status: "success",
        duration: 3000,
      });
      setStep(2);
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.msg || "Failed to send OTP",
        status: "error",
        duration: 3000,
      });
    }
  };

  const handleResetPassword = async () => {
    try {
      // Call verify-otp endpoint with email, otp, and newPassword
      await axios.post("http://localhost:5000/api/auth/verify-otp", {
        email: identifier,
        otp,
        newPassword,
      });
      toast({
        title: "Password Reset",
        description: "Your password has been reset",
        status: "success",
        duration: 3000,
      });
      navigate("/login");
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.msg || "Failed to reset password",
        status: "error",
        duration: 3000,
      });
    }
  };

  return (
    <Box
      minH="100vh"
      position="relative"
      overflow="hidden"
      bgImage={`url(${teamImage})`}
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

      {/* Content Container */}
      <Container 
        maxW="container.md" 
        position="relative" 
        zIndex="1" 
        h="100vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Box 
          maxW="600px" 
          w="full"
          p={10} 
          borderRadius="2xl" 
          boxShadow="2xl" 
          border="1px"
          borderColor={borderColor}
          bg={cardBg}
          _hover={{
            boxShadow: "3xl",
            transform: "translateY(-2px)",
            transition: "all 0.2s ease-in-out"
          }}
        >
          <Heading 
            textAlign="center" 
            mb={10} 
            bgGradient="linear(to-r, blue.400, blue.600)"
            bgClip="text"
            fontWeight="extrabold"
            fontSize="3xl"
          >
            Forgot Password
          </Heading>
          <VStack spacing={6}>
            {step === 1 && (
              <>
                <FormControl isRequired>
                  <FormLabel color={textColor} fontSize="lg">Email or Company ID</FormLabel>
                  <InputGroup size="lg">
                    <InputLeftElement pointerEvents="none">
                      <Icon as={FiMail} color="gray.400" boxSize="5" />
                    </InputLeftElement>
                    <Input
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="Enter your email or company ID"
                      bg={inputBg}
                      _hover={{ borderColor: "blue.400" }}
                      _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px var(--chakra-colors-blue-500)" }}
                      fontSize="md"
                    />
                  </InputGroup>
                </FormControl>
                <Button 
                  colorScheme="blue" 
                  onClick={handleSendOtp} 
                  width="full"
                  size="lg"
                  height="50px"
                  fontSize="lg"
                  _hover={{ transform: "translateY(-1px)", boxShadow: "lg" }}
                  transition="all 0.2s"
                >
                  Send OTP
                </Button>
              </>
            )}
            {step === 2 && (
              <>
                <FormControl isRequired>
                  <FormLabel color={textColor} fontSize="lg" textAlign="center">OTP</FormLabel>
                  <InputGroup maxW="300px" mx="auto" size="lg">
                    <InputLeftElement pointerEvents="none">
                      <Icon as={FiShield} color="gray.400" boxSize="5" />
                    </InputLeftElement>
                    <Input
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="Enter OTP"
                      bg={inputBg}
                      _hover={{ borderColor: "blue.400" }}
                      _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px var(--chakra-colors-blue-500)" }}
                      textAlign="center"
                      letterSpacing="0.2em"
                      fontSize="xl"
                      fontWeight="medium"
                    />
                  </InputGroup>
                </FormControl>
                <FormControl isRequired>
                  <FormLabel color={textColor} fontSize="lg">New Password</FormLabel>
                  <InputGroup size="lg">
                    <InputLeftElement pointerEvents="none">
                      <Icon as={FiKey} color="gray.400" boxSize="5" />
                    </InputLeftElement>
                    <Input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      bg={inputBg}
                      _hover={{ borderColor: "blue.400" }}
                      _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px var(--chakra-colors-blue-500)" }}
                      fontSize="md"
                    />
                  </InputGroup>
                </FormControl>
                <Button 
                  colorScheme="green" 
                  onClick={handleResetPassword} 
                  width="full"
                  size="lg"
                  height="50px"
                  fontSize="lg"
                  _hover={{ transform: "translateY(-1px)", boxShadow: "lg" }}
                  transition="all 0.2s"
                >
                  Reset Password
                </Button>
              </>
            )}
            <Text fontSize="md" color={textColor} mt={6} textAlign="center">
              Remembered your password?{" "}
              <Button 
                variant="link" 
                colorScheme="blue" 
                onClick={() => navigate("/login")}
                fontSize="md"
                _hover={{ textDecoration: "underline" }}
              >
                Login
              </Button>
            </Text>
          </VStack>
        </Box>
      </Container>
    </Box>
  );
};

export default ForgotPassword;
