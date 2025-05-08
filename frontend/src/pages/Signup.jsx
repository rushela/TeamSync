import React, { useState } from "react";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  VStack,
  Heading,
  Text,
  useToast,
  useColorModeValue,
  Image,
  Icon,
  InputGroup,
  InputLeftElement,
  Container
} from "@chakra-ui/react";
import { FiUser, FiMail, FiKey, FiPhone, FiCalendar, FiUsers, FiBriefcase } from 'react-icons/fi';
import { useNavigate } from "react-router-dom";
import axios from "axios";
import teamImage from "../assets/team.jpg";

const Signup = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    companyID: "TS", // Set initial value to "TS"
    dob: "",
    email: "",
    gender: "",
    role: "",
    password: "",
    confirmPassword: "",
    contactNumber: "",
  });
  const toast = useToast();
  const navigate = useNavigate();

  const cardBg = useColorModeValue("white", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const textColor = useColorModeValue("gray.700", "white");
  const headingColor = useColorModeValue("blue.600", "blue.300");
  const inputBg = useColorModeValue("gray.50", "gray.600");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if passwords match
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        status: "error",
        duration: 3000,
      });
      return;
    }

    // Validate password complexity:
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    if (!passwordRegex.test(formData.password)) {
      toast({
        title: "Weak Password",
        description:
          "Password must include an uppercase letter, a lowercase letter, a number, a special character, and be at least 8 characters long.",
        status: "error",
        duration: 3000,
      });
      return;
    }

    // Validate Company ID (must start with "TS" and then 5 digits)
    const companyIDRegex = /^TS\d{5}$/;
    if (!companyIDRegex.test(formData.companyID)) {
      toast({
        title: "Invalid Company ID",
        description: "Company ID must be in the format TS12345",
        status: "error",
        duration: 3000,
      });
      return;
    }

    try {
      const { confirmPassword: _CONFIRM_PASSWORD, ...userData } = formData;

      await axios.post("http://localhost:5000/api/auth/signup", userData);

      toast({
        title: "Signup Successful",
        description: "You have successfully signed up",
        status: "success",
        duration: 3000,
      });
      navigate("/login");
    } catch (error) {
      toast({
        title: "Signup Failed",
        description: error.response?.data?.msg || "An error occurred during signup",
        status: "error",
        duration: 3000,
      });
    }
  };

  const handleCompanyIDChange = (e) => {
    let newValue = e.target.value.toUpperCase(); // Enforce "TS" prefix as uppercase

    // Ensure it starts with 'TS' and only accepts numbers after 'TS'
    if (newValue.startsWith('TS') && /^\d*$/.test(newValue.slice(2))) {
      setFormData({ ...formData, companyID: newValue });
    } else if (newValue.startsWith('TS')) {
      setFormData({ ...formData, companyID: newValue.slice(0, 7) });
    } else {
      setFormData({ ...formData, companyID: 'TS' + newValue.slice(2) });
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
      <Container maxW="container.sm" position="relative" zIndex="1" py={10}>
        <Box 
          maxW="500px" 
          mx="auto" 
          p={8} 
          borderRadius="xl" 
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
            mb={8} 
            bgGradient="linear(to-r, blue.400, blue.600)"
            bgClip="text"
            fontWeight="extrabold"
            fontSize="2xl"
          >
            Create Your Account
          </Heading>
          <VStack spacing={5} as="form" onSubmit={handleSubmit}>
            <FormControl isRequired>
              <FormLabel color={textColor}>Full Name</FormLabel>
              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <Icon as={FiUser} color="gray.400" />
                </InputLeftElement>
                <Input
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  bg={inputBg}
                  _hover={{ borderColor: "blue.400" }}
                  _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px var(--chakra-colors-blue-500)" }}
                />
              </InputGroup>
            </FormControl>

            <FormControl isRequired>
              <FormLabel color={textColor}>Company ID</FormLabel>
              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <Icon as={FiBriefcase} color="gray.400" />
                </InputLeftElement>
                <Input
                  name="companyID"
                  value={formData.companyID}
                  onChange={handleCompanyIDChange}
                  placeholder="TS12345"
                  maxLength="7"
                  bg={inputBg}
                  _hover={{ borderColor: "blue.400" }}
                  _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px var(--chakra-colors-blue-500)" }}
                />
              </InputGroup>
              <Text fontSize="xs" color="gray.500" mt={1}>
                Company ID must be in the format TS12345
              </Text>
            </FormControl>

            <FormControl isRequired>
              <FormLabel color={textColor}>Date of Birth</FormLabel>
              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <Icon as={FiCalendar} color="gray.400" />
                </InputLeftElement>
                <Input
                  type="date"
                  name="dob"
                  value={formData.dob}
                  onChange={handleChange}
                  bg={inputBg}
                  _hover={{ borderColor: "blue.400" }}
                  _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px var(--chakra-colors-blue-500)" }}
                />
              </InputGroup>
            </FormControl>

            <FormControl isRequired>
              <FormLabel color={textColor}>Email</FormLabel>
              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <Icon as={FiMail} color="gray.400" />
                </InputLeftElement>
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  bg={inputBg}
                  _hover={{ borderColor: "blue.400" }}
                  _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px var(--chakra-colors-blue-500)" }}
                />
              </InputGroup>
            </FormControl>

            <FormControl isRequired>
              <FormLabel color={textColor}>Gender</FormLabel>
              <Select 
                name="gender" 
                value={formData.gender} 
                onChange={handleChange}
                bg={inputBg}
                _hover={{ borderColor: "blue.400" }}
                _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px var(--chakra-colors-blue-500)" }}
              >
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </Select>
            </FormControl>

            <FormControl isRequired>
              <FormLabel color={textColor}>Role</FormLabel>
              <Select 
                name="role" 
                value={formData.role} 
                onChange={handleChange}
                bg={inputBg}
                _hover={{ borderColor: "blue.400" }}
                _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px var(--chakra-colors-blue-500)" }}
              >
                <option value="">Select role</option>
                <option value="Employee">Employee</option>
                <option value="BusinessOwner">Business owner</option>
                <option value="TeamLeads">Team Leads</option>
                <option value="HR">HR</option>
                <option value="Admin">Admin</option>
                <option value="ITSupport">IT support</option>
                <option value="Manager">Manager</option>
              </Select>
            </FormControl>

            <FormControl isRequired>
              <FormLabel color={textColor}>Password</FormLabel>
              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <Icon as={FiKey} color="gray.400" />
                </InputLeftElement>
                <Input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter password"
                  bg={inputBg}
                  _hover={{ borderColor: "blue.400" }}
                  _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px var(--chakra-colors-blue-500)" }}
                />
              </InputGroup>
              <Text fontSize="xs" color="gray.500" mt={1}>
                Must include an uppercase letter, lowercase letter, number, special character, and be at least 8 characters long.
              </Text>
            </FormControl>

            <FormControl isRequired>
              <FormLabel color={textColor}>Confirm Password</FormLabel>
              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <Icon as={FiKey} color="gray.400" />
                </InputLeftElement>
                <Input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm password"
                  bg={inputBg}
                  _hover={{ borderColor: "blue.400" }}
                  _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px var(--chakra-colors-blue-500)" }}
                />
              </InputGroup>
            </FormControl>

            <FormControl isRequired>
              <FormLabel color={textColor}>Contact Number</FormLabel>
              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <Icon as={FiPhone} color="gray.400" />
                </InputLeftElement>
                <Input
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleChange}
                  placeholder="Enter contact number"
                  bg={inputBg}
                  _hover={{ borderColor: "blue.400" }}
                  _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px var(--chakra-colors-blue-500)" }}
                />
              </InputGroup>
            </FormControl>

            <Button 
              colorScheme="blue" 
              type="submit" 
              width="full"
              size="lg"
              _hover={{ transform: "translateY(-1px)", boxShadow: "lg" }}
              transition="all 0.2s"
            >
              Sign Up
            </Button>

            <Text mt={4} textAlign="center" color={textColor}>
              Already have an account?{" "}
              <Text
                as="span"
                color="blue.500"
                fontWeight="bold"
                cursor="pointer"
                onClick={() => navigate("/login")}
                _hover={{ textDecoration: "underline" }}
              >
                Login
              </Text>
            </Text>
          </VStack>
        </Box>
      </Container>
    </Box>
  );
};

export default Signup;
