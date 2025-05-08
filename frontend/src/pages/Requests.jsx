import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Heading,
  VStack,
  Text,
  Flex,
  useDisclosure,
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
  Select,
  useToast,
  FormErrorMessage,
  Progress,
  HStack,
  useColorModeValue,
  Icon,
  InputGroup,
  InputLeftElement,
  Image,
} from "@chakra-ui/react";
import axios from "axios";
import Chat from '../components/Chat';
import { FiSearch, FiPlus, FiEdit2, FiTrash2, FiCalendar, FiUser, FiAlertCircle } from "react-icons/fi";
import teamsImage from "../assets/teams.png";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const Requests = () => {
  const [pendingRequests, setPendingRequests] = useState([]);
  const [completedRequests, setCompletedRequests] = useState([]);
  const [users, setUsers] = useState([]);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const [newRequest, setNewRequest] = useState({
    taskName: "",
    description: "",
    priority: "",
    deadline: "",
    assignee: "",
    assignedBy: "",
  });
  const [errors, setErrors] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [currentRequestId, setCurrentRequestId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [acceptedRequests, setAcceptedRequests] = useState([]);
  const { isOpen: isAcceptedChatOpen, onOpen: onAcceptedChatOpen, onClose: onAcceptedChatClose } = useDisclosure();
  const [selectedAcceptedRequestForChat, setSelectedAcceptedRequestForChat] = useState(null);
  const [declinedEntryId, setDeclinedEntryId] = useState(null);

  // Retrieve companyID from localStorage
  const companyID = localStorage.getItem("companyID");

  const cardBg = useColorModeValue("white", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const textColor = useColorModeValue("gray.700", "white");
  const headingColor = useColorModeValue("blue.600", "blue.300");
  const inputBg = useColorModeValue("gray.50", "gray.600");

  useEffect(() => {
    // Fetch users first, then fetch requests
    const fetchData = async () => {
      try {
        const usersRes = await axios.get("http://localhost:5000/api/admin/users");
        setUsers(usersRes.data);

        const pendingRes = await axios.get(`http://localhost:5000/api/requests/pending/${companyID}`);
        setPendingRequests(pendingRes.data);

        const completedRes = await axios.get(`http://localhost:5000/api/requests/completed/${companyID}`);
        setCompletedRequests(completedRes.data);

        // Fetch accepted/ongoing requests created by this user
        const acceptedRes = await axios.get(`http://localhost:5000/api/requests/ongoing?assignedBy=${companyID}`);
        setAcceptedRequests(acceptedRes.data);
      } catch (err) {
        console.error("Error fetching data", err);
      }
    };

    fetchData();
  }, [companyID]);

  useEffect(() => {
    // Check if there is a reallocateRequest in localStorage
    const reallocateData = localStorage.getItem('reallocateRequest');
    if (reallocateData) {
      const request = JSON.parse(reallocateData);
      setNewRequest({
        taskName: request.taskName || request.title || "",
        description: request.description || "",
        priority: request.priority || "",
        deadline: (request.deadline || request.alternativeDate || "").slice(0, 10),
        assignee: request.assignee || "",
        assignedBy: request.assignedBy || "",
      });
      setCurrentRequestId(request.request || request._id); // request.request is the original request id, request._id is the declined doc id
      setIsEditing(true);
      onOpen();
      setDeclinedEntryId(request._id); // Store declined entry id for later deletion
      localStorage.removeItem('reallocateRequest');
    }
  }, [onOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewRequest({ ...newRequest, [name]: value });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!newRequest.taskName) newErrors.taskName = "Task Name is required";
    if (!newRequest.description) newErrors.description = "Description is required";
    if (!newRequest.priority) newErrors.priority = "Priority is required";
    if (!newRequest.deadline) newErrors.deadline = "Deadline is required";
    if (!newRequest.assignee) newErrors.assignee = "Assignee is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateRequest = async () => {
    if (!validateForm()) return;

    try {
      const requestData = { ...newRequest, assignedBy: companyID };
      const res = await axios.post("http://localhost:5000/api/requests", requestData, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      setPendingRequests([...pendingRequests, res.data]);
      toast({
        title: "Request created.",
        description: "Your request has been created successfully.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      onClose();
    } catch (err) {
      console.error("Error creating request", err.response ? err.response.data : err);
      toast({
        title: "Error",
        description: err.response?.data?.error || "There was an error creating your request.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleEditRequest = (id) => {
    const requestToEdit = pendingRequests.find((request) => request._id === id);
    setNewRequest({
      taskName: requestToEdit.taskName,
      description: requestToEdit.description,
      priority: requestToEdit.priority,
      deadline: requestToEdit.deadline,
      assignee: requestToEdit.assignee,
      assignedBy: requestToEdit.assignedBy,
    });
    setCurrentRequestId(id);
    setIsEditing(true);
    onOpen();
  };

  const handleUpdateRequest = async () => {
    if (!validateForm()) return;

    try {
      // If this is a reallocation, set status to 'pending'
      const requestData = declinedEntryId
        ? { ...newRequest, assignedBy: companyID, status: 'pending' }
        : { ...newRequest, assignedBy: companyID };
      const res = await axios.put(`http://localhost:5000/api/requests/${currentRequestId}`, requestData, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      setPendingRequests(pendingRequests.map((request) => (request._id === currentRequestId ? res.data : request)));
      toast({
        title: "Request updated.",
        description: "Your request has been updated successfully.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      // Delete the declined entry if this was a reallocation
      if (declinedEntryId) {
        await axios.delete(`http://localhost:5000/api/requests/declined/${declinedEntryId}`);
        setDeclinedEntryId(null);
      }
      onClose();
    } catch (err) {
      console.error("Error updating request", err.response ? err.response.data : err);
      toast({
        title: "Error",
        description: err.response?.data?.error || "There was an error updating your request.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleDeleteRequest = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/requests/${id}`);
      setPendingRequests(pendingRequests.filter((request) => request._id !== id));
      toast({
        title: "Request deleted.",
        description: "The request has been deleted successfully.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    } catch (err) {
      console.error("Error deleting request", err.response ? err.response.data : err);
      toast({
        title: "Error",
        description: err.response?.data?.error || "There was an error deleting your request.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleModalClose = () => {
    setIsEditing(false);
    setCurrentRequestId(null);
    setNewRequest({
      taskName: "",
      description: "",
      priority: "",
      deadline: "",
      assignee: "",
      assignedBy: "",
    });
    setErrors({});
    onClose();
  };

  const getAssigneeName = (assignee) => {
    const user = users.find((user) => user.companyID === assignee);
    return user ? user.fullName : "Unknown";
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredCompletedRequests = completedRequests.filter((request) =>
    request.taskName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handler for opening chat modal for accepted requests
  const handleAcceptedChatClick = (request) => {
    setSelectedAcceptedRequestForChat(request);
    onAcceptedChatOpen();
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    const title = "Completed Requests Report";
  
    // Add the TeamSync logo at the beginning of the PDF
    const logoUrl = '/TeamSynclogo.png'; // Absolute path to the logo in the public folder
    const imgWidth = 50; // Width of the logo
    const imgHeight = 50; // Height of the logo
    const pageWidth = doc.internal.pageSize.width; // Get the page width
  
    // Fetch the image as a Base64 string
    fetch(logoUrl)
      .then(response => response.blob())
      .then(blob => {
        const reader = new FileReader();
        reader.onload = function () {
          const base64Image = reader.result.split(',')[1]; // Extract the Base64 string
          doc.addImage(
            base64Image,
            'PNG',
            (pageWidth - imgWidth) / 2, // Center horizontally
            10, // Position 10 units from the top
            imgWidth,
            imgHeight
          );
  
          // Add the title below the logo
          doc.text(title, 20, imgHeight + 20);
  
          // Add the table
          autoTable(doc, {
            startY: imgHeight + 30, // Start the table below the logo and title
            head: [["Task Name", "Description", "Priority", "Completed On", "Assignee"]],
            body: filteredCompletedRequests.map((request) => [
              request.taskName,
              request.description,
              request.priority,
              new Date(request.completedAt).toLocaleDateString(),
              getAssigneeName(request.assignee),
            ]),
          });
  
          // Save the PDF
          doc.save(`${title}.pdf`);
        };
        reader.readAsDataURL(blob); // Convert the blob to a Base64 string
      })
      .catch(error => {
        console.error('Failed to load the logo image:', error);
  
        // Add the title and table even if the logo fails to load
        doc.text(title, 20, 20);
        autoTable(doc, {
          startY: 30,
          head: [["Task Name", "Description", "Priority", "Completed On", "Assignee"]],
          body: filteredCompletedRequests.map((request) => [
            request.taskName,
            request.description,
            request.priority,
            new Date(request.completedAt).toLocaleDateString(),
            getAssigneeName(request.assignee),
          ]),
        });
  
        // Save the PDF
        doc.save(`${title}.pdf`);
      });
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
          alt="Requests Background"
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
      <Box p={5} position="relative" zIndex="1">
        <Box mb={8}>
          <Heading
            color={headingColor}
            fontWeight="bold"
            letterSpacing="tight"
            mb={4}
          >
            Request a Task
          </Heading>
          <Button
            leftIcon={<Icon as={FiPlus} />}
            size="md"
            px={8}
            py={6}
            onClick={onOpen}
            mt={6}
            bgGradient="linear(to-r, teal.400, blue.500)"
            color="white"
            _hover={{
              transform: "translateY(-2px)",
              boxShadow: "0 0 20px rgba(49, 130, 206, 0.5)",
              bgGradient: "linear(to-r, teal.500, blue.600)",
              borderColor: "white",
              _before: {
                background: "linear-gradient(45deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 100%)",
              }
            }}
            _active={{
              transform: "translateY(0)",
              boxShadow: "md",
            }}
            transition="all 0.3s ease"
            borderRadius="lg"
            fontWeight="semibold"
            letterSpacing="wide"
            boxShadow="md"
            border="2px solid"
            borderColor="transparent"
            position="relative"
            overflow="hidden"
            _before={{
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "linear-gradient(45deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%)",
              transition: "all 0.3s ease",
            }}
          >
            Create Request
          </Button>

        </Box>

                <Flex justify="flex-end" align="center" mb={2}>
                    <Button colorScheme="blue" onClick={handleExportPDF}>
                      Export PDF
                    </Button> 
                </Flex>

        <Flex gap={6} mt={2}>
          {/* Left Side - Pending Requests Section */}
          <Box flex="1">
            <Box 
              bg={cardBg} 
              p={6} 
              borderRadius="xl" 
              boxShadow="md" 
              border="1px" 
              borderColor={borderColor}
              minH="calc(100vh - 250px)"
            >
              <Heading size="md" mb={4} color={headingColor}>Pending Requests</Heading>
              <VStack spacing="4">
                {pendingRequests.map(request => (
                  <Box 
                    key={request._id} 
                    p="4" 
                    boxShadow="md" 
                    borderRadius="md" 
                    bg={useColorModeValue("white", "gray.600")} 
                    w="100%" 
                    border="1px" 
                    borderColor={borderColor}
                    _hover={{ transform: "translateY(-2px)", boxShadow: "lg" }}
                    transition="all 0.2s"
                  >
                    <Flex justify="space-between">
                      <Box>
                        <Heading size="sm" color={textColor}>{request.taskName}</Heading>
                        <Text color={textColor}>{request.description}</Text>
                        <Text color={textColor}>Priority: {request.priority}</Text>
                        <Text color={textColor}>Deadline: {new Date(request.deadline).toLocaleDateString()}</Text>
                        <Text color={textColor}>Assignee: {getAssigneeName(request.assignee)}</Text>
                      </Box>
                      <HStack spacing={2}>
                        <Button
                          size="sm"
                          colorScheme="green"
                          leftIcon={<Icon as={FiEdit2} />}
                          onClick={() => handleEditRequest(request._id)}
                          _hover={{ transform: "translateY(-2px)", boxShadow: "md" }}
                          transition="all 0.2s"
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          colorScheme="red"
                          leftIcon={<Icon as={FiTrash2} />}
                          onClick={() => handleDeleteRequest(request._id)}
                          _hover={{ transform: "translateY(-2px)", boxShadow: "md" }}
                          transition="all 0.2s"
                        >
                          Delete
                        </Button>
                      </HStack>
                    </Flex>
                  </Box>
                ))}
              </VStack>
            </Box>
          </Box>

          {/* Right Side - Completed Requests Section */}
          <Box flex="1">
            <Box 
              bg={cardBg} 
              p={6} 
              borderRadius="xl" 
              boxShadow="md" 
              border="1px" 
              borderColor={borderColor}
              minH="calc(100vh - 250px)"
            >
              <Heading size="md" mb={4} color={headingColor}>Completed Requests</Heading>
              <InputGroup mb={4}>
                <InputLeftElement pointerEvents="none">
                  <Icon as={FiSearch} color="gray.400" />
                </InputLeftElement>
                <Input
                  placeholder="Search completed requests..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  bg={inputBg}
                  _hover={{ borderColor: "blue.400" }}
                  _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px var(--chakra-colors-blue-500)" }}
                />
              </InputGroup>
              <VStack spacing="4">
                {filteredCompletedRequests.map(request => (
                  <Box 
                    key={request._id} 
                    p="4" 
                    boxShadow="md" 
                    borderRadius="md" 
                    bg={useColorModeValue("white", "gray.600")} 
                    w="100%" 
                    border="1px" 
                    borderColor={borderColor}
                    _hover={{ transform: "translateY(-2px)", boxShadow: "lg" }}
                    transition="all 0.2s"
                  >
                    <Flex justify="space-between">
                      <Box>
                        <Heading size="sm" color={textColor}>{request.taskName}</Heading>
                        <Text color={textColor}>{request.description}</Text>
                        <Text color={textColor}>Priority: {request.priority}</Text>
                        <Text color={textColor}>Completed On: {new Date(request.completedAt).toLocaleDateString()}</Text>
                        <Text color={textColor}>Assignee: {getAssigneeName(request.assignee)}</Text>
                      </Box>
                    </Flex>
                  </Box>
                ))}
              </VStack>
            </Box>
          </Box>
        </Flex>

        <Modal isOpen={isOpen} onClose={handleModalClose} size="xl">
          <ModalOverlay backdropFilter="blur(10px)" />
          <ModalContent bg={cardBg}>
            <ModalHeader color={headingColor}>
              {isEditing ? "Edit Request" : "Create New Request"}
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4}>
                <FormControl isInvalid={errors.taskName}>
                  <FormLabel>Task Name</FormLabel>
                  <Input
                    name="taskName"
                    value={newRequest.taskName}
                    onChange={handleInputChange}
                    bg={inputBg}
                    _hover={{ borderColor: "blue.400" }}
                    _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px var(--chakra-colors-blue-500)" }}
                  />
                  <FormErrorMessage>{errors.taskName}</FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={errors.description}>
                  <FormLabel>Description</FormLabel>
                  <Input
                    name="description"
                    value={newRequest.description}
                    onChange={handleInputChange}
                    bg={inputBg}
                    _hover={{ borderColor: "blue.400" }}
                    _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px var(--chakra-colors-blue-500)" }}
                  />
                  <FormErrorMessage>{errors.description}</FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={errors.priority}>
                  <FormLabel>Priority</FormLabel>
                  <Select
                    name="priority"
                    value={newRequest.priority}
                    onChange={handleInputChange}
                    bg={inputBg}
                    _hover={{ borderColor: "blue.400" }}
                    _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px var(--chakra-colors-blue-500)" }}
                  >
                    <option value="">Select Priority</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </Select>
                  <FormErrorMessage>{errors.priority}</FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={errors.deadline}>
                  <FormLabel>Deadline</FormLabel>
                  <Input
                    type="date"
                    name="deadline"
                    value={newRequest.deadline}
                    onChange={handleInputChange}
                    bg={inputBg}
                    _hover={{ borderColor: "blue.400" }}
                    _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px var(--chakra-colors-blue-500)" }}
                    min={new Date().toISOString().split('T')[0]} // Prevent past dates
                  />
                  <FormErrorMessage>{errors.deadline}</FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={errors.assignee}>
                  <FormLabel>Assignee</FormLabel>
                  <Select
                    name="assignee"
                    value={newRequest.assignee}
                    onChange={handleInputChange}
                    bg={inputBg}
                    _hover={{ borderColor: "blue.400" }}
                    _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px var(--chakra-colors-blue-500)" }}
                  >
                    <option value="">Select Assignee</option>
                    {users.map((user) => (
                      <option key={user._id} value={user.companyID}>
                        {user.fullName}
                      </option>
                    ))}
                  </Select>
                  <FormErrorMessage>{errors.assignee}</FormErrorMessage>
                </FormControl>
              </VStack>
            </ModalBody>

            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={handleModalClose}>
                Cancel
              </Button>
              <Button
                colorScheme="blue"
                onClick={isEditing ? handleUpdateRequest : handleCreateRequest}
                _hover={{ transform: "translateY(-2px)", boxShadow: "lg" }}
                transition="all 0.2s"
              >
                {isEditing ? "Update" : "Create"}
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {selectedAcceptedRequestForChat && (
          <Modal isOpen={isAcceptedChatOpen} onClose={onAcceptedChatClose} size="xl">
            <ModalOverlay backdropFilter="blur(10px)" />
            <ModalContent bg={cardBg}>
              <ModalHeader color={headingColor}>Chat with {getAssigneeName(selectedAcceptedRequestForChat.assignee)}</ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                <Chat requestId={selectedAcceptedRequestForChat._id} />
              </ModalBody>
            </ModalContent>
          </Modal>
        )}
      </Box>
    </Box>
  );
};

export default Requests;