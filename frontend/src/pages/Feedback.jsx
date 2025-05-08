import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  Textarea,
  VStack,
  Heading,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  useDisclosure,
  useToast,
  Text,
  Flex,
  useColorModeValue,
  Image,
  InputGroup,
  InputLeftElement,
  Icon,
} from '@chakra-ui/react';
import { FiSearch } from 'react-icons/fi';
import axios from 'axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import teamsImage from "../assets/teams.png";

const Feedback = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [users, setUsers] = useState({});
  const [newFeedback, setNewFeedback] = useState({
    title: '',
    description: '',
    category: 'general',
    status: 'processing',
    employee: '',
    user: ''
  });
  const [editFeedback, setEditFeedback] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const toast = useToast();
  const role = localStorage.getItem('role');
  const companyID = localStorage.getItem('companyID');
  const fullName = localStorage.getItem('fullName');

  const cardBg = useColorModeValue("white", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const textColor = useColorModeValue("gray.700", "white");
  const headingColor = useColorModeValue("blue.600", "blue.300");
  const inputBg = useColorModeValue("gray.50", "gray.600");

  useEffect(() => {
    setNewFeedback((prevFeedback) => ({ ...prevFeedback, employee: companyID, user: fullName }));
    fetchFeedbacks();
    fetchUsers();
  }, [companyID, fullName]);

  const fetchFeedbacks = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/feedback');
      if (role === 'HR') {
        setFeedbacks(res.data);
      } else {
        setFeedbacks(res.data.filter(feedback => feedback.employee === companyID));
      }
    } catch (err) {
      console.error('Failed to fetch feedbacks', err);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/admin/users');
      const usersMap = res.data.reduce((acc, user) => {
        acc[user.companyID] = user.fullName;
        return acc;
      }, {});
      setUsers(usersMap);
    } catch (err) {
      console.error('Error fetching users', err);
    }
  };

  const getUserName = (companyID) => {
    return users[companyID] || 'Unknown';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewFeedback({ ...newFeedback, [name]: value });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFeedback({ ...editFeedback, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/feedback', newFeedback);
      setFeedbacks([...feedbacks, res.data]);
      setNewFeedback({
        title: '',
        description: '',
        category: 'general',
        status: 'processing',
        employee: companyID,
        user: fullName
      });
      toast({
        title: 'Feedback submitted.',
        description: 'Your feedback has been submitted successfully.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      onClose();
    } catch (err) {
      console.error('Failed to submit feedback', err);
      toast({
        title: 'Error',
        description: 'Failed to submit feedback.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(`http://localhost:5000/api/feedback/${editFeedback._id}`, editFeedback);
      setFeedbacks(feedbacks.map(feedback => feedback._id === editFeedback._id ? res.data : feedback));
      toast({
        title: 'Feedback updated.',
        description: 'The feedback has been updated successfully.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      onEditClose();
    } catch (err) {
      console.error('Failed to update feedback', err);
      toast({
        title: 'Error',
        description: 'Failed to update feedback.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/feedback/${id}`);
      setFeedbacks(feedbacks.filter(feedback => feedback._id !== id));
      toast({
        title: 'Feedback deleted.',
        description: 'The feedback has been deleted successfully.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (err) {
      console.error('Failed to delete feedback', err);
      toast({
        title: 'Error',
        description: 'Failed to delete feedback.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleMarkCompleted = async (id) => {
    try {
      const res = await axios.put(`http://localhost:5000/api/feedback/${id}/complete`);
      setFeedbacks(feedbacks.map(feedback => feedback._id === id ? res.data : feedback));
      toast({
        title: 'Feedback marked as completed.',
        description: 'The feedback has been marked as completed.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (err) {
      console.error('Failed to mark feedback as completed', err);
      toast({
        title: 'Error',
        description: 'Failed to mark feedback as completed.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    const title = "Feedback Report";
  
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
            head: [["Title", "Description", "Category", "User", "Status"]],
            body: filteredResolvedFeedbacks.map((feedback) => [
              feedback.title,
              feedback.description,
              feedback.category,
              getUserName(feedback.employee),
              feedback.status,
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
          head: [["Title", "Description", "Category", "User", "Status"]],
          body: filteredResolvedFeedbacks.map((feedback) => [
            feedback.title,
            feedback.description,
            feedback.category,
            getUserName(feedback.employee),
            feedback.status,
          ]),
        });
  
        // Save the PDF
        doc.save(`${title}.pdf`);
      });
  };
  const filteredResolvedFeedbacks = feedbacks.filter(feedback =>
    feedback.status === 'completed' && feedback.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          alt="Feedback Background"
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
      <Box p="8" position="relative" zIndex="1">
        <Flex justify="space-between" align="center" mb="8">
          <Heading color={headingColor}>Feedback</Heading>
          {role !== 'HR' && (
            <Button colorScheme="blue" onClick={onOpen}>
              Contact HR
            </Button>
          )}
          {role === 'HR' && (
            <Button colorScheme="blue" onClick={handleExportPDF}>
              Export PDF
            </Button>
          )}
        </Flex>

        <Flex>
          <Box flex="1" mr="8" bg={cardBg} p="6" borderRadius="xl" boxShadow="md" minH="80vh" border="1px" borderColor={borderColor}>
            <Heading size="md" mb="4" color={headingColor}>Currently Processing</Heading>
            <VStack spacing="4" mb="8">
              {feedbacks.filter(feedback => feedback.status === 'processing').map(feedback => (
                <Box 
                  key={feedback._id} 
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
                  <Heading size="sm" color={textColor}>{feedback.title}</Heading>
                  <Text color={textColor}>{feedback.description}</Text>
                  <Text color={textColor}>Category: {feedback.category}</Text>
                  <Text color={textColor}>User: {getUserName(feedback.employee)}</Text>
                  <Flex mt="2">
                    <Button size="sm" colorScheme="red" onClick={() => handleDelete(feedback._id)}>Delete</Button>
                    {role !== 'HR' && (
                      <Button size="sm" ml="2" colorScheme="green" onClick={() => { setEditFeedback(feedback); onEditOpen(); }}>Edit</Button>
                    )}
                    {role === 'HR' && (
                      <Button size="sm" ml="2" colorScheme="green" onClick={() => handleMarkCompleted(feedback._id)}>Mark as Completed</Button>
                    )}
                  </Flex>
                </Box>
              ))}
            </VStack>
          </Box>

          <Box flex="1" bg={cardBg} p="6" borderRadius="xl" boxShadow="md" minH="80vh" border="1px" borderColor={borderColor}>
            <Heading size="md" mb="4" color={headingColor}>Resolved Issues</Heading>
            <InputGroup mb="4">
              <InputLeftElement pointerEvents="none">
                <Icon as={FiSearch} color="gray.400" />
              </InputLeftElement>
              <Input
                placeholder="Search resolved feedback"
                value={searchTerm}
                onChange={handleSearchChange}
                bg={inputBg}
                _hover={{ borderColor: "blue.400" }}
                _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px var(--chakra-colors-blue-500)" }}
              />
            </InputGroup>
            <VStack spacing="4">
              {filteredResolvedFeedbacks.map(feedback => (
                <Box 
                  key={feedback._id} 
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
                  <Heading size="sm" color={textColor}>{feedback.title}</Heading>
                  <Text color={textColor}>{feedback.description}</Text>
                  <Text color={textColor}>Category: {feedback.category}</Text>
                  <Text color={textColor}>User: {getUserName(feedback.employee)}</Text>
                </Box>
              ))}
            </VStack>
          </Box>
        </Flex>

        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Submit Feedback</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing="4" as="form" onSubmit={handleSubmit}>
                <FormControl isRequired>
                  <FormLabel>Title</FormLabel>
                  <Input name="title" value={newFeedback.title} onChange={handleChange} />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Description</FormLabel>
                  <Textarea name="description" value={newFeedback.description} onChange={handleChange} />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Category</FormLabel>
                  <Select name="category" value={newFeedback.category} onChange={handleChange}>
                    <option value="system issue">System Issue</option>
                    <option value="system misuse">System Misuse</option>
                    <option value="general">General</option>
                    <option value="other">Other</option>
                  </Select>
                </FormControl>
                <Input type="hidden" name="employee" value={newFeedback.employee} readOnly />
                <Input type="hidden" name="user" value={newFeedback.user} readOnly />
                <Button colorScheme="blue" type="submit" width="full">
                  Submit
                </Button>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" onClick={onClose}>Cancel</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        <Modal isOpen={isEditOpen} onClose={onEditClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Edit Feedback</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing="4" as="form" onSubmit={handleEditSubmit}>
                <FormControl isRequired>
                  <FormLabel>Title</FormLabel>
                  <Input name="title" value={editFeedback?.title || ''} onChange={handleEditChange} />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Description</FormLabel>
                  <Textarea name="description" value={editFeedback?.description || ''} onChange={handleEditChange} />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Category</FormLabel>
                  <Select name="category" value={editFeedback?.category || ''} onChange={handleEditChange}>
                    <option value="System Issue">System Issue</option>
                    <option value="System Misuse">System Misuse</option>
                    <option value="General">General</option>
                    <option value="Other">Other</option>
                  </Select>
                </FormControl>
                <Button colorScheme="blue" type="submit" width="full">
                  Save Changes
                </Button>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" onClick={onEditClose}>Cancel</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Box>
    </Box>
  );
};

export default Feedback;