import React, { useState, useEffect } from "react";
import {
  Box,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  Select,
  Container,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  FormControl,
  FormLabel,
  Input,
  useColorModeValue,
  Image,
  Icon,
  InputGroup,
  InputLeftElement
} from "@chakra-ui/react";
import { FiSearch, FiUser, FiMail, FiKey, FiPhone } from 'react-icons/fi';
import axios from "axios";
import teamsImage from "../assets/teams.png";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [editedRoles, setEditedRoles] = useState({});
  const [selectedUser, setSelectedUser] = useState(null); // Store the selected user
  const [isModalOpen, setIsModalOpen] = useState(false); // Control modal visibility
  const toast = useToast();

  const cardBg = useColorModeValue("white", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const textColor = useColorModeValue("gray.700", "white");
  const headingColor = useColorModeValue("blue.600", "blue.300");
  const tableHeaderBg = useColorModeValue("gray.50", "gray.600");
  const tableRowHover = useColorModeValue("gray.50", "gray.600");
  const inputBg = useColorModeValue("gray.50", "gray.600");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/admin/users", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setUsers(res.data);
        const rolesMap = {};
        res.data.forEach((user) => {
          rolesMap[user._id] = user.role;
        });
        setEditedRoles(rolesMap);
      } catch (error) {
        toast({
          title: "Error",
          description: error.response?.data?.message || "Failed to fetch users",
          status: "error",
          duration: 3000,
        });
      }
    };
    fetchUsers();
  }, [toast]);

  // Handle role change in dropdown
  const handleRoleChange = async (userId, newRole) => {
    try {
      await axios.put(
        `http://localhost:5000/api/admin/users/${userId}`,
        { role: newRole },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      setEditedRoles((prev) => ({ ...prev, [userId]: newRole }));
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user._id === userId ? { ...user, role: newRole } : user
        )
      );
      toast({
        title: "Success",
        description: "User role updated successfully!",
        status: "success",
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update user role",
        status: "error",
        duration: 3000,
      });
    }
  };

  // Open modal to view/edit user
  const handleViewUser = (user) => {
    setSelectedUser(user); // Set the user data to be viewed/edited
    setIsModalOpen(true); // Open the modal
  };

  // Close modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  // Update user data in the database
  const handleUpdateUser = async () => {
    try {
      const updatedUser = {
        fullName: selectedUser.fullName,
        email: selectedUser.email,
        companyID: selectedUser.companyID,
        dob: selectedUser.dob,
        gender: selectedUser.gender,
        role: selectedUser.role,
        contactNumber: selectedUser.contactNumber,
      };

      await axios.put(
        `http://localhost:5000/api/admin/users/${selectedUser._id}`,
        updatedUser,
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );

      // Update local users state
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user._id === selectedUser._id ? { ...user, ...updatedUser } : user
        )
      );

      toast({
        title: "Success",
        description: "User updated successfully!",
        status: "success",
        duration: 3000,
      });

      handleCloseModal(); // Close modal after update
      window.location.reload(); // Refresh the page to reflect changes
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update user",
        status: "error",
        duration: 3000,
      });
    }
  };

  // Lock (terminate) user account
  const handleTerminateUser = async (userId) => {
    try {
      await axios.put(
        `http://localhost:5000/api/admin/users/${userId}/terminate`,
        {},
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      // Update local state to show button change
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user._id === userId ? { ...user, locked: true } : user
        )
      );
      toast({
        title: "Success",
        description: "User account locked",
        status: "success",
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to lock account",
        status: "error",
        duration: 3000,
      });
    }
  };

  // Unlock user account
  const handleUnlockUser = async (userId) => {
    try {
      await axios.put(
        `http://localhost:5000/api/admin/users/${userId}/unlock`,
        {},
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      // Update local state to show button change
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user._id === userId ? { ...user, locked: false } : user
        )
      );
      toast({
        title: "Success",
        description: "User account unlocked",
        status: "success",
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to unlock account",
        status: "error",
        duration: 3000,
      });
    }
  };

  // Delete user
  const handleDeleteUser = async (userId) => {
    try {
      await axios.delete(`http://localhost:5000/api/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setUsers((prevUsers) => prevUsers.filter((user) => user._id !== userId));
      toast({
        title: "Deleted",
        description: "User removed",
        status: "success",
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete user",
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
    >
      {/* Background Image */}
      <Box
        position="absolute"
        top="0"
        left="0"
        right="0"
        bottom="0"
        zIndex="0"
      >
        <Image
          src={teamsImage}
          alt="User Management Background"
          objectFit="cover"
          width="100%"
          height="100%"
        />
        <Box
          position="absolute"
          top="0"
          left="0"
          right="0"
          bottom="0"
          bg={useColorModeValue("rgba(255, 255, 255, 0.7)", "rgba(17, 24, 39, 0.7)")}
        />
      </Box>

      {/* Content Container */}
      <Container maxW="container.lg" mt={10} position="relative" zIndex="1">
        <Box 
          p={6} 
          borderRadius="xl" 
          boxShadow="lg" 
          bg={cardBg}
          border="1px"
          borderColor={borderColor}
        >
          <Heading textAlign="center" mb={6} color={headingColor}>
            Admin Dashboard - User Management
          </Heading>
          <Table variant="simple">
            <Thead bg={tableHeaderBg}>
              <Tr>
                <Th color={textColor}>Name</Th>
                <Th color={textColor}>Email</Th>
                <Th color={textColor}>Role</Th>
                <Th color={textColor}>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {users.map((user) => (
                <Tr 
                  key={user._id}
                  _hover={{ bg: tableRowHover }}
                  transition="all 0.2s"
                >
                  <Td color={textColor}>{user.fullName}</Td>
                  <Td color={textColor}>{user.email}</Td>
                  <Td>
                    <Select
                      value={editedRoles[user._id] || user.role}
                      onChange={(e) => handleRoleChange(user._id, e.target.value)}
                      bg={inputBg}
                      _hover={{ borderColor: "blue.400" }}
                      _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px var(--chakra-colors-blue-500)" }}
                    >
                      <option value="Employee">Employee</option>
                      <option value="BusinessOwner">Business owner</option>
                      <option value="TeamLeads">Team Leads</option>
                      <option value="HR">HR</option>
                      <option value="Admin">Admin</option>
                      <option value="ITSupport">IT support</option>
                      <option value="Manager">Manager</option>
                    </Select>
                  </Td>
                  <Td>
                    <Button
                      colorScheme={user.locked ? "green" : "red"}
                      size="sm"
                      mr="2"
                      onClick={() =>
                        user.locked ? handleUnlockUser(user._id) : handleTerminateUser(user._id)
                      }
                      _hover={{ transform: "translateY(-1px)", boxShadow: "md" }}
                      transition="all 0.2s"
                    >
                      {user.locked ? "Unlock" : "Terminate"}
                    </Button>
                    <Button 
                      colorScheme="blue" 
                      size="sm" 
                      mr="2" 
                      onClick={() => handleViewUser(user)}
                      _hover={{ transform: "translateY(-1px)", boxShadow: "md" }}
                      transition="all 0.2s"
                    >
                      View
                    </Button>
                    <Button 
                      colorScheme="red" 
                      size="sm" 
                      onClick={() => handleDeleteUser(user._id)}
                      _hover={{ transform: "translateY(-1px)", boxShadow: "md" }}
                      transition="all 0.2s"
                    >
                      Delete
                    </Button>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>

        {/* Modal for viewing/editing user */}
        {selectedUser && (
          <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
            <ModalOverlay />
            <ModalContent bg={cardBg}>
              <ModalHeader color={headingColor}>Edit User</ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                <FormControl isRequired>
                  <FormLabel color={textColor}>Full Name</FormLabel>
                  <InputGroup>
                    <InputLeftElement pointerEvents="none">
                      <Icon as={FiUser} color="gray.400" />
                    </InputLeftElement>
                    <Input
                      value={selectedUser.fullName}
                      onChange={(e) =>
                        setSelectedUser({ ...selectedUser, fullName: e.target.value })
                      }
                      bg={inputBg}
                      _hover={{ borderColor: "blue.400" }}
                      _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px var(--chakra-colors-blue-500)" }}
                    />
                  </InputGroup>
                </FormControl>
                <FormControl isRequired mt={4}>
                  <FormLabel color={textColor}>Email</FormLabel>
                  <InputGroup>
                    <InputLeftElement pointerEvents="none">
                      <Icon as={FiMail} color="gray.400" />
                    </InputLeftElement>
                    <Input
                      type="email"
                      value={selectedUser.email}
                      onChange={(e) =>
                        setSelectedUser({ ...selectedUser, email: e.target.value })
                      }
                      bg={inputBg}
                      _hover={{ borderColor: "blue.400" }}
                      _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px var(--chakra-colors-blue-500)" }}
                    />
                  </InputGroup>
                </FormControl>
                <FormControl isRequired mt={4}>
                  <FormLabel color={textColor}>Company ID</FormLabel>
                  <InputGroup>
                    <InputLeftElement pointerEvents="none">
                      <Icon as={FiKey} color="gray.400" />
                    </InputLeftElement>
                    <Input
                      value={selectedUser.companyID}
                      onChange={(e) =>
                        setSelectedUser({ ...selectedUser, companyID: e.target.value })
                      }
                      bg={inputBg}
                      _hover={{ borderColor: "blue.400" }}
                      _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px var(--chakra-colors-blue-500)" }}
                    />
                  </InputGroup>
                </FormControl>
                <FormControl isRequired mt={4}>
                  <FormLabel color={textColor}>Role</FormLabel>
                  <Select
                    value={selectedUser.role}
                    onChange={(e) =>
                      setSelectedUser({ ...selectedUser, role: e.target.value })
                    }
                    bg={inputBg}
                    _hover={{ borderColor: "blue.400" }}
                    _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px var(--chakra-colors-blue-500)" }}
                  >
                    <option value="Employee">Employee</option>
                    <option value="BusinessOwner">Business owner</option>
                    <option value="TeamLeads">Team Leads</option>
                    <option value="HR">HR</option>
                    <option value="Admin">Admin</option>
                    <option value="ITSupport">IT support</option>
                    <option value="Manager">Manager</option>
                  </Select>
                </FormControl>
                <FormControl isRequired mt={4}>
                  <FormLabel color={textColor}>Contact Number</FormLabel>
                  <InputGroup>
                    <InputLeftElement pointerEvents="none">
                      <Icon as={FiPhone} color="gray.400" />
                    </InputLeftElement>
                    <Input
                      value={selectedUser.contactNumber}
                      onChange={(e) =>
                        setSelectedUser({ ...selectedUser, contactNumber: e.target.value })
                      }
                      bg={inputBg}
                      _hover={{ borderColor: "blue.400" }}
                      _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px var(--chakra-colors-blue-500)" }}
                    />
                  </InputGroup>
                </FormControl>
              </ModalBody>

              <ModalFooter>
                <Button 
                  colorScheme="blue" 
                  onClick={handleUpdateUser}
                  _hover={{ transform: "translateY(-1px)", boxShadow: "md" }}
                  transition="all 0.2s"
                >
                  Save Changes
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={handleCloseModal} 
                  ml={3}
                  _hover={{ transform: "translateY(-1px)", boxShadow: "md" }}
                  transition="all 0.2s"
                >
                  Cancel
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
        )}
      </Container>
    </Box>
  );
};

export default UserManagement;