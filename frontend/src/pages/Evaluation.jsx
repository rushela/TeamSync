import React, { useState, useEffect } from 'react';
import {
  Box, Button, Table, Thead, Tbody, Tr, Th, Td, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody,
  ModalFooter, FormControl, FormLabel, Input, Textarea, Select, useToast, Heading, Text, Menu, MenuButton, MenuList, MenuItem, IconButton,
  useColorModeValue, Image, InputGroup, InputLeftElement, Icon
} from '@chakra-ui/react';
import { FiMoreVertical, FiSearch } from 'react-icons/fi';
import axios from 'axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import EvaluationModals from '../components/EvaluationModals';
import DatePicker from 'react-datepicker'; 
import 'react-datepicker/dist/react-datepicker.css';
import teamsImage from "../assets/teams.png";

const Evaluation = () => {
  const [employees, setEmployees] = useState([]);
  const [evaluations, setEvaluations] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [grade, setGrade] = useState('');
  const [notes, setNotes] = useState('');
  const [furtherAction, setFurtherAction] = useState('');
  const [filterDate, setFilterDate] = useState(new Date()); 
  const [sort, setSort] = useState('none');
  const [searchTerm, setSearchTerm] = useState('');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const { isOpen: isHistoryOpen, onOpen: onHistoryOpen, onClose: onHistoryClose } = useDisclosure();
  const toast = useToast();

  const cardBg = useColorModeValue("white", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const textColor = useColorModeValue("gray.700", "white");
  const headingColor = useColorModeValue("blue.600", "blue.300");
  const tableHeaderBg = useColorModeValue("gray.50", "gray.600");
  const tableRowHover = useColorModeValue("gray.50", "gray.600");
  const inputBg = useColorModeValue("gray.50", "gray.600");

  useEffect(() => {
    fetchEmployees();
    fetchEvaluations();
  }, [filterDate]); 

  const fetchEmployees = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/employeeStat/users');
      const filteredEmployees = res.data.filter(employee => employee.role !== 'Admin' && employee.role !== 'BusinessOwner');
      setEmployees(filteredEmployees);
    } catch (err) {
      console.error('Failed to fetch employees:', err);
    }
  };

  const fetchEvaluations = async () => {
    try {
      const monthYear = filterDate.toLocaleString('default', { month: 'long', year: 'numeric' }); 
      const url = `http://localhost:5000/api/evaluations/${monthYear}`;
      const res = await axios.get(url);
      setEvaluations(res.data);
    } catch (err) {
      console.error('Failed to fetch evaluations:', err);
    }
  };

  const handleEvaluate = (employee) => {
    setSelectedEmployee(employee);
    const evaluation = evaluations.find((evaluation) => evaluation.employee === employee.fullName);
    if (evaluation) {
      setGrade(evaluation.grade);
      setNotes(evaluation.notes);
      setFurtherAction(evaluation.furtherAction);
    } else {
      setGrade('');
      setNotes('');
      setFurtherAction('');
    }
    onOpen();
  };

  const handleEdit = (employee) => {
    setSelectedEmployee(employee);
    const evaluation = evaluations.find((evaluation) => evaluation.employee === employee.fullName);
    if (evaluation) {
      setGrade(evaluation.grade);
      setNotes(evaluation.notes);
      setFurtherAction(evaluation.furtherAction);
    }
    onEditOpen();
  };

  const handleSaveEvaluation = async () => {
    if (!grade || !notes) {
      toast({
        title: 'Validation Error',
        description: 'Grade and Notes are required.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    try {
      const evaluationData = {
        employee: selectedEmployee.fullName,
        grade,
        notes,
        furtherAction,
        month: filterDate.toLocaleString('default', { month: 'long', year: 'numeric' }), 
      };

      await axios.post('http://localhost:5000/api/evaluations', evaluationData);
      toast({
        title: 'Evaluation saved.',
        description: 'The evaluation has been saved successfully.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      fetchEvaluations();
      onClose();
    } catch (err) {
      console.error('Failed to save evaluation:', err);
      toast({
        title: 'Error',
        description: 'Failed to save evaluation.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleUpdateEvaluation = async () => {
    if (!grade || !notes) {
      toast({
        title: 'Validation Error',
        description: 'Grade and Notes are required.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    try {
      const evaluationData = {
        grade,
        notes,
        furtherAction,
      };

      await axios.put(`http://localhost:5000/api/evaluations/${selectedEmployee.fullName}`, evaluationData);
      toast({
        title: 'Evaluation updated.',
        description: 'The evaluation has been updated successfully.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      fetchEvaluations();
      onEditClose();
    } catch (err) {
      console.error('Failed to update evaluation:', err);
      toast({
        title: 'Error',
        description: 'Failed to update evaluation.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleDeleteEvaluation = async (employee) => {
    try {
      await axios.delete(`http://localhost:5000/api/evaluations/${employee.fullName}`);
      toast({
        title: 'Evaluation deleted.',
        description: 'The evaluation has been deleted successfully.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      fetchEvaluations();
    } catch (err) {
      console.error('Failed to delete evaluation:', err);
      toast({
        title: 'Error',
        description: 'Failed to delete evaluation.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSortChange = (e) => {
    setSort(e.target.value);
  };

  const handleEmployeeClick = (employee) => {
    setSelectedEmployee(employee);
    onHistoryOpen();
  };

  const handleExportPDF = async () => {
    const doc = new jsPDF();
    const title = `Employee Evaluations - ${filterDate.toLocaleString('default', { month: 'long', year: 'numeric' })}`;
  
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
            head: [['Employee', 'Role', 'Acceptance Rate', 'Completed Rate', 'Ontime Rate', 'Grade']],
            body: sortedEmployees.map(employee => {
              const evaluation = evaluations.find(e => 
                e.employee === employee.fullName && 
                e.month === filterDate.toLocaleString('default', { month: 'long', year: 'numeric' })
              );
              
              const requests = employee.requests.filter(request => {
                const requestDate = new Date(request.createdAt);
                return (
                  requestDate.getMonth() === filterDate.getMonth() &&
                  requestDate.getFullYear() === filterDate.getFullYear()
                );
              });
              
              const totalRequests = requests.length;
              const accepted = requests.filter(r => r.status === 'ongoing').length;
              const declined = requests.filter(r => r.status === 'declined').length;
              const completed = requests.filter(r => r.status === 'completed').length;
              
              const acceptanceRate = (accepted + declined) > 0 ? 
                (accepted / (accepted + declined + completed)) * 100 : 0;
              const completedRate = totalRequests > 0 ? 
                (completed / totalRequests) * 100 : 0;
              const ontimeRate = completed > 0 ? 
                (requests.filter(r => r.status === 'completed' && new Date(r.completedOn) <= new Date(r.deadline)).length / completed) * 100 : 0;
              
              return [
                employee.fullName,
                employee.role,
                `${acceptanceRate.toFixed(0)}%`,
                `${completedRate.toFixed(0)}%`,
                `${ontimeRate.toFixed(0)}%`,
                evaluation ? evaluation.grade : 'N/A',
              ];
            }),
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
          head: [['Employee', 'Role', 'Acceptance Rate', 'Completed Rate', 'Ontime Rate', 'Grade']],
          body: sortedEmployees.map(employee => {
            const evaluation = evaluations.find(e => 
              e.employee === employee.fullName && 
              e.month === filterDate.toLocaleString('default', { month: 'long', year: 'numeric' })
            );
            
            const requests = employee.requests.filter(request => {
              const requestDate = new Date(request.createdAt);
              return (
                requestDate.getMonth() === filterDate.getMonth() &&
                requestDate.getFullYear() === filterDate.getFullYear()
              );
            });
            
            const totalRequests = requests.length;
            const accepted = requests.filter(r => r.status === 'ongoing').length;
            const declined = requests.filter(r => r.status === 'declined').length;
            const completed = requests.filter(r => r.status === 'completed').length;
            
            const acceptanceRate = (accepted + declined) > 0 ? 
              (accepted / (accepted + declined + completed)) * 100 : 0;
            const completedRate = totalRequests > 0 ? 
              (completed / totalRequests) * 100 : 0;
            const ontimeRate = completed > 0 ? 
              (requests.filter(r => r.status === 'completed' && new Date(r.completedOn) <= new Date(r.deadline)).length / completed) * 100 : 0;
            
            return [
              employee.fullName,
              employee.role,
              `${acceptanceRate.toFixed(0)}%`,
              `${completedRate.toFixed(0)}%`,
              `${ontimeRate.toFixed(0)}%`,
              evaluation ? evaluation.grade : 'N/A',
            ];
          }),
        });
  
        // Save the PDF
        doc.save(`${title}.pdf`);
      });
  };

  const filteredEmployees = employees.filter(employee =>
    employee.fullName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedEmployees = [...filteredEmployees].sort((a, b) => {
    if (sort === 'grade') {
      const aEvaluation = evaluations.find(e => e.employee === a.fullName);
      const bEvaluation = evaluations.find(e => e.employee === b.fullName);
      return (bEvaluation?.grade || '').localeCompare(aEvaluation?.grade || '');
    } else if (sort === 'status') {
      const aEvaluation = evaluations.find(e => e.employee === a.fullName);
      const bEvaluation = evaluations.find(e => e.employee === b.fullName);
      return (aEvaluation ? 1 : -1) - (bEvaluation ? 1 : -1);
    }
    return 0;
  });

  const isFutureDate = filterDate > new Date();

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
          alt="Evaluation Background"
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
        <Heading mb="8" color={headingColor}>Employee Evaluations</Heading>
        <Box 
          bg={cardBg} 
          p="6" 
          borderRadius="xl" 
          boxShadow="lg" 
          minH="80vh"
          border="1px"
          borderColor={borderColor}
        >
          <Box display="flex" mb="4">
            <InputGroup flex="1" mr="4">
              <InputLeftElement pointerEvents="none">
                <Icon as={FiSearch} color="gray.400" />
              </InputLeftElement>
              <Input
                placeholder="Search by employee name"
                value={searchTerm}
                onChange={handleSearchChange}
                bg={inputBg}
                _hover={{ borderColor: "blue.400" }}
                _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px var(--chakra-colors-blue-500)" }}
              />
            </InputGroup>
            <Button 
              onClick={handleExportPDF} 
              colorScheme="blue"
              _hover={{ transform: "translateY(-1px)", boxShadow: "md" }}
              transition="all 0.2s"
            >
              Export PDF
            </Button>
          </Box>

          <FormControl 
            mb="4" 
            border="1px" 
            borderColor={borderColor}
            borderRadius="md" 
            padding="3"
            bg={cardBg}
          >
            <FormLabel color={textColor}>Filter by Month and Year</FormLabel>
            <DatePicker
              selected={filterDate}
              onChange={(date) => setFilterDate(date)}
              dateFormat="MM/yyyy"
              showMonthYearPicker
              className="custom-datepicker"
            />
          </FormControl>

          <FormControl mb="4">
            <FormLabel color={textColor}>Sort By</FormLabel>
            <Select 
              value={sort} 
              onChange={handleSortChange} 
              bg={inputBg}
              _hover={{ borderColor: "blue.400" }}
              _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px var(--chakra-colors-blue-500)" }}
            >
              <option value="none">None</option>
              <option value="grade">Grade (Highest First)</option>
              <option value="status">Evaluation Status (Not Evaluated First)</option>
            </Select>
          </FormControl>

          <Table variant="simple">
            <Thead bg={tableHeaderBg}>
              <Tr>
                <Th color={textColor}>Employee</Th>
                <Th color={textColor}>Role</Th>
                <Th color={textColor}>Acceptance Rate</Th>
                <Th color={textColor}>Completion Rate</Th>
                <Th color={textColor}>Ontime Rate</Th>
                <Th color={textColor}>Grade</Th>
                <Th color={textColor}>Action</Th>
              </Tr>
            </Thead>
            <Tbody>
              {sortedEmployees.map((employee) => {
                const evaluation = evaluations.find(e => 
                  e.employee === employee.fullName && 
                  e.month === filterDate.toLocaleString('default', { month: 'long', year: 'numeric' })
                );
                
                const requests = employee.requests.filter(request => {
                  const requestDate = new Date(request.createdAt);
                  return (
                    requestDate.getMonth() === filterDate.getMonth() &&
                    requestDate.getFullYear() === filterDate.getFullYear()
                  );
                });
                
                const totalRequests = requests.length;
                const accepted = requests.filter(r => r.status === 'ongoing').length;
                const declined = requests.filter(r => r.status === 'declined').length;
                const completed = requests.filter(r => r.status === 'completed').length;
                
                const acceptanceRate = (accepted + declined) > 0 ? 
                  (accepted / (accepted + declined + completed)) * 100 : 0;
                const completedRate = totalRequests > 0 ? 
                  (completed / totalRequests) * 100 : 0;
                const ontimeRate = completed > 0 ? 
                  (requests.filter(r => r.status === 'completed' && new Date(r.completedOn) <= new Date(r.deadline)).length / completed) * 100 : 0;
                
                return (
                  <Tr 
                    key={employee.fullName}
                    _hover={{ bg: tableRowHover }}
                    transition="all 0.2s"
                  >
                    <Td>
                      <Button 
                        variant="link" 
                        onClick={() => handleEmployeeClick(employee)}
                        color={textColor}
                        _hover={{ color: "blue.500" }}
                      >
                        {employee.fullName}
                      </Button>
                    </Td>
                    <Td color={textColor}>{employee.role}</Td>
                    <Td color={textColor}>{totalRequests > 0 ? `${acceptanceRate.toFixed(0)}%` : 'N/A'}</Td>
                    <Td color={textColor}>{totalRequests > 0 ? `${completedRate.toFixed(0)}%` : 'N/A'}</Td>
                    <Td color={textColor}>{completed > 0 ? `${ontimeRate.toFixed(0)}%` : 'N/A'}</Td>
                    <Td color={textColor}>{evaluation ? evaluation.grade : 'N/A'}</Td>
                    <Td>
                      <Box display="flex" alignItems="center">
                        <Button 
                          colorScheme="blue" 
                          onClick={() => handleEvaluate(employee)} 
                          disabled={!!evaluation || isFutureDate}
                          _hover={{ transform: "translateY(-1px)", boxShadow: "md" }}
                          transition="all 0.2s"
                        >
                          {evaluation ? 'Evaluated' : 'Evaluate'}
                        </Button>
                        <Menu>
                          <MenuButton 
                            as={IconButton} 
                            icon={<FiMoreVertical />} 
                            variant="outline" 
                            ml="2"
                            _hover={{ bg: tableRowHover }}
                          />
                          <MenuList bg={cardBg}>
                            <MenuItem 
                              onClick={() => handleEdit(employee)} 
                              isDisabled={!evaluation}
                              _hover={{ bg: tableRowHover }}
                            >
                              Edit
                            </MenuItem>
                            <MenuItem 
                              onClick={() => handleDeleteEvaluation(employee)} 
                              isDisabled={!evaluation}
                              _hover={{ bg: tableRowHover }}
                            >
                              Delete
                            </MenuItem>
                          </MenuList>
                        </Menu>
                      </Box>
                    </Td>
                  </Tr>
                );
              })}
            </Tbody>
          </Table>
        </Box>

        <EvaluationModals
          isOpen={isOpen}
          onClose={onClose}
          isEditOpen={isEditOpen}
          onEditClose={onEditClose}
          selectedEmployee={selectedEmployee}
          grade={grade}
          setGrade={setGrade}
          notes={notes}
          setNotes={setNotes}
          furtherAction={furtherAction}
          setFurtherAction={setFurtherAction}
          handleSaveEvaluation={handleSaveEvaluation}
          handleUpdateEvaluation={handleUpdateEvaluation}
        />

        <Modal isOpen={isHistoryOpen} onClose={onHistoryClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Evaluation Details for {selectedEmployee?.fullName}</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              {evaluations
                .filter(e => e.employee === selectedEmployee?.fullName)
                .map((evaluation, index) => (
                  <Box key={index} mb="4" p="4" borderWidth="1px" borderRadius="md">
                    <Text><strong>Grade:</strong> {evaluation.grade}</Text>
                    <Text><strong>Notes:</strong> {evaluation.notes}</Text>
                    <Text><strong>Further Action:</strong> {evaluation.furtherAction}</Text>
                    <Text><strong>Timeframe:</strong> {evaluation.month}</Text>
                  </Box>
                ))}
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" onClick={onHistoryClose}>
                Close
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Box>
    </Box>
  );
};

export default Evaluation;